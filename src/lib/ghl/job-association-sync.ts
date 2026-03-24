// JOB OPENINGS = ONLY for job posts. Employee contacts get associated to jobs.
// Employer contacts are just GHL contacts - NOT associated to Job Openings.
//
// Portal -> GHL:
//   1. Job created/edited -> upsert Job Opening record (NO employer association)
//   2. Employee applies -> upsert contact, create ATS opportunity, associate EMPLOYEE to Job Opening
//   3. Employer applies -> upsert contact with employer custom fields (NO job association)
//
// GHL -> Portal (webhook):
//   4. Job Opening edited in GHL -> update lf_jobs
//   5. Opportunity moved in pipeline -> update lf_applications.status
//   6. Employee contact associated to Job Opening -> create lf_job_assignments

import { ghlConfig, isGhlConfigured } from './config';
import { syncJobToGhl } from './job-sync';
import { getFieldsConfig } from './get-fields-config';
import { appToGhlCustomFields, ghlCustomFieldsToApp } from './employee-fields';
import { employerAppToGhlCustomFields } from './employer-fields';
import { logSyncSuccess, logSyncError, logSyncInbound } from './sync-logger';

const BASE = 'https://services.leadconnectorhq.com';
function h() { return { 'Authorization': `Bearer ${ghlConfig.token}`, 'Content-Type': 'application/json', 'Version': '2021-07-28' }; }

let _cfMap: Record<string, string> | null = null;
async function cfMap(): Promise<Record<string, string>> {
  if (_cfMap) return _cfMap;
  if (!isGhlConfigured()) return {};
  try { const r = await fetch(`${BASE}/locations/${ghlConfig.locationId}/customFields`, { headers: h() }); const d = await r.json(); _cfMap = {}; for (const f of (d.customFields || [])) _cfMap[f.fieldKey] = f.id; return _cfMap; } catch { return {}; }
}
function cf(map: Record<string, string>, key: string, val: string) { const id = map[key]; return (id && val) ? { id, field_value: val } : null; }

// 1. SYNC JOB -> GHL Job Opening (ONLY the job record, no contact associations)
export async function syncJobToGhlRecord(
  job: Record<string, any>,
): Promise<{ ghlRecordId: string | null; success: boolean; error?: string }> {
  if (!isGhlConfigured()) {
    await logSyncError('job', 'job_sync', 'GHL not configured', { entity_id: job.id, details: { title: job.title } });
    return { ghlRecordId: null, success: false, error: 'GHL not configured' };
  }
  const fields = await getFieldsConfig();
  const jobSync = await syncJobToGhl(job, fields, job.ghl_record_id || null);
  if (!jobSync.success) {
    await logSyncError('job', 'job_sync', jobSync.error || 'Unknown error', { entity_id: job.id, details: { title: job.title } });
    return { ghlRecordId: job.ghl_record_id || null, success: false, error: jobSync.error };
  }
  const ghlRecordId = jobSync.ghlRecordId || job.ghl_record_id;
  await logSyncSuccess('job', job.ghl_record_id ? 'job_updated' : 'job_created', {
    entity_id: job.id, ghl_id: ghlRecordId || undefined,
    details: { title: job.title, company: job.company_name },
  });
  return { ghlRecordId, success: true };
}

// Keep old name as alias for backward compat (jobs/[id]/route.ts etc)
export async function syncJobWithEmployer(
  job: Record<string, any>,
  _employer: any,
): Promise<{ ghlRecordId: string | null; success: boolean; error?: string }> {
  return syncJobToGhlRecord(job);
}

