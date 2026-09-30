-- ==============================================================================
-- LIBRARY MODULE SETUP SCRIPT
-- ==============================================================================

-- 1. Create table for Library_Master
CREATE TABLE IF NOT EXISTS public.library_master (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wing_name TEXT NOT NULL,
    shelf_number TEXT NOT NULL,
    category_code TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_by TEXT
);
ALTER TABLE public.library_master ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users on library_master" ON public.library_master;
CREATE POLICY "Enable read access for all users on library_master" ON public.library_master FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users on library_master" ON public.library_master;
CREATE POLICY "Enable insert for authenticated users on library_master" ON public.library_master FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update for authenticated users on library_master" ON public.library_master;
CREATE POLICY "Enable update for authenticated users on library_master" ON public.library_master FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Enable delete for authenticated users on library_master" ON public.library_master;
CREATE POLICY "Enable delete for authenticated users on library_master" ON public.library_master FOR DELETE USING (true);

-- 2. Create table for Library_BookEntry
CREATE TABLE IF NOT EXISTS public.library_books (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    isbn TEXT NOT NULL,
    title TEXT NOT NULL,
    author TEXT,
    availability_status TEXT DEFAULT 'Available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_by TEXT
);
ALTER TABLE public.library_books ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users on library_books" ON public.library_books;
CREATE POLICY "Enable read access for all users on library_books" ON public.library_books FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users on library_books" ON public.library_books;
CREATE POLICY "Enable insert for authenticated users on library_books" ON public.library_books FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update for authenticated users on library_books" ON public.library_books;
CREATE POLICY "Enable update for authenticated users on library_books" ON public.library_books FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Enable delete for authenticated users on library_books" ON public.library_books;
CREATE POLICY "Enable delete for authenticated users on library_books" ON public.library_books FOR DELETE USING (true);

-- 3. Create table for Library_PrintBarcode
CREATE TABLE IF NOT EXISTS public.library_barcodes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    isbn TEXT NOT NULL,
    quantity NUMERIC DEFAULT 1,
    format TEXT,
    status TEXT DEFAULT 'Print Queue',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_by TEXT
);
ALTER TABLE public.library_barcodes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users on library_barcodes" ON public.library_barcodes;
CREATE POLICY "Enable read access for all users on library_barcodes" ON public.library_barcodes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users on library_barcodes" ON public.library_barcodes;
CREATE POLICY "Enable insert for authenticated users on library_barcodes" ON public.library_barcodes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update for authenticated users on library_barcodes" ON public.library_barcodes;
CREATE POLICY "Enable update for authenticated users on library_barcodes" ON public.library_barcodes FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Enable delete for authenticated users on library_barcodes" ON public.library_barcodes;
CREATE POLICY "Enable delete for authenticated users on library_barcodes" ON public.library_barcodes FOR DELETE USING (true);

-- 4. Create table for Library_LibraryMembership
CREATE TABLE IF NOT EXISTS public.library_memberships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    member_name TEXT NOT NULL,
    role TEXT,
    expiry_date TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_by TEXT
);
ALTER TABLE public.library_memberships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users on library_memberships" ON public.library_memberships;
CREATE POLICY "Enable read access for all users on library_memberships" ON public.library_memberships FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users on library_memberships" ON public.library_memberships;
CREATE POLICY "Enable insert for authenticated users on library_memberships" ON public.library_memberships FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update for authenticated users on library_memberships" ON public.library_memberships;
CREATE POLICY "Enable update for authenticated users on library_memberships" ON public.library_memberships FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Enable delete for authenticated users on library_memberships" ON public.library_memberships;
CREATE POLICY "Enable delete for authenticated users on library_memberships" ON public.library_memberships FOR DELETE USING (true);

