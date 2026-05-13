"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client. Uses cookies — RLS scoped to the signed-in user.
 *
 * Why we read process.env directly (not via requireEnv):
 *   NEXT_PUBLIC_* env vars are only inlined into the browser bundle when
 *   accessed as a STATIC property literal (process.env.NEXT_PUBLIC_X).
 *   Reading process.env[name] with a dynamic key skips webpack's inlining
 *   and leaves it as `undefined` at runtime in the browser.
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. " +
        "Add them to .env.local (then restart `npm run dev`) or to Vercel → Settings → Environment Variables (then redeploy).",
    );
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
