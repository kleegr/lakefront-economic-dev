// GHL Job Sync — 2-way sync: Supabase lf_jobs ↔ GHL Custom Object "Job Openings"
// Schema: custom_objects.job_openings
//
// FIELD KEYS & TYPES:
// job_title (text), company__employer (text), location (text),
// category (dropdown→array), job_type (dropdown→array), work_mode (dropdown→array),
// salary_range (text), compensation_type (dropdown→array), department (text),
// job_details (multi-line text), requirements (multi-line text),
// benefits (multi-line text), special_offer (text),
// closing_date (date string), openings_count (number), supabase_id (text)
import { ghlConfig, isGhlConfigured } from './config';

const SCHEMA_KEY = 'custom_objects.job_openings';
const BASE_URL = 'https://services.leadconnectorhq.com';

function getHeaders() {
  return {
    'Authorization': `Bearer ${ghlConfig.token}`,
    'Content-Type': 'application/json',
    'Version': '2021-07-28',
  };
}

export interface JobSyncData {
  id: string;
  title: string;
  company_name?: string | null;
  location?: string | null;
  job_type?: string | null;
  salary_range?: string | null;
  category?: string | null;
  work_mode?: string | null;
  compensation_type?: string | null;
  department?: string | null;
  description?: string | null;
  requirements?: string | null;
  benefits?: string | null;
  status?: string | null;
  visibility?: string | null;
  closing_date?: string | null;
  special_offer?: string | null;
  openings_count?: number | null;
  posted_date?: string | null;
  application_count?: number | null;
}

// Wrap value in array for GHL dropdown fields
function toDropdown(val: string | null | undefined): string[] {
  return val ? [val] : [];
}

// Extract first value from GHL dropdown array
function fromDropdown(val: any): string {
  if (Array.isArray(val)) return val[0] || '';
  return String(val || '');
}

// Map Supabase job → GHL Custom Object properties
function jobToGhlProperties(job: JobSyncData): Record<string, any> {
  return {
    job_title: job.title || '',
    company__employer: job.company_name || '',
    location: job.location || 'Lakefront Estates, Okeechobee, FL',
    category: toDropdown(job.category || 'General'),
    job_type: toDropdown(job.job_type || 'full-time'),
    work_mode: toDropdown(job.work_mode || 'on_site'),
    salary_range: job.salary_range || '',
    compensation_type: toDropdown(job.compensation_type || 'salary'),
    department: job.department || '',
    job_details: job.description || '',
    requirements: job.requirements || '',
    benefits: job.benefits || '',
    special_offer: job.special_offer || '',
    closing_date: job.closing_date || '',
    openings_count: job.openings_count || 1,
    supabase_id: job.id,
  };
}

// Map GHL properties → Supabase job
export function ghlPropertiesToJob(props: Record<string, any>): Partial<JobSyncData> {
  return {
    id: props.supabase_id || '',
    title: props.job_title || '',
    company_name: props.company__employer || '',
    location: props.location || '',
    description: props.job_details || '',
    requirements: props.requirements || '',
    category: fromDropdown(props.category) || 'General',
    job_type: fromDropdown(props.job_type) || 'full-time',
    work_mode: fromDropdown(props.work_mode) || 'on_site',
    salary_range: props.salary_range || '',
    compensation_type: fromDropdown(props.compensation_type) || 'salary',
    department: props.department || '',
    benefits: props.benefits || '',
    special_offer: props.special_offer || '',
    closing_date: props.closing_date || undefined,
    openings_count: props.openings_count || 1,
  };
}

// Create a new Job Opening record
export async function createGhlJobRecord(job: JobSyncData): Promise<{ recordId: string | null; success: boolean; error?: string }> {
  if (!isGhlConfigured()) return { recordId: null, success: false, error: 'GHL not configured' };
  try {
    const res = await fetch(`${BASE_URL}/objects/${SCHEMA_KEY}/records`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        locationId: ghlConfig.locationId,
        properties: jobToGhlProperties(job),
      }),
    });
    const data = await res.json();
    if (!res.ok) return { recordId: null, success: false, error: JSON.stringify(data?.message || data) };
    return { recordId: data?.record?.id || null, success: true };
  } catch (err: any) {
    return { recordId: null, success: false, error: err?.message || String(err) };
  }
}

// Update an existing Job Opening record
export async function updateGhlJobRecord(recordId: string, job: JobSyncData): Promise<{ success: boolean; error?: string }> {
  if (!isGhlConfigured()) return { success: false, error: 'GHL not configured' };
  try {
    const res = await fetch(`${BASE_URL}/objects/${SCHEMA_KEY}/records/${recordId}?locationId=${ghlConfig.locationId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        properties: jobToGhlProperties(job),
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
export async function syncJobToGhl(job: JobSyncData, existingGhlId?: string | null): Promise<{ ghlRecordId: string | null; success: boolean; error?: string }> {
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
