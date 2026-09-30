-- ====================================================================
-- FIX MISSING COLUMNS IN EXAM RESULTS DATABASE
-- Add: pass_marks, full_marks, exam_type, submission_date to proper tables
-- ====================================================================

-- ====================================================================
-- STEP 1: Ensure exam_configurations table has all required columns
-- ====================================================================

-- Add full_marks column if missing
ALTER TABLE IF EXISTS public.exam_configurations 
ADD COLUMN IF NOT EXISTS full_marks INTEGER DEFAULT 100;

-- Add pass_marks column if missing
ALTER TABLE IF EXISTS public.exam_configurations 
ADD COLUMN IF NOT EXISTS pass_marks INTEGER DEFAULT 40;

-- Add exam_type column if missing
ALTER TABLE IF EXISTS public.exam_configurations 
ADD COLUMN IF NOT EXISTS exam_type TEXT DEFAULT 'First Term';

-- Add teacher_code if missing
ALTER TABLE IF EXISTS public.exam_configurations 
ADD COLUMN IF NOT EXISTS teacher_code TEXT;

-- Add submission_date if missing
ALTER TABLE IF EXISTS public.exam_configurations 
ADD COLUMN IF NOT EXISTS submission_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW());

-- ====================================================================
-- STEP 2: Ensure exam_results table has all required columns
-- ====================================================================

-- Add submission_date column if missing
ALTER TABLE IF EXISTS public.exam_results 
ADD COLUMN IF NOT EXISTS submission_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW());

-- Add submitted_by column if missing
ALTER TABLE IF EXISTS public.exam_results 
ADD COLUMN IF NOT EXISTS submitted_by TEXT DEFAULT 'Unknown';

-- Add approval_status column if missing
ALTER TABLE IF EXISTS public.exam_results 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'Pending' 
  CHECK (approval_status IN ('Pending', 'Approved', 'Rejected'));

-- Add approval_by column if missing
ALTER TABLE IF EXISTS public.exam_results 
ADD COLUMN IF NOT EXISTS approval_by TEXT;

-- Add approval_date column if missing
ALTER TABLE IF EXISTS public.exam_results 
ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP WITH TIME ZONE;

-- Add rejection_reason column if missing
ALTER TABLE IF EXISTS public.exam_results 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add grade column if missing
ALTER TABLE IF EXISTS public.exam_results 
ADD COLUMN IF NOT EXISTS grade TEXT;

-- Add percentage column if missing
ALTER TABLE IF EXISTS public.exam_results 
ADD COLUMN IF NOT EXISTS percentage NUMERIC(5,2);

-- Add result_status column if missing
ALTER TABLE IF EXISTS public.exam_results 
ADD COLUMN IF NOT EXISTS result_status TEXT DEFAULT 'Pending' 
  CHECK (result_status IN ('Pass', 'Fail', 'Pending'));

-- ====================================================================
-- STEP 3: Create exam_sessions table if it doesn't exist
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.exam_sessions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_name TEXT NOT NULL,
  terminal_number INT NOT NULL,
  academic_year TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Scheduled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE(terminal_number, academic_year)
);

-- ====================================================================
-- STEP 4: Create exam_configurations table if it doesn't exist
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.exam_configurations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  exam_session_id BIGINT NOT NULL,
  subject TEXT NOT NULL,
  class TEXT NOT NULL,
  exam_type TEXT NOT NULL DEFAULT 'First Term',
  full_marks INTEGER NOT NULL DEFAULT 100,
  pass_marks INTEGER NOT NULL DEFAULT 40,
  teacher_code TEXT,
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  FOREIGN KEY (exam_session_id) REFERENCES public.exam_sessions(id) ON DELETE CASCADE,
  UNIQUE(exam_session_id, subject, class, exam_type)
);

-- ====================================================================
-- STEP 5: Create exam_results table if it doesn't exist
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.exam_results (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  exam_config_id BIGINT NOT NULL,
  student_roll INTEGER NOT NULL,
  student_symbol TEXT,
  student_name TEXT NOT NULL,
  theory_marks INTEGER,
  practical_marks INTEGER,
  total_marks INTEGER NOT NULL,
  result_status TEXT DEFAULT 'Pending' CHECK (result_status IN ('Pass', 'Fail', 'Pending')),
  percentage NUMERIC(5,2),
  grade TEXT,
  submitted_by TEXT DEFAULT 'Unknown',
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  approval_status TEXT DEFAULT 'Pending' CHECK (approval_status IN ('Pending', 'Approved', 'Rejected')),
  approval_by TEXT,
  approval_date TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  FOREIGN KEY (exam_config_id) REFERENCES public.exam_configurations(id) ON DELETE CASCADE
);

