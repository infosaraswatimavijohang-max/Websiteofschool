-- ====================================================================
-- ATTENDANCE DEVICES DATABASE TABLE SETUP
-- ====================================================================

-- 1. Create the attendance_devices table in public schema
CREATE TABLE IF NOT EXISTS public.attendance_devices (
    id SERIAL PRIMARY KEY,
    device_name VARCHAR(255) NOT NULL,
    ip_serial VARCHAR(255) UNIQUE NOT NULL, -- Unique IP Address or Serial number
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Online', -- Online, Offline, Maintenance
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for faster lookup by IP/Serial number
CREATE INDEX IF NOT EXISTS idx_attendance_devices_ip_serial ON public.attendance_devices(ip_serial);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.attendance_devices ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policy if it exists to allow clean re-runs
DROP POLICY IF EXISTS "Allow all public access" ON public.attendance_devices;

-- 4. Create the public access policy
CREATE POLICY "Allow all public access" 
ON public.attendance_devices 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Insert a mock device for testing if empty
INSERT INTO public.attendance_devices (device_name, ip_serial, location, status, created_by)
VALUES ('ZKTeco Face Reader', '192.168.1.150', 'Main Reception Gate', 'Online', 'info@sss.com')
ON CONFLICT (ip_serial) DO NOTHING;
