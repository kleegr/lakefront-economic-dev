// EMPLOYEE APPLICATION FIELDS - Single source of truth
// Maps: Supabase column <-> Kleegr contact custom field <-> Portal form

export interface EmployeeFieldConfig {
  key: string;
  ghlKey: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'currency' | 'date' | 'select' | 'multiselect' | 'file' | 'phone' | 'county';
  placeholder?: string;
  required?: boolean;
  colSpan?: 1 | 2;
  group: string;
  options?: string[];
}

export const EMPLOYEE_FIELDS: EmployeeFieldConfig[] = [
  // --- Property Info (after contact info, before job preferences) ---
  { key: 'lot_number', ghlKey: 'contact.lot_number', label: 'Lot Number', type: 'number', placeholder: 'e.g. 123', group: 'property' },
  { key: 'signed_contract_date', ghlKey: 'contact.signed_contract_date', label: 'Signed Contract Date', type: 'date', group: 'property' },

  // --- Job Preferences ---
  { key: 'desired_salary', ghlKey: 'contact.desired_salary', label: 'Desired Salary', type: 'currency', placeholder: '0.00', group: 'preferences' },
  { key: 'salary_min', ghlKey: 'contact.salary_min', label: 'Salary Minimum', type: 'currency', placeholder: '0.00', group: 'preferences' },
  { key: 'salary_max', ghlKey: 'contact.salary_max', label: 'Salary Maximum', type: 'currency', placeholder: '0.00', group: 'preferences' },
  { key: 'work_mode_preference', ghlKey: 'contact.work_mode_preference', label: 'Work Mode Preference', type: 'select', group: 'preferences', options: ['On Site', 'Remote', 'Hybrid'] },
  { key: 'preferred_job_types', ghlKey: 'contact.prefered_job_types', label: 'Preferred Job Types', type: 'multiselect', group: 'preferences', options: ['Full-Time', 'Part-Time', 'Contract', 'Seasonal', 'Internship'] },
  { key: 'preferred_industries', ghlKey: 'contact.prefered_industries', label: 'Preferred Industries', type: 'multiselect', group: 'preferences', options: ['Technology', 'Healthcare', 'Financial Services', 'Energy', 'Consumer Goods', 'Industrials', 'Real Estate', 'Telecommunications', 'E-Commerce & Retail', 'Logistics & Supply Chain', 'Construction & Engineering', 'Automotive', 'Hospitality', 'Media & Entertainment', 'Education', 'Agriculture', 'Chemicals', 'Environmental Services'] },
  { key: 'availability_start_date', ghlKey: 'contact.availability_start_date', label: 'Availability Date', type: 'date', group: 'preferences', placeholder: 'When can you start?' },

  // --- Experience ---
  { key: 'years_of_experience', ghlKey: 'contact.years_of_experience', label: 'Years of Experience', type: 'text', placeholder: 'e.g. 5', group: 'experience' },
  { key: 'skills_qualifications', ghlKey: 'contact.skills_qualifications', label: 'Skills & Qualifications', type: 'textarea', colSpan: 2, placeholder: 'List your key skills, certifications, and qualifications...', group: 'experience' },
  { key: 'skills_summary', ghlKey: 'contact.skills_summary', label: 'Skills Summary', type: 'textarea', colSpan: 2, placeholder: 'Brief summary of your top skills...', group: 'experience' },
  { key: 'work_history_summary', ghlKey: 'contact.work_history_summary', label: 'Work History Summary', type: 'textarea', colSpan: 2, placeholder: 'Summarize your work history...', group: 'experience' },

  // --- Application ---
  { key: 'cover_letter', ghlKey: 'contact.cover_letter', label: 'Cover Letter / Why are you interested?', type: 'textarea', colSpan: 2, placeholder: 'Tell us why you are interested in this position...', group: 'application' },
  { key: 'resume_url', ghlKey: 'contact.resume_file', label: 'Resume', type: 'file', placeholder: 'Upload your resume (PDF, DOC, DOCX)', group: 'application' },

  // --- Admin ---
  { key: 'priority_score', ghlKey: 'contact.priority_score', label: 'Priority Score', type: 'select', group: 'admin', options: ['High', 'Medium', 'Low'] },
];

