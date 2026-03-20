'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, FileText, Building2, Wrench, TrendingUp, Warehouse, FileEdit, Users, Settings, Search, Bell, Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label:'Dashboard', href:'/portal/dashboard', icon:LayoutDashboard },
  { label:'Jobs', href:'/portal/jobs', icon:Briefcase },
  { label:'Applications', href:'/portal/applications', icon:FileText },
  { label:'Businesses', href:'/portal/businesses', icon:Building2 },
  { label:'Services', href:'/portal/services', icon:Wrench },
  { label:'Investors', href:'/portal/investors', icon:TrendingUp },
  { label:'Spaces', href:'/portal/spaces', icon:Warehouse },
  { label:'Content', href:'/portal/content', icon:FileEdit },
  { label:'Users', href:'/portal/users', icon:Users },
  { label:'Settings', href:'/portal/settings', icon:Settings },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = { name:'Admin User', email:'admin@lakefrontdev.com', role:'Super Admin' };
  return (
    <div className="min-h-screen bg-portal-bg flex">
      <aside className={cn('fixed inset-y-0 left-0 z-50 w-64 bg-portal-sidebar flex flex-col transform transition-transform duration-300 lg:translate-x-0', sidebarOpen ? 'translate-x-0' : '-translate-x-full')}>
        <div className="h-16 flex items-center px-5 border-b border-white/10 shrink-0">
          <Link href="/portal/dashboard" className="flex items-center gap-2">
            <span className="font-display text-lg font-bold text-white">Lakefront</span>
            <span className="text-[9px] font-body font-semibold tracking-[0.15em] uppercase text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded">Portal</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto portal-scroll py-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => { const isActive = pathname.startsWith(item.href); return (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body font-medium transition-all', isActive ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white/80')}>
              <item.icon className="w-4.5 h-4.5 shrink-0" />{item.label}
            </Link>
          );})}
        </nav>
        <div className="p-3 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-brand-sage flex items-center justify-center text-white text-xs font-bold shrink-0">{user.name.charAt(0)}</div>
            <div className="min-w-0 flex-1"><p className="text-sm text-white font-body font-medium truncate">{user.name}</p><p className="text-[10px] text-white/40 font-body truncate">{user.role}</p></div>
          </div>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 text-gray-500 hover:text-gray-700"><Menu className="w-5 h-5" /></button>
            <div className="hidden sm:flex items-center gap-2 bg-portal-bg rounded-lg px-3 py-2 w-72"><Search className="w-4 h-4 text-gray-400" /><input type="text" placeholder="Search records..." className="bg-transparent text-sm font-body text-brand-text placeholder:text-gray-400 outline-none w-full" /></div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"><Bell className="w-5 h-5" /><span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" /></button>
            <div className="w-8 h-8 rounded-full bg-brand-sage flex items-center justify-center text-white text-xs font-bold">{user.name.charAt(0)}</div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
