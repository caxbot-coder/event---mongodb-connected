import { NextRequest, NextResponse } from 'next/server';
import { getHistoricalData } from '@/lib/analytics-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    
    const data = await getHistoricalData(days);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Failed to fetch historical analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historical analytics' },
      { status: 500 }
    );
  }
}
