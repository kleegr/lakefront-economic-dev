import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login?error=no_code', request.url));
  }

  const response = NextResponse.redirect(new URL('/applicant/dashboard', request.url));
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options as Record<string, unknown>);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL('/auth/login?error=auth_failed', request.url));
  }

  // Determine redirect based on user profile
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase.from('lf_profiles').select('role,portal_type').eq('id', user.id).single();
    if (profile) {
      if (['super_admin', 'admin'].includes(profile.role)) {
        return NextResponse.redirect(new URL('/portal/dashboard', request.url));
      } else if (profile.portal_type === 'employer') {
        return NextResponse.redirect(new URL('/employer/dashboard', request.url));
      }
    }
  }

  return response;
}
