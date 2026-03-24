import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// Public API for submitting applications (no auth required)
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const body = await req.json();
  const { data, error } = await supabase.from('lf_applications').insert({
    applicant_name: body.applicant_name || null,
    applicant_email: body.applicant_email || null,
    applicant_phone: body.applicant_phone || null,
    address: body.address || null,
    application_type: body.application_type || 'employee',
    cover_letter: body.cover_letter || null,
    status: body.status || 'submitted',
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, application: data });
}
