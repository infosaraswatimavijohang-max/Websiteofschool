const fs = require('fs');
const txt = fs.readFileSync('c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/html/admin-portal.html', 'utf8');

const id1 = "switchPage('teachers'";
const idx1 = txt.indexOf(id1);
if (idx1 > -1) {
    console.log("Found switchPage('teachers'):");
    console.log(txt.substring(idx1 - 100, idx1 + 200));
} else {
    console.log("NOT FOUND: switchPage('teachers')");
}
