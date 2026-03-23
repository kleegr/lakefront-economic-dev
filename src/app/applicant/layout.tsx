'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Home, Users, FileText, Briefcase, Heart, Settings, LogOut, User, ChevronDown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HouseholdContext, HouseholdMember } from '@/lib/household-context';

const NAV = [
  { label:'Dashboard', href:'/applicant/dashboard', icon:Home },
  { label:'Household', href:'/applicant/household', icon:Users },
  { label:'Browse Jobs', href:'/applicant/jobs', icon:Briefcase },
  { label:'Saved Jobs', href:'/applicant/saved', icon:Heart },
  { label:'Applications', href:'/applicant/applications', icon:FileText },
  { label:'Resume Builder', href:'/applicant/resume', icon:Sparkles },
  { label:'Settings', href:'/applicant/settings', icon:Settings },
];

export default function ApplicantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<{name:string;email:string;id:string}|null>(null);
  const [loading, setLoading] = useState(true);
  const [household, setHousehold] = useState<Record<string,unknown>|null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [activeMember, setActiveMember] = useState<HouseholdMember|null>(null);
  const [approved, setApproved] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);

  const loadData = async () => {
    const supabase = createClient();
    const { data: { user: au } } = await supabase.auth.getUser();
    if (!au) { window.location.replace('/auth/login'); return; }
    const { data: p } = await supabase.from('lf_profiles').select('*').eq('id', au.id).maybeSingle();
    setUser({ name: p?.full_name || p?.email || au.email || '', email: p?.email || au.email || '', id: au.id });
    setApproved(p?.account_status === 'approved');
    let { data: hh } = await supabase.from('lf_households').select('*').eq('account_id', au.id).maybeSingle();
    if (!hh) { const { data: newHh } = await supabase.from('lf_households').insert({ account_id: au.id }).select().single(); hh = newHh; }
    setHousehold(hh);
    if (hh) {
      const { data: mems } = await supabase.from('lf_household_members').select('id, full_name, is_primary, profile_complete').eq('household_id', hh.id).order('is_primary', { ascending: false });
      const m = (mems || []) as HouseholdMember[];
      setMembers(m);
      const stored = typeof window !== 'undefined' ? localStorage.getItem('lf_active_member') : null;
      setActiveMember((stored ? m.find(x => x.id === stored) : null) || m[0] || null);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);
  const handleSetActive = (m: HouseholdMember) => { setActiveMember(m); localStorage.setItem('lf_active_member', m.id); setShowSwitcher(false); };
  const handleLogout = async () => { const s = createClient(); await s.auth.signOut(); window.location.replace('/auth/login'); };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  return (
    <HouseholdContext.Provider value={{ household, members, activeMember, setActiveMember: handleSetActive, approved, reload: loadData }}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/applicant/dashboard" className="flex items-center gap-2">
              <span className="font-display text-lg font-bold text-brand-forest">Lakefront</span>
              <span className="text-[9px] font-body font-semibold tracking-[0.15em] uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Resident Portal</span>
            </Link>
            <div className="flex items-center gap-3">
              {members.length > 0 && (
                <div className="relative">
                  <button onClick={() => setShowSwitcher(!showSwitcher)} className="flex items-center gap-2 px-3 py-1.5 bg-brand-sage/10 rounded-lg text-xs font-body font-semibold text-brand-forest hover:bg-brand-sage/20">
                    <User className="w-3.5 h-3.5" />{activeMember?.full_name || 'Select member'}<ChevronDown className="w-3 h-3" />
                  </button>
                  {showSwitcher && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[200px] z-50">
                      <div className="px-3 py-1.5 text-[10px] font-body text-gray-400 uppercase tracking-wider">Active Member</div>
                      {members.map(m => (
                        <button key={m.id} onClick={() => handleSetActive(m)} className={cn('w-full text-left px-3 py-2 text-sm font-body flex items-center justify-between hover:bg-gray-50', m.id === activeMember?.id && 'bg-brand-sage/10 font-semibold')}>
                          <span>{m.full_name}{m.is_primary && ' (Primary)'}</span>
                          {m.profile_complete ? <span className="text-[10px] text-green-600">Complete</span> : <span className="text-[10px] text-amber-500">Incomplete</span>}
                        </button>
                      ))}
                      <div className="border-t border-gray-100 mt-1 pt-1"><Link href="/applicant/household" onClick={() => setShowSwitcher(false)} className="block px-3 py-2 text-xs font-body text-brand-sage hover:bg-gray-50">+ Manage Members</Link></div>
                    </div>
                  )}
                </div>
              )}
              <span className="text-xs font-body text-gray-400 hidden sm:block">{user?.name}</span>
              <button onClick={handleLogout} className="text-xs font-body text-gray-400 hover:text-red-500 flex items-center gap-1"><LogOut className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          <nav className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto">
            {NAV.map(item => {
              const isActive = pathname.startsWith(item.href);
              return <Link key={item.label} href={item.href} className={cn('flex items-center gap-2 px-3 py-2.5 text-xs font-body font-medium whitespace-nowrap border-b-2 transition-colors', isActive ? 'border-brand-forest text-brand-forest' : 'border-transparent text-gray-400 hover:text-brand-forest')}><item.icon className="w-3.5 h-3.5" />{item.label}</Link>;
            })}
          </nav>
        </header>
        {!approved && <div className="max-w-6xl mx-auto px-4 mt-4"><div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm font-body text-amber-800">Your account is pending approval. You can browse and save jobs, but cannot submit applications until approved.</div></div>}
        {members.length === 0 && <div className="max-w-6xl mx-auto px-4 mt-4"><div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm font-body text-blue-800">Add at least one household member to get started. <Link href="/applicant/household" className="underline font-semibold">Go to Household &rarr;</Link></div></div>}
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      </div>
    </HouseholdContext.Provider>
  );
}
