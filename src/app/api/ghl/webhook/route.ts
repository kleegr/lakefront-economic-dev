import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { parseGhlCompanyToJob } from '@/lib/ghl/job-sync';

// POST /api/ghl/webhook — GHL → Supabase sync endpoint
// GHL sends webhook when a company is created/updated
// Set this URL in GHL: Automation → Webhook → POST to https://lakefront-economic-dev.vercel.app/api/ghl/webhook

export async function POST(req: NextRequest) {
  const body = await req.json();
  const supabase = await createServerSupabase();

  // GHL webhook payload varies by event type
  const eventType = body.type || body.event || '';
  const company = body.company || body.data || body;

  console.log('GHL webhook received:', eventType, JSON.stringify(body).substring(0, 500));

  // Handle company create/update — check if it's a job
  if (company?.name?.startsWith('Job: ')) {
    const jobData = parseGhlCompanyToJob(company);
    if (!jobData) return NextResponse.json({ ok: true, action: 'skipped' });

    if (jobData.id) {
      // Has Supabase ID — update existing
      const { error } = await supabase.from('lf_jobs').update({
        title: jobData.title,
        company_name: jobData.company_name,
        category: jobData.category,
        job_type: jobData.job_type,
        work_mode: jobData.work_mode,
        salary_range: jobData.salary_range,
        compensation_type: jobData.compensation_type,
        department: jobData.department || null,
        status: jobData.status,
        visibility: jobData.visibility,
        description: jobData.description,
        requirements: jobData.requirements,
        benefits: jobData.benefits,
        special_offer: jobData.special_offer || null,
        ghl_record_id: company.id,
        ghl_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', jobData.id);

      if (error) {
        console.error('GHL webhook: failed to update job', error);
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true, action: 'updated', jobId: jobData.id });
    } else {
      // No Supabase ID — new job from GHL
      const slug = jobData.title ? jobData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '';
      const { data: newJob, error } = await supabase.from('lf_jobs').insert({
        title: jobData.title,
        company_name: jobData.company_name,
        location: 'Lakefront Estates, Okeechobee, FL',
        category: jobData.category || 'General',
        job_type: jobData.job_type || 'full-time',
        work_mode: jobData.work_mode || 'on_site',
        salary_range: jobData.salary_range,
        compensation_type: jobData.compensation_type || 'salary',
        department: jobData.department || null,
        status: jobData.status || 'draft',
        visibility: jobData.visibility || 'public',
        description: jobData.description,
        requirements: jobData.requirements,
        benefits: jobData.benefits,
        special_offer: jobData.special_offer || null,
        slug,
        is_public: jobData.visibility !== 'admin_only',
        approval_status: 'approved',
        ghl_record_id: company.id,
        ghl_synced_at: new Date().toISOString(),
      }).select().single();

      if (error) {
        console.error('GHL webhook: failed to create job', error);
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true, action: 'created', jobId: newJob?.id });
    }
  }

  return NextResponse.json({ ok: true, action: 'ignored' });
}
