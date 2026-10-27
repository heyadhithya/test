import prisma from './prisma';
import { databaseUrl } from './database-config';
import { isApprovedIssuer } from './security';
import { privateStorageReady } from './private-storage';

export type IssuanceReadiness = 'guest' | 'unauthorized' | 'unavailable' | 'ready';
export async function issuanceReadiness(userId: string | undefined): Promise<IssuanceReadiness> {
  if (!userId) return 'guest';
  if (!isApprovedIssuer(userId, process.env.ISSUER_USER_IDS)) return 'unauthorized';
  if (process.env.VERIFIED_ISSUANCE_ENABLED !== 'true' || !databaseUrl() || (process.env.ISSUANCE_ID_SECRET?.length ?? 0) < 32) return 'unavailable';
  try {
    const origin = new URL(process.env.NEXTAUTH_URL || '');
    if (origin.protocol !== 'https:') return 'unavailable';
    const [user, storage] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
      privateStorageReady(),
    ]);
    return user && storage ? 'ready' : 'unavailable';
  } catch { return 'unavailable'; }
}
