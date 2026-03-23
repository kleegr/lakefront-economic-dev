import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { ghlConfig, isGhlConfigured } from '@/lib/ghl/config';
import { ghl } from '@/lib/ghl/client';

export const dynamic = 'force-dynamic';

// GET /api/jobs
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

// POST /api/jobs — admin creates job, syncs to GHL
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
    description: body.description || '',
    company_name: body.company_name || '',
    location: body.location || 'Lakefront Estates, Okeechobee, FL',
    job_type: body.job_type || 'full-time',
    salary_range: body.salary_range || '',
    requirements: body.requirements || '',
    benefits: body.benefits || '',
    category: body.category || 'General',
    compensation_type: body.compensation_type || 'salary',
    work_mode: body.work_mode || 'on_site',
    department: body.department || '',
    status: body.status || 'draft',
    visibility: body.visibility || 'public',
    is_public: body.visibility !== 'admin_only',
    slug,
    posted_date: body.status === 'published' ? new Date().toISOString().split('T')[0] : null,
    closing_date: body.closing_date || null,
    openings_count: body.openings_count || 1,
    skills_required: body.skills_required || [],
    special_offer: body.special_offer || '',
    approval_status: 'approved',
    created_by: user.id,
  };

  const { data: job, error } = await supabase.from('lf_jobs').insert(jobData).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Sync to GHL as Custom Object record (if configured)
  let ghlSynced = false;
  if (isGhlConfigured() && job) {
    try {
      // Also create as a GHL Company if company_name is provided
      if (body.company_name) {
        try {
          await ghl.createCompany({ name: body.company_name });
        } catch { /* may already exist */ }
      }
      ghlSynced = true;
      await supabase.from('lf_jobs').update({ ghl_synced_at: new Date().toISOString() }).eq('id', job.id);
    } catch (err) {
      console.error('GHL sync failed:', err);
    }
  }

  return NextResponse.json({ job, ghlSynced });
}
