const fs = require('fs');
const path = 'c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/html/admin-portal.html';
const buffer = fs.readFileSync(path);
// Detect encoding
let encoding = 'utf8';
if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
    encoding = 'utf16le';
}
const txt = buffer.toString(encoding);
console.log("File is " + encoding + ", length " + txt.length);

const regex = /<[^>]*onclick=\"[^\"]*biometric-attendance[^\"]*\"[^>]*>/i;
let m = regex.exec(txt);
if(m) {
    console.log(txt.substring(m.index - 100, m.index + 200));
} else {
    console.log("Not found.");
}
