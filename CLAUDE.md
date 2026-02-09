# Tiger M.A.T.E — Project Rules

## What This Is
Tiger M.A.T.E (My Academic Transition Experience) is a student-first web platform for Texas Southern University. It centralizes campus life, academics, events, resources, and AI guidance into one unified dashboard.

## Tech Stack
- Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS
- Backend: Supabase (Auth + Postgres + Row Level Security)
- Hosting: Vercel (frontend), Supabase hosted (backend)
- Icons: lucide-react
- AI Chat: Anthropic API (Claude) for Ask M.A.T.E feature

## Architecture Rules
- Use App Router with server components by default
- Client components only when needed (interactivity, hooks)
- All Supabase calls go through lib/supabase/ helpers (client.ts, server.ts, middleware.ts)
- Every database table gets Row Level Security — no exceptions
- .edu email validation on signup — enforced client AND server side
- Secrets in .env.local only — never committed
- All user input validated before hitting the database

## TSU Brand
- Maroon primary: #6B0F1A
- Gold accent: #FFD700
- Display font: Outfit
- Body font: DM Sans

## Folder Convention
- src/app/ — routes (App Router)
- src/components/ui/ — reusable UI primitives
- src/components/dashboard/ — dashboard-specific components
- src/components/layout/ — nav, sidebar, footer
- src/lib/supabase/ — Supabase client helpers
- src/lib/utils/ — utility functions
- supabase/migrations/ — SQL schema files

## Code Standards
- Semantic HTML always — no div soup
- WCAG 2.1 AA accessibility on every component
- Mobile-first responsive design
- No any types — strict TypeScript
- Named exports for components, default exports for pages

## Commands
- /prime — Read project context, summarize state, suggest next actions
- /architect — Design system architecture decisions
- /devsecops — Implement backend/security features
- /ui — Implement frontend components and pages
- /review — Code review and security audit
- /debug — Systematic troubleshooting

## Current Phase: Scaffold (no features built yet)
