# 📊 Import/Export Data Guide

## Overview

The Import/Export section in the admin panel allows you to:
- ✅ **Import** bulk data from CSV or JSON files
- ✅ **Export** current data as backup or for editing
- ✅ **Replace** existing data or append new data
- ✅ **Download** sample templates to understand the format

---

## 🚀 Quick Start

### To Import Data:
1. Go to **About Page Management** → **Import/Export** tab
2. Select the **Data Type** (Stats, Vision, Timeline, etc.)
3. Choose **File Format** (CSV or JSON)
4. Select your file
5. Optionally check **"Replace existing data"**
6. Click **Import Data**

### To Export Data:
1. Go to **Import/Export** tab
2. Select what to **Export** (specific type or All Data)
3. Choose **Format** (CSV or JSON)
4. Click **Export Data**
5. File downloads automatically

---

## 📋 File Formats

### CSV Format

**Stats Example:**
```csv
icon_emoji,stat_number,stat_label,display_order
👥,2500+,Total Students,1
📚,45+,Expert Teachers,2
🏆,150+,Achievements,3
```

**Vision/Mission Example:**
```csv
section_type,icon_emoji,section_title,section_description,key_points,display_order
Vision,🎯,Our Vision,To be center of excellence,"• Excellence, • Innovation, • Integrity",1
Mission,🚀,Our Mission,To provide quality education,"• Quality, • Development, • Service",2
```

**Timeline Example:**
```csv
icon_emoji,timeline_date,timeline_title,timeline_description,timeline_position,display_order
🎓,2076 B.S.,School Founded,Official establishment,left,1
🏢,2078 B.S.,New Building,Inaugurated new campus,right,2
```

**Admin Team Example:**
```csv
member_name,member_role,member_department,member_photo_url,member_email,hierarchy_level,display_order
Priya Sharma,Vice Principal,Academic,https://...,priya@school.com,1,1
Ravi Kumar,Teacher,Science,https://...,ravi@school.com,2,2
```

---

### JSON Format

**Stats Example:**
```json
[
  {
    "icon_emoji": "👥",
    "stat_number": "2500+",
    "stat_label": "Total Students",
    "display_order": 1
  },
  {
    "icon_emoji": "📚",
    "stat_number": "45+",
    "stat_label": "Expert Teachers",
    "display_order": 2
  }
]
```

**Vision/Mission Example:**
```json
[
  {
    "section_type": "Vision",
    "icon_emoji": "🎯",
    "section_title": "Our Vision",
    "section_description": "To be a center of excellence...",
    "key_points": "• Excellence\n• Innovation\n• Integrity",
    "display_order": 1
  }
]
```

**Timeline Example:**
```json
[
  {
    "icon_emoji": "🎓",
    "timeline_date": "2076 B.S.",
    "timeline_title": "School Founded",
    "timeline_description": "Official establishment...",
    "timeline_position": "left",
    "display_order": 1
  },
  {
    "icon_emoji": "🏢",
    "timeline_date": "2078 B.S.",
    "timeline_title": "New Building",
    "timeline_description": "Inaugurated new campus...",
    "timeline_position": "right",
    "display_order": 2
  }
]
```

**Admin Team Example:**
```json
[
  {
    "member_name": "Priya Sharma",
    "member_role": "Vice Principal",
    "member_department": "Academic",
    "member_photo_url": "https://example.com/photo.jpg",
    "member_email": "priya@school.com",
    "hierarchy_level": 1,
    "display_order": 1
  }
]
```

---

## 📥 Import Operations

### Step-by-Step Import

1. **Navigate to Import/Export**
   - Click the **Import/Export** tab in About Page Management

2. **Select Data Type**
   - Choose which section to import (Stats, Vision, Timeline, etc.)

3. **Choose File Format**
   - Select **CSV** or **JSON** based on your file

4. **Select File**
   - Browse and select your file (max 5MB)

5. **Choose Mode**
   - ✅ **Replace Existing** - Deletes old data and adds new
   - ⬜ **Unchecked** - Appends new data to existing

6. **Click Import**
   - System validates and imports the data
   - Shows success/error message
   - Auto-reloads the section with new data

### Example: Import Statistics

**Step 1:** Download template or prepare CSV file:
```csv
icon_emoji,stat_number,stat_label,display_order
👥,2800+,Total Students,1
📚,50+,Teachers,2
🏆,200+,Awards,3
```

**Step 2:** Go to Import/Export tab

**Step 3:** 
- Select Data Type: **Stats**
- File Format: **CSV**
- Upload file
- Check "Replace existing data"
- Click Import

**Result:** Old statistics replaced with new data

---

## 📤 Export Operations

### Export Specific Section

1. Select the section to export
2. Choose format (CSV/JSON)
3. Click Export
4. File downloads automatically

### Export All Data

1. Select "All Data" from dropdown
2. Choose format
3. Click Export
4. JSON file with all sections downloads

**File Structure for All Data Export:**
```json
{
  "stats": [...],
  "visionMission": [...],
  "eraCards": [...],
  "timeline": [...],
  "leadership": [...],
  "team": [...]
}
```

---

## 💾 Sample Templates

