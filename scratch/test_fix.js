const fs = require('fs');
const { execSync } = require('child_process');

const path = 'c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/html/admin-portal.html';
let html = fs.readFileSync(path, 'utf8');

const targetStr = `      if (!localStorage.getItem('school_announcements')) {
        localStorage.setItem('school_announcements', JSON.stringify([
          { date: "19 MAY 2026", title: "First Term Examination Timetables Commencing", category: "Academic", desc: "Examination timelines published commencing Shrawan 15. Question sets due by Sunday." },
          { date: "15 MAY 2026", title: "Staff Meeting & Curriculum Briefing Today", category: "General", desc: "Urgent briefing with the Principal in the lounge today at 3:30 PM." }
        ]));
      }
    // ── SWITCH PAGES ──`;

const replacementStr = `      if (!localStorage.getItem('school_announcements')) {
        localStorage.setItem('school_announcements', JSON.stringify([
          { date: "19 MAY 2026", title: "First Term Examination Timetables Commencing", category: "Academic", desc: "Examination timelines published commencing Shrawan 15. Question sets due by Sunday." },
          { date: "15 MAY 2026", title: "Staff Meeting & Curriculum Briefing Today", category: "General", desc: "Urgent briefing with the Principal in the lounge today at 3:30 PM." }
        ]));
      }
    }
    // ── SWITCH PAGES ──`;

if (html.includes(targetStr)) {
  html = html.replace(targetStr, replacementStr);
  console.log("Replaced! Now running check syntax...");
  
  // Extract and check
  const lines = html.split('\n');
  const startLine = 4816; 
  const jsLines = lines.slice(startLine, 13667); // Adjust end index since we added 1 line
  const jsContent = jsLines.join('\n');
  
  const tempPath = 'c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/scratch/temp_script_fixed.js';
  fs.writeFileSync(tempPath, jsContent, 'utf8');
  
  try {
    execSync(`node --check "${tempPath}"`, { encoding: 'utf8', stdio: 'pipe' });
    console.log("Syntax check passed completely with the fix!");
  } catch (err) {
    console.error("Syntax check still failed:");
    console.error(err.stderr || err.stdout || err.message);
  }
} else {
  console.error("Target string not found in html!");
}
