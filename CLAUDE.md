# ആത്മീയമിത്രം (Spiritual Friend) — Project Brief

This file is the persistent context for building this project. Read it before starting any work.

## What this is

An installable PWA (Progressive Web App) for daily Islamic dhikr/azkar — Arabic recitations with Malayalam context, paired audio, and a habit-tracking streak. Content source: a published Malayalam/Arabic devotional book (same title), digitized item by item.

**Explicitly decided — do not revisit without asking:**
- PWA only. No native app, no app store submission.
- No end-user login. All progress/streak lives in the browser's `localStorage`.
- Admin is the only authenticated role (single admin, not multi-tenant).
- Content comes in as PDF + audio file **per dhikr item**, supplied by the admin — never typed by hand, never bulk-scraped.
- No tap/tasbeeh counter — audio + text is the whole interaction.
- **(Changed 2026-09-01, superseding the original Claude-extraction plan below):** dhikr items show the uploaded PDF page directly to readers (embedded inline), not Claude-transcribed Arabic text. No AI extraction step. `dhikr_items.arabic_text` is legacy — the column stays (`not null`, always `""`) to avoid a schema migration, but is unused everywhere; don't resurrect it without asking.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend + API | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Database | Supabase (Postgres) |
| File storage | Supabase Storage (audio files, source PDFs) |
| Admin auth | Supabase Auth (single admin account) |
| PWA layer | Hand-written service worker (`public/sw.js`) — `next-pwa`/Workbox was tried first but its generated precaching failed to activate reliably on real iOS devices; see PWA & offline below |
| Notifications | Web Push, subscriptions keyed to anonymous device endpoint (no login), fired by a `pg_cron` + `pg_net` schedule in Supabase calling `/api/push/send` directly (not a separate Edge Function — no Supabase CLI/Deno tooling in the build environment) |
| Hosting | Vercel |

No text extraction step: dhikr items display the uploaded PDF directly (embedded inline in the reading view), not transcribed text. The source book's PDF text layer is corrupted (duplicated/overlapping text runs from the original InDesign export) — this was the original reason a Claude-vision extraction pipeline existed, but the product decision as of 2026-09-01 is to skip transcription entirely and just show the PDF page as-is.

## Design system

Established and approved (see mockup discussion) — follow this, don't invent a new direction.

**Concept:** the app shell is a dark, contemplative "dusk" — opening a dhikr item transitions into an illuminated ivory "manuscript page." That shift in tone marks browsing vs. reciting.

**Colors** (fixed brand palette — this app does not need to adapt to a host dark/light toggle; it has its own theme):
- Shell background (dark teal): `#16332E`
- Shell secondary text (muted sage): `#9FB8B0`
- Accent (brass gold) — used for: streak indicator, the active/completed Morning-Evening tile border, the embedded PDF's frame, audio progress bar. **One accent only** — do not add a separate green for "success"/"completed" states: `#C79A46`
- Page/card background (ivory manuscript): `#F7F1DF`
- Body ink on ivory: `#2B2419`
- Muted ink on ivory (notes, captions): `#5C5342`

