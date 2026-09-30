-- ========================================
-- QUICK SETUP FOR ADMIN SYSTEM
-- ========================================
-- Run this SQL in Supabase SQL Editor to enable database saving
-- Copy everything below and paste it in: SQL Editor → New Query → Run

-- Step 1: Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  is_admin BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- Step 2: Add required columns to classes table
ALTER TABLE classes ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT NULL;

-- Step 3: Insert admin user
INSERT INTO admin_users (email, is_admin)
VALUES ('info@sss.com', true)
ON CONFLICT (email) DO UPDATE SET is_admin = true;

-- Step 4: Enable RLS
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop old policies BEFORE dropping function
DROP POLICY IF EXISTS "Admins can insert classes" ON classes;
DROP POLICY IF EXISTS "Admins can read all classes" ON classes;
DROP POLICY IF EXISTS "Admins can update all classes" ON classes;
DROP POLICY IF EXISTS "Admins can delete classes" ON classes;
DROP POLICY IF EXISTS "Only admins can read admin users" ON admin_users;
DROP POLICY IF EXISTS "Only admins can insert admin users" ON admin_users;
DROP POLICY IF EXISTS "Only admins can update admin users" ON admin_users;
DROP POLICY IF EXISTS "Only admins can delete admin users" ON admin_users;

-- Step 6: Drop old function if it exists (after removing dependent policies)
DROP FUNCTION IF EXISTS is_admin(TEXT);

-- Step 7: Create helper function
CREATE FUNCTION is_admin(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.email = $1 AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create RLS Policies for classes
CREATE POLICY "Admins can insert classes"
ON classes FOR INSERT
WITH CHECK (is_admin(auth.email()));

CREATE POLICY "Admins can read all classes"
ON classes FOR SELECT
USING (is_admin(auth.email()));

CREATE POLICY "Admins can update all classes"
ON classes FOR UPDATE
USING (is_admin(auth.email()))
WITH CHECK (is_admin(auth.email()));

CREATE POLICY "Admins can delete classes"
ON classes FOR DELETE
USING (is_admin(auth.email()));

-- Step 9: Create RLS Policies for admin_users
CREATE POLICY "Only admins can read admin users"
ON admin_users FOR SELECT
USING (is_admin(auth.email()));

CREATE POLICY "Only admins can insert admin users"
ON admin_users FOR INSERT
WITH CHECK (is_admin(auth.email()));

CREATE POLICY "Only admins can update admin users"
ON admin_users FOR UPDATE
USING (is_admin(auth.email()))
WITH CHECK (is_admin(auth.email()));

CREATE POLICY "Only admins can delete admin users"
ON admin_users FOR DELETE
USING (is_admin(auth.email()));

-- ========================================
-- VERIFICATION
-- ========================================
SELECT 'Admin Setup Complete!' as status;
SELECT email, is_admin FROM admin_users WHERE email = 'info@sss.com';
