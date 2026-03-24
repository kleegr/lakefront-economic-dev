import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { ghlConfig, isGhlConfigured } from '@/lib/ghl/config';
export const dynamic = 'force-dynamic';

const BASE = 'https://services.leadconnectorhq.com';
function ghlHeaders() {
  return { 'Authorization': `Bearer ${ghlConfig.token}`, 'Content-Type': 'application/json', 'Version': '2021-07-28' };
}

// GET /api/employers/search?q=sunshine
// Returns existing employers from:
//   1. lf_applications where application_type = 'employer'
//   2. lf_profiles where portal_type = 'employer'
//   3. GHL contacts (searches all contacts by name/company/email)
export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const q = req.nextUrl.searchParams.get('q') || '';

  const seen = new Map<string, any>();

  // 1. Search employer applications in portal
  let appQuery = supabase.from('lf_applications')
    .select('id, applicant_name, applicant_email, applicant_phone, employer_company, business_type_employer, business_website, ghl_contact_id, address, county')
    .eq('application_type', 'employer')
    .order('created_at', { ascending: false })
    .limit(20);

  if (q.length > 0) {
    appQuery = appQuery.or(`employer_company.ilike.%${q}%,applicant_name.ilike.%${q}%,applicant_email.ilike.%${q}%`);
  }

  const { data: apps } = await appQuery;
  for (const a of (apps || [])) {
    const key = (a.employer_company || a.applicant_name || '').toLowerCase().trim();
    if (!key) continue;
    const existing = seen.get(key);
    if (!existing || (!existing.ghl_contact_id && a.ghl_contact_id)) {
      seen.set(key, {
        id: a.id, source: 'portal',
        company_name: a.employer_company || a.applicant_name,
        contact_name: a.applicant_name, email: a.applicant_email, phone: a.applicant_phone,
        business_type: a.business_type_employer, website: a.business_website,
        address: a.address, county: a.county, ghl_contact_id: a.ghl_contact_id,
      });
    }
  }

  // 2. Search employer profiles in portal
  let profileQuery = supabase.from('lf_profiles')
    .select('id, full_name, email, phone, company_name, kleegr_contact_id, address, county')
    .eq('portal_type', 'employer')
    .limit(10);

  if (q.length > 0) {
    profileQuery = profileQuery.or(`company_name.ilike.%${q}%,full_name.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data: profiles } = await profileQuery;
  for (const p of (profiles || [])) {
    const key = (p.company_name || p.full_name || '').toLowerCase().trim();
    if (!key || seen.has(key)) continue;
    seen.set(key, {
      id: p.id, source: 'portal',
      company_name: p.company_name || p.full_name,
      contact_name: p.full_name, email: p.email, phone: p.phone,
      address: p.address, county: p.county, ghl_contact_id: p.kleegr_contact_id,
    });
  }

  // 3. Search GHL contacts directly (all contacts, not just portal ones)
  if (isGhlConfigured() && q.length >= 1) {
    try {
      const ghlRes = await fetch(`${BASE}/contacts/search`, {
        method: 'POST',
        headers: ghlHeaders(),
        body: JSON.stringify({
          locationId: ghlConfig.locationId,
          query: q,
          limit: 20,
        }),
      });
      const ghlData = await ghlRes.json();
      const contacts = ghlData?.contacts || ghlData?.data || [];

      for (const c of contacts) {
        const name = [c.firstName, c.lastName].filter(Boolean).join(' ') || '';
        const company = c.companyName || c.company || '';
        const displayName = company || name;
        const key = displayName.toLowerCase().trim();
        if (!key || seen.has(key)) continue;

        seen.set(key, {
          id: c.id, source: 'ghl',
          company_name: company || name,
          contact_name: name,
          email: c.email || '',
          phone: c.phone || '',
          address: c.address1 || '',
          county: '',
          ghl_contact_id: c.id,
          tags: c.tags || [],
        });
      }
    } catch (e) {
      console.error('GHL contact search failed:', e);
    }
  }

  // Also load all GHL contacts if no query (show recent)
  if (isGhlConfigured() && q.length === 0) {
    try {
      const ghlRes = await fetch(`${BASE}/contacts/?locationId=${ghlConfig.locationId}&limit=20&sortBy=dateAdded&sortOrder=desc`, {
        headers: ghlHeaders(),
      });
      const ghlData = await ghlRes.json();
      const contacts = ghlData?.contacts || ghlData?.data || [];

      for (const c of contacts) {
        const name = [c.firstName, c.lastName].filter(Boolean).join(' ') || '';
        const company = c.companyName || c.company || '';
        const displayName = company || name;
        const key = displayName.toLowerCase().trim();
        if (!key || seen.has(key)) continue;

        seen.set(key, {
          id: c.id, source: 'ghl',
          company_name: company || name,
          contact_name: name,
          email: c.email || '',
          phone: c.phone || '',
          address: c.address1 || '',
          county: '',
          ghl_contact_id: c.id,
          tags: c.tags || [],
        });
      }
    } catch (e) {
      console.error('GHL contacts list failed:', e);
    }
  }

  // Sort: portal results first, then GHL-only results
  const results = Array.from(seen.values()).sort((a, b) => {
    if (a.source === 'portal' && b.source === 'ghl') return -1;
    if (a.source === 'ghl' && b.source === 'portal') return 1;
    return 0;
  });

  return NextResponse.json({ employers: results });
}
