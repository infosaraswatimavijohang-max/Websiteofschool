const fs = require('fs');
const txt = fs.readFileSync('c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/html/admin-portal.html', 'utf8');
const lines = txt.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Academic_Report')) {
        console.log("Line: " + (i + 1) + " -> " + lines[i]);
    }
}
