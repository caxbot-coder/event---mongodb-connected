import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId, isPremium } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Update user metadata in Supabase
    const { data, error } = await supabase.auth.admin.updateUserById(
      userId,
      { 
        user_metadata: { 
          isPremium: isPremium,
          updated_at: new Date().toISOString()
        } 
      }
    );

    if (error) {
      console.error('Error updating user premium status:', error);
      return NextResponse.json(
        { error: 'Failed to update premium status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: `Premium status updated to ${isPremium}` 
    });
  } catch (error) {
    console.error('Error in set-premium API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
