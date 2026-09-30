const fs = require('fs');
const content = fs.readFileSync('c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/html/admin-portal.html', 'utf8');
const lines = content.split('\n');

lines.forEach((line, index) => {
  if (line.includes('Fee') || line.includes('Finance') || line.includes('Billing')) {
    if (line.includes('class=') || line.includes('nav-') || line.includes('href=') || line.includes('id=')) {
      console.log(`${index + 1}: ${line.trim()}`);
    }
  }
});
