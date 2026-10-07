-- ============================================================================
-- HOUSE & CLUB MEMBERSHIP SETUP (DB 1 — ohczlooperjqpyllmabo)
-- PURPOSE: Track which students belong to which house / club and their
--          position (leader, co-leader, member).
-- STYLE:   Mirrors student_credentials / school_clubs patterns (allow-all RLS).
-- RUN:     Apply in the Supabase SQL Editor on the DB 1 project.
-- ============================================================================

-- 1. Memberships table (one row per student per group)
create table if not exists public.student_group_memberships (
  id bigint generated always as identity primary key,
  student_roll integer not null,
  group_type text not null check (group_type in ('house', 'club')),
  group_name text not null,
  position text not null default 'member' check (position in ('leader', 'co-leader', 'member')),
  position_rank integer not null default 3, -- 1 = leader, 2 = co-leader, 3 = member
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (student_roll, group_type, group_name),
  foreign key (student_roll) references public.students_registry(roll) on delete cascade
);

-- Fast lookup of every member of a given group
create index if not exists student_group_memberships_group_idx
  on public.student_group_memberships (group_type, group_name, position_rank);

-- RLS: allow-all public access (same posture as school_clubs / student_credentials)
alter table public.student_group_memberships enable row level security;
drop policy if exists "Allow all public access" on public.student_group_memberships;
create policy "Allow all public access" on public.student_group_memberships
  for all using (true) with check (true);

-- The Admin Portal roster auto-discovers group names from (a) a static house
-- catalog, (b) school_clubs, and (c) any group_name already present in rows,
-- so no seed data is required. Leaders / co-leaders / members are assigned via
-- the Admin Portal → Create Student Account form.