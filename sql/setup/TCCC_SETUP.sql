-- ==============================================================================
-- 📜 TCCC RECORDS SETUP SCRIPT (TC/CC Module)
-- ==============================================================================

-- 1. Create tccc_records table
CREATE TABLE IF NOT EXISTS public.tccc_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name TEXT NOT NULL,
    certificate_type TEXT NOT NULL,
    issue_date DATE,
    status TEXT DEFAULT 'Pending Approval',
    certificate_file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Enable Row Level Security
ALTER TABLE public.tccc_records ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Allow anyone to read TCCC records (or restrict if needed)
CREATE POLICY "Enable read access for all users" 
ON public.tccc_records FOR SELECT USING (true);

-- Allow authenticated admins to insert/update/delete
CREATE POLICY "Enable insert for authenticated users only" 
ON public.tccc_records FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" 
ON public.tccc_records FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" 
ON public.tccc_records FOR DELETE USING (auth.role() = 'authenticated');

-- ==============================================================================
-- ✅ DONE: You can run this in the Supabase SQL Editor.
-- ==============================================================================
