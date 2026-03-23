'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, Pencil, ArchiveRestore, X } from 'lucide-react';

type R = Record<string,unknown>;
const g = (r:R,k:string):string => (r[k] as string)||'';

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<R[]>([]);
  const [name, setName] = useState(''); const [cat, setCat] = useState(''); const [editId, setEditId] = useState<string|null>(null);
  const [adding, setAdding] = useState(false); const [showArchived, setShowArchived] = useState(false);
  const supabase = createClient();

  useEffect(() => { load(); }, [showArchived]);
  async function load() {
    let q = supabase.from('lf_skills').select('*').order('category').order('name');
    if (!showArchived) q = q.eq('is_active', true);
    const { data } = await q;
    setSkills(data||[]);
  }
  const save = async () => {
    if (!name) return; setAdding(true);
    if (editId) { await supabase.from('lf_skills').update({ name, category: cat||'General' }).eq('id', editId); }
    else { await supabase.from('lf_skills').insert({ name, category: cat||'General' }); }
    setName(''); setCat(''); setEditId(null); setAdding(false); load();
  };
  const toggleActive = async (id: string, current: boolean) => { await supabase.from('lf_skills').update({ is_active: !current }).eq('id', id); load(); };
  const startEdit = (sk: R) => { setEditId(g(sk,'id')); setName(g(sk,'name')); setCat(g(sk,'category')); };
  const categories = Array.from(new Set(skills.map(s => g(s,'category')||'General')));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl font-bold text-brand-forest">Skills Taxonomy</h1><p className="text-sm font-body text-gray-500">Admin-managed skills list shared by applicants, employers, and jobs</p></div>
        <label className="flex items-center gap-2 text-xs font-body"><input type="checkbox" checked={showArchived} onChange={e=>setShowArchived(e.target.checked)} className="rounded" />Show archived</label>
      </div>
      <div className="bg-white rounded-xl border p-6 mb-6 max-w-lg">
        <h3 className="text-sm font-body font-semibold text-brand-forest mb-3">{editId ? 'Edit Skill' : 'Add New Skill'}</h3>
        <div className="flex gap-2">
          <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Skill name" className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-body" />
          <input type="text" value={cat} onChange={e=>setCat(e.target.value)} placeholder="Category" className="w-32 px-3 py-2 border border-gray-300 rounded text-sm font-body" />
          <button onClick={save} disabled={adding||!name} className="px-4 py-2 bg-brand-forest text-white rounded text-sm font-body font-semibold disabled:opacity-50">{editId?'Update':'Add'}</button>
          {editId && <button onClick={()=>{setEditId(null);setName('');setCat('');}} className="p-2 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>}
        </div>
      </div>
      {categories.map(catName => (
        <div key={catName} className="mb-6">
          <h3 className="text-sm font-body font-semibold text-brand-forest mb-2">{catName}</h3>
          <div className="flex flex-wrap gap-2">{skills.filter(s => (g(s,'category')||'General')===catName).map(sk => (
            <span key={g(sk,'id')} className={`inline-flex items-center gap-1 px-3 py-1.5 border rounded-full text-xs font-body ${sk.is_active?'bg-white border-gray-200':'bg-gray-100 border-gray-300 opacity-60'}`}>
              {g(sk,'name')}
              <button onClick={()=>startEdit(sk)} className="text-gray-300 hover:text-brand-forest"><Pencil className="w-3 h-3" /></button>
              <button onClick={()=>toggleActive(g(sk,'id'),sk.is_active as boolean)} className="text-gray-300 hover:text-amber-500" title={sk.is_active?'Archive':'Restore'}>{sk.is_active?<Trash2 className="w-3 h-3" />:<ArchiveRestore className="w-3 h-3" />}</button>
            </span>
          ))}</div>
        </div>
      ))}
    </div>
  );
}
