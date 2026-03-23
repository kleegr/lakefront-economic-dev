'use client';

import { useState } from 'react';
import { Settings, Play, CheckCircle, Database, AlertCircle, Loader2, FolderOpen } from 'lucide-react';

export default function GhlSetupPage() {
  const [token, setToken] = useState('');
  const [locationId, setLocationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [results, setResults] = useState<any>(null);
  const [lastAction, setLastAction] = useState('');

  async function runAction(action: string, endpoint = '/api/ghl/provision') {
    if (!token || !locationId) {
      setLog(['ERROR: Enter both your GHL token and location ID']);
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
      if (!res.ok) {
        setLog([`ERROR ${res.status}: ${data.error || 'Unknown error'}`]);
      } else {
        setLog(data.log || ['Done']);
        setResults(data.results || null);
      }
    } catch (err: any) {
      setLog([`Network error: ${err.message}`]);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-brand-forest">GoHighLevel Setup</h1>
        <p className="text-sm font-body text-brand-muted mt-1">Provision custom fields, create folders, verify your GHL setup, and seed test data.</p>
      </div>

      {/* Credentials */}
      <div className="card-portal p-6">
        <h2 className="font-display text-lg font-semibold text-brand-forest mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" /> GHL Credentials
        </h2>
        <p className="text-xs font-body text-brand-muted mb-4">These are NOT saved anywhere. Only used for this session to call the GHL API.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-body font-medium text-brand-muted mb-1 uppercase tracking-wider">Private Integration Token</label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="input-portal"
              placeholder="pit-xxxx-xxxx-xxxx..."
            />
          </div>
          <div>
            <label className="block text-xs font-body font-medium text-brand-muted mb-1 uppercase tracking-wider">Location ID</label>
            <input
              type="text"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="input-portal"
              placeholder="wE6Fhg01ixV16lYzvuJO"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => runAction('verify')}
          disabled={loading}
          className="card-portal p-5 text-left hover:shadow-md transition-all disabled:opacity-50"
        >
          <CheckCircle className="w-6 h-6 text-blue-500 mb-3" />
          <h3 className="font-display font-semibold text-brand-forest text-sm">1. Verify</h3>
          <p className="text-xs text-brand-muted font-body mt-1">Check what exists in GHL: fields, pipelines, contacts.</p>
        </button>

        <button
          onClick={() => runAction('provision')}
          disabled={loading}
          className="card-portal p-5 text-left hover:shadow-md transition-all disabled:opacity-50"
        >
          <Play className="w-6 h-6 text-green-500 mb-3" />
          <h3 className="font-display font-semibold text-brand-forest text-sm">2. Provision</h3>
          <p className="text-xs text-brand-muted font-body mt-1">Create custom fields for contacts and opportunities.</p>
        </button>

        <button
          onClick={() => runAction('folders', '/api/ghl/folders')}
          disabled={loading}
          className="card-portal p-5 text-left hover:shadow-md transition-all disabled:opacity-50"
        >
          <FolderOpen className="w-6 h-6 text-purple-500 mb-3" />
          <h3 className="font-display font-semibold text-brand-forest text-sm">3. Organize Folders</h3>
          <p className="text-xs text-brand-muted font-body mt-1">Move fields into organized folders in GHL.</p>
        </button>

        <button
          onClick={() => runAction('seed')}
          disabled={loading}
          className="card-portal p-5 text-left hover:shadow-md transition-all disabled:opacity-50"
        >
          <Database className="w-6 h-6 text-amber-500 mb-3" />
          <h3 className="font-display font-semibold text-brand-forest text-sm">4. Seed Data</h3>
          <p className="text-xs text-brand-muted font-body mt-1">Create sample contacts and companies for testing.</p>
        </button>
      </div>

      {/* Pipeline note */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-body font-semibold text-amber-800">Pipelines must be created manually</h3>
          <p className="text-xs font-body text-amber-700 mt-1">
            GHL does not support creating pipelines via API. Go to <strong>GHL Settings Pipelines</strong> and create:
          </p>
          <ul className="text-xs font-body text-amber-700 mt-2 space-y-1 list-disc list-inside">
            <li><strong>ATS - Lakefront</strong> (11 stages)</li>
            <li><strong>Business Intake - Lakefront</strong> (10 stages)</li>
            <li><strong>Investor - Lakefront</strong> (7 stages)</li>
            <li><strong>Provider - Lakefront</strong> (6 stages)</li>
            <li><strong>Space Allocation - Lakefront</strong> (6 stages)</li>
          </ul>
        </div>
      </div>

      {/* Log output */}
      {log.length > 0 && (
        <div className="card-portal p-6">
          <div className="flex items-center gap-2 mb-3">
            {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
            <h3 className="font-display font-semibold text-brand-forest text-sm">
              {loading ? 'Running...' : `${lastAction} complete`}
            </h3>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 max-h-[500px] overflow-y-auto">
            {log.map((line, i) => (
              <div key={i} className="text-xs font-mono leading-relaxed" style={{
                color: line.startsWith('OK') ? '#4ade80'
                  : line.startsWith('EXISTS') ? '#60a5fa'
                  : line.startsWith('FAIL') || line.startsWith('ERROR') || line.startsWith('SKIP') ? '#f87171'
                  : line.startsWith('===') ? '#c084fc'
                  : line.startsWith('---') ? '#fbbf24'
                  : line.startsWith('  OK') ? '#4ade80'
                  : line.startsWith('  FAIL') || line.startsWith('  SKIP') ? '#f87171'
                  : '#d1d5db'
              }}>
                {line || '\u00A0'}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pipeline IDs from verify */}
      {results?.pipelines && results.pipelines.length > 0 && (
        <div className="card-portal p-6">
          <h3 className="font-display font-semibold text-brand-forest text-sm mb-3">Pipeline IDs (for Vercel env vars)</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            {results.pipelines.map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-xs font-mono">
                <span className="text-brand-muted">{p.name}</span>
                <code className="bg-white px-2 py-1 rounded border text-brand-forest select-all">{p.id}</code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
