-- ============================================================================
-- SQL Schema Extension: Extended Faculty Management
-- Location: public.teacher_profiles
-- Bucket: media (folder path: teachers/)
-- ============================================================================

-- 1. Alter teacher_profiles to add joined_date column if it doesn't exist
ALTER TABLE public.teacher_profiles 
ADD COLUMN IF NOT EXISTS joined_date DATE;

-- 2. Ensure RLS is enabled and set policy to allow public reads and writes for sync
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all public access" ON public.teacher_profiles;

CREATE POLICY "Allow all public access" ON public.teacher_profiles 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 3. Ensure teachers_registry has RLS allowed as well
ALTER TABLE public.teachers_registry ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all public access" ON public.teachers_registry;

CREATE POLICY "Allow all public access" ON public.teachers_registry 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 4. Ensure teacher_credentials has RLS allowed as well
ALTER TABLE public.teacher_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all public access" ON public.teacher_credentials;

CREATE POLICY "Allow all public access" ON public.teacher_credentials 
FOR ALL 
USING (true) 
WITH CHECK (true);
