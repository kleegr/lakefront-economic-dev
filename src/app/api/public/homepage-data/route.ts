import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { businessOpportunities, serviceOpportunities, mockSpaces } from '@/lib/mock-data';

// Public API: returns homepage data from real sources
// Jobs come from Supabase lf_jobs (real data)
// Business/Service opportunities are static config (community master list)
// Spaces use mock data until GHL Custom Objects are fully wired

export async function GET() {
  try {
    const supabase = await createServerSupabase();

    // Fetch real jobs from Supabase
    const { data: jobs, count: jobCount } = await supabase
      .from('lf_jobs')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .eq('is_public', true)
      .order('posted_date', { ascending: false })
      .limit(6);

    // Map Supabase jobs to the format the homepage expects
    const mappedJobs = (jobs || []).map(j => ({
      id: j.id,
      title: j.title || '',
      slug: j.slug || j.id,
      description: j.description || '',
      requirements: j.requirements || '',
      benefits: j.benefits || '',
      employerName: j.employer_name || 'Lakefront Economy',
      category: j.category || 'General',
      type: j.type || 'full-time',
      workMode: j.work_mode || 'on-site',
      location: j.location || 'Okeechobee, FL',
      salaryMin: j.salary_min || 0,
      salaryMax: j.salary_max || 0,
      salaryType: j.salary_type || 'annual',
      status: j.status || 'published',
      isPublic: j.is_public !== false,
      postedDate: j.posted_date || '',
      applicationCount: j.application_count || 0,
    }));

    // Static community data (not GHL-backed yet)
    const availableBiz = businessOpportunities.filter(b => b.status === 'available').length;
    const neededSvc = serviceOpportunities.filter(s => s.status === 'needed' || s.status === 'partial').length;

    return NextResponse.json({
      jobs: mappedJobs,
      totalJobs: jobCount || mappedJobs.length,
      spaces: mockSpaces, // Will be replaced with GHL custom objects later
      totalSpaces: mockSpaces.length,
      businessOpportunities: businessOpportunities.filter(b => b.status === 'available').slice(0, 4),
      availableBizCount: availableBiz,
      serviceOpportunities: serviceOpportunities.filter(s => s.status === 'needed').slice(0, 4),
      neededSvcCount: neededSvc,
    });
  } catch (err) {
    // Fallback: return empty data so the page doesn't break
    return NextResponse.json({
      jobs: [],
      totalJobs: 0,
      spaces: [],
      totalSpaces: 0,
      businessOpportunities: [],
      availableBizCount: 0,
      serviceOpportunities: [],
      neededSvcCount: 0,
    });
  }
}
