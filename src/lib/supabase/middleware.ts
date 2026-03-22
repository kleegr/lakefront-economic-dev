import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase not configured, pass through without auth
  if (!url || !key) return NextResponse.next({ request });

  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options as Record<string, unknown>));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  const isPortalRoute = path.startsWith('/portal') || path.startsWith('/applicant') || path.startsWith('/employer');
  const isLoginRoute = path === '/portal/login' || path === '/auth/login';

  if (isPortalRoute && !isLoginRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/auth/login';
    redirectUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isPortalRoute && !isLoginRoute) {
    const { data: profile } = await supabase.from('lf_profiles').select('role,account_status,portal_type').eq('id', user.id).single();
    if (profile) {
      if (path.startsWith('/portal') && !['super_admin','admin'].includes(profile.role)) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = profile.portal_type === 'employer' ? '/employer/dashboard' : '/applicant/dashboard';
        return NextResponse.redirect(redirectUrl);
      }
      if (path.startsWith('/employer') && profile.portal_type !== 'employer' && !['super_admin','admin'].includes(profile.role)) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/applicant/dashboard';
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return supabaseResponse;
}
