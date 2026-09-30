const fs = require('fs');
const path = require('path');

const srcPath = path.join('c:\\Users\\diwas\\OneDrive\\Documents\\Desktop\\school management saraswati', 'index.html');
const destPath = path.join('c:\\Users\\diwas\\OneDrive\\Documents\\Desktop\\school management saraswati', 'html', 'index.html');

let content = fs.readFileSync(srcPath, 'utf-8');

// Fix asset paths: images/, js/, css/, docs/ -> ../images/, ../js/, ../css/, ../docs/
// Be careful to only replace paths in src="..." and href="..." attributes, not arbitrary text

// Fix src="images/ -> src="../images/
content = content.replace(/src="images\//g, 'src="../images/');

// Fix src='images/ -> src='../images/
content = content.replace(/src='images\//g, "src='../images/");

// Fix src="js/ -> src="../js/
content = content.replace(/src="js\//g, 'src="../js/');

// Fix src='js/ -> src='../js/
content = content.replace(/src='js\//g, "src='../js/");

// Fix href="css/ -> href="../css/
content = content.replace(/href="css\//g, 'href="../css/');

// Fix href='css/ -> href='../css/
content = content.replace(/href='css\//g, "href='../css/");

// Fix href="docs/ -> href="../docs/
content = content.replace(/href="docs\//g, 'href="../docs/');

// Fix href="html/about.html" -> href="about.html" (since we are now INSIDE html/)
content = content.replace(/href="html\//g, 'href="');

// Fix href='html/ -> href='
content = content.replace(/href='html\//g, "href='");

// Fix any url('images/ in CSS
content = content.replace(/url\('images\//g, "url('../images/");
content = content.replace(/url\("images\//g, 'url("../images/');

// Fix any references like action="..." pointing to relative paths
// Fix favicon if any
content = content.replace(/href="favicon/g, 'href="../favicon');

fs.writeFileSync(destPath, content, 'utf-8');
console.log('Successfully copied index.html to html/ folder with fixed paths.');

// Verify the file exists
if (fs.existsSync(destPath)) {
    const stats = fs.statSync(destPath);
    console.log(`File size: ${stats.size} bytes`);
}
