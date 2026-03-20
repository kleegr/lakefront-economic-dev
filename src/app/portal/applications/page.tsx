'use client';
import { useState } from 'react';
import { Search, Eye, ChevronRight, Clock, Mail, Phone } from 'lucide-react';
import { mockApplications } from '@/lib/mock-data';
import { formatEnum, formatDate, cn } from '@/lib/utils';
import type { ApplicationStatus } from '@/types';
const STATUSES: ApplicationStatus[] = ['new','reviewing','interview','offer','hired','rejected','withdrawn'];
const STATUS_COLORS: Record<ApplicationStatus,string> = {'new':'bg-blue-50 text-blue-700','reviewing':'bg-yellow-50 text-yellow-700','interview':'bg-purple-50 text-purple-700','offer':'bg-emerald-50 text-emerald-700','hired':'bg-green-50 text-green-700','rejected':'bg-red-50 text-red-700','withdrawn':'bg-gray-100 text-gray-600'};
export default function PortalApplicationsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const filtered = mockApplications.filter(a => {
    if (search) { const q = search.toLowerCase(); if (!a.applicantName.toLowerCase().includes(q) && !a.jobTitle.toLowerCase().includes(q) && !a.applicantEmail.toLowerCase().includes(q)) return false; }
    if (statusFilter && a.status !== statusFilter) return false;
    return true;
  });
  const selected = selectedApp ? mockApplications.find(a => a.id === selectedApp) : null;
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-display font-bold text-brand-text">Applications</h1><p className="text-sm font-body text-brand-muted mt-1">Review and manage job applications.</p></div>
      <div className="card-portal p-4"><div className="flex flex-col sm:flex-row gap-3"><div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search applicants..." value={search} onChange={e => setSearch(e.target.value)} className="input-portal pl-10" /></div><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-portal sm:w-40"><option value="">All Status</option>{STATUSES.map(s => <option key={s} value={s}>{formatEnum(s)}</option>)}</select></div></div>
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 card-portal overflow-hidden"><div className="divide-y divide-gray-100">{filtered.map(app => (
          <button key={app.id} onClick={() => setSelectedApp(app.id)} className={cn('w-full text-left px-5 py-4 hover:bg-gray-50/50 transition-colors flex items-center justify-between', selectedApp === app.id && 'bg-portal-hover border-l-2 border-portal-accent')}>
            <div className="min-w-0 flex-1"><div className="flex items-center gap-2 mb-1"><p className="text-sm font-body font-medium text-brand-text truncate">{app.applicantName}</p><span className={`px-2 py-0.5 text-xs font-body font-medium rounded-full shrink-0 ${STATUS_COLORS[app.status]}`}>{app.status}</span></div><p className="text-xs font-body text-brand-muted truncate">{app.jobTitle}</p><div className="flex items-center gap-3 mt-1"><span className="text-xs font-body text-brand-muted flex items-center gap-1"><Mail className="w-3 h-3" />{app.applicantEmail}</span><span className="text-xs font-body text-brand-muted flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(app.dateApplied)}</span></div></div>
            <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 ml-2" />
          </button>
        ))}{filtered.length === 0 && <div className="text-center py-12"><p className="text-sm font-body text-brand-muted">No applications found.</p></div>}</div></div>
        <div className="lg:col-span-2">{selected ? (
          <div className="card-portal p-6 space-y-5 sticky top-24">
            <div><h2 className="text-lg font-display font-semibold text-brand-text">{selected.applicantName}</h2><p className="text-sm font-body text-brand-muted mt-0.5">Applied for {selected.jobTitle}</p></div>
            <div className="space-y-3"><div className="flex items-center gap-2 text-sm font-body text-brand-text/70"><Mail className="w-4 h-4 text-portal-accent" />{selected.applicantEmail}</div>{selected.applicantPhone && <div className="flex items-center gap-2 text-sm font-body text-brand-text/70"><Phone className="w-4 h-4 text-portal-accent" />{selected.applicantPhone}</div>}<div className="flex items-center gap-2 text-sm font-body text-brand-text/70"><Clock className="w-4 h-4 text-portal-accent" />Applied {formatDate(selected.dateApplied)}</div></div>
            <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Status</label><select defaultValue={selected.status} className="input-portal">{STATUSES.map(s => <option key={s} value={s}>{formatEnum(s)}</option>)}</select></div>
            <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Notes</label><textarea rows={3} defaultValue={selected.notes || ''} className="input-portal" placeholder="Add internal notes..." /></div>
            <div className="flex gap-2"><button className="btn-portal flex-1">Save Changes</button><button className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-body font-medium text-brand-text/70 hover:bg-gray-50 transition-colors"><Eye className="w-4 h-4" /></button></div>
          </div>
        ) : (<div className="card-portal p-8 text-center text-brand-muted"><p className="text-sm font-body">Select an application to view details.</p></div>)}</div>
      </div>
    </div>
  );
}
