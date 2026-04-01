import { NextRequest, NextResponse } from 'next/server';
import { MongoService } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const events = await MongoService.jsonGet('events') || [];
    
    // Only show approved events (status: 'upcoming' or 'completed')
    const approvedEvents = events.filter((event: any) => 
      event.status === 'upcoming' || event.status === 'completed'
    );
    
    // Sort events by date (upcoming first)
    const sortedEvents = approvedEvents.sort((a: any, b: any) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    return NextResponse.json({ success: true, events: sortedEvents });
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { eventId } = await request.json();
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Get existing events
    const existingEvents = await MongoService.jsonGet('events') || [];
    
    // Remove the event
    const filteredEvents = existingEvents.filter((event: any) => event.id !== eventId);
    
    // Update the events list
    await MongoService.jsonSet('events', '$', filteredEvents);

    return NextResponse.json({ 
      success: true, 
      message: 'Event deleted successfully' 
    });
  } catch (error) {
    console.error('Failed to delete event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'date', 'time', 'location', 'category'];
    for (const field of requiredFields) {
      if (!eventData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Get existing events
    const existingEvents = await MongoService.jsonGet('events') || [];
    
    // Create new event with ID and metadata
    const newEvent = {
      id: Date.now().toString(),
      ...eventData,
      organizerName: eventData.organizerName || 'User',
      organizerId: eventData.organizerId || null, // Store the owner's user ID
      attendees: 0,
      status: 'pending', // Events start as pending for admin approval
      createdAt: new Date().toISOString(),
      price: eventData.price || 0,
      maxAttendees: eventData.maxAttendees || 50,
      isPremium: eventData.isPremium || false,
      imageUrl: eventData.imageUrl || '',
      winnerUserId: null,
      winnerSlot: null,
      winnerSelectedAt: null
    };

    // Add to events array
    const updatedEvents = [...existingEvents, newEvent];
    
    // Store in MongoDB
    await MongoService.jsonSet('events', '$', updatedEvents);

    return NextResponse.json({ 
      success: true, 
      event: newEvent,
      message: 'Event submitted for approval' 
    });
  } catch (error) {
    console.error('Failed to create event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
