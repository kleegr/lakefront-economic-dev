import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { ghlPropertiesToJob } from '@/lib/ghl/job-sync';

// POST /api/ghl/webhook — GHL → Supabase sync
// GHL Automation webhook when Custom Object record is created/updated
export async function POST(req: NextRequest) {
  const body = await req.json();
  const supabase = await createServerSupabase();

  console.log('GHL webhook received:', JSON.stringify(body).substring(0, 500));

  // Extract record data — GHL sends different payloads depending on trigger type
  const record = body.record || body.data || body;
  const properties = record?.properties || record;

  if (!properties?.job_title) {
    return NextResponse.json({ ok: true, action: 'ignored', reason: 'no job_title' });
  }

  const jobData = ghlPropertiesToJob(properties);
  const ghlRecordId = record?.id || body.id || null;

  if (jobData.id) {
    // Has supabase_id — update existing job
    const { error } = await supabase.from('lf_jobs').update({
      title: jobData.title,
      company_name: jobData.company_name || null,
      category: jobData.category,
      job_type: jobData.job_type,
      work_mode: jobData.work_mode,
      salary_range: jobData.salary_range || null,
      compensation_type: jobData.compensation_type,
      department: jobData.department || null,
      description: jobData.description || null,
      requirements: jobData.requirements || null,
      benefits: jobData.benefits || null,
      special_offer: jobData.special_offer || null,
      status: jobData.status,
      visibility: jobData.visibility,
      ghl_record_id: ghlRecordId,
      ghl_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', jobData.id);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, action: 'updated', jobId: jobData.id });
  } else {
    // No supabase_id — new job from GHL
    const slug = jobData.title ? jobData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '';
    const { data: newJob, error } = await supabase.from('lf_jobs').insert({
      title: jobData.title,
      company_name: jobData.company_name || null,
      location: jobData.location || 'Lakefront Estates, Okeechobee, FL',
      category: jobData.category || 'General',
      job_type: jobData.job_type || 'full-time',
      work_mode: jobData.work_mode || 'on_site',
      salary_range: jobData.salary_range || null,
      compensation_type: jobData.compensation_type || 'salary',
      description: jobData.description || null,
      requirements: jobData.requirements || null,
      benefits: jobData.benefits || null,
      special_offer: jobData.special_offer || null,
      status: jobData.status || 'draft',
      visibility: 'public',
      slug,
      is_public: true,
      approval_status: 'approved',
      ghl_record_id: ghlRecordId,
      ghl_synced_at: new Date().toISOString(),
    }).select().single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, action: 'created', jobId: newJob?.id });
  }
}
