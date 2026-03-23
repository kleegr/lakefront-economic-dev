import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { businessOpportunities, serviceOpportunities, mockSpaces } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createServerSupabase();

    const { data: jobs, count: jobCount } = await supabase
      .from('lf_jobs')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .in('visibility', ['public', 'signed_in'])
      .order('created_at', { ascending: false })
      .limit(6);

    const mappedJobs = (jobs || []).map(j => ({
      id: j.id,
      title: j.title || '',
      slug: j.id,
      description: j.description || '',
      requirements: j.requirements || '',
      benefits: '',
      employerName: j.company_name || 'Lakefront Economy',
      category: j.category || 'General',
      type: j.job_type || 'full-time',
      workMode: j.work_mode || 'on-site',
      location: j.location || 'Okeechobee, FL',
      salaryMin: 0,
      salaryMax: 0,
      salaryType: j.compensation_type || 'salary',
      salaryRange: j.salary_range || '',
      status: j.status || 'published',
      isPublic: true,
      postedDate: j.created_at || '',
      applicationCount: 0,
    }));

    const availableBiz = businessOpportunities.filter(b => b.status === 'available').length;
    const neededSvc = serviceOpportunities.filter(s => s.status === 'needed' || s.status === 'partial').length;

    return NextResponse.json({
      jobs: mappedJobs,
      totalJobs: jobCount || mappedJobs.length,
      spaces: mockSpaces,
      totalSpaces: mockSpaces.length,
      businessOpportunities: businessOpportunities.filter(b => b.status === 'available').slice(0, 4),
      availableBizCount: availableBiz,
      serviceOpportunities: serviceOpportunities.filter(s => s.status === 'needed').slice(0, 4),
      neededSvcCount: neededSvc,
    });
  } catch {
    return NextResponse.json({
      jobs: [], totalJobs: 0, spaces: [], totalSpaces: 0,
      businessOpportunities: [], availableBizCount: 0,
      serviceOpportunities: [], neededSvcCount: 0,
    });
  }
}