-- 5. Create table for Library_LibraryCard
CREATE TABLE IF NOT EXISTS public.library_cards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cardholder_name TEXT NOT NULL,
    card_serial TEXT NOT NULL,
    issue_date TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_by TEXT
);
ALTER TABLE public.library_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users on library_cards" ON public.library_cards;
CREATE POLICY "Enable read access for all users on library_cards" ON public.library_cards FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users on library_cards" ON public.library_cards;
CREATE POLICY "Enable insert for authenticated users on library_cards" ON public.library_cards FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update for authenticated users on library_cards" ON public.library_cards;
CREATE POLICY "Enable update for authenticated users on library_cards" ON public.library_cards FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Enable delete for authenticated users on library_cards" ON public.library_cards;
CREATE POLICY "Enable delete for authenticated users on library_cards" ON public.library_cards FOR DELETE USING (true);

-- 6. Create table for Library_BookIssue
CREATE TABLE IF NOT EXISTS public.library_issues (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    isbn TEXT NOT NULL,
    member_id TEXT NOT NULL,
    issue_date TEXT,
    due_date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_by TEXT
);
ALTER TABLE public.library_issues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users on library_issues" ON public.library_issues;
CREATE POLICY "Enable read access for all users on library_issues" ON public.library_issues FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users on library_issues" ON public.library_issues;
CREATE POLICY "Enable insert for authenticated users on library_issues" ON public.library_issues FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update for authenticated users on library_issues" ON public.library_issues;
CREATE POLICY "Enable update for authenticated users on library_issues" ON public.library_issues FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Enable delete for authenticated users on library_issues" ON public.library_issues;
CREATE POLICY "Enable delete for authenticated users on library_issues" ON public.library_issues FOR DELETE USING (true);

-- 7. Create table for Library_BookReceived
CREATE TABLE IF NOT EXISTS public.library_returns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    transaction_id TEXT NOT NULL,
    return_date TEXT,
    late_fine NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Returned Intact',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_by TEXT
);
ALTER TABLE public.library_returns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users on library_returns" ON public.library_returns;
CREATE POLICY "Enable read access for all users on library_returns" ON public.library_returns FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users on library_returns" ON public.library_returns;
CREATE POLICY "Enable insert for authenticated users on library_returns" ON public.library_returns FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update for authenticated users on library_returns" ON public.library_returns;
CREATE POLICY "Enable update for authenticated users on library_returns" ON public.library_returns FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Enable delete for authenticated users on library_returns" ON public.library_returns;
CREATE POLICY "Enable delete for authenticated users on library_returns" ON public.library_returns FOR DELETE USING (true);

-- 8. Create table for Library_Report
CREATE TABLE IF NOT EXISTS public.library_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_name TEXT NOT NULL,
    audit_category TEXT,
    audit_date TEXT,
    status TEXT DEFAULT 'Draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_by TEXT
);
ALTER TABLE public.library_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users on library_reports" ON public.library_reports;
CREATE POLICY "Enable read access for all users on library_reports" ON public.library_reports FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users on library_reports" ON public.library_reports;
CREATE POLICY "Enable insert for authenticated users on library_reports" ON public.library_reports FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update for authenticated users on library_reports" ON public.library_reports;
CREATE POLICY "Enable update for authenticated users on library_reports" ON public.library_reports FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Enable delete for authenticated users on library_reports" ON public.library_reports;
CREATE POLICY "Enable delete for authenticated users on library_reports" ON public.library_reports FOR DELETE USING (true);

-- 9. Create table for Library_Setting
CREATE TABLE IF NOT EXISTS public.library_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    fine_rate NUMERIC DEFAULT 0,
    max_books NUMERIC DEFAULT 0,
    max_days NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_by TEXT
);
ALTER TABLE public.library_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users on library_settings" ON public.library_settings;
CREATE POLICY "Enable read access for all users on library_settings" ON public.library_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users on library_settings" ON public.library_settings;
CREATE POLICY "Enable insert for authenticated users on library_settings" ON public.library_settings FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update for authenticated users on library_settings" ON public.library_settings;
CREATE POLICY "Enable update for authenticated users on library_settings" ON public.library_settings FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Enable delete for authenticated users on library_settings" ON public.library_settings;
CREATE POLICY "Enable delete for authenticated users on library_settings" ON public.library_settings FOR DELETE USING (true);

-- End of Setup Script
