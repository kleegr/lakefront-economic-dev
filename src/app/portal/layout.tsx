'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LayoutDashboard, Briefcase, FileText, Building2, Wrench, Warehouse, Users, Settings, Bell, Menu, Globe, LogOut, Shield, Tag, ClipboardCheck, Eye, ScrollText, Home, MessageSquare, Store, Key, Monitor, Plug, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem { label: string; href: string; icon: any; badge?: number; }
interface NavGroup { title: string; items: NavItem[]; }

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  // Auto-expand settings if on a settings page
  useEffect(() => {
    const settingsPaths = ['/portal/users', '/portal/skills', '/portal/ai-settings', '/portal/ghl-setup', '/portal/audit', '/portal/impersonate', '/portal/settings'];
    if (settingsPaths.some(p => pathname.startsWith(p))) setSettingsOpen(true);
  }, [pathname]);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { window.location.replace('/auth/login'); return; }
      const { data: profile } = await supabase.from('lf_profiles').select('full_name, email, role, portal_type, account_status').eq('id', authUser.id).maybeSingle();
      if (!profile || !['super_admin', 'admin'].includes(profile.role)) {
        if (profile?.portal_type === 'employer') { window.location.replace('/employer/dashboard'); return; }
        window.location.replace('/applicant/dashboard'); return;
      }
      setUser({ name: profile.full_name || profile.email, email: profile.email, role: profile.role === 'super_admin' ? 'Super Admin' : 'Admin' });
      const { count: pa } = await supabase.from('lf_profiles').select('*', { count: 'exact', head: true }).eq('account_status', 'pending');
      const { count: pj } = await supabase.from('lf_jobs').select('*', { count: 'exact', head: true }).eq('approval_status', 'pending');
      setPendingCount((pa || 0) + (pj || 0));
      setLoading(false);
    }
    loadUser();
  }, []);

  const handleLogout = async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.replace('/auth/login'); };

  // Organized nav groups
  const mainNav: NavGroup[] = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', href: '/portal/dashboard', icon: LayoutDashboard },
        { label: 'Approvals', href: '/portal/approvals', icon: ClipboardCheck, badge: pendingCount },
      ],
    },
    {
      title: 'Operations',
      items: [
        { label: 'Jobs', href: '/portal/jobs', icon: Briefcase },
        { label: 'Applications', href: '/portal/applications', icon: FileText },
        { label: 'Businesses', href: '/portal/businesses', icon: Building2 },
        { label: 'Business Apps', href: '/portal/business-apps', icon: Store },
        { label: 'Services', href: '/portal/services', icon: Wrench },
        { label: 'Spaces', href: '/portal/spaces', icon: Warehouse },
      ],
    },
    {
      title: 'Community',
      items: [
        { label: 'Residents', href: '/portal/contracts', icon: Home },
        { label: 'Feedback', href: '/portal/suggestions', icon: MessageSquare },
      ],
    },
  ];

  const settingsNav: NavItem[] = [
    { label: 'Users & Access', href: '/portal/users', icon: Users },
    { label: 'Skills', href: '/portal/skills', icon: Tag },
    { label: 'AI Settings', href: '/portal/ai-settings', icon: Key },
    { label: 'GHL Setup', href: '/portal/ghl-setup', icon: Plug },
    { label: 'Impersonate', href: '/portal/impersonate', icon: Eye },
    { label: 'Audit Log', href: '/portal/audit', icon: ScrollText },
    { label: 'General', href: '/portal/settings', icon: Settings },
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-portal-bg"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href || (item.href !== '/portal/dashboard' && pathname.startsWith(item.href));
    return (
      <Link
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-body font-medium transition-all duration-200',
          isActive
            ? 'bg-white/10 text-white shadow-sm'
            : 'text-white/45 hover:bg-white/[0.06] hover:text-white/75'
        )}
      >
        <item.icon className={cn('w-[18px] h-[18px] shrink-0', isActive ? 'text-brand-gold' : '')} />
        <span className="truncate">{item.label}</span>
        {!!item.badge && item.badge > 0 && (
          <span className="ml-auto px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[20px] text-center">{item.badge}</span>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-portal-bg flex">
      {/* Sidebar */}
      <aside className={cn('fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col transform transition-transform duration-300 lg:translate-x-0', sidebarOpen ? 'translate-x-0' : '-translate-x-full')}
        style={{ background: 'linear-gradient(180deg, #1e2d1f 0%, #243326 100%)' }}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.08] shrink-0">
          <Link href="/portal/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(201,185,122,0.15)' }}>
              <span className="text-sm font-display font-bold" style={{ color: '#C9B97A' }}>L</span>
            </div>
            <div>
              <span className="font-display text-[15px] font-bold text-white leading-none block">Lakefront</span>
              <span className="text-[9px] font-body text-white/30 uppercase tracking-[0.15em]">Admin Portal</span>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {/* Back to site */}
        <Link href="/" className="flex items-center gap-2 mx-4 mt-3 mb-1 px-3 py-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all text-[11px] font-body">
          <Globe className="w-3.5 h-3.5" />Back to Website
        </Link>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto portal-scroll px-3 pb-3">
          {mainNav.map((group) => (
            <div key={group.title} className="mt-4 first:mt-2">
              <p className="px-3 mb-1.5 text-[10px] font-body font-semibold uppercase tracking-[0.15em] text-white/20">{group.title}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => <NavLink key={item.href} item={item} />)}
              </div>
            </div>
          ))}

          {/* Settings section — collapsible */}
          <div className="mt-5">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-body font-semibold uppercase tracking-[0.15em] text-white/20 hover:text-white/35 transition-colors"
            >
              <span>Settings</span>
              <ChevronDown className={cn('w-3 h-3 transition-transform duration-200', settingsOpen ? 'rotate-180' : '')} />
            </button>
            <div className={cn('space-y-0.5 overflow-hidden transition-all duration-300', settingsOpen ? 'max-h-[400px] opacity-100 mt-1.5' : 'max-h-0 opacity-0')}>
              {settingsNav.map((item) => <NavLink key={item.href} item={item} />)}
            </div>
          </div>
        </nav>

        {/* User card */}
        <div className="p-3 border-t border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: 'rgba(201,185,122,0.2)', color: '#C9B97A' }}>
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-white font-body font-medium truncate">{user?.name}</p>
              <p className="text-[10px] text-white/30 font-body truncate flex items-center gap-1"><Shield className="w-3 h-3" />{user?.role}</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 text-white/25 hover:text-red-400 transition-colors rounded-lg hover:bg-white/[0.05]" title="Sign Out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 lg:ml-[260px] flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
              <Menu className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <Link href="/portal/approvals" className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg text-[11px] font-body font-semibold hover:bg-red-100 transition-colors">
                <ClipboardCheck className="w-3.5 h-3.5" />{pendingCount} pending
              </Link>
            )}
            <Link href="/" className="p-2 text-gray-300 hover:text-gray-500 rounded-lg hover:bg-gray-50 transition-colors" title="View Site">
              <Globe className="w-4 h-4" />
            </Link>
            <button className="relative p-2 text-gray-300 hover:text-gray-500 rounded-lg hover:bg-gray-50 transition-colors" title="Notifications">
              <Bell className="w-4 h-4" />
              {pendingCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
