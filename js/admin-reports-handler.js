// ============================================================================
// FILE:    admin-reports-handler.js
// MODULE:  Academic Reports & Visual Analytics
// PURPOSE: Handles Report Registry CRUD operations and draws interactive academic graphs
//          including term-over-term trends and student performance improvements.
// ============================================================================

// Global chart variables to prevent duplicate canvas bindings
let reportCharts = {
  gpa: null,
  subject: null,
  passFail: null,
  topStudents: null,
  gpaProgression: null,
  subjectComparison: null
};

function initReportsOnLoad() {
  // Decorate window.switchPage to capture when academic-reports is navigated to
  const originalSwitchPage = window.switchPage;
  window.switchPage = function(pageId, element) {
    if (originalSwitchPage) originalSwitchPage(pageId, element);
    
    if (pageId === 'academic-reports') {
      initAcademicReportsPage();
    }
  };

  // Run immediately if the page starts active
  const activePage = document.querySelector('.page-view.active');
  if (activePage && activePage.id === 'page-academic-reports') {
    initAcademicReportsPage();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReportsOnLoad);
} else {
  initReportsOnLoad();
}

/**
 * Initialize the Academic Reports Page
 */
async function initAcademicReportsPage() {
  console.log('[REPORTS] Initializing Academic Reports & Graphs Page...');
  
  // Reset navigation tabs
  switchReportsTab('registry');
  
  // Load current reports metadata registry
  loadReportsRegistryTable();
  
  // Populate dropdown lists for analytics
  await populateAnalyticsFilters();
}

/**
 * Switch between the Reports Registry and Visual Analytics dashboard
 */
function switchReportsTab(tab) {
  const registrySec = document.getElementById('section-report-registry');
  const analyticsSec = document.getElementById('section-report-analytics');
  const btnRegistry = document.getElementById('btn-tab-report-registry');
  const btnAnalytics = document.getElementById('btn-tab-report-analytics');
  
  if (!registrySec || !analyticsSec) return;

  if (tab === 'registry') {
    registrySec.style.display = 'block';
    analyticsSec.style.display = 'none';
    
    btnRegistry.style.background = 'var(--primary)';
    btnRegistry.style.color = 'white';
    btnAnalytics.style.background = '#e5e7eb';
    btnAnalytics.style.color = 'var(--text-dark)';
  } else {
    registrySec.style.display = 'none';
    analyticsSec.style.display = 'block';
    
    btnAnalytics.style.background = 'var(--primary)';
    btnAnalytics.style.color = 'white';
    btnRegistry.style.background = '#e5e7eb';
    btnRegistry.style.color = 'var(--text-dark)';
    
    // Load graphs immediately on tab switch
    loadReportsAnalytics();
  }
}

// Ensure globally accessible
window.switchReportsTab = switchReportsTab;

/**
 * ====================================================================
 * REPORT METADATA REGISTRY (CRUD)
 * ====================================================================
 */

/**
 * Load and render the reports metadata list from localStorage
 */
