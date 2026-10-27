import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { issuanceReadiness } from '@/lib/issuance-readiness';
import CertificateGenerator from '@/components/CertificateGenerator';

export const dynamic = 'force-dynamic';
export default async function GeneratorPage() {
  const session = await getServerSession(authOptions);
  const readiness = await issuanceReadiness(session?.user?.id);
  return <CertificateGenerator readiness={readiness} />;
}
