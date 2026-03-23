'use client';
import { useState } from 'react';
import { Briefcase, Users, Building2, Globe, ExternalLink } from 'lucide-react';

const PREVIEWS = [
  { label: 'Public Homepage', url: '/', icon: Globe, color: 'bg-gray-100 text-gray-700', desc: 'What visitors see' },
  { label: 'Public Jobs Board', url: '/jobs', icon: Briefcase, color: 'bg-gray-100 text-gray-700', desc: 'Public job listings' },
  { label: 'Public Apply Page', url: '/apply', icon: Users, color: 'bg-gray-100 text-gray-700', desc: 'Application entry point' },
  { label: 'Public Feedback Form', url: '/feedback', icon: Users, color: 'bg-gray-100 text-gray-700', desc: 'Suggestion / comment form' },
  { label: 'Public Business Application', url: '/business-apply', icon: Building2, color: 'bg-gray-100 text-gray-700', desc: 'Storefront application' },
  { label: 'Login Page', url: '/auth/login', icon: Users, color: 'bg-amber-50 text-amber-700', desc: 'What users see when signing in' },
  { label: 'Applicant Dashboard', url: '/applicant/dashboard', icon: Users, color: 'bg-blue-50 text-blue-700', desc: 'Resident portal home' },
  { label: 'Applicant Household', url: '/applicant/household', icon: Users, color: 'bg-blue-50 text-blue-700', desc: 'Household member management' },
  { label: 'Applicant Browse Jobs', url: '/applicant/jobs', icon: Briefcase, color: 'bg-blue-50 text-blue-700', desc: 'Job browsing + batch apply' },
  { label: 'Applicant Saved Jobs', url: '/applicant/saved', icon: Briefcase, color: 'bg-blue-50 text-blue-700', desc: 'Saved/favorited jobs' },
  { label: 'Applicant Applications', url: '/applicant/applications', icon: Briefcase, color: 'bg-blue-50 text-blue-700', desc: 'Application history' },
  { label: 'Applicant Resume Builder', url: '/applicant/resume', icon: Users, color: 'bg-blue-50 text-blue-700', desc: 'AI-assisted resume' },
  { label: 'Employer Dashboard', url: '/employer/dashboard', icon: Building2, color: 'bg-green-50 text-green-700', desc: 'Employer portal home' },
  { label: 'Employer Jobs', url: '/employer/jobs', icon: Briefcase, color: 'bg-green-50 text-green-700', desc: 'Job posting + management' },
  { label: 'Employer Applications', url: '/employer/applications', icon: Users, color: 'bg-green-50 text-green-700', desc: 'Applicant review per job' },
  { label: 'Employer Candidates', url: '/employer/candidates', icon: Users, color: 'bg-green-50 text-green-700', desc: 'Candidate search' },
  { label: 'Employer Business Profile', url: '/employer/business', icon: Building2, color: 'bg-green-50 text-green-700', desc: 'Business info' },
  { label: 'Employer Approvals', url: '/employer/approvals', icon: Briefcase, color: 'bg-green-50 text-green-700', desc: 'Pending approval status' },
];

export default function PreviewPage() {
  const [active, setActive] = useState<string|null>(null);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-forest mb-1">Portal Preview</h1>
      <p className="text-sm font-body text-gray-500 mb-6">See exactly what each portal and page looks like. Click any card to preview in an iframe below.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {PREVIEWS.map(p => (
          <button key={p.url} onClick={() => setActive(p.url)} className={`text-left p-4 rounded-xl border transition-all ${active === p.url ? 'border-brand-forest ring-2 ring-brand-sage/30 bg-white' : 'border-gray-200 bg-white hover:border-brand-sage/30'}`}>
            <div className={`w-8 h-8 rounded-lg ${p.color} flex items-center justify-center mb-2`}><p.icon className="w-4 h-4" /></div>
            <div className="font-semibold text-brand-forest text-xs font-body">{p.label}</div>
            <div className="text-[10px] text-gray-400 font-body mt-0.5">{p.desc}</div>
          </button>
        ))}
      </div>

      {active && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
            <div className="flex items-center gap-2">
              <div className="flex gap-1"><div className="w-2.5 h-2.5 rounded-full bg-red-400" /><div className="w-2.5 h-2.5 rounded-full bg-amber-400" /><div className="w-2.5 h-2.5 rounded-full bg-green-400" /></div>
              <span className="text-xs font-body text-gray-500 ml-2">{active}</span>
            </div>
            <div className="flex items-center gap-2">
              <a href={active} target="_blank" rel="noopener noreferrer" className="text-xs font-body text-brand-sage hover:text-brand-forest flex items-center gap-1"><ExternalLink className="w-3 h-3" />Open in new tab</a>
              <button onClick={() => setActive(null)} className="text-xs font-body text-gray-400 hover:text-red-500">Close</button>
            </div>
          </div>
          <iframe src={active} className="w-full border-0" style={{ height: '70vh' }} title="Preview" />
        </div>
      )}

      {!active && (
        <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <Globe className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400 font-body">Click any card above to preview that page</p>
        </div>
      )}
    </div>
  );
}
