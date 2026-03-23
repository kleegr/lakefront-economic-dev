// Field definitions for GHL custom fields provisioning.
// These define what custom fields to create on contacts, companies, and opportunities.
// The provisioning script reads these and creates them via API.

export interface FieldDef {
  name: string;
  fieldKey: string; // snake_case key used in code
  dataType: 'TEXT' | 'LARGE_TEXT' | 'NUMERICAL' | 'PHONE' | 'EMAIL' | 'DATE' | 'CHECKBOX' | 'SINGLE_OPTIONS' | 'MULTIPLE_OPTIONS' | 'FILE_UPLOAD' | 'URL';
  placeholder?: string;
  options?: string[]; // for SINGLE_OPTIONS / MULTIPLE_OPTIONS
  folder?: string;
}

// ===== CONTACT CUSTOM FIELDS =====
export const CONTACT_FIELDS: FieldDef[] = [
  { name: 'Current Location', fieldKey: 'current_location', dataType: 'TEXT', folder: 'Lakefront' },
  { name: 'Expected Move Date', fieldKey: 'expected_move_date', dataType: 'DATE', folder: 'Lakefront' },
  { name: 'Under Contract', fieldKey: 'under_contract', dataType: 'CHECKBOX', folder: 'Lakefront' },
  { name: 'Contract Date', fieldKey: 'contract_date', dataType: 'DATE', folder: 'Lakefront' },
  { name: 'Community Commitment Date', fieldKey: 'community_commitment_date', dataType: 'DATE', folder: 'Lakefront' },
  { name: 'Housing Status', fieldKey: 'housing_status', dataType: 'SINGLE_OPTIONS', options: ['Homeowner', 'Renter', 'Under Contract', 'Searching', 'Other'], folder: 'Lakefront' },
  { name: 'Priority Bucket', fieldKey: 'priority_bucket', dataType: 'SINGLE_OPTIONS', options: ['A - Under Contract', 'B - Committed', 'C - Interested', 'D - General'], folder: 'Lakefront Priority' },
  { name: 'Priority Score', fieldKey: 'priority_score', dataType: 'NUMERICAL', folder: 'Lakefront Priority' },
  { name: 'Priority Rank', fieldKey: 'priority_rank', dataType: 'NUMERICAL', folder: 'Lakefront Priority' },
  { name: 'Priority Reason', fieldKey: 'priority_reason', dataType: 'TEXT', folder: 'Lakefront Priority' },
  { name: 'Priority Last Calculated', fieldKey: 'priority_last_calculated_at', dataType: 'DATE', folder: 'Lakefront Priority' },
  { name: 'Work History Summary', fieldKey: 'work_history_summary', dataType: 'LARGE_TEXT', folder: 'Lakefront Employment' },
  { name: 'Skills', fieldKey: 'skills', dataType: 'LARGE_TEXT', folder: 'Lakefront Employment' },
  { name: 'Preferred Industries', fieldKey: 'preferred_industries', dataType: 'TEXT', folder: 'Lakefront Employment' },
  { name: 'Preferred Job Types', fieldKey: 'preferred_job_types', dataType: 'MULTIPLE_OPTIONS', options: ['Full-Time', 'Part-Time', 'Contract', 'Seasonal', 'Internship'], folder: 'Lakefront Employment' },
  { name: 'Salary Expectations', fieldKey: 'salary_expectations', dataType: 'TEXT', folder: 'Lakefront Employment' },
  { name: 'Availability', fieldKey: 'availability', dataType: 'SINGLE_OPTIONS', options: ['Immediately', 'Within 2 Weeks', 'Within 1 Month', 'Within 3 Months', '3+ Months'], folder: 'Lakefront Employment' },
  { name: 'Resume URL', fieldKey: 'resume_url', dataType: 'URL', folder: 'Lakefront Employment' },
  { name: 'Applicant Notes', fieldKey: 'applicant_notes', dataType: 'LARGE_TEXT', folder: 'Lakefront' },
  { name: 'Profile Completeness', fieldKey: 'profile_completeness', dataType: 'NUMERICAL', folder: 'Lakefront' },
  { name: 'Contact Type', fieldKey: 'contact_type', dataType: 'SINGLE_OPTIONS', options: ['Applicant', 'Employer', 'Provider', 'Investor', 'Resident', 'Other'], folder: 'Lakefront' },
];

