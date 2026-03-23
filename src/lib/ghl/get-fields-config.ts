// Helper to fetch field config from Supabase (server-side)
import { createServerSupabase } from '@/lib/supabase/server';

export async function getFieldsConfig() {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('lf_job_fields_config')
    .select('key, ghl_key, label, field_type, options, field_group, sort_order, placeholder, required, col_span')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  return data || [];
}
