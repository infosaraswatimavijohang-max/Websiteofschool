const fs = require('fs');
const lines = fs.readFileSync('C:/Users/diwas/.gemini/antigravity-ide/brain/64fc73f2-fb5c-4e74-ac20-1e0fae4c25a4/.system_generated/logs/transcript.jsonl', 'utf8').split('\n');

const reconstructedLines = {};

for (const line of lines) {
    if (!line) continue;
    try {
        const entry = JSON.parse(line);
        if (entry.type === 'VIEW_FILE' && entry.status === 'DONE' && entry.content) {
            const content = entry.content;
            if (content.includes('about-data.js') && content.includes('Showing lines ')) {
                const outLines = content.split('\n');
                for (const outLine of outLines) {
                    const match = outLine.match(/^(\d+): (.*)$/);
                    if (match) {
                        const lineNum = parseInt(match[1], 10);
                        const lineContent = match[2];
                        reconstructedLines[lineNum] = lineContent;
                    }
                }
            }
        }
    } catch (e) {
    }
}

const keys = Object.keys(reconstructedLines).map(Number).sort((a, b) => a - b);
console.log(`Recovered ${keys.length} distinct lines.`);
if (keys.length > 0) {
    let missingCount = 0;
    const maxLine = keys[keys.length - 1];
    let finalCode = '';
    for (let i = 1; i <= maxLine; i++) {
        if (reconstructedLines[i] !== undefined) {
            finalCode += reconstructedLines[i] + '\n';
        } else {
            finalCode += '// [MISSING LINE ' + i + ']\n';
            missingCount++;
        }
    }
    fs.writeFileSync('js/about-data_recovered.js', finalCode, 'utf8');
    console.log(`Saved js/about-data_recovered.js with ${missingCount} missing lines.`);
}
