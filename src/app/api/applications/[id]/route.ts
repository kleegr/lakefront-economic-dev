import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { deleteKleegrContact } from '@/lib/ghl/delete-sync';
import { syncApplicationToGhl, syncHireEventToGhl } from '@/lib/ghl/association-sync';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from('lf_applications')
    .select('*, job:lf_jobs(id, title, company_name, employer_id, ghl_record_id, status, salary_range, location)')
    .eq('id', params.id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createServerSupabase();
  const body = await req.json();
  body.updated_at = new Date().toISOString();
  const { data: oldApp } = await supabase.from('lf_applications')
    .select('*, job:lf_jobs(id, title, company_name, employer_id, ghl_record_id, status, salary_range, location)')
    .eq('id', params.id).single();
  const { data, error } = await supabase.from('lf_applications').update(body).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let job = oldApp?.job || null;
  if (!job && data?.job_id) {
    const { data: j } = await supabase.from('lf_jobs').select('id, title, company_name, employer_id, ghl_record_id, status, salary_range, location').eq('id', data.job_id).single();
    job = j;
  }
  const wasHired = body.status && ['hired', 'offered'].includes(body.status) && oldApp?.status !== body.status;

  const syncResult = await syncApplicationToGhl(data, job);
  if (syncResult.success) {
    const updates: Record<string, any> = { ghl_synced_at: new Date().toISOString() };
    if (syncResult.contactId && !data.ghl_contact_id) updates.ghl_contact_id = syncResult.contactId;
    if (syncResult.opportunityId && !data.ghl_opportunity_id) updates.ghl_opportunity_id = syncResult.opportunityId;
    if (Object.keys(updates).length > 1) await supabase.from('lf_applications').update(updates).eq('id', params.id);
  }

  if (wasHired && job) {
    let employer = null;
    if (job.employer_id) {
      const { data: emp } = await supabase.from('lf_profiles').select('id, full_name, email, kleegr_contact_id, company_name').eq('id', job.employer_id).single();
      employer = emp;
    }
    await syncHireEventToGhl({ ...data, ghl_contact_id: syncResult.contactId || data.ghl_contact_id }, job, employer);
  }
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createServerSupabase();
  const { data: app } = await supabase.from('lf_applications').select('ghl_contact_id').eq('id', params.id).single();
  const { error } = await supabase.from('lf_applications').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (app?.ghl_contact_id) await deleteKleegrContact(app.ghl_contact_id);
  return NextResponse.json({ success: true });
}
