/**
 * Practical Marks Evaluation Handler
 * Handles the logic for the Practical Marks Entry module in the admin panel.
 */

// Global variable to keep track of loaded students
let currentPracticalStudents = [];

// Initialize data when the practical marks page is loaded
function initPracticalMarksPage() {
  const classDropdown = document.getElementById('pract-class');
  
  // Try to load classes using existing handler if available
  if (window.classHandler && typeof window.classHandler.populateClassDropdown === 'function') {
    window.classHandler.populateClassDropdown('pract-class').catch(e => {
      console.error("Failed to load classes for practical marks:", e);
      fallbackLoadClasses(classDropdown);
    });
  } else {
    fallbackLoadClasses(classDropdown);
  }
}

// Fallback logic to load classes from local storage
function fallbackLoadClasses(dropdown) {
  const classes = JSON.parse(localStorage.getItem('academic_classes') || '[]');
  dropdown.innerHTML = '<option value="">-- Select Class --</option>';
  
  if (classes.length === 0) {
    // If no dynamic classes, add standard ones
    const standardClasses = ['Grade 10', 'Grade 9', 'Grade 8'];
    standardClasses.forEach(c => {
      dropdown.innerHTML += `<option value="${c}">${c}</option>`;
    });
  } else {
    classes.forEach(c => {
      dropdown.innerHTML += `<option value="${c.gradeLevel}">${c.gradeLevel}</option>`;
    });
  }
}

// Load subjects when a class is selected
function loadPracticalSubjects() {
  const classVal = document.getElementById('pract-class').value;
  const subjectDropdown = document.getElementById('pract-subject');
  
  subjectDropdown.innerHTML = '<option value="">-- Select Subject --</option>';
  if (!classVal) return;
  
  if (window.subjectHandler && typeof window.subjectHandler.getSubjectsForClass === 'function') {
    const subjects = window.subjectHandler.getSubjectsForClass(classVal);
    subjects.forEach(s => {
      subjectDropdown.innerHTML += `<option value="${s.subjectName}">${s.subjectName}</option>`;
    });
  } else {
    // Fallback: fetch from local storage
    const allSubjects = JSON.parse(localStorage.getItem('academic_subjects') || '[]');
    const classSubjects = allSubjects.filter(s => s.gradeLevel === classVal);
    
    if (classSubjects.length > 0) {
      classSubjects.forEach(s => {
        subjectDropdown.innerHTML += `<option value="${s.subjectName}">${s.subjectName}</option>`;
      });
    } else {
      // Mock subjects
      const mockSubjects = ['Science', 'Computer Science', 'Health & Environment'];
      mockSubjects.forEach(s => {
        subjectDropdown.innerHTML += `<option value="${s}">${s}</option>`;
      });
    }
  }
}

