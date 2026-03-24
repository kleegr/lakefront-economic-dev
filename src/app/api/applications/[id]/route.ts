import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { deleteKleegrContact } from '@/lib/ghl/delete-sync';
import { syncEmployeeToJob } from '@/lib/ghl/job-association-sync';
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
  const { data, error } = await supabase.from('lf_applications').update(body).eq('id', params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  let job = null;
  if (data?.job_id) { const { data: j } = await supabase.from('lf_jobs').select('id, title, company_name, employer_id, ghl_record_id, status, salary_range, location').eq('id', data.job_id).single(); job = j; }
  const sync = await syncEmployeeToJob(data, job);
  if (sync.success) { const u: Record<string, any> = { ghl_synced_at: new Date().toISOString() }; if (sync.contactId && !data.ghl_contact_id) u.ghl_contact_id = sync.contactId; if (sync.opportunityId && !data.ghl_opportunity_id) u.ghl_opportunity_id = sync.opportunityId; if (Object.keys(u).length > 1) await supabase.from('lf_applications').update(u).eq('id', params.id); }
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
