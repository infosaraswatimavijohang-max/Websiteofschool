-- ====================================================================
-- NOTICES BUCKET & SCHEMA UPDATE
-- Add image capabilities to school announcements
-- ====================================================================

-- Add image_url to school_announcements (Primary Database)
alter table public.school_announcements add column if not exists image_url text;

-- Create the notices bucket (Media Database)
insert into storage.buckets (id, name, public)
values ('notices', 'notices', true)
on conflict (id) do nothing;

drop policy if exists "Allow public read notices" on storage.objects;
create policy "Allow public read notices" on storage.objects for select using (bucket_id = 'notices');
drop policy if exists "Allow public insert notices" on storage.objects;
create policy "Allow public insert notices" on storage.objects for insert with check (bucket_id = 'notices');
drop policy if exists "Allow public delete notices" on storage.objects;
create policy "Allow public delete notices" on storage.objects for delete using (bucket_id = 'notices');
