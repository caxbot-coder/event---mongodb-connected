import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getBlockedUserIds, isSessionBlocked } from '@/lib/blocked-user';

export default async function BlockedUserGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const cookieStore = await cookies();

  const pathname = headersList.get('x-middleware-pathname') ?? '/';

  const clientIp =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    'unknown';
  const sessionId = cookieStore.get('session')?.value || clientIp;

  const blockedUsers = await getBlockedUserIds();
  const isBlocked = isSessionBlocked(sessionId, blockedUsers);

  if (isBlocked && pathname !== '/blocked') {
    redirect('/blocked');
  }
  if (!isBlocked && pathname === '/blocked') {
    redirect('/');
  }

  return <>{children}</>;
}
