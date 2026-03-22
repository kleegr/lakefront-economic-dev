import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login?error=no_code', request.url));
  }

  // Default redirect
  let redirectTo = '/applicant/dashboard';

  const response = NextResponse.redirect(new URL(redirectTo, request.url));
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
    console.error('Code exchange error:', error);
    return NextResponse.redirect(new URL('/auth/login?error=auth_failed', request.url));
  }

  // Get user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    // Use a direct Supabase client (not SSR) with anon key to query profile
    // This avoids any cookie/RLS issues in the callback route
    const directClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: profile, error: profileError } = await directClient
      .from('lf_profiles')
      .select('role, portal_type')
      .eq('id', user.id)
      .maybeSingle();

    console.log('Callback profile lookup:', { userId: user.id, profile, profileError });

    if (profile) {
      if (['super_admin', 'admin'].includes(profile.role)) {
        redirectTo = '/portal/dashboard';
      } else if (profile.portal_type === 'employer') {
        redirectTo = '/employer/dashboard';
      } else {
        redirectTo = '/applicant/dashboard';
      }
    }
  }

  // Build final response with correct redirect and cookies
  const finalResponse = NextResponse.redirect(new URL(redirectTo, request.url));
  // Copy cookies from the initial response
  response.cookies.getAll().forEach(cookie => {
    finalResponse.cookies.set(cookie.name, cookie.value);
  });

  return finalResponse;
}
