import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.firstName || !body.lastName || !body.email || !body.businessName) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: 'Business application submitted (GHL integration pending)', data: { id: `biz-${Date.now()}` } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ success: true, message: 'Using mock data', data: [] });
}
