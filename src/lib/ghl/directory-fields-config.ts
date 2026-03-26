// ============================================================
// DIRECTORY FIELDS CONFIG — Single source of truth
// ============================================================
// Unified business + service provider directory
// GHL Custom Object: "Business Directories"
// GHL keys match exactly what was created in GHL
// ============================================================

export type FieldType = 'text' | 'textarea' | 'dropdown' | 'number' | 'date' | 'boolean' | 'hidden';

export interface DirectoryFieldConfig {
  key: string;
  ghlKey: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; ghlLabel: string }>;
  colSpan?: 1 | 2;
  group?: string;
}

// ============================================================
// CONSTANTS
// ============================================================
export const DIRECTORY_STATUSES = ['active', 'pending', 'inactive', 'suspended'] as const;
export type DirectoryStatus = typeof DIRECTORY_STATUSES[number];

export const DIRECTORY_STATUS_LABELS: Record<DirectoryStatus, string> = {
  active: 'Active',
  pending: 'Pending',
  inactive: 'Inactive',
  suspended: 'Suspended',
};

export const DIRECTORY_STATUS_COLORS: Record<DirectoryStatus, { bg: string; text: string }> = {
  active: { bg: 'bg-green-50', text: 'text-green-700' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-700' },
  inactive: { bg: 'bg-gray-100', text: 'text-gray-500' },
  suspended: { bg: 'bg-red-50', text: 'text-red-600' },
};

export const DIRECTORY_CATEGORIES = [
  { value: 'Retail', ghlLabel: 'Retail' },
  { value: 'Food & Beverage', ghlLabel: 'Food & Beverage' },
  { value: 'Healthcare', ghlLabel: 'Healthcare' },
  { value: 'Education', ghlLabel: 'Education' },
  { value: 'Professional Services', ghlLabel: 'Professional Services' },
  { value: 'Financial', ghlLabel: 'Financial' },
  { value: 'Automotive', ghlLabel: 'Automotive' },
  { value: 'Recreation', ghlLabel: 'Recreation' },
  { value: 'Services', ghlLabel: 'Services' },
  { value: 'Community', ghlLabel: 'Community' },
  { value: 'Technology', ghlLabel: 'Technology' },
  { value: 'Construction', ghlLabel: 'Construction' },
  { value: 'Security', ghlLabel: 'Security' },
  { value: 'Maintenance', ghlLabel: 'Maintenance' },
  { value: 'Landscaping', ghlLabel: 'Landscaping' },
  { value: 'Legal', ghlLabel: 'Legal' },
  { value: 'Accounting', ghlLabel: 'Accounting' },
  { value: 'Insurance', ghlLabel: 'Insurance' },
  { value: 'Cleaning', ghlLabel: 'Cleaning' },
  { value: 'Transportation', ghlLabel: 'Transportation' },
  { value: 'Marketing', ghlLabel: 'Marketing' },
  { value: 'Other', ghlLabel: 'Other' },
];

// ============================================================
// ALL FIELDS — GHL keys match exactly what was created in GHL
// GHL Custom Object name: business_directories
// ============================================================
export const DIRECTORY_FIELDS: DirectoryFieldConfig[] = [
  // --- Core ---
  { key: 'business_name', ghlKey: 'business_name', label: 'Business Name', type: 'text', required: true, placeholder: 'Legal/official name', colSpan: 2, group: 'core' },
  { key: 'display_name', ghlKey: 'display_name', label: 'Display Name', type: 'text', placeholder: 'Public-facing name (if different)', group: 'core' },
  { key: 'category', ghlKey: 'category', label: 'Category', type: 'dropdown', required: true, group: 'core', options: DIRECTORY_CATEGORIES },
  { key: 'subcategory', ghlKey: 'subcategory', label: 'Subcategory', type: 'text', placeholder: 'e.g. Pharmacy', group: 'core' },
  { key: 'listing_type', ghlKey: 'listing_type', label: 'Listing Type', type: 'dropdown', required: true, group: 'core', options: [
    { value: 'Business', ghlLabel: 'Business' },
    { value: 'Service Provider', ghlLabel: 'Service Provider' },
    { value: 'Both', ghlLabel: 'Both' },
  ]},

  // --- Descriptions ---
  { key: 'short_description', ghlKey: 'short_description', label: 'Short Description', type: 'textarea', required: true, placeholder: '1-2 sentence summary', colSpan: 2, group: 'descriptions' },
  { key: 'full_description', ghlKey: 'full_description', label: 'Full Description', type: 'textarea', placeholder: 'Detailed writeup', colSpan: 2, group: 'descriptions' },
  { key: 'company_overview', ghlKey: 'company_overview', label: 'Company Overview', type: 'textarea', placeholder: 'About the company', colSpan: 2, group: 'descriptions' },
  { key: 'services_offered', ghlKey: 'services_offered', label: 'Services Offered', type: 'textarea', colSpan: 2, group: 'descriptions' },
  { key: 'products_offered', ghlKey: 'products_offered', label: 'Products Offered', type: 'textarea', colSpan: 2, group: 'descriptions' },

  // --- Contact ---
  { key: 'contact_name', ghlKey: 'contact_name', label: 'Contact Name', type: 'text', group: 'contact' },
  { key: 'contact_title', ghlKey: 'contact_title', label: 'Contact Title', type: 'text', placeholder: 'e.g. Owner, Manager', group: 'contact' },
  { key: 'phone', ghlKey: 'phone', label: 'Phone', type: 'text', group: 'contact' },
  { key: 'email', ghlKey: 'email', label: 'Email', type: 'text', group: 'contact' },
  { key: 'website', ghlKey: 'website', label: 'Website', type: 'text', placeholder: 'https://...', group: 'contact' },
  { key: 'booking_link', ghlKey: 'booking_link', label: 'Booking Link', type: 'text', placeholder: 'Calendly, booking URL', group: 'contact' },

  // --- Address ---
  { key: 'address_line_1', ghlKey: 'address_line_1', label: 'Address Line 1', type: 'text', group: 'address' },
  { key: 'address_line_2', ghlKey: 'address_line_2', label: 'Address Line 2', type: 'text', placeholder: 'Suite, Unit, etc.', group: 'address' },
  { key: 'city', ghlKey: 'city', label: 'City', type: 'text', placeholder: 'Okeechobee', group: 'address' },
  { key: 'state', ghlKey: 'state', label: 'State', type: 'text', placeholder: 'FL', group: 'address' },
  { key: 'zip_code', ghlKey: 'zip_code', label: 'Zip Code', type: 'text', group: 'address' },
  { key: 'service_area', ghlKey: 'service_area', label: 'Service Area', type: 'text', placeholder: 'e.g. Okeechobee County', group: 'address' },

  // --- Details ---
  { key: 'hours_of_operation', ghlKey: 'hours_of_operation', label: 'Hours of Operation', type: 'textarea', colSpan: 2, group: 'details' },
  { key: 'languages_spoken', ghlKey: 'languages_spoken', label: 'Languages Spoken', type: 'text', placeholder: 'English, Spanish, Hebrew', group: 'details' },
  { key: 'pricing_range', ghlKey: 'amount', label: 'Pricing Range', type: 'dropdown', group: 'details', options: [
    { value: '$', ghlLabel: '$' }, { value: '$$', ghlLabel: '$$' },
    { value: '$$$', ghlLabel: '$$$' }, { value: '$$$$', ghlLabel: '$$$$' },
  ]},
  { key: 'license_number', ghlKey: 'license_number', label: 'License Number', type: 'text', group: 'details' },
  { key: 'certifications', ghlKey: 'certifications', label: 'Certifications', type: 'textarea', colSpan: 2, group: 'details' },

  // --- Publishing ---
  { key: 'status', ghlKey: 'directory_status', label: 'Status', type: 'dropdown', required: true, group: 'publishing', options: [
    { value: 'active', ghlLabel: 'Active' }, { value: 'pending', ghlLabel: 'Pending' },
    { value: 'inactive', ghlLabel: 'Inactive' }, { value: 'suspended', ghlLabel: 'Suspended' },
  ]},
  { key: 'featured', ghlKey: 'featured', label: 'Featured', type: 'boolean', group: 'publishing' },
  { key: 'verified', ghlKey: 'verified', label: 'Verified', type: 'boolean', group: 'publishing' },

  // --- Sync ---
  { key: 'id', ghlKey: 'supabase_id', label: 'Supabase ID', type: 'hidden', group: 'sync' },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================
export function getFormFields(): DirectoryFieldConfig[] {
  return DIRECTORY_FIELDS.filter(f => f.type !== 'hidden');
}

export function getFieldsByGroup(): Record<string, DirectoryFieldConfig[]> {
  const groups: Record<string, DirectoryFieldConfig[]> = {};
  for (const f of getFormFields()) {
    const g = f.group || 'other';
    if (!groups[g]) groups[g] = [];
    groups[g].push(f);
  }
  return groups;
}

export const GROUP_LABELS: Record<string, string> = {
  core: 'Basic Information',
  descriptions: 'Descriptions & Services',
  contact: 'Contact Information',
  address: 'Address & Location',
  details: 'Business Details',
  publishing: 'Status & Visibility',
};

// GHL Mapping — object name is business_directories
export function directoryToGhlProperties(entry: Record<string, any>): Record<string, any> {
  const props: Record<string, any> = {};
  for (const field of DIRECTORY_FIELDS) {
    if (!field.ghlKey) continue;
    const val = entry[field.key];
    if (field.type === 'dropdown' && field.options) {
      const opt = field.options.find(o => o.value === val);
      if (opt) props[field.ghlKey] = [opt.ghlLabel];
      else if (val) props[field.ghlKey] = [val];
      else props[field.ghlKey] = [];
    } else if (field.type === 'boolean') {
      props[field.ghlKey] = val ? ['Yes'] : ['No'];
    } else if (field.type === 'number') {
      props[field.ghlKey] = val || 0;
    } else {
      props[field.ghlKey] = val || '';
    }
  }
  return props;
}

export function ghlPropertiesToDirectory(props: Record<string, any>): Record<string, any> {
  const entry: Record<string, any> = {};
  for (const field of DIRECTORY_FIELDS) {
    if (!field.ghlKey) continue;
    const val = props[field.ghlKey];
    if (field.type === 'dropdown' && field.options) {
      const raw = Array.isArray(val) ? val[0] : val;
      const opt = field.options.find(o => o.ghlLabel === raw || o.value === raw);
      entry[field.key] = opt?.value || raw || '';
    } else if (field.type === 'boolean') {
      const raw = Array.isArray(val) ? val[0] : val;
      entry[field.key] = raw === 'Yes' || raw === true;
    } else if (field.type === 'number') {
      entry[field.key] = val || 0;
    } else {
      entry[field.key] = val || '';
    }
  }
  return entry;
}
