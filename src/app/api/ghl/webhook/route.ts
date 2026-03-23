import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { ghlPropertiesToJob } from '@/lib/ghl/job-sync';
import { getFieldsConfig } from '@/lib/ghl/get-fields-config';

// POST /api/ghl/webhook — GHL → Supabase sync
export async function POST(req: NextRequest) {
  const body = await req.json();
  const supabase = await createServerSupabase();
  const fields = await getFieldsConfig();

  const record = body.record || body.data || body;
  const properties = record?.properties || record;

  if (!properties?.job_title) {
    return NextResponse.json({ ok: true, action: 'ignored', reason: 'no job_title' });
  }

  const jobData = ghlPropertiesToJob(properties, fields);
  const ghlRecordId = record?.id || body.id || null;

  if (jobData.id) {
    const updateData: Record<string, any> = {
      ghl_record_id: ghlRecordId,
      ghl_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    // Map all fields from config
    for (const f of fields) {
      if (f.key === 'id' || f.field_type === 'hidden') continue;
      if (jobData[f.key] !== undefined) updateData[f.key] = jobData[f.key] || null;
    }
    const { error } = await supabase.from('lf_jobs').update(updateData).eq('id', jobData.id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, action: 'updated', jobId: jobData.id });
  } else {
    const slug = jobData.title ? String(jobData.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '';
    const insertData: Record<string, any> = {
      slug, is_public: true, approval_status: 'approved',
      ghl_record_id: ghlRecordId, ghl_synced_at: new Date().toISOString(),
    };
    for (const f of fields) {
      if (f.key === 'id' || f.field_type === 'hidden') continue;
      insertData[f.key] = jobData[f.key] || null;
    }
    if (!insertData.title) insertData.title = 'Untitled Job';
    if (!insertData.status) insertData.status = 'draft';
    if (!insertData.visibility) insertData.visibility = 'public';

    const { data: newJob, error } = await supabase.from('lf_jobs').insert(insertData).select().single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, action: 'created', jobId: newJob?.id });
  }
}
