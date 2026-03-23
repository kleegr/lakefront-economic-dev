import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { ghlConfig, isGhlConfigured } from '@/lib/ghl/config';
import { ghl } from '@/lib/ghl/client';

// POST /api/jobs/[id]/apply — public job application
// Creates: Supabase application record + GHL Contact + GHL ATS Opportunity

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = await params;
  const body = await req.json();
  const supabase = await createServerSupabase();

  const { firstName, lastName, email, phone, coverLetter, resumeUrl } = body;
  if (!firstName || !lastName || !email) {
    return NextResponse.json({ error: 'First name, last name, and email are required' }, { status: 400 });
  }

  const { data: job } = await supabase.from('lf_jobs').select('*').eq('id', jobId).eq('status', 'published').maybeSingle();
  if (!job) return NextResponse.json({ error: 'Job not found or not accepting applications' }, { status: 404 });

  let ghlContactId: string | null = null;
  let ghlOpportunityId: string | null = null;

  // Step 1: Create/find GHL Contact
  if (isGhlConfigured()) {
    try {
      const contactRes = await ghl.createContact({
        firstName, lastName, email, phone: phone || '',
        source: 'Lakefront Job Application',
        customField: { contact_type: 'Applicant' },
      });
      ghlContactId = contactRes?.contact?.id || null;

      // Step 2: Create ATS Opportunity
      if (ghlContactId && ghlConfig.pipelines.ats) {
        const oppRes = await ghl.createOpportunity({
          pipelineId: ghlConfig.pipelines.ats,
          name: `${firstName} ${lastName} - ${job.title}`,
          contactId: ghlContactId,
          status: 'open',
          customField: {
            job_reference: `${job.title} (${jobId})`,
            application_source: 'Portal',
            opp_type: 'ATS',
          },
        });
        ghlOpportunityId = oppRes?.opportunity?.id || null;
      }
    } catch (err) {
      console.error('GHL sync failed:', err);
    }
  }

  // Step 3: Save to Supabase
  const applicationData: Record<string, any> = {
    job_id: jobId,
    applicant_name: `${firstName} ${lastName}`,
    applicant_email: email,
    applicant_phone: phone || null,
    cover_letter: coverLetter || null,
    resume_url: resumeUrl || null,
    status: 'new',
    ghl_contact_id: ghlContactId,
    ghl_opportunity_id: ghlOpportunityId,
    ghl_synced_at: ghlContactId ? new Date().toISOString() : null,
  };

  const { data: application, error } = await supabase.from('lf_applications').insert(applicationData).select().single();

  if (error) {
    console.error('Failed to save application:', error);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }

  // Update application count (non-critical)
  try {
    await supabase.from('lf_jobs').update({
      application_count: (job.application_count || 0) + 1,
    }).eq('id', jobId);
  } catch { /* ignore */ }

  return NextResponse.json({
    success: true,
    applicationId: application?.id,
    ghlSynced: !!ghlContactId,
    message: 'Application submitted successfully',
  });
}
