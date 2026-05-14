-- ════════════════════════════════════════════════════════════
--  NexCart · 008 · avatars storage bucket
--
--  Public-read bucket where each signed-in user can upload, replace,
--  and delete files inside their own `${user.id}/...` folder.
--  Idempotent.
-- ════════════════════════════════════════════════════════════

-- Public bucket so avatars load from <Image> anywhere without signed URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880, -- 5 MB hard cap per file
  array['image/png','image/jpeg','image/webp','image/gif']
)
on conflict (id) do update set
  public              = excluded.public,
  file_size_limit     = excluded.file_size_limit,
  allowed_mime_types  = excluded.allowed_mime_types;

-- Anyone can read avatars (the URL is meant to be embedded publicly).
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Authenticated users can only write to their own folder: <uid>/<file>.
drop policy if exists "avatars_owner_insert" on storage.objects;
create policy "avatars_owner_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
