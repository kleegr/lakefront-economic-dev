'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getUserProfile, type UserProfile } from '@/lib/auth';
import { Building2, Briefcase, Users, Settings, LogOut, Home, AlertCircle, Clock } from 'lucide-react';

const NAV = [
  { href: '/employer/dashboard', label: 'Dashboard', icon: Home },
  { href: '/employer/business', label: 'My Business', icon: Building2 },
  { href: '/employer/jobs', label: 'Job Posts', icon: Briefcase },
  { href: '/employer/applicants', label: 'Applicants', icon: Users },
  { href: '/employer/settings', label: 'Settings', icon: Settings },
];

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    getUserProfile(supabase).then(p => { setProfile(p); setLoading(false); });
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/'); };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  const isPending = profile?.account_status === 'pending';
  const isRejected = profile?.account_status === 'rejected';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-display text-lg font-bold text-brand-forest">Lakefront</Link>
            <span className="text-xs font-body px-2 py-0.5 bg-purple-50 text-purple-700 rounded">Employer Portal</span>
            {isPending && <span className="text-xs font-body px-2 py-0.5 bg-amber-50 text-amber-700 rounded flex items-center gap-1"><Clock className="w-3 h-3" />Pending Approval</span>}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-body text-brand-muted hidden sm:block">{profile?.company_name || profile?.email}</span>
            <button onClick={handleLogout} className="text-xs font-body text-brand-muted hover:text-red-600 flex items-center gap-1"><LogOut className="w-3.5 h-3.5" />Logout</button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6"><nav className="flex gap-1 overflow-x-auto pb-2 -mb-px">
          {NAV.map(item => (
            <Link key={item.href} href={item.href} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-body font-medium rounded-t transition-colors whitespace-nowrap ${pathname === item.href ? 'bg-brand-sage/10 text-brand-forest border-b-2 border-brand-sage' : 'text-brand-muted hover:text-brand-forest'}`}>
              <item.icon className="w-3.5 h-3.5" />{item.label}
            </Link>
          ))}
        </nav></div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {(isPending || isRejected) && (
          <div className={`mb-6 p-4 rounded-lg border ${isRejected ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-start gap-3">
              <AlertCircle className={`w-5 h-5 mt-0.5 ${isRejected ? 'text-red-500' : 'text-amber-500'}`} />
              <div>
                <h3 className={`font-display font-semibold text-sm ${isRejected ? 'text-red-800' : 'text-amber-800'}`}>
                  {isPending ? 'Employer Account Pending' : 'Account Not Approved'}
                </h3>
                <p className="text-xs font-body text-brand-muted mt-1">
                  {isPending ? 'Your employer account is under review. You can set up your business profile, but cannot publish job postings until approved.' : 'Your employer account was not approved.'}
                </p>
              </div>
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
