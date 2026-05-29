"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";

interface Study {
  id: number;
  user_email: string;
  user_name: string;
  findings_snippet: string;
  analysis_snippet: string;
  cache_hit: number;
  input_tokens: number;
  output_tokens: number;
  created_at: string;
}

interface HistoryResponse {
  studies: Study[];
  total: number;
  page: number;
  limit: number;
}

export default function HistoryPage() {
  const { status } = useSession({ required: true, onUnauthenticated() { router.push("/login"); } });
  const router = useRouter();
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Study | null>(null);
  const [fullStudy, setFullStudy] = useState<{ findings: string; analysis: string } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchHistory = useCallback(async (p: number) => {
    setLoading(true);
    const res = await fetch(`/api/history?page=${p}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchHistory(page);
  }, [status, page, fetchHistory]);

  async function viewDetail(study: Study) {
    setSelected(study);
    setLoadingDetail(true);
    setFullStudy(null);
    const res = await fetch(`/api/history/${study.id}`);
    const full = await res.json();
    setFullStudy({ findings: full.findings, analysis: full.analysis });
    setLoadingDetail(false);
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center py-20 text-gray-500">Cargando historial...</div>
      </div>
    );
  }

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Historial de Estudios</h1>
            <p className="text-gray-500 text-sm mt-1">
              {data?.total ?? 0} estudios analizados en total
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Nuevo análisis
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Fecha</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Médico</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Hallazgos (extracto)</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Caché</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Tokens</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data?.studies.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    No hay estudios registrados aún.
                  </td>
                </tr>
              )}
              {data?.studies.map((study) => (
                <tr key={study.id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {new Date(study.created_at).toLocaleString("es-ES", {
                      day: "2-digit", month: "2-digit", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">
                    {study.user_name || study.user_email}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                    {study.findings_snippet}...
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${study.cache_hit ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {study.cache_hit ? "✓ Sí" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {study.input_tokens} / {study.output_tokens}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => viewDetail(study)}
                      className="text-blue-700 hover:underline text-xs font-medium"
                    >
                      Ver detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 rounded border text-sm disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="px-3 py-1 text-sm text-gray-600">
              Página {page} de {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 rounded border text-sm disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        )}
      </main>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => { setSelected(null); setFullStudy(null); }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Detalles del estudio #{selected.id}</h2>
              <button onClick={() => { setSelected(null); setFullStudy(null); }} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              {selected.user_name} &bull; {new Date(selected.created_at).toLocaleString("es-ES")}
            </p>
            {loadingDetail ? (
              <div className="text-center py-8 text-gray-400">Cargando...</div>
            ) : fullStudy ? (
              <>
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Hallazgos ingresados</h3>
                  <pre className="whitespace-pre-wrap text-xs bg-slate-50 border rounded p-3 text-gray-600 font-sans">{fullStudy.findings}</pre>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Análisis del agente</h3>
                  <pre className="whitespace-pre-wrap text-xs bg-blue-50 border border-blue-100 rounded p-3 text-gray-700 font-sans">{fullStudy.analysis}</pre>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
