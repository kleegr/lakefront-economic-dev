'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LayoutDashboard, Briefcase, FileText, Building2, Settings, Globe, LogOut, Menu, Bell, Search, Users, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { label:'Dashboard', href:'/employer/dashboard', icon:LayoutDashboard },
  { label:'My Jobs', href:'/employer/jobs', icon:Briefcase },
  { label:'Applications', href:'/employer/applications', icon:FileText },
  { label:'Candidate Search', href:'/employer/candidates', icon:Search },
  { label:'My Business', href:'/employer/business', icon:Building2 },
  { label:'Pending Approvals', href:'/employer/approvals', icon:ClipboardList },
  { label:'Settings', href:'/employer/settings', icon:Settings },
];

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{name:string;email:string;id:string}|null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user: au } } = await supabase.auth.getUser();
      if (!au) { window.location.replace('/auth/login'); return; }
      const { data: p } = await supabase.from('lf_profiles').select('full_name, email, role, portal_type').eq('id', au.id).maybeSingle();
      if (!p || (p.portal_type !== 'employer' && !['super_admin','admin'].includes(p.role))) { window.location.replace('/applicant/dashboard'); return; }
      setUser({ name: p.full_name || p.email, email: p.email, id: au.id });
      setLoading(false);
    }
    loadUser();
  }, []);

  const handleLogout = async () => { const s = createClient(); await s.auth.signOut(); window.location.replace('/auth/login'); };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className={cn('fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 lg:translate-x-0', sidebarOpen ? 'translate-x-0' : '-translate-x-full')}>
        <div className="h-16 flex items-center px-5 border-b border-gray-100">
          <Link href="/employer/dashboard" className="flex items-center gap-2">
            <span className="font-display text-lg font-bold text-brand-forest">Lakefront</span>
            <span className="text-[9px] font-body font-semibold tracking-[0.15em] uppercase text-green-700 bg-green-50 px-2 py-0.5 rounded">Employer</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV.map(item => { const isActive = pathname.startsWith(item.href); return (
            <Link key={item.label} href={item.href} onClick={() => setSidebarOpen(false)} className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body font-medium transition-all', isActive ? 'bg-brand-sage/10 text-brand-forest' : 'text-gray-500 hover:bg-gray-50 hover:text-brand-forest')}>
              <item.icon className="w-4 h-4 shrink-0" />{item.label}
            </Link>
          );})}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold">{user?.name?.charAt(0)||'E'}</div>
            <div className="min-w-0 flex-1"><p className="text-sm font-body font-medium truncate text-brand-forest">{user?.name}</p><p className="text-[10px] text-gray-400 font-body">Employer</p></div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 mt-1 w-full text-gray-400 hover:text-red-500 rounded-lg text-xs font-body"><LogOut className="w-3.5 h-3.5" />Sign Out</button>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 text-gray-500"><Menu className="w-5 h-5" /></button>
          <div />
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs font-body text-gray-400 hover:text-brand-forest flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> Site</Link>
            <button className="relative p-2 text-gray-400 hover:text-gray-600"><Bell className="w-5 h-5" /></button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
