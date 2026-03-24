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

  let query = supabase.from('lf_sync_log').select('*').order('created_at', { ascending: false }).limit(limit);
  if (status) query = query.eq('status', status);
  if (entityType) query = query.eq('entity_type', entityType);
  if (direction) query = query.eq('direction', direction);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: stats } = await supabase.rpc('get_sync_stats').single();
  return NextResponse.json({ logs: data || [], stats: stats || null });
}
