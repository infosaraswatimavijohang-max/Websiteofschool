-- =====================================================================================
-- SERVICE AND FACILITIES CMS SETUP SCRIPT
-- Run this in your Supabase SQL Editor to enable dynamic services and facilities management.
-- =====================================================================================

-- 1. Create the appcms_service_facilities table
CREATE TABLE IF NOT EXISTS public.appcms_service_facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL,
    short_description TEXT NOT NULL,
    icon_class TEXT NOT NULL,
    status TEXT DEFAULT 'Published' CHECK (status IN ('Published', 'Draft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.appcms_service_facilities ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS Policies
-- Allow public read access to active services
DROP POLICY IF EXISTS "Public read access for appcms_service_facilities" ON public.appcms_service_facilities;
CREATE POLICY "Public read access for appcms_service_facilities"
    ON public.appcms_service_facilities FOR SELECT
    USING (status = 'Published' OR auth.role() = 'authenticated');

-- Allow authenticated users full CRUD operations
DROP POLICY IF EXISTS "Auth users full access for appcms_service_facilities" ON public.appcms_service_facilities;
CREATE POLICY "Auth users full access for appcms_service_facilities"
    ON public.appcms_service_facilities FOR ALL
    USING (auth.role() = 'authenticated');
