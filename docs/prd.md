# Tiger M.A.T.E — Product Requirements Document

## Vision
Reduce the confusion, overwhelm, and fragmentation students experience when starting college by providing a centralized, intelligent platform.

## Target Users
- Incoming freshmen
- Transfer students
- International students
- Any student needing structure and campus guidance

## MVP Features (2-week sprint)

### P0 — Must Have for Demo
1. Landing Page — public marketing page explaining Tiger M.A.T.E
2. Auth — .edu email signup/login via Supabase Auth
3. Student Dashboard — personalized home with events preview, quick actions, todos preview
4. Campus Events — browse, filter by category, event details
5. Resource Finder — searchable directory of campus offices and services

### P1 — High Impact for Demo
6. Ask M.A.T.E — AI chat assistant for campus questions (Anthropic API)
7. To-Do Manager — CRUD with categories, priorities, due dates

### P2 — Post-MVP
8. Campus Map
9. Unified Calendar (merge events + todos + academic dates)
10. Budgeting Assistant
11. Roommate Matching
12. MyTSU Integration

## Data Model
- profiles (id, email, full_name, major, classification, avatar_url)
- events (id, title, description, location, category, start_time, end_time, is_featured)
- event_bookmarks (id, user_id, event_id)
- todos (id, user_id, title, description, category, priority, due_date, is_completed)
- resources (id, name, description, category, location, phone, email, website, hours, icon)

## Non-Functional Requirements
- Mobile-first responsive
- Sub-2s page loads
- WCAG 2.1 AA accessible
- Secure by default (RLS, input validation, .edu gating)

## Success Metric
TSU administration sees the demo and approves funding for full development.

## Competitive Context
Tiger M.A.T.E replaces Nav360, which is fragmented, has expired links, limited functionality, and no AI assistance. Tiger M.A.T.E is centralized, intelligent, and student-first.
