import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// GET /api/jobs/[id] — get single job (public or admin)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: job, error } = await supabase.from('lf_jobs').select('*').eq('id', id).maybeSingle();
  if (error || !job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  return NextResponse.json({ job });
}

// PUT /api/jobs/[id] — admin updates a job
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { data: profile } = await supabase.from('lf_profiles').select('role').eq('id', user.id).maybeSingle();
  if (!profile || !['super_admin', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const body = await req.json();
  const updateData: Record<string, any> = { updated_at: new Date().toISOString() };

  const allowedFields = ['title', 'description', 'company_name', 'location', 'job_type', 'salary_range',
    'requirements', 'benefits', 'category', 'compensation_type', 'work_mode', 'department',
    'status', 'visibility', 'is_public', 'closing_date', 'openings_count', 'skills_required', 'special_offer'];

  for (const field of allowedFields) {
    if (body[field] !== undefined) updateData[field] = body[field];
  }

  // Auto-set posted_date when publishing
  if (body.status === 'published') updateData.posted_date = new Date().toISOString().split('T')[0];
  if (body.title) updateData.slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const { data: job, error } = await supabase.from('lf_jobs').update(updateData).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ job });
}

// DELETE /api/jobs/[id] — admin deletes a job
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { data: profile } = await supabase.from('lf_profiles').select('role').eq('id', user.id).maybeSingle();
  if (!profile || !['super_admin', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const { error } = await supabase.from('lf_jobs').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
