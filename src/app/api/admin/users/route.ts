import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { data: profile } = await supabase.from('lf_profiles').select('role').eq('id', user.id).single();
  if (!profile || !['super_admin','admin'].includes(profile.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { data } = await supabase.from('lf_profiles').select('*').order('created_at', { ascending: false });
  return NextResponse.json({ users: data || [] });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { data: adminProfile } = await supabase.from('lf_profiles').select('role').eq('id', user.id).single();
  if (!adminProfile || !['super_admin','admin'].includes(adminProfile.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await request.json();
  const { userId, account_status, role } = body;
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });
  const updates: Record<string, unknown> = {};
  if (account_status) updates.account_status = account_status;
  if (role) updates.role = role;
  const { error } = await supabase.from('lf_profiles').update(updates).eq('id', userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
