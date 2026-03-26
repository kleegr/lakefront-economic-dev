import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabase } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  // Use service role to bypass RLS for admin operations
  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: adminProfile } = await serviceClient.from('lf_profiles').select('role').eq('id', user.id).maybeSingle();
  if (!adminProfile || !['super_admin', 'admin'].includes(adminProfile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { email, role, portal_type, full_name, permissions } = body;
  if (!email || !role || !portal_type) return NextResponse.json({ error: 'email, role, and portal_type required' }, { status: 400 });

  // Generate secure token (48 hours expiry)
  const token = crypto.randomBytes(32).toString('hex');
  const tokenExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  // Create invitation
  const { error: invErr } = await serviceClient.from('lf_invitations').insert({
    email: email.toLowerCase().trim(), role, portal_type,
    full_name: full_name || '', token, token_expires_at: tokenExpiresAt,
    permissions: permissions || [], invited_by: user.id, status: 'pending',
  });
  if (invErr) return NextResponse.json({ error: invErr.message }, { status: 500 });

  // Also add to allowed_emails
  await serviceClient.from('lf_allowed_emails').upsert({
    email: email.toLowerCase().trim(), role, portal_type,
    full_name: full_name || '', invited_by: user.id, is_active: true,
  }, { onConflict: 'email' });

  // Audit log
  await serviceClient.from('lf_audit_log').insert({
    user_id: user.id, action: 'invitation_sent', entity_type: 'invitation',
    details: { email, role, portal_type, permissions: permissions || [] },
  });

  const setPasswordUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://lakefront-economic-dev.vercel.app'}/auth/set-password?token=${token}`;

  return NextResponse.json({ success: true, setPasswordUrl, token, message: `Invitation created for ${email}. Send them this link: ${setPasswordUrl}` });
}

export async function GET() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  // Use service role to bypass RLS for admin operations
  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: adminProfile } = await serviceClient.from('lf_profiles').select('role').eq('id', user.id).maybeSingle();
  if (!adminProfile || !['super_admin', 'admin'].includes(adminProfile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data } = await serviceClient.from('lf_invitations').select('*').order('created_at', { ascending: false });
  return NextResponse.json({ invitations: data || [] });
}
