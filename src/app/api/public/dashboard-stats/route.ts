import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { ghlConfig, isGhlConfigured } from '@/lib/ghl/config';
import { ghl } from '@/lib/ghl/client';

// Portal dashboard stats: combines Supabase + GHL data

export async function GET() {
  try {
    const supabase = await createServerSupabase();

    // Supabase stats
    const [jobsRes, usersRes, pendingRes] = await Promise.allSettled([
      supabase.from('lf_jobs').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('lf_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('lf_profiles').select('*', { count: 'exact', head: true }).eq('account_status', 'pending'),
    ]);

    const totalJobs = jobsRes.status === 'fulfilled' ? (jobsRes.value.count || 0) : 0;
    const totalUsers = usersRes.status === 'fulfilled' ? (usersRes.value.count || 0) : 0;
    const pendingApprovals = pendingRes.status === 'fulfilled' ? (pendingRes.value.count || 0) : 0;

    // GHL stats (if configured)
    let ghlStats = null;
    if (isGhlConfigured()) {
      try {
        const [contactsRes, pipelinesRes] = await Promise.allSettled([
          ghl.getContacts({ limit: '1' }),
          ghl.getPipelines(),
        ]);
        ghlStats = {
          totalContacts: contactsRes.status === 'fulfilled' ? (contactsRes.value?.meta?.total || 0) : 0,
          pipelines: pipelinesRes.status === 'fulfilled' ? (pipelinesRes.value?.pipelines || []).map((p: any) => ({
            name: p.name,
            id: p.id,
            stages: p.stages?.length || 0,
          })) : [],
        };
      } catch {
        ghlStats = null;
      }
    }

    return NextResponse.json({
      totalJobs,
      totalUsers,
      pendingApprovals,
      ghlConfigured: isGhlConfigured(),
      ghl: ghlStats,
    });
  } catch (err) {
    return NextResponse.json({
      totalJobs: 0,
      totalUsers: 0,
      pendingApprovals: 0,
      ghlConfigured: false,
      ghl: null,
    });
  }
}
