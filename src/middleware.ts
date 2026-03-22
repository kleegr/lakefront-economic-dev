import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const path = request.nextUrl.pathname;

  // PKCE redirect handler
  if (path === '/' && request.nextUrl.searchParams.has('code')) {
    const code = request.nextUrl.searchParams.get('code')!;
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/auth/callback';
    redirectUrl.searchParams.set('code', code);
    return NextResponse.redirect(redirectUrl);
  }

  // If Supabase not configured, pass through
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

  // Refresh session
  await supabase.auth.getUser();

  const isPortalRoute = path.startsWith('/portal') || path.startsWith('/applicant') || path.startsWith('/employer');
  const isLoginRoute = path === '/portal/login' || path === '/auth/login';
  const isAuthRoute = path.startsWith('/auth/');

  // Don't intercept any auth routes
  if (isAuthRoute) return supabaseResponse;

  // For portal routes: just check if user is authenticated
  // Role-based routing is handled by each portal layout component
  // This avoids RLS issues in middleware
  if (isPortalRoute && !isLoginRoute) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/auth/login';
      redirectUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
