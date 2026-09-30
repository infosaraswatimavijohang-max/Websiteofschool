-- ========================================================
-- EMPLOYEE/TEACHER DAILY ATTENDANCE DATABASE SCHEMA SETUP
-- ========================================================
-- Run this script in the Supabase SQL Editor to create the 
-- employee_attendance table required for manual daily checklist attendance.

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.employee_attendance (
    id SERIAL PRIMARY KEY,
    employee_code VARCHAR(100) NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    attendance_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'present' or 'absent'
    remarks VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE (employee_code, attendance_date)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.employee_attendance ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for public client-side access
CREATE POLICY "Allow public read access to employee_attendance" 
ON public.employee_attendance FOR SELECT USING (true);

CREATE POLICY "Allow public insert to employee_attendance" 
ON public.employee_attendance FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to employee_attendance" 
ON public.employee_attendance FOR UPDATE USING (true);

CREATE POLICY "Allow public delete to employee_attendance" 
ON public.employee_attendance FOR DELETE USING (true);

-- Done!
