#!/usr/bin/env ts-node
/**
 * GHL Verification Script
 * Confirms required objects, fields, and pipelines exist.
 *
 * Usage:
 *   GHL_PRIVATE_INTEGRATION_TOKEN=pit-xxx GHL_LOCATION_ID=xxx npx ts-node scripts/ghl/verify.ts
 */

const TOKEN = process.env.GHL_PRIVATE_INTEGRATION_TOKEN || process.env.KLEEGR_API_KEY || '';
const LOC_ID = process.env.GHL_LOCATION_ID || process.env.KLEEGR_LOCATION_ID || '';
const BASE = process.env.GHL_BASE_URL || 'https://services.leadconnectorhq.com';

if (!TOKEN || !LOC_ID) { console.error('Set GHL_PRIVATE_INTEGRATION_TOKEN and GHL_LOCATION_ID'); process.exit(1); }

const h = { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json', 'Version': '2021-07-28' };

async function get(ep: string) {
  const r = await fetch(`${BASE}${ep}`, { headers: h });
  return r.ok ? r.json() : null;
}

async function verify() {
  let pass = 0, fail = 0;
  const check = (label: string, ok: boolean) => { ok ? pass++ : fail++; console.log(`  ${ok ? '✓' : '✗'} ${label}`); };

  console.log('=== GHL Verification ===\n');

  // 1. Location
  console.log('1. Location');
  const loc = await get(`/locations/${LOC_ID}`);
  check('Location accessible', !!loc);

  // 2. Custom Fields
  console.log('\n2. Contact Custom Fields');
  const cf = await get(`/locations/${LOC_ID}/customFields?model=contact`);
  const contactFieldCount = cf?.customFields?.length || 0;
  check(`Contact fields found: ${contactFieldCount}`, contactFieldCount > 0);

  console.log('\n3. Company Custom Fields');
  const ccf = await get(`/locations/${LOC_ID}/customFields?model=company`);
  const companyFieldCount = ccf?.customFields?.length || 0;
  check(`Company fields found: ${companyFieldCount}`, companyFieldCount > 0);

  // 3. Pipelines
  console.log('\n4. Pipelines');
  const pipes = await get(`/opportunities/pipelines?locationId=${LOC_ID}`);
  const pipeCount = pipes?.pipelines?.length || 0;
  check(`Pipelines found: ${pipeCount}`, pipeCount >= 5);
  if (pipes?.pipelines) {
    for (const p of pipes.pipelines) {
      console.log(`     ${p.name}: ${p.stages?.length || 0} stages`);
    }
  }

  // 4. Custom Objects
  console.log('\n5. Custom Objects');
  const cos = await get(`/custom-objects/?locationId=${LOC_ID}`);
  const coCount = cos?.customObjects?.length || cos?.length || 0;
  check(`Custom objects found: ${coCount}`, coCount >= 2);

  // 5. Env var checks
  console.log('\n6. Environment Variables');
  const envChecks = [
    ['GHL_PRIVATE_INTEGRATION_TOKEN', TOKEN],
    ['GHL_LOCATION_ID', LOC_ID],
    ['GHL_PIPELINE_ATS', process.env.GHL_PIPELINE_ATS || process.env.KLEEGR_PIPELINE_ATS],
    ['GHL_PIPELINE_BUSINESS', process.env.GHL_PIPELINE_BUSINESS || process.env.KLEEGR_PIPELINE_BUSINESS],
    ['GHL_PIPELINE_INVESTOR', process.env.GHL_PIPELINE_INVESTOR || process.env.KLEEGR_PIPELINE_INVESTOR],
    ['GHL_PIPELINE_PROVIDER', process.env.GHL_PIPELINE_PROVIDER || process.env.KLEEGR_PIPELINE_PROVIDER],
    ['GHL_PIPELINE_SPACE', process.env.GHL_PIPELINE_SPACE || process.env.KLEEGR_PIPELINE_SPACE],
    ['GHL_CO_JOBS', process.env.GHL_CO_JOBS || process.env.KLEEGR_CO_JOBS],
    ['GHL_CO_SPACES', process.env.GHL_CO_SPACES || process.env.KLEEGR_CO_SPACES],
  ];
  for (const [name, val] of envChecks) {
    check(`${name} set`, !!val);
  }

  console.log(`\n=== Results: ${pass} passed, ${fail} failed ===`);
  process.exit(fail > 0 ? 1 : 0);
}

verify().catch(err => { console.error('Verification failed:', err); process.exit(1); });
