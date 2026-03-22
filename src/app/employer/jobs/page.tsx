'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Pencil, Trash2, Eye, X } from 'lucide-react';

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<Record<string,unknown>[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [jobType, setJobType] = useState('full-time');
  const [salary, setSalary] = useState('');
  const [requirements, setRequirements] = useState('');
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string|null>(null);
  const supabase = createClient();

  useEffect(() => { loadJobs(); }, []);

  async function loadJobs() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // RLS ensures only this employer's jobs are returned
    const { data } = await supabase.from('lf_jobs').select('*').eq('created_by', user.id).order('created_at', { ascending: false });
    setJobs(data || []);
  }

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (editId) {
      await supabase.from('lf_jobs').update({ title, description, job_type: jobType, salary_range: salary, requirements }).eq('id', editId);
    } else {
      await supabase.from('lf_jobs').insert({ title, description, job_type: jobType, salary_range: salary, requirements, created_by: user.id, status: 'draft' });
    }
    setShowCreate(false); setEditId(null); setTitle(''); setDescription(''); setSalary(''); setRequirements('');
    setSaving(false); loadJobs();
  };

  const handleEdit = (j: Record<string,unknown>) => {
    setEditId(j.id as string); setTitle(j.title as string || ''); setDescription(j.description as string || '');
    setJobType(j.job_type as string || 'full-time'); setSalary(j.salary_range as string || ''); setRequirements(j.requirements as string || '');
    setShowCreate(true);
  };

  const handleDelete = async (id: string) => { await supabase.from('lf_jobs').delete().eq('id', id); loadJobs(); };
  const handlePublish = async (id: string, current: string) => {
    await supabase.from('lf_jobs').update({ status: current === 'published' ? 'draft' : 'published' }).eq('id', id); loadJobs();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl font-bold text-brand-forest">My Jobs</h1><p className="text-sm font-body text-gray-500">Only you can see and manage your job postings</p></div>
        <button onClick={() => { setShowCreate(true); setEditId(null); setTitle(''); setDescription(''); setSalary(''); setRequirements(''); }} className="flex items-center gap-2 px-4 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold hover:bg-brand-forest/90"><Plus className="w-4 h-4" />Post New Job</button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="font-display text-xl font-bold text-brand-forest">{editId ? 'Edit Job' : 'Post New Job'}</h2><button onClick={() => setShowCreate(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
            <div className="space-y-3">
              <div><label className="text-xs font-body font-semibold uppercase tracking-wider block mb-1">Job Title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" placeholder="e.g. Store Manager" /></div>
              <div><label className="text-xs font-body font-semibold uppercase tracking-wider block mb-1">Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" placeholder="Job description..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-body font-semibold uppercase tracking-wider block mb-1">Type</label>
                  <select value={jobType} onChange={e => setJobType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body">
                    <option value="full-time">Full-time</option><option value="part-time">Part-time</option><option value="contract">Contract</option><option value="seasonal">Seasonal</option>
                  </select></div>
                <div><label className="text-xs font-body font-semibold uppercase tracking-wider block mb-1">Salary Range</label><input type="text" value={salary} onChange={e => setSalary(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" placeholder="$15-$20/hr" /></div>
              </div>
              <div><label className="text-xs font-body font-semibold uppercase tracking-wider block mb-1">Requirements</label><textarea value={requirements} onChange={e => setRequirements(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" placeholder="List requirements..." /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-body font-semibold">Cancel</button>
              <button onClick={handleSave} disabled={saving || !title} className="flex-1 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold hover:bg-brand-forest/90 disabled:opacity-50">{saving ? 'Saving...' : editId ? 'Update Job' : 'Create Job'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {jobs.length === 0 ? (
          <div className="text-center py-12"><p className="text-sm text-gray-400 font-body">No jobs posted yet. Click &ldquo;Post New Job&rdquo; to get started.</p></div>
        ) : (
          <table className="w-full text-sm font-body">
            <thead><tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b bg-gray-50">
              <th className="p-3">Job</th><th className="p-3">Type</th><th className="p-3">Salary</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th>
            </tr></thead>
            <tbody>{jobs.map(j => (
              <tr key={j.id as string} className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="p-3 font-semibold text-brand-forest">{j.title as string}</td>
                <td className="p-3 text-xs">{j.job_type as string}</td>
                <td className="p-3 text-xs">{(j.salary_range as string) || '-'}</td>
                <td className="p-3"><span className={`px-2 py-0.5 text-xs rounded font-semibold ${(j.status as string) === 'published' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{j.status as string}</span></td>
                <td className="p-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => handlePublish(j.id as string, j.status as string)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded" title={j.status === 'published' ? 'Unpublish' : 'Publish'}><Eye className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleEdit(j)} className="p-1.5 text-gray-400 hover:text-brand-forest hover:bg-brand-sage/10 rounded"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(j.id as string)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
