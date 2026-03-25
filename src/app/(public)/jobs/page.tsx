'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, MapPin, DollarSign, Clock, ArrowRight, Search, Building2, List, LayoutGrid, Info } from 'lucide-react';
import { ScrollReveal } from '@/components/public/ScrollReveal';
import {
  JOB_STATUS_LABELS,
  JOB_STATUS_HELPER,
  JOB_STATUS_COLORS,
  APPLY_ALLOWED_STATUSES,
  type JobOpeningStatus,
} from '@/lib/ghl/job-fields-config';

// Jobs page with list view + card view toggle, Apply button goes directly to application
export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'cards'|'list'>('cards');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => { fetch('/api/jobs').then(r => r.json()).then(d => { setJobs(d.jobs || []); setLoading(false); }); }, []);
  const fmt = (s: string) => (s || '').replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());

  const filtered = jobs.filter(j => {
    if (search && !(j.title?.toLowerCase().includes(search.toLowerCase()) || j.company_name?.toLowerCase().includes(search.toLowerCase()) || j.category?.toLowerCase().includes(search.toLowerCase()))) return false;
    if (statusFilter !== 'all' && (j.job_opening_status || 'open') !== statusFilter) return false;
    return true;
  });

  const getStatus = (job: any): JobOpeningStatus => (job.job_opening_status || 'open') as JobOpeningStatus;
  const canApply = (job: any) => APPLY_ALLOWED_STATUSES.includes(getStatus(job));

  function StatusBadge({ job, size = 'sm' }: { job: any; size?: 'sm' | 'lg' }) {
    const status = getStatus(job);
    const colors = JOB_STATUS_COLORS[status] || JOB_STATUS_COLORS.open;
    const label = JOB_STATUS_LABELS[status] || 'Open';
    const helper = JOB_STATUS_HELPER[status];
    return (
      <div className="inline-flex flex-col items-start">
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-body font-semibold uppercase tracking-wider ${colors.bg} ${colors.text} ${size === 'lg' ? 'text-xs' : 'text-[10px]'}`}>
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${status === 'open' ? 'bg-green-500' : status === 'hired' ? 'bg-gray-400' : status === 'reserved' ? 'bg-amber-500' : status === 'pending' ? 'bg-blue-400' : 'bg-purple-400'}`} />
          {label}
        </span>
        {helper && <span className="text-[10px] font-body text-gray-400 mt-0.5 ml-1">{helper}</span>}
      </div>
    );
  }

  return (
    <div>
      <div className="gradient-forest relative overflow-hidden"><div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600)', backgroundSize: 'cover', backgroundPosition: 'center' }} /><div className="max-container section-padding py-20 relative z-10"><ScrollReveal><div className="text-center"><p className="text-xs tracking-[0.3em] uppercase mb-3 font-body font-semibold" style={{ color: '#C9B97A' }}>Careers</p><h1 className="font-display text-3xl lg:text-4xl font-bold text-white">Job Opportunities</h1><div className="w-12 h-[2px] mx-auto mt-4 mb-4" style={{ backgroundColor: '#C9B97A' }} /><p className="text-base text-white/50 font-body max-w-lg mx-auto">Find your next career at Lakefront Estates.</p></div></ScrollReveal></div></div>

      <div className="bg-[#FAFAF7] py-16"><div className="max-container section-padding">
        <div className="flex flex-wrap gap-4 mb-8 items-center">
          <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs, companies, categories..." className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm font-body focus:outline-none focus:border-[#C9B97A]" /></div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-3 border border-gray-200 rounded-xl text-sm font-body focus:outline-none focus:border-[#C9B97A] bg-white">
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="reserved">Reserved</option>
            <option value="pending">Pending</option>
            <option value="hired">Hired</option>
            <option value="coming_soon">Coming Soon</option>
          </select>
          <div className="flex gap-1 border border-gray-200 rounded-lg p-1"><button onClick={() => setView('cards')} className={`p-2 rounded ${view === 'cards' ? 'bg-brand-forest text-white' : 'text-gray-400'}`}><LayoutGrid className="w-4 h-4" /></button><button onClick={() => setView('list')} className={`p-2 rounded ${view === 'list' ? 'bg-brand-forest text-white' : 'text-gray-400'}`}><List className="w-4 h-4" /></button></div>
          <Link href="/jobs/employer-apply" className="px-5 py-3 rounded-full text-xs font-body font-semibold text-white shrink-0" style={{ backgroundColor: '#C9B97A' }}>Post a Job</Link>
        </div>

        {loading ? <div className="text-center py-12"><div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-[#C9B97A] rounded-full mx-auto" /></div> : filtered.length === 0 ? <div className="text-center py-16"><Briefcase className="w-12 h-12 text-gray-200 mx-auto mb-3" /><p className="text-gray-400 font-body">No jobs found matching your search.</p></div> : (
          view === 'cards' ? (
            <div className="grid md:grid-cols-2 gap-6">{filtered.map((job, i) => (
              <ScrollReveal key={job.id} delay={i * 60}>
                <div className={`bg-white rounded-xl border overflow-hidden hover-lift ${getStatus(job) === 'hired' ? 'border-gray-200 opacity-80' : 'border-gray-100'}`}>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge job={job} />
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-body font-semibold uppercase tracking-wider bg-green-50 text-green-700">{fmt(job.job_type)}</span>
                      </div>
                      {job.salary_range && <span className="text-sm font-display font-bold shrink-0" style={{ color: '#2C3E2D' }}>{job.salary_range}</span>}
                    </div>
                    <h3 className="font-display text-lg font-semibold mb-1" style={{ color: '#2C3E2D' }}>{job.title}</h3>
                    <div className="flex items-center gap-3 text-xs font-body text-gray-400 mb-3">{job.company_name && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{job.company_name}</span>}<span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location || 'Okeechobee, FL'}</span>{job.category && <span>{job.category}</span>}</div>
                    {job.description && <p className="text-sm text-gray-500 font-body mb-4 line-clamp-2">{job.description}</p>}
                    <div className="flex items-center gap-3">
                      {canApply(job) ? (
                        <Link href={`/jobs/${job.slug || job.id}/apply`} className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-body font-semibold text-white" style={{ backgroundColor: '#C9B97A' }}>Apply Now</Link>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-body font-semibold text-gray-400 bg-gray-100 cursor-not-allowed">
                          {getStatus(job) === 'hired' ? 'Position Filled' : getStatus(job) === 'coming_soon' ? 'Coming Soon' : 'Applications Closed'}
                        </span>
                      )}
                      <button onClick={() => setExpandedId(expandedId === job.id ? null : job.id)} className="text-xs font-body font-semibold text-gray-400 hover:text-brand-forest">View Details</button>
                    </div>
                  </div>
                  {expandedId === job.id && <div className="border-t border-gray-100 p-6 bg-gray-50/50 space-y-3 text-sm font-body"><div className="grid grid-cols-2 gap-2 text-xs"><div><strong className="text-gray-400">Category:</strong> {job.category}</div><div><strong className="text-gray-400">Work Mode:</strong> {fmt(job.work_mode)}</div><div><strong className="text-gray-400">Compensation:</strong> {fmt(job.compensation_type)}</div><div><strong className="text-gray-400">Department:</strong> {job.department || '\u2014'}</div><div><strong className="text-gray-400">Status:</strong> {JOB_STATUS_LABELS[getStatus(job)]}</div></div>{job.requirements && <div><strong className="text-gray-400 text-xs">Requirements:</strong><p className="text-gray-600 mt-1">{job.requirements}</p></div>}{job.benefits && <div><strong className="text-gray-400 text-xs">Benefits:</strong><p className="text-gray-600 mt-1">{job.benefits}</p></div>}</div>}
                </div>
              </ScrollReveal>
            ))}</div>
          ) : (
            <div className="bg-white rounded-xl border overflow-hidden"><table className="w-full text-sm font-body"><thead><tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b bg-gray-50"><th className="p-3">Position</th><th className="p-3">Company</th><th className="p-3">Status</th><th className="p-3">Type</th><th className="p-3">Location</th><th className="p-3">Salary</th><th className="p-3"></th></tr></thead><tbody>{filtered.map(job => (
              <tr key={job.id} className={`border-b border-gray-50 hover:bg-gray-50/50 ${getStatus(job) === 'hired' ? 'opacity-70' : ''}`}><td className="p-3 font-semibold" style={{ color: '#2C3E2D' }}>{job.title}</td><td className="p-3 text-gray-500">{job.company_name || '\u2014'}</td><td className="p-3"><StatusBadge job={job} /></td><td className="p-3"><span className="px-2 py-0.5 text-[10px] rounded-full font-semibold bg-green-50 text-green-700">{fmt(job.job_type)}</span></td><td className="p-3 text-gray-500">{job.location || 'Okeechobee, FL'}</td><td className="p-3 text-gray-500">{job.salary_range || '\u2014'}</td><td className="p-3">{canApply(job) ? <Link href={`/jobs/${job.slug || job.id}/apply`} className="text-xs font-semibold px-3 py-1.5 rounded-full text-white" style={{ backgroundColor: '#C9B97A' }}>Apply</Link> : <span className="text-xs font-semibold px-3 py-1.5 rounded-full text-gray-400 bg-gray-100">{getStatus(job) === 'hired' ? 'Filled' : 'Closed'}</span>}</td></tr>
            ))}</tbody></table></div>
          )
        )}
      </div></div>
    </div>
  );
}
