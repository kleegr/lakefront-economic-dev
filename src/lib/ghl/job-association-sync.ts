// JOB ↔ EMPLOYEE ↔ EMPLOYER — 2-Way Sync via GHL Job Openings Custom Object
// The Job Openings custom object is the hub. Every employer and employee
// contact is ASSOCIATED to their job record in GHL.

import { ghlConfig, isGhlConfigured } from './config';
import { syncJobToGhl } from './job-sync';
import { getFieldsConfig } from './get-fields-config';
import { appToGhlCustomFields, ghlCustomFieldsToApp } from './employee-fields';

const BASE = 'https://services.leadconnectorhq.com';
function h() { return { 'Authorization': `Bearer ${ghlConfig.token}`, 'Content-Type': 'application/json', 'Version': '2021-07-28' }; }

let _cfMap: Record<string, string> | null = null;
async function cfMap(): Promise<Record<string, string>> {
  if (_cfMap) return _cfMap;
  if (!isGhlConfigured()) return {};
  try { const r = await fetch(`${BASE}/locations/${ghlConfig.locationId}/customFields`, { headers: h() }); const d = await r.json(); _cfMap = {}; for (const f of (d.customFields || [])) _cfMap[f.fieldKey] = f.id; return _cfMap; } catch { return {}; }
}
function cf(map: Record<string, string>, key: string, val: string) { const id = map[key]; return (id && val) ? { id, field_value: val } : null; }

// 1. SYNC JOB → GHL (create/update Job Opening + associate employer)
export async function syncJobWithEmployer(
  job: Record<string, any>,
  employer: { kleegr_contact_id?: string; full_name?: string; email?: string; company_name?: string } | null,
): Promise<{ ghlRecordId: string | null; success: boolean; error?: string }> {
  if (!isGhlConfigured()) return { ghlRecordId: null, success: false, error: 'GHL not configured' };
  const fields = await getFieldsConfig();
  const jobSync = await syncJobToGhl(job, fields, job.ghl_record_id || null);
  if (!jobSync.success) return { ghlRecordId: job.ghl_record_id || null, success: false, error: jobSync.error };
  const ghlRecordId = jobSync.ghlRecordId || job.ghl_record_id;
  if (ghlRecordId && employer?.kleegr_contact_id) await associateContactToJob(ghlRecordId, employer.kleegr_contact_id);
  return { ghlRecordId, success: true };
}

// 2. SYNC EMPLOYEE APPLICATION → GHL (contact + opportunity + job association)
// Uses ALL fields from employee-fields.ts config for full 2-way sync
export async function syncEmployeeToJob(
  app: Record<string, any>, job: Record<string, any> | null,
): Promise<{ contactId: string | null; opportunityId: string | null; success: boolean }> {
  if (!isGhlConfigured()) return { contactId: null, opportunityId: null, success: false };
  const map = await cfMap();
  const nameParts = (app.applicant_name || '').split(' ');

  // Build ALL employee custom fields from employee-fields config (2-way compatible)
  const customFields = appToGhlCustomFields(app, job, map);
  const ctId = map['contact.contact_type'];
  if (ctId) customFields.push({ id: ctId, field_value: 'Employee' });

  const tags = ['lakefront-employee', 'lakefront-applicant'];
  if (job?.title) tags.push(`job:${job.title.substring(0, 40)}`);
  if (['hired', 'offered'].includes(app.status)) tags.push('lakefront-hired');
  if (app.status === 'hired' && job?.title) tags.push(`hired:${job.title.substring(0, 30)}`);

  let contactId = app.ghl_contact_id || null;
  try {
    const cd: Record<string, any> = { locationId: ghlConfig.locationId, firstName: nameParts[0] || '', lastName: nameParts.slice(1).join(' ') || '', email: app.applicant_email || '', phone: app.applicant_phone || '', address1: app.address || '', source: 'Lakefront Portal', tags, customFields };
    if (contactId) { await fetch(`${BASE}/contacts/${contactId}`, { method: 'PUT', headers: h(), body: JSON.stringify(cd) }); }
    else { const ex = await findContactByEmail(app.applicant_email); if (ex) { contactId = ex; await fetch(`${BASE}/contacts/${contactId}`, { method: 'PUT', headers: h(), body: JSON.stringify(cd) }); } else { const r = await fetch(`${BASE}/contacts/`, { method: 'POST', headers: h(), body: JSON.stringify(cd) }); const d = await r.json(); contactId = d?.contact?.id || null; } }
  } catch (e) { console.error('Contact sync failed:', e); }

  let opportunityId = app.ghl_opportunity_id || null;
  if (contactId && job?.id && ghlConfig.pipelines.ats) {
    try {
      const oppName = `${app.applicant_name || 'Applicant'} \u2192 ${job.title || 'Job'}`;
      const oppStatus = ['hired', 'offered'].includes(app.status) ? 'won' : app.status === 'rejected' ? 'lost' : 'open';
      if (opportunityId) { await fetch(`${BASE}/opportunities/${opportunityId}`, { method: 'PUT', headers: h(), body: JSON.stringify({ status: oppStatus, name: oppName }) }); }
      else { const r = await fetch(`${BASE}/opportunities/`, { method: 'POST', headers: h(), body: JSON.stringify({ locationId: ghlConfig.locationId, pipelineId: ghlConfig.pipelines.ats, name: oppName, contactId, status: oppStatus }) }); const d = await r.json(); opportunityId = d?.opportunity?.id || null; }
    } catch (e) { console.error('Opportunity sync failed:', e); }
  }

  if (contactId && job?.ghl_record_id) await associateContactToJob(job.ghl_record_id, contactId);
  return { contactId, opportunityId, success: !!contactId };
}

