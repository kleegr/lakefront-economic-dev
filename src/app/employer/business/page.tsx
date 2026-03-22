'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Building2, Save } from 'lucide-react';

export default function BusinessProfilePage() {
  const [name, setName] = useState(''); const [desc, setDesc] = useState(''); const [cat, setCat] = useState('');
  const [email, setEmail] = useState(''); const [phone, setPhone] = useState(''); const [addr, setAddr] = useState('');
  const [web, setWeb] = useState(''); const [saving, setSaving] = useState(false); const [saved, setSaved] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('lf_employer_profiles').select('*').eq('user_id', user.id).maybeSingle();
      if (data) { setName(data.business_name||''); setDesc(data.business_description||''); setCat(data.business_category||''); setEmail(data.contact_email||''); setPhone(data.contact_phone||''); setAddr(data.address||''); setWeb(data.website||''); }
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('lf_employer_profiles').upsert({
      user_id: user.id, business_name: name, business_description: desc, business_category: cat,
      contact_email: email, contact_phone: phone, address: addr, website: web,
    }, { onConflict: 'user_id' });
    setSaving(false); setSaved(true); setTimeout(()=>setSaved(false), 2000);
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-forest mb-1">My Business Profile</h1>
      <p className="text-sm font-body text-gray-500 mb-6">Manage your business information</p>
      <div className="bg-white rounded-xl border p-6 max-w-2xl">
        <div className="space-y-4">
          <div><label className="text-xs font-body font-semibold uppercase block mb-1">Business Name</label><input type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" /></div>
          <div><label className="text-xs font-body font-semibold uppercase block mb-1">Description</label><textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-body font-semibold uppercase block mb-1">Category</label><input type="text" value={cat} onChange={e=>setCat(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" /></div>
            <div><label className="text-xs font-body font-semibold uppercase block mb-1">Website</label><input type="text" value={web} onChange={e=>setWeb(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-body font-semibold uppercase block mb-1">Contact Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" /></div>
            <div><label className="text-xs font-body font-semibold uppercase block mb-1">Phone</label><input type="text" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" /></div>
          </div>
          <div><label className="text-xs font-body font-semibold uppercase block mb-1">Address</label><input type="text" value={addr} onChange={e=>setAddr(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" /></div>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold flex items-center gap-2 disabled:opacity-50"><Save className="w-4 h-4" />{saving?'Saving...':'Save Profile'}</button>
          {saved && <span className="text-sm text-green-600 font-body">Saved!</span>}
        </div>
      </div>
    </div>
  );
}
