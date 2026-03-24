'use client';
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Wrench, Search, X, ChevronDown } from 'lucide-react';

// ITEMS 24,25: Services/Providers page with Supabase CRUD
export default function ServicesPortalPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', provider_name: '', category: 'General', contact_email: '', contact_phone: '', address: '', description: '', status: 'active' });

  useEffect(() => { load(); }, []);
  async function load() { const res = await fetch('/api/services?admin=true'); const data = await res.json(); setItems(data.items || []); setLoading(false); }
  function openNew() { setEditing(null); setForm({ name: '', provider_name: '', category: 'General', contact_email: '', contact_phone: '', address: '', description: '', status: 'active' }); setShowForm(true); }
  function openEdit(item: any) { setEditing(item); setForm({ name: item.name || '', provider_name: item.provider_name || '', category: item.category || 'General', contact_email: item.contact_email || '', contact_phone: item.contact_phone || '', address: item.address || '', description: item.description || '', status: item.status || 'active' }); setShowForm(true); }
  async function save(e: React.FormEvent) { e.preventDefault(); setSaving(true); const url = editing ? `/api/services/${editing.id}` : '/api/services'; const method = editing ? 'PUT' : 'POST'; const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); if (res.ok) { setShowForm(false); load(); } else { const d = await res.json(); alert(d.error || 'Failed'); } setSaving(false); }
  async function del(id: string) { if (!confirm('Delete?')) return; await fetch(`/api/services/${id}`, { method: 'DELETE' }); load(); }
  const filtered = items.filter(i => !search || i.name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-bold text-brand-forest">Service Providers</h1><p className="text-sm font-body text-gray-400 mt-1">{items.length} providers</p></div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold hover:bg-brand-forest/90"><Plus className="w-4 h-4" /> Add Provider</button>
      </div>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-brand-sage" /></div>
      <div className="space-y-3">
        {filtered.length === 0 ? <div className="text-center py-16 bg-white rounded-xl border"><Wrench className="w-10 h-10 text-gray-200 mx-auto mb-3" /><p className="text-gray-400 font-body">No providers found</p></div> : filtered.map(item => (
          <div key={item.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50/50" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
              <div className="flex-1"><h3 className="font-display text-base font-semibold text-brand-forest">{item.name}</h3><p className="text-xs text-gray-400 font-body">{item.category} &middot; {item.provider_name || 'No provider'} &middot; {item.status}</p></div>
              <div className="flex items-center gap-1"><button onClick={e => { e.stopPropagation(); openEdit(item); }} className="p-1.5 text-gray-300 hover:text-brand-forest hover:bg-gray-100 rounded-lg"><Pencil className="w-4 h-4" /></button><button onClick={e => { e.stopPropagation(); del(item.id); }} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button><ChevronDown className={`w-4 h-4 text-gray-300 transition-transform ${expandedId === item.id ? 'rotate-180' : ''}`} /></div>
            </div>
            {expandedId === item.id && <div className="border-t border-gray-100 p-4 bg-gray-50/30 text-xs font-body space-y-1"><p><strong>Email:</strong> {item.contact_email || '—'}</p><p><strong>Phone:</strong> {item.contact_phone || '—'}</p>{item.description && <p><strong>Description:</strong> {item.description}</p>}</div>}
          </div>
        ))}
      </div>
      {showForm && <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}><div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}><div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10"><h2 className="font-display text-lg font-semibold text-brand-forest">{editing ? 'Edit' : 'Add'} Provider</h2><button onClick={() => setShowForm(false)} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div><form onSubmit={save} className="p-5 space-y-4"><div className="grid sm:grid-cols-2 gap-4"><div className="sm:col-span-2"><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase">Service Name *</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-portal" /></div><div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase">Provider Name</label><input value={form.provider_name} onChange={e => setForm({...form, provider_name: e.target.value})} className="input-portal" /></div><div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase">Category</label><select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-portal"><option>General</option><option>Maintenance</option><option>Security</option><option>Technology</option><option>Cleaning</option><option>Landscaping</option></select></div><div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase">Email</label><input value={form.contact_email} onChange={e => setForm({...form, contact_email: e.target.value})} className="input-portal" /></div><div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase">Phone</label><input value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})} className="input-portal" /></div><div className="sm:col-span-2"><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase">Description</label><textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-portal resize-none" /></div></div><div className="flex gap-3 pt-2"><button type="submit" disabled={saving} className="px-6 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Update' : 'Add Provider'}</button><button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-gray-200 text-gray-500 rounded-lg text-sm font-body">Cancel</button></div></form></div></div>}
    </div>
  );
}
