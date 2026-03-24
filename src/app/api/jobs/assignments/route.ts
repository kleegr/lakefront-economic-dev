import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';

// GET /api/jobs/assignments?job_id=...&user_id=...&role=...
export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('job_id');
  const userId = searchParams.get('user_id');
  const role = searchParams.get('role');

  let query = supabase
    .from('lf_job_assignments')
    .select(`
      *,
      job:lf_jobs(id, title, company_name, status, job_type, salary_range, location),
      employee:lf_profiles!lf_job_assignments_employee_id_fkey(id, full_name, email, role, portal_type),
      employer:lf_profiles!lf_job_assignments_employer_id_fkey(id, full_name, email, company_name),
      application:lf_applications(id, status, applicant_name, applicant_email, created_at)
    `)
    .order('created_at', { ascending: false });

  if (jobId) query = query.eq('job_id', jobId);
  if (userId) query = query.or(`employee_id.eq.${userId},employer_id.eq.${userId}`);
  if (role) query = query.eq('role', role);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ assignments: data || [] });
}
