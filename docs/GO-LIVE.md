# NexCart — Go-Live Playbook

Linear walkthrough from `git init` to a working Vercel deploy with Supabase
+ Stripe. Roughly 30–45 minutes end-to-end if you already have accounts.

Each step has a **Verify:** line telling you exactly what to look for
before moving on. If something fails, the app's error toast will tell you
what's missing — see the [Troubleshooting table](SETUP.md#troubleshooting).

---

## Phase 1 · Push to GitHub  (~5 min)

### 1.1 Initialise the repo

In PowerShell, from the project root:

```powershell
cd c:\Users\shoba\OneDrive\Documents\nexcart
git init
git branch -M main
git add .
git commit -m "feat: NexCart storefront, admin, and Supabase + Stripe foundations"
```

**Verify:** `git log --oneline` shows one commit.

> Want a richer history instead of one big commit? Apply each block in
> [`docs/COMMITS.md`](COMMITS.md) in order before continuing. The end state
> is identical.

### 1.2 Create the GitHub repo

**Option A — `gh` CLI (easiest):**

```powershell
gh repo create nexcart --private --source=. --remote=origin --push
```

**Option B — web UI:**

1. https://github.com/new → name `nexcart` → **Private** → **Create**
2. Copy the SSH or HTTPS URL it shows
3. ```powershell
   git remote add origin git@github.com:YOUR-USERNAME/nexcart.git
   git push -u origin main
   ```

**Verify:** the repo loads at `https://github.com/YOUR-USERNAME/nexcart`
and shows the file tree.

---

## Phase 2 · Supabase  (~10 min)

### 2.1 Create the project

1. https://supabase.com/dashboard → **New project**
2. Name `nexcart`, set a strong database password, pick a region close to
   the Vercel region you'll use
3. Wait ~90s

### 2.2 Copy the three API values

**Settings → API** in the dashboard. You'll paste these into `.env.local`
in Phase 3.

| Dashboard label | Save as |
|---|---|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` `public` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` `secret` | `SUPABASE_SERVICE_ROLE_KEY` |

### 2.3 Run the migrations

For each file: open in VS Code → **copy all** → Supabase dashboard →
**SQL Editor → + New query** → paste → **Run**.

Expect **"Success. No rows returned."** after each one.

| Step | File | Verify |
|---|---|---|
| 1 | [`supabase/migrations/001_initial_schema.sql`](../supabase/migrations/001_initial_schema.sql) | Database → Tables → `categories`, `products`, `profiles` exist |
| 2 | [`supabase/migrations/002_orders.sql`](../supabase/migrations/002_orders.sql) | Tables → `orders`, `order_items` exist · Views → `revenue_by_day` exists |
| 3 | [`supabase/migrations/003_wishlist.sql`](../supabase/migrations/003_wishlist.sql) | Tables → `wishlist_items` exists |
| 4 | [`supabase/migrations/004_search.sql`](../supabase/migrations/004_search.sql) | `products` → Columns → `search_tsv` exists |
| 5 | [`supabase/policies.sql`](../supabase/policies.sql) | Authentication → Policies → every table shows RLS on |
| 6 | [`supabase/seed.sql`](../supabase/seed.sql) | `categories` table has 8 rows |

### 2.4 Configure auth URLs

**Authentication → URL Configuration:**

