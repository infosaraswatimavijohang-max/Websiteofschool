# 🔧 QUICK SETUP - Database Configuration

Follow these **exact steps** to fix the database error:

---

## ✅ Step-by-Step Setup

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com
2. Select your project
3. Click **"SQL Editor"** in the left menu

### Step 2: Run the Setup SQL
1. Click **"New Query"** button
2. Copy **ALL** the code from: **QUICK_SETUP.sql**
   - (Located in your project folder)
3. Paste it into the SQL Editor
4. Click the **"Run"** button (or press Ctrl+Enter)

### Step 3: Verify Success
You should see output like:
```
Admin Setup Complete!
email          | is_admin
info@sss.com   | true
```

---

## 🧪 Test It

1. **Go back to the admin portal** in your browser
2. **Make sure you're logged in** as `info@sss.com`
3. **Go to:** Academic → Class Setup
4. **Fill in the form:**
   - Grade Level: `Grade 1`
   - Section Name: `Section A` (optional)
   - Class Teacher: `Mr. Sharma` (optional)
   - Status: `Active`
5. **Click:** "Save Record to System"
6. **You should see:** ✅ "Class added successfully to database!"

---

## ⚠️ If Still Getting Error

**Error:** "Could not find the 'created_by' column..."

**Solution:** Make sure you ran the QUICK_SETUP.sql file and it completed successfully. The SQL adds the `created_by` column automatically.

---

## 🔐 What This SQL Does

✅ Creates `admin_users` table to manage admin access  
✅ Adds `created_by` column to `classes` table  
✅ Enables Row-Level Security (RLS) on both tables  
✅ Creates `is_admin()` function to check admin status  
✅ Sets up RLS policies so only admins can modify data  
✅ Adds `info@sss.com` as admin automatically  

---

## 📝 To Add More Admins

After running QUICK_SETUP.sql, you can add more admin users:

**Run this in SQL Editor:**
```sql
INSERT INTO admin_users (email, is_admin) 
VALUES ('teacher@school.com', true);
```

Or to remove admin access:
```sql
DELETE FROM admin_users WHERE email = 'teacher@school.com';
```

---

## 🚀 You're All Set!

Once QUICK_SETUP.sql runs successfully, the admin portal will:
- ✅ Save classes to Supabase database
- ✅ Show success messages
- ✅ Display records in the table
- ✅ Allow editing and deletion (with proper permissions)

Need help? Check the browser console (F12) for error details.
