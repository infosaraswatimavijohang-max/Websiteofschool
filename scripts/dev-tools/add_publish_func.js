const fs = require('fs');

const filePath = 'c:\\\\Users\\\\diwas\\\\OneDrive\\\\Documents\\\\Desktop\\\\school management saraswati\\\\html\\\\admin-portal.html';
let content = fs.readFileSync(filePath, 'utf-8');

const publishFunc = `
    // PUBLISH CURRENT LEDGER
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

      const classResults = allResults.filter(r => r.class === className && (r.examType === examType || !r.examType));
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

if (!content.includes('function publishCurrentLedger')) {
    content = content.replace('function viewMarksheet(symbolNumber) {', publishFunc + '\n    function viewMarksheet(symbolNumber) {');
    console.log("Added publishCurrentLedger function.");
    fs.writeFileSync(filePath, content, 'utf-8');
} else {
    console.log("Already added");
}
