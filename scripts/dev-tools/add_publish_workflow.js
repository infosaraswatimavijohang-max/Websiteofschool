const fs = require('fs');

const filePath = 'c:\\\\Users\\\\diwas\\\\OneDrive\\\\Documents\\\\Desktop\\\\school management saraswati\\\\html\\\\admin-portal.html';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add Publish Button to Ledger
const finalHtmlRegex = /<div class="ledger-title">\s*<h2>Shree Saraswati Secondary School<\/h2>\s*<h3>\$\{examType\} Ledger \$\{currentYear\}<\/h3>\s*<\/div>/;

const publishButtonHtml = `<div class="ledger-title">
          <h2>Shree Saraswati Secondary School</h2>
          <h3>\${examType} Ledger \${currentYear}</h3>
          <button class="submit-btn" style="background: var(--primary); margin-top: 10px; padding: 0.5rem 1rem;" onclick="publishCurrentLedger('\${className}', '\${examType}')">
             <i class="fas fa-bullhorn"></i> Publish Result to Student Portal
          </button>
        </div>`;

if (finalHtmlRegex.test(content)) {
    content = content.replace(finalHtmlRegex, publishButtonHtml);
    console.log("Added Publish button to ledger.");
}

// 2. Add publishCurrentLedger function
const publishFunc = `
    //  PUBLISH CURRENT LEDGER 
    function publishCurrentLedger(className, examType) {
      if (!confirm('Are you sure you want to publish these results to the student portal?')) return;
      
      const approvedResults = JSON.parse(localStorage.getItem('approved_results') || '[]');
      const submittedResults = JSON.parse(localStorage.getItem('submitted_results') || '[]');
      
      const allResults = [...approvedResults];
      submittedResults.forEach(sub => {
         if (sub.status !== 'Approved') {
            (sub.students || []).forEach(student => {
               allResults.push({
                  symbolNumber: student.symbolNumber,
                  name: student.name,
                  class: sub.class,
                  examType: sub.examType,
                  subject: sub.subject,
                  marks: student.marks,
                  totalMarks: student.totalMarks || 100
               });
            });
         }
      });

      const classResults = allResults.filter(r => r.class === className && r.examType === examType);
      if (classResults.length === 0) {
          alert("No results found to publish.");
          return;
      }

      const published = JSON.parse(localStorage.getItem('published_results') || '[]');
      
      // Remove previously published results for this class and exam to overwrite
      const newPublished = published.filter(r => !(r.class === className && r.examType === examType));
      
      // Add new results
      newPublished.push(...classResults);
      
      localStorage.setItem('published_results', JSON.stringify(newPublished));
      alert('Results successfully published! Students can now view them on the portal.');
    }
`;

const insertPoint = /\/\/  VIEW MARKSHEET /;
if (insertPoint.test(content)) {
    content = content.replace(insertPoint, publishFunc + '\n    //  VIEW MARKSHEET ');
    console.log("Added publishCurrentLedger function.");
}

// 3. Remove "Send" button from the ledger rows as it's no longer needed if we publish the whole ledger
const sendBtnRegex = /<button class="submit-btn" style="padding: 0\.2rem 0\.5rem; font-size: 0\.7rem; background: #10b981;" onclick="markResultSent\('\$\{student\.symbolNumber\}'\)">Send<\/button>/g;
content = content.replace(sendBtnRegex, '');

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Done modifying admin-portal.html for publish workflow.");
