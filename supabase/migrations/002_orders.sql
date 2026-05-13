-- ════════════════════════════════════════════════════════════
--  NexCart · 002 · orders
--  Order status enum, orders, order_items. Idempotent.
-- ════════════════════════════════════════════════════════════

-- ── Status enum
do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum (
      'pending','processing','shipped','delivered','cancelled','refunded'
    );
  end if;
end $$;

-- ── Orders
create table if not exists public.orders (
  id                   uuid primary key default gen_random_uuid(),
  order_number         text not null unique
                         default ('NX-' || substr(replace(gen_random_uuid()::text,'-',''),1,8)),
  user_id              uuid references auth.users(id) on delete set null,
  status               public.order_status not null default 'pending',
  subtotal             numeric(10,2) not null,
  shipping             numeric(10,2) not null default 0,
  tax                  numeric(10,2) not null default 0,
  total                numeric(10,2) not null,
  shipping_address     jsonb not null default '{}'::jsonb,
  payment_method       text not null default 'card',
  stripe_session_id    text unique,
  stripe_payment_intent text,
  notes                text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists orders_user_idx     on public.orders(user_id);
create index if not exists orders_status_idx   on public.orders(status);
create index if not exists orders_created_idx  on public.orders(created_at desc);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.tg_set_updated_at();

-- ── Order items
create table if not exists public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid not null references public.products(id),
  quantity    integer not null check (quantity > 0),
  price       numeric(10,2) not null,
  created_at  timestamptz not null default now()
);

create index if not exists order_items_order_idx   on public.order_items(order_id);
create index if not exists order_items_product_idx on public.order_items(product_id);

-- ── Daily revenue view (used by the admin analytics page)
create or replace view public.revenue_by_day as
select
  date_trunc('day', created_at)::date as day,
  count(*)                            as orders,
  coalesce(sum(total), 0)             as revenue
from public.orders
where status not in ('cancelled','refunded')
group by 1
order by 1 desc;
