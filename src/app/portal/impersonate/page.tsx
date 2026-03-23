'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, Eye, Shield, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type R = Record<string,unknown>;
const g = (r:R,k:string):string => (r[k] as string)||'';

export default function ImpersonatePage() {
  const [users, setUsers] = useState<R[]>([]);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<R|null>(null);
  const [sessions, setSessions] = useState<R[]>([]);
  const supabase = createClient();

  useEffect(() => { loadUsers(); loadSessions(); }, []);
  async function loadUsers() {
    const { data } = await supabase.from('lf_profiles').select('*').neq('role','super_admin').order('created_at', { ascending: false });
    setUsers(data||[]);
  }
  async function loadSessions() {
    const { data } = await supabase.from('lf_impersonation_sessions').select('*, target:lf_profiles!lf_impersonation_sessions_target_user_id_fkey(full_name, email, portal_type)').order('started_at', { ascending: false }).limit(20);
    setSessions(data||[]);
  }

  const startImpersonation = async (target: R) => {
    const uid = (await supabase.auth.getUser()).data.user?.id;
    await supabase.from('lf_impersonation_sessions').insert({ admin_id: uid, target_user_id: g(target,'id') });
    await supabase.from('lf_audit_log').insert({ user_id: uid, action: 'impersonation_start', entity_type: 'profile', entity_id: g(target,'id'), target_user_id: g(target,'id'), details: { target_email: g(target,'email'), target_role: g(target,'role') } });
    setActive(target);
    loadSessions();
  };

  const endImpersonation = async () => {
    if (!active) return;
    const uid = (await supabase.auth.getUser()).data.user?.id;
    await supabase.from('lf_impersonation_sessions').update({ is_active: false, ended_at: new Date().toISOString() }).eq('target_user_id', g(active,'id')).eq('is_active', true);
    await supabase.from('lf_audit_log').insert({ user_id: uid, action: 'impersonation_end', entity_type: 'profile', entity_id: g(active,'id'), target_user_id: g(active,'id') });
    setActive(null);
    loadSessions();
  };

  const portalUrl = (u: R) => g(u,'portal_type')==='employer' ? '/employer/dashboard' : '/applicant/dashboard';
  const filtered = users.filter(u => !query || g(u,'full_name').toLowerCase().includes(query.toLowerCase()) || g(u,'email').toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-forest mb-1">Impersonate User</h1>
      <p className="text-sm font-body text-gray-500 mb-6">View the portal as any user. All sessions are logged.</p>

      {active && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3"><Shield className="w-6 h-6 text-amber-600" /><div><div className="font-semibold text-amber-800">Viewing as: {g(active,'full_name')||g(active,'email')}</div><div className="text-xs text-amber-600">{g(active,'role')} / {g(active,'portal_type')}</div></div></div>
            <div className="flex items-center gap-2">
              <a href={portalUrl(active)} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold">Open Portal View</a>
              <button onClick={endImpersonation} className="px-4 py-2 bg-white border border-amber-300 text-amber-700 rounded-lg text-xs font-semibold">End Session</button>
            </div>
          </div>
          <p className="text-xs text-amber-600 mt-3">Note: This opens the target portal in view-only context. You remain logged in as admin. No credentials are exposed.</p>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <input type="text" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by name or email..." className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-body" />
      </div>

      <div className="bg-white rounded-xl border overflow-hidden mb-8">
        <table className="w-full text-sm font-body"><thead><tr className="text-left text-xs text-gray-400 uppercase border-b bg-gray-50"><th className="p-3">User</th><th className="p-3">Role</th><th className="p-3">Portal</th><th className="p-3">Status</th><th className="p-3 text-right">Action</th></tr></thead>
          <tbody>{filtered.slice(0,50).map(u=>(
            <tr key={g(u,'id')} className="border-b border-gray-100 hover:bg-gray-50/50">
              <td className="p-3"><div className="font-semibold text-brand-forest">{g(u,'full_name')||'No name'}</div><div className="text-xs text-gray-400">{g(u,'email')}</div></td>
              <td className="p-3 text-xs">{g(u,'role')}</td>
              <td className="p-3 text-xs">{g(u,'portal_type')}</td>
              <td className="p-3"><span className={`px-2 py-0.5 text-xs rounded font-semibold ${g(u,'account_status')==='approved'?'bg-green-50 text-green-700':'bg-amber-50 text-amber-700'}`}>{g(u,'account_status')}</span></td>
              <td className="p-3 text-right"><button onClick={()=>startImpersonation(u)} className="px-3 py-1 bg-brand-sage/10 text-brand-forest rounded text-xs font-semibold hover:bg-brand-sage/20 flex items-center gap-1 ml-auto"><Eye className="w-3 h-3" />View As</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      <h3 className="font-display font-semibold text-brand-forest mb-3">Recent Sessions</h3>
      <div className="bg-white rounded-xl border overflow-hidden">
        {sessions.length===0 ? <p className="p-6 text-center text-sm text-gray-400">No sessions yet.</p> : (
          <table className="w-full text-sm font-body"><thead><tr className="text-left text-xs text-gray-400 uppercase border-b bg-gray-50"><th className="p-3">Target User</th><th className="p-3">Started</th><th className="p-3">Ended</th><th className="p-3">Status</th></tr></thead>
            <tbody>{sessions.map(s => {
              const t = (s.target as R)||{};
              return (
                <tr key={g(s,'id')} className="border-b border-gray-100">
                  <td className="p-3">{g(t,'full_name')||g(t,'email')}</td>
                  <td className="p-3 text-xs text-gray-400">{new Date(g(s,'started_at')).toLocaleString()}</td>
                  <td className="p-3 text-xs text-gray-400">{s.ended_at ? new Date(g(s,'ended_at')).toLocaleString() : '-'}</td>
                  <td className="p-3">{s.is_active ? <span className="text-xs text-amber-600 font-semibold">Active</span> : <span className="text-xs text-gray-400">Ended</span>}</td>
                </tr>
              );
            })}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
