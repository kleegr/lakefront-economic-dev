'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, ArrowLeft, Briefcase, Clock, Building2, Send, CheckCircle, ChevronDown, Info } from 'lucide-react';
import { getPublicFormFields, GROUP_LABELS } from '@/lib/ghl/employee-fields';
import {
  JOB_STATUS_LABELS,
  JOB_STATUS_HELPER,
  JOB_STATUS_COLORS,
  APPLY_ALLOWED_STATUSES,
  type JobOpeningStatus,
} from '@/lib/ghl/job-fields-config';

function formatEnum(s: string) { return (s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }
const formFields = getPublicFormFields();
const fieldGroups: Record<string, typeof formFields> = {};
for (const f of formFields) { if (!fieldGroups[f.group]) fieldGroups[f.group] = []; fieldGroups[f.group].push(f); }

function getStatus(job: any): JobOpeningStatus { return (job?.job_opening_status || 'open') as JobOpeningStatus; }
function canApply(job: any) { return APPLY_ALLOWED_STATUSES.includes(getStatus(job)); }

export default function JobDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [applied, setApplied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ preferences: true, application: true });
  const [form, setForm] = useState<Record<string, any>>({ firstName: '', lastName: '', email: '', phone: '' });

  useEffect(() => {
    if (!id) return;
    fetch(`/api/jobs/${id}`).then(r => r.json()).then(d => { setJob(d.job || null); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const setField = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!canApply(job)) { alert('This position is not currently accepting applications.'); return; }
    setSubmitting(true);
    try {
      const payload: Record<string, any> = { firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, coverLetter: form.cover_letter || '', resumeUrl: form.resume_url || '' };
      for (const f of formFields) { if (form[f.key] !== undefined && form[f.key] !== '' && form[f.key] !== null) payload[f.key] = form[f.key]; }
      const res = await fetch(`/api/jobs/${id}/apply`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) setApplied(true);
      else { const data = await res.json(); alert(data.error || 'Failed to submit'); }
    } catch { alert('Network error'); }
    setSubmitting(false);
  }

  const toggleGroup = (g: string) => setExpandedGroups(prev => ({ ...prev, [g]: !prev[g] }));

  if (loading) return (<div className="min-h-screen flex items-center justify-center bg-[#FAFAF7] pt-20"><div className="animate-spin h-8 w-8 border-4 border-[#C9B97A] border-t-transparent rounded-full" /></div>);
  if (!job) return (<div className="min-h-screen flex items-center justify-center bg-[#FAFAF7] pt-20"><p className="text-gray-400">Job not found</p></div>);

  const status = getStatus(job);
  const statusColors = JOB_STATUS_COLORS[status] || JOB_STATUS_COLORS.open;
  const statusLabel = JOB_STATUS_LABELS[status] || 'Open';
  const statusHelper = JOB_STATUS_HELPER[status];
  const applyAllowed = canApply(job);

  return (
    <div className="bg-[#FAFAF7] min-h-screen">
      <div className="gradient-forest">
        <div className="max-container section-padding pb-12">
          <Link href="/jobs" className="inline-flex items-center gap-1 text-white/40 hover:text-white/70 text-sm font-body mb-6 transition-colors"><ArrowLeft className="w-4 h-4" />Back to Jobs</Link>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-body font-semibold uppercase tracking-wider ${statusColors.bg} ${statusColors.text}`}>
              <span className={`inline-block w-2 h-2 rounded-full ${status === 'open' ? 'bg-green-500 animate-pulse' : status === 'hired' ? 'bg-gray-400' : status === 'reserved' ? 'bg-amber-500' : status === 'pending' ? 'bg-blue-400' : 'bg-purple-400'}`} />
              {statusLabel}
            </span>
            {statusHelper && (
              <span className="inline-flex items-center gap-1 text-[11px] font-body text-white/40">
                <Info className="w-3 h-3" />{statusHelper}
              </span>
            )}
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
          <div className="lg:col-span-2 space-y-8">
            {!applyAllowed && (
              <div className={`rounded-xl border p-4 flex items-start gap-3 ${status === 'hired' ? 'bg-gray-50 border-gray-200' : status === 'pending' ? 'bg-blue-50 border-blue-200' : 'bg-purple-50 border-purple-200'}`}>
                <Info className={`w-5 h-5 mt-0.5 shrink-0 ${status === 'hired' ? 'text-gray-400' : status === 'pending' ? 'text-blue-400' : 'text-purple-400'}`} />
                <div>
                  <p className={`text-sm font-body font-semibold ${status === 'hired' ? 'text-gray-600' : status === 'pending' ? 'text-blue-700' : 'text-purple-700'}`}>
                    {status === 'hired' && 'This position has been filled.'}
                    {status === 'pending' && 'This position is currently pending \u2014 applications are temporarily closed.'}
                    {status === 'coming_soon' && 'This job is coming soon. Check back later to apply!'}
                  </p>
                </div>
              </div>
            )}

            {job.description && (<div className="bg-white rounded-xl border border-gray-100 p-6"><h2 className="font-display text-lg font-semibold mb-4" style={{ color: '#2C3E2D' }}>About This Role</h2><p className="text-sm text-gray-500 font-body leading-relaxed whitespace-pre-wrap">{job.description}</p></div>)}
            {job.requirements && (<div className="bg-white rounded-xl border border-gray-100 p-6"><h2 className="font-display text-lg font-semibold mb-4" style={{ color: '#2C3E2D' }}>Requirements</h2><p className="text-sm text-gray-500 font-body leading-relaxed whitespace-pre-wrap">{job.requirements}</p></div>)}
            {job.benefits && (<div className="bg-white rounded-xl border border-gray-100 p-6"><h2 className="font-display text-lg font-semibold mb-4" style={{ color: '#2C3E2D' }}>Benefits</h2><p className="text-sm text-gray-500 font-body leading-relaxed whitespace-pre-wrap">{job.benefits}</p></div>)}

            {showApply && !applied && applyAllowed && (
              <div className="bg-white rounded-xl border-2 border-[#C9B97A]/30 p-6" id="apply-form">
                <h2 className="font-display text-lg font-semibold mb-6" style={{ color: '#2C3E2D' }}>Apply for {job.title}</h2>
                {status === 'reserved' && (
                  <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs font-body text-amber-700 flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    This position is currently reserved but still accepting backup applications in case the reserved candidate does not proceed.
                  </div>
                )}
                <form onSubmit={handleApply} className="space-y-6">
                  <div>
                    <p className="text-[10px] font-body font-semibold uppercase tracking-[0.15em] text-gray-300 mb-3">Contact Information</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">First Name *</label><input required value={form.firstName || ''} onChange={e => setField('firstName', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A]" /></div>
                      <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Last Name *</label><input required value={form.lastName || ''} onChange={e => setField('lastName', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A]" /></div>
                      <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Email *</label><input required type="email" value={form.email || ''} onChange={e => setField('email', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A]" /></div>
                      <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Phone</label><input value={form.phone || ''} onChange={e => setField('phone', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A]" /></div>
                    </div>
                  </div>

                  {Object.entries(fieldGroups).map(([groupKey, fields]) => (
                    <div key={groupKey}>
                      <button type="button" onClick={() => toggleGroup(groupKey)} className="flex items-center justify-between w-full mb-3">
                        <p className="text-[10px] font-body font-semibold uppercase tracking-[0.15em] text-gray-300">{GROUP_LABELS[groupKey] || groupKey}</p>
                        <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform ${expandedGroups[groupKey] ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedGroups[groupKey] && (
                        <div className="grid sm:grid-cols-2 gap-4">
                          {fields.map(field => (
                            <div key={field.key} className={field.colSpan === 2 ? 'sm:col-span-2' : ''}>
                              <label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">{field.label}{field.required ? ' *' : ''}</label>
                              {field.type === 'select' ? (
                                <select value={form[field.key] || ''} onChange={e => setField(field.key, e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A]"><option value="">Select...</option>{(field.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>
                              ) : field.type === 'multiselect' ? (
                                <div className="flex flex-wrap gap-1.5 border border-gray-200 rounded-lg p-3 max-h-32 overflow-y-auto">
                                  {(field.options || []).map(opt => (
                                    <button key={opt} type="button" onClick={() => { const cur = form[field.key] || []; setField(field.key, cur.includes(opt) ? cur.filter((x: string) => x !== opt) : [...cur, opt]); }} className={`px-2.5 py-1 rounded-full text-[11px] font-body transition-colors ${(form[field.key] || []).includes(opt) ? 'bg-[#2C3E2D] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{opt}</button>
                                  ))}
                                </div>
                              ) : field.type === 'textarea' ? (
                                <textarea rows={3} value={form[field.key] || ''} onChange={e => setField(field.key, e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A] resize-none" placeholder={field.placeholder} />
                              ) : field.type === 'date' ? (
                                <input type="date" value={form[field.key] || ''} onChange={e => setField(field.key, e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A]" />
                              ) : field.type === 'number' ? (
                                <input type="number" value={form[field.key] || ''} onChange={e => setField(field.key, e.target.value ? parseFloat(e.target.value) : '')} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A]" placeholder={field.placeholder} />
                              ) : (
                                <input type="text" value={form[field.key] || ''} onChange={e => setField(field.key, e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A]" placeholder={field.placeholder} />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-body font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50" style={{ backgroundColor: '#C9B97A' }}>
                    {submitting ? 'Submitting...' : 'Submit Application'}<Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {applied && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <h3 className="font-display text-lg font-semibold text-green-800">Application Submitted!</h3>
                <p className="text-sm text-green-600 font-body mt-2">We will review your application and get back to you soon.</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-20">
              <h3 className="font-display text-base font-semibold mb-4" style={{ color: '#2C3E2D' }}>Job Details</h3>
              <div className="space-y-3 text-sm font-body">
                <div className="flex justify-between items-start"><span className="text-gray-400">Status</span>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${statusColors.bg} ${statusColors.text}`}>
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${status === 'open' ? 'bg-green-500' : status === 'hired' ? 'bg-gray-400' : status === 'reserved' ? 'bg-amber-500' : status === 'pending' ? 'bg-blue-400' : 'bg-purple-400'}`} />
                      {statusLabel}
                    </span>
                    {statusHelper && <p className="text-[10px] text-gray-400 mt-0.5">{statusHelper}</p>}
                  </div>
                </div>
                <div className="flex justify-between"><span className="text-gray-400">Compensation</span><span className="font-semibold" style={{ color: '#2C3E2D' }}>{job.salary_range || 'Competitive'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Type</span><span className="font-semibold" style={{ color: '#2C3E2D' }}>{formatEnum(job.job_type || '')}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Work Mode</span><span className="font-semibold" style={{ color: '#2C3E2D' }}>{formatEnum(job.work_mode || 'On Site')}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Category</span><span className="font-semibold" style={{ color: '#2C3E2D' }}>{job.category || 'General'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Location</span><span className="font-semibold" style={{ color: '#2C3E2D' }}>{job.location || 'Okeechobee, FL'}</span></div>
              </div>
              {!applied && applyAllowed && (
                <button onClick={() => { setShowApply(true); setExpandedGroups({ preferences: true, application: true, experience: false }); setTimeout(() => document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="w-full mt-6 py-3 rounded-full text-sm font-body font-semibold text-white transition-all hover:shadow-lg" style={{ backgroundColor: '#C9B97A' }}>Apply Now</button>
              )}
              {!applied && !applyAllowed && (
                <div className="mt-6 py-3 rounded-full text-sm font-body font-semibold text-gray-400 bg-gray-100 text-center">
                  {status === 'hired' ? 'Position Filled' : status === 'coming_soon' ? 'Opening Soon' : 'Applications Closed'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
