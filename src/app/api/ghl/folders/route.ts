import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

const GHL_BASE = 'https://services.leadconnectorhq.com';

async function ghlApi(method: string, endpoint: string, token: string, body?: any, version = '2021-07-28') {
  const url = `${GHL_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Version': version },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    if (!res.ok) return { ok: false, status: res.status, error: text.substring(0, 300) };
    return { ok: true, data: text ? JSON.parse(text) : {} };
  } catch (err: any) {
    return { ok: false, status: 0, error: err.message || 'Network error' };
  }
}

const CONTACT_FOLDERS = [
  'Lakefront Housing',
  'Lakefront Priority',
  'Lakefront Employment',
  'Lakefront General',
  'Company Info',
];

const OPPORTUNITY_FOLDERS = [
  'Lakefront Opportunity',
];

// Field-to-folder mapping for contacts
const FIELD_FOLDER_MAP: Record<string, string[]> = {
  'Lakefront Housing': ['Current Location', 'Expected Move Date', 'Under Contract', 'Contract Date', 'Community Commitment Date', 'Housing Status'],
  'Lakefront Priority': ['Priority Bucket', 'Priority Score', 'Priority Rank', 'Priority Reason', 'Priority Last Calculated'],
  'Lakefront Employment': ['Work History Summary', 'Skills', 'Preferred Industries', 'Preferred Job Types', 'Salary Expectations', 'Availability', 'Resume URL'],
  'Lakefront General': ['Applicant Notes', 'Profile Completeness', 'Contact Type'],
  'Company Info': ['Co: Business Type', 'Co: Reason for Interest', 'Co: Current Locations', 'Co: NY Presence', 'Co: FL Presence', 'Co: Expected Footprint', 'Co: Jobs Created', 'Co: Local Jobs Count', 'Co: Remote Jobs Count', 'Co: Opening Timeline', 'Co: Community Fit Score', 'Co: Approved', 'Co: Provider Category', 'Co: Company Type'],
};

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { data: profile } = await supabase.from('lf_profiles').select('role').eq('id', user.id).maybeSingle();
  if (!profile || !['super_admin', 'admin'].includes(profile.role)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const body = await req.json();
  const token = body.token || '';
  const locationId = body.locationId || '';
  if (!token || !locationId) return NextResponse.json({ error: 'token and locationId are required' }, { status: 400 });

  const log: string[] = [];
  const results: Record<string, any> = {};

  log.push('=== Creating Custom Field Folders ===');
  log.push('');

  // First get all existing contact fields to build ID map
  log.push('--- Fetching existing contact fields ---');
  const cf = await ghlApi('GET', `/locations/${locationId}/customFields?model=contact`, token);
  const allFields = cf.ok ? (cf.data?.customFields || []) : [];
  log.push(`Found ${allFields.length} contact fields`);

  // Build name->id map
  const fieldIdMap: Record<string, string> = {};
  for (const f of allFields) {
    fieldIdMap[f.name] = f.id;
  }

  // Try to create folders using the V1 approach (group parameter on custom fields)
  // GHL V1 API: when creating/updating a field, you can set the "group" parameter
  // This moves the field into that group/folder automatically
  log.push('');
  log.push('--- Organizing fields into folders ---');
  log.push('(Using group parameter on field update)');
  log.push('');

  let movedCount = 0;
  let failCount = 0;

  for (const [folderName, fieldNames] of Object.entries(FIELD_FOLDER_MAP)) {
    log.push(`--- ${folderName} ---`);
    for (const fieldName of fieldNames) {
      const fieldId = fieldIdMap[fieldName];
      if (!fieldId) {
        log.push(`  SKIP ${fieldName} - field not found`);
        failCount++;
        continue;
      }
      // Try updating the field with the group parameter
      const updateRes = await ghlApi('PUT', `/locations/${locationId}/customFields/${fieldId}`, token, {
        name: fieldName,
        group: folderName,
      });
      if (updateRes.ok) {
        log.push(`  OK ${fieldName} -> ${folderName}`);
        movedCount++;
      } else {
        // If group doesn't work via V1, try without it
        log.push(`  FAIL ${fieldName} - ${(updateRes.error || '').substring(0, 100)}`);
        failCount++;
      }
    }
    log.push('');
  }

  log.push(`=== Done: ${movedCount} moved, ${failCount} failed ===`);
  log.push('');
  if (failCount > 0) {
    log.push('If folder assignment failed, create folders manually in GHL:');
    log.push('Go to GHL > Settings > Custom Fields > + Add Folder');
    log.push('Then drag fields into the appropriate folders.');
  }

  results.moved = movedCount;
  results.failed = failCount;

  return NextResponse.json({ action: 'folders', log, results });
}
