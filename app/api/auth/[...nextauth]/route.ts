import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { passwordAuthReady } from '@/lib/owner-auth';
import { NextRequest } from 'next/server';
const handler = NextAuth(authOptions);
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest, context: {params: Promise<{nextauth: string[]}>}) {
    if (passwordAuthReady()) return handler(request, context);
    return Response.json({});
}
export async function POST(request: NextRequest, context: {params: Promise<{nextauth: string[]}>}) {
    if (!passwordAuthReady()) return new Response('Authentication is not configured', {status: 503});
    return handler(request, context);
}
