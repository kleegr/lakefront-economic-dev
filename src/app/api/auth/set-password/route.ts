import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const { token, password } = await request.json();
  if (!token || !password) return NextResponse.json({ success: false, error: 'Token and password required' }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, serviceKey || anonKey);

  // Find the invitation by token
  const { data: invite, error: invErr } = await supabase.from('lf_invitations').select('*').eq('token', token).eq('status', 'pending').maybeSingle();
  if (!invite || invErr) return NextResponse.json({ success: false, error: 'Invalid or expired invitation link' }, { status: 400 });

  // Check expiry
  if (new Date(invite.token_expires_at) < new Date()) {
    await supabase.from('lf_invitations').update({ status: 'expired' }).eq('id', invite.id);
    return NextResponse.json({ success: false, error: 'Invitation link has expired' }, { status: 400 });
  }

  // Create auth user with password using admin API
  const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
    email: invite.email,
    password: password,
    email_confirm: true,
    user_metadata: { role: invite.role, portal_type: invite.portal_type, full_name: invite.full_name || '' },
  });

  if (authErr) {
    // If user already exists, update their password
    if (authErr.message?.includes('already been registered')) {
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find((u: { email?: string }) => u.email === invite.email);
      if (existingUser) {
        await supabase.auth.admin.updateUserById(existingUser.id, { password });
        // Update profile
        await supabase.from('lf_profiles').update({
          role: invite.role, portal_type: invite.portal_type, account_status: 'approved',
          password_set: true, full_name: invite.full_name || undefined,
        }).eq('id', existingUser.id);
      }
    } else {
      return NextResponse.json({ success: false, error: authErr.message }, { status: 500 });
    }
  } else if (authUser?.user) {
    // Profile auto-created by trigger, update it
    await supabase.from('lf_profiles').update({
      role: invite.role, portal_type: invite.portal_type, account_status: 'approved',
      password_set: true, full_name: invite.full_name || undefined,
    }).eq('id', authUser.user.id);

    // Assign permissions from invitation
    if (invite.permissions && Array.isArray(invite.permissions)) {
      for (const perm of invite.permissions) {
        await supabase.from('lf_permissions').upsert({
          user_id: authUser.user.id, permission: perm, granted_by: invite.invited_by,
        }, { onConflict: 'user_id,permission,scope_type,scope_id' });
      }
    }
  }

  // Mark invitation as accepted
  await supabase.from('lf_invitations').update({ status: 'accepted', accepted_at: new Date().toISOString() }).eq('id', invite.id);

  // Audit log
  await supabase.from('lf_audit_log').insert({ action: 'invitation_accepted', entity_type: 'invitation', entity_id: invite.id, details: { email: invite.email, role: invite.role } });

  return NextResponse.json({ success: true });
}
