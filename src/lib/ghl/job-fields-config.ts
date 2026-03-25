// ============================================================
// JOB FIELDS CONFIG — Single source of truth
// ============================================================
// To add a new field:
//   1. Add it here
//   2. Add the field in GHL Custom Object (Job Openings) with matching key
//   3. If it's a new DB column, run a Supabase migration
//   4. That's it — portal form + GHL sync auto-update
// ============================================================

export type FieldType = 'text' | 'textarea' | 'dropdown' | 'number' | 'date' | 'hidden';

export interface JobFieldConfig {
  // Identifiers
  key: string;           // Supabase column name (e.g. 'job_type')
  ghlKey: string;        // GHL Custom Object property key (e.g. 'job_type')

  // Display
  label: string;         // Form label (e.g. 'Job Type')
  type: FieldType;       // Field type for portal form
  placeholder?: string;  // Input placeholder
  required?: boolean;    // Required in portal form

  // Dropdown options (if type === 'dropdown')
  // Each option: { value: stored in Supabase, ghlLabel: sent to GHL dropdown }
  options?: Array<{ value: string; ghlLabel: string }>;

  // Layout
  colSpan?: 1 | 2;      // Grid columns (1 = half width, 2 = full width)
  group?: string;        // Group name for form sections
}

// ============================================================
// JOB OPENING STATUS — constants for use across the app
// ============================================================
export const JOB_OPENING_STATUSES = ['open', 'hired', 'reserved', 'pending', 'coming_soon'] as const;
export type JobOpeningStatus = typeof JOB_OPENING_STATUSES[number];

// Statuses where the Apply button should be active
export const APPLY_ALLOWED_STATUSES: JobOpeningStatus[] = ['open', 'reserved'];

// Human-readable labels
export const JOB_STATUS_LABELS: Record<JobOpeningStatus, string> = {
  open: 'Open',
  hired: 'Hired',
  reserved: 'Reserved',
  pending: 'Pending',
  coming_soon: 'Coming Soon',
};

// Helper text shown under certain statuses
export const JOB_STATUS_HELPER: Partial<Record<JobOpeningStatus, string>> = {
  reserved: 'Accepting backup applications',
  pending: 'Applications temporarily closed',
};

// Badge color classes (Tailwind)
export const JOB_STATUS_COLORS: Record<JobOpeningStatus, { bg: string; text: string }> = {
  open: { bg: 'bg-green-50', text: 'text-green-700' },
  hired: { bg: 'bg-gray-100', text: 'text-gray-500' },
  reserved: { bg: 'bg-amber-50', text: 'text-amber-700' },
  pending: { bg: 'bg-blue-50', text: 'text-blue-600' },
  coming_soon: { bg: 'bg-purple-50', text: 'text-purple-600' },
};

