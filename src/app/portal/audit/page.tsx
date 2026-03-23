'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ScrollText } from 'lucide-react';

type R = Record<string,unknown>;
const g = (r:R,k:string):string => (r[k] as string)||'';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<R[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { load(); }, []);
  async function load() {
    const { data } = await supabase.from('lf_audit_log').select('*, actor:lf_profiles!lf_audit_log_user_id_fkey(full_name, email)').order('created_at', { ascending: false }).limit(100);
    setLogs(data||[]); setLoading(false);
  }

  const actionColor = (a: string) => {
    if (a.includes('approved')) return 'bg-green-50 text-green-700';
    if (a.includes('rejected')) return 'bg-red-50 text-red-700';
    if (a.includes('impersonation')) return 'bg-amber-50 text-amber-700';
    if (a.includes('delete')) return 'bg-red-50 text-red-600';
    return 'bg-gray-100 text-gray-600';
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-forest mb-1">Audit Log</h1>
      <p className="text-sm font-body text-gray-500 mb-6">Track all admin actions — approvals, rejections, impersonation, and overrides</p>
      <div className="bg-white rounded-xl border overflow-hidden">
        {logs.length===0 ? <p className="p-8 text-center text-sm text-gray-400">No audit entries yet.</p> : (
          <table className="w-full text-sm font-body"><thead><tr className="text-left text-xs text-gray-400 uppercase border-b bg-gray-50"><th className="p-3">Action</th><th className="p-3">Actor</th><th className="p-3">Entity</th><th className="p-3">Details</th><th className="p-3">Time</th></tr></thead>
            <tbody>{logs.map(l => {
              const actor = (l.actor as R)||{};
              return (
                <tr key={g(l,'id')} className="border-b border-gray-100">
                  <td className="p-3"><span className={`px-2 py-0.5 text-xs rounded font-semibold ${actionColor(g(l,'action'))}`}>{g(l,'action')}</span></td>
                  <td className="p-3 text-xs">{g(actor,'full_name')||g(actor,'email')||'System'}</td>
                  <td className="p-3 text-xs">{g(l,'entity_type')} / {g(l,'entity_id').slice(0,8)}...</td>
                  <td className="p-3 text-xs text-gray-500 max-w-[200px] truncate">{l.details ? JSON.stringify(l.details).slice(0,80) : '-'}</td>
                  <td className="p-3 text-xs text-gray-400">{new Date(g(l,'created_at')).toLocaleString()}</td>
                </tr>
              );
            })}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
