'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useHousehold } from '../layout';
import { FileText, Briefcase, Users, Heart, User } from 'lucide-react';
import Link from 'next/link';

export default function ApplicantDashboard() {
  const { household, members, activeMember, approved } = useHousehold();
  const [appCount, setAppCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [jobCount, setJobCount] = useState(0);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      if (activeMember) {
        const { count: ac } = await supabase.from('lf_applications').select('*', { count: 'exact', head: true }).eq('member_id', activeMember.id);
        setAppCount(ac || 0);
        const { count: sc } = await supabase.from('lf_saved_jobs').select('*', { count: 'exact', head: true }).eq('member_id', activeMember.id);
        setSavedCount(sc || 0);
      }
      const { count: jc } = await supabase.from('lf_jobs').select('*', { count: 'exact', head: true }).eq('status', 'published');
      setJobCount(jc || 0);
    }
    load();
  }, [activeMember]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-forest mb-1">Welcome{activeMember ? `, ${activeMember.full_name}` : ''}</h1>
      <p className="text-sm font-body text-gray-500 mb-6">
        {activeMember ? `Viewing as: ${activeMember.full_name}${activeMember.profile_complete ? '' : ' (Profile incomplete)'}` : 'Add a household member to get started'}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link href="/applicant/household" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-sage transition-colors">
          <Users className="w-7 h-7 text-brand-sage mb-2" />
          <div className="text-2xl font-display font-bold text-brand-forest">{members.length}</div>
          <p className="text-xs font-body text-gray-400">Household Members</p>
        </Link>
        <Link href="/applicant/jobs" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-sage transition-colors">
          <Briefcase className="w-7 h-7 text-brand-forest mb-2" />
          <div className="text-2xl font-display font-bold text-brand-forest">{jobCount}</div>
          <p className="text-xs font-body text-gray-400">Open Jobs</p>
        </Link>
        <Link href="/applicant/saved" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-sage transition-colors">
          <Heart className="w-7 h-7 text-red-400 mb-2" />
          <div className="text-2xl font-display font-bold text-brand-forest">{savedCount}</div>
          <p className="text-xs font-body text-gray-400">Saved Jobs</p>
        </Link>
        <Link href="/applicant/applications" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-sage transition-colors">
          <FileText className="w-7 h-7 text-brand-gold mb-2" />
          <div className="text-2xl font-display font-bold text-brand-forest">{appCount}</div>
          <p className="text-xs font-body text-gray-400">Applications</p>
        </Link>
      </div>

      {/* Profile completion */}
      {activeMember && !activeMember.profile_complete && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
          <h3 className="font-display font-semibold text-amber-800 mb-1">Complete {activeMember.full_name}&apos;s Profile</h3>
          <p className="text-sm font-body text-amber-700 mb-3">Fill in experience, skills, and qualifications to be eligible to apply for jobs.</p>
          <Link href="/applicant/household" className="text-sm font-body font-semibold text-amber-800 underline">Complete Profile &rarr;</Link>
        </div>
      )}

      {!approved && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-display font-semibold text-brand-forest mb-2">Account Status: Pending Approval</h3>
          <p className="text-sm font-body text-gray-500">Your account is being reviewed. While waiting, you can set up your household, add members, browse jobs, and save favorites. You&apos;ll be able to submit applications once approved.</p>
        </div>
      )}
    </div>
  );
}
