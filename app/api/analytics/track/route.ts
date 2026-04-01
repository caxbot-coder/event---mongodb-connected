import { NextRequest, NextResponse } from 'next/server';
import { recordAnalyticsEvent } from '@/lib/analytics-server';
import type { UserEvent } from '@/lib/analytics-types';

export async function POST(request: NextRequest) {
  try {
    const event = (await request.json()) as UserEvent;
    if (!event?.sessionId || !event?.eventType || !event?.timestamp) {
      return NextResponse.json({ error: 'Invalid event payload' }, { status: 400 });
    }
    await recordAnalyticsEvent(event);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics track error:', error);
    return NextResponse.json({ error: 'Failed to record event' }, { status: 500 });
  }
}
