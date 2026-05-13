# NexCart — Where Supabase queries live

Read [SETUP.md](SETUP.md) first to provision the project + run the
migrations. This doc is a file-by-file map of where each query goes once
the database is live.

## What's already wired

These files ship in the repo and just work once `.env.local` has the
Supabase keys:

| File | Purpose |
|---|---|
| [`src/lib/env.ts`](../src/lib/env.ts) | `requireEnv` / `optionalEnv` / `isSupabaseConfigured` / `isStripeConfigured` |
| [`src/lib/api.ts`](../src/lib/api.ts) | `jsonOk` / `jsonError` / `jsonRoute` — always-JSON responses |
| [`src/lib/supabase/client.ts`](../src/lib/supabase/client.ts) | Browser client (cookies-aware, RLS scoped) |
| [`src/lib/supabase/server.ts`](../src/lib/supabase/server.ts) | RSC + route-handler client |
| [`src/lib/supabase/admin.ts`](../src/lib/supabase/admin.ts) | `service_role` — server-only, bypasses RLS |
| [`src/lib/stripe.ts`](../src/lib/stripe.ts) | Lazy server-side Stripe client |
| [`src/middleware.ts`](../src/middleware.ts) | Session refresh + gates `/account`, `/checkout`, `/wishlist`, `/admin` |
| [`src/app/auth/callback/route.ts`](../src/app/auth/callback/route.ts) | Supabase OAuth → session cookie |
| [`src/app/api/checkout/route.ts`](../src/app/api/checkout/route.ts) | Creates `orders` row + Stripe Checkout session |
| [`src/app/api/webhooks/stripe/route.ts`](../src/app/api/webhooks/stripe/route.ts) | Verifies signature, flips order status |
| [`src/app/api/wishlist/route.ts`](../src/app/api/wishlist/route.ts) | POST/DELETE wishlist sync |
| [`scripts/seed.ts`](../scripts/seed.ts) | `npm run seed` — loads `src/lib/data.ts` into Supabase |

## What you still need to wire up

The frontend currently reads mock data. Convert each surface below to use
Supabase. Do them in this order — each step ships independently.

---

## 1. Catalog reads — replace mock data with `supabase.from('products')`

### 1.1 Home — [`src/app/page.tsx`](../src/app/page.tsx)

Make the page an `async` server component and pass data into the section
components as props.

```tsx
// src/app/page.tsx
import { createClient } from "@/lib/supabase/server";
import { Hero } from "@/components/home/hero";
import { CategoriesSection } from "@/components/home/categories-section";
import { FeaturedProducts } from "@/components/home/featured-products";
import { NewArrivals } from "@/components/home/new-arrivals";
import { DealOfDay } from "@/components/home/deal-of-day";

export const revalidate = 60; // ISR

export default async function HomePage() {
  const supabase = createClient();
  const [{ data: categories }, { data: featured }, { data: latest }, { data: deal }] =
    await Promise.all([
      supabase.from("categories").select("*").order("name"),
      supabase.from("products").select("*").eq("featured", true).limit(8),
      supabase.from("products").select("*").order("created_at", { ascending: false }).limit(4),
      supabase.from("products").select("*").not("old_price", "is", null)
        .order("old_price", { ascending: false }).limit(1).maybeSingle(),
    ]);

  return (
    <>
      <Hero />
      <CategoriesSection categories={categories ?? []} />
      <FeaturedProducts products={featured ?? []} />
      <DealOfDay deal={deal} />
      <NewArrivals products={latest ?? []} />
    </>
  );
}
```

Then in [`featured-products.tsx`](../src/components/home/featured-products.tsx),
[`categories-section.tsx`](../src/components/home/categories-section.tsx),
[`new-arrivals.tsx`](../src/components/home/new-arrivals.tsx),
[`deal-of-day.tsx`](../src/components/home/deal-of-day.tsx): remove the
`import { products } from "@/lib/data"`, accept the array as a prop, and
delete the prop-less usage.

### 1.2 Shop — [`src/app/shop/page.tsx`](../src/app/shop/page.tsx)

Split into a server wrapper + client filter island.

```
src/app/shop/
  page.tsx         ← new server component (this file is replaced)
  shop-client.tsx  ← move the existing JSX here, keep "use client"
```

