-- ============================================================================
-- FILE:    CREATE_CATEGORIES_TABLE.sql
-- PURPOSE: Create academic_categories and academic_divisions tables with
--          proper policies if they do not exist.
-- ============================================================================

-- 1. Create academic_categories table if not exists
CREATE TABLE IF NOT EXISTS public.academic_categories (
    id            BIGSERIAL PRIMARY KEY,
    category_type VARCHAR(100) NOT NULL DEFAULT 'Fee',
    category_name VARCHAR(255) NOT NULL,
    description   TEXT,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.academic_categories ENABLE ROW LEVEL SECURITY;

-- Allow anon and authenticated access
DROP POLICY IF EXISTS "Allow all for anon on academic_categories" ON public.academic_categories;
CREATE POLICY "Allow all for anon on academic_categories"
    ON public.academic_categories FOR ALL TO anon
    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for authenticated on academic_categories" ON public.academic_categories;
CREATE POLICY "Allow all for authenticated on academic_categories"
    ON public.academic_categories FOR ALL TO authenticated
    USING (true) WITH CHECK (true);


-- 2. Create academic_divisions table if not exists
CREATE TABLE IF NOT EXISTS public.academic_divisions (
    id               BIGSERIAL PRIMARY KEY,
    division_name    VARCHAR(255) NOT NULL,
    division_type    VARCHAR(100) DEFAULT 'Section',
    description      TEXT,
    assigned_classes TEXT,
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    display_order    INT DEFAULT 0,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.academic_divisions ENABLE ROW LEVEL SECURITY;

-- Allow anon and authenticated access
DROP POLICY IF EXISTS "Allow all for anon on academic_divisions" ON public.academic_divisions;
CREATE POLICY "Allow all for anon on academic_divisions"
    ON public.academic_divisions FOR ALL TO anon
    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for authenticated on academic_divisions" ON public.academic_divisions;
CREATE POLICY "Allow all for authenticated on academic_divisions"
    ON public.academic_divisions FOR ALL TO authenticated
    USING (true) WITH CHECK (true);
