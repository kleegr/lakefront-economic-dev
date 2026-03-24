'use client';
import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, CheckCircle, XCircle, ArrowUpRight, ArrowDownLeft, AlertTriangle, ArrowUpDown, Calendar } from 'lucide-react';

type Log = Record<string, any>;
const STATUS_COLORS: Record<string, string> = { success: 'bg-green-50 text-green-700', error: 'bg-red-50 text-red-700', skipped: 'bg-gray-100 text-gray-500' };
const DIRECTION_ICONS: Record<string, any> = { outbound: ArrowUpRight, inbound: ArrowDownLeft };
const ENTITY_COLORS: Record<string, string> = { application: 'bg-blue-50 text-blue-700', job: 'bg-purple-50 text-purple-700', employer: 'bg-green-50 text-green-700', webhook_inbound: 'bg-amber-50 text-amber-700' };

export default function SyncStatusPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [stats, setStats] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterEntity, setFilterEntity] = useState('');
  const [filterDirection, setFilterDirection] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = useCallback(async (showSpinner?: boolean) => {
    if (showSpinner) setRefreshing(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', '200');
      if (filterStatus) params.set('status', filterStatus);
      if (filterEntity) params.set('entity_type', filterEntity);
      if (filterDirection) params.set('direction', filterDirection);
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);
      params.set('sort_by', sortBy);
      params.set('sort_order', sortOrder);
      const res = await fetch(`/api/sync-log?${params}`);
      const data = await res.json();
      setLogs(data.logs || []);
      setStats(data.stats || null);
    } catch (e) { console.error('Failed to fetch sync logs:', e); }
    setLoading(false);
    if (showSpinner) setRefreshing(false);
  }, [filterStatus, filterEntity, filterDirection, dateFrom, dateTo, sortBy, sortOrder]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if (!autoRefresh) return; const interval = setInterval(() => fetchData(), 3000); return () => clearInterval(interval); }, [autoRefresh, fetchData]);

  function toggleSort(col: string) { if (sortBy === col) setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc'); else { setSortBy(col); setSortOrder('desc'); } }
  function setQuickDate(days: number) { const now = new Date(); const from = new Date(now); from.setDate(from.getDate() - days); setDateFrom(from.toISOString().split('T')[0]); setDateTo(now.toISOString().split('T')[0]); }
  function clearFilters() { setFilterStatus(''); setFilterEntity(''); setFilterDirection(''); setDateFrom(''); setDateTo(''); setSortBy('created_at'); setSortOrder('desc'); }
  const hasFilters = filterStatus || filterEntity || filterDirection || dateFrom || dateTo;
  const errorCount = stats?.errors_24h || 0;

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-forest">Kleegr Sync Status</h1>
          <p className="text-sm font-body text-gray-400 mt-1">Real-time view of all Kleegr sync operations</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs font-body text-gray-500 cursor-pointer"><input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} className="rounded border-gray-300" />Live (3s)</label>
          <button onClick={() => fetchData(true)} disabled={refreshing} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-500 rounded-lg text-xs font-body font-semibold hover:bg-gray-50 disabled:opacity-50"><RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh</button>
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
          <div><p className="text-sm font-body font-semibold text-red-700">Last Error: {stats.last_error.action}</p><p className="text-xs font-body text-red-600 mt-1">{stats.last_error.error}</p><p className="text-[10px] font-body text-red-400 mt-1">{stats.last_error.entity} | {stats.last_error.time ? new Date(stats.last_error.time).toLocaleString() : ''}</p></div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap items-end">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-xs font-body"><option value="">All Status</option><option value="success">Success</option><option value="error">Errors</option><option value="skipped">Skipped</option></select>
        <select value={filterEntity} onChange={e => setFilterEntity(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-xs font-body"><option value="">All Types</option><option value="application">Employee/Application</option><option value="job">Job</option><option value="employer">Employer</option><option value="webhook_inbound">Webhook Inbound</option></select>
        <select value={filterDirection} onChange={e => setFilterDirection(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-xs font-body"><option value="">All Directions</option><option value="outbound">{'Portal -> Kleegr'}</option><option value="inbound">{'Kleegr -> Portal'}</option></select>

        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-2 text-xs font-body w-32" placeholder="From" />
          <span className="text-gray-300 text-xs">-</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-2 text-xs font-body w-32" placeholder="To" />
        </div>

        <div className="flex gap-1">
          <button onClick={() => setQuickDate(0)} className="px-2 py-1.5 text-[10px] font-body font-semibold border border-gray-200 rounded-lg hover:bg-gray-50">Today</button>
          <button onClick={() => setQuickDate(7)} className="px-2 py-1.5 text-[10px] font-body font-semibold border border-gray-200 rounded-lg hover:bg-gray-50">7 Days</button>
          <button onClick={() => setQuickDate(30)} className="px-2 py-1.5 text-[10px] font-body font-semibold border border-gray-200 rounded-lg hover:bg-gray-50">30 Days</button>
        </div>

        {hasFilters && (<button onClick={clearFilters} className="text-xs text-brand-forest font-body underline">Clear all</button>)}
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center"><RefreshCw className="w-8 h-8 text-gray-200 mx-auto mb-3" /><p className="text-sm font-body text-gray-400">No sync events found for this period.</p></div>
        ) : (
          <table className="w-full text-sm font-body">
            <thead><tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b bg-gray-50">
              <th className="p-3">Direction</th>
              <th className="p-3 cursor-pointer hover:text-brand-forest" onClick={() => toggleSort('entity_type')}>Type {sortBy === 'entity_type' && <ArrowUpDown className="inline w-3 h-3" />}</th>
              <th className="p-3 cursor-pointer hover:text-brand-forest" onClick={() => toggleSort('action')}>Action {sortBy === 'action' && <ArrowUpDown className="inline w-3 h-3" />}</th>
              <th className="p-3 cursor-pointer hover:text-brand-forest" onClick={() => toggleSort('status')}>Status {sortBy === 'status' && <ArrowUpDown className="inline w-3 h-3" />}</th>
              <th className="p-3">Details</th>
              <th className="p-3">Kleegr ID</th>
              <th className="p-3 cursor-pointer hover:text-brand-forest" onClick={() => toggleSort('created_at')}>Time {sortBy === 'created_at' && <ArrowUpDown className="inline w-3 h-3" />}</th>
            </tr></thead>
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
        <div className="border-t p-3 text-xs text-gray-400 font-body text-right">{logs.length} results {dateFrom && `from ${dateFrom}`} {dateTo && `to ${dateTo}`}</div>
      </div>
    </div>
  );
}
