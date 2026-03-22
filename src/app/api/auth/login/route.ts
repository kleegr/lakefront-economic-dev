import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  if (!email || !password) return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // We need to create the final response first so cookies can be set on it
  const jsonBody = { success: true, redirectTo: '/applicant/dashboard' };
  const response = NextResponse.json(jsonBody);

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options as Record<string, unknown>);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password,
  });

  if (error || !data.user) {
    return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
  }

  // Now the supabase client has a valid session — auth.uid() works for RLS
  const { data: profile, error: profileErr } = await supabase
    .from('lf_profiles')
    .select('role, portal_type, account_status')
    .eq('id', data.user.id)
    .maybeSingle();

  // Update last login
  await supabase.from('lf_profiles').update({ last_login_at: new Date().toISOString() }).eq('id', data.user.id);

  // Audit log
  await supabase.from('lf_audit_log').insert({ user_id: data.user.id, action: 'login', details: { method: 'password' } });

  let redirectTo = '/applicant/dashboard';
  if (profile) {
    if (profile.account_status === 'suspended') {
      await supabase.auth.signOut();
      return NextResponse.json({ success: false, error: 'Your account has been suspended' }, { status: 403 });
    }
    if (['super_admin', 'admin'].includes(profile.role)) {
      redirectTo = '/portal/dashboard';
    } else if (profile.portal_type === 'employer') {
      redirectTo = '/employer/dashboard';
    }
  }

  // Build the final response with correct redirect and session cookies
  const finalResponse = NextResponse.json({ success: true, redirectTo });
  response.cookies.getAll().forEach(cookie => {
    finalResponse.cookies.set(cookie.name, cookie.value);
  });

  return finalResponse;
}
