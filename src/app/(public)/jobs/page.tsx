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
  const [jobs, setJobs] = useState&lt;any[]&gt;([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState&lt;'cards'|'list'&gt;('cards');
  const [expandedId, setExpandedId] = useState&lt;string | null&gt;(null);
  const [statusFilter, setStatusFilter] = useState&lt;string&gt;('all');

  useEffect(() =&gt; { fetch('/api/jobs').then(r =&gt; r.json()).then(d =&gt; { setJobs(d.jobs || []); setLoading(false); }); }, []);
  const fmt = (s: string) =&gt; (s || '').replace(/_/g, ' ').replace(/\b\w/g, (c: string) =&gt; c.toUpperCase());

  const filtered = jobs.filter(j =&gt; {
    if (search &amp;&amp; !(j.title?.toLowerCase().includes(search.toLowerCase()) || j.company_name?.toLowerCase().includes(search.toLowerCase()) || j.category?.toLowerCase().includes(search.toLowerCase()))) return false;
    if (statusFilter !== 'all' &amp;&amp; (j.job_opening_status || 'open') !== statusFilter) return false;
    return true;
  });

  const getStatus = (job: any): JobOpeningStatus =&gt; (job.job_opening_status || 'open') as JobOpeningStatus;
  const canApply = (job: any) =&gt; APPLY_ALLOWED_STATUSES.includes(getStatus(job));

  function StatusBadge({ job, size = 'sm' }: { job: any; size?: 'sm' | 'lg' }) {
    const status = getStatus(job);
    const colors = JOB_STATUS_COLORS[status] || JOB_STATUS_COLORS.open;
    const label = JOB_STATUS_LABELS[status] || 'Open';
    const helper = JOB_STATUS_HELPER[status];
    return (
      &lt;div className="inline-flex flex-col items-start"&gt;
        &lt;span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-body font-semibold uppercase tracking-wider ${colors.bg} ${colors.text} ${size === 'lg' ? 'text-xs' : 'text-[10px]'}`}&gt;
          &lt;span className={`inline-block w-1.5 h-1.5 rounded-full ${status === 'open' ? 'bg-green-500' : status === 'hired' ? 'bg-gray-400' : status === 'reserved' ? 'bg-amber-500' : status === 'pending' ? 'bg-blue-400' : 'bg-purple-400'}`} /&gt;
          {label}
        &lt;/span&gt;
        {helper &amp;&amp; &lt;span className="text-[10px] font-body text-gray-400 mt-0.5 ml-1"&gt;{helper}&lt;/span&gt;}
      &lt;/div&gt;
    );
  }

  return (
    &lt;div&gt;
      &lt;div className="gradient-forest relative overflow-hidden"&gt;&lt;div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600)', backgroundSize: 'cover', backgroundPosition: 'center' }} /&gt;&lt;div className="max-container section-padding py-20 relative z-10"&gt;&lt;ScrollReveal&gt;&lt;div className="text-center"&gt;&lt;p className="text-xs tracking-[0.3em] uppercase mb-3 font-body font-semibold" style={{ color: '#C9B97A' }}&gt;Careers&lt;/p&gt;&lt;h1 className="font-display text-3xl lg:text-4xl font-bold text-white"&gt;Job Opportunities&lt;/h1&gt;&lt;div className="w-12 h-[2px] mx-auto mt-4 mb-4" style={{ backgroundColor: '#C9B97A' }} /&gt;&lt;p className="text-base text-white/50 font-body max-w-lg mx-auto"&gt;Find your next career at Lakefront Estates.&lt;/p&gt;&lt;/div&gt;&lt;/ScrollReveal&gt;&lt;/div&gt;&lt;/div&gt;

      &lt;div className="bg-[#FAFAF7] py-16"&gt;&lt;div className="max-container section-padding"&gt;
        &lt;div className="flex flex-wrap gap-4 mb-8 items-center"&gt;
          &lt;div className="relative flex-1 min-w-[200px]"&gt;&lt;Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" /&gt;&lt;input value={search} onChange={e =&gt; setSearch(e.target.value)} placeholder="Search jobs, companies, categories..." className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm font-body focus:outline-none focus:border-[#C9B97A]" /&gt;&lt;/div&gt;
          &lt;select value={statusFilter} onChange={e =&gt; setStatusFilter(e.target.value)} className="px-4 py-3 border border-gray-200 rounded-xl text-sm font-body focus:outline-none focus:border-[#C9B97A] bg-white"&gt;
            &lt;option value="all"&gt;All Statuses&lt;/option&gt;
            &lt;option value="open"&gt;Open&lt;/option&gt;
            &lt;option value="reserved"&gt;Reserved&lt;/option&gt;
            &lt;option value="pending"&gt;Pending&lt;/option&gt;
            &lt;option value="hired"&gt;Hired&lt;/option&gt;
            &lt;option value="coming_soon"&gt;Coming Soon&lt;/option&gt;
          &lt;/select&gt;
          &lt;div className="flex gap-1 border border-gray-200 rounded-lg p-1"&gt;&lt;button onClick={() =&gt; setView('cards')} className={`p-2 rounded ${view === 'cards' ? 'bg-brand-forest text-white' : 'text-gray-400'}`}&gt;&lt;LayoutGrid className="w-4 h-4" /&gt;&lt;/button&gt;&lt;button onClick={() =&gt; setView('list')} className={`p-2 rounded ${view === 'list' ? 'bg-brand-forest text-white' : 'text-gray-400'}`}&gt;&lt;List className="w-4 h-4" /&gt;&lt;/button&gt;&lt;/div&gt;
          &lt;Link href="/jobs/employer-apply" className="px-5 py-3 rounded-full text-xs font-body font-semibold text-white shrink-0" style={{ backgroundColor: '#C9B97A' }}&gt;Post a Job&lt;/Link&gt;
        &lt;/div&gt;

        {loading ? &lt;div className="text-center py-12"&gt;&lt;div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-[#C9B97A] rounded-full mx-auto" /&gt;&lt;/div&gt; : filtered.length === 0 ? &lt;div className="text-center py-16"&gt;&lt;Briefcase className="w-12 h-12 text-gray-200 mx-auto mb-3" /&gt;&lt;p className="text-gray-400 font-body"&gt;No jobs found matching your search.&lt;/p&gt;&lt;/div&gt; : (
          view === 'cards' ? (
            &lt;div className="grid md:grid-cols-2 gap-6"&gt;{filtered.map((job, i) =&gt; (
              &lt;ScrollReveal key={job.id} delay={i * 60}&gt;
                &lt;div className={`bg-white rounded-xl border overflow-hidden hover-lift ${getStatus(job) === 'hired' ? 'border-gray-200 opacity-80' : 'border-gray-100'}`}&gt;
                  &lt;div className="p-6"&gt;
                    &lt;div className="flex items-start justify-between mb-3 gap-2"&gt;
                      &lt;div className="flex items-center gap-2 flex-wrap"&gt;
                        &lt;StatusBadge job={job} /&gt;
                        &lt;span className="px-2.5 py-0.5 rounded-full text-[10px] font-body font-semibold uppercase tracking-wider bg-green-50 text-green-700"&gt;{fmt(job.job_type)}&lt;/span&gt;
                      &lt;/div&gt;
                      {job.salary_range &amp;&amp; &lt;span className="text-sm font-display font-bold shrink-0" style={{ color: '#2C3E2D' }}&gt;{job.salary_range}&lt;/span&gt;}
                    &lt;/div&gt;
                    &lt;h3 className="font-display text-lg font-semibold mb-1" style={{ color: '#2C3E2D' }}&gt;{job.title}&lt;/h3&gt;
                    &lt;div className="flex items-center gap-3 text-xs font-body text-gray-400 mb-3"&gt;{job.company_name &amp;&amp; &lt;span className="flex items-center gap-1"&gt;&lt;Building2 className="w-3 h-3" /&gt;{job.company_name}&lt;/span&gt;}&lt;span className="flex items-center gap-1"&gt;&lt;MapPin className="w-3 h-3" /&gt;{job.location || 'Okeechobee, FL'}&lt;/span&gt;{job.category &amp;&amp; &lt;span&gt;{job.category}&lt;/span&gt;}&lt;/div&gt;
                    {job.description &amp;&amp; &lt;p className="text-sm text-gray-500 font-body mb-4 line-clamp-2"&gt;{job.description}&lt;/p&gt;}
                    &lt;div className="flex items-center gap-3"&gt;
                      {canApply(job) ? (
                        &lt;Link href={`/jobs/${job.slug || job.id}/apply`} className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-body font-semibold text-white" style={{ backgroundColor: '#C9B97A' }}&gt;Apply Now&lt;/Link&gt;
                      ) : (
                        &lt;span className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-body font-semibold text-gray-400 bg-gray-100 cursor-not-allowed"&gt;
                          {getStatus(job) === 'hired' ? 'Position Filled' : getStatus(job) === 'coming_soon' ? 'Coming Soon' : 'Applications Closed'}
                        &lt;/span&gt;
                      )}
                      &lt;button onClick={() =&gt; setExpandedId(expandedId === job.id ? null : job.id)} className="text-xs font-body font-semibold text-gray-400 hover:text-brand-forest"&gt;View Details&lt;/button&gt;
                    &lt;/div&gt;
                  &lt;/div&gt;
                  {expandedId === job.id &amp;&amp; &lt;div className="border-t border-gray-100 p-6 bg-gray-50/50 space-y-3 text-sm font-body"&gt;&lt;div className="grid grid-cols-2 gap-2 text-xs"&gt;&lt;div&gt;&lt;strong className="text-gray-400"&gt;Category:&lt;/strong&gt; {job.category}&lt;/div&gt;&lt;div&gt;&lt;strong className="text-gray-400"&gt;Work Mode:&lt;/strong&gt; {fmt(job.work_mode)}&lt;/div&gt;&lt;div&gt;&lt;strong className="text-gray-400"&gt;Compensation:&lt;/strong&gt; {fmt(job.compensation_type)}&lt;/div&gt;&lt;div&gt;&lt;strong className="text-gray-400"&gt;Department:&lt;/strong&gt; {job.department || '\u2014'}&lt;/div&gt;&lt;div&gt;&lt;strong className="text-gray-400"&gt;Status:&lt;/strong&gt; {JOB_STATUS_LABELS[getStatus(job)]}&lt;/div&gt;&lt;/div&gt;{job.requirements &amp;&amp; &lt;div&gt;&lt;strong className="text-gray-400 text-xs"&gt;Requirements:&lt;/strong&gt;&lt;p className="text-gray-600 mt-1"&gt;{job.requirements}&lt;/p&gt;&lt;/div&gt;}{job.benefits &amp;&amp; &lt;div&gt;&lt;strong className="text-gray-400 text-xs"&gt;Benefits:&lt;/strong&gt;&lt;p className="text-gray-600 mt-1"&gt;{job.benefits}&lt;/p&gt;&lt;/div&gt;}&lt;/div&gt;}
                &lt;/div&gt;
              &lt;/ScrollReveal&gt;
            ))}&lt;/div&gt;
          ) : (
            &lt;div className="bg-white rounded-xl border overflow-hidden"&gt;&lt;table className="w-full text-sm font-body"&gt;&lt;thead&gt;&lt;tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b bg-gray-50"&gt;&lt;th className="p-3"&gt;Position&lt;/th&gt;&lt;th className="p-3"&gt;Company&lt;/th&gt;&lt;th className="p-3"&gt;Status&lt;/th&gt;&lt;th className="p-3"&gt;Type&lt;/th&gt;&lt;th className="p-3"&gt;Location&lt;/th&gt;&lt;th className="p-3"&gt;Salary&lt;/th&gt;&lt;th className="p-3"&gt;&lt;/th&gt;&lt;/tr&gt;&lt;/thead&gt;&lt;tbody&gt;{filtered.map(job =&gt; (
              &lt;tr key={job.id} className={`border-b border-gray-50 hover:bg-gray-50/50 ${getStatus(job) === 'hired' ? 'opacity-70' : ''}`}&gt;&lt;td className="p-3 font-semibold" style={{ color: '#2C3E2D' }}&gt;{job.title}&lt;/td&gt;&lt;td className="p-3 text-gray-500"&gt;{job.company_name || '\u2014'}&lt;/td&gt;&lt;td className="p-3"&gt;&lt;StatusBadge job={job} /&gt;&lt;/td&gt;&lt;td className="p-3"&gt;&lt;span className="px-2 py-0.5 text-[10px] rounded-full font-semibold bg-green-50 text-green-700"&gt;{fmt(job.job_type)}&lt;/span&gt;&lt;/td&gt;&lt;td className="p-3 text-gray-500"&gt;{job.location || 'Okeechobee, FL'}&lt;/td&gt;&lt;td className="p-3 text-gray-500"&gt;{job.salary_range || '\u2014'}&lt;/td&gt;&lt;td className="p-3"&gt;{canApply(job) ? &lt;Link href={`/jobs/${job.slug || job.id}/apply`} className="text-xs font-semibold px-3 py-1.5 rounded-full text-white" style={{ backgroundColor: '#C9B97A' }}&gt;Apply&lt;/Link&gt; : &lt;span className="text-xs font-semibold px-3 py-1.5 rounded-full text-gray-400 bg-gray-100"&gt;{getStatus(job) === 'hired' ? 'Filled' : 'Closed'}&lt;/span&gt;}&lt;/td&gt;&lt;/tr&gt;
            ))}&lt;/tbody&gt;&lt;/table&gt;&lt;/div&gt;
          )
        )}
      &lt;/div&gt;&lt;/div&gt;
    &lt;/div&gt;
  );
}
