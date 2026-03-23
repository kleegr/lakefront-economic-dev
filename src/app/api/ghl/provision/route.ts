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

// GHL custom field API quirks:
// - model must be 'contact' or 'opportunity' (NOT 'company')
// - CHECKBOX type must NOT have options array
// - SINGLE_OPTIONS / MULTIPLE_OPTIONS: options must be plain strings in array, NOT objects
// - Company fields go on contact model with a naming convention prefix

const CONTACT_FIELDS = [
  { name: 'Current Location', dataType: 'TEXT' },
  { name: 'Expected Move Date', dataType: 'DATE' },
  { name: 'Under Contract', dataType: 'CHECKBOX' },
  { name: 'Contract Date', dataType: 'DATE' },
  { name: 'Community Commitment Date', dataType: 'DATE' },
  { name: 'Housing Status', dataType: 'SINGLE_OPTIONS', options: ['Homeowner', 'Renter', 'Under Contract', 'Searching', 'Other'] },
  { name: 'Priority Bucket', dataType: 'SINGLE_OPTIONS', options: ['A - Under Contract', 'B - Committed', 'C - Interested', 'D - General'] },
  { name: 'Priority Score', dataType: 'NUMERICAL' },
  { name: 'Priority Rank', dataType: 'NUMERICAL' },
  { name: 'Priority Reason', dataType: 'TEXT' },
  { name: 'Priority Last Calculated', dataType: 'DATE' },
  { name: 'Work History Summary', dataType: 'LARGE_TEXT' },
  { name: 'Skills', dataType: 'LARGE_TEXT' },
  { name: 'Preferred Industries', dataType: 'TEXT' },
  { name: 'Preferred Job Types', dataType: 'MULTIPLE_OPTIONS', options: ['Full-Time', 'Part-Time', 'Contract', 'Seasonal', 'Internship'] },
  { name: 'Salary Expectations', dataType: 'TEXT' },
  { name: 'Availability', dataType: 'SINGLE_OPTIONS', options: ['Immediately', 'Within 2 Weeks', 'Within 1 Month', 'Within 3 Months', '3+ Months'] },
  { name: 'Resume URL', dataType: 'TEXT' },
  { name: 'Applicant Notes', dataType: 'LARGE_TEXT' },
  { name: 'Profile Completeness', dataType: 'NUMERICAL' },
  { name: 'Contact Type', dataType: 'SINGLE_OPTIONS', options: ['Applicant', 'Employer', 'Provider', 'Investor', 'Resident', 'Other'] },
];

