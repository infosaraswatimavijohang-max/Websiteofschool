const fs = require('fs');

const filePath = 'c:\\\\Users\\\\diwas\\\\OneDrive\\\\Documents\\\\Desktop\\\\school management saraswati\\\\html\\\\admin-portal.html';
let content = fs.readFileSync(filePath, 'utf-8');

// Inject CSS for the ledger
const css = `
  <style id="ledger-style">
    .ledger-container {
      display: flex;
      gap: 20px;
      overflow-x: auto;
      padding-bottom: 20px;
    }
    .ledger-table-wrapper {
      flex: 1;
      overflow-x: auto;
    }
    .ledger-table {
      border-collapse: collapse;
      font-size: 11px;
      min-width: 1500px;
      background: white;
    }
    .ledger-table th, .ledger-table td {
      border: 1px solid #000;
      padding: 4px;
      text-align: center;
    }
    .ledger-table th {
      font-weight: bold;
      background: #f8fafc;
    }
    .ledger-summary {
      width: 250px;
      border: 1px solid #000;
      padding: 15px;
      background: white;
      font-size: 14px;
      font-weight: bold;
      line-height: 2;
      align-self: stretch;
    }
    .ledger-title {
      text-align: center;
      margin-bottom: 20px;
    }
    .ledger-title h2 {
      margin: 0;
      font-size: 20px;
    }
    .ledger-title h3 {
      margin: 5px 0 0 0;
      font-size: 16px;
    }
  </style>
</head>`;

if (!content.includes('<style id="ledger-style">')) {
   content = content.replace('</head>', css);
}

