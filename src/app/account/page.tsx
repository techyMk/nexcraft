import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountView, type AccountViewProps } from "./account-view";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/account");

  const [{ data: profile }, ordersResp, totalsResp] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, avatar_url, role, created_at")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("orders")
      .select(
        "id, order_number, status, total, created_at, order_items(quantity, product:products(name, images))",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("orders")
      .select("total, status", { count: "exact" })
      .eq("user_id", user.id),
  ]);

  const orders = ordersResp.data ?? [];
  const allOrders = totalsResp.data ?? [];
  const ordersCount = totalsResp.count ?? 0;

  const spent = allOrders
    .filter((o) => !["cancelled", "refunded"].includes(o.status))
    .reduce((acc, o) => acc + Number(o.total ?? 0), 0);

  const tier =
    ordersCount >= 20 ? "Platinum" : ordersCount >= 5 ? "Gold" : "Silver";

  const viewProps: AccountViewProps = {
    email: user.email ?? "",
    fullName: profile?.full_name ?? user.email?.split("@")[0] ?? "there",
    avatarUrl:
      profile?.avatar_url ??
      (user.user_metadata?.avatar_url as string | undefined) ??
      null,
    memberSinceYear: new Date(
      profile?.created_at ?? user.created_at,
    ).getFullYear(),
    role: profile?.role ?? "member",
    ordersCount,
    spent,
    tier,
    orders: orders.map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      status: o.status,
      total: Number(o.total),
      createdAt: o.created_at,
      firstItem: pickFirstItem(o.order_items),
    })),
  };

  return <AccountView {...viewProps} />;
}

type RawItem = {
  quantity: number;
  product: { name: string; images: string[] } | { name: string; images: string[] }[] | null;
};

function pickFirstItem(items: RawItem[] | null) {
  if (!items?.length) return null;
  const first = items[0];
  const product = Array.isArray(first.product) ? first.product[0] : first.product;
  if (!product) return null;
  return {
    name: product.name,
    image: product.images?.[0] ?? null,
    quantity: first.quantity,
  };
}
