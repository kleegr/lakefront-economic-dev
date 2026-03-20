'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, MapPin, Filter, Briefcase, Clock, X, Building2, ArrowRight } from 'lucide-react';
import { mockJobs } from '@/lib/mock-data';
import { formatSalary, formatEnum, timeAgo, cn } from '@/lib/utils';
import type { JobType, WorkMode } from '@/types';
const JOB_TYPES: JobType[] = ['full-time','part-time','contract','seasonal','internship'];
const WORK_MODES: WorkMode[] = ['on-site','remote','hybrid'];
const CATEGORIES = Array.from(new Set(mockJobs.map(j => j.category)));
export default function JobsPage() {
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const filteredJobs = useMemo(() => mockJobs.filter(job => {
    if (!job.isPublic) return false;
    if (query) { const q = query.toLowerCase(); if (!job.title.toLowerCase().includes(q) && !job.employerName.toLowerCase().includes(q) && !job.description.toLowerCase().includes(q) && !job.category.toLowerCase().includes(q)) return false; }
    if (selectedType && job.type !== selectedType) return false;
    if (selectedMode && job.workMode !== selectedMode) return false;
    if (selectedCategory && job.category !== selectedCategory) return false;
    return true;
  }), [query, selectedType, selectedMode, selectedCategory]);
  const activeFilterCount = [selectedType, selectedMode, selectedCategory].filter(Boolean).length;
  function clearFilters() { setSelectedType(''); setSelectedMode(''); setSelectedCategory(''); setQuery(''); }
  return (<>
    <section className="gradient-forest py-16 lg:py-24"><div className="max-container section-padding">
      <p className="text-brand-gold font-body font-semibold text-xs tracking-[0.2em] uppercase mb-4">Lakefront Economy</p>
      <h1 className="font-display text-3xl lg:text-5xl font-bold text-white mb-4">Jobs & Careers</h1>
      <p className="text-lg text-white/60 font-body max-w-2xl">Discover career opportunities within the Lakefront Economy. Browse open positions from community employers.</p>
    </div></section>

    {/* Info banner for companies */}
    <section className="bg-brand-gold/10 border-b border-brand-gold/20"><div className="max-container section-padding py-4 flex items-center justify-between">
      <div className="flex items-center gap-3"><Building2 className="w-5 h-5 text-brand-gold" /><p className="text-sm font-body text-brand-text/70"><span className="font-semibold">Are you a company looking to hire?</span> Post your open positions to reach Lakefront residents.</p></div>
      <Link href="/apply?type=business" className="hidden sm:inline-flex items-center gap-1 text-xs font-body font-semibold text-brand-gold hover:text-brand-forest uppercase tracking-wider">Apply as Employer <ArrowRight className="w-3 h-3" /></Link>
    </div></section>

    <section className="sticky top-[4.5rem] z-30 bg-white border-b border-gray-200 shadow-sm"><div className="max-container section-padding py-4"><div className="flex items-center gap-3"><div className="flex-1 relative"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search jobs by title, employer, or keyword..." value={query} onChange={e => setQuery(e.target.value)} className="input-field pl-11 py-2.5 text-sm" /></div><button onClick={() => setShowFilters(!showFilters)} className={cn('flex items-center gap-2 px-4 py-2.5 border rounded-sm text-sm font-body font-medium transition-all', showFilters || activeFilterCount > 0 ? 'border-brand-sage bg-brand-sage/5 text-brand-sage' : 'border-gray-300 text-brand-text/70 hover:border-gray-400')}><Filter className="w-4 h-4" />Filters{activeFilterCount > 0 && <span className="w-5 h-5 rounded-full bg-brand-sage text-white text-xs flex items-center justify-center">{activeFilterCount}</span>}</button></div>{showFilters && (<div className="mt-4 pt-4 border-t border-gray-100 grid sm:grid-cols-3 gap-4 animate-fade-in"><div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Job Type</label><select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="input-field py-2 text-sm"><option value="">All Types</option>{JOB_TYPES.map(t => <option key={t} value={t}>{formatEnum(t)}</option>)}</select></div><div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Work Mode</label><select value={selectedMode} onChange={e => setSelectedMode(e.target.value)} className="input-field py-2 text-sm"><option value="">All Modes</option>{WORK_MODES.map(m => <option key={m} value={m}>{formatEnum(m)}</option>)}</select></div><div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Category</label><select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="input-field py-2 text-sm"><option value="">All Categories</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div></div>)}</div></section>

    <section className="py-10 lg:py-16 bg-brand-warm min-h-[50vh]"><div className="max-container section-padding"><div className="flex items-center justify-between mb-6"><p className="text-sm font-body text-brand-muted"><span className="font-semibold text-brand-text">{filteredJobs.length}</span> position{filteredJobs.length !== 1 ? 's' : ''} found</p>{activeFilterCount > 0 && <button onClick={clearFilters} className="flex items-center gap-1 text-sm font-body text-brand-sage hover:text-brand-forest transition-colors"><X className="w-3.5 h-3.5" /> Clear all</button>}</div>{filteredJobs.length > 0 ? (<div className="space-y-4">{filteredJobs.map(job => (<Link key={job.id} href={`/jobs/${job.id}`} className="block bg-white rounded-sm border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-brand-gold/30 transition-all group"><div className="flex flex-col sm:flex-row sm:items-start gap-4"><div className="w-12 h-12 rounded-sm bg-brand-forest/5 flex items-center justify-center shrink-0"><Briefcase className="w-6 h-6 text-brand-sage" /></div><div className="flex-1 min-w-0"><div className="flex flex-wrap items-center gap-2 mb-1"><h3 className="font-display text-lg font-semibold text-brand-forest group-hover:text-brand-sage transition-colors">{job.title}</h3><span className="px-2.5 py-0.5 bg-brand-sage/10 text-brand-sage text-xs font-body font-semibold rounded-sm">{formatEnum(job.type)}</span>{job.workMode !== 'on-site' && <span className="px-2 py-0.5 bg-brand-gold/10 text-brand-gold text-xs font-body font-medium rounded-sm">{formatEnum(job.workMode)}</span>}</div><p className="text-sm text-brand-muted font-body mb-2">{job.employerName}</p><p className="text-sm text-brand-text/60 font-body line-clamp-2 mb-3">{job.description}</p><div className="flex flex-wrap items-center gap-4 text-sm text-brand-muted font-body"><span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span><span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{timeAgo(job.postedDate)}</span><span className="font-semibold text-brand-forest">{formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}</span></div></div></div></Link>))}</div>) : (<div className="text-center py-20"><Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" /><h3 className="font-display text-xl font-semibold text-brand-text mb-2">No positions found</h3><p className="text-sm text-brand-muted font-body mb-4">Try adjusting your search or filters.</p><button onClick={clearFilters} className="btn-secondary text-xs">Clear Filters</button></div>)}</div></section>
  </>);
}
