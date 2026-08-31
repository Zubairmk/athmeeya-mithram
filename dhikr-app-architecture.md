# ആത്മീയമിത്രം (Spiritual Friend) — Dhikr App Architecture

**Type:** Installable Progressive Web App (PWA) — one codebase, works as web app + "mobile app"
**Build tool:** Claude Code
**Status:** Planning doc — hand this to Claude Code as project context (save as `CLAUDE.md` or reference it in your first prompt)

---

## 1. Goals & Constraints (from requirements)

- No end-user login — progress/streak stored on-device only
- Admin-only CRUD: admin uploads a PDF + audio file per dhikr item, panel extracts text for review before publish
- Minimalist UI matching Islamic art/history aesthetic
- Arabic/Malayalam text shown as-is (no retyping, no translation layer required)
- Audio player with speed control, no tasbeeh/tap counter
- Daily streak requires Morning **and** Evening azkar both completed
- Installable, works offline, sends Morning/Evening reminder notifications
- Categories go beyond Morning/Evening — supports Swalath, Hizb/Ratib, Ramadan-specific, protection, travel sets

---

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend + API | **Next.js 14 (App Router, TypeScript)** | Single codebase, deploys as PWA, API routes double as backend |
| Styling | **Tailwind CSS** | Fast to theme for the minimalist Islamic aesthetic |
| Database | **Supabase (Postgres)** | Free tier, instant REST/SQL access, pairs well with Next.js |
| File storage | **Supabase Storage** | Hosts audio files + source PDFs reliably (better than linking Google Drive in production) |
| Admin auth | **Supabase Auth** (email/password, single admin role) | You're the only admin — no need for complex roles |
| Text extraction | **Anthropic API (Claude, vision)** server-side in the admin panel | Far more reliable than raw PDF text-layer extraction or generic OCR for Arabic diacritics + Malayalam — confirmed by testing your sample PDF, whose text layer was corrupted |
| Offline / installability | **next-pwa** (service worker + manifest) | Standard, low-effort PWA layer for Next.js |
| Notifications | **Web Push** (service worker + Supabase Edge Function cron) | Works without login — subscriptions keyed to anonymous device token, not a user account |
| Hosting | **Vercel** (frontend+API) | Free tier, zero-config Next.js deploys, works well with Claude Code |

---

## 3. System Diagram

```
┌─────────────────────────────┐        ┌──────────────────────────┐
│   PUBLIC APP (no login)     │        │      ADMIN PANEL          │
│  Next.js pages, installed   │        │  (Supabase Auth gated)    │
│  as PWA on phone/desktop    │        │                            │
│                              │        │  Upload PDF + audio  ──┐  │
│  - Browse categories/sets   │        │                        │  │
│  - Read/listen to dhikr     │        │  Claude API (vision) ◄─┘  │
│  - Mark set complete        │        │  extracts Arabic +        │
│  - See streak               │        │  Malayalam text            │
│                              │        │                            │
│  Local storage (device):    │        │  Admin reviews/edits ──┐  │
│  - streak + completion log  │        │  extracted text        │  │
│  - playback speed pref      │        │                        │  │
│  - notification opt-in      │        │  Publish ──────────────┘  │
└───────────────┬──────────────┘        └─────────────┬──────────────┘
                │                                        │
                │            Next.js API routes          │
                └───────────────────┬────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │           SUPABASE              │
                    │  - Postgres (sets, items,        │
                    │    categories)                  │
                    │  - Storage (audio files, PDFs)  │
                    │  - Auth (admin only)             │
                    │  - Edge Function (cron → Web     │
                    │    Push at reminder times)       │
                    └───────────────────────────────────┘
```

---

## 4. Database Schema (Supabase / Postgres)

