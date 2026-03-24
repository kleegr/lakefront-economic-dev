import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';

// GET /api/employers/search?q=sunshine
// Returns existing employers from:
//   1. lf_applications where application_type = 'employer'
//   2. lf_profiles where portal_type = 'employer'
// Each result includes: id, name, email, phone, company, ghl_contact_id
export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const q = req.nextUrl.searchParams.get('q') || '';

  // Search employer applications
  let query = supabase.from('lf_applications')
    .select('id, applicant_name, applicant_email, applicant_phone, employer_company, business_type_employer, business_website, ghl_contact_id, address, county')
    .eq('application_type', 'employer')
    .order('created_at', { ascending: false })
    .limit(20);

  if (q.length > 0) {
    query = query.or(`employer_company.ilike.%${q}%,applicant_name.ilike.%${q}%,applicant_email.ilike.%${q}%`);
  }

  const { data: apps } = await query;

  // Deduplicate by company name, keeping the one with ghl_contact_id
  const seen = new Map<string, any>();
  for (const a of (apps || [])) {
    const key = (a.employer_company || a.applicant_name || '').toLowerCase().trim();
    if (!key) continue;
    const existing = seen.get(key);
    if (!existing || (!existing.ghl_contact_id && a.ghl_contact_id)) {
      seen.set(key, {
        id: a.id,
        source: 'application',
        company_name: a.employer_company || a.applicant_name,
        contact_name: a.applicant_name,
        email: a.applicant_email,
        phone: a.applicant_phone,
        business_type: a.business_type_employer,
        website: a.business_website,
        address: a.address,
        county: a.county,
        ghl_contact_id: a.ghl_contact_id,
      });
    }
  }

  // Also search employer profiles
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
      id: p.id,
      source: 'profile',
      company_name: p.company_name || p.full_name,
      contact_name: p.full_name,
      email: p.email,
      phone: p.phone,
      address: p.address,
      county: p.county,
      ghl_contact_id: p.kleegr_contact_id,
    });
  }

  return NextResponse.json({ employers: Array.from(seen.values()) });
}
