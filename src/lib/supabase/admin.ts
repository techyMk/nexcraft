import "server-only";
import { createClient } from "@supabase/supabase-js";
import { requireEnv } from "@/lib/env";

/**
 * Admin client (service_role). **Bypasses RLS** — use only inside:
 *   - webhook handlers (Stripe, etc.)
 *   - cron jobs
 *   - admin server actions where you've already authorised the caller
 *
 * Never import this file from a `"use client"` module. The `server-only`
 * import above will turn that into a build error.
 */
export function supabaseAdmin() {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
