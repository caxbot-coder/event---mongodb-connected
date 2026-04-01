import { NextRequest, NextResponse } from 'next/server';
import { MongoService } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json();

    // Validate required fields
    const requiredFields = ['title', 'description', 'date', 'time', 'location', 'organizerName', 'organizerEmail'];
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
    
    // Add new event
    const updatedEvents = [...existingEvents, eventData];
    
    // Store in MongoDB
    await MongoService.jsonSet('events', '$', updatedEvents);

    return NextResponse.json({ 
      success: true, 
      message: 'Event created successfully',
      eventId: eventData.id 
    });

  } catch (error) {
    console.error('Failed to create event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
