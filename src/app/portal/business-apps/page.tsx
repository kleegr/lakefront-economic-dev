'use client';
import { useState, useEffect } from 'react';
import { Store, Search } from 'lucide-react';

// ITEM 23: Business Applications page with test data from Supabase
// Reuses the applications API but filters for business-related ones
export default function BusinessAppsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/applications?admin=true').then(r => r.json()).then(d => {
      setApps(d.applications || []); setLoading(false);
    });
  }, []);

  const filtered = apps.filter(a => !search || (a.applicant_name || '').toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl font-bold text-brand-forest">Business Applications</h1><p className="text-sm font-body text-gray-400 mt-1">{apps.length} applications</p></div>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-brand-sage" /></div>
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border"><Store className="w-10 h-10 text-gray-200 mx-auto mb-3" /><p className="text-gray-400 font-body">No business applications yet. Applications submitted through the employer form will appear here.</p></div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden"><table className="w-full text-sm font-body"><thead><tr className="text-left text-xs text-gray-400 uppercase border-b bg-gray-50"><th className="p-3">Applicant</th><th className="p-3">Email</th><th className="p-3">Status</th><th className="p-3">Date</th></tr></thead><tbody>{filtered.map(a => (
          <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/50"><td className="p-3 font-semibold text-brand-forest">{a.applicant_name || 'Unknown'}</td><td className="p-3 text-gray-500">{a.applicant_email || '—'}</td><td className="p-3"><span className="px-2 py-0.5 text-[10px] rounded-full font-semibold bg-blue-50 text-blue-700">{a.status}</span></td><td className="p-3 text-gray-400">{a.created_at ? new Date(a.created_at).toLocaleDateString() : ''}</td></tr>
        ))}</tbody></table></div>
      )}
    </div>
  );
}
