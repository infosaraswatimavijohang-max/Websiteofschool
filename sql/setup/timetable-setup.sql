-- ====================================================================
-- CLASS TIMETABLE SETUP & DYNAMIC MANAGEMENT SQL SCHEMA
-- Shree Saraswati Secondary School
-- ====================================================================

-- Run this on your Supabase Database (DB1)
-- URL: https://ohczlooperjqpyllmabo.supabase.co

-- ════════════════════════════════════════════════════════════════════
-- PART 1: CREATE CLASS TIMETABLE TABLE
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.class_timetable (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  class_id BIGINT NOT NULL,                      -- Reference to classes table
  grade_level TEXT NOT NULL,                     -- e.g., "Grade 10" (Denormalized)
  section_name TEXT,                             -- e.g., "Section A" (Denormalized)
  subject_id BIGINT NOT NULL,                    -- Reference to subjects table
  subject_name TEXT NOT NULL,                    -- Subject name (Denormalized)
  teacher_code TEXT NOT NULL,                    -- Reference to teachers_registry code
  teacher_name TEXT NOT NULL,                    -- Teacher name (Denormalized)
  day_of_week TEXT NOT NULL,                     -- "Monday", "Tuesday", etc.
  start_time TIME NOT NULL,                      -- e.g., "10:15"
  end_time TIME NOT NULL,                        -- e.g., "11:00"
  classroom_number TEXT,                         -- Optional: Room number
  remarks TEXT,                                  -- Optional: Additional remarks
  status TEXT NOT NULL DEFAULT 'Active',         -- "Active" or "Inactive"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Foreign key constraints
  CONSTRAINT fk_class FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE,
  CONSTRAINT fk_subject FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE,
  
  -- Unique constraint: No duplicate time slots for same class
  UNIQUE(class_id, day_of_week, start_time)
);

-- ════════════════════════════════════════════════════════════════════
-- PART 2: CREATE INDEXES FOR PERFORMANCE
-- ════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_timetable_class ON public.class_timetable(class_id);
CREATE INDEX IF NOT EXISTS idx_timetable_subject ON public.class_timetable(subject_id);
CREATE INDEX IF NOT EXISTS idx_timetable_teacher ON public.class_timetable(teacher_code);
CREATE INDEX IF NOT EXISTS idx_timetable_day ON public.class_timetable(day_of_week);
CREATE INDEX IF NOT EXISTS idx_timetable_status ON public.class_timetable(status);
CREATE INDEX IF NOT EXISTS idx_timetable_grade_section ON public.class_timetable(grade_level, section_name);

-- ════════════════════════════════════════════════════════════════════
-- PART 3: AUTO-UPDATE TIMESTAMP TRIGGER
-- ════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_timetable_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_timetable_timestamp ON public.class_timetable;
CREATE TRIGGER trigger_update_timetable_timestamp
  BEFORE UPDATE ON public.class_timetable
  FOR EACH ROW
  EXECUTE FUNCTION update_timetable_timestamp();

-- ════════════════════════════════════════════════════════════════════
-- PART 4: ROW LEVEL SECURITY (RLS) POLICIES
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE public.class_timetable ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow reading timetable" ON public.class_timetable;
CREATE POLICY "Allow reading timetable"
  ON public.class_timetable FOR SELECT
  TO authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "Allow admins to insert timetable" ON public.class_timetable;
CREATE POLICY "Allow admins to insert timetable"
  ON public.class_timetable FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Allow admins to update timetable" ON public.class_timetable;
CREATE POLICY "Allow admins to update timetable"
  ON public.class_timetable FOR UPDATE
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Allow admins to delete timetable" ON public.class_timetable;
CREATE POLICY "Allow admins to delete timetable"
  ON public.class_timetable FOR DELETE
  TO authenticated
  USING (TRUE);

-- ════════════════════════════════════════════════════════════════════
-- PART 5: CREATE TEACHER ASSIGNMENT VIEWS
-- ════════════════════════════════════════════════════════════════════

-- View: Teacher assigned subjects for portal display
CREATE OR REPLACE VIEW public.teacher_assigned_subjects AS
SELECT DISTINCT
  ct.teacher_code,
  ct.teacher_name,
  ct.subject_id,
  ct.subject_name,
  ct.grade_level,
  ct.section_name,
  COUNT(DISTINCT ct.id) as total_classes,
  STRING_AGG(DISTINCT ct.day_of_week, ', ' ORDER BY ct.day_of_week) as days_assigned
