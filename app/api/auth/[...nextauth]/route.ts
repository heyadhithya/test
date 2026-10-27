import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { authReady } from '@/lib/email-auth';
import { NextRequest } from 'next/server';

const handler = NextAuth(authOptions);
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) {
    if (authReady()) return handler(request, context);
    return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
}
export async function POST(request: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) {
    if (!authReady()) return new Response('Authentication is not configured', { status: 503 });
    const { nextauth } = await context.params;
    const emailRequest = nextauth[0] === 'signin' && nextauth[1] === 'email';
    if (!emailRequest) return handler(request, context);
    // NextAuth validates CSRF before signIn callback; that callback performs distributed admission.
    try { await handler(request, context); } catch { console.error("Authentication request failed"); }
    // Do not reveal allowlist membership, delivery status or token issuance to callers.
    return Response.json({ url: `${process.env.NEXTAUTH_URL}/login?sent=1` }, { headers: { 'Cache-Control': 'no-store' } });
}
