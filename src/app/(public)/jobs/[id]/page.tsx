'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MapPin, Clock, DollarSign, Briefcase, Building2, ArrowLeft, LogIn } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Job = Record<string, unknown>;
const s = (j: Job, k: string): string => (j[k] as string) || '';

export default function JobDetailPage() {
  const params = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { async function load() { const supabase = createClient(); const { data } = await supabase.from('lf_jobs').select('*').eq('id', params.id).eq('status', 'published').maybeSingle(); setJob(data); setLoading(false); } load(); }, [params.id]);
  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;
  if (!job) return (<div className="min-h-[60vh] flex items-center justify-center"><div className="text-center"><h1 className="font-display text-2xl font-bold text-brand-forest mb-2">Position Not Found</h1><p className="text-brand-muted font-body mb-4">This job may have been removed or closed.</p><Link href="/jobs" className="btn-secondary text-xs">Back to Jobs</Link></div></div>);
  const statusLabel = s(job,'job_status')==='coming_soon'?'Coming Soon':s(job,'job_status')==='accepting_offers'?'Accepting Offers':s(job,'job_status')==='hired'||s(job,'job_status')==='filled'?'Filled':'Open';
  return (
    <>
      <section className="gradient-forest py-12 lg:py-16"><div className="max-container section-padding">
        <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm text-white/60 font-body hover:text-white mb-6"><ArrowLeft className="w-4 h-4" /> Back to Jobs</Link>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3"><span className="px-3 py-1 bg-brand-gold/20 text-brand-gold text-xs font-body font-semibold rounded-sm">{s(job,'job_type')||'Full-time'}</span>{s(job,'category')&&<span className="px-2 py-0.5 bg-white/10 text-white/70 text-xs font-body rounded-sm">{s(job,'category')}</span>}</div>
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-white mb-2">{s(job,'title')}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/60 font-body">{s(job,'company_name')&&<span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" />{s(job,'company_name')}</span>}<span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{s(job,'location')||'Lakefront Estates'}</span></div>
          </div>
          <Link href="/auth/login?redirect=/applicant/jobs" className="btn-primary flex items-center gap-2 shrink-0"><LogIn className="w-4 h-4" />Sign In to Apply</Link>
        </div>
      </div></section>
      <section className="py-12 lg:py-16 bg-brand-warm"><div className="max-container section-padding"><div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-sm border border-gray-100 p-8"><h2 className="font-display text-xl font-semibold text-brand-forest mb-4">About This Position</h2><p className="text-brand-text/70 font-body leading-relaxed whitespace-pre-line">{s(job,'description')}</p></div>
          {s(job,'requirements')&&<div className="bg-white rounded-sm border border-gray-100 p-8"><h2 className="font-display text-xl font-semibold text-brand-forest mb-4">Requirements</h2><p className="text-brand-text/70 font-body leading-relaxed">{s(job,'requirements')}</p></div>}
          {s(job,'special_offer')&&<div className="bg-white rounded-sm border border-gray-100 p-8"><h2 className="font-display text-xl font-semibold text-brand-forest mb-4">Special Offer</h2><p className="text-brand-text/70 font-body leading-relaxed">{s(job,'special_offer')}</p></div>}
          <div className="bg-brand-sage/5 rounded-sm border border-brand-sage/20 p-8 text-center"><LogIn className="w-8 h-8 text-brand-sage mx-auto mb-3" /><h3 className="font-display text-lg font-semibold text-brand-forest mb-2">Ready to Apply?</h3><p className="text-sm text-brand-muted font-body mb-4">Sign in to your Resident Portal to apply. You can apply to up to 3 jobs at once.</p><Link href="/auth/login?redirect=/applicant/jobs" className="btn-primary text-xs">Sign In / Create Account</Link></div>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-sm border border-gray-100 p-6"><h3 className="font-display text-base font-semibold text-brand-forest mb-4">Position Details</h3><div className="space-y-4">
            <div className="flex items-start gap-3"><DollarSign className="w-4 h-4 text-brand-sage mt-0.5 shrink-0" /><div><p className="text-xs font-body text-brand-muted uppercase">Compensation</p><p className="text-sm font-body font-medium">{s(job,'salary_range')||'Contact for details'}</p></div></div>
            <div className="flex items-start gap-3"><Briefcase className="w-4 h-4 text-brand-sage mt-0.5 shrink-0" /><div><p className="text-xs font-body text-brand-muted uppercase">Type</p><p className="text-sm font-body font-medium">{s(job,'compensation_type')||s(job,'job_type')||'Full-time'}</p></div></div>
            <div className="flex items-start gap-3"><MapPin className="w-4 h-4 text-brand-sage mt-0.5 shrink-0" /><div><p className="text-xs font-body text-brand-muted uppercase">Location</p><p className="text-sm font-body font-medium">{s(job,'location')||'Lakefront Estates'}</p></div></div>
            <div className="flex items-start gap-3"><Clock className="w-4 h-4 text-brand-sage mt-0.5 shrink-0" /><div><p className="text-xs font-body text-brand-muted uppercase">Status</p><p className="text-sm font-body font-medium">{statusLabel}</p></div></div>
          </div></div>
          <Link href="/auth/login?redirect=/applicant/jobs" className="btn-primary w-full text-center block">Sign In to Apply</Link>
        </div>
      </div></div></section>
    </>
  );
}
