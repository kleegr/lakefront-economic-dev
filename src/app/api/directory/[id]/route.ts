import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { logDirectoryAction } from '@/lib/audit';
import { syncDirectoryToGhl, deleteGhlDirectoryRecord } from '@/lib/ghl/directory-sync';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from('lf_directory').select('*').or(`id.eq.${id},slug.eq.${id}`).maybeSingle();
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
  if (body.business_name && !body.slug) body.slug = body.business_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const { data, error } = await supabase.from('lf_directory').update(body).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Sync to GHL
  const syncResult = await syncDirectoryToGhl(data, data.ghl_record_id);
  if (syncResult.ghlRecordId && syncResult.ghlRecordId !== data.ghl_record_id) {
    await supabase.from('lf_directory').update({ ghl_record_id: syncResult.ghlRecordId, ghl_synced_at: new Date().toISOString() }).eq('id', id);
  } else if (syncResult.success) {
    await supabase.from('lf_directory').update({ ghl_synced_at: new Date().toISOString() }).eq('id', id);
  }

  await logDirectoryAction(user.id, 'directory_updated', id, { business_name: data.business_name, ghl_synced: syncResult.success, fields_changed: Object.keys(body).filter(k => k !== 'updated_at') });

  return NextResponse.json({ item: data, ghlSync: syncResult });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { data: profile } = await supabase.from('lf_profiles').select('role').eq('id', user.id).maybeSingle();
  if (!profile || !['super_admin', 'admin'].includes(profile.role)) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const { data: existing } = await supabase.from('lf_directory').select('business_name, ghl_record_id').eq('id', id).maybeSingle();
  if (existing?.ghl_record_id) await deleteGhlDirectoryRecord(existing.ghl_record_id);

  const { error } = await supabase.from('lf_directory').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logDirectoryAction(user.id, 'directory_deleted', id, { business_name: existing?.business_name || 'Unknown' });
  return NextResponse.json({ success: true });
}
