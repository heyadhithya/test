import CredentialsProvider from 'next-auth/providers/credentials';
import { createHash, timingSafeEqual } from 'node:crypto';
import prisma from '@/lib/prisma';
import { admitEmail } from '@/lib/auth-admission';
import { allowedEmail, normalizeEmail } from '@/lib/email-auth';

export function pilotReady(): boolean {
  try {
    const origin = new URL(process.env.NEXTAUTH_URL || '');
    const digest = process.env.PILOT_PASSWORD_SHA256 || '';
    return process.env.PILOT_ENABLED === 'true' &&
      process.env.AUTH_GUARDS_READY === 'true' &&
      origin.protocol === 'https:' &&
      origin.pathname === '/' &&
      !origin.search && !origin.hash &&
      /^[a-f0-9]{64}$/i.test(digest) &&
      (process.env.NEXTAUTH_SECRET?.length || 0) >= 32 &&
      Boolean(process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL) &&
      (process.env.AUTH_EMAIL_ALLOWLIST || '').split(',').some(email => allowedEmail(email));
  } catch { return false; }
}

function passwordMatches(password: string): boolean {
  if (password.length < 30 || password.length > 200) return false;
  const stored = Buffer.from(process.env.PILOT_PASSWORD_SHA256 || '', 'hex');
  if (stored.length !== 32) return false;
  const submitted = createHash('sha256').update(password).digest();
  return timingSafeEqual(stored, submitted);
}

export const pilotProvider = CredentialsProvider({
  id: 'pilot',
  name: 'Sairam pilot administrator',
  credentials: {
    email: { label: 'Approved email', type: 'email' },
    password: { label: 'Pilot passphrase', type: 'password' },
  },
  async authorize(credentials) {
    if (!pilotReady()) return null;
    let email: string;
    try {
      email = normalizeEmail(credentials?.email || '');
      if (!allowedEmail(email) || !passwordMatches(credentials?.password || '')) return null;
    } catch { return null; }
    // Shared Postgres admission lock prevents concurrent logins from evading a per-address quota.
    if (!await admitEmail(email)) return null;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name: 'Sairam Pilot Issuer' },
      select: { id: true, email: true, name: true },
    });
    return { id: user.id, email: user.email, name: user.name };
  },
});
