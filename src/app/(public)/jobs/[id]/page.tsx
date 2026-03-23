'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, ArrowLeft, Briefcase, Clock, Building2, Send, CheckCircle } from 'lucide-react';

function formatEnum(s: string) {
  return (s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function JobDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [applied, setApplied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', coverLetter: '' });

  useEffect(() => {
    if (!id) return;
    fetch(`/api/jobs/${id}`)
      .then(r => r.json())
      .then(d => { setJob(d.job || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/jobs/${id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setApplied(true);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to submit');
      }
    } catch {
      alert('Network error');
    }
    setSubmitting(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7] pt-20"><div className="animate-spin h-8 w-8 border-4 border-[#C9B97A] border-t-transparent rounded-full" /></div>;
  if (!job) return <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7] pt-20"><p className="text-gray-400">Job not found</p></div>;

  return (
    <div className="bg-[#FAFAF7] min-h-screen">
      {/* Hero */}
      <div className="gradient-forest">
        <div className="max-container section-padding pb-12">
          <Link href="/jobs" className="inline-flex items-center gap-1 text-white/40 hover:text-white/70 text-sm font-body mb-6 transition-colors"><ArrowLeft className="w-4 h-4" />Back to Jobs</Link>
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-[11px] font-body font-semibold uppercase tracking-wider bg-white/10 text-white/70">{formatEnum(job.job_type || '')}</span>
            <span className="px-3 py-1 rounded-full text-[11px] font-body font-semibold uppercase tracking-wider bg-white/10 text-white/70">{job.category || 'General'}</span>
          </div>
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-white mb-3">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/50 font-body">
            <span className="flex items-center gap-1"><Building2 className="w-4 h-4" />{job.company_name}</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location || 'Okeechobee, FL'}</span>
            {job.work_mode && <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{formatEnum(job.work_mode)}</span>}
          </div>
        </div>
      </div>

      <div className="max-container section-padding py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {job.description && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="font-display text-lg font-semibold mb-4" style={{ color: '#2C3E2D' }}>About This Role</h2>
                <p className="text-sm text-gray-500 font-body leading-relaxed whitespace-pre-wrap">{job.description}</p>
              </div>
            )}
            {job.requirements && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="font-display text-lg font-semibold mb-4" style={{ color: '#2C3E2D' }}>Requirements</h2>
                <p className="text-sm text-gray-500 font-body leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
              </div>
            )}
            {job.benefits && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="font-display text-lg font-semibold mb-4" style={{ color: '#2C3E2D' }}>Benefits</h2>
                <p className="text-sm text-gray-500 font-body leading-relaxed whitespace-pre-wrap">{job.benefits}</p>
              </div>
            )}

            {/* Application Form */}
            {showApply && !applied && (
              <div className="bg-white rounded-xl border-2 border-[#C9B97A]/30 p-6" id="apply-form">
                <h2 className="font-display text-lg font-semibold mb-4" style={{ color: '#2C3E2D' }}>Apply for {job.title}</h2>
                <form onSubmit={handleApply} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">First Name *</label><input required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A]" /></div>
                    <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Last Name *</label><input required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A]" /></div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Email *</label><input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A]" /></div>
                    <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Phone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A]" /></div>
                  </div>
                  <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Why are you interested? (Optional)</label><textarea rows={4} value={form.coverLetter} onChange={e => setForm({...form, coverLetter: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A] resize-none" /></div>
                  <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-body font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50" style={{ backgroundColor: '#C9B97A' }}>
                    {submitting ? 'Submitting...' : 'Submit Application'}
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {applied && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <h3 className="font-display text-lg font-semibold text-green-800">Application Submitted!</h3>
                <p className="text-sm text-green-600 font-body mt-2">We'll review your application and get back to you soon.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-20">
              <h3 className="font-display text-base font-semibold mb-4" style={{ color: '#2C3E2D' }}>Job Details</h3>
              <div className="space-y-3 text-sm font-body">
                <div className="flex justify-between"><span className="text-gray-400">Compensation</span><span className="font-semibold" style={{ color: '#2C3E2D' }}>{job.salary_range || 'Competitive'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Type</span><span className="font-semibold" style={{ color: '#2C3E2D' }}>{formatEnum(job.job_type || '')}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Work Mode</span><span className="font-semibold" style={{ color: '#2C3E2D' }}>{formatEnum(job.work_mode || 'On Site')}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Category</span><span className="font-semibold" style={{ color: '#2C3E2D' }}>{job.category || 'General'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Location</span><span className="font-semibold" style={{ color: '#2C3E2D' }}>{job.location || 'Okeechobee, FL'}</span></div>
              </div>
              {!applied && (
                <button onClick={() => { setShowApply(true); setTimeout(() => document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="w-full mt-6 py-3 rounded-full text-sm font-body font-semibold text-white transition-all hover:shadow-lg" style={{ backgroundColor: '#C9B97A' }}>Apply Now</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
