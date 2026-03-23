import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET /api/jobs/fields-config — returns all field configs
export async function GET() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('lf_job_fields_config')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ fields: data || [] });
}

// POST /api/jobs/fields-config — add a new field
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { data: profile } = await supabase.from('lf_profiles').select('role').eq('id', user.id).maybeSingle();
  if (!profile || !['super_admin', 'admin'].includes(profile.role)) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const body = await req.json();
  const { data, error } = await supabase.from('lf_job_fields_config').insert({
    key: body.key,
    ghl_key: body.ghl_key || body.key,
    label: body.label,
    field_type: body.field_type || 'text',
    placeholder: body.placeholder || '',
    required: body.required || false,
    col_span: body.col_span || 1,
    field_group: body.field_group || 'details',
    sort_order: body.sort_order || 100,
    options: body.options || [],
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ field: data });
}

// PUT /api/jobs/fields-config — update a field
export async function PUT(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { data: profile } = await supabase.from('lf_profiles').select('role').eq('id', user.id).maybeSingle();
  if (!profile || !['super_admin', 'admin'].includes(profile.role)) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const body = await req.json();
  const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
  const allowed = ['ghl_key', 'label', 'field_type', 'placeholder', 'required', 'col_span', 'field_group', 'sort_order', 'options', 'is_active'];
  for (const k of allowed) { if (body[k] !== undefined) updateData[k] = body[k]; }

  const { data, error } = await supabase.from('lf_job_fields_config').update(updateData).eq('id', body.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ field: data });
}
