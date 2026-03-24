'use client';
import { useState } from 'react';
import { Globe, ExternalLink, Monitor, Smartphone, Users, Building2, Wrench, Warehouse, Briefcase } from 'lucide-react';

// PORTAL PREVIEW: Shows how different portals look for different user types
// Not the full public website — shows internal portal views for employer, employee, provider, space
const PREVIEW_SECTIONS = [
  { key: 'employer', label: 'Employer Portal', icon: Building2, description: 'How employers see the portal after login', color: 'bg-green-50 text-green-700',
    pages: ['/employer/dashboard', '/jobs/employer-apply'] },
  { key: 'employee', label: 'Employee View', icon: Users, description: 'What job seekers see on the website', color: 'bg-blue-50 text-blue-700',
    pages: ['/jobs', '/apply'] },
  { key: 'provider', label: 'Provider View', icon: Wrench, description: 'What service providers see', color: 'bg-purple-50 text-purple-700',
    pages: ['/services', '/apply/provider'] },
  { key: 'space', label: 'Space Applicant', icon: Warehouse, description: 'What space renters see', color: 'bg-amber-50 text-amber-700',
    pages: ['/spaces', '/apply/space'] },
  { key: 'public', label: 'Public Website', icon: Globe, description: 'Full public-facing website', color: 'bg-gray-50 text-gray-700',
    pages: ['/', '/about', '/jobs', '/spaces', '/services', '/commercial', '/contact'] },
];

export default function PortalPreviewPage() {
  const [activeSection, setActiveSection] = useState('employer');
  const [url, setUrl] = useState('/jobs/employer-apply');
  const [device, setDevice] = useState<'desktop'|'mobile'>('desktop');

  const section = PREVIEW_SECTIONS.find(s => s.key === activeSection);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-bold text-brand-forest">Portal Preview</h1><p className="text-sm font-body text-gray-400">See how the portal looks for different user types</p></div>
        <a href={url} target="_blank" className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-500 rounded-lg text-sm font-body font-semibold hover:bg-gray-50"><ExternalLink className="w-4 h-4" /> Open</a>
      </div>

      {/* User Type Cards */}
      <div className="grid grid-cols-5 gap-3">
        {PREVIEW_SECTIONS.map(s => (
          <button key={s.key} onClick={() => { setActiveSection(s.key); setUrl(s.pages[0]); }} className={`p-3 rounded-xl border text-left transition-all ${activeSection === s.key ? 'border-brand-forest bg-brand-forest/5 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
            <s.icon className={`w-5 h-5 mb-2 ${activeSection === s.key ? 'text-brand-forest' : 'text-gray-300'}`} />
            <h3 className={`text-xs font-body font-semibold ${activeSection === s.key ? 'text-brand-forest' : 'text-gray-500'}`}>{s.label}</h3>
            <p className="text-[10px] font-body text-gray-400 mt-0.5">{s.description}</p>
          </button>
        ))}
      </div>

      {/* Page selector + device toggle */}
      <div className="flex items-center gap-3 bg-white rounded-xl border p-3">
        <div className="flex gap-1">
          <button onClick={() => setDevice('desktop')} className={`p-2 rounded-lg ${device === 'desktop' ? 'bg-brand-forest text-white' : 'text-gray-400 hover:bg-gray-100'}`}><Monitor className="w-4 h-4" /></button>
          <button onClick={() => setDevice('mobile')} className={`p-2 rounded-lg ${device === 'mobile' ? 'bg-brand-forest text-white' : 'text-gray-400 hover:bg-gray-100'}`}><Smartphone className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"><Globe className="w-4 h-4 text-gray-300" /><input value={url} onChange={e => setUrl(e.target.value)} className="flex-1 bg-transparent text-sm font-body focus:outline-none" /></div>
        <div className="flex gap-1">
          {section?.pages.map(p => (<button key={p} onClick={() => setUrl(p)} className={`px-2.5 py-1.5 text-[10px] font-body rounded-lg ${url === p ? 'bg-brand-forest text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{p === '/' ? 'Home' : p.split('/').pop()}</button>))}
        </div>
      </div>

      {/* Preview iframe */}
      <div className="bg-white rounded-xl border overflow-hidden flex justify-center" style={{ minHeight: '65vh' }}>
        <iframe src={url} className="border-0" style={{ width: device === 'mobile' ? '375px' : '100%', height: '65vh', maxWidth: '100%' }} title="Preview" />
      </div>
    </div>
  );
}
