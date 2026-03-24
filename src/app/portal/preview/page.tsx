'use client';
import { useState } from 'react';
import { Users, Building2, Wrench, Warehouse, ShieldCheck, Monitor, Smartphone, ExternalLink } from 'lucide-react';

// Portal Preview — shows actual portal pages scoped to each user role
// Uses iframe to load real portal pages so you see exactly what each role sees after login

const ROLES = [
  {
    key: 'employer',
    label: 'Employer',
    icon: Building2,
    color: 'border-green-200 bg-green-50 text-green-700',
    active: 'bg-green-600 text-white border-green-600',
    desc: 'Business owners who post jobs and manage their company listing',
    pages: [
      { label: 'Job Listings', path: '/portal/jobs', desc: 'View and manage job posts' },
      { label: 'Employer Apply', path: '/jobs/employer-apply', desc: 'Employer application form' },
      { label: 'Applications', path: '/portal/applications/employers', desc: 'Employer applications' },
    ],
  },
  {
    key: 'employee',
    label: 'Employee',
    icon: Users,
    color: 'border-blue-200 bg-blue-50 text-blue-700',
    active: 'bg-blue-600 text-white border-blue-600',
    desc: 'Job seekers looking for employment at Lakefront businesses',
    pages: [
      { label: 'Browse Jobs', path: '/jobs', desc: 'Public job listings page' },
      { label: 'Apply for Job', path: '/apply', desc: 'Employee application form' },
      { label: 'Applications', path: '/portal/applications/employees', desc: 'Employee applications' },
    ],
  },
  {
    key: 'provider',
    label: 'Service Provider',
    icon: Wrench,
    color: 'border-purple-200 bg-purple-50 text-purple-700',
    active: 'bg-purple-600 text-white border-purple-600',
    desc: 'Vendors offering services to the Lakefront community',
    pages: [
      { label: 'Services Directory', path: '/services', desc: 'Public services listing' },
      { label: 'Provider Apply', path: '/apply/provider', desc: 'Provider application form' },
      { label: 'Applications', path: '/portal/applications/providers', desc: 'Provider applications' },
      { label: 'Manage Services', path: '/portal/services', desc: 'Portal service management' },
    ],
  },
  {
    key: 'space',
    label: 'Space Renter',
    icon: Warehouse,
    color: 'border-amber-200 bg-amber-50 text-amber-700',
    active: 'bg-amber-600 text-white border-amber-600',
    desc: 'Businesses renting commercial spaces at Lakefront',
    pages: [
      { label: 'Spaces Directory', path: '/spaces', desc: 'Available spaces' },
      { label: 'Space Apply', path: '/apply/space', desc: 'Space rental application' },
      { label: 'Applications', path: '/portal/applications/spaces', desc: 'Space applications' },
      { label: 'Manage Spaces', path: '/portal/spaces', desc: 'Portal space management' },
    ],
  },
  {
    key: 'admin',
    label: 'Admin',
    icon: ShieldCheck,
    color: 'border-red-200 bg-red-50 text-red-700',
    active: 'bg-red-600 text-white border-red-600',
    desc: 'Full admin access to all portal features',
    pages: [
      { label: 'Approvals', path: '/portal/approvals', desc: 'Approve/reject submissions' },
      { label: 'All Applications', path: '/portal/applications', desc: 'All application types' },
      { label: 'Jobs', path: '/portal/jobs', desc: 'Manage all jobs' },
      { label: 'Businesses', path: '/portal/businesses', desc: 'Business directory' },
      { label: 'Services', path: '/portal/services', desc: 'Service providers' },
      { label: 'Users', path: '/portal/users', desc: 'User management' },
      { label: 'Settings', path: '/portal/settings', desc: 'System settings' },
    ],
  },
];

export default function PortalPreviewPage() {
  const [activeRole, setActiveRole] = useState('employer');
  const [activePage, setActivePage] = useState('/portal/jobs');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  const role = ROLES.find(r => r.key === activeRole)!;

  function switchRole(key: string) {
    setActiveRole(key);
    const r = ROLES.find(r => r.key === key)!;
    setActivePage(r.pages[0].path);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-forest">Portal Preview</h1>
          <p className="text-sm font-body text-gray-400 mt-0.5">Preview what each user type sees after login</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 border border-gray-200 rounded-lg p-1">
            <button onClick={() => setDevice('desktop')} className={`p-1.5 rounded ${device === 'desktop' ? 'bg-brand-forest text-white' : 'text-gray-400'}`}><Monitor className="w-4 h-4" /></button>
            <button onClick={() => setDevice('mobile')} className={`p-1.5 rounded ${device === 'mobile' ? 'bg-brand-forest text-white' : 'text-gray-400'}`}><Smartphone className="w-4 h-4" /></button>
          </div>
          <a href={activePage} target="_blank" className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg text-xs font-body font-semibold hover:bg-gray-50"><ExternalLink className="w-3.5 h-3.5" /> Open</a>
        </div>
      </div>

      {/* Role tabs */}
      <div className="flex gap-2">
        {ROLES.map(r => (
          <button key={r.key} onClick={() => switchRole(r.key)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-body font-semibold border transition-all ${activeRole === r.key ? r.active : r.color}`}>
            <r.icon className="w-3.5 h-3.5" /> {r.label}
          </button>
        ))}
      </div>

      {/* Role description + page tabs */}
      <div className="bg-white rounded-xl border">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <role.icon className="w-5 h-5 text-gray-400" />
            <div>
              <h2 className="text-sm font-body font-semibold text-brand-forest">{role.label} View</h2>
              <p className="text-[10px] font-body text-gray-400">{role.desc}</p>
            </div>
          </div>
        </div>
        <div className="px-4 py-2 bg-gray-50 border-b flex gap-1 overflow-x-auto">
          {role.pages.map(p => (
            <button key={p.path} onClick={() => setActivePage(p.path)} className={`px-3 py-1.5 rounded-lg text-[11px] font-body font-semibold whitespace-nowrap transition-colors ${activePage === p.path ? 'bg-brand-forest text-white' : 'text-gray-500 hover:bg-gray-200'}`}>
              {p.label}
            </button>
          ))}
        </div>
        {/* Live preview iframe */}
        <div className="flex justify-center bg-gray-100 p-4" style={{ minHeight: '60vh' }}>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ width: device === 'mobile' ? '375px' : '100%', maxWidth: '100%' }}>
            <div className="bg-gray-800 px-3 py-1.5 flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <div className="flex-1 ml-2 bg-gray-700 rounded px-2 py-0.5 text-[10px] text-gray-400 font-mono truncate">lakefront-economic-dev.vercel.app{activePage}</div>
            </div>
            <iframe src={activePage} className="border-0 w-full" style={{ height: device === 'mobile' ? '667px' : '55vh' }} title={`${role.label} Preview`} />
          </div>
        </div>
      </div>
    </div>
  );
}
