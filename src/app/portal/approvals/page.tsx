'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, XCircle, Clock, Pencil, Eye, X, AlertTriangle } from 'lucide-react';

type R = Record<string,unknown>;
const g = (r:R,k:string):string => (r[k] as string)||'';

export default function ApprovalsPage() {
  const [tab, setTab] = useState<'accounts'|'jobs'>('accounts');
  const [accounts, setAccounts] = useState<R[]>([]);
  const [jobs, setJobs] = useState<R[]>([]);
  const [detail, setDetail] = useState<R|null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { loadAll(); }, []);
  async function loadAll() {
    const { data: a } = await supabase.from('lf_profiles').select('*').in('account_status', ['pending','suspended']).order('created_at', { ascending: false });
    setAccounts(a||[]);
    const { data: j } = await supabase.from('lf_jobs').select('*, lf_profiles!lf_jobs_created_by_fkey(full_name, email)').eq('approval_status', 'pending').order('created_at', { ascending: false });
    setJobs(j||[]);
    setLoading(false);
  }

  const approveAccount = async (id: string) => {
    await supabase.from('lf_profiles').update({ account_status: 'approved' }).eq('id', id);
    await supabase.from('lf_audit_log').insert({ user_id: (await supabase.auth.getUser()).data.user?.id, action: 'account_approved', entity_type: 'profile', entity_id: id, details: { status: 'approved' } });
    loadAll();
  };
  const rejectAccount = async (id: string) => {
    await supabase.from('lf_profiles').update({ account_status: 'rejected' }).eq('id', id);
    await supabase.from('lf_audit_log').insert({ user_id: (await supabase.auth.getUser()).data.user?.id, action: 'account_rejected', entity_type: 'profile', entity_id: id, details: { status: 'rejected' } });
    loadAll();
  };
  const approveJob = async (id: string) => {
    const uid = (await supabase.auth.getUser()).data.user?.id;
    // If job has pending_changes and was previously approved, apply them
    const { data: job } = await supabase.from('lf_jobs').select('pending_changes').eq('id', id).single();
    const pc = job?.pending_changes as R|null;
    if (pc && (pc as R).action === 'delete') {
      await supabase.from('lf_jobs').delete().eq('id', id);
    } else if (pc && Object.keys(pc).length > 0) {
      await supabase.from('lf_jobs').update({ ...pc, pending_changes: null, approval_status: 'approved', approved_by: uid, approved_at: new Date().toISOString(), status: 'published', approval_notes: editNotes||null }).eq('id', id);
    } else {
      await supabase.from('lf_jobs').update({ approval_status: 'approved', approved_by: uid, approved_at: new Date().toISOString(), status: 'published', approval_notes: editNotes||null }).eq('id', id);
    }
    await supabase.from('lf_audit_log').insert({ user_id: uid, action: 'job_approved', entity_type: 'job', entity_id: id, details: { notes: editNotes } });
    setDetail(null); setEditNotes(''); loadAll();
  };
  const rejectJob = async (id: string) => {
    const uid = (await supabase.auth.getUser()).data.user?.id;
    await supabase.from('lf_jobs').update({ approval_status: 'rejected', approval_notes: editNotes||'Rejected by admin' }).eq('id', id);
    await supabase.from('lf_audit_log').insert({ user_id: uid, action: 'job_rejected', entity_type: 'job', entity_id: id, details: { notes: editNotes } });
    setDetail(null); setEditNotes(''); loadAll();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl font-bold text-brand-forest">Approval Dashboard</h1><p className="text-sm font-body text-gray-500">Review pending accounts, jobs, and changes</p></div>
        <div className="flex items-center gap-2">
          {accounts.length > 0 && <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">{accounts.length} accounts</span>}
          {jobs.length > 0 && <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">{jobs.length} jobs</span>}
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={()=>setTab('accounts')} className={`px-4 py-2 rounded-lg text-sm font-body font-semibold ${tab==='accounts'?'bg-brand-forest text-white':'bg-gray-100 text-gray-600'}`}>Accounts ({accounts.length})</button>
        <button onClick={()=>setTab('jobs')} className={`px-4 py-2 rounded-lg text-sm font-body font-semibold ${tab==='jobs'?'bg-brand-forest text-white':'bg-gray-100 text-gray-600'}`}>Jobs ({jobs.length})</button>
      </div>

      {tab==='accounts' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          {accounts.length===0 ? <p className="p-8 text-center text-sm text-gray-400 font-body">No pending accounts.</p> : (
            <table className="w-full text-sm font-body"><thead><tr className="text-left text-xs text-gray-400 uppercase border-b bg-gray-50"><th className="p-3">User</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3">Created</th><th className="p-3 text-right">Actions</th></tr></thead>
              <tbody>{accounts.map(a=>(
                <tr key={g(a,'id')} className="border-b border-gray-100">
                  <td className="p-3"><div className="font-semibold text-brand-forest">{g(a,'full_name')||g(a,'email')}</div><div className="text-xs text-gray-400">{g(a,'email')}</div></td>
                  <td className="p-3 text-xs">{g(a,'role')} / {g(a,'portal_type')}</td>
                  <td className="p-3"><span className="px-2 py-0.5 text-xs rounded font-semibold bg-amber-50 text-amber-700">{g(a,'account_status')}</span></td>
                  <td className="p-3 text-xs text-gray-400">{new Date(g(a,'created_at')).toLocaleDateString()}</td>
                  <td className="p-3 text-right"><div className="flex gap-1 justify-end">
                    <button onClick={()=>approveAccount(g(a,'id'))} className="px-3 py-1 bg-green-50 text-green-700 rounded text-xs font-semibold hover:bg-green-100">Approve</button>
                    <button onClick={()=>rejectAccount(g(a,'id'))} className="px-3 py-1 bg-red-50 text-red-700 rounded text-xs font-semibold hover:bg-red-100">Reject</button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      )}

      {tab==='jobs' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          {jobs.length===0 ? <p className="p-8 text-center text-sm text-gray-400 font-body">No pending jobs.</p> : (
            <table className="w-full text-sm font-body"><thead><tr className="text-left text-xs text-gray-400 uppercase border-b bg-gray-50"><th className="p-3">Job</th><th className="p-3">Submitted By</th><th className="p-3">Type</th><th className="p-3">Created</th><th className="p-3 text-right">Actions</th></tr></thead>
              <tbody>{jobs.map(j => {
                const pc = j.pending_changes as R|null;
                const isDelete = pc && (pc as R).action === 'delete';
                const isEdit = pc && !isDelete && Object.keys(pc).length > 0;
                const creator = (j.lf_profiles as R) || {};
                return (
                  <tr key={g(j,'id')} className="border-b border-gray-100">
                    <td className="p-3"><div className="font-semibold text-brand-forest">{g(j,'title')}</div>{isDelete && <span className="text-[10px] text-red-600 font-semibold">DELETE REQUEST</span>}{isEdit && <span className="text-[10px] text-blue-600 font-semibold">EDIT PENDING</span>}</td>
                    <td className="p-3 text-xs">{g(creator,'full_name')||g(creator,'email')||'Admin'}</td>
                    <td className="p-3 text-xs">{g(j,'compensation_type')||g(j,'job_type')}</td>
                    <td className="p-3 text-xs text-gray-400">{new Date(g(j,'created_at')).toLocaleDateString()}</td>
                    <td className="p-3 text-right"><div className="flex gap-1 justify-end">
                      <button onClick={()=>{setDetail(j); setEditNotes('');}} className="p-1.5 text-gray-400 hover:text-brand-forest hover:bg-brand-sage/10 rounded"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={()=>approveJob(g(j,'id'))} className="px-3 py-1 bg-green-50 text-green-700 rounded text-xs font-semibold hover:bg-green-100">Approve</button>
                      <button onClick={()=>rejectJob(g(j,'id'))} className="px-3 py-1 bg-red-50 text-red-700 rounded text-xs font-semibold hover:bg-red-100">Reject</button>
                    </div></td>
                  </tr>
                );
              })}</tbody>
            </table>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="font-display text-lg font-bold text-brand-forest">Review: {g(detail,'title')}</h2><button onClick={()=>setDetail(null)}><X className="w-5 h-5 text-gray-400" /></button></div>
            <div className="space-y-3 text-sm font-body">
              <div><strong>Description:</strong> <p className="text-gray-600 mt-1">{g(detail,'description')}</p></div>
              <div className="grid grid-cols-2 gap-3">
                <div><strong>Compensation:</strong> {g(detail,'salary_range')} ({g(detail,'compensation_type')})</div>
                <div><strong>Category:</strong> {g(detail,'category')}</div>
                <div><strong>Work Mode:</strong> {g(detail,'work_mode')}</div>
                <div><strong>Status:</strong> {g(detail,'job_status')}</div>
              </div>
              {g(detail,'requirements') && <div><strong>Requirements:</strong> <p className="text-gray-600">{g(detail,'requirements')}</p></div>}
              {detail.pending_changes && <div className="bg-amber-50 border border-amber-200 rounded p-3"><strong className="text-amber-800">Pending Changes:</strong><pre className="text-xs text-amber-700 mt-1 whitespace-pre-wrap">{JSON.stringify(detail.pending_changes, null, 2)}</pre></div>}
              <div><label className="text-xs font-semibold uppercase block mb-1">Admin Notes</label><textarea value={editNotes} onChange={e=>setEditNotes(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="Optional notes..." /></div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={()=>approveJob(g(detail,'id'))} className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold">Approve & Publish</button>
              <button onClick={()=>rejectJob(g(detail,'id'))} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold">Reject</button>
              <button onClick={()=>setDetail(null)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
