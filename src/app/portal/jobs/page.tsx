'use client';
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, X, Briefcase, Building2, MapPin, DollarSign, Clock, CheckCircle, ChevronDown, Search, Filter } from 'lucide-react';

const CATEGORIES = ['General', 'Retail', 'Healthcare', 'Food Service', 'Maintenance', 'Security', 'Education', 'Professional Services', 'Technology', 'Construction', 'Management', 'Marketing', 'Other'];
const JOB_TYPES = ['full-time', 'part-time', 'contract', 'seasonal', 'internship'];
const WORK_MODES = ['on_site', 'remote', 'hybrid'];
const COMP_TYPES = ['salary', 'hourly', 'commission', 'base_commission', 'other'];
const VIS_OPTIONS = [{ v: 'public', l: 'Public' }, { v: 'signed_in', l: 'Signed-in' }, { v: 'admin_only', l: 'Admin Only' }];

function fmt(s: string) { return (s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', company_name: '', location: 'Lakefront Estates, Okeechobee, FL',
    job_type: 'full-time', salary_range: '', requirements: '', benefits: '',
    category: 'General', compensation_type: 'salary', work_mode: 'on_site',
    department: '', status: 'published', visibility: 'public', closing_date: '',
    openings_count: 1, special_offer: '',
  });

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch('/api/jobs?admin=true');
    const data = await res.json();
    setJobs(data.jobs || []); setLoading(false);
  }

  function openNew() {
    setEditingJob(null);
    setForm({
      title: '', description: '', company_name: '', location: 'Lakefront Estates, Okeechobee, FL',
      job_type: 'full-time', salary_range: '', requirements: '', benefits: '',
      category: 'General', compensation_type: 'salary', work_mode: 'on_site',
      department: '', status: 'published', visibility: 'public', closing_date: '',
      openings_count: 1, special_offer: '',
    });
    setShowForm(true);
  }

  function openEdit(job: any) {
    setEditingJob(job);
    setForm({
      title: job.title || '', description: job.description || '', company_name: job.company_name || '',
      location: job.location || '', job_type: job.job_type || 'full-time',
      salary_range: job.salary_range || '', requirements: job.requirements || '',
      benefits: job.benefits || '', category: job.category || 'General',
      compensation_type: job.compensation_type || 'salary', work_mode: job.work_mode || 'on_site',
      department: job.department || '', status: job.status || 'draft',
      visibility: job.visibility || 'public', closing_date: job.closing_date || '',
      openings_count: job.openings_count || 1, special_offer: job.special_offer || '',
    });
    setShowForm(true);
  }

  async function saveJob(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = editingJob ? `/api/jobs/${editingJob.id}` : '/api/jobs';
    const method = editingJob ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { setShowForm(false); load(); }
    else { const d = await res.json(); alert(d.error || 'Failed'); }
    setSaving(false);
  }

  async function deleteJob(id: string) {
    if (!confirm('Delete this job permanently?')) return;
    await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
    load();
  }

  async function toggleStatus(id: string, current: string) {
    const newStatus = current === 'published' ? 'draft' : 'published';
    await fetch(`/api/jobs/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
    load();
  }

  const filtered = jobs.filter(j => {
    if (search && !(j.title || '').toLowerCase().includes(search.toLowerCase()) && !(j.company_name || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-forest">Jobs Management</h1>
          <p className="text-sm font-body text-gray-400 mt-1">{jobs.length} total jobs &middot; {jobs.filter(j => j.status === 'published').length} published</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold hover:bg-brand-forest/90 transition-colors">
          <Plus className="w-4 h-4" /> New Job
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-brand-sage" />
      </div>

      {/* Jobs List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <Briefcase className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-body">No jobs found</p>
          </div>
        ) : filtered.map(job => (
          <div key={job.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {/* Job row */}
            <div className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50/50 transition-colors" onClick={() => setExpandedId(expandedId === job.id ? null : job.id)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display text-base font-semibold text-brand-forest truncate">{job.title}</h3>
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-semibold uppercase ${job.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{job.status}</span>
                  {job.ghl_synced_at ? <span className="px-2 py-0.5 text-[10px] rounded-full font-semibold bg-blue-50 text-blue-600">GHL</span> : null}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 font-body">
                  {job.company_name ? <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{job.company_name}</span> : null}
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location || 'Okeechobee, FL'}</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{fmt(job.job_type || '')}</span>
                  {job.salary_range ? <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{job.salary_range}</span> : null}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={e => { e.stopPropagation(); toggleStatus(job.id, job.status); }} className="p-1.5 text-gray-300 hover:text-brand-forest hover:bg-gray-100 rounded-lg" title={job.status === 'published' ? 'Unpublish' : 'Publish'}>
                  {job.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={e => { e.stopPropagation(); openEdit(job); }} className="p-1.5 text-gray-300 hover:text-brand-forest hover:bg-gray-100 rounded-lg"><Pencil className="w-4 h-4" /></button>
                <button onClick={e => { e.stopPropagation(); deleteJob(job.id); }} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform ${expandedId === job.id ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {/* Expanded detail */}
            {expandedId === job.id && (
              <div className="border-t border-gray-100 p-4 bg-gray-50/30 space-y-3">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-body">
                  <div><span className="text-gray-400 uppercase tracking-wider">Category</span><p className="text-brand-forest font-semibold mt-0.5">{job.category || '—'}</p></div>
                  <div><span className="text-gray-400 uppercase tracking-wider">Work Mode</span><p className="text-brand-forest font-semibold mt-0.5">{fmt(job.work_mode || '')}</p></div>
                  <div><span className="text-gray-400 uppercase tracking-wider">Compensation</span><p className="text-brand-forest font-semibold mt-0.5">{job.salary_range || '—'} ({fmt(job.compensation_type || '')})</p></div>
                  <div><span className="text-gray-400 uppercase tracking-wider">Visibility</span><p className="text-brand-forest font-semibold mt-0.5">{fmt(job.visibility || 'public')}</p></div>
                  <div><span className="text-gray-400 uppercase tracking-wider">Posted</span><p className="text-brand-forest font-semibold mt-0.5">{job.posted_date || job.created_at?.split('T')[0] || '—'}</p></div>
                  <div><span className="text-gray-400 uppercase tracking-wider">Closing</span><p className="text-brand-forest font-semibold mt-0.5">{job.closing_date || 'Open'}</p></div>
                  <div><span className="text-gray-400 uppercase tracking-wider">Applications</span><p className="text-brand-forest font-semibold mt-0.5">{job.application_count || 0}</p></div>
                  <div><span className="text-gray-400 uppercase tracking-wider">GHL Sync</span><p className={`font-semibold mt-0.5 ${job.ghl_synced_at ? 'text-blue-600' : 'text-gray-400'}`}>{job.ghl_synced_at ? 'Synced' : 'Not synced'}</p></div>
                </div>
                {job.description && <div><span className="text-xs text-gray-400 uppercase tracking-wider font-body">Description</span><p className="text-sm text-gray-600 font-body mt-1 whitespace-pre-wrap">{job.description}</p></div>}
                {job.requirements && <div><span className="text-xs text-gray-400 uppercase tracking-wider font-body">Requirements</span><p className="text-sm text-gray-600 font-body mt-1 whitespace-pre-wrap">{job.requirements}</p></div>}
                {job.benefits && <div><span className="text-xs text-gray-400 uppercase tracking-wider font-body">Benefits</span><p className="text-sm text-gray-600 font-body mt-1 whitespace-pre-wrap">{job.benefits}</p></div>}
                {job.special_offer && <div><span className="text-xs text-gray-400 uppercase tracking-wider font-body">Special Offer</span><p className="text-sm text-gray-600 font-body mt-1">{job.special_offer}</p></div>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
              <h2 className="font-display text-lg font-semibold text-brand-forest">{editingJob ? 'Edit Job' : 'Create New Job'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={saveJob} className="p-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2"><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Job Title *</label><input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-portal" placeholder="e.g. Store Manager" /></div>
                <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Company / Employer</label><input value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} className="input-portal" placeholder="e.g. Lakefront Grocery" /></div>
                <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Location</label><input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="input-portal" /></div>
                <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Category</label><select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-portal">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Job Type</label><select value={form.job_type} onChange={e => setForm({...form, job_type: e.target.value})} className="input-portal">{JOB_TYPES.map(t => <option key={t} value={t}>{fmt(t)}</option>)}</select></div>
                <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Work Mode</label><select value={form.work_mode} onChange={e => setForm({...form, work_mode: e.target.value})} className="input-portal">{WORK_MODES.map(m => <option key={m} value={m}>{fmt(m)}</option>)}</select></div>
                <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Compensation Type</label><select value={form.compensation_type} onChange={e => setForm({...form, compensation_type: e.target.value})} className="input-portal">{COMP_TYPES.map(c => <option key={c} value={c}>{fmt(c)}</option>)}</select></div>
                <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Salary / Pay Range</label><input value={form.salary_range} onChange={e => setForm({...form, salary_range: e.target.value})} className="input-portal" placeholder="e.g. $45,000-$55,000/year" /></div>
                <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Department</label><input value={form.department} onChange={e => setForm({...form, department: e.target.value})} className="input-portal" placeholder="Optional" /></div>
              </div>
              <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Description</label><textarea rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-portal resize-none" placeholder="Describe the role..." /></div>
              <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Requirements</label><textarea rows={3} value={form.requirements} onChange={e => setForm({...form, requirements: e.target.value})} className="input-portal resize-none" placeholder="Skills, experience, qualifications..." /></div>
              <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Benefits</label><textarea rows={2} value={form.benefits} onChange={e => setForm({...form, benefits: e.target.value})} className="input-portal resize-none" placeholder="Health insurance, PTO, etc..." /></div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input-portal"><option value="draft">Draft</option><option value="published">Published</option></select></div>
                <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Visibility</label><select value={form.visibility} onChange={e => setForm({...form, visibility: e.target.value})} className="input-portal">{VIS_OPTIONS.map(v => <option key={v.v} value={v.v}>{v.l}</option>)}</select></div>
                <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Closing Date</label><input type="date" value={form.closing_date} onChange={e => setForm({...form, closing_date: e.target.value})} className="input-portal" /></div>
              </div>
              <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Special Offer (optional)</label><input value={form.special_offer} onChange={e => setForm({...form, special_offer: e.target.value})} className="input-portal" placeholder="e.g. Signing bonus, relocation help" /></div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold hover:bg-brand-forest/90 disabled:opacity-50 transition-colors">
                  {saving ? 'Saving...' : editingJob ? 'Update Job' : 'Create Job'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-gray-200 text-gray-500 rounded-lg text-sm font-body hover:bg-gray-50 transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
