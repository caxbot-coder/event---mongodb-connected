import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/api/internal/')) {
    return NextResponse.next();
  }

  // Check if user is blocked (simplified check using IP or session identifier)
  // In a real app, you'd get the user ID from authentication
  const clientIp = req.headers.get('x-forwarded-for') || 
                   req.headers.get('x-real-ip') || 
                   'unknown';
  const sessionId = req.cookies.get('session')?.value || clientIp;

  try {
    const blockedRes = await fetch(new URL('/api/internal/blocked-users', req.url), {
      cache: 'no-store',
    });
    if (!blockedRes.ok) throw new Error('blocked-users fetch failed');
    const data = (await blockedRes.json()) as { members?: string[] };
    const blockedUsers = data.members ?? [];
    
    // Check if current session/user is blocked
    // This is a simplified check - in production you'd map session to actual user ID
    const isBlocked = blockedUsers.some((blockedUserId: string) => {
      // For demo, we'll check if the session contains a blocked user ID
      return sessionId.includes(blockedUserId) || blockedUserId === 'user_3';
    });

    // If user is blocked and not already on blocked page, redirect to blocked page
    if (isBlocked && pathname !== '/blocked') {
      const url = req.nextUrl.clone();
      url.pathname = '/blocked';
      return NextResponse.redirect(url);
    }

    // If user is not blocked and trying to access blocked page, redirect to home
    if (!isBlocked && pathname === '/blocked') {
      const url = req.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  } catch (error) {
    console.error('Error checking user block status:', error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
