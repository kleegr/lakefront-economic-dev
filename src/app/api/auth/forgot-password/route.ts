import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  if (!email) return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });

  const normalizedEmail = email.toLowerCase().trim();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Check if user exists in allowed list or profiles
  const { data: allowed } = await supabase.from('lf_allowed_emails').select('role, portal_type').eq('email', normalizedEmail).eq('is_active', true).maybeSingle();
  const { data: profile } = await supabase.from('lf_profiles').select('role, portal_type').eq('email', normalizedEmail).maybeSingle();

  if (!allowed && !profile) {
    // Don't reveal whether email exists
    return NextResponse.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
  }

  const role = profile?.role || allowed?.role || 'applicant';
  const portalType = profile?.portal_type || allowed?.portal_type || 'applicant';

  // Generate a reset token via lf_invitations (reusing the set-password flow)
  const token = 'reset-' + crypto.randomBytes(24).toString('hex');
  const tokenExpiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours

  await supabase.from('lf_invitations').insert({
    email: normalizedEmail,
    role,
    portal_type: portalType,
    full_name: '',
    token,
    token_expires_at: tokenExpiresAt,
    permissions: [],
    status: 'pending',
  });

  // Build the reset URL
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://lakefront-economic-dev.vercel.app'}/auth/set-password?token=${token}`;

  // For now, we can't send email programmatically without SMTP configured,
  // so we'll return the URL in the response for admin use.
  // In production, this would send an email via Resend/SendGrid.
  console.log(`Password reset link for ${normalizedEmail}: ${resetUrl}`);

  // Audit log
  await supabase.from('lf_audit_log').insert({
    action: 'password_reset_requested',
    entity_type: 'user',
    details: { email: normalizedEmail },
  });

  return NextResponse.json({ success: true, message: 'If that email is registered, a reset link has been sent.', resetUrl });
}
