'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Briefcase, FileText, Plus } from 'lucide-react';
import Link from 'next/link';

export default function EmployerDashboard() {
  const [jobs, setJobs] = useState<Record<string,unknown>[]>([]);
  const [applications, setApplications] = useState<Record<string,unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Only fetch MY jobs (RLS enforces this)
      const { data: myJobs } = await supabase.from('lf_jobs').select('*').eq('created_by', user.id).order('created_at', { ascending: false });
      setJobs(myJobs || []);
      // Only fetch applications TO my jobs (RLS enforces this)
      if (myJobs && myJobs.length > 0) {
        const jobIds = myJobs.map(j => j.id);
        const { data: apps } = await supabase.from('lf_applications').select('*, lf_jobs(title)').in('job_id', jobIds).order('created_at', { ascending: false });
        setApplications(apps || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl font-bold text-brand-forest">My Dashboard</h1><p className="text-sm font-body text-gray-500">Manage your jobs and review applications</p></div>
        <Link href="/employer/jobs" className="flex items-center gap-2 px-4 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold hover:bg-brand-forest/90"><Plus className="w-4 h-4" />Post a Job</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-1"><Briefcase className="w-5 h-5 text-brand-sage" /><span className="text-2xl font-display font-bold text-brand-forest">{jobs.length}</span></div>
          <p className="text-sm font-body text-gray-500">My Job Postings</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-1"><FileText className="w-5 h-5 text-brand-gold" /><span className="text-2xl font-display font-bold text-brand-forest">{applications.length}</span></div>
          <p className="text-sm font-body text-gray-500">Applications Received</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-display font-semibold text-brand-forest mb-4">My Jobs</h3>
        {jobs.length === 0 ? (
          <div className="text-center py-8"><p className="text-sm text-gray-400 font-body">You haven&apos;t posted any jobs yet.</p><Link href="/employer/jobs" className="text-sm text-brand-sage font-body mt-2 inline-block">Post your first job &rarr;</Link></div>
        ) : (
          <div className="space-y-3">{jobs.map(j => (
            <div key={j.id as string} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div><div className="font-semibold text-brand-forest text-sm font-body">{j.title as string}</div><div className="text-xs text-gray-400">{j.job_type as string} &middot; {j.status as string}</div></div>
              <span className={`px-2 py-0.5 text-xs rounded font-semibold ${(j.status as string) === 'published' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{j.status as string}</span>
            </div>
          ))}</div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-display font-semibold text-brand-forest mb-4">Recent Applications</h3>
        {applications.length === 0 ? (
          <p className="text-sm text-gray-400 font-body text-center py-8">No applications yet.</p>
        ) : (
          <div className="space-y-3">{applications.map(a => (
            <div key={a.id as string} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div><div className="text-sm font-body font-semibold text-brand-forest">{a.applicant_id as string}</div><div className="text-xs text-gray-400">Applied to: {((a as Record<string,unknown>).lf_jobs as Record<string,unknown>)?.title as string || 'Unknown'}</div></div>
              <span className={`px-2 py-0.5 text-xs rounded font-semibold ${(a.status as string) === 'submitted' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>{a.status as string}</span>
            </div>
          ))}</div>
        )}
      </div>
    </div>
  );
}
