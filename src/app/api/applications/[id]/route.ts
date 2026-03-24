import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const body = await req.json();
  const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
  const allowed = ['status', 'notes', 'cover_letter', 'address', 'application_type'];
  for (const k of allowed) { if (body[k] !== undefined) updateData[k] = body[k]; }
  const { data, error } = await supabase.from('lf_applications').update(updateData).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ application: data });
}
