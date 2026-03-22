'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useHousehold } from '@/lib/household-context';
import { Plus, Pencil, Trash2, CheckCircle, AlertCircle, User, X } from 'lucide-react';

const AVAIL = ['immediate','2_weeks','1_month','flexible','not_available'];
const JTYPES = ['full-time','part-time','contract','seasonal','volunteer'];
const INDS = ['Retail','Healthcare','Food Service','Construction','Education','Agriculture','Hospitality','Administrative','Transportation','Maintenance','Security','Technology'];

export default function HouseholdPage() {
  const { household, members, reload } = useHousehold();
  const [showAdd, setShowAdd] = useState(false);
  const [lotNumber, setLotNumber] = useState((household?.lot_number as string) || '');
  const [underContract, setUnderContract] = useState((household?.under_contract as boolean) || false);
  const [saving, setSaving] = useState(false);
  const [memberDetail, setMemberDetail] = useState<Record<string,unknown>|null>(null);
  const supabase = createClient();
  const [fn, setFn] = useState(''); const [age, setAge] = useState(''); const [yrs, setYrs] = useState('');
  const [earnings, setEarnings] = useState(''); const [expSummary, setExpSummary] = useState('');
  const [quals, setQuals] = useState(''); const [skills, setSkills] = useState('');
  const [jobTypes, setJobTypes] = useState<string[]>([]); const [industries, setIndustries] = useState<string[]>([]);
  const [avail, setAvail] = useState('immediate'); const [partnership, setPartnership] = useState(false);
  const [partTerms, setPartTerms] = useState(''); const [notes, setNotes] = useState('');
  const resetForm = () => { setFn(''); setAge(''); setYrs(''); setEarnings(''); setExpSummary(''); setQuals(''); setSkills(''); setJobTypes([]); setIndustries([]); setAvail('immediate'); setPartnership(false); setPartTerms(''); setNotes(''); };
  const loadMember = async (id: string) => {
    const { data } = await supabase.from('lf_household_members').select('*').eq('id', id).single();
    if (data) { setMemberDetail(data); setFn(data.full_name||''); setAge(String(data.age||'')); setYrs(String(data.years_experience||'')); setEarnings(data.desired_earnings||''); setExpSummary(data.experience_summary||''); setQuals(data.qualifications||''); setSkills((data.skills||[]).join(', ')); setJobTypes(data.preferred_job_types||[]); setIndustries(data.preferred_industries||[]); setAvail(data.availability||'immediate'); setPartnership(data.open_to_partnership||false); setPartTerms(data.partnership_terms||''); setNotes(data.additional_notes||''); }
  };
  const saveHousehold = async () => { if (!household) return; await supabase.from('lf_households').update({ lot_number: lotNumber, under_contract: underContract }).eq('id', household.id as string); };
  const isComplete = () => fn && age && yrs && expSummary && skills;
  const saveMember = async () => {
    setSaving(true);
    const payload = { full_name: fn, age: parseInt(age)||null, years_experience: parseInt(yrs)||0, desired_earnings: earnings, experience_summary: expSummary, qualifications: quals, skills: skills.split(',').map(s=>s.trim()).filter(Boolean), preferred_job_types: jobTypes, preferred_industries: industries, availability: avail, open_to_partnership: partnership, partnership_terms: partTerms, additional_notes: notes, profile_complete: !!isComplete() };
    if (memberDetail) { await supabase.from('lf_household_members').update(payload).eq('id', memberDetail.id as string); }
    else { await supabase.from('lf_household_members').insert({ ...payload, household_id: household?.id as string, is_primary: members.length === 0 }); }
    setShowAdd(false); setMemberDetail(null); resetForm(); setSaving(false); reload();
  };
  const deleteMember = async (id: string) => { await supabase.from('lf_household_members').delete().eq('id', id); reload(); };
  const toggle = (arr: string[], val: string, setter: (v:string[])=>void) => setter(arr.includes(val) ? arr.filter(x=>x!==val) : [...arr, val]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-forest mb-1">My Household</h1>
      <p className="text-sm font-body text-gray-500 mb-6">Manage your household and add job-seeking members</p>
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-display font-semibold text-brand-forest mb-4">Household Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="text-xs font-body font-semibold uppercase tracking-wider block mb-1">Lot Number</label><input type="text" value={lotNumber} onChange={e=>setLotNumber(e.target.value)} onBlur={saveHousehold} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" placeholder="e.g. Lot 42" /></div>
          <div><label className="text-xs font-body font-semibold uppercase tracking-wider block mb-1">Under Contract</label><label className="flex items-center gap-2 mt-2"><input type="checkbox" checked={underContract} onChange={e=>{setUnderContract(e.target.checked); setTimeout(saveHousehold,100);}} className="rounded border-gray-300" /><span className="text-sm font-body">Yes</span></label></div>
          <div><label className="text-xs font-body font-semibold uppercase tracking-wider block mb-1">Members</label><p className="text-sm font-body text-brand-forest mt-2 font-semibold">{members.length}</p></div>
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-brand-forest">Members</h3>
        <button onClick={() => { resetForm(); setMemberDetail(null); setShowAdd(true); }} className="flex items-center gap-2 px-3 py-2 bg-brand-forest text-white rounded-lg text-xs font-body font-semibold"><Plus className="w-3.5 h-3.5" />Add Member</button>
      </div>
      {members.length === 0 ? <div className="bg-white rounded-xl border p-8 text-center"><p className="text-sm text-gray-400 font-body">No members yet.</p></div> : (
        <div className="space-y-3 mb-6">{members.map(m => (
          <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-sage/10 flex items-center justify-center"><User className="w-5 h-5 text-brand-forest" /></div>
              <div><div className="font-semibold text-brand-forest text-sm font-body">{m.full_name}{m.is_primary && <span className="ml-2 text-[10px] bg-brand-sage/20 text-brand-sage px-1.5 py-0.5 rounded">Primary</span>}</div>
                <div className="flex items-center gap-1 text-xs">{m.profile_complete ? <><CheckCircle className="w-3 h-3 text-green-500" /><span className="text-green-600">Complete</span></> : <><AlertCircle className="w-3 h-3 text-amber-500" /><span className="text-amber-600">Incomplete</span></>}</div></div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => { loadMember(m.id); setShowAdd(true); }} className="p-1.5 text-gray-400 hover:text-brand-forest hover:bg-brand-sage/10 rounded"><Pencil className="w-3.5 h-3.5" /></button>
              {!m.is_primary && <button onClick={() => deleteMember(m.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>}
            </div>
          </div>
        ))}</div>
      )}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="font-display text-xl font-bold text-brand-forest">{memberDetail ? 'Edit Member' : 'Add Member'}</h2><button onClick={() => { setShowAdd(false); setMemberDetail(null); resetForm(); }}><X className="w-5 h-5 text-gray-400" /></button></div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-3 md:col-span-1"><label className="text-xs font-body font-semibold uppercase block mb-1">Full Name *</label><input type="text" value={fn} onChange={e=>setFn(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" /></div>
                <div><label className="text-xs font-body font-semibold uppercase block mb-1">Age *</label><input type="number" value={age} onChange={e=>setAge(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" /></div>
                <div><label className="text-xs font-body font-semibold uppercase block mb-1">Years Exp *</label><input type="number" value={yrs} onChange={e=>setYrs(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-body font-semibold uppercase block mb-1">Desired Earnings</label><input type="text" value={earnings} onChange={e=>setEarnings(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" placeholder="$15-$20/hr" /></div>
                <div><label className="text-xs font-body font-semibold uppercase block mb-1">Availability</label><select value={avail} onChange={e=>setAvail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body">{AVAIL.map(o=><option key={o} value={o}>{o.replace(/_/g,' ')}</option>)}</select></div>
              </div>
              <div><label className="text-xs font-body font-semibold uppercase block mb-1">Experience Summary *</label><textarea value={expSummary} onChange={e=>setExpSummary(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" /></div>
              <div><label className="text-xs font-body font-semibold uppercase block mb-1">Qualifications</label><textarea value={quals} onChange={e=>setQuals(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" /></div>
              <div><label className="text-xs font-body font-semibold uppercase block mb-1">Skills * (comma separated)</label><input type="text" value={skills} onChange={e=>setSkills(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" placeholder="customer service, cash register" /></div>
              <div><label className="text-xs font-body font-semibold uppercase block mb-2">Job Types</label><div className="flex flex-wrap gap-2">{JTYPES.map(t => <button key={t} type="button" onClick={()=>toggle(jobTypes,t,setJobTypes)} className={`px-3 py-1 rounded-full text-xs font-body ${jobTypes.includes(t)?'bg-brand-forest text-white':'bg-gray-100 text-gray-600'}`}>{t}</button>)}</div></div>
              <div><label className="text-xs font-body font-semibold uppercase block mb-2">Industries</label><div className="flex flex-wrap gap-2">{INDS.map(i => <button key={i} type="button" onClick={()=>toggle(industries,i,setIndustries)} className={`px-3 py-1 rounded-full text-xs font-body ${industries.includes(i)?'bg-brand-forest text-white':'bg-gray-100 text-gray-600'}`}>{i}</button>)}</div></div>
              <div className="border-t pt-4"><label className="flex items-center gap-2"><input type="checkbox" checked={partnership} onChange={e=>setPartnership(e.target.checked)} className="rounded border-gray-300" /><span className="text-sm font-body">Open to business partnership</span></label>
                {partnership && <textarea value={partTerms} onChange={e=>setPartTerms(e.target.value)} rows={2} className="w-full mt-2 px-3 py-2 border border-gray-300 rounded text-sm font-body" placeholder="Expected terms..." />}</div>
              <div><label className="text-xs font-body font-semibold uppercase block mb-1">Additional Notes</label><textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowAdd(false); resetForm(); setMemberDetail(null); }} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-body font-semibold">Cancel</button>
              <button onClick={saveMember} disabled={saving||!fn} className="flex-1 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold disabled:opacity-50">{saving ? 'Saving...' : memberDetail ? 'Update' : 'Add Member'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
