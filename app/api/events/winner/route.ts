import { NextRequest, NextResponse } from 'next/server';
import { MongoService } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { eventId, ownerId, winnerUserId, winnerSlot } = await request.json();

    if (!eventId || !ownerId || !winnerUserId) {
      return NextResponse.json(
        { error: 'Event ID, owner ID and winner user ID are required' },
        { status: 400 }
      );
    }

    const events = (await MongoService.jsonGet('events')) || [];

    const eventIndex = events.findIndex((event: any) => event.id === eventId);
    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const event = events[eventIndex];

    if (!event.organizerId || event.organizerId !== ownerId) {
      return NextResponse.json(
        { error: 'Only the event owner can select a winner' },
        { status: 403 }
      );
    }

    const slotsMap: Record<string, string> = event.slots || {};
    const winnerSlotKey =
      typeof winnerSlot === 'number' && Number.isFinite(winnerSlot)
        ? String(winnerSlot)
        : Object.keys(slotsMap).find((slotKey) => slotsMap[slotKey] === winnerUserId);

    if (!winnerSlotKey || slotsMap[winnerSlotKey] !== winnerUserId) {
      return NextResponse.json(
        { error: 'Selected winner is not a valid attendee for this event' },
        { status: 400 }
      );
    }

    event.winnerUserId = winnerUserId;
    event.winnerSlot = parseInt(winnerSlotKey, 10);
    event.winnerSelectedAt = new Date().toISOString();

    events[eventIndex] = event;
    await MongoService.jsonSet('events', '$', events);

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error('Failed to set event winner:', error);
    return NextResponse.json(
      { error: 'Failed to set event winner' },
      { status: 500 }
    );
  }
}

