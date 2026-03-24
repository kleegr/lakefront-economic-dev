'use client';

import { useState, useEffect } from 'react';
import { Settings, Play, CheckCircle, Database, AlertCircle, Loader2, FolderOpen, Save } from 'lucide-react';

// ITEM 16: All GHL references renamed to Kleegr
// ITEM 18: Persist API key and location ID to Supabase lf_integration_settings
export default function KleegrSetupPage() {
  const [token, setToken] = useState('');
  const [locationId, setLocationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [log, setLog] = useState<string[]>([]);
  const [results, setResults] = useState<any>(null);
  const [lastAction, setLastAction] = useState('');

  // ITEM 18: Load saved settings on mount
  useEffect(() => {
    fetch('/api/settings/integration').then(r => r.json()).then(d => {
      if (d.token) setToken(d.token);
      if (d.locationId) setLocationId(d.locationId);
      setLoadingSettings(false);
    }).catch(() => setLoadingSettings(false));
  }, []);

  // ITEM 18: Save settings to DB
  async function saveSettings() {
    setSaving(true);
    await fetch('/api/settings/integration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, locationId }),
    });
    setSaving(false);
    setLog(['Settings saved successfully!']);
  }

  async function runAction(action: string, endpoint = '/api/ghl/provision') {
    if (!token || !locationId) {
      setLog(['ERROR: Enter both your Kleegr token and location ID']);
      return;
    }
    setLoading(true);
    setLog([`Running ${action}...`]);
    setLastAction(action);
    setResults(null);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, locationId, action }),
      });
      const data = await res.json();
      if (!res.ok) setLog([`ERROR ${res.status}: ${data.error || 'Unknown error'}`]);
      else { setLog(data.log || ['Done']); setResults(data.results || null); }
    } catch (err: any) { setLog([`Network error: ${err.message}`]); }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-brand-forest">Kleegr Integration</h1>
        <p className="text-sm font-body text-brand-muted mt-1">Configure API credentials, verify connection, provision custom fields, and sync data.</p>
      </div>

      <div className="card-portal p-6">
        <h2 className="font-display text-lg font-semibold text-brand-forest mb-4 flex items-center gap-2"><Settings className="w-5 h-5" /> Kleegr Credentials</h2>
        <p className="text-xs font-body text-brand-muted mb-4">Your credentials are saved securely in the database so they persist between sessions.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="block text-xs font-body font-medium text-brand-muted mb-1 uppercase tracking-wider">Private Integration Token</label><input type="password" value={token} onChange={e => setToken(e.target.value)} className="input-portal" placeholder="pit-xxxx-xxxx-xxxx..." /></div>
          <div><label className="block text-xs font-body font-medium text-brand-muted mb-1 uppercase tracking-wider">Location ID</label><input type="text" value={locationId} onChange={e => setLocationId(e.target.value)} className="input-portal" placeholder="wE6Fhg01ixV16lYzvuJO" /></div>
        </div>
        <button onClick={saveSettings} disabled={saving} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold hover:bg-brand-forest/90 disabled:opacity-50"><Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Credentials'}</button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button onClick={() => runAction('verify')} disabled={loading} className="card-portal p-5 text-left hover:shadow-md transition-all disabled:opacity-50"><CheckCircle className="w-6 h-6 text-blue-500 mb-3" /><h3 className="font-display font-semibold text-brand-forest text-sm">1. Verify</h3><p className="text-xs text-brand-muted font-body mt-1">Check what exists in Kleegr: fields, pipelines, contacts.</p></button>
        <button onClick={() => runAction('provision')} disabled={loading} className="card-portal p-5 text-left hover:shadow-md transition-all disabled:opacity-50"><Play className="w-6 h-6 text-green-500 mb-3" /><h3 className="font-display font-semibold text-brand-forest text-sm">2. Provision</h3><p className="text-xs text-brand-muted font-body mt-1">Create custom fields for contacts and opportunities.</p></button>
        <button onClick={() => runAction('folders', '/api/ghl/folders')} disabled={loading} className="card-portal p-5 text-left hover:shadow-md transition-all disabled:opacity-50"><FolderOpen className="w-6 h-6 text-purple-500 mb-3" /><h3 className="font-display font-semibold text-brand-forest text-sm">3. Organize</h3><p className="text-xs text-brand-muted font-body mt-1">Move fields into organized folders.</p></button>
        <button onClick={() => runAction('seed')} disabled={loading} className="card-portal p-5 text-left hover:shadow-md transition-all disabled:opacity-50"><Database className="w-6 h-6 text-amber-500 mb-3" /><h3 className="font-display font-semibold text-brand-forest text-sm">4. Seed Data</h3><p className="text-xs text-brand-muted font-body mt-1">Create sample contacts and companies.</p></button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3"><AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" /><div><h3 className="text-sm font-body font-semibold text-amber-800">Pipelines must be created manually</h3><p className="text-xs font-body text-amber-700 mt-1">Kleegr does not support creating pipelines via API. Go to <strong>Kleegr Settings &rarr; Pipelines</strong> to create them.</p></div></div>

      {log.length > 0 && (<div className="card-portal p-6"><div className="flex items-center gap-2 mb-3">{loading && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}<h3 className="font-display font-semibold text-brand-forest text-sm">{loading ? 'Running...' : `${lastAction} complete`}</h3></div><div className="bg-gray-900 rounded-lg p-4 max-h-[500px] overflow-y-auto">{log.map((line, i) => (<div key={i} className="text-xs font-mono leading-relaxed" style={{ color: line.startsWith('OK') ? '#4ade80' : line.startsWith('ERROR') || line.startsWith('FAIL') ? '#f87171' : line.startsWith('Settings') ? '#4ade80' : '#d1d5db' }}>{line || '\u00A0'}</div>))}</div></div>)}
    </div>
  );
}
