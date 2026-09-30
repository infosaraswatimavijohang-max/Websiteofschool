import os

file_path = r'c:\Users\diwas\OneDrive\Documents\Desktop\school management saraswati\html\admin-portal.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Insert CSS right before </head>
css = """
  <style id="marksheet-print-style">
    @media print {
      body * {
        visibility: hidden;
      }
      #printable-marksheet, #printable-marksheet * {
        visibility: visible;
      }
      #printable-marksheet {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        display: block !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .marksheet-table, .grading-table {
        page-break-inside: avoid;
      }
    }

    #printable-marksheet {
      display: none;
      background: white;
      color: black;
      font-family: "Times New Roman", Times, serif;
      padding: 30px;
      max-width: 850px;
      margin: auto;
      position: relative;
    }

    .marksheet-header {
      text-align: center;
      position: relative;
      margin-bottom: 20px;
    }

    .marksheet-header img.logo-left {
      position: absolute;
      left: 0;
      top: 0;
      width: 110px;
    }
    .marksheet-header img.logo-right {
      position: absolute;
      right: 0;
      top: 0;
      width: 110px;
      border-radius: 50%;
    }

    .marksheet-header h1 {
      font-size: 28px;
      color: #0ea5e9;
      margin: 0;
      font-weight: 900;
      font-family: Arial, sans-serif;
    }
    .marksheet-header h2 {
      font-size: 18px;
      color: #0ea5e9;
      margin: 5px 0;
      font-weight: bold;
      font-family: Arial, sans-serif;
    }
    .marksheet-header h3 {
      font-size: 22px;
      color: #d97706;
      margin: 10px 0 5px;
    }
    .marksheet-header h4 {
      font-size: 18px;
      margin: 0;
    }

    .marksheet-info {
      margin-top: 20px;
      font-size: 14px;
      line-height: 1.6;
      text-transform: uppercase;
      font-weight: bold;
    }

    .marksheet-table, .grading-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      font-size: 14px;
    }

    .marksheet-table th, .marksheet-table td,
    .grading-table th, .grading-table td {
      border: 1px solid black;
      padding: 6px;
      text-align: center;
    }
    .marksheet-table th, .grading-table th {
      font-weight: bold;
    }

    .marksheet-table td:nth-child(2) {
      text-align: left;
      font-weight: bold;
    }

    .marksheet-gpa {
      text-align: center;
      color: #3b82f6;
      font-weight: bold;
      font-size: 16px;
      margin: 15px 0;
    }

    .marksheet-details-header {
      display: flex;
      justify-content: space-between;
      font-weight: bold;
      margin-top: 20px;
      margin-bottom: 5px;
    }

    .marksheet-footer {
      margin-top: 60px;
      display: flex;
      justify-content: space-between;
      font-weight: bold;
      font-size: 14px;
    }
    .signature-line {
      border-top: 1px dashed black;
      padding-top: 5px;
      width: 180px;
      text-align: center;
      text-transform: uppercase;
    }
    .marksheet-watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.08;
      width: 500px;
      z-index: 0;
      pointer-events: none;
    }
    #printable-marksheet .content-wrapper {
      position: relative;
      z-index: 1;
    }
  </style>
</head>"""
content = content.replace('</head>', css)

# Insert HTML right before </body>
html = """
  <!-- Printable Marksheet Template -->
  <div id="printable-marksheet">
    <img src="../images/logo.png" class="marksheet-watermark" alt="Watermark">
    <div class="content-wrapper">
      <div class="marksheet-header">
        <img src="../images/logo.png" class="logo-left" alt="School Logo">
        <img src="../images/img1.png" class="logo-right" alt="Saraswati Logo" onerror="this.style.display='none'">
        <h1>Shree Saraswati Secondary School</h1>
        <h2>Satyawati - 6 Johang(Bidauri), Gulmi</h2>
        <h3>Grade Sheet</h3>
        <h4 id="ms-exam-title">Pree S.E.E Examination-2082</h4>
      </div>

      <div class="marksheet-info">
        THE GRADE(S) SECURED BY: <span style="text-decoration: underline;" id="ms-student-name"></span> &nbsp; DATE OF BIRTH: <span style="text-decoration: underline;" id="ms-student-dob"></span> &nbsp; GRADE: <span style="text-decoration: underline;" id="ms-student-grade"></span><br>
        'TECHNICAL' IN THE <span id="ms-exam-name"></span> CONDUCTED BY SCHOOL IN <span id="ms-exam-year"></span> BS ARE GIVEN BELOW:
      </div>

      <table class="marksheet-table">
        <thead>
          <tr>
            <th>S.NO.</th>
            <th>Subjects</th>
            <th>Credit Hour</th>
            <th>Grade Point</th>
            <th>Grade</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody id="ms-marks-tbody">
          <!-- Rows injected here -->
        </tbody>
      </table>

      <div class="marksheet-gpa">
        Grade Point Average (GPA): <span id="ms-overall-gpa"></span>
      </div>

      <div class="marksheet-details-header">
        <span>DETAILS OF GRADE SHEET</span>
        <span>RANK: <span id="ms-rank"></span></span>
      </div>

      <table class="grading-table">
        <thead>
          <tr>
            <th>S.N.</th>
            <th>Interval in marks</th>
            <th>Grade point</th>
            <th>Grade letter</th>
            <th>Descriptions</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>1.</td><td>90 to below 100</td><td>4.0</td><td>A+</td><td>OUTSTANDING</td></tr>
          <tr><td>2.</td><td>80 to below 90</td><td>3.6</td><td>A</td><td>EXCELLENT</td></tr>
          <tr><td>3.</td><td>70 to below 80</td><td>3.2</td><td>B+</td><td>VERY GOOD</td></tr>
          <tr><td>4.</td><td>60 to below 70</td><td>2.8</td><td>B</td><td>GOOD</td></tr>
          <tr><td>5.</td><td>50 to below 60</td><td>2.4</td><td>C+</td><td>SATISFACTORY</td></tr>
          <tr><td>6.</td><td>40 to below 50</td><td>2.0</td><td>C</td><td>ACCEPTABLE</td></tr>
          <tr><td>7.</td><td>35 to below 40</td><td>1.6</td><td>D</td><td>BASIC</td></tr>
          <tr><td>8.</td><td>Below 35</td><td>-</td><td>NG</td><td>NOT GRATED</td></tr>
        </tbody>
      </table>

      <div style="margin-top: 20px; font-weight: bold;">
        DATE OF ISSUE: <span id="ms-issue-date"></span>
      </div>

      <div class="marksheet-footer">
        <div class="signature-line">CLASS TEACHER</div>
        <div class="signature-line">EXAM CO-ORDINATOR</div>
        <div class="signature-line">HEAD TEACHER</div>
      </div>
    </div>
  </div>
</body>"""
content = content.replace('</body>', html)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("HTML and CSS for marksheet injected successfully.")
