import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user from Supabase
    const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const isPremium = user.user_metadata?.isPremium || false;

    return NextResponse.json({
      success: true,
      isPremium,
      userId: user.id,
      email: user.email
    });

  } catch (error) {
    console.error('Error checking premium status:', error);
    return NextResponse.json(
      { error: 'Failed to check premium status' },
      { status: 500 }
    );
  }
}
