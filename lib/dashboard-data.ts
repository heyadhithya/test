import prisma from './prisma';

/** All reads are bound to the authenticated session ID, never request input. */
export async function ownerDashboard(userId: string, now = new Date(), db = prisma) {
  if (!userId) throw new Error('Authentication required');
  const owner = { userId };
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const [total, issued, pending, failed, revoked, thisMonth, certificates] = await Promise.all([
    db.certificate.count({ where: owner }),
    db.certificate.count({ where: { ...owner, status: 'issued', revoked: false, pdfUrl: { not: '' } } }),
    db.certificate.count({ where: { ...owner, status: 'pending' } }),
    db.certificate.count({ where: { ...owner, status: 'failed' } }),
    db.certificate.count({ where: { ...owner, revoked: true } }),
    db.certificate.count({ where: { ...owner, status: 'issued', createdAt: { gte: monthStart, lt: monthEnd } } }),
    db.certificate.findMany({ where: owner, orderBy: { createdAt: 'desc' }, take: 30 }),
  ]);
  return { total, issued, pending, failed, revoked, thisMonth, certificates };
}
