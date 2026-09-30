# 🏫 Shree Saraswati Secondary School — Management System

> **A full-stack school management platform** built with Vanilla JS + Supabase for Shree Saraswati Secondary School, Satyawati Municipality-6 Johang, Gulmi, Nepal.

---

## 📋 Overview

This system provides a comprehensive digital administration platform covering student management, fee collection, academic results, staff hierarchy, attendance, timetable management, and a public-facing school website — all powered by **Supabase (PostgreSQL)** as the backend.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🎓 **Student Profiles** | Full student enrolment, ID card generation, class assignment |
| 💰 **Fee Management** | Fee structures, payment tracking, receipts, overdue reports |
| 📊 **Exam Results** | Enter marks, calculate GPA, publish result sheets, marksheet printing |
| 👨‍🏫 **Staff Management** | Teacher profiles, department hierarchy, organizational tree |
| 📅 **Timetable** | Weekly slot builder, subject-teacher-class assignments |
| 🎭 **About Page** | Dynamic public-facing About page with CMS for admin |
| 🔔 **Notices** | Notice board with category tags and scheduling |
| 🖼️ **Gallery** | Photo and video gallery with admin upload |
| 📄 **Documents** | Circular and certificate management |
| 🏛️ **Admin Portal** | Centralized admin HQ with role-based sections |
| 🎓 **Student Portal** | Self-service portal for marks, fees, timetables |
| 👨‍🏫 **Teacher Portal** | Teacher dashboard for class management |

---

## 🗂️ Project Structure

```
school-management-saraswati/
│
├── 📄 index.html                   ← Public landing page (main website)
├── 📄 admin-portal.html            ← Root redirect → html/admin-portal.html
├── 📄 README.md                    ← This file
├── 📄 schema.json                  ← Supabase DB schema reference
│
├── 📁 html/                        ← All application HTML pages
│   ├── about.html                  ← Public About Us page (fully dynamic)
│   ├── admin-portal.html           ← 🔒 Central Admin HQ (650KB+ full-featured)
│   ├── admin-about-panel.html      ← About page admin sub-panel
│   ├── index.html                  ← Homepage (school website)
│   ├── organizational-tree.html    ← Staff org chart viewer
│   ├── staff-management-admin.html ← Staff management panel
│   ├── student-directory.html      ← Public student directory
│   ├── student-login.html          ← Student auth entry
│   ├── student-portal.html         ← Student self-service portal
│   └── teacher-portal.html         ← Teacher dashboard portal
│
├── 📁 js/                          ← Application JavaScript modules
│   ├── supabase-client.js          ⭐ Core DB client + shared CRUD (required everywhere)
│   ├── about-data.js               ← About page data layer & render functions
│   ├── admin-about-handler.js      ← About page admin CRUD operations
│   ├── admission-handler.js        ← Student admission processing
│   ├── biometric-attendance.js     ← Attendance marking & sessions
│   ├── class-handler.js            ← Class/section CRUD
│   ├── document-handler.js         ← Document upload & management
│   ├── exam-portal-admin.js        ← Exam admin management
│   ├── exam-result-admin-handler.js← Exam result entry (admin)
│   ├── exam-result-handler.js      ← Exam result viewer (student)
│   ├── fee-handler.js              ← Full fee management lifecycle
│   ├── staff-handler.js            ← Staff profile CRUD
│   ├── student-directory-handler.js← Student directory renderer
│   ├── student-fee-portal.js       ← Student fee status viewer
│   ├── student-profiles-handler.js ← Student profile CRUD
│   ├── subject-handler.js          ← Academic subjects CRUD
│   └── timetable-handler.js        ← Timetable builder
│
├── 📁 css/                         ← Stylesheets
│   └── id-card.css                 ← Student ID card print styles
│
├── 📁 images/                      ← Static image assets
│   ├── logo.png                    ← School logo
│   ├── saraswati.png               ← School emblem
│   ├── img.jpg / img1-3.png        ← Campus photos
│   └── signature.jpg               ← Principal signature (ID cards)
│
├── 📁 sql/                         ← Database SQL scripts
│   ├── 📁 setup/                   ← Table creation & initial data scripts
│   │   ├── setup.sql               ← Master setup (run first)
│   │   ├── QUICK_SETUP.sql         ← Minimal quick-start
│   │   ├── ABOUT_PAGE_SETUP.sql
│   │   ├── ADVANCED_FEE_MANAGEMENT_SETUP.sql
│   │   ├── EXAM_RESULTS_SETUP.sql
│   │   ├── STAFF_HIERARCHY_SETUP.sql
│   │   └── ... (16 more setup files)
│   ├── 📁 fixes/                   ← Alter, fix, and patch scripts
│   │   ├── FIX_RLS_POLICIES.sql    ← Row-Level Security policy fixes
│   │   ├── FIX_EXAM_RESULTS_COLUMNS.sql
│   │   └── INSERT_CLASS12_STUDENTS.sql
│   └── 📁 queries/                 ← Reference queries & reports
│       └── EXAM_RESULTS_ADMIN_QUERIES.sql
│
├── 📁 docs/                        ← Project documentation
│   ├── 📁 guides/                  ← How-to guides & quick-start references
│   │   ├── QUICK_START_GUIDE.md
│   │   ├── ADMIN_QUICK_REFERENCE.md
│   │   ├── FEE_MANAGEMENT_QUICK_START.md
│   │   ├── EXAM_RESULTS_QUICK_START.md
│   │   └── ... (3 more guides)
│   ├── 📁 implementation/          ← Detailed implementation notes
│   │   ├── ABOUT_PAGE_IMPLEMENTATION_SUMMARY.md
│   │   ├── ADVANCED_FEE_MANAGEMENT_GUIDE.md
│   │   ├── INTEGRATION_GUIDE.md
│   │   └── ... (11 more impl docs)
│   └── 📁 reference/               ← System-level reference documents
│       ├── SYSTEM_OVERVIEW.md
│       ├── TECHNICAL_REFERENCE.md
│       ├── FILE_MANIFEST.md
│       └── FILE_LISTING_AND_NAVIGATION.md
│
├── 📁 scripts/                     ← Developer utilities (not used at runtime)
│   └── 📁 dev-tools/               ← One-off migration & fix scripts (archived)
│       ├── fix_errors.js
│       ├── inject_marksheet.js
│       ├── organize.ps1
│       └── ... (22 more archived scripts)
│
└── 📁 adms-api/                    ← Backend Node.js API server (optional)
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Vanilla HTML5, CSS3, JavaScript (ES6+) |
| **Database** | Supabase (PostgreSQL) — two clients: DB + Media |
| **Storage** | Supabase Storage (photos, documents) with base64 fallback |
| **Auth** | Supabase Auth (admin) + localStorage session (student/teacher) |
| **Hosting** | Static file server (any CDN/VPS) |
| **Fonts** | Google Fonts (Inter, Poppins) |

---

## 🚀 Quick Setup

### 1. Configure Supabase
Edit `js/supabase-client.js` and replace the credentials:
```js
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

