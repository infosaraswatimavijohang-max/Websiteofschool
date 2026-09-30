#!/bin/bash

# ════════════════════════════════════════════════════════════════════════════
# ADVANCED STAFF HIERARCHY SETUP GUIDE
# ════════════════════════════════════════════════════════════════════════════
# This guide covers the complete setup and implementation of the advanced
# staff hierarchy management system with image uploads and tree visualization
# ════════════════════════════════════════════════════════════════════════════

# ────────────────────────────────────────────────────────────────────────────
# STEP 1: DATABASE SETUP
# ────────────────────────────────────────────────────────────────────────────

echo "=== Step 1: Database Setup ==="
echo "Execute the following SQL in your Supabase project:"
echo ""
echo "1. Open https://app.supabase.com → Your Project"
echo "2. Go to SQL Editor → New Query"
echo "3. Copy and paste the entire content of: STAFF_HIERARCHY_ADVANCED.sql"
echo "4. Click 'Run'"
echo ""
echo "This will create:"
echo "  ✓ Staff hierarchy table with all required fields"
echo "  ✓ Storage bucket for staff images"
echo "  ✓ Security policies for public/admin access"
echo "  ✓ Audit logging table"
echo "  ✓ Performance indexes"
echo "  ✓ Tree structure functions"
echo ""

# ────────────────────────────────────────────────────────────────────────────
# STEP 2: FILE STRUCTURE
# ────────────────────────────────────────────────────────────────────────────

echo "=== Step 2: File Structure ==="
echo "Ensure all files are in your project directory:"
echo ""
echo "  ✓ STAFF_HIERARCHY_ADVANCED.sql     - Database schema"
echo "  ✓ staff-handler.js                  - CRUD operations handler"
echo "  ✓ staff-management-admin.html       - Admin management panel"
echo "  ✓ organizational-tree.html          - Public tree visualization"
echo "  ✓ supabase-client.js               - Existing client (already present)"
echo ""

# ────────────────────────────────────────────────────────────────────────────
# STEP 3: ADMIN PANEL INTEGRATION
# ────────────────────────────────────────────────────────────────────────────

echo "=== Step 3: Admin Panel Integration ==="
echo ""
echo "Option A: Add as Tab in Existing Admin Portal"
echo "  1. Open admin-portal.html"
echo "  2. Add this link to the navigation menu:"
echo ""
echo "    <a href='staff-management-admin.html' class='nav-link'>"
echo "      <i class='fas fa-sitemap'></i> Staff Hierarchy"
echo "    </a>"
echo ""
echo "Option B: Include as iframe in Admin Portal"
echo "  1. Add this HTML where you want the staff manager:"
echo ""
echo "    <iframe src='staff-management-admin.html' style='width:100%; height:100vh; border:none;'></iframe>"
echo ""

# ────────────────────────────────────────────────────────────────────────────
# STEP 4: PUBLIC TREE ON ABOUT PAGE
# ────────────────────────────────────────────────────────────────────────────

echo "=== Step 4: Public Tree on About Page ==="
echo ""
echo "To add organizational tree to your About page:"
echo "  1. Open about.html"
echo "  2. Add this section where you want the tree:"
echo ""
echo "    <section class='organizational-section'>"
echo "      <h2>Our Leadership Structure</h2>"
echo "      <p><a href='organizational-tree.html'>View our organizational structure</a></p>"
echo "      <!-- Or embed with iframe: -->"
echo "      <iframe src='organizational-tree.html' style='width:100%; height:600px; border:none;'></iframe>"
echo "    </section>"
echo ""

# ────────────────────────────────────────────────────────────────────────────
# STEP 5: BASIC USAGE
# ────────────────────────────────────────────────────────────────────────────

echo "=== Step 5: Basic Usage ==="
echo ""
echo "📝 Adding a New Staff Member:"
echo "  1. Go to Admin Panel → Staff Hierarchy"
echo "  2. Click 'Add New Staff'"
echo "  3. Fill in details:"
echo "     - Full Name (required)"
echo "     - Position (required)"
echo "     - Department (required)"
echo "     - Bio/Description"
echo "     - Contact info (email, phone)"
echo "     - Professional details"
echo "  4. Select 'Reports To' (parent manager)"
echo "  5. Set hierarchy level (Principal, VP, Head, Teacher, etc)"
echo "  6. Upload profile image"
echo "  7. Click 'Save Staff Member'"
echo ""

