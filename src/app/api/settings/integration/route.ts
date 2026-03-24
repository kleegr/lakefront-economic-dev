import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';

// ITEM 18: Persist Kleegr API key and location ID
export async function GET() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { data: tokenRow } = await supabase.from('lf_integration_settings').select('value').eq('key', 'kleegr_token').maybeSingle();
  const { data: locRow } = await supabase.from('lf_integration_settings').select('value').eq('key', 'kleegr_location_id').maybeSingle();
  return NextResponse.json({ token: tokenRow?.value || '', locationId: locRow?.value || '' });
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { data: profile } = await supabase.from('lf_profiles').select('role').eq('id', user.id).maybeSingle();
  if (!profile || !['super_admin', 'admin'].includes(profile.role)) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const body = await req.json();
  if (body.token) {
    await supabase.from('lf_integration_settings').upsert({ key: 'kleegr_token', value: body.token, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  }
  if (body.locationId) {
    await supabase.from('lf_integration_settings').upsert({ key: 'kleegr_location_id', value: body.locationId, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  }
  return NextResponse.json({ success: true });
}
