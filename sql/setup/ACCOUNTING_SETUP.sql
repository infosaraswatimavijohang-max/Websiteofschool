-- ==============================================================================
-- ACCOUNTING MODULE SETUP SCRIPT
-- Tables: accounting_ledgers, accounting_transactions, accounting_reports
-- ==============================================================================

-- 1. Create table for Accounting_Creation (Ledgers)
CREATE TABLE IF NOT EXISTS public.accounting_ledgers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ledger_name TEXT NOT NULL,
    account_type TEXT NOT NULL,
    opening_balance NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Active Ledger',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_by TEXT
);

-- Enable RLS for accounting_ledgers
ALTER TABLE public.accounting_ledgers ENABLE ROW LEVEL SECURITY;

-- Create policies for accounting_ledgers
DROP POLICY IF EXISTS "Enable read access for all users on accounting_ledgers" ON public.accounting_ledgers;
CREATE POLICY "Enable read access for all users on accounting_ledgers"
ON public.accounting_ledgers FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users on accounting_ledgers" ON public.accounting_ledgers;
CREATE POLICY "Enable insert for authenticated users on accounting_ledgers"
ON public.accounting_ledgers FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for authenticated users on accounting_ledgers" ON public.accounting_ledgers;
CREATE POLICY "Enable update for authenticated users on accounting_ledgers"
ON public.accounting_ledgers FOR UPDATE
USING (true);

DROP POLICY IF EXISTS "Enable delete for authenticated users on accounting_ledgers" ON public.accounting_ledgers;
CREATE POLICY "Enable delete for authenticated users on accounting_ledgers"
ON public.accounting_ledgers FOR DELETE
USING (true);


-- 2. Create table for Accounting_Transaction
CREATE TABLE IF NOT EXISTS public.accounting_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    transaction_ref TEXT NOT NULL,
    amount NUMERIC DEFAULT 0,
    description TEXT,
    transaction_type TEXT NOT NULL,
    status TEXT DEFAULT 'Completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_by TEXT
);

-- Enable RLS for accounting_transactions
ALTER TABLE public.accounting_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for accounting_transactions
DROP POLICY IF EXISTS "Enable read access for all users on accounting_transactions" ON public.accounting_transactions;
CREATE POLICY "Enable read access for all users on accounting_transactions"
ON public.accounting_transactions FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users on accounting_transactions" ON public.accounting_transactions;
CREATE POLICY "Enable insert for authenticated users on accounting_transactions"
ON public.accounting_transactions FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for authenticated users on accounting_transactions" ON public.accounting_transactions;
CREATE POLICY "Enable update for authenticated users on accounting_transactions"
ON public.accounting_transactions FOR UPDATE
USING (true);

DROP POLICY IF EXISTS "Enable delete for authenticated users on accounting_transactions" ON public.accounting_transactions;
CREATE POLICY "Enable delete for authenticated users on accounting_transactions"
ON public.accounting_transactions FOR DELETE
USING (true);


-- 3. Create table for Accounting_Reporting
CREATE TABLE IF NOT EXISTS public.accounting_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ledger_scope TEXT NOT NULL,
    reporting_period TEXT NOT NULL,
    format_style TEXT NOT NULL,
    audit_status TEXT DEFAULT 'Draft Verification',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_by TEXT
);

-- Enable RLS for accounting_reports
ALTER TABLE public.accounting_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for accounting_reports
DROP POLICY IF EXISTS "Enable read access for all users on accounting_reports" ON public.accounting_reports;
CREATE POLICY "Enable read access for all users on accounting_reports"
ON public.accounting_reports FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users on accounting_reports" ON public.accounting_reports;
CREATE POLICY "Enable insert for authenticated users on accounting_reports"
ON public.accounting_reports FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for authenticated users on accounting_reports" ON public.accounting_reports;
CREATE POLICY "Enable update for authenticated users on accounting_reports"
ON public.accounting_reports FOR UPDATE
USING (true);

DROP POLICY IF EXISTS "Enable delete for authenticated users on accounting_reports" ON public.accounting_reports;
CREATE POLICY "Enable delete for authenticated users on accounting_reports"
ON public.accounting_reports FOR DELETE
USING (true);

-- End of Setup Script
