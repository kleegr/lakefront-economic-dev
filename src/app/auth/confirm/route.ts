import { type EmailOtpType } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/applicant/dashboard';

  if (token_hash && type) {
    const response = NextResponse.redirect(new URL(next, request.url));
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

    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
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
        return NextResponse.redirect(new URL(dest, request.url));
      }
      return response;
    }
  }

  return NextResponse.redirect(new URL('/auth/login?error=invalid_token', request.url));
}
