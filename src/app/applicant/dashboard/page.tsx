'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getUserProfile, isApproved, type UserProfile } from '@/lib/auth';
import Link from 'next/link';
import { User, FileText, Briefcase, CheckCircle, Clock, ArrowRight } from 'lucide-react';

export default function ApplicantDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const supabase = createClient();
  useEffect(() => { getUserProfile(supabase).then(setProfile); }, []);
  const approved = isApproved(profile);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-brand-forest">Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}</h1>
        <p className="text-sm font-body text-brand-muted mt-1">Your Applicant Portal dashboard</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/applicant/profile" className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all group">
          <User className="w-8 h-8 text-brand-sage mb-3" />
          <h3 className="font-display font-semibold text-brand-forest group-hover:text-brand-sage transition-colors">My Profile</h3>
          <p className="text-xs font-body text-brand-muted mt-1">{profile?.onboarding_complete ? 'Profile complete' : 'Complete your profile to get started'}</p>
          {profile?.onboarding_complete ? <CheckCircle className="w-4 h-4 text-green-500 mt-2" /> : <Clock className="w-4 h-4 text-amber-500 mt-2" />}
        </Link>

        <Link href={approved ? '/applicant/applications' : '#'} className={`bg-white rounded-lg border border-gray-200 p-6 transition-all group ${approved ? 'hover:shadow-md' : 'opacity-60 cursor-not-allowed'}`}>
          <FileText className="w-8 h-8 text-brand-sage mb-3" />
          <h3 className="font-display font-semibold text-brand-forest">My Applications</h3>
          <p className="text-xs font-body text-brand-muted mt-1">{approved ? 'Track your job applications' : 'Available after account approval'}</p>
        </Link>

        <Link href="/applicant/jobs" className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all group">
          <Briefcase className="w-8 h-8 text-brand-sage mb-3" />
          <h3 className="font-display font-semibold text-brand-forest group-hover:text-brand-sage transition-colors">Browse Jobs</h3>
          <p className="text-xs font-body text-brand-muted mt-1">Explore open positions</p>
          <ArrowRight className="w-4 h-4 text-brand-gold mt-2" />
        </Link>
      </div>
    </div>
  );
}
