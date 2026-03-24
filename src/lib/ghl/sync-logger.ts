// Sync Logger — records every GHL sync attempt to lf_sync_log
import { createServerSupabase } from '@/lib/supabase/server';

export interface SyncLogEntry {
  entity_type: 'application' | 'job' | 'employer' | 'webhook_inbound';
  entity_id?: string;
  ghl_id?: string;
  action: string;
  direction: 'outbound' | 'inbound';
  status: 'success' | 'error' | 'skipped';
  error_message?: string;
  details?: Record<string, any>;
}

export async function logSync(entry: SyncLogEntry): Promise<void> {
  try {
    const supabase = await createServerSupabase();
    await supabase.from('lf_sync_log').insert({
      entity_type: entry.entity_type,
      entity_id: entry.entity_id || null,
      ghl_id: entry.ghl_id || null,
      action: entry.action,
      direction: entry.direction,
      status: entry.status,
      error_message: entry.error_message || null,
      details: entry.details || null,
    });
  } catch (e) {
    console.error('Sync log write failed:', e);
  }
}

export const logSyncSuccess = (entity_type: SyncLogEntry['entity_type'], action: string, opts: Partial<SyncLogEntry> = {}) =>
  logSync({ entity_type, action, direction: 'outbound', status: 'success', ...opts });

export const logSyncError = (entity_type: SyncLogEntry['entity_type'], action: string, error: string, opts: Partial<SyncLogEntry> = {}) =>
  logSync({ entity_type, action, direction: 'outbound', status: 'error', error_message: error, ...opts });

export const logSyncInbound = (action: string, opts: Partial<SyncLogEntry> = {}) =>
  logSync({ entity_type: 'webhook_inbound', action, direction: 'inbound', status: 'success', ...opts });
