import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { syncEmployeeToJob, syncEmployerToJob, syncJobWithEmployer } from '@/lib/ghl/job-association-sync';
import { EMPLOYEE_FIELDS } from '@/lib/ghl/employee-fields';
import { EMPLOYER_FIELDS } from '@/lib/ghl/employer-fields';
export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from('lf_applications')
    .select('*, job:lf_jobs(id, title, company_name, status, ghl_record_id, employer_id, salary_range, location)')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ applications: data || [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const body = await req.json();
  const appType = body.application_type || 'employee';
  const insertData: Record<string, any> = { applicant_name: body.applicant_name || null, applicant_email: body.applicant_email || null, applicant_phone: body.applicant_phone || null, address: body.address || null, county: body.county || null, application_type: appType, cover_letter: body.cover_letter || null, resume_url: body.resume_url || null, notes: body.notes || null, status: body.status || 'submitted', job_id: body.job_id || null };
  const typeFields = appType === 'employer' ? EMPLOYER_FIELDS : EMPLOYEE_FIELDS;
  for (const f of typeFields) { if (body[f.key] !== undefined && body[f.key] !== '' && body[f.key] !== null) insertData[f.key] = body[f.key]; }
  const { data, error } = await supabase.from('lf_applications').insert(insertData).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  let ghlSynced = false; let jobCreated = false;
  if (appType === 'employer') {
    const employerSync = await syncEmployerToJob({ full_name: data.applicant_name, email: data.applicant_email, phone: data.applicant_phone, company_name: data.employer_company }, null);
    if (employerSync.success && employerSync.contactId) { await supabase.from('lf_applications').update({ ghl_contact_id: employerSync.contactId, ghl_synced_at: new Date().toISOString() }).eq('id', data.id); ghlSynced = true; }
    if (data.job_title) {
      const wm: Record<string,string> = { 'On Site':'on_site','Remote':'remote','Hybrid':'hybrid' }; const jt: Record<string,string> = { 'Full-Time':'full-time','Part-Time':'part-time','Contract':'contract','Seasonal':'seasonal','Internship':'internship' };
      const slug = data.job_title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
      const jobData: Record<string,any> = { title: data.job_title, company_name: data.employer_company||data.applicant_name||'Unknown', description: data.job_description||null, requirements: data.job_requirements||null, benefits: data.job_benefits||null, category: data.job_category||'General', job_type: jt[data.job_type_requested]||'full-time', work_mode: wm[data.job_work_mode]||'on_site', salary_range: data.job_salary_range||null, location: data.job_location||'Lakefront Estates, Okeechobee, FL', openings_count: data.job_openings_count||1, slug, status:'draft', visibility:'public', is_public:true, approval_status:'pending', created_by:user.id, employer_id:user.id };
      const { data: newJob, error: jobErr } = await supabase.from('lf_jobs').insert(jobData).select().single();
      if (!jobErr && newJob) { jobCreated = true; await supabase.from('lf_applications').update({ job_id: newJob.id }).eq('id', data.id); const jobSync = await syncJobWithEmployer(newJob, null); if (jobSync.success && jobSync.ghlRecordId) await supabase.from('lf_jobs').update({ ghl_record_id: jobSync.ghlRecordId, ghl_synced_at: new Date().toISOString() }).eq('id', newJob.id); }
    }
  } else {
    let job = null; if (data?.job_id) { const { data: j } = await supabase.from('lf_jobs').select('id, title, company_name, ghl_record_id, employer_id').eq('id', data.job_id).single(); job = j; }
    const sync = await syncEmployeeToJob(data, job);
    if (sync.success) { const upd: Record<string,any> = { ghl_synced_at: new Date().toISOString() }; if (sync.contactId) upd.ghl_contact_id = sync.contactId; if (sync.opportunityId) upd.ghl_opportunity_id = sync.opportunityId; await supabase.from('lf_applications').update(upd).eq('id', data.id); ghlSynced = true; }
  }
  return NextResponse.json({ application: data, ghlSynced, jobCreated });
}
