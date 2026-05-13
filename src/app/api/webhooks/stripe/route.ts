import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { requireEnv } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/stripe
 * Stripe → us. Verifies signature, then flips order status.
 *
 * Local dev:
 *   stripe listen --forward-to localhost:3000/api/webhooks/stripe
 * Production: add the URL in Stripe Dashboard → Developers → Webhooks and
 * copy the `whsec_...` into STRIPE_WEBHOOK_SECRET.
 */
export async function POST(req: Request) {
  try {
    const sig = headers().get("stripe-signature");
    if (!sig) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 },
      );
    }

    const whSecret = requireEnv("STRIPE_WEBHOOK_SECRET");
    const body = await req.text();

    let event: Stripe.Event;
    try {
      event = stripe().webhooks.constructEvent(body, sig, whSecret);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Webhook signature verification failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const admin = supabaseAdmin();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;
        if (orderId) {
          await admin
            .from("orders")
            .update({
              status: "processing",
              stripe_payment_intent: session.payment_intent as string | null,
            })
            .eq("id", orderId);
        }
        break;
      }
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;
        if (orderId) {
          await admin
            .from("orders")
            .update({ status: "cancelled" })
            .eq("id", orderId);
        }
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : null;
        if (pi) {
          await admin
            .from("orders")
            .update({ status: "refunded" })
            .eq("stripe_payment_intent", pi);
        }
        break;
      }
      default:
        // Ignore everything else — Stripe needs a 2xx
        break;
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Webhook handler failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
