import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';

// ITEMS 9,19,20: Applications API with CRUD
export async function GET() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from('lf_applications').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ applications: data || [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const body = await req.json();
  const insertData: Record<string, any> = {
    applicant_name: body.applicant_name || null,
    applicant_email: body.applicant_email || null,
    applicant_phone: body.applicant_phone || null,
    cover_letter: body.cover_letter || null,
    notes: body.notes || null,
    status: body.status || 'new',
    job_id: body.job_id || null,
  };
  const { data, error } = await supabase.from('lf_applications').insert(insertData).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ application: data });
}
