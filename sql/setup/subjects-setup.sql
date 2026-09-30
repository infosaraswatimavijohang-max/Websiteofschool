-- ====================================================================
-- SUBJECT SETUP & DYNAMIC MANAGEMENT SQL SCHEMA
-- Shree Saraswati Secondary School
-- ====================================================================

-- Run this on your Supabase Database (DB1)
-- URL: https://ohczlooperjqpyllmabo.supabase.co

-- ════════════════════════════════════════════════════════════════════
-- PART 1: CREATE SUBJECTS TABLE
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.subjects (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subject_name TEXT NOT NULL,           -- e.g., "Compulsory Mathematics"
  subject_code TEXT UNIQUE NOT NULL,    -- e.g., "MATH-10"
  subject_type TEXT NOT NULL,           -- "Theory Only", "Practical Only", "Both Theory & Practical"
  credit_hour NUMERIC,                  -- e.g., 4
  category TEXT NOT NULL,               -- e.g., "Secondary", "Primary", "High School"
  status TEXT NOT NULL DEFAULT 'Active', -- "Active" or "Inactive"
  created_by TEXT,                      -- optional email reference
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Quick patch if the table already exists
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS credit_hour NUMERIC;

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_subjects_status ON public.subjects(status);
CREATE INDEX IF NOT EXISTS idx_subjects_category ON public.subjects(category);
CREATE INDEX IF NOT EXISTS idx_subjects_code ON public.subjects(subject_code);

-- ════════════════════════════════════════════════════════════════════
-- PART 2: AUTO-UPDATE TIMESTAMP TRIGGER
-- ════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_subjects_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_subjects_timestamp ON public.subjects;
CREATE TRIGGER trigger_update_subjects_timestamp
  BEFORE UPDATE ON public.subjects
  FOR EACH ROW
  EXECUTE FUNCTION update_subjects_timestamp();

-- ════════════════════════════════════════════════════════════════════
-- PART 3: ROW LEVEL SECURITY (RLS) POLICIES
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all public access" ON public.subjects;
CREATE POLICY "Allow all public access"
  ON public.subjects FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- ════════════════════════════════════════════════════════════════════
-- PART 4: SAMPLE DATA
-- ════════════════════════════════════════════════════════════════════

INSERT INTO public.subjects (subject_name, subject_code, subject_type, category, status)
VALUES
  ('Compulsory Mathematics', 'MATH-10', 'Theory Only', 'Secondary', 'Active'),
  ('Science & Technology', 'SCI-10', 'Both Theory & Practical', 'Secondary', 'Active'),
  ('English Grammar', 'ENG-08', 'Theory Only', 'Lower Secondary', 'Active'),
  ('Basic Social Studies', 'SOC-05', 'Theory Only', 'Primary', 'Active'),
  ('Physics Theory', 'PHY-11', 'Theory Only', 'Higher Secondary', 'Active'),
  ('Computer Network Labs', 'ICT-12', 'Both Theory & Practical', 'Higher Secondary', 'Active')
ON CONFLICT (subject_code) DO NOTHING;
