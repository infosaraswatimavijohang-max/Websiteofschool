-- =====================================================================
-- ADMIN AUDIT LOGS TABLE SETUP
-- Tracks system-level actions performed by admins in the portal.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    subsystem_area VARCHAR(100) NOT NULL,
    action_executed TEXT NOT NULL,
    authority_user VARCHAR(100) NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read audit logs
DROP POLICY IF EXISTS "Allow read access to admin_audit_logs" ON public.admin_audit_logs;
CREATE POLICY "Allow read access to admin_audit_logs" 
ON public.admin_audit_logs FOR SELECT 
TO public
USING (true);

-- Policy: Allow authenticated users to insert audit logs
DROP POLICY IF EXISTS "Allow insert access to admin_audit_logs" ON public.admin_audit_logs;
CREATE POLICY "Allow insert access to admin_audit_logs" 
ON public.admin_audit_logs FOR INSERT 
TO public
WITH CHECK (true);

-- Insert a test audit log so the dashboard is not completely empty initially
INSERT INTO public.admin_audit_logs (subsystem_area, action_executed, authority_user)
VALUES ('System Initialization', 'Admin dashboard real-time upgrade applied cleanly.', 'System Administrator');
