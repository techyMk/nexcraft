-- ════════════════════════════════════════════════════════════
--  NexCart · 006 · Knowledge base for the AI assistant (RAG)
--  pgvector + kb_documents + kb_chunks + match function + RLS.
--  Idempotent.
-- ════════════════════════════════════════════════════════════

-- Vector extension
create extension if not exists vector;

-- ── Documents (one row per uploaded file)
create table if not exists public.kb_documents (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  filename     text not null,
  mime_type    text not null,
  file_path    text not null,                -- path inside the 'kb' storage bucket
  size_bytes   bigint not null,
  status       text not null default 'pending'
                 check (status in ('pending','indexing','ready','failed')),
  chunk_count  integer not null default 0,
  error        text,
  uploaded_by  uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists kb_documents_status_idx  on public.kb_documents(status);
create index if not exists kb_documents_created_idx on public.kb_documents(created_at desc);

drop trigger if exists kb_documents_set_updated_at on public.kb_documents;
create trigger kb_documents_set_updated_at
  before update on public.kb_documents
  for each row execute function public.tg_set_updated_at();

-- ── Chunks (one row per ~1k-char passage of a document)
create table if not exists public.kb_chunks (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid not null references public.kb_documents(id) on delete cascade,
  content      text not null,
  embedding    vector(1536),                -- OpenAI text-embedding-3-small dim
  chunk_index  integer not null,
  token_count  integer,
  created_at   timestamptz not null default now()
);

create index if not exists kb_chunks_document_idx on public.kb_chunks(document_id);

-- HNSW index for fast cosine similarity search
create index if not exists kb_chunks_embedding_idx
  on public.kb_chunks using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- ── Similarity search RPC
-- Called by /api/ai/chat with the query embedding; returns top matches.
create or replace function public.match_kb_chunks(
  query_embedding vector(1536),
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

grant execute on function public.match_kb_chunks(vector(1536), float, int)
  to anon, authenticated, service_role;

-- ── RLS — admin-only writes; reads happen via service_role in API routes
alter table public.kb_documents enable row level security;
alter table public.kb_chunks    enable row level security;

drop policy if exists "kb_documents_admin_all" on public.kb_documents;
create policy "kb_documents_admin_all"
  on public.kb_documents for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "kb_chunks_admin_all" on public.kb_chunks;
create policy "kb_chunks_admin_all"
  on public.kb_chunks for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── Storage bucket for the uploaded files
-- (Buckets live in the `storage` schema. This INSERT requires service_role,
--  which the SQL Editor uses automatically.)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'kb',
  'kb',
  false,
  20971520,  -- 20 MB hard cap
  array[
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/octet-stream'
  ]
)
on conflict (id) do update set
  public            = excluded.public,
  file_size_limit   = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage policies — admins manage files; everyone else gets nothing.
-- The chat API reads via service_role which bypasses these anyway.
drop policy if exists "kb_storage_admin_all" on storage.objects;
create policy "kb_storage_admin_all"
  on storage.objects for all
  using (bucket_id = 'kb' and public.is_admin())
  with check (bucket_id = 'kb' and public.is_admin());
