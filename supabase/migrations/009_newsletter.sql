-- ════════════════════════════════════════════════════════════
--  NexCart · 009 · newsletter subscribers
--
--  Stores email opt-ins from the footer + homepage subscribe forms.
--  Public can INSERT only (subscribe). Reads/updates/deletes are
--  service-role only — managed from the API route. Idempotent.
-- ════════════════════════════════════════════════════════════

create table if not exists public.newsletter_subscribers (
  id           uuid primary key default gen_random_uuid(),
  email        text not null unique,
  source       text,             -- 'footer' | 'home_section' | etc.
  confirmed_at timestamptz,      -- set when the welcome email is sent
  unsubscribed_at timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists newsletter_subscribers_email_lower_idx
  on public.newsletter_subscribers (lower(email));

alter table public.newsletter_subscribers enable row level security;

-- Anyone can subscribe (insert only). We don't expose select/update/delete
-- to anon; admin tooling uses the service role key from the API.
drop policy if exists "newsletter_subscribers_insert_anon"
  on public.newsletter_subscribers;
create policy "newsletter_subscribers_insert_anon"
  on public.newsletter_subscribers
  for insert
  to anon, authenticated
  with check (true);
