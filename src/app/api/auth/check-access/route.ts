import { NextRequest, NextResponse } from 'next/server';

// Access control: only pre-authorized emails can log in
// Admin manages this list via the admin portal or directly in the database
export async function POST(request: NextRequest) {
  const { email } = await request.json();
  if (!email) return NextResponse.json({ allowed: false, message: 'Email required' });

  const normalizedEmail = email.toLowerCase().trim();

  // Check against the allowed_emails table in Supabase
  const { createClient } = await import('@supabase/supabase-js');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ allowed: false, message: 'Server configuration error' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Check if email exists in allowed list
  const { data: allowed } = await supabase
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
