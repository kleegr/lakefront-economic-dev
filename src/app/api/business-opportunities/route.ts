import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { logBizOppAction } from '@/lib/audit';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { searchParams } = new URL(req.url);
  const adminMode = searchParams.get('admin') === 'true';
  const limit = parseInt(searchParams.get('limit') || '100');

  let query = supabase.from('lf_business_opportunities').select('*').order('created_at', { ascending: false }).limit(limit);

  if (!adminMode) {
    query = query.eq('is_published', true).in('approval_status', ['approved']);
  } else {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const { data: profile } = await supabase.from('lf_profiles').select('role').eq('id', user.id).maybeSingle();
    if (!profile || !['super_admin', 'admin'].includes(profile.role)) return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data || [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { data: profile } = await supabase.from('lf_profiles').select('role').eq('id', user.id).maybeSingle();
  if (!profile || !['super_admin', 'admin'].includes(profile.role)) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const body = await req.json();
  const slug = body.title ? body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '';

  const oppData = {
    ...body,
    slug,
    created_by: user.id,
    status: body.status || 'available',
    is_published: body.is_published !== false,
    approval_status: body.approval_status || 'approved',
  };

  const { data, error } = await supabase.from('lf_business_opportunities').insert(oppData).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logBizOppAction(user.id, 'biz_opp_created', data.id, { title: data.title, category: data.business_category, status: data.status });

  return NextResponse.json({ item: data });
}
