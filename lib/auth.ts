import { trustedRedirect } from './security';
import { authorizeOwner } from './owner-auth';
import type { NextAuthOptions } from 'next-auth';
import type { Adapter } from 'next-auth/adapters';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as Adapter,
    providers: [CredentialsProvider({name: 'Password', credentials: {email: {label: 'Email', type: 'email'}, password: {label: 'Password', type: 'password'}}, authorize: authorizeOwner})],
    session: {strategy: 'jwt', maxAge: 8 * 60 * 60},
    jwt: {maxAge: 8 * 60 * 60},
    logger: {error() { console.error('Authentication failed'); }, warn() {}, debug() {}},
    callbacks: {
        async session({session, token}) {
            if (session.user && token.sub) session.user.id = token.sub;
            return session;
        },
        async redirect({url}) { return trustedRedirect(url, process.env.NEXTAUTH_URL || ''); },
    },
    pages: {signIn: '/login', error: '/login'},
};
