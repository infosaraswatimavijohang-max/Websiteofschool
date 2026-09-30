// ============================================================================
// FILE:    manual-attendance.js
// MODULE:  Attendance
// PURPOSE: Enhanced Manual Attendance marking for Students & Analytics Dashboard.
//          Queries Supabase database and falls back to localStorage.
// ============================================================================

window.manualAttendance = {
  students: [],
  classes: [],
  currentSheetStudents: [],

  init: function() {
    console.log('[MANUAL-ATTENDANCE] Initializing...');

    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const markDate = document.getElementById('manual-att-date-input');
    if (markDate) markDate.value = today;

    const dailyDate = document.getElementById('report-daily-date');
    if (dailyDate) dailyDate.value = today;

    const summaryStart = document.getElementById('report-summary-start-date');
    if (summaryStart) summaryStart.value = firstDayOfMonth;

    const summaryEnd = document.getElementById('report-summary-end-date');
    if (summaryEnd) summaryEnd.value = today;

    // Load Class selector options
    this.populateClassDropdowns();
  },

  populateClassDropdowns: async function() {
    let activeClasses = [];
    if (window.classHandler) {
      try {
        activeClasses = await window.classHandler.getActiveClasses();
      } catch (e) {
        console.warn("[MANUAL-ATTENDANCE] ClassHandler load error, using fallback:", e);
      }
    }

    // Fallback registry extraction if database is empty or offline
    if (!activeClasses || activeClasses.length === 0) {
      try {
        const localRegistry = localStorage.getItem('students_registry');
        if (localRegistry) {
          const stList = JSON.parse(localRegistry);
          const uniqueClasses = new Set();
          stList.forEach(s => {
            if (s.class) uniqueClasses.add(s.class);
          });
          activeClasses = Array.from(uniqueClasses).sort().map(c => ({ display: c }));
        }
      } catch (e) {
        console.error("[MANUAL-ATTENDANCE] Fallback class extraction failed:", e);
      }
    }

    const selectIds = ['manual-att-class-select', 'report-daily-class', 'report-summary-class'];
    selectIds.forEach(id => {
      const select = document.getElementById(id);
      if (select) {
        select.innerHTML = '<option value="">-- Select Class --</option>';
        activeClasses.forEach(cls => {
          const opt = document.createElement('option');
          opt.value = cls.display;
          opt.textContent = cls.display;
          select.appendChild(opt);
        });
      }
    });
  },

  loadStudentAttendanceSheet: async function() {
    const selectedClass = document.getElementById('manual-att-class-select').value;
    const selectedDate = document.getElementById('manual-att-date-input').value;
    const sheetPanel = document.getElementById('attendance-sheet-panel');
    const tbody = document.getElementById('student-attendance-tbody');

    if (!selectedClass || !selectedDate) {
      alert("Please select both Class and Date first.");
      return;
    }

    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 2.5rem; color: var(--text-muted); font-weight: 600;">Loading students registry...</td></tr>`;
    sheetPanel.style.display = 'block';

    // 1. Fetch students for the class
    let students = [];
    if (window.supabaseDb) {
      try {
        const { data, error } = await window.supabaseDb
          .from('students_registry')
          .select('*')
          .eq('class', selectedClass)
          .order('roll', { ascending: true });
        if (!error && data) students = data;
      } catch (e) {
        console.warn("Supabase students registry query failed:", e);
      }
    }

    // Fallback to localStorage
    if (students.length === 0) {
      try {
        const localVal = localStorage.getItem('students_registry');
        if (localVal) {
          const allSt = JSON.parse(localVal);
          students = allSt.filter(s => s.class === selectedClass).sort((a, b) => (a.roll || 0) - (b.roll || 0));
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (students.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 3rem; color: var(--text-muted); font-weight: 600;">No students registered in ${selectedClass}.</td></tr>`;
      document.getElementById('marking-stats-badge').textContent = 'Present: 0/0';
      return;
    }

    this.currentSheetStudents = students;

    // 2. Fetch existing daily logs from Supabase
    let existingLogs = [];
    if (window.supabaseDb) {
      try {
        const { data, error } = await window.supabaseDb
          .from('student_attendance')
          .select('*')
          .eq('class_name', selectedClass)
          .eq('attendance_date', selectedDate);
        if (!error && data) existingLogs = data;
      } catch (e) {
        console.warn("Supabase student_attendance load failed:", e);
      }
    }

    // Fallback existing logs from localStorage
    if (existingLogs.length === 0) {
      try {
        const localLogs = localStorage.getItem('local_student_attendance');
        if (localLogs) {
          const allLogs = JSON.parse(localLogs);
          existingLogs = allLogs.filter(log => log.class_name === selectedClass && log.attendance_date === selectedDate);
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Render list
    tbody.innerHTML = '';
    document.getElementById('attendance-student-search').value = '';
    document.getElementById('mark-all-present-checkbox').checked = false;

    students.forEach(student => {
      const match = existingLogs.find(log => log.student_roll === student.roll);
      // Default to true (present) if no record exists yet
      const isPresent = match ? (match.status === 'present') : true;
      const remarks = match ? (match.remarks || '') : '';

      const tr = document.createElement('tr');
      tr.id = `att-row-${student.roll}`;
      tr.className = 'att-student-row';
      tr.setAttribute('data-name', student.name.toLowerCase());
      tr.setAttribute('data-roll', student.roll);

      tr.innerHTML = `
        <td style="font-weight: 700; color: var(--primary);">Roll ${student.roll}</td>
        <td>
          <div style="font-weight: 600; color: var(--text-main); font-size: 0.95rem;">${student.name}</div>
          <small style="color: var(--text-muted)">ID: ${student.admission_no || student.id || student.roll}</small>
        </td>
        <td style="text-align: center; vertical-align: middle;">
          <div class="att-switch-container">
            <span id="status-label-${student.roll}" class="att-status-badge ${isPresent ? 'att-badge-present' : 'att-badge-absent'}">
              ${isPresent ? 'Present' : 'Absent'}
            </span>
            <label class="att-switch">
              <input type="checkbox" class="att-present-check" onchange="window.manualAttendance.handleToggleChange(this, ${student.roll})" ${isPresent ? 'checked' : ''}>
              <span class="att-slider"></span>
            </label>
          </div>
        </td>
        <td>
          <input type="text" class="form-control att-remarks-input" placeholder="Optional remarks or leave reason..." value="${remarks}" style="width: 100%; padding: 0.45rem 0.8rem; font-size: 0.9rem; margin: 0; border-radius: 8px; border: 1px solid #cbd5e1; outline: none;">
        </td>
      `;
      tbody.appendChild(tr);
    });

    document.getElementById('attendance-sheet-title').textContent = `Attendance Sheet: ${selectedClass} (${selectedDate})`;
    this.updateMarkingStats();
  },

  handleToggleChange: function(chk, roll) {
    const label = document.getElementById(`status-label-${roll}`);
    if (label) {
      if (chk.checked) {
        label.textContent = 'Present';
        label.className = 'att-status-badge att-badge-present';
      } else {
        label.textContent = 'Absent';
        label.className = 'att-status-badge att-badge-absent';
      }
    }
    this.updateMarkingStats();
  },

  updateMarkingStats: function() {
    const rows = document.querySelectorAll('#student-attendance-tbody tr');
    let total = 0;
    let present = 0;

    rows.forEach(row => {
      if (row.style.display !== 'none') {
        total++;
        const chk = row.querySelector('.att-present-check');
        if (chk && chk.checked) present++;
      }
    });

    const badge = document.getElementById('marking-stats-badge');
    if (badge) {
      badge.textContent = `Present: ${present}/${total}`;
    }
  },

  filterMarkingList: function() {
    const searchVal = document.getElementById('attendance-student-search').value.toLowerCase().trim();
    const rows = document.querySelectorAll('#student-attendance-tbody tr.att-student-row');

    rows.forEach(row => {
      const name = row.getAttribute('data-name');
      const roll = row.getAttribute('data-roll');
      if (name.includes(searchVal) || roll.includes(searchVal)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });

    this.updateMarkingStats();
  },

  toggleAllPresent: function(masterCheckbox) {
    const isChecked = masterCheckbox.checked;
    const checkboxes = document.querySelectorAll('#student-attendance-tbody .att-present-check');
    checkboxes.forEach(chk => {
      const row = chk.closest('tr');
      if (row && row.style.display !== 'none') {
        chk.checked = isChecked;
        // Update label
        const roll = row.getAttribute('data-roll');
        const label = document.getElementById(`status-label-${roll}`);
        if (label) {
          if (isChecked) {
            label.textContent = 'Present';
            label.className = 'att-status-badge att-badge-present';
          } else {
            label.textContent = 'Absent';
            label.className = 'att-status-badge att-badge-absent';
          }
        }
      }
    });
    this.updateMarkingStats();
  },

  saveStudentAttendanceSheet: async function() {
    const selectedClass = document.getElementById('manual-att-class-select').value;
    const selectedDate = document.getElementById('manual-att-date-input').value;
    const tbody = document.getElementById('student-attendance-tbody');

    if (!selectedClass || !selectedDate || !this.currentSheetStudents.length) return;

    const records = [];
    const rows = tbody.querySelectorAll('tr.att-student-row');

    rows.forEach(row => {
      const roll = parseInt(row.getAttribute('data-roll'));
      const name = row.querySelector('td:nth-child(2) div').textContent;
      const isPresent = row.querySelector('.att-present-check').checked;
      const remarks = row.querySelector('.att-remarks-input').value.trim();

      records.push({
        student_roll: roll,
        student_name: name,
        class_name: selectedClass,
        attendance_date: selectedDate,
        status: isPresent ? 'present' : 'absent',
        remarks: remarks || null
      });
    });

    let saveSuccess = false;

    // 1. Save to Supabase student_attendance table
    if (window.supabaseDb) {
      try {
        const { error } = await window.supabaseDb
          .from('student_attendance')
          .upsert(records, { onConflict: 'student_roll,attendance_date' });

        if (!error) {
          saveSuccess = true;
          console.log("[MANUAL-ATTENDANCE] Daily logs saved successfully in Supabase.");
        } else {
          console.error("[MANUAL-ATTENDANCE] Supabase Upsert error:", error);
        }
      } catch (e) {
        console.error("[MANUAL-ATTENDANCE] Supabase write exception:", e);
      }
    }

    // 2. Offline Fallback & Backup Sync in LocalStorage
    try {
      const localVal = localStorage.getItem('local_student_attendance');
      let allLogs = localVal ? JSON.parse(localVal) : [];

      // Clear existing records matching selected class and date to prevent duplicates
      allLogs = allLogs.filter(log => !(log.class_name === selectedClass && log.attendance_date === selectedDate));
      
      // Add new records
      allLogs.push(...records);
      localStorage.setItem('local_student_attendance', JSON.stringify(allLogs));
      
      if (!saveSuccess) {
        alert("Attendance saved to browser local storage. (Supabase cloud was offline/unconfigured).");
      } else {
        alert("Attendance records saved successfully to Supabase database & synced locally!");
      }
    } catch (e) {
      console.error("[MANUAL-ATTENDANCE] Local storage write error:", e);
      alert("Error saving record. Check console for details.");
    }
  },

  initReportsTab: function() {
    // Make sure class selects are updated
    this.populateClassDropdowns();
  },

  loadDailyReport: async function() {
    const selectedClass = document.getElementById('report-daily-class').value;
    const selectedDate = document.getElementById('report-daily-date').value;
    const panel = document.getElementById('daily-report-panel');
    const tbody = document.getElementById('daily-report-tbody');
    const badge = document.getElementById('daily-report-stats-badge');
    const title = document.getElementById('daily-report-title');

    if (!selectedClass || !selectedDate) {
      alert("Please select Class and Date.");
      return;
    }

    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 2rem; color: var(--text-muted); font-weight: 600;">Querying logs...</td></tr>`;
    panel.style.display = 'block';

    let records = [];

    // Query database
    if (window.supabaseDb) {
      try {
        const { data, error } = await window.supabaseDb
          .from('student_attendance')
          .select('*')
          .eq('class_name', selectedClass)
          .eq('attendance_date', selectedDate)
          .order('student_roll', { ascending: true });
        if (!error && data) records = data;
      } catch (e) {
        console.warn("[MANUAL-ATTENDANCE] Supabase query failed, falling back to local:", e);
      }
    }

    // Fallback to local storage logs
    if (records.length === 0) {
      try {
        const localVal = localStorage.getItem('local_student_attendance');
        if (localVal) {
          const allLogs = JSON.parse(localVal);
          records = allLogs
            .filter(log => log.class_name === selectedClass && log.attendance_date === selectedDate)
            .sort((a, b) => a.student_roll - b.student_roll);
        }
      } catch (e) {
        console.error(e);
      }
    }

    tbody.innerHTML = '';
    title.textContent = `Daily Logs: ${selectedClass} (${selectedDate})`;

    if (records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 2.5rem; color: var(--text-muted); font-weight: 600;">No manual attendance record logs found for this day.</td></tr>`;
      badge.textContent = 'Present: 0 | Absent: 0 | Rate: 0%';
      return;
    }

    let present = 0;
    let absent = 0;

    records.forEach(r => {
      const isPresent = r.status === 'present';
      if (isPresent) present++;
      else absent++;

      const statusBadge = isPresent
        ? `<span class="att-status-badge att-badge-present">Present</span>`
        : `<span class="att-status-badge att-badge-absent">Absent</span>`;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>Roll ${r.student_roll}</strong></td>
        <td>${r.student_name}</td>
        <td>${statusBadge}</td>
        <td><em style="color: var(--text-muted); font-size: 0.85rem;">${r.remarks || '-'}</em></td>
      `;
      tbody.appendChild(tr);
    });

    const rate = ((present / records.length) * 100).toFixed(1);
    badge.textContent = `Present: ${present} | Absent: ${absent} | Attendance Rate: ${rate}%`;
  },

  loadSummaryReport: async function() {
    const selectedClass = document.getElementById('report-summary-class').value;
    const startDate = document.getElementById('report-summary-start-date').value;
    const endDate = document.getElementById('report-summary-end-date').value;
    const panel = document.getElementById('summary-report-panel');
    const tbody = document.getElementById('summary-report-tbody');

    if (!selectedClass || !startDate || !endDate) {
      alert("Please specify Class, Start Date, and End Date.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert("Start Date cannot exceed End Date.");
      return;
    }

    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--text-muted); font-weight: 600;">Aggregating metrics...</td></tr>`;
    panel.style.display = 'block';

    let records = [];

    // Query database
    if (window.supabaseDb) {
      try {
        const { data, error } = await window.supabaseDb
          .from('student_attendance')
          .select('*')
          .eq('class_name', selectedClass)
          .gte('attendance_date', startDate)
          .lte('attendance_date', endDate);
        if (!error && data) records = data;
      } catch (e) {
        console.warn(e);
      }
    }

    // Fallback
    if (records.length === 0) {
      try {
        const localVal = localStorage.getItem('local_student_attendance');
        if (localVal) {
          const allLogs = JSON.parse(localVal);
          records = allLogs.filter(log => 
            log.class_name === selectedClass && 
            log.attendance_date >= startDate && 
            log.attendance_date <= endDate
          );
        }
      } catch (e) {
        console.error(e);
      }
    }

    tbody.innerHTML = '';

    if (records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2.5rem; color: var(--text-muted); font-weight: 600;">No attendance records found within the date range.</td></tr>`;
      document.getElementById('card-avg-attendance-rate').textContent = '0.0%';
      document.getElementById('card-best-attendance-student').textContent = 'N/A';
      document.getElementById('card-lowest-attendance-student').textContent = 'N/A';
      return;
    }

    // Map aggregates
    const summary = {};
    records.forEach(r => {
      const roll = r.student_roll;
      if (!summary[roll]) {
        summary[roll] = { name: r.student_name, present: 0, absent: 0, total: 0 };
      }
      summary[roll].total++;
      if (r.status === 'present') {
        summary[roll].present++;
      } else {
        summary[roll].absent++;
      }
    });

    const summaryArray = Object.keys(summary).map(roll => ({
      roll: parseInt(roll),
      name: summary[roll].name,
      present: summary[roll].present,
      absent: summary[roll].absent,
      total: summary[roll].total,
      rate: (summary[roll].present / summary[roll].total) * 100
    })).sort((a, b) => a.roll - b.roll);

    let totalPresent = 0;
    let totalDays = 0;
    let best = null;
    let worst = null;

    summaryArray.forEach(s => {
      totalPresent += s.present;
      totalDays += s.total;

      if (!best || s.rate > best.rate) best = s;
      if (!worst || s.rate < worst.rate) worst = s;

      let pctColor = '#16a34a';
      let pctBg = 'rgba(22, 163, 74, 0.1)';
      if (s.rate < 75) {
        pctColor = '#dc2626';
        pctBg = 'rgba(220, 38, 38, 0.1)';
      } else if (s.rate < 90) {
        pctColor = '#ea580c';
        pctBg = 'rgba(234, 88, 12, 0.1)';
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>Roll ${s.roll}</strong></td>
        <td>${s.name}</td>
        <td style="text-align: center; font-weight: 600; color: #16a34a;">${s.present}</td>
        <td style="text-align: center; font-weight: 600; color: #dc2626;">${s.absent}</td>
        <td style="text-align: center; font-weight: 600; color: var(--primary);">${s.total}</td>
        <td style="text-align: center;">
          <span style="background: ${pctBg}; color: ${pctColor}; padding: 0.35rem 0.8rem; border-radius: 20px; font-weight: 700; font-size: 0.85rem;">
            ${s.rate.toFixed(1)}%
          </span>
        </td>
      `;
      tbody.appendChild(tr);
    });

    const averageRate = totalDays > 0 ? ((totalPresent / totalDays) * 100).toFixed(1) : '0.0';
    document.getElementById('card-avg-attendance-rate').textContent = `${averageRate}%`;
    document.getElementById('card-best-attendance-student').textContent = best ? `${best.name} (${best.rate.toFixed(0)}%)` : 'N/A';
    document.getElementById('card-lowest-attendance-student').textContent = worst ? `${worst.name} (${worst.rate.toFixed(0)}%)` : 'N/A';
  }
};

// Global tab switcher helper functions
window.switchManualAttTab = function(tab) {
  const markBtn = document.getElementById('btn-manual-att-mark-tab');
  const reportsBtn = document.getElementById('btn-manual-att-reports-tab');
  const markSection = document.getElementById('section-manual-att-mark');
  const reportsSection = document.getElementById('section-manual-att-reports');

  if (tab === 'mark') {
    markBtn.classList.add('active');
    reportsBtn.classList.remove('active');
    markSection.style.display = 'block';
    reportsSection.style.display = 'none';
  } else {
    reportsBtn.classList.add('active');
    markBtn.classList.remove('active');
    markSection.style.display = 'none';
    reportsSection.style.display = 'block';

    window.manualAttendance.initReportsTab();
  }
};

window.switchReportsSubTab = function(subTab) {
  const dailyBtn = document.getElementById('btn-report-daily-tab');
  const summaryBtn = document.getElementById('btn-report-summary-tab');
  const dailyView = document.getElementById('subview-report-daily');
  const summaryView = document.getElementById('subview-report-summary');

  if (subTab === 'daily') {
    dailyBtn.classList.add('active');
    summaryBtn.classList.remove('active');
    dailyView.style.display = 'block';
    summaryView.style.display = 'none';
  } else {
    summaryBtn.classList.add('active');
    dailyBtn.classList.remove('active');
    dailyView.style.display = 'none';
    summaryView.style.display = 'block';
  }
};

// Helper to initialize and start observer
function initManualAttendanceSystem() {
  window.manualAttendance.init();
  
  const page = document.getElementById('page-student-manual-attendance');
  if (page) {
    manualAttObserver.observe(page, { attributes: true });
  }
}

// Observe page class changes to re-init dynamically when accessed
const manualAttObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
      const target = mutation.target;
      if (target.id === 'page-student-manual-attendance' && target.classList.contains('active')) {
        window.manualAttendance.init();
      }
    }
  });
});

// Initialize on DOM ready or immediately if already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(initManualAttendanceSystem, 100);
} else {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initManualAttendanceSystem, 100);
  });
}

