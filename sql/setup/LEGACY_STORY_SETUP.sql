-- ============================================================
-- OUR LEGACY STORY TABLE SETUP
-- For the "A Heritage of Academic Excellence" section
-- ============================================================

-- Create the about_story table if it doesn't exist
CREATE TABLE IF NOT EXISTS about_story (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_subtitle TEXT NOT NULL DEFAULT 'OUR LEGACY',
    story_title TEXT NOT NULL,
    story_paragraph1 TEXT NOT NULL,
    story_paragraph2 TEXT,
    story_visual_image TEXT,  -- URL to image stored in Supabase Storage or external CDN
    story_values_list JSONB DEFAULT '[]',  -- Array of core values/key points
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_story_active ON about_story(is_active);
CREATE INDEX IF NOT EXISTS idx_story_order ON about_story(display_order);

-- Add RLS (Row Level Security) policies if needed
ALTER TABLE about_story ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read" ON about_story;
DROP POLICY IF EXISTS "Allow authenticated insert" ON about_story;
DROP POLICY IF EXISTS "Allow authenticated update" ON about_story;
DROP POLICY IF EXISTS "Allow authenticated delete" ON about_story;

-- Allow public read access (anyone can read active stories)
CREATE POLICY "Allow public read" ON about_story
    FOR SELECT USING (is_active = true);

-- Allow anyone to insert (for admin users)
CREATE POLICY "Allow insert for all" ON about_story
    FOR INSERT WITH CHECK (true);

-- Allow anyone to update (for admin users)
CREATE POLICY "Allow update for all" ON about_story
    FOR UPDATE USING (true);

-- Allow anyone to delete (for admin users)
CREATE POLICY "Allow delete for all" ON about_story
    FOR DELETE USING (true);

-- Insert sample/default data (optional - comment out if not needed)
-- INSERT INTO about_story (
--     story_subtitle,
--     story_title,
--     story_paragraph1,
--     story_paragraph2,
--     story_visual_image,
--     story_values_list,
--     display_order,
--     is_active
-- ) VALUES (
--     'OUR LEGACY',
--     'A Heritage of Academic Excellence',
--     'Shree Saraswati Secondary School stands proud as a pioneer of quality public education in the Satyawati Municipality of Gulmi.',
--     'Our journey reflects commitment to excellence, innovation, and student success.',
--     '../images/img.jpg',
--     '["Quality Education", "Student Growth", "Community Service", "Excellence in All Endeavors"]',
--     0,
--     true
-- )
-- ON CONFLICT DO NOTHING;

-- ============================================================
-- NOTES:
-- 1. The story_values_list is stored as JSONB for flexibility
-- 2. story_visual_image should contain the public URL of the image
-- 3. Images should be uploaded to Supabase Storage in 'about-images' bucket
-- 4. The is_active flag allows soft deletion
-- 5. Only one story is typically used (the first one is selected)
-- ============================================================
