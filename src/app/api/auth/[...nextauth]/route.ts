import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import type { NextRequest } from "next/server";

function resolveBaseUrl(req: NextRequest): string {
  const host =
    req.headers.get("x-forwarded-host") ??
    req.headers.get("host") ??
    "localhost:3000";
  const proto =
    req.headers.get("x-forwarded-proto")?.split(",")[0] ?? "http";
  return `${proto}://${host}`;
}

export async function GET(req: NextRequest, ctx: { params: { nextauth: string[] } }) {
  process.env.NEXTAUTH_URL = resolveBaseUrl(req);
  const handler = NextAuth(authOptions);
  return handler(req as Parameters<typeof handler>[0], ctx as Parameters<typeof handler>[1]);
}

export async function POST(req: NextRequest, ctx: { params: { nextauth: string[] } }) {
  process.env.NEXTAUTH_URL = resolveBaseUrl(req);
  const handler = NextAuth(authOptions);
  return handler(req as Parameters<typeof handler>[0], ctx as Parameters<typeof handler>[1]);
}