// ===== COMPANY CUSTOM FIELDS =====
export const COMPANY_FIELDS: FieldDef[] = [
  { name: 'Business Type', fieldKey: 'business_type', dataType: 'SINGLE_OPTIONS', options: ['Retail', 'Food & Beverage', 'Professional Services', 'Healthcare', 'Education', 'Religious', 'Community', 'Other'], folder: 'Lakefront' },
  { name: 'Reason for Interest', fieldKey: 'reason_for_interest', dataType: 'LARGE_TEXT', folder: 'Lakefront' },
  { name: 'Current Locations', fieldKey: 'current_locations', dataType: 'TEXT', folder: 'Lakefront' },
  { name: 'NY Presence', fieldKey: 'ny_presence', dataType: 'CHECKBOX', folder: 'Lakefront' },
  { name: 'FL Presence', fieldKey: 'fl_presence', dataType: 'CHECKBOX', folder: 'Lakefront' },
  { name: 'Expected Footprint (sqft)', fieldKey: 'expected_footprint', dataType: 'NUMERICAL', folder: 'Lakefront' },
  { name: 'Jobs Created', fieldKey: 'jobs_created', dataType: 'NUMERICAL', folder: 'Lakefront' },
  { name: 'Local Jobs Count', fieldKey: 'local_jobs_count', dataType: 'NUMERICAL', folder: 'Lakefront' },
  { name: 'Remote Jobs Count', fieldKey: 'remote_jobs_count', dataType: 'NUMERICAL', folder: 'Lakefront' },
  { name: 'Hybrid Jobs Count', fieldKey: 'hybrid_jobs_count', dataType: 'NUMERICAL', folder: 'Lakefront' },
  { name: 'Back Office Capability', fieldKey: 'back_office_capability', dataType: 'CHECKBOX', folder: 'Lakefront' },
  { name: 'Opening Timeline', fieldKey: 'opening_timeline', dataType: 'TEXT', folder: 'Lakefront' },
  { name: 'Community Fit Score', fieldKey: 'community_fit_score', dataType: 'NUMERICAL', folder: 'Lakefront' },
  { name: 'Approved', fieldKey: 'approved', dataType: 'CHECKBOX', folder: 'Lakefront' },
  { name: 'Provider Category', fieldKey: 'provider_category', dataType: 'SINGLE_OPTIONS', options: ['Construction', 'Maintenance', 'Landscaping', 'Security', 'Cleaning', 'Technology', 'Consulting', 'Catering', 'Other'], folder: 'Lakefront' },
  { name: 'Company Type', fieldKey: 'company_type', dataType: 'SINGLE_OPTIONS', options: ['Business', 'Employer', 'Service Provider', 'Investor Company'], folder: 'Lakefront' },
];

// ===== PIPELINE DEFINITIONS =====
export interface PipelineDef {
  name: string;
  configKey: string; // key in ghlConfig.pipelines
  stages: string[];
}

export const PIPELINE_DEFS: PipelineDef[] = [
  {
    name: 'ATS - Lakefront',
    configKey: 'ats',
    stages: ['New Applicant', 'Under Review', 'Qualified', 'Not Qualified', 'Contacted', 'Interview Scheduled', 'Employer Review', 'Offered', 'Hired', 'Declined', 'Closed'],
  },
  {
    name: 'Business Intake - Lakefront',
    configKey: 'businessIntake',
    stages: ['New Inquiry', 'Reviewing', 'Waiting for Information', 'Good Fit', 'Not a Fit', 'Approved', 'Pending Space', 'Signed', 'Opened', 'Rejected'],
  },
  {
    name: 'Investor - Lakefront',
    configKey: 'investor',
    stages: ['Inquiry', 'Contacted', 'Meeting', 'Due Diligence', 'Committed', 'Closed', 'Declined'],
  },
  {
    name: 'Provider - Lakefront',
    configKey: 'provider',
    stages: ['Inquiry', 'Vetting', 'Approved', 'Active', 'Suspended', 'Rejected'],
  },
  {
    name: 'Space Allocation - Lakefront',
    configKey: 'spaceAllocation',
    stages: ['Inquiry', 'Review', 'Negotiation', 'Reserved', 'Occupied', 'Closed Lost'],
  },
];

// ===== CUSTOM OBJECT DEFINITIONS =====
export interface CustomObjectFieldDef {
  name: string;
  fieldKey: string;
  dataType: string;
  options?: string[];
}