- **Site URL:** `http://localhost:3000`
- **Redirect URLs:** click **+ Add URL** twice and add:
  - `http://localhost:3000/auth/callback`
  - `https://YOUR-PROD-DOMAIN/auth/callback` *(use a placeholder for now —
    you'll update after Vercel gives you a real domain in Phase 5)*

Click **Save**.

> **Google OAuth (optional, recommended):** Authentication → Providers →
> Google → toggle on → paste your Google Cloud OAuth client ID + secret.
> In Google Cloud Console authorise the URL Supabase displays under the
> provider toggle.

---

## Phase 3 · Local dev  (~5 min)

### 3.1 Create `.env.local`

```powershell
copy .env.example .env.local
```

Open `.env.local` in VS Code and fill in:

```env
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
```

Leave the Stripe block empty for now — we'll do that in Phase 4.

### 3.2 Seed the product catalog

```powershell
npm install     # if you haven't yet
npm run seed
```

Expect:

```
→ Seeding categories…
→ Seeding products…
✓ Done — 8 categories, 12 products.
```

**Verify:** Supabase → Table editor → `products` shows 12 rows.

### 3.3 Boot the dev server

```powershell
npm run dev
```

Open http://localhost:3000.

**Verify:**
- Storefront renders the cinematic homepage.
- Click **Account** in the navbar — you should be redirected to
  `/login?next=/account` *(middleware is now active)*.

### 3.4 Sign up as the first user

1. Click **Sign in → Create one**, or go to http://localhost:3000/register
2. Sign up with your real email
3. **Open the confirmation email** → click the magic link → you'll land
   on `/account`

**Verify:** Supabase → Authentication → Users — your email appears.

### 3.5 Promote yourself to admin

Supabase → **SQL Editor → + New query** → paste → **Run**:

```sql
update public.profiles
   set role = 'super_admin'
 where id = (select id from auth.users where email = 'YOU@YOURDOMAIN.com');
```

**Verify:** Table editor → `profiles` → your row shows `role = super_admin`.
Refresh the app — http://localhost:3000/admin loads.

---

## Phase 4 · Stripe (local)  (~5 min)

### 4.1 API keys

Stripe Dashboard → **Developers → API keys**. Add to `.env.local`:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
```

### 4.2 Install the Stripe CLI

```powershell
# Option A — winget
winget install Stripe.StripeCLI

# Option B — Scoop
scoop install stripe

# Option C — direct download
# https://github.com/stripe/stripe-cli/releases (Windows .zip)
```

### 4.3 Forward webhooks to localhost

```powershell
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the `whsec_...` it prints and add to `.env.local`:

```env
STRIPE_WEBHOOK_SECRET="whsec_..."
```

Stop and re-run `npm run dev` so the new env var loads.

### 4.4 Test a purchase

1. http://localhost:3000 → click any product → **Add to cart** → cart drawer → **Checkout securely**
2. Complete the 4 steps (Address → Shipping → Payment → Review) → **Place order**
3. Stripe Checkout loads in a new tab. Use:
   - Card: `4242 4242 4242 4242`
   - Expiry: any future date, e.g. `12/30`
   - CVC: any 3 digits, e.g. `123`
4. Submit → you bounce back to `/order/success?id=...`

**Verify:**
- Supabase → `orders` → new row with `status = processing`
- The terminal running `stripe listen` shows `checkout.session.completed`
  → `200 OK`

> If you see a toast with an error message, do exactly what it says — see
> [SETUP.md → Troubleshooting](SETUP.md#troubleshooting).

---

## Phase 5 · Vercel deploy  (~10 min)

### 5.1 Push the latest local changes

```powershell
git add -A
git commit -m "chore: ready for first deploy"
git push
```

### 5.2 Import the repo

1. https://vercel.com/new → **Import Git Repository** → pick `nexcart`
2. Framework preset: **Next.js** *(auto-detected)*
3. Root directory: **./** *(default)*
4. **Do NOT click Deploy yet** — add env vars first

### 5.3 Add environment variables

Expand **Environment Variables** on the import page. Add each row below.
For every variable, tick **Production**, **Preview**, and **Development**
unless noted.

| Key | Value | Scope |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://nexcart.vercel.app` *(or your custom domain)* | All |
| `NEXT_PUBLIC_SUPABASE_URL` | from Supabase Settings → API | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase Settings → API | All |
| `SUPABASE_SERVICE_ROLE_KEY` | from Supabase Settings → API | All |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` for now (you'll swap to `pk_live_...` later) | All |
| `STRIPE_SECRET_KEY` | `sk_test_...` for now | All |
| `STRIPE_WEBHOOK_SECRET` | leave empty for now — Phase 7 gives you the real value | All |

### 5.4 Deploy

Click **Deploy**. Wait ~2 min. Vercel will print a `https://...vercel.app`
URL when done.

**Verify:**
- The URL loads the storefront.
- Open `/login` — you can sign up using the same flow as local.
- `/admin` returns you to `/` *(no admin role on prod yet — see 6.2)*.

---

## Phase 6 · Production Supabase  (~3 min)

### 6.1 Add the prod redirect URL

Supabase → **Authentication → URL Configuration**:

- **Site URL:** change to `https://YOUR-PROD-DOMAIN`
- **Redirect URLs:** add `https://YOUR-PROD-DOMAIN/auth/callback`
- Keep the localhost entries so dev still works

Click **Save**.

### 6.2 Promote yourself on prod

Sign up *once* on the production site, then in Supabase → **SQL Editor**:

```sql
update public.profiles
   set role = 'super_admin'
 where id = (select id from auth.users where email = 'YOU@YOURDOMAIN.com');
```

**Verify:** sign out and back in on prod → `/admin` loads.

---

## Phase 7 · Production Stripe webhook  (~3 min)

### 7.1 Create the production webhook endpoint

Stripe Dashboard → **Developers → Webhooks → + Add endpoint**:

- **Endpoint URL:** `https://YOUR-PROD-DOMAIN/api/webhooks/stripe`
- **Events to send** → click **Select events** → tick:
  - `checkout.session.completed`
  - `checkout.session.expired`
  - `checkout.session.async_payment_failed`
  - `charge.refunded`
- **Add endpoint**
- Click **Reveal signing secret** → copy the `whsec_...`
  *(this is a different value from the CLI one in Phase 4)*

### 7.2 Put the secret into Vercel

Vercel → your project → **Settings → Environment Variables**:

- Find `STRIPE_WEBHOOK_SECRET` (or add it if you skipped it in 5.3)
- Paste the new `whsec_...`
- Scope: **Production** *(this one only — Preview/Dev can keep the CLI value)*
- **Save**

### 7.3 Redeploy

Env-var changes don't auto-redeploy. Vercel → **Deployments → ⋯ →
Redeploy** on the latest one.

**Verify:**
- Deployments tab → latest deployment shows **Ready**
- Stripe Dashboard → Developers → Webhooks → your endpoint → click it →
  the **Recent events** column will start populating after your next
  test purchase.

---

## Phase 8 · Production smoke test  (~3 min)

1. Open `https://YOUR-PROD-DOMAIN` in an **incognito window**
2. Sign up with a different email than your admin one
3. Confirm via email
4. Add a product → checkout → use `4242 4242 4242 4242` / `12/30` / `123`
5. You bounce back to `/order/success`

**Verify:**
- Supabase → `orders` → new row, `status = processing`
- Stripe Dashboard → Developers → Webhooks → your endpoint → most recent
  event = `checkout.session.completed` → **200 OK**
- Sign in as admin → `/admin/orders` shows the new row

🎉 You're live.

---

## Going from test to live mode (when you're ready to take real payments)

1. Stripe Dashboard → toggle **Viewing test data** off (top right)
2. Re-copy the **live** publishable + secret keys
3. Update `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY`
   in Vercel → **Production** scope only
4. Create a **new webhook endpoint** in live mode for the same URL,
   subscribe to the same events, copy the new `whsec_...` into
   `STRIPE_WEBHOOK_SECRET` (Production scope)
5. Redeploy
6. Buy something tiny with a real card to prove the live path works

---

## Optional add-ons

| What | Where the integration lives |
|---|---|
| Custom domain | Vercel → Project → Settings → Domains. After it's verified, update `NEXT_PUBLIC_SITE_URL` and the Supabase + Stripe redirect URLs. |
| Resend (transactional email) | [SETUP.md §8](SETUP.md) + trigger from `src/app/api/webhooks/stripe/route.ts` on `checkout.session.completed` |
| AI assistant streaming | [INTEGRATION.md §6](INTEGRATION.md) — add `src/app/api/ai/route.ts` and wire `src/components/ai-assistant-fab.tsx` |
| `pgvector` semantic search | [SETUP.md §13](SETUP.md) |
| Replace mock catalog reads with Supabase | [INTEGRATION.md §1](INTEGRATION.md) — convert home/shop/product pages |

---

## What's already configured to be defensive

- API routes always return JSON (`/api/checkout`, `/api/webhooks/stripe`,
  `/api/wishlist`, `/auth/callback`) — toasts surface a useful error
  instead of a cryptic JSON parse error.
- Middleware passes through cleanly when env vars are missing — the
  storefront renders even before Supabase is configured.
- `src/lib/supabase/admin.ts` carries `import "server-only"`, so the
  service-role key cannot leak into the browser bundle.
- Lazy clients (`stripe()`, `supabaseAdmin()`, `createClient()`) only
  validate env when actually called — the build doesn't break if a key
  isn't set yet.
