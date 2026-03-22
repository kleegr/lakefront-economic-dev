import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  if (!email || !password) return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Sign in with Supabase Auth (email+password)
  const response = NextResponse.json({ success: true });
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

  if (error) {
    return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
  }

  if (!data.user) {
    return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 401 });
  }

  // Get profile to determine redirect
  const directClient = createClient(supabaseUrl, supabaseKey);
  const { data: profile } = await directClient.from('lf_profiles').select('role, portal_type, account_status').eq('id', data.user.id).maybeSingle();

  // Update last login
  await directClient.from('lf_profiles').update({ last_login_at: new Date().toISOString() }).eq('id', data.user.id);

  // Audit log
  await directClient.from('lf_audit_log').insert({ user_id: data.user.id, action: 'login', details: { method: 'password' } });

  let redirectTo = '/applicant/dashboard';
  if (profile) {
    if (profile.account_status === 'suspended') {
      await supabase.auth.signOut();
      return NextResponse.json({ success: false, error: 'Your account has been suspended' }, { status: 403 });
    }
    if (['super_admin', 'admin'].includes(profile.role)) redirectTo = '/portal/dashboard';
    else if (profile.portal_type === 'employer') redirectTo = '/employer/dashboard';
  }

  // Build response with session cookies
  const finalResponse = NextResponse.json({ success: true, redirectTo });
  response.cookies.getAll().forEach(cookie => { finalResponse.cookies.set(cookie.name, cookie.value); });
  return finalResponse;
}