// ============================================================
// ALL JOB FIELDS
// ============================================================
export const JOB_FIELDS: JobFieldConfig[] = [
  // --- Core ---
  {
    key: 'title', ghlKey: 'job_title',
    label: 'Job Title', type: 'text', required: true,
    placeholder: 'e.g. Store Manager', colSpan: 2, group: 'core',
  },
  {
    key: 'company_name', ghlKey: 'company__employer',
    label: 'Company / Employer', type: 'text',
    placeholder: 'e.g. Lakefront Grocery', group: 'core',
  },
  {
    key: 'location', ghlKey: 'location',
    label: 'Location', type: 'text',
    placeholder: 'Lakefront Estates, Okeechobee, FL', group: 'core',
  },

  // --- Classification ---
  {
    key: 'category', ghlKey: 'category',
    label: 'Category', type: 'dropdown', group: 'classification',
    options: [
      { value: 'General', ghlLabel: 'General' },
      { value: 'Retail', ghlLabel: 'Retail' },
      { value: 'Healthcare', ghlLabel: 'Healthcare' },
      { value: 'Food Service', ghlLabel: 'Food Service' },
      { value: 'Maintenance', ghlLabel: 'Maintenance' },
      { value: 'Security', ghlLabel: 'Security' },
      { value: 'Education', ghlLabel: 'Education' },
      { value: 'Professional Services', ghlLabel: 'Professional Services' },
      { value: 'Technology', ghlLabel: 'Technology' },
      { value: 'Construction', ghlLabel: 'Construction' },
      { value: 'Management', ghlLabel: 'Management' },
      { value: 'Marketing', ghlLabel: 'Marketing' },
      { value: 'Other', ghlLabel: 'Other' },
    ],
  },
  {
    key: 'job_type', ghlKey: 'job_type',
    label: 'Job Type', type: 'dropdown', group: 'classification',
    options: [
      { value: 'full-time', ghlLabel: 'Full-Time' },
      { value: 'part-time', ghlLabel: 'Part-Time' },
      { value: 'contract', ghlLabel: 'Contract' },
      { value: 'seasonal', ghlLabel: 'Seasonal' },
      { value: 'internship', ghlLabel: 'Internship' },
    ],
  },
  {
    key: 'work_mode', ghlKey: 'work_mode',
    label: 'Work Mode', type: 'dropdown', group: 'classification',
    options: [
      { value: 'on_site', ghlLabel: 'On Site' },
      { value: 'remote', ghlLabel: 'Remote' },
      { value: 'hybrid', ghlLabel: 'Hybrid' },
    ],
  },
  {
    key: 'compensation_type', ghlKey: 'compensation_type',
    label: 'Compensation Type', type: 'dropdown', group: 'classification',
    options: [
      { value: 'salary', ghlLabel: 'Salary' },
      { value: 'hourly', ghlLabel: 'Hourly' },
      { value: 'commission', ghlLabel: 'Commission' },
      { value: 'base_commission', ghlLabel: 'Base + Commission' },
      { value: 'other', ghlLabel: 'Other' },
    ],
  },
  {
    key: 'job_opening_status', ghlKey: 'job_opening_status',
    label: 'Job Opening Status', type: 'dropdown', group: 'classification',
    options: [
      { value: 'open', ghlLabel: 'Open' },
      { value: 'hired', ghlLabel: 'Hired' },
      { value: 'reserved', ghlLabel: 'Reserved' },
      { value: 'pending', ghlLabel: 'Pending' },
      { value: 'coming_soon', ghlLabel: 'Coming Soon' },
    ],
  },

  // --- Details ---
  {
    key: 'salary_range', ghlKey: 'salary_range',
    label: 'Salary / Pay Range', type: 'text',
    placeholder: 'e.g. $45,000-$55,000/year', group: 'details',
  },
  {
    key: 'department', ghlKey: 'department',
    label: 'Department', type: 'text',
    placeholder: 'Optional', group: 'details',
  },

  // --- Content ---
  {
    key: 'description', ghlKey: 'job_details',
    label: 'Description', type: 'textarea',
    placeholder: 'Describe the role...', colSpan: 2, group: 'content',
  },
  {
    key: 'requirements', ghlKey: 'requirements',
    label: 'Requirements', type: 'textarea',
    placeholder: 'Skills, experience, qualifications...', colSpan: 2, group: 'content',
  },
  {
    key: 'benefits', ghlKey: 'benefits',
    label: 'Benefits', type: 'textarea',
    placeholder: 'Health insurance, PTO, etc...', colSpan: 2, group: 'content',
  },

  // --- Publishing ---
  {
    key: 'status', ghlKey: '', // not synced to GHL yet
    label: 'Status', type: 'dropdown', group: 'publishing',
    options: [
      { value: 'draft', ghlLabel: 'Draft' },
      { value: 'published', ghlLabel: 'Published' },
    ],
  },
  {
    key: 'visibility', ghlKey: '', // not synced to GHL yet
    label: 'Visibility', type: 'dropdown', group: 'publishing',
    options: [
      { value: 'public', ghlLabel: 'Public' },
      { value: 'signed_in', ghlLabel: 'Signed In' },
      { value: 'admin_only', ghlLabel: 'Admin Only' },
    ],
  },
  {
    key: 'closing_date', ghlKey: 'closing_date',
    label: 'Closing Date', type: 'date', group: 'publishing',
  },

  // --- Extras ---
  {
    key: 'openings_count', ghlKey: 'openings_count',
    label: 'Openings Count', type: 'number',
    placeholder: '1', group: 'extras',
  },
  {
    key: 'special_offer', ghlKey: 'special_offer',
    label: 'Special Offer', type: 'text',
    placeholder: 'e.g. Signing bonus, relocation help', colSpan: 2, group: 'extras',
  },

  // --- Sync (hidden from form, used internally) ---
  {
    key: 'id', ghlKey: 'supabase_id',
    label: 'Supabase ID', type: 'hidden', group: 'sync',
  },
];

