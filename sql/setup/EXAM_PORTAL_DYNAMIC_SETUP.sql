-- ============================================================
-- DYNAMIC EXAM PORTAL SETUP
-- Exam types, mark setup, symbol generation, and public result lookup
-- ============================================================

-- Existing base tables are kept: exam_sessions, exam_configurations, exam_results.
-- This file safely adds missing columns/tables used by the dynamic exam portal.

CREATE TABLE IF NOT EXISTS public.exam_types (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type_name TEXT NOT NULL UNIQUE,
  type_code TEXT UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE IF EXISTS public.exam_configurations
  ADD COLUMN IF NOT EXISTS credit_hour NUMERIC(4,2) DEFAULT 4,
  ADD COLUMN IF NOT EXISTS theory_full_marks INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS theory_pass_marks INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS practical_full_marks INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS practical_pass_marks INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS public.exam_symbol_numbers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  exam_session_id BIGINT NOT NULL REFERENCES public.exam_sessions(id) ON DELETE CASCADE,
  class TEXT NOT NULL,
  student_roll INTEGER NOT NULL,
  student_name TEXT NOT NULL,
  date_of_birth DATE,
  symbol_number TEXT NOT NULL,
  generated_order INTEGER NOT NULL DEFAULT 0,
  generated_by TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE(exam_session_id, student_roll),
  UNIQUE(exam_session_id, symbol_number)
);

CREATE INDEX IF NOT EXISTS idx_exam_types_active ON public.exam_types(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_exam_symbol_lookup ON public.exam_symbol_numbers(symbol_number, date_of_birth, is_active);
CREATE INDEX IF NOT EXISTS idx_exam_symbol_class ON public.exam_symbol_numbers(exam_session_id, class, generated_order);
CREATE INDEX IF NOT EXISTS idx_exam_results_symbol ON public.exam_results(student_symbol);

ALTER TABLE public.exam_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_symbol_numbers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all public access - exam_types" ON public.exam_types;
CREATE POLICY "Allow all public access - exam_types" ON public.exam_types FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Allow all public access - exam_symbol_numbers" ON public.exam_symbol_numbers;
CREATE POLICY "Allow all public access - exam_symbol_numbers" ON public.exam_symbol_numbers FOR ALL USING (TRUE) WITH CHECK (TRUE);

INSERT INTO public.exam_types (type_name, type_code, description, display_order)
VALUES
  ('First Term', 'FT', 'First terminal examination', 1),
  ('Mid Term', 'MT', 'Mid-term examination', 2),
  ('Final Term', 'FN', 'Final terminal examination', 3),
  ('Class Test', 'CT', 'Regular class test', 4),
  ('CAS', 'CAS', 'Continuous assessment system', 5)
ON CONFLICT (type_name) DO NOTHING;

-- Helpful public lookup query:
-- 1. Validate the student:
-- SELECT * FROM public.exam_symbol_numbers
-- WHERE upper(symbol_number) = upper(:symbol_number)
--   AND date_of_birth = :date_of_birth
--   AND is_active = TRUE
-- LIMIT 1;
--
-- 2. Load approved results:
-- SELECT er.*, ec.subject, ec.exam_type, ec.full_marks, ec.pass_marks, ec.credit_hour,
--        es.session_name, es.academic_year, es.terminal_number
-- FROM public.exam_results er
-- JOIN public.exam_configurations ec ON er.exam_config_id = ec.id
-- JOIN public.exam_sessions es ON ec.exam_session_id = es.id
-- WHERE er.student_roll = :student_roll
--   AND er.approval_status = 'Approved'
--   AND es.id = :exam_session_id
-- ORDER BY ec.subject;
