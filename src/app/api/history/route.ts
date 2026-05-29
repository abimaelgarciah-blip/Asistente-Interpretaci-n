import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 20;
  const offset = (page - 1) * limit;

  const db = getDb();
  const rows = db.prepare(`
    SELECT id, user_email, user_name, substr(findings, 1, 120) as findings_snippet,
           substr(analysis, 1, 200) as analysis_snippet,
           cache_hit, input_tokens, output_tokens, created_at
    FROM studies
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(limit, offset);

  const { count } = db.prepare("SELECT COUNT(*) as count FROM studies").get() as { count: number };

  return NextResponse.json({ studies: rows, total: count, page, limit });
}
