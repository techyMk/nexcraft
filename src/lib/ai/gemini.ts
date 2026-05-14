import "server-only";
import { requireEnv } from "@/lib/env";

/**
 * Gemini embeddings via REST (no SDK).
 *
 * - Model: text-embedding-004 (768 dim)
 * - Free tier: 1500 req/min, plenty for our scale
 * - Get a key at https://aistudio.google.com/apikey (Google account, no CC)
 */

const MODEL_PATH = "models/text-embedding-004";
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

/** Embed a single piece of text. Returns a 768-dim vector. */
export async function embed(text: string): Promise<number[]> {
  const data = await call<EmbedResp>(`${MODEL_PATH}:embedContent`, {
    content: { parts: [{ text }] },
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
    })),
  });
  return data.embeddings.map((e) => e.values);
}
