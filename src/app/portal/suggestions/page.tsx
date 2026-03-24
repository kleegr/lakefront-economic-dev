'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MessageSquare, CheckCircle, Archive, Pencil, Trash2, X, Eye } from 'lucide-react';

type R = Record<string,unknown>;
const g = (r:R,k:string):string => (r[k] as string)||'';

export default function AdminSuggestionsPage() {
  const [items, setItems] = useState<R[]>([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<R|null>(null);
  const [editForm, setEditForm] = useState({ status: 'new', admin_response: '' });
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<R|null>(null);
  const supabase = createClient();

  useEffect(() => { load(); }, []);
  async function load() { const { data } = await supabase.from('lf_suggestions').select('*').order('created_at', { ascending: false }); setItems(data||[]); setLoading(false); }
  const updateStatus = async (id: string, status: string) => { await supabase.from('lf_suggestions').update({ status }).eq('id', id); load(); };

  function openEdit(item: R) { setEditItem(item); setEditForm({ status: g(item, 'status') || 'new', admin_response: g(item, 'admin_response') || '' }); }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault(); if (!editItem) return; setSaving(true);
    await supabase.from('lf_suggestions').update({ status: editForm.status, admin_response: editForm.admin_response || null, updated_at: new Date().toISOString() }).eq('id', g(editItem, 'id'));
    setEditItem(null); setSaving(false); load();
  }

  async function deleteItem(id: string) {
    if (!confirm('Delete this feedback permanently?')) return;
    await supabase.from('lf_suggestions').delete().eq('id', id);
    if (detail && g(detail, 'id') === id) setDetail(null); load();
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-forest mb-1">Public Feedback</h1>
      <p className="text-sm font-body text-gray-500 mb-6">Review suggestions, comments, and ideas from the community &middot; {items.length} submissions</p>
      <div className="bg-white rounded-xl border overflow-hidden">
        {items.length===0 ? <p className="p-8 text-center text-sm text-gray-400">No submissions yet.</p> : (
          <table className="w-full text-sm font-body"><thead><tr className="text-left text-xs text-gray-400 uppercase border-b bg-gray-50"><th className="p-3">Type</th><th className="p-3">From</th><th className="p-3">Message</th><th className="p-3">Status</th><th className="p-3">Date</th><th className="p-3 text-right">Actions</th></tr></thead>
            <tbody>{items.map(i=>(
              <tr key={g(i,'id')} className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="p-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded font-semibold">{g(i,'type')}</span></td>
                <td className="p-3 text-xs">{g(i,'name')||'Anonymous'}<br/><span className="text-gray-400">{g(i,'email')}</span></td>
                <td className="p-3 text-xs max-w-[300px] truncate">{g(i,'message')}</td>
                <td className="p-3"><span className={`px-2 py-0.5 text-xs rounded font-semibold ${g(i,'status')==='reviewed'?'bg-green-50 text-green-700':g(i,'status')==='archived'?'bg-gray-100 text-gray-500':'bg-amber-50 text-amber-700'}`}>{g(i,'status')}</span></td>
                <td className="p-3 text-xs text-gray-400">{new Date(g(i,'created_at')).toLocaleDateString()}</td>
                <td className="p-3 text-right"><div className="flex gap-1 justify-end">
                  <button onClick={()=>setDetail(i)} className="p-1.5 text-gray-400 hover:text-brand-forest hover:bg-gray-100 rounded" title="View"><Eye className="w-3.5 h-3.5" /></button>
                  <button onClick={()=>openEdit(i)} className="p-1.5 text-gray-400 hover:text-brand-forest hover:bg-gray-100 rounded" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={()=>updateStatus(g(i,'id'),'reviewed')} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded" title="Mark reviewed"><CheckCircle className="w-3.5 h-3.5" /></button>
                  <button onClick={()=>updateStatus(g(i,'id'),'archived')} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded" title="Archive"><Archive className="w-3.5 h-3.5" /></button>
                  <button onClick={()=>deleteItem(g(i,'id'))} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                </div></td>
              </tr>
            ))}</tbody></table>)}
      </div>

      {detail && (<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setDetail(null)}><div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4"><h2 className="font-display text-lg font-bold text-brand-forest">Feedback Detail</h2><button onClick={() => setDetail(null)}><X className="w-5 h-5 text-gray-400" /></button></div>
        <div className="space-y-3 text-sm font-body">
          <div className="flex gap-2"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded font-semibold">{g(detail,'type')}</span><span className={`px-2 py-0.5 text-xs rounded font-semibold ${g(detail,'status')==='reviewed'?'bg-green-50 text-green-700':g(detail,'status')==='archived'?'bg-gray-100 text-gray-500':'bg-amber-50 text-amber-700'}`}>{g(detail,'status')}</span></div>
          <div><strong className="text-gray-400 text-xs uppercase">From</strong><p className="text-brand-forest">{g(detail,'name')||'Anonymous'} &middot; {g(detail,'email')||'No email'}</p></div>
          <div><strong className="text-gray-400 text-xs uppercase">Message</strong><p className="text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg mt-1">{g(detail,'message')}</p></div>
          {g(detail,'admin_response') && <div><strong className="text-gray-400 text-xs uppercase">Admin Response</strong><p className="text-gray-600 mt-1">{g(detail,'admin_response')}</p></div>}
          <p className="text-xs text-gray-400">Submitted {new Date(g(detail,'created_at')).toLocaleString()}</p>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={() => { setDetail(null); openEdit(detail); }} className="px-4 py-2 bg-brand-forest text-white rounded-lg text-sm font-semibold">Edit</button>
          <button onClick={() => { deleteItem(g(detail,'id')); setDetail(null); }} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold">Delete</button>
          <button onClick={() => setDetail(null)} className="px-4 py-2 border border-gray-200 text-gray-500 rounded-lg text-sm">Close</button>
        </div>
      </div></div>)}

      {editItem && (<div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/50 backdrop-blur-sm" onClick={() => setEditItem(null)}><div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10"><h2 className="font-display text-lg font-semibold text-brand-forest">Edit Feedback</h2><button onClick={() => setEditItem(null)} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div>
        <form onSubmit={saveEdit} className="p-5 space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg text-sm font-body"><p className="text-xs text-gray-400 uppercase mb-1">Original Message</p><p className="text-gray-600">{g(editItem, 'message')}</p></div>
          <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Status</label><select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="input-portal"><option value="new">New</option><option value="reviewed">Reviewed</option><option value="archived">Archived</option><option value="in_progress">In Progress</option></select></div>
          <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Admin Response</label><textarea rows={3} value={editForm.admin_response} onChange={e => setEditForm({...editForm, admin_response: e.target.value})} className="input-portal resize-none" placeholder="Optional response or internal notes..." /></div>
          <div className="flex gap-3 pt-2"><button type="submit" disabled={saving} className="px-6 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold disabled:opacity-50">{saving ? 'Saving...' : 'Update'}</button><button type="button" onClick={() => setEditItem(null)} className="px-6 py-2.5 border border-gray-200 text-gray-500 rounded-lg text-sm font-body">Cancel</button></div>
        </form></div></div>)}
    </div>
  );
}