// 2. SYNC EMPLOYEE -> GHL (contact + opportunity + associate to Job Opening)
export async function syncEmployeeToJob(
  app: Record<string, any>, job: Record<string, any> | null,
): Promise<{ contactId: string | null; opportunityId: string | null; success: boolean }> {
  if (!isGhlConfigured()) return { contactId: null, opportunityId: null, success: false };
  const map = await cfMap();
  const nameParts = (app.applicant_name || '').split(' ');
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
      const oppName = `${app.applicant_name || 'Applicant'} -> ${job.title || 'Job'}`;
      const oppStatus = ['hired', 'offered'].includes(app.status) ? 'won' : app.status === 'rejected' ? 'lost' : 'open';
      if (opportunityId) { await fetch(`${BASE}/opportunities/${opportunityId}`, { method: 'PUT', headers: h(), body: JSON.stringify({ status: oppStatus, name: oppName }) }); }
      else { const r = await fetch(`${BASE}/opportunities/`, { method: 'POST', headers: h(), body: JSON.stringify({ locationId: ghlConfig.locationId, pipelineId: ghlConfig.pipelines.ats, name: oppName, contactId, status: oppStatus }) }); const d = await r.json(); opportunityId = d?.opportunity?.id || null; }
    } catch (e) { console.error('Opportunity sync failed:', e); }
  }

  // EMPLOYEE contacts DO get associated to Job Openings
  if (contactId && job?.ghl_record_id) await associateContactToJob(job.ghl_record_id, contactId);

  if (contactId) {
    await logSyncSuccess('application', app.ghl_contact_id ? 'employee_updated' : 'employee_created', {
      entity_id: app.id, ghl_id: contactId,
      details: { name: app.applicant_name, job: job?.title, status: app.status, opportunityId, fieldsCount: customFields.length },
    });
  } else {
    await logSyncError('application', 'employee_sync_failed', 'No contact ID returned', {
      entity_id: app.id, details: { name: app.applicant_name, email: app.applicant_email },
    });
  }
  return { contactId, opportunityId, success: !!contactId };
}

// 3. SYNC EMPLOYER -> GHL contact ONLY (NO Job Opening association)
// Employer is just a contact with employer custom fields
export async function syncEmployerContact(
  employer: Record<string, any>,
  app: Record<string, any>,
): Promise<{ contactId: string | null; success: boolean }> {
  if (!isGhlConfigured()) return { contactId: null, success: false };
  const map = await cfMap();
  const nameParts = (employer.full_name || '').split(' ');

  // Use employer field config for custom fields
  const customFields = employerAppToGhlCustomFields(app, map);

  const tags = ['lakefront-employer'];
  if (employer.company_name) tags.push(`company:${employer.company_name.substring(0, 40)}`);

  let contactId = employer.kleegr_contact_id || null;
  try {
    const cd: Record<string, any> = { locationId: ghlConfig.locationId, firstName: nameParts[0] || '', lastName: nameParts.slice(1).join(' ') || '', email: employer.email || '', phone: employer.phone || '', companyName: employer.company_name || '', source: 'Lakefront Portal', tags, customFields };
    if (contactId) { await fetch(`${BASE}/contacts/${contactId}`, { method: 'PUT', headers: h(), body: JSON.stringify(cd) }); }
    else { const ex = await findContactByEmail(employer.email); if (ex) { contactId = ex; await fetch(`${BASE}/contacts/${contactId}`, { method: 'PUT', headers: h(), body: JSON.stringify(cd) }); } else { const r = await fetch(`${BASE}/contacts/`, { method: 'POST', headers: h(), body: JSON.stringify(cd) }); const d = await r.json(); contactId = d?.contact?.id || null; } }
  } catch (e) { console.error('Employer contact sync failed:', e); }

  // NO association to Job Openings - employer is just a contact
  if (contactId) {
    await logSyncSuccess('employer', 'employer_contact_created', {
      entity_id: app.id, ghl_id: contactId,
      details: { name: employer.full_name, company: employer.company_name },
    });
  }
  return { contactId, success: !!contactId };
}

// Keep old name for backward compat
export async function syncEmployerToJob(
  employer: Record<string, any>, _job: Record<string, any> | null,
): Promise<{ contactId: string | null; success: boolean }> {
  return syncEmployerContact(employer, employer);
}

