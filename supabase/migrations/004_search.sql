-- ════════════════════════════════════════════════════════════
--  NexCart · 004 · product search
--  Full-text search column + GIN index. Idempotent.
--  Used by /api/search and the ⌘K command palette.
-- ════════════════════════════════════════════════════════════

alter table public.products
  add column if not exists search_tsv tsvector
    generated always as (
      setweight(to_tsvector('simple', coalesce(name, '')),        'A') ||
      setweight(to_tsvector('simple', coalesce(brand, '')),       'B') ||
      setweight(to_tsvector('simple', coalesce(description, '')), 'C')
    ) stored;

create index if not exists products_search_idx
  on public.products using gin(search_tsv);
