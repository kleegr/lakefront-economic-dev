// Business Opportunity Sync — pushes to Kleegr Custom Object: business_opportunities
import { ghlConfig, isGhlConfigured } from './config';
import { bizOppToGhlProperties } from './business-opportunities-fields-config';

const SCHEMA_KEY = 'custom_objects.business_opportunities';
const BASE_URL = 'https://services.leadconnectorhq.com';
function getHeaders() { return { 'Authorization': `Bearer ${ghlConfig.token}`, 'Content-Type': 'application/json', 'Version': '2021-07-28' }; }

async function tryCreate(props: Record<string, any>): Promise<{ success: boolean; data?: any; error?: string }> {
  const body = { locationId: ghlConfig.locationId, properties: props };
  const res = await fetch(`${BASE_URL}/objects/${SCHEMA_KEY}/records`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) });
  if (res.ok) { const data = await res.json(); return { success: true, data }; }
  const err = await res.json().catch(() => null);
  return { success: false, error: JSON.stringify(err?.message || err) };
}

async function tryUpdate(recordId: string, props: Record<string, any>): Promise<{ success: boolean; data?: any; error?: string }> {
  const body = { properties: props };
  const res = await fetch(`${BASE_URL}/objects/${SCHEMA_KEY}/records/${recordId}?locationId=${ghlConfig.locationId}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) });
  if (res.ok) { const data = await res.json(); return { success: true, data }; }
  const err = await res.json().catch(() => null);
  return { success: false, error: JSON.stringify(err?.message || err) };
}

export async function syncBizOppToGhl(
  opp: Record<string, any>,
  existingGhlId?: string | null
): Promise<{ ghlRecordId: string | null; success: boolean; error?: string }> {
  if (!isGhlConfigured()) return { ghlRecordId: null, success: false, error: 'Kleegr not configured' };
  try {
    const props = bizOppToGhlProperties(opp);
    if (existingGhlId) {
      const result = await tryUpdate(existingGhlId, props);
      if (result.success) return { ghlRecordId: existingGhlId, success: true };
      if (result.error?.includes('not found')) {
        const cr = await tryCreate(props);
        return { ghlRecordId: cr.data?.record?.id || null, success: cr.success, error: cr.error };
      }
      return { ghlRecordId: existingGhlId, success: false, error: result.error };
    } else {
      const result = await tryCreate(props);
      return { ghlRecordId: result.data?.record?.id || null, success: result.success, error: result.error };
    }
  } catch (err: any) { return { ghlRecordId: null, success: false, error: err?.message || String(err) }; }
}

export async function deleteGhlBizOppRecord(recordId: string): Promise<{ success: boolean; error?: string }> {
  if (!isGhlConfigured()) return { success: false, error: 'Kleegr not configured' };
  try {
    const res = await fetch(`${BASE_URL}/objects/${SCHEMA_KEY}/records/${recordId}?locationId=${ghlConfig.locationId}`, { method: 'DELETE', headers: getHeaders() });
    if (res.ok) return { success: true };
    const err = await res.json().catch(() => null);
    return { success: false, error: JSON.stringify(err?.message || err) };
  } catch (err: any) { return { success: false, error: err?.message || String(err) }; }
}
