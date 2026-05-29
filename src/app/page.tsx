"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";

interface AnalysisResult {
  id: number;
  analysis: string;
  cacheHit: boolean;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
}

export default function HomePage() {
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/login");
    },
  });
  const [findings, setFindings] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    if (!findings.trim() || findings.trim().length < 20) {
      setError("Por favor ingrese al menos 20 caracteres de hallazgos.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ findings }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error desconocido");
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al analizar el informe.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Análisis de Informe Radiológico</h1>
          <p className="text-gray-500 text-sm mt-1">
            Pegue el texto del informe para detectar inconsistencias automáticamente.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Hallazgos radiológicos
          </label>
          <textarea
            value={findings}
            onChange={(e) => setFindings(e.target.value)}
            rows={10}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"
            placeholder="Ingrese aquí el texto completo del informe radiológico..."
          />
          <div className="mt-1 text-right text-xs text-gray-400">
            {findings.length} caracteres
          </div>

          {error && (
            <div className="mt-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading || findings.trim().length < 20}
            className="mt-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Analizando...
              </>
            ) : (
              "Analizar informe"
            )}
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h2 className="text-lg font-bold text-gray-800">Resultado del análisis</h2>
              <div className="flex flex-wrap gap-2 text-xs">
                <span
                  className={`px-2 py-1 rounded-full font-medium ${
                    result.cacheHit ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {result.cacheHit ? "✓ Caché activo" : "Caché frío"}
                </span>
                <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
                  {result.inputTokens} entrada / {result.outputTokens} salida tokens
                </span>
                {result.cacheReadTokens > 0 && (
                  <span className="px-2 py-1 rounded-full bg-purple-50 text-purple-600 font-medium">
                    {result.cacheReadTokens} tokens en caché
                  </span>
                )}
              </div>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed bg-slate-50 rounded-lg p-4 border">
              {result.analysis}
            </pre>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => router.push("/history")}
                className="text-sm text-blue-700 hover:underline"
              >
                Ver historial de estudios →
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
