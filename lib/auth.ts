import { trustedRedirect } from './security';
import { admitEmail } from './auth-admission';
import { allowedEmail, emailProvider } from './email-auth';
import { pilotProvider, pilotReady } from './pilot-auth';
import type { NextAuthOptions } from 'next-auth';
import type { Adapter } from 'next-auth/adapters';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [pilotProvider, emailProvider],
  session: { strategy: 'jwt', maxAge: 12 * 60 * 60 },
  logger: { error() { console.error('Authentication failed'); }, warn() {}, debug() {} },
  callbacks: {
    async signIn({ user, email, account }) {
      if (account?.provider === 'pilot') return pilotReady() && allowedEmail(user.email);
      if (account?.provider !== 'email') return false;
      if (email?.verificationRequest) return await admitEmail(user.email) ? true : (process.env.NEXTAUTH_URL || '') + '/login?sent=1';
      return allowedEmail(user.email);
    },
    async jwt({ token, user, account }) {
      if (user && account) {
        token.id = user.id;
        token.pilot = account.provider === 'pilot';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      session.pilotAccess = token.pilot === true;
      return session;
    },
    async redirect({ url }) { return trustedRedirect(url, process.env.NEXTAUTH_URL || ''); },
  },
  pages: { signIn: '/login', error: '/login', verifyRequest: '/login?sent=1' },
};
