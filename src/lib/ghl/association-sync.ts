// Unified Association Sync — links jobs, employees, and employers in both Supabase and GHL/Kleegr
// Every portal action (apply, hire, create job, edit) syncs associations to both systems
import { ghlConfig, isGhlConfigured } from './config';

const BASE_URL = 'https://services.leadconnectorhq.com';
const JOBS_SCHEMA_KEY = 'custom_objects.job_openings';

function headers() {
  return {
    'Authorization': `Bearer ${ghlConfig.token}`,
    'Content-Type': 'application/json',
    'Version': '2021-07-28',
  };
}

export async function syncApplicationToGhl(app: Record<string, any>, job?: Record<string, any> | null): Promise<{
  contactId: string | null;
  opportunityId: string | null;
  success: boolean;
  error?: string;
}> {
  if (!isGhlConfigured()) return { contactId: null, opportunityId: null, success: false, error: 'Not configured' };

  const nameParts = (app.applicant_name || '').split(' ');
  const appType = app.application_type || 'employee';
  const tags = [`lakefront-${appType}`, 'lakefront-applicant'];
  if (job?.title) tags.push(`job:${job.title.substring(0, 40)}`);
  if (job?.id) tags.push(`job-id:${job.id.substring(0, 8)}`);

  const statusMap: Record<string, string> = {
    submitted: 'New', reviewing: 'Reviewing', interview: 'Interview',
    offered: 'Offered', hired: 'Hired', rejected: 'Rejected', withdrawn: 'Withdrawn',
  };

  const fieldMap = await getFieldIdMap();
  const customFields: Array<{ id: string; field_value: string }> = [];
  const addCF = (key: string, val: string) => { const id = fieldMap[key]; if (id && val) customFields.push({ id, field_value: val }); };
  const contactTypeMap: Record<string, string> = { employee: 'Employee', employer: 'Employer', provider: 'Provider', space_rental: 'Space Applicant' };

  addCF('contact.contact_type', contactTypeMap[appType] || 'Employee');
  addCF('contact.supabase_application_id', app.id || '');
  addCF('contact.employee_app_status', statusMap[app.status] || app.status || 'New');
  if (app.cover_letter) addCF('contact.cover_letter', app.cover_letter);
  if (job?.title) addCF('contact.position_applied_for', job.title);
  if (job?.company_name) addCF('contact.employer_company', job.company_name);
  if (job?.id) addCF('contact.supabase_job_id', job.id);

  const contactData: Record<string, any> = {
    locationId: ghlConfig.locationId,
    firstName: nameParts[0] || '', lastName: nameParts.slice(1).join(' ') || '',
    email: app.applicant_email || '', phone: app.applicant_phone || '',
    address1: app.address || '', source: 'Lakefront Portal', tags, customFields,
  };
  if (appType === 'employer' && app.applicant_name) contactData.companyName = app.applicant_name;

  try {
    let contactId = app.ghl_contact_id || null;
    if (contactId) {
      await fetch(`${BASE_URL}/contacts/${contactId}`, { method: 'PUT', headers: headers(), body: JSON.stringify(contactData) });
    } else {
      const existing = await findContactByEmail(app.applicant_email);
      if (existing) {
        contactId = existing;
        await fetch(`${BASE_URL}/contacts/${contactId}`, { method: 'PUT', headers: headers(), body: JSON.stringify(contactData) });
      } else {
        const res = await fetch(`${BASE_URL}/contacts/`, { method: 'POST', headers: headers(), body: JSON.stringify(contactData) });
        const data = await res.json();
        contactId = data?.contact?.id || null;
      }
    }

    let opportunityId = app.ghl_opportunity_id || null;
    if (contactId && job?.id) {
      const pipelineId = appType === 'employer' ? ghlConfig.pipelines.businessIntake
        : appType === 'provider' ? ghlConfig.pipelines.provider
        : appType === 'space_rental' ? ghlConfig.pipelines.spaceAllocation
        : ghlConfig.pipelines.ats;
      if (pipelineId) {
        const oppName = `${app.applicant_name || 'Applicant'} \u2192 ${job.title || 'Job'}`;
        const oppStatus = ['hired', 'offered'].includes(app.status) ? 'won' : app.status === 'rejected' ? 'lost' : 'open';
        const oppCustomFields: Array<{ id: string; field_value: string }> = [];
        addOppCF(fieldMap, oppCustomFields, 'contact.supabase_job_id', job.id);
        addOppCF(fieldMap, oppCustomFields, 'contact.position_applied_for', job.title || '');
        if (opportunityId) {
          await fetch(`${BASE_URL}/opportunities/${opportunityId}`, { method: 'PUT', headers: headers(), body: JSON.stringify({ status: oppStatus, name: oppName }) });
        } else {
          const oppRes = await fetch(`${BASE_URL}/opportunities/`, { method: 'POST', headers: headers(), body: JSON.stringify({ locationId: ghlConfig.locationId, pipelineId, name: oppName, contactId, status: oppStatus, customFields: oppCustomFields }) });
          const oppJson = await oppRes.json();
          opportunityId = oppJson?.opportunity?.id || null;
        }
      }
      if (contactId && job.ghl_record_id) {
        try { await fetch(`${BASE_URL}/objects/${JOBS_SCHEMA_KEY}/records/${job.ghl_record_id}/associations`, { method: 'POST', headers: headers(), body: JSON.stringify({ locationId: ghlConfig.locationId, associations: [{ objectKey: 'contact', recordId: contactId }] }) }); } catch { /* best effort */ }
      }
    }
    return { contactId, opportunityId, success: true };
  } catch (err: any) {
    return { contactId: null, opportunityId: null, success: false, error: err?.message || String(err) };
  }
}

