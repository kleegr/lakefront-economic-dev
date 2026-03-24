'use client';
import { useState, useEffect } from 'react';
import { Search, Eye, ChevronRight, Clock, Mail, Phone, Plus, X, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

// ITEMS 9,19,20: Applications from Supabase, editable, view full app, add internal app, includes space rental apps
type AppStatus = 'new'|'reviewing'|'interview'|'offer'|'hired'|'rejected'|'withdrawn';
const STATUSES: AppStatus[] = ['new','reviewing','interview','offer','hired','rejected','withdrawn'];
const STATUS_COLORS: Record<string,string> = {'new':'bg-blue-50 text-blue-700','reviewing':'bg-yellow-50 text-yellow-700','interview':'bg-purple-50 text-purple-700','offer':'bg-emerald-50 text-emerald-700','hired':'bg-green-50 text-green-700','rejected':'bg-red-50 text-red-700','withdrawn':'bg-gray-100 text-gray-600'};
function fmt(s: string) { return (s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }

export default function PortalApplicationsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newForm, setNewForm] = useState({ applicant_name: '', applicant_email: '', applicant_phone: '', job_id: '', cover_letter: '', status: 'new', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);
  async function load() {
    const res = await fetch('/api/applications?admin=true');
    const data = await res.json();
    setApps(data.applications || []); setLoading(false);
  }

  const filtered = apps.filter(a => {
    if (search) { const q = search.toLowerCase(); if (!(a.applicant_name || '').toLowerCase().includes(q) && !(a.applicant_email || '').toLowerCase().includes(q)) return false; }
    if (statusFilter && a.status !== statusFilter) return false;
    return true;
  });

  const selected = selectedId ? apps.find(a => a.id === selectedId) : null;

  async function saveEdit() {
    if (!selected) return;
    setSaving(true);
    await fetch(`/api/applications/${selected.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) });
    setEditing(false); setSaving(false); load();
  }

  async function addApp(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await fetch('/api/applications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newForm) });
    setShowAdd(false); setSaving(false); load();
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="font-display text-2xl font-bold text-brand-forest">Applications</h1><p className="text-sm font-body text-gray-400 mt-1">{apps.length} total applications (job + space rental)</p></div>
        <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold hover:bg-brand-forest/90"><Plus className="w-4 h-4" /> Add Application</button>
      </div>
      <div className="flex gap-3"><div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search applicants..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-brand-sage" /></div><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-body"><option value="">All Status</option>{STATUSES.map(s => <option key={s} value={s}>{fmt(s)}</option>)}</select></div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-xl border overflow-hidden"><div className="divide-y divide-gray-50">{filtered.map(app => (
          <button key={app.id} onClick={() => { setSelectedId(app.id); setEditing(false); setEditForm({ status: app.status, notes: app.notes || '', cover_letter: app.cover_letter || '' }); }} className={cn('w-full text-left px-5 py-4 hover:bg-gray-50/50 transition-colors flex items-center justify-between', selectedId === app.id && 'bg-gray-50 border-l-2 border-brand-sage')}>
            <div className="min-w-0 flex-1"><div className="flex items-center gap-2 mb-1"><p className="text-sm font-body font-medium text-brand-forest truncate">{app.applicant_name || 'Unknown'}</p><span className={`px-2 py-0.5 text-[10px] font-body font-semibold rounded-full ${STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-500'}`}>{app.status}</span></div><p className="text-xs font-body text-gray-400 truncate">{app.applicant_email || '—'}</p><p className="text-[10px] font-body text-gray-300 mt-0.5">{app.created_at ? new Date(app.created_at).toLocaleDateString() : ''}</p></div><ChevronRight className="w-4 h-4 text-gray-200 shrink-0" />
          </button>
        ))}{filtered.length === 0 && <div className="text-center py-12"><p className="text-sm font-body text-gray-400">No applications found.</p></div>}</div></div>

        <div className="lg:col-span-2">{selected ? (
          <div className="bg-white rounded-xl border p-5 space-y-4 sticky top-20">
            <div className="flex items-center justify-between"><h2 className="font-display text-lg font-semibold text-brand-forest">{selected.applicant_name || 'Unknown'}</h2><button onClick={() => setEditing(!editing)} className="p-1.5 text-gray-300 hover:text-brand-forest hover:bg-gray-100 rounded-lg"><Pencil className="w-4 h-4" /></button></div>
            <div className="space-y-2 text-sm font-body"><p className="flex items-center gap-2 text-gray-500"><Mail className="w-4 h-4 text-brand-sage" />{selected.applicant_email || '—'}</p><p className="flex items-center gap-2 text-gray-500"><Phone className="w-4 h-4 text-brand-sage" />{selected.applicant_phone || '—'}</p><p className="flex items-center gap-2 text-gray-500"><Clock className="w-4 h-4 text-brand-sage" />{selected.created_at ? new Date(selected.created_at).toLocaleString() : '—'}</p></div>
            {selected.cover_letter && <div><p className="text-xs font-body text-gray-400 uppercase tracking-wider mb-1">Cover Letter</p><p className="text-sm font-body text-gray-600 whitespace-pre-wrap">{selected.cover_letter}</p></div>}
            {editing ? (
              <div className="space-y-3 pt-2 border-t">
                <div><label className="block text-xs font-body text-gray-400 uppercase mb-1">Status</label><select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="input-portal">{STATUSES.map(s => <option key={s} value={s}>{fmt(s)}</option>)}</select></div>
                <div><label className="block text-xs font-body text-gray-400 uppercase mb-1">Notes</label><textarea rows={3} value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})} className="input-portal resize-none" placeholder="Internal notes..." /></div>
                <button onClick={saveEdit} disabled={saving} className="px-4 py-2 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            ) : <div><p className="text-xs font-body text-gray-400 uppercase tracking-wider mb-1">Notes</p><p className="text-sm font-body text-gray-500">{selected.notes || 'No notes yet'}</p></div>}
          </div>
        ) : <div className="bg-white rounded-xl border p-8 text-center"><p className="text-sm font-body text-gray-400">Select an application to view details</p></div>}</div>
      </div>

      {showAdd && <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/50 backdrop-blur-sm" onClick={() => setShowAdd(false)}><div className="bg-white rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}><div className="border-b p-4 flex items-center justify-between"><h2 className="font-display text-lg font-semibold text-brand-forest">Add Internal Application</h2><button onClick={() => setShowAdd(false)} className="p-1 text-gray-400"><X className="w-5 h-5" /></button></div><form onSubmit={addApp} className="p-5 space-y-4"><div className="grid sm:grid-cols-2 gap-4"><div><label className="block text-xs font-body text-gray-500 mb-1 uppercase">Name *</label><input required value={newForm.applicant_name} onChange={e => setNewForm({...newForm, applicant_name: e.target.value})} className="input-portal" /></div><div><label className="block text-xs font-body text-gray-500 mb-1 uppercase">Email</label><input value={newForm.applicant_email} onChange={e => setNewForm({...newForm, applicant_email: e.target.value})} className="input-portal" /></div><div><label className="block text-xs font-body text-gray-500 mb-1 uppercase">Phone</label><input value={newForm.applicant_phone} onChange={e => setNewForm({...newForm, applicant_phone: e.target.value})} className="input-portal" /></div><div><label className="block text-xs font-body text-gray-500 mb-1 uppercase">Status</label><select value={newForm.status} onChange={e => setNewForm({...newForm, status: e.target.value})} className="input-portal">{STATUSES.map(s => <option key={s} value={s}>{fmt(s)}</option>)}</select></div></div><div><label className="block text-xs font-body text-gray-500 mb-1 uppercase">Notes</label><textarea rows={3} value={newForm.notes} onChange={e => setNewForm({...newForm, notes: e.target.value})} className="input-portal resize-none" /></div><div className="flex gap-3"><button type="submit" disabled={saving} className="px-6 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold disabled:opacity-50">{saving ? 'Saving...' : 'Add Application'}</button><button type="button" onClick={() => setShowAdd(false)} className="px-6 py-2.5 border border-gray-200 text-gray-500 rounded-lg text-sm font-body">Cancel</button></div></form></div></div>}
    </div>
  );
}
