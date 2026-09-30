-- Supabase Schema for School Management System
-- LocalStorage to Supabase Realtime Sync Strategy

-- Create the master table that will handle ALL legacy localStorage JSON blobs
CREATE TABLE IF NOT EXISTS public.generic_modules (
    id SERIAL PRIMARY KEY,
    module_name VARCHAR(255) UNIQUE NOT NULL,
    json_data TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.generic_modules ENABLE ROW LEVEL SECURITY;

-- Since the application manages authentication internally via teachers_registry/students_registry,
-- and uses the anon key for database interactions, we MUST allow public anon access to this table.
-- WARNING: In a high-security production environment, you should transition to Supabase Auth.
CREATE POLICY "Allow all operations for anon" 
ON public.generic_modules 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated" 
ON public.generic_modules 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
