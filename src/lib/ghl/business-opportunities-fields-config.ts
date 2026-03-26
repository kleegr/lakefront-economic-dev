// ============================================================
// BUSINESS OPPORTUNITIES FIELDS CONFIG — Single source of truth
// ============================================================
// Same pattern as job-fields-config.ts
// 1. Add field here
// 2. Add field in GHL Custom Object (Business Opportunities) with matching key
// 3. If new DB column, run Supabase migration
// ============================================================

export type FieldType = 'text' | 'textarea' | 'dropdown' | 'number' | 'date' | 'boolean' | 'hidden';

export interface BizOppFieldConfig {
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
// STATUS CONSTANTS
// ============================================================
export const BIZ_OPP_STATUSES = ['available', 'taken', 'coming_soon', 'under_review', 'closed'] as const;
export type BizOppStatus = typeof BIZ_OPP_STATUSES[number];

export const BIZ_OPP_STATUS_LABELS: Record<BizOppStatus, string> = {
  available: 'Available',
  taken: 'Taken',
  coming_soon: 'Coming Soon',
  under_review: 'Under Review',
  closed: 'Closed',
};

export const BIZ_OPP_STATUS_COLORS: Record<BizOppStatus, { bg: string; text: string }> = {
  available: { bg: 'bg-green-50', text: 'text-green-700' },
  taken: { bg: 'bg-gray-100', text: 'text-gray-500' },
  coming_soon: { bg: 'bg-amber-50', text: 'text-amber-700' },
  under_review: { bg: 'bg-blue-50', text: 'text-blue-600' },
  closed: { bg: 'bg-red-50', text: 'text-red-600' },
};

export const PRIORITY_OPTIONS = [
  { value: 'essential', ghlLabel: 'Essential' },
  { value: 'high', ghlLabel: 'High' },
  { value: 'medium', ghlLabel: 'Medium' },
  { value: 'low', ghlLabel: 'Low' },
];

export const CATEGORY_OPTIONS = [
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
  { value: 'Other', ghlLabel: 'Other' },
];

// ============================================================
// ALL FIELDS
// ============================================================
export const BIZ_OPP_FIELDS: BizOppFieldConfig[] = [
  // --- Core ---
  { key: 'title', ghlKey: 'opportunity_title', label: 'Opportunity Title', type: 'text', required: true, placeholder: 'e.g. Pharmacy / Drugstore', colSpan: 2, group: 'core' },
  { key: 'business_name', ghlKey: 'business_name', label: 'Business Name', type: 'text', placeholder: 'If assigned/taken', group: 'core' },
  { key: 'business_category', ghlKey: 'business_category', label: 'Category', type: 'dropdown', group: 'core', options: CATEGORY_OPTIONS },
  { key: 'industry', ghlKey: 'industry', label: 'Industry', type: 'text', placeholder: 'Specific industry', group: 'core' },
  { key: 'priority', ghlKey: 'priority', label: 'Priority', type: 'dropdown', group: 'core', options: PRIORITY_OPTIONS },

  // --- Descriptions ---
  { key: 'short_description', ghlKey: 'short_description', label: 'Short Description', type: 'textarea', required: true, placeholder: '1-2 sentence summary for cards', colSpan: 2, group: 'descriptions' },
  { key: 'full_description', ghlKey: 'full_description', label: 'Full Description', type: 'textarea', placeholder: 'Detailed writeup', colSpan: 2, group: 'descriptions' },
  { key: 'business_summary', ghlKey: 'business_summary', label: 'Business Summary', type: 'textarea', placeholder: 'Executive-style summary', colSpan: 2, group: 'descriptions' },

  // --- Financials ---
  { key: 'startup_investment_required', ghlKey: 'startup_investment', label: 'Startup Investment Required', type: 'text', placeholder: 'e.g. $150,000 - $300,000', group: 'financials' },
  { key: 'minimum_investment', ghlKey: 'min_investment', label: 'Minimum Investment', type: 'number', placeholder: '150000', group: 'financials' },
  { key: 'maximum_investment', ghlKey: 'max_investment', label: 'Maximum Investment', type: 'number', placeholder: '300000', group: 'financials' },
  { key: 'estimated_monthly_operating_cost', ghlKey: 'monthly_operating_cost', label: 'Est. Monthly Operating Cost', type: 'text', placeholder: 'e.g. $15,000 - $25,000', group: 'financials' },
  { key: 'estimated_monthly_revenue', ghlKey: 'monthly_revenue', label: 'Est. Monthly Revenue', type: 'text', placeholder: 'e.g. $30,000 - $60,000', group: 'financials' },
  { key: 'estimated_profit_potential', ghlKey: 'profit_potential', label: 'Est. Profit Potential', type: 'text', placeholder: 'e.g. $10,000 - $25,000/mo', group: 'financials' },
  { key: 'break_even_timeline', ghlKey: 'break_even_timeline', label: 'Break-Even Timeline', type: 'text', placeholder: 'e.g. 12-18 months', group: 'financials' },
  { key: 'funding_options', ghlKey: 'funding_options', label: 'Funding Options', type: 'text', placeholder: 'SBA, private, etc.', group: 'financials' },
  { key: 'financing_available', ghlKey: 'financing_available', label: 'Financing Available', type: 'boolean', group: 'financials' },

  // --- Operations ---
  { key: 'business_model', ghlKey: 'business_model', label: 'Business Model', type: 'dropdown', group: 'operations', options: [
    { value: 'Franchise', ghlLabel: 'Franchise' }, { value: 'Independent', ghlLabel: 'Independent' },
    { value: 'Partnership', ghlLabel: 'Partnership' }, { value: 'Cooperative', ghlLabel: 'Cooperative' },
    { value: 'Licensing', ghlLabel: 'Licensing' },
  ]},
  { key: 'time_to_launch', ghlKey: 'time_to_launch', label: 'Time to Launch', type: 'text', placeholder: 'e.g. 3-6 months', group: 'operations' },
  { key: 'number_of_employees_needed', ghlKey: 'employees_needed', label: 'Employees Needed', type: 'number', placeholder: '5', group: 'operations' },
  { key: 'employee_roles_needed', ghlKey: 'employee_roles', label: 'Employee Roles Needed', type: 'textarea', colSpan: 2, group: 'operations' },
  { key: 'management_needed', ghlKey: 'management_needed', label: 'Management Needed', type: 'text', group: 'operations' },
  { key: 'owner_involvement_level', ghlKey: 'owner_involvement', label: 'Owner Involvement', type: 'dropdown', group: 'operations', options: [
    { value: 'Full-Time', ghlLabel: 'Full-Time' }, { value: 'Part-Time', ghlLabel: 'Part-Time' },
    { value: 'Semi-Absentee', ghlLabel: 'Semi-Absentee' }, { value: 'Absentee', ghlLabel: 'Absentee' },
  ]},
  { key: 'operational_complexity', ghlKey: 'operational_complexity', label: 'Operational Complexity', type: 'dropdown', group: 'operations', options: [
    { value: 'Low', ghlLabel: 'Low' }, { value: 'Medium', ghlLabel: 'Medium' }, { value: 'High', ghlLabel: 'High' },
  ]},

  // --- Requirements ---
  { key: 'experience_required', ghlKey: 'experience_required', label: 'Experience Required', type: 'textarea', colSpan: 2, group: 'requirements' },
  { key: 'certifications_required', ghlKey: 'certifications_required', label: 'Certifications Required', type: 'textarea', colSpan: 2, group: 'requirements' },
  { key: 'training_required', ghlKey: 'training_required', label: 'Training Required', type: 'textarea', colSpan: 2, group: 'requirements' },
  { key: 'licenses_needed', ghlKey: 'licenses_needed', label: 'Licenses Needed', type: 'textarea', colSpan: 2, group: 'requirements' },
  { key: 'permits_needed', ghlKey: 'permits_needed', label: 'Permits Needed', type: 'textarea', colSpan: 2, group: 'requirements' },
  { key: 'insurance_requirements', ghlKey: 'insurance_requirements', label: 'Insurance Requirements', type: 'textarea', colSpan: 2, group: 'requirements' },

  // --- Resources ---
  { key: 'equipment_needed', ghlKey: 'equipment_needed', label: 'Equipment Needed', type: 'textarea', colSpan: 2, group: 'resources' },
  { key: 'tools_needed', ghlKey: '', label: 'Tools Needed', type: 'textarea', colSpan: 2, group: 'resources' },
  { key: 'inventory_needed', ghlKey: '', label: 'Inventory Needed', type: 'textarea', colSpan: 2, group: 'resources' },
  { key: 'technology_software_needed', ghlKey: 'tech_software_needed', label: 'Technology/Software Needed', type: 'textarea', colSpan: 2, group: 'resources' },

  // --- Location ---
  { key: 'location_type', ghlKey: 'location_type', label: 'Location Type', type: 'dropdown', group: 'location', options: [
    { value: 'Physical', ghlLabel: 'Physical' }, { value: 'Remote', ghlLabel: 'Remote' }, { value: 'Hybrid', ghlLabel: 'Hybrid' },
  ]},
  { key: 'city', ghlKey: 'city', label: 'City', type: 'text', placeholder: 'Okeechobee', group: 'location' },
  { key: 'state', ghlKey: 'state', label: 'State', type: 'text', placeholder: 'FL', group: 'location' },
  { key: 'space_required', ghlKey: 'space_required', label: 'Space Required', type: 'text', placeholder: 'e.g. Retail storefront', group: 'location' },
  { key: 'square_footage_range', ghlKey: 'sqft_range', label: 'Square Footage Range', type: 'text', placeholder: 'e.g. 1,200-2,500 sqft', group: 'location' },
  { key: 'zoning_requirements', ghlKey: 'zoning_requirements', label: 'Zoning Requirements', type: 'text', group: 'location' },

  // --- Market ---
  { key: 'target_customers', ghlKey: 'target_customers', label: 'Target Customers', type: 'textarea', colSpan: 2, group: 'market' },
  { key: 'demand_level', ghlKey: 'demand_level', label: 'Demand Level', type: 'dropdown', group: 'market', options: [
    { value: 'Critical', ghlLabel: 'Critical' }, { value: 'High', ghlLabel: 'High' },
    { value: 'Medium', ghlLabel: 'Medium' }, { value: 'Low', ghlLabel: 'Low' },
  ]},
  { key: 'competition_level', ghlKey: 'competition_level', label: 'Competition Level', type: 'dropdown', group: 'market', options: [
    { value: 'None', ghlLabel: 'None' }, { value: 'Low', ghlLabel: 'Low' },
    { value: 'Medium', ghlLabel: 'Medium' }, { value: 'High', ghlLabel: 'High' },
  ]},
  { key: 'risk_level', ghlKey: 'risk_level', label: 'Risk Level', type: 'dropdown', group: 'market', options: [
    { value: 'Low', ghlLabel: 'Low' }, { value: 'Medium', ghlLabel: 'Medium' }, { value: 'High', ghlLabel: 'High' },
  ]},

  // --- Publishing ---
  { key: 'status', ghlKey: 'opportunity_status', label: 'Status', type: 'dropdown', required: true, group: 'publishing', options: [
    { value: 'available', ghlLabel: 'Available' }, { value: 'taken', ghlLabel: 'Taken' },
    { value: 'coming_soon', ghlLabel: 'Coming Soon' }, { value: 'under_review', ghlLabel: 'Under Review' },
    { value: 'closed', ghlLabel: 'Closed' },
  ]},
  { key: 'assigned_to', ghlKey: 'assigned_to', label: 'Assigned To', type: 'text', placeholder: 'Business name if taken', group: 'publishing' },
  { key: 'featured', ghlKey: 'featured', label: 'Featured', type: 'boolean', group: 'publishing' },
  { key: 'application_required', ghlKey: 'application_required', label: 'Application Required', type: 'boolean', group: 'publishing' },

  // --- Contact ---
  { key: 'contact_name', ghlKey: 'contact_name', label: 'Contact Name', type: 'text', group: 'contact' },
  { key: 'contact_email', ghlKey: 'contact_email', label: 'Contact Email', type: 'text', group: 'contact' },
  { key: 'contact_phone', ghlKey: 'contact_phone', label: 'Contact Phone', type: 'text', group: 'contact' },
  { key: 'website', ghlKey: 'website', label: 'Website', type: 'text', group: 'contact' },

  // --- Sync ---
  { key: 'id', ghlKey: 'supabase_id', label: 'Supabase ID', type: 'hidden', group: 'sync' },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================
export function getFormFields(): BizOppFieldConfig[] {
  return BIZ_OPP_FIELDS.filter(f => f.type !== 'hidden');
}

export function getFieldsByGroup(): Record<string, BizOppFieldConfig[]> {
  const groups: Record<string, BizOppFieldConfig[]> = {};
  for (const f of getFormFields()) {
    const g = f.group || 'other';
    if (!groups[g]) groups[g] = [];
    groups[g].push(f);
  }
  return groups;
}

export const GROUP_LABELS: Record<string, string> = {
  core: 'Basic Information',
  descriptions: 'Descriptions',
  financials: 'Financial Details',
  operations: 'Operations',
  requirements: 'Requirements & Licensing',
  resources: 'Resources & Equipment',
  location: 'Location & Space',
  market: 'Market Analysis',
  publishing: 'Status & Publishing',
  contact: 'Contact Information',
};

// GHL Mapping
export function bizOppToGhlProperties(opp: Record<string, any>): Record<string, any> {
  const props: Record<string, any> = {};
  for (const field of BIZ_OPP_FIELDS) {
    if (!field.ghlKey) continue;
    const val = opp[field.key];
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

export function ghlPropertiesToBizOpp(props: Record<string, any>): Record<string, any> {
  const opp: Record<string, any> = {};
  for (const field of BIZ_OPP_FIELDS) {
    if (!field.ghlKey) continue;
    const val = props[field.ghlKey];
    if (field.type === 'dropdown' && field.options) {
      const raw = Array.isArray(val) ? val[0] : val;
      const opt = field.options.find(o => o.ghlLabel === raw || o.value === raw);
      opp[field.key] = opt?.value || raw || '';
    } else if (field.type === 'boolean') {
      const raw = Array.isArray(val) ? val[0] : val;
      opp[field.key] = raw === 'Yes' || raw === true;
    } else if (field.type === 'number') {
      opp[field.key] = val || 0;
    } else {
      opp[field.key] = val || '';
    }
  }
  return opp;
}
