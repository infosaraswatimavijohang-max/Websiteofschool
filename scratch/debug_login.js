const fs = require('fs');
const path = 'c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/html/admin-portal.html';
const buffer = fs.readFileSync(path);
let encoding = 'utf8';
if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
    encoding = 'utf16le';
}
const txt = buffer.toString(encoding);

const btnIndex = txt.indexOf('Sign In');
if (btnIndex !== -1) {
    console.log("HTML around Sign In:");
    console.log(txt.substring(btnIndex - 200, btnIndex + 200));
}

const fnIndex = txt.indexOf('handleAdminLogin');
if (fnIndex !== -1) {
    console.log("Function handleAdminLogin:");
    console.log(txt.substring(fnIndex - 100, fnIndex + 500));
} else {
    console.log("handleAdminLogin not found in admin-portal.html");
}
