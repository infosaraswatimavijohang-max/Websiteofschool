-- ============================================================================
-- FILE:    CREATE_MISSING_TABLES.sql
-- PURPOSE: Create all missing tables that the admin panel references
--          but don't yet exist in Supabase
-- DATE:    2026-06-05
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. ACADEMIC CATEGORIES
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.academic_categories (
    id            BIGSERIAL PRIMARY KEY,
    category_type VARCHAR(100) NOT NULL DEFAULT 'Fee',          -- Fee, Leave, Subject, etc.
    category_name VARCHAR(255) NOT NULL,
    description   TEXT,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.academic_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for anon on academic_categories"
    ON public.academic_categories FOR ALL TO anon
    USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated on academic_categories"
    ON public.academic_categories FOR ALL TO authenticated
    USING (true) WITH CHECK (true);


-- ────────────────────────────────────────────────────────────────────────────
-- 2. ACADEMIC DIVISIONS
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.academic_divisions (
    id               BIGSERIAL PRIMARY KEY,
    division_name    VARCHAR(255) NOT NULL,
    division_type    VARCHAR(100) DEFAULT 'Section',           -- Section, Stream, Faculty
    description      TEXT,
    assigned_classes TEXT,                                      -- comma-separated class list
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    display_order    INT DEFAULT 0,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.academic_divisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for anon on academic_divisions"
    ON public.academic_divisions FOR ALL TO anon
    USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated on academic_divisions"
    ON public.academic_divisions FOR ALL TO authenticated
    USING (true) WITH CHECK (true);


-- ────────────────────────────────────────────────────────────────────────────
-- 3. STUDENT REMARKS
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.student_remarks (
    id            BIGSERIAL PRIMARY KEY,
    student_roll  VARCHAR(50),
    student_name  VARCHAR(255),
    class_name    VARCHAR(100),
    remark_type   VARCHAR(100) DEFAULT 'General',              -- General, Behavioral, Academic
    remark_text   TEXT,
    recorded_by   VARCHAR(255),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.student_remarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for anon on student_remarks"
    ON public.student_remarks FOR ALL TO anon
    USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated on student_remarks"
    ON public.student_remarks FOR ALL TO authenticated
    USING (true) WITH CHECK (true);


-- ────────────────────────────────────────────────────────────────────────────
-- 4. STUDENT CERTIFICATES (TC/CC)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.student_certificates (
    id                BIGSERIAL PRIMARY KEY,
    student_roll      VARCHAR(50),
    student_name      VARCHAR(255),
    certificate_type  VARCHAR(200) NOT NULL,                   -- TC, CC, Both, Sports, etc.
    issue_date        DATE,
    status            VARCHAR(50) DEFAULT 'Pending Approval',  -- Issued, Pending, Cancelled
    file_url          TEXT,                                      -- URL to uploaded document
    remarks           TEXT,
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.student_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for anon on student_certificates"
    ON public.student_certificates FOR ALL TO anon
    USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated on student_certificates"
    ON public.student_certificates FOR ALL TO authenticated
    USING (true) WITH CHECK (true);


-- ────────────────────────────────────────────────────────────────────────────
-- 5. LESSON PLANS
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lesson_plans (
    id             BIGSERIAL PRIMARY KEY,
    teacher_code   VARCHAR(50),
    teacher_name   VARCHAR(255),
    class_name     VARCHAR(100),
    subject_name   VARCHAR(200),
    topic          VARCHAR(500),
    objectives     TEXT,
    plan_content   TEXT,
    resources      TEXT,
    status         VARCHAR(50) DEFAULT 'Draft',                -- Draft, Submitted, Approved
    plan_date      DATE,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for anon on lesson_plans"
    ON public.lesson_plans FOR ALL TO anon
    USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated on lesson_plans"
    ON public.lesson_plans FOR ALL TO authenticated
    USING (true) WITH CHECK (true);


-- ────────────────────────────────────────────────────────────────────────────
-- 6. CLASS TIMETABLE (for matrix-based timetable assignments)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.class_timetable (
    id              BIGSERIAL PRIMARY KEY,
    class_id        BIGINT,
    grade_level     VARCHAR(100),
    section_name    VARCHAR(100),
    subject_id      BIGINT,
    subject_name    VARCHAR(200),
    teacher_code    VARCHAR(50),
    teacher_name    VARCHAR(255),
    day_of_week     VARCHAR(20) NOT NULL,                      -- Sunday, Monday, etc.
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    classroom_number VARCHAR(50),
    remarks         TEXT,
    status          VARCHAR(50) DEFAULT 'Active',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.class_timetable ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for anon on class_timetable"
    ON public.class_timetable FOR ALL TO anon
    USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated on class_timetable"
    ON public.class_timetable FOR ALL TO authenticated
    USING (true) WITH CHECK (true);


-- ────────────────────────────────────────────────────────────────────────────
-- 7. DYNAMIC REPORTS
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dynamic_reports (
    id             BIGSERIAL PRIMARY KEY,
    report_title   VARCHAR(500) NOT NULL,
    module_area    VARCHAR(200),
    generated_by   VARCHAR(255),
    report_date    DATE,
    status         VARCHAR(50) DEFAULT 'Draft',
    file_url       TEXT,
    remarks        TEXT,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.dynamic_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for anon on dynamic_reports"
    ON public.dynamic_reports FOR ALL TO anon
    USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated on dynamic_reports"
    ON public.dynamic_reports FOR ALL TO authenticated
    USING (true) WITH CHECK (true);


-- ────────────────────────────────────────────────────────────────────────────
-- Done! All tables created with RLS policies for anon and authenticated.
-- Run this script in the Supabase SQL Editor to fix "table not found" errors.
-- ────────────────────────────────────────────────────────────────────────────
