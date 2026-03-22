'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

type R = Record<string,unknown>;
const g = (r:R,k:string):string => (r[k] as string)||'';

export default function EmployerApprovalsPage() {
  const [jobs, setJobs] = useState<R[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('lf_jobs').select('*').eq('created_by', user.id).order('created_at', { ascending: false });
      setJobs(data||[]);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  const pendingJobs = jobs.filter(j => g(j,'approval_status')==='pending');
  const approvedJobs = jobs.filter(j => g(j,'approval_status')==='approved');
  const rejectedJobs = jobs.filter(j => g(j,'approval_status')==='rejected');

  const icon = (s: string) => s==='approved' ? <CheckCircle className="w-4 h-4 text-green-500" /> : s==='rejected' ? <XCircle className="w-4 h-4 text-red-500" /> : s==='changes_requested' ? <AlertCircle className="w-4 h-4 text-amber-500" /> : <Clock className="w-4 h-4 text-amber-500" />;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-forest mb-1">Pending Approvals</h1>
      <p className="text-sm font-body text-gray-500 mb-6">Track the status of your submitted job postings and changes</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center"><div className="text-2xl font-display font-bold text-amber-700">{pendingJobs.length}</div><p className="text-xs font-body text-amber-600">Pending</p></div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center"><div className="text-2xl font-display font-bold text-green-700">{approvedJobs.length}</div><p className="text-xs font-body text-green-600">Approved</p></div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center"><div className="text-2xl font-display font-bold text-red-700">{rejectedJobs.length}</div><p className="text-xs font-body text-red-600">Rejected</p></div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {jobs.length === 0 ? <p className="p-8 text-center text-sm text-gray-400 font-body">No submissions yet.</p> : (
          <table className="w-full text-sm font-body">
            <thead><tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b bg-gray-50">
              <th className="p-3">Job</th><th className="p-3">Submitted</th><th className="p-3">Status</th><th className="p-3">Notes</th>
            </tr></thead>
            <tbody>{jobs.map(j => (
              <tr key={g(j,'id')} className="border-b border-gray-100">
                <td className="p-3 font-semibold text-brand-forest">{g(j,'title')}</td>
                <td className="p-3 text-xs text-gray-400">{new Date(g(j,'created_at')).toLocaleDateString()}</td>
                <td className="p-3"><div className="flex items-center gap-1.5">{icon(g(j,'approval_status'))}<span className="text-xs font-semibold">{g(j,'approval_status')}</span></div></td>
                <td className="p-3 text-xs text-gray-500">{g(j,'approval_notes')||'-'}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
