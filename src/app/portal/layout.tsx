'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LayoutDashboard, Briefcase, FileText, Building2, Wrench, Warehouse, FileEdit, Users, Settings, Bell, Menu, Globe, LogOut, Shield, Tag, ClipboardCheck, Eye, ScrollText, Home, MessageSquare, Store, Key, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label:'Dashboard', href:'/portal/dashboard', icon:LayoutDashboard },
  { label:'Portal Preview', href:'/portal/preview', icon:Monitor },
  { label:'Approvals', href:'/portal/approvals', icon:ClipboardCheck },
  { label:'Jobs', href:'/portal/jobs', icon:Briefcase },
  { label:'Applications', href:'/portal/applications', icon:FileText },
  { label:'Businesses', href:'/portal/businesses', icon:Building2 },
  { label:'Business Apps', href:'/portal/business-apps', icon:Store },
  { label:'Services', href:'/portal/services', icon:Wrench },
  { label:'Spaces', href:'/portal/spaces', icon:Warehouse },
  { label:'Content', href:'/portal/content', icon:FileEdit },
  { label:'Users & Access', href:'/portal/users', icon:Users },
  { label:'Feedback', href:'/portal/suggestions', icon:MessageSquare },
  { label:'Impersonate', href:'/portal/impersonate', icon:Eye },
  { label:'Contract Residents', href:'/portal/contracts', icon:Home },
  { label:'Skills', href:'/portal/skills', icon:Tag },
  { label:'AI Settings', href:'/portal/ai-settings', icon:Key },
  { label:'Audit Log', href:'/portal/audit', icon:ScrollText },
  { label:'Settings', href:'/portal/settings', icon:Settings },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{name:string;email:string;role:string}|null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { window.location.replace('/auth/login'); return; }
      const { data: profile } = await supabase.from('lf_profiles').select('full_name, email, role, portal_type, account_status').eq('id', authUser.id).maybeSingle();
      if (!profile || !['super_admin','admin'].includes(profile.role)) {
        if (profile?.portal_type === 'employer') { window.location.replace('/employer/dashboard'); return; }
        window.location.replace('/applicant/dashboard'); return;
      }
      setUser({ name: profile.full_name || profile.email, email: profile.email, role: profile.role === 'super_admin' ? 'Super Admin' : 'Admin' });
      const { count: pa } = await supabase.from('lf_profiles').select('*', { count: 'exact', head: true }).eq('account_status', 'pending');
      const { count: pj } = await supabase.from('lf_jobs').select('*', { count: 'exact', head: true }).eq('approval_status', 'pending');
      setPendingCount((pa||0) + (pj||0));
      setLoading(false);
    }
    loadUser();
  }, []);

  const handleLogout = async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.replace('/auth/login'); };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-portal-bg"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-portal-bg flex">
      <aside className={cn('fixed inset-y-0 left-0 z-50 w-64 bg-portal-sidebar flex flex-col transform transition-transform duration-300 lg:translate-x-0', sidebarOpen ? 'translate-x-0' : '-translate-x-full')}>
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/10 shrink-0">
          <Link href="/portal/dashboard" className="flex items-center gap-2"><span className="font-display text-lg font-bold text-white">Lakefront</span><span className="text-[9px] font-body font-semibold tracking-[0.15em] uppercase text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded">Admin</span></Link>
        </div>
        <Link href="/" className="flex items-center gap-2 px-5 py-3 text-white/40 hover:text-brand-gold transition-colors border-b border-white/5"><Globe className="w-3.5 h-3.5" /><span className="text-[11px] font-body">Back to Website</span></Link>
        <nav className="flex-1 overflow-y-auto portal-scroll py-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => { const isActive = pathname.startsWith(item.href); return (
            <Link key={item.label} href={item.href} onClick={() => setSidebarOpen(false)} className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body font-medium transition-all', isActive ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white/80')}>
              <item.icon className="w-4 h-4 shrink-0" />{item.label}
              {item.label === 'Approvals' && pendingCount > 0 && <span className="ml-auto px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">{pendingCount}</span>}
            </Link>
          );})}
        </nav>
        <div className="p-3 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2"><div className="w-8 h-8 rounded-full bg-brand-sage flex items-center justify-center text-white text-xs font-bold shrink-0">{user?.name?.charAt(0) || 'A'}</div><div className="min-w-0 flex-1"><p className="text-sm text-white font-body font-medium truncate">{user?.name}</p><p className="text-[10px] text-white/40 font-body truncate flex items-center gap-1"><Shield className="w-3 h-3" />{user?.role}</p></div></div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 mt-1 w-full text-white/40 hover:text-red-400 transition-colors rounded-lg text-xs font-body"><LogOut className="w-3.5 h-3.5" />Sign Out</button>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3"><button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 text-gray-500 hover:text-gray-700"><Menu className="w-5 h-5" /></button></div>
          <div className="flex items-center gap-3">
            {pendingCount > 0 && <Link href="/portal/approvals" className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-body font-semibold"><ClipboardCheck className="w-3.5 h-3.5" />{pendingCount} pending</Link>}
            <Link href="/portal/preview" className="text-xs font-body text-brand-sage hover:text-brand-forest flex items-center gap-1"><Monitor className="w-3.5 h-3.5" /> Preview</Link>
            <Link href="/" className="text-xs font-body text-brand-muted hover:text-brand-forest flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> Site</Link>
            <button className="relative p-2 text-gray-400 hover:text-gray-600"><Bell className="w-5 h-5" />{pendingCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />}</button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
