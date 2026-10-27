import { databaseUrl } from './database-config'
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  const url = databaseUrl()
  return new PrismaClient(url ? { datasources: { db: { url } } } : undefined)
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
