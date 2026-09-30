-- Create a table for raw attendance logs from the ADMS machine
CREATE TABLE public.attendance_logs (
    id SERIAL PRIMARY KEY,
    device_sn VARCHAR(255),
    user_id VARCHAR(255) NOT NULL,
    verify_time TIMESTAMP NOT NULL,
    verify_type VARCHAR(50),
    verify_state VARCHAR(50),
    work_code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX idx_attendance_logs_user_id ON public.attendance_logs(user_id);
CREATE INDEX idx_attendance_logs_verify_time ON public.attendance_logs(verify_time);

-- Allow anonymous access for the ADMS API insert
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable insert for anonymous users" ON public.attendance_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for anonymous users" ON public.attendance_logs FOR SELECT USING (true);
