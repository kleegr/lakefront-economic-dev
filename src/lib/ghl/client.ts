// Kleegr CRM API Client — server-side only. Never import in client components.
import { kleegrConfig, isKleegrConfigured } from './config';
type HttpMethod = 'GET'|'POST'|'PUT'|'DELETE'|'PATCH';
interface RequestOptions { method?: HttpMethod; body?: Record<string, unknown>; params?: Record<string, string>; }

class KleegrClient {
  private baseUrl: string;
  private apiKey: string;
  private locationId: string;
  constructor() { this.baseUrl = kleegrConfig.apiBaseUrl; this.apiKey = kleegrConfig.apiKey; this.locationId = kleegrConfig.locationId; }
  private get headers(): HeadersInit { return { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json', 'Version': '2021-07-28' }; }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    if (!isKleegrConfigured()) { throw new Error('Kleegr CRM not configured. Set KLEEGR_API_KEY and KLEEGR_LOCATION_ID.'); }
    const { method = 'GET', body, params } = options;
    let url = `${this.baseUrl}${endpoint}`;
    if (params) { url += `?${new URLSearchParams(params).toString()}`; }
    try {
      const response = await fetch(url, { method, headers: this.headers, body: body ? JSON.stringify(body) : undefined, next: { revalidate: method === 'GET' ? 300 : 0 } });
      if (!response.ok) { const err = await response.json().catch(() => null); throw { statusCode: response.status, message: `Kleegr API error: ${response.status}`, raw: err }; }
      return response.json();
    } catch (err) { if ((err as any).statusCode) throw err; throw { statusCode: 500, message: 'Failed to reach Kleegr API' }; }
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
  async getPipelines() { return this.request('/opportunities/pipelines', { params: { locationId: this.locationId } }); }
}

export const kleegr = new KleegrClient();
