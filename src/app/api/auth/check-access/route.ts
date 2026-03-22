import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Access control: only pre-authorized emails can log in
export async function POST(request: NextRequest) {
  const { email } = await request.json();
  if (!email) return NextResponse.json({ allowed: false, message: 'Email required' });

  const normalizedEmail = email.toLowerCase().trim();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ allowed: false, message: 'Server configuration error' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Check if email exists in allowed list
  const { data: allowed, error: allowedError } = await supabase
    .from('lf_allowed_emails')
    .select('*')
    .eq('email', normalizedEmail)
    .eq('is_active', true)
    .single();

  if (allowed) {
    return NextResponse.json({
      allowed: true,
      portal_type: allowed.portal_type,
      role: allowed.role,
    });
  }

  // Also check if user already exists in profiles (returning users)
  const { data: existingProfile } = await supabase
    .from('lf_profiles')
    .select('role, portal_type, account_status')
    .eq('email', normalizedEmail)
    .single();

  if (existingProfile && existingProfile.account_status !== 'rejected') {
    return NextResponse.json({
      allowed: true,
      portal_type: existingProfile.portal_type,
      role: existingProfile.role,
    });
  }

  return NextResponse.json({
    allowed: false,
    message: 'This email is not authorized. Contact your administrator to request access.',
  });
}
