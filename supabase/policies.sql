-- ════════════════════════════════════════════════════════════
--  NexCart · Row Level Security policies
--  Run AFTER all migrations. Idempotent — drops then recreates.
-- ════════════════════════════════════════════════════════════

-- Helper: non-recursive admin check. Bypasses RLS so it can be called
-- from policies on the profiles table without infinite recursion.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('admin','super_admin') from public.profiles where id = auth.uid()),
    false
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

-- Enable RLS on every public table
alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.profiles       enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;

-- ────────────────────────────────────────────────────────────
-- Catalog: anyone can read
-- ────────────────────────────────────────────────────────────
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read"
  on public.categories for select using (true);

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
  on public.products for select using (true);

-- ────────────────────────────────────────────────────────────
-- Profiles: each user reads / updates their own row
-- ────────────────────────────────────────────────────────────
drop policy if exists "profiles_owner_read" on public.profiles;
create policy "profiles_owner_read"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "profiles_owner_update" on public.profiles;
create policy "profiles_owner_update"
  on public.profiles for update using (auth.uid() = id);

-- Admins can read every profile (for the customers admin page)
drop policy if exists "profiles_admin_read" on public.profiles;
create policy "profiles_admin_read"
  on public.profiles for select using (public.is_admin());

-- ────────────────────────────────────────────────────────────
-- Wishlist: scoped to the owner
-- ────────────────────────────────────────────────────────────
drop policy if exists "wishlist_owner_all" on public.wishlist_items;
create policy "wishlist_owner_all"
  on public.wishlist_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- Orders: owners read their own; admins read all
-- ────────────────────────────────────────────────────────────
drop policy if exists "orders_owner_read" on public.orders;
create policy "orders_owner_read"
  on public.orders for select using (auth.uid() = user_id);

drop policy if exists "orders_owner_insert" on public.orders;
create policy "orders_owner_insert"
  on public.orders for insert with check (auth.uid() = user_id);

drop policy if exists "orders_admin_read" on public.orders;
create policy "orders_admin_read"
  on public.orders for select using (public.is_admin());

drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update"
  on public.orders for update using (public.is_admin());

-- ────────────────────────────────────────────────────────────
-- Order items: read whatever you can read on the parent order
-- ────────────────────────────────────────────────────────────
drop policy if exists "order_items_owner_read" on public.order_items;
create policy "order_items_owner_read"
  on public.order_items for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists "order_items_owner_insert" on public.order_items;
create policy "order_items_owner_insert"
  on public.order_items for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists "order_items_admin_read" on public.order_items;
create policy "order_items_admin_read"
  on public.order_items for select using (public.is_admin());
