// Kleegr CRM Configuration
// All Kleegr-related settings are loaded from environment variables
// Never hardcode API keys or sensitive data

export const kleegrConfig = {
  apiKey: process.env.KLEEGR_API_KEY || '',
  locationId: process.env.KLEEGR_LOCATION_ID || '',
  apiBaseUrl: process.env.KLEEGR_API_BASE_URL || 'https://services.leadconnectorhq.com',
  webhookSecret: process.env.KLEEGR_WEBHOOK_SECRET || '',

  pipelines: {
    ats: process.env.KLEEGR_PIPELINE_ATS || '',
    businessIntake: process.env.KLEEGR_PIPELINE_BUSINESS || '',
    investor: process.env.KLEEGR_PIPELINE_INVESTOR || '',
    provider: process.env.KLEEGR_PIPELINE_PROVIDER || '',
    spaceAllocation: process.env.KLEEGR_PIPELINE_SPACE || '',
  },

  customObjects: {
    jobOpenings: process.env.KLEEGR_CO_JOBS || '',
    spaceInventory: process.env.KLEEGR_CO_SPACES || '',
  },
};

export function isKleegrConfigured(): boolean {
  return !!(kleegrConfig.apiKey && kleegrConfig.locationId);
}
