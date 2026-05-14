import "server-only";
import Groq from "groq-sdk";
import { requireEnv } from "@/lib/env";

/** Server-side Groq client (free + fast Llama inference). */
export function groq() {
  return new Groq({ apiKey: requireEnv("GROQ_API_KEY") });
}

/**
 * Default chat model. Llama 3.3 70B is the best balance of quality + free-tier
 * rate limits on Groq today. Swap to llama-3.1-8b-instant if you need lower
 * latency, or to mixtral-8x7b-32768 / gemma2-9b-it as alternatives.
 */
export const CHAT_MODEL = "llama-3.3-70b-versatile";
