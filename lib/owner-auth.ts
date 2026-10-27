import { createHash, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { databaseUrl } from './database-config';
import { normalizeEmail, allowedEmail } from './email-auth';
import { admitEmail } from './auth-admission';
import prisma from './prisma';

export function ownerEmail(): string | undefined {
    try {
        const entries = (process.env.AUTH_EMAIL_ALLOWLIST || '').split(',').filter(Boolean);
        return entries.length === 1 ? normalizeEmail(entries[0]) : undefined;
    } catch { return undefined; }
}
export function ownerConfigurationReady(): boolean {
    try {
        const origin = new URL(process.env.NEXTAUTH_URL || '');
        return process.env.AUTH_MODE === 'password' && process.env.AUTH_GUARDS_READY === 'true' &&
            !!ownerEmail() && !!databaseUrl() && (process.env.NEXTAUTH_SECRET?.length || 0) >= 32 && origin.protocol === 'https:' &&
            origin.pathname === '/' && !origin.search && !origin.hash && !origin.username && !origin.password;
    } catch { return false; }
}
export function passwordAuthReady(): boolean {
    return process.env.AUTH_ENABLED === 'true' && ownerConfigurationReady();
}
export function validPassword(value: unknown): value is string {
    return typeof value === 'string' && value.length >= 12 && Buffer.byteLength(value, 'utf8') <= 72;
}
export function validSetupCode(code: unknown, now = Date.now()): boolean {
    const expiry = Date.parse(process.env.OWNER_SETUP_EXPIRES_AT || '');
    const expected = process.env.OWNER_SETUP_TOKEN_SHA256 || '';
    if (process.env.OWNER_SETUP_ENABLED !== 'true' || !ownerEmail() || !Number.isFinite(expiry) || expiry <= now || expiry - now > 86400000 ||
        !/^[a-f0-9]{64}$/.test(expected) || typeof code !== 'string' || !/^[A-Za-z0-9_-]{43,128}$/.test(code)) return false;
    return timingSafeEqual(createHash('sha256').update(`${ownerEmail()}\0${code}`).digest(), Buffer.from(expected, 'hex'));
}
export async function authorizeOwner(credentials: Record<string, string> | undefined) {
    if (!passwordAuthReady() || !credentials || !allowedEmail(credentials.email) || !validPassword(credentials.password)) return null;
    const email = normalizeEmail(credentials.email);
    if (!await admitEmail(email)) return null;
    try {
        const user = await prisma.user.findUnique({where: {email}});
        if (!user?.password || !await bcrypt.compare(credentials.password, user.password)) return null;
        return {id: user.id, name: user.name, email: user.email};
    } catch { return null; }
}
export async function provisionOwner(code: unknown, password: unknown): Promise<boolean> {
    if (!ownerConfigurationReady() || !validSetupCode(code) || !validPassword(password) || !databaseUrl()) return false;
    const email = ownerEmail()!;
    if (!await admitEmail(email)) return false;
    try {
        // No password reset path. A valid code still cannot replace any existing account.
        const existing = await prisma.user.findFirst({where: {email: {equals: email, mode: 'insensitive'}}, select: {id: true}});
        if (existing) return false;
        const hash = await bcrypt.hash(password, 12);
        const token = createHash('sha256').update(`${email}\0${code}`).digest('hex');
        await prisma.$transaction(async tx => {
            await tx.$executeRaw`SET LOCAL statement_timeout = '2000ms'`;
            await tx.$executeRaw`SET LOCAL lock_timeout = '500ms'`;
            const locked = await tx.$queryRaw<{locked:boolean}[]>`SELECT pg_try_advisory_xact_lock(1935763821, 1701998434) AS locked`;
            if (!locked[0]?.locked || !validSetupCode(code)) throw new Error('Setup unavailable');
            if (await tx.user.findFirst({where: {email: {equals: email, mode: 'insensitive'}}, select: {id: true}})) throw new Error('Setup unavailable');
            await tx.verificationToken.create({data: {identifier: 'system:owner-setup:consumed', token, expires: new Date(process.env.OWNER_SETUP_EXPIRES_AT!)}});
            await tx.user.create({data: {email, password: hash, emailVerified: null}});
        }, {maxWait: 1000, timeout: 3000, isolationLevel: 'ReadCommitted'});
        // Marker uniqueness and account creation commit together; a replay cannot reset a password.
        return true;
    } catch { return false; }
}
