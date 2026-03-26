'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ScrollText, Search, ChevronDown, RefreshCw, Filter } from 'lucide-react';

type R = Record<string, unknown>;
const g = (r: R, k: string): string => (r[k] as string) || '';

const ACTION_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  // Auth
  login: { label: 'Login', color: 'bg-blue-50 text-blue-700', icon: '🔑' },
  logout: { label: 'Logout', color: 'bg-gray-100 text-gray-600', icon: '🚪' },
  signup: { label: 'Signup', color: 'bg-green-50 text-green-700', icon: '👤' },
  password_set: { label: 'Password Set', color: 'bg-green-50 text-green-700', icon: '🔒' },
  // Invitations
  invitation_sent: { label: 'Invite Sent', color: 'bg-blue-50 text-blue-700', icon: '📧' },
  invitation_accepted: { label: 'Invite Accepted', color: 'bg-green-50 text-green-700', icon: '✅' },
  invitation_revoked: { label: 'Invite Revoked', color: 'bg-red-50 text-red-600', icon: '❌' },
  // Jobs
  job_created: { label: 'Job Created', color: 'bg-green-50 text-green-700', icon: '💼' },
  job_updated: { label: 'Job Updated', color: 'bg-blue-50 text-blue-700', icon: '💼' },
  job_deleted: { label: 'Job Deleted', color: 'bg-red-50 text-red-600', icon: '💼' },
  job_published: { label: 'Job Published', color: 'bg-green-50 text-green-700', icon: '📢' },
  job_draft: { label: 'Job → Draft', color: 'bg-amber-50 text-amber-700', icon: '📝' },
  job_closed: { label: 'Job Closed', color: 'bg-gray-100 text-gray-600', icon: '🔒' },
  // Biz Opp
  biz_opp_created: { label: 'Opportunity Created', color: 'bg-green-50 text-green-700', icon: '🏪' },
  biz_opp_updated: { label: 'Opportunity Updated', color: 'bg-blue-50 text-blue-700', icon: '🏪' },
  biz_opp_deleted: { label: 'Opportunity Deleted', color: 'bg-red-50 text-red-600', icon: '🏪' },
  // Directory
  directory_created: { label: 'Directory Added', color: 'bg-green-50 text-green-700', icon: '📖' },
  directory_updated: { label: 'Directory Updated', color: 'bg-blue-50 text-blue-700', icon: '📖' },
  directory_deleted: { label: 'Directory Removed', color: 'bg-red-50 text-red-600', icon: '📖' },
  // Biz Apps
  biz_app_submitted: { label: 'App Submitted', color: 'bg-blue-50 text-blue-700', icon: '📋' },
  biz_app_approved: { label: 'App Approved', color: 'bg-green-50 text-green-700', icon: '✅' },
  biz_app_rejected: { label: 'App Rejected', color: 'bg-red-50 text-red-600', icon: '❌' },
  // Users
  user_updated: { label: 'User Updated', color: 'bg-blue-50 text-blue-700', icon: '👤' },
  user_suspended: { label: 'User Suspended', color: 'bg-red-50 text-red-600', icon: '🚫' },
  user_reactivated: { label: 'User Reactivated', color: 'bg-green-50 text-green-700', icon: '✅' },
  user_deleted: { label: 'User Deleted', color: 'bg-red-50 text-red-600', icon: '🗑️' },
  // Approvals
  approval_approved: { label: 'Approved', color: 'bg-green-50 text-green-700', icon: '✅' },
  approval_rejected: { label: 'Rejected', color: 'bg-red-50 text-red-600', icon: '❌' },
  // Settings
  settings_updated: { label: 'Settings Changed', color: 'bg-amber-50 text-amber-700', icon: '⚙️' },
  visibility_changed: { label: 'Visibility Changed', color: 'bg-amber-50 text-amber-700', icon: '👁️' },
  // Impersonation
  impersonation_started: { label: 'Impersonation', color: 'bg-amber-50 text-amber-700', icon: '🎭' },
};

