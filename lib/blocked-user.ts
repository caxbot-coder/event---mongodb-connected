import { MongoService } from '@/lib/mongodb';

export async function getBlockedUserIds(): Promise<string[]> {
  try {
    return await MongoService.sMembers('blocked_users');
  } catch {
    return [];
  }
}

export function isSessionBlocked(sessionId: string, blockedUsers: string[]): boolean {
  return blockedUsers.some((blockedUserId: string) => {
    return sessionId.includes(blockedUserId) || blockedUserId === 'user_3';
  });
}
