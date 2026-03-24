  async function syncToKleegr() {
    setSyncing(true); setSyncMsg('');
    const res = await fetch('/api/jobs/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ direction: 'push' }) });
    const data = await res.json();
    const parts = [];
    if (data.pushed) parts.push(`Pushed ${data.pushed} jobs`);
    if (data.skipped) parts.push(`${data.skipped} already up-to-date`);
    if (data.deleted) parts.push(`Removed ${data.deleted} deleted from GHL`);
    if (!data.pushed && !data.deleted && data.skipped) parts.push('All jobs are in sync');
    if (data.errors?.length) parts.push(data.errors.join('; '));
    setSyncMsg(parts.join('. ') || 'Sync complete.');
    setSyncing(false); loadAll();
  }