const ENTITY_FILTERS = [
  { value: '', label: 'All Types' },
  { value: 'job', label: 'Jobs' },
  { value: 'business_opportunity', label: 'Business Opportunities' },
  { value: 'directory', label: 'Directory' },
  { value: 'invitation', label: 'Invitations' },
  { value: 'user', label: 'Users' },
  { value: 'session', label: 'Auth / Sessions' },
  { value: 'business_application', label: 'Business Apps' },
  { value: 'setting', label: 'Settings' },
];

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<R[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [limit, setLimit] = useState(100);
  const supabase = createClient();

  useEffect(() => { load(); }, [entityFilter, limit]);

  async function load() {
    setLoading(true);
    let query = supabase.from('lf_audit_log').select('*, actor:lf_profiles!lf_audit_log_user_id_fkey(full_name, email, role)').order('created_at', { ascending: false }).limit(limit);
    if (entityFilter) query = query.eq('entity_type', entityFilter);
    const { data } = await query;
    setLogs(data || []);
    setLoading(false);
  }

  const filtered = logs.filter(l => {
    if (!search) return true;
    const s = search.toLowerCase();
    const actor = (l.actor as R) || {};
    const details = l.details ? JSON.stringify(l.details).toLowerCase() : '';
    return (
      g(l, 'action').toLowerCase().includes(s) ||
      g(l, 'entity_type').toLowerCase().includes(s) ||
      g(actor, 'full_name').toLowerCase().includes(s) ||
      g(actor, 'email').toLowerCase().includes(s) ||
      details.includes(s)
    );
  });

  const getActionConfig = (action: string) => ACTION_CONFIG[action] || { label: action.replace(/_/g, ' '), color: 'bg-gray-100 text-gray-600', icon: '📋' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-forest">Activity Log</h1>
          <p className="text-sm font-body text-gray-500 mt-1">Every action taken by every user — invites, edits, approvals, logins, and more</p>
        </div>
        <button onClick={() => load()} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-body text-gray-500 hover:bg-gray-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search actions, users, details..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-brand-sage" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select value={entityFilter} onChange={e => setEntityFilter(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-brand-sage bg-white">
            {ENTITY_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
      </div>

      <div className="text-xs font-body text-gray-400 mb-3">{filtered.length} entries{entityFilter ? ` (filtered: ${entityFilter})` : ''}</div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border"><ScrollText className="w-10 h-10 text-gray-200 mx-auto mb-3" /><p className="text-gray-400 font-body">No activity found</p></div>
      ) : (
        <div className="space-y-2">
          {filtered.map(l => {
            const actor = (l.actor as R) || {};
            const ac = getActionConfig(g(l, 'action'));
            const isExpanded = expandedId === g(l, 'id');
            const details = l.details as Record<string, any> | null;
            const hasDetails = details && Object.keys(details).length > 0;

            return (
              <div key={g(l, 'id')} className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:border-gray-200 transition-colors">
                <div className={`p-3 flex items-center gap-3 ${hasDetails ? 'cursor-pointer' : ''}`} onClick={() => hasDetails && setExpandedId(isExpanded ? null : g(l, 'id'))}>
                  <span className="text-lg shrink-0 w-8 text-center">{ac.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 text-[11px] rounded font-semibold ${ac.color}`}>{ac.label}</span>
                      {g(l, 'entity_type') && <span className="px-1.5 py-0.5 text-[10px] rounded bg-gray-50 text-gray-400 font-body uppercase">{g(l, 'entity_type')}</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs font-body text-gray-400">
                      <span className="font-medium text-gray-600">{g(actor, 'full_name') || g(actor, 'email') || 'System'}</span>
                      {g(actor, 'role') && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50">{g(actor, 'role')}</span>}
                      <span>&middot;</span>
                      <span>{timeAgo(g(l, 'created_at'))}</span>
                      {g(l, 'entity_id') && <><span>&middot;</span><span className="font-mono text-[10px]">{g(l, 'entity_id').slice(0, 8)}</span></>}
                    </div>
                  </div>
                  {hasDetails && <ChevronDown className={`w-4 h-4 text-gray-300 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />}
                </div>

                {isExpanded && details && (
                  <div className="border-t border-gray-100 bg-gray-50/50 p-3">
                    <div className="grid gap-1.5 text-xs font-body">
                      {Object.entries(details).map(([key, val]) => (
                        <div key={key} className="flex gap-2">
                          <span className="text-gray-400 font-medium shrink-0 w-32">{key.replace(/_/g, ' ')}</span>
                          <span className="text-gray-600 break-all">
                            {Array.isArray(val) ? val.join(', ') : typeof val === 'object' ? JSON.stringify(val) : String(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] font-body text-gray-300">
                      Full timestamp: {new Date(g(l, 'created_at')).toLocaleString()} &middot; ID: {g(l, 'id')}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {filtered.length >= limit && (
        <div className="text-center mt-4">
          <button onClick={() => setLimit(prev => prev + 100)} className="px-4 py-2 text-sm font-body text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
