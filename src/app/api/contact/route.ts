import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const contactType = body.type || 'general';
  const name = body.name || '';
  const email = body.email || '';
  const message = body.message || '';

  // TODO: When Kleegr integration is fully configured, create a contact/lead
  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: `${contactType} inquiry submitted (Kleegr integration pending)`, data: { id: `contact-${Date.now()}`, type: contactType } });
}
