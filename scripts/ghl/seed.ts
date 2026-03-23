#!/usr/bin/env ts-node
/**
 * GHL Seed Script — seeds test data from mock-data into GHL.
 * Uses existing mock-data.ts as the data source.
 *
 * Usage:
 *   GHL_PRIVATE_INTEGRATION_TOKEN=pit-xxx GHL_LOCATION_ID=xxx npx ts-node scripts/ghl/seed.ts
 */

const SEED_TOKEN = process.env.GHL_PRIVATE_INTEGRATION_TOKEN || process.env.KLEEGR_API_KEY || '';
const SEED_LOC = process.env.GHL_LOCATION_ID || process.env.KLEEGR_LOCATION_ID || '';
const SEED_BASE = process.env.GHL_BASE_URL || 'https://services.leadconnectorhq.com';

if (!SEED_TOKEN || !SEED_LOC) { console.error('Set GHL_PRIVATE_INTEGRATION_TOKEN and GHL_LOCATION_ID'); process.exit(1); }

const sh = { 'Authorization': `Bearer ${SEED_TOKEN}`, 'Content-Type': 'application/json', 'Version': '2021-07-28' };

async function post(ep: string, body: any) {
  const r = await fetch(`${SEED_BASE}${ep}`, { method: 'POST', headers: sh, body: JSON.stringify(body) });
  const t = await r.text();
  return r.ok ? (t ? JSON.parse(t) : {}) : null;
}

async function seed() {
  console.log('=== GHL Seed ===\n');

  // Seed sample contacts as applicants
  const applicants = [
    { firstName: 'David', lastName: 'Cohen', email: 'david.cohen@example.com', phone: '+18631234567' },
    { firstName: 'Sarah', lastName: 'Levy', email: 'sarah.levy@example.com', phone: '+18631234568' },
    { firstName: 'Moshe', lastName: 'Stern', email: 'moshe.stern@example.com', phone: '+18631234569' },
  ];

  console.log('Seeding applicant contacts...');
  for (const a of applicants) {
    const result = await post('/contacts/', { ...a, locationId: SEED_LOC, source: 'Seed Script' });
    if (result?.contact?.id) {
      console.log(`  ✓ ${a.firstName} ${a.lastName} → ${result.contact.id}`);
    } else {
      console.log(`  ✗ ${a.firstName} ${a.lastName} — may already exist`);
    }
  }

  // Seed sample companies
  const companies = [
    { name: 'Lakefront Medical Center', email: 'info@lakefrontmedical.com' },
    { name: 'Community Grocery', email: 'info@communitygrocery.com' },
    { name: 'Lakefront Restaurant Group', email: 'info@lakefrontdining.com' },
  ];

  console.log('\nSeeding companies...');
  for (const c of companies) {
    const result = await post('/companies/', { ...c, locationId: SEED_LOC });
    if (result?.company?.id) {
      console.log(`  ✓ ${c.name} → ${result.company.id}`);
    } else {
      console.log(`  ✗ ${c.name} — may already exist`);
    }
  }

  console.log('\nDone.');
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
