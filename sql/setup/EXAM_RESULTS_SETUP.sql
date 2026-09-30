-- ====================================================================
-- EXAM RESULTS MANAGEMENT SYSTEM
-- Terminal Exam Results with Theory/Practical Support
-- ====================================================================

-- ====================================================================
-- 1. EXAM RESULT SESSIONS (For organizing exam periods)
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

CREATE INDEX IF NOT EXISTS idx_exam_sessions_status ON public.exam_sessions(status);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_terminal ON public.exam_sessions(terminal_number);

-- ====================================================================
-- 2. EXAM CONFIGURATIONS (Settings for specific exam)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.exam_configurations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  exam_session_id BIGINT NOT NULL,
  subject TEXT NOT NULL,
  class TEXT NOT NULL,
  exam_type TEXT NOT NULL CHECK (exam_type IN ('Theory Only', 'Practical Only', 'Theory + Practical')),
  full_marks INTEGER NOT NULL,
  pass_marks INTEGER NOT NULL,
  teacher_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  FOREIGN KEY (exam_session_id) REFERENCES public.exam_sessions(id) ON DELETE CASCADE,
  UNIQUE(exam_session_id, subject, class, exam_type)
);

CREATE INDEX IF NOT EXISTS idx_exam_config_session ON public.exam_configurations(exam_session_id);
CREATE INDEX IF NOT EXISTS idx_exam_config_class ON public.exam_configurations(class);
CREATE INDEX IF NOT EXISTS idx_exam_config_subject ON public.exam_configurations(subject);

-- ====================================================================
-- 3. EXAM RESULTS (Individual student marks)
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
  result_status TEXT DEFAULT 'Pass' CHECK (result_status IN ('Pass', 'Fail', 'Pending')),
  percentage NUMERIC(5,2),
  grade TEXT,
  submitted_by TEXT,
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  approval_status TEXT DEFAULT 'Pending' CHECK (approval_status IN ('Pending', 'Approved', 'Rejected')),
  approval_by TEXT,
  approval_date TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  FOREIGN KEY (exam_config_id) REFERENCES public.exam_configurations(id) ON DELETE CASCADE,
  FOREIGN KEY (student_roll) REFERENCES public.students_registry(roll) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_exam_results_config ON public.exam_results(exam_config_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_student_roll ON public.exam_results(student_roll);
CREATE INDEX IF NOT EXISTS idx_exam_results_approval ON public.exam_results(approval_status);
CREATE INDEX IF NOT EXISTS idx_exam_results_date ON public.exam_results(submission_date);

-- ====================================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS) FOR ACCESS CONTROL
-- ====================================================================
ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

-- Allow all public access (modify based on your auth requirements)
DROP POLICY IF EXISTS "Allow all public access" ON public.exam_sessions;
CREATE POLICY "Allow all public access" ON public.exam_sessions FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Allow all public access" ON public.exam_configurations;
CREATE POLICY "Allow all public access" ON public.exam_configurations FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Allow all public access" ON public.exam_results;
CREATE POLICY "Allow all public access" ON public.exam_results FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- ====================================================================
-- 5. SAMPLE DATA (Sample exam configuration for testing)
-- ====================================================================

-- Insert a sample exam session
INSERT INTO public.exam_sessions (session_name, terminal_number, academic_year, start_date, end_date, status, notes)
VALUES 
  ('Terminal 1 Examination', 1, '2083-2084', '2083-11-01', '2083-11-15', 'Completed', 'First terminal examination'),
  ('Terminal 2 Examination', 2, '2083-2084', '2084-02-01', '2084-02-15', 'Active', 'Second terminal examination')
ON CONFLICT DO NOTHING;

-- ====================================================================
-- 6. HELPER FUNCTION TO CALCULATE GRADE (Optional)
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
-- 7. QUERY EXAMPLES FOR DIFFERENT VIEWS
-- ====================================================================

-- Admin View: All exam results with approval status
-- SELECT 
--   es.session_name,
--   ec.subject,
--   ec.class,
--   ec.exam_type,
--   COUNT(er.id) as total_submissions,
--   SUM(CASE WHEN er.approval_status = 'Approved' THEN 1 ELSE 0 END) as approved_count,
--   SUM(CASE WHEN er.approval_status = 'Pending' THEN 1 ELSE 0 END) as pending_count
-- FROM exam_sessions es
-- JOIN exam_configurations ec ON es.id = ec.exam_session_id
-- LEFT JOIN exam_results er ON ec.id = er.exam_config_id
-- GROUP BY es.id, ec.id, es.session_name, ec.subject, ec.class, ec.exam_type
-- ORDER BY es.terminal_number DESC, ec.subject;

-- Teacher View: Load students for a specific class
-- SELECT DISTINCT 
--   sr.roll,
--   sr.name,
--   sr.class
-- FROM students_registry sr
-- WHERE sr.class = $1 AND sr.status = 'Active'
-- ORDER BY sr.roll;

-- Student View: Get their exam results
-- SELECT 
--   es.session_name,
--   ec.subject,
--   ec.exam_type,
--   ec.full_marks,
--   er.theory_marks,
--   er.practical_marks,
--   er.total_marks,
--   er.percentage,
--   er.grade,
--   er.result_status
-- FROM exam_results er
-- JOIN exam_configurations ec ON er.exam_config_id = ec.id
-- JOIN exam_sessions es ON ec.exam_session_id = es.id
-- WHERE er.student_roll = $1 AND er.approval_status = 'Approved'
-- ORDER BY es.terminal_number DESC, ec.subject;
