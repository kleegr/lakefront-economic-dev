'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, Briefcase, CheckCircle, Clock, Mail, Phone, ChevronDown } from 'lucide-react';

type R = Record<string,unknown>;
const g = (r:R,k:string):string => (r[k] as string)||'';

export default function EmployerApplicantsPage() {
  const [assignments, setAssignments] = useState<R[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string|null>(null);
  const supabase = createClient();

  useEffect(() => { load(); }, []);
  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('lf_job_assignments').select(`*, job:lf_jobs(id, title, company_name, status, salary_range, job_type), employee:lf_profiles!lf_job_assignments_employee_id_fkey(id, full_name, email, phone, role), application:lf_applications(id, status, applicant_name, applicant_email, applicant_phone, created_at, cover_letter)`).eq('employer_id', user.id).eq('role', 'employee').order('created_at', { ascending: false });
    setAssignments(data || []); setLoading(false);
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;
  const active = assignments.filter(a => g(a,'status') === 'active');
  const completed = assignments.filter(a => g(a,'status') !== 'active');

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-forest mb-1">My Team</h1>
      <p className="text-sm font-body text-gray-500 mb-6">Employees hired through your job postings are automatically listed here</p>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4 text-center"><div className="text-2xl font-display font-bold text-brand-forest">{active.length}</div><p className="text-xs text-gray-400">Active Hires</p></div>
        <div className="bg-white rounded-xl border p-4 text-center"><div className="text-2xl font-display font-bold text-brand-forest">{completed.length}</div><p className="text-xs text-gray-400">Past / Completed</p></div>
      </div>
      {assignments.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center"><User className="w-10 h-10 text-gray-200 mx-auto mb-3" /><p className="text-gray-400 font-body text-sm">No hired employees yet.</p><p className="text-gray-300 font-body text-xs mt-1">When you mark an applicant as \"Hired\" or \"Offered\", they'll automatically appear here linked to the job.</p></div>
      ) : (
        <div className="space-y-3">{assignments.map(a => {
          const job = (a.job as R) || {}; const emp = (a.employee as R) || {}; const app = (a.application as R) || {};
          const isActive = g(a, 'status') === 'active';
          return (<div key={g(a,'id')} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50/50" onClick={() => setExpandedId(expandedId === g(a,'id') ? null : g(a,'id'))}>
              <div className="w-10 h-10 rounded-full bg-brand-sage/10 flex items-center justify-center shrink-0"><User className="w-5 h-5 text-brand-forest" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5"><h3 className="font-display text-base font-semibold text-brand-forest truncate">{g(emp, 'full_name') || g(app, 'applicant_name') || 'Employee'}</h3><span className={`px-2 py-0.5 text-[10px] rounded-full font-semibold ${isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{isActive ? 'Active' : g(a, 'status')}</span></div>
                <div className="flex items-center gap-3 text-xs text-gray-400 font-body"><span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{g(job, 'title') || 'Job'}</span>{g(emp, 'email') && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{g(emp, 'email')}</span>}</div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform ${expandedId === g(a,'id') ? 'rotate-180' : ''}`} />
            </div>
            {expandedId === g(a,'id') && (<div className="border-t border-gray-100 p-4 bg-gray-50/30 space-y-2 text-xs font-body">
              <div className="grid sm:grid-cols-2 gap-3">
                <div><span className="text-gray-400 uppercase tracking-wider">Job</span><p className="text-brand-forest font-semibold mt-0.5">{g(job, 'title')}</p></div>
                <div><span className="text-gray-400 uppercase tracking-wider">Salary Range</span><p className="text-brand-forest font-semibold mt-0.5">{g(job, 'salary_range') || '\u2014'}</p></div>
                <div><span className="text-gray-400 uppercase tracking-wider">Email</span><p className="text-brand-forest font-semibold mt-0.5">{g(emp, 'email') || g(app, 'applicant_email') || '\u2014'}</p></div>
                <div><span className="text-gray-400 uppercase tracking-wider">Phone</span><p className="text-brand-forest font-semibold mt-0.5">{g(emp, 'phone') || g(app, 'applicant_phone') || '\u2014'}</p></div>
                <div><span className="text-gray-400 uppercase tracking-wider">Assigned</span><p className="text-brand-forest font-semibold mt-0.5">{g(a, 'assigned_at') ? new Date(g(a,'assigned_at')).toLocaleDateString() : '\u2014'}</p></div>
                <div><span className="text-gray-400 uppercase tracking-wider">Application Status</span><p className="text-brand-forest font-semibold mt-0.5">{g(app, 'status') || '\u2014'}</p></div>
              </div>
              {g(app, 'cover_letter') && <div className="mt-2"><span className="text-gray-400 uppercase tracking-wider">Application Notes</span><p className="text-gray-600 mt-1 whitespace-pre-wrap">{g(app, 'cover_letter')}</p></div>}
              {g(a, 'notes') && <div className="mt-2"><span className="text-gray-400 uppercase tracking-wider">Assignment Notes</span><p className="text-gray-600 mt-1">{g(a, 'notes')}</p></div>}
            </div>)}
          </div>);
        })}</div>
      )}
    </div>
  );
}