echo "📊 Managing Hierarchy:"
echo "  - Use 'Reports To' field to create reporting structure"
echo "  - Adjust 'Display Order' for positioning"
echo "  - Mark as 'Featured' to highlight key positions"
echo ""

echo "👁️ Viewing Structure:"
echo "  - Gallery View: Cards with images and details"
echo "  - Tree View: Hierarchical organization chart"
echo "  - Table View: Spreadsheet format"
echo "  - Statistics: Department counts and staff distribution"
echo ""

# ────────────────────────────────────────────────────────────────────────────
# STEP 6: ADVANCED FEATURES
# ────────────────────────────────────────────────────────────────────────────

echo "=== Step 6: Advanced Features ==="
echo ""
echo "🖼️ Image Management:"
echo "  - Supported formats: JPEG, PNG, WebP"
echo "  - Max size: 5MB per image"
echo "  - Optimal size: 500x500px or larger"
echo "  - Images stored in Supabase Storage (staff-images bucket)"
echo "  - Public access enabled for display"
echo ""

echo "🔐 Security:"
echo "  - Admins only: Create, edit, delete staff"
echo "  - Public: View active staff only"
echo "  - Row-level security (RLS) enforced"
echo "  - Audit logging of all changes"
echo ""

echo "🔍 Search & Filter:"
echo "  - Search by name, position, or department"
echo "  - Filter by department"
echo "  - Featured staff highlights"
echo "  - Tree sorting and organization"
echo ""

echo "📤 Data Management:"
echo "  - Export staff data to JSON"
echo "  - Soft delete (preserve audit history)"
echo "  - Hard delete available"
echo "  - Audit log tracking all modifications"
echo ""

# ────────────────────────────────────────────────────────────────────────────
# STEP 7: DATABASE OPERATIONS
# ────────────────────────────────────────────────────────────────────────────

echo "=== Step 7: Database Operations (JavaScript) ==="
echo ""
echo "Create Staff:"
echo "  await staffHandler.createStaff({"
echo "    name: 'Dr. John Doe',"
echo "    position: 'Principal',"
echo "    department: 'Administration',"
echo "    bio: 'Visionary leader...'"
echo "  });"
echo ""

echo "Get All Staff:"
echo "  await staffHandler.getAllStaff({ department: 'Science' });"
echo ""

echo "Get Hierarchy Tree:"
echo "  await staffHandler.getStaffTree();"
echo ""

echo "Update Staff:"
echo "  await staffHandler.updateStaff(staffId, {"
echo "    position: 'Vice Principal'"
echo "  });"
echo ""

echo "Upload Image:"
echo "  await staffHandler.uploadImage(staffId, fileObject);"
echo ""

echo "Delete Staff:"
echo "  await staffHandler.deleteStaff(staffId);"
echo ""

echo "Search Staff:"
echo "  await staffHandler.searchStaff('John');"
echo ""

echo "Get Statistics:"
echo "  await staffHandler.getStatistics();"
echo ""

echo "Get Featured Staff:"
echo "  await staffHandler.getFeaturedStaff();"
echo ""

# ────────────────────────────────────────────────────────────────────────────
# STEP 8: DATABASE FIELDS REFERENCE
# ────────────────────────────────────────────────────────────────────────────

echo "=== Step 8: Database Fields Reference ==="
echo ""
echo "Personal Information:"
echo "  - id: UUID (auto-generated)"
echo "  - name: Full name (required)"
echo "  - email: Email address"
echo "  - phone: Contact number"
echo "  - bio: Biography/description"
echo ""

echo "Professional Information:"
echo "  - position: Job title (required)"
echo "  - department: Department name (required)"
echo "  - qualification: Degree/certification"
echo "  - experience_years: Years of experience"
echo "  - specialization: Area of expertise"
echo "  - office_location: Room/office number"
echo ""

echo "Hierarchy:"
echo "  - parent_id: Superior's ID (for reporting structure)"
echo "  - hierarchy_level: 0=Principal, 1=VP, 2=Head, 3=Teacher, 4=Support"
echo "  - order_index: Sort order within level"
echo "  - display_order: Custom display position"
echo ""

echo "Images:"
echo "  - image_url: Full URL to image in storage"
echo "  - image_name: Filename in storage"
echo "  - image_size: File size in bytes"
echo "  - image_uploaded_at: Upload timestamp"
echo ""

