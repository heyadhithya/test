import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";



const handler = NextAuth(authOptions);

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: any) {
  if (process.env.VERIFIED_ISSUANCE_ENABLED === "true") return handler(request, context);
  return new Response("{}", {status: 200, headers: {"Content-Type": "application/json"}});
}

export async function POST(request: NextRequest, context: any) {
  if (process.env.VERIFIED_ISSUANCE_ENABLED === "true") return handler(request, context);
  return new Response("Authentication is not configured", {status: 503});
}
