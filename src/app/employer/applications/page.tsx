'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, FileText, ChevronRight, X } from 'lucide-react';

type R = Record<string,unknown>;
const g = (r:R,k:string):string => (r[k] as string)||'';

export default function EmployerApplicationsPage() {
  const [jobs, setJobs] = useState<R[]>([]);
  const [selJob, setSelJob] = useState<string|null>(null);
  const [apps, setApps] = useState<R[]>([]);
  const [detail, setDetail] = useState<R|null>(null);
  const [memberInfo, setMemberInfo] = useState<R|null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { async function load() { const { data: { user } } = await supabase.auth.getUser(); if (!user) return; const { data: j } = await supabase.from('lf_jobs').select('id, title').eq('created_by', user.id).order('created_at', { ascending: false }); setJobs(j||[]); setLoading(false); } load(); }, []);

  const loadApps = async (jobId: string) => { setSelJob(jobId); const { data } = await supabase.from('lf_applications').select('*, lf_household_members(full_name, age, years_experience, experience_summary, skills, desired_earnings, availability, qualifications)').eq('job_id', jobId).order('created_at', { ascending: false }); setApps(data||[]); };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/applications/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    if (selJob) loadApps(selJob);
  };

  const viewDetail = (a: R) => { setDetail(a); setMemberInfo((a.lf_household_members as R)||null); };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-forest mb-1">Applicant Review</h1>
      <p className="text-sm font-body text-gray-500 mb-6">Review candidates for your job postings</p>

      {detail && (<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"><div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4"><h2 className="font-display text-lg font-bold text-brand-forest">Candidate Details</h2><button onClick={()=>setDetail(null)}><X className="w-5 h-5 text-gray-400" /></button></div>
        {memberInfo && (<div className="space-y-3">
          <div className="flex items-center gap-3"><div className="w-12 h-12 rounded-full bg-brand-sage/10 flex items-center justify-center"><User className="w-6 h-6 text-brand-forest" /></div><div><div className="font-semibold text-brand-forest">{g(memberInfo,'full_name')}</div><div className="text-xs text-gray-400">Age: {g(memberInfo,'age')} &middot; {g(memberInfo,'years_experience')} yrs exp &middot; {g(memberInfo,'availability')}</div></div></div>
          {g(memberInfo,'desired_earnings') && <div className="text-sm font-body"><strong>Desired Pay:</strong> {g(memberInfo,'desired_earnings')}</div>}
          {g(memberInfo,'experience_summary') && <div className="text-sm font-body"><strong>Experience:</strong><p className="text-gray-600 mt-1">{g(memberInfo,'experience_summary')}</p></div>}
          {g(memberInfo,'qualifications') && <div className="text-sm font-body"><strong>Qualifications:</strong><p className="text-gray-600 mt-1">{g(memberInfo,'qualifications')}</p></div>}
          {(memberInfo.skills as string[])?.length > 0 && <div><strong className="text-sm font-body">Skills:</strong><div className="flex flex-wrap gap-1 mt-1">{(memberInfo.skills as string[]).map((sk,i)=><span key={i} className="px-2 py-0.5 bg-brand-sage/10 text-brand-forest text-xs rounded-full font-body">{sk}</span>)}</div></div>}
          {g(detail,'expected_pay') && <div className="text-sm font-body"><strong>Expected Pay for this job:</strong> {g(detail,'expected_pay')}</div>}
        </div>)}
        <div className="mt-6 flex gap-2">
          <button onClick={()=>{updateStatus(g(detail,'id'),'reviewing'); setDetail(null);}} className="flex-1 py-2 bg-amber-50 text-amber-700 rounded-lg text-xs font-body font-semibold">Mark Reviewing</button>
          <button onClick={()=>{updateStatus(g(detail,'id'),'interview'); setDetail(null);}} className="flex-1 py-2 bg-purple-50 text-purple-700 rounded-lg text-xs font-body font-semibold">Shortlist</button>
          <button onClick={()=>{if(confirm('Offer this candidate the position? They will be auto-assigned to the job.')) { updateStatus(g(detail,'id'),'offered'); setDetail(null); }}} className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-body font-semibold">Offer</button>
          <button onClick={()=>{if(confirm('Mark as hired? This candidate will be auto-assigned to the job and appear in your team.')) { updateStatus(g(detail,'id'),'hired'); setDetail(null); }}} className="flex-1 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-body font-semibold">Hire</button>
          <button onClick={()=>{updateStatus(g(detail,'id'),'rejected'); setDetail(null);}} className="flex-1 py-2 bg-red-50 text-red-700 rounded-lg text-xs font-body font-semibold">Reject</button>
        </div>
      </div></div>)}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border p-4"><h3 className="text-sm font-body font-semibold text-brand-forest mb-3">Select a Job</h3>
          {jobs.length === 0 ? <p className="text-xs text-gray-400 font-body">No jobs yet.</p> : (<div className="space-y-2">{jobs.map(j => (<button key={g(j,'id')} onClick={()=>loadApps(g(j,'id'))} className={`w-full text-left p-3 rounded-lg text-sm font-body flex items-center justify-between transition-colors ${selJob===g(j,'id')?'bg-brand-sage/10 text-brand-forest font-semibold':'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>{g(j,'title')}<ChevronRight className="w-3.5 h-3.5" /></button>))}</div>)}
        </div>
        <div className="md:col-span-2 bg-white rounded-xl border p-4"><h3 className="text-sm font-body font-semibold text-brand-forest mb-3">Applications {selJob && `(${apps.length})`}</h3>
          {!selJob ? <p className="text-xs text-gray-400 font-body text-center py-8">Select a job to see applications.</p> : apps.length === 0 ? <p className="text-xs text-gray-400 font-body text-center py-8">No applications for this job.</p> : (
            <div className="space-y-2">{apps.map(a => {
              const m = (a.lf_household_members as R)||{};
              return (<div key={g(a,'id')} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100" onClick={()=>viewDetail(a)}>
                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-brand-sage/10 flex items-center justify-center"><User className="w-4 h-4 text-brand-forest" /></div><div><div className="text-sm font-body font-semibold text-brand-forest">{g(m,'full_name')||'Applicant'}</div><div className="text-xs text-gray-400">{g(m,'years_experience')} yrs exp &middot; Applied {new Date(g(a,'created_at')).toLocaleDateString()}</div></div></div>
                <select value={g(a,'status')} onClick={e=>e.stopPropagation()} onChange={e=>{e.stopPropagation(); updateStatus(g(a,'id'),e.target.value);}} className="text-xs border border-gray-200 rounded px-2 py-1"><option value="submitted">Submitted</option><option value="reviewing">Reviewing</option><option value="interview">Shortlisted</option><option value="offered">Offered</option><option value="hired">Hired</option><option value="rejected">Rejected</option></select>
              </div>);
            })}</div>
          )}
        </div>
      </div>
    </div>
  );
}
