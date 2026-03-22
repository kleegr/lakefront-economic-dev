import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const path = request.nextUrl.pathname;

  // PKCE redirect handler: when Supabase redirects to site root with ?code=
  // We intercept it at the middleware level and redirect to our callback handler
  if (path === '/' && request.nextUrl.searchParams.has('code')) {
    const code = request.nextUrl.searchParams.get('code')!;
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/auth/callback';
    redirectUrl.searchParams.set('code', code);
    return NextResponse.redirect(redirectUrl);
  }

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

  const isPortalRoute = path.startsWith('/portal') || path.startsWith('/applicant') || path.startsWith('/employer');
  const isLoginRoute = path === '/portal/login' || path === '/auth/login';
  const isAuthCallback = path.startsWith('/auth/callback') || path.startsWith('/auth/confirm');

  // Don't intercept auth callback routes
  if (isAuthCallback) return supabaseResponse;

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

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
