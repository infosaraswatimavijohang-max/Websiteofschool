const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\diwas\\OneDrive\\Documents\\Desktop\\school management saraswati\\html\\admin-portal.html', 'utf8');

const regex = /<div\s+[^>]*class=["']page-view[^"']*["'][^>]*id=["']([^"']+)["']/g;
let match;
while ((match = regex.exec(content)) !== null) {
  console.log(`Page ID: ${match[1]}`);
}
