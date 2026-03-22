import type { SupabaseClient } from '@supabase/supabase-js';

export type ApprovalAction = 'create' | 'edit' | 'delete' | 'publish' | 'unpublish' | 'visibility_change';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type EntityType = 'job' | 'business' | 'profile' | 'service' | 'content' | 'space';

export interface ApprovalItem {
  id: string;
  entity_type: EntityType;
  entity_id: string | null;
  action: ApprovalAction;
  submitted_by: string;
  submitted_at: string;
  status: ApprovalStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  payload: Record<string, unknown>;
  previous_state: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
}

export async function submitForApproval(
  supabase: SupabaseClient,
  params: {
    entityType: EntityType;
    entityId?: string;
    action: ApprovalAction;
    userId: string;
    payload: Record<string, unknown>;
    previousState?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }
): Promise<{ success: boolean; id?: string; error?: string }> {
  const { data, error } = await supabase.from('lf_approval_queue').insert({
    entity_type: params.entityType,
    entity_id: params.entityId || null,
    action: params.action,
    submitted_by: params.userId,
    status: 'pending',
    payload: params.payload,
    previous_state: params.previousState || null,
    metadata: params.metadata || {},
  }).select('id').single();
  if (error) return { success: false, error: error.message };
  return { success: true, id: data.id };
}

export async function reviewApproval(
  supabase: SupabaseClient,
  params: {
    approvalId: string;
    reviewerId: string;
    decision: 'approved' | 'rejected';
    notes?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from('lf_approval_queue').update({
    status: params.decision,
    reviewed_by: params.reviewerId,
    reviewed_at: new Date().toISOString(),
    review_notes: params.notes || null,
  }).eq('id', params.approvalId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getPendingApprovals(
  supabase: SupabaseClient,
  entityType?: EntityType
): Promise<ApprovalItem[]> {
  let query = supabase.from('lf_approval_queue').select('*').eq('status', 'pending').order('submitted_at', { ascending: false });
  if (entityType) query = query.eq('entity_type', entityType);
  const { data } = await query;
  return (data || []) as ApprovalItem[];
}

export async function getUserSubmissions(
  supabase: SupabaseClient,
  userId: string
): Promise<ApprovalItem[]> {
  const { data } = await supabase.from('lf_approval_queue').select('*').eq('submitted_by', userId).order('submitted_at', { ascending: false });
  return (data || []) as ApprovalItem[];
}
