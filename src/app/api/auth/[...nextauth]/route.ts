import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import type { NextRequest } from "next/server";

// Detect the real base URL from proxy headers so NextAuth's CSRF check
// passes when the app is served behind a reverse proxy (e.g. Claude Code web).
function resolveBaseUrl(req: NextRequest): string {
  const host =
    req.headers.get("x-forwarded-host") ??
    req.headers.get("host") ??
    "localhost:3000";
  const proto =
    req.headers.get("x-forwarded-proto")?.split(",")[0] ?? "http";
  return `${proto}://${host}`;
}

const handler = NextAuth(authOptions);

export async function GET(req: NextRequest, ctx: { params: { nextauth: string[] } }) {
  process.env.NEXTAUTH_URL = resolveBaseUrl(req);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return handler(req as any, ctx as any);
}

export async function POST(req: NextRequest, ctx: { params: { nextauth: string[] } }) {
  process.env.NEXTAUTH_URL = resolveBaseUrl(req);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return handler(req as any, ctx as any);
}
