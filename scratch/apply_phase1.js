const fs = require('fs');

function replaceInFile(filePath, searchStr, replaceStr, replaceAll = false) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    if (replaceAll) {
        content = content.split(searchStr).join(replaceStr);
    } else {
        content = content.replace(searchStr, replaceStr);
    }
    fs.writeFileSync(filePath, content);
}

const adminPortal = 'c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/html/admin-portal.html';
const studentPortal = 'c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/html/student-portal.html';
const teacherPortal = 'c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/html/teacher-portal.html';
const supabaseClient = 'c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/js/supabase-client.js';

// Fix addresses
replaceInFile(adminPortal, '<p>Johang, Satyawati, Gulmi</p>', '<p>Satyawati Rural Municipality-6 Johang, Gulmi</p>');
replaceInFile(studentPortal, '<p>Waling-1, Chhahare, Syangja</p>', '<p>Satyawati Rural Municipality-6 Johang, Gulmi</p>');

// Fix buttons
const oldBtn = '<button onclick="window.print()">🖨️ Print / Download PDF</button>';
const newBtns = `<button onclick="window.print()" style="margin-right: 10px; background:var(--accent); color:var(--dark); border:none; padding:0.5rem 1rem; border-radius:6px; font-weight:bold; cursor:pointer;">🖨️ Print</button>
      <button onclick="downloadPDF()" style="background:var(--primary); color:white; border:none; padding:0.5rem 1rem; border-radius:6px; font-weight:bold; cursor:pointer;">📄 Download PDF</button>`;

replaceInFile(adminPortal, oldBtn, newBtns, true);
replaceInFile(studentPortal, oldBtn, newBtns, true);

// Add downloadPDF function if missing (student portal might not have it)
const dlScript = `
function downloadPDF() {
  const element = document.getElementById('receipt-container');
  if(!element) { alert('Receipt not found'); return; }
  const opt = {
    margin:       0.5,
    filename:     'fee_receipt.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
}
`;
function addDownloadPDF(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('function downloadPDF()')) {
        content = content.replace('</script>\n</body>', dlScript + '\n</script>\n</body>');
        fs.writeFileSync(file, content);
    }
}
addDownloadPDF(studentPortal);
addDownloadPDF(adminPortal);

// Fix desc -> description in notices
// Admin portal inserts
replaceInFile(adminPortal, 'desc: desc', 'description: desc');
replaceInFile(adminPortal, ".eq('desc', noticeToDelete.desc)", ".eq('description', noticeToDelete.desc)");
replaceInFile(adminPortal, "desc: noticeToDelete.desc", "description: noticeToDelete.desc");

console.log("Phase 1 fixes applied successfully.");
