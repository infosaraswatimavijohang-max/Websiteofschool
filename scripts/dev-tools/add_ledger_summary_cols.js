const fs = require('fs');

const filePath = 'c:\\\\Users\\\\diwas\\\\OneDrive\\\\Documents\\\\Desktop\\\\school management saraswati\\\\html\\\\admin-portal.html';
let content = fs.readFileSync(filePath, 'utf-8');

// The new logic for renderResultsWithGPA to add new columns
const oldRegex = /let theadHtml = \`[\s\S]*?wrapper\.innerHTML = finalHtml;\n    \}/;

const newLogic = `let theadHtml = \`
        <tr>
          <th rowspan="3">Roll No</th>
          <th rowspan="3">Name Of Students</th>
      \`;
      
      const isFinalTerm = (examType === 'Final Term');
      const colspan = isFinalTerm ? 6 : 4;

      subjects.forEach(sub => {
         theadHtml += \`<th colspan="\${colspan}">\${sub}</th>\`;
      });
      theadHtml += '<th rowspan="3">Total<br>Marks</th><th rowspan="3">Pass<br>Marks</th><th rowspan="3">Obtained<br>Marks</th><th rowspan="3">Overall GPA</th><th rowspan="3">Grade</th><th rowspan="3">Remarks</th><th rowspan="3">Action</th></tr><tr>';

      subjects.forEach(() => {
         if (isFinalTerm) {
             theadHtml += \`
                <th>1st Term</th>
                <th>2nd Term</th>
             \`;
         }
         theadHtml += \`
            <th>Final</th>
            <th>Th Total</th>
            <th>Practical</th>
            <th>Total</th>
         \`;
      });
      theadHtml += '</tr><tr>';

      subjects.forEach(() => {
         if (isFinalTerm) {
             theadHtml += \`<th>FM<br>7.5</th><th>22.5</th>\`;
         }
         theadHtml += \`<th>45</th><th>75</th><th>25</th><th>100</th>\`;
      });
      theadHtml += '</tr>';

      // Build Tbody for Ledger
      let tbodyHtml = '';
      Object.values(studentMap).forEach(student => {
        let rowHtml = \`<tr>
          <td><strong>\${student.symbolNumber}</strong></td>
          <td style="text-align:left; white-space:nowrap;">\${student.name}</td>\`;
        
        let failedSubjects = 0;

        subjects.forEach(sub => {
           const sm = student.marksBySubject[sub];
           if (sm) {
              const subPercentage = sm.totalMarks > 0 ? (sm.marks / sm.totalMarks) * 100 : 0;
              if (subPercentage < 35) failedSubjects++; // NG is below 35%

              if (isFinalTerm) {
                  rowHtml += \`<td>-</td><td>-</td>\`;
              }
              rowHtml += \`
                 <td>\${sm.marks}</td>
                 <td>\${sm.marks}</td>
                 <td>-</td>
                 <td><strong>\${sm.marks}</strong></td>
              \`;
           } else {
              if (isFinalTerm) {
                  rowHtml += \`<td>-</td><td>-</td>\`;
              }
              rowHtml += \`<td>-</td><td>-</td><td>-</td><td>-</td>\`;
           }
        });

        const overallPercentage = student.totalMaxMarks > 0 ? (student.totalMarksObtained / student.totalMaxMarks) * 100 : 0;
        const gpaData = calculateGPA(overallPercentage);

        const totalPassMarks = student.totalMaxMarks * 0.35; // 35% pass mark
        
        let remarksHtml = '-';
        if (failedSubjects > 0) {
            remarksHtml = \`<span style="color: red; font-weight: bold;">*\${failedSubjects}</span>\`;
        } else {
            remarksHtml = '<span style="color: green; font-weight: bold;">Pass</span>';
        }

        rowHtml += \`
          <td><strong>\${student.totalMaxMarks}</strong></td>
          <td><strong>\${totalPassMarks}</strong></td>
          <td><strong>\${student.totalMarksObtained}</strong></td>
          <td><strong>\${gpaData.gpa.toFixed(2)}</strong></td>
          <td><strong>\${gpaData.grade}</strong></td>
          <td>\${remarksHtml}</td>
          <td>
             <button class="submit-btn" style="padding: 0.2rem 0.5rem; font-size: 0.7rem; background: #3b82f6; margin-bottom: 2px;" onclick="viewMarksheet('\${student.symbolNumber}')">View</button>
             <button class="submit-btn" style="padding: 0.2rem 0.5rem; font-size: 0.7rem; background: #10b981;" onclick="markResultSent('\${student.symbolNumber}')">Send</button>
          </td>
        </tr>\`;

        tbodyHtml += rowHtml;
      });

      const currentYear = new Date().getFullYear();

      // Construct final wrapper HTML
      const finalHtml = \`
        <div class="ledger-title">
          <h2>Shree Saraswati Secondary School</h2>
          <h3>\${examType} Ledger \${currentYear}</h3>
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
    }`;

if (oldRegex.test(content)) {
    content = content.replace(oldRegex, newLogic);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("Successfully added new columns to ledger.");
} else {
    console.log("Failed to match the regex.");
}
