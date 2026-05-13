import "server-only";
import Stripe from "stripe";
import { requireEnv } from "./env";

/** Lazy server-side Stripe client. Throws EnvError if STRIPE_SECRET_KEY missing. */
export function stripe() {
  return new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
    apiVersion: "2026-04-22.dahlia",
  });
}
