-- Add academic_year to exam_configurations
ALTER TABLE public.exam_configurations ADD COLUMN IF NOT EXISTS academic_year TEXT;

-- Update existing records to have a default academic year (e.g., '2082') if they don't have one
UPDATE public.exam_configurations SET academic_year = '2082' WHERE academic_year IS NULL;

-- Optionally add academic_year to exam_results for even more direct filtering
ALTER TABLE public.exam_results ADD COLUMN IF NOT EXISTS academic_year TEXT;
UPDATE public.exam_results SET academic_year = '2082' WHERE academic_year IS NULL;

-- Add academic_year to submitted_results to fix the teacher portal 400 error
ALTER TABLE public.submitted_results ADD COLUMN IF NOT EXISTS academic_year TEXT;
UPDATE public.submitted_results SET academic_year = '2082' WHERE academic_year IS NULL;
