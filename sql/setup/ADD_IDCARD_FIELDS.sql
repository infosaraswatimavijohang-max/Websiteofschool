-- ====================================================================
-- ADD ID CARD FIELDS: Father's Name, Mother's Name, Address, School Email
-- Run this in your Supabase SQL Editor
-- ====================================================================

-- Add mother_name column (may already exist from initial setup)
ALTER TABLE public.student_profiles 
ADD COLUMN IF NOT EXISTS mother_name text;

-- Add address column (may already exist from initial setup)
ALTER TABLE public.student_profiles 
ADD COLUMN IF NOT EXISTS address text;

-- Add school_email column (new field)
ALTER TABLE public.student_profiles 
ADD COLUMN IF NOT EXISTS school_email text;

-- Verify the columns were added successfully
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'student_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
