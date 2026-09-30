const fs = require('fs');
const path = 'c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/html/admin-portal.html';
let txt = fs.readFileSync(path, 'utf8');

// 1. Inject Navigation Link
const navTarget = '<a href="#" class="submenu-link" data-page="biometric-attendance" onclick="switchPage(\'biometric-attendance\', this)">Student Biometric Attend.</a>';
const navInject = `
          <a href="#" class="submenu-link" data-page="manual-attendance" onclick="switchPage('manual-attendance', this)">Manual Attendance</a>`;

if (!txt.includes('data-page="manual-attendance"')) {
    txt = txt.replace(navTarget, navTarget + navInject);
    console.log("Injected Nav link.");
} else {
    console.log("Nav link already present.");
}

// 2. Inject Page View
const pageInject = `
      <!-- ================= PAGE: MANUAL ATTENDANCE ================= -->
      <div class="page-view" id="page-manual-attendance">
        <div class="panel">
          <div class="panel-header" style="flex-direction: column; align-items: flex-start; gap: 1rem;">
            <h3>Manual Attendance Management</h3>
            <p class="text-muted">Record and view daily attendance for Students and Employees.</p>
          </div>
          <div class="panel-body">
            
            <!-- Controls -->
            <div style="display: flex; gap: 1rem; align-items: flex-end; margin-bottom: 2rem; flex-wrap: wrap;">
              <div class="form-group" style="margin-bottom: 0;">
                <label>Date</label>
                <input type="date" id="manual-att-date" class="form-control" style="width: 200px;">
              </div>
              
              <div class="form-group" style="margin-bottom: 0;">
                <label>Target Group</label>
                <select id="manual-att-group" class="form-control" style="width: 200px;">
                  <option value="students">Students</option>
                  <option value="employees">Employees</option>
                </select>
              </div>

              <div class="form-group" style="margin-bottom: 0;" id="manual-att-class-container">
                <label>Class</label>
                <select id="manual-att-class" class="form-control" style="width: 200px;">
                  <option value="">Select Class...</option>
                </select>
              </div>

              <button class="btn btn-primary" onclick="window.manualAttendance.loadSheet()" style="padding: 0.7rem 1.5rem;">Load Sheet</button>
            </div>

            <!-- Table Container -->
            <div id="manual-att-container">
              <div style="text-align:center; padding: 3rem; background: #f9fafb; border-radius: 12px; border: 1px dashed #cbd5e1;">
                <h4 style="color: var(--text-muted); font-size: 1.1rem;">Select a date and group to load the attendance sheet.</h4>
              </div>
            </div>

            <!-- Action Bar -->
            <div id="manual-att-actions" style="display: none; margin-top: 1.5rem; text-align: right; border-top: 1px solid var(--border-color); padding-top: 1rem;">
              <button class="btn btn-primary" onclick="window.manualAttendance.saveSheet()">Save Attendance</button>
            </div>

          </div>
        </div>
      </div>
`;

if (!txt.includes('id="page-manual-attendance"')) {
    // Find where to inject
    const pageTargetStr = 'id="page-biometric-attendance"';
    const pageStartIndex = txt.indexOf(pageTargetStr);
    if (pageStartIndex !== -1) {
        // Find the end of the biometric-attendance div. It's a `<div class="page-view">...</div>`
        // We'll search for the next `<!-- ================= PAGE:`
        const nextPageIndex = txt.indexOf('<!-- ================= PAGE:', pageStartIndex);
        if (nextPageIndex !== -1) {
            txt = txt.substring(0, nextPageIndex) + pageInject + txt.substring(nextPageIndex);
            console.log("Injected Page View HTML.");
        }
    }
} else {
    console.log("Page View already present.");
}

// 3. Add JS script tag
const scriptInject = `<script src="../js/manual-attendance.js?v=' + Date.now() + '"></script>`;
if (!txt.includes('manual-attendance.js')) {
    const scriptTarget = `<script src="../js/biometric-attendance.js"></script>`;
    if (txt.includes(scriptTarget)) {
       txt = txt.replace(scriptTarget, scriptTarget + '\n    ' + scriptInject);
    } else {
       // fallback, append right before </body>
       txt = txt.replace('</body>', '    ' + scriptInject + '\n</body>');
    }
    console.log("Injected script tag.");
} else {
    console.log("Script tag already present.");
}

fs.writeFileSync(path, txt);
console.log("admin-portal.html updated.");
