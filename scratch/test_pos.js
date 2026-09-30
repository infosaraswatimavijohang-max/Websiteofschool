const fs = require('fs');
const path = 'c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/html/admin-portal.html';
const html = fs.readFileSync(path, 'utf8');
const lines = html.split('\n');

const startLine = 4816; 
const jsLines = lines.slice(startLine, 13668); 
const jsContent = jsLines.join('\n');

// We want to find what is at that index in jsContent
const index = jsContent.indexOf('{');
console.log("First index of '{':", index);
const sub = jsContent.substring(0, index);
console.log("Lines before index:", sub.split('\n').length);
console.log("Line in html:", sub.split('\n').length + startLine);
console.log("Line content:", lines[sub.split('\n').length + startLine - 1]);
