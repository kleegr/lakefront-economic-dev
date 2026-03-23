// GHL Job Sync — 2-way sync between Supabase lf_jobs and GHL Custom Object "Job Openings"
// Schema key: custom_objects.job_openings
// Records API: POST /objects/custom_objects.job_openings/records/search
//              POST /objects/custom_objects.job_openings/records
//              PUT  /objects/custom_objects.job_openings/records/{id}
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

// Map Supabase job → GHL Custom Object properties
// Uses the same property keys that exist on the COO record
function jobToGhlProperties(job: JobSyncData): Record<string, any> {
  return {
    job_title: job.title || '',
    company_name_display: job.company_name || '',
    employer_name_snapshot: job.company_name || '',
    job_location: job.location || 'Lakefront Estates, Okeechobee, FL',
    job_description: job.description || '',
    required_skills: job.requirements || '',
    // Fields that match portal
    category: job.category || 'General',
    job_type: job.job_type || 'full-time',
    work_mode: job.work_mode || 'on_site',
    salary_range: job.salary_range || '',
    compensation_type: job.compensation_type || 'salary',
    department: job.department || '',
    benefits: job.benefits || '',
    special_offer: job.special_offer || '',
    status: job.status || 'draft',
    visibility: job.visibility || 'public',
    closing_date: job.closing_date || '',
    openings_count: job.openings_count || 1,
    positions_available: job.openings_count || 1,
    positions_filled: job.application_count || 0,
    date_posted: job.posted_date || '',
    supabase_id: job.id,
  };
}

// Map GHL Custom Object properties → Supabase job data
export function ghlPropertiesToJob(props: Record<string, any>): Partial<JobSyncData> {
  return {
    id: props.supabase_id || '',
    title: props.job_title || '',
    company_name: props.company_name_display || props.employer_name_snapshot || '',
    location: props.job_location || '',
    description: props.job_description || '',
    requirements: props.required_skills || '',
    category: props.category || 'General',
    job_type: props.job_type || 'full-time',
    work_mode: props.work_mode || 'on_site',
    salary_range: props.salary_range || '',
    compensation_type: props.compensation_type || 'salary',
    department: props.department || '',
    benefits: props.benefits || '',
    special_offer: props.special_offer || '',
    status: props.status || 'draft',
    visibility: props.visibility || 'public',
    closing_date: props.closing_date || undefined,
    openings_count: props.openings_count || props.positions_available || 1,
  };
}

// Create a new Job Opening record in GHL
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
    if (!res.ok) return { recordId: null, success: false, error: data?.message || `HTTP ${res.status}` };
    return { recordId: data?.record?.id || null, success: true };
  } catch (err: any) {
    return { recordId: null, success: false, error: err?.message || String(err) };
  }
}

// Update an existing Job Opening record in GHL
export async function updateGhlJobRecord(recordId: string, job: JobSyncData): Promise<{ success: boolean; error?: string }> {
  if (!isGhlConfigured()) return { success: false, error: 'GHL not configured' };
  try {
    const res = await fetch(`${BASE_URL}/objects/${SCHEMA_KEY}/records/${recordId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        locationId: ghlConfig.locationId,
        properties: jobToGhlProperties(job),
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return { success: false, error: data?.message || `HTTP ${res.status}` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

// Sync a job to GHL — creates or updates based on ghl_record_id
export async function syncJobToGhl(job: JobSyncData, existingGhlId?: string | null): Promise<{ ghlRecordId: string | null; success: boolean; error?: string }> {
  if (!isGhlConfigured()) return { ghlRecordId: null, success: false, error: 'GHL not configured' };

  if (existingGhlId) {
    // Update existing record
    const result = await updateGhlJobRecord(existingGhlId, job);
    return { ghlRecordId: existingGhlId, ...result };
  } else {
    // Try to find by supabase_id first
    const existing = await findGhlJobBySupabaseId(job.id);
    if (existing) {
      const result = await updateGhlJobRecord(existing.id, job);
      return { ghlRecordId: existing.id, ...result };
    }
    // Create new
    const result = await createGhlJobRecord(job);
    return { ghlRecordId: result.recordId, success: result.success, error: result.error };
  }
}

// Search for a GHL Job Opening by supabase_id
async function findGhlJobBySupabaseId(supabaseId: string): Promise<{ id: string; properties: any } | null> {
  if (!isGhlConfigured()) return null;
  try {
    const res = await fetch(`${BASE_URL}/objects/${SCHEMA_KEY}/records/search`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        locationId: ghlConfig.locationId,
        page: 1,
        pageLimit: 20,
        filters: [{ field: `${SCHEMA_KEY}.supabase_id`, operator: 'eq', value: supabaseId }],
      }),
    });
    const data = await res.json();
    const records = data?.records || [];
    return records.length > 0 ? { id: records[0].id, properties: records[0].properties } : null;
  } catch {
    return null;
  }
}

// Fetch all Job Opening records from GHL
export async function fetchAllGhlJobs(): Promise<Array<{ id: string; properties: any }>> {
  if (!isGhlConfigured()) return [];
  try {
    const res = await fetch(`${BASE_URL}/objects/${SCHEMA_KEY}/records/search`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        locationId: ghlConfig.locationId,
        page: 1,
        pageLimit: 100,
      }),
    });
    const data = await res.json();
    return (data?.records || []).map((r: any) => ({ id: r.id, properties: r.properties }));
  } catch {
    return [];
  }
}
