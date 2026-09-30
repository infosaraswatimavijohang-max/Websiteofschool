const fs = require('fs');
const path = require('path');
const vm = require('vm');

const htmlPath = path.join(__dirname, '..', 'html', 'admin-portal.html');
console.log(`Reading ${htmlPath}...`);

try {
  const content = fs.readFileSync(htmlPath, 'utf8');
  
  // Extract all inline script blocks
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let blockCount = 0;
  let errorCount = 0;
  
  while ((match = scriptRegex.exec(content)) !== null) {
    const scriptText = match[1].trim();
    const hasSrc = /src=/i.test(match[0]);
    
    if (hasSrc || !scriptText) {
      continue; // Skip external scripts
    }
    
    blockCount++;
    try {
      // Compile script to check syntax
      new vm.Script(scriptText, { filename: `inline-script-block-${blockCount}` });
    } catch (err) {
      errorCount++;
      console.error(`\n❌ Syntax Error in Inline Script Block #${blockCount}:`);
      console.error(err.stack || err.message);
      
      // Print context of the error
      if (err.lineNumber || err.line) {
        const lines = scriptText.split('\n');
        const errLine = (err.lineNumber || err.line) - 1;
        console.error('Context:');
        for (let i = Math.max(0, errLine - 3); i <= Math.min(lines.length - 1, errLine + 3); i++) {
          const indicator = i === errLine ? '>> ' : '   ';
          console.error(`${indicator}${i + 1}: ${lines[i]}`);
        }
      }
    }
  }
  
  console.log(`\nScan completed. Analyzed ${blockCount} inline script blocks.`);
  if (errorCount === 0) {
    console.log('✅ Success! No JavaScript syntax errors found in admin-portal.html.');
    process.exit(0);
  } else {
    console.error(`❌ Failed! Found ${errorCount} script blocks with syntax errors.`);
    process.exit(1);
  }
} catch (err) {
  console.error('Error reading/scanning HTML file:', err);
  process.exit(1);
}
