'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getUserProfile, isApproved, type UserProfile } from '@/lib/auth';
import Link from 'next/link';
import { Building2, Briefcase, Users, ArrowRight, Clock, CheckCircle } from 'lucide-react';

export default function EmployerDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const supabase = createClient();
  useEffect(() => { getUserProfile(supabase).then(setProfile); }, []);
  const approved = isApproved(profile);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-brand-forest">Employer Dashboard</h1>
        <p className="text-sm font-body text-brand-muted mt-1">{profile?.company_name || 'Set up your business to get started'}</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/employer/business" className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all group">
          <Building2 className="w-8 h-8 text-brand-sage mb-3" />
          <h3 className="font-display font-semibold text-brand-forest">Business Profile</h3>
          <p className="text-xs font-body text-brand-muted mt-1">Set up and manage your business information</p>
        </Link>
        <Link href={approved ? '/employer/jobs' : '#'} className={`bg-white rounded-lg border border-gray-200 p-6 transition-all ${approved ? 'hover:shadow-md' : 'opacity-60 cursor-not-allowed'}`}>
          <Briefcase className="w-8 h-8 text-brand-sage mb-3" />
          <h3 className="font-display font-semibold text-brand-forest">Job Postings</h3>
          <p className="text-xs font-body text-brand-muted mt-1">{approved ? 'Create and manage job listings' : 'Available after approval'}</p>
          {approved ? <ArrowRight className="w-4 h-4 text-brand-gold mt-2" /> : <Clock className="w-4 h-4 text-amber-500 mt-2" />}
        </Link>
        <Link href={approved ? '/employer/applicants' : '#'} className={`bg-white rounded-lg border border-gray-200 p-6 transition-all ${approved ? 'hover:shadow-md' : 'opacity-60 cursor-not-allowed'}`}>
          <Users className="w-8 h-8 text-brand-sage mb-3" />
          <h3 className="font-display font-semibold text-brand-forest">Applicants</h3>
          <p className="text-xs font-body text-brand-muted mt-1">{approved ? 'Review job applicants' : 'Available after approval'}</p>
        </Link>
      </div>
    </div>
  );
}
