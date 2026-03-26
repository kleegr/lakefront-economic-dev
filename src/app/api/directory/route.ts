import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { logDirectoryAction } from '@/lib/audit';
import { syncDirectoryToGhl } from '@/lib/ghl/directory-sync';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { searchParams } = new URL(req.url);
  const adminMode = searchParams.get('admin') === 'true';
  const limit = parseInt(searchParams.get('limit') || '100');
  const category = searchParams.get('category');
  const listingType = searchParams.get('listing_type');

  let query = supabase.from('lf_directory').select('*').order('featured', { ascending: false }).order('business_name', { ascending: true }).limit(limit);

  if (!adminMode) {
    query = query.eq('status', 'active').in('approval_status', ['approved']).neq('website_visibility', 'hidden');
  } else {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const { data: profile } = await supabase.from('lf_profiles').select('role').eq('id', user.id).maybeSingle();
    if (!profile || !['super_admin', 'admin'].includes(profile.role)) return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  if (category) query = query.eq('category', category);
  if (listingType) query = query.eq('listing_type', listingType);

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
  const slug = body.business_name ? body.business_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '';

  const entryData = {
    ...body,
    slug,
    created_by: user.id,
    status: body.status || 'active',
    approval_status: body.approval_status || 'approved',
  };

  const { data, error } = await supabase.from('lf_directory').insert(entryData).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Sync to GHL
  const syncResult = await syncDirectoryToGhl(data);
  if (syncResult.ghlRecordId) {
    await supabase.from('lf_directory').update({ ghl_record_id: syncResult.ghlRecordId, ghl_synced_at: new Date().toISOString() }).eq('id', data.id);
  }

  await logDirectoryAction(user.id, 'directory_created', data.id, { business_name: data.business_name, category: data.category, ghl_synced: syncResult.success });

  return NextResponse.json({ item: data, ghlSync: syncResult });
}
