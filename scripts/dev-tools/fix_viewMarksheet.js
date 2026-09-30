const fs = require('fs');

const filePath = 'c:\\\\Users\\\\diwas\\\\OneDrive\\\\Documents\\\\Desktop\\\\school management saraswati\\\\html\\\\admin-portal.html';
let content = fs.readFileSync(filePath, 'utf-8');

const regex = /function viewMarksheet\(symbolNumber\) \{([\s\S]*?)let studentResults = approvedResults\.filter/m;

const replacement = `function viewMarksheet(symbolNumber) {
      const className = document.getElementById('leadersheet-class')?.value;
      const examType = document.getElementById('leadersheet-exam')?.value;
      
      const approvedResults = JSON.parse(localStorage.getItem('approved_results') || '[]');
      const submittedResults = JSON.parse(localStorage.getItem('submitted_results') || '[]');
      const studentsRegistry = JSON.parse(localStorage.getItem('students_registry') || '[]');
      
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

      // First try to get results with class and exam filters
      let studentResults = allResults.filter`;

if (regex.test(content)) {
   content = content.replace(regex, replacement);
   
   // We also need to fix the rank calculation at the end of viewMarksheet
   const rankRegex = /const classResults = approvedResults\.filter/;
   if (rankRegex.test(content)) {
      content = content.replace(rankRegex, 'const classResults = allResults.filter');
   }
   
   fs.writeFileSync(filePath, content, 'utf-8');
   console.log("Fixed viewMarksheet to use unapproved results.");
} else {
   console.log("Could not find viewMarksheet regex.");
}
