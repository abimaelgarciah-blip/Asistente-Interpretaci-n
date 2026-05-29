"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  return (
    <nav className="bg-blue-900 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-lg tracking-tight">
            🏥 Asistente Radiológico
          </span>
          <div className="flex gap-4 text-sm">
            <Link
              href="/"
              className={`hover:text-blue-200 transition-colors ${
                pathname === "/" ? "text-white font-semibold border-b-2 border-blue-300" : "text-blue-200"
              }`}
            >
              Análisis
            </Link>
            <Link
              href="/history"
              className={`hover:text-blue-200 transition-colors ${
                pathname === "/history" ? "text-white font-semibold border-b-2 border-blue-300" : "text-blue-200"
              }`}
            >
              Historial
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-blue-200">{session.user?.name ?? session.user?.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="bg-blue-800 hover:bg-blue-700 px-3 py-1 rounded text-xs transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  );
}
