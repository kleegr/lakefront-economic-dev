'use client';
import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, ArrowUpRight, ArrowDownLeft, Clock, Filter, AlertTriangle } from 'lucide-react';

type Log = Record<string, any>;

const STATUS_COLORS: Record<string, string> = { success: 'bg-green-50 text-green-700', error: 'bg-red-50 text-red-700', skipped: 'bg-gray-100 text-gray-500' };
const DIRECTION_ICONS: Record<string, any> = { outbound: ArrowUpRight, inbound: ArrowDownLeft };
const ENTITY_COLORS: Record<string, string> = { application: 'bg-blue-50 text-blue-700', job: 'bg-purple-50 text-purple-700', employer: 'bg-green-50 text-green-700', webhook_inbound: 'bg-amber-50 text-amber-700' };

export default function SyncStatusPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [stats, setStats] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', entity_type: '', direction: '' });
  const [autoRefresh, setAutoRefresh] = useState(false);

  async function load() {
    const params = new URLSearchParams();
    params.set('limit', '200');
    if (filter.status) params.set('status', filter.status);
    if (filter.entity_type) params.set('entity_type', filter.entity_type);
    if (filter.direction) params.set('direction', filter.direction);
    const res = await fetch(`/api/sync-log?${params}`);
    const data = await res.json();
    setLogs(data.logs || []);
    setStats(data.stats || null);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter.status, filter.entity_type, filter.direction]);
  useEffect(() => { if (!autoRefresh) return; const interval = setInterval(load, 5000); return () => clearInterval(interval); }, [autoRefresh]);

  const errorCount = stats?.errors_24h || 0;

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-forest">Kleegr Sync Status</h1>
          <p className="text-sm font-body text-gray-400 mt-1">Real-time view of all Kleegr sync operations - every move logged</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs font-body text-gray-500 cursor-pointer"><input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} className="rounded border-gray-300" />Auto-refresh</label>
          <button onClick={load} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-500 rounded-lg text-xs font-body font-semibold hover:bg-gray-50"><RefreshCw className="w-3.5 h-3.5" /> Refresh</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl border p-4 text-center"><div className="text-2xl font-display font-bold text-brand-forest">{stats?.last_24h || 0}</div><p className="text-[10px] text-gray-400 uppercase font-body font-semibold">Last 24h</p></div>
        <div className="bg-white rounded-xl border p-4 text-center"><div className="text-2xl font-display font-bold text-green-600">{stats?.success_24h || 0}</div><p className="text-[10px] text-gray-400 uppercase font-body font-semibold">Success</p></div>
        <div className={`bg-white rounded-xl border p-4 text-center ${errorCount > 0 ? 'border-red-200' : ''}`}><div className={`text-2xl font-display font-bold ${errorCount > 0 ? 'text-red-600' : 'text-gray-300'}`}>{errorCount}</div><p className="text-[10px] text-gray-400 uppercase font-body font-semibold">Errors</p></div>
        <div className="bg-white rounded-xl border p-4 text-center"><div className="text-2xl font-display font-bold text-blue-600">{stats?.outbound_24h || 0}</div><p className="text-[10px] text-gray-400 uppercase font-body font-semibold">{'Portal -> Kleegr'}</p></div>
        <div className="bg-white rounded-xl border p-4 text-center"><div className="text-2xl font-display font-bold text-amber-600">{stats?.inbound_24h || 0}</div><p className="text-[10px] text-gray-400 uppercase font-body font-semibold">{'Kleegr -> Portal'}</p></div>
        <div className="bg-white rounded-xl border p-4 text-center"><div className="text-xs font-body font-semibold text-brand-forest mt-1">{stats?.last_sync ? new Date(stats.last_sync).toLocaleTimeString() : '-'}</div><p className="text-[10px] text-gray-400 uppercase font-body font-semibold">Last Sync</p></div>
      </div>

      {stats?.last_error?.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-body font-semibold text-red-700">Last Error: {stats.last_error.action}</p>
            <p className="text-xs font-body text-red-600 mt-1">{stats.last_error.error}</p>
            <p className="text-[10px] font-body text-red-400 mt-1">{stats.last_error.entity} | {stats.last_error.time ? new Date(stats.last_error.time).toLocaleString() : ''}</p>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <select value={filter.status} onChange={e => setFilter(f => ({...f, status: e.target.value}))} className="border border-gray-200 rounded-lg px-3 py-2 text-xs font-body"><option value="">All Status</option><option value="success">Success</option><option value="error">Errors</option><option value="skipped">Skipped</option></select>
        <select value={filter.entity_type} onChange={e => setFilter(f => ({...f, entity_type: e.target.value}))} className="border border-gray-200 rounded-lg px-3 py-2 text-xs font-body"><option value="">All Types</option><option value="application">Employee/Application</option><option value="job">Job</option><option value="employer">Employer</option><option value="webhook_inbound">Webhook Inbound</option></select>
        <select value={filter.direction} onChange={e => setFilter(f => ({...f, direction: e.target.value}))} className="border border-gray-200 rounded-lg px-3 py-2 text-xs font-body"><option value="">All Directions</option><option value="outbound">{'Portal -> Kleegr'}</option><option value="inbound">{'Kleegr -> Portal'}</option></select>
        {(filter.status || filter.entity_type || filter.direction) && (<button onClick={() => setFilter({ status: '', entity_type: '', direction: '' })} className="text-xs text-brand-forest font-body underline">Clear filters</button>)}
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center"><RefreshCw className="w-8 h-8 text-gray-200 mx-auto mb-3" /><p className="text-sm font-body text-gray-400">No sync events yet. Events will appear here as they happen.</p></div>
        ) : (
          <table className="w-full text-sm font-body">
            <thead><tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b bg-gray-50"><th className="p-3">Direction</th><th className="p-3">Type</th><th className="p-3">Action</th><th className="p-3">Status</th><th className="p-3">Details</th><th className="p-3">Kleegr ID</th><th className="p-3">Time</th></tr></thead>
            <tbody>
              {logs.map(log => {
                const DirIcon = DIRECTION_ICONS[log.direction] || ArrowUpRight;
                return (
                  <tr key={log.id} className={`border-b border-gray-50 hover:bg-gray-50/50 ${log.status === 'error' ? 'bg-red-50/30' : ''}`}>
                    <td className="p-3"><DirIcon className={`w-4 h-4 ${log.direction === 'inbound' ? 'text-amber-500' : 'text-blue-500'}`} /></td>
                    <td className="p-3"><span className={`px-2 py-0.5 text-[10px] rounded-full font-semibold ${ENTITY_COLORS[log.entity_type] || 'bg-gray-100 text-gray-500'}`}>{log.entity_type}</span></td>
                    <td className="p-3 text-xs font-mono text-brand-forest">{log.action}</td>
                    <td className="p-3"><span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full font-semibold ${STATUS_COLORS[log.status]}`}>{log.status === 'success' ? <CheckCircle className="w-3 h-3" /> : log.status === 'error' ? <XCircle className="w-3 h-3" /> : null}{log.status}</span></td>
                    <td className="p-3 text-xs text-gray-500 max-w-[250px]">{log.error_message ? (<span className="text-red-600">{log.error_message.substring(0, 80)}</span>) : log.details ? (<span className="text-gray-400">{JSON.stringify(log.details).substring(0, 80)}</span>) : '-'}</td>
                    <td className="p-3 text-[10px] font-mono text-gray-400">{log.ghl_id ? log.ghl_id.substring(0, 12) + '...' : '-'}</td>
                    <td className="p-3 text-xs text-gray-400">{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
