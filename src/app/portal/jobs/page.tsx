'use client';
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, X, Briefcase, Building2, MapPin, DollarSign, ChevronDown, Search, RefreshCw } from 'lucide-react';

function fmt(s: string) { return (s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }

interface FieldConfig {
  key: string; ghl_key: string; label: string; field_type: string;
  placeholder?: string; required?: boolean; col_span?: number;
  field_group?: string; sort_order?: number;
  options?: Array<{ value: string; ghlLabel: string }>;
}

function getDisplayLabel(field: FieldConfig, value: any): string {
  if (field.field_type === 'dropdown' && field.options?.length) {
    const opt = field.options.find((o: any) => o.value === value);
    return opt?.ghlLabel || fmt(String(value || ''));
  }
  return String(value || '—');
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    const [jobsRes, fieldsRes] = await Promise.all([
      fetch('/api/jobs?admin=true').then(r => r.json()),
      fetch('/api/jobs/fields-config').then(r => r.json()),
    ]);
    setJobs(jobsRes.jobs || []);
    setFields(fieldsRes.fields || []);
    setLoading(false);
  }

  const formFields = fields.filter(f => f.field_type !== 'hidden');

  function buildEmptyForm() {
    const f: Record<string, any> = {};
    for (const field of formFields) {
      if (field.field_type === 'number') f[field.key] = field.key === 'openings_count' ? 1 : 0;
      else if (field.key === 'status') f[field.key] = 'published';
      else if (field.key === 'visibility') f[field.key] = 'public';
      else if (field.key === 'location') f[field.key] = 'Lakefront Estates, Okeechobee, FL';
      else f[field.key] = '';
    }
    return f;
  }

  function openNew() { setEditingJob(null); setForm(buildEmptyForm()); setShowForm(true); }
  function openEdit(job: any) {
    setEditingJob(job);
    const f: Record<string, any> = {};
    for (const field of formFields) f[field.key] = job[field.key] ?? '';
    setForm(f); setShowForm(true);
  }

  async function saveJob(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const url = editingJob ? `/api/jobs/${editingJob.id}` : '/api/jobs';
    const method = editingJob ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { setShowForm(false); loadAll(); }
    else { const d = await res.json(); alert(d.error || 'Failed'); }
    setSaving(false);
  }

  async function deleteJob(id: string) { if (!confirm('Delete this job permanently?')) return; await fetch(`/api/jobs/${id}`, { method: 'DELETE' }); loadAll(); }
  async function toggleStatus(id: string, current: string) {
    await fetch(`/api/jobs/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: current === 'published' ? 'draft' : 'published' }) });
    loadAll();
  }
  async function pushAllToGhl() {
    setSyncing(true); setSyncMsg('');
    const res = await fetch('/api/jobs/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ direction: 'push' }) });
    const data = await res.json();
    setSyncMsg(`Pushed ${data.pushed || 0} jobs. ${data.errors?.length ? data.errors.join('; ') : 'No errors.'}`);
    setSyncing(false); loadAll();
  }

  const filtered = jobs.filter(j => !search || (j.title || '').toLowerCase().includes(search.toLowerCase()) || (j.company_name || '').toLowerCase().includes(search.toLowerCase()));

  const fieldGroups: Record<string, FieldConfig[]> = {};
  for (const f of formFields) { const g = f.field_group || 'other'; if (!fieldGroups[g]) fieldGroups[g] = []; fieldGroups[g].push(f); }
  const groupLabels: Record<string, string> = { core: 'Basic Info', classification: 'Classification', details: 'Details', content: 'Content', publishing: 'Publishing', extras: 'Extras' };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-forest">Jobs Management</h1>
          <p className="text-sm font-body text-gray-400 mt-1">{jobs.length} total &middot; {jobs.filter(j => j.status === 'published').length} published &middot; {fields.length} fields configured</p>
        </div>
        <div className="flex gap-2">
          <button onClick={pushAllToGhl} disabled={syncing} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-500 rounded-lg text-xs font-body font-semibold hover:bg-gray-50 disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} /> Sync to GHL
          </button>
          <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold hover:bg-brand-forest/90">
            <Plus className="w-4 h-4" /> New Job
          </button>
        </div>
      </div>
      {syncMsg && <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-xs font-body">{syncMsg}</div>}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-brand-sage" />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100"><Briefcase className="w-10 h-10 text-gray-200 mx-auto mb-3" /><p className="text-gray-400 font-body">No jobs found</p></div>
        ) : filtered.map(job => (
          <div key={job.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
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
                <button onClick={e => { e.stopPropagation(); toggleStatus(job.id, job.status); }} className="p-1.5 text-gray-300 hover:text-brand-forest hover:bg-gray-100 rounded-lg">{job.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                <button onClick={e => { e.stopPropagation(); openEdit(job); }} className="p-1.5 text-gray-300 hover:text-brand-forest hover:bg-gray-100 rounded-lg"><Pencil className="w-4 h-4" /></button>
                <button onClick={e => { e.stopPropagation(); deleteJob(job.id); }} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform ${expandedId === job.id ? 'rotate-180' : ''}`} />
              </div>
            </div>
            {expandedId === job.id && (
              <div className="border-t border-gray-100 p-4 bg-gray-50/30 space-y-3">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-body">
                  {formFields.filter(f => f.field_type !== 'textarea').map(f => (
                    <div key={f.key}><span className="text-gray-400 uppercase tracking-wider">{f.label}</span><p className="text-brand-forest font-semibold mt-0.5">{getDisplayLabel(f, job[f.key])}</p></div>
                  ))}
                  <div><span className="text-gray-400 uppercase tracking-wider">GHL Sync</span><p className={`font-semibold mt-0.5 ${job.ghl_synced_at ? 'text-blue-600' : 'text-gray-400'}`}>{job.ghl_synced_at ? 'Synced' : 'Not synced'}</p></div>
                </div>
                {formFields.filter(f => f.field_type === 'textarea').map(f => job[f.key] ? (
                  <div key={f.key}><span className="text-xs text-gray-400 uppercase tracking-wider font-body">{f.label}</span><p className="text-sm text-gray-600 font-body mt-1 whitespace-pre-wrap">{job[f.key]}</p></div>
                ) : null)}
              </div>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
              <h2 className="font-display text-lg font-semibold text-brand-forest">{editingJob ? 'Edit Job' : 'Create New Job'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={saveJob} className="p-5 space-y-5">
              {Object.entries(fieldGroups).map(([groupKey, gFields]) => (
                <div key={groupKey}>
                  <p className="text-[10px] font-body font-semibold uppercase tracking-[0.15em] text-gray-300 mb-2">{groupLabels[groupKey] || groupKey}</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {gFields.map(field => (
                      <div key={field.key} className={field.col_span === 2 ? 'sm:col-span-2' : ''}>
                        <label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">{field.label}{field.required ? ' *' : ''}</label>
                        {field.field_type === 'dropdown' ? (
                          <select value={form[field.key] || ''} onChange={e => setForm({ ...form, [field.key]: e.target.value })} className="input-portal">
                            <option value="">Select...</option>
                            {(field.options || []).map((opt: any) => <option key={opt.value} value={opt.value}>{opt.ghlLabel}</option>)}
                          </select>
                        ) : field.field_type === 'textarea' ? (
                          <textarea rows={3} value={form[field.key] || ''} onChange={e => setForm({ ...form, [field.key]: e.target.value })} className="input-portal resize-none" placeholder={field.placeholder} />
                        ) : field.field_type === 'date' ? (
                          <input type="date" value={form[field.key] || ''} onChange={e => setForm({ ...form, [field.key]: e.target.value })} className="input-portal" />
                        ) : field.field_type === 'number' ? (
                          <input type="number" value={form[field.key] || ''} onChange={e => setForm({ ...form, [field.key]: parseInt(e.target.value) || 0 })} className="input-portal" placeholder={field.placeholder} />
                        ) : (
                          <input type="text" required={field.required} value={form[field.key] || ''} onChange={e => setForm({ ...form, [field.key]: e.target.value })} className="input-portal" placeholder={field.placeholder} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold hover:bg-brand-forest/90 disabled:opacity-50">{saving ? 'Saving...' : editingJob ? 'Update Job' : 'Create Job'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-gray-200 text-gray-500 rounded-lg text-sm font-body hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
