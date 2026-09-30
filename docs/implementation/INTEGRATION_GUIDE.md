# Integration Guide - Staff Hierarchy System

## Adding Staff Hierarchy to Your Admin Portal

This guide shows how to seamlessly integrate the new Staff Hierarchy Management system into your existing admin portal.

---

## Option 1: Navigation Link Integration (Recommended)

### Step 1: Find Navigation Menu
In your `admin-portal.html`, locate the sidebar navigation section. Look for something like:

```html
<div class="sidebar-menu">
  <div class="nav-label">Core Management</div>
  <a href="#" class="nav-link" onclick="showPage('dashboard')">
    <svg>...</svg> Dashboard
  </a>
  <!-- Other nav items -->
</div>
```

### Step 2: Add Staff Hierarchy Link

Add this link to your navigation (in appropriate section):

```html
<!-- Add this with other management links -->
<a href="staff-management-admin.html" class="nav-link" target="_blank">
  <i class="fas fa-sitemap"></i> Staff Hierarchy
</a>
```

Or to open in same tab:

```html
<a href="staff-management-admin.html" class="nav-link">
  <i class="fas fa-sitemap"></i> Staff Hierarchy
</a>
```

### Step 3: Test
- Click the link in admin portal
- Should open the staff management panel
- All features should work

---

## Option 2: Embedded View Integration

### Step 2A: Add Tab to Existing Admin Pages

In your admin-portal.html, add a new tab button:

```html
<button class="tab" data-tab="staffHierarchy">
  <i class="fas fa-sitemap"></i> Staff Hierarchy
</button>
```

### Step 2B: Add Content Section

Add a new content div:

```html
<div id="staffHierarchy" class="tab-content" style="padding: 0; border: none;">
  <iframe src="staff-management-admin.html" 
          style="width: 100%; height: calc(100vh - 200px); border: none; border-radius: 8px;">
  </iframe>
</div>
```

### Step 2C: Update Tab JavaScript

Add this to your tab switching function:

```javascript
function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Show selected tab
  document.getElementById(tabName).classList.add('active');
  
  // Update active button
  document.querySelectorAll('.tab').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
}
```

---

## Option 3: Custom Admin Section Integration

### Create a Wrapper in Admin Portal

Add this HTML section to admin-portal.html:

```html
<!-- STAFF HIERARCHY SECTION -->
<div id="staffPage" class="page-view">
  <div class="dashboard-container">
    <div class="welcome-banner">
      <div class="welcome-text">
        <h1><i class="fas fa-sitemap"></i> Staff Hierarchy Management</h1>
        <p>Manage organizational structure, staff information, and upload profile images</p>
      </div>
    </div>
    
    <iframe src="staff-management-admin.html" 
            id="staffIframe"
            style="width: 100%; 
                   height: auto; 
                   border: none; 
                   margin-top: 2rem;">
    </iframe>
  </div>
</div>

<!-- Add to navigation -->
<a href="#" class="nav-link" onclick="showPage('staffPage')">
  <i class="fas fa-sitemap"></i> Staff Hierarchy
</a>
```

### Update Page Switching

Add to your page switching function:

```javascript
function showPage(pageName) {
  // Hide all pages
  document.querySelectorAll('.page-view').forEach(page => {
    page.classList.remove('active');
  });
  
  // Show selected page
  document.getElementById(pageName).classList.add('active');
  
  // Update active nav link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  event.target.classList.add('active');
}
```

---

## Integration Styles

### For Sidebar Navigation

Add these CSS rules to match your admin portal styling:

```css
.nav-link svg {
  width: 20px;
  height: 20px;
}

.nav-link i.fas {
  width: 20px;
  text-align: center;
}

.nav-link:hover {
  background: rgba(124, 58, 237, 0.1);
}

.nav-link.active {
  background: #7c3aed;
  color: white;
}
```

### For Iframe Container

```css
.staff-iframe-wrapper {
  width: 100%;
  height: calc(100vh - 200px);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.staff-iframe-wrapper iframe {
  width: 100%;
  height: 100%;
  border: none;
}
```

---

## Step-by-Step Integration (Complete Example)

### 1. Add Files to Project

Ensure these files are in your project directory:
- `staff-handler.js`
- `staff-management-admin.html`
- `organizational-tree.html`
- `supabase-client.js` (existing)

### 2. Update Admin Navigation

In admin-portal.html `<div class="sidebar-menu">` section:

```html
<div class="nav-label">Management</div>

<!-- Existing links -->
<a href="#" class="nav-link active" onclick="showPage('dashboard')">
  <i class="fas fa-chart-line"></i> Dashboard
</a>

<!-- Add this new link -->
<a href="#" class="nav-link" onclick="showPage('staffPage')">
  <i class="fas fa-sitemap"></i> Staff Hierarchy
</a>

<!-- Other existing links -->
```

### 3. Add Page Section

Before closing `</div>` of dashboard container, add:

```html
<!-- STAFF HIERARCHY PAGE -->
<div id="staffPage" class="page-view">
  <div class="dashboard-container">
    <div class="page-header">
      <h1><i class="fas fa-sitemap"></i> Staff Hierarchy Management</h1>
      <p>Manage organizational structure and staff information</p>
    </div>
    
    <iframe src="staff-management-admin.html" 
            style="width: 100%; 
                   height: 100vh; 
                   border: none;
                   border-radius: 8px;">
    </iframe>
  </div>
</div>
```

