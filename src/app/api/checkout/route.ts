import { headers } from "next/headers";
import { jsonRoute, jsonError } from "@/lib/api";
import { requireEnv } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

type Line = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

/**
 * POST /api/checkout
 * Body: { items: Line[] }
 * Returns: { url } — Stripe Checkout session URL to redirect to.
 *
 * Always returns JSON (success OR error). On the client:
 *
 *   const r = await fetch("/api/checkout", { method: "POST", body: JSON.stringify({ items }) });
 *   const text = await r.text();
 *   const data = text ? JSON.parse(text) : {};
 *   if (!r.ok) throw new Error(data.error ?? `Checkout failed (${r.status})`);
 *   location.href = data.url;
 */
export const POST = (req: Request) =>
  jsonRoute(async () => {
    // 1) Parse body — tolerate empty / malformed
    const text = await req.text();
    let body: { items?: Line[] } = {};
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        return jsonError("Invalid JSON body", 400, "BAD_BODY");
      }
    }
    const items = body.items ?? [];
    if (!items.length) return jsonError("Cart is empty", 400, "EMPTY_CART");

    // 2) Env check up front — clearer than a Stripe SDK error
    const siteUrl = requireEnv("NEXT_PUBLIC_SITE_URL");
    const _publishable = requireEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");

    // 3) Auth (anonymous checkout allowed)
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 4) Compute totals on the server (never trust the client)
    const subtotal = items.reduce((a, i) => a + Number(i.price) * Number(i.quantity), 0);
    const shipping = subtotal >= 500 ? 0 : 14;
    const tax = +(subtotal * 0.07).toFixed(2);
    const total = +(subtotal + shipping + tax).toFixed(2);

    // 5) Create a pending order row (RLS scoped to the signed-in user)
    let orderId: string | null = null;
    if (user) {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          subtotal,
          shipping,
          tax,
          total,
          status: "pending",
          payment_method: "card",
          shipping_address: {},
        })
        .select("id")
        .single();

      if (error) {
        // Common: migration not run yet, or RLS misconfigured.
        if (error.code === "42P01" || /relation .* does not exist/.test(error.message)) {
          return jsonError(
            "Database missing `orders` table — run supabase/migrations/002_orders.sql in the Supabase SQL Editor.",
            500,
            "DB_MISSING_TABLE",
          );
        }
        return jsonError(error.message, 400, error.code);
      }
      orderId = order.id;

      const { error: itemsError } = await supabase.from("order_items").insert(
        items.map((i) => ({
          order_id: order.id,
          product_id: i.id,
          quantity: i.quantity,
          price: i.price,
        })),
      );
      if (itemsError) return jsonError(itemsError.message, 400, itemsError.code);
    }

    // 6) Stripe Checkout session
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      customer_email: user?.email ?? undefined,
      line_items: items.map((i) => ({
        quantity: i.quantity,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(Number(i.price) * 100),
          product_data: { name: i.name, images: i.image ? [i.image] : undefined },
        },
      })),
      success_url: `${siteUrl}/order/success?id=${orderId ?? ""}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cart`,
      metadata: orderId ? { order_id: orderId, user_id: user?.id ?? "" } : undefined,
      automatic_tax: { enabled: false },
    });

    if (orderId) {
      await supabase
        .from("orders")
        .update({ stripe_session_id: session.id })
        .eq("id", orderId);
    }

    return { url: session.url };
  });

// Keep `headers` import-tree alive for some hosts that prune unused imports
export const dynamic = "force-dynamic";
void headers;
