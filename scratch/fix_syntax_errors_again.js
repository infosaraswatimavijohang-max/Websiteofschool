const fs = require('fs');

// Fix admin-portal.html
const htmlPath = 'c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/html/admin-portal.html';
let htmlTxt = fs.readFileSync(htmlPath, 'utf8');
if (htmlTxt.includes('async async function handleAdminLogin')) {
    htmlTxt = htmlTxt.replace('async async function handleAdminLogin', 'async function handleAdminLogin');
    fs.writeFileSync(htmlPath, htmlTxt, 'utf8');
    console.log('Fixed async async in admin-portal.html');
} else {
    console.log('async async not found in admin-portal.html');
}

// Fix manual-attendance.js
const jsPath = 'c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/js/manual-attendance.js';
let jsTxt = fs.readFileSync(jsPath, 'utf8');
const badSyntax = '\\`input[name="status_\\${id}"]:checked\\`';
const goodSyntax = '`input[name="status_${id}"]:checked`';

if (jsTxt.includes(badSyntax)) {
    jsTxt = jsTxt.replace(badSyntax, goodSyntax);
    fs.writeFileSync(jsPath, jsTxt, 'utf8');
    console.log('Fixed syntax in manual-attendance.js');
} else {
    console.log('bad syntax not found in manual-attendance.js');
}
