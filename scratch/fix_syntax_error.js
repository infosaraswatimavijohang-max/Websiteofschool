const fs = require('fs');
const path = 'c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/html/admin-portal.html';
let txt = fs.readFileSync(path, 'utf8');

const badInjection = `    <script src="../js/manual-attendance.js?v=' + Date.now() + '"></script>\n</body>`;
if (txt.includes(badInjection)) {
    // Replace it back to </body>
    txt = txt.replace(badInjection, '</body>');
    console.log("Removed bad injection.");
}

// Ensure the script tag is at the very end of the file.
const correctScriptTag = `<script src="../js/manual-attendance.js"></script>`;
// We find the LAST index of </body>
const lastBodyIndex = txt.lastIndexOf('</body>');
if (lastBodyIndex !== -1 && !txt.includes(correctScriptTag)) {
    txt = txt.substring(0, lastBodyIndex) + '    ' + correctScriptTag + '\n' + txt.substring(lastBodyIndex);
    console.log("Injected correct script tag at the end.");
}

fs.writeFileSync(path, txt, 'utf8');
console.log("admin-portal.html fixed.");
