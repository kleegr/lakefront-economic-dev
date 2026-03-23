'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, FileText, Building2, Wrench, TrendingUp, Warehouse, ArrowUpRight, ArrowRight, Users, Clock, Plug, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface DashboardData {
  jobs: any[];
  jobCount: number;
  applications: any[];
  appCount: number;
  userCount: number;
  pendingCount: number;
  ghlConfigured: boolean;
  ghlContacts: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const supabase = createClient();
      try {
        const [jobsRes, appsRes, usersRes, pendingRes] = await Promise.allSettled([
          supabase.from('lf_jobs').select('id, title, company_name, job_type, salary_range, status, category, created_at').order('created_at', { ascending: false }).limit(10),
          supabase.from('lf_applications').select('id, job_id, status, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(5),
          supabase.from('lf_profiles').select('id', { count: 'exact', head: true }),
          supabase.from('lf_profiles').select('id', { count: 'exact', head: true }).eq('account_status', 'pending'),
        ]);

        const jobs = jobsRes.status === 'fulfilled' ? (jobsRes.value.data || []) : [];
        const applications = appsRes.status === 'fulfilled' ? (appsRes.value.data || []) : [];
        const appCount = appsRes.status === 'fulfilled' ? (appsRes.value.count || 0) : 0;
        const userCount = usersRes.status === 'fulfilled' ? (usersRes.value.count || 0) : 0;
        const pendingCount = pendingRes.status === 'fulfilled' ? (pendingRes.value.count || 0) : 0;

        setData({
          jobs,
          jobCount: jobs.length,
          applications,
          appCount,
          userCount,
          pendingCount,
          ghlConfigured: false,
          ghlContacts: 0,
        });
      } catch (err) {
        console.error('Dashboard load error:', err);
        setData({ jobs: [], jobCount: 0, applications: [], appCount: 0, userCount: 0, pendingCount: 0, ghlConfigured: false, ghlContacts: 0 });
      }
      setLoading(false);
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-sage" />
      </div>
    );
  }

  const publishedJobs = data?.jobs?.filter((j: any) => j.status === 'published') || [];

  const stats = [
    { label: 'Active Jobs', value: publishedJobs.length, icon: Briefcase, href: '/portal/jobs', color: 'text-blue-600 bg-blue-50' },
    { label: 'Applications', value: data?.appCount || 0, icon: FileText, href: '/portal/applications', color: 'text-purple-600 bg-purple-50' },
    { label: 'Users', value: data?.userCount || 0, icon: Users, href: '/portal/users', color: 'text-green-600 bg-green-50' },
    { label: 'Pending', value: data?.pendingCount || 0, icon: Clock, href: '/portal/approvals', color: 'text-orange-600 bg-orange-50' },
    { label: 'GHL Contacts', value: data?.ghlContacts || 0, icon: Plug, href: '/portal/ghl-setup', color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Spaces', value: 4, icon: Warehouse, href: '/portal/spaces', color: 'text-sky-600 bg-sky-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-brand-text">Dashboard</h1>
        <p className="text-sm font-body text-brand-muted mt-1">Overview of Lakefront Economic Development operations.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map(stat => (
          <Link key={stat.label} href={stat.href} className="card-portal p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center`}><stat.icon className="w-4 h-4" /></div>
              <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>
            <div className="text-2xl font-display font-bold text-brand-text">{stat.value}</div>
            <div className="text-xs font-body text-brand-muted mt-0.5">{stat.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions + Recent */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-portal">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-display font-semibold text-brand-text">Quick Actions</h2>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3">
            {[
              { label: 'Post New Job', href: '/portal/jobs/new', icon: Briefcase },
              { label: 'Add Business', href: '/portal/businesses/new', icon: Building2 },
              { label: 'Review Applications', href: '/portal/applications', icon: FileText },
              { label: 'Manage Spaces', href: '/portal/spaces', icon: Warehouse },
              { label: 'GHL Setup', href: '/portal/ghl-setup', icon: Plug },
              { label: 'Manage Users', href: '/portal/users', icon: Users },
            ].map(action => (
              <Link key={action.href} href={action.href} className="flex items-center gap-3 p-3.5 rounded-lg border border-gray-200 hover:bg-portal-hover hover:border-portal-accent/20 transition-all group">
                <action.icon className="w-4 h-4 text-portal-accent shrink-0" />
                <span className="text-sm font-body font-medium text-brand-text group-hover:text-portal-accent transition-colors">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="card-portal">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-display font-semibold text-brand-text">Recent Applications</h2>
            <Link href="/portal/applications" className="text-xs font-body font-semibold text-portal-accent hover:text-brand-light flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(data?.applications?.length || 0) === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-brand-muted font-body">No applications yet. They will appear here when applicants apply through GHL or the portal.</div>
            ) : (
              data?.applications?.slice(0, 5).map((app: any) => (
                <div key={app.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-body font-medium text-brand-text truncate">Application #{String(app.id).substring(0, 8)}</p>
                    <p className="text-xs font-body text-brand-muted truncate">{app.status}</p>
                  </div>
                  <span className="text-xs font-body text-brand-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" />{new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Active Jobs Table */}
      <div className="card-portal">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-display font-semibold text-brand-text">Active Job Listings</h2>
          <Link href="/portal/jobs" className="text-xs font-body font-semibold text-portal-accent hover:text-brand-light flex items-center gap-1">Manage Jobs <ArrowRight className="w-3 h-3" /></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 font-body font-medium text-brand-muted text-xs uppercase tracking-wider">Title</th>
                <th className="text-left px-5 py-3 font-body font-medium text-brand-muted text-xs uppercase tracking-wider">Company</th>
                <th className="text-left px-5 py-3 font-body font-medium text-brand-muted text-xs uppercase tracking-wider">Type</th>
                <th className="text-left px-5 py-3 font-body font-medium text-brand-muted text-xs uppercase tracking-wider">Pay</th>
                <th className="text-left px-5 py-3 font-body font-medium text-brand-muted text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(data?.jobs || []).map((job: any) => (
                <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-body font-medium text-brand-text">{job.title}</td>
                  <td className="px-5 py-3.5 font-body text-brand-muted">{job.company_name}</td>
                  <td className="px-5 py-3.5"><span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-body font-medium rounded-full capitalize">{(job.job_type || '').replace(/-/g, ' ')}</span></td>
                  <td className="px-5 py-3.5 font-body text-brand-text text-xs">{job.salary_range || 'N/A'}</td>
                  <td className="px-5 py-3.5"><span className={`px-2 py-0.5 text-xs font-body font-medium rounded-full ${job.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{job.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
