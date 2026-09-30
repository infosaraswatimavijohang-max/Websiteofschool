const fs = require('fs');

const path = 'c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/html/admin-portal.html';
const html = fs.readFileSync(path, 'utf8');

// Get script block starting at line 4816
const lines = html.split('\n');
const startLine = 4816; // 1-indexed
// Find where it ends. It ends at line 13668.
const jsLines = lines.slice(startLine, 13668); // line 4816 is index 4815, up to 13668 (index 13667)
const jsContent = jsLines.join('\n');

// We want to find unclosed braces by walking the characters and skipping strings/comments.
let i = 0;
const len = jsContent.length;
const stack = [];

function getLineAndCol(pos) {
  const sub = jsContent.substring(0, pos);
  const l = sub.split('\n').length + startLine - 1;
  const c = sub.substring(sub.lastIndexOf('\n') + 1).length + 1;
  // Get the content of that line for printing
  const lineContent = lines[l - 1];
  return { line: l, col: c, text: lineContent.trim() };
}

while (i < len) {
  const char = jsContent[i];
  
  // Skip single-line comment
  if (char === '/' && jsContent[i+1] === '/') {
    i += 2;
    while (i < len && jsContent[i] !== '\n') {
      i++;
    }
    continue;
  }
  
  // Skip multi-line comment
  if (char === '/' && jsContent[i+1] === '*') {
    i += 2;
    while (i < len - 1 && !(jsContent[i] === '*' && jsContent[i+1] === '/')) {
      i++;
    }
    i += 2;
    continue;
  }
  
  // Skip string double quote
  if (char === '"') {
    i++;
    while (i < len && jsContent[i] !== '"') {
      if (jsContent[i] === '\\') i++;
      i++;
    }
    i++;
    continue;
  }
  
  // Skip string single quote
  if (char === "'") {
    i++;
    while (i < len && jsContent[i] !== "'") {
      if (jsContent[i] === '\\') i++;
      i++;
    }
    i++;
    continue;
  }
  
  // Skip template literal
  if (char === '`') {
    i++;
    while (i < len && jsContent[i] !== '`') {
      if (jsContent[i] === '\\') i++;
      // Note: we don't handle ${} nesting inside template literal here for simplicity,
      // but let's see if this is enough.
      i++;
    }
    i++;
    continue;
  }
  
  if (char === '{' || char === '(' || char === '[') {
    stack.push({ char, pos: i });
  } else if (char === '}' || char === ')' || char === ']') {
    if (stack.length === 0) {
      console.log(`Unmatched closing character '${char}' at:`, getLineAndCol(i));
    } else {
      const top = stack.pop();
      const expected = { '}': '{', ')': '(', ']': '[' }[char];
      if (top.char !== expected) {
        console.log(`Mismatch! Found '${char}' at:`, getLineAndCol(i), `but expected close for '${top.char}' opened at:`, getLineAndCol(top.pos));
      }
    }
  }
  i++;
}

console.log(`Finished scanning. Remaining stack items: ${stack.length}`);
if (stack.length > 0) {
  console.log("Unclosed items (top 20 oldest):");
  stack.slice(0, 20).forEach(item => {
    console.log(`Open '${item.char}' at:`, getLineAndCol(item.pos));
  });
}
