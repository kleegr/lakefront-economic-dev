'use client';
import { useState } from 'react';
import { Users, Building2, Wrench, Warehouse, Briefcase, FileText, ClipboardList, Settings, BarChart3, ShieldCheck } from 'lucide-react';

// PORTAL PREVIEW: Shows what each user type sees AFTER login in the internal portal
// NOT the public website — these are internal portal views

const ROLE_PREVIEWS = [
  {
    key: 'employer',
    label: 'Employer',
    icon: Building2,
    color: 'bg-green-50 text-green-700 border-green-200',
    activeColor: 'bg-green-600 text-white',
    description: 'Business owners who post jobs and manage their company listing',
    sections: [
      { name: 'Dashboard', desc: 'Overview of their jobs, applications received, company profile status', icon: BarChart3 },
      { name: 'My Jobs', desc: 'List of all jobs they posted, with status (draft, pending approval, published)', icon: Briefcase },
      { name: 'Applications Received', desc: 'Applicants who applied to their jobs, with status tracking', icon: ClipboardList },
      { name: 'Company Profile', desc: 'Their business info, logo, description, website, contact details', icon: Building2 },
      { name: 'Post New Job', desc: 'Form to create a new job listing (goes to approval before publishing)', icon: FileText },
    ],
  },
  {
    key: 'employee',
    label: 'Employee',
    icon: Users,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    activeColor: 'bg-blue-600 text-white',
    description: 'Job seekers looking for employment at Lakefront businesses',
    sections: [
      { name: 'Dashboard', desc: 'Overview of their applications, saved jobs, profile completeness', icon: BarChart3 },
      { name: 'My Applications', desc: 'All jobs they applied to, current status (submitted, reviewing, interview, offered)', icon: ClipboardList },
      { name: 'Browse Jobs', desc: 'Search and filter available jobs, apply directly', icon: Briefcase },
      { name: 'My Profile', desc: 'Their resume info, skills, experience, availability, contact details', icon: Users },
    ],
  },
  {
    key: 'provider',
    label: 'Service Provider',
    icon: Wrench,
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    activeColor: 'bg-purple-600 text-white',
    description: 'Vendors and service providers serving the Lakefront community',
    sections: [
      { name: 'Dashboard', desc: 'Overview of their service listing status, inquiries received', icon: BarChart3 },
      { name: 'My Services', desc: 'Their active services listed in the directory', icon: Wrench },
      { name: 'Inquiries', desc: 'Messages and contact requests from the community', icon: ClipboardList },
      { name: 'Provider Profile', desc: 'Business info, service categories, portfolio, certifications', icon: FileText },
    ],
  },
  {
    key: 'space',
    label: 'Space Renter',
    icon: Warehouse,
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    activeColor: 'bg-amber-600 text-white',
    description: 'Businesses renting commercial spaces at Lakefront',
    sections: [
      { name: 'Dashboard', desc: 'Overview of their space rental, lease status, payments', icon: BarChart3 },
      { name: 'My Space', desc: 'Details of their rented space — location, sqft, lease terms', icon: Warehouse },
      { name: 'Maintenance Requests', desc: 'Submit and track maintenance or service requests for their space', icon: Settings },
      { name: 'Lease Documents', desc: 'View lease agreement, renewal dates, payment history', icon: FileText },
    ],
  },
  {
    key: 'admin',
    label: 'Admin',
    icon: ShieldCheck,
    color: 'bg-red-50 text-red-700 border-red-200',
    activeColor: 'bg-red-600 text-white',
    description: 'Lakefront administrators who manage everything',
    sections: [
      { name: 'Approval Dashboard', desc: 'Review and approve/reject all pending applications, jobs, accounts', icon: ShieldCheck },
      { name: 'All Applications', desc: 'View all applications by type — employee, employer, provider, space', icon: ClipboardList },
      { name: 'Jobs Management', desc: 'All job posts, edit, approve, sync to Kleegr', icon: Briefcase },
      { name: 'Businesses / Services / Spaces', desc: 'Manage all directory listings', icon: Building2 },
      { name: 'Users & Access', desc: 'Manage portal users, invite, roles, approve accounts', icon: Users },
      { name: 'Kleegr Integration', desc: 'Sync settings, field config, contact/job sync', icon: Settings },
    ],
  },
];

export default function PortalPreviewPage() {
  const [activeRole, setActiveRole] = useState('employer');
  const role = ROLE_PREVIEWS.find(r => r.key === activeRole)!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-forest">Portal Preview</h1>
        <p className="text-sm font-body text-gray-400 mt-1">See what each user type sees after they log into the portal</p>
      </div>

      {/* Role selector */}
      <div className="flex gap-2">
        {ROLE_PREVIEWS.map(r => (
          <button key={r.key} onClick={() => setActiveRole(r.key)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-body font-semibold transition-all border ${activeRole === r.key ? r.activeColor + ' border-transparent shadow-sm' : r.color}`}>
            <r.icon className="w-4 h-4" /> {r.label}
          </button>
        ))}
      </div>

      {/* Role description */}
      <div className={`rounded-xl border p-5 ${role.color}`}>
        <div className="flex items-center gap-3 mb-2">
          <role.icon className="w-6 h-6" />
          <h2 className="font-display text-lg font-bold">{role.label} Portal View</h2>
        </div>
        <p className="text-sm font-body opacity-80">{role.description}</p>
      </div>

      {/* Portal sections for this role */}
      <div className="space-y-3">
        <h3 className="text-xs font-body font-semibold text-gray-400 uppercase tracking-wider">What they see after login</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {role.sections.map((section, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                  <section.icon className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h4 className="font-body text-sm font-semibold text-brand-forest">{section.name}</h4>
                  <p className="text-xs font-body text-gray-500 mt-1 leading-relaxed">{section.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual mockup of sidebar */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b">
          <h3 className="text-xs font-body font-semibold text-gray-400 uppercase tracking-wider">Sidebar Navigation Preview</h3>
        </div>
        <div className="flex">
          <div className="w-56 bg-[#1e2d1f] p-4 min-h-[300px]">
            <div className="mb-6">
              <span className="text-white font-display text-lg">Lakefront</span>
              <span className="block text-[8px] uppercase tracking-widest text-white/30">Estates &amp; Villas</span>
            </div>
            <div className="space-y-1">
              {role.sections.map((section, i) => (
                <div key={i} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-body ${i === 0 ? 'bg-white/10 text-white font-semibold' : 'text-white/50 hover:text-white/70'}`}>
                  <section.icon className="w-3.5 h-3.5" />
                  {section.name}
                </div>
              ))}
            </div>
            <div className="mt-8 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 px-3 text-white/30 text-[10px] font-body">
                <div className="w-6 h-6 rounded-full bg-white/10" />
                <div>
                  <div className="text-white/50 font-semibold">{role.label} User</div>
                  <div>user@example.com</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 p-8">
            <div className="text-center py-12">
              <role.icon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-gray-300 mb-2">{role.sections[0].name}</h3>
              <p className="text-sm text-gray-400 font-body max-w-md mx-auto">{role.sections[0].desc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
