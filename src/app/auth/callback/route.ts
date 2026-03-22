import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  if (!code) return NextResponse.redirect(new URL('/auth/login?error=no_code', request.url));

  let redirectTo = '/applicant/dashboard';
  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
        cookiesToSet.forEach(({ name, value, options }) => { response.cookies.set(name, value, options as Record<string, unknown>); });
      },
    }}
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL('/auth/login?error=auth_failed', request.url));

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const directClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data: profile } = await directClient.from('lf_profiles').select('role, portal_type').eq('id', user.id).maybeSingle();
    if (profile) {
      if (['super_admin','admin'].includes(profile.role)) redirectTo = '/portal/dashboard';
      else if (profile.portal_type === 'employer') redirectTo = '/employer/dashboard';
    }
  }

  const finalResponse = NextResponse.redirect(new URL(redirectTo, request.url));
  response.cookies.getAll().forEach(cookie => { finalResponse.cookies.set(cookie.name, cookie.value); });
  return finalResponse;
}
