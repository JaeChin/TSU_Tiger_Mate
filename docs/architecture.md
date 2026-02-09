# Architecture: Tiger M.A.T.E

## High-Level Design

```
+---------------------------+
|      Vercel (CDN/Edge)    |
|  +---------------------+  |
|  |  Next.js 14 App     |  |
|  |  (App Router + SSR) |  |
|  +-----+--------+------+  |
|        |        |          |
|   Server      Client       |
|  Components  Components    |
+--------+--------+----------+
         |        |
    +----v--------v----+      +------------------+
    |   Supabase       |      |  Anthropic API   |
    |  - Auth           |      |  (Claude)        |
    |  - Postgres + RLS |      |  Ask M.A.T.E     |
    |  - Storage        |      +------------------+
    +------------------+           ^
                                   |
                          Next.js API Route
                          /api/chat (server-side)
```

### Request Flow

1. **Public pages** (landing) — Server-rendered, no auth required
2. **Auth pages** (login/signup) — Client components, Supabase Auth SDK
3. **Dashboard pages** — Middleware checks session, redirects if unauthenticated
4. **API routes** — Server-side only, used for Anthropic API proxy (keeps key secret)
5. **Data fetching** — Server components fetch via Supabase server client; client components use Supabase browser client for real-time or mutations

## Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Next.js 14 (App Router) | SSR + SSG flexibility, file-based routing, server components reduce client JS |
| Language | TypeScript (strict) | Catch bugs at compile time, better DX with Supabase types |
| Styling | Tailwind CSS | Utility-first, no CSS-in-JS runtime cost, pairs well with component architecture |
| Icons | lucide-react | Tree-shakeable, consistent design, lightweight |
| Auth | Supabase Auth | Email/password with .edu gating, built-in session management, PKCE flow |
| Database | Supabase Postgres | Managed Postgres with RLS, auto-generated REST API, real-time subscriptions |
| AI Chat | Anthropic API (Claude) | Conversational AI for campus Q&A, called server-side via API route |
| Hosting | Vercel | Zero-config Next.js deployment, edge functions, preview deploys |
| Fonts | Google Fonts (Outfit + DM Sans) | TSU brand compliance via next/font — self-hosted, no layout shift |

## Folder Structure

```
src/
├── app/                          # App Router — routes and layouts
│   ├── layout.tsx                # Root layout (fonts, metadata, global providers)
│   ├── page.tsx                  # Landing page (public)
│   ├── globals.css               # Tailwind directives + CSS custom properties
│   ├── (auth)/                   # Auth route group (no layout nesting)
│   │   ├── login/
│   │   │   └── page.tsx          # Login form
│   │   └── signup/
│   │       └── page.tsx          # Signup form with .edu validation
│   ├── (dashboard)/              # Dashboard route group (shared layout)
│   │   ├── layout.tsx            # Dashboard shell: sidebar + topbar
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Dashboard home
│   │   ├── events/
│   │   │   ├── page.tsx          # Events list with filters
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Event detail
│   │   ├── resources/
│   │   │   └── page.tsx          # Resource directory
│   │   ├── todos/
│   │   │   └── page.tsx          # To-do manager
│   │   └── ask/
│   │       └── page.tsx          # Ask M.A.T.E chat
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts          # Supabase auth callback handler
│   └── api/
│       └── chat/
│           └── route.ts          # Anthropic API proxy
├── components/
│   ├── ui/                       # Reusable primitives (Button, Card, Input, Badge, etc.)
│   ├── dashboard/                # Dashboard-specific (EventCard, TodoItem, StatsCard, etc.)
│   └── layout/                   # Structural (Sidebar, Topbar, MobileNav, Footer)
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client (createBrowserClient)
│   │   ├── server.ts             # Server client (createServerClient with cookies)
│   │   └── middleware.ts         # Middleware client (session refresh)
│   ├── utils/
│   │   ├── cn.ts                 # clsx + twMerge utility
│   │   └── validators.ts        # Email validation, input sanitization
│   └── types/
│       └── database.ts           # Supabase generated types (or manual)
├── middleware.ts                  # Next.js middleware — session refresh + route protection
docs/
├── prd.md                        # Product requirements
└── architecture.md               # This file
supabase/
└── migrations/
    └── 001_initial_schema.sql    # All tables + RLS policies
```

