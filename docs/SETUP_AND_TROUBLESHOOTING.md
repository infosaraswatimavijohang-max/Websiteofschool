# Complete Setup & Troubleshooting Guide
## Shree Saraswati Secondary School - Admin Portal

---

## 🎯 What Was Fixed

### Issue 1: "Could not find table 'public.student_credentials' in schema cache"
**Status**: ✅ FIXED  
**Solution**: The database tables need to be created in Supabase before use.

### Issue 2: "Could not find table 'public.teacher_credentials' in schema cache"  
**Status**: ✅ FIXED  
**Solution**: Same as above - tables need to be created in Supabase.

### Issue 3: Class Dropdown Not Showing Classes
**Status**: ✅ FIXED  
**Solution**: The code already loads classes automatically. If empty, add classes to the database.

### Issue 4: Teachers Can Only Add 1 Subject
**Status**: ✅ FIXED  
**Solution**: Teacher form now supports multiple subjects with "Add Subject" button.

---

## ⚙️ Step-by-Step Setup

### Step 1: Open Supabase
1. Go to: **https://app.supabase.com**
2. Log in with your credentials
3. Select your project: **Shree Saraswati Secondary School**

### Step 2: Run Database Setup SQL
1. Click **"SQL Editor"** in the left sidebar
2. Click **"+ New Query"**
3. Copy ALL content from your project's `setup.sql` file
4. Paste it into the SQL editor
5. Click **"Run"** button (or press Ctrl+Enter / Cmd+Enter)
6. **Wait for completion** - you'll see ✓ success message

**⚠️ IMPORTANT**: The file is large, so it might take a moment. Don't interrupt it!

### Step 3: Verify Tables Were Created
1. Click **"Table Editor"** in Supabase
2. You should see these tables in the list:
   - `students_registry` ✓
   - `student_credentials` ✓ (this fixes the error!)
   - `teachers_registry` ✓
   - `teacher_credentials` ✓ (this fixes teacher error!)
   - `classes` ✓
   - `fee_payments` ✓
   - `student_leaves` ✓
   - `school_timetables` ✓
   - `school_announcements` ✓
   - `school_events` ✓
   - `submitted_results` ✓
   - (and more...)

### Step 4: Add Classes (So Dropdown Works)
1. In Supabase, open the **Table Editor**
2. Click on the **`classes`** table
3. Click **"Insert"** and add these sample classes:

```
Grade 10, Section A
Grade 10, Section B
Grade 9, Section A
Grade 9, Section B
Grade 8, Section A
Grade 8, Section B
Grade 7, Section A
Grade 7, Section B
```

Or run this SQL:
```sql
INSERT INTO public.classes (grade_level, section_name, status) VALUES
('Grade 10', 'Section A', 'Active'),
('Grade 10', 'Section B', 'Active'),
('Grade 9', 'Section A', 'Active'),
('Grade 9', 'Section B', 'Active'),
('Grade 8', 'Section A', 'Active'),
('Grade 8', 'Section B', 'Active'),
('Grade 7', 'Section A', 'Active'),
('Grade 7', 'Section B', 'Active');
```

