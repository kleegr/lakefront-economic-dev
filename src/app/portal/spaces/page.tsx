'use client';
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Warehouse, Search, X, ChevronDown } from 'lucide-react';

// ITEMS 26,27: Spaces page with Supabase CRUD
export default function SpacesPortalPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', space_type: 'Retail', location: '', sqft: '', price: '', status: 'available', description: '', features: '' });

  useEffect(() => { load(); }, []);
  async function load() { const res = await fetch('/api/spaces?admin=true'); const data = await res.json(); setItems(data.items || []); setLoading(false); }
  function openNew() { setEditing(null); setForm({ name: '', space_type: 'Retail', location: '', sqft: '', price: '', status: 'available', description: '', features: '' }); setShowForm(true); }
  function openEdit(item: any) { setEditing(item); setForm({ name: item.name || '', space_type: item.space_type || 'Retail', location: item.location || '', sqft: item.sqft || '', price: item.price || '', status: item.status || 'available', description: item.description || '', features: item.features || '' }); setShowForm(true); }
  async function save(e: React.FormEvent) { e.preventDefault(); setSaving(true); const url = editing ? `/api/spaces/${editing.id}` : '/api/spaces'; const method = editing ? 'PUT' : 'POST'; const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); if (res.ok) { setShowForm(false); load(); } else { const d = await res.json(); alert(d.error || 'Failed'); } setSaving(false); }
  async function del(id: string) { if (!confirm('Delete?')) return; await fetch(`/api/spaces/${id}`, { method: 'DELETE' }); load(); }
  const filtered = items.filter(i => !search || i.name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-bold text-brand-forest">Commercial Spaces</h1><p className="text-sm font-body text-gray-400 mt-1">{items.length} spaces</p></div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold hover:bg-brand-forest/90"><Plus className="w-4 h-4" /> Add Space</button>
      </div>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-brand-sage" /></div>
      <div className="space-y-3">
        {filtered.length === 0 ? <div className="text-center py-16 bg-white rounded-xl border"><Warehouse className="w-10 h-10 text-gray-200 mx-auto mb-3" /><p className="text-gray-400 font-body">No spaces found</p></div> : filtered.map(item => (
          <div key={item.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50/50" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
              <div className="flex-1"><h3 className="font-display text-base font-semibold text-brand-forest">{item.name}</h3><p className="text-xs text-gray-400 font-body">{item.space_type} &middot; {item.sqft} sq ft &middot; {item.price} &middot; <span className={item.status === 'available' ? 'text-green-600' : 'text-amber-600'}>{item.status}</span></p></div>
              <div className="flex items-center gap-1"><button onClick={e => { e.stopPropagation(); openEdit(item); }} className="p-1.5 text-gray-300 hover:text-brand-forest hover:bg-gray-100 rounded-lg"><Pencil className="w-4 h-4" /></button><button onClick={e => { e.stopPropagation(); del(item.id); }} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button><ChevronDown className={`w-4 h-4 text-gray-300 transition-transform ${expandedId === item.id ? 'rotate-180' : ''}`} /></div>
            </div>
            {expandedId === item.id && <div className="border-t border-gray-100 p-4 bg-gray-50/30 text-xs font-body space-y-1"><p><strong>Location:</strong> {item.location || '—'}</p><p><strong>Features:</strong> {item.features || '—'}</p>{item.description && <p><strong>Description:</strong> {item.description}</p>}</div>}
          </div>
        ))}
      </div>
      {showForm && <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}><div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}><div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10"><h2 className="font-display text-lg font-semibold text-brand-forest">{editing ? 'Edit' : 'Add'} Space</h2><button onClick={() => setShowForm(false)} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div><form onSubmit={save} className="p-5 space-y-4"><div className="grid sm:grid-cols-2 gap-4"><div className="sm:col-span-2"><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase">Space Name *</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-portal" /></div><div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase">Type</label><select value={form.space_type} onChange={e => setForm({...form, space_type: e.target.value})} className="input-portal"><option>Retail</option><option>Office</option><option>Food Service</option><option>Healthcare</option><option>Warehouse</option><option>Mixed Use</option></select></div><div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input-portal"><option value="available">Available</option><option value="occupied">Occupied</option><option value="coming_soon">Coming Soon</option><option value="maintenance">Maintenance</option></select></div><div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase">Location</label><input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="input-portal" /></div><div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase">Square Feet</label><input value={form.sqft} onChange={e => setForm({...form, sqft: e.target.value})} className="input-portal" placeholder="e.g. 1,200" /></div><div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase">Price</label><input value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="input-portal" placeholder="e.g. $2,500/mo" /></div><div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase">Features</label><input value={form.features} onChange={e => setForm({...form, features: e.target.value})} className="input-portal" /></div><div className="sm:col-span-2"><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase">Description</label><textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-portal resize-none" /></div></div><div className="flex gap-3 pt-2"><button type="submit" disabled={saving} className="px-6 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Update' : 'Add Space'}</button><button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-gray-200 text-gray-500 rounded-lg text-sm font-body">Cancel</button></div></form></div></div>}
    </div>
  );
}
