# NexCart — Setup (Supabase + Stripe)

Do these steps in order. After each, verify what's noted before moving on.
If anything fails, the app's error toast will tell you exactly what's missing
(`STRIPE_SECRET_KEY is not set...`, `Database missing 'orders' table...`,
etc.) — paste that message back and we'll fix the next thing.

## 0. Prerequisites

- Node ≥ 18, npm ≥ 9
- A Supabase account ([supabase.com](https://supabase.com))
- A Stripe account ([stripe.com](https://stripe.com))
- This repo cloned at `c:\Users\shoba\OneDrive\Documents\nexcart`

```bash
npm install
```

---

## 1. Create the Supabase project

1. https://supabase.com/dashboard → **New project**
2. Region: pick the one closest to your Vercel region (e.g. both
   `us-east-1`)
3. Set a strong database password (you won't need it day to day)
4. Wait ~90s for the project to provision
5. Open **Settings → API** and copy three values:

   | Field in the dashboard | Save it as |
   |---|---|
   | Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
   | `anon` `public` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
   | `service_role` `secret` key | `SUPABASE_SERVICE_ROLE_KEY` |

> ⚠️ `service_role` bypasses RLS. Never put it in any file that ends up in
> the browser bundle. We already gate it behind `import "server-only"` in
> [`src/lib/supabase/admin.ts`](../src/lib/supabase/admin.ts).

---

## 2. Run the migrations

For each file below: open it in VS Code, copy **all of it**, paste into
Supabase → **SQL Editor → + New query**, click **Run**, then verify.

You should see **"Success. No rows returned."** after every step.

### 2.1 `supabase/migrations/001_initial_schema.sql`
Creates `categories`, `products`, `profiles`, and the trigger that mirrors
every new auth user into `profiles`.

**Verify:** Database → Tables → you now see `categories`, `products`, `profiles`.

### 2.2 `supabase/migrations/002_orders.sql`
Creates the `order_status` enum, `orders`, `order_items`, and the
`revenue_by_day` view.

**Verify:** Database → Tables → `orders` and `order_items` exist.
Database → Views → `revenue_by_day` exists.

### 2.3 `supabase/migrations/003_wishlist.sql`
Creates `wishlist_items`.

**Verify:** Database → Tables → `wishlist_items` exists.

### 2.4 `supabase/migrations/004_search.sql`
Adds the FTS column + GIN index used by `/api/search` and ⌘K.

**Verify:** Database → Tables → `products` → Columns → `search_tsv` exists.

### 2.5 `supabase/policies.sql`
Enables RLS on every table and creates the policies (drop + create — safe
to re-run).

**Verify:** Authentication → Policies — every table shows
**RLS enabled** and the policies listed.

### 2.6 `supabase/seed.sql`
Seeds the 8 starter categories. Idempotent.

**Verify:** Table editor → `categories` → 8 rows.

### 2.7 Seed the product catalog

```bash
# In .env.local first (see §4), then:
npm run seed
```

You should see:
```
→ Seeding categories…
→ Seeding products…
✓ Done — 8 categories, 12 products.
```

**Verify:** Table editor → `products` → 12 rows.

> Need to start over? Paste `supabase/teardown.sql` in the SQL Editor, then
> re-run §2.1–2.7. **Dev only — never run teardown in production.**

---

## 3. Configure Supabase Auth

1. **Authentication → URL Configuration**
   - **Site URL:** `http://localhost:3000`
   - **Redirect URLs:** add
     - `http://localhost:3000/auth/callback`
     - `https://YOUR-PROD-DOMAIN/auth/callback`

2. **Authentication → Providers → Google** *(optional but recommended)*
   - Toggle on
   - Paste your Google OAuth client ID + secret from
     [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)
   - Add this exact callback in Google Cloud:
     `https://YOUR-PROJECT.supabase.co/auth/v1/callback`

3. **Authentication → Providers → Email**
   - Enable Email + Password (default)
   - For prod, set up SMTP via Resend (Authentication → Emails)

---

## 4. Create `.env.local`

```bash
cp .env.example .env.local
```

Fill in **at minimum** these three so the storefront can talk to Supabase:

```env
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="ey..."
SUPABASE_SERVICE_ROLE_KEY="ey..."
```

Smoke-test:

```bash
npm run dev
```

Open http://localhost:3000 — the storefront should render exactly as
before. The middleware will now begin gating `/account`, `/checkout`,
`/wishlist`, and `/admin` (redirecting unauthenticated users to `/login`).

> The storefront still renders the mock catalog from `src/lib/data.ts`
> until you swap the page-level reads to Supabase
> (see [INTEGRATION.md](INTEGRATION.md) §3 — Catalog reads).

---

## 5. Promote yourself to admin

1. Visit `/register` and sign up with your real email
2. Confirm via the magic link in your inbox
3. Open Supabase → **SQL Editor → + New query** and paste:

```sql
update public.profiles
   set role = 'super_admin'
 where id = (select id from auth.users where email = 'YOU@YOURDOMAIN.com');
```

4. Sign out and back in — `/admin` is now accessible.

---

## 6. Stripe — Checkout

### 6.1 Local

1. **Stripe Dashboard → Developers → API keys** — copy:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`

2. Install the CLI: https://stripe.com/docs/stripe-cli (Homebrew, Scoop,
   or installer). Then:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

3. Copy the `whsec_...` the CLI prints into `STRIPE_WEBHOOK_SECRET` in
   `.env.local`. **Restart `npm run dev`** so the new env is picked up.

4. Test a purchase:
   - Sign in, add a product, hit checkout
   - Card: `4242 4242 4242 4242` · any future expiry · any CVC
   - You should bounce back to `/order/success?id=...`
   - Verify in Supabase → `orders` → status flipped from `pending` → `processing`

### 6.2 Production

1. Stripe Dashboard → **Developers → Webhooks → + Add endpoint**
   - URL: `https://YOUR-PROD-DOMAIN/api/webhooks/stripe`
   - Events: `checkout.session.completed`,
     `checkout.session.expired`,
     `checkout.session.async_payment_failed`,
     `charge.refunded`
   - Copy the new `whsec_...` (this is a different secret from the CLI one)

2. Put it in Vercel as `STRIPE_WEBHOOK_SECRET` for **Production**.

---

## 7. Deploy to Vercel

1. Push to GitHub
2. [vercel.com/new](https://vercel.com/new) → import
3. Add **every variable** from `.env.example`:
   - **Production**, **Preview**, and **Development** scopes for the
     `NEXT_PUBLIC_*` keys
   - **Production** only for the secrets (anon key is the exception — it's
     `NEXT_PUBLIC`)
   - Use your production domain for `NEXT_PUBLIC_SITE_URL`
4. Redeploy (env var changes do **not** auto-trigger a build)
5. In Supabase **Auth → URL Configuration** add your production callback
   `https://YOUR-PROD-DOMAIN/auth/callback`
6. In Stripe **Developers → Webhooks** add your production endpoint
   (see §6.2)

---

## 8. Optional: Resend for transactional email

1. https://resend.com → create API key → `RESEND_API_KEY` in Vercel
2. Verify your sending domain
3. `RESEND_FROM="NexCart <orders@yourdomain.com>"`
4. Trigger from the Stripe webhook on `checkout.session.completed`
   (see [INTEGRATION.md](INTEGRATION.md) §6 — Cart & checkout)

## 9. Optional: AI assistant

1. https://console.anthropic.com → API keys → `ANTHROPIC_API_KEY` *(or
   `OPENAI_API_KEY`)*
2. The endpoint already exists in [INTEGRATION.md](INTEGRATION.md) §10 —
   wire it into `src/components/ai-assistant-fab.tsx`

---

## Troubleshooting

The API routes always return JSON, even on errors. If the UI shows a toast
like one of these, do the listed fix:

| Toast message | Fix |
|---|---|
| `STRIPE_SECRET_KEY is not set on the server.` | Add the env var in Vercel → Settings → Environment Variables, then redeploy |
| `STRIPE_WEBHOOK_SECRET is not set on the server.` | Same — but use the `whsec_` from Stripe Dashboard, not the CLI |
| `Database missing 'orders' table — run supabase/migrations/002_orders.sql` | Run that migration in Supabase SQL Editor |
| `Invalid JSON body` | Check the request body — usually a missing `Content-Type: application/json` header |
| `Sign in to save items` | The wishlist sync route requires an authenticated user |
| `permission denied for table products` | RLS policy missing — re-run `supabase/policies.sql` |
| OAuth redirects to `localhost` in prod | Update **Site URL** in Supabase Auth → URL Configuration |
| Webhook returns `Webhook signature verification failed` | `STRIPE_WEBHOOK_SECRET` doesn't match the endpoint that fired the event |
