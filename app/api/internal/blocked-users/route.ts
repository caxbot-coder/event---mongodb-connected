import { NextResponse } from 'next/server';
import { MongoService } from '@/lib/mongodb';

export async function GET() {
  try {
    const members = await MongoService.sMembers('blocked_users');
    return NextResponse.json({ members });
  } catch (error) {
    console.error('blocked-users:', error);
    return NextResponse.json({ members: [] as string[] }, { status: 200 });
  }
}
