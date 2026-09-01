-- Content model change: dhikr items now display the source PDF directly
-- to readers instead of Claude-extracted Arabic text, so source-pdfs must
-- become publicly readable (was admin-only). Keep the bucket name as-is
-- to avoid a disruptive rename/migration of existing objects.

update storage.buckets set public = true where id = 'source-pdfs';

create policy "source pdfs are publicly readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'source-pdfs');
