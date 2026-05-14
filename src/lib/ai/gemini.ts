import "server-only";
import { requireEnv } from "@/lib/env";

/**
 * Gemini embeddings via REST (no SDK).
 *
 * - Model: gemini-embedding-001 (MRL — we ask for 768 dims to match the
 *   pgvector column from migration 007). Google deprecated the older
 *   text-embedding-004 endpoint and replaced it with this.
 * - Get a key at https://aistudio.google.com/apikey (Google account, no CC)
 */

const MODEL_PATH = "models/gemini-embedding-001";
const BASE = "https://generativelanguage.googleapis.com/v1beta";
export const EMBED_DIM = 768;

type EmbedResp = { embedding: { values: number[] } };
type BatchResp = { embeddings: { values: number[] }[] };

async function call<T>(path: string, body: unknown): Promise<T> {
  const key = requireEnv("GEMINI_API_KEY");
  const res = await fetch(`${BASE}/${path}?key=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini ${path} failed (${res.status}): ${text}`);
  }
  return (await res.json()) as T;
}

/** Embed a single piece of text. Returns an EMBED_DIM-sized vector. */
export async function embed(text: string): Promise<number[]> {
  const data = await call<EmbedResp>(`${MODEL_PATH}:embedContent`, {
    content: { parts: [{ text }] },
    outputDimensionality: EMBED_DIM,
  });
  return data.embedding.values;
}

/** Batch-embed up to 100 texts in a single request. */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (!texts.length) return [];
  const data = await call<BatchResp>(`${MODEL_PATH}:batchEmbedContents`, {
    requests: texts.map((text) => ({
      model: MODEL_PATH,
      content: { parts: [{ text }] },
      outputDimensionality: EMBED_DIM,
    })),
  });
  return data.embeddings.map((e) => e.values);
}
