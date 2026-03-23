import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { syncJobToGhl } from '@/lib/ghl/job-sync';

function cleanValue(val: any, fieldName: string): any {
  const dateFields = ['closing_date', 'posted_date'];
  if (dateFields.includes(fieldName) && (val === '' || val === undefined)) return null;
  if (val === '' && fieldName !== 'title') return null;
  return val;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: job, error } = await supabase.from('lf_jobs').select('*').eq('id', id).maybeSingle();
  if (error || !job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  return NextResponse.json({ job });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { data: profile } = await supabase.from('lf_profiles').select('role').eq('id', user.id).maybeSingle();
  if (!profile || !['super_admin', 'admin'].includes(profile.role)) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const body = await req.json();
  const updateData: Record<string, any> = { updated_at: new Date().toISOString() };

  const allowedFields = ['title', 'description', 'company_name', 'location', 'job_type', 'salary_range',
    'requirements', 'benefits', 'category', 'compensation_type', 'work_mode', 'department',
    'status', 'visibility', 'is_public', 'closing_date', 'openings_count', 'skills_required', 'special_offer'];

  for (const field of allowedFields) {
    if (body[field] !== undefined) updateData[field] = cleanValue(body[field], field);
  }

  if (body.status === 'published') updateData.posted_date = new Date().toISOString().split('T')[0];
  if (body.title) updateData.slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const { data: job, error } = await supabase.from('lf_jobs').update(updateData).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Sync updated job to GHL
  let ghlSynced = false;
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
    if (ghlSynced) {
      await supabase.from('lf_jobs').update({
        ghl_record_id: syncResult.ghlCompanyId,
        ghl_synced_at: new Date().toISOString(),
      }).eq('id', id);
    }
  }

  return NextResponse.json({ job, ghlSynced });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { data: profile } = await supabase.from('lf_profiles').select('role').eq('id', user.id).maybeSingle();
  if (!profile || !['super_admin', 'admin'].includes(profile.role)) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const { error } = await supabase.from('lf_jobs').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
