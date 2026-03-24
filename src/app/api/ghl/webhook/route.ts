import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { ghlPropertiesToJob } from '@/lib/ghl/job-sync';
import { getFieldsConfig } from '@/lib/ghl/get-fields-config';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const supabase = await createServerSupabase();
  const eventType = body.type || body.event || '';
  if (eventType === 'ContactUpdate' || eventType === 'OpportunityStatusUpdate') {
    return handleContactOrOppUpdate(body, supabase);
  }

  const fields = await getFieldsConfig();
  const record = body.record || body.data || body;
  const properties = record?.properties || record;
  if (!properties?.job_title) return NextResponse.json({ ok: true, action: 'ignored', reason: 'no job_title' });

  const jobData = ghlPropertiesToJob(properties, fields);
  const ghlRecordId = record?.id || body.id || null;

  if (jobData.id) {
    const updateData: Record<string, any> = { ghl_record_id: ghlRecordId, ghl_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    for (const f of fields) { if (f.key === 'id' || f.field_type === 'hidden') continue; if (jobData[f.key] !== undefined) updateData[f.key] = jobData[f.key] || null; }
    const { error } = await supabase.from('lf_jobs').update(updateData).eq('id', jobData.id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, action: 'updated', jobId: jobData.id });
  } else {
    const slug = jobData.title ? String(jobData.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '';
    const insertData: Record<string, any> = { slug, is_public: true, approval_status: 'approved', ghl_record_id: ghlRecordId, ghl_synced_at: new Date().toISOString() };
    for (const f of fields) { if (f.key === 'id' || f.field_type === 'hidden') continue; insertData[f.key] = jobData[f.key] || null; }
    if (!insertData.title) insertData.title = 'Untitled Job';
    if (!insertData.status) insertData.status = 'draft';
    if (!insertData.visibility) insertData.visibility = 'public';
    const { data: newJob, error } = await supabase.from('lf_jobs').insert(insertData).select().single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, action: 'created', jobId: newJob?.id });
  }
}

async function handleContactOrOppUpdate(body: any, supabase: any) {
  const contactId = body.contactId || body.contact_id || body.data?.contactId;
  const oppStatus = body.status || body.data?.status;
  if (!contactId) return NextResponse.json({ ok: true, action: 'ignored' });
  const { data: app } = await supabase.from('lf_applications').select('id, status, job_id').eq('ghl_contact_id', contactId).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (!app) return NextResponse.json({ ok: true, action: 'no_matching_app' });
  if (oppStatus) {
    const statusMap: Record<string, string> = { open: 'reviewing', won: 'hired', lost: 'rejected', abandoned: 'withdrawn' };
    const newStatus = statusMap[oppStatus];
    if (newStatus && newStatus !== app.status) {
      await supabase.from('lf_applications').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', app.id);
    }
  }
  return NextResponse.json({ ok: true, action: 'synced', applicationId: app.id });
}
