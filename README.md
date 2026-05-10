# Fragrance Collection

A personal fragrance catalogue PWA. Track your collection, log wear history, get AI-powered recommendations, and rate and annotate your bottles. Syncs across devices via Supabase.

---

## Features

- Browse, search, filter, and sort by house, category, or wear history
- Log sprays per user profile
- Daily pick — random or seasonal
- AI enrichment — auto-fills description, notes, concentration, and perfumer via the Anthropic API
- AI fragrance advisor — chat interface that recommends from your collection based on mood and occasion
- Photo support — upload from your device or pull from a Fragrantica URL
- 5-star ratings and personal notes per perfume, attributed per profile
- Archive and delete
- Cross-device sync via Supabase
- Installable as a home screen app (PWA)
- Offline fallback via localStorage cache

---

## Stack

| Layer | Technology |
|---|---|
| UI | React 18 (via CDN, no build step) |
| Fonts | Cormorant Garamond, DM Sans |
| AI | Anthropic API |
| Sync | Supabase (Postgres) |
| Hosting | Vercel |
| Offline | Service Worker + Cache API |

---

## File structure

```
index.html      Main app — all React code lives here
manifest.json   PWA manifest
sw.js           Service worker for offline support and caching
icon.svg        App icon
README.md       This file
```

---

## Setup

### 1. Deploy

Fork this repo and connect it to [Vercel](https://vercel.com). It deploys on every push. No build step needed — the four files are served as-is.

### 2. Get an Anthropic API key

1. Go to [console.anthropic.com](https://console.anthropic.com) and create an account
2. Create an API key
3. Paste it into the app via Settings

The key is used for AI enrichment and the chat advisor. It is stored in your browser's localStorage only — never in the code or sent anywhere except directly to Anthropic.

### 3. Set up Supabase (optional but required for cross-device sync)

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Open the SQL editor and run the following:

```sql
create table perfumes (
  id              bigint primary key,
  name            text not null,
  house           text not null,
  description     text,
  notes           text[],
  categories      text[],
  year            int,
  perfumer        text,
  concentration   text,
  photo_url       text,
  enriched        boolean not null default false,
  archived        boolean not null default false,
  archive_reason  text,
  archived_at     timestamptz,
  last_used       timestamptz,
  rating          int,
  personal_notes  jsonb not null default '[]'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table spray_logs (
  id          bigserial primary key,
  perfume_id  bigint not null references perfumes(id) on delete cascade,
  who         text not null,
  logged_at   timestamptz not null default now()
);

create index on spray_logs(perfume_id);

alter table perfumes disable row level security;
alter table spray_logs disable row level security;
```

3. Go to Project Settings → API and copy your **Project URL** and **anon public key**
4. Open the app, go to Settings, and paste both values in

On first load after that, the app migrates your local data to Supabase automatically.

> **Note on RLS:** Row Level Security is disabled here because the app has no real login layer — profiles are just names stored locally. The anon key controls access. Do not commit your anon key to a public repo.

### 4. Set your profile names

Find this line in `index.html` and replace the two names with your own:

```js
{["Alice", "Bob"].map(name => (
```

---

## Photos

Two ways to add a bottle photo:

- **Upload** — from your camera roll or file system, stored as base64
- **Fragrantica URL** — paste the full URL of any Fragrantica perfume page (e.g. `https://www.fragrantica.com/perfume/Dior/Sauvage-33787.html`) and the app extracts the bottle image

---

## Updating the PWA cache

If you deploy changes and the installed app on your phone does not update, bump the cache version in `sw.js`:

```js
const CACHE_NAME = 'fragrance-v2'; // increment this
```

Then uninstall the app from your home screen, open the URL in the browser once, and reinstall via Add to Home Screen.

---

## License

MIT