### Key Decisions

- **Route groups** `(auth)` and `(dashboard)` keep layouts separate without affecting URL paths
- **Dashboard layout** wraps all authenticated pages with sidebar + topbar — single source of navigation
- **API route for chat** keeps the Anthropic API key server-side; client never sees it
- **`lib/types/database.ts`** — Supabase CLI can generate these, but we'll start with manual types to avoid a CLI dependency in the scaffold phase

## Data Model

### Entity Relationship Diagram

```
profiles 1──── * todos
    |
    └──── * event_bookmarks * ────── 1 events

resources (standalone — no FK relationships)
```

### Table Definitions

#### profiles
| Column | Type | Constraints |
|--------|------|------------|
| id | uuid | PK, references auth.users(id) ON DELETE CASCADE |
| email | text | NOT NULL, UNIQUE |
| full_name | text | NOT NULL |
| major | text | |
| classification | text | CHECK (freshman, sophomore, junior, senior, graduate) |
| avatar_url | text | |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

#### events
| Column | Type | Constraints |
|--------|------|------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| title | text | NOT NULL |
| description | text | |
| location | text | |
| category | text | NOT NULL, CHECK (academic, social, sports, career, health, cultural, other) |
| start_time | timestamptz | NOT NULL |
| end_time | timestamptz | |
| is_featured | boolean | DEFAULT false |
| image_url | text | |
| created_at | timestamptz | DEFAULT now() |

#### event_bookmarks
| Column | Type | Constraints |
|--------|------|------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| user_id | uuid | NOT NULL, FK profiles(id) ON DELETE CASCADE |
| event_id | uuid | NOT NULL, FK events(id) ON DELETE CASCADE |
| created_at | timestamptz | DEFAULT now() |
| | | UNIQUE(user_id, event_id) |

#### todos
| Column | Type | Constraints |
|--------|------|------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| user_id | uuid | NOT NULL, FK profiles(id) ON DELETE CASCADE |
| title | text | NOT NULL |
| description | text | |
| category | text | CHECK (academic, personal, career, health, financial) |
| priority | text | NOT NULL, CHECK (low, medium, high), DEFAULT 'medium' |
| due_date | timestamptz | |
| is_completed | boolean | DEFAULT false |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

#### resources
| Column | Type | Constraints |
|--------|------|------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| name | text | NOT NULL |
| description | text | |
| category | text | NOT NULL, CHECK (academic, financial, health, housing, dining, technology, career, safety) |
| location | text | |
| phone | text | |
| email | text | |
| website | text | |
| hours | text | |
| icon | text | |
| created_at | timestamptz | DEFAULT now() |

## Security Architecture

### Authentication
- **Supabase Auth** with email/password (PKCE flow for SSR)
- **.edu email gating** — enforced at two layers:
  1. Client-side: form validation rejects non-.edu emails before submission
  2. Server-side: Supabase database function on `auth.users` insert validates email domain
- **Session management** — JWT tokens stored in httpOnly cookies via `@supabase/ssr`
- **Middleware** refreshes session on every request to prevent stale tokens

### Authorization (Row Level Security)
Every table has RLS enabled. Policies:

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | Own row only | Own row only (trigger on signup) | Own row only | Never (admin only) |
| events | All authenticated users | Admin only (seed data) | Admin only | Admin only |
| event_bookmarks | Own bookmarks only | Own bookmarks only | Never (delete + re-create) | Own bookmarks only |
| todos | Own todos only | Own todos only | Own todos only | Own todos only |
| resources | All authenticated users | Admin only (seed data) | Admin only | Admin only |