function loadReportsRegistryTable() {
  const tbody = document.getElementById('academic-reports-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  // Fetch generic module Academic_Report entries
  const reports = JSON.parse(localStorage.getItem('generic_module_Academic_Report') || '[]');
  
  if (reports.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:2rem;">No report entries found. Use the builder on the left to add one!</td></tr>`;
    return;
  }
  
  reports.forEach(rep => {
    const statusBadge = rep.f4 === 'Finalized' 
      ? '<span class="status-badge approved">Finalized</span>' 
      : '<span class="status-badge pending">Draft</span>';
      
    tbody.innerHTML += `
      <tr>
        <td><strong>${rep.f1}</strong></td>
        <td>${rep.f2}</td>
        <td>${rep.f3 || '-'}</td>
        <td>${statusBadge}</td>
        <td>
          <button type="button" class="submit-btn" style="padding:0.3rem 0.6rem; font-size:0.8rem; background:none; color:var(--primary); font-weight:700; border:none; cursor:pointer;" onclick="editAcademicReport('${rep.id}')">✏️ Edit</button>
          <button type="button" class="submit-btn" style="padding:0.3rem 0.6rem; font-size:0.8rem; background:none; color:var(--danger); font-weight:700; border:none; cursor:pointer;" onclick="deleteAcademicReport('${rep.id}')">&times; Delete</button>
        </td>
      </tr>
    `;
  });
}

/**
 * Handle form submit for Add/Edit Report
 */
async function handleAcademicReportSubmit(event) {
  event.preventDefault();
  
  const editId = document.getElementById('report-edit-id').value;
  const title = document.getElementById('rep-title').value;
  const module = document.getElementById('rep-module').value;
  const date = document.getElementById('rep-date').value;
  const status = document.getElementById('rep-status').value;
  
  const reports = JSON.parse(localStorage.getItem('generic_module_Academic_Report') || '[]');
  
  if (editId) {
    // Update existing
    const idx = reports.findIndex(r => String(r.id) === String(editId));
    if (idx !== -1) {
      reports[idx] = {
        id: editId,
        f1: title,
        f2: module,
        f3: date,
        f4: status
      };
      alert('Report updated successfully!');
    }
  } else {
    // Add new
    const newReport = {
      id: Date.now().toString(),
      f1: title,
      f2: module,
      f3: date,
      f4: status
    };
    reports.push(newReport);
    alert('Academic report entry created successfully!');
  }
  
  localStorage.setItem('generic_module_Academic_Report', JSON.stringify(reports));
  clearAcademicReportForm();
  loadReportsRegistryTable();
}

// Make globally accessible
window.handleAcademicReportSubmit = handleAcademicReportSubmit;

/**
 * Load report fields into the builder form for editing
 */
function editAcademicReport(id) {
  const reports = JSON.parse(localStorage.getItem('generic_module_Academic_Report') || '[]');
  const rep = reports.find(r => String(r.id) === String(id));
  
  if (!rep) return;
  
  document.getElementById('report-edit-id').value = rep.id;
  document.getElementById('rep-title').value = rep.f1;
  document.getElementById('rep-module').value = rep.f2;
  document.getElementById('rep-date').value = rep.f3;
  document.getElementById('rep-status').value = rep.f4;
  
  document.getElementById('report-form-title').textContent = 'Edit Report Entry';
  document.getElementById('btn-report-submit').textContent = 'Update Record';
  document.getElementById('btn-report-cancel').style.display = 'block';
  
  document.getElementById('rep-title').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Make globally accessible
window.editAcademicReport = editAcademicReport;

/**
 * Delete a report metadata entry
 */
function deleteAcademicReport(id) {
  if (!confirm('Are you sure you want to delete this report entry?')) return;
  
  const reports = JSON.parse(localStorage.getItem('generic_module_Academic_Report') || '[]');
  const filtered = reports.filter(r => String(r.id) !== String(id));
  
  localStorage.setItem('generic_module_Academic_Report', JSON.stringify(filtered));
  loadReportsRegistryTable();
}

// Make globally accessible
window.deleteAcademicReport = deleteAcademicReport;

/**
 * Clear the builder form and reset edit state
 */
function clearAcademicReportForm() {
  document.getElementById('report-edit-id').value = '';
  document.getElementById('academic-report-form').reset();
  
  document.getElementById('report-form-title').textContent = 'Add New Report Entry';
  document.getElementById('btn-report-submit').textContent = 'Save Record to System';
  document.getElementById('btn-report-cancel').style.display = 'none';
}

// Make globally accessible
window.clearAcademicReportForm = clearAcademicReportForm;

/**
 * ====================================================================
 * PERFORMANCE ANALYTICS GRAPHING ENGINE (Chart.js)
 * ====================================================================
 */

/**
 * Populate filters for analytics by reading classes dynamically
 */
async function populateAnalyticsFilters() {
  const classSelect = document.getElementById('analytics-class-filter');
  if (!classSelect) return;
  
  // Integration with global self-healing class loading pipeline
  if (typeof window.loadClassesForDropdown === 'function') {
    try {
      console.log('[REPORTS] Calling global loadClassesForDropdown to fetch classes...');
      await window.loadClassesForDropdown();
    } catch (err) {
      console.warn('[REPORTS] loadClassesForDropdown failed, using local fallbacks:', err);
    }
  }

  // Check if dropdown was populated (more options than default/blank/disabled option)
  const validOptions = Array.from(classSelect.options).filter(opt => opt.value !== '');
  
  if (validOptions.length === 0) {
    console.log('[REPORTS] No options loaded from DB. Pulling unique classes from local storage registries...');
    
    // Extract classes from localStorage registries
    const localStudents = JSON.parse(localStorage.getItem('students_registry') || '[]');
    const localCreds = JSON.parse(localStorage.getItem('student_credentials') || '[]');
    
    const allClasses = [
      ...localStudents.map(s => s.class || s.class_name),
      ...localCreds.map(c => c.student_class)
    ].filter(Boolean);
    
    let classes = [...new Set(allClasses)].sort();
    
    if (classes.length === 0) {
      console.log('[REPORTS] No classes found in localStorage registry. Using standard list fallback.');
      classes = [
        "Grade 1 - Section A", "Grade 2 - Section A", "Grade 3 - Section A",
        "Grade 4 - Section A", "Grade 5 - Section A", "Grade 6 - Section A",
        "Grade 7 - Section A", "Grade 8 - Section A", "Grade 9 - Section A",
        "Grade 10 - Section A", "Grade 11 - Section A", "Grade 12 - Section A"
      ];
    }
    
    // Reset and rebuild options
    classSelect.innerHTML = '<option value="" disabled>Select Class</option>';
    classes.forEach(cls => {
      const opt = document.createElement('option');
      opt.value = cls;
      opt.textContent = cls;
      classSelect.appendChild(opt);
    });
  }
  
  // Set default selection to the first non-empty option
  let selectIndex = -1;
  for (let i = 0; i < classSelect.options.length; i++) {
    if (classSelect.options[i].value !== '') {
      selectIndex = i;
      break;
    }
  }
  
  if (selectIndex !== -1) {
    classSelect.selectedIndex = selectIndex;
    console.log('[REPORTS] Selected default class:', classSelect.value);
  } else {
    classSelect.selectedIndex = 0;
  }
}

/**
 * Aggregate student exam results and load visual graphs
 */
function loadReportsAnalytics() {
  const selectedClass = document.getElementById('analytics-class-filter').value;
  const selectedExam = document.getElementById('analytics-exam-filter').value;
  const selectedYear = document.getElementById('analytics-year-filter').value;
  
  const emptyState = document.getElementById('analytics-empty-state');
  const chartsGrid = document.getElementById('analytics-charts-grid');
  
  if (!selectedClass) {
    emptyState.style.display = 'block';
    chartsGrid.style.display = 'none';
    return;
  }
  
  // Load raw data
  const students = JSON.parse(localStorage.getItem('students_registry') || '[]');
  const approvedResults = JSON.parse(localStorage.getItem('approved_results') || '[]');
  
  // Clean / match exam types robustly (ignores casing, spacing, and word 'exam')
  const isMatchExam = (e1, e2) => {
    if (!e1 || !e2) return false;
    const clean = (s) => String(s).toLowerCase().replace(/[\s\-_]+/g, '').replace(/exam/g, '').trim();
    return clean(e1) === clean(e2);
  };

  // Standard exam definitions for comparison
  const examOrder = ['First Term', 'Mid Term', 'Final Term'];

  // Filter approved results for the selected class
  const classResultsAllTerms = approvedResults.filter(ar => 
    String(ar.class).trim() === String(selectedClass).trim()
  );

  // Filter for currently selected term
  const classResultsCurrent = classResultsAllTerms.filter(ar => 
    isMatchExam(ar.examType || ar.exam_type, selectedExam)
  );

  console.log(`[REPORTS] Found ${classResultsCurrent.length} approved results for ${selectedClass} (${selectedExam})`);
  
  if (classResultsCurrent.length === 0) {
    emptyState.style.display = 'block';
    chartsGrid.style.display = 'none';
    return;
  }
  
  // Hide empty state and show dashboard grid
  emptyState.style.display = 'none';
  chartsGrid.style.display = 'flex';
  
  // 1. Process data for current term
  const studentRolls = [...new Set(classResultsCurrent.map(r => r.studentRoll || r.student_roll).filter(Boolean))];
  
  const studentGPAs = [];
  let totalGPAsSum = 0;
  let passCount = 0;
  let highestGPA = 0;
  
  const gpaBins = {
    'A+ (3.6 - 4.0)': 0,
    'A (3.2 - 3.59)': 0,
    'B+ (2.8 - 3.19)': 0,
    'B (2.4 - 2.79)': 0,
    'C+ (2.0 - 2.39)': 0,
    'C (1.6 - 1.99)': 0,
    'D (1.2 - 1.59)': 0,
    'NG (< 1.2)': 0
  };
  
  studentRolls.forEach(roll => {
    const scores = classResultsCurrent.filter(r => (r.studentRoll || r.student_roll) === roll);
    let obtainedSum = 0;
    let maxSum = 0;
    let studentName = scores[0].name || '';
    
    if (!studentName) {
      const regSt = students.find(s => s.roll == roll);
      studentName = regSt ? regSt.name : `Roll #${roll}`;
    }
    
    scores.forEach(s => {
      obtainedSum += parseFloat(s.marks) || 0;
      maxSum += parseFloat(s.totalMarks || s.total_marks) || 100;
    });
    
    const percentage = maxSum > 0 ? (obtainedSum / maxSum) * 100 : 0;
    const gpaResult = localCalculateGPA(percentage);
    
    studentGPAs.push({
      roll: roll,
      name: studentName,
      gpa: gpaResult.gpa,
      grade: gpaResult.grade,
      percentage: percentage
    });
    
    totalGPAsSum += gpaResult.gpa;
    if (gpaResult.gpa >= 1.2) {
      passCount++;
    }
    if (gpaResult.gpa > highestGPA) {
      highestGPA = gpaResult.gpa;
    }
    
    if (gpaResult.gpa >= 3.6) gpaBins['A+ (3.6 - 4.0)']++;
    else if (gpaResult.gpa >= 3.2) gpaBins['A (3.2 - 3.59)']++;
    else if (gpaResult.gpa >= 2.8) gpaBins['B+ (2.8 - 3.19)']++;
    else if (gpaResult.gpa >= 2.4) gpaBins['B (2.4 - 2.79)']++;
    else if (gpaResult.gpa >= 2.0) gpaBins['C+ (2.0 - 2.39)']++;
    else if (gpaResult.gpa >= 1.6) gpaBins['C (1.6 - 1.99)']++;
    else if (gpaResult.gpa >= 1.2) gpaBins['D (1.2 - 1.59)']++;
    else gpaBins['NG (< 1.2)']++;
  });
  
  const classAverageGPA = studentRolls.length > 0 ? (totalGPAsSum / studentRolls.length) : 0;
  const passingRate = studentRolls.length > 0 ? ((passCount / studentRolls.length) * 100) : 0;
  
  // Set Stat Metric Cards
  document.getElementById('analytic-stat-students').textContent = studentRolls.length;
  document.getElementById('analytic-stat-gpa').textContent = classAverageGPA.toFixed(2);
  document.getElementById('analytic-stat-pass-rate').textContent = passingRate.toFixed(1) + '%';
  document.getElementById('analytic-stat-highest').textContent = highestGPA.toFixed(2);
  
  // Subject averages for current term
  const subjectsMap = {};
  classResultsCurrent.forEach(r => {
    if (!r.subject) return;
    if (!subjectsMap[r.subject]) {
      subjectsMap[r.subject] = { sum: 0, count: 0 };
    }
    const marks = parseFloat(r.marks) || 0;
    const total = parseFloat(r.totalMarks || r.total_marks) || 100;
    const pct = total > 0 ? (marks / total) * 100 : 0;
    subjectsMap[r.subject].sum += pct;
    subjectsMap[r.subject].count++;
  });
  
  const subjectsLabels = [];
  const subjectsAverages = [];
  Object.keys(subjectsMap).forEach(sub => {
    subjectsLabels.push(sub);
    const avg = subjectsMap[sub].sum / subjectsMap[sub].count;
    subjectsAverages.push(avg.toFixed(1));
  });

  // Top Students sorted
  const sortedStudents = [...studentGPAs].sort((a, b) => b.gpa - a.gpa).slice(0, 5);
  const topStudentNames = sortedStudents.map(s => s.name);
  const topStudentGPAs = sortedStudents.map(s => s.gpa);

  /**
   * ====================================================================
   * TERM OVER TERM TRENDS COMPARISON
   * ====================================================================
   */
  const termGPAProgression = {};
  const termSubjectAverages = {
    'First Term': {},
    'Mid Term': {},
    'Final Term': {}
  };

  // Group approved results by standard terms
  examOrder.forEach(term => {
    const termResults = classResultsAllTerms.filter(ar => isMatchExam(ar.examType || ar.exam_type, term));
    if (termResults.length === 0) return;
    
    // Group by student for this term to get overall GPAs
    const rolls = [...new Set(termResults.map(r => r.studentRoll || r.student_roll).filter(Boolean))];
    let termGpaSum = 0;
    
    rolls.forEach(roll => {
      const studentScores = termResults.filter(r => (r.studentRoll || r.student_roll) === roll);
      let obt = 0, tot = 0;
      studentScores.forEach(s => {
        obt += parseFloat(s.marks) || 0;
        tot += parseFloat(s.totalMarks || s.total_marks) || 100;
      });
      const pct = tot > 0 ? (obt / tot) * 100 : 0;
      termGpaSum += localCalculateGPA(pct).gpa;
    });

    termGPAProgression[term] = rolls.length > 0 ? (termGpaSum / rolls.length) : 0;

    // Calculate subject averages for this term
    termResults.forEach(r => {
      if (!r.subject) return;
      if (!termSubjectAverages[term][r.subject]) {
        termSubjectAverages[term][r.subject] = { sum: 0, count: 0 };
      }
      const obt = parseFloat(r.marks) || 0;
      const tot = parseFloat(r.totalMarks || r.total_marks) || 100;
      termSubjectAverages[term][r.subject].sum += tot > 0 ? (obt / tot) * 100 : 0;
      termSubjectAverages[term][r.subject].count++;
    });
  });

  // Create datasets for Progression Line Chart
  const lineLabels = examOrder.filter(term => termGPAProgression[term] !== undefined);
  const lineDataPoints = lineLabels.map(term => termGPAProgression[term].toFixed(2));

  // Determine past term dynamically for improvement/decline deltas
  const currentTermIndex = examOrder.indexOf(selectedExam);
  let priorExam = null;
  if (currentTermIndex > 0) {
    // Search backward for first available term with scores
    for (let i = currentTermIndex - 1; i >= 0; i--) {
      const pastTerm = examOrder[i];
      const pastResults = classResultsAllTerms.filter(ar => isMatchExam(ar.examType || ar.exam_type, pastTerm));
      if (pastResults.length > 0) {
        priorExam = pastTerm;
        break;
      }
    }
  }

  // Calculate Deltas for individual students
  const studentDeltas = [];
  const improvementTbody = document.getElementById('student-improvement-tbody');
  const declineTbody = document.getElementById('student-decline-tbody');

  if (priorExam && improvementTbody && declineTbody) {
    const priorResults = classResultsAllTerms.filter(ar => isMatchExam(ar.examType || ar.exam_type, priorExam));
    const priorRolls = [...new Set(priorResults.map(r => r.studentRoll || r.student_roll).filter(Boolean))];
    const priorGPAsMap = {};

    priorRolls.forEach(roll => {
      const studentScores = priorResults.filter(r => (r.studentRoll || r.student_roll) === roll);
      let obt = 0, tot = 0;
      studentScores.forEach(s => {
        obt += parseFloat(s.marks) || 0;
        tot += parseFloat(s.totalMarks || s.total_marks) || 100;
      });
      const pct = tot > 0 ? (obt / tot) * 100 : 0;
      priorGPAsMap[roll] = localCalculateGPA(pct).gpa;
    });

    studentGPAs.forEach(st => {
      const priorGPA = priorGPAsMap[st.roll];
      if (priorGPA !== undefined) {
        const delta = st.gpa - priorGPA;
        studentDeltas.push({
          name: st.name,
          priorGpa: priorGPA,
          currentGpa: st.gpa,
          delta: delta
        });
      }
    });

    // Sort deltas
    const improvedList = [...studentDeltas].filter(d => d.delta > 0).sort((a, b) => b.delta - a.delta).slice(0, 5);
    const declinedList = [...studentDeltas].filter(d => d.delta < 0).sort((a, b) => a.delta - b.delta).slice(0, 5);

    // Render tables
    improvementTbody.innerHTML = '';
    declineTbody.innerHTML = '';

    if (improvedList.length === 0) {
      improvementTbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:1rem;">No improved scores found. Performance holds steady.</td></tr>';
    } else {
      improvedList.forEach(st => {
        improvementTbody.innerHTML += `
          <tr>
            <td><strong>${st.name}</strong></td>
            <td>${st.priorGpa.toFixed(2)}</td>
            <td>${st.currentGpa.toFixed(2)}</td>
            <td><span style="color:#16a34a; font-weight:bold;">+${st.delta.toFixed(2)} 📈</span></td>
          </tr>
        `;
      });
    }

    if (declinedList.length === 0) {
      declineTbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:1rem;">No declining scores found! Outstanding effort class-wide.</td></tr>';
    } else {
      declinedList.forEach(st => {
        declineTbody.innerHTML += `
          <tr>
            <td><strong>${st.name}</strong></td>
            <td>${st.priorGpa.toFixed(2)}</td>
            <td>${st.currentGpa.toFixed(2)}</td>
            <td><span style="color:#dc2626; font-weight:bold;">${st.delta.toFixed(2)} 📉</span></td>
          </tr>
        `;
      });
    }
  } else {
    // If no preceding term exists, display a message
    if (improvementTbody && declineTbody) {
      const msg = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:1rem;">No prior term results available for comparison.</td></tr>`;
      improvementTbody.innerHTML = msg;
      declineTbody.innerHTML = msg;
    }
  }

  // Destroy older chart instances to prevent rendering overlaps
  Object.keys(reportCharts).forEach(key => {
    if (reportCharts[key]) {
      reportCharts[key].destroy();
      reportCharts[key] = null;
    }
  });

  // DRAW CHARTS
  drawGPADistributionChart(Object.keys(gpaBins), Object.values(gpaBins));
  drawSubjectAveragesChart(subjectsLabels, subjectsAverages);
  drawPassFailChart(passCount, studentRolls.length - passCount);
  drawTopStudentsChart(topStudentNames, topStudentGPAs);

  // Draw comparison charts
  drawGPAProgressionChart(lineLabels, lineDataPoints);
  drawSubjectComparisonChart(subjectsLabels, termSubjectAverages);
}

// Make globally accessible
window.loadReportsAnalytics = loadReportsAnalytics;

/**
 * Standard GPA calculation matching admin-portal grading rules
 */
function localCalculateGPA(marks) {
  if (marks >= 90) return { gpa: 4.0, grade: 'A+' };
  if (marks >= 80) return { gpa: 3.6, grade: 'A' };
  if (marks >= 70) return { gpa: 3.2, grade: 'B+' };
  if (marks >= 60) return { gpa: 2.8, grade: 'B' };
  if (marks >= 50) return { gpa: 2.4, grade: 'C+' };
  if (marks >= 40) return { gpa: 2.0, grade: 'C' };
  if (marks >= 35) return { gpa: 1.2, grade: 'D' };
  return { gpa: 0.8, grade: 'NG' };
}

/**
 * Draw Grade Distribution Bar Chart
 */
function drawGPADistributionChart(labels, data) {
  const ctx = document.getElementById('chart-gpa-distribution').getContext('2d');
  
  reportCharts.gpa = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Number of Students',
        data: data,
        backgroundColor: [
          'rgba(124, 58, 237, 0.75)', // A+ (purple)
          'rgba(2, 132, 199, 0.75)',  // A (blue)
          'rgba(16, 185, 129, 0.75)', // B+ (green)
          'rgba(245, 158, 11, 0.75)', // B (yellow)
          'rgba(239, 68, 68, 0.75)',  // C+ (red)
          'rgba(100, 116, 139, 0.75)',// C
          'rgba(148, 163, 184, 0.75)',// D
          'rgba(226, 232, 240, 0.75)' // NG
        ],
        borderColor: [
          '#7c3aed', '#0284c7', '#10b981', '#f59e0b', '#ef4444', '#64748b', '#94a3b8', '#cbd5e1'
        ],
        borderWidth: 1.5,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          padding: 10,
          titleFont: { size: 13, weight: 'bold' },
          bodyFont: { size: 12 }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, precision: 0, color: '#64748b' },
          grid: { borderDash: [5, 5], color: '#f1f5f9' }
        },
        x: {
          ticks: { color: '#64748b', font: { size: 10 } },
          grid: { display: false }
        }
      }
    }
  });
}

