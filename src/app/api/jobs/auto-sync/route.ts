import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { syncJobWithEmployer } from '@/lib/ghl/job-association-sync';
import { fetchAllGhlJobs } from '@/lib/ghl/job-sync';
export const dynamic = 'force-dynamic';

// GET /api/jobs/auto-sync - lightweight sync check
// Called by background interval on portal pages
// Only syncs jobs that have changed since last sync
// Also removes portal jobs deleted from Kleegr
export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const results = { pushed: 0, skipped: 0, deleted: 0, errors: [] as string[] };

  // 1. Push any jobs that changed since last sync
  const { data: jobs } = await supabase.from('lf_jobs').select('*');
  for (const job of (jobs || [])) {
    // Skip if already synced and not updated since
    if (job.ghl_record_id && job.ghl_synced_at) {
      const syncedAt = new Date(job.ghl_synced_at).getTime();
      const updatedAt = job.updated_at ? new Date(job.updated_at).getTime() : 0;
      if (updatedAt <= syncedAt) { results.skipped++; continue; }
    }
    const sync = await syncJobWithEmployer(job, null);
    if (sync.success) {
      results.pushed++;
      if (sync.ghlRecordId) await supabase.from('lf_jobs').update({ ghl_record_id: sync.ghlRecordId, ghl_synced_at: new Date().toISOString() }).eq('id', job.id);
    } else {
      results.errors.push(`${job.title}: ${sync.error}`);
    }
  }

  // 2. Check for jobs deleted from Kleegr
  if (results.pushed > 0 || results.skipped > 0) {
    const ghlRecords = await fetchAllGhlJobs();
    const ghlIds = new Set(ghlRecords.map(r => r.id));
    const { data: syncedJobs } = await supabase.from('lf_jobs').select('id, title, ghl_record_id').not('ghl_record_id', 'is', null);
    for (const sj of (syncedJobs || [])) {
      if (sj.ghl_record_id && !ghlIds.has(sj.ghl_record_id)) {
        await supabase.from('lf_jobs').delete().eq('id', sj.id);
        results.deleted++;
      }
    }
  }

  return NextResponse.json({ ...results, timestamp: new Date().toISOString() });
}
