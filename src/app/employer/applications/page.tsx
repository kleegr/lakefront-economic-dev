'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function EmployerApplicationsPage() {
  const [applications, setApplications] = useState<Record<string,unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Get my jobs first, then applications to those jobs
      const { data: myJobs } = await supabase.from('lf_jobs').select('id, title').eq('created_by', user.id);
      if (myJobs && myJobs.length > 0) {
        const jobIds = myJobs.map(j => j.id);
        const { data: apps } = await supabase.from('lf_applications').select('*, lf_jobs(title)').in('job_id', jobIds).order('created_at', { ascending: false });
        setApplications(apps || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('lf_applications').update({ status }).eq('id', id);
    setApplications(prev => prev.map(a => (a.id as string) === id ? { ...a, status } : a));
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-forest mb-1">Applications</h1>
      <p className="text-sm font-body text-gray-500 mb-6">Only showing applications to YOUR job postings</p>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {applications.length === 0 ? (
          <p className="text-center py-12 text-sm text-gray-400 font-body">No applications received yet.</p>
        ) : (
          <table className="w-full text-sm font-body">
            <thead><tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b bg-gray-50">
              <th className="p-3">Applicant</th><th className="p-3">Job</th><th className="p-3">Status</th><th className="p-3">Date</th><th className="p-3">Actions</th>
            </tr></thead>
            <tbody>{applications.map(a => (
              <tr key={a.id as string} className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="p-3 text-brand-forest font-semibold">{a.applicant_id as string}</td>
                <td className="p-3 text-xs">{((a as Record<string,unknown>).lf_jobs as Record<string,unknown>)?.title as string || '-'}</td>
                <td className="p-3"><span className={`px-2 py-0.5 text-xs rounded font-semibold ${(a.status as string) === 'submitted' ? 'bg-blue-50 text-blue-700' : (a.status as string) === 'reviewing' ? 'bg-amber-50 text-amber-700' : (a.status as string) === 'interview' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>{a.status as string}</span></td>
                <td className="p-3 text-xs text-gray-400">{new Date(a.created_at as string).toLocaleDateString()}</td>
                <td className="p-3">
                  <select value={a.status as string} onChange={e => updateStatus(a.id as string, e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1">
                    <option value="submitted">Submitted</option><option value="reviewing">Reviewing</option><option value="interview">Interview</option><option value="offered">Offered</option><option value="hired">Hired</option><option value="rejected">Rejected</option>
                  </select>
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
