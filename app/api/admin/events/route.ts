import { NextRequest, NextResponse } from 'next/server';
import { MongoService } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    // Get all events including pending ones from main events storage
    const events = await MongoService.jsonGet('events') || [];
    
    // Sort events by creation date (newest first)
    const sortedEvents = events.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    return NextResponse.json({ success: true, events: sortedEvents });
  } catch (error) {
    console.error('Failed to fetch admin events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, event, eventId, data } = body;

    switch (action) {
      case 'create':
        const currentEvents = await MongoService.jsonGet('events') || [];
        const updatedEvents = [...currentEvents, event];
        
        await MongoService.jsonSet('events', '$', updatedEvents);
        return NextResponse.json({ success: true, events: updatedEvents });

      case 'update':
        const existingEvents = await MongoService.jsonGet('events') || [];
        const eventsWithUpdate = existingEvents.map((e: any) => {
          if (e.id === eventId) {
            return { ...e, ...data };
          }
          return e;
        });
        
        await MongoService.jsonSet('events', '$', eventsWithUpdate);
        return NextResponse.json({ success: true, events: eventsWithUpdate });

      case 'delete':
        const allEvents = await MongoService.jsonGet('events') || [];
        const filteredEvents = allEvents.filter((e: any) => e.id !== eventId);
        
        await MongoService.jsonSet('events', '$', filteredEvents);
        return NextResponse.json({ success: true, events: filteredEvents });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Failed to manage events:', error);
    return NextResponse.json(
      { error: 'Failed to manage events' },
      { status: 500 }
    );
  }
}
