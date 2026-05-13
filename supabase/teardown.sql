-- ════════════════════════════════════════════════════════════
--  NexCart · TEARDOWN — drops the entire public schema we own.
--  ⚠️  DESTRUCTIVE. Dev / staging only. Never run in production.
-- ════════════════════════════════════════════════════════════

-- Triggers first (otherwise they block table drops on auth.users)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.tg_set_updated_at();

-- Views
drop view if exists public.revenue_by_day;

-- Tables (cascade pulls dependent objects + RLS policies)
drop table if exists public.order_items     cascade;
drop table if exists public.orders          cascade;
drop table if exists public.wishlist_items  cascade;
drop table if exists public.profiles        cascade;
drop table if exists public.products        cascade;
drop table if exists public.categories      cascade;

-- Enum
drop type if exists public.order_status;
