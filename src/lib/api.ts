import { NextResponse } from "next/server";
import { EnvError } from "./env";

/**
 * Always-JSON response helpers for route handlers.
 * Pair with the client pattern:
 *
 *   const r = await fetch("/api/checkout", { method: "POST", body });
 *   const text = await r.text();
 *   const data = text ? JSON.parse(text) : {};
 *   if (!r.ok) throw new Error(data.error ?? `Request failed (${r.status})`);
 *
 * That way the UI toast surfaces the *real* server message instead of a
 * cryptic "Unexpected end of JSON input".
 */

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function jsonError(message: string, status = 400, code?: string) {
  return NextResponse.json({ error: message, code }, { status });
}

/**
 * Run a route handler and translate every thrown error into a structured
 * JSON response. Recognises EnvError (env var missing → 500 ENV_MISSING),
 * standard Errors (→ 500), and Supabase PostgrestError-shaped values.
 */
export async function jsonRoute<T>(fn: () => Promise<T> | T) {
  try {
    const result = await fn();
    if (result instanceof Response) return result;
    return jsonOk(result);
  } catch (err: unknown) {
    if (err instanceof EnvError) return jsonError(err.message, err.status, err.code);

    if (typeof err === "object" && err !== null && "message" in err) {
      const e = err as { message: string; code?: string; status?: number };
      // Supabase PG errors → 400, anything else → 500
      const status = typeof e.status === "number" ? e.status : 500;
      return jsonError(e.message, status, e.code);
    }

    return jsonError("Unexpected server error", 500);
  }
}
