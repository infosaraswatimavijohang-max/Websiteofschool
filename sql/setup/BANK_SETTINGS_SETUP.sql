-- ========================================================
-- SUPER ADMIN: BANK SETTINGS SETUP SCRIPT
-- ========================================================
-- Run this script in the Supabase SQL Editor to create the 
-- bank_settings table required for the fee payment gateway.

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.school_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(50) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
-- Allow anyone to read the bank settings (students need to see this)
CREATE POLICY "Allow public read access to school_settings"
ON public.school_settings
FOR SELECT
USING (true);

-- Allow authenticated admins to update or insert settings
CREATE POLICY "Allow admins to insert school_settings"
ON public.school_settings
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow admins to update school_settings"
ON public.school_settings
FOR UPDATE
USING (true);

-- 4. Insert empty/default rows so updates work correctly
INSERT INTO public.school_settings (setting_key, setting_value)
VALUES (
    'bank_details',
    '{"bankName": "", "accountName": "", "accountNumber": "", "branch": "", "qrCodeUrl": ""}'::jsonb
) ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO public.school_settings (setting_key, setting_value)
VALUES (
    'official_signatures',
    '{"principal": "", "coordinator": "", "tech_incharge": ""}'::jsonb
) ON CONFLICT (setting_key) DO NOTHING;

-- Done!
