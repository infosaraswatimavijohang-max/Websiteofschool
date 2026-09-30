-- ============================================================================
-- ADVANCED STAFF HIERARCHY WITH IMAGES - SUPABASE SETUP
-- ============================================================================
-- Comprehensive schema for organizational hierarchy with image storage,
-- CRUD operations, and advanced tree structure management
-- ============================================================================

-- ───────────────────────────────────────────────────────────────────────────
-- 1. CREATE STORAGE BUCKET FOR STAFF IMAGES
-- ───────────────────────────────────────────────────────────────────────────
-- Execute this in Supabase Storage tab or via API call
-- Bucket name: staff-images
-- Public: true
-- File size limit: 5MB

insert into storage.buckets (id, name, public)
values ('staff-images', 'staff-images', true)
on conflict (id) do nothing;

-- ───────────────────────────────────────────────────────────────────────────
-- 2. CREATE STORAGE SECURITY POLICIES
-- ───────────────────────────────────────────────────────────────────────────
drop policy if exists "Allow public read staff images" on storage.objects;
create policy "Allow public read staff images" on storage.objects
for select using (bucket_id = 'staff-images');

drop policy if exists "Allow admin upload staff images" on storage.objects;
create policy "Allow admin upload staff images" on storage.objects
for insert with check (
  bucket_id = 'staff-images' AND
  auth.jwt()->>'role' = 'admin'
);

drop policy if exists "Allow admin delete staff images" on storage.objects;
create policy "Allow admin delete staff images" on storage.objects
for delete using (
  bucket_id = 'staff-images' AND
  auth.jwt()->>'role' = 'admin'
);

drop policy if exists "Allow admin update staff images" on storage.objects;
create policy "Allow admin update staff images" on storage.objects
for update using (
  bucket_id = 'staff-images' AND
  auth.jwt()->>'role' = 'admin'
);

-- ───────────────────────────────────────────────────────────────────────────
-- 3. CREATE ADVANCED STAFF HIERARCHY TABLE
-- ───────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.staff_hierarchy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    name VARCHAR(255) NOT NULL,
    "position" VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    bio TEXT,
    
    -- Hierarchy Structure
    parent_id UUID REFERENCES public.staff_hierarchy(id) ON DELETE SET NULL,
    hierarchy_level INT DEFAULT 0,  -- 0: Principal, 1: Vice Principal, 2: Department Heads, 3: Teachers, etc.
    order_index INT DEFAULT 0,      -- For sorting within same level
    
    -- Image Management
    image_url VARCHAR(500),         -- URL to Supabase storage
    image_name VARCHAR(255),        -- Original file name
    image_size INT,                 -- File size in bytes
    image_uploaded_at TIMESTAMP,    -- When image was uploaded
    
    -- Contact Information
    email VARCHAR(255),
    phone VARCHAR(20),
    office_location VARCHAR(255),   -- Room/Office number
    
    -- Professional Details
    qualification VARCHAR(255),     -- Degree/Certification
    experience_years INT,           -- Years of experience
    specialization VARCHAR(255),    -- Area of expertise
    
    -- Social & Professional Links
    linkedin_url VARCHAR(500),
    social_links JSONB,             -- For storing multiple social links
    
    -- Status & Metadata
    is_active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false, -- For highlighting key positions
    display_order INT DEFAULT 0,    -- For custom ordering
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT position_not_empty CHECK (LENGTH(TRIM(position)) > 0),
    CONSTRAINT valid_experience CHECK (experience_years >= 0),
    CONSTRAINT unique_staff_per_parent CHECK (
        parent_id IS NOT NULL OR hierarchy_level = 0
    )
);

-- ───────────────────────────────────────────────────────────────────────────
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ───────────────────────────────────────────────────────────────────────────
CREATE INDEX idx_staff_parent_id ON public.staff_hierarchy(parent_id);
CREATE INDEX idx_staff_hierarchy_level ON public.staff_hierarchy(hierarchy_level);
CREATE INDEX idx_staff_order_index ON public.staff_hierarchy(order_index);
CREATE INDEX idx_staff_department ON public.staff_hierarchy(department);
CREATE INDEX idx_staff_is_active ON public.staff_hierarchy(is_active);
CREATE INDEX idx_staff_featured ON public.staff_hierarchy(featured);
CREATE INDEX idx_staff_display_order ON public.staff_hierarchy(display_order);
CREATE INDEX idx_staff_created_at ON public.staff_hierarchy(created_at);
CREATE INDEX idx_staff_name ON public.staff_hierarchy USING GIN (
    to_tsvector('english', name || ' ' || position || ' ' || COALESCE(department, ''))
);

-- ───────────────────────────────────────────────────────────────────────────
-- 5. CREATE AUDIT LOG TABLE
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.staff_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES public.staff_hierarchy(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'IMAGE_UPLOAD'
    old_data JSONB,              -- Previous values
    new_data JSONB,              -- New values
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT                 -- Additional context
);

CREATE INDEX idx_audit_staff_id ON public.staff_audit_log(staff_id);
CREATE INDEX idx_audit_changed_at ON public.staff_audit_log(changed_at);
CREATE INDEX idx_audit_action ON public.staff_audit_log(action);

-- ───────────────────────────────────────────────────────────────────────────
-- 6. ENABLE ROW LEVEL SECURITY
-- ───────────────────────────────────────────────────────────────────────────

ALTER TABLE public.staff_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_audit_log ENABLE ROW LEVEL SECURITY;

-- ─ STAFF HIERARCHY POLICIES ─

