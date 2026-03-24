// EMPLOYER APPLICATION FIELDS - Single source of truth
// Maps: Supabase column <-> Kleegr contact custom field <-> Portal form
// When an employer applies, TWO things happen:
//   1. Kleegr contact created with employer custom fields (business group)
//   2. Job post created in lf_jobs from job info fields (job group)

export interface EmployerFieldConfig { key: string; ghlKey: string; label: string; type: 'text' | 'textarea' | 'number' | 'currency' | 'date' | 'select' | 'multiselect'; placeholder?: string; required?: boolean; colSpan?: 1 | 2; group: string; options?: string[]; }

export const EMPLOYER_FIELDS: EmployerFieldConfig[] = [
  { key: 'employer_company', ghlKey: 'contact.employer_company', label: 'Employer Company', type: 'text', required: true, placeholder: 'Company name', group: 'business' },
  { key: 'contact_person', ghlKey: 'contact.contact_person', label: 'Contact Person', type: 'text', placeholder: 'Primary contact name', group: 'business' },
  { key: 'business_type_employer', ghlKey: 'contact.business_type_employer', label: 'Business Type', type: 'select', group: 'business', options: ['Retail', 'Food & Beverage', 'Professional Services', 'Healthcare', 'Education', 'Technology', 'Construction', 'Security', 'Community', 'Other'] },
  { key: 'business_website', ghlKey: 'contact.business_website', label: 'Business Website', type: 'text', placeholder: 'https://...', group: 'business' },
  { key: 'business_description', ghlKey: 'contact.business_description', label: 'Business Description', type: 'textarea', colSpan: 2, placeholder: 'Describe your business...', group: 'business' },
  { key: 'number_of_jobs_to_post', ghlKey: 'contact.number_of_jobs_to_post', label: 'Number of Jobs to Post', type: 'number', placeholder: 'e.g. 3', group: 'business' },
  { key: 'years_in_business', ghlKey: 'contact.years_in_business', label: 'Years in Business', type: 'text', placeholder: 'e.g. 5', group: 'business' },
  { key: 'job_title', ghlKey: '', label: 'Job Title', type: 'text', required: true, placeholder: 'e.g. Store Manager', group: 'job' },
  { key: 'job_description', ghlKey: '', label: 'Job Description', type: 'textarea', colSpan: 2, placeholder: 'Describe the role, responsibilities...', group: 'job' },
  { key: 'job_category', ghlKey: '', label: 'Job Category', type: 'select', group: 'job', options: ['General', 'Retail', 'Healthcare', 'Food Service', 'Maintenance', 'Security', 'Education', 'Professional Services', 'Technology', 'Construction', 'Management', 'Marketing', 'Other'] },
  { key: 'job_type_requested', ghlKey: '', label: 'Job Type', type: 'select', group: 'job', options: ['Full-Time', 'Part-Time', 'Contract', 'Seasonal', 'Internship'] },
  { key: 'job_work_mode', ghlKey: '', label: 'Work Mode', type: 'select', group: 'job', options: ['On Site', 'Remote', 'Hybrid'] },
  { key: 'job_salary_range', ghlKey: '', label: 'Salary / Pay Range', type: 'text', placeholder: 'e.g. $45,000-$55,000/year', group: 'job' },
  { key: 'job_location', ghlKey: '', label: 'Job Location', type: 'text', placeholder: 'e.g. Lakefront Estates, Okeechobee, FL', group: 'job' },
  { key: 'job_requirements', ghlKey: '', label: 'Requirements', type: 'textarea', colSpan: 2, placeholder: 'Skills, experience, qualifications needed...', group: 'job' },
  { key: 'job_benefits', ghlKey: '', label: 'Benefits', type: 'textarea', colSpan: 2, placeholder: 'Health insurance, PTO, etc...', group: 'job' },
  { key: 'job_openings_count', ghlKey: '', label: 'Number of Openings', type: 'number', placeholder: '1', group: 'job' },
  { key: 'cover_letter', ghlKey: 'contact.cover_letter', label: 'Additional Details / Notes', type: 'textarea', colSpan: 2, placeholder: 'Why do you want to list jobs at Lakefront?', group: 'application' },
];

export const EMPLOYER_GROUP_LABELS: Record<string, string> = { business: 'Business Information', job: 'Job Information', application: 'Additional Information' };
export function getEmployerFormFields(): EmployerFieldConfig[] { return EMPLOYER_FIELDS; }
export function getEmployerFieldsByGroup(): Record<string, EmployerFieldConfig[]> { const g: Record<string, EmployerFieldConfig[]> = {}; for (const f of EMPLOYER_FIELDS) { if (!g[f.group]) g[f.group] = []; g[f.group].push(f); } return g; }
export function getEmployerBusinessFields(): EmployerFieldConfig[] { return EMPLOYER_FIELDS.filter(f => f.ghlKey && f.ghlKey !== ''); }
export function getEmployerJobFields(): EmployerFieldConfig[] { return EMPLOYER_FIELDS.filter(f => f.group === 'job'); }

export function employerAppToGhlCustomFields(app: Record<string, any>, fieldIdMap: Record<string, string>): Array<{ id: string; field_value: string }> {
  const fields: Array<{ id: string; field_value: string }> = [];
  const add = (ghlKey: string, val: any) => { const id = fieldIdMap[ghlKey]; if (!id) return; const sv = String(val || ''); if (sv) fields.push({ id, field_value: sv }); };
  for (const f of EMPLOYER_FIELDS) { if (f.ghlKey) add(f.ghlKey, app[f.key]); }
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
  for (const f of EMPLOYER_FIELDS) { if (!f.ghlKey) continue; const v = gv[f.ghlKey]; if (v === undefined) continue; if (f.type === 'number') app[f.key] = parseInt(v) || null; else app[f.key] = v; }
  return app;
}
