import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { deleteKleegrContact, updateKleegrContact } from '@/lib/ghl/delete-sync';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from('lf_spaces').select('*').eq('id', params.id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createServerSupabase();
  const body = await req.json();
  body.updated_at = new Date().toISOString();
  const { data, error } = await supabase.from('lf_spaces').update(body).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createServerSupabase();
  const { data: space } = await supabase.from('lf_spaces').select('ghl_record_id').eq('id', params.id).single();
  const { error } = await supabase.from('lf_spaces').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (space?.ghl_record_id) await deleteKleegrContact(space.ghl_record_id);
  return NextResponse.json({ success: true });
}
