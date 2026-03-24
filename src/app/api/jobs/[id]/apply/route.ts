import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { syncEmployeeToJob } from '@/lib/ghl/job-association-sync';
import { EMPLOYEE_FIELDS } from '@/lib/ghl/employee-fields';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = await params;
  const body = await req.json();
  const supabase = await createServerSupabase();
  const { firstName, lastName, email, phone } = body;
  if (!firstName || !lastName || !email) return NextResponse.json({ error: 'First name, last name, and email are required' }, { status: 400 });

  const { data: job } = await supabase.from('lf_jobs')
    .select('id, title, company_name, employer_id, ghl_record_id, status, salary_range, location, application_count')
    .eq('id', jobId).eq('status', 'published').maybeSingle();
  if (!job) return NextResponse.json({ error: 'Job not found or not accepting applications' }, { status: 404 });

  const insertData: Record<string, any> = {
    job_id: jobId, applicant_name: `${firstName} ${lastName}`, applicant_email: email,
    applicant_phone: phone || null, cover_letter: body.coverLetter || body.cover_letter || null,
    resume_url: body.resumeUrl || body.resume_url || null, status: 'submitted', application_type: 'employee',
  };
  for (const f of EMPLOYEE_FIELDS) { if (body[f.key] !== undefined && body[f.key] !== '' && body[f.key] !== null) insertData[f.key] = body[f.key]; }

  const { data: app, error } = await supabase.from('lf_applications').insert(insertData).select().single();
  if (error) return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });

  const sync = await syncEmployeeToJob(app, job);
  if (sync.success) {
    const upd: Record<string, any> = { ghl_synced_at: new Date().toISOString() };
    if (sync.contactId) upd.ghl_contact_id = sync.contactId;
    if (sync.opportunityId) upd.ghl_opportunity_id = sync.opportunityId;
    await supabase.from('lf_applications').update(upd).eq('id', app.id);
  }
  try { await supabase.from('lf_jobs').update({ application_count: (job.application_count || 0) + 1 }).eq('id', jobId); } catch {}
  return NextResponse.json({ success: true, applicationId: app?.id, ghlSynced: sync.success });
}
