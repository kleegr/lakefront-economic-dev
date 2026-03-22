'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2 } from 'lucide-react';

type R = Record<string,unknown>;
const g = (r:R,k:string):string => (r[k] as string)||'';

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<R[]>([]);
  const [name, setName] = useState(''); const [cat, setCat] = useState('');
  const [adding, setAdding] = useState(false);
  const supabase = createClient();

  useEffect(() => { load(); }, []);
  async function load() { const { data } = await supabase.from('lf_skills').select('*').order('category').order('name'); setSkills(data||[]); }
  const addSkill = async () => {
    if (!name) return;
    setAdding(true);
    await supabase.from('lf_skills').insert({ name, category: cat||'General' });
    setName(''); setCat(''); setAdding(false); load();
  };
  const deleteSkill = async (id: string) => { await supabase.from('lf_skills').delete().eq('id', id); load(); };
  const categories = Array.from(new Set(skills.map(s => g(s,'category')||'General')));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl font-bold text-brand-forest">Skills Taxonomy</h1><p className="text-sm font-body text-gray-500">Manage the master skills list used across the platform</p></div>
      </div>
      <div className="bg-white rounded-xl border p-6 mb-6 max-w-lg">
        <h3 className="text-sm font-body font-semibold text-brand-forest mb-3">Add New Skill</h3>
        <div className="flex gap-2">
          <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Skill name" className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-body" />
          <input type="text" value={cat} onChange={e=>setCat(e.target.value)} placeholder="Category" className="w-32 px-3 py-2 border border-gray-300 rounded text-sm font-body" />
          <button onClick={addSkill} disabled={adding||!name} className="px-4 py-2 bg-brand-forest text-white rounded text-sm font-body font-semibold disabled:opacity-50"><Plus className="w-4 h-4" /></button>
        </div>
      </div>
      {categories.map(catName => (
        <div key={catName} className="mb-6">
          <h3 className="text-sm font-body font-semibold text-brand-forest mb-2">{catName}</h3>
          <div className="flex flex-wrap gap-2">{skills.filter(s => (g(s,'category')||'General')===catName).map(sk => (
            <span key={g(sk,'id')} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-body">
              {g(sk,'name')}
              <button onClick={()=>deleteSkill(g(sk,'id'))} className="text-gray-300 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
            </span>
          ))}</div>
        </div>
      ))}
    </div>
  );
}
