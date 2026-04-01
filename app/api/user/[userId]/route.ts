import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Supabase admin client not configured. Check environment variables.');

      const fallbackUser = {
        id: userId,
        email: 'user@example.com',
        full_name: 'Event Attendee',
        isPremium: false,
      };

      return NextResponse.json({
        success: true,
        user: fallbackUser,
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (error || !data?.user) {
      console.error('Error fetching user from Supabase admin API:', error);

      const fallbackUser = {
        id: userId,
        email: 'user@example.com',
        full_name: 'Event Attendee',
        isPremium: false,
      };

      return NextResponse.json({
        success: true,
        user: fallbackUser,
      });
    }

    const user = data.user;

    const userInfo = {
      id: user.id,
      email: user.email ?? 'unknown@example.com',
      full_name:
        (user.user_metadata as any)?.full_name ??
        user.email?.split('@')[0] ??
        'Event Attendee',
      isPremium:
        (user.user_metadata as any)?.isPremium ??
        (user.user_metadata as any)?.is_premium ??
        false,
    };

    return NextResponse.json({
      success: true,
      user: userInfo,
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