echo "Status:"
echo "  - is_active: Active/inactive status"
echo "  - featured: Show in featured section"
echo "  - created_at: Creation timestamp"
echo "  - updated_at: Last update timestamp"
echo ""

# ────────────────────────────────────────────────────────────────────────────
# STEP 9: CUSTOMIZATION GUIDE
# ────────────────────────────────────────────────────────────────────────────

echo "=== Step 9: Customization Guide ==="
echo ""
echo "Change Colors:"
echo "  1. Open staff-management-admin.html or organizational-tree.html"
echo "  2. Find :root { in <style> section"
echo "  3. Modify CSS variables:"
echo "     --primary: Main color"
echo "     --accent: Highlight color"
echo "     --secondary: Secondary color"
echo ""

echo "Add Custom Fields:"
echo "  1. Update database table in STAFF_HIERARCHY_ADVANCED.sql"
echo "  2. Add field to SQL ALTER TABLE"
echo "  3. Update form in staff-management-admin.html"
echo "  4. Add to handler.js createStaff() and updateStaff()"
echo ""

echo "Modify Hierarchy Levels:"
echo "  1. Edit hierarchy_level options in form"
echo "  2. Update tree rendering logic"
echo "  3. Adjust groupBy() in statistics"
echo ""

echo "Change Image Size Limits:"
echo "  1. In staff-handler.js:"
echo "     MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB"
echo ""

# ────────────────────────────────────────────────────────────────────────────
# STEP 10: TROUBLESHOOTING
# ────────────────────────────────────────────────────────────────────────────

echo "=== Step 10: Troubleshooting ==="
echo ""
echo "❌ Images not uploading:"
echo "  - Check storage bucket 'staff-images' exists and is public"
echo "  - Verify RLS policies are set correctly"
echo "  - Check file size < 5MB"
echo "  - Check CORS settings in Supabase"
echo ""

echo "❌ Data not loading:"
echo "  - Check RLS policies allow SELECT for public"
echo "  - Verify JWT token is valid (admin users)"
echo "  - Check browser console for errors"
echo "  - Ensure Supabase clients initialized correctly"
echo ""

echo "❌ Hierarchy not working:"
echo "  - Ensure parent_id references valid staff ID"
echo "  - Check hierarchy_level is correctly set"
echo "  - Verify no circular references exist"
echo ""

echo "❌ CSS not loading properly:"
echo "  - Clear browser cache (Ctrl+Shift+Delete)"
echo "  - Check all font links are accessible"
echo "  - Verify relative paths are correct"
echo ""

# ────────────────────────────────────────────────────────────────────────────
# STEP 11: SAMPLE DATA
# ────────────────────────────────────────────────────────────────────────────

echo "=== Step 11: Sample Data (Insert via Admin Panel) ==="
echo ""
echo "Recommended structure:"
echo ""
echo "Level 0 - Principal"
echo "  └─ Dr. Rajesh Kumar Singh"
echo ""
echo "Level 1 - Vice Principals"
echo "  ├─ Ms. Priya Sharma (Vice Principal - Academic)"
echo "  └─ Mr. Amit Patel (Vice Principal - Administration)"
echo ""
echo "Level 2 - Department Heads"
echo "  ├─ Mr. Vikram Singh (Head - Science)"
echo "  ├─ Ms. Anjali Rao (Head - English)"
echo "  ├─ Mr. Rohan Kumar (Head - Mathematics)"
echo "  └─ Ms. Deepa Sinha (Head - Social Studies)"
echo ""
echo "Level 3 - Teachers"
echo "  ├─ Mr. Rahul Verma (Physics Teacher)"
echo "  ├─ Ms. Neha Gupta (Chemistry Teacher)"
echo "  └─ [More teachers...]"
echo ""

# ────────────────────────────────────────────────────────────────────────────
# COMPLETION
# ────────────────────────────────────────────────────────────────────────────

echo ""
echo "════════════════════════════════════════════════════════════════════════════"
echo "✅ SETUP COMPLETE!"
echo "════════════════════════════════════════════════════════════════════════════"
echo ""
echo "Next Steps:"
echo "  1. Execute SQL in Supabase"
echo "  2. Upload all JavaScript and HTML files"
echo "  3. Add links to admin portal and about page"
echo "  4. Start adding staff members via admin panel"
echo "  5. View organization tree on about page"
echo ""
echo "For more help, check the console in browser (F12) for any errors"
echo ""
