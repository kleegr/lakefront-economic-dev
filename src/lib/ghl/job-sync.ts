// GHL Job Sync — 2-way sync between Supabase lf_jobs and GHL Custom Object "Job Openings"
// Schema key: custom_objects.job_openings
//
// EXISTING GHL FIELDS (18 declared — can ONLY write to these):
// job_title, job_code, department_category, employment_type, work_mode,
// job_location, pay_min, pay_max, job_description, required_skills,
// positions_available, positions_filled, opening_status,
// resident_targeted_flag, date_posted, employer_name_snapshot,
// company_name_display, internal_notes_summary
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

// Map portal job → GHL properties (ONLY the 18 declared fields)
function jobToGhlProperties(job: JobSyncData): Record<string, any> {
  // Pack extra fields into internal_notes_summary as structured text
  const notesParts = [
    `[supabase_id:${job.id}]`,
    job.benefits ? `[benefits:${job.benefits}]` : '',
    job.special_offer ? `[special_offer:${job.special_offer}]` : '',
    job.compensation_type ? `[compensation_type:${job.compensation_type}]` : '',
    job.closing_date ? `[closing_date:${job.closing_date}]` : '',
    job.visibility ? `[visibility:${job.visibility}]` : '',
    job.department ? `[department:${job.department}]` : '',
    job.salary_range ? `[salary_range:${job.salary_range}]` : '',
  ].filter(Boolean).join('\n');

  return {
    job_title: job.title || '',
    company_name_display: job.company_name || '',
    employer_name_snapshot: job.company_name || '',
    job_location: job.location || 'Lakefront Estates, Okeechobee, FL',
    work_mode: job.work_mode || 'on_site',
    job_description: job.description || '',
    required_skills: job.requirements || '',
    positions_available: job.openings_count || 1,
    positions_filled: job.application_count || 0,
    date_posted: job.posted_date || '',
    job_code: job.category || 'General',
    internal_notes_summary: notesParts,
  };
}

// Parse a [key:value] tag from notes
function parseTag(notes: string, key: string): string {
  const match = notes.match(new RegExp(`\\[${key}:([^\\]]*?)\\]`));
  return match ? match[1] : '';
}

// Map GHL properties → Supabase job data
export function ghlPropertiesToJob(props: Record<string, any>): Partial<JobSyncData> {
  const notes = props.internal_notes_summary || '';
  return {
    id: parseTag(notes, 'supabase_id'),
    title: props.job_title || '',
    company_name: props.company_name_display || props.employer_name_snapshot || '',
    location: props.job_location || '',
    description: props.job_description || '',
    requirements: props.required_skills || '',
    category: props.job_code || 'General',
    work_mode: props.work_mode || 'on_site',
    benefits: parseTag(notes, 'benefits') || '',
    special_offer: parseTag(notes, 'special_offer') || '',
    compensation_type: parseTag(notes, 'compensation_type') || 'salary',
    closing_date: parseTag(notes, 'closing_date') || undefined,
    visibility: parseTag(notes, 'visibility') || 'public',
    department: parseTag(notes, 'department') || '',
    salary_range: parseTag(notes, 'salary_range') || '',
    openings_count: props.positions_available || 1,
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
    if (!res.ok) return { recordId: null, success: false, error: JSON.stringify(data?.message || data) };
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
