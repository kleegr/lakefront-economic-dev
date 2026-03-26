import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabase } from '@/lib/supabase/server';
import crypto from 'crypto';

async function sendInviteEmail(to: string, name: string, role: string, setPasswordUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, reason: 'No RESEND_API_KEY configured' };

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Lakefront Economy <noreply@lakefrontestatesfl.com>';

  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2C3E2D; font-size: 28px; margin: 0;">Lakefront</h1>
        <p style="color: #9A8A5A; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 4px 0 0;">Estates &amp; Villas</p>
      </div>
      <div style="background: #f8f8f5; border-radius: 8px; padding: 32px; border: 1px solid #e8e8e0;">
        <h2 style="color: #2C3E2D; font-size: 20px; margin: 0 0 16px;">You're Invited!</h2>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 12px;">
          Hi${name ? ' ' + name : ''},
        </p>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 12px;">
          You've been invited to join the <strong>Lakefront Economy</strong> platform as <strong>${role}</strong>.
        </p>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
          Click the button below to set your password and activate your account:
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${setPasswordUrl}" style="display: inline-block; background-color: #2C3E2D; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 14px; font-weight: 600; letter-spacing: 0.5px;">Set Password &amp; Get Started</a>
        </div>
        <p style="color: #999; font-size: 12px; line-height: 1.5; margin: 24px 0 0;">
          This link expires in 48 hours. If you didn't expect this invitation, you can safely ignore this email.
        </p>
      </div>
      <p style="color: #bbb; font-size: 11px; text-align: center; margin-top: 24px;">
        &copy; ${new Date().getFullYear()} Lakefront Estates &amp; Villas &bull; Okeechobee, FL
      </p>
    </div>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: `You're invited to Lakefront Economy — Set your password`,
        html,
      }),
    });
    const data = await res.json();
    if (res.ok) return { sent: true, id: data.id };
    return { sent: false, reason: data.message || 'Resend API error' };
  } catch (err: any) {
    return { sent: false, reason: err.message || 'Email send failed' };
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

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

  const token = crypto.randomBytes(32).toString('hex');
  const tokenExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  const { error: invErr } = await serviceClient.from('lf_invitations').insert({
    email: email.toLowerCase().trim(), role, portal_type,
    full_name: full_name || '', token, token_expires_at: tokenExpiresAt,
    permissions: permissions || [], invited_by: user.id, status: 'pending',
  });
  if (invErr) return NextResponse.json({ error: invErr.message }, { status: 500 });

  await serviceClient.from('lf_allowed_emails').upsert({
    email: email.toLowerCase().trim(), role, portal_type,
    full_name: full_name || '', invited_by: user.id, is_active: true,
  }, { onConflict: 'email' });

  const setPasswordUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://lakefront-economic-dev.vercel.app'}/auth/set-password?token=${token}`;

  // Send invitation email
  const emailResult = await sendInviteEmail(
    email.toLowerCase().trim(),
    full_name || '',
    role,
    setPasswordUrl
  );

  // Audit log
  await serviceClient.from('lf_audit_log').insert({
    user_id: user.id, action: 'invitation_sent', entity_type: 'invitation',
    details: { email, role, portal_type, permissions: permissions || [], email_sent: emailResult.sent },
  });

  return NextResponse.json({
    success: true,
    setPasswordUrl,
    token,
    emailSent: emailResult.sent,
    emailError: emailResult.sent ? undefined : emailResult.reason,
    message: emailResult.sent
      ? `Invitation email sent to ${email}!`
      : `Invitation created for ${email}. Email not sent: ${emailResult.reason}. Share the link manually.`,
  });
}

export async function GET() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

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