export async function syncJobAssociationsToGhl(job: Record<string, any>, employer?: Record<string, any> | null): Promise<{ success: boolean; error?: string }> {
  if (!isGhlConfigured() || !job.ghl_record_id) return { success: false, error: 'Not configured or no GHL record' };
  const associations: Array<{ objectKey: string; recordId: string }> = [];
  if (employer?.kleegr_contact_id) associations.push({ objectKey: 'contact', recordId: employer.kleegr_contact_id });
  if (associations.length === 0) return { success: true };
  try {
    await fetch(`${BASE_URL}/objects/${JOBS_SCHEMA_KEY}/records/${job.ghl_record_id}/associations`, { method: 'POST', headers: headers(), body: JSON.stringify({ locationId: ghlConfig.locationId, associations }) });
    return { success: true };
  } catch (err: any) { return { success: false, error: err?.message || String(err) }; }
}

export async function syncHireEventToGhl(app: Record<string, any>, job: Record<string, any>, employer?: Record<string, any> | null): Promise<{ success: boolean }> {
  if (!isGhlConfigured()) return { success: false };
  try {
    if (app.ghl_contact_id) {
      const fieldMap = await getFieldIdMap();
      const customFields: Array<{ id: string; field_value: string }> = [];
      const addCF = (key: string, val: string) => { const id = fieldMap[key]; if (id && val) customFields.push({ id, field_value: val }); };
      addCF('contact.employee_app_status', 'Hired');
      addCF('contact.position_applied_for', job.title || '');
      if (job.company_name) addCF('contact.employer_company', job.company_name);
      await fetch(`${BASE_URL}/contacts/${app.ghl_contact_id}`, { method: 'PUT', headers: headers(), body: JSON.stringify({ tags: [`hired:${job.title?.substring(0, 30)}`, 'lakefront-hired'], customFields }) });
    }
    if (app.ghl_opportunity_id) {
      await fetch(`${BASE_URL}/opportunities/${app.ghl_opportunity_id}`, { method: 'PUT', headers: headers(), body: JSON.stringify({ status: 'won' }) });
    }
    if (app.ghl_contact_id && job.ghl_record_id) {
      try { await fetch(`${BASE_URL}/objects/${JOBS_SCHEMA_KEY}/records/${job.ghl_record_id}/associations`, { method: 'POST', headers: headers(), body: JSON.stringify({ locationId: ghlConfig.locationId, associations: [{ objectKey: 'contact', recordId: app.ghl_contact_id }] }) }); } catch { }
    }
    if (employer?.kleegr_contact_id && job.ghl_record_id) {
      try { await fetch(`${BASE_URL}/objects/${JOBS_SCHEMA_KEY}/records/${job.ghl_record_id}/associations`, { method: 'POST', headers: headers(), body: JSON.stringify({ locationId: ghlConfig.locationId, associations: [{ objectKey: 'contact', recordId: employer.kleegr_contact_id }] }) }); } catch { }
    }
    return { success: true };
  } catch { return { success: false }; }
}

let _fieldIdMap: Record<string, string> | null = null;
async function getFieldIdMap(): Promise<Record<string, string>> {
  if (_fieldIdMap) return _fieldIdMap;
  if (!isGhlConfigured()) return {};
  try {
    const res = await fetch(`${BASE_URL}/locations/${ghlConfig.locationId}/customFields`, { headers: { 'Authorization': `Bearer ${ghlConfig.token}`, 'Version': '2021-07-28' } });
    const data = await res.json();
    const map: Record<string, string> = {};
    for (const f of (data.customFields || [])) map[f.fieldKey] = f.id;
    _fieldIdMap = map;
    return map;
  } catch { return {}; }
}
function addOppCF(map: Record<string, string>, arr: Array<{ id: string; field_value: string }>, key: string, val: string) { const id = map[key]; if (id && val) arr.push({ id, field_value: val }); }
async function findContactByEmail(email: string): Promise<string | null> {
  if (!email || !isGhlConfigured()) return null;
  try {
    const res = await fetch(`${BASE_URL}/contacts/search/duplicate`, { method: 'POST', headers: headers(), body: JSON.stringify({ locationId: ghlConfig.locationId, email }) });
    const data = await res.json();
    return data?.contact?.id || null;
  } catch { return null; }
}
