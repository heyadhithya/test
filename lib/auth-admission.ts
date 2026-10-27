import { createHmac, randomBytes } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import prisma from './prisma';
import { allowedEmail, normalizeEmail } from './email-auth';

const GLOBAL = 'system:auth:admission:global';
export type AdmissionDatabase = Pick<typeof prisma, '$transaction'>;
// These markers cannot be email identifiers. Only HMACs, never addresses or link tokens, are stored.
export async function admitEmail(value: string | null | undefined, database: AdmissionDatabase = prisma): Promise<boolean> {
    if (!allowedEmail(value) || !process.env.NEXTAUTH_SECRET || process.env.AUTH_GUARDS_READY !== 'true') return false;
    const recipient = 'system:auth:admission:' + createHmac('sha256', process.env.NEXTAUTH_SECRET).update(normalizeEmail(value!)).digest('hex');
    try {
        return await database.$transaction(async (tx: Prisma.TransactionClient) => {
            await tx.$executeRaw`SET LOCAL statement_timeout = '2000ms'`;
            await tx.$executeRaw`SET LOCAL lock_timeout = '500ms'`;
            // Nonblocking lock serializes all app instances; busy/error means no token or send.
            const locked = await tx.$queryRaw<{ locked: boolean }[]>`SELECT pg_try_advisory_xact_lock(1935763821, 1701998433) AS locked`;
            if (!locked[0]?.locked) return false;
            // Requires the reviewed expires/token index. At most 100 expired rows per admitted attempt.
            await tx.$executeRaw`WITH expired AS (
                SELECT token FROM public."VerificationToken" WHERE expires < CURRENT_TIMESTAMP
                ORDER BY expires, token LIMIT 100 FOR UPDATE SKIP LOCKED
            ) DELETE FROM public."VerificationToken" v USING expired e WHERE v.token = e.token`;
            const rows = await tx.$queryRaw<{ global_hour: bigint; global_minute: bigint; recipient_hour: bigint; recipient_minute: bigint }[]>`
                SELECT count(*) FILTER (WHERE identifier = ${GLOBAL}) AS global_hour,
                    count(*) FILTER (WHERE identifier = ${GLOBAL} AND expires > CURRENT_TIMESTAMP + INTERVAL '59 minutes') AS global_minute,
                    count(*) FILTER (WHERE identifier = ${recipient}) AS recipient_hour,
                    count(*) FILTER (WHERE identifier = ${recipient} AND expires > CURRENT_TIMESTAMP + INTERVAL '59 minutes') AS recipient_minute
                FROM public."VerificationToken" WHERE identifier IN (${GLOBAL}, ${recipient}) AND expires > CURRENT_TIMESTAMP`;
            const count = rows[0];
            if (!count || count.global_hour >= BigInt(60) || count.global_minute >= BigInt(10) || count.recipient_hour >= BigInt(3) || count.recipient_minute > BigInt(0)) return false;
            const globalToken = randomBytes(32).toString('hex');
            const recipientToken = randomBytes(32).toString('hex');
            await tx.$executeRaw`INSERT INTO public."VerificationToken" (identifier, token, expires) VALUES
                (${GLOBAL}, ${globalToken}, CURRENT_TIMESTAMP + INTERVAL '1 hour'),
                (${recipient}, ${recipientToken}, CURRENT_TIMESTAMP + INTERVAL '1 hour')`;
            return true;
        }, { maxWait: 1000, timeout: 3000, isolationLevel: 'ReadCommitted' });
    } catch { return false; }
}
