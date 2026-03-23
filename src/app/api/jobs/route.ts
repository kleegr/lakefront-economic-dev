import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { syncJobToGhl } from '@/lib/ghl/job-sync';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const adminMode = searchParams.get('admin') === 'true';

  let query = supabase.from('lf_jobs').select('*').order('created_at', { ascending: false }).limit(limit);

  if (adminMode) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const { data: profile } = await supabase.from('lf_profiles').select('role').eq('id', user.id).maybeSingle();
    if (!profile || !['super_admin', 'admin'].includes(profile.role)) return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  } else {
    query = query.eq('status', 'published').in('visibility', ['public', 'signed_in']);
  }

  const { data: jobs, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ jobs: jobs || [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { data: profile } = await supabase.from('lf_profiles').select('role').eq('id', user.id).maybeSingle();
  if (!profile || !['super_admin', 'admin'].includes(profile.role)) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const body = await req.json();
  const slug = body.title ? body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '';

  const jobData: Record<string, any> = {
    title: body.title || '',
    description: body.description || null,
    company_name: body.company_name || null,
    location: body.location || 'Lakefront Estates, Okeechobee, FL',
    job_type: body.job_type || 'full-time',
    salary_range: body.salary_range || null,
    requirements: body.requirements || null,
    benefits: body.benefits || null,
    category: body.category || 'General',
    compensation_type: body.compensation_type || 'salary',
    work_mode: body.work_mode || 'on_site',
    department: body.department || null,
    status: body.status || 'draft',
    visibility: body.visibility || 'public',
    is_public: body.visibility !== 'admin_only',
    slug,
    posted_date: body.status === 'published' ? new Date().toISOString().split('T')[0] : null,
    closing_date: body.closing_date || null,
    openings_count: body.openings_count || 1,
    skills_required: body.skills_required || [],
    special_offer: body.special_offer || null,
    approval_status: 'approved',
    created_by: user.id,
  };

  const { data: job, error } = await supabase.from('lf_jobs').insert(jobData).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Sync to GHL
  let ghlSynced = false;
  let ghlCompanyId: string | null = null;
  if (job) {
    const syncResult = await syncJobToGhl({
      id: job.id, title: job.title, company_name: job.company_name,
      location: job.location, job_type: job.job_type, salary_range: job.salary_range,
      category: job.category, work_mode: job.work_mode, compensation_type: job.compensation_type,
      department: job.department, description: job.description, requirements: job.requirements,
      benefits: job.benefits, status: job.status, visibility: job.visibility,
      closing_date: job.closing_date, special_offer: job.special_offer, openings_count: job.openings_count,
    });
    ghlSynced = syncResult.success;
    ghlCompanyId = syncResult.ghlCompanyId;
    if (ghlSynced) {
      await supabase.from('lf_jobs').update({
        ghl_record_id: ghlCompanyId,
        ghl_synced_at: new Date().toISOString(),
      }).eq('id', job.id);
    }
  }

  return NextResponse.json({ job, ghlSynced, ghlCompanyId });
}
