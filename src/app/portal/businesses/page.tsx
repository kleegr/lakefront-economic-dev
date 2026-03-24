'use client';
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Building2, Search, X, ChevronDown } from 'lucide-react';

// ITEMS 21,22: Businesses page with Supabase CRUD + add button working
export default function BusinessesPortalPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', business_type: 'General', contact_name: '', contact_email: '', contact_phone: '', address: '', description: '', website: '', status: 'active' });

  useEffect(() => { load(); }, []);
  async function load() {
    const res = await fetch('/api/businesses?admin=true');
    const data = await res.json();
    setItems(data.items || []); setLoading(false);
  }

  function openNew() { setEditing(null); setForm({ name: '', business_type: 'General', contact_name: '', contact_email: '', contact_phone: '', address: '', description: '', website: '', status: 'active' }); setShowForm(true); }
  function openEdit(item: any) { setEditing(item); setForm({ name: item.name || '', business_type: item.business_type || 'General', contact_name: item.contact_name || '', contact_email: item.contact_email || '', contact_phone: item.contact_phone || '', address: item.address || '', description: item.description || '', website: item.website || '', status: item.status || 'active' }); setShowForm(true); }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const url = editing ? `/api/businesses/${editing.id}` : '/api/businesses';
    const method = editing ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { setShowForm(false); load(); } else { const d = await res.json(); alert(d.error || 'Failed'); }
    setSaving(false);
  }

  async function del(id: string) { if (!confirm('Delete?')) return; await fetch(`/api/businesses/${id}`, { method: 'DELETE' }); load(); }

  const filtered = items.filter(i => !search || i.name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-bold text-brand-forest">Businesses</h1><p className="text-sm font-body text-gray-400 mt-1">{items.length} businesses</p></div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold hover:bg-brand-forest/90"><Plus className="w-4 h-4" /> Add Business</button>
      </div>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-brand-sage" /></div>
      <div className="space-y-3">
        {filtered.length === 0 ? <div className="text-center py-16 bg-white rounded-xl border"><Building2 className="w-10 h-10 text-gray-200 mx-auto mb-3" /><p className="text-gray-400 font-body">No businesses found</p></div> : filtered.map(item => (
          <div key={item.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50/50" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
              <div className="flex-1"><h3 className="font-display text-base font-semibold text-brand-forest">{item.name}</h3><p className="text-xs text-gray-400 font-body">{item.business_type} &middot; {item.contact_name || 'No contact'} &middot; {item.status}</p></div>
              <div className="flex items-center gap-1"><button onClick={e => { e.stopPropagation(); openEdit(item); }} className="p-1.5 text-gray-300 hover:text-brand-forest hover:bg-gray-100 rounded-lg"><Pencil className="w-4 h-4" /></button><button onClick={e => { e.stopPropagation(); del(item.id); }} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button><ChevronDown className={`w-4 h-4 text-gray-300 transition-transform ${expandedId === item.id ? 'rotate-180' : ''}`} /></div>
            </div>
            {expandedId === item.id && <div className="border-t border-gray-100 p-4 bg-gray-50/30 text-xs font-body space-y-1"><p><strong>Email:</strong> {item.contact_email || '—'}</p><p><strong>Phone:</strong> {item.contact_phone || '—'}</p><p><strong>Address:</strong> {item.address || '—'}</p><p><strong>Website:</strong> {item.website || '—'}</p>{item.description && <p><strong>Description:</strong> {item.description}</p>}</div>}
          </div>
        ))}
      </div>
      {showForm && <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}><div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}><div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10"><h2 className="font-display text-lg font-semibold text-brand-forest">{editing ? 'Edit' : 'Add'} Business</h2><button onClick={() => setShowForm(false)} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div><form onSubmit={save} className="p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4"><div className="sm:col-span-2"><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Business Name *</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-portal" /></div><div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Type</label><select value={form.business_type} onChange={e => setForm({...form, business_type: e.target.value})} className="input-portal"><option>General</option><option>Retail</option><option>Healthcare</option><option>Food Service</option><option>Professional Services</option><option>Technology</option><option>Construction</option></select></div><div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input-portal"><option value="active">Active</option><option value="pending">Pending</option><option value="inactive">Inactive</option></select></div><div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Contact Name</label><input value={form.contact_name} onChange={e => setForm({...form, contact_name: e.target.value})} className="input-portal" /></div><div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Email</label><input type="email" value={form.contact_email} onChange={e => setForm({...form, contact_email: e.target.value})} className="input-portal" /></div><div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Phone</label><input value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})} className="input-portal" /></div><div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Address</label><input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="input-portal" /></div><div className="sm:col-span-2"><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Description</label><textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-portal resize-none" /></div></div>
        <div className="flex gap-3 pt-2"><button type="submit" disabled={saving} className="px-6 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Update' : 'Add Business'}</button><button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-gray-200 text-gray-500 rounded-lg text-sm font-body">Cancel</button></div>
      </form></div></div>}
    </div>
  );
}
