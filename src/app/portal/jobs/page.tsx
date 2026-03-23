'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Pencil, Trash2, CheckCircle, Clock, Eye, EyeOff, X } from 'lucide-react';

type R = Record<string,unknown>;
const g = (r:R,k:string):string => (r[k] as string)||'';
const VIS = [{v:'public',l:'Public'},{v:'signed_in',l:'Signed-in Only'},{v:'admin_only',l:'Admin Only'},{v:'coming_soon',l:'Coming Soon'}];

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<R[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { load(); }, []);
  async function load() {
    const { data } = await supabase.from('lf_jobs').select('*').order('created_at', { ascending: false });
    setJobs(data||[]); setLoading(false);
  }

  const togglePublish = async (id: string, current: string) => {
    const newStatus = current === 'published' ? 'draft' : 'published';
    await supabase.from('lf_jobs').update({ status: newStatus }).eq('id', id);
    await supabase.from('lf_audit_log').insert({ user_id: (await supabase.auth.getUser()).data.user?.id, action: `job_${newStatus}`, entity_type: 'job', entity_id: id });
    load();
  };
  const setVisibility = async (id: string, vis: string) => {
    await supabase.from('lf_jobs').update({ visibility: vis }).eq('id', id);
    await supabase.from('lf_audit_log').insert({ user_id: (await supabase.auth.getUser()).data.user?.id, action: 'visibility_changed', entity_type: 'job', entity_id: id, details: { visibility: vis } });
    load();
  };
  const approveJob = async (id: string) => {
    const uid = (await supabase.auth.getUser()).data.user?.id;
    await supabase.from('lf_jobs').update({ approval_status: 'approved', approved_by: uid, approved_at: new Date().toISOString(), status: 'published' }).eq('id', id);
    await supabase.from('lf_audit_log').insert({ user_id: uid, action: 'job_approved', entity_type: 'job', entity_id: id });
    load();
  };
  const deleteJob = async (id: string) => {
    if (!confirm('Delete this job permanently?')) return;
    await supabase.from('lf_jobs').delete().eq('id', id);
    await supabase.from('lf_audit_log').insert({ user_id: (await supabase.auth.getUser()).data.user?.id, action: 'job_deleted', entity_type: 'job', entity_id: id });
    load();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl font-bold text-brand-forest">All Jobs</h1><p className="text-sm font-body text-gray-500">Admin view — manage all job postings with full override</p></div>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        {jobs.length===0 ? <p className="p-8 text-center text-sm text-gray-400">No jobs.</p> : (
          <table className="w-full text-sm font-body"><thead><tr className="text-left text-xs text-gray-400 uppercase border-b bg-gray-50"><th className="p-3">Job</th><th className="p-3">Status</th><th className="p-3">Approval</th><th className="p-3">Visibility</th><th className="p-3 text-right">Actions</th></tr></thead>
            <tbody>{jobs.map(j=>(
              <tr key={g(j,'id')} className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="p-3"><div className="font-semibold text-brand-forest">{g(j,'title')}</div><div className="text-xs text-gray-400">{g(j,'company_name')||'—'} &middot; {g(j,'category')}</div></td>
                <td className="p-3"><span className={`px-2 py-0.5 text-xs rounded font-semibold ${g(j,'status')==='published'?'bg-green-50 text-green-700':'bg-gray-100 text-gray-500'}`}>{g(j,'status')}</span></td>
                <td className="p-3">{g(j,'approval_status')==='approved'?<span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Approved</span>:<span className="text-xs text-amber-600 flex items-center gap-1"><Clock className="w-3 h-3" />{g(j,'approval_status')}</span>}</td>
                <td className="p-3"><select value={g(j,'visibility')||'public'} onChange={e=>setVisibility(g(j,'id'),e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1">{VIS.map(v=><option key={v.v} value={v.v}>{v.l}</option>)}</select></td>
                <td className="p-3"><div className="flex gap-1 justify-end">
                  <button onClick={()=>togglePublish(g(j,'id'),g(j,'status'))} className="p-1.5 text-gray-400 hover:text-brand-forest hover:bg-brand-sage/10 rounded" title={g(j,'status')==='published'?'Unpublish':'Publish'}>{g(j,'status')==='published'?<EyeOff className="w-3.5 h-3.5" />:<Eye className="w-3.5 h-3.5" />}</button>
                  {g(j,'approval_status')==='pending'&&<button onClick={()=>approveJob(g(j,'id'))} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-semibold">Approve</button>}
                  <button onClick={()=>deleteJob(g(j,'id'))} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
