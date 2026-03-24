// EMPLOYER APPLICATION FIELDS - Single source of truth
// Maps: Supabase column <-> GHL contact custom field <-> Portal form

export interface EmployerFieldConfig {
  key: string;
  ghlKey: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'multiselect';
  placeholder?: string;
  required?: boolean;
  colSpan?: 1 | 2;
  group: string;
  options?: string[];
}

export const EMPLOYER_FIELDS: EmployerFieldConfig[] = [
  { key: 'employer_company', ghlKey: 'contact.employer_company', label: 'Employer Company', type: 'text', required: true, placeholder: 'Company name', group: 'business' },
  { key: 'contact_person', ghlKey: 'contact.contact_person', label: 'Contact Person', type: 'text', placeholder: 'Primary contact name', group: 'business' },
  { key: 'business_type_employer', ghlKey: 'contact.business_type_employer', label: 'Business Type', type: 'select', group: 'business', options: ['Retail', 'Food & Beverage', 'Professional Services', 'Healthcare', 'Education', 'Technology', 'Construction', 'Security', 'Community', 'Other'] },
  { key: 'business_website', ghlKey: 'contact.business_website', label: 'Business Website', type: 'text', placeholder: 'https://...', group: 'business' },
  { key: 'business_description', ghlKey: 'contact.business_description', label: 'Business Description', type: 'textarea', colSpan: 2, placeholder: 'Describe your business...', group: 'business' },
  { key: 'number_of_jobs_to_post', ghlKey: 'contact.number_of_jobs_to_post', label: 'Number of Jobs to Post', type: 'number', placeholder: 'e.g. 3', group: 'employment' },
  { key: 'years_in_business', ghlKey: 'contact.years_in_business', label: 'Years in Business', type: 'text', placeholder: 'e.g. 5', group: 'employment' },
  { key: 'cover_letter', ghlKey: 'contact.cover_letter', label: 'Additional Details / Notes', type: 'textarea', colSpan: 2, placeholder: 'Why do you want to list jobs at Lakefront?', group: 'application' },
];

export const EMPLOYER_GROUP_LABELS: Record<string, string> = { business: 'Business Information', employment: 'Employment Details', application: 'Additional Information' };

export function getEmployerFormFields(): EmployerFieldConfig[] { return EMPLOYER_FIELDS; }
export function getEmployerFieldsByGroup(): Record<string, EmployerFieldConfig[]> {
  const groups: Record<string, EmployerFieldConfig[]> = {};
  for (const f of EMPLOYER_FIELDS) { if (!groups[f.group]) groups[f.group] = []; groups[f.group].push(f); }
  return groups;
}

export function employerAppToGhlCustomFields(app: Record<string, any>, fieldIdMap: Record<string, string>): Array<{ id: string; field_value: string }> {
  const fields: Array<{ id: string; field_value: string }> = [];
  const add = (ghlKey: string, val: any) => { const id = fieldIdMap[ghlKey]; if (!id) return; const sv = String(val || ''); if (sv) fields.push({ id, field_value: sv }); };
  for (const f of EMPLOYER_FIELDS) add(f.ghlKey, app[f.key]);
  add('contact.contact_type', 'Employer');
  const sm: Record<string, string> = { submitted: 'Submitted', reviewing: 'Reviewing', approved: 'Approved', rejected: 'Rejected', active: 'Active' };
  add('contact.employer_app_status', sm[app.status] || app.status || 'Submitted');
  add('contact.supabase_employer_id', app.id || '');
  return fields;
}

export function ghlEmployerFieldsToApp(customFieldValues: Record<string, any>, fieldIdMap: Record<string, string>): Record<string, any> {
  const rm: Record<string, string> = {}; for (const [k, id] of Object.entries(fieldIdMap)) rm[id] = k;
  const gv: Record<string, string> = {};
  if (Array.isArray(customFieldValues)) { for (const cf of customFieldValues) { const k = rm[cf.id] || cf.key; if (k) gv[k] = cf.value || cf.field_value || ''; } }
  else if (typeof customFieldValues === 'object') Object.assign(gv, customFieldValues);
  const app: Record<string, any> = {};
  for (const f of EMPLOYER_FIELDS) { const v = gv[f.ghlKey]; if (v === undefined) continue; if (f.type === 'number') app[f.key] = parseInt(v) || null; else app[f.key] = v; }
  return app;
}
