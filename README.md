# NexCart

> The future of intelligent commerce — AI-native, beautifully built.

NexCart is a premium ecommerce starter inspired by Apple, Stripe, Linear,
Vercel and Shopify, built on **Next.js 14**, **TypeScript**, **Tailwind**,
**Framer Motion**, **Zustand** and **Lucide**.

The frontend is complete, animated, responsive and production-ready. The
production backend is **Supabase** (Postgres + Auth + Storage) — one project
covers database, authentication and file storage with row-level security
baked in. Stripe handles payments; Resend handles email; Anthropic/OpenAI
powers the AI assistant. Every integration is documented in
[docs/SETUP.md](docs/SETUP.md) and is fully optional — the storefront runs
without any of them.

## Quick start

```bash
npm install
cp .env.example .env.local       # fill in only what you need
npm run dev                      # → http://localhost:3000
npm run build                    # production bundle
```

No secrets are required to run the app — mock data lives in
[`src/lib/data.ts`](src/lib/data.ts) and cart + wishlist persist locally.

## What's inside

| Surface | Highlights |
|---|---|
| **Storefront** | Cinematic hero, brand strip, animated category grid, featured products, AI Intelligence section, deal-of-the-day with countdown, new arrivals, testimonials, newsletter |
| **Product** | Gallery + thumbnails, color picker, qty stepper, animated tabs, related products, AI-pick badges |
| **Cart & Checkout** | Animated cart drawer, free-shipping progress, 4-step checkout (Address → Shipping → Payment → Review), success page |
| **Account** | Profile, recent orders, tier card, navigation tabs |
| **Auth** | Glass login, split-screen register, social-login UI ready for Auth.js |
| **Admin** | Sidebar + topbar, dashboard KPIs, animated revenue chart, AI insights feed, products table, orders, customers CRM, analytics SVG charts, payouts, categories, settings |
| **Globals** | Sticky glass navbar, ⌘K command palette, animated background, AI assistant FAB, branded 404, wishlist |

## Brand & assets

The brand assets live in [`assets/`](assets/) and are converted into
optimized WebP variants on demand:

```bash
node scripts/convert-logos.mjs     # → public/brand/nexcart-{logo,icon}.webp
node scripts/build-favicon.mjs     # → src/app/{icon,apple-icon}.png
```

## Going to production

Read [docs/SETUP.md](docs/SETUP.md) for step-by-step integration of:

1. **Supabase project + Postgres schema** (one SQL block, idempotent)
2. **Row-level security policies** for catalog, profiles, wishlist, orders
3. **Supabase clients** — browser, server, admin (service role) + middleware
4. **Supabase Auth** — email/password, Google OAuth, callback route, admin gate
5. **Supabase Storage** — public bucket policies + admin uploads
6. **Seeding** — the mock catalog in `src/lib/data.ts` → real rows
7. **Stripe** — Checkout session, webhook, order state in Supabase
8. **Razorpay** — server order + signature verification
9. **Resend + React Email** — order confirmations
10. **Anthropic / OpenAI** — AI assistant streaming + optional `pgvector` semantic search
11. **Vercel + Supabase deploy** — region pinning, redirect URLs, webhook setup
12. **Appendix: Prisma over Supabase** — if you prefer Prisma as the ORM

All env vars are catalogued in [.env.example](.env.example).

For the file-by-file query map (which Supabase call goes in which component,
where to put server actions vs route handlers, the migration order) read
[docs/INTEGRATION.md](docs/INTEGRATION.md).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint + Next.js rules |
| `node scripts/convert-logos.mjs` | PNG → WebP brand assets |
| `node scripts/build-favicon.mjs` | Generate `icon.png` + `apple-icon.png` from `assets/icon.webp` |

## License

Proprietary — internal evaluation only unless otherwise agreed.
