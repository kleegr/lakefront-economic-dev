// GHL Configuration — all IDs and keys come from env/config
// DO NOT hardcode any GHL IDs, field keys, or pipeline IDs

export const ghlConfig = {
  apiBaseUrl: process.env.GHL_API_BASE_URL || 'https://services.leadconnectorhq.com',
  apiKey: process.env.GHL_API_KEY || '',
  locationId: process.env.GHL_LOCATION_ID || '',
  pipelines: {
    ats: process.env.GHL_PIPELINE_ATS || '',
    businessIntake: process.env.GHL_PIPELINE_BUSINESS || '',
    investor: process.env.GHL_PIPELINE_INVESTOR || '',
    serviceProvider: process.env.GHL_PIPELINE_PROVIDER || '',
    spaceAllocation: process.env.GHL_PIPELINE_SPACE || '',
  },
  stages: {
    ats: parseStages(process.env.GHL_STAGES_ATS || ''),
    businessIntake: parseStages(process.env.GHL_STAGES_BUSINESS || ''),
    investor: parseStages(process.env.GHL_STAGES_INVESTOR || ''),
    serviceProvider: parseStages(process.env.GHL_STAGES_PROVIDER || ''),
    spaceAllocation: parseStages(process.env.GHL_STAGES_SPACE || ''),
  },
  customObjects: {
    jobOpenings: process.env.GHL_CO_JOB_OPENINGS || '',
    spaceInventory: process.env.GHL_CO_SPACE_INVENTORY || '',
  },
  contactFields: {
    applicantType: process.env.GHL_CF_APPLICANT_TYPE || '',
    resumeUrl: process.env.GHL_CF_RESUME_URL || '',
    investorProfile: process.env.GHL_CF_INVESTOR_PROFILE || '',
  },
  companyFields: {
    category: process.env.GHL_CF_COMPANY_CATEGORY || '',
    isPublic: process.env.GHL_CF_COMPANY_PUBLIC || '',
    logoUrl: process.env.GHL_CF_COMPANY_LOGO || '',
    description: process.env.GHL_CF_COMPANY_DESC || '',
  },
} as const;

function parseStages(raw: string): Record<string, string> {
  if (!raw) return {};
  return Object.fromEntries(
    raw.split(',').map(pair => {
      const [name, id] = pair.split(':');
      return [name?.trim(), id?.trim()];
    }).filter(([name, id]) => name && id)
  );
}

export function isGHLConfigured(): boolean {
  return Boolean(ghlConfig.apiKey && ghlConfig.locationId);
}
