import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventType = body.type || body.event;
    console.log(`[Webhook] Received event: ${eventType}`);
    return NextResponse.json({ received: true, event: eventType });
  } catch (error) {
    console.error('[Webhook] Error:', error);
    return NextResponse.json({ received: true, error: 'Processing failed' });
  }
}
