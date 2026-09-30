const fs = require('fs');
const { execSync } = require('child_process');

const path = 'c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/html/admin-portal.html';
const html = fs.readFileSync(path, 'utf8');

const lines = html.split('\n');

console.log(`Original line count (split by \\n): ${lines.length}`);
console.log(`Line 4877 (index 4876): ${lines[4876]}`);
console.log(`Line 4878 (index 4877): ${lines[4877]}`);
console.log(`Line 4879 (index 4878): ${lines[4878]}`);

// Insert the closing brace '    }' right before line 4878 (index 4877)
const modifiedLines = [
  ...lines.slice(0, 4877),
  '    }',
  ...lines.slice(4877)
];

const newHtml = modifiedLines.join('\n');
const startLine = 4816; // 1-indexed (script block starts at 4816)
// Exclude </script> tag which is now at line 13669
const jsLines = modifiedLines.slice(startLine, 13668);
const jsContent = jsLines.join('\n');

const tempPath = 'c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/scratch/temp_script_fixed.js';
fs.writeFileSync(tempPath, jsContent, 'utf8');

try {
  execSync(`node --check "${tempPath}"`, { encoding: 'utf8', stdio: 'pipe' });
  console.log("Syntax check passed completely with the \\n split!");
  
  // Write the actual file!
  fs.writeFileSync(path, newHtml, 'utf8');
  console.log("admin-portal.html successfully updated and saved.");
} catch (err) {
  console.error("Syntax check still failed after insertion:");
  console.error(err.stderr || err.stdout || err.message);
}
