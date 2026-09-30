const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\diwas\\OneDrive\\Documents\\Desktop\\school management saraswati\\html\\admin-portal.html', 'utf8');

const targetId = 'page-manage-about';
const startIdx = content.indexOf(`id="${targetId}"`);
if (startIdx === -1) {
  console.log(`Could not find id="${targetId}"`);
  process.exit(1);
}

// Search for the end of the div
let openDivs = 0;
let i = startIdx;
while (i > 0 && content[i] !== '<') {
  i--;
}

const sliceStart = i;
let sliceEnd = -1;

for (let j = sliceStart; j < content.length; j++) {
  if (content.substr(j, 4) === '<div') {
    openDivs++;
  } else if (content.substr(j, 5) === '</div') {
    openDivs--;
    if (openDivs === 0) {
      sliceEnd = j + 6;
      break;
    }
  }
}

if (sliceEnd !== -1) {
  console.log(content.substring(sliceStart, sliceEnd));
} else {
  console.log('Could not find closing div');
}
