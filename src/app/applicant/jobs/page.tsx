'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useHousehold } from '@/lib/household-context';
import { Heart, Briefcase, Bell, DollarSign, MapPin, Clock } from 'lucide-react';

type Job = Record<string,unknown>;

export default function BrowseJobsPage() {
  const { activeMember, approved } = useHousehold();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [notifyIds, setNotifyIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [applying, setApplying] = useState(false);
  const [expectedPay, setExpectedPay] = useState('');
  const [message, setMessage] = useState('');
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('lf_jobs').select('*').eq('status', 'published').order('created_at', { ascending: false });
      setJobs(data || []);
      if (activeMember) {
        const { data: saved } = await supabase.from('lf_saved_jobs').select('job_id').eq('member_id', activeMember.id);
        setSavedIds((saved||[]).map((s: Record<string,unknown>) => s.job_id as string));
        const { data: notifs } = await supabase.from('lf_job_notifications').select('job_id').eq('member_id', activeMember.id);
        setNotifyIds((notifs||[]).map((n: Record<string,unknown>) => n.job_id as string));
      }
    }
    load();
  }, [activeMember]);

  const toggleSave = async (jobId: string) => {
    if (!activeMember) return;
    if (savedIds.includes(jobId)) { await supabase.from('lf_saved_jobs').delete().eq('member_id', activeMember.id).eq('job_id', jobId); setSavedIds(prev => prev.filter(id => id !== jobId)); }
    else { await supabase.from('lf_saved_jobs').insert({ member_id: activeMember.id, job_id: jobId }); setSavedIds(prev => [...prev, jobId]); }
  };
  const requestNotify = async (jobId: string) => { if (!activeMember) return; await supabase.from('lf_job_notifications').insert({ member_id: activeMember.id, job_id: jobId }); setNotifyIds(prev => [...prev, jobId]); };
  const toggleSelect = (jobId: string) => { if (selected.includes(jobId)) setSelected(prev => prev.filter(id => id !== jobId)); else if (selected.length < 3) setSelected(prev => [...prev, jobId]); };
  const canApply = (j: Job) => ['open','pending','accepting_offers'].includes((j.job_status as string) || 'open');

  const submitApplications = async () => {
    if (!activeMember || !approved || selected.length === 0) return;
    setApplying(true);
    const { data: { user } } = await supabase.auth.getUser();
    for (const jobId of selected) {
      await supabase.from('lf_applications').insert({ job_id: jobId, applicant_id: user?.id, member_id: activeMember.id, expected_pay: expectedPay || null, status: 'submitted' });
    }
    setMessage(`Applied to ${selected.length} job(s) as ${activeMember.full_name}!`);
    setSelected([]); setExpectedPay(''); setApplying(false);
    setTimeout(() => setMessage(''), 4000);
  };

  const statusBadge = (j: Job) => {
    const s = (j.job_status as string) || 'open';
    const map: Record<string,{label:string;cls:string}> = { open:{label:'Open',cls:'bg-green-50 text-green-700'}, pending:{label:'Pending',cls:'bg-amber-50 text-amber-700'}, hired:{label:'Filled',cls:'bg-gray-100 text-gray-500'}, filled:{label:'Filled',cls:'bg-gray-100 text-gray-500'}, coming_soon:{label:'Coming Soon',cls:'bg-blue-50 text-blue-700'}, accepting_offers:{label:'Accepting Offers',cls:'bg-purple-50 text-purple-700'} };
    const m = map[s] || map.open;
    return <span className={`px-2 py-0.5 text-[10px] rounded font-semibold ${m.cls}`}>{m.label}</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl font-bold text-brand-forest">Browse Jobs</h1><p className="text-sm font-body text-gray-500">{activeMember ? `Browsing as: ${activeMember.full_name}` : 'Select a member first'}</p></div>
        {selected.length > 0 && approved && activeMember?.profile_complete && (
          <button onClick={submitApplications} disabled={applying} className="px-4 py-2 bg-brand-forest text-white rounded-lg text-xs font-body font-semibold disabled:opacity-50">{applying ? 'Applying...' : `Apply to ${selected.length} Job(s)`}</button>
        )}
      </div>
      {message && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-body">{message}</div>}
      {!activeMember && <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm font-body text-blue-800 mb-4">Add a household member first.</div>}
      {activeMember && !activeMember.profile_complete && <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm font-body text-amber-800 mb-4">{activeMember.full_name}&apos;s profile is incomplete.</div>}
      <div className="space-y-3">{jobs.length === 0 ? <p className="text-center py-12 text-sm text-gray-400 font-body">No jobs yet.</p> : jobs.map(j => {
        const jid = j.id as string; const ca = canApply(j); const isSaved = savedIds.includes(jid);
        const isCS = (j.job_status as string)==='coming_soon'; const isAO = (j.job_status as string)==='accepting_offers';
        const isSel = selected.includes(jid); const isNot = notifyIds.includes(jid);
        return (
          <div key={jid} className={`bg-white rounded-xl border ${isSel?'border-brand-forest ring-2 ring-brand-sage/30':'border-gray-200'} p-5`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1"><h3 className="font-display font-bold text-brand-forest">{j.title as string}</h3>{statusBadge(j)}</div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-400 font-body mb-2">
                  {j.company_name && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{j.company_name as string}</span>}
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{(j.location as string)||'Lakefront Estates'}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{j.job_type as string}</span>
                  {j.salary_range && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{j.salary_range as string}</span>}
                </div>
                {j.description && <p className="text-xs font-body text-gray-500 line-clamp-2">{j.description as string}</p>}
              </div>
              <div className="flex items-center gap-1 ml-4 shrink-0">
                {activeMember && <button onClick={()=>toggleSave(jid)} className={`p-2 rounded-lg ${isSaved?'text-red-500 bg-red-50':'text-gray-300 hover:text-red-400'}`}><Heart className={`w-4 h-4 ${isSaved?'fill-current':''}`} /></button>}
                {isCS && activeMember && !isNot && <button onClick={()=>requestNotify(jid)} className="p-2 text-blue-400 hover:text-blue-600 rounded-lg"><Bell className="w-4 h-4" /></button>}
                {isCS && isNot && <span className="text-[10px] text-blue-600 font-body">Notified</span>}
                {ca && activeMember && approved && activeMember.profile_complete && <button onClick={()=>toggleSelect(jid)} className={`px-3 py-1.5 rounded-lg text-xs font-body font-semibold ${isSel?'bg-brand-forest text-white':'bg-gray-100 text-gray-600 hover:bg-brand-sage/20'}`}>{isSel?'Selected':'Select'}</button>}
              </div>
            </div>
            {isAO && isSel && <div className="mt-3 pt-3 border-t"><label className="text-xs font-body font-semibold text-purple-700 block mb-1">Expected Compensation</label><input type="text" value={expectedPay} onChange={e=>setExpectedPay(e.target.value)} className="px-3 py-1.5 border border-purple-200 rounded text-sm font-body w-48" placeholder="e.g. $18/hr" /></div>}
          </div>
        );
      })}</div>
    </div>
  );
}
