import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { syncJobToGhl, fetchJobsFromGhl, parseGhlCompanyToJob } from '@/lib/ghl/job-sync';

// POST /api/jobs/sync — manual bulk sync between Supabase and GHL
// Direction: 'push' (Supabase → GHL) | 'pull' (GHL → Supabase) | 'both'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { data: profile } = await supabase.from('lf_profiles').select('role').eq('id', user.id).maybeSingle();
  if (!profile || !['super_admin', 'admin'].includes(profile.role)) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const body = await req.json();
  const direction = body.direction || 'push';
  const results: { pushed: number; pulled: number; errors: string[] } = { pushed: 0, pulled: 0, errors: [] };

  // PUSH: Supabase → GHL
  if (direction === 'push' || direction === 'both') {
    const { data: jobs } = await supabase.from('lf_jobs').select('*');
    for (const job of (jobs || [])) {
      const syncResult = await syncJobToGhl({
        id: job.id, title: job.title, company_name: job.company_name,
        location: job.location, job_type: job.job_type, salary_range: job.salary_range,
        category: job.category, work_mode: job.work_mode, compensation_type: job.compensation_type,
        department: job.department, description: job.description, requirements: job.requirements,
        benefits: job.benefits, status: job.status, visibility: job.visibility,
        closing_date: job.closing_date, special_offer: job.special_offer, openings_count: job.openings_count,
      });
      if (syncResult.success) {
        results.pushed++;
        await supabase.from('lf_jobs').update({
          ghl_record_id: syncResult.ghlCompanyId,
          ghl_synced_at: new Date().toISOString(),
        }).eq('id', job.id);
      } else {
        results.errors.push(`Push failed for ${job.title}: ${syncResult.error}`);
      }
    }
  }

  // PULL: GHL → Supabase
  if (direction === 'pull' || direction === 'both') {
    const ghlJobs = await fetchJobsFromGhl();
    for (const company of ghlJobs) {
      const jobData = parseGhlCompanyToJob(company);
      if (!jobData) continue;

      if (jobData.id) {
        // Update existing
        const { error } = await supabase.from('lf_jobs').update({
          title: jobData.title,
          company_name: jobData.company_name,
          category: jobData.category,
          job_type: jobData.job_type,
          work_mode: jobData.work_mode,
          salary_range: jobData.salary_range,
          ghl_record_id: company.id,
          ghl_synced_at: new Date().toISOString(),
        }).eq('id', jobData.id);
        if (!error) results.pulled++;
        else results.errors.push(`Pull update failed: ${error.message}`);
      } else {
        // New from GHL
        const slug = jobData.title ? jobData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '';
        const { error } = await supabase.from('lf_jobs').insert({
          title: jobData.title, company_name: jobData.company_name,
          category: jobData.category || 'General', job_type: jobData.job_type || 'full-time',
          status: jobData.status || 'draft', visibility: 'public', slug,
          is_public: true, approval_status: 'approved',
          ghl_record_id: company.id, ghl_synced_at: new Date().toISOString(),
        }).select().single();
        if (!error) results.pulled++;
        else results.errors.push(`Pull create failed: ${error.message}`);
      }
    }
  }

  return NextResponse.json({ success: true, ...results });
}
