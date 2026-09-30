// ============================================================================
// FILE:    exam-result-handler.js
// MODULE:  Exam Results
// PURPOSE: Exam Result Handler - Student-facing exam results viewer: fetch, render marks, grades, and GPA calculations
//
// PROJECT: Shree Saraswati Secondary School — Management System
// STACK:   Vanilla JS + Supabase (PostgreSQL) + HTML/CSS
// UPDATED: 2026-06-03
// ============================================================================
// ====================================================================
// EXAM RESULTS HANDLER - Teacher Portal
// ====================================================================

/**
 * Fetch all active exam sessions
 */
async function fetchExamSessions() {
  try {
    if (!supabaseDb) return [];
    const { data, error } = await supabaseDb
      .from('exam_sessions')
      .select('*')
      .eq('status', 'Active')
      .order('terminal_number', { ascending: false });
    
    if (error) {
      console.error('Error fetching exam sessions:', error);
      return [];
    }
    return data || [];
  } catch (e) {
    console.error('Exception fetching exam sessions:', e);
    return [];
  }
}

/**
 * Fetch exam configurations for a specific session
 */
async function fetchExamConfigurations(sessionId) {
  try {
    if (!supabaseDb) return [];
    const { data, error } = await supabaseDb
      .from('exam_configurations')
      .select('*')
      .eq('exam_session_id', sessionId);
    
    if (error) {
      console.error('Error fetching exam configurations:', error);
      return [];
    }
    return data || [];
  } catch (e) {
    console.error('Exception fetching exam configurations:', e);
    return [];
  }
}

/**
 * Create a new exam configuration
 */
