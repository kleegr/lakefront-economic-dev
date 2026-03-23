import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GHL Provisioning API Route
// Accessible at: /api/ghl/provision
// Requires admin login (checks Supabase auth + admin role)
// Reads GHL token from lf_settings table (same as AI key pattern)

const GHL_BASE = 'https://services.leadconnectorhq.com';

async function ghlApi(method: string, endpoint: string, token: string, body?: any) {
  const url = `${GHL_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    if (!res.ok) {
      return { ok: false, status: res.status, error: text.substring(0, 300) };
    }
    return { ok: true, data: text ? JSON.parse(text) : {} };
  } catch (err: any) {
    return { ok: false, status: 0, error: err.message || 'Network error' };
  }
}

// Contact custom fields to create
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

// Company custom fields
const COMPANY_FIELDS = [
  { name: 'Business Type', dataType: 'SINGLE_OPTIONS', options: ['Retail', 'Food & Beverage', 'Professional Services', 'Healthcare', 'Education', 'Religious', 'Community', 'Other'] },
  { name: 'Reason for Interest', dataType: 'LARGE_TEXT' },
  { name: 'Current Locations', dataType: 'TEXT' },
  { name: 'NY Presence', dataType: 'CHECKBOX' },
  { name: 'FL Presence', dataType: 'CHECKBOX' },
  { name: 'Expected Footprint (sqft)', dataType: 'NUMERICAL' },
  { name: 'Jobs Created', dataType: 'NUMERICAL' },
  { name: 'Local Jobs Count', dataType: 'NUMERICAL' },
  { name: 'Remote Jobs Count', dataType: 'NUMERICAL' },
  { name: 'Opening Timeline', dataType: 'TEXT' },
  { name: 'Community Fit Score', dataType: 'NUMERICAL' },
  { name: 'Approved', dataType: 'CHECKBOX' },
  { name: 'Provider Category', dataType: 'SINGLE_OPTIONS', options: ['Construction', 'Maintenance', 'Landscaping', 'Security', 'Cleaning', 'Technology', 'Consulting', 'Catering', 'Other'] },
  { name: 'Company Type', dataType: 'SINGLE_OPTIONS', options: ['Business', 'Employer', 'Service Provider', 'Investor Company'] },
];

export async function POST(req: NextRequest) {
  // 1. Auth check — must be admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const { data: profile } = await supabase.from('lf_profiles').select('role').eq('id', user.id).maybeSingle();
  if (!profile || !['super_admin', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  // 2. Get GHL credentials from request body
  const body = await req.json();
  const token = body.token || '';
  const locationId = body.locationId || '';
  const action = body.action || 'provision'; // provision | verify | seed

  if (!token || !locationId) {
    return NextResponse.json({ error: 'token and locationId are required' }, { status: 400 });
  }

  const log: string[] = [];
  const results: Record<string, any> = {};

  // ===== VERIFY =====
  if (action === 'verify') {
    log.push('=== GHL Verification ===');

    // Check location
    const loc = await ghlApi('GET', `/locations/${locationId}`, token);
    log.push(`Location: ${loc.ok ? 'Accessible ✓' : 'FAILED ✗ ' + (loc.error || '')}`);
    results.location = loc.ok;

    // Check contact fields
    const cf = await ghlApi('GET', `/locations/${locationId}/customFields?model=contact`, token);
    const cfCount = cf.ok ? (cf.data?.customFields?.length || 0) : 0;
    log.push(`Contact custom fields: ${cfCount}`);
    results.contactFields = cfCount;

    // Check company fields
    const ccf = await ghlApi('GET', `/locations/${locationId}/customFields?model=company`, token);
    const ccfCount = ccf.ok ? (ccf.data?.customFields?.length || 0) : 0;
    log.push(`Company custom fields: ${ccfCount}`);
    results.companyFields = ccfCount;

    // Check pipelines
    const pipes = await ghlApi('GET', `/opportunities/pipelines?locationId=${locationId}`, token);
    const pipeList = pipes.ok ? (pipes.data?.pipelines || []) : [];
    log.push(`Pipelines: ${pipeList.length}`);
    for (const p of pipeList) {
      log.push(`  - ${p.name} (${p.id}) — ${p.stages?.length || 0} stages`);
    }
    results.pipelines = pipeList.map((p: any) => ({ name: p.name, id: p.id, stages: p.stages?.length || 0 }));

    // Check contacts
    const contacts = await ghlApi('GET', `/contacts/?locationId=${locationId}&limit=1`, token);
    results.totalContacts = contacts.ok ? (contacts.data?.meta?.total || contacts.data?.contacts?.length || 0) : 0;
    log.push(`Total contacts: ${results.totalContacts}`);

    // Check companies
    const companies = await ghlApi('GET', `/companies/?locationId=${locationId}&limit=1`, token);
    results.totalCompanies = companies.ok ? (companies.data?.meta?.total || companies.data?.companies?.length || 0) : 0;
    log.push(`Total companies: ${results.totalCompanies}`);

    return NextResponse.json({ action: 'verify', log, results });
  }

  // ===== PROVISION =====
  if (action === 'provision') {
    log.push('=== GHL Provisioning ===');
    log.push(`Location: ${locationId}`);

    // 1. Contact custom fields
    log.push('');
    log.push('--- Contact Custom Fields ---');
    const contactFieldIds: Record<string, string> = {};
    for (const field of CONTACT_FIELDS) {
      const fieldBody: any = { name: field.name, dataType: field.dataType, model: 'contact' };
      if (field.options) fieldBody.options = field.options.map(o => ({ value: o }));
      const res = await ghlApi('POST', `/locations/${locationId}/customFields`, token, fieldBody);
      if (res.ok && res.data?.customField?.id) {
        contactFieldIds[field.name] = res.data.customField.id;
        log.push(`✓ ${field.name} → ${res.data.customField.id}`);
      } else {
        log.push(`✗ ${field.name} — ${res.error?.substring(0, 100) || 'failed or already exists'}`);
      }
    }
    results.contactFields = contactFieldIds;

    // 2. Company custom fields
    log.push('');
    log.push('--- Company Custom Fields ---');
    const companyFieldIds: Record<string, string> = {};
    for (const field of COMPANY_FIELDS) {
      const fieldBody: any = { name: field.name, dataType: field.dataType, model: 'company' };
      if (field.options) fieldBody.options = field.options.map(o => ({ value: o }));
      const res = await ghlApi('POST', `/locations/${locationId}/customFields`, token, fieldBody);
      if (res.ok && res.data?.customField?.id) {
        companyFieldIds[field.name] = res.data.customField.id;
        log.push(`✓ ${field.name} → ${res.data.customField.id}`);
      } else {
        log.push(`✗ ${field.name} — ${res.error?.substring(0, 100) || 'failed or already exists'}`);
      }
    }
    results.companyFields = companyFieldIds;

    // 3. Check pipelines
    log.push('');
    log.push('--- Pipelines (read-only check) ---');
    const pipes = await ghlApi('GET', `/opportunities/pipelines?locationId=${locationId}`, token);
    if (pipes.ok && pipes.data?.pipelines) {
      results.pipelines = pipes.data.pipelines.map((p: any) => ({ name: p.name, id: p.id, stages: p.stages?.length || 0 }));
      for (const p of pipes.data.pipelines) {
        log.push(`  ${p.name} (${p.id}) — ${p.stages?.length || 0} stages`);
      }
    } else {
      log.push('  No pipelines found — create them manually in GHL');
      results.pipelines = [];
    }

    log.push('');
    log.push('✓ Provisioning complete');
    return NextResponse.json({ action: 'provision', log, results });
  }

  // ===== SEED =====
  if (action === 'seed') {
    log.push('=== GHL Seed Data ===');

    // Seed contacts
    const applicants = [
      { firstName: 'David', lastName: 'Cohen', email: 'david.cohen@example.com', phone: '+18631234567' },
      { firstName: 'Sarah', lastName: 'Levy', email: 'sarah.levy@example.com', phone: '+18631234568' },
      { firstName: 'Moshe', lastName: 'Stern', email: 'moshe.stern@example.com', phone: '+18631234569' },
    ];
    log.push('--- Seeding Contacts ---');
    for (const a of applicants) {
      const res = await ghlApi('POST', '/contacts/', token, { ...a, locationId, source: 'Lakefront Seed' });
      if (res.ok) {
        log.push(`✓ ${a.firstName} ${a.lastName} → ${res.data?.contact?.id || 'created'}`);
      } else {
        log.push(`✗ ${a.firstName} ${a.lastName} — ${res.error?.substring(0, 100) || 'may exist'}`);
      }
    }

    // Seed companies
    const companies = [
      { name: 'Lakefront Medical Center', email: 'info@lakefrontmedical.com' },
      { name: 'Community Grocery', email: 'info@communitygrocery.com' },
      { name: 'Lakefront Restaurant Group', email: 'info@lakefrontdining.com' },
    ];
    log.push('');
    log.push('--- Seeding Companies ---');
    for (const c of companies) {
      const res = await ghlApi('POST', '/companies/', token, { ...c, locationId });
      if (res.ok) {
        log.push(`✓ ${c.name} → ${res.data?.company?.id || 'created'}`);
      } else {
        log.push(`✗ ${c.name} — ${res.error?.substring(0, 100) || 'may exist'}`);
      }
    }

    log.push('');
    log.push('✓ Seed complete');
    return NextResponse.json({ action: 'seed', log, results });
  }

  return NextResponse.json({ error: 'Invalid action. Use: provision, verify, or seed' }, { status: 400 });
}
