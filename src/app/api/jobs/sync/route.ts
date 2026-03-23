import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { syncJobToGhl, fetchAllGhlJobs, ghlPropertiesToJob } from '@/lib/ghl/job-sync';

// POST /api/jobs/sync — manual bulk sync
// { direction: 'push' | 'pull' | 'both' }
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { data: profile } = await supabase.from('lf_profiles').select('role').eq('id', user.id).maybeSingle();
  if (!profile || !['super_admin', 'admin'].includes(profile.role)) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const body = await req.json();
  const direction = body.direction || 'push';
  const results = { pushed: 0, pulled: 0, errors: [] as string[] };

  // PUSH: Supabase → GHL
  if (direction === 'push' || direction === 'both') {
    const { data: jobs } = await supabase.from('lf_jobs').select('*');
    for (const job of (jobs || [])) {
      const syncResult = await syncJobToGhl(job, job.ghl_record_id);
      if (syncResult.success) {
        results.pushed++;
        if (syncResult.ghlRecordId) {
          await supabase.from('lf_jobs').update({
            ghl_record_id: syncResult.ghlRecordId,
            ghl_synced_at: new Date().toISOString(),
          }).eq('id', job.id);
        }
      } else {
        results.errors.push(`Push failed for "${job.title}": ${syncResult.error}`);
      }
    }
  }

  // PULL: GHL → Supabase
  if (direction === 'pull' || direction === 'both') {
    const ghlRecords = await fetchAllGhlJobs();
    for (const record of ghlRecords) {
      const jobData = ghlPropertiesToJob(record.properties);
      if (!jobData.title) continue;

      if (jobData.id) {
        // Update existing Supabase job
        const { error } = await supabase.from('lf_jobs').update({
          title: jobData.title,
          company_name: jobData.company_name || null,
          category: jobData.category,
          job_type: jobData.job_type,
          work_mode: jobData.work_mode,
          salary_range: jobData.salary_range || null,
          compensation_type: jobData.compensation_type,
          department: jobData.department || null,
          description: jobData.description || null,
          requirements: jobData.requirements || null,
          benefits: jobData.benefits || null,
          special_offer: jobData.special_offer || null,
          status: jobData.status,
          visibility: jobData.visibility,
          ghl_record_id: record.id,
          ghl_synced_at: new Date().toISOString(),
        }).eq('id', jobData.id);
        if (!error) results.pulled++;
        else results.errors.push(`Pull update failed: ${error.message}`);
      } else {
        // New job from GHL — create in Supabase
        const slug = jobData.title ? jobData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '';
        const { error } = await supabase.from('lf_jobs').insert({
          title: jobData.title,
          company_name: jobData.company_name || null,
          location: jobData.location || 'Lakefront Estates, Okeechobee, FL',
          category: jobData.category || 'General',
          job_type: jobData.job_type || 'full-time',
          work_mode: jobData.work_mode || 'on_site',
          salary_range: jobData.salary_range || null,
          compensation_type: jobData.compensation_type || 'salary',
          department: jobData.department || null,
          description: jobData.description || null,
          requirements: jobData.requirements || null,
          benefits: jobData.benefits || null,
          special_offer: jobData.special_offer || null,
          status: jobData.status || 'draft',
          visibility: 'public',
          slug,
          is_public: true,
          approval_status: 'approved',
          ghl_record_id: record.id,
          ghl_synced_at: new Date().toISOString(),
        });
        if (!error) results.pulled++;
        else results.errors.push(`Pull create failed: ${error.message}`);
      }
    }
  }

  return NextResponse.json({ success: true, ...results });
}
