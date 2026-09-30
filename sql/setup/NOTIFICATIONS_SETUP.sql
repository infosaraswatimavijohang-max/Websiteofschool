-- =================================================================================
-- SYSTEM NOTIFICATIONS SETUP SCRIPT
-- =================================================================================

-- 1. Create the system_notifications table
CREATE TABLE IF NOT EXISTS public.system_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_role VARCHAR(50) NOT NULL, -- 'admin', 'teacher', 'student', 'all'
  recipient_id VARCHAR(100), -- Specific user ID (e.g., student_roll, teacher_email) or NULL for broadcast
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info', -- 'info', 'success', 'warning', 'danger'
  is_read BOOLEAN DEFAULT false,
  action_url VARCHAR(255), -- Optional link when clicked
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Enable Row Level Security
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies

-- Allow read access based on role/ID
-- Note: Since this is an anonymous/client-side access setup without full auth,
-- we allow read access to all for now. In a strictly secure environment, we would tie this to auth.uid()
CREATE POLICY "Enable read access for all users" ON public.system_notifications
  FOR SELECT USING (true);

-- Allow insert access for all users (e.g. students creating leave requests that notify admin)
CREATE POLICY "Enable insert access for all users" ON public.system_notifications
  FOR INSERT WITH CHECK (true);

-- Allow update access (for marking as read)
CREATE POLICY "Enable update access for all users" ON public.system_notifications
  FOR UPDATE USING (true);

-- Allow delete access
CREATE POLICY "Enable delete access for all users" ON public.system_notifications
  FOR DELETE USING (true);

-- 4. Insert some seed data
INSERT INTO public.system_notifications (recipient_role, title, message, type)
VALUES 
  ('all', 'System Update', 'The dynamic notification system is now live!', 'success'),
  ('admin', 'Welcome Admin', 'You can now monitor system events here.', 'info')
ON CONFLICT DO NOTHING;
