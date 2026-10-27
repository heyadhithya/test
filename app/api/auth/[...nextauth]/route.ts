import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { authReady } from '@/lib/email-auth';
import { NextRequest } from 'next/server';

const handler = NextAuth(authOptions);
export const dynamic = 'force-dynamic';
let windowStart = 0;
let requests = 0;
export async function GET(request: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) {
    if (authReady()) return handler(request, context);
    return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
}
export async function POST(request: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) {
    if (!authReady()) return new Response('Authentication is not configured', { status: 503 });
    const { nextauth } = await context.params;
    const emailRequest = nextauth[0] === 'signin' && nextauth[1] === 'email';
    if (!emailRequest) return handler(request, context);
    // Fixed-size process-wide budget also bounds unlisted-address token writes.
    // A distributed deployment still needs platform/provider rate limits.
    const now = Date.now();
    if (now - windowStart >= 60000) { windowStart = now; requests = 0; }
    if (++requests <= 10) {
        // NextAuth owns CSRF validation and token issuance; never invoke the sender directly.
        try { await handler(request, context); } catch { console.error("Authentication request failed"); }
    }
    // Do not reveal allowlist membership, delivery status or token issuance to callers.
    return Response.json({ url: `${process.env.NEXTAUTH_URL}/login?sent=1` }, { headers: { 'Cache-Control': 'no-store' } });
}
