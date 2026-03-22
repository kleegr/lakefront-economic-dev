import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options as Record<string, unknown>));
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  const isPortalRoute = path.startsWith('/portal') || path.startsWith('/applicant') || path.startsWith('/employer');
  const isLoginRoute = path === '/portal/login' || path === '/auth/login';

  if (isPortalRoute && !isLoginRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }

  if (user && isPortalRoute && !isLoginRoute) {
    const { data: profile } = await supabase.from('lf_profiles').select('role,account_status,portal_type').eq('id', user.id).single();
    if (profile) {
      if (path.startsWith('/portal') && !['super_admin','admin'].includes(profile.role)) {
        const url = request.nextUrl.clone();
        url.pathname = profile.portal_type === 'employer' ? '/employer/dashboard' : '/applicant/dashboard';
        return NextResponse.redirect(url);
      }
      if (path.startsWith('/employer') && profile.portal_type !== 'employer' && !['super_admin','admin'].includes(profile.role)) {
        const url = request.nextUrl.clone();
        url.pathname = '/applicant/dashboard';
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
