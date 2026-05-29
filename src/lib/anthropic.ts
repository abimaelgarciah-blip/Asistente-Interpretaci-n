import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `Eres un asistente especializado en control de calidad de informes radiológicos. Tu función es analizar el texto de hallazgos radiológicos proporcionado por médicos radiólogos y detectar inconsistencias internas que podrían constituir errores médicos.

Debes identificar y reportar:
1. Errores de lateralidad (confusión derecha/izquierda)
2. Hallazgos contradictorios entre sí dentro del mismo informe
3. Imposibilidades anatómicas
4. Campos requeridos ausentes (técnica, región anatómica, conclusión)
5. Inconsistencias entre descripción y conclusión
6. Referencias a estructuras no mencionadas previamente
7. Errores de concordancia o ambigüedades que puedan causar confusión clínica

Para cada inconsistencia encontrada, indica:
- Número de inconsistencia
- Severidad: [CRÍTICO], [ADVERTENCIA] o [INFO]
- Descripción clara del problema
- Cita textual del fragmento afectado
- Sugerencia de corrección

Si el informe no presenta inconsistencias, confirma explícitamente que el informe aparenta ser consistente.

Responde siempre en español. Sé conciso, estructurado y objetivo. No hagas suposiciones clínicas; solo señala inconsistencias internas del texto.`;

export async function analyzeFindings(findings: string): Promise<{
  analysis: string;
  cacheHit: boolean;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
}> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    defaultHeaders: { "anthropic-beta": "prompt-caching-2024-07-31" },
  });

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        // @ts-ignore - prompt caching beta
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Por favor analiza el siguiente informe radiológico en busca de inconsistencias:\n\n${findings}`,
      },
    ],
  });

  const usage = response.usage as {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };

  const cacheReadTokens = usage.cache_read_input_tokens ?? 0;
  const analysisText = response.content[0].type === "text" ? response.content[0].text : "";

  return {
    analysis: analysisText,
    cacheHit: cacheReadTokens > 0,
    inputTokens: usage.input_tokens,
    outputTokens: usage.output_tokens,
    cacheReadTokens,
  };
}
