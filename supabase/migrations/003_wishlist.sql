-- ════════════════════════════════════════════════════════════
--  NexCart · 003 · wishlist
--  Per-user saved products. Idempotent.
-- ════════════════════════════════════════════════════════════

create table if not exists public.wishlist_items (
  user_id    uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  added_at   timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index if not exists wishlist_user_idx on public.wishlist_items(user_id);
