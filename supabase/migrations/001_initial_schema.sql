-- ════════════════════════════════════════════════════════════
--  NexCart · 001 · initial schema
--  Categories, products, profiles, and the new-user trigger.
--  Idempotent — safe to re-run.
-- ════════════════════════════════════════════════════════════

-- Extensions
create extension if not exists "pgcrypto";

-- ── Categories
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  icon        text not null default '📦',
  image_url   text,
  created_at  timestamptz not null default now()
);

-- ── Products
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  brand         text,
  description   text,
  price         numeric(10,2) not null,
  old_price     numeric(10,2),
  badge         text check (badge in ('NEW','HOT','SALE','AI PICK')),
  stock         integer not null default 100,
  featured      boolean not null default false,
  rating        numeric(3,2) not null default 0,
  reviews       integer not null default 0,
  features      text[] not null default '{}',
  images        text[] not null default '{}',
  category_id   uuid not null references public.categories(id) on delete restrict,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_featured_idx on public.products(featured);
create index if not exists products_created_idx  on public.products(created_at desc);

-- Auto-touch updated_at
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.tg_set_updated_at();

-- ── Profiles  (mirror of auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  role        text not null default 'member'
                check (role in ('member','admin','super_admin')),
  created_at  timestamptz not null default now()
);

-- Auto-create a profile row on every new auth user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