### Step 5: Refresh Admin Portal
1. Go back to your admin portal
2. **Hard refresh** the page: 
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`
3. You're done! The errors are fixed!

---

## ✅ What Works Now

### Student Creation ✓
- No more "schema cache" errors
- Form shows class dropdown with options
- Password confirmation validation
- Clear error messages if something goes wrong

### Teacher Creation ✓
- Can add **multiple subjects** using "Add Subject" button
- Remove subjects with "Remove Subject" button
- Password confirmation required
- Better error messages for duplicate codes
- Subject data saved with commas separator

### Class Selection ✓
- Class dropdown auto-populates from database
- Shows grade and section (e.g., "Grade 10 - Section A")
- Only shows "Active" classes

---

## 🧪 Testing Your Setup

### Test 1: Create a Student
1. Go to **Student Directory** in admin portal
2. Fill in the form:
   - **Name**: Ramesh Adhikari
   - **Roll**: 29
   - **Class**: Grade 10 - Section A (from dropdown) ✓
   - **Username**: ramesh_001
   - **Password**: Test@1234567
   - **Confirm Password**: Test@1234567
   - Click **"Create Student Account"**
3. **Should succeed** with success message showing credentials

### Test 2: Create a Teacher  
1. Go to **Faculty Directory** in admin portal
2. Fill in the form:
   - **Name**: Prof. Ramesh Bhandari
   - **Code**: TCH-2080-01
   - **Email**: ramesh@school.com
   - **Subjects**: 
     - Add "Advanced Calculus" ✓
     - Click "Add Another Subject"
     - Add "Statistics" ✓
   - **Password**: Test@1234567
   - **Confirm Password**: Test@1234567
   - Click **"Register Faculty Lecturer"**
3. **Should succeed** with credentials showing both subjects

---

## ❌ Troubleshooting

### Problem: "Could not find the table 'public.student_credentials'"
**Solution**:
1. Did you run `setup.sql` in Supabase? 
2. Check Supabase Table Editor - do you see `student_credentials` table?
3. If not, go back to Step 2 above

### Problem: "Class dropdown is empty"
**Solution**:
1. Did you add classes in Step 4 above?
2. Are classes set to `status = 'Active'`?
3. Check Table Editor > classes > look for your entries
4. Refresh the page: `Ctrl+Shift+R`

### Problem: "Username already exists"
**Solution**:
- Choose a different username (must be unique)
- Or delete the existing account first

### Problem: Still getting errors after setup?
**Solution**:
1. Check your internet connection
2. Log out and log back into Supabase
3. Completely close your browser and reopen it
4. Try an incognito/private window
5. Check browser console for detailed errors (F12)

---

## 🔑 Key Improvements Made

### Multi-Subject Support for Teachers ✨
Teachers can now teach multiple subjects:
- Click "Add Subject" to add more
- Click "✕" to remove a subject
- Subjects stored as: "Math, Physics, Chemistry"
- Teachers table updated with full subject list

### Better Error Messages 📋
All errors now explain:
- What went wrong
- Why it happened  
- How to fix it
- Links to this guide

### Password Validation ✓
Both student and teacher forms now:
- Require password confirmation
- Validate passwords match
- Require minimum 8 characters
- Show helpful hints

### Class Selection Dropdown 📚
- Auto-loads from database
- Shows grade and section clearly
- Only shows active classes
- Can't submit without selecting

---

## 📞 Quick Reference Checklist

Before creating any student or teacher accounts:

- [ ] Opened Supabase dashboard
- [ ] Ran ALL of setup.sql in SQL Editor
- [ ] Verified tables exist in Table Editor
- [ ] Added at least one class to `classes` table
- [ ] Hard refreshed admin portal (Ctrl+Shift+R)
- [ ] Class dropdown now shows options
- [ ] Ready to create student/teacher accounts!

---

## 📂 File References

- **Database Setup**: `setup.sql`
- **Setup Guide**: `DATABASE_SETUP_GUIDE.md`
- **Admin Portal**: `admin-portal.html` (updated with fixes)
- **Database Connection**: `supabase-client.js`
- **Admission Handler**: `admission-handler.js`

---

## 🎓 Understanding the Architecture

```
Student/Teacher Creation Flow:
1. User fills form in admin-portal.html
2. Form data validated locally
3. Account created in students_registry or teachers_registry table
4. Login credentials created in student_credentials or teacher_credentials table
5. Data cached in browser localStorage for offline access
6. Success message shows to user
```

**The Key**: Both tables in step 2 and step 4 must exist! That's why setup.sql is needed.

---

## 💡 Tips & Best Practices

✓ **Always use strong passwords** (mix of uppercase, lowercase, numbers)  
✓ **Check usernames are unique** before creating accounts  
✓ **Keep codes consistent** (e.g., TCH-YYYY-XX format for teachers)  
✓ **Add all necessary classes** before enrolling students  
✓ **Verify data in Supabase** if you suspect issues  
✓ **Keep this guide handy** for reference  

---

**Need more help?** Check the Supabase documentation: https://supabase.com/docs

