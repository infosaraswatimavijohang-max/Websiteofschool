const fs = require('fs');

const filePath = 'c:\\\\Users\\\\diwas\\\\OneDrive\\\\Documents\\\\Desktop\\\\school management saraswati\\\\html\\\\admin-portal.html';
let content = fs.readFileSync(filePath, 'utf-8');

// Replace the Send button with View and Send buttons
const oldBtn = `<button class="submit-btn" style="padding: 0.3rem 0.8rem; font-size: 0.75rem; background: #10b981;" onclick="markResultSent('\${student.symbolNumber}')">Send</button>`;
const newBtn = `<button class="submit-btn" style="padding: 0.3rem 0.8rem; font-size: 0.75rem; background: #3b82f6; margin-right: 5px;" onclick="viewMarksheet('\${student.symbolNumber}')">View</button><button class="submit-btn" style="padding: 0.3rem 0.8rem; font-size: 0.75rem; background: #10b981;" onclick="markResultSent('\${student.symbolNumber}')">Send</button>`;

if (content.includes(oldBtn)) {
   content = content.replace(oldBtn, newBtn);
} else {
   console.log("Could not find the old button to replace!");
}

// Inject viewMarksheet function
const viewMarksheetFn = `
    // ── VIEW MARKSHEET ──
    function viewMarksheet(symbolNumber) {
      const className = document.getElementById('leadersheet-class')?.value;
      const examType = document.getElementById('leadersheet-exam')?.value;
      const approvedResults = JSON.parse(localStorage.getItem('approved_results') || '[]');
      const studentsRegistry = JSON.parse(localStorage.getItem('students_registry') || '[]');
      
      const studentResults = approvedResults.filter(r => r.symbolNumber === symbolNumber && r.class === className && r.examType === examType);
      
      if (studentResults.length === 0) return;

      const studentName = studentResults[0].name;
      
      // Try to find the student in registry for DOB
      const regStudent = studentsRegistry.find(s => s.roll == symbolNumber || s.name === studentName);
      const dob = regStudent && regStudent.dob ? regStudent.dob : '2066/11/22'; // Default fallback if not found

      document.getElementById('ms-student-name').innerText = studentName;
      document.getElementById('ms-student-dob').innerText = dob;
      document.getElementById('ms-student-grade').innerText = className;
      document.getElementById('ms-exam-name').innerText = examType ? examType.toUpperCase() : 'TERM EXAM';
      document.getElementById('ms-exam-title').innerText = examType || 'Term Exam';
      
      document.getElementById('ms-exam-year').innerText = "2082";
      document.getElementById('ms-issue-date').innerText = new Date().toLocaleDateString();

      const tbody = document.getElementById('ms-marks-tbody');
      tbody.innerHTML = '';

      let totalMarksObtained = 0;
      let totalMaxMarks = 0;

      studentResults.forEach((result, index) => {
         const marks = parseInt(result.marks) || 0;
         const maxMarks = parseInt(result.totalMarks) || 100;
         totalMarksObtained += marks;
         totalMaxMarks += maxMarks;

         const percentage = maxMarks > 0 ? (marks / maxMarks) * 100 : 0;
         const gpaData = calculateGPA(percentage);

         let remarks = 'ACCEPTABLE';
         if(percentage >= 90) remarks = 'OUTSTANDING';
         else if(percentage >= 80) remarks = 'EXCELLENT';
         else if(percentage >= 70) remarks = 'VERY GOOD';
         else if(percentage >= 60) remarks = 'GOOD';
         else if(percentage >= 50) remarks = 'SATISFACTORY';
         else if(percentage >= 40) remarks = 'ACCEPTABLE';
         else if(percentage >= 35) remarks = 'BASIC';
         else remarks = 'NOT GRADED';

         tbody.innerHTML += \`
            <tr>
               <td>\${index + 1}</td>
               <td>\${result.subject}</td>
               <td>\${result.creditHour || '4'}</td>
               <td>\${gpaData.gpa.toFixed(2)}</td>
               <td>\${gpaData.grade}</td>
               <td>\${remarks}</td>
            </tr>
         \`;
      });

      const overallPercentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0;
      const overallGpaData = calculateGPA(overallPercentage);
      
      document.getElementById('ms-overall-gpa').innerText = overallGpaData.gpa.toFixed(2);

      // Rank calculation
      const classResults = approvedResults.filter(r => r.class === className && r.examType === examType);
      const studentTotals = {};
      classResults.forEach(r => {
         if(!studentTotals[r.symbolNumber]) studentTotals[r.symbolNumber] = 0;
         studentTotals[r.symbolNumber] += parseInt(r.marks) || 0;
      });
      const sortedStudents = Object.keys(studentTotals).sort((a, b) => studentTotals[b] - studentTotals[a]);
      const rank = sortedStudents.indexOf(symbolNumber) + 1;
      document.getElementById('ms-rank').innerText = rank;

      window.print();
    }

    // ── RENDER RESULTS WITH GPA (LEADERSHEET) ──`;

if (!content.includes('function viewMarksheet(')) {
   content = content.replace('// ── RENDER RESULTS WITH GPA (LEADERSHEET) ──', viewMarksheetFn);
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Marksheet JS logic injected successfully.");
