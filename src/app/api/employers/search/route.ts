import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { ghlConfig, isGhlConfigured } from '@/lib/ghl/config';
export const dynamic = 'force-dynamic';

const BASE = 'https://services.leadconnectorhq.com';
function ghlHeaders() {
  return { 'Authorization': `Bearer ${ghlConfig.token}`, 'Content-Type': 'application/json', 'Version': '2021-07-28' };
}

async function searchGhlContacts(query: string): Promise<any[]> {
  if (!isGhlConfigured()) return [];
  try {
    const params = new URLSearchParams({ locationId: ghlConfig.locationId, limit: '20' });
    if (query) params.set('query', query);
    const res = await fetch(`${BASE}/contacts/?${params}`, { headers: ghlHeaders() });
    if (!res.ok) { console.error('Kleegr contacts search failed:', res.status); return []; }
    const data = await res.json();
    return data?.contacts || [];
  } catch (e) { console.error('Kleegr contacts search error:', e); return []; }
}

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const q = req.nextUrl.searchParams.get('q') || '';
  const seen = new Map<string, any>();

  let appQuery = supabase.from('lf_applications').select('id, applicant_name, applicant_email, applicant_phone, employer_company, business_type_employer, business_website, ghl_contact_id, address, county').eq('application_type', 'employer').order('created_at', { ascending: false }).limit(20);
  if (q.length > 0) appQuery = appQuery.or(`employer_company.ilike.%${q}%,applicant_name.ilike.%${q}%,applicant_email.ilike.%${q}%`);
  const { data: apps } = await appQuery;
  for (const a of (apps || [])) { const key = (a.employer_company || a.applicant_name || '').toLowerCase().trim(); if (!key) continue; if (!seen.has(key) || (!seen.get(key).ghl_contact_id && a.ghl_contact_id)) seen.set(key, { id: a.id, source: 'portal', company_name: a.employer_company || a.applicant_name, contact_name: a.applicant_name, email: a.applicant_email, phone: a.applicant_phone, business_type: a.business_type_employer, website: a.business_website, address: a.address, county: a.county, ghl_contact_id: a.ghl_contact_id }); }

  let profQuery = supabase.from('lf_profiles').select('id, full_name, email, phone, company_name, kleegr_contact_id, address, county').eq('portal_type', 'employer').limit(10);
  if (q.length > 0) profQuery = profQuery.or(`company_name.ilike.%${q}%,full_name.ilike.%${q}%,email.ilike.%${q}%`);
  const { data: profiles } = await profQuery;
  for (const p of (profiles || [])) { const key = (p.company_name || p.full_name || '').toLowerCase().trim(); if (!key || seen.has(key)) continue; seen.set(key, { id: p.id, source: 'portal', company_name: p.company_name || p.full_name, contact_name: p.full_name, email: p.email, phone: p.phone, address: p.address, county: p.county, ghl_contact_id: p.kleegr_contact_id }); }

  const ghlContacts = await searchGhlContacts(q);
  for (const c of ghlContacts) { const name = [c.firstName, c.lastName].filter(Boolean).join(' ') || ''; const company = c.companyName || c.company || ''; const displayName = company || name; const key = displayName.toLowerCase().trim(); if (!key) continue; if (seen.has(key)) { const existing = seen.get(key); if (!existing.ghl_contact_id) existing.ghl_contact_id = c.id; continue; } seen.set(key, { id: c.id, source: 'ghl', company_name: displayName, contact_name: name, email: c.email || '', phone: c.phone || '', address: c.address1 || '', county: '', ghl_contact_id: c.id, tags: c.tags || [] }); }

  const results = Array.from(seen.values()).sort((a, b) => { if (a.source === 'portal' && b.source !== 'portal') return -1; if (a.source !== 'portal' && b.source === 'portal') return 1; return 0; });
  return NextResponse.json({ employers: results, ghl_count: ghlContacts.length });
}
