-- ============================================================================
-- STAFF HIERARCHY WITH IMAGES - SUPABASE SETUP
-- ============================================================================
-- This schema allows you to store staff members with hierarchical structure
-- and image uploads for an organizational tree diagram
-- ============================================================================

-- ───────────────────────────────────────────────────────────────────────────
-- 1. CREATE STORAGE BUCKET FOR STAFF IMAGES
-- ───────────────────────────────────────────────────────────────────────────

-- Run this in Supabase Storage tab or via API:
-- Bucket name: staff-images
-- Public: true (for direct image access)
-- File size limit: 5MB per image

-- ───────────────────────────────────────────────────────────────────────────
-- 2. CREATE STAFF HIERARCHY TABLE
-- ───────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.staff_hierarchy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    bio TEXT,
    
    -- Hierarchy fields
    parent_id UUID REFERENCES public.staff_hierarchy(id) ON DELETE SET NULL,
    hierarchy_level INT DEFAULT 0,  -- 0: Principal/Head, 1: Vice Principal, 2: Department Heads, 3: Teachers, etc.
    order_index INT DEFAULT 0,      -- For sorting within same level
    
    -- Image fields
    image_url VARCHAR(500),         -- URL to stored image
    image_name VARCHAR(255),        -- Original file name
    
    -- Contact fields (optional)
    email VARCHAR(255),
    phone VARCHAR(20),
    
    -- Status and timestamps
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT name_not_empty CHECK (LENGTH(name) > 0),
    CONSTRAINT position_not_empty CHECK (LENGTH(position) > 0)
);

-- Create index for faster queries
CREATE INDEX idx_staff_parent_id ON public.staff_hierarchy(parent_id);
CREATE INDEX idx_staff_hierarchy_level ON public.staff_hierarchy(hierarchy_level);
CREATE INDEX idx_staff_order_index ON public.staff_hierarchy(order_index);
CREATE INDEX idx_staff_department ON public.staff_hierarchy(department);

-- ───────────────────────────────────────────────────────────────────────────
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ───────────────────────────────────────────────────────────────────────────

ALTER TABLE public.staff_hierarchy ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can do everything
CREATE POLICY "Admins can manage staff" 
    ON public.staff_hierarchy 
    FOR ALL 
    USING (auth.jwt()->>'role' = 'admin')
    WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Policy: Everyone can read active staff
CREATE POLICY "Public read active staff" 
    ON public.staff_hierarchy 
    FOR SELECT 
    USING (is_active = true);

-- ───────────────────────────────────────────────────────────────────────────
-- 4. SAMPLE DATA - INSERT HIERARCHY
-- ───────────────────────────────────────────────────────────────────────────

-- You can use this as a template to insert data:

-- Principal (Level 0)
-- INSERT INTO public.staff_hierarchy (
--     name, position, department, bio, hierarchy_level, order_index, parent_id
-- ) VALUES (
--     'Dr. Rajesh Kumar', 'Principal', 'Administration', 
--     'Principal with 20+ years of experience in education',
--     0, 1, NULL
-- );

-- Vice Principals (Level 1)
-- INSERT INTO public.staff_hierarchy (
--     name, position, department, bio, hierarchy_level, order_index, parent_id
-- ) VALUES (
--     'Ms. Priya Sharma', 'Vice Principal (Academic)', 'Academic', 
--     'Responsible for curriculum and academic excellence',
--     1, 1, (SELECT id FROM public.staff_hierarchy WHERE position = 'Principal')
-- );

-- Department Heads (Level 2)
-- INSERT INTO public.staff_hierarchy (
--     name, position, department, bio, hierarchy_level, order_index, parent_id
-- ) VALUES (
--     'Mr. Amit Singh', 'Head of Mathematics', 'Mathematics', 
--     'Leading the mathematics department',
--     2, 1, (SELECT id FROM public.staff_hierarchy WHERE position = 'Vice Principal (Academic)')
-- );

-- ───────────────────────────────────────────────────────────────────────────
-- 5. HELPFUL QUERIES FOR ADMIN OPERATIONS
-- ───────────────────────────────────────────────────────────────────────────

-- Get complete organizational hierarchy tree
-- SELECT 
--     s.id, s.name, s.position, s.department, s.hierarchy_level,
--     p.name AS parent_name,
--     s.image_url, s.is_active
-- FROM public.staff_hierarchy s
-- LEFT JOIN public.staff_hierarchy p ON s.parent_id = p.id
-- ORDER BY s.hierarchy_level, s.order_index, s.created_at;

