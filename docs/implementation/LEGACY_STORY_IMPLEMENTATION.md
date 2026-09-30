# Dynamic "Our Legacy" Section Setup Guide

## Overview
This guide helps you set up the dynamic "Our Legacy" section that appears on the About page. Admins can now update the story title, description, image, and key values directly from the admin panel, and changes appear instantly on the public About page.

## What Was Implemented

### 1. **Admin Panel Integration** (`admin-portal.html`)
- ✅ New "📖 Our Legacy" tab in About Page Management
- ✅ Set as the first/active tab for easy access
- ✅ Form fields for:
  - Story Subtitle (e.g., "OUR LEGACY")
  - Story Title (e.g., "A Heritage of Academic Excellence")
  - First Paragraph (main description)
  - Second Paragraph (additional details)
  - Featured Image (file upload with preview)
  - Key Values List (one per line)
  - Display Order (for sorting)

### 2. **Image Upload & Management**
- ✅ Real-time image preview in admin form
- ✅ Automatic upload to Supabase Storage (`about-images` bucket)
- ✅ Public URL generation for image display
- ✅ Supports JPG, PNG formats (Max 5MB)
- ✅ Fallback to default image if upload fails

### 3. **Admin Handlers** (`admin-about-handler.js`)
**Functions Added:**
- `loadLegacyStoryForAdmin()` - Loads current story data into form
- `saveLegacyStory(event)` - Saves new story or updates existing
- `updateLegacyPreview(story)` - Shows real-time preview of current story
- Image preview functionality with FileReader API

### 4. **Data Management** (`about-data.js`)
**Existing Functions Used:**
- `createStory()` - Creates new story in database
- `readAllStory()` - Fetches story from Supabase
- `updateStory()` - Updates existing story
- `deleteStory()` - Deletes story (optional)
- `renderStory()` - Renders story to about page

### 5. **About Page Display** (`about.html`)
- ✅ Calls `renderStory()` on page load
- ✅ Dynamically loads story data from Supabase
- ✅ Displays in "Our Legacy" section with:
  - Subtitle (OUR LEGACY)
  - Title (A Heritage of Academic Excellence)
  - Image (with rounded corners)
  - Description paragraphs
  - Key values list with checkmark icons

## Database Setup

### Table: `about_story`
```sql
CREATE TABLE about_story (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_subtitle TEXT NOT NULL DEFAULT 'OUR LEGACY',
    story_title TEXT NOT NULL,
    story_paragraph1 TEXT NOT NULL,
    story_paragraph2 TEXT,
    story_visual_image TEXT,  -- URL to image in Supabase Storage
    story_values_list JSONB DEFAULT '[]',  -- Array of values
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Required SQL File:** `sql/LEGACY_STORY_SETUP.sql`
- Run this SQL in your Supabase SQL Editor to create the table
- Sets up RLS policies for security
- Creates indexes for better performance

### Storage Bucket
- **Bucket Name:** `about-images`
- **Path:** Images uploaded to: `about-images/legacy-story-{timestamp}-{filename}`
- **Access:** Public read (images display on website)

## Step-by-Step Setup Instructions

### Step 1: Create Database Table
1. Open [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to SQL Editor
4. Create a new query
5. Copy contents of `sql/LEGACY_STORY_SETUP.sql`
6. Run the query
7. Verify table `about_story` is created

### Step 2: Create Storage Bucket
1. In Supabase, go to Storage
2. Create a new bucket named `about-images`
3. Set visibility to **Public**
4. Click Save

### Step 3: Verify Admin Panel
1. Open admin portal: `html/admin-portal.html`
2. Click on "Manage About Page" section
3. Verify "📖 Our Legacy" tab is visible and active
4. Form should show with all fields

### Step 4: Add First Story
1. Fill in the Legacy form:
   - Subtitle: `OUR LEGACY`
   - Title: `A Heritage of Academic Excellence`
   - Paragraph 1: `Shree Saraswati Secondary School stands proud as a pioneer of quality public education in the Satyawati Municipality of Gulmi.`
   - Paragraph 2: (optional)
   - Image: Upload school building photo
   - Key Values:
     ```
     Quality Education
     Student Growth
     Excellence in Every Endeavor
     Community Service
     ```
2. Click "💾 Save Legacy Story"
3. Success message appears
4. Current story preview updates

### Step 5: Test on About Page
1. Open about page: `html/about.html`
2. Scroll to "OUR LEGACY" section
3. Verify your story displays with:
   - Uploaded image on left
   - Subtitle, title, description on right
   - Key values listed with icons
4. Changes appear instantly after saving in admin

## How to Update Legacy Story

### To Edit Existing Story:
1. Go to Admin → About Page Management
2. Click "📖 Our Legacy" tab
3. Form auto-loads current story data
4. Make your changes
5. Upload new image (or leave blank to keep existing)
6. Click "💾 Save Legacy Story"
7. Refresh about.html to see updates

### To Add Key Values:
- Enter each value on a separate line
- Automatically strips bullet points (•, -, *)
- Displays with checkmark icons on about page

### To Change Image:
- Click file input and select new image
- Preview updates in real-time
- Supported: JPG, PNG (Max 5MB)
- Image auto-uploads to Supabase Storage on save

## File Structure

```
admin-portal.html
├── Lines 2865-2872: Tab navigation (added "📖 Our Legacy" tab)
├── Lines 2874-2944: Legacy tab content with form
└── Lines 11974-11986: Tab switching logic

