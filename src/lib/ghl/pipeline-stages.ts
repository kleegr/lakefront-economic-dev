// ATS PIPELINE STAGE <-> APPLICATION STATUS MAPPING
// Kleegr pipelines have stages. Each stage maps to a portal application status.
// This enables 2-way sync: portal status changes move the opportunity to the right stage,
// and moving an opportunity in Kleegr updates the portal status.
//
// The stage names here should match your Kleegr ATS pipeline stage names exactly.
// Stage IDs are fetched at runtime from the Kleegr API.

import { ghlConfig, isGhlConfigured } from './config';

const BASE = 'https://services.leadconnectorhq.com';
function h() { return { 'Authorization': `Bearer ${ghlConfig.token}`, 'Content-Type': 'application/json', 'Version': '2021-07-28' }; }

// Portal status -> Kleegr stage name mapping
export const STATUS_TO_STAGE_NAME: Record<string, string> = { submitted: 'New Applicant', reviewing: 'Under Review', interview: 'Interview', offered: 'Offer Made', hired: 'Hired', rejected: 'Rejected', withdrawn: 'Withdrawn' };

// Kleegr stage name -> Portal status (reverse mapping)
export const STAGE_NAME_TO_STATUS: Record<string, string> = { 'new applicant': 'submitted', 'new': 'submitted', 'applied': 'submitted', 'under review': 'reviewing', 'reviewing': 'reviewing', 'review': 'reviewing', 'phone screen': 'reviewing', 'screening': 'reviewing', 'interview': 'interview', 'interview scheduled': 'interview', 'second interview': 'interview', 'final interview': 'interview', 'offer made': 'offered', 'offer': 'offered', 'offer sent': 'offered', 'hired': 'hired', 'onboarding': 'hired', 'onboarded': 'hired', 'rejected': 'rejected', 'not qualified': 'rejected', 'declined': 'rejected', 'withdrawn': 'withdrawn', 'no show': 'withdrawn', 'cancelled': 'withdrawn' };

// Opportunity status mapping (open/won/lost are Kleegr opportunity-level statuses)
export const OPP_STATUS_TO_APP_STATUS: Record<string, string> = { open: 'reviewing', won: 'hired', lost: 'rejected', abandoned: 'withdrawn' };
export const APP_STATUS_TO_OPP_STATUS: Record<string, string> = { submitted: 'open', reviewing: 'open', interview: 'open', offered: 'open', hired: 'won', rejected: 'lost', withdrawn: 'abandoned' };

let _stageCache: { pipelineId: string; stages: Array<{ id: string; name: string }> } | null = null;

export async function getATSPipelineStages(): Promise<Array<{ id: string; name: string }>> {
  if (_stageCache && _stageCache.pipelineId === ghlConfig.pipelines.ats) return _stageCache.stages;
  if (!isGhlConfigured() || !ghlConfig.pipelines.ats) return [];
  try { const r = await fetch(`${BASE}/opportunities/pipelines/${ghlConfig.pipelines.ats}`, { headers: h() }); const d = await r.json(); const stages = (d?.stages || d?.pipeline?.stages || []).map((s: any) => ({ id: s.id, name: s.name })); _stageCache = { pipelineId: ghlConfig.pipelines.ats, stages }; return stages; }
  catch (e) { console.error('Failed to fetch ATS pipeline stages:', e); return []; }
}

export async function getStageIdForStatus(status: string): Promise<string | null> {
  const stages = await getATSPipelineStages(); if (stages.length === 0) return null;
  const targetStageName = STATUS_TO_STAGE_NAME[status]; if (!targetStageName) return null;
  const exact = stages.find(s => s.name.toLowerCase() === targetStageName.toLowerCase()); if (exact) return exact.id;
  const partial = stages.find(s => s.name.toLowerCase().includes(targetStageName.toLowerCase()) || targetStageName.toLowerCase().includes(s.name.toLowerCase())); if (partial) return partial.id;
  if (status === 'submitted') return stages[0]?.id || null; if (status === 'hired') return stages[stages.length - 1]?.id || null;
  return null;
}

export async function getStatusForStage(stageNameOrId: string): Promise<string | null> {
  const byName = STAGE_NAME_TO_STATUS[stageNameOrId.toLowerCase()]; if (byName) return byName;
  const stages = await getATSPipelineStages(); const stage = stages.find(s => s.id === stageNameOrId);
  if (stage) { const byResolvedName = STAGE_NAME_TO_STATUS[stage.name.toLowerCase()]; if (byResolvedName) return byResolvedName; }
  return null;
}

export async function resolveStatusFromWebhook(body: any): Promise<string | null> {
  const stageName = body.stageName || body.stage_name || body.data?.stageName || body.data?.stage_name;
  if (stageName) { const s = await getStatusForStage(stageName); if (s) return s; }
  const stageId = body.stageId || body.stage_id || body.data?.stageId || body.data?.stage_id || body.pipelineStageId || body.data?.pipelineStageId;
  if (stageId) { const s = await getStatusForStage(stageId); if (s) return s; }
  const oppStatus = body.status || body.data?.status;
  if (oppStatus && OPP_STATUS_TO_APP_STATUS[oppStatus]) return OPP_STATUS_TO_APP_STATUS[oppStatus];
  return null;
}
