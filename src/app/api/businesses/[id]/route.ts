import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { deleteKleegrContact, updateKleegrContact } from '@/lib/ghl/delete-sync';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from('lf_businesses').select('*').eq('id', params.id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createServerSupabase();
  const body = await req.json();
  body.updated_at = new Date().toISOString();
  const { data, error } = await supabase.from('lf_businesses').update(body).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (data?.ghl_record_id) {
    const update: Record<string, any> = {};
    if (body.contact_email) update.email = body.contact_email;
    if (body.contact_name) { const p = body.contact_name.split(' '); update.firstName = p[0]; update.lastName = p.slice(1).join(' '); }
    if (body.contact_phone) update.phone = body.contact_phone;
    if (body.name) update.companyName = body.name;
    if (Object.keys(update).length > 0) await updateKleegrContact(data.ghl_record_id, update);
  }
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createServerSupabase();
  const { data: biz } = await supabase.from('lf_businesses').select('ghl_record_id').eq('id', params.id).single();
  const { error } = await supabase.from('lf_businesses').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (biz?.ghl_record_id) await deleteKleegrContact(biz.ghl_record_id);
  return NextResponse.json({ success: true });
}
