'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserPlus, Mail, Shield, CheckCircle, Clock, XCircle, Copy, Send, Eye, ArrowLeft, X } from 'lucide-react';

const ALL_PERMISSIONS = [
  'jobs.view','jobs.create','jobs.edit','jobs.delete','jobs.publish',
  'services.view','services.create','services.edit','services.delete',
  'spaces.view','spaces.create','spaces.edit','spaces.delete',
  'businesses.view','businesses.create','businesses.edit','businesses.delete',
  'users.view','users.invite','users.edit','users.disable',
  'permissions.manage','settings.manage',
  'applications.view','applications.manage',
  'investors.view','investors.manage',
  'content.view','content.edit','content.publish',
  'dashboard.view','audit.view',
];

const ROLE_PRESETS: Record<string, string[]> = {
  admin: ALL_PERMISSIONS,
  employer: ['jobs.view','jobs.create','jobs.edit','applications.view','businesses.view','dashboard.view'],
  staff: ['jobs.view','applications.view','businesses.view','services.view','spaces.view','dashboard.view'],
  applicant: ['dashboard.view'],
};

export default function UsersPage() {
  const [users, setUsers] = useState<Array<Record<string, unknown>>>([]);
  const [invitations, setInvitations] = useState<Array<Record<string, unknown>>>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('employer');
  const [invitePortal, setInvitePortal] = useState('employer');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<{url?:string;error?:string}|null>(null);
  const [impersonating, setImpersonating] = useState<Record<string, unknown>|null>(null);
  const supabase = createClient();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data: u } = await supabase.from('lf_profiles').select('*').order('created_at', { ascending: false });
    setUsers(u || []);
    const { data: i } = await supabase.from('lf_invitations').select('*').order('created_at', { ascending: false });
    setInvitations(i || []);
  }

  const handleRoleChange = (role: string) => {
    setInviteRole(role);
    setInvitePortal(role === 'admin' || role === 'super_admin' ? 'admin' : role === 'employer' ? 'employer' : 'applicant');
    setSelectedPerms(ROLE_PRESETS[role] || []);
  };

  const handleInvite = async () => {
    setInviteLoading(true); setInviteResult(null);
    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole, portal_type: invitePortal, full_name: inviteName, permissions: selectedPerms }),
      });
      const data = await res.json();
      if (data.success) { setInviteResult({ url: data.setPasswordUrl }); loadData(); }
      else setInviteResult({ error: data.error || 'Failed to create invitation' });
    } catch { setInviteResult({ error: 'Failed to create invitation' }); }
    finally { setInviteLoading(false); }
  };

  const togglePerm = (p: string) => setSelectedPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const statusIcon = (s: string) => s === 'approved' ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : s === 'pending' ? <Clock className="w-3.5 h-3.5 text-amber-500" /> : <XCircle className="w-3.5 h-3.5 text-red-500" />;

  const getPortalPreview = (u: Record<string, unknown>) => {
    const portal = u.portal_type as string;
    const role = u.role as string;
    if (['super_admin','admin'].includes(role)) return '/portal/dashboard';
    if (portal === 'employer') return '/employer/dashboard';
    return '/applicant/dashboard';
  };

  return (
    <div>
      {/* Impersonation Banner */}
      {impersonating && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-body font-semibold">
            <Eye className="w-4 h-4" />
            Viewing as: {impersonating.full_name as string || impersonating.email as string} ({impersonating.role as string} / {impersonating.portal_type as string})
          </div>
          <button onClick={() => setImpersonating(null)} className="flex items-center gap-1 text-sm font-body bg-white/20 hover:bg-white/30 px-3 py-1 rounded">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin
          </button>
        </div>
      )}

      {/* Impersonation View */}
      {impersonating && (
        <div className="fixed inset-0 z-[90] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b bg-amber-50">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="font-display font-bold text-brand-forest">Viewing as {impersonating.full_name as string || impersonating.email as string}</h3>
                  <p className="text-xs text-brand-muted font-body">Role: {impersonating.role as string} | Portal: {impersonating.portal_type as string} | This shows what this user would see</p>
                </div>
              </div>
              <button onClick={() => setImpersonating(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe src={getPortalPreview(impersonating)} className="w-full h-full border-0" title={`Preview as ${impersonating.email as string}`} />
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl font-bold text-brand-forest">Users & Access</h1><p className="text-sm font-body text-brand-muted">Manage team members, roles, and permissions</p></div>
        <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 px-4 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold hover:bg-brand-forest/90 transition-colors"><UserPlus className="w-4 h-4" />Invite User</button>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="font-display text-xl font-bold text-brand-forest mb-4">Invite New User</h2>
            {inviteResult?.url ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-body text-green-800 font-semibold mb-2">Invitation Created!</p>
                  <p className="text-xs font-body text-green-700 mb-3">Send this link to <strong>{inviteEmail}</strong>. They will set their password and gain access.</p>
                  <div className="flex items-center gap-2 bg-white p-2 rounded border">
                    <input type="text" value={inviteResult.url} readOnly className="flex-1 text-xs font-mono text-brand-text outline-none" />
                    <button onClick={() => navigator.clipboard.writeText(inviteResult.url!)} className="p-1 text-brand-sage hover:text-brand-forest"><Copy className="w-4 h-4" /></button>
                  </div>
                </div>
                <button onClick={() => { setShowInvite(false); setInviteResult(null); setInviteEmail(''); setInviteName(''); }} className="w-full py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold">Done</button>
              </div>
            ) : (
              <div className="space-y-4">
                {inviteResult?.error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{inviteResult.error}</div>}
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs font-body font-semibold uppercase tracking-wider block mb-1">Full Name</label><input type="text" value={inviteName} onChange={e => setInviteName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" placeholder="John Doe" /></div>
                  <div><label className="text-xs font-body font-semibold uppercase tracking-wider block mb-1">Email</label><input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" placeholder="user@email.com" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs font-body font-semibold uppercase tracking-wider block mb-1">Role</label>
                    <select value={inviteRole} onChange={e => handleRoleChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body">
                      <option value="admin">Admin</option><option value="employer">Employer</option><option value="staff">Staff</option><option value="applicant">Applicant</option>
                    </select></div>
                  <div><label className="text-xs font-body font-semibold uppercase tracking-wider block mb-1">Portal Type</label>
                    <select value={invitePortal} onChange={e => setInvitePortal(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body">
                      <option value="admin">Admin Portal (Full Backend)</option><option value="employer">Employer Portal</option><option value="applicant">Applicant Portal</option>
                    </select></div>
                </div>
                <div><label className="text-xs font-body font-semibold uppercase tracking-wider block mb-2">Permissions</label>
                  <div className="grid grid-cols-3 gap-1 max-h-48 overflow-y-auto border rounded p-3">
                    {ALL_PERMISSIONS.map(p => (
                      <label key={p} className="flex items-center gap-1.5 text-[11px] font-body cursor-pointer">
                        <input type="checkbox" checked={selectedPerms.includes(p)} onChange={() => togglePerm(p)} className="rounded border-gray-300" />{p}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setShowInvite(false); setInviteResult(null); }} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-body font-semibold text-brand-muted hover:bg-gray-50">Cancel</button>
                  <button onClick={handleInvite} disabled={inviteLoading || !inviteEmail || !inviteRole} className="flex-1 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold hover:bg-brand-forest/90 disabled:opacity-50 flex items-center justify-center gap-2">
                    {inviteLoading ? 'Creating...' : <><Send className="w-4 h-4" />Create Invitation</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-display font-semibold text-brand-forest mb-4 flex items-center gap-2"><Shield className="w-4 h-4" />Active Users</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead><tr className="text-left text-xs text-brand-muted uppercase tracking-wider border-b">
              <th className="pb-3 pr-4">User</th><th className="pb-3 pr-4">Role</th><th className="pb-3 pr-4">Portal</th><th className="pb-3 pr-4">Status</th><th className="pb-3 pr-4">Password</th><th className="pb-3">Actions</th>
            </tr></thead>
            <tbody>{users.map((u: Record<string, unknown>) => (
              <tr key={u.id as string} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 pr-4"><div className="font-semibold text-brand-forest">{(u.full_name as string) || 'No name'}</div><div className="text-xs text-brand-muted">{u.email as string}</div></td>
                <td className="py-3 pr-4"><span className={`px-2 py-0.5 text-xs rounded font-semibold ${(u.role as string) === 'super_admin' ? 'bg-purple-50 text-purple-700' : (u.role as string) === 'admin' ? 'bg-blue-50 text-blue-700' : (u.role as string) === 'employer' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'}`}>{u.role as string}</span></td>
                <td className="py-3 pr-4 text-xs">{u.portal_type as string}</td>
                <td className="py-3 pr-4"><span className="flex items-center gap-1 text-xs">{statusIcon(u.account_status as string)}{u.account_status as string}</span></td>
                <td className="py-3 pr-4 text-xs">{(u.password_set as boolean) ? <span className="text-green-600">Set</span> : <span className="text-amber-600">Not set</span>}</td>
                <td className="py-3">
                  <button onClick={() => setImpersonating(u)} className="flex items-center gap-1 text-xs font-body text-brand-sage hover:text-brand-forest bg-brand-sage/10 hover:bg-brand-sage/20 px-2 py-1 rounded transition-colors" title="View portal as this user">
                    <Eye className="w-3 h-3" /> View as User
                  </button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>

      {/* Invitations List */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-display font-semibold text-brand-forest mb-4 flex items-center gap-2"><Mail className="w-4 h-4" />Invitations</h3>
        {invitations.length === 0 ? <p className="text-sm text-brand-muted font-body">No invitations sent yet.</p> : (
          <div className="space-y-3">{invitations.map((inv: Record<string, unknown>) => (
            <div key={inv.id as string} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div><div className="text-sm font-body font-semibold text-brand-forest">{inv.email as string}</div><div className="text-xs text-brand-muted">{inv.role as string} / {inv.portal_type as string}</div></div>
              <span className={`px-2 py-0.5 text-xs rounded font-body font-semibold ${(inv.status as string) === 'accepted' ? 'bg-green-50 text-green-700' : (inv.status as string) === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>{inv.status as string}</span>
            </div>
          ))}</div>
        )}
      </div>
    </div>
  );
}
