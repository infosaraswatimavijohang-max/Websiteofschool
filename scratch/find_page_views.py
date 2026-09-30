import re

with open(r'c:\Users\diwas\OneDrive\Documents\Desktop\school management saraswati\html\admin-portal.html', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Find all divs with class="page-view" and print their ID and start line
matches = re.finditer(r'<div\s+[^>]*class=["\']page-view[^"\']*["\'][^>]*id=["\']([^"\']+)["\']', content)
for m in matches:
    print(f"Page ID: {m.group(1)}")
