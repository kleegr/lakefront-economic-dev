import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { syncApplicationToGhl } from '@/lib/ghl/association-sync';

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
  if (data?.job_id) {
    const { data: j } = await supabase.from('lf_jobs').select('id, title, company_name, ghl_record_id, employer_id, salary_range, location').eq('id', data.job_id).single();
    job = j;
  }
  const syncResult = await syncApplicationToGhl(data, job);
  if (syncResult.success) {
    const updates: Record<string, any> = { ghl_synced_at: new Date().toISOString() };
    if (syncResult.contactId) updates.ghl_contact_id = syncResult.contactId;
    if (syncResult.opportunityId) updates.ghl_opportunity_id = syncResult.opportunityId;
    await supabase.from('lf_applications').update(updates).eq('id', data.id);
  }
  return NextResponse.json({ success: true, application: data, kleegrSynced: syncResult.success, kleegrContactId: syncResult.contactId });
}
