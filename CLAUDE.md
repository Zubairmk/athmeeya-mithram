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

## Tech stack

| Layer | Choice |
|---|---|
| Frontend + API | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Database | Supabase (Postgres) |
| File storage | Supabase Storage (audio files, source PDFs) |
| Admin auth | Supabase Auth (single admin account) |
| Text extraction | Anthropic API (Claude, vision) — rasterize the uploaded PDF page(s), transcribe Arabic + Malayalam, admin reviews/edits before publish |
| PWA layer | `next-pwa` (manifest + service worker) |
| Notifications | Web Push, subscriptions keyed to anonymous device endpoint (no login), fired by a Supabase Edge Function cron |
| Hosting | Vercel |

Why Claude vision for extraction, not a normal OCR library: tested against the source book's PDF — its text layer is corrupted (duplicated/overlapping text runs from the original InDesign export). Never trust `pdftotext` or a raw text layer on this content. Always: render page → image → Claude vision → human review before publish.

## Design system

Established and approved (see mockup discussion) — follow this, don't invent a new direction.

**Concept:** the app shell is a dark, contemplative "dusk" — opening a dhikr item transitions into an illuminated ivory "manuscript page." That shift in tone marks browsing vs. reciting.

**Colors** (fixed brand palette — this app does not need to adapt to a host dark/light toggle; it has its own theme):
- Shell background (dark teal): `#16332E`
- Shell secondary text (muted sage): `#9FB8B0`
- Accent (brass gold) — used for: streak indicator, the active/completed Morning-Evening tile border, hairline rules around Arabic text, audio progress bar. **One accent only** — do not add a separate green for "success"/"completed" states: `#C79A46`
- Page/card background (ivory manuscript): `#F7F1DF`
- Body ink on ivory: `#2B2419`
- Muted ink on ivory (notes, captions): `#5C5342`

**Typography:**
- Arabic text: **Amiri** (serif, Naskh-style) — always the visual hero, large, centered, `dir="rtl"`
- Malayalam UI text: **Noto Sans Malayalam**
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

Each item needs: Arabic text (from admin's PDF, via the extraction pipeline above), an optional Malayalam context note, and an audio file. The 20 Swalath item names above are working transliterations — verify against the admin's own PDF for each before publishing, since the source book only labels them in Arabic.

## App structure

```
/app
  /(public)
    page.tsx                    → home: today's Morning/Evening + streak
    /category/[slug]/page.tsx   → sets within a category
    /set/[id]/page.tsx          → reading/listening view for one set
    /streak/page.tsx            → progress history
  /admin
    /login/page.tsx
    /dashboard/page.tsx
    /sets/page.tsx
    /sets/[id]/edit/page.tsx    → upload PDF+audio, review extracted text, publish
  /api
    /admin/extract/route.ts     → Claude vision transcription
    /admin/sets/route.ts        → CRUD
    /push/subscribe/route.ts
    /push/send/route.ts
/components
  AudioPlayer.tsx                → play/pause, speed control (0.75x–1.5x)
  DhikrCard.tsx                  → Arabic text block (Amiri, RTL) + Malayalam note
  StreakTracker.tsx
  CategoryNav.tsx
/lib
  supabase.ts
  claude.ts
  streak.ts
/public
  manifest.json
  icons/
sw.js
```

## PWA & offline

- `next-pwa` generates manifest + service worker
- App shell cached on first load → works offline after that
- Audio cached on demand per visited set, so previously-opened items stay playable offline
- `manifest.json`: `display: "standalone"` for install-to-homescreen on Android and iOS

## Notifications

- On first visit, request permission → register Web Push subscription → save anonymously (device endpoint, not identity) to `push_subscriptions`
- User sets preferred Morning/Evening times in Settings
- Supabase Edge Function cron (~every 15 min) checks due subscriptions, calls `/api/push/send`
- iOS requires the PWA installed to homescreen (iOS 16.4+) before push works — prompt iOS users to install first

## Deployment

GitHub → Vercel (auto-deploy). Supabase project holds DB + Storage + Auth + the cron Edge Function.

Env vars needed: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, VAPID keys for Web Push.

## Build order

1. Scaffold — Next.js + Tailwind + Supabase connected, deploy pipeline working, nothing functional yet
2. Data layer — schema above + admin auth
3. Admin CRUD — upload, Claude-vision extraction, review UI, publish toggle
4. Public app — category nav, reading/listening view, audio player, applying the design system above
5. Streak system — localStorage logic + UI
6. PWA layer — manifest, service worker, offline caching, install prompt
7. Notifications — push subscription flow + Edge Function cron
8. Polish — pass over the whole app against the design system section; nothing should still look like a generic template

Validate each phase works before moving to the next — don't stack unverified phases.
