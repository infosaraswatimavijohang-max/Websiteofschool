-- =====================================================================================
-- HERO SLIDER CMS SETUP SCRIPT
-- =====================================================================================

-- 1. Create the website_hero_slider table
CREATE TABLE IF NOT EXISTS public.website_hero_slider (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    caption TEXT,
    image_url TEXT NOT NULL,
    status TEXT DEFAULT 'Published' CHECK (status IN ('Published', 'Draft')),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.website_hero_slider ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS Policies for the table
-- Allow public read access to all published sliders
CREATE POLICY "Public read access for website_hero_slider" 
    ON public.website_hero_slider FOR SELECT 
    USING (status = 'Published' OR auth.role() = 'authenticated');

-- Allow authenticated users full CRUD operations
CREATE POLICY "Auth users full access for website_hero_slider" 
    ON public.website_hero_slider FOR ALL 
    USING (auth.role() = 'authenticated');

-- 3. Storage Bucket Setup: hero-images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('hero-images', 'hero-images', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage RLS Policies
-- Allow public read access to hero-images
CREATE POLICY "Public read hero-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'hero-images');

-- Allow authenticated users to upload to hero-images
CREATE POLICY "Auth insert hero-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'hero-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to update/delete in hero-images
CREATE POLICY "Auth update hero-images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'hero-images' AND auth.role() = 'authenticated');

CREATE POLICY "Auth delete hero-images"
ON storage.objects FOR DELETE
USING (bucket_id = 'hero-images' AND auth.role() = 'authenticated');

-- 5. Insert initial seed data (Optional fallback)
INSERT INTO public.website_hero_slider (title, caption, image_url, display_order, status)
VALUES 
('Nurturing Minds, Shaping Futures', 'A centre of excellence nestled in the beautiful hills of Gulmi, dedicated to holistic education since 2016 B.S.', 'images/img1.png', 1, 'Published'),
('Quality Education For Every Child', 'Committed to providing world-class education with dedicated teachers and modern learning methods.', 'images/img2.png', 2, 'Published')
ON CONFLICT DO NOTHING;
