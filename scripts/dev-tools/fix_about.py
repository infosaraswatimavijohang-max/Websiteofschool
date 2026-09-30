import re
import json

file_path = 'js/about-data.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# For functions that use: if (error) { console.error('Error reading xyz:', error); return []; }
# We want to change to returning from localStorage.
def fix_if_error(match):
    err_msg = match.group(1)
    return f"""if (error) {{
    console.warn('{err_msg}:', error.message || error);
    const cached = localStorage.getItem('"""

# Let's just do targeted replacements.
tables = {
    'about_hero': 'hero',
    'about_stats': 'stats',
    'about_vision_mission': 'vision/mission',
    'about_era_cards': 'era cards',
    'about_timeline': 'timeline',
    'about_story': 'story',
    'about_technical_incharge_tree': 'technical incharge',
    'about_primary_incharge_tree': 'primary incharge'
}

for table, label in tables.items():
    # Replace: if (error) { console.error('Error reading [label]:', error); return []; }
    old_str = f"if (error) {{ console.error('Error reading {label}:', error); return []; }}"
    new_str = f"if (error) {{ console.warn('Error reading {label}:', error.message || error); const cached = localStorage.getItem('{table}'); return cached ? JSON.parse(cached) : []; }}"
    content = content.replace(old_str, new_str)

# Now for try/catch ones:
# about_leadership_desks
# about_alumni
# about_blogs

try_catch_tables = {
    'about_leadership_desks': 'leadership desks',
    'about_alumni': 'alumni highlights',
    'about_blogs': 'blog posts'
}

for table, label in try_catch_tables.items():
    # catch (error) {
    #   console.error('Error reading ...', error);
    #   return [];
    # }
    
    # We'll use regex for these since whitespace might vary
    pattern = re.compile(
        r"catch\s*\(\s*error\s*\)\s*\{\s*console\.error\('Error reading " + label + r":',\s*error\);\s*return\s*\[\];\s*\}",
        re.MULTILINE
    )
    
    new_str = f"""catch (error) {{
    console.warn('Error reading {label}:', error.message || error);
    const cached = localStorage.getItem('{table}');
    return cached ? JSON.parse(cached) : [];
  }}"""
    
    content = pattern.sub(new_str, content)

# Also fix the 'if (error) throw error;' lines to not throw, but fall through or just warn?
# Actually, if we throw, it goes to catch, which is fine! The catch block now returns cached data.

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('about-data.js updated.')