-- Policy: Admins can do everything
DROP POLICY IF EXISTS "Admins can manage staff" ON public.staff_hierarchy;
CREATE POLICY "Admins can manage staff" 
    ON public.staff_hierarchy 
    FOR ALL 
    USING (auth.jwt()->>'role' = 'admin')
    WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Policy: Everyone can read active staff
DROP POLICY IF EXISTS "Public read active staff" ON public.staff_hierarchy;
CREATE POLICY "Public read active staff" 
    ON public.staff_hierarchy 
    FOR SELECT 
    USING (is_active = true);

-- ─ AUDIT LOG POLICIES ─

-- Policy: Admins can read audit logs
DROP POLICY IF EXISTS "Admins read audit logs" ON public.staff_audit_log;
CREATE POLICY "Admins read audit logs"
    ON public.staff_audit_log
    FOR SELECT
    USING (auth.jwt()->>'role' = 'admin');

-- Policy: Admins can insert audit logs
DROP POLICY IF EXISTS "Admins insert audit logs" ON public.staff_audit_log;
CREATE POLICY "Admins insert audit logs"
    ON public.staff_audit_log
    FOR INSERT
    WITH CHECK (auth.jwt()->>'role' = 'admin');

-- ───────────────────────────────────────────────────────────────────────────
-- 7. CREATE TRIGGER FOR UPDATED_AT
-- ───────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_staff_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS staff_hierarchy_updated_at ON public.staff_hierarchy;
CREATE TRIGGER staff_hierarchy_updated_at
    BEFORE UPDATE ON public.staff_hierarchy
    FOR EACH ROW
    EXECUTE FUNCTION public.update_staff_timestamp();

-- ───────────────────────────────────────────────────────────────────────────
-- 8. CREATE FUNCTION TO GET HIERARCHY TREE
-- ───────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_staff_tree(parent_uuid UUID DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    "position" VARCHAR,
    department VARCHAR,
    parent_id UUID,
    hierarchy_level INT,
    image_url VARCHAR,
    bio TEXT,
    email VARCHAR,
    phone VARCHAR,
    is_active BOOLEAN,
    order_index INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        s."position",
        s.department,
        s.parent_id,
        s.hierarchy_level,
        s.image_url,
        s.bio,
        s.email,
        s.phone,
        s.is_active,
        s.order_index
    FROM public.staff_hierarchy s
    WHERE (parent_uuid IS NULL AND s.parent_id IS NULL AND s.hierarchy_level = 0)
       OR (parent_uuid IS NOT NULL AND s.parent_id = parent_uuid)
    ORDER BY s.order_index ASC, s.display_order ASC, s.name ASC;
END;
$$ LANGUAGE plpgsql;

-- ───────────────────────────────────────────────────────────────────────────
-- 9. SAMPLE DATA
-- ───────────────────────────────────────────────────────────────────────────

-- Uncomment and modify as needed:

-- Principal (Level 0)
-- INSERT INTO public.staff_hierarchy (
--     name, "position", department, bio, hierarchy_level, order_index,
--     email, phone, qualification, experience_years, specialization, featured
-- ) VALUES (
--     'Dr. Rajesh Kumar Singh', 'Principal', 'Administration',
--     'Visionary leader with 25+ years in educational excellence',
--     0, 1,
--     'principal@saraswati.edu', '+977-1-4123456',
--     'Ph.D. in Education', 25, 'Educational Leadership', true
-- );

-- Vice Principal (Level 1)
-- INSERT INTO public.staff_hierarchy (
--     name, "position", department, bio, hierarchy_level, order_index,
--     parent_id, email, phone, qualification, experience_years, specialization
-- ) VALUES (
--     'Ms. Priya Sharma', 'Vice Principal (Academic)',
--     'Academic Administration',
--     'Dedicated to academic excellence and student welfare',
--     1, 1,
--     (SELECT id FROM public.staff_hierarchy WHERE position = 'Principal' LIMIT 1),
--     'vp_academic@saraswati.edu', '+977-1-4123457',
--     'M.Ed. in Curriculum Design', 18, 'Curriculum Development'
-- );

-- Faculty Members (Level 2)
-- INSERT INTO public.staff_hierarchy (
--     name, "position", department, bio, hierarchy_level, order_index,
--     parent_id, email, phone, qualification, experience_years, specialization
-- ) VALUES (
--     'Mr. Amit Patel', 'Head of Science Department', 'Science',
--     'Physics expert passionate about practical learning',
--     2, 1,
--     (SELECT id FROM public.staff_hierarchy WHERE position = 'Vice Principal (Academic)' LIMIT 1),
--     'amit.patel@saraswati.edu', '+977-1-4123458',
--     'M.Sc. Physics', 15, 'Physics Education'
-- );

-- ───────────────────────────────────────────────────────────────────────────
-- 10. CREATE VIEW FOR EASY QUERYING
-- ───────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW public.staff_hierarchy_view AS
SELECT 
    id,
    name,
    "position",
    department,
    bio,
    parent_id,
    hierarchy_level,
    image_url,
    email,
    phone,
    office_location,
    qualification,
    experience_years,
    specialization,
    is_active,
    featured,
    display_order,
    created_at,
    updated_at
FROM public.staff_hierarchy
WHERE is_active = true
ORDER BY hierarchy_level ASC, display_order ASC, order_index ASC;

-- ───────────────────────────────────────────────────────────────────────────
-- End of Advanced Staff Hierarchy Setup
-- ───────────────────────────────────────────────────────────────────────────
