'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight, Briefcase, Search, Filter } from 'lucide-react';
import { ScrollReveal } from '@/components/public/ScrollReveal';

function formatEnum(s: string) {
  return (s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetch('/api/jobs')
      .then(r => r.json())
      .then(d => { setJobs(d.jobs || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const categories = Array.from(new Set(jobs.map(j => j.category).filter(Boolean)));
  const types = Array.from(new Set(jobs.map(j => j.job_type).filter(Boolean)));

  const filtered = jobs.filter(j => {
    if (search && !j.title?.toLowerCase().includes(search.toLowerCase()) && !j.company_name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && j.category !== categoryFilter) return false;
    if (typeFilter && j.job_type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="gradient-forest pb-0">
      <div className="max-container section-padding pb-16">
        <ScrollReveal>
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] uppercase mb-3 font-body font-semibold" style={{ color: '#C9B97A' }}>Careers</p>
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-white">Open Positions</h1>
            <div className="w-12 h-[2px] mx-auto mt-4 mb-4" style={{ backgroundColor: '#C9B97A' }} />
            <p className="text-base text-white/50 font-body max-w-lg mx-auto">Join the Lakefront Economy. Find your next career opportunity.</p>
          </div>
        </ScrollReveal>

        {/* Filters */}
        <ScrollReveal>
          <div className="bg-white/[0.06] backdrop-blur-sm border border-white/[0.1] rounded-xl p-4 mb-8 flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search jobs..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/[0.06] border border-white/[0.1] rounded-lg text-sm font-body text-white placeholder:text-white/30 focus:outline-none focus:border-[#C9B97A]/50"
              />
            </div>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-4 py-2.5 bg-white/[0.06] border border-white/[0.1] rounded-lg text-sm font-body text-white/70 focus:outline-none">
              <option value="">All Categories</option>
              {categories.map(c => <option key={String(c)} value={String(c)}>{String(c)}</option>)}
            </select>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-4 py-2.5 bg-white/[0.06] border border-white/[0.1] rounded-lg text-sm font-body text-white/70 focus:outline-none">
              <option value="">All Types</option>
              {types.map(t => <option key={String(t)} value={String(t)}>{formatEnum(String(t))}</option>)}
            </select>
          </div>
        </ScrollReveal>
      </div>

      {/* Jobs List */}
      <div className="bg-[#FAFAF7] py-16">
        <div className="max-container section-padding">
          {loading ? (
            <div className="text-center py-20"><div className="animate-spin h-8 w-8 border-4 border-[#C9B97A] border-t-transparent rounded-full mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 font-body">No positions found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((job, i) => (
                <ScrollReveal key={job.id} delay={i * 60}>
                  <Link href={`/jobs/${job.id}`} className="block bg-white rounded-xl border border-gray-100 p-6 hover-lift group transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-body font-semibold uppercase tracking-wider" style={{ backgroundColor: 'rgba(44,62,45,0.08)', color: '#2C3E2D' }}>{formatEnum(job.job_type || '')}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-body font-semibold uppercase tracking-wider bg-gray-50 text-gray-500">{job.category || 'General'}</span>
                          {job.work_mode && job.work_mode !== 'on_site' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-body font-semibold uppercase tracking-wider bg-blue-50 text-blue-600">{formatEnum(job.work_mode)}</span>
                          )}
                        </div>
                        <h2 className="font-display text-lg font-semibold transition-colors duration-300 group-hover:text-[#C9B97A]" style={{ color: '#2C3E2D' }}>{job.title}</h2>
                        <p className="text-sm text-gray-400 font-body mt-1">{job.company_name}</p>
                        <div className="flex items-center gap-1 text-sm text-gray-400 font-body mt-1"><MapPin className="w-3.5 h-3.5" />{job.location || 'Okeechobee, FL'}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-body font-semibold" style={{ color: '#2C3E2D' }}>{job.salary_range || 'Competitive'}</span>
                        <div className="mt-2"><ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#C9B97A] transition-colors ml-auto" /></div>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
