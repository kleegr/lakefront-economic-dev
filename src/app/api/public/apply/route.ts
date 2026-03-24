import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { syncApplicationToKleegr } from '@/lib/ghl/contact-sync';

// Public API for submitting applications (no auth required)
// Creates record in Supabase AND syncs to Kleegr as a contact with custom fields
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const body = await req.json();
  
  // Save to Supabase
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
  
  // Sync to Kleegr as a contact
  let kleegrSynced = false;
  let kleegrContactId = null;
  if (data) {
    const syncResult = await syncApplicationToKleegr(data);
    kleegrSynced = syncResult.success;
    kleegrContactId = syncResult.contactId;
    
    // Save Kleegr contact ID back to Supabase
    if (kleegrSynced && kleegrContactId) {
      await supabase.from('lf_applications').update({
        ghl_contact_id: kleegrContactId,
        ghl_synced_at: new Date().toISOString(),
      }).eq('id', data.id);
    }
  }
  
  return NextResponse.json({ 
    success: true, 
    application: data,
    kleegrSynced,
    kleegrContactId,
  });
}
