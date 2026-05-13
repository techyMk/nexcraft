# Admin access guide

NexCart has no separate admin login page on purpose. Anyone with the right
**role** on their `profiles` row can reach `/admin/*` — everyone else is
silently redirected away by [`src/middleware.ts`](../src/middleware.ts).

---

## Roles

Stored in `public.profiles.role`. Three values, enforced by a CHECK
constraint:

| Role | What it can do |
|---|---|
| `member` *(default)* | Shop, place orders, save wishlist, edit own profile |
| `admin` | Everything `member` can, plus all of `/admin/*` |
| `super_admin` | Same as `admin`. Reserved for the founding account so you have a clear "owner" record. UI does not differentiate yet — feel free to add a `requireSuperAdmin` check later if you want destructive actions gated tighter. |

The middleware allows both `admin` and `super_admin` to access `/admin/*`.

---

## Promoting a user to admin

The first admin **must** be set via SQL (chicken-and-egg: no admin UI exists
until at least one admin exists).

1. Have the person **sign up** through `/register` (or via Google on `/login`)
2. Verify in **Supabase → Authentication → Users** that their row exists
3. **Supabase → SQL Editor → + New query** → paste → **Run**:

```sql
update public.profiles
   set role = 'super_admin'  -- or 'admin'
 where id = (
   select id from auth.users where email = 'THEIR@EMAIL.com'
 );
```

Expected: **"Success. No rows returned."** *(an UPDATE doesn't return rows
by default — this is normal.)*

4. The newly-promoted user must **sign out and back in** for the role to
   take effect *(the middleware reads it fresh on each request, so a hard
   refresh of `/admin` also works.)*

**Verify:** Table editor → `profiles` → their row shows the new role.

> Use `super_admin` for yourself and any co-founder. Use `admin` for
> everyone else (support reps, ops, etc.). That way you can later restrict
> things like "delete product permanently" to `super_admin` only.

---

## Logging in as admin

Same flow as any other user:

1. Go to `/login`
2. Sign in with Google *or* email/password — whichever you used when
   signing up
3. Once signed in, navigate to `/admin` *(or use the **"Go to admin
   dashboard"** card that appears in the sidebar of `/account` for
   admins only)*

If you're not an admin, the middleware redirects you to `/` with no
warning.

---

## What admins can do today

Each item below is a page under `/admin`. Read-only unless noted.

| Path | What it shows | Mutations? |
|---|---|---|
| `/admin` | KPIs, animated revenue chart, recent orders, top products, AI insights | — |
| `/admin/analytics` | Revenue + orders chart (12 weeks), top region/channel/avg basket | — |
| `/admin/products` | Product table — search, filter, paginate | UI ready, server actions to come |
| `/admin/categories` | Category cards with live product counts | UI ready, server actions to come |
| `/admin/orders` | Orders table with status pills, filter, search, CSV export | Status updates to come |
| `/admin/customers` | All `profiles` with order count + lifetime value | UI ready |
| `/admin/ai` | Live AI insights, intent score chart, top picks | — |
| `/admin/payouts` | Balance trend, payout methods, payout history | Will read from Stripe Payouts API |
| `/admin/settings` | Storefront / Brand / AI / Payments / Shipping / Team toggles | — |

The write actions (create product, update stock, ship order, etc.) are
the next chunk of work — see [INTEGRATION.md §5](INTEGRATION.md) for the
server-action pattern.

---

## Demoting or removing an admin

```sql
-- Demote to plain member
update public.profiles
   set role = 'member'
 where id = (select id from auth.users where email = 'THEIR@EMAIL.com');

-- Or revoke entirely by deleting the auth user (cascades to profile)
delete from auth.users where email = 'THEIR@EMAIL.com';
```

The change takes effect on their next request.

---

## Bootstrap on production

Production is its own Supabase project (or the same one — your call).
Either way, you have to repeat the promotion step on prod:

1. Deploy (see [GO-LIVE.md](GO-LIVE.md) Phase 5)
2. Sign up on the production URL with your real email
3. Run the SQL `update` from the **production** Supabase SQL Editor
4. Sign out and back in on prod
5. `https://your-domain/admin` loads

---

## Security notes

- **Two layers protect `/admin`:** the middleware checks `profiles.role`
  on every request, AND every read in admin pages is RLS-scoped to the
  signed-in user. Both have to break for unauthorised access.
- **RLS policy `profiles_admin_read`** lets admins read every profile
  (needed for `/admin/customers`). It's defined in
  [`supabase/policies.sql`](../supabase/policies.sql).
- The role column has a **CHECK constraint** — `update profiles set role
  = 'whatever'` will fail on anything outside `member/admin/super_admin`.
- `service_role` (used inside webhooks via
  [`src/lib/supabase/admin.ts`](../src/lib/supabase/admin.ts)) bypasses
  RLS entirely. Never import that module from client code — the
  `import "server-only"` directive enforces this.
- If you ever leak an admin's password or session, you can sign them out
  globally from **Supabase → Authentication → Users → ⋯ → Sign out** on
  their row.

---

## Adding admin role management UI later

When you're ready, the cleanest pattern:

1. New server action `src/app/admin/customers/actions.ts`:
   ```ts
   "use server";
   import { revalidatePath } from "next/cache";
   import { createClient } from "@/lib/supabase/server";

   export async function setRole(userId: string, role: "member" | "admin") {
     const supabase = createClient();
     const { data: { user } } = await supabase.auth.getUser();
     if (!user) throw new Error("Unauthorized");
     // Only super_admin can change roles
     const { data: me } = await supabase
       .from("profiles").select("role").eq("id", user.id).single();
     if (me?.role !== "super_admin") throw new Error("Forbidden");
     const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
     if (error) throw new Error(error.message);
     revalidatePath("/admin/customers");
   }
   ```
2. Add a "Promote / Demote" button to each row in
   [`src/app/admin/customers/page.tsx`](../src/app/admin/customers/page.tsx)
   that calls `setRole`.

Until then, SQL Editor is the source of truth.
