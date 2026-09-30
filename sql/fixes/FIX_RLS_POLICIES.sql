-- ====================================================================
-- FIX RLS POLICIES FOR ABOUT PAGE TABLES
-- ====================================================================
-- This SQL fixes Row Level Security (RLS) policy errors that prevent
-- admins from creating/updating records in the About page management system

-- ─────────────────────────────────────────────────────────────────────
-- TABLE 1: ABOUT_ADMIN_TEAM - Fix RLS Policies
-- ─────────────────────────────────────────────────────────────────────

-- Enable RLS on the table (if not already enabled)
ALTER TABLE IF EXISTS about_admin_team ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read admin_team" ON about_admin_team;
DROP POLICY IF EXISTS "Allow authenticated admin_team" ON about_admin_team;
DROP POLICY IF EXISTS "Allow admin team insert" ON about_admin_team;
DROP POLICY IF EXISTS "Allow admin team update" ON about_admin_team;
DROP POLICY IF EXISTS "Allow admin team delete" ON about_admin_team;
DROP POLICY IF EXISTS "Allow all access admin_team" ON about_admin_team;

-- Create new RLS policies for admin_team table

-- 1. Public can READ active team members
CREATE POLICY "Allow public read admin_team" ON about_admin_team
FOR SELECT
USING (is_active = true);

