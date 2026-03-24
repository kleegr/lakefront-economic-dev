// Kleegr Contact Sync — creates/updates contacts with custom fields when applications come in
// Custom folders created in Kleegr:
//   General: Contact Type (Employee/Employer/Provider/Space Applicant)
//   Employee Applicant: position_applied_for, desired_salary, work_mode_preference, years_of_experience,
//     skills__qualifications, resume_url, cover_letter, availability_start_date, employee_app_status, supabase_application_id
//   Employer: employer_company, contact_person, business_type_employer, business_website,
//     business_description, number_of_jobs_to_post, years_in_business, employer_app_status, supabase_employer_id

import { ghlConfig, isGhlConfigured } from './config';

const BASE_URL = 'https://services.leadconnectorhq.com';

function getHeaders() {
  return {
    'Authorization': `Bearer ${ghlConfig.token}`,
    'Content-Type': 'application/json',
    'Version': '2021-07-28',
  };
}

// Map application_type to Kleegr Contact Type dropdown value
const CONTACT_TYPE_MAP: Record<string, string> = {
  employee: 'Employee',
  employer: 'Employer',
  provider: 'Provider',
  space_rental: 'Space Applicant',
};

interface ApplicationData {
  id: string;
  applicant_name?: string;
  applicant_email?: string;
  applicant_phone?: string;
  address?: string;
  application_type?: string;
  cover_letter?: string;
  status?: string;
  notes?: string;
  // Parsed from cover_letter for structured data
  [key: string]: any;
}

// Search for existing contact by email
async function findContactByEmail(email: string): Promise<string | null> {
  if (!email || !isGhlConfigured()) return null;
  try {
    const res = await fetch(`${BASE_URL}/contacts/search/duplicate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ locationId: ghlConfig.locationId, email }),
    });
    const data = await res.json();
    return data?.contact?.id || null;
  } catch {
    return null;
  }
}

// Create or update a Kleegr contact from an application
export async function syncApplicationToKleegr(app: ApplicationData): Promise<{ contactId: string | null; success: boolean; error?: string }> {
  if (!isGhlConfigured()) return { contactId: null, success: false, error: 'Kleegr not configured' };
  
  const appType = app.application_type || 'employee';
  
  // Build base contact data
  const nameParts = (app.applicant_name || '').split(' ');
  const contactData: Record<string, any> = {
    locationId: ghlConfig.locationId,
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
    email: app.applicant_email || '',
    phone: app.applicant_phone || '',
    address1: app.address || '',
    source: 'Lakefront Portal',
    tags: [`lakefront-${appType}`, 'lakefront-applicant'],
    customFields: [] as Array<{ key: string; field_value: string }>,
  };
  
  // Set Contact Type
  contactData.customFields.push({ key: 'contact.contact_type', field_value: CONTACT_TYPE_MAP[appType] || 'Employee' });
  contactData.customFields.push({ key: 'contact.supabase_application_id', field_value: app.id });
  
  if (appType === 'employee') {
    // Employee-specific fields
    contactData.customFields.push({ key: 'contact.cover_letter', field_value: app.cover_letter || '' });
    contactData.customFields.push({ key: 'contact.employee_app_status', field_value: 'Submitted' });
    // Parse structured data from cover_letter if available
    if (app.position_applied_for) contactData.customFields.push({ key: 'contact.position_applied_for', field_value: app.position_applied_for });
    if (app.desired_salary) contactData.customFields.push({ key: 'contact.desired_salary', field_value: app.desired_salary });
    if (app.years_of_experience) contactData.customFields.push({ key: 'contact.years_of_experience', field_value: app.years_of_experience });
    if (app.skills) contactData.customFields.push({ key: 'contact.skills__qualifications', field_value: app.skills });
  } else if (appType === 'employer') {
    // Employer-specific fields
    contactData.customFields.push({ key: 'contact.employer_company', field_value: app.applicant_name || '' });
    contactData.customFields.push({ key: 'contact.employer_app_status', field_value: 'Submitted' });
    contactData.customFields.push({ key: 'contact.business_description', field_value: app.cover_letter || '' });
    if (app.applicant_name) contactData.companyName = app.applicant_name;
  } else if (appType === 'provider') {
    contactData.customFields.push({ key: 'contact.cover_letter', field_value: app.cover_letter || '' });
    contactData.customFields.push({ key: 'contact.employee_app_status', field_value: 'Submitted' });
  } else if (appType === 'space_rental') {
    contactData.customFields.push({ key: 'contact.cover_letter', field_value: app.cover_letter || '' });
    contactData.customFields.push({ key: 'contact.employee_app_status', field_value: 'Submitted' });
  }

  try {
    // Check if contact already exists
    const existingId = await findContactByEmail(app.applicant_email || '');
    
    if (existingId) {
      // Update existing contact
      const res = await fetch(`${BASE_URL}/contacts/${existingId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(contactData),
      });
      const data = await res.json();
      if (!res.ok) return { contactId: existingId, success: false, error: JSON.stringify(data?.message || data) };
      return { contactId: existingId, success: true };
    } else {
      // Create new contact
      const res = await fetch(`${BASE_URL}/contacts/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(contactData),
      });
      const data = await res.json();
      if (!res.ok) return { contactId: null, success: false, error: JSON.stringify(data?.message || data) };
      return { contactId: data?.contact?.id || null, success: true };
    }
  } catch (err: any) {
    return { contactId: null, success: false, error: err?.message || String(err) };
  }
}
