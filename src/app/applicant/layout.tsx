'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Home, User, FileText, Briefcase, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label:'Dashboard', href:'/applicant/dashboard', icon:Home },
  { label:'My Profile', href:'/applicant/profile', icon:User },
  { label:'My Applications', href:'/applicant/applications', icon:FileText },
  { label:'Browse Jobs', href:'/applicant/jobs', icon:Briefcase },
  { label:'Settings', href:'/applicant/settings', icon:Settings },
];

export default function ApplicantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<{name:string;email:string}|null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { window.location.replace('/auth/login'); return; }
      const { data: profile } = await supabase.from('lf_profiles').select('full_name, email').eq('id', authUser.id).maybeSingle();
      setUser({ name: profile?.full_name || profile?.email || authUser.email || '', email: profile?.email || authUser.email || '' });
      setLoading(false);
    }
    loadUser();
  }, []);

  const handleLogout = async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.replace('/auth/login'); };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/applicant/dashboard" className="flex items-center gap-2">
            <span className="font-display text-lg font-bold text-brand-forest">Lakefront</span>
            <span className="text-[9px] font-body font-semibold tracking-[0.15em] uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Applicant</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs font-body text-gray-400 hidden sm:block">{user?.name}</span>
            <button onClick={handleLogout} className="text-xs font-body text-gray-400 hover:text-red-500 flex items-center gap-1"><LogOut className="w-3.5 h-3.5" />Logout</button>
          </div>
        </div>
        <nav className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {NAV_ITEMS.map(item => {
            const isActive = pathname.startsWith(item.href);
            return <Link key={item.label} href={item.href} className={cn('flex items-center gap-2 px-3 py-2.5 text-xs font-body font-medium whitespace-nowrap border-b-2 transition-colors', isActive ? 'border-brand-forest text-brand-forest' : 'border-transparent text-gray-400 hover:text-brand-forest')}><item.icon className="w-3.5 h-3.5" />{item.label}</Link>;
          })}
        </nav>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
