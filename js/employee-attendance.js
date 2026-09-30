// ============================================================================
// FILE:    employee-attendance.js
// MODULE:  Employee/Staff Attendance
// PURPOSE: Enhanced Manual Attendance marking for Teachers & Staff.
//          Queries Supabase database and falls back to localStorage.
// ============================================================================

window.employeeAttendance = {
  employees: [],
  currentSheetEmployees: [],

  init: function() {
    console.log('[EMPLOYEE-ATTENDANCE] Initializing...');

    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const markDate = document.getElementById('employee-att-date-input');
    if (markDate) markDate.value = today;

    const dailyDate = document.getElementById('employee-report-daily-date');
    if (dailyDate) dailyDate.value = today;

    const summaryStart = document.getElementById('employee-report-summary-start-date');
    if (summaryStart) summaryStart.value = firstDayOfMonth;

    const summaryEnd = document.getElementById('employee-report-summary-end-date');
    if (summaryEnd) summaryEnd.value = today;

    // Load unique subjects/departments selector options
    this.populateSubjectDropdowns();
  },

  populateSubjectDropdowns: async function() {
    let registry = [];
    
    // Attempt Supabase fetch
    if (window.supabaseDb) {
      try {
        const { data, error } = await window.supabaseDb
          .from('teachers_registry')
          .select('subject, status');
        if (!error && data) registry = data;
      } catch (e) {
        console.warn("[EMPLOYEE-ATTENDANCE] Supabase registry load error:", e);
      }
    }

    // Local registry fallback
    if (!registry || registry.length === 0) {
      try {
        const localRegistry = localStorage.getItem('teachers_registry');
        if (localRegistry) {
          registry = JSON.parse(localRegistry);
        }
      } catch (e) {
        console.error("[EMPLOYEE-ATTENDANCE] Fallback registry fetch failed:", e);
      }
    }

    // Find unique subjects
    const uniqueSubjects = new Set();
    registry.forEach(r => {
      if (r.subject) {
        // Handle comma-separated lists of subjects
        const list = r.subject.split(',').map(s => s.trim());
        list.forEach(subj => {
          if (subj) uniqueSubjects.add(subj);
        });
      }
    });

    const activeSubjects = Array.from(uniqueSubjects).sort();

    const selectIds = ['employee-att-subject-select', 'employee-report-daily-subject', 'employee-report-summary-subject'];
    selectIds.forEach(id => {
      const select = document.getElementById(id);
      if (select) {
        select.innerHTML = '<option value="">-- All Subjects/Staff --</option>';
        activeSubjects.forEach(subj => {
          const opt = document.createElement('option');
          opt.value = subj;
          opt.textContent = subj;
          select.appendChild(opt);
        });
      }
    });
  },

  loadEmployeeAttendanceSheet: async function() {
    const selectedSubject = document.getElementById('employee-att-subject-select').value;
    const selectedDate = document.getElementById('employee-att-date-input').value;
    const sheetPanel = document.getElementById('employee-attendance-sheet-panel');
    const tbody = document.getElementById('employee-attendance-tbody');

    if (!selectedDate) {
      alert("Please select Date first.");
      return;
    }

    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 2.5rem; color: var(--text-muted); font-weight: 600;">Loading employee registry...</td></tr>`;
    sheetPanel.style.display = 'block';

    // 1. Fetch employees
    let employees = [];
    if (window.supabaseDb) {
      try {
        const { data, error } = await window.supabaseDb
          .from('teachers_registry')
          .select('*')
          .order('name', { ascending: true });
        if (!error && data) employees = data;
      } catch (e) {
        console.warn("Supabase teachers registry query failed:", e);
      }
    }

    // Fallback to localStorage
    if (employees.length === 0) {
      try {
        const localVal = localStorage.getItem('teachers_registry');
        if (localVal) {
          employees = JSON.parse(localVal).sort((a, b) => a.name.localeCompare(b.name));
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Filter by subject if specified
    if (selectedSubject) {
      employees = employees.filter(emp => emp.subject && emp.subject.includes(selectedSubject));
    }

    if (employees.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 3rem; color: var(--text-muted); font-weight: 600;">No active staff found ${selectedSubject ? 'for subject ' + selectedSubject : ''}.</td></tr>`;
      document.getElementById('employee-marking-stats-badge').textContent = 'Present: 0/0';
      return;
    }

    this.currentSheetEmployees = employees;

    // 2. Fetch existing daily logs from Supabase
    let existingLogs = [];
    if (window.supabaseDb) {
      try {
        const { data, error } = await window.supabaseDb
          .from('employee_attendance')
          .select('*')
          .eq('attendance_date', selectedDate);
        if (!error && data) existingLogs = data;
      } catch (e) {
        console.warn("Supabase employee_attendance load failed:", e);
      }
    }

    // Fallback existing logs from localStorage
    if (existingLogs.length === 0) {
      try {
        const localLogs = localStorage.getItem('local_employee_attendance');
        if (localLogs) {
          const allLogs = JSON.parse(localLogs);
          existingLogs = allLogs.filter(log => log.attendance_date === selectedDate);
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Render list
    tbody.innerHTML = '';
    document.getElementById('employee-attendance-search').value = '';
    document.getElementById('employee-mark-all-present-checkbox').checked = false;

    employees.forEach(emp => {
      const match = existingLogs.find(log => log.employee_code === emp.code);
      // Default to true (present) if no record exists yet
      const isPresent = match ? (match.status === 'present') : true;
      const remarks = match ? (match.remarks || '') : '';

      const tr = document.createElement('tr');
      tr.id = `emp-att-row-${emp.code.replace(/[^a-zA-Z0-9]/g, '-')}`;
      tr.className = 'emp-att-row';
      tr.setAttribute('data-name', emp.name.toLowerCase());
      tr.setAttribute('data-code', emp.code.toLowerCase());

      tr.innerHTML = `
        <td style="font-weight: 700; color: var(--primary);">${emp.code}</td>
        <td>
          <div style="font-weight: 600; color: var(--text-main); font-size: 0.95rem;">${emp.name}</div>
          <small style="color: var(--text-muted)">Subject: ${emp.subject || '-'}</small>
        </td>
        <td style="text-align: center; vertical-align: middle;">
          <div class="att-switch-container">
            <span id="emp-status-label-${emp.code.replace(/[^a-zA-Z0-9]/g, '-')}" class="att-status-badge ${isPresent ? 'att-badge-present' : 'att-badge-absent'}">
              ${isPresent ? 'Present' : 'Absent'}
            </span>
            <label class="att-switch">
              <input type="checkbox" class="emp-att-present-check" onchange="window.employeeAttendance.handleToggleChange(this, '${emp.code}')" ${isPresent ? 'checked' : ''}>
              <span class="att-slider"></span>
            </label>
          </div>
        </td>
        <td>
          <input type="text" class="form-control emp-att-remarks-input" placeholder="Optional remarks or leave reason..." value="${remarks}" style="width: 100%; padding: 0.45rem 0.8rem; font-size: 0.9rem; margin: 0; border-radius: 8px; border: 1px solid #cbd5e1; outline: none;">
        </td>
      `;
      tbody.appendChild(tr);
    });

    document.getElementById('employee-attendance-sheet-title').textContent = `Employee Registry: ${selectedSubject || 'All Staff'} (${selectedDate})`;
    this.updateMarkingStats();
  },

  handleToggleChange: function(chk, code) {
    const safeId = code.replace(/[^a-zA-Z0-9]/g, '-');
    const label = document.getElementById(`emp-status-label-${safeId}`);
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
    const rows = document.querySelectorAll('#employee-attendance-tbody tr.emp-att-row');
    let total = 0;
    let present = 0;

    rows.forEach(row => {
      if (row.style.display !== 'none') {
        total++;
        const chk = row.querySelector('.emp-att-present-check');
        if (chk && chk.checked) present++;
      }
    });

    const badge = document.getElementById('employee-marking-stats-badge');
    if (badge) {
      badge.textContent = `Present: ${present}/${total}`;
    }
  },

  filterMarkingList: function() {
    const searchVal = document.getElementById('employee-attendance-search').value.toLowerCase().trim();
    const rows = document.querySelectorAll('#employee-attendance-tbody tr.emp-att-row');

    rows.forEach(row => {
      const name = row.getAttribute('data-name');
      const code = row.getAttribute('data-code');
      if (name.includes(searchVal) || code.includes(searchVal)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });

    this.updateMarkingStats();
  },

  toggleAllPresent: function(masterCheckbox) {
    const isChecked = masterCheckbox.checked;
    const checkboxes = document.querySelectorAll('#employee-attendance-tbody .emp-att-present-check');
    checkboxes.forEach(chk => {
      const row = chk.closest('tr');
      if (row && row.style.display !== 'none') {
        chk.checked = isChecked;
        // Update label
        const code = row.getAttribute('data-code');
        const safeId = code.toUpperCase().replace(/[^a-zA-Z0-9]/g, '-');
        const label = document.getElementById(`emp-status-label-${safeId}`);
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

  saveEmployeeAttendanceSheet: async function() {
    const selectedDate = document.getElementById('employee-att-date-input').value;
    const tbody = document.getElementById('employee-attendance-tbody');

    if (!selectedDate || !this.currentSheetEmployees.length) return;

    const records = [];
    const rows = tbody.querySelectorAll('tr.emp-att-row');

    rows.forEach(row => {
      const code = row.querySelector('td:nth-child(1)').textContent.trim();
      const name = row.querySelector('td:nth-child(2) div').textContent.trim();
      const isPresent = row.querySelector('.emp-att-present-check').checked;
      const remarks = row.querySelector('.emp-att-remarks-input').value.trim();

      records.push({
        employee_code: code,
        employee_name: name,
        attendance_date: selectedDate,
        status: isPresent ? 'present' : 'absent',
        remarks: remarks || null
      });
    });

    let saveSuccess = false;

    // 1. Save to Supabase employee_attendance table
    if (window.supabaseDb) {
      try {
        const { error } = await window.supabaseDb
          .from('employee_attendance')
          .upsert(records, { onConflict: 'employee_code,attendance_date' });

        if (!error) {
          saveSuccess = true;
          console.log("[EMPLOYEE-ATTENDANCE] Daily logs saved successfully in Supabase.");
        } else {
          console.error("[EMPLOYEE-ATTENDANCE] Supabase Upsert error:", error);
        }
      } catch (e) {
        console.error("[EMPLOYEE-ATTENDANCE] Supabase write exception:", e);
      }
    }

    // 2. Offline Fallback & Backup Sync in LocalStorage
    try {
      const localVal = localStorage.getItem('local_employee_attendance');
      let allLogs = localVal ? JSON.parse(localVal) : [];

      // Clear existing records matching selected date & codes to prevent duplicates
      const targetCodes = records.map(r => r.employee_code);
      allLogs = allLogs.filter(log => !(log.attendance_date === selectedDate && targetCodes.includes(log.employee_code)));
      
      // Add new records
      allLogs.push(...records);
      localStorage.setItem('local_employee_attendance', JSON.stringify(allLogs));
      
      if (!saveSuccess) {
        alert("Attendance saved to browser local storage. (Supabase cloud was offline/unconfigured).");
      } else {
        alert("Employee attendance records saved successfully to Supabase database & synced locally!");
      }
    } catch (e) {
      console.error("[EMPLOYEE-ATTENDANCE] Local storage write error:", e);
      alert("Error saving record. Check console for details.");
    }
  },

  loadDailyReport: async function() {
    const selectedSubject = document.getElementById('employee-report-daily-subject').value;
    const selectedDate = document.getElementById('employee-report-daily-date').value;
    const panel = document.getElementById('employee-daily-report-panel');
    const tbody = document.getElementById('employee-daily-report-tbody');
    const badge = document.getElementById('employee-daily-report-stats-badge');
    const title = document.getElementById('employee-daily-report-title');

    if (!selectedDate) {
      alert("Please select Date.");
      return;
    }

    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 2rem; color: var(--text-muted); font-weight: 600;">Querying logs...</td></tr>`;
    panel.style.display = 'block';

    let records = [];

    // Query database
    if (window.supabaseDb) {
      try {
        const { data, error } = await window.supabaseDb
          .from('employee_attendance')
          .select('*')
          .eq('attendance_date', selectedDate)
          .order('employee_name', { ascending: true });
        if (!error && data) records = data;
      } catch (e) {
        console.warn("[EMPLOYEE-ATTENDANCE] Supabase query failed, falling back to local:", e);
      }
    }

    // Fallback to local storage logs
    if (records.length === 0) {
      try {
        const localVal = localStorage.getItem('local_employee_attendance');
        if (localVal) {
          const allLogs = JSON.parse(localVal);
          records = allLogs
            .filter(log => log.attendance_date === selectedDate)
            .sort((a, b) => a.employee_name.localeCompare(b.employee_name));
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Filter by subject dynamically from teachers_registry mapping
    if (selectedSubject) {
      // Load teachers list to match code
      let staffList = [];
      try {
        const localT = localStorage.getItem('teachers_registry');
        if (localT) staffList = JSON.parse(localT);
      } catch(e){}

      records = records.filter(r => {
        const staff = staffList.find(s => s.code === r.employee_code);
        return staff && staff.subject && staff.subject.includes(selectedSubject);
      });
    }

    tbody.innerHTML = '';
    title.textContent = `Daily Logs: ${selectedSubject || 'All Staff'} (${selectedDate})`;

    if (records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 2.5rem; color: var(--text-muted); font-weight: 600;">No employee attendance record logs found for this day.</td></tr>`;
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
        <td><strong>${r.employee_code}</strong></td>
        <td>${r.employee_name}</td>
        <td>${statusBadge}</td>
        <td><em style="color: var(--text-muted); font-size: 0.85rem;">${r.remarks || '-'}</em></td>
      `;
      tbody.appendChild(tr);
    });

    const rate = ((present / records.length) * 100).toFixed(1);
    badge.textContent = `Present: ${present} | Absent: ${absent} | Attendance Rate: ${rate}%`;
  },

  loadSummaryReport: async function() {
    const selectedSubject = document.getElementById('employee-report-summary-subject').value;
    const startDate = document.getElementById('employee-report-summary-start-date').value;
    const endDate = document.getElementById('employee-report-summary-end-date').value;
    const panel = document.getElementById('employee-summary-report-panel');
    const tbody = document.getElementById('employee-summary-report-tbody');

    if (!startDate || !endDate) {
      alert("Please specify Start Date and End Date.");
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
          .from('employee_attendance')
          .select('*')
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
        const localVal = localStorage.getItem('local_employee_attendance');
        if (localVal) {
          const allLogs = JSON.parse(localVal);
          records = allLogs.filter(log => 
            log.attendance_date >= startDate && 
            log.attendance_date <= endDate
          );
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Load subject list maps to filter records
    let staffList = [];
    try {
      const localT = localStorage.getItem('teachers_registry');
      if (localT) staffList = JSON.parse(localT);
    } catch(e){}

    if (selectedSubject) {
      records = records.filter(r => {
        const staff = staffList.find(s => s.code === r.employee_code);
        return staff && staff.subject && staff.subject.includes(selectedSubject);
      });
    }

    tbody.innerHTML = '';

    if (records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2.5rem; color: var(--text-muted); font-weight: 600;">No attendance records found within the date range.</td></tr>`;
      document.getElementById('employee-card-avg-attendance-rate').textContent = '0.0%';
      document.getElementById('employee-card-best-attendance').textContent = 'N/A';
      document.getElementById('employee-card-lowest-attendance').textContent = 'N/A';
      return;
    }

    // Map aggregates
    const summary = {};
    records.forEach(r => {
      const code = r.employee_code;
      if (!summary[code]) {
        summary[code] = { name: r.employee_name, present: 0, absent: 0, total: 0 };
      }
      summary[code].total++;
      if (r.status === 'present') {
        summary[code].present++;
      } else {
        summary[code].absent++;
      }
    });

    const summaryArray = Object.keys(summary).map(code => ({
      code: code,
      name: summary[code].name,
      present: summary[code].present,
      absent: summary[code].absent,
      total: summary[code].total,
      rate: (summary[code].present / summary[code].total) * 100
    })).sort((a, b) => a.name.localeCompare(b.name));

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
        <td><strong>${s.code}</strong></td>
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
    document.getElementById('employee-card-avg-attendance-rate').textContent = `${averageRate}%`;
    document.getElementById('employee-card-best-attendance').textContent = best ? `${best.name} (${best.rate.toFixed(0)}%)` : 'N/A';
    document.getElementById('employee-card-lowest-attendance').textContent = worst ? `${worst.name} (${worst.rate.toFixed(0)}%)` : 'N/A';
  }
};

// Global tab switcher helper functions for employees
window.switchEmployeeAttTab = function(tab) {
  const markBtn = document.getElementById('btn-employee-att-mark-tab');
  const reportsBtn = document.getElementById('btn-employee-att-reports-tab');
  const markSection = document.getElementById('section-employee-att-mark');
  const reportsSection = document.getElementById('section-employee-att-reports');

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

    window.employeeAttendance.populateSubjectDropdowns();
  }
};

window.switchEmployeeReportsSubTab = function(subTab) {
  const dailyBtn = document.getElementById('btn-employee-report-daily-tab');
  const summaryBtn = document.getElementById('btn-employee-report-summary-tab');
  const dailyView = document.getElementById('subview-employee-report-daily');
  const summaryView = document.getElementById('subview-employee-report-summary');

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
function initEmployeeAttendanceSystem() {
  window.employeeAttendance.init();
  
  const page = document.getElementById('page-employee-manual-attendance');
  if (page) {
    employeeAttObserver.observe(page, { attributes: true });
  }
}

// Observe page class changes to re-init dynamically when accessed
const employeeAttObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
      const target = mutation.target;
      if (target.id === 'page-employee-manual-attendance' && target.classList.contains('active')) {
        window.employeeAttendance.init();
      }
    }
  });
});

// Initialize on DOM ready or immediately if already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(initEmployeeAttendanceSystem, 100);
} else {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initEmployeeAttendanceSystem, 100);
  });
}

