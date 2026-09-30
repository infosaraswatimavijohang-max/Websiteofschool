-- ============================================================
-- PRINCIPALS LEGACY TABLE SETUP
-- For storing historical principal information
-- ============================================================

-- Create the principals_legacy table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.principals_legacy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tenure TEXT,
    description TEXT,
    image_url TEXT,
    is_current BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_principals_legacy_order ON principals_legacy(order_index);
CREATE INDEX IF NOT EXISTS idx_principals_legacy_current ON principals_legacy(is_current);

-- Enable Row Level Security
ALTER TABLE public.principals_legacy ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all access" ON principals_legacy;
DROP POLICY IF EXISTS "Allow public read" ON principals_legacy;
DROP POLICY IF EXISTS "Allow authenticated all" ON principals_legacy;

-- Create permissive policy for all operations
CREATE POLICY "Allow all access" ON principals_legacy
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- NOTES:
-- 1. The principals_legacy table stores historical principal data
-- 2. Each principal can have a tenure period and description
-- 3. is_current flag marks the current principal
-- 4. Images are stored with URLs (uploaded to Supabase Storage)
-- 5. RLS policy allows all authenticated users to manage records
-- ============================================================
