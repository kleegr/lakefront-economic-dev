'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Key, Save, Shield } from 'lucide-react';

export default function AISettingsPage() {
  const [key, setKey] = useState(''); const [saved, setSaved] = useState(false); const [loading, setLoading] = useState(true);
  const supabase = createClient();
  useEffect(() => { async function load() { const { data } = await supabase.from('lf_settings').select('value').eq('key', 'ai_api_key').maybeSingle(); if (data) setKey(data.value.slice(0,8)+'...hidden'); setLoading(false); } load(); }, []);
  const handleSave = async () => {
    if (!key || key.includes('...hidden')) return;
    const uid = (await supabase.auth.getUser()).data.user?.id;
    await supabase.from('lf_settings').upsert({ key: 'ai_api_key', value: key, updated_by: uid }, { onConflict: 'key' });
    await supabase.from('lf_audit_log').insert({ user_id: uid, action: 'ai_key_updated', entity_type: 'settings', entity_id: 'ai_api_key' });
    setSaved(true); setTimeout(()=>setSaved(false), 3000);
  };
  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-forest mb-1">AI Settings</h1>
      <p className="text-sm font-body text-gray-500 mb-6">Configure the AI integration for resume generation</p>
      <div className="bg-white rounded-xl border p-6 max-w-lg">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-xs font-body text-blue-800 flex items-center gap-2"><Shield className="w-4 h-4 shrink-0" />API keys are stored server-side in the database and never exposed to frontend code.</div>
        <div className="mb-4"><label className="text-xs font-body font-semibold uppercase block mb-1">Anthropic API Key</label><div className="flex gap-2"><div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded px-3 py-2"><Key className="w-4 h-4 text-gray-400" /><input type="password" value={key} onChange={e=>setKey(e.target.value)} className="flex-1 bg-transparent text-sm font-body outline-none" placeholder="sk-ant-..." /></div><button onClick={handleSave} className="px-4 py-2 bg-brand-forest text-white rounded text-sm font-body font-semibold flex items-center gap-1"><Save className="w-3.5 h-3.5" />{saved?'Saved!':'Save'}</button></div></div>
        <p className="text-xs text-gray-400 font-body">Used for AI-assisted resume generation in the Applicant Portal. Changes are audit-logged.</p>
      </div>
    </div>
  );
}
