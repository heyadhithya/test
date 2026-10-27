import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isApprovedIssuer } from '@/lib/security';
import { pilotReady } from '@/lib/pilot-auth';
import Workspace from './SairamWorkspace';

export const dynamic = 'force-dynamic';

export default async function CertificateWorkspace() {
  const session = await getServerSession(authOptions).catch(() => null);
  const isSignedIn = Boolean(session?.user?.id);
  const canIssue = Boolean(
    session?.user?.id &&
    process.env.VERIFIED_ISSUANCE_ENABLED === 'true' &&
    (isApprovedIssuer(session.user.id, process.env.ISSUER_USER_IDS) ||
      (pilotReady() && process.env.PILOT_ISSUANCE_ENABLED === 'true' && session.pilotAccess === true))
  );
  return <Workspace isSignedIn={isSignedIn} canIssue={canIssue} />;
}
