import re

file_path = r'c:\Users\diwas\OneDrive\Documents\Desktop\school management saraswati\index.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update HTML structure of #result-display
new_html = """
      <!-- Results Display Area -->
      <div id="result-display" style="margin-top: 2rem; display: none;">
        <div id="result-message" style="padding: 1.5rem; background: #ecfdf5; border: 1.5px solid #6ee7b7; border-radius: 12px; margin-bottom: 2rem;"></div>
        
        <div id="result-table-wrapper" style="display: none;">
          <div style="text-align: right; margin-bottom: 1rem;">
             <button onclick="window.print()" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">Print Marksheet</button>
          </div>
          
          <div id="printable-marksheet-container" style="background: white; padding: 40px; box-shadow: 0 0 10px rgba(0,0,0,0.1); border: 2px solid #ccc; max-width: 900px; margin: 0 auto; color: black; font-family: 'Times New Roman', Times, serif;">
            <!-- CSS for printable marksheet -->
            <style>
              @media print {
                 body * { visibility: hidden; }
                 #printable-marksheet-container, #printable-marksheet-container * { visibility: visible; }
                 #printable-marksheet-container {
                    position: absolute; left: 0; top: 0; width: 100%; border: none; box-shadow: none; padding: 0;
                 }
                 .no-print { display: none !important; }
              }
              .ms-header { text-align: center; position: relative; margin-bottom: 20px; }
              .ms-logo-left { position: absolute; left: 0; top: 0; width: 100px; }
              .ms-logo-right { position: absolute; right: 0; top: 0; width: 120px; }
              .ms-header h1 { color: #0ea5e9; font-size: 28px; margin: 0 0 5px 0; font-weight: bold; }
              .ms-header h2 { color: #0ea5e9; font-size: 18px; margin: 0 0 5px 0; }
              .ms-header h3 { color: #b45309; font-size: 24px; margin: 5px 0; font-weight: normal; }
              .ms-header h4 { color: #b45309; font-size: 20px; margin: 5px 0; font-weight: normal; border-bottom: 2px solid #000; display: inline-block; padding-bottom: 2px;}
              .ms-info { font-size: 14px; line-height: 1.6; margin-bottom: 15px; text-transform: uppercase; }
              .ms-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 14px; }
              .ms-table th, .ms-table td { border: 1px solid #000; padding: 6px; text-align: center; }
              .ms-table th { font-weight: bold; }
              .ms-table td:nth-child(2) { text-align: left; font-weight: bold; }
              .ms-gpa-row td { text-align: center; font-weight: bold; color: #3b82f6; }
              .ms-footer-tables { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 40px; }
              .ms-rubric { width: 75%; border-collapse: collapse; }
              .ms-rubric th, .ms-rubric td { border: 1px solid #000; padding: 4px; text-align: left; }
              .ms-rank { width: 20%; text-align: right; font-weight: bold; font-size: 14px; }
              .ms-signatures { display: flex; justify-content: space-between; margin-top: 50px; font-weight: bold; font-size: 14px; }
              .ms-sig-block { text-align: center; }
              .ms-sig-line { border-top: 1px dotted #000; padding-top: 5px; min-width: 150px; }
            </style>

            <div class="ms-header">
              <img src="images/logo.png" class="ms-logo-left" alt="Logo Left" onerror="this.style.display='none'">
              <img src="images/img1.png" class="ms-logo-right" alt="Logo Right" onerror="this.style.display='none'">
              <h1>Shree Saraswati Secondary School</h1>
              <h2>Satyawati - 6 Johang(Bidauri), Gulmi</h2>
              <h3>Grade Sheet</h3>
              <h4 id="ms-exam-title">Pree S.E.E Examination-2082</h4>
            </div>

            <div class="ms-info">
              THE GRADE(S) SECURED BY: <span style="font-weight:bold; text-decoration: underline;" id="ms-student-name"></span> 
              DATE OF BIRTH: <span style="font-weight:bold; text-decoration: underline;" id="ms-student-dob"></span> 
              GRADE: <span style="font-weight:bold; text-decoration: underline;" id="ms-student-grade"></span><br>
              'TECHNICAL' IN THE <span style="font-weight:bold; text-decoration: underline;" id="ms-exam-name"></span> 
              CONDUCTED BY SCHOOL IN <span style="font-weight:bold; text-decoration: underline;" id="ms-exam-year"></span> BS ARE GIVEN BELOW:
            </div>

            <table class="ms-table">
              <thead>
                <tr>
                  <th>S.NO.</th>
                  <th>Subjects</th>
                  <th>Credit<br>Hour</th>
                  <th>Grade<br>Point</th>
                  <th>Grade</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody id="ms-marks-tbody">
                <!-- Rows injected dynamically -->
              </tbody>
              <tbody>
                <tr class="ms-gpa-row">
                  <td colspan="6">Grade Point Average (GPA): <span id="ms-overall-gpa"></span></td>
                </tr>
              </tbody>
            </table>

            <div class="ms-footer-tables">
              <div style="width: 75%;">
                <div style="font-weight: bold; font-size: 14px; margin-bottom: 5px;">DETAILS OF GRADE SHEET</div>
                <table class="ms-rubric">
                  <thead>
                    <tr><th>S.N.</th><th>Interval in marks</th><th>Grade point</th><th>Grade letter</th><th>Descriptions</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>1.</td><td>90 to below 100</td><td>4.0</td><td>A+</td><td>OUTSTANDING</td></tr>
                    <tr><td>2</td><td>80 to below 90</td><td>3.6</td><td>A</td><td>EXCELLENT</td></tr>
                    <tr><td>3</td><td>70 to below 80</td><td>3.2</td><td>B+</td><td>VERY GOOD</td></tr>
                    <tr><td>4</td><td>60 to below 70</td><td>2.8</td><td>B</td><td>GOOD</td></tr>
                    <tr><td>5</td><td>50 to below 60</td><td>2.4</td><td>C+</td><td>SATISFACTORY</td></tr>
                    <tr><td>6</td><td>40 to below 50</td><td>2.0</td><td>C</td><td>ACCEPTABLE</td></tr>
                    <tr><td>7</td><td>35 to below 40</td><td>1.6</td><td>D</td><td>BASIC</td></tr>
                    <tr><td>8</td><td>Below 35</td><td>-</td><td>NG</td><td>NOT GRADED</td></tr>
                  </tbody>
                </table>
              </div>
              <div class="ms-rank">
                 RANK: <span id="ms-rank-val"></span>
              </div>
            </div>

            <div style="font-weight: bold; font-size: 14px; margin-bottom: 30px;">DATE OF ISSUE: <span id="ms-issue-date"></span></div>

            <div class="ms-signatures">
              <div class="ms-sig-block"><div class="ms-sig-line">CLASS TEACHER</div></div>
              <div class="ms-sig-block"><div class="ms-sig-line">EXAM CO-ORDINATOR</div></div>
              <div class="ms-sig-block"><div class="ms-sig-line">HEAD TEACHER</div></div>
            </div>

          </div>
        </div>
      </div>
"""

