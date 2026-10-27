import { PrismaClient } from '@prisma/client';

// The Vercel/Supabase integration supplies POSTGRES_PRISMA_URL. Prefer an explicitly
// configured DATABASE_URL, but do not duplicate credentials into source or logs.
const prismaClientSingleton = () => {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;
  return new PrismaClient(url ? { datasources: { db: { url } } } : undefined);
};
const globalForPrisma = globalThis as unknown as { prismaGlobal?: PrismaClient };
const prisma = globalForPrisma.prismaGlobal ?? prismaClientSingleton();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaGlobal = prisma;
export default prisma;
