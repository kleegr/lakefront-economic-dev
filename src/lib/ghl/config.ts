// GoHighLevel / Kleegr Configuration
// All settings loaded from environment variables - never hardcode secrets.

export const ghlConfig = {
  token: process.env.GHL_PRIVATE_INTEGRATION_TOKEN || process.env.KLEEGR_API_KEY || '',
  locationId: process.env.GHL_LOCATION_ID || process.env.KLEEGR_LOCATION_ID || '',
  baseUrl: process.env.GHL_BASE_URL || process.env.KLEEGR_API_BASE_URL || 'https://services.leadconnectorhq.com',
  webhookSecret: process.env.GHL_WEBHOOK_SECRET || process.env.KLEEGR_WEBHOOK_SECRET || '',

  pipelines: {
    ats: process.env.GHL_PIPELINE_ATS || process.env.KLEEGR_PIPELINE_ATS || '',
    businessIntake: process.env.GHL_PIPELINE_BUSINESS || process.env.KLEEGR_PIPELINE_BUSINESS || '',
    investor: process.env.GHL_PIPELINE_INVESTOR || process.env.KLEEGR_PIPELINE_INVESTOR || '',
    provider: process.env.GHL_PIPELINE_PROVIDER || process.env.KLEEGR_PIPELINE_PROVIDER || '',
    spaceAllocation: process.env.GHL_PIPELINE_SPACE || process.env.KLEEGR_PIPELINE_SPACE || '',
  },

  customObjects: {
    jobOpenings: process.env.GHL_CO_JOBS || process.env.KLEEGR_CO_JOBS || '',
    spaceInventory: process.env.GHL_CO_SPACES || process.env.KLEEGR_CO_SPACES || '',
  },
};

export const kleegrConfig = ghlConfig;

export function isGhlConfigured(): boolean {
  return !!(ghlConfig.token && ghlConfig.locationId);
}

export const isKleegrConfigured = isGhlConfigured;
