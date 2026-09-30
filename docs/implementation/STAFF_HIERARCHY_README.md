# Advanced Staff Hierarchy Management System

A comprehensive, enterprise-grade system for managing organizational structures, staff information, image uploads, and creating beautiful organizational charts with full CRUD operations, search capabilities, and tree visualization.

## 📋 Overview

This system provides a complete solution for:

- **Staff Management**: Create, read, update, and delete staff members
- **Image Uploads**: Upload and manage profile images with automatic storage
- **Hierarchical Structure**: Create reporting structures and organizational charts
- **Tree Visualization**: Display organization in tree/hierarchy format
- **Public Display**: Show featured staff on your about page
- **Advanced Features**: Search, filter, statistics, audit logging, and exports

## 📁 Files Included

### 1. **STAFF_HIERARCHY_ADVANCED.sql**
Complete database schema including:
- Staff hierarchy table with 20+ fields
- Storage bucket configuration for images
- Security policies (RLS) for public and admin access
- Audit logging table
- Performance indexes
- Tree structure functions
- Views and triggers

### 2. **staff-handler.js**
JavaScript handler class with methods for:
- `createStaff()` - Add new staff member
- `getAllStaff()` - Fetch all staff with filters
- `getStaffById()` - Get single staff details
- `getStaffTree()` - Get hierarchical tree structure
- `getStaffByDepartment()` - Filter by department
- `searchStaff()` - Full-text search
- `updateStaff()` - Update staff information
- `updateHierarchy()` - Change reporting structure
- `deleteStaff()` - Soft delete (preserve history)
- `hardDeleteStaff()` - Permanent deletion
- `uploadImage()` - Upload profile photo
- `deleteImage()` - Remove image
- `replaceImage()` - Update image
- `getDepartments()` - List all departments
- `getFeaturedStaff()` - Get highlighted staff
- `getStatistics()` - Organizational statistics
- `exportToJSON()` - Export data

### 3. **staff-management-admin.html**
Full-featured admin panel with:
- **Gallery View**: Card-based staff display with images
- **Tree View**: Hierarchical organization visualization
- **Table View**: Spreadsheet format
- **Statistics**: Staff distribution and department counts
- **Search & Filter**: Find staff by name, position, department
- **CRUD Operations**: Create, edit, delete staff
- **Image Management**: Upload and preview images
- **Form Validation**: Client-side validation
- **Responsive Design**: Works on all devices
- **Dark Theme**: Professional appearance

### 4. **organizational-tree.html**
Public-facing organizational chart display:
- **Tree View**: Visual hierarchy with connecting lines
- **Featured Staff**: Highlight key leadership
- **Department View**: Organize by departments
- **Staff Details Modal**: Click for full information
- **Responsive**: Mobile-friendly design
- **Professional Styling**: Modern, attractive appearance

### 5. **STAFF_HIERARCHY_SETUP_GUIDE.md**
Complete setup and implementation guide covering:
- Database setup
- File structure
- Admin panel integration
- Public tree display
- Basic and advanced usage
- API reference
- Customization
- Troubleshooting
- Sample data

## 🚀 Quick Start

### Step 1: Database Setup
```sql
-- Open Supabase SQL Editor and run:
-- Content from STAFF_HIERARCHY_ADVANCED.sql
```

### Step 2: Include Files
Add these files to your project:
- `staff-handler.js` - Include in all pages using staff data
- `staff-management-admin.html` - Access for admins
- `organizational-tree.html` - Public view

### Step 3: Admin Integration
Add link to admin portal:
```html
<a href="staff-management-admin.html" class="nav-link">
  <i class="fas fa-sitemap"></i> Staff Hierarchy
</a>
```

### Step 4: Public Display
Add to about page:
```html
<section>
  <h2>Our Leadership</h2>
  <iframe src="organizational-tree.html" style="width:100%; height:600px;"></iframe>
</section>
```

## 📊 Database Schema

### Main Table: `staff_hierarchy`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR | Full name (required) |
| position | VARCHAR | Job title (required) |
| department | VARCHAR | Department (required) |
| bio | TEXT | Biography |
| parent_id | UUID | Superior's ID |
| hierarchy_level | INT | 0=Principal, 1=VP, 2=Head, 3=Teacher, 4=Support |
| order_index | INT | Sort position |
| image_url | VARCHAR | Image storage URL |
| image_name | VARCHAR | Filename in storage |
| email | VARCHAR | Email address |
| phone | VARCHAR | Phone number |
| office_location | VARCHAR | Office/room number |
| qualification | VARCHAR | Degree/certification |
| experience_years | INT | Years of experience |
| specialization | VARCHAR | Expertise area |
| linkedin_url | VARCHAR | LinkedIn profile |
| social_links | JSONB | Multiple social media links |
| is_active | BOOLEAN | Active status (default: true) |
| featured | BOOLEAN | Featured on public display (default: false) |
| display_order | INT | Custom display order |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last modification |

### Audit Table: `staff_audit_log`
Tracks all changes with old/new values for compliance and history.

## 🎯 Key Features

### 1. Complete CRUD Operations
- Create staff with all details
- Read with search, filter, and sorting
- Update any field
- Delete (soft or hard)
- Bulk export

### 2. Image Management
- Upload profile photos
- Automatic storage to Supabase
- Public URL generation
- Image size validation (max 5MB)
- Format validation (JPEG, PNG, WebP)
- Replacement and deletion

