import Link from 'next/link';
import { Briefcase, FileText, Building2, Wrench, TrendingUp, Warehouse, ArrowUpRight, ArrowRight, Users, Clock } from 'lucide-react';
import { mockJobs, mockApplications, mockBusinesses, mockProviders, mockInvestors, mockSpaces } from '@/lib/mock-data';

const stats = [
  { label:'Active Jobs', value:mockJobs.filter(j => j.status === 'published').length, icon:Briefcase, href:'/portal/jobs', color:'text-blue-600 bg-blue-50' },
  { label:'Applications', value:mockApplications.length, icon:FileText, href:'/portal/applications', color:'text-purple-600 bg-purple-50' },
  { label:'Businesses', value:mockBusinesses.length, icon:Building2, href:'/portal/businesses', color:'text-green-600 bg-green-50' },
  { label:'Providers', value:mockProviders.length, icon:Wrench, href:'/portal/services', color:'text-orange-600 bg-orange-50' },
  { label:'Investors', value:mockInvestors.length, icon:TrendingUp, href:'/portal/investors', color:'text-emerald-600 bg-emerald-50' },
  { label:'Spaces', value:mockSpaces.filter(s => s.status === 'available').length, icon:Warehouse, href:'/portal/spaces', color:'text-sky-600 bg-sky-50' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-display font-bold text-brand-text">Dashboard</h1><p className="text-sm font-body text-brand-muted mt-1">Overview of Lakefront Economic Development operations.</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map(stat => (
          <Link key={stat.label} href={stat.href} className="card-portal p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-3"><div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center`}><stat.icon className="w-4.5 h-4.5" /></div><ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" /></div>
            <div className="text-2xl font-display font-bold text-brand-text">{stat.value}</div>
            <div className="text-xs font-body text-brand-muted mt-0.5">{stat.label}</div>
          </Link>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-portal">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100"><h2 className="text-base font-display font-semibold text-brand-text">Recent Applications</h2><Link href="/portal/applications" className="text-xs font-body font-semibold text-portal-accent hover:text-brand-light flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></Link></div>
          <div className="divide-y divide-gray-50">
            {mockApplications.slice(0,5).map(app => (
              <div key={app.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="min-w-0"><p className="text-sm font-body font-medium text-brand-text truncate">{app.applicantName}</p><p className="text-xs font-body text-brand-muted truncate">{app.jobTitle}</p></div>
                <div className="flex items-center gap-3 shrink-0"><span className={`px-2 py-0.5 text-xs font-body font-medium rounded-full ${app.status === 'new' ? 'bg-blue-50 text-blue-700' : app.status === 'reviewing' ? 'bg-yellow-50 text-yellow-700' : app.status === 'interview' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{app.status}</span><span className="text-xs font-body text-brand-muted flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(app.dateApplied).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span></div>
              </div>
            ))}
          </div>
        </div>
        <div className="card-portal">
          <div className="px-5 py-4 border-b border-gray-100"><h2 className="text-base font-display font-semibold text-brand-text">Quick Actions</h2></div>
          <div className="p-5 grid grid-cols-2 gap-3">
            {[{label:'Post New Job',href:'/portal/jobs/new',icon:Briefcase},{label:'Add Business',href:'/portal/businesses/new',icon:Building2},{label:'Review Applications',href:'/portal/applications',icon:FileText},{label:'Manage Spaces',href:'/portal/spaces',icon:Warehouse},{label:'Investor Leads',href:'/portal/investors',icon:TrendingUp},{label:'Manage Users',href:'/portal/users',icon:Users}].map(action => (
              <Link key={action.href} href={action.href} className="flex items-center gap-3 p-3.5 rounded-lg border border-gray-200 hover:bg-portal-hover hover:border-portal-accent/20 transition-all group">
                <action.icon className="w-4.5 h-4.5 text-portal-accent shrink-0" /><span className="text-sm font-body font-medium text-brand-text group-hover:text-portal-accent transition-colors">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="card-portal">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100"><h2 className="text-base font-display font-semibold text-brand-text">Active Job Listings</h2><Link href="/portal/jobs" className="text-xs font-body font-semibold text-portal-accent hover:text-brand-light flex items-center gap-1">Manage Jobs <ArrowRight className="w-3 h-3" /></Link></div>
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-gray-100"><th className="text-left px-5 py-3 font-body font-medium text-brand-muted text-xs uppercase tracking-wider">Title</th><th className="text-left px-5 py-3 font-body font-medium text-brand-muted text-xs uppercase tracking-wider">Employer</th><th className="text-left px-5 py-3 font-body font-medium text-brand-muted text-xs uppercase tracking-wider">Type</th><th className="text-left px-5 py-3 font-body font-medium text-brand-muted text-xs uppercase tracking-wider">Apps</th><th className="text-left px-5 py-3 font-body font-medium text-brand-muted text-xs uppercase tracking-wider">Status</th></tr></thead><tbody className="divide-y divide-gray-50">{mockJobs.map(job => (<tr key={job.id} className="hover:bg-gray-50/50 transition-colors"><td className="px-5 py-3.5 font-body font-medium text-brand-text">{job.title}</td><td className="px-5 py-3.5 font-body text-brand-muted">{job.employerName}</td><td className="px-5 py-3.5"><span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-body font-medium rounded-full capitalize">{job.type.replace('-',' ')}</span></td><td className="px-5 py-3.5 font-body text-brand-text">{job.applicationCount}</td><td className="px-5 py-3.5"><span className={`px-2 py-0.5 text-xs font-body font-medium rounded-full ${job.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{job.status}</span></td></tr>))}</tbody></table></div>
      </div>
    </div>
  );
}
