// Server-runtime configuration only; never import into a client component or NEXT_PUBLIC env.
export function databaseUrl(env: Record<string, string | undefined> = process.env): string | undefined {
    // Explicit local/owner configuration wins; otherwise use the verified Marketplace Prisma pool URL.
    return env.DATABASE_URL || env.POSTGRES_PRISMA_URL || undefined;
}
