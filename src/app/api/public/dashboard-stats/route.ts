import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { ghlConfig, isGhlConfigured } from '@/lib/ghl/config';
export const dynamic = 'force-dynamic';

// Portal dashboard stats: combines Supabase + Kleegr data
export async function GET() {
  const supabase = await createServerSupabase();
  const stats: Record<string, any> = {};
  const { count: jobCount } = await supabase.from('lf_jobs').select('*', { count: 'exact', head: true });
  stats.totalJobs = jobCount || 0;
  const { count: pubCount } = await supabase.from('lf_jobs').select('*', { count: 'exact', head: true }).eq('status', 'published');
  stats.publishedJobs = pubCount || 0;
  const { count: appCount } = await supabase.from('lf_applications').select('*', { count: 'exact', head: true });
  stats.totalApplications = appCount || 0;
  const { count: pendingCount } = await supabase.from('lf_applications').select('*', { count: 'exact', head: true }).in('status', ['submitted', 'reviewing']);
  stats.pendingApplications = pendingCount || 0;
  const { count: userCount } = await supabase.from('lf_profiles').select('*', { count: 'exact', head: true });
  stats.totalUsers = userCount || 0;
  const { data: recentApps } = await supabase.from('lf_applications').select('id, applicant_name, applicant_email, status, application_type, created_at').order('created_at', { ascending: false }).limit(5);
  stats.recentApplications = recentApps || [];
  // Kleegr stats (if configured)
  if (isGhlConfigured()) {
    try {
      const res = await fetch(`https://services.leadconnectorhq.com/contacts/?locationId=${ghlConfig.locationId}&limit=1`, { headers: { 'Authorization': `Bearer ${ghlConfig.token}`, 'Version': '2021-07-28' } });
      const data = await res.json();
      stats.ghlContacts = data?.meta?.total || data?.total || 0;
    } catch { stats.ghlContacts = 0; }
  }
  return NextResponse.json(stats);
}
