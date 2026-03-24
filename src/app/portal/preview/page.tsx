'use client';
import { useState } from 'react';
import { Users, Building2, Wrench, Warehouse, ShieldCheck, LayoutDashboard, Briefcase, FileText, ClipboardCheck, Settings, Plug, MessageSquare, Store, Monitor } from 'lucide-react';

// Portal Preview — shows a MOCKUP of what each role sees (not iframe of full admin portal)
// Each role has a limited sidebar and limited pages — NOT the full admin view

type NavItem = { label: string; icon: any; desc: string };

const ROLES: Array<{
  key: string; label: string; icon: any;
  color: string; active: string;
  desc: string;
  sidebar: NavItem[];
}> = [
  {
    key: 'employer', label: 'Employer', icon: Building2,
    color: 'border-green-200 bg-green-50 text-green-700',
    active: 'bg-green-600 text-white border-green-600',
    desc: 'Business owners who post jobs and manage their company profile',
    sidebar: [
      { label: 'Dashboard', icon: LayoutDashboard, desc: 'Overview of jobs posted, applications received, company status' },
      { label: 'My Jobs', icon: Briefcase, desc: 'Jobs you posted — draft, pending approval, published. Create new job posts.' },
      { label: 'Applications Received', icon: FileText, desc: 'People who applied to your jobs — review, shortlist, respond.' },
      { label: 'Company Profile', icon: Building2, desc: 'Your business info, logo, description, website, contact details.' },
    ],
  },
  {
    key: 'employee', label: 'Employee', icon: Users,
    color: 'border-blue-200 bg-blue-50 text-blue-700',
    active: 'bg-blue-600 text-white border-blue-600',
    desc: 'Job seekers looking for employment at Lakefront businesses',
    sidebar: [
      { label: 'Dashboard', icon: LayoutDashboard, desc: 'Overview of your applications, saved jobs, profile completeness.' },
      { label: 'Browse Jobs', icon: Briefcase, desc: 'Search and filter available jobs, apply directly from listings.' },
      { label: 'My Applications', icon: FileText, desc: 'Track all jobs you applied to — submitted, reviewing, interview, offered.' },
      { label: 'My Profile', icon: Users, desc: 'Your resume info, skills, experience, availability, contact details.' },
    ],
  },
  {
    key: 'provider', label: 'Provider', icon: Wrench,
    color: 'border-purple-200 bg-purple-50 text-purple-700',
    active: 'bg-purple-600 text-white border-purple-600',
    desc: 'Vendors and service providers serving the Lakefront community',
    sidebar: [
      { label: 'Dashboard', icon: LayoutDashboard, desc: 'Service listing status, inquiries received, profile completeness.' },
      { label: 'My Services', icon: Wrench, desc: 'Your active services in the directory — edit, update, manage.' },
      { label: 'Inquiries', icon: MessageSquare, desc: 'Messages and contact requests from the community.' },
      { label: 'Provider Profile', icon: Users, desc: 'Business info, service categories, certifications, portfolio.' },
    ],
  },
  {
    key: 'space', label: 'Space Renter', icon: Warehouse,
    color: 'border-amber-200 bg-amber-50 text-amber-700',
    active: 'bg-amber-600 text-white border-amber-600',
    desc: 'Businesses renting commercial space at Lakefront',
    sidebar: [
      { label: 'Dashboard', icon: LayoutDashboard, desc: 'Space rental status, lease info, payment overview.' },
      { label: 'My Space', icon: Warehouse, desc: 'Details of your rented space — location, sqft, lease terms, photos.' },
      { label: 'Maintenance', icon: Settings, desc: 'Submit and track maintenance or service requests for your space.' },
      { label: 'Lease Documents', icon: FileText, desc: 'View lease agreement, renewal dates, payment history.' },
    ],
  },
  {
    key: 'admin', label: 'Admin', icon: ShieldCheck,
    color: 'border-red-200 bg-red-50 text-red-700',
    active: 'bg-red-600 text-white border-red-600',
    desc: 'Full access to manage everything — approvals, users, integrations',
    sidebar: [
      { label: 'Dashboard', icon: LayoutDashboard, desc: 'System-wide overview of all activity.' },
      { label: 'Approvals', icon: ClipboardCheck, desc: 'Approve/reject all pending applications, jobs, accounts.' },
      { label: 'Jobs', icon: Briefcase, desc: 'Manage all job posts across all employers.' },
      { label: 'Applications', icon: FileText, desc: 'View all applications — employee, employer, provider, space.' },
      { label: 'Businesses', icon: Building2, desc: 'Business directory management.' },
      { label: 'Services', icon: Wrench, desc: 'Service provider management.' },
      { label: 'Spaces', icon: Warehouse, desc: 'Space rental management.' },
      { label: 'Users', icon: Users, desc: 'Manage portal users, invite, roles, approve accounts.' },
      { label: 'Kleegr Integration', icon: Plug, desc: 'Sync settings, field config, contact/job sync.' },
      { label: 'Settings', icon: Settings, desc: 'System settings, job fields config, integrations.' },
      { label: 'Portal Preview', icon: Monitor, desc: 'Preview what each role sees (this page).' },
    ],
  },
];