export function getPublicFormFields(): EmployeeFieldConfig[] { return EMPLOYEE_FIELDS.filter(f => f.group !== 'admin'); }
export function getAllFields(): EmployeeFieldConfig[] { return EMPLOYEE_FIELDS; }
export function getFieldsByGroup(): Record<string, EmployeeFieldConfig[]> {
  const groups: Record<string, EmployeeFieldConfig[]> = {};
  for (const f of EMPLOYEE_FIELDS) { if (!groups[f.group]) groups[f.group] = []; groups[f.group].push(f); }
  return groups;
}
export const GROUP_LABELS: Record<string, string> = { property: 'Property Information', preferences: 'Job Preferences', experience: 'Experience & Skills', application: 'Application Details', admin: 'Admin Only' };

export function appToGhlCustomFields(app: Record<string, any>, job: Record<string, any> | null, fieldIdMap: Record<string, string>): Array<{ id: string; field_value: string }> {
  const fields: Array<{ id: string; field_value: string }> = [];
  const add = (ghlKey: string, val: any) => { const id = fieldIdMap[ghlKey]; if (!id) return; const strVal = Array.isArray(val) ? val.join(', ') : String(val || ''); if (strVal) fields.push({ id, field_value: strVal }); };
  for (const f of EMPLOYEE_FIELDS) add(f.ghlKey, app[f.key]);
  const statusMap: Record<string, string> = { submitted: 'Submitted', reviewing: 'Reviewing', interview: 'Interview', offered: 'Offered', hired: 'Hired', rejected: 'Rejected', withdrawn: 'Withdrawn' };
  add('contact.employee_app_status', statusMap[app.status] || app.status || 'Submitted');
  add('contact.supabase_application_id', app.id || '');
  if (job?.title) add('contact.position_applied_for', job.title);
  if (job?.company_name) add('contact.employer_company', job.company_name);
  if (job?.id) add('contact.supabase_job_id', job.id);
  return fields;
}

export function ghlCustomFieldsToApp(customFieldValues: Record<string, any>, fieldIdMap: Record<string, string>): Record<string, any> {
  const reverseMap: Record<string, string> = {};
  for (const [key, id] of Object.entries(fieldIdMap)) reverseMap[id] = key;
  const ghlValues: Record<string, string> = {};
  if (Array.isArray(customFieldValues)) { for (const cf of customFieldValues) { const key = reverseMap[cf.id] || cf.key; if (key) ghlValues[key] = cf.value || cf.field_value || ''; } }
  else if (typeof customFieldValues === 'object') Object.assign(ghlValues, customFieldValues);
  const app: Record<string, any> = {};
  for (const f of EMPLOYEE_FIELDS) {
    const ghlVal = ghlValues[f.ghlKey]; if (ghlVal === undefined) continue;
    if (f.type === 'multiselect') app[f.key] = typeof ghlVal === 'string' ? ghlVal.split(',').map(s => s.trim()).filter(Boolean) : ghlVal;
    else if (f.type === 'number' || f.type === 'currency') app[f.key] = parseFloat(ghlVal) || null;
    else app[f.key] = ghlVal;
  }
  const statusReverseMap: Record<string, string> = { 'Submitted': 'submitted', 'Reviewing': 'reviewing', 'Interview': 'interview', 'Offered': 'offered', 'Hired': 'hired', 'Rejected': 'rejected', 'Withdrawn': 'withdrawn' };
  const ghlStatus = ghlValues['contact.employee_app_status'];
  if (ghlStatus && statusReverseMap[ghlStatus]) app.status = statusReverseMap[ghlStatus];
  return app;
}