FROM public.class_timetable ct
WHERE ct.status = 'Active'
GROUP BY ct.teacher_code, ct.teacher_name, ct.subject_id, ct.subject_name, ct.grade_level, ct.section_name
ORDER BY ct.teacher_name, ct.subject_name;

-- View: Complete timetable for display
CREATE OR REPLACE VIEW public.timetable_view AS
SELECT
  ct.id,
  ct.class_id,
  ct.grade_level,
  ct.section_name,
  ct.subject_id,
  ct.subject_name,
  ct.teacher_code,
  ct.teacher_name,
  ct.day_of_week,
  ct.start_time,
  ct.end_time,
  ct.classroom_number,
  ct.remarks,
  ct.status,
  ct.created_at,
  ct.updated_at
FROM public.class_timetable ct
WHERE ct.status = 'Active'
ORDER BY ct.grade_level, ct.section_name, CASE 
  WHEN ct.day_of_week = 'Monday' THEN 1
  WHEN ct.day_of_week = 'Tuesday' THEN 2
  WHEN ct.day_of_week = 'Wednesday' THEN 3
  WHEN ct.day_of_week = 'Thursday' THEN 4
  WHEN ct.day_of_week = 'Friday' THEN 5
  WHEN ct.day_of_week = 'Saturday' THEN 6
  ELSE 7
END, ct.start_time;

-- ════════════════════════════════════════════════════════════════════
-- PART 6: SAMPLE DATA (OPTIONAL)
-- ════════════════════════════════════════════════════════════════════

-- Note: Update these with actual IDs from your classes and subjects tables
-- First, get the actual IDs:
-- SELECT id FROM public.classes WHERE grade_level = 'Grade 10' AND section_name = 'Section A' LIMIT 1;
-- SELECT id FROM public.subjects WHERE subject_code = 'MATH-10' LIMIT 1;

-- Insert sample timetable entries (adjust IDs as needed)
-- Example data - uncomment and modify with actual IDs from your database
/*
INSERT INTO public.class_timetable 
  (class_id, grade_level, section_name, subject_id, subject_name, teacher_code, teacher_name, 
   day_of_week, start_time, end_time, classroom_number, status)
VALUES
  (1, 'Grade 10', 'Section A', 1, 'Compulsory Mathematics', 'T001', 'Mr. Sharma', 
   'Monday', '10:15', '11:00', '101', 'Active'),
  (1, 'Grade 10', 'Section A', 2, 'Science & Technology', 'T002', 'Mrs. Paudel', 
   'Monday', '11:00', '12:00', '102', 'Active'),
  (1, 'Grade 10', 'Section A', 3, 'English Grammar', 'T003', 'Mr. Karki', 
   'Tuesday', '10:15', '11:00', '103', 'Active'),
  (1, 'Grade 10', 'Section A', 1, 'Compulsory Mathematics', 'T001', 'Mr. Sharma', 
   'Wednesday', '10:15', '11:00', '101', 'Active')
ON CONFLICT (class_id, day_of_week, start_time) DO NOTHING;
*/

-- ════════════════════════════════════════════════════════════════════
-- PART 7: QUERY EXAMPLES FOR REFERENCE
-- ════════════════════════════════════════════════════════════════════

-- Get timetable for a specific class
-- SELECT * FROM public.timetable_view 
-- WHERE grade_level = 'Grade 10' AND section_name = 'Section A'
-- ORDER BY day_of_week, start_time;

-- Get all classes and subjects for a teacher
-- SELECT * FROM public.teacher_assigned_subjects
-- WHERE teacher_code = 'T001';

-- Get timetable for a specific day
-- SELECT * FROM public.timetable_view
-- WHERE day_of_week = 'Monday'
-- ORDER BY start_time;

-- Get conflicting time slots (same teacher, same time)
-- SELECT 
--   teacher_code, day_of_week, start_time, 
--   COUNT(*) as count,
--   STRING_AGG(subject_name || ' (' || grade_level || '-' || section_name || ')', ', ') as classes
-- FROM public.class_timetable
-- WHERE status = 'Active'
-- GROUP BY teacher_code, day_of_week, start_time
-- HAVING COUNT(*) > 1;

-- ════════════════════════════════════════════════════════════════════
-- END OF TIMETABLE SETUP SCHEMA
-- ════════════════════════════════════════════════════════════════════