export default function PortalPreviewPage() {
  const [activeRole, setActiveRole] = useState('employer');
  const [activeIdx, setActiveIdx] = useState(0);
  const role = ROLES.find(r => r.key === activeRole)!;
  const activePage = role.sidebar[activeIdx] || role.sidebar[0];

  function switchRole(key: string) {
    setActiveRole(key);
    setActiveIdx(0);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-forest">Portal Preview</h1>
        <p className="text-sm font-body text-gray-400 mt-0.5">See exactly what each user type sees after they log in &mdash; limited to only their pages</p>
      </div>

      {/* Role tabs */}
      <div className="flex gap-2 flex-wrap">
        {ROLES.map(r => (
          <button key={r.key} onClick={() => switchRole(r.key)} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-body font-semibold border transition-all ${activeRole === r.key ? r.active : r.color}`}>
            <r.icon className="w-3.5 h-3.5" /> {r.label}
          </button>
        ))}
      </div>

      {/* Mockup */}
      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        {/* Browser chrome */}
        <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 ml-3 bg-gray-700 rounded-md px-3 py-1 text-[11px] text-gray-400 font-mono">
            lakefront-economic-dev.vercel.app/portal/{activeRole === 'admin' ? 'dashboard' : activeRole + '/dashboard'}
          </div>
        </div>

        {/* Portal mockup with sidebar + content */}
        <div className="flex" style={{ minHeight: '480px' }}>
          {/* Sidebar mockup */}
          <div className="w-56 shrink-0" style={{ background: 'linear-gradient(180deg, #1e2d1f 0%, #243326 100%)' }}>
            <div className="px-4 py-3.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(201,185,122,0.15)' }}>
                  <span className="text-xs font-display font-bold" style={{ color: '#C9B97A' }}>L</span>
                </div>
                <div>
                  <span className="font-display text-sm font-bold text-white block leading-none">Lakefront</span>
                  <span className="text-[8px] font-body text-white/25 uppercase tracking-widest">{role.label} Portal</span>
                </div>
              </div>
            </div>
            <div className="p-3 space-y-0.5">
              {role.sidebar.map((item, i) => (
                <button key={i} onClick={() => setActiveIdx(i)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-body text-left transition-all ${activeIdx === i ? 'bg-white/10 text-white font-semibold' : 'text-white/40 hover:text-white/60 hover:bg-white/5'}`}>
                  <item.icon className={`w-4 h-4 shrink-0 ${activeIdx === i ? 'text-[#C9B97A]' : ''}`} />
                  {item.label}
                </button>
              ))}
            </div>
            <div className="mt-auto p-3 border-t border-white/10">
              <div className="flex items-center gap-2 px-2">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/50 font-bold">
                  {role.label[0]}
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] text-white/60 font-body truncate">{role.label} User</div>
                  <div className="text-[9px] text-white/25 font-body">user@lakefront.com</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 bg-gray-50">
            {/* Top bar */}
            <div className="h-12 bg-white border-b border-gray-100 flex items-center px-5">
              <h2 className="text-sm font-body font-semibold text-gray-700">{activePage.label}</h2>
            </div>
            {/* Page content placeholder */}
            <div className="p-6">
              <div className="max-w-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                    <activePage.icon className="w-6 h-6 text-gray-300" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-brand-forest">{activePage.label}</h3>
                    <p className="text-xs font-body text-gray-400">{role.label} Portal</p>
                  </div>
                </div>
                <p className="text-sm font-body text-gray-500 leading-relaxed mb-6">{activePage.desc}</p>

                {/* Fake content blocks */}
                <div className="space-y-3">
                  <div className="bg-white rounded-lg border border-gray-100 p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gray-100" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                      <div className="h-2 bg-gray-50 rounded w-1/2" />
                    </div>
                    <div className="h-6 w-16 bg-green-50 rounded-full" />
                  </div>
                  <div className="bg-white rounded-lg border border-gray-100 p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gray-100" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-100 rounded w-2/3" />
                      <div className="h-2 bg-gray-50 rounded w-2/5" />
                    </div>
                    <div className="h-6 w-16 bg-blue-50 rounded-full" />
                  </div>
                  <div className="bg-white rounded-lg border border-gray-100 p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gray-100" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-100 rounded w-4/5" />
                      <div className="h-2 bg-gray-50 rounded w-1/3" />
                    </div>
                    <div className="h-6 w-16 bg-amber-50 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs font-body text-blue-700">
        <strong>Note:</strong> This preview shows what each user type will see after logging in. Employers only see their jobs and applications. Employees only see job listings and their applications. Providers see their services. Space renters see their lease info. Only admins see everything.
      </div>
    </div>
  );
}