### 4. Update Page View CSS (if not already present)

Add to admin-portal.html `<style>` section:

```css
.page-view {
  display: none;
  animation: fadeIn 0.4s ease;
}

.page-view.active {
  display: block;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 5. Update showPage Function

Find your page switching function and ensure it looks like:

```javascript
function showPage(pageName) {
  // Hide all page views
  const pages = document.querySelectorAll('.page-view');
  pages.forEach(page => {
    page.classList.remove('active');
  });
  
  // Show selected page
  const selectedPage = document.getElementById(pageName);
  if (selectedPage) {
    selectedPage.classList.add('active');
  }
  
  // Update active nav link
  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => {
    link.classList.remove('active');
  });
  event.target.classList.add('active');
}
```

### 6. Test Integration

- [ ] Admin portal loads without errors
- [ ] Staff Hierarchy link appears in navigation
- [ ] Clicking link opens staff management
- [ ] All features work (add, edit, delete, search)
- [ ] Image upload works
- [ ] Tree view displays correctly
- [ ] Mobile responsive
- [ ] No console errors (F12)

---

## Quick Integration (Fastest Method)

For immediate integration, just add one line to navigation:

```html
<a href="staff-management-admin.html" class="nav-link" onclick="alert('Opening in new window for better performance'); return true;">
  <i class="fas fa-sitemap"></i> Staff Hierarchy
</a>
```

This opens the staff panel in a new tab/window, maintaining full functionality while keeping your admin portal separate.

---

## Linking to Public Organizational Tree

### On Your About Page

Add this section to about.html:

```html
<section class="organizational-section" style="padding: 4rem 2rem; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); color: white; text-align: center;">
  <div class="container">
    <h2 style="font-family: 'Playfair Display', serif; font-size: 2rem; margin-bottom: 1rem;">
      Meet Our Leadership
    </h2>
    <p style="margin-bottom: 2rem; font-size: 1.1rem;">
      Dedicated professionals committed to educational excellence
    </p>
    
    <a href="organizational-tree.html" class="btn btn-light" style="display: inline-block; padding: 1rem 2rem; background: white; color: #1e1b4b; text-decoration: none; border-radius: 8px; font-weight: 700;">
      View Organizational Structure →
    </a>
  </div>
</section>
```

### Or Embed Directly

```html
<section style="padding: 3rem 2rem;">
  <div class="container">
    <h2>Our Organizational Structure</h2>
    <iframe src="organizational-tree.html" 
            style="width: 100%; 
                   height: 800px; 
                   border: none; 
                   border-radius: 12px;
                   margin-top: 2rem;">
    </iframe>
  </div>
</section>
```

---

## Database Connection Verification

### Check Supabase Connection

The system uses `supabase-client.js` which should already be in your project. Verify:

```javascript
// In browser console (F12):
// Check if supabase clients are initialized
console.log(supabaseDb);  // Should show client object
console.log(supabaseMedia); // Should show media client

// Check staff handler
console.log(staffHandler); // Should show handler instance
```

### If Connection Fails

1. Verify `supabase-client.js` is linked in all pages
2. Check Supabase URLs and keys are correct
3. Verify RLS policies are set in Supabase
4. Check browser console for specific errors

---

## Styling Consistency

### Match Your Admin Portal Colors

Edit staff-management-admin.html `<style>` section:

```css
:root {
  --primary: #1e1b4b;        /* Match your primary color */
  --accent: #7c3aed;         /* Match your accent */
  --secondary: #f59e0b;      /* Match your secondary */
  --bg-color: #f5f3ff;       /* Match your background */
}
```

---

## Performance Considerations

### For Large Staff Lists

The system automatically handles:
- Pagination (use LIMIT/OFFSET in queries)
- Lazy loading of images
- Debounced search (built-in)
- Optimized indexes (in database)

### Optimization Tips

1. If > 500 staff members, implement pagination:
   ```javascript
   // Add to getAllStaff call
   const result = await staffHandler.getAllStaff({ 
     limit: 50, 
     offset: page * 50 
   });
   ```

2. Cache frequently accessed data:
   ```javascript
   const cached = localStorage.getItem('staffCache');
   if (cached) {
     staffList = JSON.parse(cached);
   }
   ```

3. Lazy load images:
   ```html
   <img src="..." loading="lazy">
   ```

---

## Troubleshooting Integration Issues

| Issue | Solution |
|-------|----------|
| 404 Error on files | Check file paths, ensure files are in same directory |
| Blank iframe | Check browser console (F12) for errors |
| No styling | Verify font CDN links are accessible |
| Data not loading | Check Supabase connection, verify RLS policies |
| Images not uploading | Verify storage bucket exists, check file size |
| Search not working | Check database connection, verify staff table |

---

## Next Steps

1. [ ] Copy all files to project directory
2. [ ] Execute SQL in Supabase
3. [ ] Choose integration method (Option 1, 2, or 3)
4. [ ] Update admin portal HTML
5. [ ] Update navigation links
6. [ ] Test all features
7. [ ] Add to about page
8. [ ] Start adding staff members

---

**Integration Complete!** ✅

Your staff hierarchy system is now integrated with your admin portal and ready to use.
