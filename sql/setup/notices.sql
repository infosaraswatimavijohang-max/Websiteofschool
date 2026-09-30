-- notices.sql
-- Table definition for dynamic Notices & Announcements

create table if not exists public.school_notices (
  id bigint generated always as identity primary key,
  date text not null,
  title text not null,
  description text not null,
  icon_emoji text,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.school_notices enable row level security;
drop policy if exists "Allow all public access" on public.school_notices;
create policy "Allow all public access" on public.school_notices for all using (true) with check (true);

-- C: CREATE - Add a new notice
-- INSERT INTO public.school_notices (date, title, description, icon_emoji, display_order, is_active)
-- VALUES ('Baisakh 10, 2083', 'SEE Examination Results Published', 'We are proud to announce that 98% of our students have passed...', '🎓', 1, true);

-- R: READ - Get all active notices ordered by display_order
-- SELECT * FROM public.school_notices WHERE is_active = true ORDER BY display_order ASC;

-- R: READ - Get a specific notice by ID
-- SELECT * FROM public.school_notices WHERE id = 1;

-- U: UPDATE - Update notice details
-- UPDATE public.school_notices 
-- SET title = 'Updated Title', description = 'Updated Description...', updated_at = now()
-- WHERE id = 1;

-- D: DELETE - Remove a notice
-- DELETE FROM public.school_notices WHERE id = 1;