```tsx
// src/app/shop/page.tsx
import { createClient } from "@/lib/supabase/server";
import ShopClient from "./shop-client";

export const revalidate = 60;

export default async function ShopPage() {
  const supabase = createClient();
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*, category:categories(name,slug)"),
    supabase.from("categories").select("*").order("name"),
  ]);
  return <ShopClient initialProducts={products ?? []} categories={categories ?? []} />;
}
```

### 1.3 Product detail — [`src/app/product/[slug]/page.tsx`](../src/app/product/[slug]/page.tsx)

```tsx
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductDetail } from "./product-detail";

export const revalidate = 60;

export default async function Page({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("slug", params.slug)
    .single();
  if (!product) notFound();

  const { data: related } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .limit(4);

  return <ProductDetail product={product} related={related ?? []} />;
}
```

### 1.4 Search — `src/app/api/search/route.ts` *(new file)*

```ts
import { jsonRoute } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

export const GET = (req: Request) =>
  jsonRoute(async () => {
    const q = (new URL(req.url).searchParams.get("q") ?? "").trim();
    if (!q) return { results: [] };
    const supabase = createClient();
    const tsQuery = q.split(/\s+/).filter(Boolean).map((t) => `${t}:*`).join(" & ");
    const { data, error } = await supabase
      .from("products")
      .select("slug, name, brand, price, images, category:categories(name)")
      .textSearch("search_tsv", tsQuery)
      .limit(8);
    if (error) throw error;
    return { results: data };
  });
```

Then debounce input in
[`src/components/command-palette.tsx`](../src/components/command-palette.tsx)
and fetch `/api/search?q=...` instead of filtering the in-memory array.

---

## 2. Auth — wire the existing login/register forms

### 2.1 Login — [`src/app/login/page.tsx`](../src/app/login/page.tsx)

Convert the form to a controlled submit:

```tsx
"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const router = useRouter();
const supabase = createClient();

async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const f = new FormData(e.currentTarget);
  const { error } = await supabase.auth.signInWithPassword({
    email: String(f.get("email")),
    password: String(f.get("password")),
  });
  if (error) { alert(error.message); return; }
  router.refresh();
  router.push("/account");
}

const onGoogle = () =>
  supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${location.origin}/auth/callback?next=/account` },
  });
```

Bind to `<form onSubmit={onSubmit}>` and the Google button's `onClick`.

### 2.2 Register — [`src/app/register/page.tsx`](../src/app/register/page.tsx)

```tsx
const { error } = await supabase.auth.signUp({
  email, password,
  options: {
    data: { full_name: `${firstName} ${lastName}` },
    emailRedirectTo: `${location.origin}/auth/callback?next=/account`,
  },
});
```

The `handle_new_user` trigger in
[`supabase/migrations/001_initial_schema.sql`](../supabase/migrations/001_initial_schema.sql)
auto-creates the `profiles` row using the `full_name` you pass.

### 2.3 Auth-aware navbar — [`src/components/navbar.tsx`](../src/components/navbar.tsx)

Split into a server wrapper + a client island.

```
src/components/
  navbar.tsx          ← server wrapper (replace existing)
  navbar-client.tsx   ← move all existing JSX here, accept user + profile props
```

```tsx
// src/components/navbar.tsx (server)
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { NavbarClient } from "./navbar-client";

export async function Navbar() {
  if (!isSupabaseConfigured()) return <NavbarClient user={null} profile={null} />;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles").select("full_name, avatar_url, role")
      .eq("id", user.id).single();
    profile = data;
  }
  return <NavbarClient user={user} profile={profile} />;
}
```

Show an avatar dropdown when `user` exists, otherwise the existing
`/login` link. Sign-out:

```tsx
const onSignOut = async () => {
  await createClient().auth.signOut();
  location.href = "/";
};
```

### 2.4 Account page — [`src/app/account/page.tsx`](../src/app/account/page.tsx)

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("orders")
      .select("id, order_number, status, total, created_at, order_items(quantity, product:products(name, images))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return <AccountView user={user} profile={profile} orders={orders ?? []} />;
}
```

(Move the existing JSX into an `AccountView` client component that takes
those props.)

---

## 3. Wishlist sync

