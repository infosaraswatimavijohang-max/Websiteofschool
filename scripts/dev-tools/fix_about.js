const fs = require('fs');

const filePath = 'js/about-data.js';
let content = fs.readFileSync(filePath, 'utf8');

const tables = {
    'about_hero': 'hero',
    'about_stats': 'stats',
    'about_vision_mission': 'vision/mission',
    'about_era_cards': 'era cards',
    'about_timeline': 'timeline',
    'about_story': 'story',
    'about_technical_incharge_tree': 'technical incharge',
    'about_primary_incharge_tree': 'primary incharge'
};

for (const [table, label] of Object.entries(tables)) {
    const oldStr = `if (error) { console.error('Error reading ${label}:', error); return []; }`;
    const newStr = `if (error) { console.warn('Error reading ${label}:', error.message || error); const cached = localStorage.getItem('${table}'); return cached ? JSON.parse(cached) : []; }`;
    content = content.split(oldStr).join(newStr);
}

const tryCatchTables = {
    'about_leadership_desks': 'leadership desks',
    'about_alumni': 'alumni highlights',
    'about_blogs': 'blog posts'
};

for (const [table, label] of Object.entries(tryCatchTables)) {
    const pattern = new RegExp(`catch\\s*\\(\\s*error\\s*\\)\\s*\\{\\s*console\\.error\\('Error reading ${label}:',\\s*error\\);\\s*return\\s*\\[\\];\\s*\\}`, 'gm');
    const newStr = `catch (error) {
    console.warn('Error reading ${label}:', error.message || error);
    const cached = localStorage.getItem('${table}');
    return cached ? JSON.parse(cached) : [];
  }`;
    content = content.replace(pattern, newStr);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('about-data.js updated.');