-- 2. Authenticated users (including admins) can INSERT
CREATE POLICY "Allow admin team insert" ON about_admin_team
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 3. Authenticated users (including admins) can UPDATE their own records
CREATE POLICY "Allow admin team update" ON about_admin_team
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 4. Authenticated users can DELETE
CREATE POLICY "Allow admin team delete" ON about_admin_team
FOR DELETE
USING (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────────────────
-- TABLE 2: ABOUT_LEADERSHIP_DESKS - Fix RLS Policies
-- ─────────────────────────────────────────────────────────────────────

-- Enable RLS on the table (if not already enabled)
ALTER TABLE IF EXISTS about_leadership_desks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read leadership" ON about_leadership_desks;
DROP POLICY IF EXISTS "Allow authenticated leadership" ON about_leadership_desks;
DROP POLICY IF EXISTS "Allow leadership insert" ON about_leadership_desks;
DROP POLICY IF EXISTS "Allow leadership update" ON about_leadership_desks;
DROP POLICY IF EXISTS "Allow leadership delete" ON about_leadership_desks;
DROP POLICY IF EXISTS "Allow all access leadership" ON about_leadership_desks;

-- Create new RLS policies for leadership_desks table

-- 1. Public can READ active leadership messages
CREATE POLICY "Allow public read leadership" ON about_leadership_desks
FOR SELECT
USING (is_active = true);

-- 2. Authenticated users (including admins) can INSERT
CREATE POLICY "Allow leadership insert" ON about_leadership_desks
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 3. Authenticated users (including admins) can UPDATE
CREATE POLICY "Allow leadership update" ON about_leadership_desks
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 4. Authenticated users can DELETE
CREATE POLICY "Allow leadership delete" ON about_leadership_desks
FOR DELETE
USING (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────────────────
-- TABLE 3: OTHER ABOUT PAGE TABLES - Similar fixes
-- ─────────────────────────────────────────────────────────────────────

-- ABOUT_HERO
ALTER TABLE IF EXISTS about_hero ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read hero" ON about_hero;
DROP POLICY IF EXISTS "Allow authenticated hero" ON about_hero;

CREATE POLICY "Allow public read hero" ON about_hero
FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated hero" ON about_hero
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow hero update" ON about_hero
FOR UPDATE USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

-- ABOUT_STATS
ALTER TABLE IF EXISTS about_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read stats" ON about_stats;
DROP POLICY IF EXISTS "Allow authenticated stats" ON about_stats;

CREATE POLICY "Allow public read stats" ON about_stats
FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated stats" ON about_stats
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow stats update" ON about_stats
FOR UPDATE USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

-- ABOUT_VISION_MISSION
ALTER TABLE IF EXISTS about_vision_mission ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read vision" ON about_vision_mission;
DROP POLICY IF EXISTS "Allow authenticated vision" ON about_vision_mission;

CREATE POLICY "Allow public read vision" ON about_vision_mission
FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated vision" ON about_vision_mission
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow vision update" ON about_vision_mission
FOR UPDATE USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

-- ABOUT_ERA_CARDS
ALTER TABLE IF EXISTS about_era_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read era" ON about_era_cards;
DROP POLICY IF EXISTS "Allow authenticated era" ON about_era_cards;

CREATE POLICY "Allow public read era" ON about_era_cards
FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated era" ON about_era_cards
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow era update" ON about_era_cards
FOR UPDATE USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

-- ABOUT_TIMELINE
ALTER TABLE IF EXISTS about_timeline ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read timeline" ON about_timeline;
DROP POLICY IF EXISTS "Allow authenticated timeline" ON about_timeline;

CREATE POLICY "Allow public read timeline" ON about_timeline
FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated timeline" ON about_timeline
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow timeline update" ON about_timeline
FOR UPDATE USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

-- ABOUT_PRINCIPALS_TREE
ALTER TABLE IF EXISTS about_principals_tree ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read principals" ON about_principals_tree;
DROP POLICY IF EXISTS "Allow authenticated principals" ON about_principals_tree;

CREATE POLICY "Allow public read principals" ON about_principals_tree
FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated principals" ON about_principals_tree
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow principals update" ON about_principals_tree
FOR UPDATE USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

-- ABOUT_TECHNICAL_INCHARGE_TREE
ALTER TABLE IF EXISTS about_technical_incharge_tree ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read technical" ON about_technical_incharge_tree;
DROP POLICY IF EXISTS "Allow authenticated technical" ON about_technical_incharge_tree;

CREATE POLICY "Allow public read technical" ON about_technical_incharge_tree
FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated technical" ON about_technical_incharge_tree
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow technical update" ON about_technical_incharge_tree
FOR UPDATE USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

-- ABOUT_PRIMARY_INCHARGE_TREE
ALTER TABLE IF EXISTS about_primary_incharge_tree ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read primary" ON about_primary_incharge_tree;
DROP POLICY IF EXISTS "Allow authenticated primary" ON about_primary_incharge_tree;

CREATE POLICY "Allow public read primary" ON about_primary_incharge_tree
FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated primary" ON about_primary_incharge_tree
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow primary update" ON about_primary_incharge_tree
FOR UPDATE USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

-- ABOUT_ALUMNI
ALTER TABLE IF EXISTS about_alumni ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read alumni" ON about_alumni;
DROP POLICY IF EXISTS "Allow authenticated alumni" ON about_alumni;

CREATE POLICY "Allow public read alumni" ON about_alumni
FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated alumni" ON about_alumni
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow alumni update" ON about_alumni
FOR UPDATE USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

-- ABOUT_BLOGS
ALTER TABLE IF EXISTS about_blogs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read blogs" ON about_blogs;
DROP POLICY IF EXISTS "Allow authenticated blogs" ON about_blogs;

CREATE POLICY "Allow public read blogs" ON about_blogs
FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated blogs" ON about_blogs
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow blogs update" ON about_blogs
FOR UPDATE USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

-- ABOUT_STORY
ALTER TABLE IF EXISTS about_story ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read story" ON about_story;
DROP POLICY IF EXISTS "Allow authenticated story" ON about_story;

CREATE POLICY "Allow public read story" ON about_story
FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated story" ON about_story
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow story update" ON about_story
FOR UPDATE USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────────────────
-- VERIFICATION QUERIES
-- ─────────────────────────────────────────────────────────────────────

-- Run these after applying the fixes to verify RLS is working:

-- Check RLS status on tables
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public' AND tablename LIKE 'about_%';

-- List all policies on about_admin_team
-- SELECT * FROM pg_policies WHERE tablename = 'about_admin_team';

-- List all policies on about_leadership_desks
-- SELECT * FROM pg_policies WHERE tablename = 'about_leadership_desks';

-- ─────────────────────────────────────────────────────────────────────
-- NOTES
-- ─────────────────────────────────────────────────────────────────────
-- 
-- 1. These policies allow authenticated users (anyone logged in) to 
--    perform CRUD operations on About page tables
--
-- 2. Public users can only READ active (is_active = true) records
--
-- 3. If you want to restrict write access to specific admin roles,
--    use custom claims or role checking:
--    
--    Alternative (Role-based):
--    CREATE POLICY "Allow admin only" ON about_admin_team
--    FOR UPDATE
--    USING (auth.jwt() ->> 'role' = 'admin')
--    WITH CHECK (auth.jwt() ->> 'role' = 'admin');
--
-- 4. Storage buckets (principals-images, about-images, team-photos)
--    also need similar RLS policies - see next section
--
-- ─────────────────────────────────────────────────────────────────────
-- STORAGE BUCKET POLICIES (Optional - if images still don't upload)
-- ─────────────────────────────────────────────────────────────────────

-- If images fail to upload, run these to fix storage bucket policies:

-- For principals-images bucket:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('principals-images', 'principals-images', true)
-- ON CONFLICT DO NOTHING;

-- ALTER ROLE authenticated WITH BYPASSRLS;
-- (This temporarily bypasses RLS for authenticated users - use with caution)

-- Or create specific storage policies:
-- CREATE POLICY "Public read principals-images" ON storage.objects
-- FOR SELECT USING (bucket_id = 'principals-images');

-- CREATE POLICY "Authenticated upload principals-images" ON storage.objects
-- FOR INSERT WITH CHECK (bucket_id = 'principals-images' AND auth.role() = 'authenticated');

-- For about-images bucket:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('about-images', 'about-images', true)
-- ON CONFLICT DO NOTHING;

-- CREATE POLICY "Public read about-images" ON storage.objects
-- FOR SELECT USING (bucket_id = 'about-images');

-- CREATE POLICY "Authenticated upload about-images" ON storage.objects
-- FOR INSERT WITH CHECK (bucket_id = 'about-images' AND auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────────────────
-- END OF RLS POLICY FIXES
-- ─────────────────────────────────────────────────────────────────────