| File | Change |
|---|---|
| [`src/store/wishlist.ts`](../src/store/wishlist.ts) | Keep — still the source of truth for guests |
| [`src/components/product-card.tsx`](../src/components/product-card.tsx) | After `toggleWishlist(...)`, fire-and-forget POST/DELETE to `/api/wishlist` |
| **`src/hooks/use-wishlist-sync.ts`** *(new)* | On `auth.onAuthStateChange`, push local items up + pull server items down |

```tsx
// in ProductCard's heart handler, after the optimistic local toggle:
const method = wishlisted ? "DELETE" : "POST";
fetch("/api/wishlist", {
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ productId: product.id }),
}).catch(() => {/* offline / signed out — local state is enough */});
```

---

## 4. Cart & checkout

`/api/checkout` and `/api/webhooks/stripe` already ship — wire the
existing button.

In [`src/app/checkout/page.tsx`](../src/app/checkout/page.tsx) the final
step currently links to `/order/success`. Replace with:

```tsx
const onPlaceOrder = async () => {
  const r = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: lines }),
  });
  const text = await r.text();
  const data = text ? JSON.parse(text) : {};
  if (!r.ok) { alert(data.error ?? `Checkout failed (${r.status})`); return; }
  window.location.href = data.url;
};
```

Update [`src/app/order/success/page.tsx`](../src/app/order/success/page.tsx)
to read the order:

```tsx
export default async function Page({
  searchParams,
}: { searchParams: { id?: string } }) {
  const supabase = createClient();
  const order = searchParams.id
    ? (await supabase
        .from("orders")
        .select("order_number, total, status")
        .eq("id", searchParams.id)
        .single()).data
    : null;
  // …render order.order_number / order.total / order.status
}
```

---

## 5. Admin

Convert each `/admin/*` page from a client component reading mock data to
an `async` server component reading Supabase. Middleware already gates the
route at the role level.

| File | Query |
|---|---|
| [`src/app/admin/page.tsx`](../src/app/admin/page.tsx) | `count(*)`, `sum(total)`, recent orders, top products |
| [`src/app/admin/products/page.tsx`](../src/app/admin/products/page.tsx) | `.from("products").select("*, category:categories(name)", { count: "exact" }).range(...)` |
| [`src/app/admin/categories/page.tsx`](../src/app/admin/categories/page.tsx) | `.from("categories").select("*, products:products(count)")` |
| [`src/app/admin/orders/page.tsx`](../src/app/admin/orders/page.tsx) | `.from("orders").select("..., user:profiles(full_name)")` |
| [`src/app/admin/customers/page.tsx`](../src/app/admin/customers/page.tsx) | `.from("profiles").select("..., orders:orders(count, sum(total))")` |
| [`src/app/admin/analytics/page.tsx`](../src/app/admin/analytics/page.tsx) | `.from("revenue_by_day").select("day, revenue, orders").limit(14)` |
| [`src/app/admin/payouts/page.tsx`](../src/app/admin/payouts/page.tsx) | Use Stripe `payouts.list()` from `src/lib/stripe.ts` — not Supabase |

Admin **writes** belong in server actions (`"use server"`) — RLS + role
check happens server-side:

```ts
// src/app/admin/products/actions.ts
"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateStock(id: string, stock: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { error } = await supabase.from("products").update({ stock }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
}
```

---

## 6. AI assistant FAB

Add `src/app/api/ai/route.ts` to stream Claude / OpenAI responses (model
name + system prompt of your choice). Then in
[`src/components/ai-assistant-fab.tsx`](../src/components/ai-assistant-fab.tsx)
POST chat turns to `/api/ai` and append the streamed tokens to the latest
assistant message.

For grounded recommendations, expose `/api/search` as a tool the model
can call.

---

## Common gotchas

- **`select` returns `[]`** — RLS is on but no policy matched. Test via
  the SQL Editor (which runs as service_role) to confirm rows exist, then
  audit the policy in `supabase/policies.sql`.
- **Cookies don't persist after sign-in** — call `router.refresh()` after
  `signInWithPassword`. Server components re-render from the cached cookies
  otherwise.
- **`Webhook signature verification failed`** — `STRIPE_WEBHOOK_SECRET`
  doesn't match the endpoint that fired the event (CLI uses one secret,
  the dashboard endpoint uses another).
- **Service role leaks to client** — `src/lib/supabase/admin.ts` has
  `import "server-only"` which turns any client import into a build error.
- **Storefront still shows mock data** — you haven't replaced the mock
  reads yet (see §1).
