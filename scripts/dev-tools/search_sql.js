const fs = require('fs');
const path = require('path');

const sqlDir = 'c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/sql';
const files = fs.readdirSync(sqlDir);

files.forEach(file => {
  if (file.endsWith('.sql')) {
    const filePath = path.join(sqlDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('approved_results') || line.includes('APPROVED_RESULTS')) {
        console.log(`${file}:${index + 1}: ${line.trim()}`);
      }
    });
  }
});
