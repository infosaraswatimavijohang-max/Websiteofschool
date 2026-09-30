const fs = require('fs');
const txt = fs.readFileSync('c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/html/admin-portal.html', 'utf8');

const id1 = 'id="teachers"';
const idx1 = txt.indexOf(id1);
if (idx1 > -1) {
    console.log("Found teachers:");
    console.log(txt.substring(idx1 - 50, idx1 + 500));
} else {
    console.log("NOT FOUND: teachers");
}

const id2 = 'id="teacher-profiles"';
const idx2 = txt.indexOf(id2);
if (idx2 > -1) {
    console.log("Found teacher-profiles:");
    console.log(txt.substring(idx2 - 50, idx2 + 500));
} else {
    console.log("NOT FOUND: teacher-profiles");
}
