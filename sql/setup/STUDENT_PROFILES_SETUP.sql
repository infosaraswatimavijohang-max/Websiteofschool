-- ====================================================================
-- STUDENT PROFILES SETUP
-- Run this in your Supabase SQL Editor
-- ====================================================================

-- Create student_profiles table to store additional info for ID cards
CREATE TABLE IF NOT EXISTS public.student_profiles (
  id bigint generated always as identity primary key,
  student_roll integer unique not null,
  section text,
  dob text,
  father_name text,
  mother_name text,
  contact text,
  photo_url text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  foreign key (student_roll) references public.students_registry(roll) on delete cascade
);

-- Enable Row Level Security
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (adjust for production as needed)
DROP POLICY IF EXISTS "Allow all public access" ON public.student_profiles;
CREATE POLICY "Allow all public access" ON public.student_profiles FOR ALL USING (true) WITH CHECK (true);

-- Also ensure 'media' bucket exists in storage (already created in setup.sql, just a safe check)
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;
