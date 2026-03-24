'use client';
import { useState } from 'react';
import { Building2, Send, CheckCircle } from 'lucide-react';
import { MovingBanner } from '@/components/public/MovingBanner';

export default function EmployerApplyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ companyName: '', contactName: '', email: '', phone: '', address: '', businessType: '', description: '', jobsToPost: '', website: '' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true);
    await fetch('/api/public/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ applicant_name: form.companyName, applicant_email: form.email, applicant_phone: form.phone, address: form.address, application_type: 'employer', cover_letter: `Company: ${form.companyName}\nContact: ${form.contactName}\nBusiness Type: ${form.businessType}\nWebsite: ${form.website}\nJobs to Post: ${form.jobsToPost}\n\n${form.description}`, status: 'submitted' }) });
    setSubmitted(true); setSubmitting(false);
  }

  return (
    <div>
      <MovingBanner page="employer" title="Post Jobs at Lakefront" badge="For Employers" subtitle="Apply for employer access. Once approved, you'll be invited to post jobs." />
      <div className="bg-[#FAFAF7] py-16"><div className="max-container section-padding max-w-2xl mx-auto">
        {submitted ? (<div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center"><CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" /><h2 className="font-display text-xl font-semibold text-green-800 mb-2">Application Submitted!</h2><p className="text-sm text-green-600 font-body">We'll review and send an invite once approved (1-2 business days).</p></div>
        ) : (<div className="bg-white rounded-xl border border-gray-100 p-8"><div className="flex items-center gap-3 mb-6"><Building2 className="w-8 h-8 text-brand-forest" /><div><h2 className="font-display text-lg font-semibold" style={{ color: '#2C3E2D' }}>Employer Application</h2><p className="text-xs font-body text-gray-400">Access granted by invitation after approval</p></div></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Company Name *</label><input required value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A]" /></div>
              <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Contact Name *</label><input required value={form.contactName} onChange={e => setForm({...form, contactName: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A]" /></div>
              <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Email *</label><input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A]" /></div>
              <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Phone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A]" /></div>
            </div>
            <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Business Address *</label><input required value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A]" /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Business Type</label><select value={form.businessType} onChange={e => setForm({...form, businessType: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A]"><option value="">Select...</option><option>Retail</option><option>Restaurant / Food</option><option>Healthcare</option><option>Professional Services</option><option>Technology</option><option>Construction</option><option>Other</option></select></div>
              <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Website</label><input value={form.website} onChange={e => setForm({...form, website: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A]" placeholder="https://" /></div>
            </div>
            <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">About your business *</label><textarea required rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A] resize-none" /></div>
            <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Jobs to post?</label><input value={form.jobsToPost} onChange={e => setForm({...form, jobsToPost: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A]" placeholder="e.g. 3-5" /></div>
            <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-body font-semibold text-white hover:shadow-lg disabled:opacity-50" style={{ backgroundColor: '#C9B97A' }}>{submitting ? 'Submitting...' : 'Submit Application'}<Send className="w-4 h-4" /></button>
          </form>
        </div>)}
      </div></div>
    </div>
  );
}
