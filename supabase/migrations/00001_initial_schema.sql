-- Tiger M.A.T.E Initial Schema
-- All tables, RLS policies, and triggers

-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists "uuid-ossp" with schema extensions;

-- ============================================================
-- 1. profiles
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  full_name   text not null default '',
  major       text,
  classification text check (classification in ('freshman', 'sophomore', 'junior', 'senior', 'graduate')),
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Profiles: users can read their own row
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- Profiles: users can insert their own row (for trigger / initial setup)
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Profiles: users can update their own row
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Profiles: no delete (admin only via service role)

-- ============================================================
-- 2. events
-- ============================================================
create table public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  location    text,
  category    text not null check (category in ('academic', 'social', 'sports', 'career', 'health', 'cultural', 'other')),
  start_time  timestamptz not null,
  end_time    timestamptz,
  is_featured boolean not null default false,
  image_url   text,
  created_at  timestamptz not null default now()
);

alter table public.events enable row level security;

-- Events: any authenticated user can read
create policy "events_select_authenticated"
  on public.events for select
  using (auth.role() = 'authenticated');

-- Events: insert/update/delete restricted to service role (seed data only)

-- ============================================================
-- 3. event_bookmarks
-- ============================================================
create table public.event_bookmarks (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references public.profiles(id) on delete cascade,
  event_id  uuid not null references public.events(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, event_id)
);

alter table public.event_bookmarks enable row level security;

-- Bookmarks: users can read their own
create policy "bookmarks_select_own"
  on public.event_bookmarks for select
  using (auth.uid() = user_id);

-- Bookmarks: users can insert their own
create policy "bookmarks_insert_own"
  on public.event_bookmarks for insert
  with check (auth.uid() = user_id);

-- Bookmarks: users can delete their own
create policy "bookmarks_delete_own"
  on public.event_bookmarks for delete
  using (auth.uid() = user_id);

-- Bookmarks: no update (delete + re-create pattern)

-- ============================================================
-- 4. todos
-- ============================================================
create table public.todos (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  title        text not null,
  description  text,
  category     text check (category in ('academic', 'personal', 'career', 'health', 'financial')),
  priority     text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date     timestamptz,
  is_completed boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.todos enable row level security;

-- Todos: users can read their own
create policy "todos_select_own"
  on public.todos for select
  using (auth.uid() = user_id);

-- Todos: users can insert their own
create policy "todos_insert_own"
  on public.todos for insert
  with check (auth.uid() = user_id);

-- Todos: users can update their own
create policy "todos_update_own"
  on public.todos for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Todos: users can delete their own
create policy "todos_delete_own"
  on public.todos for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 5. resources
-- ============================================================
create table public.resources (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  category    text not null check (category in ('academic', 'financial', 'health', 'housing', 'dining', 'technology', 'career', 'safety')),
  location    text,
  phone       text,
  email       text,
  website     text,
  hours       text,
  icon        text,
  created_at  timestamptz not null default now()
);

alter table public.resources enable row level security;

-- Resources: any authenticated user can read
create policy "resources_select_authenticated"
  on public.resources for select
  using (auth.role() = 'authenticated');

-- Resources: insert/update/delete restricted to service role (seed data only)

-- ============================================================
-- Trigger: auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Trigger: auto-update updated_at timestamp
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger todos_updated_at
  before update on public.todos
  for each row execute function public.handle_updated_at();