### 2. Run Database Setup
In Supabase SQL Editor, run scripts in this order:
```
sql/setup/setup.sql              ← Core tables
sql/setup/QUICK_SETUP.sql        ← Essential defaults
sql/fixes/FIX_RLS_POLICIES.sql   ← Row-Level Security (IMPORTANT)
```

### 3. Serve the Project
Any static file server works. For local development:
```bash
# Python
python -m http.server 8099

# Node.js
npx serve . -p 8099
```

### 4. Access the System
| URL | Page |
|---|---|
| `http://localhost:8099/` | School website homepage |
| `http://localhost:8099/html/admin-portal.html` | Admin HQ |
| `http://localhost:8099/html/about.html` | About Us page |
| `http://localhost:8099/html/student-portal.html` | Student portal |
| `http://localhost:8099/html/teacher-portal.html` | Teacher portal |

---

## 📖 Documentation

| Resource | Location |
|---|---|
| Admin Quick Reference | `docs/guides/ADMIN_QUICK_REFERENCE.md` |
| Fee Management Guide | `docs/implementation/ADVANCED_FEE_MANAGEMENT_GUIDE.md` |
| Exam Results Setup | `docs/guides/EXAM_RESULTS_QUICK_START.md` |
| Staff Hierarchy Setup | `docs/implementation/STAFF_HIERARCHY_SETUP_GUIDE.md` |
| System Overview | `docs/reference/SYSTEM_OVERVIEW.md` |
| Full File Manifest | `docs/reference/FILE_MANIFEST.md` |

---

## 🏫 About the School

**Shree Saraswati Secondary School**
Satyawati Municipality-6, Johang, Gulmi, Nepal
Established: **2016 B.S. (1959 A.D.)**
Streams: General Secondary + CTEVT Computer Engineering (Classes 9–12)

---

*Last organized: 2026-06-03 | Maintained by the School Management Committee & IT Team*
