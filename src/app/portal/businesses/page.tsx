'use client';
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Building2, Search, X, ChevronDown, ChevronRight } from 'lucide-react';
import {
  BIZ_OPP_FIELDS, BIZ_OPP_STATUS_LABELS, BIZ_OPP_STATUS_COLORS,
  getFieldsByGroup, GROUP_LABELS, type BizOppStatus,
} from '@/lib/ghl/business-opportunities-fields-config';

const fieldGroups = getFieldsByGroup();
const emptyForm: Record<string, any> = {};
for (const f of BIZ_OPP_FIELDS) { if (f.type === 'hidden') continue; emptyForm[f.key] = f.type === 'boolean' ? false : f.type === 'number' ? '' : ''; }

export default function BusinessOpportunitiesPortalPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ core: true, descriptions: true, publishing: true });
  const [form, setForm] = useState<Record<string, any>>({ ...emptyForm });

  useEffect(() => { load(); }, []);
  async function load() {
    const res = await fetch('/api/business-opportunities?admin=true');
    const data = await res.json();
    setItems(data.items || []); setLoading(false);
  }

  function openNew() {
    setEditing(null);
    setForm({ ...emptyForm, status: 'available', priority: 'medium', is_published: true, application_required: true });
    setOpenGroups({ core: true, descriptions: true, publishing: true });
    setShowForm(true);
  }
  function openEdit(item: any) {
    setEditing(item);
    const f: Record<string, any> = {};
    for (const field of BIZ_OPP_FIELDS) { if (field.type === 'hidden') continue; f[field.key] = item[field.key] ?? (field.type === 'boolean' ? false : ''); }
    setForm(f);
    setOpenGroups({ core: true, descriptions: true, financials: true, operations: true, requirements: true, resources: true, location: true, market: true, publishing: true, contact: true });
    setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const payload: Record<string, any> = {};
    for (const [k, v] of Object.entries(form)) { if (v !== '' && v !== null && v !== undefined) payload[k] = v; }
    const url = editing ? `/api/business-opportunities/${editing.id}` : '/api/business-opportunities';
    const method = editing ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) { setShowForm(false); load(); } else { const d = await res.json(); alert(d.error || 'Failed'); }
    setSaving(false);
  }

  async function del(id: string) { if (!confirm('Delete this opportunity?')) return; await fetch(`/api/business-opportunities/${id}`, { method: 'DELETE' }); load(); }
  const setField = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));
  const toggleGroup = (g: string) => setOpenGroups(prev => ({ ...prev, [g]: !prev[g] }));
  const filtered = items.filter(i => !search || i.title?.toLowerCase().includes(search.toLowerCase()) || i.business_category?.toLowerCase().includes(search.toLowerCase()));

  const getStatus = (item: any): BizOppStatus => (item.status || 'available') as BizOppStatus;

  if (loading) return (<div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-bold text-brand-forest">Business Opportunities</h1><p className="text-sm font-body text-gray-400 mt-1">{items.length} opportunities</p></div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold hover:bg-brand-forest/90"><Plus className="w-4 h-4" /> Add Opportunity</button>
      </div>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search opportunities..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-brand-sage" /></div>
      <div className="space-y-3">
        {filtered.length === 0 ? (<div className="text-center py-16 bg-white rounded-xl border"><Building2 className="w-10 h-10 text-gray-200 mx-auto mb-3" /><p className="text-gray-400 font-body">No opportunities found</p></div>) : filtered.map(item => {
          const st = getStatus(item);
          const sc = BIZ_OPP_STATUS_COLORS[st] || BIZ_OPP_STATUS_COLORS.available;
          return (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50/50" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-display text-base font-semibold text-brand-forest truncate">{item.title}</h3>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-body font-semibold uppercase ${sc.bg} ${sc.text}`}>{BIZ_OPP_STATUS_LABELS[st]}</span>
                    {item.priority && <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-body font-semibold uppercase bg-blue-50 text-blue-600">{item.priority}</span>}
                  </div>
                  <p className="text-xs text-gray-400 font-body truncate">{item.business_category || 'General'}{item.assigned_to ? ` \u00b7 ${item.assigned_to}` : ''}{item.startup_investment_required ? ` \u00b7 ${item.startup_investment_required}` : ''}</p>
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
                  {item.business_model && <p><strong>Model:</strong> {item.business_model}</p>}
                  {item.startup_investment_required && <p><strong>Investment:</strong> {item.startup_investment_required}</p>}
                  {item.demand_level && <p><strong>Demand:</strong> {item.demand_level}</p>}
                  {item.contact_name && <p><strong>Contact:</strong> {item.contact_name} {item.contact_email ? `(${item.contact_email})` : ''}</p>}
                  {item.city && <p><strong>Location:</strong> {item.city}, {item.state}</p>}
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
              <h2 className="font-display text-lg font-semibold text-brand-forest">{editing ? 'Edit' : 'Add'} Business Opportunity</h2>
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
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Update Opportunity' : 'Add Opportunity'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-gray-200 text-gray-500 rounded-lg text-sm font-body">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
