import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { ghlConfig, isGhlConfigured } from '@/lib/ghl/config';
export const dynamic = 'force-dynamic';

const BASE = 'https://services.leadconnectorhq.com';
function ghlHeaders() {
  return { 'Authorization': `Bearer ${ghlConfig.token}`, 'Content-Type': 'application/json', 'Version': '2021-07-28' };
}

async function searchKleegrContacts(query: string): Promise<any[]> {
  if (!isGhlConfigured()) return [];
  try {
    const params = new URLSearchParams({ locationId: ghlConfig.locationId, limit: '20' });
    if (query) params.set('query', query);
    const res = await fetch(`${BASE}/contacts/?${params}`, { headers: ghlHeaders() });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.contacts || [];
  } catch { return []; }
}

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const q = req.nextUrl.searchParams.get('q') || '';
  const seen = new Map<string, any>();

  // Search Supabase profiles
  let profQuery = supabase.from('lf_profiles').select('id, full_name, email, phone, company_name, kleegr_contact_id').limit(15);
  if (q.length > 0) profQuery = profQuery.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,company_name.ilike.%${q}%`);
  const { data: profiles } = await profQuery;
  for (const p of (profiles || [])) {
    const key = (p.full_name || p.email || '').toLowerCase().trim();
    if (!key) continue;
    seen.set(key, {
      id: p.id,
      source: 'portal',
      name: p.full_name || '',
      email: p.email || '',
      phone: p.phone || '',
      company: p.company_name || '',
      kleegr_id: p.kleegr_contact_id || null,
    });
  }

  // Search Kleegr contacts
  const kleegrContacts = await searchKleegrContacts(q);
  for (const c of kleegrContacts) {
    const name = [c.firstName, c.lastName].filter(Boolean).join(' ') || '';
    const key = (name || c.email || '').toLowerCase().trim();
    if (!key || seen.has(key)) continue;
    seen.set(key, {
      id: c.id,
      source: 'kleegr',
      name,
      email: c.email || '',
      phone: c.phone || '',
      company: c.companyName || c.company || '',
      kleegr_id: c.id,
    });
  }

  const results = Array.from(seen.values()).sort((a, b) => {
    if (a.source === 'portal' && b.source !== 'portal') return -1;
    if (a.source !== 'portal' && b.source === 'portal') return 1;
    return 0;
  });

  return NextResponse.json({ contacts: results });
}
