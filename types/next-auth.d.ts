import type { DefaultSession } from 'next-auth';
declare module 'next-auth' {
  interface Session {
    user: { id: string } & DefaultSession['user'];
    pilotAccess?: boolean;
  }
}
declare module 'next-auth/jwt' {
  interface JWT { id?: string; pilot?: boolean; }
}
