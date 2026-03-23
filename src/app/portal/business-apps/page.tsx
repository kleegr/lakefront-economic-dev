'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Store, Eye, X, CheckCircle, XCircle } from 'lucide-react';

type R = Record<string,unknown>;
const g = (r:R,k:string):string => (r[k] as string)||'';

export default function AdminBusinessAppsPage() {
  const [apps, setApps] = useState<R[]>([]); const [detail, setDetail] = useState<R|null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  useEffect(() => { load(); }, []);
  async function load() { const { data } = await supabase.from('lf_business_applications').select('*').order('created_at', { ascending: false }); setApps(data||[]); setLoading(false); }
  const updateStatus = async (id: string, status: string) => { await supabase.from('lf_business_applications').update({ status }).eq('id', id); setDetail(null); load(); };
  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-forest mb-1">Business Applications</h1>
      <p className="text-sm font-body text-gray-500 mb-6">Review storefront and business applications</p>
      <div className="bg-white rounded-xl border overflow-hidden">
        {apps.length===0 ? <p className="p-8 text-center text-sm text-gray-400">No applications yet.</p> : (
          <table className="w-full text-sm font-body"><thead><tr className="text-left text-xs text-gray-400 uppercase border-b bg-gray-50"><th className="p-3">Business</th><th className="p-3">Contact</th><th className="p-3">Category</th><th className="p-3">Status</th><th className="p-3">Date</th><th className="p-3 text-right">Actions</th></tr></thead>
            <tbody>{apps.map(a=>(
              <tr key={g(a,'id')} className="border-b border-gray-100">
                <td className="p-3 font-semibold text-brand-forest">{g(a,'business_name')}</td>
                <td className="p-3 text-xs">{g(a,'contact_name')}<br/><span className="text-gray-400">{g(a,'contact_email')}</span></td>
                <td className="p-3 text-xs">{g(a,'business_category')||'-'}</td>
                <td className="p-3"><span className={`px-2 py-0.5 text-xs rounded font-semibold ${g(a,'status')==='approved'?'bg-green-50 text-green-700':g(a,'status')==='rejected'?'bg-red-50 text-red-700':'bg-amber-50 text-amber-700'}`}>{g(a,'status')}</span></td>
                <td className="p-3 text-xs text-gray-400">{new Date(g(a,'created_at')).toLocaleDateString()}</td>
                <td className="p-3 text-right"><div className="flex gap-1 justify-end">
                  <button onClick={()=>setDetail(a)} className="p-1.5 text-gray-400 hover:text-brand-forest hover:bg-brand-sage/10 rounded"><Eye className="w-3.5 h-3.5" /></button>
                  <button onClick={()=>updateStatus(g(a,'id'),'approved')} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-semibold">Approve</button>
                  <button onClick={()=>updateStatus(g(a,'id'),'rejected')} className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-semibold">Reject</button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
      {detail && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"><div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4"><h2 className="font-display text-lg font-bold text-brand-forest">{g(detail,'business_name')}</h2><button onClick={()=>setDetail(null)}><X className="w-5 h-5 text-gray-400" /></button></div>
          <div className="space-y-3 text-sm font-body">
            <div className="grid grid-cols-2 gap-3"><div><strong>Contact:</strong> {g(detail,'contact_name')}</div><div><strong>Email:</strong> {g(detail,'contact_email')}</div><div><strong>Phone:</strong> {g(detail,'contact_phone')||'-'}</div><div><strong>Category:</strong> {g(detail,'business_category')}</div></div>
            <div><strong>Concept:</strong><p className="text-gray-600 mt-1">{g(detail,'business_concept')}</p></div>
            <div className="grid grid-cols-2 gap-3"><div><strong>Ready to invest:</strong> {detail.ready_to_invest?'Yes':'No'}</div><div><strong>Investment:</strong> {g(detail,'investment_amount')||'-'}</div><div><strong>Space intent:</strong> {g(detail,'space_intent')||'-'}</div><div><strong>Jobs created:</strong> {g(detail,'expected_jobs_created')||'-'}</div></div>
            <div className="grid grid-cols-3 gap-3"><div><strong>Y1:</strong> {g(detail,'year1_projection')||'-'}</div><div><strong>Y2:</strong> {g(detail,'year2_projection')||'-'}</div><div><strong>Y3:</strong> {g(detail,'year3_projection')||'-'}</div></div>
            {g(detail,'projection_rationale') ? <div><strong>Rationale:</strong><p className="text-gray-600">{g(detail,'projection_rationale')}</p></div> : null}
            {g(detail,'additional_context') ? <div><strong>Additional:</strong><p className="text-gray-600">{g(detail,'additional_context')}</p></div> : null}
          </div>
          <div className="flex gap-2 mt-6">
            <button onClick={()=>updateStatus(g(detail,'id'),'approved')} className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold">Approve</button>
            <button onClick={()=>updateStatus(g(detail,'id'),'rejected')} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold">Reject</button>
            <button onClick={()=>setDetail(null)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold">Close</button>
          </div>
        </div></div>
      )}
    </div>
  );
}