/**
 * Draw Subject Average Percentage Bar Chart
 */
function drawSubjectAveragesChart(labels, data) {
  const ctx = document.getElementById('chart-subject-averages').getContext('2d');
  
  reportCharts.subject = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Average Score (%)',
        data: data,
        backgroundColor: 'rgba(2, 132, 199, 0.75)', // primary blue
        borderColor: '#0284c7',
        borderWidth: 1.5,
        borderRadius: 6,
        barThickness: 24
      }]
    },
    options: {
      indexAxis: 'y', // Horizontal bars
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => ` ${context.parsed.x.toFixed(1)}% Average`
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          ticks: { callback: (val) => val + '%', color: '#64748b' },
          grid: { color: '#f1f5f9' }
        },
        y: {
          ticks: { color: '#64748b', font: { weight: 'bold' } },
          grid: { display: false }
        }
      }
    }
  });
}

/**
 * Draw Pass vs Fail donut chart
 */
function drawPassFailChart(pass, fail) {
  const ctx = document.getElementById('chart-pass-fail').getContext('2d');
  
  reportCharts.passFail = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Pass (GPA >= 1.2)', 'Fail / NG (< 1.2)'],
      datasets: [{
        data: [pass, fail],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)', // Green
          'rgba(239, 68, 68, 0.8)'   // Red
        ],
        borderColor: ['#10b981', '#ef4444'],
        borderWidth: 1.5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 15, color: '#64748b', font: { weight: 'bold' } }
        },
        tooltip: {
          callbacks: {
            label: (context) => ` ${context.label}: ${context.parsed} Students`
          }
        }
      },
      cutout: '70%'
    }
  });
}

