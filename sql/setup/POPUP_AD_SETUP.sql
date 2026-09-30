-- ─ TABLE 0: POPUP ADVERTISEMENT ─
CREATE TABLE IF NOT EXISTS public.popup_ads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    redirect_url TEXT,
    status TEXT DEFAULT 'Active', -- 'Active' or 'Inactive'
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ─ RLS POLICIES FOR POPUP ADS ─
ALTER TABLE public.popup_ads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active popup ads" ON public.popup_ads;
CREATE POLICY "Public can view active popup ads" 
ON public.popup_ads FOR SELECT 
USING (status = 'Active');

DROP POLICY IF EXISTS "Admin full access popup ads" ON public.popup_ads;
CREATE POLICY "Admin full access popup ads" 
ON public.popup_ads FOR ALL 
USING (auth.role() = 'authenticated');

-- ─ STORAGE BUCKET FOR POPUP ADS ─
INSERT INTO storage.buckets (id, name, public) 
VALUES ('popup_ads_bucket', 'popup_ads_bucket', true)
ON CONFLICT (id) DO NOTHING;

-- ─ RLS POLICIES FOR BUCKET ─
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'popup_ads_bucket');

DROP POLICY IF EXISTS "Authenticated Uploads" ON storage.objects;
CREATE POLICY "Authenticated Uploads"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'popup_ads_bucket' 
    AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Authenticated Updates" ON storage.objects;
CREATE POLICY "Authenticated Updates"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'popup_ads_bucket' 
    AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Authenticated Deletes" ON storage.objects;
CREATE POLICY "Authenticated Deletes"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'popup_ads_bucket' 
    AND auth.role() = 'authenticated'
);
