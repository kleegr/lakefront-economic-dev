// Kleegr Contact Sync — creates/updates contacts with custom fields when applications come in
// Uses field IDs (not keys) for custom field values as required by GHL API
import { ghlConfig, isGhlConfigured } from './config';

const BASE_URL = 'https://services.leadconnectorhq.com';

function getHeaders() {
  return {
    'Authorization': `Bearer ${ghlConfig.token}`,
    'Content-Type': 'application/json',
    'Version': '2021-07-28',
  };
}

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
  [key: string]: any;
}

// Cache field key -> ID mapping
let fieldIdMap: Record<string, string> | null = null;

async function getFieldIdMap(): Promise<Record<string, string>> {
  if (fieldIdMap) return fieldIdMap;
  if (!isGhlConfigured()) return {};
  try {
    const res = await fetch(`${BASE_URL}/locations/${ghlConfig.locationId}/customFields`, {
      headers: { 'Authorization': `Bearer ${ghlConfig.token}`, 'Version': '2021-07-28' },
    });
    const data = await res.json();
    const map: Record<string, string> = {};
    for (const f of (data.customFields || [])) {
      map[f.fieldKey] = f.id;
    }
    fieldIdMap = map;
    return map;
  } catch {
    return {};
  }
}

// Helper to build customFields array with IDs
function cf(map: Record<string, string>, key: string, value: string): { id: string; field_value: string } | null {
  const id = map[key];
  if (!id || !value) return null;
  return { id, field_value: value };
}

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

export async function syncApplicationToKleegr(app: ApplicationData): Promise<{ contactId: string | null; success: boolean; error?: string }> {
  if (!isGhlConfigured()) return { contactId: null, success: false, error: 'Kleegr not configured' };

  const map = await getFieldIdMap();
  const appType = app.application_type || 'employee';
  const nameParts = (app.applicant_name || '').split(' ');

  // Build custom fields array using IDs
  const customFields: Array<{ id: string; field_value: string }> = [];
  const addField = (key: string, value: string) => {
    const entry = cf(map, key, value);
    if (entry) customFields.push(entry);
  };

  // General field
  addField('contact.contact_type', CONTACT_TYPE_MAP[appType] || 'Employee');
  addField('contact.supabase_application_id', app.id);

  if (appType === 'employee') {
    addField('contact.cover_letter', app.cover_letter || '');
    addField('contact.employee_app_status', 'Submitted');
    if (app.position_applied_for) addField('contact.position_applied_for', app.position_applied_for);
    if (app.desired_salary) addField('contact.desired_salary', app.desired_salary);
    if (app.years_of_experience) addField('contact.years_of_experience', app.years_of_experience);
    if (app.skills) addField('contact.skills__qualifications', app.skills);
  } else if (appType === 'employer') {
    addField('contact.employer_company', app.applicant_name || '');
    addField('contact.employer_app_status', 'Submitted');
    addField('contact.business_description', app.cover_letter || '');
    addField('contact.supabase_employer_id', app.id);
  } else if (appType === 'provider') {
    addField('contact.cover_letter', app.cover_letter || '');
    addField('contact.employee_app_status', 'Submitted');
  } else if (appType === 'space_rental') {
    addField('contact.cover_letter', app.cover_letter || '');
    addField('contact.employee_app_status', 'Submitted');
  }

  const contactData: Record<string, any> = {
    locationId: ghlConfig.locationId,
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
    email: app.applicant_email || '',
    phone: app.applicant_phone || '',
    address1: app.address || '',
    source: 'Lakefront Portal',
    tags: [`lakefront-${appType}`, 'lakefront-applicant'],
    customFields,
  };

  if (appType === 'employer' && app.applicant_name) {
    contactData.companyName = app.applicant_name;
  }

  try {
    const existingId = await findContactByEmail(app.applicant_email || '');

    if (existingId) {
      const res = await fetch(`${BASE_URL}/contacts/${existingId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(contactData),
      });
      const data = await res.json();
      if (!res.ok) return { contactId: existingId, success: false, error: JSON.stringify(data?.message || data) };
      return { contactId: existingId, success: true };
    } else {
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