html_pattern = re.compile(r'<!-- Results Display Area -->.*?</div>\s*</div>\s*</div>', re.DOTALL)
content = html_pattern.sub(new_html, content)

# 2. Replace checkStudentResult function in index.html
js_func = """
  // GPA calculation helper
  function calculateGPA(percentage) {
    if (percentage >= 90) return { gpa: 4.0, grade: 'A+' };
    if (percentage >= 80) return { gpa: 3.6, grade: 'A' };
    if (percentage >= 70) return { gpa: 3.2, grade: 'B+' };
    if (percentage >= 60) return { gpa: 2.8, grade: 'B' };
    if (percentage >= 50) return { gpa: 2.4, grade: 'C+' };
    if (percentage >= 40) return { gpa: 2.0, grade: 'C' };
    if (percentage >= 35) return { gpa: 1.6, grade: 'D' };
    return { gpa: 0, grade: 'NG' };
  }

  function checkStudentResult() {
    const symbolNumber = document.getElementById('result-symbol')?.value.trim();
    const studentClass = document.getElementById('result-class')?.value;
    const resultDisplay = document.getElementById('result-display');
    const resultMessage = document.getElementById('result-message');
    const resultTableWrapper = document.getElementById('result-table-wrapper');
    
    // Validation
    if (!symbolNumber || !studentClass) {
      alert('Please enter both Symbol Number and Class');
      return;
    }
    
    // Get PUBLISHED results from localStorage
    const publishedResults = JSON.parse(localStorage.getItem('published_results') || '[]');
    const studentResults = publishedResults.filter(r => String(r.symbolNumber).trim() === symbolNumber && String(r.class).trim() === studentClass);
    
    resultDisplay.style.display = 'block';
    
    if (studentResults.length === 0) {
      resultMessage.innerHTML = '⚠️ <strong>Results Not Found</strong><br/>No results published yet for Symbol Number: ' + symbolNumber;
      resultMessage.style.background = '#fee2e2';
      resultMessage.style.borderColor = '#fca5a5';
      resultTableWrapper.style.display = 'none';
      return;
    }
    
    // Determine exam info
    const studentName = studentResults[0].name || 'Student';
    const examType = studentResults[0].examType || 'Term Exam';
    const className = studentResults[0].class || '';
    const currentYear = new Date().getFullYear();
    
    resultMessage.innerHTML = '✅ <strong>Results Found!</strong><br/>Displaying exam results for ' + studentName;
    resultMessage.style.background = '#ecfdf5';
    resultMessage.style.borderColor = '#6ee7b7';
    resultTableWrapper.style.display = 'block';
    
    // Populate dynamic text
    document.getElementById('ms-exam-title').innerText = examType + "-" + currentYear;
    document.getElementById('ms-student-name').innerText = studentName;
    document.getElementById('ms-student-dob').innerText = studentResults[0].dob || 'N/A';
    document.getElementById('ms-student-grade').innerText = className;
    document.getElementById('ms-exam-name').innerText = examType.toUpperCase();
    document.getElementById('ms-exam-year').innerText = currentYear;
    document.getElementById('ms-issue-date').innerText = new Date().toLocaleDateString();
    
    // Populate marks table
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
       
       tbody.innerHTML += `
          <tr>
             <td>${index + 1}</td>
             <td>${result.subject}</td>
             <td>${result.creditHour || '4'}</td>
             <td>${gpaData.gpa.toFixed(1)}</td>
             <td>${gpaData.grade}</td>
             <td>${remarks}</td>
          </tr>
       `;
    });
    
    // Overall GPA
    const overallPercentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0;
    const overallGpaData = calculateGPA(overallPercentage);
    document.getElementById('ms-overall-gpa').innerText = overallGpaData.gpa.toFixed(1);
    
    // Calculate Rank based on all published results for this class and exam
    const classResults = publishedResults.filter(r => r.class === className && r.examType === examType);
    const studentTotals = {};
    classResults.forEach(r => {
       if(!studentTotals[r.symbolNumber]) studentTotals[r.symbolNumber] = 0;
       studentTotals[r.symbolNumber] += parseInt(r.marks) || 0;
    });
    const sortedStudents = Object.keys(studentTotals).sort((a, b) => studentTotals[b] - studentTotals[a]);
    const rank = sortedStudents.indexOf(symbolNumber) + 1;
    document.getElementById('ms-rank-val').innerText = rank;
  }
"""

js_pattern = re.compile(r'function checkStudentResult\(\) \{.*?(?=\n  \}\n)', re.DOTALL)
content = js_pattern.sub(js_func.strip()[:-1], content) # Remove trailing bracket from pattern to replace correctly

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated index.html with printable marksheet format.")
