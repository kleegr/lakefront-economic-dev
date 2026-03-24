import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { syncEmployeeToJob } from '@/lib/ghl/job-association-sync';

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const body = await req.json();
  const { data, error } = await supabase.from('lf_applications').insert({
    applicant_name: body.applicant_name || null, applicant_email: body.applicant_email || null,
    applicant_phone: body.applicant_phone || null, address: body.address || null,
    application_type: body.application_type || 'employee', cover_letter: body.cover_letter || null,
    status: body.status || 'submitted', job_id: body.job_id || null,
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  let job = null;
  if (data?.job_id) { const { data: j } = await supabase.from('lf_jobs').select('id, title, company_name, ghl_record_id, employer_id').eq('id', data.job_id).single(); job = j; }
  const sync = await syncEmployeeToJob(data, job);
  if (sync.success) { const u: Record<string, any> = { ghl_synced_at: new Date().toISOString() }; if (sync.contactId) u.ghl_contact_id = sync.contactId; if (sync.opportunityId) u.ghl_opportunity_id = sync.opportunityId; await supabase.from('lf_applications').update(u).eq('id', data.id); }
  return NextResponse.json({ success: true, application: data, kleegrSynced: sync.success });
}