async function createExamConfiguration(config) {
  try {
    if (!supabaseDb) {
      alert('Database connection failed');
      return false;
    }

    const { data, error } = await supabaseDb
      .from('exam_configurations')
      .insert([config])
      .select();
    
    if (error) {
      console.error('Error creating exam configuration:', error);
      alert('Failed to save exam configuration: ' + error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exception creating exam configuration:', e);
    alert('Exception: ' + e.message);
    return false;
  }
}

/**
 * Fetch students for a specific class
 */
async function fetchStudentsByClass(className) {
  try {
    if (!supabaseDb) return [];
    const { data, error } = await supabaseDb
      .from('students_registry')
      .select('roll, name, class, status')
      .eq('class', className)
      .eq('status', 'Active')
      .order('roll', { ascending: true });
    
    if (error) {
      console.error('Error fetching students:', error);
      return [];
    }
    return data || [];
  } catch (e) {
    console.error('Exception fetching students:', e);
    return [];
  }
}

/**
 * Submit exam results for multiple students
 */
async function submitExamResults(configId, results) {
  try {
    if (!supabaseDb) {
      alert('Database connection failed');
      return false;
    }

    // Prepare results data
    const resultsToInsert = results.map(result => ({
      exam_config_id: configId,
      student_roll: result.student_roll,
      student_symbol: result.student_symbol || '',
      student_name: result.student_name,
      theory_marks: result.theory_marks !== null ? parseInt(result.theory_marks) : null,
      practical_marks: result.practical_marks !== null ? parseInt(result.practical_marks) : null,
      total_marks: result.total_marks,
      result_status: result.result_status,
      percentage: result.percentage,
      grade: result.grade,
      academic_year: result.academic_year,
      submitted_by: localStorage.getItem('teacher_code') || 'Unknown',
      submission_date: new Date().toISOString(),
      approval_status: 'Pending'
    }));

    // Delete existing results for this config if any
    const { error: deleteError } = await supabaseDb
      .from('exam_results')
      .delete()
      .eq('exam_config_id', configId);

    if (deleteError) {
      console.error('Error deleting existing results:', deleteError);
      // Continue anyway
    }

    // Insert new results
    const { data, error } = await supabaseDb
      .from('exam_results')
      .insert(resultsToInsert)
      .select();
    
    if (error) {
      console.error('Error submitting exam results:', error);
      alert('Failed to submit exam results: ' + error.message);
      return false;
    }

    alert('Exam results submitted successfully! Pending admin approval.');
    return true;
  } catch (e) {
    console.error('Exception submitting exam results:', e);
    alert('Exception: ' + e.message);
    return false;
  }
}

/**
 * Fetch exam results with approval status
 */
async function fetchExamResults(configId) {
  try {
    if (!supabaseDb) return [];
    const { data, error } = await supabaseDb
      .from('exam_results')
      .select('*')
      .eq('exam_config_id', configId)
      .order('student_roll', { ascending: true });
    
    if (error) {
      console.error('Error fetching exam results:', error);
      return [];
    }
    return data || [];
  } catch (e) {
    console.error('Exception fetching exam results:', e);
    return [];
  }
}

/**
 * Calculate grade based on percentage
 */
function calculateGrade(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
}

/**
 * Determine pass/fail status
 */
function determineResultStatus(totalMarks, passMarks) {
  return totalMarks >= passMarks ? 'Pass' : 'Fail';
}

/**
 * Render exam result submission form
 */
async function renderExamResultForm() {
  const container = document.getElementById('page-exam-results');
  if (!container) return;

  // Fetch sessions
  const sessions = await fetchExamSessions();
  
  let html = `
    <h2 style="font-family:'Playfair Display', serif; margin-bottom: 2rem; color: var(--primary);">📝 Terminal Exam Results Submission</h2>
    
    <div class="panel" style="max-width: 1000px;">
      <div class="panel-header">
        <h3>Step 1: Select Exam Details</h3>
      </div>
      
      <form id="exam-config-form" onsubmit="handleExamConfigSubmit(event)">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
          <!-- Terminal Exam Session -->
          <div class="form-group">
            <label>Terminal Exam Session <span style="color: red;">*</span></label>
            <select id="exam-session" class="form-control" onchange="handleSessionChange()" required>
              <option value="">-- Select Terminal Exam --</option>
              ${sessions.map(s => `<option value="${s.id}" data-terminal="${s.terminal_number}">${s.session_name} (${s.academic_year})</option>`).join('')}
            </select>
            <small style="color: var(--text-muted);">Select which terminal exam (Term 1, Term 2, etc.)</small>
          </div>

          <!-- Academic Year -->
          <div class="form-group">
            <label>Academic Year <span style="color: red;">*</span></label>
            <select id="exam-academic-year" class="form-control" required>
              <option value="">-- Select Year --</option>
              <option value="2080">2080</option>
              <option value="2081">2081</option>
              <option value="2082" selected>2082</option>
              <option value="2083">2083</option>
              <option value="2084">2084</option>
              <option value="2085">2085</option>
            </select>
          </div>

          <!-- Class Selection -->

          <div class="form-group">
            <label>Class/Section <span style="color: red;">*</span></label>
            <select id="exam-class" class="form-control" required>
              <option value="">-- Select Class --</option>
              <option value="Grade 6 - Section A">Grade 6 - Section A</option>
              <option value="Grade 6 - Section B">Grade 6 - Section B</option>
              <option value="Grade 7 - Section A">Grade 7 - Section A</option>
              <option value="Grade 7 - Section B">Grade 7 - Section B</option>
              <option value="Grade 8 - Section A">Grade 8 - Section A</option>
              <option value="Grade 8 - Section B">Grade 8 - Section B</option>
              <option value="Grade 9 Science - Section A">Grade 9 Science - Section A</option>
              <option value="Grade 9 Science - Section B">Grade 9 Science - Section B</option>
              <option value="Grade 9 Maths - Section A">Grade 9 Maths - Section A</option>
              <option value="Grade 10 Science - Section A">Grade 10 Science - Section A</option>
              <option value="Grade 10 Science - Section B">Grade 10 Science - Section B</option>
              <option value="Grade 10 Computer - Section A">Grade 10 Computer - Section A</option>
              <option value="Grade 11 Science">Grade 11 Science</option>
              <option value="Grade 11 Commerce">Grade 11 Commerce</option>
              <option value="Grade 12 Science">Grade 12 Science</option>
              <option value="Grade 12 Commerce">Grade 12 Commerce</option>
            </select>
          </div>

          <!-- Subject Selection -->
          <div class="form-group">
            <label>Subject <span style="color: red;">*</span></label>
            <select id="exam-subject" class="form-control" required>
              <option value="">-- Select Subject --</option>
              <option value="English">English</option>
              <option value="Nepali">Nepali</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="Social Studies">Social Studies</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="Economics">Economics</option>
              <option value="Accounting">Accounting</option>
            </select>
          </div>

          <!-- Exam Type (Theory/Practical) -->
          <div class="form-group">
            <label>Exam Type <span style="color: red;">*</span></label>
            <select id="exam-type" class="form-control" onchange="handleExamTypeChange()" required>
              <option value="">-- Select --</option>
              <option value="Theory Only">Theory Only</option>
              <option value="Practical Only">Practical Only</option>
              <option value="Theory + Practical">Theory + Practical</option>
            </select>
          </div>

          <!-- Full Marks -->
          <div class="form-group">
            <label>Full Marks <span style="color: red;">*</span></label>
            <input type="number" id="exam-full-marks" class="form-control" placeholder="100" min="1" oninput="document.getElementById('exam-pass-marks').value = Math.ceil(this.value * 0.35)" required>
          </div>

          <!-- Pass Marks -->
          <div class="form-group">
            <label>Pass Marks <span style="color: red;">*</span></label>
            <input type="number" id="exam-pass-marks" class="form-control" placeholder="35" min="1" required>
          </div>
        </div>

        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
          <button type="submit" class="submit-btn" style="flex: 1; background: var(--accent);">➜ Next: Load Students</button>
          <button type="reset" class="submit-btn" style="flex: 1; background: #94a3b8;">Clear</button>
        </div>
      </form>
    </div>

    <!-- Step 2: Marks Entry Section -->
    <div id="marks-entry-section" style="display: none; margin-top: 2rem;">
      <div class="panel" style="max-width: 1200px;">
        <div class="panel-header">
          <h3>Step 2: Enter Marks for Students</h3>
          <span id="config-summary" style="font-size: 0.9rem; color: var(--text-muted);"></span>
        </div>

        <div class="custom-table-wrapper">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Roll #</th>
                <th>Symbol #</th>
                <th>Student Name</th>
                <th id="theory-header" style="display: none;">Theory Marks</th>
                <th id="practical-header" style="display: none;">Practical Marks</th>
                <th>Total Marks</th>
                <th>Result</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody id="marks-entry-tbody">
              <!-- Will be populated dynamically -->
            </tbody>
          </table>
        </div>

        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
          <button onclick="submitAllMarks()" class="submit-btn" style="flex: 1; background: var(--success);">✓ Submit Marks</button>
          <button onclick="cancelMarksEntry()" class="submit-btn" style="flex: 1; background: #94a3b8;">← Go Back</button>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

/**
 * Handle exam session change
 */
async function handleSessionChange() {
  const sessionId = document.getElementById('exam-session').value;
  if (!sessionId) return;

  const configs = await fetchExamConfigurations(sessionId);
  console.log('Exam configurations:', configs);
}

/**
 * Handle exam type change (to show/hide theory and practical fields)
 */
function handleExamTypeChange() {
  const examType = document.getElementById('exam-type').value;
  const theoryHeader = document.getElementById('theory-header');
  const practicalHeader = document.getElementById('practical-header');

  if (examType === 'Theory Only') {
    theoryHeader.style.display = 'table-cell';
    practicalHeader.style.display = 'none';
  } else if (examType === 'Practical Only') {
    theoryHeader.style.display = 'none';
    practicalHeader.style.display = 'table-cell';
  } else if (examType === 'Theory + Practical') {
    theoryHeader.style.display = 'table-cell';
    practicalHeader.style.display = 'table-cell';
  }
}

/**
 * Handle exam configuration form submission
 */
async function handleExamConfigSubmit(event) {
  event.preventDefault();

  const sessionId = document.getElementById('exam-session').value;
  const academicYear = document.getElementById('exam-academic-year').value;
  const className = document.getElementById('exam-class').value;
  const subject = document.getElementById('exam-subject').value;
  const examType = document.getElementById('exam-type').value;
  const fullMarks = parseInt(document.getElementById('exam-full-marks').value);

  const passMarks = parseInt(document.getElementById('exam-pass-marks').value);

  if (!sessionId || !className || !subject || !examType) {
    alert('Please fill all fields');
    return;
  }

  if (passMarks > fullMarks) {
    alert('Pass marks cannot be greater than full marks');
    return;
  }

  // Create exam configuration
  const config = {
    exam_session_id: parseInt(sessionId),
    academic_year: academicYear,
    subject,
    class: className,
    exam_type: examType,
    full_marks: fullMarks,
    pass_marks: passMarks,
    teacher_code: localStorage.getItem('teacher_code') || 'Unknown'
  };

  const success = await createExamConfiguration(config);
  if (!success) return;

  // Fetch students for the class
  const students = await fetchStudentsByClass(className);
  if (students.length === 0) {
    alert('No active students found in this class');
    return;
  }

  // Render marks entry table
  renderMarksEntry(students, examType, fullMarks, passMarks);

  // Show marks entry section
  document.getElementById('marks-entry-section').style.display = 'block';
  document.getElementById('config-summary').textContent = 
    `${subject} | ${className} | ${examType} | Year: ${academicYear} | Full Marks: ${fullMarks}, Pass: ${passMarks}`;

  // Scroll to marks entry
  document.getElementById('marks-entry-section').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Render marks entry table
 */
function renderMarksEntry(students, examType, fullMarks, passMarks) {
  const tbody = document.getElementById('marks-entry-tbody');
  const theoryHeader = document.getElementById('theory-header');
  const practicalHeader = document.getElementById('practical-header');

  // Show/hide headers based on exam type
  if (examType === 'Theory Only') {
    theoryHeader.style.display = 'table-cell';
    practicalHeader.style.display = 'none';
  } else if (examType === 'Practical Only') {
    theoryHeader.style.display = 'none';
    practicalHeader.style.display = 'table-cell';
  } else {
    theoryHeader.style.display = 'table-cell';
    practicalHeader.style.display = 'table-cell';
  }

  tbody.innerHTML = students.map(student => {
    const symbolNum = `SYM${String(student.roll).padStart(3, '0')}`;
    
    let marksInputHTML = '';
    if (examType === 'Theory Only') {
      marksInputHTML = `
        <td>
          <input type="number" class="marks-input theory-marks" data-roll="${student.roll}" 
            min="0" max="${fullMarks}" placeholder="0" style="width: 100%; padding: 0.5rem;">
        </td>
      `;
    } else if (examType === 'Practical Only') {
      marksInputHTML = `
        <td>
          <input type="number" class="marks-input practical-marks" data-roll="${student.roll}" 
            min="0" max="${fullMarks}" placeholder="0" style="width: 100%; padding: 0.5rem;">
        </td>
      `;
    } else {
      marksInputHTML = `
        <td>
          <input type="number" class="marks-input theory-marks" data-roll="${student.roll}" 
            min="0" max="${fullMarks}" placeholder="0" style="width: 100%; padding: 0.5rem;">
        </td>
        <td>
          <input type="number" class="marks-input practical-marks" data-roll="${student.roll}" 
            min="0" max="${fullMarks}" placeholder="0" style="width: 100%; padding: 0.5rem;">
        </td>
      `;
    }

    return `
      <tr>
        <td>${student.roll}</td>
        <td>${symbolNum}</td>
        <td>${student.name}</td>
        ${marksInputHTML}
        <td>
          <span class="total-marks" data-roll="${student.roll}">0</span>
        </td>
        <td>
          <span class="result-status" data-roll="${student.roll}">—</span>
        </td>
        <td>
          <span class="grade-display" data-roll="${student.roll}">—</span>
        </td>
      </tr>
    `;
  }).join('');

  // Add event listeners to calculate totals and grades
  document.querySelectorAll('.marks-input').forEach(input => {
    input.addEventListener('change', (e) => updateRowCalculations(e.target, examType, fullMarks, passMarks));
  });
}

/**
 * Update row calculations (total, percentage, grade, result)
 */
function updateRowCalculations(input, examType, fullMarks, passMarks) {
  const roll = input.getAttribute('data-roll');
  const row = input.closest('tr');

  let totalMarks = 0;

  if (examType === 'Theory Only') {
    const theoryMarks = parseInt(row.querySelector('.theory-marks').value) || 0;
    totalMarks = theoryMarks;
  } else if (examType === 'Practical Only') {
    const practicalMarks = parseInt(row.querySelector('.practical-marks').value) || 0;
    totalMarks = practicalMarks;
  } else {
    const theoryMarks = parseInt(row.querySelector('.theory-marks').value) || 0;
    const practicalMarks = parseInt(row.querySelector('.practical-marks').value) || 0;
    totalMarks = theoryMarks + practicalMarks;
  }

  // Update total marks
  row.querySelector('.total-marks').textContent = totalMarks;

  // Calculate percentage and grade
  const percentage = (totalMarks / fullMarks) * 100;
  const grade = calculateGrade(percentage);
  const resultStatus = determineResultStatus(totalMarks, passMarks);

  // Update result and grade displays
  row.querySelector('.result-status').textContent = resultStatus;
  row.querySelector('.grade-display').textContent = grade;

  // Color code the result
  const resultSpan = row.querySelector('.result-status');
  resultSpan.style.fontWeight = 'bold';
  resultSpan.style.color = resultStatus === 'Pass' ? 'var(--success)' : 'var(--danger)';
}

/**
 * Submit all marks
 */
async function submitAllMarks() {
  const sessionId = parseInt(document.getElementById('exam-session').value);
  const className = document.getElementById('exam-class').value;
  const subject = document.getElementById('exam-subject').value;
  const examType = document.getElementById('exam-type').value;
  const fullMarks = parseInt(document.getElementById('exam-full-marks').value);
  const passMarks = parseInt(document.getElementById('exam-pass-marks').value);

  // Collect all marks
  const rows = document.querySelectorAll('#marks-entry-tbody tr');
  if (rows.length === 0) {
    alert('No students to submit');
    return;
  }

  const results = [];
  rows.forEach(row => {
    const roll = row.querySelector('td:nth-child(1)').textContent;
    const symbol = row.querySelector('td:nth-child(2)').textContent;
    const name = row.querySelector('td:nth-child(3)').textContent;
    const totalMarks = parseInt(row.querySelector('.total-marks').textContent) || 0;
    const resultStatus = row.querySelector('.result-status').textContent;
    const grade = row.querySelector('.grade-display').textContent;
    const percentage = (totalMarks / fullMarks) * 100;

    let theoryMarks = null;
    let practicalMarks = null;

    if (examType === 'Theory Only') {
      theoryMarks = parseInt(row.querySelector('.theory-marks').value) || 0;
    } else if (examType === 'Practical Only') {
      practicalMarks = parseInt(row.querySelector('.practical-marks').value) || 0;
    } else {
      theoryMarks = parseInt(row.querySelector('.theory-marks').value) || 0;
      practicalMarks = parseInt(row.querySelector('.practical-marks').value) || 0;
    }

    results.push({
      student_roll: parseInt(roll),
      student_symbol: symbol,
      student_name: name,
      theory_marks: theoryMarks,
      practical_marks: practicalMarks,
      total_marks: totalMarks,
      result_status: resultStatus,
      percentage: percentage,
      grade: grade,
      academic_year: document.getElementById('exam-academic-year').value
    });
  });

  // Get the exam configuration ID (we need to fetch it first)
  const configs = await fetchExamConfigurations(sessionId);
  const config = configs.find(c => 
    c.subject === subject && c.class === className && c.exam_type === examType
  );

  if (!config) {
    alert('Exam configuration not found');
    return;
  }

  // Submit results
  const success = await submitExamResults(config.id, results);
  if (success) {
    // Reset form
    document.getElementById('exam-config-form').reset();
    document.getElementById('marks-entry-section').style.display = 'none';
    await renderExamResultForm();
  }
}

/**
 * Cancel marks entry and go back
 */
function cancelMarksEntry() {
  document.getElementById('marks-entry-section').style.display = 'none';
  document.getElementById('exam-config-form').reset();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
