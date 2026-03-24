'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, MapPin, DollarSign, ArrowRight, Search, Building2 } from 'lucide-react';
import { MovingBanner } from '@/components/public/MovingBanner';
import { ScrollReveal } from '@/components/public/ScrollReveal';

function fmt(s: string) { return (s || '').replace(/_/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetch('/api/jobs?limit=50').then(r => r.json()).then(d => { setJobs(d.jobs || []); setLoading(false); }); }, []);
  const filtered = jobs.filter(j => !search || j.title?.toLowerCase().includes(search.toLowerCase()) || j.company_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <MovingBanner page="jobs" title="Job Opportunities" badge="Employer / Employee" subtitle="Find your next career at Lakefront Estates or post jobs for your business." />
      <div className="bg-[#FAFAF7] py-16">
        <div className="max-container section-padding">
          <div className="flex gap-4 mb-8 items-center flex-wrap">
            <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs..." className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm font-body focus:outline-none focus:border-[#C9B97A]" /></div>
            <Link href="/jobs/employer-apply" className="px-6 py-3 rounded-full text-sm font-body font-semibold text-white shrink-0" style={{ backgroundColor: '#C9B97A' }}>Post a Job (Employer)</Link>
            <Link href="/apply" className="px-6 py-3 rounded-full text-sm font-body font-semibold border border-[#2C3E2D]/20 text-[#2C3E2D] shrink-0">Apply for Work</Link>
          </div>
          {loading ? <div className="text-center py-12"><div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-[#C9B97A] rounded-full mx-auto" /></div> : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((job, i) => (
                <ScrollReveal key={job.id} delay={i * 60}>
                  <div className="bg-white rounded-xl border border-gray-100 p-6 hover-lift h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-body font-semibold uppercase tracking-wider bg-green-50 text-green-700">{fmt(job.job_type || 'full-time')}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-body font-semibold uppercase tracking-wider bg-gray-50 text-gray-500">{job.category}</span>
                    </div>
                    <h3 className="font-display text-lg font-semibold mb-1" style={{ color: '#2C3E2D' }}>{job.title}</h3>
                    <div className="space-y-1 text-sm text-gray-400 font-body mb-3">
                      {job.company_name && <p className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{job.company_name}</p>}
                      <p className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location || 'Okeechobee, FL'}</p>
                      {job.salary_range && <p className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />{job.salary_range}</p>}
                    </div>
                    {job.description && <p className="text-xs text-gray-400 font-body mb-4 line-clamp-2 flex-1">{job.description}</p>}
                    <Link href="/apply" className="inline-flex items-center gap-1 text-sm font-body font-semibold hover:gap-2 transition-all mt-auto" style={{ color: '#C9B97A' }}>Apply <ArrowRight className="w-4 h-4" /></Link>
                  </div>
                </ScrollReveal>
              ))}
              {filtered.length === 0 && <div className="col-span-3 text-center py-12"><p className="text-gray-400 font-body">No jobs found.</p></div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
