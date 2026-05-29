import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const db = getDb();
  const row = db.prepare("SELECT * FROM studies WHERE id = ?").get(params.id);
  if (!row) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(row);
}
