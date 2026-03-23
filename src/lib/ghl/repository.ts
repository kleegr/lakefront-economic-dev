// GHL Data Repository — server-side data access layer.
// This replaces mock-data imports on production-facing pages.
// Falls back to Supabase data when GHL is not configured.

import { ghl } from './client';
import { ghlConfig, isGhlConfigured } from './config';

// ===== CONTACTS / APPLICANTS =====
export async function getApplicants(limit = 50) {
  if (!isGhlConfigured()) return { contacts: [], total: 0 };
  try {
    const res = await ghl.getContacts({ limit: String(limit) });
    return { contacts: res.contacts || [], total: res.total || 0 };
  } catch { return { contacts: [], total: 0 }; }
}

export async function getApplicant(id: string) {
  if (!isGhlConfigured()) return null;
  try { return await ghl.getContact(id); } catch { return null; }
}

export async function createApplicant(data: {
  firstName: string; lastName: string; email: string; phone?: string;
  customFields?: Record<string, unknown>;
}) {
  const contactData: Record<string, unknown> = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone || '',
    source: 'Lakefront Economic Development Portal',
    customField: data.customFields || {},
  };
  return ghl.createContact(contactData);
}

// ===== COMPANIES =====
export async function getCompanies(limit = 50) {
  if (!isGhlConfigured()) return { companies: [], total: 0 };
  try {
    const res = await ghl.getCompanies({ limit: String(limit) });
    return { companies: res.companies || [], total: res.total || 0 };
  } catch { return { companies: [], total: 0 }; }
}

export async function createCompanyRecord(data: {
  name: string; email?: string; phone?: string;
  customFields?: Record<string, unknown>;
}) {
  return ghl.createCompany({
    name: data.name,
    email: data.email || '',
    phone: data.phone || '',
    customField: data.customFields || {},
  });
}

// ===== OPPORTUNITIES =====
export async function getOpportunities(pipelineKey: keyof typeof ghlConfig.pipelines, limit = 50) {
  const pipelineId = ghlConfig.pipelines[pipelineKey];
  if (!isGhlConfigured() || !pipelineId) return { opportunities: [], total: 0 };
  try {
    const res = await ghl.getOpportunities(pipelineId, { limit: String(limit) });
    return { opportunities: res.opportunities || [], total: res.total || 0 };
  } catch { return { opportunities: [], total: 0 }; }
}

export async function createApplicationOpportunity(data: {
  contactId: string;
  title: string;
  stageId?: string;
  customFields?: Record<string, unknown>;
}) {
  const pipelineId = ghlConfig.pipelines.ats;
  if (!pipelineId) throw new Error('ATS pipeline not configured');
  return ghl.createOpportunity({
    pipelineId,
    pipelineStageId: data.stageId || '', // first stage
    contactId: data.contactId,
    name: data.title,
    status: 'open',
    customField: data.customFields || {},
  });
}

// ===== CUSTOM OBJECTS: JOBS =====
export async function getJobOpenings(limit = 50) {
  const schemaKey = ghlConfig.customObjects.jobOpenings;
  if (!isGhlConfigured() || !schemaKey) return { records: [], total: 0 };
  try {
    const res = await ghl.getCustomObjectRecords(schemaKey, { limit: String(limit) });
    return { records: res.records || res.data || [], total: res.total || 0 };
  } catch { return { records: [], total: 0 }; }
}

export async function getJobOpening(recordId: string) {
  const schemaKey = ghlConfig.customObjects.jobOpenings;
  if (!isGhlConfigured() || !schemaKey) return null;
  try {
    const res = await ghl.getCustomObjectRecords(schemaKey, { recordId });
    return res.records?.[0] || res.data?.[0] || null;
  } catch { return null; }
}

export async function createJobOpening(data: Record<string, unknown>) {
  const schemaKey = ghlConfig.customObjects.jobOpenings;
  if (!schemaKey) throw new Error('Job Openings custom object not configured');
  return ghl.createCustomObjectRecord(schemaKey, data);
}

// ===== CUSTOM OBJECTS: SPACES =====
export async function getSpaces(limit = 50) {
  const schemaKey = ghlConfig.customObjects.spaceInventory;
  if (!isGhlConfigured() || !schemaKey) return { records: [], total: 0 };
  try {
    const res = await ghl.getCustomObjectRecords(schemaKey, { limit: String(limit) });
    return { records: res.records || res.data || [], total: res.total || 0 };
  } catch { return { records: [], total: 0 }; }
}

// ===== PIPELINES =====
export async function getPipelineStats() {
  if (!isGhlConfigured()) return null;
  try {
    const res = await ghl.getPipelines();
    return res.pipelines || [];
  } catch { return null; }
}

// ===== DASHBOARD STATS =====
export async function getDashboardStats() {
  if (!isGhlConfigured()) return null;
  try {
    const [contacts, companies, pipelines] = await Promise.allSettled([
      ghl.getContacts({ limit: '1' }),
      ghl.getCompanies({ limit: '1' }),
      ghl.getPipelines(),
    ]);
    return {
      totalContacts: contacts.status === 'fulfilled' ? (contacts.value.total || 0) : 0,
      totalCompanies: companies.status === 'fulfilled' ? (companies.value.total || 0) : 0,
      pipelines: pipelines.status === 'fulfilled' ? (pipelines.value.pipelines || []) : [],
    };
  } catch { return null; }
}
