'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Pencil, Trash2, Eye, X, Clock, CheckCircle, AlertCircle } from 'lucide-react';

type R = Record<string,unknown>;
const g = (r:R,k:string):string => (r[k] as string)||'';

const COMP_TYPES = [{v:'hourly',l:'Hourly'},{v:'salary',l:'Salary'},{v:'commission_only',l:'Commission Only'},{v:'base_commission',l:'Base + Commission'},{v:'partnership',l:'Partnership'},{v:'equity',l:'Equity / Ownership'},{v:'other',l:'Other'}];
const WORK_MODES = [{v:'on_site',l:'On Site'},{v:'remote',l:'Remote'},{v:'hybrid',l:'Hybrid'}];
const STATUSES = [{v:'open',l:'Open'},{v:'pending',l:'Pending'},{v:'hired',l:'Hired/Filled'},{v:'coming_soon',l:'Coming Soon'},{v:'accepting_offers',l:'Accepting Offers'}];

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<R[]>([]);
  const [skills, setSkills] = useState<R[]>([]);
  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);
  // Form
  const [title, setTitle] = useState(''); const [desc, setDesc] = useState(''); const [cat, setCat] = useState('');
  const [comp, setComp] = useState(''); const [compType, setCompType] = useState('hourly'); const [workMode, setWorkMode] = useState('on_site');
  const [jobStatus, setJobStatus] = useState('open'); const [reqs, setReqs] = useState(''); const [selSkills, setSelSkills] = useState<string[]>([]);
  const [special, setSpecial] = useState('');
  const supabase = createClient();

  useEffect(() => { loadJobs(); loadSkills(); }, []);

  async function loadSkills() { const { data } = await supabase.from('lf_skills').select('*').eq('is_active', true).order('category'); setSkills(data||[]); }
  async function loadJobs() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('lf_jobs').select('*').eq('created_by', user.id).order('created_at', { ascending: false });
    setJobs(data||[]);
  }

  const resetForm = () => { setTitle(''); setDesc(''); setCat(''); setComp(''); setCompType('hourly'); setWorkMode('on_site'); setJobStatus('open'); setReqs(''); setSelSkills([]); setSpecial(''); setEditId(null); };

  const handleEdit = (j: R) => {
    setEditId(g(j,'id')); setTitle(g(j,'title')); setDesc(g(j,'description')); setCat(g(j,'category'));
    setComp(g(j,'salary_range')); setCompType(g(j,'compensation_type')||'hourly'); setWorkMode(g(j,'work_mode')||'on_site');
    setJobStatus(g(j,'job_status')||'open'); setReqs(g(j,'requirements')); setSelSkills((j.skills_required as string[])||[]);
    setSpecial(g(j,'special_offer')); setShow(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const payload = {
      title, description: desc, category: cat, salary_range: comp, compensation_type: compType,
      work_mode: workMode, job_status: jobStatus, requirements: reqs, skills_required: selSkills,
      special_offer: special, location: 'Lakefront Estates, Okeechobee, FL',
    };
    if (editId) {
      // Edit goes to pending_changes, not live
      const { data: existing } = await supabase.from('lf_jobs').select('approval_status').eq('id', editId).single();
      if (existing && existing.approval_status === 'approved') {
        await supabase.from('lf_jobs').update({ pending_changes: payload, approval_status: 'pending' }).eq('id', editId);
      } else {
        await supabase.from('lf_jobs').update({ ...payload, approval_status: 'pending' }).eq('id', editId);
      }
    } else {
      await supabase.from('lf_jobs').insert({ ...payload, created_by: user.id, status: 'draft', approval_status: 'pending' });
    }
    setShow(false); resetForm(); setSaving(false); loadJobs();
  };

  const handleRequestDelete = async (id: string) => {
    await supabase.from('lf_jobs').update({ approval_status: 'pending', pending_changes: { action: 'delete' } }).eq('id', id);
    loadJobs();
  };

  const toggleSkill = (id: string) => setSelSkills(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);

  const approvalBadge = (j: R) => {
    const a = g(j,'approval_status');
    if (a === 'approved') return <span className="flex items-center gap-1 text-[10px] text-green-600 font-semibold"><CheckCircle className="w-3 h-3" />Approved</span>;
    if (a === 'rejected') return <span className="flex items-center gap-1 text-[10px] text-red-600 font-semibold"><AlertCircle className="w-3 h-3" />Rejected</span>;
    return <span className="flex items-center gap-1 text-[10px] text-amber-600 font-semibold"><Clock className="w-3 h-3" />Pending Approval</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl font-bold text-brand-forest">My Jobs</h1><p className="text-sm font-body text-gray-500">New jobs and edits require admin approval before going live</p></div>
        <button onClick={() => { resetForm(); setShow(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold"><Plus className="w-4 h-4" />Post New Job</button>
      </div>

      {show && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="font-display text-xl font-bold text-brand-forest">{editId ? 'Edit Job' : 'Post New Job'}</h2><button onClick={() => { setShow(false); resetForm(); }}><X className="w-5 h-5 text-gray-400" /></button></div>
            <div className="space-y-4">
              <div><label className="text-xs font-body font-semibold uppercase block mb-1">Job Title *</label><input type="text" value={title} onChange={e=>setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" placeholder="e.g. Store Manager" /></div>
              <div><label className="text-xs font-body font-semibold uppercase block mb-1">Description *</label><textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-body font-semibold uppercase block mb-1">Category</label><input type="text" value={cat} onChange={e=>setCat(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" placeholder="Retail, Food, etc." /></div>
                <div><label className="text-xs font-body font-semibold uppercase block mb-1">Compensation</label><input type="text" value={comp} onChange={e=>setComp(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" placeholder="$15-$20/hr" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-xs font-body font-semibold uppercase block mb-1">Comp Type</label><select value={compType} onChange={e=>setCompType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body">{COMP_TYPES.map(c=><option key={c.v} value={c.v}>{c.l}</option>)}</select></div>
                <div><label className="text-xs font-body font-semibold uppercase block mb-1">Work Mode</label><select value={workMode} onChange={e=>setWorkMode(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body">{WORK_MODES.map(w=><option key={w.v} value={w.v}>{w.l}</option>)}</select></div>
                <div><label className="text-xs font-body font-semibold uppercase block mb-1">Job Status</label><select value={jobStatus} onChange={e=>setJobStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body">{STATUSES.map(s=><option key={s.v} value={s.v}>{s.l}</option>)}</select></div>
              </div>
              <div><label className="text-xs font-body font-semibold uppercase block mb-1">Requirements</label><textarea value={reqs} onChange={e=>setReqs(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" /></div>
              <div><label className="text-xs font-body font-semibold uppercase block mb-1">Special Offer (partnership/equity details)</label><textarea value={special} onChange={e=>setSpecial(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" placeholder="Optional" /></div>
              <div><label className="text-xs font-body font-semibold uppercase block mb-2">Required Skills</label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto border rounded p-2">{skills.map(sk => (
                  <button key={g(sk,'id')} type="button" onClick={()=>toggleSkill(g(sk,'id'))} className={`px-2 py-1 rounded-full text-[11px] font-body ${selSkills.includes(g(sk,'id'))?'bg-brand-forest text-white':'bg-gray-100 text-gray-600'}`}>{g(sk,'name')}</button>
                ))}</div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs font-body text-amber-800">New jobs and edits require admin approval before going live on the public site.</div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShow(false); resetForm(); }} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-body font-semibold">Cancel</button>
              <button onClick={handleSave} disabled={saving||!title} className="flex-1 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold disabled:opacity-50">{saving ? 'Submitting...' : editId ? 'Submit Changes' : 'Submit for Approval'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        {jobs.length === 0 ? <div className="p-12 text-center"><p className="text-sm text-gray-400 font-body">No jobs yet. Post your first job!</p></div> : (
          <table className="w-full text-sm font-body">
            <thead><tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b bg-gray-50">
              <th className="p-3">Job</th><th className="p-3">Type</th><th className="p-3">Status</th><th className="p-3">Approval</th><th className="p-3 text-right">Actions</th>
            </tr></thead>
            <tbody>{jobs.map(j => (
              <tr key={g(j,'id')} className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="p-3"><div className="font-semibold text-brand-forest">{g(j,'title')}</div><div className="text-xs text-gray-400">{g(j,'category')||'No category'} &middot; {g(j,'compensation_type')}</div></td>
                <td className="p-3 text-xs">{g(j,'job_type')||g(j,'work_mode')}</td>
                <td className="p-3"><span className={`px-2 py-0.5 text-xs rounded font-semibold ${g(j,'status')==='published'?'bg-green-50 text-green-700':'bg-gray-100 text-gray-500'}`}>{g(j,'status')}</span></td>
                <td className="p-3">{approvalBadge(j)}</td>
                <td className="p-3"><div className="flex items-center gap-1 justify-end">
                  <button onClick={()=>handleEdit(j)} className="p-1.5 text-gray-400 hover:text-brand-forest hover:bg-brand-sage/10 rounded"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={()=>handleRequestDelete(g(j,'id'))} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Request Deletion"><Trash2 className="w-3.5 h-3.5" /></button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
