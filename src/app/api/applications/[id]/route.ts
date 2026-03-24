import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { deleteKleegrContact, updateKleegrContact } from '@/lib/ghl/delete-sync';
export const dynamic = 'force-dynamic';

// GET single application
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from('lf_applications').select('*').eq('id', params.id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

// PUT update application + sync to Kleegr
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createServerSupabase();
  const body = await req.json();
  body.updated_at = new Date().toISOString();
  const { data, error } = await supabase.from('lf_applications').update(body).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Sync edit to Kleegr contact if linked
  if (data?.ghl_contact_id) {
    const contactUpdate: Record<string, any> = {};
    if (body.applicant_name) { const p = body.applicant_name.split(' '); contactUpdate.firstName = p[0]; contactUpdate.lastName = p.slice(1).join(' '); }
    if (body.applicant_email) contactUpdate.email = body.applicant_email;
    if (body.applicant_phone) contactUpdate.phone = body.applicant_phone;
    if (body.address) contactUpdate.address1 = body.address;
    if (Object.keys(contactUpdate).length > 0) await updateKleegrContact(data.ghl_contact_id, contactUpdate);
  }

  return NextResponse.json(data);
}

// DELETE application + delete from Kleegr
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createServerSupabase();
  // Get the record first to find Kleegr ID
  const { data: app } = await supabase.from('lf_applications').select('ghl_contact_id').eq('id', params.id).single();
  
  const { error } = await supabase.from('lf_applications').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Delete from Kleegr if linked
  if (app?.ghl_contact_id) await deleteKleegrContact(app.ghl_contact_id);

  return NextResponse.json({ success: true });
}
