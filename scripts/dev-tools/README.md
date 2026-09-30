# 🔧 Developer Tools — Archived Scripts

This folder contains **one-off utility scripts** that were used during development and migration phases of the project. They are **not required at runtime** by any page or feature.

These scripts have been moved here from the project root to keep the codebase clean.

## Contents

| File | Original Purpose |
|---|---|
| `add_ledger_gpa.js` | One-off: Add GPA column to ledger table |
| `add_ledger_summary_cols.js` | One-off: Add summary columns to ledger |
| `add_publish_func.js` | One-off: Add publish function to Supabase |
| `add_publish_workflow.js` | One-off: Publish workflow migration |
| `copy_index_to_html.js` | One-off: Copy index.html to html/ folder |
| `COMPLETE_ABOUT_CRUD_FUNCTIONS.js` | Reference: Full About CRUD (now in about-data.js) |
| `find_fee_sidebar.js` | Dev: Search for fee sidebar element |
| `fix_about.js` | One-off: Fix about page rendering |
| `fix_about.py` | Python version of above |
| `fix_errors.js` | One-off: Bulk fix JS errors in portal |
| `fix_leadersheet.js` | One-off: Fix leader marksheet |
| `fix_viewMarksheet.js` | One-off: Fix marksheet viewer |
| `fix-student-table.js` | Dev: Fix student table display |
| `inject_ledger.js` | One-off: Inject ledger HTML block |
| `inject_marksheet.js` | One-off: Inject marksheet block into portal |
| `inject_marksheet.py` | Python version of above |
| `inject_marksheet_js.js` | One-off: Inject JS for marksheet |
| `organize.ps1` | Dev: Old organize script (PowerShell) |
| `organize_html.ps1` | Dev: Old HTML organizer (PowerShell) |
| `rebuild_about.js` | One-off: Rebuild about-data.js from scratch |
| `reconstruct.js` | One-off: Reconstruct data file |
| `search_sql.js` | Dev: Search SQL patterns in files |
| `STAFF_HIERARCHY_ADVANCED.sql` | Duplicate (canonical in sql/setup/) |
| `update_gpa.js` | One-off: Update GPA calculation logic |
| `update_index_marksheet.js` | One-off: Update marksheet in index.html |
| `update_index_marksheet.py` | Python version of above |
| `update_ledger_columns.js` | One-off: Update ledger column structure |

> **Note**: Do NOT delete these files without reviewing whether any code references them. They serve as an audit trail for how the codebase evolved.
