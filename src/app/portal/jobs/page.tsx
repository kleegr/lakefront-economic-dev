'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, MoreVertical, Eye, Edit, Trash2, Archive, Globe, GlobeLock } from 'lucide-react';
import { mockJobs } from '@/lib/mock-data';
import { formatEnum, formatDate } from '@/lib/utils';
export default function PortalJobsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const filtered = mockJobs.filter(j => {
    if (search) { const q = search.toLowerCase(); if (!j.title.toLowerCase().includes(q) && !j.employerName.toLowerCase().includes(q)) return false; }
    if (statusFilter && j.status !== statusFilter) return false;
    return true;
  });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-display font-bold text-brand-text">Jobs</h1><p className="text-sm font-body text-brand-muted mt-1">Manage job listings and postings.</p></div><Link href="/portal/jobs/new" className="btn-portal"><Plus className="w-4 h-4 mr-1.5" /> New Job</Link></div>
      <div className="card-portal p-4"><div className="flex flex-col sm:flex-row gap-3"><div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)} className="input-portal pl-10" /></div><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-portal sm:w-40"><option value="">All Status</option><option value="published">Published</option><option value="draft">Draft</option><option value="closed">Closed</option><option value="archived">Archived</option></select></div></div>
      <div className="card-portal overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-gray-200 bg-gray-50/50"><th className="text-left px-5 py-3 font-body font-medium text-brand-muted text-xs uppercase tracking-wider">Title</th><th className="text-left px-5 py-3 font-body font-medium text-brand-muted text-xs uppercase tracking-wider">Employer</th><th className="text-left px-5 py-3 font-body font-medium text-brand-muted text-xs uppercase tracking-wider">Type</th><th className="text-left px-5 py-3 font-body font-medium text-brand-muted text-xs uppercase tracking-wider">Apps</th><th className="text-left px-5 py-3 font-body font-medium text-brand-muted text-xs uppercase tracking-wider">Visibility</th><th className="text-left px-5 py-3 font-body font-medium text-brand-muted text-xs uppercase tracking-wider">Status</th><th className="text-left px-5 py-3 font-body font-medium text-brand-muted text-xs uppercase tracking-wider">Posted</th><th className="text-right px-5 py-3 font-body font-medium text-brand-muted text-xs uppercase tracking-wider">Actions</th></tr></thead><tbody className="divide-y divide-gray-100">{filtered.map(job => (
        <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
          <td className="px-5 py-3.5"><p className="font-body font-medium text-brand-text">{job.title}</p><p className="text-xs font-body text-brand-muted">{job.category}</p></td>
          <td className="px-5 py-3.5 font-body text-brand-muted">{job.employerName}</td>
          <td className="px-5 py-3.5"><span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-body font-medium rounded-full">{formatEnum(job.type)}</span></td>
          <td className="px-5 py-3.5 font-body font-medium text-brand-text">{job.applicationCount}</td>
          <td className="px-5 py-3.5">{job.isPublic ? <span className="flex items-center gap-1 text-xs font-body text-green-600"><Globe className="w-3.5 h-3.5" /> Public</span> : <span className="flex items-center gap-1 text-xs font-body text-gray-500"><GlobeLock className="w-3.5 h-3.5" /> Private</span>}</td>
          <td className="px-5 py-3.5"><span className={`px-2 py-0.5 text-xs font-body font-medium rounded-full ${job.status === 'published' ? 'bg-green-50 text-green-700' : job.status === 'draft' ? 'bg-gray-100 text-gray-600' : job.status === 'closed' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-500'}`}>{job.status}</span></td>
          <td className="px-5 py-3.5 font-body text-brand-muted text-xs">{formatDate(job.postedDate)}</td>
          <td className="px-5 py-3.5 text-right"><div className="relative"><button onClick={() => setOpenMenu(openMenu === job.id ? null : job.id)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><MoreVertical className="w-4 h-4 text-gray-400" /></button>{openMenu === job.id && (<div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 animate-fade-in"><button className="flex items-center gap-2 w-full px-3 py-2 text-sm font-body text-brand-text/70 hover:bg-gray-50"><Eye className="w-3.5 h-3.5" /> View</button><button className="flex items-center gap-2 w-full px-3 py-2 text-sm font-body text-brand-text/70 hover:bg-gray-50"><Edit className="w-3.5 h-3.5" /> Edit</button><button className="flex items-center gap-2 w-full px-3 py-2 text-sm font-body text-brand-text/70 hover:bg-gray-50"><Archive className="w-3.5 h-3.5" /> Archive</button><hr className="my-1 border-gray-100" /><button className="flex items-center gap-2 w-full px-3 py-2 text-sm font-body text-red-600 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /> Delete</button></div>)}</div></td>
        </tr>
      ))}</tbody></table></div>{filtered.length === 0 && <div className="text-center py-12"><p className="text-sm font-body text-brand-muted">No jobs found matching your criteria.</p></div>}</div>
    </div>
  );
}
