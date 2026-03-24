// Kleegr Job Sync - reads field config from Supabase lf_job_fields_config
import { ghlConfig, isGhlConfigured } from './config';

const SCHEMA_KEY = 'custom_objects.job_openings';
const BASE_URL = 'https://services.leadconnectorhq.com';
function getHeaders() { return { 'Authorization': `Bearer ${ghlConfig.token}`, 'Content-Type': 'application/json', 'Version': '2021-07-28' }; }

interface FieldConfig { key: string; ghl_key: string; field_type: string; options: Array<{ value: string; ghlLabel: string }>; }

export function jobToGhlProperties(job: Record<string, any>, fields: FieldConfig[]): Record<string, any> {
  const props: Record<string, any> = {};
  for (const f of fields) {
    if (!f.ghl_key) continue; const val = job[f.key];
    if (f.field_type === 'dropdown' && f.options?.length) { const opt = f.options.find(o => o.value === val); if (opt) props[f.ghl_key] = opt.ghlLabel; else if (val) props[f.ghl_key] = String(val); else props[f.ghl_key] = ''; }
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

export async function createGhlJobRecord(job: Record<string, any>, fields: FieldConfig[]): Promise<{ recordId: string | null; success: boolean; error?: string }> {
  if (!isGhlConfigured()) return { recordId: null, success: false, error: 'Kleegr not configured' };
  try { const res = await fetch(`${BASE_URL}/objects/${SCHEMA_KEY}/records`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ locationId: ghlConfig.locationId, properties: jobToGhlProperties(job, fields) }) }); const data = await res.json(); if (!res.ok) return { recordId: null, success: false, error: JSON.stringify(data?.message || data) }; return { recordId: data?.record?.id || null, success: true }; }
  catch (err: any) { return { recordId: null, success: false, error: err?.message || String(err) }; }
}

export async function updateGhlJobRecord(recordId: string, job: Record<string, any>, fields: FieldConfig[]): Promise<{ success: boolean; error?: string }> {
  if (!isGhlConfigured()) return { success: false, error: 'Kleegr not configured' };
  try { const res = await fetch(`${BASE_URL}/objects/${SCHEMA_KEY}/records/${recordId}?locationId=${ghlConfig.locationId}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify({ properties: jobToGhlProperties(job, fields) }) });
    if (!res.ok) { const data = await res.json().catch(() => null); const errMsg = JSON.stringify(data?.message || data); if (res.status === 404 || errMsg.includes('was not found')) return { success: false, error: `Record ${recordId} not found in Kleegr - needs re-creation` }; return { success: false, error: errMsg }; }
    return { success: true };
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
