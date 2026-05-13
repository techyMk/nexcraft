# supabase/

SQL artefacts for the NexCart Supabase project. Every file is idempotent —
safe to re-run.

```
supabase/
├── migrations/
│   ├── 001_initial_schema.sql   ← categories, products, profiles, trigger
│   ├── 002_orders.sql            ← order_status enum, orders, order_items, revenue view
│   ├── 003_wishlist.sql          ← wishlist_items
│   └── 004_search.sql            ← FTS column + GIN index
├── policies.sql                  ← all RLS policies (drop + create)
├── seed.sql                      ← seed categories
└── teardown.sql                  ← ⚠️ destructive — dev only
```

## Run order (Supabase dashboard → SQL Editor → New query)

1. `migrations/001_initial_schema.sql`
2. `migrations/002_orders.sql`
3. `migrations/003_wishlist.sql`
4. `migrations/004_search.sql`
5. `policies.sql`
6. `seed.sql` *(categories)*
7. `npm run seed` *(products — uses `SUPABASE_SERVICE_ROLE_KEY`)*

After every step, the dashboard should print **"Success. No rows returned."**
Verify each migration in **Database → Tables** before moving on.

## Promote yourself to admin

After signing up once on the running app, run this in SQL Editor:

```sql
update public.profiles set role = 'super_admin' where id = (
  select id from auth.users where email = 'YOU@YOURDOMAIN.com'
);
```

`/admin/*` routes will now let you in.

## Wipe everything (dev only)

```sql
-- Paste teardown.sql, then re-run the migrations + policies + seed.
```
