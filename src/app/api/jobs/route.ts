import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { syncJobToGhl } from '@/lib/ghl/job-sync';
import { getFieldsConfig } from '@/lib/ghl/get-fields-config';

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

  // Check if linking to an existing employer
  const employerLink = body.employer_link || null;
  let employerId = null;
  let ghlCompanyId = null;

  if (employerLink) {
    // If source is 'profile', use the profile ID as employer_id
    if (employerLink.source === 'profile') employerId = employerLink.id;
    // Store GHL contact ID for the employer
    if (employerLink.ghl_contact_id) ghlCompanyId = employerLink.ghl_contact_id;
  }

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
    employer_id: employerId || user.id,
  };

  // Store GHL company contact ID if linked to existing employer
  if (ghlCompanyId) jobData.ghl_company_id = ghlCompanyId;

  const { data: job, error } = await supabase.from('lf_jobs').insert(jobData).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Sync job to GHL Job Openings (just the job record, no employer association)
  let ghlSynced = false;
  if (job) {
    const fields = await getFieldsConfig();
    const syncResult = await syncJobToGhl(job, fields, null);
    ghlSynced = syncResult.success;
    if (ghlSynced && syncResult.ghlRecordId) {
      await supabase.from('lf_jobs').update({
        ghl_record_id: syncResult.ghlRecordId,
        ghl_synced_at: new Date().toISOString(),
      }).eq('id', job.id);
    }
  }

  return NextResponse.json({ job, ghlSynced, employerLinked: !!employerLink });
}
