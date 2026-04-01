import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get the user from the session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to get session' },
        { status: 500 }
      );
    }

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No user logged in' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        user_metadata: session.user.user_metadata,
        app_metadata: session.user.app_metadata,
        isPremium_check: {
          isPremium: session.user.user_metadata?.isPremium,
          is_premium: session.user.user_metadata?.is_premium,
        }
      }
    });
  } catch (error) {
    console.error('Error in debug-user API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
