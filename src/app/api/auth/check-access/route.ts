import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  if (!email) return NextResponse.json({ allowed: false, message: 'Email required' });

  const normalizedEmail = email.toLowerCase().trim();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ allowed: false, message: 'Server not configured' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Check allowed emails whitelist
  const { data: allowed, error: allowedErr } = await supabase
    .from('lf_allowed_emails')
    .select('email, role, portal_type, is_active')
    .eq('email', normalizedEmail)
    .eq('is_active', true)
    .maybeSingle();

  if (allowedErr) {
    console.error('allowed_emails query error:', allowedErr);
  }

  if (allowed) {
    return NextResponse.json({
      allowed: true,
      portal_type: allowed.portal_type,
      role: allowed.role,
    });
  }

  // Check existing profiles (returning users)
  const { data: profile, error: profileErr } = await supabase
    .from('lf_profiles')
    .select('role, portal_type, account_status')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (profileErr) {
    console.error('profiles query error:', profileErr);
  }

  if (profile && profile.account_status !== 'rejected') {
    return NextResponse.json({
      allowed: true,
      portal_type: profile.portal_type,
      role: profile.role,
    });
  }

  return NextResponse.json({
    allowed: false,
    message: 'This email is not authorized. Contact your administrator to request access.',
  });
}
