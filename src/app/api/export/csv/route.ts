import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';

// General CSV export endpoint — supports applications, businesses, services, spaces
export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const table = searchParams.get('table') || 'lf_applications';
  const type = searchParams.get('type');

  const allowed = ['lf_applications', 'lf_businesses', 'lf_services', 'lf_spaces', 'lf_jobs'];
  if (!allowed.includes(table)) return NextResponse.json({ error: 'Invalid table' }, { status: 400 });

  let query = supabase.from(table).select('*').order('created_at', { ascending: false });
  if (type && table === 'lf_applications') query = query.eq('application_type', type);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || data.length === 0) return new Response('No data', { status: 200 });

  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => {
    const val = (row as any)[h];
    const str = val === null ? '' : typeof val === 'object' ? JSON.stringify(val) : String(val);
    return `"${str.replace(/"/g, '""')}"`;
  }).join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  return new Response(csv, {
    headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="${table.replace('lf_','')}-export.csv"` },
  });
}