// 3. SYNC EMPLOYER → GHL (upsert contact + associate to job)
export async function syncEmployerToJob(
  employer: Record<string, any>, job: Record<string, any> | null,
): Promise<{ contactId: string | null; success: boolean }> {
  if (!isGhlConfigured()) return { contactId: null, success: false };
  const map = await cfMap();
  const nameParts = (employer.full_name || '').split(' ');
  const customFields: Array<{ id: string; field_value: string }> = [];
  const add = (k: string, v: string) => { const e = cf(map, k, v); if (e) customFields.push(e); };
  add('contact.contact_type', 'Employer');
  if (employer.company_name) add('contact.employer_company', employer.company_name);
  if (job?.title) add('contact.position_applied_for', job.title);
  if (job?.id) add('contact.supabase_job_id', job.id);
  const tags = ['lakefront-employer']; if (job?.title) tags.push(`job-owner:${job.title.substring(0, 40)}`);

  let contactId = employer.kleegr_contact_id || null;
  try {
    const cd: Record<string, any> = { locationId: ghlConfig.locationId, firstName: nameParts[0] || '', lastName: nameParts.slice(1).join(' ') || '', email: employer.email || '', phone: employer.phone || '', companyName: employer.company_name || '', source: 'Lakefront Portal', tags, customFields };
    if (contactId) { await fetch(`${BASE}/contacts/${contactId}`, { method: 'PUT', headers: h(), body: JSON.stringify(cd) }); }
    else { const ex = await findContactByEmail(employer.email); if (ex) { contactId = ex; await fetch(`${BASE}/contacts/${contactId}`, { method: 'PUT', headers: h(), body: JSON.stringify(cd) }); } else { const r = await fetch(`${BASE}/contacts/`, { method: 'POST', headers: h(), body: JSON.stringify(cd) }); const d = await r.json(); contactId = d?.contact?.id || null; } }
  } catch (e) { console.error('Employer contact sync failed:', e); }
  if (contactId && job?.ghl_record_id) await associateContactToJob(job.ghl_record_id, contactId);
  return { contactId, success: !!contactId };
}

