# GoHighLevel Manual Setup Guide

Some GHL resources **cannot be created via API** and must be configured manually in the GHL admin UI.

## What CAN be provisioned by API

| Resource | API Support | Notes |
|----------|------------|-------|
| Custom Fields (Contact) | ✅ Yes | `POST /locations/{locationId}/customFields` |
| Custom Fields (Company) | ✅ Yes | Same endpoint, model param |
| Custom Objects | ✅ Yes (v2) | `POST /custom-objects/` |
| Custom Object Records | ✅ Yes | `POST /custom-objects/{schemaKey}/records` |
| Custom Values | ✅ Yes | `POST /locations/{locationId}/customValues` |
| Contacts | ✅ Yes | Full CRUD |
| Companies | ✅ Yes | Full CRUD |
| Opportunities | ✅ Yes | Full CRUD |

## What MUST be created manually

### 1. Pipelines and Stages

**GHL does NOT support pipeline creation via API.** The `/opportunities/pipelines` endpoint is read-only.

You must create the following 5 pipelines manually in GHL:

#### Pipeline: ATS - Lakefront
Stages (in order):
1. New Applicant
2. Under Review
3. Qualified
4. Not Qualified
5. Contacted
6. Interview Scheduled
7. Employer Review
8. Offered
9. Hired
10. Declined
11. Closed

#### Pipeline: Business Intake - Lakefront
Stages (in order):
1. New Inquiry
2. Reviewing
3. Waiting for Information
4. Good Fit
5. Not a Fit
6. Approved
7. Pending Space
8. Signed
9. Opened
10. Rejected

#### Pipeline: Investor - Lakefront
Stages (in order):
1. Inquiry
2. Contacted
3. Meeting
4. Due Diligence
5. Committed
6. Closed
7. Declined

#### Pipeline: Provider - Lakefront
Stages (in order):
1. Inquiry
2. Vetting
3. Approved
4. Active
5. Suspended
6. Rejected

#### Pipeline: Space Allocation - Lakefront
Stages (in order):
1. Inquiry
2. Review
3. Negotiation
4. Reserved
5. Occupied
6. Closed Lost

### 2. After Creating Pipelines

After creating the pipelines manually:

1. Go to **Settings → Pipelines** in GHL
2. Click each pipeline to see its ID in the URL
3. Set these env vars in Vercel:

```
GHL_PIPELINE_ATS=<pipeline-id>
GHL_PIPELINE_BUSINESS=<pipeline-id>
GHL_PIPELINE_INVESTOR=<pipeline-id>
GHL_PIPELINE_PROVIDER=<pipeline-id>
GHL_PIPELINE_SPACE=<pipeline-id>
```

### 3. Workflows / Automations

**GHL does NOT support workflow creation via API.** Any automation workflows (e.g., email triggers, stage-change actions) must be created manually in the Automations section.

Recommended workflows:
- New Applicant → Send confirmation email
- Stage change to "Hired" → Notify admin
- New Business Inquiry → Notify admin
- New Investor Lead → Notify admin

### 4. Association Definitions

GHL's API for defining associations between contacts, companies, opportunities, and custom objects is limited. Associations may need to be configured manually in the admin UI when linking:
- Contacts to Companies
- Opportunities to Custom Object records
- Companies to Custom Object records (Spaces)

## Running Provisioning After Manual Setup

```bash
# 1. Set env vars
export GHL_PRIVATE_INTEGRATION_TOKEN=pit-xxx
export GHL_LOCATION_ID=xxx

# 2. Run provisioning (creates custom fields + custom objects)
npx ts-node scripts/ghl/provision.ts

# 3. Verify everything exists
npx ts-node scripts/ghl/verify.ts

# 4. Seed test data (optional)
npx ts-node scripts/ghl/seed.ts
```

## Env Vars Required

| Variable | Source | Required |
|----------|--------|----------|
| `GHL_PRIVATE_INTEGRATION_TOKEN` | GHL Marketplace → Private Integrations | Yes |
| `GHL_LOCATION_ID` | GHL URL when viewing location | Yes |
| `GHL_BASE_URL` | Default: `https://services.leadconnectorhq.com` | No |
| `GHL_PIPELINE_ATS` | Manual: copy from GHL UI after creation | Yes |
| `GHL_PIPELINE_BUSINESS` | Manual: copy from GHL UI after creation | Yes |
| `GHL_PIPELINE_INVESTOR` | Manual: copy from GHL UI after creation | Yes |
| `GHL_PIPELINE_PROVIDER` | Manual: copy from GHL UI after creation | Yes |
| `GHL_PIPELINE_SPACE` | Manual: copy from GHL UI after creation | Yes |
| `GHL_CO_JOBS` | Auto: set after provisioning script runs | Yes |
| `GHL_CO_SPACES` | Auto: set after provisioning script runs | Yes |
