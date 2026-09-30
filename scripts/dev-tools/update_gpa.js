const fs = require('fs');

const filePath = 'c:\\\\Users\\\\diwas\\\\OneDrive\\\\Documents\\\\Desktop\\\\school management saraswati\\\\html\\\\admin-portal.html';
let content = fs.readFileSync(filePath, 'utf-8');

// Update calculateGPA
const oldCalculateGPA = `    // ── CALCULATE GPA FROM MARKS ──
    function calculateGPA(marks) {
      if (marks >= 90) return { gpa: 4.0, grade: 'A', percentage: marks };
      if (marks >= 80) return { gpa: 3.0, grade: 'B', percentage: marks };
      if (marks >= 70) return { gpa: 2.0, grade: 'C', percentage: marks };
      if (marks >= 60) return { gpa: 1.0, grade: 'D', percentage: marks };
      return { gpa: 0.0, grade: 'F', percentage: marks };
    }`;

const newCalculateGPA = `    // ── CALCULATE GPA FROM MARKS ──
    function calculateGPA(marks) {
      if (marks >= 90) return { gpa: 4.0, grade: 'A+', percentage: marks };
      if (marks >= 80) return { gpa: 3.6, grade: 'A', percentage: marks };
      if (marks >= 70) return { gpa: 3.2, grade: 'B+', percentage: marks };
      if (marks >= 60) return { gpa: 2.8, grade: 'B', percentage: marks };
      if (marks >= 50) return { gpa: 2.4, grade: 'C+', percentage: marks };
      if (marks >= 40) return { gpa: 2.0, grade: 'C', percentage: marks };
      if (marks >= 35) return { gpa: 1.2, grade: 'D', percentage: marks };
      return { gpa: 0.8, grade: 'NG', percentage: marks };
    }`;

if (content.includes(oldCalculateGPA)) {
    content = content.replace(oldCalculateGPA, newCalculateGPA);
} else {
    console.log("Could not find calculateGPA to replace. It may already be modified.");
}

// Update the grading table
const oldGradingTable = `          <tr><td>1.</td><td>90 to below 100</td><td>4.0</td><td>A+</td><td>OUTSTANDING</td></tr>
          <tr><td>2.</td><td>80 to below 90</td><td>3.6</td><td>A</td><td>EXCELLENT</td></tr>
          <tr><td>3.</td><td>70 to below 80</td><td>3.2</td><td>B+</td><td>VERY GOOD</td></tr>
          <tr><td>4.</td><td>60 to below 70</td><td>2.8</td><td>B</td><td>GOOD</td></tr>
          <tr><td>5.</td><td>50 to below 60</td><td>2.4</td><td>C+</td><td>SATISFACTORY</td></tr>
          <tr><td>6.</td><td>40 to below 50</td><td>2.0</td><td>C</td><td>ACCEPTABLE</td></tr>
          <tr><td>7.</td><td>35 to below 40</td><td>1.6</td><td>D</td><td>BASIC</td></tr>
          <tr><td>8.</td><td>Below 35</td><td>-</td><td>NG</td><td>NOT GRATED</td></tr>`;

const newGradingTable = `          <tr><td>1</td><td>90 to 100</td><td>A+</td><td>4.0</td><td>Outstanding</td></tr>
          <tr><td>2</td><td>80 to below 90</td><td>A</td><td>3.6</td><td>Excellent</td></tr>
          <tr><td>3</td><td>70 to below 80</td><td>B+</td><td>3.2</td><td>Very Good</td></tr>
          <tr><td>4</td><td>60 to below 70</td><td>B</td><td>2.8</td><td>Good</td></tr>
          <tr><td>5</td><td>50 to below 60</td><td>C+</td><td>2.4</td><td>Satisfactory</td></tr>
          <tr><td>6</td><td>40 to below 50</td><td>C</td><td>2.0</td><td>Acceptable</td></tr>
          <tr><td>8</td><td>35 to below 40</td><td>D</td><td>1.2</td><td>Basic</td></tr>
          <tr><td>9</td><td>0 to below 35</td><td>NG</td><td>0.8</td><td>Not Graded</td></tr>`;

if (content.includes(oldGradingTable)) {
    content = content.replace(oldGradingTable, newGradingTable);
} else {
    console.log("Could not find oldGradingTable to replace.");
}

// Also update table header if needed
const oldTableHeader = `            <th>S.N.</th>
            <th>Interval in marks</th>
            <th>Grade point</th>
            <th>Grade letter</th>
            <th>Descriptions</th>`;

const newTableHeader = `            <th>S.N.</th>
            <th>Interval in Percent</th>
            <th>Grade</th>
            <th>Grade Point</th>
            <th>Descriptor</th>`;

if (content.includes(oldTableHeader)) {
    content = content.replace(oldTableHeader, newTableHeader);
} else {
    console.log("Could not find oldTableHeader to replace.");
}


fs.writeFileSync(filePath, content, 'utf-8');
console.log("Successfully updated admin-portal.html");