// ============================================================
// HELPER FUNCTIONS — used by sync + portal form
// ============================================================

// Get all visible fields (for the portal form)
export function getFormFields(): JobFieldConfig[] {
  return JOB_FIELDS.filter(f => f.type !== 'hidden');
}

// Get fields grouped by section
export function getFieldsByGroup(): Record<string, JobFieldConfig[]> {
  const groups: Record<string, JobFieldConfig[]> = {};
  for (const f of getFormFields()) {
    const g = f.group || 'other';
    if (!groups[g]) groups[g] = [];
    groups[g].push(f);
  }
  return groups;
}

// Get dropdown options for a field (for portal <select>)
export function getPortalOptions(key: string): string[] {
  const field = JOB_FIELDS.find(f => f.key === key);
  return field?.options?.map(o => o.value) || [];
}

// Get dropdown display label for portal
export function getPortalLabel(key: string, value: string): string {
  const field = JOB_FIELDS.find(f => f.key === key);
  const opt = field?.options?.find(o => o.value === value);
  return opt?.ghlLabel || value;
}

// ============================================================
// GHL MAPPING — auto-generated from config
// ============================================================

// Convert Supabase job → GHL properties
export function jobToGhlProperties(job: Record<string, any>): Record<string, any> {
  const props: Record<string, any> = {};

  for (const field of JOB_FIELDS) {
    if (!field.ghlKey) continue; // skip fields without GHL mapping

    const val = job[field.key];

    if (field.type === 'dropdown' && field.options) {
      // Dropdown → send as array with GHL label
      const opt = field.options.find(o => o.value === val);
      if (opt) props[field.ghlKey] = [opt.ghlLabel];
      else if (val) props[field.ghlKey] = [val]; // fallback
      else props[field.ghlKey] = [];
    } else if (field.type === 'date') {
      // Date → only send if has value (GHL rejects empty string)
      if (val) props[field.ghlKey] = val;
    } else if (field.type === 'number') {
      props[field.ghlKey] = val || 0;
    } else {
      // Text/textarea/hidden → send as-is
      props[field.ghlKey] = val || '';
    }
  }

  return props;
}

// Convert GHL properties → Supabase job
export function ghlPropertiesToJob(props: Record<string, any>): Record<string, any> {
  const job: Record<string, any> = {};

  for (const field of JOB_FIELDS) {
    if (!field.ghlKey) continue;

    const val = props[field.ghlKey];

    if (field.type === 'dropdown' && field.options) {
      // Dropdown → extract from array, reverse-map GHL label to Supabase value
      const raw = Array.isArray(val) ? val[0] : val;
      const opt = field.options.find(o => o.ghlLabel === raw || o.value === raw);
      job[field.key] = opt?.value || raw || '';
    } else if (field.type === 'number') {
      job[field.key] = val || 0;
    } else {
      job[field.key] = val || '';
    }
  }

  return job;
}

// Build Supabase → GHL value mapping for a dropdown (for reference)
export function getDropdownMap(key: string): Record<string, string> {
  const field = JOB_FIELDS.find(f => f.key === key);
  const map: Record<string, string> = {};
  for (const opt of field?.options || []) {
    map[opt.value] = opt.ghlLabel;
  }
  return map;
}
