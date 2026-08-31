-- Storage buckets for per-item audio + source PDFs.
-- audio: public read (the public app streams directly from the bucket URL)
-- source-pdfs: admin-only (original scans, only needed for re-review)

insert into storage.buckets (id, name, public)
values ('audio', 'audio', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('source-pdfs', 'source-pdfs', false)
on conflict (id) do nothing;

create policy "audio is publicly readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'audio');

create policy "authenticated can manage audio"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'audio')
  with check (bucket_id = 'audio');

create policy "authenticated can manage source pdfs"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'source-pdfs')
  with check (bucket_id = 'source-pdfs');