admin-about-handler.js
├── Lines 239-350: Legacy story handlers
│   ├── loadLegacyStoryForAdmin()
│   ├── updateLegacyPreview()
│   ├── saveLegacyStory()
│   └── Image preview listener

about-data.js
├── Lines 97-195: Story CRUD functions (existing)
│   ├── createStory()
│   ├── readAllStory()
│   ├── renderStory()
│   ├── updateStory()
│   └── deleteStory()
└── Lines 572, 576: Exports to window object

about.html
├── Line 1589-1612: Story container
├── Lines 2556-2563: DOMContentLoaded event (added renderStory() call)
└── Lines 2660-2661: Script imports for Supabase and about-data.js

sql/LEGACY_STORY_SETUP.sql
└── Complete SQL table setup with RLS policies
```

## Troubleshooting

### Problem: "Loading..." stuck on About page
**Solution:** 
- Ensure database table is created
- Check browser console for errors
- Verify Supabase client is loaded

### Problem: Image not uploading
**Solution:**
- Ensure `about-images` bucket exists and is public
- Check file size (max 5MB)
- Check browser console for upload errors
- Verify Supabase Storage credentials

### Problem: Form doesn't show saved data
**Solution:**
- Clear browser cache
- Ensure story record exists in database
- Check Supabase RLS policies are correct
- Verify admin is authenticated

### Problem: Changes not showing on About page
**Solution:**
- Refresh about.html page
- Clear browser cache
- Verify renderStory() is being called
- Check localStorage for cached data

## Data Flow Diagram

```
Admin Panel Form
        ↓
    saveLegacyStory()
        ↓
    Image Upload to Supabase Storage
        ↓
    Save Story to about_story table
        ↓
    Load About Page (about.html)
        ↓
    renderStory() reads from about_story
        ↓
    Display in "Our Legacy" section
```

## Features Summary

| Feature | Status | Details |
|---------|--------|---------|
| Edit Story Title | ✅ Complete | Free text input |
| Edit Story Subtitle | ✅ Complete | Free text input |
| Edit Description | ✅ Complete | Multi-line textarea |
| Upload Image | ✅ Complete | Automatic Supabase Storage upload |
| Image Preview | ✅ Complete | Real-time preview in admin |
| Key Values List | ✅ Complete | One per line, auto-parsed |
| Current Story Preview | ✅ Complete | Shows formatted version |
| Automatic Update | ✅ Complete | Changes appear on refresh |
| Database CRUD | ✅ Complete | Full create/read/update/delete |
| RLS Security | ✅ Complete | Public read, admin only write |

## API Integration Points

### Supabase Functions Used:
```javascript
// Image Upload
supabaseDb.storage.from('about-images').upload(filename, file)
supabaseDb.storage.from('about-images').getPublicUrl(filename)

// Database Operations
supabaseDb.from('about_story').insert([...])
supabaseDb.from('about_story').select('*')
supabaseDb.from('about_story').update({...})
```

## Next Steps
1. ✅ Run the SQL setup script
2. ✅ Create 'about-images' Supabase Storage bucket
3. ✅ Add first legacy story from admin panel
4. ✅ Verify display on about page
5. ✅ Test editing and image changes

## Support
For issues or questions:
- Check browser console for errors
- Verify Supabase configuration
- Ensure all scripts are loading correctly
- Check that about-data.js functions are accessible

---
Last Updated: 2026-06-01
Version: 1.0
