import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { syncJobWithEmployer } from '@/lib/ghl/job-association-sync';
import { fetchAllGhlJobs, ghlPropertiesToJob } from '@/lib/ghl/job-sync';
import { getFieldsConfig } from '@/lib/ghl/get-fields-config';

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { data: profile } = await supabase.from('lf_profiles').select('role').eq('id', user.id).maybeSingle();
  if (!profile || !['super_admin', 'admin'].includes(profile.role)) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const body = await req.json();
  const direction = body.direction || 'push';
  const forceAll = body.force === true;
  const fields = await getFieldsConfig();
  const results = { pushed: 0, skipped: 0, pulled: 0, deleted: 0, errors: [] as string[] };

  if (direction === 'push' || direction === 'both') {
    const { data: jobs } = await supabase.from('lf_jobs').select('*');

    for (const job of (jobs || [])) {
      // Skip jobs that are already synced and haven't changed since last sync
      if (!forceAll && job.ghl_record_id && job.ghl_synced_at) {
        const syncedAt = new Date(job.ghl_synced_at).getTime();
        const updatedAt = job.updated_at ? new Date(job.updated_at).getTime() : 0;
        if (updatedAt <= syncedAt) {
          results.skipped++;
          continue;
        }
      }

      const sync = await syncJobWithEmployer(job, null);
      if (sync.success) {
        results.pushed++;
        if (sync.ghlRecordId) {
          await supabase.from('lf_jobs').update({
            ghl_record_id: sync.ghlRecordId,
            ghl_synced_at: new Date().toISOString(),
          }).eq('id', job.id);
        }
      } else {
        results.errors.push(`Push failed for "${job.title}": ${sync.error}`);
      }
    }

    // After pushing, check for portal jobs deleted in GHL
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

  if (direction === 'pull' || direction === 'both') {
    const ghlRecords = await fetchAllGhlJobs();
    for (const record of ghlRecords) {
      const jobData = ghlPropertiesToJob(record.properties, fields);
      if (!jobData.title) continue;
      const { data: existing } = await supabase.from('lf_jobs').select('id').eq('ghl_record_id', record.id).maybeSingle();
      if (existing) {
        const { error } = await supabase.from('lf_jobs').update({ ...jobData, ghl_record_id: record.id, ghl_synced_at: new Date().toISOString() }).eq('id', existing.id);
        if (!error) results.pulled++; else results.errors.push(`Pull update: ${error.message}`);
      } else {
        const slug = String(jobData.title).toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const { error } = await supabase.from('lf_jobs').insert({ title: jobData.title, company_name: jobData.company_name || null, location: jobData.location || 'Lakefront Estates, Okeechobee, FL', category: jobData.category || 'General', job_type: jobData.job_type || 'full-time', status: 'draft', visibility: 'public', slug, is_public: true, approval_status: 'approved', ghl_record_id: record.id, ghl_synced_at: new Date().toISOString(), created_by: user.id });
        if (!error) results.pulled++; else results.errors.push(`Pull create: ${error.message}`);
      }
    }
  }

  return NextResponse.json({ success: true, ...results });
}