### Secrets Management
- All secrets in `.env.local` (gitignored)
- Required env vars:
  - `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL (public, safe in client)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key (public, safe with RLS)
  - `SUPABASE_SERVICE_ROLE_KEY` — Server-only, bypasses RLS (used only in migrations/admin)
  - `ANTHROPIC_API_KEY` — Server-only, used in `/api/chat` route
- The Anthropic key is **never** exposed to the client; the `/api/chat` route proxies requests

### Input Validation
- All user input validated with TypeScript types + runtime checks before hitting the database
- Email format validation via regex + .edu domain check
- Text inputs sanitized (trim whitespace, limit length)
- Supabase RLS provides a second layer of defense even if validation is bypassed

## Implementation Order

### Phase 1: Foundation
| Step | Task | Agent | Description |
|------|------|-------|-------------|
| 1 | Tailwind brand config | /ui | Add TSU colors, fonts (Outfit, DM Sans) to Tailwind config |
| 2 | Root layout | /ui | Replace Geist fonts with Outfit/DM Sans, update metadata |
| 3 | globals.css | /ui | TSU brand CSS custom properties |
| 4 | Supabase client helpers | /devsecops | Create `client.ts`, `server.ts`, `middleware.ts` in `lib/supabase/` |
| 5 | Middleware | /devsecops | Next.js middleware for session refresh + route protection |
| 6 | Database schema | /devsecops | Write `001_initial_schema.sql` with all tables + RLS |
| 7 | TypeScript types | /devsecops | `lib/types/database.ts` matching the schema |
| 8 | Utility functions | /ui | `cn.ts` (clsx + twMerge), `validators.ts` |

### Phase 2: P0 — Must Have
| Step | Task | Agent | Description |
|------|------|-------|-------------|
| 9 | Landing page | /ui | Public marketing page at `/` |
| 10 | Auth UI | /ui | Login + Signup pages with .edu validation |
| 11 | Auth callback | /devsecops | `auth/callback/route.ts` for Supabase PKCE flow |
| 12 | Profile creation | /devsecops | Auto-create profile row on signup (DB trigger or post-signup hook) |
| 13 | Dashboard layout | /ui | Sidebar + Topbar + MobileNav shell |
| 14 | Dashboard home | /ui | Personalized home with event previews, quick actions, todo preview |
| 15 | Events page | /ui | List + filter + detail views |
| 16 | Resources page | /ui | Searchable directory |
| 17 | Seed data | /devsecops | Sample events + resources for demo |

### Phase 3: P1 — High Impact
| Step | Task | Agent | Description |
|------|------|-------|-------------|
| 18 | Ask M.A.T.E API route | /devsecops | `/api/chat` route proxying to Anthropic |
| 19 | Ask M.A.T.E UI | /ui | Chat interface |
| 20 | Todos CRUD | /ui + /devsecops | Full to-do manager |

## Handoff Notes

### For /devsecops
- Start with **Step 4** (Supabase client helpers) — the UI agent needs these to exist
- Then **Step 5** (middleware) and **Step 6** (database schema + RLS)
- `.env.local` template should be documented so the developer knows what keys to add
- The `auth/callback/route.ts` must handle the PKCE code exchange correctly
- Profile auto-creation: use a Postgres trigger `on auth.users insert` that creates a matching `profiles` row

### For /ui
- Start with **Step 1** (Tailwind brand config) — everything else depends on the design tokens
- The `cn()` utility (Step 8) is needed before building any component
- Build the UI component primitives (Button, Card, Input, Badge) first — they're used everywhere
- Dashboard layout (Step 13) should be built before individual dashboard pages
- All components must be mobile-first and WCAG 2.1 AA accessible
- Use `lucide-react` for all icons — no other icon library
- Named exports for components, default exports for page files
