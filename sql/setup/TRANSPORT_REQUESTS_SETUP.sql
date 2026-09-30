-- ========================================================
-- TRANSPORT SERVICE ENROLLMENT REQUESTS SETUP
-- ========================================================

CREATE TABLE IF NOT EXISTS public.transport_requests (
    id SERIAL PRIMARY KEY,
    student_roll INTEGER NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    class_name VARCHAR(100),
    route_name VARCHAR(255) NOT NULL,
    monthly_fee NUMERIC NOT NULL,
    txn_code VARCHAR(100) NOT NULL,
    screenshot_url TEXT, -- Base64 string or file path for verification proof
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    rejection_reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.transport_requests ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access (select, insert, update, delete)
DROP POLICY IF EXISTS "Allow all public access to transport_requests" ON public.transport_requests;
CREATE POLICY "Allow all public access to transport_requests" ON public.transport_requests FOR ALL USING (true) WITH CHECK (true);
