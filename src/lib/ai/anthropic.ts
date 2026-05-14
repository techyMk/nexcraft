import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { requireEnv } from "@/lib/env";

/** Server-side Anthropic client (Claude). */
export function anthropic() {
  return new Anthropic({ apiKey: requireEnv("ANTHROPIC_API_KEY") });
}

// Newest Sonnet — picks up tool-use + improved long-context behaviour.
export const CHAT_MODEL = "claude-sonnet-4-6";
