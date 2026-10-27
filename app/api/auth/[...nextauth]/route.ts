import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { authReady } from '@/lib/email-auth';
import { pilotReady } from '@/lib/pilot-auth';
import { NextRequest } from 'next/server';

const handler = NextAuth(authOptions);
export const dynamic = 'force-dynamic';
function available() { return authReady() || pilotReady(); }

export async function GET(request: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) {
  if (available()) return handler(request, context);
  return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function POST(request: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) {
  if (!available()) return new Response('Authentication is not configured', { status: 503 });
  const { nextauth } = await context.params;
  const emailRequest = nextauth[0] === 'signin' && nextauth[1] === 'email';
  if (!emailRequest) return handler(request, context);
  if (!authReady()) return new Response('Email-link authentication is unavailable', { status: 503 });
  try { await handler(request, context); } catch { console.error('Authentication request failed'); }
  return Response.json({ url: (process.env.NEXTAUTH_URL || '') + '/login?sent=1' }, { headers: { 'Cache-Control': 'no-store' } });
}
