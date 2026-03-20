// GHL API Client — server-side only. Never import in client components.
import { ghlConfig, isGHLConfigured } from './config';
type HttpMethod = 'GET'|'POST'|'PUT'|'DELETE'|'PATCH';
interface GHLRequestOptions { method?: HttpMethod; body?: Record<string, unknown>; params?: Record<string, string>; }
interface GHLApiError { statusCode: number; message: string; raw?: unknown; }

class GHLClient {
  private baseUrl: string;
  private apiKey: string;
  private locationId: string;
  constructor() { this.baseUrl = ghlConfig.apiBaseUrl; this.apiKey = ghlConfig.apiKey; this.locationId = ghlConfig.locationId; }
  private get headers(): HeadersInit { return { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json', 'Version': '2021-07-28' }; }

  async request<T>(endpoint: string, options: GHLRequestOptions = {}): Promise<T> {
    if (!isGHLConfigured()) { throw new Error('GHL API not configured. Set GHL_API_KEY and GHL_LOCATION_ID.'); }
    const { method = 'GET', body, params } = options;
    let url = `${this.baseUrl}${endpoint}`;
    if (params) { url += `?${new URLSearchParams(params).toString()}`; }
    try {
      const response = await fetch(url, { method, headers: this.headers, body: body ? JSON.stringify(body) : undefined, next: { revalidate: method === 'GET' ? 300 : 0 } });
      if (!response.ok) { const err = await response.json().catch(() => null); throw { statusCode: response.status, message: `GHL API error: ${response.status}`, raw: err }; }
      return response.json();
    } catch (err) { if ((err as GHLApiError).statusCode) throw err; throw { statusCode: 500, message: 'Failed to reach GHL API' }; }
  }

  async getContacts(params?: Record<string, string>) { return this.request('/contacts/', { params: { locationId: this.locationId, ...params } }); }
  async getContact(id: string) { return this.request(`/contacts/${id}`); }
  async createContact(data: Record<string, unknown>) { return this.request('/contacts/', { method: 'POST', body: { ...data, locationId: this.locationId } }); }
  async updateContact(id: string, data: Record<string, unknown>) { return this.request(`/contacts/${id}`, { method: 'PUT', body: data }); }
  async getCompanies(params?: Record<string, string>) { return this.request('/companies/', { params: { locationId: this.locationId, ...params } }); }
  async createCompany(data: Record<string, unknown>) { return this.request('/companies/', { method: 'POST', body: { ...data, locationId: this.locationId } }); }
  async getOpportunities(pipelineId: string, params?: Record<string, string>) { return this.request('/opportunities/search', { method: 'POST', body: { locationId: this.locationId, pipelineId, ...params } }); }
  async createOpportunity(data: Record<string, unknown>) { return this.request('/opportunities/', { method: 'POST', body: { ...data, locationId: this.locationId } }); }
  async updateOpportunity(id: string, data: Record<string, unknown>) { return this.request(`/opportunities/${id}`, { method: 'PUT', body: data }); }
  async getCustomObjectRecords(schemaKey: string, params?: Record<string, string>) { return this.request(`/custom-objects/${schemaKey}/records`, { params: { locationId: this.locationId, ...params } }); }
  async createCustomObjectRecord(schemaKey: string, data: Record<string, unknown>) { return this.request(`/custom-objects/${schemaKey}/records`, { method: 'POST', body: { ...data, locationId: this.locationId } }); }
  async updateCustomObjectRecord(schemaKey: string, recordId: string, data: Record<string, unknown>) { return this.request(`/custom-objects/${schemaKey}/records/${recordId}`, { method: 'PUT', body: data }); }
  async getPipelines() { return this.request('/opportunities/pipelines', { params: { locationId: this.locationId } }); }
}

export const ghl = new GHLClient();
