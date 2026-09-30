const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
let brokenLinksCount = 0;

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            callback(path.join(dir, f));
        }
    });
}

function checkLinksInFile(filePath) {
    if (!filePath.endsWith('.html') && !filePath.endsWith('.css')) return;
    const content = fs.readFileSync(filePath, 'utf8');
    const regex = /(?:href|src)=["']([^"']+)["']/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        let link = match[1];
        if (link.startsWith('http') || link.startsWith('mailto:') || link.startsWith('tel:') || link.startsWith('#') || link === '' || link.startsWith('data:')) {
            continue;
        }
        
        // Remove query params and hashes for file existence check
        link = link.split('?')[0].split('#')[0];
        if (link === '') continue;

        let targetPath;
        if (link.startsWith('/')) {
            targetPath = path.join(rootDir, link);
        } else {
            targetPath = path.join(path.dirname(filePath), link);
        }

        if (!fs.existsSync(targetPath)) {
            console.log(`Broken link found in ${path.relative(rootDir, filePath)}: ${match[1]} (resolved to ${targetPath})`);
            brokenLinksCount++;
        }
    }
}

walkDir(rootDir, (filePath) => {
    // skip node_modules and scratch directories
    if (filePath.includes('node_modules') || filePath.includes('scratch') || filePath.includes('.git') || filePath.includes('.system_generated')) return;
    checkLinksInFile(filePath);
});

console.log(`\nFound ${brokenLinksCount} broken links.`);
