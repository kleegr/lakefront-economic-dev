import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { deleteKleegrContact, updateKleegrContact } from '@/lib/ghl/delete-sync';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from('lf_services').select('*').eq('id', params.id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createServerSupabase();
  const body = await req.json();
  body.updated_at = new Date().toISOString();
  const { data, error } = await supabase.from('lf_services').update(body).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (data?.ghl_record_id) {
    const update: Record<string, any> = {};
    if (body.contact_email) update.email = body.contact_email;
    if (body.contact_phone) update.phone = body.contact_phone;
    if (body.name) update.companyName = body.name;
    if (Object.keys(update).length > 0) await updateKleegrContact(data.ghl_record_id, update);
  }
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createServerSupabase();
  const { data: svc } = await supabase.from('lf_services').select('ghl_record_id').eq('id', params.id).single();
  const { error } = await supabase.from('lf_services').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (svc?.ghl_record_id) await deleteKleegrContact(svc.ghl_record_id);
  return NextResponse.json({ success: true });
}
