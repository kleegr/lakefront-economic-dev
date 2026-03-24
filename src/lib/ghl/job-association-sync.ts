// JOB OPENINGS = ONLY for job posts. Employee contacts get associated to jobs.
// Employer contacts get associated to Job Openings when linked.
//
// ATS Pipeline Sync:
//   - Portal status changes -> move opportunity to correct Kleegr pipeline STAGE
//   - Kleegr stage changes -> update portal application status
//   - Stage names are fetched from Kleegr API and cached

import { ghlConfig, isGhlConfigured } from './config';
import { syncJobToGhl } from './job-sync';
import { getFieldsConfig } from './get-fields-config';
import { appToGhlCustomFields, ghlCustomFieldsToApp } from './employee-fields';
import { employerAppToGhlCustomFields } from './employer-fields';
import { logSyncSuccess, logSyncError, logSyncInbound } from './sync-logger';
import { getStageIdForStatus, resolveStatusFromWebhook, APP_STATUS_TO_OPP_STATUS } from './pipeline-stages';

const BASE = 'https://services.leadconnectorhq.com';
function h() { return { 'Authorization': `Bearer ${ghlConfig.token}`, 'Content-Type': 'application/json', 'Version': '2021-07-28' }; }

let _cfMap: Record<string, string> | null = null;
async function cfMap(): Promise<Record<string, string>> {
  if (_cfMap) return _cfMap;
  if (!isGhlConfigured()) return {};
  try { const r = await fetch(`${BASE}/locations/${ghlConfig.locationId}/customFields`, { headers: h() }); const d = await r.json(); _cfMap = {}; for (const f of (d.customFields || [])) _cfMap[f.fieldKey] = f.id; return _cfMap; } catch { return {}; }
}