// 4. GHL → PORTAL: Process inbound webhook for job/contact changes
export async function processGhlWebhook(body: any, supabase: any): Promise<{ action: string; details?: any }> {
  const eventType = body.type || body.event || '';

  // A. Opportunity status changed → update application status
  if (eventType === 'OpportunityStatusUpdate' || eventType === 'OpportunityStageUpdate') {
    const contactId = body.contactId || body.contact_id || body.data?.contactId;
    const oppStatus = body.status || body.data?.status;
    const oppId = body.opportunityId || body.id || body.data?.id;
    if (!contactId) return { action: 'ignored' };
    const { data: app } = await supabase.from('lf_applications').select('id, status, job_id').eq('ghl_contact_id', contactId).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (!app) return { action: 'no_matching_app' };
    const statusMap: Record<string, string> = { open: 'reviewing', won: 'hired', lost: 'rejected', abandoned: 'withdrawn' };
    const ns = statusMap[oppStatus];
    if (ns && ns !== app.status) {
      await supabase.from('lf_applications').update({ status: ns, updated_at: new Date().toISOString(), ghl_opportunity_id: oppId || undefined }).eq('id', app.id);
      return { action: 'status_synced', details: { from: app.status, to: ns } };
    }
    return { action: 'status_unchanged' };
  }

  // B. Contact updated in GHL → sync ALL employee fields back to Supabase
  if (eventType === 'ContactUpdate') {
    const contactId = body.contactId || body.contact_id || body.id || body.data?.contactId || body.data?.id;
    const customFieldValues = body.customFields || body.customField || body.data?.customFields || body.data?.customField || [];
    if (!contactId) return { action: 'ignored' };
    const { data: app } = await supabase.from('lf_applications').select('id, status').eq('ghl_contact_id', contactId).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (!app) return { action: 'no_matching_app' };
    const fieldMap = await cfMap();
    const updates = ghlCustomFieldsToApp(customFieldValues, fieldMap);
    if (Object.keys(updates).length > 0) {
      updates.updated_at = new Date().toISOString();
      updates.ghl_synced_at = new Date().toISOString();
      await supabase.from('lf_applications').update(updates).eq('id', app.id);
      return { action: 'contact_fields_synced', details: { appId: app.id, fieldsUpdated: Object.keys(updates).length } };
    }
    return { action: 'no_field_changes' };
  }

  // C. Contact associated/disassociated to Job Opening → create/remove job assignment
  if (eventType === 'CustomObjectAssociation') {
    const recordId = body.recordId || body.data?.recordId;
    const contactId = body.contactId || body.data?.contactId;
    if (!recordId || !contactId) return { action: 'ignored' };
    const { data: job } = await supabase.from('lf_jobs').select('id, employer_id').eq('ghl_record_id', recordId).maybeSingle();
    if (!job) return { action: 'no_matching_job' };
    const { data: profile } = await supabase.from('lf_profiles').select('id, role').eq('kleegr_contact_id', contactId).maybeSingle();
    if (profile) {
      const role = ['employer', 'admin', 'super_admin'].includes(profile.role) ? 'employer' : 'employee';
      await supabase.from('lf_job_assignments').upsert({ job_id: job.id, employee_id: profile.id, employer_id: role === 'employer' ? profile.id : job.employer_id, role, status: 'active' }, { onConflict: 'job_id,employee_id,role' });
      return { action: 'assignment_created', details: { role } };
    }
    const { data: app } = await supabase.from('lf_applications').select('id, applicant_id').eq('ghl_contact_id', contactId).maybeSingle();
    if (app?.applicant_id) {
      await supabase.from('lf_job_assignments').upsert({ job_id: job.id, employee_id: app.applicant_id, employer_id: job.employer_id, application_id: app.id, role: 'employee', status: 'active' }, { onConflict: 'job_id,employee_id,role' });
      return { action: 'assignment_from_app' };
    }
    return { action: 'contact_not_found' };
  }

  // D. Contact disassociated from Job Opening → remove assignment
  if (eventType === 'CustomObjectDisassociation') {
    const recordId = body.recordId || body.data?.recordId;
    const contactId = body.contactId || body.data?.contactId;
    if (!recordId || !contactId) return { action: 'ignored' };
    const { data: job } = await supabase.from('lf_jobs').select('id').eq('ghl_record_id', recordId).maybeSingle();
    if (!job) return { action: 'no_matching_job' };
    const { data: profile } = await supabase.from('lf_profiles').select('id').eq('kleegr_contact_id', contactId).maybeSingle();
    if (profile) {
      await supabase.from('lf_job_assignments').delete().eq('job_id', job.id).eq('employee_id', profile.id);
      return { action: 'assignment_removed' };
    }
    return { action: 'contact_not_found' };
  }

  return { action: 'passthrough' };
}

async function associateContactToJob(jobGhlRecordId: string, contactGhlId: string): Promise<boolean> {
  if (!isGhlConfigured() || !jobGhlRecordId || !contactGhlId) return false;
  const sk = ghlConfig.customObjects.jobOpenings || 'custom_objects.job_openings';
  try { await fetch(`${BASE}/objects/${sk}/records/${jobGhlRecordId}/associations`, { method: 'POST', headers: h(), body: JSON.stringify({ locationId: ghlConfig.locationId, associations: [{ objectKey: 'contact', recordId: contactGhlId }] }) }); return true; } catch { return false; }
}

async function findContactByEmail(email: string): Promise<string | null> {
  if (!email || !isGhlConfigured()) return null;
  try { const r = await fetch(`${BASE}/contacts/search/duplicate`, { method: 'POST', headers: h(), body: JSON.stringify({ locationId: ghlConfig.locationId, email }) }); const d = await r.json(); return d?.contact?.id || null; } catch { return null; }
}