-- ====================================================================
-- STEP 6: Create Indexes for Better Performance
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_exam_sessions_status ON public.exam_sessions(status);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_terminal ON public.exam_sessions(terminal_number);
CREATE INDEX IF NOT EXISTS idx_exam_config_session ON public.exam_configurations(exam_session_id);
CREATE INDEX IF NOT EXISTS idx_exam_config_class ON public.exam_configurations(class);
CREATE INDEX IF NOT EXISTS idx_exam_config_subject ON public.exam_configurations(subject);
CREATE INDEX IF NOT EXISTS idx_exam_results_config ON public.exam_results(exam_config_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_student_roll ON public.exam_results(student_roll);
CREATE INDEX IF NOT EXISTS idx_exam_results_approval ON public.exam_results(approval_status);
CREATE INDEX IF NOT EXISTS idx_exam_results_date ON public.exam_results(submission_date);

-- ====================================================================
-- STEP 7: Enable Row Level Security (RLS)
-- ====================================================================

ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Allow all public access - exam_sessions" ON public.exam_sessions;
DROP POLICY IF EXISTS "Allow all public access - exam_configurations" ON public.exam_configurations;
DROP POLICY IF EXISTS "Allow all public access - exam_results" ON public.exam_results;

-- Create policies for public access (modify based on your auth requirements)
CREATE POLICY "Allow all public access - exam_sessions" ON public.exam_sessions FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow all public access - exam_configurations" ON public.exam_configurations FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow all public access - exam_results" ON public.exam_results FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- ====================================================================
-- STEP 8: Create Helper Function to Calculate Grade
-- ====================================================================

CREATE OR REPLACE FUNCTION calculate_grade(percentage NUMERIC)
RETURNS TEXT AS $$
BEGIN
  IF percentage >= 90 THEN RETURN 'A+';
  ELSIF percentage >= 80 THEN RETURN 'A';
  ELSIF percentage >= 70 THEN RETURN 'B+';
  ELSIF percentage >= 60 THEN RETURN 'B';
  ELSIF percentage >= 50 THEN RETURN 'C';
  ELSIF percentage >= 40 THEN RETURN 'D';
  ELSE RETURN 'F';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- STEP 9: Insert Sample Data (Test Data)
-- ====================================================================

-- Insert exam sessions if they don't exist
INSERT INTO public.exam_sessions (session_name, terminal_number, academic_year, start_date, end_date, status, notes)
VALUES 
  ('Terminal 1 Examination', 1, '2083-2084', '2083-11-01', '2083-11-15', 'Active', 'First terminal examination'),
  ('Terminal 2 Examination', 2, '2083-2084', '2084-02-01', '2084-02-15', 'Active', 'Second terminal examination'),
  ('Final Term Examination', 3, '2083-2084', '2084-05-01', '2084-05-15', 'Scheduled', 'Final term examination')
ON CONFLICT DO NOTHING;

-- ====================================================================
-- STEP 10: Useful Queries for Admin Panel
-- ====================================================================

-- Query to fetch all submitted results with student details
/*
SELECT 
  es.session_name,
  ec.subject,
  ec.class,
  ec.exam_type,
  ec.full_marks,
  ec.pass_marks,
  COUNT(er.id) as total_submissions,
  SUM(CASE WHEN er.approval_status = 'Approved' THEN 1 ELSE 0 END) as approved_count,
  SUM(CASE WHEN er.approval_status = 'Pending' THEN 1 ELSE 0 END) as pending_count,
  MAX(er.submission_date) as latest_submission
FROM exam_sessions es
LEFT JOIN exam_configurations ec ON es.id = ec.exam_session_id
LEFT JOIN exam_results er ON ec.id = er.exam_config_id
GROUP BY es.id, es.session_name, ec.id, ec.subject, ec.class, ec.exam_type, ec.full_marks, ec.pass_marks
ORDER BY es.terminal_number DESC, ec.subject;
*/

-- Query to fetch individual student results with status
/*
SELECT 
  es.session_name,
  ec.subject,
  ec.class,
  ec.exam_type,
  ec.full_marks,
  ec.pass_marks,
  er.student_roll,
  er.student_name,
  er.theory_marks,
  er.practical_marks,
  er.total_marks,
  er.percentage,
  er.grade,
  er.result_status,
  er.approval_status,
  er.submission_date,
  er.submitted_by
FROM exam_sessions es
JOIN exam_configurations ec ON es.id = ec.exam_session_id
JOIN exam_results er ON ec.id = er.exam_config_id
ORDER BY es.terminal_number DESC, ec.subject, er.student_roll;
*/

-- ====================================================================
-- SUCCESS MESSAGE
-- ====================================================================
-- All required columns have been added/verified.
-- The database structure is now ready to store:
--   - Full Marks
--   - Pass Marks  
--   - Exam Type
--   - Submission Date
--   - And all other required exam result data
-- ====================================================================