**Typography:**
- Malayalam UI text: **Noto Sans Malayalam** — primary font, loaded globally (admin included)
- **Amiri** (serif, Naskh-style Arabic) — still loaded and used for the Arabic `title_ar` field in admin and small Arabic accents (e.g. the 404 page's "؟"), but no longer the hero of the reading view now that items show a PDF instead of transcribed text
- Both from Google Fonts

**Layout principles:**
- No SaaS card-grid-with-shadows kit. Lists use hairline dividers (`rgba(43,36,25,0.15)` on ivory), not rounded cards with drop shadows.
- Morning/Evening are two tiles at the top of home, gold border + checkmark when completed today, not a green badge.
- Audio player is a slim inline bar pinned to the screen bottom — never a floating card.
- A restrained geometric line motif may appear once, faint, behind the home header only — never tiled across the whole app.
- Overall app chrome stays LTR (Malayalam is the primary UI language); Arabic content blocks are individually `dir="rtl"`.

## Data model (Supabase / Postgres)

```sql
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
```

**On-device storage** (localStorage, no backend involved):
```json
{
  "streak": { "current": 12, "longest": 30, "lastCompletedDate": "2026-08-29" },
  "completionLog": { "2026-08-29": { "morning": true, "evening": true } },
  "settings": { "playbackSpeed": 1.0, "notificationsEnabled": true }
}
```
Streak increments only when a day's log has **both** `morning` and `evening` true; any day with either false resets `current` to 0.

## Content structure

8 categories, ~51 individual items total (see the content tracker spreadsheet for the authoritative list with filenames and status):

1. **അടിസ്ഥാനങ്ങൾ** (Foundations) — Asma-ul-Husna, Prophet's Holy Names (2 items)
2. **വിവിധ സ്വലാത്തുകൾ** (Swalath collection) — 20 individual salawat
3. **വിർദുകളും റാതിബുകളും** (Sufi Awrad & Ratib) — Wird Imam Nawawi, Ratib al-Attas, Hizbul Bahr, Haddad Ratib, etc. (6 items)
4. **സംരക്ഷണ ദിക്റുകൾ** (Protection & core adhkar) — Tawba, Ayathul Kifaya/Hifldh/Shifa, Asma-ul-Badr, Ya Latheef, family protection (7 items)
5. **ദൈനംദിന ജീവിതം** (Daily life) — Tasbeeh form, misc. dhikr/duas, dua after each of the 5 daily prayers (8 items)
6. **യാത്ര** (Travel) — travel duas (1 item)
7. **റമളാൻ** (Ramadan) — moon sighting, niyyah, post-fast, post-Taraweeh, post-Witr, etc. (6 items)
8. **ഖസീദ** (Qaseeda) — Qaseedatul Muzariyya (1 item)

Each item needs: the source PDF page (uploaded by admin, shown directly to readers — no transcription), an optional Malayalam context note, and an audio file. The 20 Swalath item names above are working transliterations — verify against the admin's own PDF for each before publishing, since the source book only labels them in Arabic.

## App structure

```
/app
  layout.tsx                    → root: fonts (Amiri + Noto Sans Malayalam), metadata, SW register
  not-found.tsx                 → root 404 fallback
  /(public)
    layout.tsx                  → dusk shell wrapper
    not-found.tsx                → branded 404 (inherits the shell)
    page.tsx                    → home: today's Morning/Evening + streak
    /category/[slug]/page.tsx   → sets within a category
    /set/[id]/page.tsx          → reading/listening view for one set (PDF + audio)
    /streak/page.tsx            → progress history
    /settings/page.tsx          → notification opt-in + reminder times
  /admin
    /login/page.tsx
    /dashboard/page.tsx
    /sets/page.tsx
    /sets/[id]/edit/page.tsx    → upload PDF+audio, publish
  /api
    /admin/sets/route.ts        → CRUD
    /admin/items/route.ts       → CRUD
    /push/subscribe/route.ts
    /push/send/route.ts         → CRON_SECRET-guarded, called by pg_cron
/components
  AudioPlayer.tsx                → play/pause, speed control (0.75x–1.5x)
  DhikrCard.tsx                  → embedded PDF (iframe) + Malayalam note
  StreakTracker.tsx
  CategoryNav.tsx
  ServiceWorkerRegister.tsx
/lib
  supabase/{client,server,admin}.ts
  webpush.ts, push-client.ts
  streak.ts
/public
  manifest.json
  icons/
  sw.js                          → committed static file, not generated
```

## PWA & offline

- `public/sw.js` is a minimal, hand-written, committed service worker — no Workbox/precaching. `next-pwa` was tried first but its generated precache step failed to activate reliably on real iOS devices (install → "redundant" with no visible error); removed rather than debugged further, since push notifications were the actual priority.
- No offline asset caching currently (a real trade-off from the above — revisit deliberately if wanted, with narrower caching than blanket precaching of every build asset)
- Registered client-side via `components/ServiceWorkerRegister.tsx` with `updateViaCache: 'none'` (not `next-pwa`'s built-in auto-register, which hooks into the Pages Router's `_app.js` and no-ops under App Router)
- `manifest.json`: `display: "standalone"` for install-to-homescreen on Android and iOS

## Notifications

- On first visit, request permission → register Web Push subscription → save anonymously (device endpoint, not identity) to `push_subscriptions`
- User sets preferred Morning/Evening times in Settings
- A `pg_cron` + `pg_net` schedule inside Supabase (every 15 min) calls `/api/push/send` directly over HTTP — not a Supabase Edge Function (no CLI/Deno tooling available in the build environment); same practical effect, set up via the SQL editor
- iOS requires the PWA installed to homescreen (iOS 16.4+) before push works — prompt iOS users to install first

## Deployment

GitHub → Vercel (auto-deploy). Supabase project holds DB + Storage + Auth + the `pg_cron` schedule.

Env vars needed: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_VAPID_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `CRON_SECRET`.

**Vercel env var gotchas (cost hours of debugging, twice):** (1) Vercel's "Secret" variable type blocks `NEXT_PUBLIC_*` values from being embedded at build time — build succeeds, client gets `""`. Use "Plain"/"Config" type for anything `NEXT_PUBLIC_`. Type can't be changed on an existing variable; delete and recreate. (2) Variable values can get silently corrupted with literal bullet characters (•) partway through — `process.env.X` genuinely returns the garbage, not just a masked UI display. If a Vercel-deployed feature fails in a way that doesn't reproduce locally, add a temporary route reporting `process.env.X`'s length and char codes rather than trusting screenshots of Vercel's UI (which always show partial-text-plus-dots for existing secrets, masked or not).

## Build order

1. Scaffold — Next.js + Tailwind + Supabase connected, deploy pipeline working, nothing functional yet
2. Data layer — schema above + admin auth
3. Admin CRUD — upload PDF+audio, publish toggle (originally planned Claude-vision extraction + review UI; superseded 2026-09-01 — PDFs display directly, see the "Explicitly decided" note above)
4. Public app — category nav, reading/listening view, audio player, applying the design system above
5. Streak system — localStorage logic + UI
6. PWA layer — manifest, service worker, install prompt (offline caching dropped, see PWA & offline above)
7. Notifications — push subscription flow + `pg_cron` schedule (not a separate Edge Function, see Notifications above)
8. Polish — pass over the whole app against the design system section; nothing should still look like a generic template

All 8 phases complete as of 2026-09-01. Validate each phase works before moving to the next — don't stack unverified phases.
