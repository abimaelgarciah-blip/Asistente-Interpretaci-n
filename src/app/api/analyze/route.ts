import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { analyzeFindings } from "@/lib/anthropic";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const findings: string = body.findings?.trim();

  if (!findings || findings.length < 20) {
    return NextResponse.json({ error: "El texto de hallazgos es demasiado corto" }, { status: 400 });
  }

  const result = await analyzeFindings(findings);

  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO studies (user_email, user_name, findings, analysis, cache_hit, input_tokens, output_tokens, cache_read_tokens)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    session.user.email,
    session.user.name ?? "",
    findings,
    result.analysis,
    result.cacheHit ? 1 : 0,
    result.inputTokens,
    result.outputTokens,
    result.cacheReadTokens
  );

  return NextResponse.json({
    id: info.lastInsertRowid,
    analysis: result.analysis,
    cacheHit: result.cacheHit,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    cacheReadTokens: result.cacheReadTokens,
  });
}
