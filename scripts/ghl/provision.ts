#!/usr/bin/env ts-node
/**
 * GHL Provisioning Script
 * Creates custom fields, custom objects, and field folders.
 * Pipeline creation is NOT supported by API — see docs/ghl-manual-setup.md.
 *
 * Usage:
 *   GHL_PRIVATE_INTEGRATION_TOKEN=pit-xxx GHL_LOCATION_ID=xxx npx ts-node scripts/ghl/provision.ts
 *
 * Output: .generated/ghl-manifest.json
 */

import * as fs from 'fs';
import * as path from 'path';

// Inline config to avoid Next.js module resolution
const GHL_TOKEN = process.env.GHL_PRIVATE_INTEGRATION_TOKEN || process.env.KLEEGR_API_KEY || '';
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || process.env.KLEEGR_LOCATION_ID || '';
const GHL_BASE_URL = process.env.GHL_BASE_URL || 'https://services.leadconnectorhq.com';

if (!GHL_TOKEN || !GHL_LOCATION_ID) {
  console.error('ERROR: Set GHL_PRIVATE_INTEGRATION_TOKEN and GHL_LOCATION_ID');
  process.exit(1);
}

const headers = {
  'Authorization': `Bearer ${GHL_TOKEN}`,
  'Content-Type': 'application/json',
  'Version': '2021-07-28',
};

async function apiCall(method: string, endpoint: string, body?: any) {
  const url = `${GHL_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`  API Error ${res.status}: ${text.substring(0, 200)}`);
    return null;
  }
  return text ? JSON.parse(text) : {};
}

// Import field definitions
const { CONTACT_FIELDS, COMPANY_FIELDS, JOB_OPENINGS_FIELDS, COMMERCIAL_SPACES_FIELDS } = require('../../src/lib/ghl/field-definitions');

interface Manifest {
  provisionedAt: string;
  locationId: string;
  contactFields: Record<string, string>;
  companyFields: Record<string, string>;
  customObjects: Record<string, string>;
  jobOpeningsFields: Record<string, string>;
  spacesFields: Record<string, string>;
}

async function provision() {
  console.log('=== GHL Provisioning ===');
  console.log(`Location: ${GHL_LOCATION_ID}`);
  console.log();

  const manifest: Manifest = {
    provisionedAt: new Date().toISOString(),
    locationId: GHL_LOCATION_ID,
    contactFields: {},
    companyFields: {},
    customObjects: {},
    jobOpeningsFields: {},
    spacesFields: {},
  };

  // 1. Create Contact Custom Fields
  console.log('1. Creating Contact Custom Fields...');
  for (const field of CONTACT_FIELDS) {
    console.log(`  Creating: ${field.name}`);
    const body: any = {
      name: field.name,
      dataType: field.dataType,
      model: 'contact',
      placeholder: field.placeholder || '',
    };
    if (field.options) body.options = field.options.map((o: string) => ({ value: o }));
    const result = await apiCall('POST', `/locations/${GHL_LOCATION_ID}/customFields`, body);
    if (result?.customField?.id) {
      manifest.contactFields[field.fieldKey] = result.customField.id;
      console.log(`    ✓ ID: ${result.customField.id}`);
    } else {
      console.log('    ✗ Failed or already exists');
    }
  }

  // 2. Create Company Custom Fields
  console.log('\n2. Creating Company Custom Fields...');
  for (const field of COMPANY_FIELDS) {
    console.log(`  Creating: ${field.name}`);
    const body: any = {
      name: field.name,
      dataType: field.dataType,
      model: 'company',
      placeholder: field.placeholder || '',
    };
    if (field.options) body.options = field.options.map((o: string) => ({ value: o }));
    const result = await apiCall('POST', `/locations/${GHL_LOCATION_ID}/customFields`, body);
    if (result?.customField?.id) {
      manifest.companyFields[field.fieldKey] = result.customField.id;
      console.log(`    ✓ ID: ${result.customField.id}`);
    } else {
      console.log('    ✗ Failed or already exists');
    }
  }

  // 3. Create Custom Objects
  console.log('\n3. Creating Custom Objects...');

  console.log('  Creating: Job Openings');
  const jobObj = await apiCall('POST', '/custom-objects/', {
    locationId: GHL_LOCATION_ID,
    key: 'job_openings',
    name: 'Job Openings',
    description: 'Lakefront job postings',
  });
  if (jobObj?.id || jobObj?.key) {
    manifest.customObjects.jobOpenings = jobObj.key || jobObj.id;
    console.log(`    ✓ Key: ${manifest.customObjects.jobOpenings}`);
  } else {
    console.log('    ✗ Failed or already exists');
  }

  console.log('  Creating: Commercial Spaces');
  const spaceObj = await apiCall('POST', '/custom-objects/', {
    locationId: GHL_LOCATION_ID,
    key: 'commercial_spaces',
    name: 'Commercial Spaces',
    description: 'Lakefront commercial space inventory',
  });
  if (spaceObj?.id || spaceObj?.key) {
    manifest.customObjects.spaceInventory = spaceObj.key || spaceObj.id;
    console.log(`    ✓ Key: ${manifest.customObjects.spaceInventory}`);
  } else {
    console.log('    ✗ Failed or already exists');
  }

  // 4. Pipeline verification
  console.log('\n4. Checking Pipelines (read-only — must be created manually)...');
  const pipelines = await apiCall('GET', `/opportunities/pipelines?locationId=${GHL_LOCATION_ID}`);
  if (pipelines?.pipelines) {
    console.log(`  Found ${pipelines.pipelines.length} pipeline(s):`);
    for (const p of pipelines.pipelines) {
      console.log(`    - ${p.name} (${p.id}) — ${p.stages?.length || 0} stages`);
    }
  } else {
    console.log('  No pipelines found. Create them manually — see docs/ghl-manual-setup.md');
  }

  // Save manifest
  const outDir = path.join(process.cwd(), '.generated');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const manifestPath = path.join(outDir, 'ghl-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n✓ Manifest saved to ${manifestPath}`);
  console.log('\nDone. Set the custom object keys in your .env:');
  if (manifest.customObjects.jobOpenings) console.log(`  GHL_CO_JOBS=${manifest.customObjects.jobOpenings}`);
  if (manifest.customObjects.spaceInventory) console.log(`  GHL_CO_SPACES=${manifest.customObjects.spaceInventory}`);
}

provision().catch(err => { console.error('Provisioning failed:', err); process.exit(1); });