// 4. GHL -> PORTAL: Process inbound webhook
export async function processGhlWebhook(body: any, supabase: any): Promise<{ action: string; details?: any }> {
  const eventType = body.type || body.event || '';

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
      await logSyncInbound('opportunity_status_synced', { entity_id: app.id, ghl_id: contactId, details: { from: app.status, to: ns } });
      return { action: 'status_synced', details: { from: app.status, to: ns } };
    }
    return { action: 'status_unchanged' };
  }

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
      await logSyncInbound('contact_fields_synced', { entity_id: app.id, ghl_id: contactId, details: { fieldsUpdated: Object.keys(updates).filter(k => k !== 'updated_at' && k !== 'ghl_synced_at') } });
      return { action: 'contact_fields_synced', details: { appId: app.id, fieldsUpdated: Object.keys(updates).length } };
    }
    return { action: 'no_field_changes' };
  }

  // Employee associated to Job Opening (only employees, not employers)
  if (eventType === 'CustomObjectAssociation') {
    const recordId = body.recordId || body.data?.recordId;
    const contactId = body.contactId || body.data?.contactId;
    if (!recordId || !contactId) return { action: 'ignored' };
    const { data: job } = await supabase.from('lf_jobs').select('id, employer_id').eq('ghl_record_id', recordId).maybeSingle();
    if (!job) return { action: 'no_matching_job' };
    // Find employee application by ghl_contact_id
    const { data: app } = await supabase.from('lf_applications').select('id, applicant_id, application_type').eq('ghl_contact_id', contactId).maybeSingle();
    if (app && app.application_type === 'employee') {
      if (app.applicant_id) {
        await supabase.from('lf_job_assignments').upsert({ job_id: job.id, employee_id: app.applicant_id, employer_id: job.employer_id, application_id: app.id, role: 'employee', status: 'active' }, { onConflict: 'job_id,employee_id,role' });
      }
      await logSyncInbound('employee_associated_to_job', { entity_id: job.id, ghl_id: contactId });
      return { action: 'employee_assignment_created' };
    }
    return { action: 'not_employee_contact' };
  }

  if (eventType === 'CustomObjectDisassociation') {
    const recordId = body.recordId || body.data?.recordId;
    const contactId = body.contactId || body.data?.contactId;
    if (!recordId || !contactId) return { action: 'ignored' };
    const { data: job } = await supabase.from('lf_jobs').select('id').eq('ghl_record_id', recordId).maybeSingle();
    if (!job) return { action: 'no_matching_job' };
    const { data: app } = await supabase.from('lf_applications').select('id, applicant_id').eq('ghl_contact_id', contactId).maybeSingle();
    if (app?.applicant_id) {
      await supabase.from('lf_job_assignments').delete().eq('job_id', job.id).eq('employee_id', app.applicant_id);
      await logSyncInbound('employee_disassociated_from_job', { entity_id: job.id, ghl_id: contactId });
      return { action: 'assignment_removed' };
    }
    return { action: 'contact_not_found' };
  }

  return { action: 'passthrough' };
}

// Only EMPLOYEE contacts get associated to Job Openings
async function associateContactToJob(jobGhlRecordId: string, contactGhlId: string): Promise<boolean> {
  if (!isGhlConfigured() || !jobGhlRecordId || !contactGhlId) return false;
  const sk = ghlConfig.customObjects.jobOpenings || 'custom_objects.job_openings';
  try { await fetch(`${BASE}/objects/${sk}/records/${jobGhlRecordId}/associations`, { method: 'POST', headers: h(), body: JSON.stringify({ locationId: ghlConfig.locationId, associations: [{ objectKey: 'contact', recordId: contactGhlId }] }) }); return true; } catch { return false; }
}

async function findContactByEmail(email: string): Promise<string | null> {
  if (!email || !isGhlConfigured()) return null;
  try { const r = await fetch(`${BASE}/contacts/search/duplicate`, { method: 'POST', headers: h(), body: JSON.stringify({ locationId: ghlConfig.locationId, email }) }); const d = await r.json(); return d?.contact?.id || null; } catch { return null; }
}
