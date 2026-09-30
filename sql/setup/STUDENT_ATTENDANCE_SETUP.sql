-- ========================================================
-- STUDENT DAILY ATTENDANCE DATABASE SCHEMA SETUP
-- ========================================================
-- Run this script in the Supabase SQL Editor to create the 
-- student_attendance table required for manual daily checklist attendance.

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.student_attendance (
    id SERIAL PRIMARY KEY,
    student_roll INT NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    class_name VARCHAR(100) NOT NULL,
    attendance_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'present' or 'absent'
    remarks VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE (student_roll, attendance_date)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for public client-side access
CREATE POLICY "Allow public read access to student_attendance" 
ON public.student_attendance FOR SELECT USING (true);

CREATE POLICY "Allow public insert to student_attendance" 
ON public.student_attendance FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to student_attendance" 
ON public.student_attendance FOR UPDATE USING (true);

CREATE POLICY "Allow public delete to student_attendance" 
ON public.student_attendance FOR DELETE USING (true);

-- Done!
