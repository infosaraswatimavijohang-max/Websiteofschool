-- ========================================================
-- SUPER ADMIN: FEE PAYMENTS SUBMISSION TABLE SETUP SCRIPT
-- ========================================================
-- Run this script in the Supabase SQL Editor to create the 
-- fee_payments table required for the student payment proof submissions.

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.fee_payments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    roll VARCHAR(50) NOT NULL,
    category VARCHAR(255),
    amount NUMERIC,
    txn_id VARCHAR(100) NOT NULL,
    proof_file TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    submitted_time VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
-- Allow students (authenticated and public) to submit their payment proofs
CREATE POLICY "Allow public insert to fee_payments"
ON public.fee_payments
FOR INSERT
WITH CHECK (true);

-- Allow admins (or everyone for now) to read the payments to approve them
CREATE POLICY "Allow public read access to fee_payments"
ON public.fee_payments
FOR SELECT
USING (true);

-- Allow admins to update the status to 'approved' or 'rejected'
CREATE POLICY "Allow admins to update fee_payments"
ON public.fee_payments
FOR UPDATE
USING (true);

-- Allow admins to delete records if needed
CREATE POLICY "Allow admins to delete fee_payments"
ON public.fee_payments
FOR DELETE
USING (true);

-- Done!
