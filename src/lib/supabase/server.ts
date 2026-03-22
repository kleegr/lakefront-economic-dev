import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options as Record<string, unknown>)); } catch { /* readonly in RSC */ }
        },
      },
    }
  );
}

export async function createServiceSupabase() {
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(
    SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key',
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
