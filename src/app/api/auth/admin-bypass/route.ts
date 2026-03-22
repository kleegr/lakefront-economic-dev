import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Admin bypass: generates a set-password link for the main admin email
// This is a secure bootstrap mechanism — only works for the super_admin email
export async function POST(request: NextRequest) {
  const { email, secret } = await request.json();
  if (!email) return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });

  const normalizedEmail = email.toLowerCase().trim();

  // Only allow bypass for verified super_admin emails
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: allowed } = await supabase.from('lf_allowed_emails').select('role').eq('email', normalizedEmail).eq('role', 'super_admin').eq('is_active', true).maybeSingle();

  if (!allowed) {
    return NextResponse.json({ success: false, error: 'Not authorized for admin bypass' }, { status: 403 });
  }

  // Check bypass secret (env var or hardcoded for bootstrap)
  const bypassSecret = process.env.ADMIN_BYPASS_SECRET || 'lakefront-admin-2026';
  if (secret !== bypassSecret) {
    return NextResponse.json({ success: false, error: 'Invalid bypass secret' }, { status: 403 });
  }

  // Generate a set-password token
  const token = 'admin-bypass-' + crypto.randomBytes(24).toString('hex');
  const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  await supabase.from('lf_invitations').insert({
    email: normalizedEmail,
    role: 'super_admin',
    portal_type: 'admin',
    full_name: 'Lakefront Admin',
    token,
    token_expires_at: tokenExpiresAt,
    permissions: [],
    status: 'pending',
  });

  const setPasswordUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://lakefront-economic-dev.vercel.app'}/auth/set-password?token=${token}`;

  return NextResponse.json({ success: true, setPasswordUrl });
}
