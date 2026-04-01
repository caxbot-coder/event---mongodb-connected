import { NextRequest, NextResponse } from 'next/server';
import { getRealTimeStats } from '@/lib/analytics-server';

export async function GET(request: NextRequest) {
  try {
    const stats = await getRealTimeStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('Failed to fetch real-time analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch real-time analytics' },
      { status: 500 }
    );
  }
}
