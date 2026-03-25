'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Send, CheckCircle, ArrowLeft, Briefcase, AlertCircle, Info } from 'lucide-react';
import { ScrollReveal } from '@/components/public/ScrollReveal';
import {
  JOB_STATUS_LABELS,
  JOB_STATUS_COLORS,
  APPLY_ALLOWED_STATUSES,
  type JobOpeningStatus,
} from '@/lib/ghl/job-fields-config';

export default function JobApplyPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', coverLetter: '', experience: '', salary: '' });

  useEffect(() => {
    fetch('/api/jobs').then(r => r.json()).then(d => {
      const j = (d.jobs || []).find((j: any) => j.slug === jobId || j.id === jobId);
      setJob(j || null); setLoading(false);
    });
  }, [jobId]);

  const getJobStatus = (j: any): JobOpeningStatus => (j?.job_opening_status || 'open') as JobOpeningStatus;
  const canApplyFn = (j: any) => APPLY_ALLOWED_STATUSES.includes(getJobStatus(j));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canApplyFn(job)) { alert('This position is not currently accepting applications.'); return; }
    setSubmitting(true);
    await fetch('/api/public/apply', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicant_name: form.name, applicant_email: form.email, applicant_phone: form.phone, address: form.address,
        application_type: 'employee', job_id: job?.id || null,
        cover_letter: `Position: ${job?.title || 'Unknown'}\nCompany: ${job?.company_name || ''}\nExperience: ${form.experience}\nDesired Salary: ${form.salary}\n\n${form.coverLetter}`,
        status: 'submitted',
      }),
    });
    setSubmitted(true); setSubmitting(false);
  }

  if (loading) return (<div className="pt-24 pb-16 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-[#C9B97A] rounded-full" /></div>);

  const status = getJobStatus(job);
  const statusLabel = JOB_STATUS_LABELS[status] || 'Open';
  const statusColors = JOB_STATUS_COLORS[status] || JOB_STATUS_COLORS.open;
  const applyAllowed = canApplyFn(job);

  return (
    <div>
      <div className="gradient-forest relative overflow-hidden"><div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600)', backgroundSize: 'cover', backgroundPosition: 'center' }} /><div className="max-container section-padding py-20 relative z-10"><ScrollReveal><div className="text-center"><p className="text-xs tracking-[0.3em] uppercase mb-3 font-body font-semibold" style={{ color: '#C9B97A' }}>Apply Now</p><h1 className="font-display text-3xl lg:text-4xl font-bold text-white">{job?.title || 'Job Application'}</h1>{job?.company_name && <p className="text-base text-white/50 font-body mt-2">{job.company_name}</p>}</div></ScrollReveal></div></div>
      <div className="bg-[#FAFAF7] py-16"><div className="max-container section-padding max-w-2xl mx-auto">
        <Link href="/jobs" className="inline-flex items-center gap-1 text-sm font-body mb-6 text-gray-400 hover:text-brand-forest"><ArrowLeft className="w-4 h-4" /> Back to Jobs</Link>
        {job && (
          <div className="bg-white rounded-xl border p-4 mb-6 flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-brand-forest shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-semibold text-brand-forest">{job.title}</h3>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-body font-semibold uppercase ${statusColors.bg} ${statusColors.text}`}>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${status === 'open' ? 'bg-green-500' : status === 'hired' ? 'bg-gray-400' : status === 'reserved' ? 'bg-amber-500' : status === 'pending' ? 'bg-blue-400' : 'bg-purple-400'}`} />
                  {statusLabel}
                </span>
              </div>
              <p className="text-xs font-body text-gray-400">{job.company_name} &middot; {job.location} &middot; {(job.job_type || '').replace(/_/g, ' ')}{job.salary_range ? ` \u00b7 ${job.salary_range}` : ''}</p>
            </div>
          </div>
        )}

        {!applyAllowed ? (
          <div className="bg-white rounded-xl border p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="font-display text-xl font-semibold text-gray-600 mb-2">
              {status === 'hired' && 'This Position Has Been Filled'}
              {status === 'pending' && 'Applications Temporarily Closed'}
              {status === 'coming_soon' && 'This Job Is Coming Soon'}
            </h2>
            <p className="text-sm text-gray-400 font-body mb-6">
              {status === 'hired' && 'This role has already been filled. Check out our other open positions!'}
              {status === 'pending' && 'This position is currently pending. Please check back later when applications reopen.'}
              {status === 'coming_soon' && 'This job opening is not accepting applications yet. Check back soon!'}
            </p>
            <Link href="/jobs" className="inline-flex items-center gap-1 px-5 py-2.5 rounded-full text-sm font-body font-semibold text-white" style={{ backgroundColor: '#C9B97A' }}>Browse Open Jobs</Link>
          </div>
        ) : submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center"><CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" /><h2 className="font-display text-xl font-semibold text-green-800 mb-2">Application Submitted!</h2><p className="text-sm text-green-600 font-body">We will review your application and get back to you.</p></div>
        ) : (
          <div className="bg-white rounded-xl border p-8">
            <h2 className="font-display text-lg font-semibold text-brand-forest mb-6">Your Application</h2>
            {status === 'reserved' && (
              <div className="mb-6 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs font-body text-amber-700 flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                This position is currently reserved but still accepting backup applications.
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase">Full Name *</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A]" /></div>
                <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase">Email *</label><input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A]" /></div>
                <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase">Phone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A]" /></div>
                <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase">Address</label><input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A]" /></div>
                <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase">Years of Experience</label><input value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A]" placeholder="e.g. 5 years" /></div>
                <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase">Desired Salary</label><input value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A]" placeholder="e.g. $45,000/year" /></div>
              </div>
              <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase">Why are you a good fit? *</label><textarea required rows={4} value={form.coverLetter} onChange={e => setForm({...form, coverLetter: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A] resize-none" placeholder="Tell us about your experience..." /></div>
              <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-body font-semibold text-white disabled:opacity-50" style={{ backgroundColor: '#C9B97A' }}>{submitting ? 'Submitting...' : 'Submit Application'}</button>
            </form>
          </div>
        )}
      </div></div>
    </div>
  );
}
