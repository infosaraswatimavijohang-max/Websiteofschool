const fs = require('fs');
const txt = fs.readFileSync('c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/html/admin-portal.html', 'utf8');
const regex = /onclick="switchPage\('([^']+)'/g;
let m;
let pages = new Set();
while((m = regex.exec(txt)) !== null) {
  pages.add(m[1]);
}
console.log(Array.from(pages).join(', '));
