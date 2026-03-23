'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MessageSquare, CheckCircle, Archive } from 'lucide-react';

type R = Record<string,unknown>;
const g = (r:R,k:string):string => (r[k] as string)||'';

export default function AdminSuggestionsPage() {
  const [items, setItems] = useState<R[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  useEffect(() => { load(); }, []);
  async function load() { const { data } = await supabase.from('lf_suggestions').select('*').order('created_at', { ascending: false }); setItems(data||[]); setLoading(false); }
  const updateStatus = async (id: string, status: string) => { await supabase.from('lf_suggestions').update({ status }).eq('id', id); load(); };
  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-forest mb-1">Public Feedback</h1>
      <p className="text-sm font-body text-gray-500 mb-6">Review suggestions, comments, and ideas from the community</p>
      <div className="bg-white rounded-xl border overflow-hidden">
        {items.length===0 ? <p className="p-8 text-center text-sm text-gray-400">No submissions yet.</p> : (
          <table className="w-full text-sm font-body"><thead><tr className="text-left text-xs text-gray-400 uppercase border-b bg-gray-50"><th className="p-3">Type</th><th className="p-3">From</th><th className="p-3">Message</th><th className="p-3">Status</th><th className="p-3">Date</th><th className="p-3 text-right">Actions</th></tr></thead>
            <tbody>{items.map(i=>(
              <tr key={g(i,'id')} className="border-b border-gray-100">
                <td className="p-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded font-semibold">{g(i,'type')}</span></td>
                <td className="p-3 text-xs">{g(i,'name')||'Anonymous'}<br/><span className="text-gray-400">{g(i,'email')}</span></td>
                <td className="p-3 text-xs max-w-[300px] truncate">{g(i,'message')}</td>
                <td className="p-3"><span className={`px-2 py-0.5 text-xs rounded font-semibold ${g(i,'status')==='reviewed'?'bg-green-50 text-green-700':g(i,'status')==='archived'?'bg-gray-100 text-gray-500':'bg-amber-50 text-amber-700'}`}>{g(i,'status')}</span></td>
                <td className="p-3 text-xs text-gray-400">{new Date(g(i,'created_at')).toLocaleDateString()}</td>
                <td className="p-3 text-right"><div className="flex gap-1 justify-end">
                  <button onClick={()=>updateStatus(g(i,'id'),'reviewed')} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded" title="Mark reviewed"><CheckCircle className="w-3.5 h-3.5" /></button>
                  <button onClick={()=>updateStatus(g(i,'id'),'archived')} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded" title="Archive"><Archive className="w-3.5 h-3.5" /></button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
