'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FileText, Briefcase, User } from 'lucide-react';
import Link from 'next/link';

export default function ApplicantDashboard() {
  const [applications, setApplications] = useState<Record<string,unknown>[]>([]);
  const [profile, setProfile] = useState<Record<string,unknown>|null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: p } = await supabase.from('lf_profiles').select('*').eq('id', user.id).maybeSingle();
      setProfile(p);
      // Only MY applications (RLS enforces this)
      const { data: apps } = await supabase.from('lf_applications').select('*, lf_jobs(title, company_name)').eq('applicant_id', user.id).order('created_at', { ascending: false });
      setApplications(apps || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-forest mb-1">Welcome{profile?.full_name ? `, ${profile.full_name as string}` : ''}</h1>
      <p className="text-sm font-body text-gray-500 mb-6">Your personal applicant dashboard</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/applicant/profile" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-sage transition-colors">
          <User className="w-8 h-8 text-brand-sage mb-3" />
          <h3 className="font-display font-bold text-brand-forest">My Profile</h3>
          <p className="text-xs font-body text-gray-400 mt-1">{profile?.onboarding_complete ? 'Profile complete' : 'Complete your profile'}</p>
        </Link>
        <Link href="/applicant/applications" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-sage transition-colors">
          <FileText className="w-8 h-8 text-brand-gold mb-3" />
          <h3 className="font-display font-bold text-brand-forest">My Applications</h3>
          <p className="text-xs font-body text-gray-400 mt-1">{applications.length} application{applications.length !== 1 ? 's' : ''}</p>
        </Link>
        <Link href="/applicant/jobs" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-sage transition-colors">
          <Briefcase className="w-8 h-8 text-brand-forest mb-3" />
          <h3 className="font-display font-bold text-brand-forest">Browse Jobs</h3>
          <p className="text-xs font-body text-gray-400 mt-1">Explore open positions</p>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-display font-semibold text-brand-forest mb-4">My Recent Applications</h3>
        {applications.length === 0 ? (
          <p className="text-sm text-gray-400 font-body text-center py-8">You haven&apos;t applied to any jobs yet. <Link href="/applicant/jobs" className="text-brand-sage">Browse jobs &rarr;</Link></p>
        ) : (
          <div className="space-y-3">{applications.map(a => (
            <div key={a.id as string} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-semibold text-brand-forest text-sm font-body">{((a as Record<string,unknown>).lf_jobs as Record<string,unknown>)?.title as string || 'Job'}</div>
                <div className="text-xs text-gray-400">{((a as Record<string,unknown>).lf_jobs as Record<string,unknown>)?.company_name as string || ''} &middot; Applied {new Date(a.created_at as string).toLocaleDateString()}</div>
              </div>
              <span className={`px-2 py-0.5 text-xs rounded font-semibold ${(a.status as string) === 'submitted' ? 'bg-blue-50 text-blue-700' : (a.status as string) === 'interview' ? 'bg-purple-50 text-purple-700' : (a.status as string) === 'offered' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{a.status as string}</span>
            </div>
          ))}</div>
        )}
      </div>
    </div>
  );
}
