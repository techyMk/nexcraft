import { jsonRoute, jsonError } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

async function parseBody(req: Request) {
  const text = await req.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw Object.assign(new Error("Invalid JSON body"), { status: 400, code: "BAD_BODY" });
  }
}

export const POST = (req: Request) =>
  jsonRoute(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return jsonError("Sign in to save items", 401, "UNAUTH");

    const { productId } = await parseBody(req);
    if (!productId) return jsonError("Missing productId", 400, "BAD_BODY");

    const { error } = await supabase
      .from("wishlist_items")
      .upsert({ user_id: user.id, product_id: productId });
    if (error) return jsonError(error.message, 400, error.code);

    return { ok: true };
  });

export const DELETE = (req: Request) =>
  jsonRoute(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return jsonError("Sign in to manage your wishlist", 401, "UNAUTH");

    const { productId } = await parseBody(req);
    if (!productId) return jsonError("Missing productId", 400, "BAD_BODY");

    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);
    if (error) return jsonError(error.message, 400, error.code);

    return { ok: true };
  });