/**
 * Draw Top Performing Students horizontal bar chart
 */
function drawTopStudentsChart(labels, data) {
  const ctx = document.getElementById('chart-top-students').getContext('2d');
  
  const gradient = ctx.createLinearGradient(0, 0, 400, 0);
  gradient.addColorStop(0, 'rgba(124, 58, 237, 0.85)'); // Purple
  gradient.addColorStop(1, 'rgba(2, 132, 199, 0.85)');  // Blue

  reportCharts.topStudents = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Overall GPA',
        data: data,
        backgroundColor: gradient,
        borderColor: '#7c3aed',
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 20
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => ` GPA: ${context.parsed.x.toFixed(2)}`
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 4.0,
          ticks: { color: '#64748b' },
          grid: { color: '#f1f5f9' }
        },
        y: {
          ticks: { color: '#64748b', font: { weight: 'bold' } },
          grid: { display: false }
        }
      }
    }
  });
}

/**
 * Draw Class GPA Progression Line Chart
 */
function drawGPAProgressionChart(labels, dataPoints) {
  const ctx = document.getElementById('chart-gpa-progression').getContext('2d');
  
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(124, 58, 237, 0.35)');
  gradient.addColorStop(1, 'rgba(124, 58, 237, 0.00)');

  reportCharts.gpaProgression = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Average GPA',
        data: dataPoints,
        borderColor: '#7c3aed',
        backgroundColor: gradient,
        borderWidth: 3,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#7c3aed',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => ` Class Avg GPA: ${context.parsed.y.toFixed(2)}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 4.0,
          ticks: { color: '#64748b' },
          grid: { borderDash: [5, 5], color: '#f1f5f9' }
        },
        x: {
          ticks: { color: '#64748b', font: { weight: 'bold' } },
          grid: { display: false }
        }
      }
    }
  });
}

