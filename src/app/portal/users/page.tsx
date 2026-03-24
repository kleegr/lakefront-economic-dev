'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserPlus, Mail, Shield, CheckCircle, Clock, XCircle, Copy, Send, Eye, Pencil, Trash2, Ban, RotateCcw, X } from 'lucide-react';

// ITEM 2: Added employee + provider roles to invite
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
  employee: ['jobs.view','applications.view','dashboard.view'],
  provider: ['services.view','services.create','services.edit','applications.view','dashboard.view'],
  staff: ['jobs.view','applications.view','businesses.view','services.view','spaces.view','dashboard.view'],
  applicant: ['dashboard.view'],
};

type User = Record<string, unknown>;
const str = (u: User, k: string): string => (u[k] as string) || '';
const bool = (u: User, k: string): boolean => u[k] as boolean || false;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<User[]>([]);
  const [tab, setTab] = useState<'all'|'admins'|'employers'|'employees'|'providers'|'invites'>('all');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('employer');
  const [invitePortal, setInvitePortal] = useState('employer');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<{url?:string;error?:string}|null>(null);
  const [editUser, setEditUser] = useState<User|null>(null);
  const [editRole, setEditRole] = useState('');
  const [editPortal, setEditPortal] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editName, setEditName] = useState('');
  const [impersonating, setImpersonating] = useState<User|null>(null);
  const [confirmDelete, setConfirmDelete] = useState<User|null>(null);
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
    setInvitePortal(role === 'admin' || role === 'super_admin' ? 'admin' : role === 'employer' ? 'employer' : role === 'employee' ? 'employee' : role === 'provider' ? 'provider' : 'applicant');
    setSelectedPerms(ROLE_PRESETS[role] || []);
  };

  const handleInvite = async () => {
    setInviteLoading(true); setInviteResult(null);
    try {
      const res = await fetch('/api/admin/invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: inviteEmail, role: inviteRole, portal_type: invitePortal, full_name: inviteName, permissions: selectedPerms }) });
      const data = await res.json();
      if (data.success) { setInviteResult({ url: data.setPasswordUrl }); loadData(); }
      else setInviteResult({ error: data.error || 'Failed' });
    } catch { setInviteResult({ error: 'Failed' }); }
    finally { setInviteLoading(false); }
  };

  const handleEditSave = async () => {
    if (!editUser) return;
    await supabase.from('lf_profiles').update({ role: editRole, portal_type: editPortal, account_status: editStatus, full_name: editName }).eq('id', str(editUser, 'id'));
    setEditUser(null); loadData();
  };

  const handleSuspend = async (u: User) => {
    const newStatus = str(u, 'account_status') === 'suspended' ? 'approved' : 'suspended';
    await supabase.from('lf_profiles').update({ account_status: newStatus }).eq('id', str(u, 'id'));
    loadData();
  };

  const handleDelete = async (u: User) => { await supabase.from('lf_profiles').delete().eq('id', str(u, 'id')); setConfirmDelete(null); loadData(); };
  const togglePerm = (p: string) => setSelectedPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const statusBadge = (s: string) => { const map: Record<string, { icon: React.ReactNode; cls: string }> = { approved: { icon: <CheckCircle className="w-3 h-3" />, cls: 'bg-green-50 text-green-700' }, pending: { icon: <Clock className="w-3 h-3" />, cls: 'bg-amber-50 text-amber-700' }, suspended: { icon: <Ban className="w-3 h-3" />, cls: 'bg-red-50 text-red-700' }, rejected: { icon: <XCircle className="w-3 h-3" />, cls: 'bg-gray-100 text-gray-500' } }; const m = map[s] || map.pending; return <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded font-semibold ${m.cls}`}>{m.icon}{s}</span>; };
  const roleBadge = (r: string) => { const cls = r === 'super_admin' ? 'bg-purple-50 text-purple-700' : r === 'admin' ? 'bg-blue-50 text-blue-700' : r === 'employer' ? 'bg-green-50 text-green-700' : r === 'employee' ? 'bg-cyan-50 text-cyan-700' : r === 'provider' ? 'bg-violet-50 text-violet-700' : r === 'staff' ? 'bg-teal-50 text-teal-700' : 'bg-gray-50 text-gray-600'; return <span className={`px-2 py-0.5 text-xs rounded font-semibold ${cls}`}>{r}</span>; };
  const getPortalPreview = (u: User) => { const role = str(u, 'role'); if (['super_admin','admin'].includes(role)) return '/portal/dashboard'; if (str(u, 'portal_type') === 'employer') return '/employer/dashboard'; return '/applicant/dashboard'; };

  const filteredUsers = tab === 'all' ? users : tab === 'admins' ? users.filter(u => ['super_admin','admin'].includes(str(u,'role'))) : tab === 'employers' ? users.filter(u => str(u,'role') === 'employer' || str(u,'portal_type') === 'employer') : tab === 'employees' ? users.filter(u => str(u,'role') === 'employee') : tab === 'providers' ? users.filter(u => str(u,'role') === 'provider') : users;

  return (
    <div>
      {impersonating && (<div className="fixed inset-0 z-[90] bg-black/60 flex items-center justify-center p-4"><div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col"><div className="flex items-center justify-between p-4 border-b bg-amber-50"><div className="flex items-center gap-3"><Eye className="w-5 h-5 text-amber-600" /><div><h3 className="font-display font-bold text-brand-forest">Viewing as {str(impersonating,'full_name') || str(impersonating,'email')}</h3><p className="text-xs text-brand-muted font-body">Role: {str(impersonating,'role')} | Portal: {str(impersonating,'portal_type')}</p></div></div><button onClick={() => setImpersonating(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button></div><div className="flex-1 overflow-hidden"><iframe src={getPortalPreview(impersonating)} className="w-full h-full border-0" title="Preview" /></div></div></div>)}

      {confirmDelete && (<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"><div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6"><h3 className="font-display font-bold text-red-600 mb-2">Delete User?</h3><p className="text-sm font-body text-brand-muted mb-4">Permanently remove <strong>{str(confirmDelete,'email')}</strong>?</p><div className="flex gap-3"><button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-body font-semibold">Cancel</button><button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-body font-semibold">Delete</button></div></div></div>)}

      {editUser && (<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"><div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6"><h2 className="font-display text-xl font-bold text-brand-forest mb-4">Edit User</h2><div className="space-y-3"><div><label className="text-xs font-body font-semibold uppercase tracking-wider block mb-1">Full Name</label><input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" /></div><div className="grid grid-cols-3 gap-3"><div><label className="text-xs font-body font-semibold uppercase tracking-wider block mb-1">Role</label><select value={editRole} onChange={e => setEditRole(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body"><option value="super_admin">Super Admin</option><option value="admin">Admin</option><option value="employer">Employer</option><option value="employee">Employee</option><option value="provider">Provider</option><option value="staff">Staff</option><option value="applicant">Applicant</option></select></div><div><label className="text-xs font-body font-semibold uppercase tracking-wider block mb-1">Portal</label><select value={editPortal} onChange={e => setEditPortal(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body"><option value="admin">Admin</option><option value="employer">Employer</option><option value="employee">Employee</option><option value="provider">Provider</option><option value="applicant">Applicant</option></select></div><div><label className="text-xs font-body font-semibold uppercase tracking-wider block mb-1">Status</label><select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body"><option value="approved">Approved</option><option value="pending">Pending</option><option value="suspended">Suspended</option><option value="rejected">Rejected</option></select></div></div></div><div className="flex gap-3 mt-6"><button onClick={() => setEditUser(null)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-body font-semibold">Cancel</button><button onClick={handleEditSave} className="flex-1 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold">Save</button></div></div></div>)}

      {showInvite && (<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"><div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"><h2 className="font-display text-xl font-bold text-brand-forest mb-1">Invite User</h2><p className="text-xs font-body text-brand-muted mb-4">Invite employers, employees, providers, or admin staff.</p>
        {inviteResult?.url ? (<div className="space-y-4"><div className="p-4 bg-green-50 border border-green-200 rounded-lg"><p className="text-sm font-body text-green-800 font-semibold mb-2">Invitation Created!</p><p className="text-xs font-body text-green-700 mb-3">Send this link to <strong>{inviteEmail}</strong>.</p><div className="flex items-center gap-2 bg-white p-2 rounded border"><input type="text" value={inviteResult.url} readOnly className="flex-1 text-xs font-mono text-brand-text outline-none" /><button onClick={() => navigator.clipboard.writeText(inviteResult.url!)} className="p-1 text-brand-sage hover:text-brand-forest"><Copy className="w-4 h-4" /></button></div></div><button onClick={() => { setShowInvite(false); setInviteResult(null); setInviteEmail(''); setInviteName(''); }} className="w-full py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold">Done</button></div>
        ) : (<div className="space-y-4">{inviteResult?.error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{inviteResult.error}</div>}<div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-body font-semibold uppercase tracking-wider block mb-1">Full Name</label><input type="text" value={inviteName} onChange={e => setInviteName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" /></div><div><label className="text-xs font-body font-semibold uppercase tracking-wider block mb-1">Email</label><input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" /></div></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-body font-semibold uppercase tracking-wider block mb-1">Role</label><select value={inviteRole} onChange={e => handleRoleChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body"><option value="admin">Admin</option><option value="employer">Employer / Business</option><option value="employee">Employee</option><option value="provider">Service Provider</option><option value="staff">Staff</option></select></div><div><label className="text-xs font-body font-semibold uppercase tracking-wider block mb-1">Portal Type</label><select value={invitePortal} onChange={e => setInvitePortal(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body"><option value="admin">Admin Portal</option><option value="employer">Employer Portal</option><option value="employee">Employee Portal</option><option value="provider">Provider Portal</option></select></div></div>
          <div><label className="text-xs font-body font-semibold uppercase tracking-wider block mb-2">Permissions</label><div className="grid grid-cols-3 gap-1 max-h-48 overflow-y-auto border rounded p-3">{ALL_PERMISSIONS.map(p => (<label key={p} className="flex items-center gap-1.5 text-[11px] font-body cursor-pointer"><input type="checkbox" checked={selectedPerms.includes(p)} onChange={() => togglePerm(p)} className="rounded border-gray-300" />{p}</label>))}</div></div>
          <div className="flex gap-3"><button onClick={() => { setShowInvite(false); setInviteResult(null); }} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-body font-semibold">Cancel</button><button onClick={handleInvite} disabled={inviteLoading || !inviteEmail} className="flex-1 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold disabled:opacity-50 flex items-center justify-center gap-2">{inviteLoading ? 'Creating...' : <><Send className="w-4 h-4" />Create Invitation</>}</button></div></div>)}
      </div></div>)}

      <div className="flex items-center justify-between mb-6"><div><h1 className="font-display text-2xl font-bold text-brand-forest">Users &amp; Access</h1><p className="text-sm font-body text-brand-muted">Manage users, invitations, and access control</p></div>
        <button onClick={() => { setShowInvite(true); handleRoleChange('employer'); }} className="flex items-center gap-2 px-4 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold hover:bg-brand-forest/90"><UserPlus className="w-4 h-4" />Invite User</button>
      </div>

      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1">{([{key:'all' as const,label:'All',count:users.length},{key:'admins' as const,label:'Admins',count:users.filter(u=>['super_admin','admin'].includes(str(u,'role'))).length},{key:'employers' as const,label:'Employers',count:users.filter(u=>str(u,'role')==='employer').length},{key:'employees' as const,label:'Employees',count:users.filter(u=>str(u,'role')==='employee').length},{key:'providers' as const,label:'Providers',count:users.filter(u=>str(u,'role')==='provider').length},{key:'invites' as const,label:'Invitations',count:invitations.length}]).map(t => (<button key={t.key} onClick={() => setTab(t.key)} className={`flex-1 px-3 py-2 rounded-md text-xs font-body font-semibold transition-colors ${tab === t.key ? 'bg-white text-brand-forest shadow-sm' : 'text-brand-muted hover:text-brand-forest'}`}>{t.label} <span className="ml-1 text-[10px] opacity-60">({t.count})</span></button>))}</div>

      {tab !== 'invites' ? (<div className="bg-white rounded-xl border border-gray-200 overflow-hidden"><table className="w-full text-sm font-body"><thead><tr className="text-left text-xs text-brand-muted uppercase tracking-wider border-b bg-gray-50"><th className="p-3">User</th><th className="p-3">Role</th><th className="p-3">Portal</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr></thead><tbody>{filteredUsers.length === 0 ? (<tr><td colSpan={5} className="p-8 text-center text-brand-muted">No users found</td></tr>) : filteredUsers.map((u: User) => (<tr key={str(u,'id')} className="border-b border-gray-100 hover:bg-gray-50/50"><td className="p-3"><div className="font-semibold text-brand-forest">{str(u,'full_name') || 'No name'}</div><div className="text-xs text-brand-muted">{str(u,'email')}</div></td><td className="p-3">{roleBadge(str(u,'role'))}</td><td className="p-3 text-xs font-body">{str(u,'portal_type')}</td><td className="p-3">{statusBadge(str(u,'account_status'))}</td><td className="p-3"><div className="flex items-center gap-1 justify-end"><button onClick={() => { setEditUser(u); setEditRole(str(u,'role')); setEditPortal(str(u,'portal_type')); setEditStatus(str(u,'account_status')); setEditName(str(u,'full_name')); }} className="p-1.5 text-gray-400 hover:text-brand-forest hover:bg-brand-sage/10 rounded"><Pencil className="w-3.5 h-3.5" /></button><button onClick={() => setImpersonating(u)} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded"><Eye className="w-3.5 h-3.5" /></button><button onClick={() => handleSuspend(u)} className={`p-1.5 rounded ${str(u,'account_status') === 'suspended' ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'}`}>{str(u,'account_status') === 'suspended' ? <RotateCcw className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}</button>{str(u,'role') !== 'super_admin' && <button onClick={() => setConfirmDelete(u)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>}</div></td></tr>))}</tbody></table></div>
      ) : (<div className="bg-white rounded-xl border border-gray-200 overflow-hidden">{invitations.length === 0 ? <p className="p-8 text-center text-sm text-brand-muted font-body">No invitations sent yet.</p> : (<table className="w-full text-sm font-body"><thead><tr className="text-left text-xs text-brand-muted uppercase tracking-wider border-b bg-gray-50"><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Portal</th><th className="p-3">Status</th><th className="p-3">Sent</th></tr></thead><tbody>{invitations.map((inv: User) => (<tr key={str(inv,'id')} className="border-b border-gray-100 hover:bg-gray-50/50"><td className="p-3"><div className="font-semibold text-brand-forest">{str(inv,'email')}</div>{str(inv,'full_name') && <div className="text-xs text-brand-muted">{str(inv,'full_name')}</div>}</td><td className="p-3">{roleBadge(str(inv,'role'))}</td><td className="p-3 text-xs">{str(inv,'portal_type')}</td><td className="p-3"><span className={`px-2 py-0.5 text-xs rounded font-semibold ${str(inv,'status') === 'accepted' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{str(inv,'status')}</span></td><td className="p-3 text-xs text-brand-muted">{str(inv,'created_at') ? new Date(str(inv,'created_at')).toLocaleDateString() : ''}</td></tr>))}</tbody></table>)}</div>)}
    </div>
  );
}
