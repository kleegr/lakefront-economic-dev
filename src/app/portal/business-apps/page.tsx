'use client';
import { useState, useEffect } from 'react';
import { Store, Search, Pencil, Trash2, ChevronRight, Clock, Mail, Phone, MapPin, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUSES = ['submitted','reviewing','interview','offered','hired','rejected','withdrawn'];
const STATUS_COLORS: Record<string,string> = {'submitted':'bg-blue-50 text-blue-700','reviewing':'bg-yellow-50 text-yellow-700','interview':'bg-purple-50 text-purple-700','offered':'bg-emerald-50 text-emerald-700','hired':'bg-green-50 text-green-700','rejected':'bg-red-50 text-red-700','withdrawn':'bg-gray-100 text-gray-600'};
function fmt(s: string) { return (s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }

export default function BusinessAppsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);
  async function load() {
    const res = await fetch('/api/applications?admin=true');
    const data = await res.json();
    const all = data.applications || [];
    setApps(all.filter((a: any) => ['employer', 'provider', 'space_rental'].includes(a.application_type)));
    setLoading(false);
  }

  async function saveEdit() {
    if (!selected) return; setSaving(true);
    await fetch(`/api/applications/${selected.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) });
    setEditing(false); setSaving(false); load();
  }

  async function deleteApp(id: string) {
    if (!confirm('Delete this application? This will also remove it from Kleegr if synced.')) return;
    await fetch(`/api/applications/${id}`, { method: 'DELETE' });
    if (selectedId === id) setSelectedId(null);
    load();
  }

  const filtered = apps.filter(a => !search || (a.applicant_name || '').toLowerCase().includes(search.toLowerCase()) || (a.applicant_email || '').toLowerCase().includes(search.toLowerCase()));
  const selected = selectedId ? apps.find(a => a.id === selectedId) : null;

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl font-bold text-brand-forest">Business Applications</h1><p className="text-sm font-body text-gray-400 mt-1">{apps.length} applications &middot; Employers, Providers &amp; Space Rentals</p></div>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-brand-sage" /></div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border"><Store className="w-10 h-10 text-gray-200 mx-auto mb-3" /><p className="text-gray-400 font-body">No business applications yet.</p></div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white rounded-xl border overflow-hidden"><div className="divide-y divide-gray-50">
            {filtered.map(a => (
              <button key={a.id} onClick={() => { setSelectedId(a.id); setEditing(false); setEditForm({ status: a.status, notes: a.notes || '', address: a.address || '' }); }} className={cn('w-full text-left px-5 py-4 hover:bg-gray-50/50 transition-colors flex items-center justify-between', selectedId === a.id && 'bg-gray-50 border-l-2 border-brand-sage')}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-body font-semibold text-brand-forest truncate">{a.applicant_name || 'Unknown'}</p>
                    <span className="px-2 py-0.5 text-[9px] font-body font-semibold rounded-full bg-green-50 text-green-600">{fmt(a.application_type || 'employer')}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-body font-semibold rounded-full ${STATUS_COLORS[a.status] || 'bg-gray-100 text-gray-500'}`}>{a.status}</span>
                  </div>
                  <p className="text-xs font-body text-gray-400 truncate">{a.applicant_email || '\u2014'}</p>
                  {a.address && <p className="text-[10px] font-body text-gray-300 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{a.address}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span onClick={e => { e.stopPropagation(); setSelectedId(a.id); setEditing(true); setEditForm({ status: a.status, notes: a.notes || '', address: a.address || '' }); }} className="p-1.5 text-gray-300 hover:text-brand-forest hover:bg-gray-100 rounded-lg cursor-pointer"><Pencil className="w-3.5 h-3.5" /></span>
                  <span onClick={e => { e.stopPropagation(); deleteApp(a.id); }} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></span>
                  <ChevronRight className="w-4 h-4 text-gray-200" />
                </div>
              </button>
            ))}
          </div></div>

          <div className="lg:col-span-2">{selected ? (
            <div className="bg-white rounded-xl border p-5 space-y-4 sticky top-20">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-brand-forest">{selected.applicant_name || 'Unknown'}</h2>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditing(!editing)} className="p-1.5 text-gray-300 hover:text-brand-forest hover:bg-gray-100 rounded-lg"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => deleteApp(selected.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-green-50 text-green-600">{fmt(selected.application_type)}</span>
                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${STATUS_COLORS[selected.status] || ''}`}>{selected.status}</span>
                {selected.ghl_contact_id && <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-50 text-blue-600">Synced to Kleegr</span>}
              </div>
              <div className="space-y-2 text-sm font-body">
                <p className="flex items-center gap-2 text-gray-500"><Mail className="w-4 h-4 text-brand-sage" />{selected.applicant_email || '\u2014'}</p>
                <p className="flex items-center gap-2 text-gray-500"><Phone className="w-4 h-4 text-brand-sage" />{selected.applicant_phone || '\u2014'}</p>
                {selected.address && <p className="flex items-center gap-2 text-gray-500"><MapPin className="w-4 h-4 text-brand-sage" />{selected.address}</p>}
                <p className="flex items-center gap-2 text-gray-500"><Clock className="w-4 h-4 text-brand-sage" />{selected.created_at ? new Date(selected.created_at).toLocaleString() : '\u2014'}</p>
              </div>
              {selected.cover_letter && <div><p className="text-xs font-body text-gray-400 uppercase tracking-wider mb-1">Application Details</p><p className="text-sm font-body text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{selected.cover_letter}</p></div>}
              {editing ? (
                <div className="space-y-3 pt-2 border-t">
                  <div><label className="block text-xs font-body text-gray-400 uppercase mb-1">Status</label><select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="input-portal">{STATUSES.map(s => <option key={s} value={s}>{fmt(s)}</option>)}</select></div>
                  <div><label className="block text-xs font-body text-gray-400 uppercase mb-1">Address</label><input value={editForm.address || ''} onChange={e => setEditForm({...editForm, address: e.target.value})} className="input-portal" /></div>
                  <div><label className="block text-xs font-body text-gray-400 uppercase mb-1">Notes</label><textarea rows={3} value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})} className="input-portal resize-none" /></div>
                  <div className="flex gap-2">
                    <button onClick={saveEdit} disabled={saving} className="px-4 py-2 bg-brand-forest text-white rounded-lg text-sm font-semibold disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
                    <button onClick={() => setEditing(false)} className="px-4 py-2 border border-gray-200 text-gray-500 rounded-lg text-sm">Cancel</button>
                  </div>
                </div>
              ) : selected.notes ? <div><p className="text-xs font-body text-gray-400 uppercase mb-1">Notes</p><p className="text-sm font-body text-gray-500">{selected.notes}</p></div> : null}
            </div>
          ) : <div className="bg-white rounded-xl border p-8 text-center"><p className="text-sm font-body text-gray-400">Select an application to view details</p></div>}</div>
        </div>
      )}
    </div>
  );
}
