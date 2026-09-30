// ============================================================================
// FILE:    biometric-attendance.js
// MODULE:  Attendance
// PURPOSE: Biometric Attendance - Attendance marking, session management, and attendance reports (biometric/manual)
//
// PROJECT: Shree Saraswati Secondary School — Management System
// STACK:   Vanilla JS + Supabase (PostgreSQL) + HTML/CSS
// UPDATED: 2026-06-03
// ============================================================================
/**
 * BIOMETRIC ATTENDANCE DASHBOARD
 * Handles fetching ADMS logs from Supabase and grouping them by Date and Class.
 */

window.bioDashboard = {
  logs: [],
  students: [],
  classes: [],
  selectedDate: '',
  selectedClass: 'ALL',

  init: async function() {
    console.log('[BIO-DASHBOARD] Initializing...');
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('bio-date-filter').value = today;
    this.selectedDate = today;

    // Load static classes for filter (Extract unique classes from registry)
    await this.fetchStudents();
    this.populateClassFilter();

    // Load initial data
    await this.loadData();
  },

  fetchStudents: async function() {
    try {
      if (typeof supabaseDb === 'undefined' || !supabaseDb) {
        // Fallback to local storage
        const local = localStorage.getItem('students_registry');
        if (local) this.students = JSON.parse(local);
      } else {
        const { data, error } = await supabaseDb.from('students_registry').select('*');
        if (!error && data) {
          this.students = data;
        }
      }

      // Extract unique classes
      const classSet = new Set();
      this.students.forEach(s => {
        if (s.class) classSet.add(s.class);
      });
      this.classes = Array.from(classSet).sort();
    } catch (e) {
      console.error('[BIO-DASHBOARD] Error fetching students:', e);
    }
  },

  populateClassFilter: function() {
    const filter = document.getElementById('bio-class-filter');
    filter.innerHTML = '<option value="ALL">All Classes</option>';
    this.classes.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      filter.appendChild(opt);
    });
  },

  loadData: async function() {
    this.selectedDate = document.getElementById('bio-date-filter').value;
    this.selectedClass = document.getElementById('bio-class-filter').value;

    if (!this.selectedDate) return;

    try {
      if (typeof supabaseDb === 'undefined' || !supabaseDb) {
        document.getElementById('bio-data-container').innerHTML = `<p style="color:red;">Database connection error.</p>`;
        return;
      }

      // Fetch logs for the selected date
      // ADMS logs date format usually 'YYYY-MM-DD HH:MM:SS'
      const startOfDay = `${this.selectedDate} 00:00:00`;
      const endOfDay = `${this.selectedDate} 23:59:59`;

      const { data, error } = await supabaseDb
        .from('attendance_logs')
        .select('*')
        .gte('verify_time', startOfDay)
        .lte('verify_time', endOfDay)
        .order('verify_time', { ascending: false });

      if (error) {
        console.error('[BIO-DASHBOARD] Error fetching logs:', error);
        document.getElementById('bio-data-container').innerHTML = `<p style="color:red;">Error fetching data: ${error.message}</p>`;
        return;
      }

      this.logs = data || [];
      this.renderDashboard();

    } catch (e) {
      console.error('[BIO-DASHBOARD] Exception loading data:', e);
    }
  },

  getStudentDetails: function(userId) {
    // Attempt to match userId (Biometric ID) with student roll
    // Convert to number for comparison if both are numeric
    const student = this.students.find(s => String(s.roll) === String(userId));
    if (student) {
      return { name: student.name, class: student.class };
    }
    return { name: `Unknown ID: ${userId}`, class: 'Unassigned' };
  },

  getVerifyMethod: function(typeCode) {
    // Standard ZKTeco verify types
    const types = {
      '0': 'Password',
      '1': 'Fingerprint',
      '2': 'Card',
      '15': 'Face Recognition',
      '20': 'Face Recognition'
    };
    return types[String(typeCode)] || `Method: ${typeCode || 'Unknown'}`;
  },

  getStatusBadge: function(stateCode) {
    // 0 = Check In, 1 = Check Out, etc.
    const stateStr = String(stateCode);
    if (stateStr === '0') return '<span class="status-badge approved">Check In</span>';
    if (stateStr === '1') return '<span class="status-badge pending">Check Out</span>';
    return '<span class="status-badge" style="background:#e5e7eb;color:#374151">Log</span>';
  },

  renderDashboard: function() {
    const container = document.getElementById('bio-data-container');
    container.innerHTML = '';

    if (this.logs.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding: 3rem; background: #f9fafb; border-radius: 12px; border: 1px dashed #cbd5e1;">
        <h4 style="color: var(--text-muted); font-size: 1.1rem;">No biometric attendance recorded for this date.</h4>
      </div>`;
      document.getElementById('bio-total-scans').textContent = '0';
      document.getElementById('bio-present-students').textContent = '0';
      return;
    }

    // Process and Group Data by Class
    const groupedData = {};
    let totalScans = 0;
    const uniqueStudents = new Set();

    this.logs.forEach(log => {
      const studentInfo = this.getStudentDetails(log.user_id);
      
      // Apply class filter
      if (this.selectedClass !== 'ALL' && studentInfo.class !== this.selectedClass) {
        return;
      }

      totalScans++;
      uniqueStudents.add(log.user_id);

      const cls = studentInfo.class;
      if (!groupedData[cls]) groupedData[cls] = [];
      
      groupedData[cls].push({
        ...log,
        studentName: studentInfo.name
      });
    });

    document.getElementById('bio-total-scans').textContent = totalScans;
    document.getElementById('bio-present-students').textContent = uniqueStudents.size;

    if (Object.keys(groupedData).length === 0) {
      container.innerHTML = `<div style="text-align:center; padding: 2rem;"><p>No records found for the selected class filter.</p></div>`;
      return;
    }

    // Render tables per class
    for (const [className, logs] of Object.entries(groupedData).sort()) {
      const classSection = document.createElement('div');
      classSection.style.marginBottom = '2rem';
      
      const header = document.createElement('h4');
      header.textContent = className;
      header.style.color = 'var(--primary)';
      header.style.borderBottom = '2px solid var(--accent)';
      header.style.paddingBottom = '0.5rem';
      header.style.marginBottom = '1rem';
      
      let tableHTML = `
        <div class="custom-table-wrapper">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Biometric ID</th>
                <th>Scan Time</th>
                <th>Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
      `;

      logs.forEach(log => {
        // Parse time nicely
        let timeStr = log.verify_time;
        if (timeStr && timeStr.includes('T')) {
          timeStr = new Date(log.verify_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
        } else if (timeStr && timeStr.includes(' ')) {
          timeStr = timeStr.split(' ')[1]; // Extract just time part if it's 'YYYY-MM-DD HH:MM:SS'
        }

        tableHTML += `
          <tr>
            <td><strong>${log.studentName}</strong></td>
            <td style="color: var(--text-muted)">${log.user_id}</td>
            <td style="font-family: monospace; font-size: 1.05rem;">${timeStr}</td>
            <td>${this.getVerifyMethod(log.verify_type)}</td>
            <td>${this.getStatusBadge(log.verify_state)}</td>
          </tr>
        `;
      });

      tableHTML += `</tbody></table></div>`;
      classSection.appendChild(header);
      classSection.insertAdjacentHTML('beforeend', tableHTML);
      container.appendChild(classSection);
    }
  }
};

// Hook into the page load / switchPage system
document.addEventListener('DOMContentLoaded', () => {
  // Override the switchPage function call if needed, or just let the main switchPage handle the display
  // We'll initialize our module once.
  
  // Wait a bit for Supabase to be ready
  setTimeout(() => {
    window.bioDashboard.init();
  }, 1500);
});

// Create a mutation observer to detect when the #biometric-attendance tab becomes active
// to refresh data automatically.
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
      const target = mutation.target;
      if (target.id === 'page-biometric-attendance' && target.classList.contains('active')) {
        // Page was just shown, refresh data
        window.bioDashboard.loadData();
      }
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const bioPage = document.getElementById('page-biometric-attendance');
  if (bioPage) {
    observer.observe(bioPage, { attributes: true });
  }
});
