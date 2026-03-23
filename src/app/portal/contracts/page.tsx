'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Home, Search, Users, CheckCircle } from 'lucide-react';

type R = Record<string,unknown>;
const g = (r:R,k:string):string => (r[k] as string)||'';

export default function ContractResidentsPage() {
  const [households, setHouseholds] = useState<R[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { load(); }, []);
  async function load() {
    const { data } = await supabase.from('lf_households').select('*, account:lf_profiles!lf_households_account_id_fkey(full_name, email, account_status), members:lf_household_members(id, full_name, profile_complete)').eq('under_contract', true).order('created_at', { ascending: false });
    setHouseholds(data||[]); setLoading(false);
  }

  const filtered = households.filter(h => {
    if (!query) return true;
    const q = query.toLowerCase();
    const acc = (h.account as R)||{};
    return g(acc,'full_name').toLowerCase().includes(q) || g(acc,'email').toLowerCase().includes(q) || g(h,'lot_number').toLowerCase().includes(q);
  });

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-forest mb-1">Contract-Signed Residents</h1>
      <p className="text-sm font-body text-gray-500 mb-6">Households under contract with Lakefront Estates</p>
      <div className="flex gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2"><Search className="w-4 h-4 text-gray-400" /><input type="text" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by name, email, or lot..." className="flex-1 text-sm font-body outline-none" /></div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4 text-center"><div className="text-2xl font-display font-bold text-brand-forest">{households.length}</div><p className="text-xs text-gray-400">Under Contract</p></div>
        <div className="bg-white rounded-xl border p-4 text-center"><div className="text-2xl font-display font-bold text-brand-forest">{households.reduce((c:number,h:R)=>c+((h.members as R[])||[]).length,0)}</div><p className="text-xs text-gray-400">Total Members</p></div>
        <div className="bg-white rounded-xl border p-4 text-center"><div className="text-2xl font-display font-bold text-brand-forest">{households.reduce((c:number,h:R)=>c+((h.members as R[])||[]).filter((m:R)=>m.profile_complete).length,0)}</div><p className="text-xs text-gray-400">Job-Ready</p></div>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        {filtered.length===0 ? <p className="p-8 text-center text-sm text-gray-400">No contract-signed residents found.</p> : (
          <table className="w-full text-sm font-body"><thead><tr className="text-left text-xs text-gray-400 uppercase border-b bg-gray-50"><th className="p-3">Household</th><th className="p-3">Lot</th><th className="p-3">Contract</th><th className="p-3">Members</th><th className="p-3">Job-Ready</th><th className="p-3">Account</th></tr></thead>
            <tbody>{filtered.map(h => {
              const acc = (h.account as R)||{};
              const members = (h.members as R[])||[];
              const ready = members.filter((m:R)=>m.profile_complete).length;
              return (
                <tr key={g(h,'id')} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="p-3"><div className="font-semibold text-brand-forest">{g(acc,'full_name')||g(acc,'email')}</div><div className="text-xs text-gray-400">{g(acc,'email')}</div></td>
                  <td className="p-3"><span className="font-semibold">{g(h,'lot_number')||'—'}</span></td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded font-semibold">{g(h,'contract_status')||'active'}</span></td>
                  <td className="p-3">{members.length}</td>
                  <td className="p-3">{ready > 0 ? <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-3 h-3" />{ready}</span> : <span className="text-gray-400">0</span>}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 text-xs rounded font-semibold ${g(acc,'account_status')==='approved'?'bg-green-50 text-green-700':'bg-amber-50 text-amber-700'}`}>{g(acc,'account_status')}</span></td>
                </tr>
              );
            })}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