```sql
-- Top-level groupings: Morning/Evening, Swalath, Hizb & Ratib, Ramadan, Protection, Travel, etc.
create table categories (
  id uuid primary key default gen_random_uuid(),
  name_ml text not null,          -- Malayalam label
  name_ar text,                   -- optional Arabic label
  slug text unique not null,
  sort_order int default 0,
  icon text                       -- icon name/emoji for minimalist nav
);

-- A dhikr "set" e.g. "Swalathul Munjiya", "Morning Azkar"
create table dhikr_sets (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id),
  title_ml text not null,
  title_ar text,
  description_ml text,            -- short virtue/context note
  is_published boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Individual recitation items inside a set (a set can be a single dua or multiple parts)
create table dhikr_items (
  id uuid primary key default gen_random_uuid(),
  set_id uuid references dhikr_sets(id) on delete cascade,
  sort_order int default 0,
  arabic_text text not null,
  malayalam_note text,            -- benefit/context, shown as-is from source
  audio_url text,                 -- Supabase Storage public URL
  source_pdf_url text,            -- original uploaded PDF, kept for admin reference
  created_at timestamptz default now()
);

-- Anonymous device push subscriptions (no user accounts)
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

---

## 5. On-Device Storage (public app, no login)

Stored in `localStorage` (simple, sufficient for this scale — no need for IndexedDB):

```json
{
  "streak": {
    "current": 12,
    "longest": 30,
    "lastCompletedDate": "2026-08-29"
  },
  "completionLog": {
    "2026-08-29": { "morning": true, "evening": true },
    "2026-08-28": { "morning": true, "evening": false }
  },
  "settings": {
    "playbackSpeed": 1.0,
    "notificationsEnabled": true
  }
}
```

Streak logic: increment only when a day's log shows **both** `morning` and `evening` true; a missed day (either false) resets `current` to 0.

---

## 6. App Structure

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
    /sets/page.tsx              → list + CRUD entry point
    /sets/[id]/edit/page.tsx    → upload PDF+audio, review extracted text, publish
  /api
    /admin/extract/route.ts     → sends PDF page image to Claude API, returns transcribed text
    /admin/sets/route.ts        → CRUD for dhikr_sets/items
    /push/subscribe/route.ts    → save push_subscriptions row
    /push/send/route.ts         → Supabase Edge Function cron hits this at reminder times
/components
  AudioPlayer.tsx                → play/pause, speed control (0.75x–1.5x)
  DhikrCard.tsx                  → Arabic text block + Malayalam note
  StreakTracker.tsx
  CategoryNav.tsx
/lib
  supabase.ts
  claude.ts                      → Anthropic API client for extraction
  streak.ts                      → localStorage read/write helpers
/public
  manifest.json
  icons/                         → PWA install icons
sw.js                             → service worker (offline cache + push handling)
```

---

## 7. Content Ingestion Pipeline (per dhikr item)

1. Admin uploads a PDF (source text) + audio file via `/admin/sets/[id]/edit`
2. Server route rasterizes the PDF page(s) to images
3. Each image sent to Claude API (vision) with a prompt to transcribe Arabic + Malayalam exactly, preserving diacritics
4. Extracted text shown in an editable text box next to the rendered page image — admin corrects any errors before saving
5. Audio file uploaded to Supabase Storage; item saved with `is_published = false` until admin confirms
6. Admin flips to published — item now appears in the public app

This matches what you found necessary earlier: never trust raw text-layer extraction on Arabic scripture — always have a human review step.

---

## 8. PWA & Offline Strategy

- `next-pwa` generates the service worker + manifest
- App shell (pages, icons, fonts) cached on first load → works offline after that
- Audio files cached **on demand**: when a user opens a set, its audio is cached; previously-visited sets stay playable offline
- `manifest.json` sets `display: "standalone"` so it installs like a native app on both Android and iOS (Add to Home Screen)

---

## 9. Notifications (no login required)

1. On first visit, app asks permission → registers a Web Push subscription → saved anonymously to `push_subscriptions` (keyed by device endpoint, not identity)
2. User can set preferred Morning/Evening reminder times in Settings
3. A Supabase Edge Function runs on a cron schedule (e.g. every 15 min), checks which subscriptions have a reminder time in that window, and calls `/api/push/send` to fire the notification
4. Tapping the notification opens the relevant Morning/Evening set directly

Note: iOS requires the PWA to be installed to the home screen (iOS 16.4+) before push notifications work — worth a one-time in-app prompt telling iOS users to install first.

---

## 10. Deployment

1. Push code to GitHub
2. Connect repo to Vercel → auto-deploys on push
3. Supabase project holds DB + Storage + Auth + the cron Edge Function
4. Environment variables needed: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only), `ANTHROPIC_API_KEY`, VAPID keys for Web Push

---

## 11. Suggested Build Order (phases for Claude Code)

1. **Scaffold** — Next.js + Tailwind + Supabase connection, empty routes, deploy pipeline working end-to-end (nothing functional yet, just confirm it builds and deploys)
2. **Data layer** — Supabase schema (section 4) + admin auth
3. **Admin CRUD** — set/item creation, PDF+audio upload, Claude-powered extraction + review UI
4. **Public app** — category nav, set reading/listening view, audio player
5. **Streak system** — localStorage logic + streak UI
6. **PWA layer** — manifest, service worker, offline caching, install prompt
7. **Notifications** — push subscription flow + Edge Function cron
8. **Polish** — Islamic-art-inspired theming, fonts for Arabic (e.g. Amiri/Uthmani-style) and Malayalam

Each phase should be a separate Claude Code session/commit — validate it works before moving to the next.
