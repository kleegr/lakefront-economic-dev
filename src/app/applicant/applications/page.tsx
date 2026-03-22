'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useHousehold } from '../layout';
import { FileText } from 'lucide-react';

export default function MyApplicationsPage() {
  const { activeMember } = useHousehold();
  const [apps, setApps] = useState<Record<string,unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      if (!activeMember) { setLoading(false); return; }
      const { data } = await supabase.from('lf_applications').select('*, lf_jobs(title, company_name, job_type)').eq('member_id', activeMember.id).order('created_at', { ascending: false });
      setApps(data || []);
      setLoading(false);
    }
    load();
  }, [activeMember]);

  const statusCls = (s: string) => {
    const map: Record<string,string> = { submitted:'bg-blue-50 text-blue-700', reviewing:'bg-amber-50 text-amber-700', interview:'bg-purple-50 text-purple-700', offered:'bg-green-50 text-green-700', hired:'bg-green-100 text-green-800', rejected:'bg-red-50 text-red-700', withdrawn:'bg-gray-100 text-gray-500' };
    return map[s] || 'bg-gray-100 text-gray-500';
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-forest mb-1">My Applications</h1>
      <p className="text-sm font-body text-gray-500 mb-6">{activeMember ? `Applications for: ${activeMember.full_name}` : 'Select a member'}</p>

      {!activeMember ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm font-body text-blue-800">Add a household member to view applications.</div>
      ) : apps.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center"><FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" /><p className="text-sm text-gray-400 font-body">No applications yet.</p></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm font-body">
            <thead><tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b bg-gray-50">
              <th className="p-3">Job</th><th className="p-3">Company</th><th className="p-3">Status</th><th className="p-3">Applied</th>
            </tr></thead>
            <tbody>{apps.map(a => {
              const j = a.lf_jobs as Record<string,unknown>;
              return (
                <tr key={a.id as string} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="p-3 font-semibold text-brand-forest">{j?.title as string || '-'}</td>
                  <td className="p-3 text-xs">{j?.company_name as string || '-'}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 text-xs rounded font-semibold ${statusCls(a.status as string)}`}>{a.status as string}</span></td>
                  <td className="p-3 text-xs text-gray-400">{new Date(a.created_at as string).toLocaleDateString()}</td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
