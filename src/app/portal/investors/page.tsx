'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Search, Pencil, Trash2, TrendingUp, X, ChevronDown, DollarSign, User, Mail, Phone } from 'lucide-react';

type R = Record<string,unknown>;
const g = (r:R,k:string):string => (r[k] as string)||'';
const fmt = (s: string) => (s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const STAGES = ['inquiry','qualified','proposal','negotiating','committed','closed'];
const STAGE_COLORS: Record<string,string> = {'inquiry':'bg-blue-50 text-blue-700','qualified':'bg-purple-50 text-purple-700','proposal':'bg-amber-50 text-amber-700','negotiating':'bg-orange-50 text-orange-700','committed':'bg-green-50 text-green-700','closed':'bg-gray-100 text-gray-500'};
const EMPTY_FORM = { name: '', email: '', phone: '', company: '', interest_area: '', investment_range: '', stage: 'inquiry', notes: '', source: '' };

export default function InvestorsPortalPage() {
  const [items, setItems] = useState<R[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<R|null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string|null>(null);
  const [form, setForm] = useState({...EMPTY_FORM});
  const supabase = createClient();

  useEffect(() => { load(); }, []);
  async function load() { const { data } = await supabase.from('lf_investor_leads').select('*').order('created_at', { ascending: false }); setItems(data||[]); setLoading(false); }

  function openNew() { setEditing(null); setForm({...EMPTY_FORM}); setShowForm(true); }
  function openEdit(item: R) { setEditing(item); setForm({ name: g(item,'name'), email: g(item,'email'), phone: g(item,'phone'), company: g(item,'company'), interest_area: g(item,'interest_area'), investment_range: g(item,'investment_range'), stage: g(item,'stage') || 'inquiry', notes: g(item,'notes'), source: g(item,'source') }); setShowForm(true); }

  async function save(e: React.FormEvent) { e.preventDefault(); setSaving(true); if (editing) { await supabase.from('lf_investor_leads').update({ ...form, updated_at: new Date().toISOString() }).eq('id', g(editing,'id')); } else { await supabase.from('lf_investor_leads').insert(form); } setShowForm(false); setSaving(false); load(); }
  async function del(id: string) { if (!confirm('Delete this investor lead permanently?')) return; await supabase.from('lf_investor_leads').delete().eq('id', id); load(); }
  async function updateStage(id: string, stage: string) { await supabase.from('lf_investor_leads').update({ stage, updated_at: new Date().toISOString() }).eq('id', id); load(); }

  const filtered = items.filter(i => { if (stageFilter && g(i,'stage') !== stageFilter) return false; if (!search) return true; const q = search.toLowerCase(); return g(i,'name').toLowerCase().includes(q) || g(i,'email').toLowerCase().includes(q) || g(i,'company').toLowerCase().includes(q); });
  const stageCounts = STAGES.reduce((acc, s) => { acc[s] = items.filter(i => g(i,'stage') === s).length; return acc; }, {} as Record<string,number>);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="font-display text-2xl font-bold text-brand-forest">Investor Leads</h1><p className="text-sm font-body text-gray-400 mt-1">{items.length} leads &middot; Track investor inquiries and pipeline</p></div><button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold hover:bg-brand-forest/90"><Plus className="w-4 h-4" /> Add Lead</button></div>
      <div className="grid grid-cols-6 gap-2">{STAGES.map(s => (<button key={s} onClick={() => setStageFilter(stageFilter === s ? '' : s)} className={`bg-white rounded-xl border p-3 text-center transition-all ${stageFilter === s ? 'ring-2 ring-brand-sage' : ''}`}><div className="text-xl font-display font-bold text-brand-forest">{stageCounts[s] || 0}</div><p className="text-[10px] text-gray-400 uppercase font-body font-semibold">{fmt(s)}</p></button>))}</div>
      <div className="flex gap-3"><div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, or company..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-brand-sage" /></div><select value={stageFilter} onChange={e => setStageFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-body"><option value="">All Stages</option>{STAGES.map(s => <option key={s} value={s}>{fmt(s)}</option>)}</select></div>
      <div className="space-y-3">{filtered.length === 0 ? (<div className="text-center py-16 bg-white rounded-xl border"><TrendingUp className="w-10 h-10 text-gray-200 mx-auto mb-3" /><p className="text-gray-400 font-body">No investor leads found</p></div>) : filtered.map(item => (<div key={g(item,'id')} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50/50 transition-colors" onClick={() => setExpandedId(expandedId === g(item,'id') ? null : g(item,'id'))}>
          <div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><h3 className="font-display text-base font-semibold text-brand-forest truncate">{g(item,'name')}</h3><span className={`px-2 py-0.5 text-[10px] rounded-full font-semibold uppercase ${STAGE_COLORS[g(item,'stage')] || 'bg-gray-100 text-gray-500'}`}>{g(item,'stage')}</span></div><div className="flex items-center gap-3 text-xs text-gray-400 font-body">{g(item,'company') && <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{g(item,'company')}</span>}{g(item,'email') && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{g(item,'email')}</span>}{g(item,'investment_range') && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{g(item,'investment_range')}</span>}</div></div>
          <div className="flex items-center gap-1 shrink-0"><button onClick={e => { e.stopPropagation(); openEdit(item); }} className="p-1.5 text-gray-300 hover:text-brand-forest hover:bg-gray-100 rounded-lg"><Pencil className="w-4 h-4" /></button><button onClick={e => { e.stopPropagation(); del(g(item,'id')); }} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button><ChevronDown className={`w-4 h-4 text-gray-300 transition-transform ${expandedId === g(item,'id') ? 'rotate-180' : ''}`} /></div>
        </div>
        {expandedId === g(item,'id') && (<div className="border-t border-gray-100 p-4 bg-gray-50/30 space-y-3"><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-body"><div><span className="text-gray-400 uppercase tracking-wider">Phone</span><p className="text-brand-forest font-semibold mt-0.5">{g(item,'phone') || '\u2014'}</p></div><div><span className="text-gray-400 uppercase tracking-wider">Interest Area</span><p className="text-brand-forest font-semibold mt-0.5">{g(item,'interest_area') || '\u2014'}</p></div><div><span className="text-gray-400 uppercase tracking-wider">Investment Range</span><p className="text-brand-forest font-semibold mt-0.5">{g(item,'investment_range') || '\u2014'}</p></div><div><span className="text-gray-400 uppercase tracking-wider">Source</span><p className="text-brand-forest font-semibold mt-0.5">{g(item,'source') || '\u2014'}</p></div></div>{g(item,'notes') && <div><span className="text-xs text-gray-400 uppercase tracking-wider font-body">Notes</span><p className="text-sm text-gray-600 font-body mt-1 whitespace-pre-wrap">{g(item,'notes')}</p></div>}<div className="flex items-center gap-2 pt-2"><span className="text-xs text-gray-400 font-body">Move to:</span>{STAGES.filter(s => s !== g(item,'stage')).map(s => (<button key={s} onClick={() => updateStage(g(item,'id'), s)} className={`px-2 py-1 text-[10px] rounded-full font-semibold ${STAGE_COLORS[s]} hover:opacity-80 transition-opacity`}>{fmt(s)}</button>))}</div></div>)}
      </div>))}</div>
      {showForm && (<div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}><div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}><div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10"><h2 className="font-display text-lg font-semibold text-brand-forest">{editing ? 'Edit' : 'Add'} Investor Lead</h2><button onClick={() => setShowForm(false)} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div>
        <form onSubmit={save} className="p-5 space-y-4"><div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Full Name *</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-portal" placeholder="John Smith" /></div>
          <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-portal" /></div>
          <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Phone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-portal" /></div>
          <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Company</label><input value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="input-portal" /></div>
          <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Stage</label><select value={form.stage} onChange={e => setForm({...form, stage: e.target.value})} className="input-portal">{STAGES.map(s => <option key={s} value={s}>{fmt(s)}</option>)}</select></div>
          <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Interest Area</label><select value={form.interest_area} onChange={e => setForm({...form, interest_area: e.target.value})} className="input-portal"><option value="">Select...</option><option value="residential">Residential</option><option value="commercial">Commercial</option><option value="mixed_use">Mixed Use</option><option value="infrastructure">Infrastructure</option><option value="land">Land</option><option value="other">Other</option></select></div>
          <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Investment Range</label><select value={form.investment_range} onChange={e => setForm({...form, investment_range: e.target.value})} className="input-portal"><option value="">Select...</option><option value="$10K-$50K">$10K - $50K</option><option value="$50K-$100K">$50K - $100K</option><option value="$100K-$250K">$100K - $250K</option><option value="$250K-$500K">$250K - $500K</option><option value="$500K-$1M">$500K - $1M</option><option value="$1M+">$1M+</option></select></div>
          <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Source</label><select value={form.source} onChange={e => setForm({...form, source: e.target.value})} className="input-portal"><option value="">Select...</option><option value="website">Website</option><option value="referral">Referral</option><option value="event">Event</option><option value="cold_outreach">Cold Outreach</option><option value="social_media">Social Media</option><option value="other">Other</option></select></div>
          <div className="sm:col-span-2"><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Notes</label><textarea rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-portal resize-none" placeholder="Investment interests, timeline, follow-up notes..." /></div>
        </div><div className="flex gap-3 pt-2"><button type="submit" disabled={saving} className="px-6 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold hover:bg-brand-forest/90 disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Update Lead' : 'Add Lead'}</button><button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-gray-200 text-gray-500 rounded-lg text-sm font-body hover:bg-gray-50">Cancel</button></div></form></div></div>)}
    </div>
  );
}
