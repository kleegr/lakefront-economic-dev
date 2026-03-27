'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, BookOpen, Search, X, ChevronDown, ChevronRight, CheckCircle, Star, Zap, RefreshCw } from 'lucide-react';
import {
  DIRECTORY_FIELDS, DIRECTORY_STATUS_LABELS, DIRECTORY_STATUS_COLORS,
  getFieldsByGroup, GROUP_LABELS, type DirectoryStatus,
} from '@/lib/ghl/directory-fields-config';

const fieldGroups = getFieldsByGroup();
const emptyForm: Record<string, any> = {};
for (const f of DIRECTORY_FIELDS) { if (f.type === 'hidden') continue; emptyForm[f.key] = f.type === 'boolean' ? false : f.type === 'number' ? '' : ''; }

export default function DirectoryPortalPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ core: true, descriptions: true, contact: true, publishing: true });
  const [form, setForm] = useState<Record<string, any>>({ ...emptyForm });
  const [syncMsg, setSyncMsg] = useState('');
  const [syncActive, setSyncActive] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch('/api/directory?admin=true');
    const data = await res.json();
    setItems(data.items || []); setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        setSyncActive(true);
        const res = await fetch('/api/directory/auto-sync');
        if (res.ok) {
          const data = await res.json();
          if (data.pushed > 0) {
            setSyncMsg(`Synced ${data.pushed} listing${data.pushed === 1 ? '' : 's'} to Kleegr`);
            load();
            setTimeout(() => setSyncMsg(''), 5000);
          }
        }
      } catch { /* silent */ }
      setSyncActive(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [load]);

  function openNew() {
    setEditing(null);
    setForm({ ...emptyForm, status: 'active', listing_type: 'Business', featured: false, verified: false });
    setOpenGroups({ core: true, descriptions: true, contact: true, publishing: true });
    setShowForm(true);
  }
  function openEdit(item: any) {
    setEditing(item);
    const f: Record<string, any> = {};
    for (const field of DIRECTORY_FIELDS) { if (field.type === 'hidden') continue; f[field.key] = item[field.key] ?? (field.type === 'boolean' ? false : ''); }
    setForm(f);
    setOpenGroups({ core: true, descriptions: true, contact: true, address: true, details: true, publishing: true });
    setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const payload: Record<string, any> = {};
    for (const [k, v] of Object.entries(form)) { if (v !== '' && v !== null && v !== undefined) payload[k] = v; }
    const url = editing ? `/api/directory/${editing.id}` : '/api/directory';
    const method = editing ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) { setShowForm(false); load(); } else { const d = await res.json(); alert(d.error || 'Failed'); }
    setSaving(false);
  }

  async function del(id: string) { if (!confirm('Delete this listing?')) return; await fetch(`/api/directory/${id}`, { method: 'DELETE' }); load(); }
  const setField = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));
  const toggleGroup = (g: string) => setOpenGroups(prev => ({ ...prev, [g]: !prev[g] }));
  const filtered = items.filter(i => !search || i.business_name?.toLowerCase().includes(search.toLowerCase()) || i.category?.toLowerCase().includes(search.toLowerCase()) || i.display_name?.toLowerCase().includes(search.toLowerCase()));

  const getStatus = (item: any): DirectoryStatus => (item.status || 'active') as DirectoryStatus;

  if (loading) return (<div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-bold text-brand-forest">Business Directory</h1><p className="text-sm font-body text-gray-400 mt-1">{items.length} listings</p></div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-[10px] font-body font-semibold">
            <Zap className={`w-3 h-3 ${syncActive ? 'animate-pulse' : ''}`} /> Live Sync ON
          </span>
          <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold hover:bg-brand-forest/90"><Plus className="w-4 h-4" /> Add Listing</button>
        </div>
      </div>
      {syncMsg && <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-xs font-body flex items-center gap-2"><RefreshCw className="w-3.5 h-3.5" />{syncMsg}</div>}
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search directory..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-brand-sage" /></div>
      <div className="space-y-3">
        {filtered.length === 0 ? (<div className="text-center py-16 bg-white rounded-xl border"><BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-3" /><p className="text-gray-400 font-body">No listings found</p></div>) : filtered.map(item => {
          const st = getStatus(item);
          const sc = DIRECTORY_STATUS_COLORS[st] || DIRECTORY_STATUS_COLORS.active;
          return (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50/50" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-display text-base font-semibold text-brand-forest truncate">{item.display_name || item.business_name}</h3>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-body font-semibold uppercase ${sc.bg} ${sc.text}`}>{DIRECTORY_STATUS_LABELS[st]}</span>
                    {item.verified && <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />}
                    {item.featured && <Star className="w-3.5 h-3.5 text-amber-400 shrink-0 fill-amber-400" />}
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-body font-semibold uppercase bg-gray-100 text-gray-500">{item.listing_type || 'Business'}</span>
                    {item.ghl_synced_at && <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-body font-semibold bg-blue-50 text-blue-600">Synced</span>}
                  </div>
                  <p className="text-xs text-gray-400 font-body truncate">{item.category || 'General'}{item.phone ? ` \u00b7 ${item.phone}` : ''}{item.email ? ` \u00b7 ${item.email}` : ''}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={e => { e.stopPropagation(); openEdit(item); }} className="p-1.5 text-gray-300 hover:text-brand-forest hover:bg-gray-100 rounded-lg"><Pencil className="w-4 h-4" /></button>
                  <button onClick={e => { e.stopPropagation(); del(item.id); }} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform ${expandedId === item.id ? 'rotate-180' : ''}`} />
                </div>
              </div>
              {expandedId === item.id && (
                <div className="border-t border-gray-100 p-4 bg-gray-50/30 text-xs font-body space-y-1">
                  {item.short_description && <p><strong>Description:</strong> {item.short_description}</p>}
                  {item.contact_name && <p><strong>Contact:</strong> {item.contact_name}{item.contact_title ? ` (${item.contact_title})` : ''}</p>}
                  {item.website && <p><strong>Website:</strong> {item.website}</p>}
                  {item.address_line_1 && <p><strong>Address:</strong> {item.address_line_1}{item.city ? `, ${item.city}` : ''}{item.state ? ` ${item.state}` : ''}{item.zip_code ? ` ${item.zip_code}` : ''}</p>}
                  {item.services_offered && <p><strong>Services:</strong> {item.services_offered}</p>}
                  {item.hours_of_operation && <p><strong>Hours:</strong> {item.hours_of_operation}</p>}
                  <p><strong>Kleegr Sync:</strong> <span className={item.ghl_synced_at ? 'text-blue-600 font-semibold' : 'text-gray-400'}>{item.ghl_synced_at ? `Synced ${new Date(item.ghl_synced_at).toLocaleString()}` : 'Not synced'}</span></p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
              <h2 className="font-display text-lg font-semibold text-brand-forest">{editing ? 'Edit' : 'Add'} Directory Listing</h2>
              <button onClick={() => setShowForm(false)} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={save} className="p-5 space-y-5">
              {Object.entries(fieldGroups).map(([groupKey, fields]) => (
                <div key={groupKey} className="border border-gray-100 rounded-lg overflow-hidden">
                  <button type="button" onClick={() => toggleGroup(groupKey)} className="w-full flex items-center justify-between p-3 bg-gray-50/50 hover:bg-gray-50">
                    <span className="text-xs font-body font-semibold uppercase tracking-wider text-gray-500">{GROUP_LABELS[groupKey] || groupKey}</span>
                    {openGroups[groupKey] ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </button>
                  {openGroups[groupKey] && (
                    <div className="p-4 grid sm:grid-cols-2 gap-4">
                      {fields.map(field => (
                        <div key={field.key} className={field.colSpan === 2 ? 'sm:col-span-2' : ''}>
                          <label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">{field.label}{field.required ? ' *' : ''}</label>
                          {field.type === 'dropdown' && field.options ? (
                            <select value={form[field.key] || ''} onChange={e => setField(field.key, e.target.value)} required={field.required} className="input-portal">
                              <option value="">Select...</option>
                              {field.options.map(o => <option key={o.value} value={o.value}>{o.ghlLabel}</option>)}
                            </select>
                          ) : field.type === 'textarea' ? (
                            <textarea rows={3} value={form[field.key] || ''} onChange={e => setField(field.key, e.target.value)} placeholder={field.placeholder} className="input-portal resize-none" />
                          ) : field.type === 'boolean' ? (
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={!!form[field.key]} onChange={e => setField(field.key, e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-brand-forest focus:ring-brand-sage" />
                              <span className="text-sm font-body text-gray-600">{form[field.key] ? 'Yes' : 'No'}</span>
                            </label>
                          ) : field.type === 'number' ? (
                            <input type="number" value={form[field.key] || ''} onChange={e => setField(field.key, e.target.value ? parseFloat(e.target.value) : '')} placeholder={field.placeholder} className="input-portal" />
                          ) : (
                            <input type="text" value={form[field.key] || ''} onChange={e => setField(field.key, e.target.value)} placeholder={field.placeholder} required={field.required} className="input-portal" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Update Listing' : 'Add Listing'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-gray-200 text-gray-500 rounded-lg text-sm font-body">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
