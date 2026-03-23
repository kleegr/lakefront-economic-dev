// GHL Job Sync — powered by job-fields-config.ts
// All field mappings, dropdown conversions, etc. come from the single config.
import { ghlConfig, isGhlConfigured } from './config';
import { jobToGhlProperties as configToGhl, ghlPropertiesToJob as configFromGhl } from './job-fields-config';

const SCHEMA_KEY = 'custom_objects.job_openings';
const BASE_URL = 'https://services.leadconnectorhq.com';

function getHeaders() {
  return {
    'Authorization': `Bearer ${ghlConfig.token}`,
    'Content-Type': 'application/json',
    'Version': '2021-07-28',
  };
}

// Re-export the config-driven mapping for use by webhook/sync routes
export function ghlPropertiesToJob(props: Record<string, any>) {
  return configFromGhl(props);
}

// Create a new Job Opening record in GHL
export async function createGhlJobRecord(job: Record<string, any>): Promise<{ recordId: string | null; success: boolean; error?: string }> {
  if (!isGhlConfigured()) return { recordId: null, success: false, error: 'GHL not configured' };
  try {
    const res = await fetch(`${BASE_URL}/objects/${SCHEMA_KEY}/records`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        locationId: ghlConfig.locationId,
        properties: configToGhl(job),
      }),
    });
    const data = await res.json();
    if (!res.ok) return { recordId: null, success: false, error: JSON.stringify(data?.message || data) };
    return { recordId: data?.record?.id || null, success: true };
  } catch (err: any) {
    return { recordId: null, success: false, error: err?.message || String(err) };
  }
}

// Update an existing Job Opening record in GHL
export async function updateGhlJobRecord(recordId: string, job: Record<string, any>): Promise<{ success: boolean; error?: string }> {
  if (!isGhlConfigured()) return { success: false, error: 'GHL not configured' };
  try {
    const res = await fetch(`${BASE_URL}/objects/${SCHEMA_KEY}/records/${recordId}?locationId=${ghlConfig.locationId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        properties: configToGhl(job),
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return { success: false, error: JSON.stringify(data?.message || data) };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

// Sync a job to GHL — creates or updates
export async function syncJobToGhl(job: Record<string, any>, existingGhlId?: string | null): Promise<{ ghlRecordId: string | null; success: boolean; error?: string }> {
  if (!isGhlConfigured()) return { ghlRecordId: null, success: false, error: 'GHL not configured' };

  if (existingGhlId) {
    const result = await updateGhlJobRecord(existingGhlId, job);
    return { ghlRecordId: existingGhlId, ...result };
  } else {
    const result = await createGhlJobRecord(job);
    return { ghlRecordId: result.recordId, success: result.success, error: result.error };
  }
}

// Fetch all Job Opening records from GHL
export async function fetchAllGhlJobs(): Promise<Array<{ id: string; properties: any }>> {
  if (!isGhlConfigured()) return [];
  try {
    const res = await fetch(`${BASE_URL}/objects/${SCHEMA_KEY}/records/search`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ locationId: ghlConfig.locationId, page: 1, pageLimit: 100 }),
    });
    const data = await res.json();
    return (data?.records || []).map((r: any) => ({ id: r.id, properties: r.properties }));
  } catch {
    return [];
  }
}
