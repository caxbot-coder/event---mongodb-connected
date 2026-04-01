import { NextRequest, NextResponse } from 'next/server';
import { MongoService } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { eventId, action } = await request.json();

    if (!eventId || !action) {
      return NextResponse.json(
        { error: 'Event ID and action are required' },
        { status: 400 }
      );
    }

    // Get all events
    const events = await MongoService.jsonGet('events') || [];
    
    // Find and update the event
    const updatedEvents = events.map((event: any) => {
      if (event.id === eventId) {
        if (action === 'approve') {
          return { ...event, status: 'upcoming' };
        } else if (action === 'reject') {
          return { ...event, status: 'cancelled' };
        }
      }
      return event;
    });

    // Save updated events
    await MongoService.jsonSet('events', '$', updatedEvents);

    return NextResponse.json({ 
      success: true, 
      message: `Event ${action}d successfully` 
    });
  } catch (error) {
    console.error('Failed to approve/reject event:', error);
    return NextResponse.json(
      { error: 'Failed to update event status' },
      { status: 500 }
    );
  }
}