-- Get all members under a specific person (and their subordinates)
-- WITH RECURSIVE subordinates AS (
--     SELECT id, name, position, parent_id, hierarchy_level, 1 as depth
--     FROM public.staff_hierarchy
--     WHERE name = 'Dr. Rajesh Kumar'
--     UNION ALL
--     SELECT s.id, s.name, s.position, s.parent_id, s.hierarchy_level, subordinates.depth + 1
--     FROM public.staff_hierarchy s
--     JOIN subordinates ON s.parent_id = subordinates.id
-- )
-- SELECT * FROM subordinates ORDER BY depth, name;

-- Get specific department hierarchy
-- SELECT * FROM public.staff_hierarchy 
-- WHERE department = 'Mathematics' 
-- ORDER BY hierarchy_level, order_index;

-- Update image URL after upload
-- UPDATE public.staff_hierarchy 
-- SET image_url = 'https://your-storage-url/staff-images/filename.jpg'
-- WHERE id = 'UUID-HERE';

-- ───────────────────────────────────────────────────────────────────────────
-- 6. HIERARCHY LEVELS GUIDE
-- ───────────────────────────────────────────────────────────────────────────

/*
Level 0: Principal / Head of Institution
Level 1: Vice Principals / Deputy Directors
Level 2: Department Heads / Senior Coordinators
Level 3: Senior Teachers / Specialists
Level 4: Teachers / Regular Staff
Level 5: Support Staff / Assistants

Customize hierarchy_level values based on your organization structure
*/

-- ───────────────────────────────────────────────────────────────────────────
-- 7. SUPABASE STORAGE CONFIGURATION
-- ───────────────────────────────────────────────────────────────────────────

/*
BUCKET NAME: staff-images
PUBLIC: Yes
FILE SIZE LIMIT: 5MB
ALLOWED TYPES: image/jpeg, image/png, image/webp, image/gif

After creating bucket in Supabase Dashboard:
1. Go to Storage > staff-images
2. Click "Policies"
3. Add public read policy
4. Add authenticated user write policy
5. Test by uploading an image

IMAGE URL FORMAT:
https://[PROJECT_ID].supabase.co/storage/v1/object/public/staff-images/[FILE_NAME]
*/

-- ───────────────────────────────────────────────────────────────────────────
-- 8. ADVANCED: FULL-TEXT SEARCH
-- ───────────────────────────────────────────────────────────────────────────

-- Create search index (optional, for faster searches)
-- CREATE INDEX idx_staff_search ON public.staff_hierarchy 
-- USING GIN(to_tsvector('english', name || ' ' || position || ' ' || department));

-- Search query example:
-- SELECT * FROM public.staff_hierarchy 
-- WHERE to_tsvector('english', name || ' ' || position || ' ' || department) 
--       @@ plainto_tsquery('english', 'mathematics teacher')
-- AND is_active = true;

-- ───────────────────────────────────────────────────────────────────────────
-- 9. AUDIT TRAIL (OPTIONAL)
-- ───────────────────────────────────────────────────────────────────────────

-- CREATE TABLE staff_hierarchy_audit (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     staff_id UUID REFERENCES public.staff_hierarchy(id),
--     action VARCHAR(50),  -- 'INSERT', 'UPDATE', 'DELETE'
--     changed_by UUID,
--     changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     old_values JSONB,
--     new_values JSONB
-- );

-- ───────────────────────────────────────────────────────────────────────────
-- 10. NOTES FOR IMPLEMENTATION
-- ───────────────────────────────────────────────────────────────────────────

/*
STEPS TO IMPLEMENT IN ADMIN PANEL:

1. Create a staff_hierarchy table in Supabase using the schema above
2. Enable RLS policies as shown
3. In the Admin Portal:
   a. Add image upload field using Supabase Storage
   b. Add parent_id select dropdown (shows other staff members)
   c. Add hierarchy_level select (0-5)
   d. Add department dropdown
   e. Store image_url after successful upload
4. Display staff in tree structure:
   a. Fetch all staff with hierarchy_level
   b. Render tree using nested divs/ul-li
   c. Show images as circular avatars
   d. Use connectors (SVG lines) to show relationships
5. Implement recursive deletion:
   a. When deleting a member, set children's parent_id to NULL
   b. Or delete all subordinates based on business logic
6. Add drag-drop to reorder within same level
7. Add export to PDF/image for organizational chart

DATABASE MIGRATIONS:
- Run the CREATE TABLE statement in Supabase SQL Editor
- Copy table structure if migrating from localStorage
- Set up proper RLS policies for security
*/
