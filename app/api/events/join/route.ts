import { NextRequest, NextResponse } from 'next/server';
import { MongoService } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { eventId, userId, slot } = await request.json();

    if (!eventId || !userId) {
      return NextResponse.json(
        { error: 'Event ID and User ID are required' },
        { status: 400 }
      );
    }

    if (typeof slot !== 'number' || slot <= 0) {
      return NextResponse.json(
        { error: 'A valid slot selection is required' },
        { status: 400 }
      );
    }

    // Get all events
    const events = await MongoService.jsonGet('events') || [];
    
    // Find the event
    const eventIndex = events.findIndex((event: any) => event.id === eventId);
    
    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const event = events[eventIndex];

    // Check if event is approved
    if (event.status !== 'upcoming') {
      return NextResponse.json(
        { error: 'Event is not available for joining' },
        { status: 400 }
      );
    }

    // Validate slot against maxAttendees if provided
    const maxAttendees = typeof event.maxAttendees === 'number'
      ? event.maxAttendees
      : parseInt(event.maxAttendees || '0', 10);

    if (maxAttendees && slot > maxAttendees) {
      return NextResponse.json(
        { error: 'Selected slot is not available for this event' },
        { status: 400 }
      );
    }

    // Ensure attendees is an array
    if (event.attendees && Array.isArray(event.attendees)) {
      if (event.attendees.includes(userId)) {
        return NextResponse.json(
          { error: 'You have already joined this event' },
          { status: 400 }
        );
      }
    } else {
      event.attendees = [];
    }

    // Initialize slots map if not present
    if (!event.slots) {
      event.slots = {};
    }

    // Check if selected slot is already taken
    if (event.slots[String(slot)]) {
      return NextResponse.json(
        { error: 'This slot is already taken. Please choose another slot.' },
        { status: 400 }
      );
    }

    // Add user to attendees and reserve slot
    event.attendees.push(userId);
    event.attendeeCount = (event.attendeeCount || 0) + 1;
    event.slots[String(slot)] = userId;

    // Update the event in the array
    events[eventIndex] = event;
    
    // Save back to MongoDB
    await MongoService.jsonSet('events', '$', events);

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully joined event',
      attendeeCount: event.attendeeCount
    });

  } catch (error) {
    console.error('Failed to join event:', error);
    return NextResponse.json(
      { error: 'Failed to join event' },
      { status: 500 }
    );
  }
}
