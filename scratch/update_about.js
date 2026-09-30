const fs = require('fs');
const indexHtml = fs.readFileSync('index.html', 'utf8');
let aboutHtml = fs.readFileSync('html/about.html', 'utf8');

// Extract top part from index.html (from topbar up to closing header)
const topRegex = /(<!-- TOP BAR.*?)(<\/header>)/s;
const indexTopMatch = indexHtml.match(topRegex);
if (!indexTopMatch) throw new Error('Could not find top bar/header in index.html');

let newTop = indexTopMatch[0];

// Adjust paths for about.html (which is in html/ folder)
newTop = newTop.replace(/href="html\//g, 'href="');
newTop = newTop.replace(/href="index\.html"/g, 'href="../index.html"');
newTop = newTop.replace(/src="images\//g, 'src="../images/');
newTop = newTop.replace(/href="images\//g, 'href="../images/');

// Update active class
newTop = newTop.replace(/class="active">Home<\/a>/, '>Home</a>');
newTop = newTop.replace(/>About Us<\/a>/, ' class="active">About Us</a>');

// Replace in about.html (from topbar up to closing header)
const aboutTopRegex = /(<!-- TOP BAR.*?)(<\/header>)/s;
aboutHtml = aboutHtml.replace(aboutTopRegex, newTop);

// Extract footer from index.html
const footerRegex = /(<footer>.*?)(<\/footer>)/s;
const indexFooterMatch = indexHtml.match(footerRegex);
if (!indexFooterMatch) throw new Error('Could not find footer in index.html');

let newFooter = indexFooterMatch[0];

// Adjust paths for about.html
newFooter = newFooter.replace(/href="html\//g, 'href="');
newFooter = newFooter.replace(/href="index\.html"/g, 'href="../index.html"');
newFooter = newFooter.replace(/src="images\//g, 'src="../images/');
newFooter = newFooter.replace(/href="images\//g, 'href="../images/');

// Replace footer in about.html
const aboutFooterRegex = /(<footer>.*?)(<\/footer>)/s;
aboutHtml = aboutHtml.replace(aboutFooterRegex, newFooter);

fs.writeFileSync('html/about.html', aboutHtml, 'utf8');
console.log('Successfully updated about.html header and footer.');
