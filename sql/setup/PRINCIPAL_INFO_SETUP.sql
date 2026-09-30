-- ============================================================
-- CURRENT PRINCIPAL / HEAD TEACHER CONFIGURATION SETUP
-- For storing the current principal name, title, greeting, messages,
-- quotes, and photo URL in the 'school_config' table.
-- ============================================================

-- Create the school_config table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.school_config (
    key TEXT PRIMARY KEY,
    val JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security (failsafe)
ALTER TABLE public.school_config ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on school_config if they exist
DROP POLICY IF EXISTS "Allow all public access" ON public.school_config;

-- Create public access policy allowing select, insert, update, delete for all
CREATE POLICY "Allow all public access" ON public.school_config 
    FOR ALL USING (true) WITH CHECK (true);

-- Insert or update default Principal Configuration info
INSERT INTO public.school_config (key, val)
VALUES (
    'principal_info',
    $$
    {
        "name": "Chhabilal Bhandari",
        "title": "Head Teacher",
        "school": "Shree Saraswati Secondary School, Gulmi",
        "greeting": "Dear Students, Parents, and Well-wishers,",
        "message": "It is my absolute privilege and joy to welcome you to Shree Saraswati Secondary School, a center of educational excellence nestled in the gorgeous, peaceful hills of Satyawati-6, Johang, Gulmi. Since our historical establishment in 2016 B.S., we have committed ourselves to bringing standard, career-empowering education to the youth of our community.",
        "quote": "\"We do not merely teach curriculum; we spark curiosity, cultivate strong moral character, and inspire each student to realize their ultimate potential.\"",
        "message2": "In this digital age, we have integrated modern pedagogical techniques alongside our values-based general studies. Our specialized Computer Engineering program (Grades 9 to 12) prepares students directly for tech-focused careers. We invite you to join us on this beautiful journey of knowledge, leadership, and success.",
        "photoUrl": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=50"
    }
    $$::jsonb
)
ON CONFLICT (key) 
DO UPDATE SET val = EXCLUDED.val;

-- ============================================================
-- STORAGE BUCKET CONFIGURATION FOR MEDIA UPLOADS
-- Creates the 'media' bucket to store the principal's image
-- and other static assets.
-- ============================================================

-- Create 'media' bucket if it does not exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist to avoid conflict
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow public insert" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete" ON storage.objects;

-- Create policies for storage objects inside 'media' bucket
CREATE POLICY "Allow public read" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Allow public insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media');
CREATE POLICY "Allow public delete" ON storage.objects FOR DELETE USING (bucket_id = 'media');