const renderResultsWithGPAFm = `
    // ── RENDER RESULTS WITH GPA (LEADERSHEET) ──
    function renderResultsWithGPA() {
      const tbody = document.getElementById('results-with-gpa-tbody');
      const thead = document.getElementById('leadersheet-thead');
      const wrapper = document.querySelector('.custom-table-wrapper');
      
      if (!tbody || !thead) return;
      
      const className = document.getElementById('leadersheet-class')?.value;
      const examType = document.getElementById('leadersheet-exam')?.value;

      const approvedResults = JSON.parse(localStorage.getItem('approved_results') || '[]');
      
      if (!className || !examType) {
         wrapper.innerHTML = '<div style="text-align:center; padding:2rem; color:var(--text-muted);">Please select a Class and Exam Type to generate the Terminal Ledger.</div>';
         return;
      }

      // Filter results for selected class and exam
      const filteredResults = approvedResults.filter(r => r.class === className && (r.examType === examType || !r.examType));

      if (filteredResults.length === 0) {
         wrapper.innerHTML = '<div style="text-align:center; padding:2rem; color:var(--text-muted);">No results found for this class and exam. Ensure you have approved the teachers\\' submissions.</div>';
         return;
      }

      // Extract unique subjects
      const subjectsSet = new Set();
      filteredResults.forEach(r => subjectsSet.add(r.subject));
      const subjects = Array.from(subjectsSet);

      // Group by student
      const studentMap = {};
      filteredResults.forEach(r => {
        if (!studentMap[r.symbolNumber]) {
          studentMap[r.symbolNumber] = {
            symbolNumber: r.symbolNumber,
            name: r.name,
            marksBySubject: {},
            totalMarksObtained: 0,
            totalMaxMarks: 0
          };
        }
        studentMap[r.symbolNumber].marksBySubject[r.subject] = {
           marks: parseInt(r.marks) || 0,
           totalMarks: parseInt(r.totalMarks) || 100
        };
        studentMap[r.symbolNumber].totalMarksObtained += parseInt(r.marks) || 0;
        studentMap[r.symbolNumber].totalMaxMarks += parseInt(r.totalMarks) || 100;
      });

      // Calculate ranks and summary
      const studentTotals = Object.values(studentMap).map(s => ({ sym: s.symbolNumber, name: s.name, total: s.totalMarksObtained }));
      studentTotals.sort((a, b) => b.total - a.total);
      
      const totalStudents = studentTotals.length;
      const firstPos = studentTotals[0]?.name || '-';
      const secondPos = studentTotals[1]?.name || '-';
      const thirdPos = studentTotals[2]?.name || '-';

      // Build Thead for Ledger
      let theadHtml = \`
        <tr>
          <th rowspan="3">Roll No</th>
          <th rowspan="3">Name Of Students</th>
      \`;
      
      subjects.forEach(sub => {
         theadHtml += \`<th colspan="6">\${sub}</th>\`;
      });
      theadHtml += '<th rowspan="3">Action</th></tr><tr>';

      subjects.forEach(() => {
         theadHtml += \`
            <th>1st Term</th>
            <th>2nd Term</th>
            <th>Final</th>
            <th>Th Total</th>
            <th>Practical</th>
            <th>Total</th>
         \`;
      });
      theadHtml += '</tr><tr>';

      subjects.forEach(() => {
         theadHtml += \`
            <th>FM<br>7.5</th><th>22.5</th><th>45</th><th>75</th><th>25</th><th>100</th>
         \`;
      });
      theadHtml += '</tr>';

      // Build Tbody for Ledger
      let tbodyHtml = '';
      Object.values(studentMap).forEach(student => {
        let rowHtml = \`<tr>
          <td><strong>\${student.symbolNumber}</strong></td>
          <td style="text-align:left; white-space:nowrap;">\${student.name}</td>\`;
        
        subjects.forEach(sub => {
           const sm = student.marksBySubject[sub];
           if (sm) {
              rowHtml += \`
                 <td>-</td>
                 <td>-</td>
                 <td>\${sm.marks}</td>
                 <td>\${sm.marks}</td>
                 <td>-</td>
                 <td><strong>\${sm.marks}</strong></td>
              \`;
           } else {
              rowHtml += \`<td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td>\`;
           }
        });

        rowHtml += \`
          <td>
             <button class="submit-btn" style="padding: 0.2rem 0.5rem; font-size: 0.7rem; background: #3b82f6; margin-bottom: 2px;" onclick="viewMarksheet('\${student.symbolNumber}')">View</button>
             <button class="submit-btn" style="padding: 0.2rem 0.5rem; font-size: 0.7rem; background: #10b981;" onclick="markResultSent('\${student.symbolNumber}')">Send</button>
          </td>
        </tr>\`;

        tbodyHtml += rowHtml;
      });

      // Construct final wrapper HTML
      const finalHtml = \`
        <div class="ledger-title">
          <h2>Shree Saraswati Secondary School</h2>
          <h3>\${examType} Ledger 2082</h3>
        </div>
        <div class="ledger-container">
          <div class="ledger-table-wrapper">
            <table class="ledger-table">
              <thead>\${theadHtml}</thead>
              <tbody>\${tbodyHtml}</tbody>
            </table>
          </div>
          <div class="ledger-summary">
            Total NO of Students=\${totalStudents}<br><br>
            Cleared passed students=\${totalStudents} <!-- Assuming all clear for now --><br><br>
            No of Boys=-<br><br>
            No of Girls=-<br><br>
            First Position:<br><span style="color:#0ea5e9;">\${firstPos}</span><br><br>
            Second Position:<br><span style="color:#0ea5e9;">\${secondPos}</span><br><br>
            Third Position:<br><span style="color:#0ea5e9;">\${thirdPos}</span>
          </div>
        </div>
      \`;

      wrapper.innerHTML = finalHtml;
    }
`;

// Extract existing renderResultsWithGPA block to replace it
const regex = /function renderResultsWithGPA\(\) \{[\s\S]*?(?=\n\s*\/\/ ── FILTER STUDENT RESULTS ──)/;
if (regex.test(content)) {
   content = content.replace(regex, renderResultsWithGPAFm + '\n');
} else {
   console.log("Regex failed to find renderResultsWithGPA.");
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Ledger injected successfully.");
