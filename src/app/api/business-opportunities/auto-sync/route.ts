import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { syncBizOppToGhl } from '@/lib/ghl/business-opportunity-sync';
export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const results = { pushed: 0, skipped: 0, errors: [] as string[] };

  const { data: items } = await supabase.from('lf_business_opportunities').select('*');
  for (const item of (items || [])) {
    if (item.ghl_record_id && item.ghl_synced_at) {
      const syncedAt = new Date(item.ghl_synced_at).getTime();
      const updatedAt = item.updated_at ? new Date(item.updated_at).getTime() : 0;
      if (updatedAt <= syncedAt) { results.skipped++; continue; }
    }
    const sync = await syncBizOppToGhl(item, item.ghl_record_id);
    if (sync.success) {
      results.pushed++;
      if (sync.ghlRecordId) await supabase.from('lf_business_opportunities').update({ ghl_record_id: sync.ghlRecordId, ghl_synced_at: new Date().toISOString() }).eq('id', item.id);
    } else {
      results.errors.push(`${item.title}: ${sync.error}`);
    }
  }

  return NextResponse.json({ ...results, timestamp: new Date().toISOString() });
}
