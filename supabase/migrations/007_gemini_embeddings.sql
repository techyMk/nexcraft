-- ════════════════════════════════════════════════════════════
--  NexCart · 007 · switch embedding provider to Google Gemini
--
--  Migration 006 created `kb_chunks.embedding` as vector(1536) sized for
--  OpenAI text-embedding-3-small. Google's free text-embedding-004 is
--  768-dim — so we drop and recreate the column + index + RPC.
--
--  Safe to run when kb_chunks is empty (or you don't mind re-indexing
--  the documents you've already uploaded). Idempotent.
-- ════════════════════════════════════════════════════════════

-- 1) Drop the dependent function so we can re-declare it with the new arg type.
drop function if exists public.match_kb_chunks(vector(1536), float, int);
drop function if exists public.match_kb_chunks(vector(768),  float, int);

-- 2) Drop the HNSW index (depends on the column).
drop index if exists kb_chunks_embedding_idx;

-- 3) Recreate the embedding column at the new dimension.
alter table public.kb_chunks
  drop column if exists embedding;

alter table public.kb_chunks
  add column embedding vector(768);

-- 4) Recreate the HNSW index.
create index if not exists kb_chunks_embedding_idx
  on public.kb_chunks using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- 5) Recreate the RPC at the new signature.
create or replace function public.match_kb_chunks(
  query_embedding vector(768),
  match_threshold float default 0.5,
  match_count     int   default 5
)
returns table (
  id              uuid,
  document_id     uuid,
  content         text,
  similarity      float,
  document_title  text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id,
    c.document_id,
    c.content,
    1 - (c.embedding <=> query_embedding) as similarity,
    d.title as document_title
  from public.kb_chunks c
  join public.kb_documents d on d.id = c.document_id
  where d.status = 'ready'
    and c.embedding is not null
    and 1 - (c.embedding <=> query_embedding) > match_threshold
  order by c.embedding <=> query_embedding asc
  limit match_count;
$$;

grant execute on function public.match_kb_chunks(vector(768), float, int)
  to anon, authenticated, service_role;

-- 6) Reset any half-uploaded docs so the admin can re-upload cleanly.
update public.kb_documents
   set status = 'failed',
       error = coalesce(error, 'Reset by 007 — re-upload to re-embed with Gemini'),
       chunk_count = 0
 where status in ('pending','indexing','ready')
   and id in (select document_id from public.kb_chunks);
