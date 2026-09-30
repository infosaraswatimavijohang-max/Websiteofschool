const fs = require('fs');
const vm = require('vm');

const path = 'c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/html/admin-portal.html';
const html = fs.readFileSync(path, 'utf8');

// Simple regex to find script content
// We match <script>...</script> but only the inline ones
const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;

while ((match = scriptRegex.exec(html)) !== null) {
  count++;
  const jsContent = match[1];
  // Calculate start line of the script tag in the HTML file
  const beforeMatch = html.substring(0, match.index);
  const startLine = beforeMatch.split('\n').length;
  
  console.log(`Checking script block #${count} starting at line ${startLine}...`);
  try {
    new vm.Script(jsContent, { filename: `script_${count}.js` });
    console.log(`Script block #${count} is valid.`);
  } catch (err) {
    console.error(`SyntaxError in script block #${count} (approx HTML line ${startLine}):`);
    console.error(err.stack || err.message);
    
    // Let's print the end of the script block to see if something is missing
    const lines = jsContent.split('\n');
    console.log("Last 20 lines of the script block:");
    console.log(lines.slice(-20).join('\n'));
  }
}
