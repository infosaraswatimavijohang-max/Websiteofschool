-- =====================================================================================
-- HERO VIDEO CMS SETUP SCRIPT
-- Run this in your Supabase SQL Editor to enable hero video management.
-- =====================================================================================

-- 1. Create the website_hero_video table
CREATE TABLE IF NOT EXISTS public.website_hero_video (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    video_url TEXT NOT NULL,
    video_type TEXT DEFAULT 'youtube' CHECK (video_type IN ('youtube', 'upload')),
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- For users who already ran the old script, run these alters:
ALTER TABLE public.website_hero_video ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.website_hero_video ADD COLUMN IF NOT EXISTS video_type TEXT DEFAULT 'youtube';
-- Try to migrate data if youtube_embed_url exists
DO $$ 
BEGIN
  IF EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='website_hero_video' and column_name='youtube_embed_url')
  THEN
      EXECUTE 'UPDATE public.website_hero_video SET video_url = youtube_embed_url WHERE video_url IS NULL;';
      EXECUTE 'ALTER TABLE public.website_hero_video DROP COLUMN youtube_embed_url;';
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.website_hero_video ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS Policies
-- Allow public read access to active videos
DROP POLICY IF EXISTS "Public read access for website_hero_video" ON public.website_hero_video;
CREATE POLICY "Public read access for website_hero_video"
    ON public.website_hero_video FOR SELECT
    USING (status = 'Active' OR auth.role() = 'authenticated');

-- Allow authenticated users full CRUD operations
DROP POLICY IF EXISTS "Auth users full access for website_hero_video" ON public.website_hero_video;
CREATE POLICY "Auth users full access for website_hero_video"
    ON public.website_hero_video FOR ALL
    USING (auth.role() = 'authenticated');

-- 3. Storage Bucket Setup: hero-videos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('hero-videos', 'hero-videos', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage RLS Policies
DROP POLICY IF EXISTS "Public read hero-videos" ON storage.objects;
CREATE POLICY "Public read hero-videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'hero-videos');

DROP POLICY IF EXISTS "Auth insert hero-videos" ON storage.objects;
CREATE POLICY "Auth insert hero-videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'hero-videos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth update hero-videos" ON storage.objects;
CREATE POLICY "Auth update hero-videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'hero-videos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth delete hero-videos" ON storage.objects;
CREATE POLICY "Auth delete hero-videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'hero-videos' AND auth.role() = 'authenticated');
