-- Add image_url to school_notices for the CMS module
alter table public.school_notices add column if not exists image_url text;
