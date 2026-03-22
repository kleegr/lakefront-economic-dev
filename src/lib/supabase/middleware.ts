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
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // Portal routes require auth
  const isPortalRoute = path.startsWith('/portal') || path.startsWith('/applicant') || path.startsWith('/employer');
  const isLoginRoute = path === '/portal/login' || path === '/auth/login';
  const isApiRoute = path.startsWith('/api/');
  const isPublicRoute = !isPortalRoute && !isApiRoute;

  if (isPortalRoute && !isLoginRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }

  // Role-based portal access
  if (user && isPortalRoute && !isLoginRoute) {
    const { data: profile } = await supabase.from('lf_profiles').select('role,account_status,portal_type').eq('id', user.id).single();
    if (profile) {
      // Admin portal: only admin/super_admin
      if (path.startsWith('/portal') && !['super_admin','admin'].includes(profile.role)) {
        const url = request.nextUrl.clone();
        url.pathname = profile.portal_type === 'employer' ? '/employer/dashboard' : '/applicant/dashboard';
        return NextResponse.redirect(url);
      }
      // Employer portal: only employer+
      if (path.startsWith('/employer') && profile.portal_type !== 'employer' && !['super_admin','admin'].includes(profile.role)) {
        const url = request.nextUrl.clone();
        url.pathname = '/applicant/dashboard';
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
