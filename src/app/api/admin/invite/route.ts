import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// Admin-only: invite a user by adding their email to the allowed list
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { data: adminProfile } = await supabase.from('lf_profiles').select('role').eq('id', user.id).single();
  if (!adminProfile || !['super_admin', 'admin'].includes(adminProfile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { email, role, portal_type, full_name } = body;

  if (!email || !role || !portal_type) {
    return NextResponse.json({ error: 'email, role, and portal_type are required' }, { status: 400 });
  }

  // Use service role to bypass RLS
  const { createClient } = await import('@supabase/supabase-js');
  const serviceSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // Add to allowed emails list
  const { error } = await serviceSupabase.from('lf_allowed_emails').upsert({
    email: email.toLowerCase().trim(),
    role,
    portal_type,
    full_name: full_name || '',
    invited_by: user.id,
    is_active: true,
  }, { onConflict: 'email' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, message: `${email} has been invited as ${role}` });
}

// Admin-only: list all invited/allowed emails
export async function GET() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { data: adminProfile } = await supabase.from('lf_profiles').select('role').eq('id', user.id).single();
  if (!adminProfile || !['super_admin', 'admin'].includes(adminProfile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data } = await supabase.from('lf_allowed_emails').select('*').order('created_at', { ascending: false });
  return NextResponse.json({ invites: data || [] });
}
