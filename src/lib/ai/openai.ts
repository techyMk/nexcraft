import "server-only";
import OpenAI from "openai";
import { requireEnv } from "@/lib/env";

/** Server-side OpenAI client. Used only for embeddings; Claude does generation. */
export function openai() {
  return new OpenAI({ apiKey: requireEnv("OPENAI_API_KEY") });
}

export const EMBED_MODEL = "text-embedding-3-small";
export const EMBED_DIM = 1536;

/** Embed a single string. Returns a 1536-dim vector. */
export async function embed(text: string): Promise<number[]> {
  const resp = await openai().embeddings.create({
    model: EMBED_MODEL,
    input: text,
  });
  return resp.data[0]!.embedding;
}

/** Embed many strings in one call (max 2048 inputs per request). */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (!texts.length) return [];
  const resp = await openai().embeddings.create({
    model: EMBED_MODEL,
    input: texts,
  });
  // Preserve input order
  return resp.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}
