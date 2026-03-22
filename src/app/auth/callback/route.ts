import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get user profile to determine redirect
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('lf_profiles').select('role,portal_type').eq('id', user.id).single();
        let dest = '/applicant/dashboard';
        if (profile) {
          if (['super_admin', 'admin'].includes(profile.role)) dest = '/portal/dashboard';
          else if (profile.portal_type === 'employer') dest = '/employer/dashboard';
        }

        const response = NextResponse.redirect(new URL(dest, request.url));
        // Set cookies on the response
        const supabaseForResponse = createServerClient(
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
        await supabaseForResponse.auth.exchangeCodeForSession(code);
        return response;
      }
    }
  }

  // Fallback: redirect to login
  return NextResponse.redirect(new URL('/auth/login?error=auth_failed', request.url));
}
