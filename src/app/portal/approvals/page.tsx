'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Eye, X, CheckCircle, XCircle, ArrowRight, Briefcase, Building2, Wrench, Warehouse, Users, FileText, Download } from 'lucide-react';

// UPGRADED: Approval dashboard now shows ALL submissions — accounts, jobs, AND applications (employee, employer, provider, space)
// With ability to approve and route to correct section
type R = Record<string,unknown>;
const g = (r:R,k:string):string => (r[k] as string)||'';
const fmt = (s: string) => (s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const TYPE_ICONS: Record<string, any> = { employee: Users, employer: Building2, provider: Wrench, space_rental: Warehouse };
const TYPE_COLORS: Record<string, string> = { employee: 'bg-blue-50 text-blue-700', employer: 'bg-green-50 text-green-700', provider: 'bg-purple-50 text-purple-700', space_rental: 'bg-amber-50 text-amber-700' };

export default function ApprovalsPage() {
  const [tab, setTab] = useState<'all'|'accounts'|'jobs'|'applications'>('all');
  const [accounts, setAccounts] = useState<R[]>([]);
  const [jobs, setJobs] = useState<R[]>([]);
  const [applications, setApplications] = useState<R[]>([]);
  const [detail, setDetail] = useState<R|null>(null);
  const [detailType, setDetailType] = useState<'account'|'job'|'application'>('account');
  const [editNotes, setEditNotes] = useState('');
  const [moveTarget, setMoveTarget] = useState('');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { loadAll(); }, []);
  async function loadAll() {
    const { data: a } = await supabase.from('lf_profiles').select('*').in('account_status', ['pending','suspended']).order('created_at', { ascending: false });
    setAccounts(a||[]);
    const { data: j } = await supabase.from('lf_jobs').select('*').eq('approval_status', 'pending').order('created_at', { ascending: false });
    setJobs(j||[]);
    const { data: apps } = await supabase.from('lf_applications').select('*').eq('status', 'submitted').order('created_at', { ascending: false });
    setApplications(apps||[]);
    setLoading(false);
  }

  const approveAccount = async (id: string) => { await supabase.from('lf_profiles').update({ account_status: 'approved' }).eq('id', id); loadAll(); };
  const rejectAccount = async (id: string) => { await supabase.from('lf_profiles').update({ account_status: 'rejected' }).eq('id', id); loadAll(); };
  const approveJob = async (id: string) => { await supabase.from('lf_jobs').update({ approval_status: 'approved', status: 'published' }).eq('id', id); setDetail(null); loadAll(); };
  const rejectJob = async (id: string) => { await supabase.from('lf_jobs').update({ approval_status: 'rejected' }).eq('id', id); setDetail(null); loadAll(); };

  const approveApp = async (id: string) => {
    await supabase.from('lf_applications').update({ status: 'reviewing', notes: editNotes || null }).eq('id', id);
    // If moveTarget specified, create record in that table
    const app = applications.find(a => g(a, 'id') === id);
    if (app && moveTarget === 'businesses') {
      await supabase.from('lf_businesses').insert({ name: g(app, 'applicant_name'), contact_email: g(app, 'applicant_email'), contact_phone: g(app, 'applicant_phone'), address: g(app, 'address'), description: g(app, 'cover_letter'), status: 'active' });
    } else if (app && moveTarget === 'services') {
      await supabase.from('lf_services').insert({ name: g(app, 'applicant_name'), contact_email: g(app, 'applicant_email'), contact_phone: g(app, 'applicant_phone'), address: g(app, 'address'), description: g(app, 'cover_letter'), status: 'active' });
    }
    setDetail(null); setMoveTarget(''); setEditNotes(''); loadAll();
  };
  const rejectApp = async (id: string) => { await supabase.from('lf_applications').update({ status: 'rejected', notes: editNotes || null }).eq('id', id); setDetail(null); setEditNotes(''); loadAll(); };

  const total = accounts.length + jobs.length + applications.length;

  const tabs = [
    { key: 'all' as const, label: 'All Pending', count: total },
    { key: 'applications' as const, label: 'Applications', count: applications.length },
    { key: 'jobs' as const, label: 'Jobs', count: jobs.length },
    { key: 'accounts' as const, label: 'Accounts', count: accounts.length },
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  const showAccounts = tab === 'all' || tab === 'accounts';
  const showJobs = tab === 'all' || tab === 'jobs';
  const showApps = tab === 'all' || tab === 'applications';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-bold text-brand-forest">Approval Dashboard</h1><p className="text-sm font-body text-gray-400">Review all pending submissions — applications, jobs, accounts</p></div>
        {total > 0 && <span className="px-3 py-1.5 bg-red-50 text-red-600 text-sm font-semibold rounded-full">{total} pending</span>}
      </div>

      <div className="flex gap-2">{tabs.map(t => (<button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-lg text-sm font-body font-semibold transition-colors ${tab === t.key ? 'bg-brand-forest text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t.label} ({t.count})</button>))}</div>

      {total === 0 && <div className="bg-white rounded-xl border p-12 text-center"><CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" /><p className="text-gray-400 font-body">All caught up! No pending items.</p></div>}

      {/* APPLICATIONS */}
      {showApps && applications.length > 0 && (
        <div>
          <h2 className="text-sm font-body font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2"><FileText className="w-4 h-4" /> Applications ({applications.length})</h2>
          <div className="bg-white rounded-xl border overflow-hidden"><div className="divide-y divide-gray-50">
            {applications.map(a => {
              const appType = g(a, 'application_type') || 'employee';
              const Icon = TYPE_ICONS[appType] || Users;
              return (
                <div key={g(a,'id')} className="p-4 flex items-center gap-4 hover:bg-gray-50/50">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0"><Icon className="w-5 h-5 text-gray-400" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5"><p className="text-sm font-body font-semibold text-brand-forest truncate">{g(a,'applicant_name') || 'Unknown'}</p><span className={`px-2 py-0.5 text-[9px] font-semibold rounded-full ${TYPE_COLORS[appType] || 'bg-gray-100 text-gray-500'}`}>{fmt(appType)}</span></div>
                    <p className="text-xs text-gray-400 font-body truncate">{g(a,'applicant_email')} &middot; {g(a,'address') || 'No address'}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => { setDetail(a); setDetailType('application'); setEditNotes(''); setMoveTarget(''); }} className="p-1.5 text-gray-300 hover:text-brand-forest hover:bg-gray-100 rounded-lg"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => approveApp(g(a,'id'))} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100">Approve</button>
                    <button onClick={() => rejectApp(g(a,'id'))} className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-100">Reject</button>
                  </div>
                </div>
              );
            })}
          </div></div>
        </div>
      )}

      {/* JOBS */}
      {showJobs && jobs.length > 0 && (
        <div>
          <h2 className="text-sm font-body font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Jobs ({jobs.length})</h2>
          <div className="bg-white rounded-xl border overflow-hidden"><div className="divide-y divide-gray-50">
            {jobs.map(j => (
              <div key={g(j,'id')} className="p-4 flex items-center gap-4 hover:bg-gray-50/50">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0"><Briefcase className="w-5 h-5 text-blue-400" /></div>
                <div className="flex-1"><p className="text-sm font-body font-semibold text-brand-forest">{g(j,'title')}</p><p className="text-xs text-gray-400 font-body">{g(j,'company_name')} &middot; {fmt(g(j,'job_type'))}</p></div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => { setDetail(j); setDetailType('job'); setEditNotes(''); }} className="p-1.5 text-gray-300 hover:text-brand-forest hover:bg-gray-100 rounded-lg"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => approveJob(g(j,'id'))} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-semibold">Approve</button>
                  <button onClick={() => rejectJob(g(j,'id'))} className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-semibold">Reject</button>
                </div>
              </div>
            ))}
          </div></div>
        </div>
      )}

      {/* ACCOUNTS */}
      {showAccounts && accounts.length > 0 && (
        <div>
          <h2 className="text-sm font-body font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Users className="w-4 h-4" /> Accounts ({accounts.length})</h2>
          <div className="bg-white rounded-xl border overflow-hidden"><div className="divide-y divide-gray-50">
            {accounts.map(a => (
              <div key={g(a,'id')} className="p-4 flex items-center gap-4 hover:bg-gray-50/50">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0"><Users className="w-5 h-5 text-amber-400" /></div>
                <div className="flex-1"><p className="text-sm font-body font-semibold text-brand-forest">{g(a,'full_name') || g(a,'email')}</p><p className="text-xs text-gray-400 font-body">{g(a,'email')} &middot; {g(a,'role')} / {g(a,'portal_type')}</p></div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => approveAccount(g(a,'id'))} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-semibold">Approve</button>
                  <button onClick={() => rejectAccount(g(a,'id'))} className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-semibold">Reject</button>
                </div>
              </div>
            ))}
          </div></div>
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-brand-forest">
                {detailType === 'application' ? `Review: ${g(detail, 'applicant_name')}` : `Review: ${g(detail, 'title')}`}
              </h2>
              <button onClick={() => setDetail(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            {detailType === 'application' && (
              <div className="space-y-4">
                <div className="flex gap-2"><span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${TYPE_COLORS[g(detail,'application_type')] || ''}`}>{fmt(g(detail,'application_type'))}</span></div>
                <div className="grid grid-cols-2 gap-3 text-sm font-body">
                  <div><strong className="text-gray-400 text-xs uppercase">Name</strong><p className="text-brand-forest">{g(detail,'applicant_name')}</p></div>
                  <div><strong className="text-gray-400 text-xs uppercase">Email</strong><p>{g(detail,'applicant_email')}</p></div>
                  <div><strong className="text-gray-400 text-xs uppercase">Phone</strong><p>{g(detail,'applicant_phone') || '\u2014'}</p></div>
                  <div><strong className="text-gray-400 text-xs uppercase">Address</strong><p>{g(detail,'address') || '\u2014'}</p></div>
                </div>
                {g(detail,'cover_letter') && <div><strong className="text-gray-400 text-xs uppercase block mb-1">Application Details</strong><p className="text-sm font-body text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{g(detail,'cover_letter')}</p></div>}
                <div><label className="text-xs font-semibold uppercase block mb-1 text-gray-400">Move to section after approval</label>
                  <select value={moveTarget} onChange={e => setMoveTarget(e.target.value)} className="input-portal text-sm">
                    <option value="">Keep as application only</option>
                    <option value="businesses">Move to Businesses</option>
                    <option value="services">Move to Services</option>
                  </select>
                </div>
                <div><label className="text-xs font-semibold uppercase block mb-1 text-gray-400">Admin Notes</label><textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={2} className="input-portal" placeholder="Optional notes..." /></div>
              </div>
            )}

            {detailType === 'job' && (
              <div className="space-y-3 text-sm font-body">
                <div className="grid grid-cols-2 gap-3"><div><strong>Category:</strong> {g(detail,'category')}</div><div><strong>Job Type:</strong> {fmt(g(detail,'job_type'))}</div><div><strong>Salary:</strong> {g(detail,'salary_range')}</div><div><strong>Work Mode:</strong> {fmt(g(detail,'work_mode'))}</div></div>
                {g(detail,'description') && <div><strong>Description:</strong><p className="text-gray-600 mt-1 whitespace-pre-wrap">{g(detail,'description')}</p></div>}
                {g(detail,'requirements') && <div><strong>Requirements:</strong><p className="text-gray-600 mt-1">{g(detail,'requirements')}</p></div>}
                <div><label className="text-xs font-semibold uppercase block mb-1">Admin Notes</label><textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={2} className="input-portal" /></div>
              </div>
            )}

            <div className="flex gap-2 mt-6">
              {detailType === 'application' ? (
                <><button onClick={() => approveApp(g(detail,'id'))} className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold">Approve{moveTarget ? ` & Move to ${fmt(moveTarget)}` : ''}</button><button onClick={() => rejectApp(g(detail,'id'))} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold">Reject</button></>
              ) : (
                <><button onClick={() => approveJob(g(detail,'id'))} className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold">Approve & Publish</button><button onClick={() => rejectJob(g(detail,'id'))} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold">Reject</button></>
              )}
              <button onClick={() => setDetail(null)} className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