// 1. SYNC JOB -> Kleegr Job Opening
export async function syncJobToGhlRecord(
  job: Record<string, any>,
): Promise<{ ghlRecordId: string | null; success: boolean; error?: string }> {
  if (!isGhlConfigured()) {
    await logSyncError('job', 'job_sync', 'Kleegr not configured', { entity_id: job.id, details: { title: job.title } });
    return { ghlRecordId: null, success: false, error: 'Kleegr not configured' };
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

// SYNC JOB + ASSOCIATE EMPLOYER CONTACT
export async function syncJobWithEmployer(job: Record<string, any>, _employer: any) {
  const result = await syncJobToGhlRecord(job);
  if (result.success && result.ghlRecordId) {
    const employerGhlContactId = job.ghl_company_id;
    if (employerGhlContactId) {
      const assocResult = await associateContactToJob(result.ghlRecordId, employerGhlContactId);
      if (assocResult.ok) {
        await logSyncSuccess('job', 'employer_associated', {
          entity_id: job.id, ghl_id: result.ghlRecordId,
          details: { title: job.title, contactId: employerGhlContactId, company: job.company_name },
        });
      } else {
        await logSyncError('job', 'employer_association_failed', assocResult.error || 'Unknown', {
          entity_id: job.id, ghl_id: result.ghlRecordId,
          details: { title: job.title, contactId: employerGhlContactId, company: job.company_name },
        });
      }
    } else {
      // No employer linked - remove all existing contact associations for this job
      await removeAllJobContactAssociations(result.ghlRecordId);
    }
  }
  return result;
}

// 2. SYNC EMPLOYEE -> Kleegr
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
  let contactId = app.ghl_contact_id || null;
  try {
    const cd: Record<string, any> = { locationId: ghlConfig.locationId, firstName: nameParts[0] || '', lastName: nameParts.slice(1).join(' ') || '', email: app.applicant_email || '', phone: app.applicant_phone || '', address1: app.address || '', source: 'Lakefront Portal', tags, customFields };
    if (contactId) { await fetch(`${BASE}/contacts/${contactId}`, { method: 'PUT', headers: h(), body: JSON.stringify(cd) }); }
    else { const ex = await findContactByEmail(app.applicant_email); if (ex) { contactId = ex; await fetch(`${BASE}/contacts/${contactId}`, { method: 'PUT', headers: h(), body: JSON.stringify(cd) }); } else { const r = await fetch(`${BASE}/contacts/`, { method: 'POST', headers: h(), body: JSON.stringify(cd) }); const d = await r.json(); contactId = d?.contact?.id || null; } }
  } catch (e) { console.error('Contact sync failed:', e); }
  let opportunityId = app.ghl_opportunity_id || null;
  if (contactId && ghlConfig.pipelines.ats) {
    try {
      const oppName = `${app.applicant_name || 'Applicant'} -> ${job?.title || 'Job'}`;
      const oppStatus = APP_STATUS_TO_OPP_STATUS[app.status] || 'open';
      const stageId = await getStageIdForStatus(app.status);
      if (opportunityId) {
        const ud: Record<string, any> = { status: oppStatus, name: oppName };
        if (stageId) ud.pipelineStageId = stageId;
        await fetch(`${BASE}/opportunities/${opportunityId}`, { method: 'PUT', headers: h(), body: JSON.stringify(ud) });
      } else {
        const cd: Record<string, any> = { locationId: ghlConfig.locationId, pipelineId: ghlConfig.pipelines.ats, name: oppName, contactId, status: oppStatus };
        if (stageId) cd.pipelineStageId = stageId;
        const r = await fetch(`${BASE}/opportunities/`, { method: 'POST', headers: h(), body: JSON.stringify(cd) });
        const d = await r.json();
        opportunityId = d?.opportunity?.id || null;
      }
    } catch (e) { console.error('Opportunity sync failed:', e); }
  }
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

// 3. SYNC EMPLOYER -> Kleegr contact ONLY
export async function syncEmployerContact(
  employer: Record<string, any>, app: Record<string, any>,
): Promise<{ contactId: string | null; success: boolean }> {
  if (!isGhlConfigured()) return { contactId: null, success: false };
  const map = await cfMap();
  const nameParts = (employer.full_name || '').split(' ');
  const customFields = employerAppToGhlCustomFields(app, map);
  const tags = ['lakefront-employer'];
  if (employer.company_name) tags.push(`company:${employer.company_name.substring(0, 40)}`);
  let contactId = employer.kleegr_contact_id || null;
  try {
    const cd: Record<string, any> = { locationId: ghlConfig.locationId, firstName: nameParts[0] || '', lastName: nameParts.slice(1).join(' ') || '', email: employer.email || '', phone: employer.phone || '', companyName: employer.company_name || '', source: 'Lakefront Portal', tags, customFields };
    if (contactId) { await fetch(`${BASE}/contacts/${contactId}`, { method: 'PUT', headers: h(), body: JSON.stringify(cd) }); }
    else { const ex = await findContactByEmail(employer.email); if (ex) { contactId = ex; await fetch(`${BASE}/contacts/${contactId}`, { method: 'PUT', headers: h(), body: JSON.stringify(cd) }); } else { const r = await fetch(`${BASE}/contacts/`, { method: 'POST', headers: h(), body: JSON.stringify(cd) }); const d = await r.json(); contactId = d?.contact?.id || null; } }
  } catch (e) { console.error('Employer contact sync failed:', e); }
  if (contactId) { await logSyncSuccess('employer', 'employer_contact_created', { entity_id: app.id, ghl_id: contactId, details: { name: employer.full_name, company: employer.company_name } }); }
  return { contactId, success: !!contactId };
}

export async function syncEmployerToJob(employer: Record<string, any>, _job: any) {
  return syncEmployerContact(employer, employer);
}

// 4. Kleegr -> PORTAL: Process inbound webhook
export async function processGhlWebhook(body: any, supabase: any): Promise<{ action: string; details?: any }> {
  const eventType = body.type || body.event || '';
  if (eventType === 'OpportunityStatusUpdate' || eventType === 'OpportunityStageUpdate') {
    const contactId = body.contactId || body.contact_id || body.data?.contactId;
    const oppId = body.opportunityId || body.id || body.data?.id;
    if (!contactId) return { action: 'ignored' };
    const { data: app } = await supabase.from('lf_applications').select('id, status, job_id').eq('ghl_contact_id', contactId).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (!app) return { action: 'no_matching_app' };
    const newStatus = await resolveStatusFromWebhook(body);
    if (!newStatus) return { action: 'status_unmapped', details: { body } };
    if (newStatus !== app.status) {
      const ud: Record<string, any> = { status: newStatus, updated_at: new Date().toISOString() };
      if (oppId) ud.ghl_opportunity_id = oppId;
      const stageId = body.stageId || body.stage_id || body.data?.stageId || body.data?.stage_id || body.pipelineStageId || body.data?.pipelineStageId;
      if (stageId) ud.ghl_stage_id = stageId;
      const pipelineId = body.pipelineId || body.data?.pipelineId;
      if (pipelineId) ud.ghl_pipeline_id = pipelineId;
      await supabase.from('lf_applications').update(ud).eq('id', app.id);
      await logSyncInbound('pipeline_stage_synced', { entity_id: app.id, ghl_id: contactId, details: { from: app.status, to: newStatus, stageId, oppId } });
      return { action: 'stage_synced', details: { from: app.status, to: newStatus } };
    }
    return { action: 'status_unchanged' };
  }
  if (eventType === 'ContactUpdate') {
    const contactId = body.contactId || body.contact_id || body.id || body.data?.contactId || body.data?.id;
    const cfv = body.customFields || body.customField || body.data?.customFields || body.data?.customField || [];
    if (!contactId) return { action: 'ignored' };
    const { data: app } = await supabase.from('lf_applications').select('id, status').eq('ghl_contact_id', contactId).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (!app) return { action: 'no_matching_app' };
    const fieldMap = await cfMap();
    const updates = ghlCustomFieldsToApp(cfv, fieldMap);
    if (Object.keys(updates).length > 0) {
      updates.updated_at = new Date().toISOString(); updates.ghl_synced_at = new Date().toISOString();
      await supabase.from('lf_applications').update(updates).eq('id', app.id);
      await logSyncInbound('contact_fields_synced', { entity_id: app.id, ghl_id: contactId, details: { fieldsUpdated: Object.keys(updates).filter(k => k !== 'updated_at' && k !== 'ghl_synced_at') } });
      return { action: 'contact_fields_synced', details: { appId: app.id, fieldsUpdated: Object.keys(updates).length } };
    }
    return { action: 'no_field_changes' };
  }
  if (eventType === 'CustomObjectAssociation') {
    const recordId = body.recordId || body.data?.recordId;
    const contactId = body.contactId || body.data?.contactId;
    if (!recordId || !contactId) return { action: 'ignored' };
    const { data: job } = await supabase.from('lf_jobs').select('id, employer_id').eq('ghl_record_id', recordId).maybeSingle();
    if (!job) return { action: 'no_matching_job' };
    const { data: app } = await supabase.from('lf_applications').select('id, applicant_id, application_type').eq('ghl_contact_id', contactId).maybeSingle();
    if (app && app.application_type === 'employee') {
      if (app.applicant_id) await supabase.from('lf_job_assignments').upsert({ job_id: job.id, employee_id: app.applicant_id, employer_id: job.employer_id, application_id: app.id, role: 'employee', status: 'active' }, { onConflict: 'job_id,employee_id,role' });
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

// --- ASSOCIATION HELPERS ---

let _associationId: string | null = null;

async function getContactJobAssociationId(): Promise<string | null> {
  if (_associationId) return _associationId;
  if (!isGhlConfigured()) return null;
  const sk = ghlConfig.customObjects.jobOpenings || 'custom_objects.job_openings';
  try {
    const res = await fetch(`${BASE}/associations/?locationId=${ghlConfig.locationId}`, { headers: h() });
    if (!res.ok) return null;
    const data = await res.json();
    const associations = data?.associations || data?.data || [];
    for (const a of associations) {
      const first = a.firstObjectKey || '';
      const second = a.secondObjectKey || '';
      if ((first === 'contact' && second === sk) || (first === sk && second === 'contact') ||
          (first === 'contact' && second.includes('job_openings')) || (first.includes('job_openings') && second === 'contact')) {
        _associationId = a.id;
        return _associationId;
      }
    }
    return null;
  } catch (e) { console.error('Failed to get associations:', e); return null; }
}

async function associateContactToJob(jobGhlRecordId: string, contactGhlId: string): Promise<{ ok: boolean; error?: string }> {
  if (!isGhlConfigured() || !jobGhlRecordId || !contactGhlId) return { ok: false, error: 'Missing config or IDs' };

  const assocId = await getContactJobAssociationId();
  if (!assocId) {
    return { ok: false, error: 'No association between contact and job_openings found. Create one in Kleegr: Settings > Objects > Job Openings > Associations > Create Association with Contacts.' };
  }

  // Step 1: Remove old contact relations for this job (so changing employer replaces the old one)
  try {
    const relRes = await fetch(`${BASE}/associations/relations/record/${jobGhlRecordId}?locationId=${ghlConfig.locationId}`, { headers: h() });
    if (relRes.ok) {
      const relData = await relRes.json();
      const relations = relData?.relations || relData?.data || [];
      for (const rel of relations) {
        if (rel.associationId === assocId && rel.id) {
          const otherRecordId = rel.firstRecordId === jobGhlRecordId ? rel.secondRecordId : rel.firstRecordId;
          if (otherRecordId === contactGhlId) continue;
          await fetch(`${BASE}/associations/relations/${rel.id}?locationId=${ghlConfig.locationId}`, { method: 'DELETE', headers: h() });
        }
      }
    }
  } catch (e) { /* silently continue if cleanup fails */ }

  // Step 2: Create the new relation
  const body = {
    locationId: ghlConfig.locationId,
    associationId: assocId,
    firstRecordId: contactGhlId,
    secondRecordId: jobGhlRecordId,
  };

  try {
    const res = await fetch(`${BASE}/associations/relations`, {
      method: 'POST', headers: h(), body: JSON.stringify(body),
    });
    const responseText = await res.text().catch(() => '');
    if (res.ok) return { ok: true };
    if (responseText.includes('duplicate relation')) return { ok: true };
    return { ok: false, error: `HTTP ${res.status}: ${responseText.substring(0, 300)} | assocId: ${assocId}` };
  } catch (e: any) {
    return { ok: false, error: `Exception: ${e?.message || String(e)}` };
  }
}

async function findContactByEmail(email: string): Promise<string | null> {
  if (!email || !isGhlConfigured()) return null;
  try { const r = await fetch(`${BASE}/contacts/search/duplicate`, { method: 'POST', headers: h(), body: JSON.stringify({ locationId: ghlConfig.locationId, email }) }); const d = await r.json(); return d?.contact?.id || null; } catch { return null; }
}

async function removeAllJobContactAssociations(jobGhlRecordId: string): Promise<void> {
  if (!isGhlConfigured() || !jobGhlRecordId) return;
  const assocId = await getContactJobAssociationId();
  if (!assocId) return;
  try {
    const relRes = await fetch(`${BASE}/associations/relations/record/${jobGhlRecordId}?locationId=${ghlConfig.locationId}`, { headers: h() });
    if (!relRes.ok) return;
    const relData = await relRes.json();
    const relations = relData?.relations || relData?.data || [];
    for (const rel of relations) {
      if (rel.associationId === assocId && rel.id) {
        await fetch(`${BASE}/associations/relations/${rel.id}?locationId=${ghlConfig.locationId}`, { method: 'DELETE', headers: h() });
      }
    }
  } catch (e) { /* silently continue */ }
}
