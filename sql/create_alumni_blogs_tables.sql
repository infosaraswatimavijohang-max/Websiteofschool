-- ============================================================
-- FILE: create_alumni_blogs_tables.sql
-- PURPOSE: Create about_alumni and about_blogs tables in Supabase
-- Run this in Supabase SQL Editor: 
--   https://supabase.com/dashboard/project/ohczlooperjqpyllmabo/sql/new
-- ============================================================

-- ═══════════════════════════════════════════
-- TABLE: about_alumni
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS about_alumni (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alumni_name TEXT NOT NULL,
  alumni_batch_year TEXT,
  alumni_achievement TEXT,
  alumni_photo_url TEXT DEFAULT '',
  alumni_current_position TEXT DEFAULT '',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (optional, for safety)
ALTER TABLE about_alumni ENABLE ROW LEVEL SECURITY;

-- Allow anon reads
DROP POLICY IF EXISTS "Allow public read alumni" ON about_alumni;
CREATE POLICY "Allow public read alumni" 
  ON about_alumni FOR SELECT USING (true);

-- Allow anon inserts/updates/deletes (admin portal uses anon key)
DROP POLICY IF EXISTS "Allow public insert alumni" ON about_alumni;
CREATE POLICY "Allow public insert alumni"
  ON about_alumni FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update alumni" ON about_alumni;
CREATE POLICY "Allow public update alumni"
  ON about_alumni FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete alumni" ON about_alumni;
CREATE POLICY "Allow public delete alumni"
  ON about_alumni FOR DELETE USING (true);


-- ═══════════════════════════════════════════
-- TABLE: about_blogs
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS about_blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_title TEXT NOT NULL,
  blog_content TEXT,
  blog_excerpt TEXT,
  featured_image_url TEXT DEFAULT '',
  author_name TEXT DEFAULT '',
  blog_author TEXT DEFAULT '',
  display_order INTEGER DEFAULT 0,
  published_date TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  badge TEXT DEFAULT 'News',
  read_time TEXT DEFAULT '3 min read',
  slug TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE about_blogs ENABLE ROW LEVEL SECURITY;

-- Allow anon reads
DROP POLICY IF EXISTS "Allow public read blogs" ON about_blogs;
CREATE POLICY "Allow public read blogs"
  ON about_blogs FOR SELECT USING (true);

-- Allow anon inserts/updates/deletes
DROP POLICY IF EXISTS "Allow public insert blogs" ON about_blogs;
CREATE POLICY "Allow public insert blogs"
  ON about_blogs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update blogs" ON about_blogs;
CREATE POLICY "Allow public update blogs"
  ON about_blogs FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete blogs" ON about_blogs;
CREATE POLICY "Allow public delete blogs"
  ON about_blogs FOR DELETE USING (true);


-- ═══════════════════════════════════════════
-- SEED: Insert sample alumni data
-- ═══════════════════════════════════════════
INSERT INTO about_alumni (alumni_name, alumni_batch_year, alumni_achievement, alumni_photo_url, alumni_current_position, display_order, is_active)
VALUES 
  (
    'Sita Kumari Sharma',
    'Batch of 2080',
    '3.97 GPA - Science Board Topper',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256',
    'IOE Entrance Top 10',
    1,
    true
  ),
  (
    'Ramesh Bahadur Thapa',
    'Batch of 2081',
    '3.95 GPA - CTEVT District Topper',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256',
    'Computer Engineering Scholar',
    2,
    true
  ),
  (
    'Deepa Karki',
    'Batch of 2081',
    '3.92 GPA - Science Distinction',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256',
    'Pulchowk Campus CSE Scholar',
    3,
    true
  )
ON CONFLICT DO NOTHING;


-- ═══════════════════════════════════════════
-- SEED: Insert sample blog/news data
-- ═══════════════════════════════════════════
INSERT INTO about_blogs (blog_title, blog_content, blog_excerpt, featured_image_url, author_name, display_order, is_active, badge)
VALUES 
  (
    'Annual Science Expo 2082 - Students Shine Bright',
    'The Annual Science and Technology Expo 2082 was a grand success with over 50 student projects on display. Students from the Computer Engineering stream created impressive AI-based models and robotics demonstrations. The event saw participation from parents, community leaders and district education officials. Several students from Class 12 demonstrated autonomous robots capable of navigation and object detection. The expo was inaugurated by the District Education Officer and was a proud moment for the entire Shree Saraswati community.',
    'Our students showcased outstanding AI and robotics projects at the annual science expo held at the school campus. A proud moment for Shree Saraswati!',
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=600',
    'Principal''s Office',
    1,
    true,
    'Science'
  ),
  (
    'Smart Classroom Initiative - Digital Learning Launched',
    'Shree Saraswati Secondary School has taken a major leap in educational technology by installing interactive digital boards in all secondary classrooms. Students can now access multimedia lessons, digital textbooks and collaborative learning tools directly in the classroom. This initiative was funded by the School Management Committee and supported by local IT professionals from the CTEVT alumni network. The smart classroom system includes high-speed internet, interactive touch displays, and cloud-based lesson management.',
    'The school has successfully launched its smart classroom initiative with interactive digital boards in all secondary classrooms.',
    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=600',
    'IT Department',
    2,
    true,
    'Technology'
  )
ON CONFLICT DO NOTHING;


-- ═══════════════════════════════════════════
-- VERIFY: Check data was inserted
-- ═══════════════════════════════════════════
SELECT 'about_alumni count: ' || COUNT(*)::TEXT FROM about_alumni;
SELECT 'about_blogs count: ' || COUNT(*)::TEXT FROM about_blogs;
