import type { SupabaseClient } from '@supabase/supabase-js';

export type VisibilityState = 'public' | 'signed_in_only' | 'admin_only' | 'disabled' | 'coming_soon' | 'under_construction';

export interface VisibilityRecord {
  id: string;
  target_type: string;
  target_id: string;
  state: VisibilityState;
  label: string | null;
  changed_by: string | null;
  changed_at: string;
  notes: string | null;
}

export async function getVisibility(
  supabase: SupabaseClient,
  targetType: string,
  targetId: string
): Promise<VisibilityState> {
  const { data } = await supabase
    .from('lf_visibility')
    .select('state')
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .single();
  return (data?.state as VisibilityState) || 'public';
}

export async function setVisibility(
  supabase: SupabaseClient,
  targetType: string,
  targetId: string,
  state: VisibilityState,
  userId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from('lf_visibility').upsert({
    target_type: targetType,
    target_id: targetId,
    state,
    changed_by: userId,
    changed_at: new Date().toISOString(),
    notes: notes || null,
  }, { onConflict: 'target_type,target_id' });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getAllVisibility(supabase: SupabaseClient): Promise<VisibilityRecord[]> {
  const { data } = await supabase.from('lf_visibility').select('*').order('target_type');
  return (data || []) as VisibilityRecord[];
}

export function canUserSee(state: VisibilityState, isAuthenticated: boolean, isAdmin: boolean): boolean {
  switch (state) {
    case 'public': return true;
    case 'signed_in_only': return isAuthenticated;
    case 'admin_only': return isAdmin;
    case 'disabled': return isAdmin;
    case 'coming_soon': return true; // show coming soon page
    case 'under_construction': return isAdmin;
    default: return true;
  }
}
