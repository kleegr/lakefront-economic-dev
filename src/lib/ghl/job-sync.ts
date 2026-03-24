// Kleegr Job Sync - reads field config from Supabase lf_job_fields_config
import { ghlConfig, isGhlConfigured } from './config';

const SCHEMA_KEY = 'custom_objects.job_openings';
const BASE_URL = 'https://services.leadconnectorhq.com';
function getHeaders() { return { 'Authorization': `Bearer ${ghlConfig.token}`, 'Content-Type': 'application/json', 'Version': '2021-07-28' }; }

interface FieldConfig { key: string; ghl_key: string; field_type: string; options: Array<{ value: string; ghlLabel: string }>; }

// Convert Supabase job -> Kleegr properties
// GHL custom objects can be finicky about dropdown format:
//   Some fields want arrays ["value"], some want strings "value"
// We try string format first (more compatible), fall back to array on retry
export function jobToGhlProperties(job: Record<string, any>, fields: FieldConfig[], useArrayForDropdowns: boolean = false): Record<string, any> {
  const props: Record<string, any> = {};
  for (const f of fields) {
    if (!f.ghl_key) continue; const val = job[f.key];
    if (f.field_type === 'dropdown' && f.options?.length) {
      const opt = f.options.find(o => o.value === val);
      const label = opt ? opt.ghlLabel : (val ? String(val) : '');
      if (useArrayForDropdowns) {
        props[f.ghl_key] = label ? [label] : [];
      } else {
        props[f.ghl_key] = label;
      }
    }
    else if (f.field_type === 'date') { if (val) props[f.ghl_key] = val; }
    else if (f.field_type === 'number') { props[f.ghl_key] = val || 0; }
    else { props[f.ghl_key] = val || ''; }
  }
  return props;
}

export function ghlPropertiesToJob(props: Record<string, any>, fields: FieldConfig[]): Record<string, any> {
  const job: Record<string, any> = {};
  for (const f of fields) { if (!f.ghl_key) continue; const val = props[f.ghl_key];
    if (f.field_type === 'dropdown' && f.options?.length) { const raw = Array.isArray(val) ? val[0] : val; const opt = f.options.find(o => o.ghlLabel === raw || o.value === raw); job[f.key] = opt?.value || raw || ''; }
    else if (f.field_type === 'number') { job[f.key] = val || 0; }
    else { job[f.key] = val || ''; }
  }
  return job;
}

// Try to create/update with string dropdowns first, retry with array if it fails
async function tryWithBothFormats(
  url: string, method: string, job: Record<string, any>, fields: FieldConfig[], extraBody?: Record<string, any>
): Promise<{ success: boolean; data?: any; error?: string }> {
  // First attempt: string format for dropdowns
  const body1: Record<string, any> = { ...extraBody, properties: jobToGhlProperties(job, fields, false) };
  const res1 = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(body1) });
  if (res1.ok) { const data = await res1.json(); return { success: true, data }; }

  const err1 = await res1.json().catch(() => null);
  const errMsg1 = JSON.stringify(err1?.message || err1 || '');

  // If "must be a list" or "unexpected format" on dropdown, retry with array format
  if (errMsg1.includes('list of values') || errMsg1.includes('unexpected format')) {
    const body2: Record<string, any> = { ...extraBody, properties: jobToGhlProperties(job, fields, true) };
    const res2 = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(body2) });
    if (res2.ok) { const data = await res2.json(); return { success: true, data }; }
    const err2 = await res2.json().catch(() => null);
    return { success: false, error: JSON.stringify(err2?.message || err2) };
  }

  return { success: false, error: errMsg1 };
}

export async function createGhlJobRecord(job: Record<string, any>, fields: FieldConfig[]): Promise<{ recordId: string | null; success: boolean; error?: string }> {
  if (!isGhlConfigured()) return { recordId: null, success: false, error: 'Kleegr not configured' };
  try {
    const result = await tryWithBothFormats(
      `${BASE_URL}/objects/${SCHEMA_KEY}/records`, 'POST', job, fields,
      { locationId: ghlConfig.locationId }
    );
    if (result.success) return { recordId: result.data?.record?.id || null, success: true };
    return { recordId: null, success: false, error: result.error };
  } catch (err: any) { return { recordId: null, success: false, error: err?.message || String(err) }; }
}

export async function updateGhlJobRecord(recordId: string, job: Record<string, any>, fields: FieldConfig[]): Promise<{ success: boolean; error?: string }> {
  if (!isGhlConfigured()) return { success: false, error: 'Kleegr not configured' };
  try {
    const result = await tryWithBothFormats(
      `${BASE_URL}/objects/${SCHEMA_KEY}/records/${recordId}?locationId=${ghlConfig.locationId}`, 'PUT', job, fields
    );
    if (result.success) return { success: true };
    if (result.error?.includes('was not found')) return { success: false, error: `Record ${recordId} not found in Kleegr - needs re-creation` };
    return { success: false, error: result.error };
  } catch (err: any) { return { success: false, error: err?.message || String(err) }; }
}

export async function syncJobToGhl(job: Record<string, any>, fields: FieldConfig[], existingGhlId?: string | null): Promise<{ ghlRecordId: string | null; success: boolean; error?: string }> {
  if (!isGhlConfigured()) return { ghlRecordId: null, success: false, error: 'Kleegr not configured' };
  if (existingGhlId) { const result = await updateGhlJobRecord(existingGhlId, job, fields); if (result.success) return { ghlRecordId: existingGhlId, success: true };
    if (result.error?.includes('not found') || result.error?.includes('was not found')) { console.log(`Kleegr record ${existingGhlId} not found, creating new record for "${job.title}"`); const cr = await createGhlJobRecord(job, fields); return { ghlRecordId: cr.recordId, success: cr.success, error: cr.error }; }
    return { ghlRecordId: existingGhlId, ...result };
  } else { const result = await createGhlJobRecord(job, fields); return { ghlRecordId: result.recordId, success: result.success, error: result.error }; }
}

export async function fetchAllGhlJobs(): Promise<Array<{ id: string; properties: any }>> {
  if (!isGhlConfigured()) return [];
  try { const res = await fetch(`${BASE_URL}/objects/${SCHEMA_KEY}/records/search`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ locationId: ghlConfig.locationId, page: 1, pageLimit: 100 }) }); const data = await res.json(); return (data?.records || []).map((r: any) => ({ id: r.id, properties: r.properties })); }
  catch { return []; }
}