// Load students for the selected class
function loadStudentsForPractical() {
  const examType = document.getElementById('pract-exam-type').value;
  const classVal = document.getElementById('pract-class').value;
  const subjectVal = document.getElementById('pract-subject').value;
  
  if (!examType || !classVal || !subjectVal) {
    alert("Please select Exam Type, Class, and Subject.");
    return;
  }
  
  const students = JSON.parse(localStorage.getItem('students_registry') || '[]');
  const classStudents = students.filter(s => s.class && s.class.includes(classVal));
  
  if (classStudents.length === 0) {
    alert(`No students found for class ${classVal}`);
    return;
  }
  
  currentPracticalStudents = classStudents;
  
  const tbody = document.getElementById('pract-students-tbody');
  tbody.innerHTML = '';
  
  // Try to load existing marks from exam results if any
  const results = JSON.parse(localStorage.getItem('exam_results') || '[]');
  const currentExamResult = results.find(r => 
    r.examType === examType && 
    r.class === classVal && 
    r.subject === subjectVal
  );
  
  let existingMarksMap = {};
  if (currentExamResult && currentExamResult.students) {
    currentExamResult.students.forEach(s => {
      existingMarksMap[s.studentId || s.roll] = s.practicalMarks || 0;
    });
  }
  
  // Load specific breakdown if available
  const practicalComponents = JSON.parse(localStorage.getItem('practical_components_breakdown') || '{}');
  const key = `${examType}_${classVal}_${subjectVal}`;
  const savedBreakdown = practicalComponents[key] || [];

  classStudents.forEach((student, index) => {
    // If practical marks exist, try to split them backwards, or just default to 0 for inputs
    // For simplicity, we default inputs to 0 if we don't have separate tracking for the components
    const roll = student.roll || `R-${index+1}`;
    const studentId = student.id || student.roll;
    const existingTotal = existingMarksMap[studentId] || 0;
    
    // Check if we have exact breakdown
    let att = 0, ass = 0, rem = 0;
    const studentBreakdown = savedBreakdown.find(b => b.studentId == studentId);
    
    if (studentBreakdown) {
      att = studentBreakdown.attendance;
      ass = studentBreakdown.assignment;
      rem = studentBreakdown.remarks;
    } else if (existingTotal > 0) {
      // rough distribution for display purposes if loaded from an existing total without breakdown
      att = Math.min(5, Math.floor(existingTotal * 0.2));
      ass = Math.min(10, Math.floor(existingTotal * 0.4));
      rem = Math.min(10, existingTotal - att - ass);
    }
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td style="text-align: center;">${roll}</td>
      <td><strong>${student.name}</strong></td>
      <td style="text-align: center;">
        <input type="number" id="pract-rem-${studentId}" class="form-control" style="width:70px; display:inline-block;" min="0" max="10" value="${rem}" oninput="calcPracticalTotal('${studentId}')">
      </td>
      <td style="text-align: center;">
        <input type="number" id="pract-att-${studentId}" class="form-control" style="width:70px; display:inline-block;" min="0" max="5" value="${att}" oninput="calcPracticalTotal('${studentId}')">
      </td>
      <td style="text-align: center;">
        <input type="number" id="pract-ass-${studentId}" class="form-control" style="width:70px; display:inline-block;" min="0" max="10" value="${ass}" oninput="calcPracticalTotal('${studentId}')">
      </td>
      <td style="text-align: center;">
        <strong id="pract-total-${studentId}" style="font-size: 1.1rem; color: var(--primary);">${existingTotal}</strong>
      </td>
    `;
    tbody.appendChild(row);
  });
  
  document.getElementById('pract-students-panel').style.display = 'block';
}

// Calculate total practical marks for a student row
function calcPracticalTotal(studentId) {
  const rem = parseFloat(document.getElementById(`pract-rem-${studentId}`).value) || 0;
  const att = parseFloat(document.getElementById(`pract-att-${studentId}`).value) || 0;
  const ass = parseFloat(document.getElementById(`pract-ass-${studentId}`).value) || 0;
  
  // Enforce limits
  const safeRem = Math.min(10, Math.max(0, rem));
  const safeAtt = Math.min(5, Math.max(0, att));
  const safeAss = Math.min(10, Math.max(0, ass));
  
  if (rem !== safeRem) document.getElementById(`pract-rem-${studentId}`).value = safeRem;
  if (att !== safeAtt) document.getElementById(`pract-att-${studentId}`).value = safeAtt;
  if (ass !== safeAss) document.getElementById(`pract-ass-${studentId}`).value = safeAss;
  
  const total = safeRem + safeAtt + safeAss;
  document.getElementById(`pract-total-${studentId}`).textContent = total;
}

// Save all practical marks
function saveAllPracticalMarks() {
  const examType = document.getElementById('pract-exam-type').value;
  const classVal = document.getElementById('pract-class').value;
  const subjectVal = document.getElementById('pract-subject').value;
  
  if (!examType || !classVal || !subjectVal) {
    alert("Missing configuration.");
    return;
  }
  
  // Get existing exam results
  let results = JSON.parse(localStorage.getItem('exam_results') || '[]');
  
  // Find if this exam result already exists
  let existingResultIndex = results.findIndex(r => 
    r.examType === examType && 
    r.class === classVal && 
    r.subject === subjectVal
  );
  
  let resultData;
  if (existingResultIndex >= 0) {
    resultData = results[existingResultIndex];
  } else {
    // Create new result record
    resultData = {
      id: Date.now(),
      examType: examType,
      class: classVal,
      subject: subjectVal,
      theoryFullMarks: 75,
      practicalFullMarks: 25,
      status: 'Draft',
      publishDate: new Date().toISOString().split('T')[0],
      students: []
    };
  }
  
  // Update student marks
  currentPracticalStudents.forEach(student => {
    const studentId = student.id || student.roll;
    const rem = parseFloat(document.getElementById(`pract-rem-${studentId}`).value) || 0;
    const att = parseFloat(document.getElementById(`pract-att-${studentId}`).value) || 0;
    const ass = parseFloat(document.getElementById(`pract-ass-${studentId}`).value) || 0;
    const totalPractical = rem + att + ass;
    
    // Find student in resultData
    let studentResult = resultData.students.find(s => (s.studentId || s.roll) == studentId);
    if (!studentResult) {
      studentResult = {
        studentId: studentId,
        roll: student.roll,
        name: student.name,
        marks: 0, // theory marks
        theoryMarks: 0,
        practicalMarks: totalPractical,
        totalMarks: totalPractical
      };
      resultData.students.push(studentResult);
    } else {
      studentResult.practicalMarks = totalPractical;
      studentResult.totalMarks = (studentResult.theoryMarks || studentResult.marks || 0) + totalPractical;
    }
  });
  
  // Save back to local storage
  if (existingResultIndex >= 0) {
    results[existingResultIndex] = resultData;
  } else {
    results.push(resultData);
  }
  
  localStorage.setItem('exam_results', JSON.stringify(results));
  
  // Also save the specific components breakdown for later use if needed
  let practicalComponents = JSON.parse(localStorage.getItem('practical_components_breakdown') || '{}');
  const key = `${examType}_${classVal}_${subjectVal}`;
  practicalComponents[key] = currentPracticalStudents.map(student => {
    const studentId = student.id || student.roll;
    return {
      studentId: studentId,
      remarks: parseFloat(document.getElementById(`pract-rem-${studentId}`).value) || 0,
      attendance: parseFloat(document.getElementById(`pract-att-${studentId}`).value) || 0,
      assignment: parseFloat(document.getElementById(`pract-ass-${studentId}`).value) || 0,
      total: parseFloat(document.getElementById(`pract-total-${studentId}`).textContent) || 0
    };
  });
  localStorage.setItem('practical_components_breakdown', JSON.stringify(practicalComponents));
  
  alert(`Practical marks saved successfully for ${currentPracticalStudents.length} students!`);
  
  // Optional: Refresh results table if it exists
  if (typeof refreshExamResults === 'function') {
    try {
      refreshExamResults();
    } catch (e) {
      console.warn("Could not refresh exam results view", e);
    }
  }
}

// Hook into the page load system
document.addEventListener('DOMContentLoaded', () => {
  // Add initialization to switchPage flow if possible
  const originalSwitchPage = window.switchPage;
  if (typeof originalSwitchPage === 'function') {
    window.switchPage = function(pageId, element) {
      originalSwitchPage(pageId, element);
      if (pageId === 'practical-marks-evaluation') {
        initPracticalMarksPage();
      }
    };
  }
});