### 3. Organizational Structure
- Create reporting hierarchies
- Support for multiple levels (5 levels included)
- Customizable sorting
- Parent-child relationships
- Tree visualization
- Circular reference prevention

### 4. Search & Filter
- Real-time search by name/position/department
- Department filtering
- Featured staff highlighting
- Full-text capabilities

### 5. Security
- Row-Level Security (RLS) policies
- Admin-only write permissions
- Public read for active staff only
- Audit logging of all changes
- JWT token validation

### 6. Visualization
- Tree/hierarchical view
- Card gallery view
- Table/spreadsheet view
- Department grouping
- Statistics dashboard

### 7. Data Management
- Export to JSON
- Audit trail
- Soft delete (preserve history)
- Multiple sort options
- Batch operations

## 💻 Usage Examples

### JavaScript API

```javascript
// Create staff member
await staffHandler.createStaff({
  name: "Dr. John Doe",
  position: "Principal",
  department: "Administration",
  bio: "Visionary leader...",
  hierarchy_level: 0,
  email: "john@school.edu",
  phone: "+977-1-123456"
});

// Get all staff
const result = await staffHandler.getAllStaff({ 
  department: "Science" 
});

// Get hierarchy tree
const tree = await staffHandler.getStaffTree();

// Search staff
const searchResults = await staffHandler.searchStaff("John");

// Upload image
await staffHandler.uploadImage(staffId, fileObject);

// Update staff
await staffHandler.updateStaff(staffId, {
  position: "Vice Principal"
});

// Delete staff
await staffHandler.deleteStaff(staffId);

// Get statistics
const stats = await staffHandler.getStatistics();

// Export data
await staffHandler.exportToJSON();
```

### Form Integration

```html
<!-- Add form field -->
<div class="form-group">
  <label for="position">Position</label>
  <input type="text" id="position" required>
</div>

<!-- Image upload -->
<div class="image-upload">
  <input type="file" id="imageInput" accept="image/*">
  <label for="imageInput">Choose Image</label>
</div>

<!-- Submit -->
<button onclick="submitStaffForm()">Save</button>
```

## 🎨 Customization

### Change Colors
Edit CSS variables in style tags:
```css
:root {
  --primary: #1e1b4b;      /* Main color */
  --accent: #7c3aed;       /* Highlight */
  --secondary: #f59e0b;    /* Secondary */
  --success: #16a34a;      /* Success */
  --danger: #dc2626;       /* Danger */
}
```

### Add Custom Fields
1. Update SQL table schema
2. Add form field in admin HTML
3. Update handler.js methods
4. Add to display templates

### Adjust Hierarchy Levels
Modify in form:
```html
<select id="hierarchyLevel">
  <option value="0">Principal</option>
  <option value="1">Vice Principal</option>
  <option value="2">Department Head</option>
  <option value="3">Teacher</option>
  <option value="4">Support Staff</option>
</select>
```

## 🔒 Security

### Row-Level Security (RLS) Policies
- **Public Read**: Active staff only
- **Admin Write**: Create/update/delete allowed
- **Image Upload**: Admin only
- **Audit Logs**: Admin read only

### Best Practices
- Always validate input on client and server
- Use HTTPS for image uploads
- Regularly audit changes via audit log
- Backup database regularly
- Keep Supabase credentials secure

## 📱 Responsive Design

- **Desktop**: Full features, optimized layout
- **Tablet**: Adjusted grid, touch-friendly
- **Mobile**: Single column, optimized viewing
- All features accessible on all devices

## 🐛 Troubleshooting

### Images Not Uploading
- Verify storage bucket exists and is public
- Check RLS policies are set
- Ensure file < 5MB
- Check browser console for errors

### Data Not Loading
- Check RLS SELECT policies
- Verify user authentication
- Check Supabase connection
- Look for API errors in console

### Hierarchy Issues
- Verify parent_id is valid
- Ensure no circular references
- Check hierarchy_level values
- Review tree structure

## 📈 Performance Considerations

- Indexes on: `parent_id`, `hierarchy_level`, `department`, `is_active`
- Large datasets: Implement pagination
- Image storage: Use CDN for delivery
- Queries: Optimized with LIMIT/OFFSET
- Caching: Implement client-side caching

## 🔄 Maintenance

### Regular Tasks
- Review audit logs monthly
- Verify image storage cleanup
- Test backup/restore
- Update staff information
- Archive inactive records

### Backup Strategy
- Daily database snapshots
- Image storage backups
- Export data regularly
- Version control for configs

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Font Awesome Icons](https://fontawesome.com)
- [Responsive Design Guide](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)

## 🤝 Support & Contributions

For issues, improvements, or questions:
1. Check the STAFF_HIERARCHY_SETUP_GUIDE.md
2. Review browser console for errors
3. Check Supabase logs for issues
4. Verify all files are properly linked

## 📄 License

This system is part of the Shree Saraswati Secondary School management suite.

## 🎉 Features Summary

✅ Complete CRUD operations
✅ Image upload and management
✅ Hierarchical organization
✅ Tree visualization
✅ Public display
✅ Search and filter
✅ Statistics
✅ Audit logging
✅ Data export
✅ Mobile responsive
✅ Dark theme
✅ Security policies
✅ Full documentation
✅ Multiple views (Gallery, Tree, Table)
✅ Featured staff highlights

---

**Version**: 1.0
**Last Updated**: May 2026
**Status**: Production Ready
