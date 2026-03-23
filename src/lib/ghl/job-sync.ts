// GHL Job Sync — 2-way sync: Supabase lf_jobs ↔ GHL Custom Object "Job Openings"
// Schema: custom_objects.job_openings
//
// FIELD KEYS & TYPES:
// job_title (text/required), company__employer (text), location (text),
// category (dropdown), job_type (dropdown), work_mode (dropdown),
// salary_range (text), compensation_type (dropdown), department (text),
// job_details (multi-line), requirements (multi-line), benefits (multi-line),
// special_offer (text), closing_date (date), openings_count (number),
// supabase_id (text)
//
// GHL DROPDOWN RULES:
// - Must send as array: ["value"]
// - Values must EXACTLY match the option labels in GHL
// - Empty array [] = no selection (safe to send)
// - GHL dates: must be valid ISO date or omit entirely (NOT empty string)
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

// Map Supabase values to GHL dropdown option labels
// These MUST match exactly what's in GHL Custom Object dropdown options
const CATEGORY_MAP: Record<string, string> = {
  'General': 'General', 'Retail': 'Retail', 'Healthcare': 'Healthcare',
  'Food Service': 'Food Service', 'Maintenance': 'Maintenance', 'Security': 'Security',
  'Education': 'Education', 'Professional Services': 'Professional Services',
  'Technology': 'Technology', 'Construction': 'Construction', 'Management': 'Management',
  'Marketing': 'Marketing', 'Other': 'Other',
};
const JOB_TYPE_MAP: Record<string, string> = {
  'full-time': 'Full-Time', 'part-time': 'Part-Time', 'contract': 'Contract',
  'seasonal': 'Seasonal', 'internship': 'Internship',
};
const WORK_MODE_MAP: Record<string, string> = {
  'on_site': 'On Site', 'remote': 'Remote', 'hybrid': 'Hybrid',
};
const COMP_TYPE_MAP: Record<string, string> = {
  'salary': 'Salary', 'hourly': 'Hourly', 'commission': 'Commission',
  'base_commission': 'Base + Commission', 'other': 'Other',
};

// Reverse maps for GHL → Supabase
function reverseMap(map: Record<string, string>): Record<string, string> {
  const rev: Record<string, string> = {};
  for (const [k, v] of Object.entries(map)) { rev[v] = k; rev[k] = k; }
  return rev;
}
const REV_CATEGORY = reverseMap(CATEGORY_MAP);
const REV_JOB_TYPE = reverseMap(JOB_TYPE_MAP);
const REV_WORK_MODE = reverseMap(WORK_MODE_MAP);
const REV_COMP_TYPE = reverseMap(COMP_TYPE_MAP);

function toDropdown(val: string | null | undefined, map: Record<string, string>): string[] {
  if (!val) return [];
  const mapped = map[val] || map[val.toLowerCase()] || val;
  return [mapped];
}

function fromDropdown(val: any, revMap: Record<string, string>): string {
  const raw = Array.isArray(val) ? (val[0] || '') : String(val || '');
  return revMap[raw] || raw;
}

// Map Supabase job → GHL Custom Object properties
function jobToGhlProperties(job: JobSyncData): Record<string, any> {
  const props: Record<string, any> = {
    job_title: job.title || '',
    company__employer: job.company_name || '',
    location: job.location || 'Lakefront Estates, Okeechobee, FL',
    category: toDropdown(job.category, CATEGORY_MAP),
    job_type: toDropdown(job.job_type, JOB_TYPE_MAP),
    work_mode: toDropdown(job.work_mode, WORK_MODE_MAP),
    salary_range: job.salary_range || '',
    compensation_type: toDropdown(job.compensation_type, COMP_TYPE_MAP),
    department: job.department || '',
    job_details: job.description || '',
    requirements: job.requirements || '',
    benefits: job.benefits || '',
    special_offer: job.special_offer || '',
    openings_count: job.openings_count || 1,
    supabase_id: job.id,
  };

  // Only send closing_date if it has a real value — GHL rejects empty string
  if (job.closing_date) {
    props.closing_date = job.closing_date;
  }

  return props;
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
    category: fromDropdown(props.category, REV_CATEGORY) || 'General',
    job_type: fromDropdown(props.job_type, REV_JOB_TYPE) || 'full-time',
    work_mode: fromDropdown(props.work_mode, REV_WORK_MODE) || 'on_site',
    salary_range: props.salary_range || '',
    compensation_type: fromDropdown(props.compensation_type, REV_COMP_TYPE) || 'salary',
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
