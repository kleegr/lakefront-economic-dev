import type { SupabaseClient } from '@supabase/supabase-js';

export type PortalRole = 'super_admin' | 'admin' | 'employer' | 'applicant';
export type AccountStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type PortalType = 'applicant' | 'employer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: PortalRole;
  account_status: AccountStatus;
  portal_type: PortalType;
  company_name: string | null;
  onboarding_complete: boolean;
  created_at: string;
}

export async function getUserProfile(supabase: SupabaseClient): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('lf_profiles').select('*').eq('id', user.id).single();
  return data as UserProfile | null;
}

export function canAccessPortal(profile: UserProfile | null, portalType: PortalType): boolean {
  if (!profile) return false;
  if (['super_admin', 'admin'].includes(profile.role)) return true;
  return profile.portal_type === portalType;
}

export function isApproved(profile: UserProfile | null): boolean {
  if (!profile) return false;
  if (['super_admin', 'admin'].includes(profile.role)) return true;
  return profile.account_status === 'approved';
}

export function isAdmin(profile: UserProfile | null): boolean {
  if (!profile) return false;
  return ['super_admin', 'admin'].includes(profile.role);
}

// Permission matrix: what each role can do
export const ROLE_PERMISSIONS: Record<PortalRole, string[]> = {
  super_admin: ['*'],
  admin: ['manage_users', 'manage_approvals', 'manage_content', 'manage_jobs', 'manage_businesses', 'manage_services', 'manage_spaces', 'manage_investors', 'view_analytics', 'impersonate'],
  employer: ['view_own_profile', 'edit_own_profile', 'create_job', 'edit_own_jobs', 'view_applicants', 'manage_own_business'],
  applicant: ['view_own_profile', 'edit_own_profile', 'apply_to_jobs', 'view_applications'],
};

export function hasPermission(profile: UserProfile | null, permission: string): boolean {
  if (!profile) return false;
  const perms = ROLE_PERMISSIONS[profile.role];
  return perms.includes('*') || perms.includes(permission);
}
