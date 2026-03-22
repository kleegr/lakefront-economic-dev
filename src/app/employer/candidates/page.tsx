'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, User, Shield } from 'lucide-react';

type R = Record<string,unknown>;
const g = (r:R,k:string):string => (r[k] as string)||'';

export default function CandidateSearchPage() {
  const [query, setQuery] = useState('');
  const [candidates, setCandidates] = useState<R[]>([]);
  const [searched, setSearched] = useState(false);
  const supabase = createClient();

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearched(true);
    // Privacy-safe: only search approved applicant members with complete profiles who have applied to YOUR jobs
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // Get employer's job IDs
    const { data: myJobs } = await supabase.from('lf_jobs').select('id').eq('created_by', user.id);
    if (!myJobs || myJobs.length === 0) { setCandidates([]); return; }
    const jobIds = myJobs.map(j => j.id);
    // Get member IDs who applied to employer's jobs
    const { data: appMembers } = await supabase.from('lf_applications').select('member_id').in('job_id', jobIds);
    if (!appMembers || appMembers.length === 0) { setCandidates([]); return; }
    const memberIds = [...new Set(appMembers.map(a => a.member_id).filter(Boolean))];
    // Search those members by name/skills
    const { data: results } = await supabase.from('lf_household_members')
      .select('id, full_name, age, years_experience, skills, desired_earnings, availability, experience_summary, profile_complete')
      .in('id', memberIds)
      .eq('profile_complete', true)
      .ilike('full_name', `%${query}%`);
    setCandidates(results||[]);
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-forest mb-1">Candidate Search</h1>
      <p className="text-sm font-body text-gray-500 mb-6">Search among candidates who have applied to your jobs</p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs font-body text-blue-800 mb-4 flex items-center gap-2">
        <Shield className="w-4 h-4 shrink-0" />
        For privacy, only candidates who have applied to your job postings are searchable. Full applicant database is not exposed.
      </div>

      <div className="flex gap-2 mb-6">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input type="text" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearch()} placeholder="Search by name..." className="flex-1 text-sm font-body outline-none" />
        </div>
        <button onClick={handleSearch} className="px-4 py-2 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold">Search</button>
      </div>

      {searched && candidates.length === 0 && <p className="text-center py-8 text-sm text-gray-400 font-body">No matching candidates found.</p>}
      {candidates.length > 0 && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm font-body">
            <thead><tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b bg-gray-50">
              <th className="p-3">Candidate</th><th className="p-3">Experience</th><th className="p-3">Skills</th><th className="p-3">Desired Pay</th>
            </tr></thead>
            <tbody>{candidates.map(c => (
              <tr key={g(c,'id')} className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="p-3"><div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /><div><div className="font-semibold text-brand-forest">{g(c,'full_name')}</div><div className="text-xs text-gray-400">Age: {g(c,'age')} &middot; {g(c,'availability')}</div></div></div></td>
                <td className="p-3 text-xs">{g(c,'years_experience')} years</td>
                <td className="p-3"><div className="flex flex-wrap gap-1">{((c.skills as string[])||[]).slice(0,4).map((sk,i)=><span key={i} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded">{sk}</span>)}</div></td>
                <td className="p-3 text-xs">{g(c,'desired_earnings')||'-'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
