# Suggested commit sequence

Linear history for everything in the repo. Run each block top-to-bottom.
Every block is self-contained — the build passes after each commit.

```bash
git init
git add .gitignore
git commit -m "chore: initialize repo"
```

---

## 1 · Next.js scaffold

```bash
git add package.json package-lock.json tsconfig.json next.config.mjs \
        postcss.config.mjs tailwind.config.ts next-env.d.ts \
        src/app/layout.tsx src/app/globals.css src/lib/utils.ts
git commit -m "feat: scaffold Next.js 14 + Tailwind + Framer Motion app shell"
```

## 2 · Brand assets and favicon

```bash
git add assets scripts/convert-logos.mjs scripts/build-favicon.mjs \
        public/brand/nexcart-logo.webp public/brand/nexcart-icon.webp \
        src/app/icon.png src/app/apple-icon.png
git commit -m "feat: add brand assets, WebP logo conversion, PNG favicon"
```

## 3 · Shared layout (navbar, footer, drawer, AI FAB, animated bg)

```bash
git add src/components/navbar.tsx src/components/footer.tsx \
        src/components/cart-drawer.tsx src/components/ai-assistant-fab.tsx \
        src/components/animated-bg.tsx src/components/product-card.tsx \
        src/lib/data.ts src/store/cart.ts
git commit -m "feat(shell): navbar, footer, cart drawer, AI FAB, animated bg"
```

## 4 · Homepage

```bash
git add src/app/page.tsx src/components/home/
git commit -m "feat(home): hero, features, categories, products, AI section, deal, testimonials, newsletter"
```

## 5 · Storefront pages

```bash
git add src/app/shop/page.tsx src/app/product/[slug]/page.tsx \
        src/app/product/[slug]/product-detail.tsx \
        src/app/cart/page.tsx src/app/checkout/page.tsx \
        src/app/order/success/page.tsx
git commit -m "feat(storefront): shop, product detail, cart, 4-step checkout, order success"
```

## 6 · Auth pages and account

```bash
git add src/app/login/page.tsx src/app/register/page.tsx \
        src/app/account/page.tsx src/app/about/page.tsx
git commit -m "feat(auth): login, register, account, about pages"
```

## 7 · Admin dashboard

```bash
git add src/app/admin/ src/components/admin/
git commit -m "feat(admin): dashboard, products, orders, customers, analytics, categories, AI, payouts, settings"
```

## 8 · Logo refresh + bigger marks

```bash
git add src/components/navbar.tsx src/components/footer.tsx \
        src/components/admin/sidebar.tsx \
        src/app/login/page.tsx src/app/register/page.tsx
git commit -m "chore(brand): replace gradient-box wordmark with real NexCart logo and grow logo sizes"
```

## 9 · Wishlist, command palette, missing admin pages, cinematic 404

```bash
git add src/store/wishlist.ts src/store/command.ts \
        src/app/wishlist/page.tsx src/components/command-palette.tsx \
        src/app/admin/categories/page.tsx src/app/admin/ai/page.tsx \
        src/app/admin/payouts/page.tsx src/app/not-found.tsx \
        src/components/navbar.tsx src/components/product-card.tsx \
        src/app/layout.tsx
git commit -m "feat: wishlist sync, ⌘K command palette, admin pages, cinematic 404"
```

## 10 · Supabase schema

```bash
git add supabase/
git commit -m "feat(supabase): initial schema, orders, wishlist, search, RLS, seed, teardown"
```

Run order — paste each in **Supabase → SQL Editor → New query**:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_orders.sql`
3. `supabase/migrations/003_wishlist.sql`
4. `supabase/migrations/004_search.sql`
5. `supabase/policies.sql`
6. `supabase/seed.sql`

## 11 · Supabase + Stripe library code

```bash
git add package.json package-lock.json \
        src/lib/env.ts src/lib/api.ts src/lib/stripe.ts \
        src/lib/supabase/client.ts src/lib/supabase/server.ts \
        src/lib/supabase/admin.ts \
        src/middleware.ts \
        scripts/seed.ts \
        .env.example
git commit -m "feat(supabase): clients, env validator, JSON error helpers, Stripe client, middleware, seed script"
```

## 12 · API routes (defensive JSON everywhere)

```bash
git add src/app/auth/callback/route.ts \
        src/app/api/checkout/route.ts \
        src/app/api/webhooks/stripe/route.ts \
        src/app/api/wishlist/route.ts
git commit -m "feat(api): auth callback, Stripe checkout + webhook, wishlist sync — always return JSON"
```

## 13 · Docs

```bash
git add README.md docs/SETUP.md docs/INTEGRATION.md docs/COMMITS.md \
        supabase/README.md
git commit -m "docs: setup, integration map, commit sequence"
```

## 14 · Go-Live playbook

```bash
git add docs/GO-LIVE.md
git commit -m "docs: GO-LIVE.md — 8-phase playbook from git push to live"
```

## 15 · Google OAuth on login + register

```bash
git add src/app/login/page.tsx src/app/register/page.tsx
git commit -m "feat(auth): wire Google sign-in handlers and drop Apple placeholder"
```

## 16 · /api/health diagnostic endpoint

```bash
git add src/app/api/health/route.ts
git commit -m "feat(api): /api/health diagnostic — reports env wiring without leaking values"
```

## 17 · Fix: NEXT_PUBLIC_* not reaching the browser bundle

```bash
git add src/lib/supabase/client.ts src/lib/env.ts
git commit -m "$(cat <<'EOF'
fix(env): read NEXT_PUBLIC_* statically in the browser client

requireEnv(name) uses dynamic process.env[name] access, which webpack
can't inline into the browser bundle (only literal property accesses
get replaced). Server code is unaffected; only src/lib/supabase/client.ts
was hit — symptom was "NEXT_PUBLIC_SUPABASE_URL is not set" even though
the server-side /api/health reported all vars present.

Added a header note to src/lib/env.ts so requireEnv stays server-only.
EOF
)"
```

## 18 · Account page reads from Supabase + working sign-out

```bash
git add src/app/account/page.tsx src/app/account/account-view.tsx \
        next.config.mjs
git commit -m "feat(account): server-render real profile + orders, working sign-out"
```

## 19 · Scroll progress bar replaces native scrollbar

```bash
git add src/components/scroll-progress.tsx src/app/layout.tsx \
        src/app/globals.css
git commit -m "feat(ui): scroll progress bar under navbar; hide native page scrollbar"
```

## 20 · Edit profile modal + server action

```bash
git add src/app/account/actions.ts \
        src/app/account/edit-profile-modal.tsx \
        src/app/account/account-view.tsx
git commit -m "feat(account): edit profile modal with updateProfile server action"
```

---

## After all commits — first run

```bash
cp .env.example .env.local
# fill in Supabase + Stripe values per docs/SETUP.md §1, §6

npm install
npm run dev                 # http://localhost:3000

# in Supabase SQL Editor, paste each file under supabase/migrations,
# then supabase/policies.sql, then supabase/seed.sql.

npm run seed                # loads src/lib/data.ts → products table

# promote yourself to admin (after signing up once):
# UPDATE public.profiles SET role='super_admin'
#  WHERE id = (SELECT id FROM auth.users WHERE email='you@you.com');
```

If anything fails, the API routes now return a structured JSON error and
the UI surfaces a useful message — see the Troubleshooting table in
[SETUP.md](SETUP.md).
