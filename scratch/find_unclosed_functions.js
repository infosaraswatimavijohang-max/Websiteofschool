const fs = require('fs');
const vm = require('vm');

const path = 'c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/html/admin-portal.html';
const html = fs.readFileSync(path, 'utf8');

const lines = html.split('\n');
const startLine = 4816; // 1-indexed
const jsLines = lines.slice(startLine, 13668);

// We want to find top-level function headers or potential block starts.
// Let's scan line-by-line and identify lines containing "function " or "async function" or " = function" or " = async".
const functionStarts = [];
jsLines.forEach((line, index) => {
  const actualLineNum = index + startLine + 1;
  if (line.includes('function') && (line.includes('{') || jsLines[index+1]?.includes('{'))) {
    functionStarts.push({ lineNum: actualLineNum, index, text: line.trim() });
  }
});

console.log(`Found ${functionStarts.length} candidate function starts.`);

// For each function candidate, we take the text from its start to the next function start, and try to compile it.
for (let i = 0; i < functionStarts.length; i++) {
  const start = functionStarts[i];
  const nextStartIdx = (i < functionStarts.length - 1) ? functionStarts[i+1].index : jsLines.length;
  
  const funcLines = jsLines.slice(start.index, nextStartIdx);
  const funcCode = funcLines.join('\n');
  
  // Try to compile the function code as-is
  try {
    new vm.Script(funcCode);
  } catch (err) {
    if (err.message.includes('Unexpected end of input')) {
      // It might be unclosed. Let's see if adding a closing brace helps
      try {
        new vm.Script(funcCode + '\n}');
        console.log(`\n[SUSPECT] Function starting at line ${start.lineNum} (${start.text}):`);
        console.log(`Adding '}' makes it compile successfully!`);
        console.log("Code snippet:");
        console.log(funcLines.slice(0, 10).join('\n'));
        console.log("...");
        console.log(funcLines.slice(-5).join('\n'));
      } catch (err2) {
        // If it still fails with Unexpected end of input, maybe it spans across multiple blocks or has a different error.
      }
    }
  }
}
