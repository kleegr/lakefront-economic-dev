// GoHighLevel API Client — server-side only. Never import in client components.
import { ghlConfig, isGhlConfigured } from './config';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  method?: HttpMethod;
  body?: Record<string, unknown>;
  params?: Record<string, string>;
}

interface GhlApiError {
  statusCode: number;
  message: string;
  raw?: unknown;
}

class GhlClient {
  private get baseUrl() { return ghlConfig.baseUrl; }
  private get token() { return ghlConfig.token; }
  private get locationId() { return ghlConfig.locationId; }

  private get headers(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
    };
  }

  async request<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    if (!isGhlConfigured()) {
      throw new Error('GoHighLevel not configured. Set GHL_PRIVATE_INTEGRATION_TOKEN and GHL_LOCATION_ID.');
    }
    const { method = 'GET', body, params } = options;
    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const qs = new URLSearchParams(params).toString();
      url += (url.includes('?') ? '&' : '?') + qs;
    }
    try {
      const response = await fetch(url, {
        method,
        headers: this.headers,
        body: body ? JSON.stringify(body) : undefined,
        cache: method === 'GET' ? 'no-store' : undefined,
      });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        const apiErr: GhlApiError = {
          statusCode: response.status,
          message: `GHL API error: ${response.status} ${response.statusText}`,
          raw: err,
        };
        throw apiErr;
      }
      const text = await response.text();
      return text ? JSON.parse(text) : ({} as T);
    } catch (err) {
      if ((err as GhlApiError).statusCode) throw err;
      throw { statusCode: 500, message: 'Failed to reach GHL API', raw: err };
    }
  }

  // ===== CONTACTS =====
  async getContacts(params?: Record<string, string>) {
    return this.request<any>('/contacts/', { params: { locationId: this.locationId, ...params } });
  }
  async getContact(id: string) {
    return this.request<any>(`/contacts/${id}`);
  }
  async createContact(data: Record<string, unknown>) {
    return this.request<any>('/contacts/', { method: 'POST', body: { ...data, locationId: this.locationId } });
  }
  async updateContact(id: string, data: Record<string, unknown>) {
    return this.request<any>(`/contacts/${id}`, { method: 'PUT', body: data });
  }
  async searchContacts(query: string, limit = 20) {
    return this.request<any>('/contacts/search/duplicate', {
      method: 'POST',
      body: { locationId: this.locationId, query, limit },
    });
  }

  // ===== COMPANIES =====
  async getCompanies(params?: Record<string, string>) {
    return this.request<any>('/companies/', { params: { locationId: this.locationId, ...params } });
  }
  async getCompany(id: string) {
    return this.request<any>(`/companies/${id}`);
  }
  async createCompany(data: Record<string, unknown>) {
    return this.request<any>('/companies/', { method: 'POST', body: { ...data, locationId: this.locationId } });
  }
  async updateCompany(id: string, data: Record<string, unknown>) {
    return this.request<any>(`/companies/${id}`, { method: 'PUT', body: data });
  }

  // ===== OPPORTUNITIES =====
  async getOpportunities(pipelineId: string, params?: Record<string, string>) {
    return this.request<any>('/opportunities/search', {
      method: 'POST',
      body: { locationId: this.locationId, pipelineId, ...params },
    });
  }
  async getOpportunity(id: string) {
    return this.request<any>(`/opportunities/${id}`);
  }
  async createOpportunity(data: Record<string, unknown>) {
    return this.request<any>('/opportunities/', {
      method: 'POST',
      body: { ...data, locationId: this.locationId },
    });
  }
  async updateOpportunity(id: string, data: Record<string, unknown>) {
    return this.request<any>(`/opportunities/${id}`, { method: 'PUT', body: data });
  }

  // ===== PIPELINES =====
  async getPipelines() {
    return this.request<any>('/opportunities/pipelines', { params: { locationId: this.locationId } });
  }

  // ===== CUSTOM FIELDS =====
  async getCustomFields(model: 'contact' | 'company' | 'opportunity') {
    const modelMap: Record<string, string> = { contact: 'contacts', company: 'companies', opportunity: 'opportunities' };
    return this.request<any>(`/locations/${this.locationId}/customFields`, { params: { model: modelMap[model] || model } });
  }
  async createCustomField(data: Record<string, unknown>) {
    return this.request<any>(`/locations/${this.locationId}/customFields`, { method: 'POST', body: data });
  }

  // ===== CUSTOM OBJECTS (v2) =====
  async getCustomObjects() {
    return this.request<any>(`/custom-objects/?locationId=${this.locationId}`);
  }
  async createCustomObject(data: Record<string, unknown>) {
    return this.request<any>('/custom-objects/', { method: 'POST', body: { ...data, locationId: this.locationId } });
  }
  async getCustomObjectRecords(schemaKey: string, params?: Record<string, string>) {
    return this.request<any>(`/custom-objects/${schemaKey}/records`, {
      params: { locationId: this.locationId, ...params },
    });
  }
  async createCustomObjectRecord(schemaKey: string, data: Record<string, unknown>) {
    return this.request<any>(`/custom-objects/${schemaKey}/records`, {
      method: 'POST',
      body: { ...data, locationId: this.locationId },
    });
  }
  async updateCustomObjectRecord(schemaKey: string, recordId: string, data: Record<string, unknown>) {
    return this.request<any>(`/custom-objects/${schemaKey}/records/${recordId}`, {
      method: 'PUT',
      body: data,
    });
  }

  // ===== CUSTOM VALUES =====
  async getCustomValues() {
    return this.request<any>(`/locations/${this.locationId}/customValues`);
  }
  async createCustomValue(data: Record<string, unknown>) {
    return this.request<any>(`/locations/${this.locationId}/customValues`, { method: 'POST', body: data });
  }

  // ===== LOCATION =====
  async getLocation() {
    return this.request<any>(`/locations/${this.locationId}`);
  }
}

// Singleton
export const ghl = new GhlClient();

// Backward compat alias
export const kleegr = ghl;
