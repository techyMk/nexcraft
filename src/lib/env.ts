/**
 * Env validation helpers — **server-side only**.
 *
 * ⚠️ Do NOT call these from `"use client"` modules. Both use dynamic
 * `process.env[name]` access, which webpack/Next.js cannot inline into the
 * browser bundle (only literal `process.env.NEXT_PUBLIC_X` accesses get
 * replaced). In the browser they always return `undefined`.
 *
 * For client-side env needs, read `process.env.NEXT_PUBLIC_*` directly —
 * see `src/lib/supabase/client.ts` for the pattern.
 *
 * Use `requireEnv("STRIPE_SECRET_KEY")` inside API routes / server actions /
 * server components — if the variable is missing, the request fails with a
 * useful JSON error ("STRIPE_SECRET_KEY is not set on the server") instead
 * of a cryptic "Cannot read properties of undefined" stack trace.
 */

export class EnvError extends Error {
  status = 500;
  code = "ENV_MISSING";
  constructor(name: string) {
    super(`${name} is not set on the server. Add it in Vercel → Settings → Environment Variables (or .env.local for local dev) and redeploy.`);
    this.name = "EnvError";
  }
}

export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === "") throw new EnvError(name);
  return v;
}

export function optionalEnv(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() !== "" ? v : undefined;
}

/** True if Supabase env is fully configured for browser + server reads. */
export function isSupabaseConfigured() {
  return Boolean(
    optionalEnv("NEXT_PUBLIC_SUPABASE_URL") &&
      optionalEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  );
}

/** True if Stripe is fully configured on the server (Checkout + webhook). */
export function isStripeConfigured() {
  return Boolean(
    optionalEnv("STRIPE_SECRET_KEY") &&
      optionalEnv("STRIPE_WEBHOOK_SECRET") &&
      optionalEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
  );
}
