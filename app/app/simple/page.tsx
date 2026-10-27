import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isApprovedIssuer } from '@/lib/security';
import Workspace from './SairamWorkspace';

export const dynamic = 'force-dynamic';

export default async function SimpleWorkspace() {
  const session = await getServerSession(authOptions).catch(() => null);
  const isSignedIn = Boolean(session?.user?.id);
  const canIssue = Boolean(session?.user?.id &&
    process.env.VERIFIED_ISSUANCE_ENABLED === 'true' &&
    isApprovedIssuer(session.user.id, process.env.ISSUER_USER_IDS));
  return <Workspace isSignedIn={isSignedIn} canIssue={canIssue}/>;
}
