// GHL Job Sync Service — 2-way sync between Supabase lf_jobs and GHL Companies
// Jobs are stored as GHL Companies with 'Job:' prefix and custom fields
import { ghl } from './client';
import { ghlConfig, isGhlConfigured } from './config';

// Field key map — these are the GHL custom field IDs we provisioned
// We use the Co: prefixed contact fields since GHL company custom fields
// map to contact model. For jobs we'll use company name + tags.
const JOB_TAG = 'lakefront-job';

export interface JobSyncData {
  id: string; // Supabase ID
  title: string;
  company_name?: string;
  location?: string;
  job_type?: string;
  salary_range?: string;
  category?: string;
  work_mode?: string;
  compensation_type?: string;
  department?: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  status?: string;
  visibility?: string;
  closing_date?: string;
  special_offer?: string;
  openings_count?: number;
}

/**
 * Sync a job from Supabase → GHL Company
 * Creates or updates a GHL Company record representing this job
 */
export async function syncJobToGhl(job: JobSyncData): Promise<{ ghlCompanyId: string | null; success: boolean; error?: string }> {
  if (!isGhlConfigured()) return { ghlCompanyId: null, success: false, error: 'GHL not configured' };

  try {
    // Build company name: "Job: {title} — {company}" to make it identifiable in GHL
    const companyName = `Job: ${job.title}${job.company_name ? ` — ${job.company_name}` : ''}`;

    // Build description with all job data for GHL
    const descriptionParts = [
      job.description || '',
      '',
      '--- Job Details ---',
      `Category: ${job.category || 'General'}`,
      `Type: ${job.job_type || 'full-time'}`,
      `Work Mode: ${job.work_mode || 'on_site'}`,
      `Compensation: ${job.salary_range || 'Competitive'} (${job.compensation_type || 'salary'})`,
      `Department: ${job.department || 'N/A'}`,
      `Status: ${job.status || 'draft'}`,
      `Visibility: ${job.visibility || 'public'}`,
      `Openings: ${job.openings_count || 1}`,
      job.closing_date ? `Closing: ${job.closing_date}` : '',
      job.special_offer ? `Special Offer: ${job.special_offer}` : '',
      '',
      job.requirements ? `Requirements: ${job.requirements}` : '',
      job.benefits ? `Benefits: ${job.benefits}` : '',
      '',
      `[Supabase ID: ${job.id}]`,
    ].filter(Boolean).join('\n');

    // Check if company already exists by searching
    let ghlCompanyId: string | null = null;
    try {
      const existing = await ghl.getCompanies({ search: `Job: ${job.title}` });
      const companies = existing?.companies || [];
      const match = companies.find((c: any) =>
        c.name === companyName || c.tags?.includes(JOB_TAG)
      );
      if (match) ghlCompanyId = match.id;
    } catch { /* search failed, will create new */ }

    const companyData: Record<string, any> = {
      name: companyName,
      description: descriptionParts,
      website: job.status === 'published' ? `https://lakefront-economic-dev.vercel.app/jobs/${job.id}` : '',
      tags: [JOB_TAG, job.category || 'General', job.status || 'draft'],
    };

    if (ghlCompanyId) {
      // Update existing
      await ghl.updateCompany(ghlCompanyId, companyData);
    } else {
      // Create new
      const result = await ghl.createCompany(companyData);
      ghlCompanyId = result?.company?.id || null;
    }

    return { ghlCompanyId, success: true };
  } catch (err: any) {
    console.error('syncJobToGhl failed:', err);
    return { ghlCompanyId: null, success: false, error: err?.message || String(err) };
  }
}

/**
 * Parse a GHL Company back into Supabase job data
 * Used for GHL → Supabase sync
 */
export function parseGhlCompanyToJob(company: any): Partial<JobSyncData> | null {
  if (!company?.name?.startsWith('Job: ')) return null;
  if (!company.tags?.includes(JOB_TAG)) return null;

  const desc = company.description || '';
  const getField = (label: string): string => {
    const match = desc.match(new RegExp(`${label}: (.+)`));
    return match ? match[1].trim() : '';
  };

  // Extract title from company name: "Job: Title — Company"
  const nameParts = company.name.replace('Job: ', '').split(' — ');
  const title = nameParts[0] || '';
  const companyName = nameParts[1] || '';

  // Extract Supabase ID
  const idMatch = desc.match(/\[Supabase ID: ([a-f0-9-]+)\]/);

  return {
    id: idMatch ? idMatch[1] : '',
    title,
    company_name: companyName,
    category: getField('Category') || 'General',
    job_type: getField('Type') || 'full-time',
    work_mode: getField('Work Mode') || 'on_site',
    salary_range: getField('Compensation')?.split(' (')[0] || '',
    compensation_type: getField('Compensation')?.match(/\((.+)\)/)?.[1] || 'salary',
    department: getField('Department') !== 'N/A' ? getField('Department') : '',
    status: getField('Status') || 'draft',
    visibility: getField('Visibility') || 'public',
    closing_date: getField('Closing') || undefined,
    special_offer: getField('Special Offer') || '',
    description: desc.split('--- Job Details ---')[0]?.trim() || '',
    requirements: getField('Requirements') || '',
    benefits: getField('Benefits') || '',
  };
}

/**
 * Fetch all job companies from GHL
 */
export async function fetchJobsFromGhl(): Promise<any[]> {
  if (!isGhlConfigured()) return [];
  try {
    const result = await ghl.getCompanies({ search: 'Job:' });
    const companies = result?.companies || [];
    return companies.filter((c: any) => c.tags?.includes(JOB_TAG));
  } catch {
    return [];
  }
}
