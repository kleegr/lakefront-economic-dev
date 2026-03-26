import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { logBizOppAction } from '@/lib/audit';
import { syncBizOppToGhl, deleteGhlBizOppRecord } from '@/lib/ghl/business-opportunity-sync';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from('lf_business_opportunities').select('*').or(`id.eq.${id},slug.eq.${id}`).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ item: data });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { data: profile } = await supabase.from('lf_profiles').select('role').eq('id', user.id).maybeSingle();
  if (!profile || !['super_admin', 'admin'].includes(profile.role)) return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  const body = await req.json();
  body.updated_at = new Date().toISOString();
  if (body.title && !body.slug) body.slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const { data, error } = await supabase.from('lf_business_opportunities').update(body).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Sync to GHL
  const syncResult = await syncBizOppToGhl(data, data.ghl_record_id);
  if (syncResult.ghlRecordId && syncResult.ghlRecordId !== data.ghl_record_id) {
    await supabase.from('lf_business_opportunities').update({ ghl_record_id: syncResult.ghlRecordId, ghl_synced_at: new Date().toISOString() }).eq('id', id);
  } else if (syncResult.success) {
    await supabase.from('lf_business_opportunities').update({ ghl_synced_at: new Date().toISOString() }).eq('id', id);
  }

  await logBizOppAction(user.id, 'biz_opp_updated', id, { title: data.title, ghl_synced: syncResult.success, fields_changed: Object.keys(body).filter(k => k !== 'updated_at') });

  return NextResponse.json({ item: data, ghlSync: syncResult });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { data: profile } = await supabase.from('lf_profiles').select('role').eq('id', user.id).maybeSingle();
  if (!profile || !['super_admin', 'admin'].includes(profile.role)) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const { data: existing } = await supabase.from('lf_business_opportunities').select('title, ghl_record_id').eq('id', id).maybeSingle();
  if (existing?.ghl_record_id) await deleteGhlBizOppRecord(existing.ghl_record_id);

  const { error } = await supabase.from('lf_business_opportunities').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logBizOppAction(user.id, 'biz_opp_deleted', id, { title: existing?.title || 'Unknown' });
  return NextResponse.json({ success: true });
}
