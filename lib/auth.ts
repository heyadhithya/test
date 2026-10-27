import { trustedRedirect } from './security';
import { allowedEmail, emailProvider } from './email-auth';
import type { NextAuthOptions } from 'next-auth';
import type { Adapter } from 'next-auth/adapters';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as Adapter,
    providers: [emailProvider],
    session: { strategy: 'jwt' },
    // Avoid logging tokens, addresses, provider responses or credentials.
    logger: { error() { console.error('Authentication failed'); }, warn() {}, debug() {} },
    callbacks: {
        async signIn({ user, email, account }) {
            if (account?.provider !== 'email') return false;
            // Requests are indistinguishable; callback authorization still requires the allowlist.
            if (email?.verificationRequest) return true;
            return allowedEmail(user.email);
        },
        async session({ session, token }) {
            if (session.user && token.sub) session.user.id = token.sub;
            return session;
        },
        async redirect({ url }) { return trustedRedirect(url, process.env.NEXTAUTH_URL || ''); },
    },
    pages: { signIn: '/login', error: '/login', verifyRequest: '/login?sent=1' },
};
