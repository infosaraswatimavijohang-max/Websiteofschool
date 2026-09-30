const fs = require('fs');
const path = require('path');

const htmlPath = 'c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/html/admin-portal.html';
const html = fs.readFileSync(htmlPath, 'utf8');

const jsDir = 'c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/js';
const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js')).map(f => fs.readFileSync(path.join(jsDir, f), 'utf8'));

const allJs = html + '\n' + jsFiles.join('\n');

const regex = /(?:onclick|onsubmit|onchange)="([^"]+)"/g;
let match;
const missing = new Set();
const found = new Set();

while ((match = regex.exec(html)) !== null) {
  const expr = match[1];
  const funcMatch = expr.match(/^([a-zA-Z0-9_]+)\(/);
  if (funcMatch) {
    const funcName = funcMatch[1];
    
    // Ignore some default JS functions
    if (funcName === 'document' || funcName === 'window' || funcName === 'console' || funcName === 'alert') continue;
    
    // Check if defined
    if (!allJs.includes('function ' + funcName) && 
        !allJs.includes('const ' + funcName) && 
        !allJs.includes('let ' + funcName) && 
        !allJs.includes(funcName + ' =') && 
        !allJs.includes(funcName + ':') &&
        !allJs.includes(funcName + ' :')) {
      missing.add(funcName);
    } else {
      found.add(funcName);
    }
  }
}

console.log('--- Missing Handlers ---');
console.log(Array.from(missing).join('\n'));
console.log('\n--- Found Handlers ---');
console.log(Array.from(found).length + ' functions found.');