Download pre-made templates to understand the format:
- 📊 **Stats Template**
- 🎯 **Vision/Mission Template**
- 📚 **Era Cards Template**
- 📅 **Timeline Template**
- 👔 **Leadership Template**
- 👥 **Team Template**

Each template includes sample data with all required fields.

---

## 🔄 Common Workflows

### Backup Current Data
1. Go to Import/Export
2. Select "All Data"
3. Choose JSON format
4. Click Export
5. Save file as backup

### Migrate from Excel
1. Open Excel spreadsheet
2. Save As → CSV format
3. In admin panel → Import/Export
4. Select data type
5. Choose CSV format
6. Upload file
7. Click Import

### Bulk Update Statistics
1. Export stats to CSV
2. Edit in Excel/Sheets
3. Save as CSV
4. Import back with "Replace existing" checked
5. Confirm changes

### Transfer Data Between Schools
1. Export from first school (All Data as JSON)
2. Import to second school
3. New school gets all data
4. Edit as needed

---

## 🎯 Required Fields by Section

### Statistics
- ✅ `icon_emoji` - Emoji or icon
- ✅ `stat_number` - Number (e.g., "2500+")
- ✅ `stat_label` - Description (e.g., "Total Students")
- ⏺️ `display_order` - Sort order (default: 0)

### Vision & Mission
- ✅ `section_type` - "Vision" or "Mission"
- ✅ `icon_emoji` - Emoji
- ✅ `section_title` - Title
- ✅ `section_description` - Full description
- ⏺️ `key_points` - Bulleted points (one per line with \n separator)
- ⏺️ `display_order` - Sort order

### Era Cards
- ✅ `icon_emoji` - Emoji
- ✅ `era_badge` - Time period (e.g., "2076 B.S.")
- ✅ `era_title` - Era name
- ✅ `era_description` - Description
- ⏺️ `display_order` - Sort order

### Timeline
- ✅ `icon_emoji` - Emoji
- ✅ `timeline_date` - Date/period
- ✅ `timeline_title` - Event title
- ✅ `timeline_description` - Event details
- ✅ `timeline_position` - "left" or "right"
- ⏺️ `display_order` - Sort order

### Leadership Desks
- ✅ `leader_name` - Full name
- ✅ `leader_role` - Position title
- ✅ `leader_photo_url` - Photo link
- ✅ `leader_quote` - Inspiring quote
- ✅ `leader_description` - Background info
- ⏺️ `display_order` - Sort order

### Admin Team
- ✅ `member_name` - Full name
- ✅ `member_role` - Position
- ✅ `member_department` - Department
- ✅ `member_photo_url` - Photo URL
- ✅ `member_email` - Email address
- ⏺️ `hierarchy_level` - Level (0=top, 1=middle, etc.)
- ⏺️ `display_order` - Sort order

---

## ✅ Best Practices

### Before Importing
- ✅ Verify file format (CSV or JSON)
- ✅ Check all required fields are present
- ✅ Validate URLs (especially photo links)
- ✅ Test with small batch first
- ✅ **Backup existing data first!**

### Data Format Tips
- ✅ Keep emoji consistent across imports
- ✅ Use meaningful display orders (1, 2, 3, etc.)
- ✅ Escape special characters in JSON strings
- ✅ For CSV: Escape commas in values with quotes
- ✅ Validate email addresses before importing

### Large Data Imports
- ✅ Keep file size under 5MB
- ✅ Import sections separately if too large
- ✅ Use JSON for complex data (arrays in values)
- ✅ Check success/error messages
- ✅ Verify imported data on website

---

## 🐛 Troubleshooting

### "File is empty"
- ✅ Check file has data and headers
- ✅ Ensure first row contains column names

### "Invalid JSON"
- ✅ Use JSON validator: jsonlint.com
- ✅ Ensure proper quotes and commas
- ✅ Check for special characters

### "Import failed - data type error"
- ✅ Verify all required fields present
- ✅ Check field names match exactly
- ✅ Validate data types (number, email, etc.)

### "File size too large"
- ✅ Maximum 5MB per file
- ✅ Split large data into multiple files
- ✅ Remove unnecessary columns

### "Photo URLs not loading"
- ✅ Verify URL is correct and public
- ✅ Check URL works in browser
- ✅ Use HTTPS URLs when possible
- ✅ Test URL before importing

### "Changes not visible on website"
- ✅ Refresh browser (Ctrl+F5)
- ✅ Check if data is marked "active"
- ✅ Verify display_order is correct
- ✅ Check cache settings

---

## 🔐 Security Notes

- ✅ Always backup before bulk replacing data
- ✅ Validate data before importing
- ✅ Only import from trusted sources
- ✅ Verify file doesn't contain malicious code
- ✅ Never share files with sensitive data
- ✅ Use HTTPS for all photo URLs

---

## 📞 Support

**Need help?**
- Check sample templates
- Read this guide carefully
- Verify file format matches examples
- Check browser console for errors (F12)
- Test with small sample first

---

## 🎓 Learning Resources

**CSV Format:**
- RFC 4180 CSV Specification
- Microsoft Excel CSV export
- Google Sheets CSV download

**JSON Format:**
- JSON.org specifications
- JSON beautifiers/validators
- JavaScript JSON methods

---

**Happy importing/exporting! 🚀**

Questions? Check the sample templates or refer to ADMIN_QUICK_REFERENCE.md
