const fs = require('fs');

const path = 'c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/html/admin-portal.html';
const html = fs.readFileSync(path, 'utf8');

const lines = html.split('\n');
const startLine = 4816; // 1-indexed (script block starts at 4816)
const jsLines = lines.slice(startLine, 13668); 
const jsContent = jsLines.join('\n');

// Standard tokenizer tracking braces, handling comments, strings, regex
let i = 0;
const len = jsContent.length;
const stack = [];

function getLineAndCol(pos) {
  const sub = jsContent.substring(0, pos);
  const l = sub.split('\n').length + startLine - 1;
  const c = sub.substring(sub.lastIndexOf('\n') + 1).length + 1;
  return { line: l, col: c, text: lines[l - 1].trim() };
}

// Helper to find preceding non-whitespace character
function getPrecedingNonWs(pos) {
  let p = pos - 1;
  while (p >= 0 && /\s/.test(jsContent[p])) {
    p--;
  }
  return p >= 0 ? jsContent[p] : '';
}

// Helper to get preceding token/character for regex check
function isRegexStart(pos) {
  const char = getPrecedingNonWs(pos);
  if (!char) return true;
  // If preceding char is one of these, it's a regex start:
  // '=', '(', '[', '{', ':', ',', '!', '&', '|', '?', ';', '+', '-', '*', '/', '>'
  if (['=', '(', '[', '{', ':', ',', '!', '&', '|', '?', ';', '+', '-', '*', '/', '>'].includes(char)) {
    return true;
  }
  // Check if it's a keyword like 'return', 'typeof', 'throw'
  // We can look back a few chars
  let p = pos - 1;
  while (p >= 0 && /\s/.test(jsContent[p])) p--;
  let word = '';
  while (p >= 0 && /[a-zA-Z0-9_$]/.test(jsContent[p])) {
    word = jsContent[p] + word;
    p--;
  }
  if (['return', 'throw', 'typeof', 'yield', 'delete', 'void', 'in', 'instanceof', 'const', 'let', 'var'].includes(word)) {
    return true;
  }
  return false;
}

while (i < len) {
  const char = jsContent[i];
  
  // 1. Line comments
  if (char === '/' && jsContent[i+1] === '/') {
    i += 2;
    while (i < len && jsContent[i] !== '\n') i++;
    continue;
  }
  
  // 2. Block comments
  if (char === '/' && jsContent[i+1] === '*') {
    i += 2;
    while (i < len - 1 && !(jsContent[i] === '*' && jsContent[i+1] === '/')) {
      i++;
    }
    i += 2;
    continue;
  }
  
  // 3. Regex literals (e.g. /regex/g)
  if (char === '/' && isRegexStart(i)) {
    // Walk until closing / (not escaped, and not in bracket)
    i++;
    let inBracket = false;
    while (i < len) {
      if (jsContent[i] === '\\') {
        i += 2;
        continue;
      }
      if (jsContent[i] === '[') {
        inBracket = true;
      }
      if (jsContent[i] === ']') {
        inBracket = false;
      }
      if (jsContent[i] === '/' && !inBracket) {
        break;
      }
      i++;
    }
    i++; // Skip the closing '/'
    // Skip trailing flags (e.g. g, i, m)
    while (i < len && /[a-z]/i.test(jsContent[i])) {
      i++;
    }
    continue;
  }
  
  // 4. Double quote strings
  if (char === '"') {
    i++;
    while (i < len && jsContent[i] !== '"') {
      if (jsContent[i] === '\\') i++;
      i++;
    }
    i++;
    continue;
  }
  
  // 5. Single quote strings
  if (char === "'") {
    i++;
    while (i < len && jsContent[i] !== "'") {
      if (jsContent[i] === '\\') i++;
      i++;
    }
    i++;
    continue;
  }
  
  // 6. Template literals
  if (char === '`') {
    i++;
    while (i < len && jsContent[i] !== '`') {
      if (jsContent[i] === '\\') i++;
      // Handle simple brace check inside ${} if needed, but usually simple string matching is fine
      i++;
    }
    i++;
    continue;
  }
  
  // 7. Brackets matching
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
  console.log("Unclosed items:");
  stack.forEach((item, idx) => {
    console.log(`${idx + 1}: Open '${item.char}' at:`, getLineAndCol(item.pos));
  });
}
