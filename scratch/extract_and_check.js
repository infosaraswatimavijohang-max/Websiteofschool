const fs = require('fs');
const { execSync } = require('child_process');

const path = 'c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/html/admin-portal.html';
const html = fs.readFileSync(path, 'utf8');

const lines = html.split('\n');
const startLine = 4816; // 1-indexed (script block starts at 4816)
// Exclude the </script> tag which is on line 13668 (index 13667)
const jsLines = lines.slice(startLine, 13667);
const jsContent = jsLines.join('\n');

const tempPath = 'c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/scratch/temp_script.js';
fs.writeFileSync(tempPath, jsContent, 'utf8');

console.log("Extracted JS (excluding </script>) to scratch/temp_script.js.");
try {
  const result = execSync(`node --check "${tempPath}"`, { encoding: 'utf8', stdio: 'pipe' });
  console.log("Syntax check passed!");
} catch (err) {
  console.log("Syntax check failed:");
  console.log(err.stderr || err.stdout || err.message);
  
  const errOutput = err.stderr || '';
  const match = errOutput.match(/temp_script\.js:(\d+)/);
  if (match) {
    const errLine = parseInt(match[1]);
    console.log(`\nError is at line ${errLine} of temp_script.js (corresponding to line ${errLine + startLine} in admin-portal.html)`);
    const tempLines = jsContent.split('\n');
    const startIdx = Math.max(0, errLine - 5);
    const endIdx = Math.min(tempLines.length, errLine + 5);
    for (let k = startIdx; k < endIdx; k++) {
      console.log(`${k + 1 + startLine}: ${tempLines[k]}`);
    }
  }
}
