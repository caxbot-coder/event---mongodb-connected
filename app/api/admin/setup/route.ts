import { NextRequest, NextResponse } from 'next/server';
import { MongoService } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    // Sample data for demonstration
    const sampleUsers = [
      {
        id: 'user_1',
        email: 'john@example.com',
        name: 'John Doe',
        plan: 'premium',
        status: 'active',
        createdAt: new Date('2024-01-15').toISOString(),
        lastActive: new Date().toISOString()
      },
      {
        id: 'user_2',
        email: 'jane@example.com',
        name: 'Jane Smith',
        plan: 'basic',
        status: 'active',
        createdAt: new Date('2024-02-20').toISOString(),
        lastActive: new Date().toISOString()
      },
      {
        id: 'user_3',
        email: 'blocked@example.com',
        name: 'Blocked User',
        plan: 'free',
        status: 'blocked',
        createdAt: new Date('2024-01-10').toISOString(),
        lastActive: new Date().toISOString()
      }
    ];

    const sampleEvents = [
      {
        id: 'event_1',
        title: 'Tech Conference 2024',
        description: 'Annual technology conference featuring latest innovations',
        date: new Date('2024-12-15').toISOString(),
        attendees: 150,
        status: 'upcoming'
      },
      {
        id: 'event_2',
        title: 'Startup Meetup',
        description: 'Networking event for startup founders and investors',
        date: new Date('2024-11-30').toISOString(),
        attendees: 75,
        status: 'upcoming'
      },
      {
        id: 'event_3',
        title: 'Product Launch',
        description: 'New product launch event and demo',
        date: new Date('2024-10-25').toISOString(),
        attendees: 200,
        status: 'completed'
      }
    ];

    const samplePlans = [
      {
        id: 'plan_free',
        name: 'Free',
        price: 0,
        features: ['Basic features', '5 events/month', 'Community support'],
        userCount: 45,
        status: 'active'
      },
      {
        id: 'plan_basic',
        name: 'Basic',
        price: 29,
        features: ['All free features', '20 events/month', 'Email support', 'Basic analytics'],
        userCount: 120,
        status: 'active'
      },
      {
        id: 'plan_premium',
        name: 'Premium',
        price: 99,
        features: ['All basic features', 'Unlimited events', 'Priority support', 'Advanced analytics', 'Custom branding'],
        userCount: 85,
        status: 'active'
      },
      {
        id: 'plan_enterprise',
        name: 'Enterprise',
        price: 299,
        features: ['All premium features', 'Dedicated support', 'Custom integrations', 'SLA guarantee', 'White-label solution'],
        userCount: 12,
        status: 'active'
      }
    ];

    // Store sample data in MongoDB
    await Promise.all([
      MongoService.jsonSet('admin:users', '$', sampleUsers),
      MongoService.jsonSet('admin:events', '$', sampleEvents),
      MongoService.jsonSet('admin:plans', '$', samplePlans),
      MongoService.sAdd('blocked_users', 'user_3') // Add blocked user to set
    ]);

    return NextResponse.json({ 
      success: true, 
      message: 'Admin data initialized successfully',
      data: {
        users: sampleUsers.length,
        events: sampleEvents.length,
        plans: samplePlans.length,
        blockedUsers: 1
      }
    });

  } catch (error) {
    console.error('Failed to setup admin data:', error);
    return NextResponse.json(
      { error: 'Failed to setup admin data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if data exists
    const [users, events, plans, blockedUsers] = await Promise.all([
      MongoService.jsonGet('admin:users'),
      MongoService.jsonGet('admin:events'),
      MongoService.jsonGet('admin:plans'),
      MongoService.sMembers('blocked_users')
    ]);

    return NextResponse.json({
      initialized: !!(users && events && plans),
      data: {
        users: users?.length || 0,
        events: events?.length || 0,
        plans: plans?.length || 0,
        blockedUsers: blockedUsers?.length || 0
      }
    });

  } catch (error) {
    console.error('Failed to check admin data status:', error);
    return NextResponse.json(
      { error: 'Failed to check admin data status' },
      { status: 500 }
    );
  }
}
