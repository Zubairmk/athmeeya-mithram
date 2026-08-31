-- ആത്മീയമിത്രം — initial schema
-- Run in the Supabase SQL editor, or via `supabase db push` once the CLI is linked.

create table categories (
  id uuid primary key default gen_random_uuid(),
  name_ml text not null,
  name_ar text,
  slug text unique not null,
  sort_order int default 0,
  icon text
);

create table dhikr_sets (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id),
  title_ml text not null,
  title_ar text,
  description_ml text,
  is_published boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table dhikr_items (
  id uuid primary key default gen_random_uuid(),
  set_id uuid references dhikr_sets(id) on delete cascade,
  sort_order int default 0,
  arabic_text text not null,
  malayalam_note text,
  audio_url text,
  source_pdf_url text,
  created_at timestamptz default now()
);

create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text unique not null,
  p256dh text not null,
  auth text not null,
  reminder_morning_time time default '05:30',
  reminder_evening_time time default '17:30',
  timezone text default 'Asia/Riyadh',
  created_at timestamptz default now()
);

-- Row Level Security: the public app (anon key, no login) may only read
-- published content. All writes go through the admin dashboard, which
-- authenticates via Supabase Auth as the single admin user.

alter table categories enable row level security;
alter table dhikr_sets enable row level security;
alter table dhikr_items enable row level security;
alter table push_subscriptions enable row level security;

create policy "categories are publicly readable"
  on categories for select
  to anon, authenticated
  using (true);

create policy "categories are writable by authenticated admin"
  on categories for all
  to authenticated
  using (true)
  with check (true);

create policy "published sets are publicly readable"
  on dhikr_sets for select
  to anon, authenticated
  using (is_published = true or auth.role() = 'authenticated');

create policy "sets are writable by authenticated admin"
  on dhikr_sets for all
  to authenticated
  using (true)
  with check (true);

create policy "items of published sets are publicly readable"
  on dhikr_items for select
  to anon, authenticated
  using (
    exists (
      select 1 from dhikr_sets
      where dhikr_sets.id = dhikr_items.set_id
        and (dhikr_sets.is_published = true or auth.role() = 'authenticated')
    )
  );

create policy "items are writable by authenticated admin"
  on dhikr_items for all
  to authenticated
  using (true)
  with check (true);

-- push_subscriptions: anonymous devices can create/update their own
-- subscription by endpoint; no public read (reserved for the admin /
-- the cron Edge Function, which uses the service role key and bypasses RLS).

create policy "anyone can subscribe to push"
  on push_subscriptions for insert
  to anon, authenticated
  with check (true);

create policy "anyone can update their own subscription"
  on push_subscriptions for update
  to anon, authenticated
  using (true)
  with check (true);
