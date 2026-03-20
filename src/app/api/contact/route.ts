import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.firstName || !body.lastName || !body.email) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    const contactType = body.type || body.subject || 'general';
    return NextResponse.json({ success: true, message: `${contactType} inquiry submitted (GHL integration pending)`, data: { id: `contact-${Date.now()}`, type: contactType } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
