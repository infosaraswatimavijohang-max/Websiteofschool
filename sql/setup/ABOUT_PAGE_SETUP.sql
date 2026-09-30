-- ====================================================================
-- ABOUT PAGE MANAGEMENT SYSTEM - SQL SCHEMA
-- ====================================================================
-- This schema manages all dynamic content for the About page

-- ─ TABLE 0: ABOUT HERO BANNER ─
CREATE TABLE IF NOT EXISTS about_hero (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  hero_title VARCHAR(255),
  hero_subtitle TEXT,
  hero_background_image TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_about_hero_active ON about_hero(is_active, display_order);

-- Insert default hero banner if not exists
INSERT INTO about_hero (hero_title, hero_subtitle, hero_background_image, display_order)
VALUES ('About Our School', 'Honoring the visionary headmasters who have steered Shree Saraswati Secondary School since its inception in 2016 B.S.', '../images/img.jpg', 0)
ON CONFLICT DO NOTHING;

-- ─ TABLE 1: ABOUT STATS ─
CREATE TABLE IF NOT EXISTS about_stats (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  icon_emoji VARCHAR(50),
  stat_number VARCHAR(100),
  stat_label TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─ TABLE 2: VISION & MISSION ─
CREATE TABLE IF NOT EXISTS about_vision_mission (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  section_type VARCHAR(50), -- 'vision' or 'mission'
  icon_emoji VARCHAR(50),
  section_title VARCHAR(255),
  section_description TEXT,
  key_points TEXT, -- JSON array of points
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─ TABLE 3: ERA CARDS (HISTORY PERIODS) ─
CREATE TABLE IF NOT EXISTS about_era_cards (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  icon_emoji VARCHAR(50),
  era_badge VARCHAR(100), -- e.g., "2076 B.S. (2019 A.D.)"
  era_title VARCHAR(255),
  era_description TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─ TABLE 4: TIMELINE MILESTONES ─
CREATE TABLE IF NOT EXISTS about_timeline (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  icon_emoji VARCHAR(50),
  timeline_date VARCHAR(100), -- e.g., "2076 B.S."
  timeline_title VARCHAR(255),
  timeline_description TEXT,
  timeline_position VARCHAR(20), -- 'left' or 'right'
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─ TABLE 5: ADMINISTRATION TEAM MEMBERS ─
CREATE TABLE IF NOT EXISTS about_admin_team (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  member_name VARCHAR(255),
  member_role VARCHAR(255),
  member_department VARCHAR(255),
  member_photo_url TEXT,
  member_email VARCHAR(255),
  hierarchy_level INT DEFAULT 0,
  reports_to_id BIGINT REFERENCES about_admin_team(id) ON DELETE SET NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─ TABLE 6: PRINCIPALS LEGACY TREE ─
CREATE TABLE IF NOT EXISTS about_principals_tree (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  principal_name VARCHAR(255),
  principal_tenure_start VARCHAR(50), -- e.g., "2076"
  principal_tenure_end VARCHAR(50),
  principal_description TEXT,
  principal_photo_url TEXT,
  tree_position VARCHAR(20), -- 'left' or 'right'
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─ TABLE 7: TECHNICAL INCHARGE LEGACY TREE ─
CREATE TABLE IF NOT EXISTS about_technical_incharge_tree (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  incharge_name VARCHAR(255),
  incharge_tenure_start VARCHAR(50),
  incharge_tenure_end VARCHAR(50),
  incharge_description TEXT,
  incharge_photo_url TEXT,
  tree_position VARCHAR(20), -- 'left' or 'right'
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─ TABLE 8: PRIMARY INCHARGE LEGACY TREE ─
CREATE TABLE IF NOT EXISTS about_primary_incharge_tree (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  incharge_name VARCHAR(255),
  incharge_tenure_start VARCHAR(50),
  incharge_tenure_end VARCHAR(50),
  incharge_description TEXT,
  incharge_photo_url TEXT,
  tree_position VARCHAR(20), -- 'left' or 'right'
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─ TABLE 9: LEADERSHIP DESKS (PRINCIPALS' MESSAGES) ─
CREATE TABLE IF NOT EXISTS about_leadership_desks (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  leader_name VARCHAR(255),
  leader_role VARCHAR(255),
  leader_photo_url TEXT,
  leader_quote TEXT, -- Main quote/message
  leader_description TEXT,
  leader_signature_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─ TABLE 10: ALUMNI EXCELLENCE ─
CREATE TABLE IF NOT EXISTS about_alumni (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  alumni_name VARCHAR(255),
  alumni_batch_year INT,
  alumni_achievement TEXT,
  alumni_photo_url TEXT,
  alumni_current_position VARCHAR(255),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─ TABLE 11: BLOG POSTS ─
CREATE TABLE IF NOT EXISTS about_blogs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  blog_title VARCHAR(255),
  blog_author VARCHAR(255),
  blog_content TEXT,
  blog_featured_image TEXT,
  blog_publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  blog_category VARCHAR(100),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─ TABLE 12: STORY SECTION CONTENT ─
CREATE TABLE IF NOT EXISTS about_story (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  story_title VARCHAR(255),
  story_subtitle VARCHAR(255),
  story_visual_image TEXT,
  story_paragraph1 TEXT,
  story_paragraph2 TEXT,
  story_values_list TEXT, -- JSON array of values
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- INDEXES FOR PERFORMANCE
-- ====================================================================
CREATE INDEX idx_about_stats_active ON about_stats(is_active, display_order);
CREATE INDEX idx_about_vision_active ON about_vision_mission(is_active, display_order);
CREATE INDEX idx_about_era_active ON about_era_cards(is_active, display_order);
CREATE INDEX idx_about_timeline_active ON about_timeline(is_active, display_order);
CREATE INDEX idx_about_admin_active ON about_admin_team(is_active, display_order);
CREATE INDEX idx_about_principals_active ON about_principals_tree(is_active, display_order);
CREATE INDEX idx_about_tech_active ON about_technical_incharge_tree(is_active, display_order);
CREATE INDEX idx_about_primary_active ON about_primary_incharge_tree(is_active, display_order);
CREATE INDEX idx_about_leadership_active ON about_leadership_desks(is_active, display_order);
CREATE INDEX idx_about_alumni_active ON about_alumni(is_active, display_order);
CREATE INDEX idx_about_blogs_active ON about_blogs(is_active, display_order);

-- ====================================================================
-- SAMPLE DATA
-- ====================================================================

-- Stats
INSERT INTO about_stats (icon_emoji, stat_number, stat_label, display_order) VALUES
('📚', '30+', 'Years of Excellence', 0),
('👥', '5000+', 'Alumni Network', 1),
('🏆', '100+', 'Awards Won', 2),
('🌟', '98%', 'Student Success Rate', 3)
ON CONFLICT DO NOTHING;

-- Vision & Mission
INSERT INTO about_vision_mission (section_type, icon_emoji, section_title, section_description, key_points, display_order) VALUES
('vision', '🎯', 'Our Vision', 'To be a leading educational institution that fosters academic excellence, character development, and innovation.', '["Excellence in Education", "Holistic Development", "Global Perspective", "Ethical Leadership"]', 0),
('mission', '💡', 'Our Mission', 'To provide quality education that empowers students to become responsible citizens and leaders of tomorrow.', '["Quality Education", "Student Empowerment", "Community Service", "Continuous Improvement"]', 1)
ON CONFLICT DO NOTHING;

-- Story Section
INSERT INTO about_story (story_title, story_subtitle, story_paragraph1, story_paragraph2, story_values_list, display_order) VALUES
('Our Educational Journey', 'Shaping Lives Since 2016 B.S.', 
'Shree Saraswati Secondary School has been a beacon of educational excellence for over three decades. Our commitment to nurturing young minds and fostering holistic development has made us a trusted institution in the community.',
'Through innovative teaching methodologies, modern infrastructure, and dedicated educators, we continue to shape the leaders and citizens of tomorrow. Our focus on both academic and co-curricular activities ensures well-rounded development of every student.',
'["Quality Education", "Holistic Development", "Community Service", "Innovation", "Excellence"]', 0)
ON CONFLICT DO NOTHING;
