import { jsonOk } from "@/lib/api";
import {
  isSupabaseConfigured,
  isStripeConfigured,
  optionalEnv,
} from "@/lib/env";

/**
 * GET /api/health — debug helper.
 * Returns which env vars are set (booleans only — never the values).
 * Delete or gate this once everything works.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  return jsonOk({
    nodeEnv: process.env.NODE_ENV,
    cwd: process.cwd(),
    supabase: {
      url: !!optionalEnv("NEXT_PUBLIC_SUPABASE_URL"),
      anonKey: !!optionalEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      serviceRole: !!optionalEnv("SUPABASE_SERVICE_ROLE_KEY"),
      configured: isSupabaseConfigured(),
    },
    stripe: {
      secret: !!optionalEnv("STRIPE_SECRET_KEY"),
      publishable: !!optionalEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
      webhookSecret: !!optionalEnv("STRIPE_WEBHOOK_SECRET"),
      configured: isStripeConfigured(),
    },
    siteUrl: optionalEnv("NEXT_PUBLIC_SITE_URL") ?? null,
  });
}
