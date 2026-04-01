import { NextRequest, NextResponse } from 'next/server';
import { MongoService } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'userId and action are required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'block':
        // Add user to blocked set
        await MongoService.sAdd('blocked_users', userId);
        
        // Update user status in users data
        const users = await MongoService.jsonGet('admin:users') || [];
        const updatedUsers = users.map((user: any) => {
          if (user.id === userId) {
            return { ...user, status: 'blocked' };
          }
          return user;
        });
        
        await MongoService.jsonSet('admin:users', '$', updatedUsers);
        
        return NextResponse.json({ 
          success: true, 
          message: 'User blocked successfully',
          users: updatedUsers 
        });

      case 'unblock':
        // Remove user from blocked set
        await MongoService.sRem('blocked_users', userId);
        
        // Update user status in users data
        const currentUsers = await MongoService.jsonGet('admin:users') || [];
        const usersWithUnblockedStatus = currentUsers.map((user: any) => {
          if (user.id === userId) {
            return { ...user, status: 'active' };
          }
          return user;
        });
        
        await MongoService.jsonSet('admin:users', '$', usersWithUnblockedStatus);
        
        return NextResponse.json({ 
          success: true, 
          message: 'User unblocked successfully',
          users: usersWithUnblockedStatus 
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "block" or "unblock"' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Failed to update user block status:', error);
    return NextResponse.json(
      { error: 'Failed to update user block status' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const blockedUsers = await MongoService.sMembers('blocked_users');
    return NextResponse.json({ blockedUsers: blockedUsers || [] });
  } catch (error) {
    console.error('Failed to fetch blocked users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blocked users' },
      { status: 500 }
    );
  }
}
