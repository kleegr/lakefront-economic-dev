'use client';
import { useState, useEffect } from 'react';
import { Plus, Pencil, Save, X, AlertCircle, RefreshCw, HelpCircle, CheckCircle } from 'lucide-react';

// ITEM: Job Fields Configuration with DETAILED GUIDANCE on how it works
interface FieldConfig {
  id: string; key: string; ghl_key: string; label: string; field_type: string;
  placeholder: string; required: boolean; col_span: number; field_group: string;
  sort_order: number; options: Array<{ value: string; ghlLabel: string }>; is_active: boolean;
}

const FIELD_TYPES = ['text', 'textarea', 'dropdown', 'number', 'date'];
const GROUPS = ['core', 'classification', 'details', 'content', 'publishing', 'extras'];
const GROUP_LABELS: Record<string, string> = { core: 'Basic Info', classification: 'Classification', details: 'Details', content: 'Content', publishing: 'Publishing', extras: 'Extras' };

export default function JobFieldsConfigPage() {
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<FieldConfig>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [newField, setNewField] = useState({ key: '', ghl_key: '', label: '', field_type: 'text', field_group: 'details', placeholder: '', required: false, col_span: 1, sort_order: 100, options: [] as any[] });
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [optionInput, setOptionInput] = useState({ value: '', ghlLabel: '' });

  useEffect(() => { load(); }, []);
  async function load() { const res = await fetch('/api/jobs/fields-config'); const data = await res.json(); setFields(data.fields || []); setLoading(false); }
  async function addField() { setSaving(true); await fetch('/api/jobs/fields-config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newField) }); setShowAdd(false); setNewField({ key: '', ghl_key: '', label: '', field_type: 'text', field_group: 'details', placeholder: '', required: false, col_span: 1, sort_order: 100, options: [] }); setSaving(false); load(); }
  async function updateField(id: string, data: Partial<FieldConfig>) { setSaving(true); await fetch('/api/jobs/fields-config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...data }) }); setEditingId(null); setSaving(false); load(); }
  function startEdit(f: FieldConfig) { setEditingId(f.id); setEditForm({ ...f }); }
  async function syncToKleegr() { setSyncing(true); setSyncMsg(''); const res = await fetch('/api/jobs/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ direction: 'push' }) }); const data = await res.json(); setSyncMsg(`Pushed ${data.pushed || 0} jobs. ${data.errors?.length ? data.errors.join('; ') : 'No errors.'}`); setSyncing(false); }
  function addOption(target: 'new' | 'edit') { if (!optionInput.value || !optionInput.ghlLabel) return; if (target === 'new') setNewField({ ...newField, options: [...newField.options, { ...optionInput }] }); else setEditForm({ ...editForm, options: [...(editForm.options || []), { ...optionInput }] }); setOptionInput({ value: '', ghlLabel: '' }); }
  function removeOption(target: 'new' | 'edit', idx: number) { if (target === 'new') setNewField({ ...newField, options: newField.options.filter((_, i) => i !== idx) }); else setEditForm({ ...editForm, options: (editForm.options || []).filter((_, i) => i !== idx) }); }

  const groupedFields: Record<string, FieldConfig[]> = {};
  for (const f of fields) { const g = f.field_group || 'other'; if (!groupedFields[g]) groupedFields[g] = []; groupedFields[g].push(f); }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-bold text-brand-forest">Job Fields Configuration</h1><p className="text-sm font-body text-gray-400 mt-1">{fields.length} fields &middot; Changes apply to portal form + Kleegr sync</p></div>
        <div className="flex gap-2">
          <button onClick={() => setShowGuide(!showGuide)} className="inline-flex items-center gap-2 px-3 py-2 border border-blue-200 text-blue-600 rounded-lg text-xs font-body font-semibold hover:bg-blue-50"><HelpCircle className="w-3.5 h-3.5" /> How It Works</button>
          <button onClick={syncToKleegr} disabled={syncing} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-500 rounded-lg text-xs font-body font-semibold hover:bg-gray-50 disabled:opacity-50"><RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} /> Sync to Kleegr</button>
          <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold hover:bg-brand-forest/90"><Plus className="w-4 h-4" /> Add Field</button>
        </div>
      </div>
      {syncMsg && <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-xs font-body">{syncMsg}</div>}

      {/* DETAILED GUIDANCE */}
      {showGuide && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2"><HelpCircle className="w-5 h-5 text-blue-500" /><h3 className="font-display text-lg font-semibold text-blue-800">How Job Fields Configuration Works</h3></div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-body font-semibold text-blue-800 mb-2 flex items-center gap-2"><span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center justify-center">1</span>Adding a New Field</h4>
              <ol className="text-xs font-body text-blue-700 space-y-1 list-decimal list-inside">
                <li>Click \"Add Field\" button above</li>
                <li>Enter a <strong>Label</strong> (e.g. \"Experience Level\")</li>
                <li>The <strong>DB Key</strong> auto-generates (e.g. \"experience_level\")</li>
                <li>Set the <strong>Kleegr Key</strong> \u2014 this must match the field key in Kleegr Custom Object</li>
                <li>Choose the <strong>Type</strong>: text, textarea, dropdown, number, or date</li>
                <li>If dropdown, add options with <strong>Value</strong> (stored in database) and <strong>Kleegr Label</strong> (shown in Kleegr)</li>
                <li>Save \u2014 the field immediately appears on the job form</li>
              </ol>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-body font-semibold text-blue-800 mb-2 flex items-center gap-2"><span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center justify-center">2</span>In Kleegr (Required)</h4>
              <ol className="text-xs font-body text-blue-700 space-y-1 list-decimal list-inside">
                <li>Go to Kleegr \u2192 Settings \u2192 Custom Objects \u2192 Job Openings</li>
                <li>Click \"Add Property\"</li>
                <li>Create a field with the <strong>exact same key</strong> as the Kleegr Key here</li>
                <li>For dropdowns: add the <strong>exact same option labels</strong> (case-sensitive!)</li>
                <li>Save in Kleegr</li>
              </ol>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-body font-semibold text-blue-800 mb-2 flex items-center gap-2"><span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center justify-center">3</span>In Supabase (If Needed)</h4>
              <ol className="text-xs font-body text-blue-700 space-y-1 list-decimal list-inside">
                <li>If the field needs a <strong>new database column</strong>, go to Supabase</li>
                <li>Run: <code className="bg-blue-100 px-1 rounded">ALTER TABLE lf_jobs ADD COLUMN experience_level text;</code></li>
                <li>If the field uses an existing column, skip this step</li>
              </ol>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-body font-semibold text-blue-800 mb-2 flex items-center gap-2"><span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center justify-center">4</span>Adding Dropdown Options</h4>
              <ol className="text-xs font-body text-blue-700 space-y-1 list-decimal list-inside">
                <li>Click the <strong>pencil icon</strong> on any dropdown field</li>
                <li>Add new options with Value + Kleegr Label</li>
                <li><strong>Value</strong> = what\u2019s stored in database (e.g. \"full-time\")</li>
                <li><strong>Kleegr Label</strong> = what\u2019s shown in Kleegr (e.g. \"Full-Time\")</li>
                <li>Add the same option in Kleegr Custom Object dropdown</li>
                <li>Save \u2014 done!</li>
              </ol>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-body font-semibold text-green-700 mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Quick Checklist</h4>
            <div className="grid grid-cols-3 gap-2 text-xs font-body text-gray-600">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-400" /> Field added here \u2192 form shows it</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-400" /> Kleegr Key set \u2192 syncs to Kleegr</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400" /> No Kleegr Key \u2192 portal only, no sync</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2"><AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /><p className="text-xs font-body text-amber-700">Fields here drive the portal job form AND Kleegr sync. Dropdown options must match exactly between here and Kleegr.</p></div>

      {Object.entries(groupedFields).map(([groupKey, gFields]) => (<div key={groupKey} className="bg-white rounded-xl border border-gray-100 overflow-hidden"><div className="px-4 py-3 bg-gray-50 border-b border-gray-100"><h2 className="text-xs font-body font-semibold uppercase tracking-wider text-gray-400">{GROUP_LABELS[groupKey] || groupKey}</h2></div><div className="divide-y divide-gray-50">{gFields.map((f) => (<div key={f.id} className="px-4 py-3">{editingId === f.id ? (<div className="space-y-3"><div className="grid grid-cols-3 gap-3"><div><label className="block text-[10px] font-body text-gray-400 uppercase mb-1">Label</label><input value={editForm.label || ''} onChange={e => setEditForm({...editForm, label: e.target.value})} className="input-portal text-sm" /></div><div><label className="block text-[10px] font-body text-gray-400 uppercase mb-1">Kleegr Key</label><input value={editForm.ghl_key || ''} onChange={e => setEditForm({...editForm, ghl_key: e.target.value})} className="input-portal text-sm" placeholder="Leave empty = no sync" /></div><div><label className="block text-[10px] font-body text-gray-400 uppercase mb-1">Type</label><select value={editForm.field_type} onChange={e => setEditForm({...editForm, field_type: e.target.value})} className="input-portal text-sm">{FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div></div>
                    {(editForm.field_type === 'dropdown') && (<div><label className="block text-[10px] font-body text-gray-400 uppercase mb-1">Dropdown Options</label><div className="space-y-1 mb-2">{(editForm.options || []).map((opt, i) => (<div key={i} className="flex items-center gap-2 text-xs font-body"><span className="px-2 py-1 bg-gray-50 rounded">{opt.value}</span><span className="text-gray-300">\u2192</span><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">{opt.ghlLabel}</span><button onClick={() => removeOption('edit', i)} className="text-red-400 hover:text-red-600"><X className="w-3 h-3" /></button></div>))}</div><div className="flex gap-2"><input placeholder="Value (DB)" value={optionInput.value} onChange={e => setOptionInput({...optionInput, value: e.target.value})} className="input-portal text-xs flex-1" /><input placeholder="Kleegr Label" value={optionInput.ghlLabel} onChange={e => setOptionInput({...optionInput, ghlLabel: e.target.value})} className="input-portal text-xs flex-1" /><button onClick={() => addOption('edit')} className="px-3 py-1 bg-brand-forest text-white rounded text-xs font-semibold">Add</button></div></div>)}
                    <div className="flex gap-2"><button onClick={() => updateField(f.id, editForm)} disabled={saving} className="px-4 py-1.5 bg-brand-forest text-white rounded-lg text-xs font-semibold"><Save className="w-3 h-3 inline mr-1" />Save</button><button onClick={() => setEditingId(null)} className="px-4 py-1.5 border border-gray-200 text-gray-500 rounded-lg text-xs">Cancel</button></div></div>
                  ) : (<div className="flex items-center gap-4"><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span className="font-body text-sm font-semibold text-brand-forest">{f.label}</span><span className="px-1.5 py-0.5 text-[9px] rounded bg-gray-100 text-gray-500 font-mono">{f.key}</span><span className="px-1.5 py-0.5 text-[9px] rounded bg-gray-50 text-gray-400">{f.field_type}</span>{f.ghl_key ? <span className="px-1.5 py-0.5 text-[9px] rounded bg-blue-50 text-blue-600">Kleegr: {f.ghl_key}</span> : <span className="px-1.5 py-0.5 text-[9px] rounded bg-gray-50 text-gray-300">No sync</span>}{f.required && <span className="px-1.5 py-0.5 text-[9px] rounded bg-red-50 text-red-500">Required</span>}</div>{f.field_type === 'dropdown' && f.options?.length > 0 && (<div className="flex flex-wrap gap-1 mt-1">{f.options.map((opt, i) => <span key={i} className="text-[10px] font-body px-1.5 py-0.5 bg-gray-50 rounded text-gray-500">{opt.ghlLabel}</span>)}</div>)}</div><div className="flex items-center gap-1 shrink-0"><button onClick={() => startEdit(f)} className="p-1.5 text-gray-300 hover:text-brand-forest hover:bg-gray-100 rounded-lg"><Pencil className="w-3.5 h-3.5" /></button></div></div>)}</div>))}</div></div>))}

      {showAdd && (<div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm" onClick={() => setShowAdd(false)}><div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-5 space-y-4" onClick={e => e.stopPropagation()}><h2 className="font-display text-lg font-semibold text-brand-forest">Add New Field</h2><div className="grid grid-cols-2 gap-3"><div><label className="block text-[10px] font-body text-gray-400 uppercase mb-1">Label *</label><input value={newField.label} onChange={e => setNewField({...newField, label: e.target.value, key: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '_')})} className="input-portal text-sm" /></div><div><label className="block text-[10px] font-body text-gray-400 uppercase mb-1">DB Key</label><input value={newField.key} onChange={e => setNewField({...newField, key: e.target.value})} className="input-portal text-sm" /></div><div><label className="block text-[10px] font-body text-gray-400 uppercase mb-1">Kleegr Key</label><input value={newField.ghl_key} onChange={e => setNewField({...newField, ghl_key: e.target.value})} className="input-portal text-sm" /></div><div><label className="block text-[10px] font-body text-gray-400 uppercase mb-1">Type</label><select value={newField.field_type} onChange={e => setNewField({...newField, field_type: e.target.value})} className="input-portal text-sm">{FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div><div><label className="block text-[10px] font-body text-gray-400 uppercase mb-1">Group</label><select value={newField.field_group} onChange={e => setNewField({...newField, field_group: e.target.value})} className="input-portal text-sm">{GROUPS.map(g => <option key={g} value={g}>{GROUP_LABELS[g]}</option>)}</select></div><div><label className="block text-[10px] font-body text-gray-400 uppercase mb-1">Placeholder</label><input value={newField.placeholder} onChange={e => setNewField({...newField, placeholder: e.target.value})} className="input-portal text-sm" /></div></div>
        {newField.field_type === 'dropdown' && (<div><label className="block text-[10px] font-body text-gray-400 uppercase mb-1">Options</label><div className="space-y-1 mb-2">{newField.options.map((opt, i) => (<div key={i} className="flex items-center gap-2 text-xs font-body"><span className="px-2 py-1 bg-gray-50 rounded">{opt.value}</span><span className="text-gray-300">\u2192</span><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">{opt.ghlLabel}</span><button onClick={() => removeOption('new', i)} className="text-red-400"><X className="w-3 h-3" /></button></div>))}</div><div className="flex gap-2"><input placeholder="Value" value={optionInput.value} onChange={e => setOptionInput({...optionInput, value: e.target.value})} className="input-portal text-xs flex-1" /><input placeholder="Kleegr Label" value={optionInput.ghlLabel} onChange={e => setOptionInput({...optionInput, ghlLabel: e.target.value})} className="input-portal text-xs flex-1" /><button onClick={() => addOption('new')} className="px-3 py-1 bg-brand-forest text-white rounded text-xs font-semibold">Add</button></div></div>)}
        <div className="flex gap-3 pt-2"><button onClick={addField} disabled={saving || !newField.label} className="px-6 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold disabled:opacity-50">{saving ? 'Saving...' : 'Add Field'}</button><button onClick={() => setShowAdd(false)} className="px-6 py-2.5 border border-gray-200 text-gray-500 rounded-lg text-sm font-body">Cancel</button></div></div></div>)}
    </div>
  );
}
