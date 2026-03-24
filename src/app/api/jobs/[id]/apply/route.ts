import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { syncApplicationToGhl } from '@/lib/ghl/association-sync';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = await params;
  const body = await req.json();
  const supabase = await createServerSupabase();
  const { firstName, lastName, email, phone, coverLetter, resumeUrl } = body;
  if (!firstName || !lastName || !email) return NextResponse.json({ error: 'First name, last name, and email are required' }, { status: 400 });

  const { data: job } = await supabase.from('lf_jobs')
    .select('*, employer:lf_profiles!lf_jobs_employer_id_fkey(id, full_name, email, kleegr_contact_id, company_name)')
    .eq('id', jobId).eq('status', 'published').maybeSingle();
  if (!job) return NextResponse.json({ error: 'Job not found or not accepting applications' }, { status: 404 });

  const { data: application, error } = await supabase.from('lf_applications').insert({
    job_id: jobId, applicant_name: `${firstName} ${lastName}`, applicant_email: email,
    applicant_phone: phone || null, cover_letter: coverLetter || null, resume_url: resumeUrl || null,
    status: 'submitted', application_type: 'employee',
  }).select().single();
  if (error) return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });

  const syncResult = await syncApplicationToGhl(application, job);
  if (syncResult.success) {
    const updates: Record<string, any> = { ghl_synced_at: new Date().toISOString() };
    if (syncResult.contactId) updates.ghl_contact_id = syncResult.contactId;
    if (syncResult.opportunityId) updates.ghl_opportunity_id = syncResult.opportunityId;
    await supabase.from('lf_applications').update(updates).eq('id', application.id);
  }
  try { await supabase.from('lf_jobs').update({ application_count: (job.application_count || 0) + 1 }).eq('id', jobId); } catch { }
  return NextResponse.json({ success: true, applicationId: application?.id, ghlSynced: syncResult.success, message: 'Application submitted successfully' });
}
