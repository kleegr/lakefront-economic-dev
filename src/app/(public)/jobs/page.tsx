'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, Briefcase, ArrowRight, LogIn } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Job = Record<string, unknown>;
const g = (j: Job, k: string): string => (j[k] as string) || '';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from('lf_jobs').select('*').eq('status', 'published').order('created_at', { ascending: false });
      setJobs(data || []); setLoading(false);
    }
    load();
  }, []);

  const filtered = jobs.filter(j => {
    if (!query) return true;
    const q = query.toLowerCase();
    return g(j,'title').toLowerCase().includes(q) || g(j,'company_name').toLowerCase().includes(q) || g(j,'category').toLowerCase().includes(q);
  });

  return (
    <>
      <section className="gradient-forest py-16 lg:py-24"><div className="max-container section-padding"><p className="text-brand-gold font-body font-semibold text-xs tracking-[0.2em] uppercase mb-4">Careers</p><h1 className="font-display text-3xl lg:text-5xl font-bold text-white mb-4">Jobs Board</h1><p className="text-lg text-white/60 font-body max-w-xl">Find your next career opportunity within the Lakefront community.</p></div></section>
      <section className="sticky top-20 z-30 bg-white border-b border-gray-200 shadow-sm"><div className="max-container section-padding py-4"><div className="flex gap-3"><div className="flex-1 relative"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search jobs..." value={query} onChange={e => setQuery(e.target.value)} className="input-field pl-11 py-2.5 text-sm" /></div><Link href="/auth/login?redirect=/applicant/jobs" className="flex items-center gap-2 px-4 py-2.5 bg-brand-forest text-white rounded-sm text-sm font-body font-semibold hover:bg-brand-forest/90"><LogIn className="w-4 h-4" />Sign In to Apply</Link></div></div></section>
      <section className="py-10 lg:py-16 bg-brand-warm min-h-[50vh]"><div className="max-container section-padding">
        <p className="text-sm font-body text-brand-muted mb-6"><span className="font-semibold text-brand-text">{filtered.length}</span> position{filtered.length !== 1 ? 's' : ''} available</p>
        {loading ? <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div> : filtered.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{filtered.map(job => {
            const sb = g(job,'job_status')==='coming_soon'?'Coming Soon':g(job,'job_status')==='accepting_offers'?'Accepting Offers':g(job,'job_status')==='hired'||g(job,'job_status')==='filled'?'Filled':'';
            return (<Link key={g(job,'id')} href={`/jobs/${g(job,'id')}`} className="card-public p-6 group">
              <div className="flex items-start justify-between mb-4"><span className="px-3 py-1 bg-brand-sage/10 text-brand-sage text-xs font-body font-semibold rounded-sm">{g(job,'job_type')||'Full-time'}</span>{sb&&<span className="px-2 py-0.5 bg-brand-gold/10 text-brand-gold text-xs font-body font-medium rounded-sm">{sb}</span>}</div>
              <h3 className="font-display text-lg font-semibold text-brand-forest mb-2 group-hover:text-brand-sage transition-colors">{g(job,'title')}</h3>
              {g(job,'company_name')&&<p className="text-sm text-brand-muted font-body mb-1">{g(job,'company_name')}</p>}
              <div className="flex items-center gap-1 text-sm text-brand-muted font-body mb-4"><MapPin className="w-3.5 h-3.5" />{g(job,'location')||'Lakefront Estates'}</div>
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between"><span className="text-sm font-body font-semibold text-brand-forest">{g(job,'salary_range')||'Contact for details'}</span><span className="text-xs text-brand-sage font-body font-semibold flex items-center gap-1">View <ArrowRight className="w-3 h-3" /></span></div>
            </Link>);
          })}</div>
        ) : (<div className="text-center py-20"><Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" /><h3 className="font-display text-xl font-semibold text-brand-text mb-2">No positions found</h3></div>)}
        <div className="mt-16 text-center bg-white rounded-sm border border-gray-100 p-10"><h3 className="font-display text-2xl font-bold text-brand-forest mb-3">Ready to Apply?</h3><p className="text-brand-muted font-body mb-6 max-w-md mx-auto">Sign in to your Resident Portal to browse, save, and apply for jobs.</p><Link href="/auth/login?redirect=/applicant/jobs" className="btn-primary text-xs">Sign In / Create Account</Link></div>
      </div></section>
    </>
  );
}
