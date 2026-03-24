'use client';
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Save, X, ArrowUp, ArrowDown, Settings2, AlertCircle } from 'lucide-react';

// ITEM 14: Job Fields Configuration UI — manage fields, dropdown options, GHL key mapping
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
  const [newField, setNewField] = useState({ key: '', ghl_key: '', label: '', field_type: 'text', field_group: 'details', placeholder: '', required: false, col_span: 1, sort_order: 100, options: [] as any[] });
  const [saving, setSaving] = useState(false);
  const [optionInput, setOptionInput] = useState({ value: '', ghlLabel: '' });

  useEffect(() => { load(); }, []);
  async function load() {
    const res = await fetch('/api/jobs/fields-config');
    const data = await res.json();
    setFields(data.fields || []); setLoading(false);
  }

  async function addField() {
    setSaving(true);
    await fetch('/api/jobs/fields-config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newField) });
    setShowAdd(false); setNewField({ key: '', ghl_key: '', label: '', field_type: 'text', field_group: 'details', placeholder: '', required: false, col_span: 1, sort_order: 100, options: [] });
    setSaving(false); load();
  }

  async function updateField(id: string, data: Partial<FieldConfig>) {
    setSaving(true);
    await fetch('/api/jobs/fields-config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...data }) });
    setEditingId(null); setSaving(false); load();
  }

  async function toggleActive(f: FieldConfig) {
    await updateField(f.id, { is_active: !f.is_active });
  }

  function startEdit(f: FieldConfig) { setEditingId(f.id); setEditForm({ ...f }); }

  function addOption(target: 'new' | 'edit') {
    if (!optionInput.value || !optionInput.ghlLabel) return;
    if (target === 'new') {
      setNewField({ ...newField, options: [...newField.options, { ...optionInput }] });
    } else {
      setEditForm({ ...editForm, options: [...(editForm.options || []), { ...optionInput }] });
    }
    setOptionInput({ value: '', ghlLabel: '' });
  }

  function removeOption(target: 'new' | 'edit', idx: number) {
    if (target === 'new') {
      setNewField({ ...newField, options: newField.options.filter((_, i) => i !== idx) });
    } else {
      setEditForm({ ...editForm, options: (editForm.options || []).filter((_, i) => i !== idx) });
    }
  }

  const groupedFields: Record<string, FieldConfig[]> = {};
  for (const f of fields) { const g = f.field_group || 'other'; if (!groupedFields[g]) groupedFields[g] = []; groupedFields[g].push(f); }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-forest">Job Fields Configuration</h1>
          <p className="text-sm font-body text-gray-400 mt-1">{fields.length} fields &middot; Changes apply to portal form + Kleegr sync instantly</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold hover:bg-brand-forest/90"><Plus className="w-4 h-4" /> Add Field</button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs font-body text-amber-700">When adding a new field: (1) Add it here with the GHL Key, (2) Add the matching field in Kleegr/GHL Custom Object, (3) If it's a new column, add it in Supabase too. Dropdown options must match exactly between here and GHL.</p>
      </div>

      {/* Field groups */}
      {Object.entries(groupedFields).map(([groupKey, gFields]) => (
        <div key={groupKey} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <h2 className="text-xs font-body font-semibold uppercase tracking-wider text-gray-400">{GROUP_LABELS[groupKey] || groupKey}</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {gFields.map((f) => (
              <div key={f.id} className="px-4 py-3">
                {editingId === f.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div><label className="block text-[10px] font-body text-gray-400 uppercase mb-1">Label</label><input value={editForm.label || ''} onChange={e => setEditForm({...editForm, label: e.target.value})} className="input-portal text-sm" /></div>
                      <div><label className="block text-[10px] font-body text-gray-400 uppercase mb-1">GHL Key</label><input value={editForm.ghl_key || ''} onChange={e => setEditForm({...editForm, ghl_key: e.target.value})} className="input-portal text-sm" placeholder="Leave empty to skip sync" /></div>
                      <div><label className="block text-[10px] font-body text-gray-400 uppercase mb-1">Type</label><select value={editForm.field_type} onChange={e => setEditForm({...editForm, field_type: e.target.value})} className="input-portal text-sm">{FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                    </div>
                    {(editForm.field_type === 'dropdown') && (
                      <div>
                        <label className="block text-[10px] font-body text-gray-400 uppercase mb-1">Dropdown Options</label>
                        <div className="space-y-1 mb-2">
                          {(editForm.options || []).map((opt, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs font-body">
                              <span className="px-2 py-1 bg-gray-50 rounded">{opt.value}</span><span className="text-gray-300">→</span><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">{opt.ghlLabel}</span>
                              <button onClick={() => removeOption('edit', i)} className="text-red-400 hover:text-red-600"><X className="w-3 h-3" /></button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input placeholder="Value (e.g. full-time)" value={optionInput.value} onChange={e => setOptionInput({...optionInput, value: e.target.value})} className="input-portal text-xs flex-1" />
                          <input placeholder="GHL Label (e.g. Full-Time)" value={optionInput.ghlLabel} onChange={e => setOptionInput({...optionInput, ghlLabel: e.target.value})} className="input-portal text-xs flex-1" />
                          <button onClick={() => addOption('edit')} className="px-3 py-1 bg-brand-forest text-white rounded text-xs font-semibold">Add</button>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => updateField(f.id, editForm)} disabled={saving} className="px-4 py-1.5 bg-brand-forest text-white rounded-lg text-xs font-semibold"><Save className="w-3 h-3 inline mr-1" />Save</button>
                      <button onClick={() => setEditingId(null)} className="px-4 py-1.5 border border-gray-200 text-gray-500 rounded-lg text-xs">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-body text-sm font-semibold text-brand-forest">{f.label}</span>
                        <span className="px-1.5 py-0.5 text-[9px] rounded bg-gray-100 text-gray-500 font-mono">{f.key}</span>
                        <span className="px-1.5 py-0.5 text-[9px] rounded bg-gray-50 text-gray-400">{f.field_type}</span>
                        {f.ghl_key ? <span className="px-1.5 py-0.5 text-[9px] rounded bg-blue-50 text-blue-600">GHL: {f.ghl_key}</span> : <span className="px-1.5 py-0.5 text-[9px] rounded bg-gray-50 text-gray-300">No GHL sync</span>}
                        {f.required && <span className="px-1.5 py-0.5 text-[9px] rounded bg-red-50 text-red-500">Required</span>}
                      </div>
                      {f.field_type === 'dropdown' && f.options?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {f.options.map((opt, i) => <span key={i} className="text-[10px] font-body px-1.5 py-0.5 bg-gray-50 rounded text-gray-500">{opt.ghlLabel}</span>)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => startEdit(f)} className="p-1.5 text-gray-300 hover:text-brand-forest hover:bg-gray-100 rounded-lg"><Pencil className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Add Field Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-5 space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="font-display text-lg font-semibold text-brand-forest">Add New Field</h2>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-[10px] font-body text-gray-400 uppercase mb-1">Label *</label><input value={newField.label} onChange={e => setNewField({...newField, label: e.target.value, key: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '_')})} className="input-portal text-sm" placeholder="e.g. Experience Level" /></div>
              <div><label className="block text-[10px] font-body text-gray-400 uppercase mb-1">DB Key (auto)</label><input value={newField.key} onChange={e => setNewField({...newField, key: e.target.value})} className="input-portal text-sm" /></div>
              <div><label className="block text-[10px] font-body text-gray-400 uppercase mb-1">GHL Key</label><input value={newField.ghl_key} onChange={e => setNewField({...newField, ghl_key: e.target.value})} className="input-portal text-sm" placeholder="Same as DB key usually" /></div>
              <div><label className="block text-[10px] font-body text-gray-400 uppercase mb-1">Type</label><select value={newField.field_type} onChange={e => setNewField({...newField, field_type: e.target.value})} className="input-portal text-sm">{FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div><label className="block text-[10px] font-body text-gray-400 uppercase mb-1">Group</label><select value={newField.field_group} onChange={e => setNewField({...newField, field_group: e.target.value})} className="input-portal text-sm">{GROUPS.map(g => <option key={g} value={g}>{GROUP_LABELS[g] || g}</option>)}</select></div>
              <div><label className="block text-[10px] font-body text-gray-400 uppercase mb-1">Placeholder</label><input value={newField.placeholder} onChange={e => setNewField({...newField, placeholder: e.target.value})} className="input-portal text-sm" /></div>
            </div>
            {newField.field_type === 'dropdown' && (
              <div>
                <label className="block text-[10px] font-body text-gray-400 uppercase mb-1">Dropdown Options</label>
                <div className="space-y-1 mb-2">
                  {newField.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-body">
                      <span className="px-2 py-1 bg-gray-50 rounded">{opt.value}</span><span className="text-gray-300">→</span><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">{opt.ghlLabel}</span>
                      <button onClick={() => removeOption('new', i)} className="text-red-400"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input placeholder="Value" value={optionInput.value} onChange={e => setOptionInput({...optionInput, value: e.target.value})} className="input-portal text-xs flex-1" />
                  <input placeholder="GHL Label" value={optionInput.ghlLabel} onChange={e => setOptionInput({...optionInput, ghlLabel: e.target.value})} className="input-portal text-xs flex-1" />
                  <button onClick={() => addOption('new')} className="px-3 py-1 bg-brand-forest text-white rounded text-xs font-semibold">Add</button>
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button onClick={addField} disabled={saving || !newField.label} className="px-6 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold disabled:opacity-50">{saving ? 'Saving...' : 'Add Field'}</button>
              <button onClick={() => setShowAdd(false)} className="px-6 py-2.5 border border-gray-200 text-gray-500 rounded-lg text-sm font-body">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
