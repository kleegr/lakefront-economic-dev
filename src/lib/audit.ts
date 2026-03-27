import { createClient } from '@supabase/supabase-js';

// Reusable audit logger — call from any API route
// Uses service role so it always succeeds regardless of RLS

export type AuditAction =
  // Auth
  | 'login' | 'logout' | 'signup' | 'password_set' | 'password_reset'
  // Invitations
  | 'invitation_sent' | 'invitation_accepted' | 'invitation_revoked'
  // Jobs
  | 'job_created' | 'job_updated' | 'job_deleted' | 'job_published' | 'job_draft' | 'job_closed'
  // Business Opportunities
  | 'biz_opp_created' | 'biz_opp_updated' | 'biz_opp_deleted'
  // Directory
  | 'directory_created' | 'directory_updated' | 'directory_deleted'
  // Business Applications
  | 'biz_app_submitted' | 'biz_app_reviewed' | 'biz_app_approved' | 'biz_app_rejected'
  // Users
  | 'user_updated' | 'user_suspended' | 'user_reactivated' | 'user_deleted'
  // Approvals
  | 'approval_approved' | 'approval_rejected'
  // Settings
  | 'settings_updated' | 'visibility_changed'
  // Impersonation
  | 'impersonation_started' | 'impersonation_ended'
  // Generic
  | 'record_created' | 'record_updated' | 'record_deleted'
  // Catch-all
  | string;

export type AuditEntityType =
  | 'job' | 'business_opportunity' | 'directory' | 'business_application'
  | 'user' | 'invitation' | 'space' | 'service' | 'business'
  | 'setting' | 'approval' | 'session'
  | string;

interface AuditLogEntry {
  user_id?: string | null;
  action: AuditAction;
  entity_type?: AuditEntityType;
  entity_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  target_user_id?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _serviceClient: any = null;

function getServiceClient() {
  if (!_serviceClient) {
    _serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _serviceClient;
}

export async function auditLog(entry: AuditLogEntry): Promise<void> {
  try {
    const client = getServiceClient();
    await client.from('lf_audit_log').insert({
      user_id: entry.user_id || null,
      action: entry.action,
      entity_type: entry.entity_type || null,
      entity_id: entry.entity_id || null,
      details: entry.details || {},
      ip_address: entry.ip_address || null,
      target_user_id: entry.target_user_id || null,
    });
  } catch (err) {
    // Never let audit logging break the main flow
    console.error('[AuditLog] Failed to write:', err);
  }
}

// Convenience helpers
export const logJobAction = (userId: string, action: AuditAction, jobId: string, details?: Record<string, any>) =>
  auditLog({ user_id: userId, action, entity_type: 'job', entity_id: jobId, details });

export const logBizOppAction = (userId: string, action: AuditAction, oppId: string, details?: Record<string, any>) =>
  auditLog({ user_id: userId, action, entity_type: 'business_opportunity', entity_id: oppId, details });

export const logDirectoryAction = (userId: string, action: AuditAction, entryId: string, details?: Record<string, any>) =>
  auditLog({ user_id: userId, action, entity_type: 'directory', entity_id: entryId, details });

export const logUserAction = (userId: string, action: AuditAction, targetUserId: string, details?: Record<string, any>) =>
  auditLog({ user_id: userId, action, entity_type: 'user', target_user_id: targetUserId, details });

export const logAuthAction = (action: AuditAction, details?: Record<string, any>, userId?: string) =>
  auditLog({ user_id: userId, action, entity_type: 'session', details });
