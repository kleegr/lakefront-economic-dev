import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { data: profile } = await supabase.from('lf_profiles').select('role').eq('id', user.id).single();
  if (!profile || !['super_admin','admin'].includes(profile.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { data } = await supabase.from('lf_approval_queue').select('*').eq('status', 'pending').order('submitted_at', { ascending: false });
  return NextResponse.json({ approvals: data || [] });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { data: profile } = await supabase.from('lf_profiles').select('role').eq('id', user.id).single();
  if (!profile || !['super_admin','admin'].includes(profile.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await request.json();
  const { approvalId, decision, notes } = body;
  if (!approvalId || !['approved','rejected'].includes(decision)) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  const { error } = await supabase.from('lf_approval_queue').update({
    status: decision, reviewed_by: user.id, reviewed_at: new Date().toISOString(), review_notes: notes || null,
  }).eq('id', approvalId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