/**
 * Draw Subject Average Term-over-Term Comparison Grouped Bar Chart
 */
function drawSubjectComparisonChart(subjectLabels, termSubjectAverages) {
  const ctx = document.getElementById('chart-subject-comparison').getContext('2d');
  
  // Calculate average scores per subject for each term
  const termData = {
    'First Term': [],
    'Mid Term': [],
    'Final Term': []
  };

  subjectLabels.forEach(subject => {
    examOrder.forEach(term => {
      const subData = termSubjectAverages[term][subject];
      if (subData) {
        termData[term].push((subData.sum / subData.count).toFixed(1));
      } else {
        termData[term].push(0); // 0 or null if term results don't exist
      }
    });
  });

  const datasets = [];
  const colors = {
    'First Term': { bg: 'rgba(2, 132, 199, 0.75)', border: '#0284c7' }, // Blue
    'Mid Term': { bg: 'rgba(245, 158, 11, 0.75)', border: '#f59e0b' },   // Orange
    'Final Term': { bg: 'rgba(124, 58, 237, 0.75)', border: '#7c3aed' }  // Purple
  };

  examOrder.forEach(term => {
    // Only include dataset if at least one subject has data for this term
    const hasData = termData[term].some(val => val > 0);
    if (hasData) {
      datasets.push({
        label: term,
        data: termData[term],
        backgroundColor: colors[term].bg,
        borderColor: colors[term].border,
        borderWidth: 1.5,
        borderRadius: 4,
        barPercentage: 0.8,
        categoryPercentage: 0.7
      });
    }
  });

  reportCharts.subjectComparison = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: subjectLabels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { color: '#64748b', font: { weight: 'bold' } }
        },
        tooltip: {
          callbacks: {
            label: (context) => ` ${context.dataset.label}: ${context.parsed.y}% Average`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { callback: (val) => val + '%', color: '#64748b' },
          grid: { borderDash: [5, 5], color: '#f1f5f9' }
        },
        x: {
          ticks: { color: '#64748b', font: { size: 10 } },
          grid: { display: false }
        }
      }
    }
  });
}
