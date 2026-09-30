-- ====================================================================
-- PHASE 2 SETUP & BUG FIXES
-- ====================================================================

-- 1. Fix school_announcements table by renaming "desc" to "description"
DO $$
BEGIN
  IF EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='school_announcements' and column_name='desc')
  THEN
      ALTER TABLE "public"."school_announcements" RENAME COLUMN "desc" TO "description";
  END IF;
END $$;

-- 2. Create Employees Table (for Outer Employees addition)
create table if not exists public.employees (
  id bigint generated always as identity primary key,
  name text not null,
  role text not null,
  phone text not null,
  address text,
  employee_type text default 'Internal Staff',
  status text default 'Active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.employees enable row level security;
drop policy if exists "Allow all public access" on public.employees;
create policy "Allow all public access" on public.employees for all using (true) with check (true);

-- 3. Create Categories Table (Dynamic categories)
create table if not exists public.categories (
  id bigint generated always as identity primary key,
  category_name text not null,
  category_type text not null,
  description text,
  status text default 'Active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.categories enable row level security;
drop policy if exists "Allow all public access" on public.categories;
create policy "Allow all public access" on public.categories for all using (true) with check (true);

-- 4. Create Reports Table
create table if not exists public.reports (
  id bigint generated always as identity primary key,
  report_title text not null,
  module_area text not null,
  generated_by text not null,
  status text default 'Draft',
  file_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reports enable row level security;
drop policy if exists "Allow all public access" on public.reports;
create policy "Allow all public access" on public.reports for all using (true) with check (true);
