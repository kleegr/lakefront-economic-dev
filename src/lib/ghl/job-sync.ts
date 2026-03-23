// GHL Job Sync Service — 2-way sync between Supabase lf_jobs and GHL Companies
import { ghl } from './client';
import { ghlConfig, isGhlConfigured } from './config';

const JOB_TAG = 'lakefront-job';

export interface JobSyncData {
  id: string;
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
  ghl_record_id?: string;
}

/**
 * Sync a job from Supabase → GHL Contact (with Job: prefix)
 * We use Contacts instead of Companies because GHL's Companies API
 * has limited search/create support via the private integration token.
 * Each job becomes a Contact with type "job_posting" and all details in custom fields.
 */
export async function syncJobToGhl(job: JobSyncData): Promise<{ ghlCompanyId: string | null; success: boolean; error?: string }> {
  if (!isGhlConfigured()) return { ghlCompanyId: null, success: false, error: 'GHL not configured' };

  try {
    const contactName = `Job: ${job.title}`;
    const companyField = job.company_name || 'Lakefront Estates';

    // Build a notes field with all job details
    const notesParts = [
      job.description || '',
      '',
      '--- Job Details ---',
      `Category: ${job.category || 'General'}`,
      `Type: ${job.job_type || 'full-time'}`,
      `Work Mode: ${job.work_mode || 'on_site'}`,
      `Compensation: ${job.salary_range || 'Competitive'} (${job.compensation_type || 'salary'})`,
      `Department: ${job.department || 'N/A'}`,
      `Location: ${job.location || 'Lakefront Estates, Okeechobee, FL'}`,
      `Status: ${job.status || 'draft'}`,
      `Visibility: ${job.visibility || 'public'}`,
      `Openings: ${job.openings_count || 1}`,
      job.closing_date ? `Closing: ${job.closing_date}` : '',
      job.special_offer ? `Special Offer: ${job.special_offer}` : '',
      '',
      job.requirements ? `Requirements:\n${job.requirements}` : '',
      job.benefits ? `Benefits:\n${job.benefits}` : '',
      '',
      `[Supabase ID: ${job.id}]`,
    ].filter(Boolean).join('\n');

    const contactData: Record<string, any> = {
      firstName: 'Job',
      lastName: job.title,
      companyName: companyField,
      source: 'Lakefront Portal - Job Posting',
      tags: [JOB_TAG, job.category || 'General', job.status || 'draft'].filter(Boolean),
      website: job.status === 'published' ? `https://lakefront-economic-dev.vercel.app/jobs/${job.id}` : '',
      customField: {
        contact_type: 'Job Posting',
      },
    };

    let ghlContactId: string | null = job.ghl_record_id || null;

    if (ghlContactId) {
      // Update existing contact
      try {
        await ghl.updateContact(ghlContactId, contactData);
      } catch (updateErr: any) {
        console.error('GHL update failed, creating new:', updateErr?.message);
        ghlContactId = null; // Fall through to create
      }
    }

    if (!ghlContactId) {
      // Create new contact
      const result = await ghl.createContact(contactData);
      ghlContactId = result?.contact?.id || null;
    }

    // Add a note with all job details
    if (ghlContactId) {
      try {
        await ghl.request(`/contacts/${ghlContactId}/notes`, {
          method: 'POST',
          body: {
            body: notesParts,
            userId: ghlConfig.locationId, // required by GHL
          },
        });
      } catch {
        // Notes API may not be available, non-critical
      }
    }

    return { ghlCompanyId: ghlContactId, success: true };
  } catch (err: any) {
    console.error('syncJobToGhl failed:', err);
    return { ghlCompanyId: null, success: false, error: err?.message || String(err) };
  }
}

/**
 * Parse a GHL Contact back into job data (for GHL → Supabase sync)
 */
export function parseGhlCompanyToJob(contact: any): Partial<JobSyncData> | null {
  if (!contact?.firstName || contact.firstName !== 'Job') return null;
  if (!contact.tags?.includes(JOB_TAG)) return null;

  return {
    title: contact.lastName || '',
    company_name: contact.companyName || '',
  };
}

/**
 * Fetch all job contacts from GHL
 */
export async function fetchJobsFromGhl(): Promise<any[]> {
  if (!isGhlConfigured()) return [];
  try {
    const result = await ghl.getContacts({ query: 'Job', limit: '100' });
    const contacts = result?.contacts || [];
    return contacts.filter((c: any) => c.tags?.includes(JOB_TAG));
  } catch {
    return [];
  }
}