// Company fields stored as contact custom fields with "Co: " prefix
// because GHL custom fields API only supports model=contact or model=opportunity
const COMPANY_FIELDS_AS_CONTACT = [
  { name: 'Co: Business Type', dataType: 'SINGLE_OPTIONS', options: ['Retail', 'Food & Beverage', 'Professional Services', 'Healthcare', 'Education', 'Religious', 'Community', 'Other'] },
  { name: 'Co: Reason for Interest', dataType: 'LARGE_TEXT' },
  { name: 'Co: Current Locations', dataType: 'TEXT' },
  { name: 'Co: NY Presence', dataType: 'CHECKBOX' },
  { name: 'Co: FL Presence', dataType: 'CHECKBOX' },
  { name: 'Co: Expected Footprint', dataType: 'NUMERICAL' },
  { name: 'Co: Jobs Created', dataType: 'NUMERICAL' },
  { name: 'Co: Local Jobs Count', dataType: 'NUMERICAL' },
  { name: 'Co: Remote Jobs Count', dataType: 'NUMERICAL' },
  { name: 'Co: Opening Timeline', dataType: 'TEXT' },
  { name: 'Co: Community Fit Score', dataType: 'NUMERICAL' },
  { name: 'Co: Approved', dataType: 'CHECKBOX' },
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
  // CHECKBOX must NOT have options
  if (field.dataType === 'CHECKBOX') return fb;
  // SINGLE_OPTIONS and MULTIPLE_OPTIONS: GHL expects plain string array
  if (field.options && field.options.length > 0) {
    fb.options = field.options;
  }
  return fb;
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
    const loc = await ghlApi('GET', `/locations/${locationId}`, token);
    log.push(loc.ok ? 'OK Location accessible' : 'FAIL Location: ' + (loc.error || ''));
    results.location = loc.ok;

    const cf = await ghlApi('GET', `/locations/${locationId}/customFields?model=contact`, token);
    const cfCount = cf.ok ? (cf.data?.customFields?.length || 0) : 0;
    log.push(`OK Contact custom fields: ${cfCount}`);
    results.contactFields = cfCount;
    if (cf.ok && cf.data?.customFields) {
      const lakefrontFields = cf.data.customFields.filter((f: any) =>
        f.name?.includes('Lakefront') || f.name?.includes('Co:') || f.name?.includes('Priority') ||
        f.name?.includes('Contract') || f.name?.includes('Housing') || f.name?.includes('Availability') ||
        f.name?.includes('Resume') || f.name?.includes('Skills') || f.name?.includes('Contact Type') ||
        f.name?.includes('Preferred') || f.name?.includes('Applicant') || f.name?.includes('Profile')
      );
      for (const f of lakefrontFields) {
        log.push(`  ${f.name} (${f.id}) [${f.dataType}]`);
      }
    }

    const pipes = await ghlApi('GET', `/opportunities/pipelines?locationId=${locationId}`, token);
    const pipeList = pipes.ok ? (pipes.data?.pipelines || []) : [];
    log.push(`OK Pipelines: ${pipeList.length}`);
    for (const p of pipeList) {
      log.push(`  ${p.name} (${p.id}) - ${p.stages?.length || 0} stages`);
      if (p.stages) {
        for (const s of p.stages) {
          log.push(`    Stage: ${s.name} (${s.id})`);
        }
      }
    }
    results.pipelines = pipeList.map((p: any) => ({
      name: p.name, id: p.id, stages: p.stages?.length || 0,
      stageList: p.stages?.map((s: any) => ({ name: s.name, id: s.id })) || []
    }));

    const contacts = await ghlApi('GET', `/contacts/?locationId=${locationId}&limit=1`, token);
    results.totalContacts = contacts.ok ? (contacts.data?.meta?.total || contacts.data?.contacts?.length || 0) : 0;
    log.push(`OK Total contacts: ${results.totalContacts}`);

    const companies = await ghlApi('GET', `/companies/?locationId=${locationId}&limit=1`, token);
    results.totalCompanies = companies.ok ? (companies.data?.meta?.total || companies.data?.companies?.length || 0) : 0;
    log.push(`OK Total companies: ${results.totalCompanies}`);

    return NextResponse.json({ action: 'verify', log, results });
  }

  // ===== PROVISION =====
  if (action === 'provision') {
    log.push('=== GHL Provisioning ===');
    log.push(`Location: ${locationId}`);

    // 1. Contact custom fields (model=contact)
    log.push('');
    log.push('--- Contact Custom Fields ---');
    const contactFieldIds: Record<string, string> = {};
    for (const field of CONTACT_FIELDS) {
      const fb = buildFieldBody(field, 'contact');
      const res = await ghlApi('POST', `/locations/${locationId}/customFields`, token, fb);
      if (res.ok && res.data?.customField?.id) {
        contactFieldIds[field.name] = res.data.customField.id;
        log.push(`OK ${field.name} = ${res.data.customField.id}`);
      } else {
        const errMsg = res.error || '';
        if (errMsg.includes('already exists')) {
          log.push(`EXISTS ${field.name} (already created)`);
        } else {
          log.push(`SKIP ${field.name} - ${errMsg.substring(0, 120)}`);
        }
      }
    }
    results.contactFields = contactFieldIds;

    // 2. Company-related fields on contact model with "Co: " prefix
    log.push('');
    log.push('--- Company Fields (on contact model with Co: prefix) ---');
    const companyFieldIds: Record<string, string> = {};
    for (const field of COMPANY_FIELDS_AS_CONTACT) {
      const fb = buildFieldBody(field, 'contact');
      const res = await ghlApi('POST', `/locations/${locationId}/customFields`, token, fb);
      if (res.ok && res.data?.customField?.id) {
        companyFieldIds[field.name] = res.data.customField.id;
        log.push(`OK ${field.name} = ${res.data.customField.id}`);
      } else {
        const errMsg = res.error || '';
        if (errMsg.includes('already exists')) {
          log.push(`EXISTS ${field.name} (already created)`);
        } else {
          log.push(`SKIP ${field.name} - ${errMsg.substring(0, 120)}`);
        }
      }
    }
    results.companyFields = companyFieldIds;

    // 3. Opportunity custom fields (model=opportunity)
    log.push('');
    log.push('--- Opportunity Custom Fields ---');
    const oppFieldIds: Record<string, string> = {};
    for (const field of OPPORTUNITY_FIELDS) {
      const fb = buildFieldBody(field, 'opportunity');
      const res = await ghlApi('POST', `/locations/${locationId}/customFields`, token, fb);
      if (res.ok && res.data?.customField?.id) {
        oppFieldIds[field.name] = res.data.customField.id;
        log.push(`OK ${field.name} = ${res.data.customField.id}`);
      } else {
        const errMsg = res.error || '';
        if (errMsg.includes('already exists')) {
          log.push(`EXISTS ${field.name} (already created)`);
        } else {
          log.push(`SKIP ${field.name} - ${errMsg.substring(0, 120)}`);
        }
      }
    }
    results.opportunityFields = oppFieldIds;

    // 4. Check pipelines
    log.push('');
    log.push('--- Pipelines (read-only) ---');
    const pipes = await ghlApi('GET', `/opportunities/pipelines?locationId=${locationId}`, token);
    if (pipes.ok && pipes.data?.pipelines) {
      results.pipelines = pipes.data.pipelines.map((p: any) => ({ name: p.name, id: p.id, stages: p.stages?.length || 0 }));
      for (const p of pipes.data.pipelines) log.push(`  ${p.name} (${p.id}) - ${p.stages?.length || 0} stages`);
    } else {
      log.push('  No pipelines - create manually in GHL');
      results.pipelines = [];
    }

    log.push('');
    log.push('=== Provisioning complete ===');
    return NextResponse.json({ action: 'provision', log, results });
  }

  // ===== SEED =====
  if (action === 'seed') {
    log.push('=== GHL Seed Data ===');
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
      else log.push(`SKIP ${a.firstName} ${a.lastName} - ${(res.error || '').substring(0, 100)}`);
    }

    const companies = [
      { name: 'Lakefront Medical Center', email: 'info@lakefrontmedical.com' },
      { name: 'Community Grocery', email: 'info@communitygrocery.com' },
      { name: 'Lakefront Restaurant Group', email: 'info@lakefrontdining.com' },
      { name: 'Okeechobee Construction LLC', email: 'info@okeeconst.com' },
      { name: 'Lakefront Security Services', email: 'info@lakefrontsec.com' },
    ];
    log.push('');
    log.push('--- Seeding Companies ---');
    for (const c of companies) {
      const res = await ghlApi('POST', '/companies/', token, { ...c, locationId });
      if (res.ok) log.push(`OK ${c.name} = ${res.data?.company?.id || 'created'}`);
      else log.push(`SKIP ${c.name} - ${(res.error || '').substring(0, 100)}`);
    }

    log.push('');
    log.push('=== Seed complete ===');
    return NextResponse.json({ action: 'seed', log, results });
  }

  return NextResponse.json({ error: 'Invalid action. Use: provision, verify, or seed' }, { status: 400 });
}
