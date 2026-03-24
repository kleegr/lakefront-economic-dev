import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '100');
  const status = searchParams.get('status');
  const entityType = searchParams.get('entity_type');
  const direction = searchParams.get('direction');
  const dateFrom = searchParams.get('date_from');
  const dateTo = searchParams.get('date_to');
  const sortBy = searchParams.get('sort_by') || 'created_at';
  const sortOrder = searchParams.get('sort_order') === 'asc' ? true : false;

  let query = supabase.from('lf_sync_log').select('*').order(sortBy, { ascending: sortOrder }).limit(limit);
  if (status) query = query.eq('status', status);
  if (entityType) query = query.eq('entity_type', entityType);
  if (direction) query = query.eq('direction', direction);
  if (dateFrom) query = query.gte('created_at', dateFrom);
  if (dateTo) query = query.lte('created_at', dateTo + 'T23:59:59.999Z');

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: stats } = await supabase.rpc('get_sync_stats').single();
  return NextResponse.json({ logs: data || [], stats: stats || null });
}