export const JOB_OPENINGS_FIELDS: CustomObjectFieldDef[] = [
  { name: 'External Job Code', fieldKey: 'external_job_code', dataType: 'TEXT' },
  { name: 'Title', fieldKey: 'title', dataType: 'TEXT' },
  { name: 'Slug', fieldKey: 'slug', dataType: 'TEXT' },
  { name: 'Category', fieldKey: 'category', dataType: 'SINGLE_OPTIONS', options: ['Healthcare', 'Retail', 'Education', 'Food & Beverage', 'Professional Services', 'Construction', 'Security', 'Technology', 'Community', 'Other'] },
  { name: 'Department', fieldKey: 'department', dataType: 'TEXT' },
  { name: 'Job Type', fieldKey: 'job_type', dataType: 'SINGLE_OPTIONS', options: ['Full-Time', 'Part-Time', 'Contract', 'Seasonal', 'Internship'] },
  { name: 'Work Mode', fieldKey: 'work_mode', dataType: 'SINGLE_OPTIONS', options: ['On-Site', 'Remote', 'Hybrid'] },
  { name: 'Location', fieldKey: 'location', dataType: 'TEXT' },
  { name: 'Pay Min', fieldKey: 'pay_min', dataType: 'NUMERICAL' },
  { name: 'Pay Max', fieldKey: 'pay_max', dataType: 'NUMERICAL' },
  { name: 'Pay Type', fieldKey: 'pay_type', dataType: 'SINGLE_OPTIONS', options: ['Salary', 'Hourly', 'Commission Only', 'Base + Commission', 'Partnership', 'Equity', 'Other'] },
  { name: 'Description', fieldKey: 'description', dataType: 'LARGE_TEXT' },
  { name: 'Requirements', fieldKey: 'requirements', dataType: 'LARGE_TEXT' },
  { name: 'Benefits', fieldKey: 'benefits', dataType: 'LARGE_TEXT' },
  { name: 'Openings Count', fieldKey: 'openings_count', dataType: 'NUMERICAL' },
  { name: 'Status', fieldKey: 'status', dataType: 'SINGLE_OPTIONS', options: ['Draft', 'Published', 'Paused', 'Filled', 'Closed'] },
  { name: 'Is Public', fieldKey: 'is_public', dataType: 'CHECKBOX' },
  { name: 'Posted Date', fieldKey: 'posted_date', dataType: 'DATE' },
  { name: 'Closing Date', fieldKey: 'closing_date', dataType: 'DATE' },
  { name: 'Target Residents Only', fieldKey: 'target_residents_only', dataType: 'CHECKBOX' },
  { name: 'Notes', fieldKey: 'notes', dataType: 'LARGE_TEXT' },
];

export const COMMERCIAL_SPACES_FIELDS: CustomObjectFieldDef[] = [
  { name: 'External Space Code', fieldKey: 'external_space_code', dataType: 'TEXT' },
  { name: 'Name', fieldKey: 'name', dataType: 'TEXT' },
  { name: 'Slug', fieldKey: 'slug', dataType: 'TEXT' },
  { name: 'Type', fieldKey: 'type', dataType: 'SINGLE_OPTIONS', options: ['Retail', 'Office', 'Warehouse', 'Mixed-Use', 'Medical', 'Restaurant'] },
  { name: 'Square Footage', fieldKey: 'sqft', dataType: 'NUMERICAL' },
  { name: 'Monthly Rate', fieldKey: 'monthly_rate', dataType: 'NUMERICAL' },
  { name: 'Building', fieldKey: 'building', dataType: 'TEXT' },
  { name: 'Floor', fieldKey: 'floor', dataType: 'TEXT' },
  { name: 'Unit', fieldKey: 'unit', dataType: 'TEXT' },
  { name: 'Amenities', fieldKey: 'amenities', dataType: 'LARGE_TEXT' },
  { name: 'Status', fieldKey: 'status', dataType: 'SINGLE_OPTIONS', options: ['Available', 'Reserved', 'Occupied', 'Under Renovation', 'Not Available'] },
  { name: 'Available Date', fieldKey: 'available_date', dataType: 'DATE' },
  { name: 'Notes', fieldKey: 'notes', dataType: 'LARGE_TEXT' },
  { name: 'Is Public', fieldKey: 'is_public', dataType: 'CHECKBOX' },
];
