import { NextRequest, NextResponse } from 'next/server';
import { MongoService } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const users = await MongoService.jsonGet('admin:users');
    return NextResponse.json({ users: users || [] });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, data } = body;

    switch (action) {
      case 'update_status':
        const users = await MongoService.jsonGet('admin:users') || [];
        const updatedUsers = users.map((user: any) => {
          if (user.id === userId) {
            return { ...user, status: data.status };
          }
          return user;
        });
        
        await MongoService.jsonSet('admin:users', '$', updatedUsers);
        
        if (data.status === 'blocked') {
          await MongoService.sAdd('blocked_users', userId);
        } else {
          await MongoService.sRem('blocked_users', userId);
        }
        
        return NextResponse.json({ success: true, users: updatedUsers });

      case 'update_plan':
        const currentUsers = await MongoService.jsonGet('admin:users') || [];
        const usersWithUpdatedPlan = currentUsers.map((user: any) => {
          if (user.id === userId) {
            return { ...user, plan: data.plan };
          }
          return user;
        });
        
        await MongoService.jsonSet('admin:users', '$', usersWithUpdatedPlan);
        return NextResponse.json({ success: true, users: usersWithUpdatedPlan });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
