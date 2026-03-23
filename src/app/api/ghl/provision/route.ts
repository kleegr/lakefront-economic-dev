import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

const GHL_BASE = 'https://services.leadconnectorhq.com';

async function ghlApi(method: string, endpoint: string, token: string, body?: any) {
  const url = `${GHL_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Version': '2021-07-28' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    if (!res.ok) return { ok: false, status: res.status, error: text.substring(0, 300) };
    return { ok: true, data: text ? JSON.parse(text) : {} };
  } catch (err: any) {
    return { ok: false, status: 0, error: err.message || 'Network error' };
  }
}

// GHL API notes:
// - CHECKBOX requires options (it's a multi-checkbox, not a toggle)
// - For yes/no toggles, use SINGLE_OPTIONS with ['Yes','No']
// - Options must be plain strings in array
// - model: 'contact' or 'opportunity' only (not 'company')
// - Folders for contact fields must be created manually in GHL UI

// Contact fields organized by logical folder groups
const CONTACT_FIELDS = [
  // -- Lakefront Housing --
  { name: 'Current Location', dataType: 'TEXT' },
  { name: 'Expected Move Date', dataType: 'DATE' },
  { name: 'Under Contract', dataType: 'SINGLE_OPTIONS', options: ['Yes', 'No'] },
  { name: 'Contract Date', dataType: 'DATE' },
  { name: 'Community Commitment Date', dataType: 'DATE' },
  { name: 'Housing Status', dataType: 'SINGLE_OPTIONS', options: ['Homeowner', 'Renter', 'Under Contract', 'Searching', 'Other'] },
  // -- Lakefront Priority --
  { name: 'Priority Bucket', dataType: 'SINGLE_OPTIONS', options: ['A - Under Contract', 'B - Committed', 'C - Interested', 'D - General'] },
  { name: 'Priority Score', dataType: 'NUMERICAL' },
  { name: 'Priority Rank', dataType: 'NUMERICAL' },
  { name: 'Priority Reason', dataType: 'TEXT' },
  { name: 'Priority Last Calculated', dataType: 'DATE' },
  // -- Lakefront Employment --
  { name: 'Work History Summary', dataType: 'LARGE_TEXT' },
  { name: 'Skills', dataType: 'LARGE_TEXT' },
  { name: 'Preferred Industries', dataType: 'TEXT' },
  { name: 'Preferred Job Types', dataType: 'MULTIPLE_OPTIONS', options: ['Full-Time', 'Part-Time', 'Contract', 'Seasonal', 'Internship'] },
  { name: 'Salary Expectations', dataType: 'TEXT' },
  { name: 'Availability', dataType: 'SINGLE_OPTIONS', options: ['Immediately', 'Within 2 Weeks', 'Within 1 Month', 'Within 3 Months', '3+ Months'] },
  { name: 'Resume URL', dataType: 'TEXT' },
  // -- Lakefront General --
  { name: 'Applicant Notes', dataType: 'LARGE_TEXT' },
  { name: 'Profile Completeness', dataType: 'NUMERICAL' },
  { name: 'Contact Type', dataType: 'SINGLE_OPTIONS', options: ['Applicant', 'Employer', 'Provider', 'Investor', 'Resident', 'Other'] },
  // -- Company fields on contact (Co: prefix) --
  { name: 'Co: Business Type', dataType: 'SINGLE_OPTIONS', options: ['Retail', 'Food & Beverage', 'Professional Services', 'Healthcare', 'Education', 'Religious', 'Community', 'Other'] },
  { name: 'Co: Reason for Interest', dataType: 'LARGE_TEXT' },
  { name: 'Co: Current Locations', dataType: 'TEXT' },
  { name: 'Co: NY Presence', dataType: 'SINGLE_OPTIONS', options: ['Yes', 'No'] },
  { name: 'Co: FL Presence', dataType: 'SINGLE_OPTIONS', options: ['Yes', 'No'] },
  { name: 'Co: Expected Footprint', dataType: 'NUMERICAL' },
  { name: 'Co: Jobs Created', dataType: 'NUMERICAL' },
  { name: 'Co: Local Jobs Count', dataType: 'NUMERICAL' },
  { name: 'Co: Remote Jobs Count', dataType: 'NUMERICAL' },
  { name: 'Co: Opening Timeline', dataType: 'TEXT' },
  { name: 'Co: Community Fit Score', dataType: 'NUMERICAL' },
  { name: 'Co: Approved', dataType: 'SINGLE_OPTIONS', options: ['Yes', 'No'] },
  { name: 'Co: Provider Category', dataType: 'SINGLE_OPTIONS', options: ['Construction', 'Maintenance', 'Landscaping', 'Security', 'Cleaning', 'Technology', 'Consulting', 'Catering', 'Other'] },
  { name: 'Co: Company Type', dataType: 'SINGLE_OPTIONS', options: ['Business', 'Employer', 'Service Provider', 'Investor Company'] },
];

// Opportunity custom fields
const OPPORTUNITY_FIELDS = [
  { name: 'Job Reference', dataType: 'TEXT' },
  { name: 'Application Source', dataType: 'SINGLE_OPTIONS', options: ['Portal', 'Referral', 'Walk-in', 'Website', 'Other'] },
  { name: 'Interview Date', dataType: 'DATE' },
  { name: 'Reviewer Notes', dataType: 'LARGE_TEXT' },
  { name: 'Space Reference', dataType: 'TEXT' },
  { name: 'Investment Amount', dataType: 'NUMERICAL' },
  { name: 'Opp Type', dataType: 'SINGLE_OPTIONS', options: ['ATS', 'Business', 'Investor', 'Provider', 'Space'] },
];

function buildFieldBody(field: { name: string; dataType: string; options?: string[] }, model: string) {
  const fb: any = { name: field.name, dataType: field.dataType, model };
  if (field.options && field.options.length > 0) {
    fb.options = field.options;
  }
  return fb;
}

async function createField(locationId: string, token: string, field: any, model: string, log: string[], results: Record<string, string>) {
  const fb = buildFieldBody(field, model);
  const res = await ghlApi('POST', `/locations/${locationId}/customFields`, token, fb);
  if (res.ok && res.data?.customField?.id) {
    results[field.name] = res.data.customField.id;
    log.push(`OK ${field.name} = ${res.data.customField.id}`);
  } else {
    const errMsg = res.error || '';
    if (errMsg.includes('already exists')) {
      log.push(`EXISTS ${field.name}`);
    } else {
      log.push(`FAIL ${field.name} - ${errMsg.substring(0, 150)}`);
    }
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { data: profile } = await supabase.from('lf_profiles').select('role').eq('id', user.id).maybeSingle();
  if (!profile || !['super_admin', 'admin'].includes(profile.role)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const body = await req.json();
  const token = body.token || '';
  const locationId = body.locationId || '';
  const action = body.action || 'provision';
  if (!token || !locationId) return NextResponse.json({ error: 'token and locationId are required' }, { status: 400 });

  const log: string[] = [];
  const results: Record<string, any> = {};

  // ===== VERIFY =====
  if (action === 'verify') {
    log.push('=== GHL Verification ===');
    log.push('');

    const loc = await ghlApi('GET', `/locations/${locationId}`, token);
    log.push(loc.ok ? 'OK Location accessible' : 'FAIL Location: ' + (loc.error || ''));
    results.location = loc.ok;

    log.push('');
    log.push('--- Contact Custom Fields ---');
    const cf = await ghlApi('GET', `/locations/${locationId}/customFields?model=contact`, token);
    const allFields = cf.ok ? (cf.data?.customFields || []) : [];
    log.push(`Total: ${allFields.length} fields`);
    // Show Lakefront-related fields
    for (const f of allFields) {
      if (f.name?.includes('Co:') || f.name?.includes('Priority') || f.name?.includes('Contract') ||
          f.name?.includes('Housing') || f.name?.includes('Availability') || f.name?.includes('Resume') ||
          f.name?.includes('Skills') || f.name?.includes('Contact Type') || f.name?.includes('Preferred') ||
          f.name?.includes('Applicant') || f.name?.includes('Profile') || f.name?.includes('Current Location') ||
          f.name?.includes('Expected Move') || f.name?.includes('Under Contract') || f.name?.includes('Community') ||
          f.name?.includes('Work History') || f.name?.includes('Salary')) {
        log.push(`  ${f.name} [${f.dataType}] (${f.id})`);
      }
    }
    results.contactFields = allFields.length;

    log.push('');
    log.push('--- Opportunity Custom Fields ---');
    const ocf = await ghlApi('GET', `/locations/${locationId}/customFields?model=opportunity`, token);
    const oppFields = ocf.ok ? (ocf.data?.customFields || []) : [];
    log.push(`Total: ${oppFields.length} fields`);
    for (const f of oppFields) {
      log.push(`  ${f.name} [${f.dataType}] (${f.id})`);
    }
    results.opportunityFields = oppFields.length;

    log.push('');
    log.push('--- Pipelines ---');
    const pipes = await ghlApi('GET', `/opportunities/pipelines?locationId=${locationId}`, token);
    const pipeList = pipes.ok ? (pipes.data?.pipelines || []) : [];
    log.push(`Total: ${pipeList.length} pipelines`);
    for (const p of pipeList) {
      log.push(`  ${p.name} (${p.id}) - ${p.stages?.length || 0} stages`);
      if (p.stages) {
        for (const s of p.stages) log.push(`    ${s.name} (${s.id})`);
      }
    }
    results.pipelines = pipeList.map((p: any) => ({
      name: p.name, id: p.id, stages: p.stages?.length || 0,
      stageList: p.stages?.map((s: any) => ({ name: s.name, id: s.id })) || []
    }));

    log.push('');
    log.push('--- Contacts & Companies ---');
    const contacts = await ghlApi('GET', `/contacts/?locationId=${locationId}&limit=1`, token);
    results.totalContacts = contacts.ok ? (contacts.data?.meta?.total || contacts.data?.contacts?.length || 0) : 0;
    log.push(`Contacts: ${results.totalContacts}`);

    const companies = await ghlApi('GET', `/companies/?locationId=${locationId}&limit=1`, token);
    results.totalCompanies = companies.ok ? (companies.data?.meta?.total || companies.data?.companies?.length || 0) : 0;
    log.push(`Companies: ${results.totalCompanies}`);

    log.push('');
    log.push('=== Verification complete ===');
    return NextResponse.json({ action: 'verify', log, results });
  }

  // ===== PROVISION =====
  if (action === 'provision') {
    log.push('=== GHL Provisioning ===');
    log.push(`Location: ${locationId}`);
    log.push('');

    // Contact custom fields
    log.push('--- Contact Custom Fields (all Lakefront fields) ---');
    const contactFieldIds: Record<string, string> = {};
    for (const field of CONTACT_FIELDS) {
      await createField(locationId, token, field, 'contact', log, contactFieldIds);
    }
    results.contactFields = contactFieldIds;

    // Opportunity custom fields
    log.push('');
    log.push('--- Opportunity Custom Fields ---');
    const oppFieldIds: Record<string, string> = {};
    for (const field of OPPORTUNITY_FIELDS) {
      await createField(locationId, token, field, 'opportunity', log, oppFieldIds);
    }
    results.opportunityFields = oppFieldIds;

    // Pipelines (read-only check)
    log.push('');
    log.push('--- Pipelines (read-only check) ---');
    const pipes = await ghlApi('GET', `/opportunities/pipelines?locationId=${locationId}`, token);
    if (pipes.ok && pipes.data?.pipelines) {
      results.pipelines = pipes.data.pipelines.map((p: any) => ({ name: p.name, id: p.id, stages: p.stages?.length || 0 }));
      for (const p of pipes.data.pipelines) log.push(`  ${p.name} (${p.id}) - ${p.stages?.length || 0} stages`);
    } else {
      log.push('  No pipelines found');
      results.pipelines = [];
    }

    log.push('');
    log.push('--- MANUAL: Organize fields into folders ---');
    log.push('Go to GHL > Settings > Custom Fields and create these folders:');
    log.push('  1. "Lakefront Housing" - move: Current Location, Expected Move Date, Under Contract, Contract Date, Community Commitment Date, Housing Status');
    log.push('  2. "Lakefront Priority" - move: Priority Bucket, Priority Score, Priority Rank, Priority Reason, Priority Last Calculated');
    log.push('  3. "Lakefront Employment" - move: Work History Summary, Skills, Preferred Industries, Preferred Job Types, Salary Expectations, Availability, Resume URL');
    log.push('  4. "Lakefront General" - move: Applicant Notes, Profile Completeness, Contact Type');
    log.push('  5. "Company Info" - move: all Co: fields');
    log.push('');
    log.push('=== Provisioning complete ===');
    return NextResponse.json({ action: 'provision', log, results });
  }

  // ===== SEED =====
  if (action === 'seed') {
    log.push('=== GHL Seed Data ===');
    log.push('');

    const applicants = [
      { firstName: 'David', lastName: 'Cohen', email: 'david.cohen@example.com', phone: '+18631234567' },
      { firstName: 'Sarah', lastName: 'Levy', email: 'sarah.levy@example.com', phone: '+18631234568' },
      { firstName: 'Moshe', lastName: 'Stern', email: 'moshe.stern@example.com', phone: '+18631234569' },
      { firstName: 'Rachel', lastName: 'Goldberg', email: 'rachel.goldberg@example.com', phone: '+18631234570' },
      { firstName: 'Yossi', lastName: 'Friedman', email: 'yossi.friedman@example.com', phone: '+18631234571' },
    ];
    log.push('--- Seeding Contacts ---');
    for (const a of applicants) {
      const res = await ghlApi('POST', '/contacts/', token, { ...a, locationId, source: 'Lakefront Seed' });
      if (res.ok) log.push(`OK ${a.firstName} ${a.lastName} = ${res.data?.contact?.id || 'created'}`);
      else log.push(`SKIP ${a.firstName} ${a.lastName}`);
    }

    log.push('');
    log.push('=== Seed complete ===');
    return NextResponse.json({ action: 'seed', log, results });
  }

  return NextResponse.json({ error: 'Invalid action. Use: provision, verify, or seed' }, { status: 400 });
}
