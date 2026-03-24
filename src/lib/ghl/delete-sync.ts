// Kleegr Delete Sync — deletes corresponding records in Kleegr when portal records are deleted
import { ghlConfig, isGhlConfigured } from './config';

const BASE_URL = 'https://services.leadconnectorhq.com';

function getHeaders() {
  return {
    'Authorization': `Bearer ${ghlConfig.token}`,
    'Content-Type': 'application/json',
    'Version': '2021-07-28',
  };
}

// Delete a contact from Kleegr by ID
export async function deleteKleegrContact(contactId: string): Promise<{ success: boolean; error?: string }> {
  if (!isGhlConfigured() || !contactId) return { success: false, error: 'Not configured or no ID' };
  try {
    const res = await fetch(`${BASE_URL}/contacts/${contactId}`, { method: 'DELETE', headers: getHeaders() });
    if (res.ok || res.status === 404) return { success: true };
    const d = await res.json().catch(() => ({}));
    return { success: false, error: d?.message || `Status ${res.status}` };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Unknown error' };
  }
}

// Delete a custom object record from Kleegr
export async function deleteKleegrRecord(recordId: string): Promise<{ success: boolean; error?: string }> {
  if (!isGhlConfigured() || !recordId) return { success: false, error: 'Not configured or no ID' };
  try {
    const res = await fetch(`${BASE_URL}/objects/records/${recordId}`, { method: 'DELETE', headers: getHeaders() });
    if (res.ok || res.status === 404) return { success: true };
    const d = await res.json().catch(() => ({}));
    return { success: false, error: d?.message || `Status ${res.status}` };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Unknown error' };
  }
}

// Update a contact in Kleegr (for edit sync)
export async function updateKleegrContact(contactId: string, data: Record<string, any>): Promise<{ success: boolean; error?: string }> {
  if (!isGhlConfigured() || !contactId) return { success: false, error: 'Not configured or no ID' };
  try {
    const res = await fetch(`${BASE_URL}/contacts/${contactId}`, {
      method: 'PUT', headers: getHeaders(), body: JSON.stringify(data),
    });
    if (res.ok) return { success: true };
    const d = await res.json().catch(() => ({}));
    return { success: false, error: d?.message || `Status ${res.status}` };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Unknown error' };
  }
}

// Update a custom object record in Kleegr (for edit sync)
export async function updateKleegrRecord(recordId: string, properties: Record<string, any>): Promise<{ success: boolean; error?: string }> {
  if (!isGhlConfigured() || !recordId) return { success: false, error: 'Not configured or no ID' };
  try {
    const res = await fetch(`${BASE_URL}/objects/records/${recordId}`, {
      method: 'PUT', headers: getHeaders(),
      body: JSON.stringify({ locationId: ghlConfig.locationId, properties }),
    });
    if (res.ok) return { success: true };
    const d = await res.json().catch(() => ({}));
    return { success: false, error: d?.message || `Status ${res.status}` };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Unknown error' };
  }
}
