'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Briefcase, FileText, Clock, CheckCircle, Plus } from 'lucide-react';
import Link from 'next/link';

type R = Record<string,unknown>;
const s = (r:R,k:string):string => (r[k] as string)||'';

export default function EmployerDashboard() {
  const [jobs, setJobs] = useState<R[]>([]);
  const [apps, setApps] = useState<R[]>([]);
  const [pending, setPending] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: j } = await supabase.from('lf_jobs').select('*').eq('created_by', user.id).order('created_at', { ascending: false });
      setJobs(j||[]);
      const pCount = (j||[]).filter(x => s(x,'approval_status')==='pending').length;
      setPending(pCount);
      if (j && j.length > 0) {
        const ids = j.map(x => x.id);
        const { data: a } = await supabase.from('lf_applications').select('*, lf_jobs(title)').in('job_id', ids).order('created_at', { ascending: false }).limit(10);
        setApps(a||[]);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  const published = jobs.filter(j => s(j,'status')==='published' && s(j,'approval_status')==='approved').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl font-bold text-brand-forest">Employer Dashboard</h1><p className="text-sm font-body text-gray-500">Manage your job postings and review applicants</p></div>
        <Link href="/employer/jobs?create=1" className="flex items-center gap-2 px-4 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold hover:bg-brand-forest/90"><Plus className="w-4 h-4" />Post a Job</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-5"><Briefcase className="w-6 h-6 text-brand-sage mb-2" /><div className="text-2xl font-display font-bold text-brand-forest">{jobs.length}</div><p className="text-xs font-body text-gray-400">Total Jobs</p></div>
        <div className="bg-white rounded-xl border p-5"><CheckCircle className="w-6 h-6 text-green-500 mb-2" /><div className="text-2xl font-display font-bold text-brand-forest">{published}</div><p className="text-xs font-body text-gray-400">Published</p></div>
        <div className="bg-white rounded-xl border p-5"><Clock className="w-6 h-6 text-amber-500 mb-2" /><div className="text-2xl font-display font-bold text-brand-forest">{pending}</div><p className="text-xs font-body text-gray-400">Pending Approval</p></div>
        <div className="bg-white rounded-xl border p-5"><FileText className="w-6 h-6 text-brand-gold mb-2" /><div className="text-2xl font-display font-bold text-brand-forest">{apps.length}</div><p className="text-xs font-body text-gray-400">Applications</p></div>
      </div>
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-display font-semibold text-brand-forest mb-4">Recent Applications</h3>
        {apps.length === 0 ? <p className="text-sm text-gray-400 font-body text-center py-8">No applications yet.</p> : (
          <div className="space-y-3">{apps.slice(0,5).map(a => (
            <div key={s(a,'id')} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div><div className="text-sm font-body font-semibold text-brand-forest">{s((a.lf_jobs as R)||{},'title')||'Job'}</div><div className="text-xs text-gray-400">Applied {new Date(s(a,'created_at')).toLocaleDateString()}</div></div>
              <span className={`px-2 py-0.5 text-xs rounded font-semibold ${s(a,'status')==='submitted'?'bg-blue-50 text-blue-700':s(a,'status')==='reviewing'?'bg-amber-50 text-amber-700':'bg-gray-100 text-gray-500'}`}>{s(a,'status')}</span>
            </div>
          ))}</div>
        )}
      </div>
    </div>
  );
}
