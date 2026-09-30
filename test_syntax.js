    // ── MASTER DATABASE SEED ROUTINE (LOCALSTORAGE SHARED LEDGERS) ──
    function initializeSharedDatabase() {
      if (!localStorage.getItem('students_registry')) {
        localStorage.setItem('students_registry', JSON.stringify([
          { roll: 12, name: "Anil Gurung", class: "Grade 10 - A", attendance: "96.4%", overallGPA: "3.80", status: "Active" },
          { roll: 15, name: "Rohan Adhikari", class: "Grade 10 - A", attendance: "88.2%", overallGPA: "3.55", status: "Active" },
          { roll: 18, name: "Bipana Thapa", class: "Grade 10 - A", attendance: "91.8%", overallGPA: "3.90", status: "Active" }
        ]));
      }

      if (!localStorage.getItem('teachers_registry')) {
        localStorage.setItem('teachers_registry', JSON.stringify([
          { code: "TCH-2080-04", name: "Prof. Ramesh Bhandari", subject: "Mathematics", sections: "Grade 10 Science, Grade 9 OPT Math", status: "Active" },
          { code: "TCH-2080-09", name: "Dr. Sita Sharma", subject: "Science & Physics", sections: "Grade 10 Science", status: "Active" }
        ]));
      }

      if (!localStorage.getItem('fee_payments')) {
        localStorage.setItem('fee_payments', JSON.stringify([
          { id: 1, name: "Anil Gurung", roll: 12, category: "Second Installment Dues (Rs. 5,000)", txnId: "TXN-984710293", proofFile: "rbb_receipt_9847.png", status: "pending", submittedTime: "15 mins ago" }
        ]));
      }

      // Initialize Fee Categories
      if (!localStorage.getItem('fee_categories')) {
        localStorage.setItem('fee_categories', JSON.stringify([
          { id: 1, name: "Tuition Fee", description: "Monthly tuition charges", frequency: "Monthly", applicableTo: "All" },
          { id: 2, name: "Lab Fee", description: "Science and computer lab charges", frequency: "Quarterly", applicableTo: "Grade 9-12" },
          { id: 3, name: "Transport Fee", description: "Student transport charges", frequency: "Monthly", applicableTo: "All" },
          { id: 4, name: "Admission Fee", description: "One-time admission charges", frequency: "One-Time", applicableTo: "All" }
        ]));
      }

      // Initialize Student Fees (individual student fees)
      if (!localStorage.getItem('student_fees')) {
        localStorage.setItem('student_fees', JSON.stringify([
          { id: 1, studentRoll: 1, studentName: "Aarati Dhakal", studentClass: "Grade 11 - Technical", categoryId: 1, amount: 5000, dueDate: "2026-06-15", description: "Mangsir term tuition", installment: 1, status: "cleared", paidAmount: 5000, paidDate: "2026-06-10" },
          { id: 2, studentRoll: 2, studentName: "Kunjan Bhandari", studentClass: "Grade 11 - Technical", categoryId: 1, amount: 5000, dueDate: "2026-06-15", description: "Mangsir term tuition", installment: 1, status: "pending", paidAmount: 0, paidDate: null }
        ]));
      }

      if (!localStorage.getItem('student_leaves')) {
        localStorage.setItem('student_leaves', JSON.stringify([
          { id: 1, name: "Anil Gurung", type: "Family Function", range: "2026-11-20 to 2026-11-21", desc: "Attending sister's wedding ritual in Pokhara.", proofFile: "wedding_card.jpg", emoji: "💌", status: "pending" }
        ]));
      }

      if (!localStorage.getItem('school_timetables')) {
        localStorage.setItem('school_timetables', JSON.stringify([
          { id: 1, time: "10:00 AM", subject: "Advanced Mathematics", details: "Room 302 • Mr. D. Bhandari", section: "Grade 10 - A" },
          { id: 2, time: "11:30 AM", subject: "Computer Network Labs", details: "ICT Lab 1 • Er. S. Bhandari", section: "Grade 10 - A" },
          { id: 3, time: "02:00 PM", subject: "Physics Theory", details: "Room 305 • Ms. R. Thapa", section: "Grade 10 - A" }
        ]));
      }

      if (!localStorage.getItem('school_announcements')) {
        localStorage.setItem('school_announcements', JSON.stringify([
          { date: "19 MAY 2026", title: "First Term Examination Timetables Commencing", category: "Academic", desc: "Examination timelines published commencing Shrawan 15. Question sets due by Sunday." },
          { date: "15 MAY 2026", title: "Staff Meeting & Curriculum Briefing Today", category: "General", desc: "Urgent briefing with the Principal in the lounge today at 3:30 PM." }
        ]));
      }
    }

    // ── SWITCH PAGES ──
    function switchPage(pageId, element) {
      // Close sidebar on mobile
      if (window.innerWidth <= 768) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.remove('mobile-open');
      }
      
      document.querySelectorAll('.nav-link, .submenu-link').forEach(link => link.classList.remove('active'));
      if (element) {
        element.classList.add('active');
      } else if (currentGenericModule === 'Academic_Categories' && supabaseDb) {
        try {
          const { data: catData, error } = await supabaseDb.from('categories').select('*').order('created_at', { ascending: false });
          if (!error && catData) {
            data = catData.map(c => ({ id: c.id, f1: c.category_name, f2: c.category_type, f3: c.description, f4: c.status }));
          }
        } catch(err) { console.error(err); data = []; }
      } else if (currentGenericModule === 'Academic_AddEmployee' && supabaseDb) {
        try {
          const { data: empData, error } = await supabaseDb.from('employees').select('*').order('created_at', { ascending: false });
          if (!error && empData) {
            data = empData.map(e => ({ id: e.id, f1: e.name, f3: e.role, f4: e.phone, f2: e.employee_type, f5: e.status }));
          }
        } catch(err) { console.error(err); data = []; }
      } else if (currentGenericModule === 'Academic_Report' && supabaseDb) {
        try {
          const { data: repData, error } = await supabaseDb.from('reports').select('*').order('created_at', { ascending: false });
          if (!error && repData) {
            data = repData.map(r => ({ id: r.id, f1: r.report_title, f2: r.module_area, f3: r.generated_by, f4: r.status, f5: r.file_url }));
          }
        } catch(err) { console.error(err); data = []; }
      } else if (currentGenericModule === 'Academic_TeacherProfiles' && supabaseDb) {
        try {
          const { data: tData, error } = await supabaseDb.from('teacher_profiles').select('*').order('id', { ascending: false });
          if (!error && tData) {
            data = tData.map(t => ({ id: t.id, f1: t.teacher_name, f2: t.teacher_role, f3: t.teacher_email, f4: t.teacher_phone, f5: t.teacher_description, f6: t.teacher_image_url, f7: t.is_active ? 'Active' : 'Inactive' }));
          }
        } catch(err) { console.error(err); data = []; }
      } else {
        // Fallback to localStorage
        const activeLink = document.querySelector(`[data-page="${pageId}"]`);
        if (activeLink) activeLink.classList.add('active');
      }

      // Route all coming-soon links inside submenus to the generic CRUD engine dynamically
      if (pageId === 'coming-soon' && element && element.classList.contains('submenu-link')) {
        const moduleName = element.textContent.trim();
        const parentCategory = element.closest('.nav-item').querySelector('.nav-link').textContent.trim();
        setupGenericModule(moduleName, parentCategory);
        pageId = 'generic-crud';
      }

      // Handle direct module IDs like Academic_ClassSetup
      if (pageId in moduleSchemas) {
        currentGenericModule = pageId;
        currentSchema = moduleSchemas[pageId];
        
        const parts = pageId.split('_');
        const category = parts[0];
        const moduleName = parts[1];
        
        document.getElementById('generic-module-title').textContent = `${category} - ${moduleName} Control`;
        document.getElementById('generic-form-title').textContent = `Add New ${moduleName} Entry`;
        
        // Build Form HTML
        const formContainer = document.getElementById('generic-form-fields');
        let formHTML = '';
        currentSchema.fields.forEach(field => {
          const isRequired = field.required !== false; // Default to required=true unless explicitly set to false
          formHTML += `<div class="form-group"><label for="dyn-${field.id}">${field.label}${isRequired ? ' <span style="color:var(--danger); font-weight:bold;">*</span>' : ''}</label>`;
          if (field.type === 'select') {
            let options = field.options;
            if (field.id === 'f5' && currentGenericModule === 'Academic_SubjectSetup') {
              options = getSubjectCategories();
            }
            formHTML += `<select id="dyn-${field.id}" class="form-control"${isRequired ? ' required' : ''}>`;
            formHTML += `<option value="">-- Select ${field.label} --</option>`;
            options.forEach(opt => formHTML += `<option value="${opt}">${opt}</option>`);
            formHTML += `</select>`;
          } else if (field.type === 'class-dropdown') {
            formHTML += `<select id="dyn-${field.id}" class="form-control"${isRequired ? ' required' : ''}><option value="">Select a class...</option></select>`;
          } else if (field.type === 'subject-dropdown') {
            formHTML += `<select id="dyn-${field.id}" class="form-control"${isRequired ? ' required' : ''}><option value="">-- Select Subject --</option></select>`;
          } else if (field.type === 'teacher-dropdown') {
            formHTML += `<select id="dyn-${field.id}" class="form-control"${isRequired ? ' required' : ''}><option value="">-- Select Teacher --</option></select>`;
          } else if (field.type === 'student-dropdown') {
            formHTML += `<select id="dyn-${field.id}" class="form-control"${isRequired ? ' required' : ''}><option value="">-- Select Student --</option></select>`;
          } else {
            formHTML += `<input type="${field.type}" id="dyn-${field.id}" class="form-control" placeholder="${field.placeholder}"${isRequired ? ' required' : ''}>`;
          }
          formHTML += `</div>`;
        });
        formContainer.innerHTML = formHTML;

        // Populate dropdown fields
        currentSchema.fields.forEach(field => {
          if (field.type === 'class-dropdown' && window.classHandler) {
            setTimeout(() => {
              window.classHandler.populateClassDropdown(`dyn-${field.id}`).catch(e => console.error("Error populating class dropdown:", e));
            }, 300);
          } else if (field.type === 'subject-dropdown' && window.subjectHandler) {
            setTimeout(() => {
              window.subjectHandler.populateSubjectDropdown(`dyn-${field.id}`).catch(e => console.error("Error populating subject dropdown:", e));
            }, 300);
          } else if (field.type === 'teacher-dropdown') {
            setTimeout(() => {
              populateTeacherDropdown(`dyn-${field.id}`).catch(e => console.error("Error populating teacher dropdown:", e));
            }, 300);
          }
        });

        // Handle Student Remarks class change event
        if (currentGenericModule === 'Academic_StudentRemarks') {
          const classDropdown = document.getElementById('dyn-f1');
          const studentDropdown = document.getElementById('dyn-f2');
          if (classDropdown && studentDropdown) {
            classDropdown.addEventListener('change', function() {
              populateStudentsForClass(this.value, 'dyn-f2');
            });
          }
        }

        // Build Table Headers
        const tableHeader = document.getElementById('generic-table-header');
        let thHTML = '';
        currentSchema.headers.forEach(h => thHTML += `<th>${h}</th>`);
        thHTML += `<th>Actions</th>`;
        tableHeader.innerHTML = thHTML;

        renderGenericTable();
        pageId = 'generic-crud';
      }

      document.querySelectorAll('.page-view').forEach(view => view.classList.remove('active'));
      const activeView = document.getElementById('page-' + pageId);
      if (activeView) activeView.classList.add('active');

      // Re-render calendar every time it's visited (so it loads even if it was hidden on init)
      if (pageId === 'custom-calendar') {
        if (typeof renderCalendar === 'function') renderCalendar();
        if (typeof updateCalPublishStatus === 'function') updateCalPublishStatus();
      }
      
      // Re-render CMS controls
      if (pageId === 'website-config') {
        if (typeof renderWebsiteConfig === 'function') renderWebsiteConfig();
      }

      // Load achievements when page is visited
      if (pageId === 'manage-achievements') {
        if (typeof loadAchievements === 'function') loadAchievements();
      }

      // Load About Us when page is visited
      if (pageId === 'manage-about') {
        if (typeof initAboutPage === 'function') initAboutPage();
      }

      if (pageId === 'manage-notices') {
        if (typeof loadNotices === 'function') loadNotices();
      }

      // Load exam results when page is visited
      if (pageId === 'manage-results') {
        if (typeof loadClassesForDropdown === 'function') loadClassesForDropdown();
        if (typeof renderPendingResults === 'function') {
          renderPendingResults().catch(err => console.error('Error rendering results:', err));
        }
        if (typeof updateDebugInfo === 'function') {
          updateDebugInfo().catch(err => console.error('Error updating debug info:', err));
        }
      }

      if (pageId === 'manage-documents') {
        if (typeof loadAdminDocuments === 'function') loadAdminDocuments();
      }

      // Load alumni when page is visited
      if (pageId === 'manage-alumni') {
        if (typeof loadAlumni === 'function') loadAlumni();
      }

      // Load gallery when page is visited
      if (pageId === 'manage-gallery') {
        if (typeof loadGalleryImages === 'function') loadGalleryImages();
      }

      // Load student accounts when page is visited
      if (pageId === 'students') {
        if (typeof loadStudentAccounts === 'function') loadStudentAccounts();
        if (typeof loadClassesForDropdown === 'function') loadClassesForDropdown();
      }

      // Load teacher accounts when page is visited
      if (pageId === 'teachers') {
        if (typeof loadTeacherAccounts === 'function') loadTeacherAccounts();
        setTimeout(populateAllSubjectDropdowns, 100);
      }

      // Load admissions when page is visited
      if (pageId === 'admissions') {
        if (typeof loadAdmissions === 'function') loadAdmissions();
      }

      // Load fee categories
      if (pageId === 'fee-categories') {
        if (typeof loadFeeCategories === 'function') loadFeeCategories();
      }

      // Load manage fees page
      if (pageId === 'manage-fees') {
        if (typeof loadStudentFeesDropdown === 'function') loadStudentFeesDropdown();
        if (typeof loadFeeCategoriesDropdown === 'function') loadFeeCategoriesDropdown();
        if (typeof loadAssignedStudentFees === 'function') loadAssignedStudentFees();
      }

      // Load fee ledger
      if (pageId === 'fee-ledger') {
        if (typeof loadFeeLedger === 'function') loadFeeLedger();
      }

      // Load payment tracking
      if (pageId === 'payment-tracking') {
        if (typeof loadPaymentTracking === 'function') loadPaymentTracking();
      }

      // Load fee reports
      if (pageId === 'fee-reports') {
        if (typeof loadFeeReports === 'function') loadFeeReports();
      }
    }

    function toggleSubmenu(event, element) {
      event.preventDefault();
      
      // Accordion behavior: close others
      document.querySelectorAll('.nav-link.open').forEach(link => {
        if (link !== element) {
          link.classList.remove('open');
          link.nextElementSibling.classList.remove('open');
        }
      });

      element.classList.toggle('open');
      const submenu = element.nextElementSibling;
      if (submenu) {
        submenu.classList.toggle('open');
      }
    }

    // ── RENDER SYSTEM DASHBOARD METRICS ──
    function renderDashboardMetrics() {
      const students = JSON.parse(localStorage.getItem('students_registry') || '[]');
      const teachers = JSON.parse(localStorage.getItem('teachers_registry') || '[]');
      const payments = JSON.parse(localStorage.getItem('fee_payments') || '[]');
      const leaves = JSON.parse(localStorage.getItem('student_leaves') || '[]');
      
      document.getElementById('stat-total-students').textContent = students.length;
      document.getElementById('stat-total-faculty').textContent = teachers.length;
      
      const pendingVerifyCount = payments.filter(p => p.status === 'pending').length;
      document.getElementById('stat-pending-verify').textContent = pendingVerifyCount;
      document.getElementById('badge-fee-verify-count').textContent = pendingVerifyCount;

      const pendingLeavesCount = leaves.filter(l => l.status === 'pending').length;
      document.getElementById('badge-admin-leaves-count').textContent = pendingLeavesCount;

      renderNotifications();
    }

    // ── NOTIFICATION SYSTEM ──
    function toggleNotifications() {
      const dropdown = document.getElementById('notification-dropdown');
      dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }

    function toggleAdminMenu() {
      const menu = document.getElementById('admin-menu');
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
      if (menu.style.display === 'block' && adminUser) {
        document.getElementById('admin-menu-email').textContent = 'Logged in as: ' + adminUser.email;
      }
    }

    // Close admin menu when clicking outside
    document.addEventListener('click', function(event) {
      const menu = document.getElementById('admin-menu');
      const dropdown = document.querySelector('.profile-dropdown');
      if (menu && !dropdown.contains(event.target) && !menu.contains(event.target)) {
        menu.style.display = 'none';
      }
    });

    function renderNotifications() {
      const payments = JSON.parse(localStorage.getItem('fee_payments') || '[]');
      const leaves = JSON.parse(localStorage.getItem('student_leaves') || '[]');
      const list = document.getElementById('notification-list');
      const badge = document.getElementById('nav-notification-badge');
      
      let notifs = [];
      payments.filter(p => p.status === 'pending').forEach(p => {
        notifs.push({ icon: '💰', title: 'Pending Fee Verification', text: `${p.name} submitted ${p.category}`, time: p.submittedTime || 'Recently' });
      });
      leaves.filter(l => l.status === 'pending').forEach(l => {
        notifs.push({ icon: '📝', title: 'New Leave Request', text: `${l.name} requested leave: ${l.type}`, time: 'Recently' });
      });

      badge.textContent = notifs.length;
      badge.style.display = notifs.length > 0 ? 'flex' : 'none';

      list.innerHTML = '';
      if (notifs.length === 0) {
        list.innerHTML = `<div style="padding:1.5rem 1rem; text-align:center; color:var(--text-muted); font-size:0.9rem;">You have no new notifications.</div>`;
      } else {
        notifs.forEach(n => {
          list.innerHTML += `
            <div style="padding:1rem; border-bottom:1px solid #f3f4f6; display:flex; gap:1rem; cursor:pointer;" onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='white'">
              <div style="font-size:1.5rem;">${n.icon}</div>
              <div>
                <div style="font-size:0.85rem; font-weight:700; color:var(--primary);">${n.title}</div>
                <div style="font-size:0.8rem; color:var(--text-muted); margin-top:0.2rem;">${n.text}</div>
                <div style="font-size:0.7rem; color:var(--accent); font-weight:600; margin-top:0.4rem;">${n.time}</div>
              </div>
            </div>
          `;
        });
      }
    }

    // ── GENERIC CRUD ENGINE ──
    const moduleSchemas = {
      // Academic Module
      "Academic_ClassSetup": {
        headers: ["Grade / Class", "Section Name", "Class Teacher", "Status"],
        fields: [
          { id: "f1", label: "Grade Level", type: "text", placeholder: "e.g. Grade 10" },
          { id: "f2", label: "Section Name", type: "text", placeholder: "e.g. Section A", required: false },
          { id: "f3", label: "Assigned Class Teacher", type: "teacher-dropdown", required: false },
          { id: "f4", label: "Status", type: "select", options: ["Active", "Inactive"] }
        ]
      },
      "Academic_Categories": {
        headers: ["Category Name", "Code", "Description", "Status"],
        fields: [
          { id: "f1", label: "Category Name", type: "text", placeholder: "e.g. Primary, Secondary, High School" },
          { id: "f2", label: "Code", type: "text", placeholder: "e.g. SEC-01" },
          { id: "f3", label: "Description", type: "text", placeholder: "e.g. For grades 6 to 10" },
          { id: "f4", label: "Status", type: "select", options: ["Active", "Inactive"] }
        ]
      },
      "Academic_AddStudent": {
        headers: ["Student Name", "Roll No", "Grade / Section", "Status"],
        fields: [
          { id: "f1", label: "Full Name", type: "text", placeholder: "e.g. Hari Bahadur" },
          { id: "f2", label: "Roll Number", type: "number", placeholder: "e.g. 15" },
          { id: "f3", label: "Enrolled Class", type: "class-dropdown", placeholder: "Select class from available classes" },
          { id: "f4", label: "Status", type: "select", options: ["Active", "Suspended"] }
        ]
      },
      "Academic_UpdateStudent": {
        headers: ["Student Roll/ID", "Update Field", "New Value", "Status"],
        fields: [
          { id: "f1", label: "Student Roll/ID", type: "text", placeholder: "e.g. ROLL-204" },
          { id: "f2", label: "Field to Update", type: "select", options: ["Grade Level", "Section", "Contact Number", "Guardian Name", "Status"] },
          { id: "f3", label: "New Value", type: "text", placeholder: "Enter new value..." },
          { id: "f4", label: "Verification Status", type: "select", options: ["Pending Verification", "Approved"] }
        ]
      },
      "Academic_StudentRemarks": {
        headers: ["Class", "Student Name", "Remarks Type", "Remarks Detail", "Status"],
        fields: [
          { id: "f1", label: "Class", type: "class-dropdown", placeholder: "Select class" },
          { id: "f2", label: "Student Name", type: "student-dropdown", placeholder: "Select student" },
          { id: "f3", label: "Remarks Type", type: "select", options: ["Disciplinary Action", "Academic Praise", "Extra-Curricular", "General Comment"] },
          { id: "f4", label: "Remarks Detail", type: "text", placeholder: "e.g. Showed excellent performance in math exam." },
          { id: "f5", label: "Status", type: "select", options: ["Active", "Archived"] }
        ]
      },
      "Academic_AddEmployee": {
        headers: ["Employee Name", "Designation", "Contact No", "Status"],
        fields: [
          { id: "f1", label: "Employee Name", type: "text", placeholder: "e.g. Ramesh Karki" },
          { id: "f2", label: "Employee Type", type: "select", options: ["Internal Staff", "Outer Employee"] },
          { id: "f3", label: "Designation / Role", type: "text", placeholder: "e.g. Science Teacher" },
          { id: "f4", label: "Contact Phone", type: "text", placeholder: "e.g. 9841234567" },
          { id: "f5", label: "Status", type: "select", options: ["Active", "On Leave", "Inactive"] }
        ]
      },
      "Academic_TCCC": {
        headers: ["Student Name", "Certificate Type", "Issue Date", "Status"],
        fields: [
          { id: "f1", label: "Student Name", type: "text", placeholder: "e.g. Gita Adhikari" },
          { id: "f2", label: "Certificate Type", type: "select", options: ["Transfer Certificate (TC)", "Character Certificate (CC)", "Both TC and CC"] },
          { id: "f3", label: "Issue Date", type: "date", placeholder: "" },
          { id: "f4", label: "Status", type: "select", options: ["Issued", "Pending Approval", "Cancelled"] }
        ]
      },
      "Academic_ExtraCertification": {
        headers: ["Student Name", "Certification Title", "Achievements / Remarks", "Status"],
        fields: [
          { id: "f1", label: "Student Name", type: "text", placeholder: "e.g. Sita Thapa" },
          { id: "f2", label: "Certification Title", type: "text", placeholder: "e.g. Inter-School Football Winner" },
          { id: "f3", label: "Achievements / Remarks", type: "text", placeholder: "e.g. Played as goalkeeper, clean sheet." },
          { id: "f4", label: "Status", type: "select", options: ["Active", "Archived"] }
        ]
      },
      "Academic_Report": {
        headers: ["Report Title", "Module/Area", "Generated Date", "Status"],
        fields: [
          { id: "f1", label: "Report Title", type: "text", placeholder: "e.g. Q3 Academic Performance Summary" },
          { id: "f2", label: "Module/Area", type: "select", options: ["Academic", "Finance/Fees", "Staff Records", "Student Attendance", "Library Audit"] },
          { id: "f3", label: "Generated Date", type: "date", placeholder: "" },
          { id: "f4", label: "Report Status", type: "select", options: ["Finalized", "Draft"] }
        ]
      },
      "Academic_SubjectSetup": {
        headers: ["Subject Name", "Subject Code", "Subject Type", "Credit Hour", "Category", "Status"],
        fields: [
          { id: "f1", label: "Subject Name", type: "text", placeholder: "e.g. Compulsory Mathematics" },
          { id: "f2", label: "Subject Code", type: "text", placeholder: "e.g. MATH-10" },
          { id: "f3", label: "Subject Type", type: "select", options: ["Theory Only", "Practical Only", "Both Theory & Practical"] },
          { id: "f6", label: "Credit Hour", type: "number", placeholder: "e.g. 4" },
          { id: "f5", label: "Category", type: "select", options: ["Primary", "Secondary", "High School"] },
          { id: "f4", label: "Status", type: "select", options: ["Active", "Inactive"] }
        ]
      },
      "Academic_ClassTimeTable": {
        headers: ["Class Name", "Subject Name", "Time Slot", "Teacher Name"],
        fields: [
          { id: "f1", label: "Class / Grade", type: "text", placeholder: "e.g. Grade 10 - Section A" },
          { id: "f2", label: "Subject Name", type: "subject-dropdown", placeholder: "Select subject from setup" },
          { id: "f3", label: "Time Slot", type: "text", placeholder: "e.g. 10:15 AM - 11:00 AM" },
          { id: "f4", label: "Assigned Teacher", type: "text", placeholder: "e.g. Mrs. Basnet" }
        ]
      },
      "Academic_LessonPlan": {
        headers: ["Class & Subject", "Topic / Chapter", "Expected Completion Date", "Status"],
        fields: [
          { id: "f1", label: "Class & Subject Name", type: "text", placeholder: "e.g. Grade 9 Science" },
          { id: "f2", label: "Topic / Chapter Details", type: "text", placeholder: "e.g. Chapter 4: Force and Motion" },
          { id: "f3", label: "Expected Completion Date", type: "date", placeholder: "" },
          { id: "f4", label: "Status", type: "select", options: ["In Progress", "Completed", "Pending Start"] }
        ]
      },
      "Academic_UploadPhotosSignature": {
        headers: ["Roll / ID", "Photo File Path", "Signature File Path", "Status"],
        fields: [
          { id: "f1", label: "Student/Employee Roll or ID", type: "text", placeholder: "e.g. ROLL-102 or EMP-401" },
          { id: "f2", label: "Photo File Name / Path", type: "text", placeholder: "e.g. photo_roll102.jpg" },
          { id: "f3", label: "Signature File Name / Path", type: "text", placeholder: "e.g. sig_roll102.png" },
          { id: "f4", label: "Upload Verification", type: "select", options: ["Verified", "Pending Review", "Rejected"] }
        ]
      },
      "Academic_Download": {
        headers: ["File Title", "Category", "Download URL", "Status"],
        fields: [
          { id: "f1", label: "File Title", type: "text", placeholder: "e.g. Grade 10 Board Exam Syllabus" },
          { id: "f2", label: "Category", type: "select", options: ["Syllabus / Curriculum", "Assignment Worksheet", "Lecture Notes", "Official Forms"] },
          { id: "f3", label: "Download URL / File Link", type: "text", placeholder: "e.g. /downloads/syllabus_g10.pdf" },
          { id: "f4", label: "Access Status", type: "select", options: ["Publicly Available", "Restricted to Staff", "Restricted to Students"] }
        ]
      },
      "Academic_Setup": {
        headers: ["Property Key", "Config Value", "Description", "Status"],
        fields: [
          { id: "f1", label: "System Property Key", type: "text", placeholder: "e.g. CURRENT_ACADEMIC_YEAR" },
          { id: "f2", label: "Configuration Value", type: "text", placeholder: "e.g. 2026/2083" },
          { id: "f3", label: "Description", type: "text", placeholder: "e.g. Active academic session code." },
          { id: "f4", label: "Status", type: "select", options: ["Active", "Inactive"] }
        ]
      },
      // Attendance Module
      "Attendance_AddDevice": {
        headers: ["Device Name / Brand", "IP / Serial No", "Location", "Status"],
        fields: [
          { id: "f1", label: "Device Name / Brand", type: "text", placeholder: "e.g. ZKTeco Face Reader" },
          { id: "f2", label: "IP Address / Serial", type: "text", placeholder: "e.g. 192.168.1.150" },
          { id: "f3", label: "Physical Location", type: "text", placeholder: "e.g. Main Reception Gate" },
          { id: "f4", label: "Device Status", type: "select", options: ["Online", "Offline", "Maintenance"] }
        ]
      },
      "Attendance_WorkingShift": {
        headers: ["Shift Name", "Start Time", "End Time", "Grace Period"],
        fields: [
          { id: "f1", label: "Shift Name", type: "text", placeholder: "e.g. Morning Shift" },
          { id: "f2", label: "Shift Start Time", type: "time", placeholder: "" },
          { id: "f3", label: "Shift End Time", type: "time", placeholder: "" },
          { id: "f4", label: "Grace Period", type: "select", options: ["5 Minutes", "10 Minutes", "15 Minutes", "30 Minutes"] }
        ]
      },
      "Attendance_EnrollNumber": {
        headers: ["Staff/Student Name", "Enrollment ID", "RFID Card Number", "Status"],
        fields: [
          { id: "f1", label: "Staff/Student Name", type: "text", placeholder: "e.g. Suman Thapa" },
          { id: "f2", label: "Enrollment ID", type: "text", placeholder: "e.g. ENROLL-8822" },
          { id: "f3", label: "RFID Card Number", type: "text", placeholder: "e.g. RFID-9988-11" },
          { id: "f4", label: "Status", type: "select", options: ["Active / Enrolled", "Suspended"] }
        ]
      },
      "Attendance_AddAttendance": {
        headers: ["Roll / ID", "Attendance Date", "Status", "Verified By"],
        fields: [
          { id: "f1", label: "Roll No / Employee ID", type: "text", placeholder: "e.g. ROLL-15" },
          { id: "f2", label: "Attendance Date", type: "date", placeholder: "" },
          { id: "f3", label: "Attendance Status", type: "select", options: ["Present", "Absent", "Late", "Half-Day"] },
          { id: "f4", label: "Verified By", type: "select", options: ["Class Teacher", "HR Manager", "System Automatic"] }
        ]
      },
      "Attendance_AttendanceRule": {
        headers: ["Rule Title", "Late Action / Fine", "Min Hours Required", "Status"],
        fields: [
          { id: "f1", label: "Rule Title", type: "text", placeholder: "e.g. Late Arrival Policy" },
          { id: "f2", label: "Action on Late Arrival", type: "text", placeholder: "e.g. Rs. 50 Penalty" },
          { id: "f3", label: "Minimum Hours Required", type: "text", placeholder: "e.g. 5 Hours 30 Mins" },
          { id: "f4", label: "Status", type: "select", options: ["Active", "Disabled"] }
        ]
      },
      "Attendance_LeaveType": {
        headers: ["Leave Type Name", "Allocated Days", "Paid / Unpaid", "Status"],
        fields: [
          { id: "f1", label: "Leave Type Name", type: "text", placeholder: "e.g. Sick Leave" },
          { id: "f2", label: "Allocated Annual Days", type: "number", placeholder: "e.g. 12" },
          { id: "f3", label: "Paid / Unpaid Status", type: "select", options: ["Paid Leave", "Unpaid Leave"] },
          { id: "f4", label: "Status", type: "select", options: ["Active", "Inactive"] }
        ]
      },
      "Attendance_LeaveQuota": {
        headers: ["Designation / Grade", "Leave Type", "Allowed Days", "Status"],
        fields: [
          { id: "f1", label: "Designation / Grade Scope", type: "text", placeholder: "e.g. Primary Teacher" },
          { id: "f2", label: "Leave Type Name", type: "text", placeholder: "e.g. Sick Leave" },
          { id: "f3", label: "Allowed Days per Year", type: "number", placeholder: "e.g. 15" },
          { id: "f4", label: "Status", type: "select", options: ["Active", "Inactive"] }
        ]
      },
      "Attendance_LeaveOpening": {
        headers: ["Employee Name", "Opening Leaves Balance", "Fiscal Year", "Status"],
        fields: [
          { id: "f1", label: "Employee Name", type: "text", placeholder: "e.g. Ramesh Adhikari" },
          { id: "f2", label: "Opening Leaves Balance", type: "number", placeholder: "e.g. 10" },
          { id: "f3", label: "Fiscal Year Session", type: "text", placeholder: "e.g. 2026/2083" },
          { id: "f4", label: "Status", type: "select", options: ["Confirmed", "Pending"] }
        ]
      },
      "Attendance_LeaveRequest": {
        headers: ["Student/Staff Name", "Leave Dates", "Reason", "Status"],
        fields: [
          { id: "f1", label: "Applicant Name", type: "text", placeholder: "e.g. Sita Thapa" },
          { id: "f2", label: "Leave Date(s)", type: "text", placeholder: "e.g. Oct 12 - Oct 14" },
          { id: "f3", label: "Reason for Leave", type: "text", placeholder: "e.g. Medical Issue" },
          { id: "f4", label: "Approval Status", type: "select", options: ["Pending", "Approved", "Rejected"] }
        ]
      },
      "Attendance_StudentBiometricAttend": {
        headers: ["Student Name", "Biometric ID", "Log Timestamp", "Status"],
        fields: [
          { id: "f1", label: "Student Name", type: "text", placeholder: "e.g. Sunil Thapa" },
          { id: "f2", label: "Biometric Log ID", type: "text", placeholder: "e.g. BIO-ST-12" },
          { id: "f3", label: "Scan Time", type: "text", placeholder: "e.g. 09:45:12 AM" },
          { id: "f4", label: "Log Status", type: "select", options: ["Success / Present", "Late Warning", "Failed Scan"] }
        ]
      },
      "Attendance_StudentManualAttend": {
        headers: ["Grade / Class", "Total Present", "Total Absent", "Verified By"],
        fields: [
          { id: "f1", label: "Grade / Section", type: "text", placeholder: "e.g. Grade 10 - Section B" },
          { id: "f2", label: "Total Present", type: "number", placeholder: "e.g. 38" },
          { id: "f3", label: "Total Absent", type: "number", placeholder: "e.g. 2" },
          { id: "f4", label: "Verified Class Teacher", type: "text", placeholder: "e.g. Mr. S. Bhandari" }
        ]
      },
      "Attendance_EmployeeAttendance": {
        headers: ["Employee Name", "Clock In Time", "Clock Out Time", "Status"],
        fields: [
          { id: "f1", label: "Employee Name", type: "text", placeholder: "e.g. Gita Adhikari" },
          { id: "f2", label: "Clock In Time", type: "time", placeholder: "" },
          { id: "f3", label: "Clock Out Time", type: "time", placeholder: "" },
          { id: "f4", label: "Daily Status", type: "select", options: ["Full Day Present", "Half Day Present", "Late", "Absent"] }
        ]
      },
      // Exam Module
      "Exam_ExamType": {
        headers: ["Exam Name", "Term Name", "Weightage (%)", "Status"],
        fields: [
          { id: "f1", label: "Exam Name", type: "text", placeholder: "e.g. First Terminal Exam" },
          { id: "f2", label: "Term Name", type: "text", placeholder: "e.g. Term 1" },
          { id: "f3", label: "Weightage (%)", type: "number", placeholder: "e.g. 20" },
          { id: "f4", label: "Status", type: "select", options: ["Active", "Inactive"] }
        ]
      },
      "Exam_DivisionGrade": {
        headers: ["Grade Letter", "GPA From", "GPA To", "Remarks"],
        fields: [
          { id: "f1", label: "Grade Letter", type: "text", placeholder: "e.g. A+" },
          { id: "f2", label: "GPA From", type: "text", placeholder: "e.g. 3.60" },
          { id: "f3", label: "GPA To", type: "text", placeholder: "e.g. 4.00" },
          { id: "f4", label: "Remarks", type: "select", options: ["Outstanding", "Excellent", "Very Good", "Good", "Pass", "Fail"] }
        ]
      },
      "Exam_CommentSetup": {
        headers: ["Score Range", "Pre-set Comment", "Type", "Status"],
        fields: [
          { id: "f1", label: "GPA / Score Range", type: "text", placeholder: "e.g. 3.6 - 4.0" },
          { id: "f2", label: "Pre-set Comment", type: "text", placeholder: "e.g. Outstanding performance!" },
          { id: "f3", label: "Category", type: "select", options: ["Academic", "Discipline", "Attendance"] },
          { id: "f4", label: "Status", type: "select", options: ["Active", "Inactive"] }
        ]
      },
      "Exam_ResultSetup": {
        headers: ["Exam Type", "Publish Date", "Result Template", "Status"],
        fields: [
          { id: "f1", label: "Exam Type Title", type: "text", placeholder: "e.g. Final Term" },
          { id: "f2", label: "Result Publish Date", type: "date", placeholder: "" },
          { id: "f3", label: "Result Template Style", type: "select", options: ["Standard Gradesheet", "Percentage-Based Ledger"] },
          { id: "f4", label: "Publish Status", type: "select", options: ["Draft / Hidden", "Published"] }
        ]
      },
      "Exam_ExamSchedule": {
        headers: ["Class Name", "Subject Name", "Exam Date", "Time Slot"],
        fields: [
          { id: "f1", label: "Class / Grade Name", type: "text", placeholder: "e.g. Grade 10" },
          { id: "f2", label: "Subject", type: "subject-dropdown", placeholder: "Select subject from setup" },
          { id: "f3", label: "Exam Date", type: "date", placeholder: "" },
          { id: "f4", label: "Time Slot", type: "select", options: ["08:00 AM - 11:00 AM", "11:30 AM - 02:30 PM", "01:00 PM - 04:00 PM"] }
        ]
      },
      "Exam_SymbolNumber": {
        headers: ["Student Name", "Roll No", "Symbol Number", "Status"],
        fields: [
          { id: "f1", label: "Student Name", type: "text", placeholder: "e.g. Hari Bahadur" },
          { id: "f2", label: "Roll Number", type: "number", placeholder: "e.g. 15" },
          { id: "f3", label: "Exam Symbol Number", type: "text", placeholder: "e.g. SYM-2083-104" },
          { id: "f4", label: "Eligibility Status", type: "select", options: ["Eligible", "Blocked"] }
        ]
      },
      "Exam_SeatPlan": {
        headers: ["Room Number", "Exam Type", "Capacity / Rows", "Status"],
        fields: [
          { id: "f1", label: "Room Number / Block", type: "text", placeholder: "e.g. Room 102 - Block B" },
          { id: "f2", label: "Exam Type", type: "text", placeholder: "e.g. Final Term" },
          { id: "f3", label: "Capacity / Rows", type: "text", placeholder: "e.g. 40 Seats" },
          { id: "f4", label: "Status", type: "select", options: ["Allotted", "Pending"] }
        ]
      },
      "Exam_MarkSetup": {
        headers: ["Subject", "Full Marks", "Pass Marks", "Status"],
        fields: [
          { id: "f1", label: "Subject Title", type: "subject-dropdown", placeholder: "Select subject from setup" },
          { id: "f2", label: "Total Full Marks", type: "number", placeholder: "e.g. 100" },
          { id: "f3", label: "Minimum Pass Marks", type: "number", placeholder: "e.g. 40" },
          { id: "f4", label: "Status", type: "select", options: ["Active", "Inactive"] }
        ]
      },
      "Exam_Attendance": {
        headers: ["Student Name", "Exam Date", "Attendance", "Verified By"],
        fields: [
          { id: "f1", label: "Student Name", type: "text", placeholder: "e.g. Gita Adhikari" },
          { id: "f2", label: "Exam Date", type: "date", placeholder: "" },
          { id: "f3", label: "Attendance Status", type: "select", options: ["Present", "Absent", "Expelled"] },
          { id: "f4", label: "Invigilator Name", type: "text", placeholder: "e.g. Mr. Ramesh Karki" }
        ]
      },
      "Exam_MarksEntry": {
        headers: ["Student Roll/ID", "Subject", "Theory Marks", "Practical Marks"],
        fields: [
          { id: "f1", label: "Student Roll/ID", type: "text", placeholder: "e.g. ROLL-105" },
          { id: "f2", label: "Subject", type: "subject-dropdown", placeholder: "Select subject from setup" },
          { id: "f3", label: "Obtained Theory Marks", type: "number", placeholder: "e.g. 68" },
          { id: "f4", label: "Obtained Practical Marks", type: "number", placeholder: "e.g. 23" }
        ]
      },
      "Exam_ReExamMarksEntry": {
        headers: ["Student Roll/ID", "Subject", "Re-Exam Marks", "Reason"],
        fields: [
          { id: "f1", label: "Student Roll/ID", type: "text", placeholder: "e.g. ROLL-124" },
          { id: "f2", label: "Subject Name", type: "subject-dropdown", placeholder: "Select subject from setup" },
          { id: "f3", label: "Re-Exam Marks", type: "number", placeholder: "e.g. 45" },
          { id: "f4", label: "Reason for Re-Exam", type: "select", options: ["Failed First Attempt", "Absent Due to Medical", "Retotaling Request"] }
        ]
      },
      "Exam_Report": {
        headers: ["Report Type", "Exam Term", "Generated Date", "Status"],
        fields: [
          { id: "f1", label: "Exam Report Title", type: "text", placeholder: "e.g. Gradesheet Summary" },
          { id: "f2", label: "Exam Term Reference", type: "text", placeholder: "e.g. Final Term" },
          { id: "f3", label: "Report Generation Date", type: "date", placeholder: "" },
          { id: "f4", label: "Status", type: "select", options: ["Finalized", "Draft"] }
        ]
      },
      "Exam_ExamSetup": {
        headers: ["Exam Config Key", "Value Setting", "Description", "Status"],
        fields: [
          { id: "f1", label: "Exam Config Key", type: "text", placeholder: "e.g. PASSING_CRITERIA" },
          { id: "f2", label: "Value Setting", type: "text", placeholder: "e.g. 40" },
          { id: "f3", label: "Description Details", type: "text", placeholder: "e.g. Global minimum pass percentage." },
          { id: "f4", label: "Status", type: "select", options: ["Enforced", "Disabled"] }
        ]
      },
      "Exam_ClassTest": {
        headers: ["Class Name", "Subject Name", "Test Full Marks", "Test Date"],
        fields: [
          { id: "f1", label: "Class / Section Name", type: "text", placeholder: "e.g. Grade 9 Section A" },
          { id: "f2", label: "Subject Name", type: "subject-dropdown", placeholder: "Select subject from setup" },
          { id: "f3", label: "Test Full Marks", type: "number", placeholder: "e.g. 20" },
          { id: "f4", label: "Test Date", type: "date", placeholder: "" }
        ]
      },
      "Exam_CAS": {
        headers: ["Student Roll", "Subject Name", "CAS Score", "Status"],
        fields: [
          { id: "f1", label: "Student Roll/ID", type: "text", placeholder: "e.g. ROLL-112" },
          { id: "f2", label: "Subject Name", type: "subject-dropdown", placeholder: "Select subject from setup" },
          { id: "f3", label: "CAS Score (out of 25)", type: "number", placeholder: "e.g. 22" },
          { id: "f4", label: "Verification Status", type: "select", options: ["Verified", "Pending Review"] }
        ]
      },
      // Fee Module
      "Fee_FeeItemSetup": {
        headers: ["Fee Item Name", "Default Amount", "Billing Frequency", "Status"],
        fields: [
          { id: "f1", label: "Fee Item Name", type: "text", placeholder: "e.g. Tuition Fee" },
          { id: "f2", label: "Default Amount (Rs.)", type: "number", placeholder: "e.g. 3500" },
          { id: "f3", label: "Billing Frequency", type: "select", options: ["Monthly", "Termly", "Annually", "One-Time"] },
          { id: "f4", label: "Status", type: "select", options: ["Active", "Inactive"] }
        ]
      },
      "Fee_Billing": {
        headers: ["Class / Student ID", "Fee Item Name", "Billing Period", "Due Date"],
        fields: [
          { id: "f1", label: "Class scope or Student ID", type: "text", placeholder: "e.g. Grade 10 - Section A" },
          { id: "f2", label: "Fee Item Name", type: "text", placeholder: "e.g. Monthly Tuition Fee" },
          { id: "f3", label: "Billing Period", type: "text", placeholder: "e.g. Baishakh 2083" },
          { id: "f4", label: "Due Date", type: "date", placeholder: "" }
        ]
      },
      "Fee_FeeReceipt": {
        headers: ["Receipt Voucher ID", "Student Name", "Paid Amount (Rs.)", "Payment Status"],
        fields: [
          { id: "f1", label: "Receipt Voucher ID", type: "text", placeholder: "e.g. REC-88772" },
          { id: "f2", label: "Student Name", type: "text", placeholder: "e.g. Suman Thapa" },
          { id: "f3", label: "Paid Amount (Rs.)", type: "number", placeholder: "e.g. 4500" },
          { id: "f4", label: "Payment Status", type: "select", options: ["Fully Paid", "Partially Paid", "Cancelled"] }
        ]
      },
      "Fee_SiblingFeeReceipt": {
        headers: ["Family Ref ID", "Student 1 Name", "Student 2 Name", "Combined Paid Amount"],
        fields: [
          { id: "f1", label: "Family Reference ID", type: "text", placeholder: "e.g. FAM-9933" },
          { id: "f2", label: "Student 1 Name", type: "text", placeholder: "e.g. Sunil Adhikari" },
          { id: "f3", label: "Student 2 Name", type: "text", placeholder: "e.g. Soniya Adhikari" },
          { id: "f4", label: "Combined Paid Amount (Rs.)", type: "number", placeholder: "e.g. 8000" }
        ]
      },
      "Fee_DiscountSetup": {
        headers: ["Discount Title", "Amount/Percentage", "Applicable To", "Status"],
        fields: [
          { id: "f1", label: "Discount Name", type: "text", placeholder: "e.g. Staff Child Discount" },
          { id: "f2", label: "Discount Value", type: "text", placeholder: "e.g. 20% or Rs.5000" },
          { id: "f3", label: "Applicable Categories", type: "text", placeholder: "e.g. All Students" },
          { id: "f4", label: "Status", type: "select", options: ["Active", "Inactive"] }
        ]
      },
      "Fee_Report": {
        headers: ["Fee Report Name", "Target Class", "Date Range", "Status"],
        fields: [
          { id: "f1", label: "Fee Report Title", type: "text", placeholder: "e.g. Outstanding Defaulters" },
          { id: "f2", label: "Target Class / Grade", type: "text", placeholder: "e.g. Grade 10 - All Sections" },
          { id: "f3", label: "Date Range / Session", type: "text", placeholder: "e.g. Baishakh to Ashadh" },
          { id: "f4", label: "Verification Status", type: "select", options: ["Audited", "Draft"] }
        ]
      },
      "Fee_Setup": {
        headers: ["Fee Config Key", "Setting Value", "Description", "Status"],
        fields: [
          { id: "f1", label: "Fee Config Key", type: "text", placeholder: "e.g. LATE_FEE_PENALTY" },
          { id: "f2", label: "Setting Value", type: "text", placeholder: "e.g. Rs. 20" },
          { id: "f3", label: "Description details", type: "text", placeholder: "e.g. Daily penalty applied on outstanding bills." },
          { id: "f4", label: "Status", type: "select", options: ["Enforced", "Disabled"] }
        ]
      },
      // Transport Module
      "TransportManagement_TransportSetup": {
        headers: ["Vehicle Reg No", "Vehicle Model / Seats", "Fuel Capacity", "Status"],
        fields: [
          { id: "f1", label: "Vehicle Reg No.", type: "text", placeholder: "e.g. Ba 2 Kha 9845" },
          { id: "f2", label: "Vehicle Model / Seats", type: "text", placeholder: "e.g. Tata Marcopolo - 40 Seats" },
          { id: "f3", label: "Fuel Capacity (Ltr)", type: "number", placeholder: "e.g. 120" },
          { id: "f4", label: "Vehicle Status", type: "select", options: ["Active", "Maintenance", "Out of Service"] }
        ]
      },
      "TransportManagement_TransportMapping": {
        headers: ["Route Name", "Vehicle Plate No", "Assigned Driver", "Status"],
        fields: [
          { id: "f1", label: "Route Name", type: "text", placeholder: "e.g. Pokhara Bus Park to School" },
          { id: "f2", label: "Vehicle Plate No.", type: "text", placeholder: "e.g. Ba 2 Kha 9845" },
          { id: "f3", label: "Assigned Driver Name & Phone", type: "text", placeholder: "e.g. Hari Krishna (9800000000)" },
          { id: "f4", label: "Mapping Status", type: "select", options: ["Active", "Inactive"] }
        ]
      },
      "TransportManagement_Report": {
        headers: ["Transport Log Report", "Route Name", "Verification Date", "Status"],
        fields: [
          { id: "f1", label: "Transport Log Title", type: "text", placeholder: "e.g. Fuel Log Q2" },
          { id: "f2", label: "Route Name", type: "text", placeholder: "e.g. Route A" },
          { id: "f3", label: "Verification Date", type: "date", placeholder: "" },
          { id: "f4", label: "Status", type: "select", options: ["Finalized", "Pending"] }
        ]
      },
      // Library Module
      "Library_Master": {
        headers: ["Library Wing / Section", "Shelf Number", "Category Code", "Status"],
        fields: [
          { id: "f1", label: "Library Wing / Room Name", type: "text", placeholder: "e.g. Science Wing - Room 3" },
          { id: "f2", label: "Shelf Number / Rack ID", type: "text", placeholder: "e.g. Shelf A-4" },
          { id: "f3", label: "Category Code Range", type: "text", placeholder: "e.g. 500 to 599" },
          { id: "f4", label: "Status", type: "select", options: ["Active", "Inactive"] }
        ]
      },
      "Library_BookEntry": {
        headers: ["ISBN / Code", "Book Title", "Author", "Status"],
        fields: [
          { id: "f1", label: "ISBN / Book Code", type: "text", placeholder: "e.g. 978-3-16-148410-0" },
          { id: "f2", label: "Book Title", type: "text", placeholder: "e.g. The Great Gatsby" },
          { id: "f3", label: "Author / Publisher", type: "text", placeholder: "e.g. F. Scott Fitzgerald" },
          { id: "f4", label: "Availability Status", type: "select", options: ["Available", "Issued", "Lost"] }
        ]
      },
      "Library_PrintBarcode": {
        headers: ["ISBN / Book Code", "Quantity", "Barcode Format", "Status"],
        fields: [
          { id: "f1", label: "ISBN / Book Code", type: "text", placeholder: "e.g. 9789937102932" },
          { id: "f2", label: "Print Quantity", type: "number", placeholder: "e.g. 10" },
          { id: "f3", label: "Barcode Format", type: "select", options: ["Code 128", "EAN-13", "QR Code Label"] },
          { id: "f4", label: "Action Status", type: "select", options: ["Print Queue", "Save PDF"] }
        ]
      },
      "Library_LibraryMembership": {
        headers: ["Member Name", "Role", "Membership Expiry", "Status"],
        fields: [
          { id: "f1", label: "Member Name", type: "text", placeholder: "e.g. Sunil Thapa" },
          { id: "f2", label: "Role", type: "select", options: ["Student", "Teacher", "Admin Staff"] },
          { id: "f3", label: "Membership Expiry Date", type: "date", placeholder: "" },
          { id: "f4", label: "Status", type: "select", options: ["Active", "Suspended", "Expired"] }
        ]
      },
      "Library_LibraryCard": {
        headers: ["Cardholder Name", "Card Serial ID", "Issue Date", "Status"],
        fields: [
          { id: "f1", label: "Cardholder Name", type: "text", placeholder: "e.g. Gita Adhikari" },
          { id: "f2", label: "Card Serial ID", type: "text", placeholder: "e.g. CARD-LIB-9944" },
          { id: "f3", label: "Card Issue Date", type: "date", placeholder: "" },
          { id: "f4", label: "Card Status", type: "select", options: ["Active", "Lost", "Deactivated"] }
        ]
      },
      "Library_BookIssue": {
        headers: ["Book Title / Code", "Borrower Member ID", "Issue Date", "Due Date"],
        fields: [
          { id: "f1", label: "Book Code / ISBN ID", type: "text", placeholder: "e.g. 9789937102932" },
          { id: "f2", label: "Borrower Member ID", type: "text", placeholder: "e.g. MEM-ST-204" },
          { id: "f3", label: "Issue Date", type: "date", placeholder: "" },
          { id: "f4", label: "Return Due Date", type: "date", placeholder: "" }
        ]
      },
      "Library_BookReceived": {
        headers: ["Issued Book Ref", "Return Date", "Late Fine Charged", "Status"],
        fields: [
          { id: "f1", label: "Issued Book Transaction ID", type: "text", placeholder: "e.g. TXN-LIB-5542" },
          { id: "f2", label: "Actual Return Date", type: "date", placeholder: "" },
          { id: "f3", label: "Late Fine Charged (Rs.)", type: "number", placeholder: "e.g. 50" },
          { id: "f4", label: "Return Status", type: "select", options: ["Returned Intact", "Returned Damaged", "Lost - Paid"] }
        ]
      },
      "Library_Report": {
        headers: ["Library Audit Report", "Audit Category", "Audit Date", "Status"],
        fields: [
          { id: "f1", label: "Library Audit Report Name", type: "text", placeholder: "e.g. Overdue Unreturned Books" },
          { id: "f2", label: "Audit Category", type: "select", options: ["Overdue Books", "Book Inventory", "Fines collected"] },
          { id: "f3", label: "Audit Date", type: "date", placeholder: "" },
          { id: "f4", label: "Audit Status", type: "select", options: ["Finalized", "Draft"] }
        ]
      },
      "Library_Setting": {
        headers: ["Fines per Day", "Max Books Allowed", "Max Days Allowed", "Status"],
        fields: [
          { id: "f1", label: "Fine Rate per Overdue Day (Rs.)", type: "number", placeholder: "e.g. 5" },
          { id: "f2", label: "Max Books Allowed", type: "number", placeholder: "e.g. 3" },
          { id: "f3", label: "Max Borrowing Days Allowed", type: "number", placeholder: "e.g. 14" },
          { id: "f4", label: "Enforced Status", type: "select", options: ["Active", "Disabled"] }
        ]
      },
      // Accounting Module
      "Accounting_Creation": {
        headers: ["Ledger Account Name", "Account Type", "Opening Balance", "Status"],
        fields: [
          { id: "f1", label: "Ledger Account Name", type: "text", placeholder: "e.g. Saraswati Bank A/C" },
          { id: "f2", label: "Account Type Selection", type: "select", options: ["Assets", "Liability", "Income", "Expense"] },
          { id: "f3", label: "Opening Balance (Rs.)", type: "number", placeholder: "e.g. 150000" },
          { id: "f4", label: "Status", type: "select", options: ["Active Ledger", "Inactive Ledger"] }
        ]
      },
      "Accounting_Transaction": {
        headers: ["Transaction Ref", "Amount", "Description", "Type"],
        fields: [
          { id: "f1", label: "Transaction Reference ID", type: "text", placeholder: "e.g. TXN-998822" },
          { id: "f2", label: "Amount (Rs.)", type: "number", placeholder: "e.g. 15000" },
          { id: "f3", label: "Description", type: "text", placeholder: "e.g. Utility Bill Payment" },
          { id: "f4", label: "Transaction Type", type: "select", options: ["Income", "Expense"] }
        ]
      },
      "Accounting_Reporting": {
        headers: ["Ledger Name", "Reporting Period", "Format style", "Status"],
        fields: [
          { id: "f1", label: "Ledger / Account Scope", type: "text", placeholder: "e.g. Income Statement" },
          { id: "f2", label: "Reporting Period", type: "select", options: ["Q1 First Quarter", "Q2 Second Quarter", "Q3 Third Quarter", "Fiscal Year Statement"] },
          { id: "f3", label: "Format File Style", type: "select", options: ["PDF Report", "Excel Sheet", "CSV raw records"] },
          { id: "f4", label: "Audit Status", type: "select", options: ["Approved", "Draft Verification"] }
        ]
      },
      // Academic Calendar Module
      "AcademicCalendar_EventType": {
        headers: ["Event Type Name", "Priority Level", "Color Code", "Status"],
        fields: [
          { id: "f1", label: "Event Type Name", type: "text", placeholder: "e.g. National Holiday" },
          { id: "f2", label: "Priority Level", type: "select", options: ["High", "Medium", "Low"] },
          { id: "f3", label: "Color Code", type: "text", placeholder: "e.g. #FF0000" },
          { id: "f4", label: "Status", type: "select", options: ["Active", "Inactive"] }
        ]
      },
      "AcademicCalendar_EventList": {
        headers: ["Event Name", "Start Date", "End Date", "Event Description"],
        fields: [
          { id: "f1", label: "Event / Holiday Title", type: "text", placeholder: "e.g. Winter Vacation" },
          { id: "f2", label: "Event Start Date", type: "date", placeholder: "" },
          { id: "f3", label: "Event End Date", type: "date", placeholder: "" },
          { id: "f4", label: "Status", type: "select", options: ["Active", "Pending", "Cancelled"] }
        ]
      },
      "AcademicCalendar_Calendar": {
        headers: ["Calendar Year / Term", "Holiday Count", "Total Working Days", "Status"],
        fields: [
          { id: "f1", label: "Calendar Year Session", type: "text", placeholder: "e.g. Academic Year 2026/2083" },
          { id: "f2", label: "Total Holidays Count", type: "number", placeholder: "e.g. 52" },
          { id: "f3", label: "Total Working Days", type: "number", placeholder: "e.g. 210" },
          { id: "f4", label: "Calendar Status", type: "select", options: ["Published", "Draft"] }
        ]
      },
      "AcademicCalendar_Weekend": {
        headers: ["Off Day Selection", "Description details", "Affects Staff", "Status"],
        fields: [
          { id: "f1", label: "Off Day Selection", type: "select", options: ["Saturday", "Sunday", "Friday", "Saturday & Sunday"] },
          { id: "f2", label: "Description details", type: "text", placeholder: "e.g. Standard weekly day off." },
          { id: "f3", label: "Affects Staff Members?", type: "select", options: ["Yes", "No"] },
          { id: "f4", label: "Rule Status", type: "select", options: ["Enforced", "Disabled"] }
        ]
      },
      // APP CMS Module
      "APPCMS_Quotes": {
        headers: ["Quote Text", "Author / Source", "Display Group", "Status"],
        fields: [
          { id: "f1", label: "Quote Text Details", type: "text", placeholder: "e.g. Education is the most powerful weapon..." },
          { id: "f2", label: "Author / Source Name", type: "text", placeholder: "e.g. Nelson Mandela" },
          { id: "f3", label: "Display Group Placement", type: "select", options: ["Dashboard Quote", "Footer Banner Quote", "Pre-Login Slider Quotes"] },
          { id: "f4", label: "Status", type: "select", options: ["Active", "Draft"] }
        ]
      },
      "APPCMS_Slider": {
        headers: ["Slide Title", "Image URL / Path", "Caption", "Status"],
        fields: [
          { id: "f1", label: "Slide Title Headline", type: "text", placeholder: "e.g. Welcome to Shree Saraswati School" },
          { id: "f2", label: "Image URL / File Path", type: "text", placeholder: "e.g. /images/slider/banner1.jpg" },
          { id: "f3", label: "Caption Description", type: "text", placeholder: "e.g. Providing Quality Education since 1990." },
          { id: "f4", label: "Status", type: "select", options: ["Published", "Draft"] }
        ]
      },
      "APPCMS_Banner": {
        headers: ["Banner Text / Offer", "Link URL", "Banner Category", "Status"],
        fields: [
          { id: "f1", label: "Banner Text / Promotional Offer", type: "text", placeholder: "e.g. Admissions Open!" },
          { id: "f2", label: "Redirect Link URL", type: "text", placeholder: "e.g. /admissions.html" },
          { id: "f3", label: "Banner Category Section", type: "select", options: ["Header Top Banner", "Homepage Center Banner", "Staggered Pop-up"] },
          { id: "f4", label: "Status", type: "select", options: ["Published", "Expired"] }
        ]
      },
      "APPCMS_Notice": {
        headers: ["Notice Title", "Publish Date", "Target Audience", "Status"],
        fields: [
          { id: "f1", label: "Notice Title", type: "text", placeholder: "e.g. Winter Vacation Begins" },
          { id: "f2", label: "Date", type: "date", placeholder: "" },
          { id: "f3", label: "Target Audience", type: "text", placeholder: "e.g. All Students and Staff" },
          { id: "f4", label: "Status", type: "select", options: ["Published", "Draft"] }
        ]
      },
      "APPCMS_Gallery": {
        headers: ["Album Name", "Image URL", "Upload Date", "Status"],
        fields: [
          { id: "f1", label: "Album Name", type: "text", placeholder: "e.g. Annual Sports Meet" },
          { id: "f2", label: "Image URL / Path", type: "text", placeholder: "e.g. /images/gallery/sports1.jpg" },
          { id: "f3", label: "Upload Date", type: "date", placeholder: "" },
          { id: "f4", label: "Status", type: "select", options: ["Visible", "Staff Only", "Archived"] }
        ]
      },
      "APPCMS_Videos": {
        headers: ["Video Title", "YouTube Embed URL", "Publish Date", "Status"],
        fields: [
          { id: "f1", label: "Video Title / Caption", type: "text", placeholder: "e.g. Principal's Welcome" },
          { id: "f2", label: "YouTube Embed URL Link", type: "text", placeholder: "e.g. https://www.youtube.com/embed/dQw4w9WgXcQ" },
          { id: "f3", label: "Publish Date", type: "date", placeholder: "" },
          { id: "f4", label: "CMS Status", type: "select", options: ["Published", "Draft", "Archived"] }
        ]
      },
      "APPCMS_Introduction": {
        headers: ["Intro Heading", "Body Content Text", "Header Image URL", "Status"],
        fields: [
          { id: "f1", label: "Introduction Heading", type: "text", placeholder: "e.g. Inspiring Excellence" },
          { id: "f2", label: "Body Content Text details", type: "text", placeholder: "Enter paragraph content..." },
          { id: "f3", label: "Header Image URL Link", type: "text", placeholder: "e.g. /images/intro_header.jpg" },
          { id: "f4", label: "CMS Status", type: "select", options: ["Published", "Draft"] }
        ]
      },
      "APPCMS_Whoweare": {
        headers: ["Title", "Mission Statement", "Description", "Status"],
        fields: [
          { id: "f1", label: "Section Title", type: "text", placeholder: "e.g. History & Vision" },
          { id: "f2", label: "Mission Statement", type: "text", placeholder: "e.g. To nurture future leaders." },
          { id: "f3", label: "Full Description", type: "text", placeholder: "Enter detailed history..." },
          { id: "f4", label: "Verification Status", type: "select", options: ["Approved", "Draft"] }
        ]
      },
      "APPCMS_ServiceandFacilities": {
        headers: ["Service Name", "Short Description", "Icon Class", "Status"],
        fields: [
          { id: "f1", label: "Service / Facility Name", type: "text", placeholder: "e.g. Hi-Tech Science Lab" },
          { id: "f2", label: "Short Description details", type: "text", placeholder: "e.g. State-of-the-art physics labs." },
          { id: "f3", label: "Icon Class (e.g. FontAwesome)", type: "text", placeholder: "e.g. fas fa-flask" },
          { id: "f4", label: "CMS Status", type: "select", options: ["Published", "Draft"] }
        ]
      },
      "APPCMS_AcademicCalender": {
        headers: ["Calendar Sheet Month", "PDF Attachment Link", "Academic Year", "Status"],
        fields: [
          { id: "f1", label: "Calendar Sheet Month Name", type: "text", placeholder: "e.g. Baishakh 2083" },
          { id: "f2", label: "PDF Attachment Link", type: "text", placeholder: "e.g. /uploads/calendar.pdf" },
          { id: "f3", label: "Academic Year Session Code", type: "text", placeholder: "e.g. 2026/2083" },
          { id: "f4", label: "Publication Status", type: "select", options: ["Published", "Draft"] }
        ]
      },
      // Front Desk Module
      "FrontDesk_PaymentFollowup": {
        headers: ["Student / Parent Name", "Outstanding Due (Rs.)", "Last Followup Date", "Status"],
        fields: [
          { id: "f1", label: "Student / Parent Name", type: "text", placeholder: "e.g. Ramesh Adhikari" },
          { id: "f2", label: "Outstanding Due Amount (Rs.)", type: "number", placeholder: "e.g. 15400" },
          { id: "f3", label: "Last Followup Date", type: "date", placeholder: "" },
          { id: "f4", label: "Followup Status", type: "select", options: ["Called - Promised Payment", "Extension Requested", "No Answer", "Resolved"] }
        ]
      },
      "FrontDesk_AdmissionEnquiry": {
        headers: ["Applicant Name", "Grade Interested", "Contact Phone", "Status"],
        fields: [
          { id: "f1", label: "Applicant/Student Name", type: "text", placeholder: "e.g. Suman Thapa" },
          { id: "f2", label: "Grade Interested", type: "text", placeholder: "e.g. Grade 11 Science" },
          { id: "f3", label: "Contact Phone Number", type: "text", placeholder: "e.g. 9840000000" },
          { id: "f4", label: "Enquiry Status", type: "select", options: ["Pending Followup", "Form Submitted", "Enrolled"] }
        ]
      },
      "FrontDesk_FollowUp": {
        headers: ["Enquiry Reference ID", "Discussion Details", "Next Followup Date", "Status"],
        fields: [
          { id: "f1", label: "Enquiry Reference ID", type: "text", placeholder: "e.g. ENQ-8842" },
          { id: "f2", label: "Discussion Details", type: "text", placeholder: "e.g. Inquired about hostel fees." },
          { id: "f3", label: "Next Followup Date", type: "date", placeholder: "" },
          { id: "f4", label: "Followup Action Status", type: "select", options: ["Call Scheduled", "Send Email Prospectus", "Closed"] }
        ]
      },
      "FrontDesk_SeatAllotment": {
        headers: ["Student Name / ID", "Class / Room Allocated", "Allotment Status", "Verified By"],
        fields: [
          { id: "f1", label: "Student Name / ID Reference", type: "text", placeholder: "e.g. Sunil Thapa" },
          { id: "f2", label: "Class / Room Allocated", type: "text", placeholder: "e.g. Class 11 Section B" },
          { id: "f3", label: "Allotment Status", type: "select", options: ["Confirmed Seat", "Waitlisted Seat", "Cancelled"] },
          { id: "f4", label: "Verified Officer", type: "text", placeholder: "e.g. Mrs. Gita Adhikari" }
        ]
      },
      "FrontDesk_PreAdmission": {
        headers: ["Applicant Name", "Class Applied", "Application ID Reference", "Status"],
        fields: [
          { id: "f1", label: "Applicant / Student Name", type: "text", placeholder: "e.g. Sita Thapa" },
          { id: "f2", label: "Class Applied For", type: "text", placeholder: "e.g. Grade 1 Science" },
          { id: "f3", label: "Application ID Reference", type: "text", placeholder: "e.g. PRE-ADM-8833" },
          { id: "f4", label: "Pre-Admission Status", type: "select", options: ["Form Approved", "Under Review", "Shortlisted", "Declined"] }
        ]
      },
      "FrontDesk_VisitorBook": {
        headers: ["Visitor Name", "Purpose / Meeting With", "Contact Number", "Status"],
        fields: [
          { id: "f1", label: "Visitor Name", type: "text", placeholder: "e.g. Ramesh Karki" },
          { id: "f2", label: "Purpose / Meeting With", type: "text", placeholder: "e.g. Meeting Principal" },
          { id: "f3", label: "Contact Number", type: "text", placeholder: "e.g. 9851000000" },
          { id: "f4", label: "Visitor Status", type: "select", options: ["Inside Premises", "Departed"] }
        ]
      },
      "FrontDesk_GatePass": {
        headers: ["Visitor Name", "Purpose / Meeting With", "Time In", "Status"],
        fields: [
          { id: "f1", label: "Visitor Name", type: "text", placeholder: "e.g. Ram Bahadur" },
          { id: "f2", label: "Purpose & Meeting", type: "text", placeholder: "e.g. Principal (Admission)" },
          { id: "f3", label: "Time In", type: "time", placeholder: "" },
          { id: "f4", label: "Pass Status", type: "select", options: ["Active (Inside)", "Completed (Left)"] }
        ]
      },
      "FrontDesk_PhoneCallLog": {
        headers: ["Caller Name", "Phone Number", "Call Summary", "Status"],
        fields: [
          { id: "f1", label: "Caller Name", type: "text", placeholder: "e.g. Gita Adhikari" },
          { id: "f2", label: "Phone Number", type: "text", placeholder: "e.g. 9841234567" },
          { id: "f3", label: "Call Summary / Details", type: "text", placeholder: "e.g. Inquired about tomorrow's schedule." },
          { id: "f4", label: "Call Status", type: "select", options: ["Resolved", "Forwarded", "Requires Callback"] }
        ]
      },
      "FrontDesk_PostalServices": {
        headers: ["Recipient Name", "Sender Name", "Tracking ID / Carrier", "Status"],
        fields: [
          { id: "f1", label: "Recipient Name & Role", type: "text", placeholder: "e.g. Principal" },
          { id: "f2", label: "Sender Name / Org", type: "text", placeholder: "e.g. Dept of Education" },
          { id: "f3", label: "Tracking ID & Carrier", type: "text", placeholder: "e.g. POST-998822" },
          { id: "f4", label: "Delivery Status", type: "select", options: ["Delivered & Signed", "Received - Pending Handover", "Returned"] }
        ]
      },
      "FrontDesk_NewEmployeeApplication": {
        headers: ["Applicant Name", "Position Applied", "CV / Document Link", "Status"],
        fields: [
          { id: "f1", label: "Applicant Full Name", type: "text", placeholder: "e.g. Suresh Bhandari" },
          { id: "f2", label: "Position Applied For", type: "text", placeholder: "e.g. Science Teacher" },
          { id: "f3", label: "CV Link", type: "text", placeholder: "e.g. https://drive.google.com/..." },
          { id: "f4", label: "Application Screening State", type: "select", options: ["Screening Review", "Shortlisted", "Offered", "Rejected"] }
        ]
      },
      "FrontDesk_Complain": {
        headers: ["Complainant Name", "Subject / Issue", "Details Description", "Status"],
        fields: [
          { id: "f1", label: "Complainant Name", type: "text", placeholder: "e.g. Ramesh Adhikari" },
          { id: "f2", label: "Subject / Issue Title", type: "text", placeholder: "e.g. Late Arrival of Bus" },
          { id: "f3", label: "Detailed Description", type: "text", placeholder: "Describe the issue in detail..." },
          { id: "f4", label: "Grievance Status", type: "select", options: ["Received", "Resolved & Closed", "Invalid"] }
        ]
      }
    };

    function getDynamicSchema(moduleName, category) {
      const name = moduleName.toLowerCase();
      
      // Default fallback fields
      let headers = ["Primary Detail", "Secondary Detail", "Additional Info", "Status"];
      let fields = [
        { id: "f1", label: "Primary Value", type: "text", placeholder: "Enter main detail..." },
        { id: "f2", label: "Secondary Value", type: "text", placeholder: "Enter secondary detail..." },
        { id: "f3", label: "Additional Info", type: "text", placeholder: "Any other context..." },
        { id: "f4", label: "Status / Category", type: "select", options: ["Active", "Pending", "Inactive"] }
      ];

      if (name.includes("employee") || name.includes("staff")) {
        headers = ["Employee Name", "Designation", "Contact No", "Status"];
        fields = [
          { id: "f1", label: "Employee Name", type: "text", placeholder: "e.g. Ramesh Karki" },
          { id: "f2", label: "Designation / Role", type: "text", placeholder: "e.g. Science Teacher" },
          { id: "f3", label: "Contact Phone", type: "text", placeholder: "e.g. 9841234567" },
          { id: "f4", label: "Status", type: "select", options: ["Active", "On Leave", "Inactive"] }
        ];
      } else if (name.includes("student")) {
        headers = ["Student Name", "Roll No / ID", "Grade", "Status"];
        fields = [
          { id: "f1", label: "Student Name", type: "text", placeholder: "e.g. Sunil Thapa" },
          { id: "f2", label: "Roll Number / ID", type: "number", placeholder: "e.g. 24" },
          { id: "f3", label: "Class / Grade", type: "text", placeholder: "e.g. Grade 10" },
          { id: "f4", label: "Status", type: "select", options: ["Active", "Suspended", "Inactive"] }
        ];
      } else if (name.includes("leave") || name.includes("quota") || name.includes("late") || name.includes("rule") || name.includes("attendance")) {
        headers = ["Name / Rule", "Target Grade / Date", "Details / Reason", "Status"];
        fields = [
          { id: "f1", label: "Name / Rule Name", type: "text", placeholder: "e.g. Sita Thapa / Late Fine Rule" },
          { id: "f2", label: "Target / Dates", type: "text", placeholder: "e.g. Grade 10 / Oct 12 - Oct 14" },
          { id: "f3", label: "Reason / Details", type: "text", placeholder: "e.g. Medical / Rs. 50 Fine per Day" },
          { id: "f4", label: "Approval Status", type: "select", options: ["Pending", "Approved", "Active", "Inactive"] }
        ];
      } else if (name.includes("device") || name.includes("biometric")) {
        headers = ["Device Name", "IP / Serial No", "Location", "Status"];
        fields = [
          { id: "f1", label: "Device Name / Brand", type: "text", placeholder: "e.g. ZKTeco Face Reader" },
          { id: "f2", label: "IP Address / Serial", type: "text", placeholder: "e.g. 192.168.1.150" },
          { id: "f3", label: "Physical Location", type: "text", placeholder: "e.g. Main Reception Gate" },
          { id: "f4", label: "Device Status", type: "select", options: ["Online", "Offline", "Maintenance"] }
        ];
      } else if (name.includes("class") || name.includes("category")) {
        headers = ["Class / Category Name", "Section / Sub-type", "Assigned Head / Teacher", "Status"];
        fields = [
          { id: "f1", label: "Class / Category Name", type: "text", placeholder: "e.g. Grade 10" },
          { id: "f2", label: "Section / Type", type: "text", placeholder: "e.g. Section B" },
          { id: "f3", label: "Class Teacher / Head", type: "text", placeholder: "e.g. Mr. S. Bhandari" },
          { id: "f4", label: "Status", type: "select", options: ["Active", "Inactive"] }
        ];
      } else if (name.includes("exam") || name.includes("mark") || name.includes("result") || name.includes("cert") || name.includes("tc") || name.includes("cc") || name.includes("subject")) {
        headers = ["Subject / Exam Name", "Full Marks / GPA", "Remarks", "Status"];
        fields = [
          { id: "f1", label: "Subject / Exam Title", type: "text", placeholder: "e.g. Mathematics Final Term" },
          { id: "f2", label: "Full Marks or Obtained GPA", type: "text", placeholder: "e.g. 100 or 3.82 GPA" },
          { id: "f3", label: "Remarks / Instructions", type: "text", placeholder: "e.g. Mandatory / Pass Mark 40" },
          { id: "f4", label: "Exam Status", type: "select", options: ["Active", "Upcoming", "Completed"] }
        ];
      } else if (name.includes("discount") || name.includes("fee") || name.includes("mapping") || name.includes("invoice") || name.includes("receipt") || name.includes("amount") || name.includes("due") || name.includes("collection")) {
        headers = ["Item / Fee Type", "Amount (Rs.) / Value", "Description", "Status"];
        fields = [
          { id: "f1", label: "Fee Type / Discount Name", type: "text", placeholder: "e.g. Monthly Tuition Fee / Sports Discount" },
          { id: "f2", label: "Amount / Percentage Value", type: "text", placeholder: "e.g. Rs. 4,500 or 15%" },
          { id: "f3", label: "Billing Details / Ledger", type: "text", placeholder: "e.g. Applicable for Grade 9-10" },
          { id: "f4", label: "Billing Status", type: "select", options: ["Active", "Paid", "Pending", "Cancelled"] }
        ];
      } else if (name.includes("transport") || name.includes("route") || name.includes("driver") || name.includes("vehicle") || name.includes("bus")) {
        headers = ["Route Name", "Vehicle Details", "Driver Name / Contact", "Status"];
        fields = [
          { id: "f1", label: "Route Area", type: "text", placeholder: "e.g. Pokhara Bus Park to School" },
          { id: "f2", label: "Vehicle Plate No.", type: "text", placeholder: "e.g. Ba 2 Kha 9845" },
          { id: "f3", label: "Driver Name & Mobile", type: "text", placeholder: "e.g. Hari Ram (9800000000)" },
          { id: "f4", label: "Status", type: "select", options: ["Active", "Maintenance"] }
        ];
      } else if (name.includes("book") || name.includes("library") || name.includes("barcode") || name.includes("card") || name.includes("issue") || name.includes("receive")) {
        headers = ["Book/Card Reference", "Author / Borrower", "ISBN / Member ID", "Status"];
        fields = [
          { id: "f1", label: "Book / Item Title / Card Name", type: "text", placeholder: "e.g. Principles of Physics" },
          { id: "f2", label: "Author / Borrower Name", type: "text", placeholder: "e.g. Halliday / Ramesh Adhikari" },
          { id: "f3", label: "ISBN / Member barcode", type: "text", placeholder: "e.g. 9789937102932" },
          { id: "f4", label: "Library Status", type: "select", options: ["Available", "Issued", "Returned", "Lost"] }
        ];
      } else if (name.includes("transaction") || name.includes("creation") || name.includes("accounting") || name.includes("payment")) {
        headers = ["Txn Ref / Particular", "Amount (Rs.)", "Payment Method", "Type"];
        fields = [
          { id: "f1", label: "Particular / Description", type: "text", placeholder: "e.g. Electricity Bill Voucher" },
          { id: "f2", label: "Amount", type: "number", placeholder: "e.g. 8450" },
          { id: "f3", label: "Payment Mode", type: "text", placeholder: "e.g. eSewa / Bank Transfer" },
          { id: "f4", label: "Txn Type", type: "select", options: ["Expense", "Income"] }
        ];
      } else if (name.includes("event") || name.includes("calendar") || name.includes("holiday") || name.includes("weekend")) {
        headers = ["Event Title", "Date / Duration", "Event Type", "Status"];
        fields = [
          { id: "f1", label: "Event / Day Name", type: "text", placeholder: "e.g. Saraswati Puja Holiday" },
          { id: "f2", label: "Date / Day", type: "text", placeholder: "e.g. Shrawan 24" },
          { id: "f3", label: "Category / Color", type: "text", placeholder: "e.g. Cultural Event" },
          { id: "f4", label: "Status", type: "select", options: ["Published", "Draft"] }
        ];
      } else if (name.includes("notice") || name.includes("quote") || name.includes("slider") || name.includes("banner") || name.includes("gallery") || name.includes("video") || name.includes("cms") || name.includes("introduce") || name.includes("service")) {
        headers = ["Title / Headline", "Media Link / Date", "Description", "Status"];
        fields = [
          { id: "f1", label: "Title / Caption", type: "text", placeholder: "e.g. Admission Open Notice 2026" },
          { id: "f2", label: "Media Link / Date", type: "text", placeholder: "e.g. /images/notice-banner.jpg" },
          { id: "f3", label: "Content Description", type: "text", placeholder: "Enter notice body text..." },
          { id: "f4", label: "CMS Status", type: "select", options: ["Published", "Draft", "Archived"] }
        ];
      } else if (name.includes("enquiry") || name.includes("follow") || name.includes("visitor") || name.includes("call") || name.includes("gate") || name.includes("postal") || name.includes("complain") || name.includes("allot") || name.includes("admission")) {
        headers = ["Visitor / Lead Name", "Contact / Reference", "Purpose / Details", "Status"];
        fields = [
          { id: "f1", label: "Lead / Visitor Name", type: "text", placeholder: "e.g. Shyam Sundar" },
          { id: "f2", label: "Contact Phone / ID", type: "text", placeholder: "e.g. 9851000000" },
          { id: "f3", label: "Reason & Discussions", type: "text", placeholder: "e.g. Admission for Class 9" },
          { id: "f4", label: "Status / State", type: "select", options: ["Open", "Pending Followup", "Closed"] }
        ];
      }

      return { headers, fields };
    }

    let currentGenericModule = '';
    let currentSchema = null;

    function getSubjectCategories() {
      try {
        const localData = JSON.parse(localStorage.getItem('generic_module_Academic_Categories') || '[]');
        if (localData && localData.length > 0) {
          return localData.map(c => c.f1);
        }
      } catch (e) {
        console.error("Error loading categories:", e);
      }
      return ["Primary", "Lower Secondary", "Secondary", "Higher Secondary", "Science", "Management", "Humanities"];
    }

    async function populateTeacherDropdown(dropdownId) {
      const maxRetries = 5;
      let retryCount = 0;

      while (retryCount < maxRetries) {
        try {
          const dropdown = document.getElementById(dropdownId);
          if (!dropdown) {
            console.warn(`Dropdown element with ID ${dropdownId} not found (attempt ${retryCount + 1}/${maxRetries})`);
            await new Promise(r => setTimeout(r, 200));
            retryCount++;
            continue;
          }

          // Check if supabase client is available
          if (typeof supabaseDb === 'undefined' || !supabaseDb) {
            console.warn(`Supabase database not initialized (attempt ${retryCount + 1}/${maxRetries})`);
            await new Promise(r => setTimeout(r, 200));
            retryCount++;
            continue;
          }

          console.log('[DEBUG] Fetching teachers from Supabase (attempt ' + (retryCount + 1) + '/' + maxRetries + ')...');

          // Fetch teachers from Supabase
          const { data: teachers, error } = await supabaseDb
            .from('teachers_registry')
            .select('name, code')
            .eq('status', 'Active')
            .order('name', { ascending: true });

          if (error) {
            console.error("Error fetching teachers from Supabase:", error);
            if (retryCount < maxRetries - 1) {
              await new Promise(r => setTimeout(r, 300));
              retryCount++;
              continue;
            }
            dropdown.innerHTML = '<option value="">-- Error loading teachers --</option>';
            return;
          }

          // Clear and repopulate dropdown
          dropdown.innerHTML = '<option value="">-- Select Teacher --</option>';

          // Add teacher options
          if (teachers && teachers.length > 0) {
            teachers.forEach(teacher => {
              if (teacher.name) {
                const option = document.createElement('option');
                option.value = teacher.name;
                option.textContent = teacher.name;
                dropdown.appendChild(option);
              }
            });
            console.log(`✓ Loaded ${teachers.length} teachers from Supabase into dropdown`);
            return; // Success - exit function
          } else {
            console.warn("No active teachers found in Supabase. Register teachers first in Staff/Faculty Management.");
            const option = document.createElement('option');
            option.value = '';
            option.textContent = '(No teachers registered - Add teachers first)';
            option.disabled = true;
            dropdown.appendChild(option);
            return;
          }
        } catch (e) {
          console.error("Error populating teacher dropdown (attempt " + (retryCount + 1) + "):", e);
          if (retryCount < maxRetries - 1) {
            await new Promise(r => setTimeout(r, 300));
            retryCount++;
          } else {
            const dropdown = document.getElementById(dropdownId);
            if (dropdown) {
              dropdown.innerHTML = '<option value="">-- Error loading --</option>';
            }
            return;
          }
        }
      }
    }

    async function populateStudentsForClass(className, dropdownId) {
      try {
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown) {
          console.warn(`Student dropdown with ID ${dropdownId} not found`);
          return;
        }

        // Clear dropdown and show loading state
        dropdown.innerHTML = '<option value="">-- Loading students --</option>';

        if (!className) {
          dropdown.innerHTML = '<option value="">-- Select Student --</option>';
          return;
        }

        // Check if supabase client is available
        if (typeof supabaseDb === 'undefined' || !supabaseDb) {
          console.warn("Supabase database not initialized");
          dropdown.innerHTML = '<option value="">-- Database error --</option>';
          return;
        }

        // Fetch students for the selected class from students_registry
        const { data: students, error } = await supabaseDb
          .from('students_registry')
          .select('roll, name, class')
          .eq('class', className)
          .eq('status', 'Active')
          .order('roll', { ascending: true });

        if (error) {
          console.error("Error fetching students from Supabase:", error);
          dropdown.innerHTML = '<option value="">-- Error loading students --</option>';
          return;
        }

        // Clear and repopulate dropdown
        dropdown.innerHTML = '<option value="">-- Select Student --</option>';

        // Add student options
        if (students && students.length > 0) {
          students.forEach(student => {
            if (student.name) {
              const option = document.createElement('option');
              option.value = student.name;
              option.textContent = `${student.name} (Roll: ${student.roll || 'N/A'})`;
              dropdown.appendChild(option);
            }
          });
          console.log(`✓ Loaded ${students.length} students for class ${className}`);
        } else {
          console.warn(`No students found for class ${className}`);
          const option = document.createElement('option');
          option.value = '';
          option.textContent = '(No students in this class)';
          option.disabled = true;
          dropdown.appendChild(option);
        }
      } catch (e) {
        console.error("Error populating students dropdown:", e);
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
          dropdown.innerHTML = '<option value="">-- Error loading --</option>';
        }
      }
    }

    function setupGenericModule(moduleName, category) {
      currentGenericModule = category.replace(/[^a-zA-Z0-9]/g, '') + '_' + moduleName.replace(/[^a-zA-Z0-9]/g, '');
      
      // Select specific schema or generate one dynamically based on matching keywords
      currentSchema = moduleSchemas[currentGenericModule] || getDynamicSchema(moduleName, category);

      document.getElementById('generic-module-title').textContent = `${category} - ${moduleName} Control`;
      document.getElementById('generic-form-title').textContent = `Add New ${moduleName} Entry`;
      
      // Build Form HTML
      const formContainer = document.getElementById('generic-form-fields');
      let formHTML = '';
      currentSchema.fields.forEach(field => {
        formHTML += `<div class="form-group"><label for="dyn-${field.id}">${field.label}</label>`;
        if (field.type === 'select') {
          let options = field.options;
          if (field.id === 'f5' && currentGenericModule === 'Academic_SubjectSetup') {
            options = getSubjectCategories();
          }
          formHTML += `<select id="dyn-${field.id}" class="form-control">`;
          formHTML += `<option value="">-- Select ${field.label} --</option>`;
          options.forEach(opt => formHTML += `<option value="${opt}">${opt}</option>`);
          formHTML += `</select>`;
        } else if (field.type === 'class-dropdown') {
          formHTML += `<select id="dyn-${field.id}" class="form-control"><option value="">Select a class...</option></select>`;
        } else if (field.type === 'subject-dropdown') {
          formHTML += `<select id="dyn-${field.id}" class="form-control"><option value="">-- Select Subject --</option></select>`;
        } else if (field.type === 'teacher-dropdown') {
          formHTML += `<select id="dyn-${field.id}" class="form-control"><option value="">-- Select Teacher --</option></select>`;
        } else if (field.type === 'student-dropdown') {
          formHTML += `<select id="dyn-${field.id}" class="form-control"><option value="">-- Select Student --</option></select>`;
        } else {
          formHTML += `<input type="${field.type}" id="dyn-${field.id}" class="form-control" placeholder="${field.placeholder}" required>`;
        }
        formHTML += `</div>`;
      });
      formContainer.innerHTML = formHTML;

      // Populate dropdown fields
      currentSchema.fields.forEach(field => {
        if (field.type === 'class-dropdown' && window.classHandler) {
          setTimeout(() => {
            window.classHandler.populateClassDropdown(`dyn-${field.id}`).catch(e => console.error(e));
          }, 300);
        } else if (field.type === 'subject-dropdown' && window.subjectHandler) {
          setTimeout(() => {
            window.subjectHandler.populateSubjectDropdown(`dyn-${field.id}`).catch(e => console.error(e));
          }, 300);
        } else if (field.type === 'teacher-dropdown') {
          setTimeout(() => {
            populateTeacherDropdown(`dyn-${field.id}`).catch(e => console.error(e));
          }, 300);
        }
      });

      // Handle Student Remarks class change event
      if (currentGenericModule === 'Academic_StudentRemarks') {
        const classDropdown = document.getElementById('dyn-f1');
        const studentDropdown = document.getElementById('dyn-f2');
        if (classDropdown && studentDropdown) {
          classDropdown.addEventListener('change', function() {
            populateStudentsForClass(this.value, 'dyn-f2');
          });
        }
      }

      // Build Table Headers
      const tableHeader = document.getElementById('generic-table-header');
      let thHTML = '';
      currentSchema.headers.forEach(h => thHTML += `<th>${h}</th>`);
      thHTML += `<th>Actions</th>`;
      tableHeader.innerHTML = thHTML;

      renderGenericTable();
    }

    async function renderGenericTable() {
      const tbody = document.getElementById('generic-tbody');
      tbody.innerHTML = '';
      
      let data = [];
      
      // Load from database for classes
      if (currentGenericModule === 'Academic_ClassSetup' && supabaseDb) {
        try {
          const { data: classesData, error } = await supabaseDb.from('classes').select('*').order('created_at', { ascending: false });
          if (error) {
            console.error("Error loading classes:", error);
            data = [];
          } else {
            // Transform database data to match the schema format
            data = classesData.map(cls => ({
              id: cls.id,
              f1: cls.grade_level,
              f2: cls.section_name,
              f3: cls.class_teacher || '',
              f4: cls.status
            }));
          }
        } catch(err) {
          console.error("Exception loading classes:", err);
          data = [];
        }
      } else if (currentGenericModule === 'Academic_SubjectSetup' && supabaseDb) {
        try {
          const { data: subjectsData, error } = await supabaseDb.from('subjects').select('*').order('created_at', { ascending: false });
          if (error) {
            console.error("Error loading subjects:", error);
            data = [];
          } else {
            // Transform database data to match the schema format
            data = subjectsData.map(cls => ({
              id: cls.id,
              f1: cls.subject_name,
              f2: cls.subject_code,
              f3: cls.subject_type,
              f6: cls.credit_hour || '',
              f5: cls.category || 'Secondary',
              f4: cls.status
            }));
          }
        } catch(err) {
          console.error("Exception loading subjects:", err);
          data = [];
        }
      } else {
        // Fallback to localStorage
        data = JSON.parse(localStorage.getItem('generic_module_' + currentGenericModule) || '[]');
      }
      
      window.currentGenericData = data; // Store globally for edit functionality
      
      if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${currentSchema.headers.length + 1}" style="text-align:center; color:var(--text-muted); padding:2rem;">No entries found for this module.</td></tr>`;
        return;
      }
      
      data.forEach(d => {
        let trHTML = '<tr>';
        // Render each field value mapping to headers
        currentSchema.fields.forEach((field, index) => {
          let val = d[field.id] || '';
          if (index === 0) trHTML += `<td><strong>${val}</strong></td>`;
          else if (field.type === 'select') {
             let badgeClass = (val.includes('Active') || val.includes('Completed') || val.includes('Available') || val.includes('Income')) ? 'approved' : 
                              (val.includes('Pending') || val.includes('Issued')) ? 'pending' : 'rejected';
             trHTML += `<td><span class="status-badge ${badgeClass}">${val}</span></td>`;
          } else {
             trHTML += `<td>${val}</td>`;
          }
        });
        
        trHTML += `
            <td style="display:flex; gap:0.5rem; align-items:center;">
              <button type="button" onclick="editGenericEntry('${d.id}')" style="background:none; border:none; color:var(--primary); font-weight:700; cursor:pointer; font-size:0.8rem;">✏️ Edit</button>
              <button type="button" onclick="deleteGenericEntry('${d.id}')" style="background:none; border:none; color:var(--danger); font-weight:700; cursor:pointer; font-size:0.8rem;">&times; Delete</button>
            </td>
          </tr>
        `;
        tbody.innerHTML += trHTML;
      });
    }

    async function handleGenericSubmit(event) {
      event.preventDefault();
      
      // Check if admin is logged in
      if (!adminUser) {
        alert('❌ You must be logged in as admin to save records. Please login first.');
        return;
      }
      
      let editId = document.getElementById('generic-form').dataset.editId;
      let entry = { id: editId ? editId : Date.now() };
      currentSchema.fields.forEach(field => {
        entry[field.id] = document.getElementById(`dyn-${field.id}`).value;
      });

      // Handle database insert for classes
      if (currentGenericModule === 'Academic_ClassSetup' && supabaseDb) {
        try {
          // Try to insert with created_by column
          let classData = {
            grade_level: entry.f1,
            section_name: entry.f2,
            class_teacher: entry.f3,
            status: entry.f4,
            created_by: adminUser.email
          };
          
          let { data, error } = await supabaseDb.from('classes').insert([classData]).select();
          
          // If error is about missing created_by column, try without it
          if (error && error.message.includes("'created_by'")) {
            console.log("created_by column not found, retrying without it...");
            classData = {
              grade_level: entry.f1,
              section_name: entry.f2,
              class_teacher: entry.f3,
              status: entry.f4
            };
            
            const retry = await supabaseDb.from('classes').insert([classData]).select();
            data = retry.data;
            error = retry.error;
          }
          
          if (error) {
            console.error("Database error:", error);
            // Show helpful error messages
            if (error.message.includes('row-level security policy') || error.message.includes('policies')) {
              alert("⚠️ DATABASE SETUP REQUIRED\n\nYou need to run the SQL setup to enable database saving:\n\n1. Open ADMIN_RLS_POLICIES.sql file\n2. Copy all SQL code\n3. Go to Supabase Dashboard → SQL Editor\n4. Paste and run the SQL\n\nFor now, data will be saved locally.");
            } else if (error.message.includes('column')) {
              alert("⚠️ DATABASE SCHEMA ERROR\n\nRun the ADMIN_RLS_POLICIES.sql setup to add required columns.\n\nData has been saved locally.");
            } else {
              alert("❌ Error saving class: " + error.message + "\n\nData saved to local storage.");
            }
          } else {
            alert("✅ Class added successfully to database!");
          }
        } catch(err) {
          console.error("Exception saving class:", err);
          alert("⚠️ Error saving to database.\n\nMake sure to run ADMIN_RLS_POLICIES.sql setup first.\nData has been saved locally.");
        }
      } else if (currentGenericModule === 'Academic_SubjectSetup' && supabaseDb) {
        try {
          let subjectData = {
            subject_name: entry.f1,
            subject_code: entry.f2,
            subject_type: entry.f3,
            credit_hour: entry.f6,
            category: entry.f5,
            status: entry.f4,
            created_by: adminUser.email
          };
          
          let dbData, error;
          if (editId) {
             const result = await supabaseDb.from('subjects').update(subjectData).eq('id', editId).select();
             dbData = result.data; error = result.error;
          } else {
             const result = await supabaseDb.from('subjects').insert([subjectData]).select();
             dbData = result.data; error = result.error;
          }
          
          if (error) {
            console.error("Database error:", error);
            if (error.message.includes("'credit_hour'")) {
               alert("⚠️ DATABASE SCHEMA ERROR\n\nPlease run SQL setup to add 'credit_hour' column to 'subjects' table. Data has been saved locally.");
            } else {
               alert("❌ Error saving subject: " + error.message + "\n\nData saved to local storage.");
            }
          } else {
            alert(editId ? "✅ Subject updated successfully in database!" : "✅ Subject added successfully to database!");
            if (window.subjectHandler) window.subjectHandler.invalidateCache();
          }
        } catch(err) {
          console.error("Exception saving subject:", err);
          alert("⚠️ Error saving to database.\nData has been saved locally.");
        }
      } else if (currentGenericModule === 'Academic_Categories' && supabaseDb) {
        try {
          let catData = { category_name: entry.f1, category_type: entry.f2, description: entry.f3, status: entry.f4 };
          if (editId) await supabaseDb.from('categories').update(catData).eq('id', editId);
          else await supabaseDb.from('categories').insert([catData]);
        } catch(e) { console.error(e); }
      } else if (currentGenericModule === 'Academic_AddEmployee' && supabaseDb) {
        try {
          let empData = { name: entry.f1, role: entry.f3, phone: entry.f4, employee_type: entry.f2, status: entry.f5 };
          if (editId) await supabaseDb.from('employees').update(empData).eq('id', editId);
          else await supabaseDb.from('employees').insert([empData]);
        } catch(e) { console.error(e); }
      } else if (currentGenericModule === 'Academic_Report' && supabaseDb) {
        try {
          let repData = { report_title: entry.f1, module_area: entry.f2, generated_by: entry.f3, status: entry.f4, file_url: entry.f5 };
          if (editId) await supabaseDb.from('reports').update(repData).eq('id', editId);
          else await supabaseDb.from('reports').insert([repData]);
        } catch(e) { console.error(e); }
      } else if (currentGenericModule === 'Academic_TeacherProfiles' && supabaseDb) {
        try {
          let tpData = { teacher_name: entry.f1, teacher_role: entry.f2, teacher_email: entry.f3, teacher_phone: entry.f4, teacher_description: entry.f5, teacher_image_url: entry.f6, is_active: (entry.f7 === 'Active') };
          if (editId) await supabaseDb.from('teacher_profiles').update(tpData).eq('id', editId);
          else await supabaseDb.from('teacher_profiles').insert([tpData]);
        } catch(e) { console.error(e); }
      }

      // Also save to localStorage as backup/fallback
      let localData = JSON.parse(localStorage.getItem('generic_module_' + currentGenericModule) || '[]');
      if (editId) {
         const idx = localData.findIndex(d => String(d.id) === String(editId));
         if (idx !== -1) localData[idx] = entry;
         
         document.getElementById('generic-form').removeAttribute('data-edit-id');
         const submitBtn = document.querySelector('#generic-form button[type="submit"]');
         if (submitBtn) submitBtn.innerText = "Save Record to System";
      } else {
         localData.push(entry);
      }
      localStorage.setItem('generic_module_' + currentGenericModule, JSON.stringify(localData));
      
      event.target.reset();
      renderGenericTable();
    }

    async function deleteGenericEntry(id) {
      if(!confirm("Are you sure you want to delete this record?")) return;
      
      // Handle database delete for classes
      if (currentGenericModule === 'Academic_ClassSetup' && supabaseDb) {
        try {
          const { error } = await supabaseDb.from('classes').delete().eq('id', id);
          if (error) {
            console.error("Database error:", error);
            alert("❌ Error deleting class: " + error.message);
            return;
          }
        } catch(err) {
          console.error("Exception deleting class:", err);
        }
      } else if (currentGenericModule === 'Academic_SubjectSetup' && supabaseDb) {
        try {
          const { error } = await supabaseDb.from('subjects').delete().eq('id', id);
          if (error) {
            console.error("Database error:", error);
            alert("❌ Error deleting subject: " + error.message);
            return;
          } else {
            if (window.subjectHandler) window.subjectHandler.invalidateCache();
          }
        } catch(err) {
          console.error("Exception deleting subject:", err);
        }
      }
      
      let data = JSON.parse(localStorage.getItem('generic_module_' + currentGenericModule) || '[]');
      data = data.filter(d => d.id !== id);
      localStorage.setItem('generic_module_' + currentGenericModule, JSON.stringify(data));
      renderGenericTable();
    }

    window.editGenericEntry = function(id) {
       const data = window.currentGenericData || [];
       const record = data.find(d => String(d.id) === String(id));
       if (!record) return;
       
       currentSchema.fields.forEach(field => {
         const el = document.getElementById(`dyn-${field.id}`);
         if (el) el.value = record[field.id] || '';
       });
       
       document.getElementById('generic-form').dataset.editId = id;
       const submitBtn = document.querySelector('#generic-form button[type="submit"]');
       if (submitBtn) submitBtn.innerText = "Update Record in System";
       
       window.scrollTo({ top: document.getElementById('generic-form').offsetTop - 100, behavior: 'smooth' });
    };

    // ── STUDENTS DIRECTORY ──
    // OLD FUNCTION REMOVED - Use loadStudentAccounts() instead for proper credential display

    async function enrollStudent(event) {
      event.preventDefault();
      const name = document.getElementById('std-name').value;
      const roll = parseInt(document.getElementById('std-roll').value);
      const className = document.getElementById('std-class').value;

      if (supabaseDb) {
        try {
          const { error } = await supabaseDb.from('students_registry').insert([{
            roll: roll,
            name: name,
            class: className,
            attendance: "100.0%",
            overall_gpa: "0.00",
            status: "Active",
            billing_state: "unpaid"
          }]);
          if (error) {
            alert("Error registering student: " + error.message);
            return;
          }
        } catch(err) {
          console.error("DB Sync failed:", err);
        }
      }

      const students = JSON.parse(localStorage.getItem('students_registry') || '[]');
      if (!students.find(x => x.roll === roll)) {
        students.push({ roll: roll, name: name, class: className, attendance: "100.0%", status: "Active" });
        localStorage.setItem('students_registry', JSON.stringify(students));
      }
      
      document.getElementById('std-name').value = '';
      document.getElementById('std-roll').value = '';
      document.getElementById('std-class').value = '';
      
      renderDashboardMetrics();
      alert("Success! Student enrolled into database. Credentials student-portal is dynamically active!");
    }

    // ── FACULTY DIRECTORY ──
    function renderTeachers() {
      loadTeacherAccounts();
    }

    async function loadTeacherAccounts() {
      const tbody = document.getElementById('admin-teachers-tbody');
      if (!tbody) return;

      try {
        let credentials = [];
        if (supabaseDb) {
          const result = await getTeacherCredentials(false);
          if (result.success) {
            credentials = result.data;
          } else {
            credentials = getTeacherCredentialsFromCache();
          }
        } else {
          credentials = getTeacherCredentialsFromCache();
        }

        let teachers = [];
        try {
          teachers = JSON.parse(localStorage.getItem('teachers_registry') || '[]');
        } catch(e) {}

        if (teachers.length === 0 && credentials.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem; color: #7f8c8d;">No faculty registered yet. Register one using the form.</td></tr>';
          return;
        }

        tbody.innerHTML = teachers.map(teacher => {
          const cred = credentials.find(c => c.teacher_code === teacher.code);
          const email = cred ? cred.teacher_email : '-';
          const isActive = cred ? cred.is_active : false;
          const statusText = cred ? (cred.is_active ? 'Active' : 'Inactive') : 'No Login';
          const badgeBg = cred ? (cred.is_active ? '#d1fae5' : '#fee2e2') : '#f3f4f6';
          const badgeColor = cred ? (cred.is_active ? '#065f46' : '#7f1d1d') : '#4b5563';
          
          let actionButtons = '';
          if (cred) {
            actionButtons = `
              <button onclick="editTeacherAccount(${cred.id}, '${teacher.code}', '${teacher.name.replace(/'/g, "\\'")}', '${email}')" style="padding: 0.35rem 0.6rem; background: #f59e0b; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem; margin-right:0.25rem;" onmouseover="this.style.background='#d97706'" onmouseout="this.style.background='#f59e0b'">
                ✏️ Edit
              </button>
              <button onclick="toggleTeacherStatus(${cred.id}, '${teacher.code}', ${!cred.is_active})" style="padding: 0.35rem 0.6rem; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem; margin-right:0.25rem;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
                ${cred.is_active ? 'Disable' : 'Enable'}
              </button>
              <button onclick="deleteTeacherAccount('${teacher.code}', ${cred.id})" style="padding: 0.35rem 0.6rem; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;" onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">
                Delete
              </button>
            `;
          } else {
            actionButtons = `
              <button onclick="editTeacherWithoutCred('${teacher.code}', '${teacher.name.replace(/'/g, "\\'")}', '${teacher.subject}')" style="padding: 0.35rem 0.6rem; background: #f59e0b; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem; margin-right:0.25rem;" onmouseover="this.style.background='#d97706'" onmouseout="this.style.background='#f59e0b'">
                ✏️ Edit
              </button>
              <button onclick="promptCreateCredentials('${teacher.code}', '${teacher.name.replace(/'/g, "\\'")}')" style="padding: 0.35rem 0.6rem; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">
                Create Login
              </button>
            `;
          }

          return `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 0.75rem;"><strong>${teacher.code}</strong></td>
              <td style="padding: 0.75rem;">${teacher.name}</td>
              <td style="padding: 0.75rem;">${teacher.subject}</td>
              <td style="padding: 0.75rem;">${email}</td>
              <td style="padding: 0.75rem;">
                <span style="background:${badgeBg}; color:${badgeColor}; padding:0.25rem 0.75rem; border-radius:20px; font-size:0.8rem; font-weight:600;">
                  ${statusText}
                </span>
              </td>
              <td style="padding: 0.75rem;">
                ${actionButtons}
              </td>
            </tr>
          `;
        }).join('');
        
        // Setup search functionality
        setupFacultySearch();
        
        // Update faculty count
        const countBadge = document.getElementById('faculty-count');
        if (countBadge) {
          countBadge.textContent = tbody.querySelectorAll('tr').length + ' Faculty';
        }
      } catch(e) {
        console.error('Error loading teacher accounts:', e);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem; color: #ef4444;">Error loading teacher accounts.</td></tr>';
      }
    }

    async function enrollTeacher(event) {
      event.preventDefault();
      
      const name = document.getElementById('tch-name').value.trim();
      const code = document.getElementById('tch-code').value.trim();
      const email = document.getElementById('tch-email').value.trim();
      const password = document.getElementById('tch-password').value;
      const passwordConfirm = document.getElementById('tch-password-confirm').value;

      // Get all subject values
      const subjectInputs = document.querySelectorAll('.subject-input');
      const subjects = [];
      subjectInputs.forEach(input => {
        const value = input.value.trim();
        if (value) subjects.push(value);
      });

      if (!name || !code || !email || !password || subjects.length === 0) {
        alert("Please fill in all required fields including at least one subject.");
        return;
      }

      if (password !== passwordConfirm) {
        alert("Passwords do not match. Please try again.");
        return;
      }

      if (password.length < 8) {
        alert("Password must be at least 8 characters long.");
        return;
      }

      // Join subjects with comma for storage
      const subjectString = subjects.join(', ');

      if (supabaseDb) {
        try {
          const { error } = await supabaseDb.from('teachers_registry').insert([{
            code: code,
            name: name,
            subject: subjectString,
            sections: "To be assigned",
            status: "Active"
          }]);
          if (error) {
            if (error.message.includes('schema cache') || error.message.includes('Could not find')) {
              alert("❌ Error: Database tables not initialized.\n\nPlease:\n1. Check DATABASE_SETUP_GUIDE.md\n2. Run setup.sql in Supabase SQL Editor\n3. Then try again\n\nError: " + error.message);
            } else if (error.message.includes('duplicate')) {
              alert("❌ Error: Faculty code '" + code + "' already exists. Use a different code.");
            } else {
              alert("Error registering faculty in registry: " + error.message);
            }
            console.error('Teacher registry error:', error);
            return;
          }
        } catch(err) {
          console.error("DB Sync failed:", err);
        }
      }

      // Update localStorage fallback
      const teachers = JSON.parse(localStorage.getItem('teachers_registry') || '[]');
      if (!teachers.find(x => x.code.toLowerCase() === code.toLowerCase())) {
        teachers.push({ code: code, name: name, subject: subjectString, sections: "To be assigned", status: "Active" });
        localStorage.setItem('teachers_registry', JSON.stringify(teachers));
      }

      try {
        const credentialData = {
          teacher_code: code,
          teacher_name: name,
          teacher_email: email,
          teacher_password: password,
          is_active: true
        };

        const result = await createTeacherCredential(credentialData);
        if (result.success) {
          alert(`✅ Faculty Lecturer Registered & Account Created Successfully!\n\nEmail/Login: ${email}\nPassword: ${password}\n\nSubjects: ${subjectString}\n\nShare these credentials with the teacher.`);
          clearTeacherForm();
          loadTeacherAccounts();
          renderDashboardMetrics();
        } else {
          if (result.error.includes('schema cache') || result.error.includes('Could not find')) {
            alert('❌ Error: Database table "teacher_credentials" not initialized.\n\nPlease:\n1. Check DATABASE_SETUP_GUIDE.md\n2. Run setup.sql in Supabase SQL Editor\n3. Then try again\n\nError: ' + result.error);
          } else {
            alert("Teacher registered in registry, but failed to create portal login: " + result.error);
          }
          console.error('Credential creation error:', result.error);
        }
      } catch(e) {
        console.error("Credential creation error:", e);
        alert("Error creating login credentials: " + e.message);
      }
    }

    async function addSubjectField() {
      const container = document.getElementById('subjects-container');
      const newSubject = document.createElement('div');
      newSubject.className = 'subject-item';
      newSubject.style.cssText = 'display:flex; gap:0.5rem; margin-bottom:0.5rem; align-items:center;';
      newSubject.innerHTML = `
        <select class="subject-input form-control" required style="border:2px solid #e5e7eb; border-radius:6px; padding:0.6rem; flex:1;">
          <option value="">-- Select Subject --</option>
        </select>
        <button type="button" class="remove-subject-btn" onclick="removeSubject(this)" style="background:#ef4444; color:white; border:none; border-radius:6px; padding:0.6rem 0.9rem; cursor:pointer; font-size:0.9rem; transition:all 0.3s; font-weight:600;" title="Remove subject" onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">Remove</button>
      `;
      container.appendChild(newSubject);
      // Populate the new dropdown
      const selectEl = newSubject.querySelector('.subject-input');
      if (window.subjectHandler) {
        await window.subjectHandler.populateSubjectDropdownElement(selectEl);
      }
      selectEl.focus();
    }

    async function populateAllSubjectDropdowns() {
      if (!window.subjectHandler) return;
      const dropdowns = document.querySelectorAll('#subjects-container .subject-input');
      for (const dropdown of dropdowns) {
        await window.subjectHandler.populateSubjectDropdownElement(dropdown);
      }
    }

    function removeSubject(button) {
      const subjectItem = button.closest('.subject-item');
      const container = document.getElementById('subjects-container');
      if (container.querySelectorAll('.subject-item').length > 1) {
        subjectItem.remove();
      } else {
        alert('At least one subject is required.');
      }
    }

    async function clearTeacherForm() {
      const form = document.getElementById('teacher-enrollment-form');
      if (form) form.reset();
      
      // Reset subjects to just one dropdown
      const container = document.getElementById('subjects-container');
      container.innerHTML = `
        <div class="subject-item" style="display:flex; gap:0.5rem; margin-bottom:0.5rem; align-items:center;">
          <select class="subject-input form-control" required style="border:2px solid #e5e7eb; border-radius:6px; padding:0.6rem; flex:1;">
            <option value="">-- Select Subject --</option>
          </select>
          <button type="button" class="remove-subject-btn" onclick="removeSubject(this)" style="background:#ef4444; color:white; border:none; border-radius:6px; padding:0.6rem 0.9rem; cursor:pointer; font-size:0.9rem; transition:all 0.3s; font-weight:600;" title="Remove subject" onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">Remove</button>
        </div>
      `;
      await populateAllSubjectDropdowns();
      document.getElementById('tch-name').focus();
    }

    async function toggleTeacherStatus(id, teacherCode, newStatus) {
      try {
        const result = await updateTeacherCredential(id, { is_active: newStatus });
        if (result.success) {
          alert(newStatus ? 'Teacher account enabled' : 'Teacher account disabled');
          loadTeacherAccounts();
        } else {
          alert('Error updating account status: ' + result.error);
        }
      } catch(e) {
        alert('Error: ' + e.message);
      }
    }

    async function deleteTeacherAccount(teacherCode, credId) {
      if (!confirm('Are you sure you want to delete this faculty account and all associated portal credentials? This action is irreversible.')) return;
      
      try {
        if (supabaseDb) {
          const { error } = await supabaseDb
            .from('teachers_registry')
            .delete()
            .eq('code', teacherCode);
          
          if (error) {
            alert('Error deleting faculty registry: ' + error.message);
            return;
          }
        }

        if (supabaseDb && credId) {
          await deleteTeacherCredential(credId);
        }

        let teachers = JSON.parse(localStorage.getItem('teachers_registry') || '[]');
        teachers = teachers.filter(t => t.code !== teacherCode);
        localStorage.setItem('teachers_registry', JSON.stringify(teachers));

        await syncTeacherCredentials();

        alert('Faculty account deleted successfully');
        loadTeacherAccounts();
        renderDashboardMetrics();
      } catch(e) {
        alert('Error: ' + e.message);
      }
    }

    async function promptCreateCredentials(teacherCode, teacherName) {
      const email = prompt(`Enter Email Address for ${teacherName} (${teacherCode}):`);
      if (!email) return;
      const password = prompt(`Enter Portal Login Password (min 8 characters):`);
      if (!password || password.length < 8) {
        alert('Password must be at least 8 characters long.');
        return;
      }

      try {
        const credentialData = {
          teacher_code: teacherCode,
          teacher_name: teacherName,
          teacher_email: email,
          teacher_password: password,
          is_active: true
        };

        const result = await createTeacherCredential(credentialData);
        if (result.success) {
          alert(`✓ Portal Login Credentials Created Successfully!\n\nEmail: ${email}\nPassword: ${password}`);
          loadTeacherAccounts();
        } else {
          alert('Error creating credentials: ' + result.error);
        }
      } catch(e) {
        alert('Error: ' + e.message);
      }
    }

    // ── FACULTY DIRECTORY SEARCH ──
    function setupFacultySearch() {
      const searchInput = document.getElementById('faculty-search');
      if (!searchInput) return;
      
      searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        const rows = document.querySelectorAll('#admin-teachers-tbody tr');
        let visibleCount = 0;
        
        rows.forEach(row => {
          const text = row.innerText.toLowerCase();
          if (searchTerm === '' || text.includes(searchTerm)) {
            row.style.display = '';
            visibleCount++;
          } else {
            row.style.display = 'none';
          }
        });
        
        // Update count
        const countBadge = document.getElementById('faculty-count');
        if (countBadge) {
          countBadge.textContent = visibleCount + ' Faculty';
        }
        
        // Show no results message if needed
        if (visibleCount === 0 && searchTerm !== '') {
          const tbody = document.getElementById('admin-teachers-tbody');
          if (!tbody.querySelector('.no-results')) {
            const noResults = document.createElement('tr');
            noResults.className = 'no-results';
            noResults.innerHTML = `<td colspan="6" style="text-align:center; padding:2rem; color:#ef4444; font-weight:600;">No faculty found matching "${searchTerm}"</td>`;
            tbody.appendChild(noResults);
          }
        } else {
          const noResults = document.querySelector('#admin-teachers-tbody .no-results');
          if (noResults) noResults.remove();
        }
      });
    }

    function resetFacultySearch() {
      const searchInput = document.getElementById('faculty-search');
      if (searchInput) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
        searchInput.focus();
      }
    }

    // ── FINANCE & FEE AUDITING ──
    function renderPayments() {
      const tbody = document.getElementById('admin-payments-tbody');
      if (!tbody) return;
      tbody.innerHTML = '';

      const payments = JSON.parse(localStorage.getItem('fee_payments') || '[]');
      
      if (payments.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align:center; padding:2rem; font-weight:600; color:var(--text-muted);">🎉 All payment queues cleared and verified cleanly!</td>
          </tr>
        `;
        return;
      }

      payments.forEach(p => {
        let badgeClass = p.status === 'approved' ? 'approved' : p.status === 'rejected' ? 'rejected' : 'pending';
        let actionButtons = '';
        if (p.status === 'pending') {
          actionButtons = `
            <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
              <button onclick="approvePayment(${p.id})" class="submit-btn" style="padding:0.4rem 0.8rem; font-size:0.8rem; background:var(--success);">Clear Dues</button>
              <button onclick="rejectPayment(${p.id})" class="submit-btn" style="padding:0.4rem 0.8rem; font-size:0.8rem; background:var(--danger);">Reject</button>
            </div>
          `;
        } else {
          actionButtons = `
            <div style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
              <span class="status-badge ${badgeClass}" style="text-transform:uppercase;">${p.status === 'approved' ? 'CLEARED ✓' : p.status.toUpperCase()}</span>
              ${p.status === 'approved' ? `<button onclick="generateAdminBill(${p.roll})" class="submit-btn" style="padding:0.3rem 0.6rem; font-size:0.7rem; background:var(--accent);">Generate Bill</button>` : ''}
              <button onclick="deletePaymentRecord(${p.id})" class="submit-btn" style="padding:0.3rem 0.6rem; font-size:0.7rem; background:var(--danger);">🗑 Delete</button>
            </div>
          `;
        }

        tbody.innerHTML += `
          <tr id="admin-pay-row-${p.id}">
            <td><strong>${p.name} (#Roll-${p.roll})</strong></td>
            <td>${p.category}</td>
            <td><code style="background:#f5f3ff; padding:0.2rem 0.5rem; border-radius:4px; font-weight:700;">${p.txn_id || p.txnId}</code></td>
            <td>
              <button onclick="openAdminProofModal('${p.proof_file || p.proofFile}')" style="background:none; border:none; color:var(--accent); font-weight:700; cursor:pointer;">🖼️ View Screenshot</button>
            </td>
            <td>${actionButtons}</td>
          </tr>
        `;
      });
    }

    function renderGlobalFeeLedger() {
      const tbody = document.getElementById('admin-global-fee-ledger-tbody');
      if (!tbody) return;
      
      // Show loading spinner first
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:3rem;"><div style="display:inline-block; width:30px; height:30px; border:3px solid #e2e8f0; border-top:3px solid var(--primary); border-radius:50%; animation: spin 0.8s linear infinite;"></div><p style="margin-top:1rem; color:var(--text-muted); font-weight:600;">Compiling Fee Ledgers...</p></td></tr>`;

      setTimeout(() => {
        try {
          const students = JSON.parse(localStorage.getItem('students_registry') || '[]');
          const allFees = JSON.parse(localStorage.getItem('student_fees') || '[]');
          
          if (!students || students.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">No students registered in the system.</td></tr>`;
            return;
          }

          let studentsWithFees = 0;
          let htmlBuffer = "";

          students.forEach(student => {
            if (!student || !student.roll) return;
            // Find all fees for this student safely
            const studentFees = allFees.filter(f => f && (String(f.studentRoll) === String(student.roll) || String(f.student_roll) === String(student.roll)));
            
            if (!studentFees || studentFees.length === 0) return; // Skip students with no assigned fees
            studentsWithFees++;

            let totalDue = 0;
            let totalPaid = 0;
            let hasUnderReview = false;
            let hasRejected = false;

            studentFees.forEach(fee => {
              const status = (fee.status || 'unpaid').toLowerCase();
              const amount = parseFloat(fee.amount || 0);
              totalDue += amount;

              if (status === 'paid' || status === 'cleared') {
                totalPaid += amount;
              } else if (status === 'under review') {
                hasUnderReview = true;
              } else if (status === 'rejected') {
                hasRejected = true;
              }
            });

            const remainingBalance = totalDue - totalPaid;
            let overallStatus = '';
            let badgeClass = '';

            if (remainingBalance <= 0 && totalDue > 0) {
              overallStatus = 'Cleared ✓';
              badgeClass = 'approved';
            } else if (hasUnderReview) {
              overallStatus = 'Under Review ⏳';
              badgeClass = 'pending-verification';
            } else if (hasRejected) {
              overallStatus = 'Rejected ❌';
              badgeClass = 'rejected';
            } else if (remainingBalance > 0) {
              overallStatus = 'Pending / Unpaid';
              badgeClass = 'pending';
            }

            htmlBuffer += `
              <tr>
                <td><strong>${student.name}</strong> <br><small>Roll: ${student.roll}</small></td>
                <td>Rs. ${totalDue.toLocaleString('en-IN')}</td>
                <td style="color:var(--success); font-weight:600;">Rs. ${totalPaid.toLocaleString('en-IN')}</td>
                <td style="color:var(--danger); font-weight:600;">Rs. ${remainingBalance.toLocaleString('en-IN')}</td>
                <td><span class="status-badge ${badgeClass}">${overallStatus}</span></td>
                <td>
                  <div style="display:flex; flex-direction:column; gap:0.4rem;">
                    <button onclick="document.getElementById('ledger-search').value = '${student.roll}'; switchPage('fee-ledger', document.querySelector('[data-page=\\\'fee-ledger\\\']')); loadFeeLedger();" class="submit-btn" style="padding:0.3rem 0.6rem; font-size:0.7rem; background: #1e293b; color: white;">View Ledger</button>
                    ${remainingBalance > 0 ? `<button onclick="markCashPaid(${student.roll})" class="submit-btn" style="padding:0.3rem 0.6rem; font-size:0.7rem; background:var(--success);">Mark Cash Paid</button>` : ''}
                    <button onclick="generateAdminBill(${student.roll})" class="submit-btn" style="padding:0.3rem 0.6rem; font-size:0.7rem; background:var(--accent);">Generate Bill</button>
                  </div>
                </td>
              </tr>
            `;
          });

          if (studentsWithFees === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">No fees assigned to any students yet.</td></tr>`;
          } else {
            tbody.innerHTML = htmlBuffer;
          }
        } catch (e) {
          console.error("Error rendering global fee ledger:", e);
          tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--danger);">Error loading fee data. Please refresh the page.</td></tr>`;
        }
      }, 600); // 600ms artificial delay to show loader and prevent main thread blocking
    }

    async function markCashPaid(roll) {
      if (!confirm("Are you sure you want to mark ALL pending/unpaid fees for this student as Paid via Cash?")) return;
      
      const allFees = JSON.parse(localStorage.getItem('student_fees') || '[]');
      let updatedFees = false;
      allFees.forEach(f => {
        if (String(f.studentRoll) === String(roll) || String(f.student_roll) === String(roll)) {
          const s = (f.status || '').toLowerCase();
          if (s === 'unpaid' || s === 'pending' || s === 'under review') {
             f.status = 'cleared';
             f.paidAmount = f.amount || 0;
             f.paidDate = new Date().toISOString().split('T')[0];
             updatedFees = true;
          }
        }
      });

      if (updatedFees) {
        localStorage.setItem('student_fees', JSON.stringify(allFees));
        if (typeof supabaseDb !== 'undefined' && supabaseDb) {
          try {
            await supabaseDb.from('school_config').delete().eq('key', 'student_fees_json');
            await supabaseDb.from('school_config').insert([{ key: 'student_fees_json', val: JSON.stringify(allFees) }]);
            await supabaseDb.from('students_registry').update({ billing_state: 'paid' }).eq('roll', roll);
          } catch(e) { console.error("Error updating fees in DB:", e); }
        }
        alert("Success! All pending dues for this student have been cleared.");
        renderGlobalFeeLedger();
        renderDashboardMetrics();
      } else {
        alert("No unpaid fees found for this student.");
      }
    }

    function generateAdminBill(roll) {
      const students = JSON.parse(localStorage.getItem('students_registry') || '[]');
      const student = students.find(s => String(s.roll) === String(roll)) || { name: 'Student', roll: roll, class: 'Unknown' };
      const allFees = JSON.parse(localStorage.getItem('student_fees') || '[]');
      
      const studentFees = allFees.filter(f => String(f.studentRoll) === String(roll) || String(f.student_roll) === String(roll));
      if (studentFees.length === 0) {
        alert("No fees found to generate a bill.");
        return;
      }

      const totalAmount = studentFees.reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);
      const paidAmount = studentFees.filter(f => (f.status || '').toLowerCase() === 'paid' || (f.status || '').toLowerCase() === 'cleared').reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);
      const remainingAmount = totalAmount - paidAmount;
      const today = new Date().toLocaleDateString('ne-NP') || new Date().toLocaleDateString();
      const txnCode = 'CASH-' + Math.floor(1000 + Math.random() * 9000);

      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
         alert('Please allow popups to view the invoice.');
         return;
      }
      
      let html = `
        <html>
        <head>
          <title>Fee Receipt - ${student.name}</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 20px; background: #fff; color: #000; }
            .receipt-container { 
              max-width: 600px; margin: 0 auto; border: 1px solid #000; padding: 20px; 
              background: #fdfbc7; 
            }
            .header-flex { display: flex; justify-content: space-between; align-items: flex-start; }
            .school-header { text-align: center; margin-bottom: 20px; flex-grow: 1; }
            .school-header h1 { margin: 0; font-size: 24px; color: #000; }
            .school-header p { margin: 2px 0; font-size: 14px; }
            .pan-no { font-weight: bold; font-size: 14px; margin-top: 5px; }
            .top-meta { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
            .student-info { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 15px; border-bottom: 1px solid #000; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 14px; }
            th { background: rgba(0,0,0,0.05); }
            .amount-col { text-align: right; width: 120px; }
            .paisa-col { text-align: right; width: 60px; }
            .signature-area { margin-top: 50px; display: flex; justify-content: space-between; }
            .signature-box { border-top: 1px solid #000; width: 150px; text-align: center; font-size: 14px; padding-top: 5px; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            @media print {
              body { background: #fff; -webkit-print-color-adjust: exact; padding: 0; }
              .receipt-container { border: none; background: #fdfbc7 !important; margin: 0; }
              .no-print { display: none !important; }
            }
            .toolbar { text-align: center; margin-bottom: 20px; }
            .toolbar button { background: #1e40af; color: #fff; border: none; padding: 10px 20px; font-size: 16px; border-radius: 6px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .toolbar button:hover { opacity: 0.9; }
          </style>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"><\/script>
        </head>
        <body>
          <div class="toolbar no-print">
            <button onclick="window.print()" style="background:#0ea5e9;">🖨️ Print Receipt</button>
            <button onclick="downloadPDF()" style="background:#10b981; margin-left:10px;">⬇️ Download PDF</button>
          </div>
          <script>
            function downloadPDF() {
              const element = document.querySelector('.receipt-container');
              const opt = {
                margin:       0.5,
                filename:     'Fee_Receipt_${txnCode}.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
              };
              html2pdf().set(opt).from(element).save();
            }
          <\/script>
          <div class="receipt-container">
            <div class="header-flex">
              <div style="font-size: 30px;">✡️</div>
              <div class="school-header">
                <h1>Shree Saraswati Secondary School</h1>
                <p>Satyawati Rural Municipality-6 Johang, Gulmi</p>
                <p class="font-bold">Statement of Account</p>
              </div>
              <div style="width: 30px;"></div>
            </div>
            
            <div class="top-meta">
              <div>Receipt No: <b>${txnCode}</b></div>
              <div>Date: <b>${today}</b></div>
            </div>
            <div class="top-meta" style="margin-bottom: 15px;">
              <div class="pan-no">PAN No.: 201510843</div>
            </div>
            
            <div class="student-info">
              <div style="flex:2;">Student Name: <b>${student.name || 'N/A'}</b></div>
              <div style="flex:1;">Class: <b>${(student.class || 'N/A').split('-')[0].trim()}</b></div>
              <div style="flex:1;">Roll No: <b>${student.roll || 'N/A'}</b></div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th rowspan="2" style="width:50px;" class="text-center">S.N.</th>
                  <th rowspan="2">Particulars</th>
                  <th rowspan="2">Status</th>
                  <th colspan="2" class="text-center">Amount</th>
                </tr>
                <tr>
                  <th class="text-center">Rs.</th>
                  <th class="text-center">P.</th>
                </tr>
              </thead>
              <tbody>
      `;
      
      studentFees.forEach((f, idx) => {
         const amt = parseFloat(f.amount || 0);
         const stat = (f.status || 'unpaid').toUpperCase();
         html += `
           <tr>
             <td class="text-center">${idx + 1}</td>
             <td>${f.fee_name || 'General Fee'}</td>
             <td style="font-size:11px;">${stat}</td>
             <td class="amount-col">${amt.toLocaleString('en-IN')}</td>
             <td class="paisa-col">00</td>
           </tr>
         `;
      });
      
      html += `
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="text-align:right; font-weight:bold;">Total Amount:</td>
                  <td class="amount-col font-bold">${totalAmount.toLocaleString('en-IN')}</td>
                  <td class="paisa-col font-bold">00</td>
                </tr>
                <tr>
                  <td colspan="3" style="text-align:right; font-weight:bold;">Amount Paid:</td>
                  <td class="amount-col font-bold" style="color:green;">${paidAmount.toLocaleString('en-IN')}</td>
                  <td class="paisa-col font-bold">00</td>
                </tr>
                <tr>
                  <td colspan="3" style="text-align:right; font-weight:bold;">Remaining Balance:</td>
                  <td class="amount-col font-bold" style="color:red;">${remainingAmount.toLocaleString('en-IN')}</td>
                  <td class="paisa-col font-bold">00</td>
                </tr>
              </tfoot>
            </table>
            
            <div class="signature-area">
              <div class="signature-box">
                Depositor's Signature
              </div>
              <div class="signature-box">
                Receiver's Signature
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(html);
      printWindow.document.close();
    }

    async function approvePayment(id) {
      const payments = JSON.parse(localStorage.getItem('fee_payments') || '[]');
      const target = payments.find(p => p.id === id);
      if (target) {
        if (supabaseDb) {
          try {
            await supabaseDb.from('fee_payments').update({ status: 'approved' }).eq('id', id);
            await supabaseDb.from('students_registry').update({ billing_state: 'paid' }).eq('roll', target.roll);
          } catch(err) { console.error("Error approving payment:", err); }
        }
        target.status = 'approved';
        localStorage.setItem('fee_payments', JSON.stringify(payments));
        localStorage.setItem('student_billing_state', 'paid');
        
        // Sync student_fees to Cleared
        const allFees = JSON.parse(localStorage.getItem('student_fees') || '[]');
        let updatedFees = false;
        allFees.forEach(f => {
          if (String(f.studentRoll) === String(target.roll) || String(f.student_roll) === String(target.roll)) {
            if ((f.status || '').toLowerCase() === 'under review') {
               f.status = 'cleared';
               f.paidAmount = f.amount || 0;
               f.paidDate = new Date().toISOString().split('T')[0];
               updatedFees = true;
            }
          }
        });
        if (updatedFees) {
          localStorage.setItem('student_fees', JSON.stringify(allFees));
          if (typeof supabaseDb !== 'undefined' && supabaseDb) {
            try {
              await supabaseDb.from('school_config').delete().eq('key', 'student_fees_json');
              await supabaseDb.from('school_config').insert([{ key: 'student_fees_json', val: JSON.stringify(allFees) }]);
            } catch(e) {
              console.error("Cloud fee sync error:", e);
            }
          }
        }
        
        renderPayments();
        renderGlobalFeeLedger();
        renderDashboardMetrics();
        alert("Success! Transaction payment verified cleanly and student dues cleared!");
      }
    }

    async function rejectPayment(id) {
      const comment = prompt("Enter Rejection Remark to student:");
      if (comment === null) return;

      const payments = JSON.parse(localStorage.getItem('fee_payments') || '[]');
      const target = payments.find(p => p.id === id);
      if (target) {
        if (supabaseDb) {
          try {
            await supabaseDb.from('fee_payments').update({ status: 'rejected' }).eq('id', id);
            await supabaseDb.from('students_registry').update({ billing_state: 'rejected', billing_rejection_remark: comment }).eq('roll', target.roll);
          } catch(err) { console.error("Error rejecting payment:", err); }
        }
        target.status = 'rejected';
        target.remark = comment;
        localStorage.setItem('fee_payments', JSON.stringify(payments));
        
        localStorage.setItem('student_billing_state', 'rejected');
        localStorage.setItem('student_billing_rejection_remark', comment);

        // Sync student_fees back to Unpaid so they can try again
        const allFees = JSON.parse(localStorage.getItem('student_fees') || '[]');
        let updatedFees = false;
        allFees.forEach(f => {
          if (String(f.studentRoll) === String(target.roll) || String(f.student_roll) === String(target.roll)) {
            if ((f.status || '').toLowerCase() === 'under review') {
               f.status = 'unpaid';
               updatedFees = true;
            }
          }
        });
        if (updatedFees) {
          localStorage.setItem('student_fees', JSON.stringify(allFees));
          if (typeof supabaseDb !== 'undefined' && supabaseDb) {
            try {
              await supabaseDb.from('school_config').delete().eq('key', 'student_fees_json');
              await supabaseDb.from('school_config').insert([{ key: 'student_fees_json', val: JSON.stringify(allFees) }]);
            } catch(e) {
              console.error("Cloud fee sync error:", e);
            }
          }
        }

        renderPayments();
        renderGlobalFeeLedger();
        renderDashboardMetrics();
        alert("Transaction proof rejected. Rejection remark returned to student billing desk.");
      }
    }

    async function deletePaymentRecord(id) {
      if (!confirm('Are you sure you want to delete this payment record? This action cannot be undone.')) return;
      
      let payments = JSON.parse(localStorage.getItem('fee_payments') || '[]');
      payments = payments.filter(p => p.id !== id);
      localStorage.setItem('fee_payments', JSON.stringify(payments));
      
      // Also delete from Supabase
      if (typeof supabaseDb !== 'undefined' && supabaseDb) {
        try {
          await supabaseDb.from('fee_payments').delete().eq('id', id);
        } catch(e) {
          console.error('Error deleting payment record from DB:', e);
        }
      }
      
      renderPayments();
      renderDashboardMetrics();
      alert('Payment record deleted successfully.');
    }

    // ── LEAVE AUDITS MODULE ──
    function renderAdminLeaves() {
      const tbody = document.getElementById('admin-leaves-tbody');
      if (!tbody) return;
      tbody.innerHTML = '';

      const leaves = JSON.parse(localStorage.getItem('student_leaves') || '[]');
      
      if (leaves.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align:center; padding:2rem; font-weight:600; color:var(--text-muted);">🎉 All student leave petitions audited successfully!</td>
          </tr>
        `;
        return;
      }

      leaves.forEach(l => {
        let badgeClass = l.status === 'approved' ? 'approved' : l.status === 'rejected' ? 'rejected' : 'pending';
        let actions = '';
        if (l.status === 'pending') {
          actions = `
            <div style="display:flex; gap:0.5rem;">
              <button onclick="approveAdminLeave(${l.id})" class="submit-btn" style="padding:0.4rem 0.8rem; font-size:0.8rem; background:var(--success);">Approve</button>
              <button onclick="rejectAdminLeave(${l.id})" class="submit-btn" style="padding:0.4rem 0.8rem; font-size:0.8rem; background:var(--danger);">Reject</button>
            </div>
          `;
        } else {
          actions = `<span class="status-badge ${badgeClass}">${l.status}</span>`;
        }

        tbody.innerHTML += `
          <tr>
            <td><strong>${l.name}</strong></td>
            <td>${l.type}</td>
            <td>${l.range}</td>
            <td>"${l.desc}"</td>
            <td>
              <button onclick="openAdminProofModal('${l.proofFile}')" style="background:none; border:none; color:var(--accent); font-weight:700; cursor:pointer;">🖼️ View Attachment</button>
            </td>
            <td>${actions}</td>
          </tr>
        `;
      });
    }

    async function approveAdminLeave(id) {
      const leaves = JSON.parse(localStorage.getItem('student_leaves') || '[]');
      const target = leaves.find(l => l.id === id);
      if (target) {
        if (supabaseDb) {
          try {
            await supabaseDb.from('student_leaves').update({ status: 'approved' }).eq('id', id);
          } catch(err) { console.error("Error approving leave:", err); }
        }
        target.status = 'approved';
        localStorage.setItem('student_leaves', JSON.stringify(leaves));
        
        localStorage.setItem('student_leave_status_12', 'approved');
        
        renderAdminLeaves();
        renderDashboardMetrics();
        alert("Leave approved successfully! Notification dispatched to student and teacher registers.");
      }
    }

    async function rejectAdminLeave(id) {
      const comment = prompt("Enter Rejection Reason:");
      if (comment === null) return;

      const leaves = JSON.parse(localStorage.getItem('student_leaves') || '[]');
      const target = leaves.find(l => l.id === id);
      if (target) {
        if (supabaseDb) {
          try {
            await supabaseDb.from('student_leaves').update({ status: 'rejected' }).eq('id', id);
          } catch(err) { console.error("Error rejecting leave:", err); }
        }
        target.status = 'rejected';
        target.remark = comment;
        localStorage.setItem('student_leaves', JSON.stringify(leaves));
        
        localStorage.setItem('student_leave_status_12', 'rejected');
        localStorage.setItem('student_leave_remark_12', comment);

        renderAdminLeaves();
        renderDashboardMetrics();
        alert("Leave rejected. Comment returned to student portal.");
      }
    }

    // ── TIMETABLE SCHEDULER MODULE ──
    function renderTimetable() {
      const tbody = document.getElementById('admin-timetable-tbody');
      if (!tbody) return;
      tbody.innerHTML = '';

      const timetables = JSON.parse(localStorage.getItem('school_timetables') || '[]');
      
      if (timetables.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align:center; padding:2rem; font-weight:600; color:var(--text-muted);">No scheduled lectures inside the master ledger.</td>
          </tr>
        `;
        return;
      }

      timetables.forEach(t => {
        tbody.innerHTML += `
          <tr>
            <td><strong>${t.section}</strong></td>
            <td><code style="background:#f5f3ff; padding:0.2rem 0.5rem; border-radius:4px; font-weight:700; color:var(--accent);">${t.time}</code></td>
            <td>
              <div style="font-weight:700; color:var(--primary);">${t.subject}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">${t.details.split(' • ')[1] || t.details}</div>
            </td>
            <td>${t.details.split(' • ')[0] || "Room Slot"}</td>
            <td>
              <button onclick="deleteLectureSlot(${t.id})" style="background:none; border:none; color:var(--danger); font-weight:700; cursor:pointer;">&times; Cancel</button>
            </td>
          </tr>
        `;
      });
    }

    async function scheduleLectureSlot(event) {
      event.preventDefault();
      const section = document.getElementById('sched-class').value;
      const subject = document.getElementById('sched-subject').value;
      const teacher = document.getElementById('sched-teacher').value;
      const time = document.getElementById('sched-time').value;
      const room = document.getElementById('sched-room').value;

      const newSlot = {
        time: time,
        subject: subject,
        details: room + " • " + teacher,
        section: section
      };

      if (supabaseDb) {
        try {
          await supabaseDb.from('school_timetables').insert([newSlot]);
        } catch(err) { console.error("Error saving slot:", err); }
      }

      // Re-pull timetables
      await pullAllFromSupabase();

      document.getElementById('sched-subject').value = '';
      document.getElementById('sched-teacher').value = '';
      document.getElementById('sched-time').value = '';
      document.getElementById('sched-room').value = '';

      renderTimetable();
      alert("Success! Lecture slot added to master timetable. Live registries updated globally!");
    }

    async function deleteLectureSlot(id) {
      if (!confirm("Are you sure you want to cancel this lecturing slot?")) return;
      if (supabaseDb) {
        try {
          await supabaseDb.from('school_timetables').delete().eq('id', id);
        } catch(err) { console.error("Error deleting slot:", err); }
      }
      let timetables = JSON.parse(localStorage.getItem('school_timetables') || '[]');
      timetables = timetables.filter(t => t.id !== id);
      localStorage.setItem('school_timetables', JSON.stringify(timetables));
      renderTimetable();
    }

    // ── ACADEMIC GRADES MODULE ──
    let gpaRealtimeSubscription = null;

    function initGPARealtime() {
      if (!supabaseDb || gpaRealtimeSubscription) return;
      gpaRealtimeSubscription = supabaseDb.channel('custom-gpa-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'students_registry' }, payload => {
          console.log('Realtime GPA update received:', payload);
          renderGPABoard();
        })
        .subscribe();
    }

    async function renderGPABoard() {
      const tbody = document.getElementById('admin-gpa-tbody');
      const select = document.getElementById('gpa-student');
      if (!tbody || !select) return;

      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem; color: #7f8c8d;">Syncing real-time data...</td></tr>';
      select.innerHTML = '<option value="">Loading students...</option>';

      let students = [];
      if (supabaseDb) {
        try {
          const { data, error } = await supabaseDb.from('students_registry').select('*').order('roll', { ascending: true });
          if (!error && data) students = data;
        } catch(e) { console.error("Error fetching GPA board:", e); }
        initGPARealtime();
      } else {
        students = JSON.parse(localStorage.getItem('students_registry') || '[]');
      }
      
      tbody.innerHTML = '';
      select.innerHTML = '';

      if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem; color: #7f8c8d;">No students found</td></tr>';
        return;
      }

      students.forEach(s => {
        let roll = s.roll;
        let name = s.name;
        // Support both old localStorage key (overallGPA) and new DB column (overall_gpa)
        let gpaVal = s.overall_gpa || s.overallGPA || "N/A";
        let isCleared = (gpaVal !== "N/A" && gpaVal !== null);

        select.innerHTML += `<option value="${roll}">${name} (Roll ${roll})</option>`;
        
        let statusBadge = isCleared ? `<span class="status-badge approved">Cleared</span>` : `<span class="status-badge pending">Pending marks</span>`;
        tbody.innerHTML += `
          <tr>
            <td><strong>#Roll-${roll}</strong></td>
            <td>${name}</td>
            <td><span style="font-weight:800; color:var(--accent); font-size:1.05rem;">${gpaVal}</span></td>
            <td>${isCleared ? "Authorized & Published" : "Marksheet drafting stage"}</td>
            <td>${statusBadge}</td>
          </tr>
        `;
      });
    }

    async function publishTermGPA(event) {
      event.preventDefault();
      const roll = parseInt(document.getElementById('gpa-student').value);
      const gpa = document.getElementById('gpa-value').value;
      const remark = document.getElementById('gpa-remark').value;

      if (isNaN(roll) || !gpa) {
        alert("Please select a student and enter a valid GPA.");
        return;
      }

      const formattedGpa = parseFloat(gpa).toFixed(2);
      const submitBtn = document.querySelector('#admin-grades-module .submit-btn');
      const originalText = submitBtn ? submitBtn.innerText : '';
      if (submitBtn) { submitBtn.innerText = 'Publishing...'; submitBtn.disabled = true; }

      try {
        if (supabaseDb) {
          const { error } = await supabaseDb.from('students_registry')
            .update({ overall_gpa: formattedGpa })
            .eq('roll', roll);
          
          if (error) throw error;
        }

        // Also update local storage for offline fallback compatibility
        const students = JSON.parse(localStorage.getItem('students_registry') || '[]');
        const target = students.find(s => s.roll === roll);
        if (target) {
          target.overallGPA = formattedGpa;
          localStorage.setItem('students_registry', JSON.stringify(students));
        }
        localStorage.setItem(`student_gpa_remark_${roll}`, remark);

        document.getElementById('gpa-value').value = '';
        document.getElementById('gpa-remark').value = '';

        await renderGPABoard();
        
        // Show success using dynamic toast if available
        if (typeof showAboutAlert === 'function') {
          showAboutAlert("GPA Card successfully published!", "success");
        } else {
          alert("GPA Card successfully published! Report marks authorized for Student Portal.");
        }
      } catch (err) {
        console.error("Error publishing term GPA:", err);
        alert("Error publishing GPA. Please check database connection.");
      } finally {
        if (submitBtn) { submitBtn.innerText = originalText; submitBtn.disabled = false; }
      }
    }

    // ── NOTICES MODULE ──
    function renderNotices() {
      const list = document.getElementById('admin-notices-list');
      if (!list) return;
      let notices = [];
      try { notices = JSON.parse(localStorage.getItem('admin_notices')) || []; } catch(e) {}
      list.innerHTML = '';
      if (notices.length === 0) {
        list.innerHTML = '<p style="color:var(--text-muted); font-size:0.88rem;">No notices broadcast yet.</p>';
        return;
      }
      notices.slice().reverse().forEach((n, i) => {
        list.innerHTML += `
          <div style="background:#f8fafc; border-radius:12px; padding:1rem 1.2rem; border-left:4px solid var(--primary);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
              <strong style="color:var(--primary); font-size:0.9rem;">${n.title}</strong>
              <span style="font-size:0.72rem; background:rgba(26,58,107,0.08); color:var(--primary); padding:0.2rem 0.6rem; border-radius:20px; font-weight:700;">${n.category}</span>
            </div>
            <p style="color:var(--text-muted); font-size:0.82rem; margin:0 0 0.5rem;">${n.desc}</p>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:0.72rem; color:var(--text-muted);">${n.date}</span>
              <button onclick="deleteNotice(${notices.length - 1 - i})" style="background:#fee2e2; color:#dc2626; border:none; padding:0.25rem 0.6rem; border-radius:6px; font-size:0.72rem; font-weight:700; cursor:pointer;">Remove</button>
            </div>
          </div>`;
      });
    }

    async function broadcastNotice(event) {
      event.preventDefault();
      const title = document.getElementById('notice-title').value.trim();
      const category = document.getElementById('notice-category').value;
      const desc = document.getElementById('notice-desc').value.trim();
      if (!title || !desc) return;

      const dateStr = new Date().toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'});

      if (supabaseDb) {
        try {
          await supabaseDb.from('school_announcements').insert([{
            date: dateStr,
            title: title,
            category: category,
            description: desc
          }]);
        } catch(err) { console.error("Error broadcasting notice:", err); }
      }

      let notices = [];
      try { notices = JSON.parse(localStorage.getItem('admin_notices')) || []; } catch(e) {}
      notices.push({ title, category, desc, date: dateStr });
      localStorage.setItem('admin_notices', JSON.stringify(notices));
      localStorage.setItem('school_announcements', JSON.stringify(notices));

      document.getElementById('notice-title').value = '';
      document.getElementById('notice-desc').value = '';
      renderNotices();
      alert('✅ Notice broadcast successfully!');
    }

    async function deleteNotice(idx) {
      if (!confirm('Remove this notice?')) return;
      let notices = [];
      try { notices = JSON.parse(localStorage.getItem('admin_notices')) || []; } catch(e) {}
      const noticeToDelete = notices[idx];
      
      if (supabaseDb && noticeToDelete) {
        try {
          await supabaseDb.from('school_announcements').delete().eq('title', noticeToDelete.title).eq('description', noticeToDelete.desc);
        } catch(err) { console.error("Error deleting notice:", err); }
      }

      notices.splice(idx, 1);
      localStorage.setItem('admin_notices', JSON.stringify(notices));
      localStorage.setItem('school_announcements', JSON.stringify(notices));
      renderNotices();
    }

    // ── CALCULATE GPA FROM MARKS ──
    function calculateGPA(marks) {
      if (marks >= 90) return { gpa: 4.0, grade: 'A+', percentage: marks };
      if (marks >= 80) return { gpa: 3.6, grade: 'A', percentage: marks };
      if (marks >= 70) return { gpa: 3.2, grade: 'B+', percentage: marks };
      if (marks >= 60) return { gpa: 2.8, grade: 'B', percentage: marks };
      if (marks >= 50) return { gpa: 2.4, grade: 'C+', percentage: marks };
      if (marks >= 40) return { gpa: 2.0, grade: 'C', percentage: marks };
      if (marks >= 35) return { gpa: 1.2, grade: 'D', percentage: marks };
      return { gpa: 0.8, grade: 'NG', percentage: marks };
    }

    // ── RENDER PENDING RESULTS ──
    async function renderPendingResults() {
      const tbody = document.getElementById('pending-results-tbody');
      if (!tbody) {
        console.warn('pending-results-tbody element not found');
        return;
      }
      
      try {
        // Show loader while fetching
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2.5rem;">
          <div style="display:flex; flex-direction:column; align-items:center; gap:0.75rem;">
            <div style="width:36px; height:36px; border:3.5px solid #e2e8f0; border-top:3.5px solid var(--accent, #7c3aed); border-radius:50%; animation:spin 0.8s linear infinite;"></div>
            <span style="color:var(--text-muted); font-weight:500; font-size:0.9rem;">Loading submitted results...</span>
          </div>
        </td></tr>`;

        // Fetch submitted results from Supabase
        let pendingResults = [];
        if (supabaseDb) {
          try {
            const { data, error } = await supabaseDb
              .from('submitted_results')
              .select('*')
              .order('timestamp', { ascending: false });
            if (!error && data) {
              pendingResults = data;
              console.log('Loaded from Supabase:', pendingResults.length, 'results');
            } else {
              console.warn('Error fetching from Supabase:', error);
            }
          } catch(err) {
            console.warn('Error fetching submitted results:', err);
          }
        }
        
        // Fallback to localStorage if Supabase fetch returned nothing
        if (pendingResults.length === 0) {
          pendingResults = JSON.parse(localStorage.getItem('submitted_results') || '[]');
          console.log('Loaded from localStorage:', pendingResults.length, 'results');
        }

        tbody.innerHTML = '';
        
        if (pendingResults.length === 0) {
          tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No submitted results yet</td></tr>';
          return;
        }

        // Display all results
        pendingResults.forEach((result, index) => {
          const studentCount = (result.students || []).length;
          const statusBadge = result.status === 'Pending' ? 'pending' : (result.status === 'Approved' ? 'approved' : 'rejected');
          const examType = result.exam_type || result.examType || 'Unknown';
          
          tbody.innerHTML += `
            <tr>
              <td><strong>${result.subject || 'N/A'}</strong></td>
              <td>${result.class || 'N/A'}</td>
              <td>${examType}</td>
              <td>${studentCount}</td>
              <td>${result.submission_date || result.submissionDate || '-'}</td>
              <td><span class="status-badge ${statusBadge}">${result.status || 'Pending'}</span></td>
              <td>
                <div style="display: flex; gap: 0.5rem; justify-content: center;">
                  <button class="submit-btn" style="padding: 0.3rem 0.8rem; font-size: 0.75rem; background: var(--accent);" onclick="viewSubmittedResult(${result.id || index})">View</button>
                  ${result.status !== 'Approved' 
                    ? `<button class="submit-btn" style="padding: 0.3rem 0.8rem; font-size: 0.75rem; background: var(--success);" onclick="approveConfigResults(${result.id || index}, '${result.subject || ''}', '${result.class || ''}')">Approve</button>`
                    : `<button class="submit-btn" style="padding: 0.3rem 0.8rem; font-size: 0.75rem; background: #3b82f6; color: #fff;" onclick="editConfigResults(${result.id || index})">✏️ Edit</button>`
                  }
                  <button class="submit-btn" style="padding: 0.3rem 0.8rem; font-size: 0.75rem; background: var(--danger); color: #fff;" onclick="deleteConfigResults(${result.id || index}, '${result.subject || ''}', '${result.class || ''}')">Delete</button>
                </div>
              </td>
            </tr>
          `;
        });
      } catch(error) {
        console.error('Error rendering pending results:', error);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--danger);">Error loading results: ' + error.message + '</td></tr>';
      }
    }

    // ── REFRESH EXAM RESULTS ──
    async function refreshExamResults() {
      const btn = event.target;
      btn.disabled = true;
      btn.textContent = '⏳ Refreshing...';
      
      try {
        await renderPendingResults();
        await updateDebugInfo();
        btn.textContent = '✓ Refreshed!';
        setTimeout(() => {
          btn.textContent = '🔄 Refresh';
          btn.disabled = false;
        }, 2000);
      } catch(error) {
        console.error('Refresh error:', error);
        btn.textContent = '❌ Error';
        setTimeout(() => {
          btn.textContent = '🔄 Refresh';
          btn.disabled = false;
        }, 2000);
      }
    }

    // ── UPDATE DEBUG INFO ──
    async function updateDebugInfo() {
      const debugDiv = document.getElementById('debug-info');
      if (!debugDiv) return;

      let html = '<p style="margin: 0; color: var(--text-muted); font-size: 0.8rem;">Database Status:</p>';
      
      try {
        if (!supabaseDb) {
          html += '<p style="color: var(--danger);">❌ Supabase not connected</p>';
        } else {
          html += '<p style="color: var(--success);">✓ Supabase connected</p>';

          // Check exam_sessions
          const sessionsResult = await supabaseDb.from('exam_sessions').select('count', { count: 'exact' });
          const sessionsCount = sessionsResult.count || 0;
          html += `<p>📅 Exam Sessions: ${sessionsCount}</p>`;

          // Check exam_configurations
          const configsResult = await supabaseDb.from('exam_configurations').select('count', { count: 'exact' });
          const configsCount = configsResult.count || 0;
          html += `<p>⚙️  Exam Configurations: ${configsCount}</p>`;

          // Check exam_results
          const resultsResult = await supabaseDb.from('exam_results').select('count', { count: 'exact' });
          const resultsCount = resultsResult.count || 0;
          html += `<p>📊 Exam Results: ${resultsCount}</p>`;

          if (resultsCount > 0) {
            const recentResults = await supabaseDb.from('exam_results').select('*').order('submission_date', { ascending: false }).limit(3);
            html += `<p style="margin-top: 0.5rem; font-weight: 600;">Recent Results:</p>`;
            if (recentResults.data && recentResults.data.length > 0) {
              recentResults.data.forEach(r => {
                html += `<div style="margin: 0.3rem 0; padding: 0.3rem; background: #f0f4ff; border-left: 3px solid var(--accent); padding-left: 0.5rem;">
                  ${r.student_name} - ${r.approval_status} (${new Date(r.submission_date).toLocaleDateString()})
                </div>`;
              });
            }
          }
        }
      } catch(error) {
        html += `<p style="color: var(--danger);">Error: ${error.message}</p>`;
      }

      debugDiv.innerHTML = html;
    }

    // Update debug info when manage-results page is visited
    async function updateDebugInfo() {
      const debugDiv = document.getElementById('debug-info');
      if (!debugDiv) return;

      let html = '<p style="margin: 0; color: var(--text-muted); font-size: 0.8rem;">Database Status:</p>';
      
      try {
        if (!supabaseDb) {
          html += '<p style="color: var(--danger);">❌ Supabase not connected</p>';
        } else {
          html += '<p style="color: var(--success);">✓ Supabase connected</p>';

          // Check exam_sessions
          const sessionsResult = await supabaseDb.from('exam_sessions').select('count', { count: 'exact' });
          const sessionsCount = sessionsResult.count || 0;
          html += `<p>📅 Exam Sessions: ${sessionsCount}</p>`;

          // Check exam_configurations
          const configsResult = await supabaseDb.from('exam_configurations').select('count', { count: 'exact' });
          const configsCount = configsResult.count || 0;
          html += `<p>⚙️  Exam Configurations: ${configsCount}</p>`;

          // Check exam_results
          const resultsResult = await supabaseDb.from('exam_results').select('count', { count: 'exact' });
          const resultsCount = resultsResult.count || 0;
          html += `<p>📊 Exam Results: ${resultsCount}</p>`;

          if (resultsCount > 0) {
            const recentResults = await supabaseDb.from('exam_results').select('*').order('submission_date', { ascending: false }).limit(3);
            html += `<p style="margin-top: 0.5rem; font-weight: 600;">Recent Results:</p>`;
            if (recentResults.data && recentResults.data.length > 0) {
              recentResults.data.forEach(r => {
                html += `<div style="margin: 0.3rem 0; padding: 0.3rem; background: #f0f4ff; border-left: 3px solid var(--accent); padding-left: 0.5rem;">
                  ${r.student_name} - ${r.approval_status} (${new Date(r.submission_date).toLocaleDateString()})
                </div>`;
              });
            }
          }
        }
      } catch(error) {
        html += `<p style="color: var(--danger);">Error: ${error.message}</p>`;
      }

      debugDiv.innerHTML = html;
    }

    // ── DIAGNOSTIC CHECK ──
    window.checkExamData = async function() {
      console.log('=== EXAM DATA DIAGNOSTIC ===');
      
      if (!supabaseDb) {
        console.error('❌ Supabase not connected');
        return;
      }
      
      try {
        // Check exam_sessions
        const { data: sessions, error: sessionsError, count: sessionsCount } = await supabaseDb
          .from('exam_sessions')
          .select('*', { count: 'exact' });
        
        console.log(`Exam Sessions: ${sessionsCount}`, sessions, sessionsError);
        
        // Check exam_configurations
        const { data: configs, error: configsError, count: configsCount } = await supabaseDb
          .from('exam_configurations')
          .select('*', { count: 'exact' });
        
        console.log(`Exam Configurations: ${configsCount}`, configs, configsError);
        
        // Check exam_results
        const { data: results, error: resultsError, count: resultsCount } = await supabaseDb
          .from('exam_results')
          .select('*', { count: 'exact' });
        
        console.log(`Exam Results: ${resultsCount}`, results, resultsError);
        
        // Check if fetchExamSessionsWithStats is available
        console.log('fetchExamSessionsWithStats available:', typeof fetchExamSessionsWithStats === 'function');
        
        // Try to fetch with stats if available
        if (typeof fetchExamSessionsWithStats === 'function') {
          const sessionsWithStats = await fetchExamSessionsWithStats();
          console.log('Sessions with stats:', sessionsWithStats);
        }
      } catch(error) {
        console.error('Diagnostic error:', error);
      }
    };
    
    // Auto-run diagnostic on page load
    setTimeout(() => {
      console.log('Running auto-diagnostic...');
      window.checkExamData();
    }, 2000);

    // ── REFRESH EXAM RESULTS ──
    async function refreshExamResults() {
      const btn = event?.target;
      if (btn) {
        btn.disabled = true;
        btn.textContent = '⏳ Refreshing...';
      }
      
      try {
        // First, run diagnostic
        await window.checkExamData();
        await renderPendingResults();
        await updateDebugInfo();
        if (btn) {
          btn.textContent = '✓ Refreshed!';
          setTimeout(() => {
            btn.textContent = '🔄 Refresh';
            btn.disabled = false;
          }, 2000);
        }
      } catch(error) {
        console.error('Refresh error:', error);
        if (btn) {
          btn.textContent = '❌ Error';
          setTimeout(() => {
            btn.textContent = '🔄 Refresh';
            btn.disabled = false;
          }, 2000);
        }
      }
    }

    async function approveConfigResults(resultId, subject, className) {
      if (!confirm(`Approve all pending results for ${subject} (${className})?`)) return;
      
      const adminEmail = localStorage.getItem('admin_email') || 'admin@school.com';
      
      let success = true;
      if (supabaseDb) {
        const { error } = await supabaseDb.from('submitted_results')
           .update({ status: 'Approved' })
           .eq('id', resultId);
           
        if (error) {
           console.error("Error approving result:", error);
           success = false;
        }
      }
      
      if (success) {
        // Also update localStorage as a fallback
        let submittedResults = JSON.parse(localStorage.getItem('submitted_results') || '[]');
        const idx = submittedResults.findIndex(r => r.id == resultId || (r.subject === subject && r.class === className));
        if(idx >= 0) {
           submittedResults[idx].status = 'Approved';
           localStorage.setItem('submitted_results', JSON.stringify(submittedResults));
        }

        alert('All results approved successfully!');
        await renderPendingResults();
        await renderResultsWithGPA();
      } else {
        alert('Failed to approve results. Please try again.');
      }
    }

    async function rejectConfigResults(resultId, subject, className) {
      // Legacy - now redirects to edit
      await editConfigResults(resultId);
    }

    async function editConfigResults(resultId) {
      // Fetch result data
      let data = null;
      if (supabaseDb) {
        const { data: resData, error } = await supabaseDb.from('submitted_results').select('*').eq('id', resultId).single();
        if (!error && resData) data = resData;
      }
      if (!data) {
        const submittedResults = JSON.parse(localStorage.getItem('submitted_results') || '[]');
        data = submittedResults.find(r => r.id == resultId || r.id === resultId);
      }
      if (!data) {
        alert('Could not load result data for editing.');
        return;
      }

      const theoryFM = data.theory_full_marks || data.theoryFullMarks || 75;
      const practicalFM = data.practical_full_marks || data.practicalFullMarks || 0;
      const hasPractical = practicalFM > 0;
      const students = data.students || [];

      let rowsHtml = students.map((s, i) => {
        const theoryVal = s.marks || s.theory_marks || 0;
        const practicalVal = s.practicalMarks || s.practical_marks || 0;
        return `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 0.6rem 0.8rem; font-weight: 600; white-space: nowrap;">${s.roll || s.symbolNumber || (i+1)}</td>
            <td style="padding: 0.6rem 0.8rem; white-space: nowrap;">${s.name}</td>
            <td style="padding: 0.4rem 0.6rem;">
              <input type="number" id="edit-theory-${i}" value="${theoryVal}" min="0" max="${theoryFM}"
                style="width: 70px; padding: 0.3rem 0.5rem; border: 1.5px solid #cbd5e1; border-radius: 6px; text-align: center; font-size: 0.9rem;"
                oninput="updateEditTotal(${i}, ${theoryFM}, ${practicalFM})">
            </td>
            ${hasPractical ? `
            <td style="padding: 0.4rem 0.6rem;">
              <input type="number" id="edit-practical-${i}" value="${practicalVal}" min="0" max="${practicalFM}"
                style="width: 70px; padding: 0.3rem 0.5rem; border: 1.5px solid #cbd5e1; border-radius: 6px; text-align: center; font-size: 0.9rem;"
                oninput="updateEditTotal(${i}, ${theoryFM}, ${practicalFM})">
            </td>` : '<td style="padding: 0.4rem 0.6rem; text-align:center; color:#94a3b8;">-</td>'}
            <td style="padding: 0.4rem 0.8rem; text-align:center;">
              <strong id="edit-total-${i}">${hasPractical ? (theoryVal + practicalVal) : theoryVal}</strong>
            </td>
          </tr>`;
      }).join('');

      const modalId = 'edit-result-modal';
      let modal = document.getElementById(modalId);
      if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.style.cssText = 'display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:10001; padding:1rem; justify-content:center; align-items:center; backdrop-filter:blur(4px); overflow-y:auto;';
        document.body.appendChild(modal);
      }

      modal.innerHTML = `
        <div style="background:white; border-radius:18px; max-width:750px; width:100%; padding:2rem; margin:auto; box-shadow:0 25px 50px rgba(0,0,0,0.2); position:relative;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:2px solid #e2e8f0;">
            <div>
              <h2 style="font-size:1.3rem; font-weight:800; color:var(--primary); margin:0;">✏️ Edit Marks</h2>
              <p style="color:#64748b; margin:0.25rem 0 0; font-size:0.9rem;">${data.subject} &mdash; ${data.class} &mdash; ${data.exam_type || data.examType}</p>
            </div>
            <button onclick="document.getElementById('${modalId}').style.display='none'" style="background:none;border:none;font-size:1.8rem;cursor:pointer;color:#94a3b8;line-height:1;">&times;</button>
          </div>

          <div style="background:#eff6ff; border:1.5px solid #bfdbfe; border-radius:10px; padding:0.75rem 1rem; margin-bottom:1.5rem; font-size:0.85rem; color:#1e40af;">
            <strong>ℹ️ Full Marks:</strong> Theory: ${theoryFM}${hasPractical ? ' | Practical: ' + practicalFM + ' | Total: ' + (theoryFM + practicalFM) : ''}
          </div>

          <div style="overflow-x:auto; border:1px solid #e2e8f0; border-radius:10px;">
            <table style="width:100%; border-collapse:collapse;">
              <thead>
                <tr style="background:#f8fafc;">
                  <th style="padding:0.75rem 0.8rem; text-align:left; font-size:0.85rem; color:#475569;">Roll No</th>
                  <th style="padding:0.75rem 0.8rem; text-align:left; font-size:0.85rem; color:#475569;">Name</th>
                  <th style="padding:0.75rem 0.8rem; text-align:center; font-size:0.85rem; color:#475569;">Theory (FM: ${theoryFM})</th>
                  <th style="padding:0.75rem 0.8rem; text-align:center; font-size:0.85rem; color:#475569;">${hasPractical ? 'Practical (FM: ' + practicalFM + ')' : 'Practical'}</th>
                  <th style="padding:0.75rem 0.8rem; text-align:center; font-size:0.85rem; color:#475569;">Total</th>
                </tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
            </table>
          </div>

          <div style="margin-top:1.5rem; display:flex; justify-content:flex-end; gap:1rem;">
            <button class="submit-btn" style="background:#94a3b8;" onclick="document.getElementById('${modalId}').style.display='none'">Cancel</button>
            <button class="submit-btn" style="background:var(--primary); min-width:140px;" onclick="saveEditedResults(${resultId}, ${JSON.stringify(students).replace(/"/g, '&quot;')}, ${theoryFM}, ${practicalFM})">
              💾 Save Changes
            </button>
          </div>
        </div>`;

      modal.style.display = 'flex';
    }

    function updateEditTotal(i, theoryFM, practicalFM) {
      const th = parseFloat(document.getElementById(`edit-theory-${i}`)?.value) || 0;
      const pr = practicalFM > 0 ? (parseFloat(document.getElementById(`edit-practical-${i}`)?.value) || 0) : 0;
      const totalEl = document.getElementById(`edit-total-${i}`);
      if (totalEl) totalEl.textContent = (th + pr).toFixed(1);
    }

    async function saveEditedResults(resultId, originalStudents, theoryFM, practicalFM) {
      const hasPractical = practicalFM > 0;
      const updatedStudents = originalStudents.map((s, i) => {
        const theoryVal = parseFloat(document.getElementById(`edit-theory-${i}`)?.value) || 0;
        const practicalVal = hasPractical ? (parseFloat(document.getElementById(`edit-practical-${i}`)?.value) || 0) : 0;
        return {
          ...s,
          marks: theoryVal,
          theory_marks: theoryVal,
          theoryMarks: theoryVal,
          practicalMarks: practicalVal,
          practical_marks: practicalVal,
          totalMarks: theoryVal + practicalVal
        };
      });

      let success = true;
      if (supabaseDb) {
        const { error } = await supabaseDb.from('submitted_results')
          .update({ students: updatedStudents, status: 'Approved', updated_at: new Date().toISOString() })
          .eq('id', resultId);
        if (error) {
          console.error('Error saving edited results:', error);
          success = false;
        }
      }

      // Always update localStorage
      let submittedResults = JSON.parse(localStorage.getItem('submitted_results') || '[]');
      const idx = submittedResults.findIndex(r => r.id == resultId);
      if (idx >= 0) {
        submittedResults[idx].students = updatedStudents;
        submittedResults[idx].status = 'Approved';
        localStorage.setItem('submitted_results', JSON.stringify(submittedResults));
        success = true;
      }

      if (success) {
        document.getElementById('edit-result-modal').style.display = 'none';
        alert('✅ Marks updated and result re-approved successfully!');
        await renderPendingResults();
        await renderResultsWithGPA();
      } else {
        alert('❌ Failed to save changes. Please try again.');
      }
    }

    async function deleteConfigResults(resultId, subject, className) {
      if (!confirm(`Are you sure you want to completely delete the results for ${subject} (${className})? This action cannot be undone and the teacher will have to re-upload.`)) return;
      
      let success = true;
      if (supabaseDb) {
        const { error } = await supabaseDb.from('submitted_results')
           .delete()
           .eq('id', resultId);
           
        if (error) {
           console.error("Error deleting result:", error);
           success = false;
        }
      }
      
      if (success) {
        let submittedResults = JSON.parse(localStorage.getItem('submitted_results') || '[]');
        const filteredSubmitted = submittedResults.filter(r => !(r.id == resultId || (r.subject === subject && r.class === className)));
        localStorage.setItem('submitted_results', JSON.stringify(filteredSubmitted));

        alert('Result deleted successfully!');
        await renderPendingResults();
        await renderResultsWithGPA();
      } else {
        alert('Failed to delete results. Please try again.');
      }
    }

    async function viewSubmittedResult(resultId) {
       // get the result from supabase
       let data = null;
       if (supabaseDb) {
           const { data: resData, error } = await supabaseDb.from('submitted_results').select('*').eq('id', resultId).single();
           if (!error) data = resData;
       }
       if (!data) {
           const submittedResults = JSON.parse(localStorage.getItem('submitted_results') || '[]');
           data = submittedResults.find(r => r.id == resultId);
       }
       
       if (!data) {
          alert('Failed to fetch result details.');
          return;
       }
       
       // Determine exam type (normalize to standard format)
       let examType = data.exam_type || data.examType || 'theory';
       
       // Normalize exam type values
       if (examType.toLowerCase() === 'theory' || examType === 'Theory Only') {
         examType = 'Theory Only';
       } else if (examType.toLowerCase() === 'theory+practical' || examType === 'Theory + Practical') {
         examType = 'Theory + Practical';
       } else if (examType.toLowerCase() === 'practical' || examType === 'Practical Only') {
         examType = 'Practical Only';
       }
       
       const theoryFullMarks = data.theory_full_marks || 75;
       const practicalFullMarks = data.practical_full_marks || 0;
       
       // Build table headers based on exam type
       let headerHTML = `
         <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid #e2e8f0;">Roll No</th>
         <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid #e2e8f0;">Name</th>`;
       
       if (examType === 'Theory Only') {
         headerHTML += `<th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid #e2e8f0;">Theory (FM: ${theoryFullMarks})</th>
           <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid #e2e8f0;">Total</th>`;
       } else if (examType === 'Practical Only') {
         headerHTML += `<th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid #e2e8f0;">Practical (FM: ${practicalFullMarks})</th>
           <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid #e2e8f0;">Total</th>`;
       } else {
         headerHTML += `<th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid #e2e8f0;">Theory (FM: ${theoryFullMarks})</th>
           <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid #e2e8f0;">Practical (FM: ${practicalFullMarks})</th>
           <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid #e2e8f0;">Total</th>`;
       }
       
       // Build HTML table for data.students
       let html = `<table class="custom-table" style="width: 100%; border-collapse: collapse;">
         <thead>
           <tr style="background: var(--surface);">
             ${headerHTML}
           </tr>
         </thead>
         <tbody>`;
       
       (data.students || []).forEach(s => {
         let rowHTML = `<tr>
           <td style="border-bottom: 1px solid #e2e8f0; padding: 0.75rem;">${s.roll || s.symbolNumber}</td>
           <td style="border-bottom: 1px solid #e2e8f0; padding: 0.75rem;">${s.name}</td>`;
         
         if (examType === 'Theory Only') {
           const theoryMarks = s.marks || 0;
           rowHTML += `<td style="border-bottom: 1px solid #e2e8f0; padding: 0.75rem; text-align: center; font-weight: 600;">${theoryMarks}</td>
             <td style="border-bottom: 1px solid #e2e8f0; padding: 0.75rem; text-align: center; font-weight: 600;">${theoryMarks}</td>`;
         } else if (examType === 'Practical Only') {
           const practicalMarks = s.practicalMarks || s.marks || 0;
           rowHTML += `<td style="border-bottom: 1px solid #e2e8f0; padding: 0.75rem; text-align: center; font-weight: 600;">${practicalMarks}</td>
             <td style="border-bottom: 1px solid #e2e8f0; padding: 0.75rem; text-align: center; font-weight: 600;">${practicalMarks}</td>`;
         } else {
           const theoryMarks = s.marks || 0;
           const practicalMarks = s.practicalMarks || 0;
           const totalMarks = theoryMarks + practicalMarks;
           rowHTML += `<td style="border-bottom: 1px solid #e2e8f0; padding: 0.75rem; text-align: center; font-weight: 600;">${theoryMarks}</td>
             <td style="border-bottom: 1px solid #e2e8f0; padding: 0.75rem; text-align: center; font-weight: 600;">${practicalMarks}</td>
             <td style="border-bottom: 1px solid #e2e8f0; padding: 0.75rem; text-align: center; font-weight: 600;">${totalMarks}</td>`;
         }
         
         rowHTML += `</tr>`;
         html += rowHTML;
       });
       html += `</tbody></table>`;
       
       const modalId = 'view-submitted-result-modal';
       let modal = document.getElementById(modalId);
       if (!modal) {
         modal = document.createElement('div');
         modal.id = modalId;
         modal.style.cssText = 'display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:10000; padding:2rem; justify-content:center; align-items:center; backdrop-filter: blur(4px);';
         document.body.appendChild(modal);
       }
       modal.innerHTML = `
         <div style="background: white; border-radius: 16px; max-width: 700px; width: 100%; padding: 2rem; margin: auto; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
           <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem;">
             <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--primary); margin:0;">Result: ${data.subject} (${data.class})</h2>
             <button onclick="document.getElementById('${modalId}').style.display='none'" style="background:none; border:none; font-size:1.5rem; cursor:pointer; color: var(--text-muted);">&times;</button>
           </div>
           <div style="margin-bottom: 1rem; color: var(--text-muted); font-size: 0.95rem; display: flex; gap: 2rem; flex-wrap: wrap;">
             <span><strong>Exam Type:</strong> ${data.exam_type || data.examType}</span>
             <span><strong>Theory FM:</strong> ${theoryFullMarks}</span>
             ${practicalFullMarks > 0 ? `<span><strong>Practical FM:</strong> ${practicalFullMarks}</span>` : ''}
             <span><strong>Total FM:</strong> ${data.total_marks || data.totalMarks}</span>
             <span><strong>Status:</strong> <span class="status-badge ${data.status.toLowerCase()}">${data.status}</span></span>
           </div>
           <div style="max-height: 50vh; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 8px;">
             ${html}
           </div>
           <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 1rem;">
             <button class="submit-btn" style="background: #94a3b8;" onclick="document.getElementById('${modalId}').style.display='none'">Close</button>
             ${data.status !== 'Approved' ? `<button class="submit-btn" style="background: var(--success);" onclick="document.getElementById('${modalId}').style.display='none'; approveConfigResults(${data.id}, '${data.subject}', '${data.class}')">Approve Results</button>` : ''}
           </div>
         </div>
       `;
       modal.style.display = 'flex';
    }

    // ── APPROVE RESULT (Legacy function for backward compatibility) ──
    async function approveResult(resultId) {
      console.warn('approveResult: Use approveConfigResults instead');
    }

    
    // ── VIEW MARKSHEET ──
    
    // PUBLISH CURRENT LEDGER
    function publishCurrentLedger(className, examType) {
      if (!confirm('Are you sure you want to publish these results to the student portal?')) return;
      
      const approvedResults = JSON.parse(localStorage.getItem('approved_results') || '[]');
      const submittedResults = JSON.parse(localStorage.getItem('submitted_results') || '[]');
      
      const normalizeExamType = (type) => type?.toLowerCase().replace(/exam/gi, '').trim() || '';
      const examTypeMatches = (storedType, selectedType) => normalizeExamType(storedType) === normalizeExamType(selectedType);
      
      const allResults = [];
      
      approvedResults.forEach(app => {
          if (String(app.class).trim() === String(className).trim() && examTypeMatches(app.examType || app.exam_type, examType)) {
             allResults.push({
                  symbolNumber: String(app.symbolNumber || app.symbol_number || '').replace(/^SYM/i, '').trim(),
                  name: app.name,
                  class: app.class,
                  examType: app.examType || app.exam_type,
                  subject: app.subject,
                  marks: app.marks || 0,
                  theoryMarks: app.theoryMarks || app.theory_marks || app.marks || 0,
                  practicalMarks: app.practicalMarks || app.practical_marks || 0,
                  totalMarks: app.totalMarks || app.total_marks || 100,
                  theoryFullMarks: app.theory_full_marks !== undefined ? app.theory_full_marks : (app.theoryFullMarks !== undefined ? app.theoryFullMarks : (app.totalMarks || app.total_marks || 100)),
                  practicalFullMarks: app.practical_full_marks !== undefined ? app.practical_full_marks : (app.practicalFullMarks !== undefined ? app.practicalFullMarks : 0)
             });
          }
      });
      
      submittedResults.forEach(sub => {
         if (sub.status === 'Approved' && String(sub.class).trim() === String(className).trim() && examTypeMatches(sub.examType || sub.exam_type, examType)) {
            (sub.students || []).forEach(student => {
               allResults.push({
                  symbolNumber: String(student.symbolNumber || student.symbol_number || student.roll || '').replace(/^SYM/i, '').trim(),
                  name: student.name,
                  class: sub.class,
                  examType: sub.examType || sub.exam_type,
                  subject: sub.subject,
                  marks: student.marks || 0,
                  theoryMarks: student.marks || 0,
                  practicalMarks: student.practicalMarks || student.practical_marks || 0,
                  totalMarks: sub.totalMarks || sub.total_marks || 100,
                  theoryFullMarks: sub.theory_full_marks !== undefined ? sub.theory_full_marks : (sub.theoryFullMarks !== undefined ? sub.theoryFullMarks : (sub.totalMarks || sub.total_marks || 100)),
                  practicalFullMarks: sub.practical_full_marks !== undefined ? sub.practical_full_marks : (sub.practicalFullMarks !== undefined ? sub.practicalFullMarks : 0)
               });
            });
         }
      });

      const academicYear = document.getElementById('leadersheet-year')?.value || new Date().getFullYear();
      allResults.forEach(r => r.academicYear = academicYear);
      
      if (allResults.length === 0) {
          alert("No results found to publish.");
          return;
      }

      const published = JSON.parse(localStorage.getItem('published_results') || '[]');
      
      // Remove previously published results for this class, exam, and year to overwrite
      const newPublished = published.filter(r => !(String(r.class).trim() === String(className).trim() && examTypeMatches(r.examType, examType) && String(r.academicYear) === String(academicYear)));
      
      // Add new results
      newPublished.push(...allResults);
      
      localStorage.setItem('published_results', JSON.stringify(newPublished));
      alert('Results successfully published! Students can now view them on the portal.');
    }

    // DOWNLOAD CURRENT LEDGER TO CSV
    function downloadLeadersheet(className, examType, academicYear) {
      const table = document.querySelector('.ledger-table');
      if (!table) {
        alert("No ledger table found to download.");
        return;
      }
      
      let csvContent = '\ufeff'; // UTF-8 BOM
      csvContent += `"Shree Saraswati Secondary School"\r\n`;
      csvContent += `"${examType} Ledger ${academicYear} - Class: ${className}"\r\n\r\n`;
      
      const rows = table.querySelectorAll('tr');
      rows.forEach(row => {
        const cols = row.querySelectorAll('th, td');
        const rowData = [];
        cols.forEach(col => {
          let text = col.innerText.replace(/\r?\n|\r/g, ' ').replace(/"/g, '""').trim();
          rowData.push(`"${text}"`);
        });
        csvContent += rowData.join(',') + '\r\n';
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${className.replace(/\s+/g, '_')}_${examType.replace(/\s+/g, '_')}_Ledger_${academicYear}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    function viewMarksheet(symbolNumber) {
      const className = document.getElementById('leadersheet-class')?.value;
      const examType = document.getElementById('leadersheet-exam')?.value;
      
      let allResults = window.currentAllResults || [];
      
      // Fallback to localStorage if window.currentAllResults is not populated
      if (allResults.length === 0) {
        const approvedResults = JSON.parse(localStorage.getItem('approved_results') || '[]');
        const submittedResults = JSON.parse(localStorage.getItem('submitted_results') || '[]');
        
        allResults = [...approvedResults];
        submittedResults.forEach(sub => {
           if (sub.status !== 'Approved') {
              (sub.students || []).forEach(student => {
                 allResults.push({
                    symbolNumber: student.symbolNumber,
                    name: student.name,
                    class: sub.class,
                    examType: sub.exam_type || sub.examType,
                    subject: sub.subject,
                    marks: student.marks,
                    totalMarks: student.totalMarks || sub.total_marks || 100
                 });
              });
           }
        });
      }

      // First try to get results with class and exam filters - strict examType match
      let studentResults = allResults.filter(r => r.symbolNumber === symbolNumber && r.class === className && r.examType === examType);
      
      // If no results with filters, try with just symbolNumber from allResults
      if (studentResults.length === 0) {
        studentResults = allResults.filter(r => r.symbolNumber === symbolNumber);
      }
      
      // If still no results, show error
      if (studentResults.length === 0) {
        alert('No results found for this student.');
        return;
      }

      const studentName = studentResults[0].name;
      
      // Try to find the student in registry for DOB
      const studentsRegistry = window.currentAllStudents || JSON.parse(localStorage.getItem('students_registry') || '[]');
      const regStudent = studentsRegistry.find(s => s.roll == symbolNumber || s.name === studentName);
      const dob = regStudent && regStudent.dob ? regStudent.dob : '2066/11/22'; // Default fallback if not found

      document.getElementById('ms-student-name').innerText = studentName;
      document.getElementById('ms-student-dob').innerText = dob;
      document.getElementById('ms-student-grade').innerText = className;
      document.getElementById('ms-exam-name').innerText = examType ? examType.toUpperCase() : 'TERM EXAM';
      document.getElementById('ms-exam-title').innerText = examType || 'Term Exam';
      
      const academicYear = document.getElementById('leadersheet-year')?.value || new Date().getFullYear();
      document.getElementById('ms-exam-year').innerText = academicYear;
      document.getElementById('ms-issue-date').innerText = new Date().toLocaleDateString();

      const tbody = document.getElementById('ms-marks-tbody');
      const thead = document.getElementById('ms-marks-thead');
      tbody.innerHTML = '';
      
      const isFinalTerm = (examType === 'Final Term');
      if (isFinalTerm) {
          thead.innerHTML = `
              <tr>
                <th rowspan="2">S.NO.</th>
                <th rowspan="2">Subjects</th>
                <th colspan="4">Marks (Th + Pr)</th>
                <th rowspan="2">Total</th>
                <th rowspan="2">Grade</th>
              </tr>
              <tr>
                <th>1st Term</th>
                <th>2nd Term</th>
                <th>Final</th>
                <th>Practical</th>
              </tr>
          `;
      } else {
          thead.innerHTML = `
              <tr>
                <th>S.NO.</th>
                <th>Subjects</th>
                <th>Credit Hour</th>
                <th>Grade Point</th>
                <th>Grade</th>
                <th>Remarks</th>
              </tr>
          `;
      }

      let term1Results = [];
      let term2Results = [];
      if (isFinalTerm) {
          term1Results = allResults.filter(r => r.symbolNumber === symbolNumber && r.class === className && r.examType === 'First Term' && (r.academicYear == academicYear || !r.academicYear));
          term2Results = allResults.filter(r => r.symbolNumber === symbolNumber && r.class === className && r.examType === 'Mid Term' && (r.academicYear == academicYear || !r.academicYear));
      }

      let totalMarksObtained = 0;
      let totalMaxMarks = 0;
      let totalCreditHours = 0;
      let weightedGpaSum = 0;

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
         if (isFinalTerm) {
             const t1Obj = term1Results.find(r => r.subject === result.subject);
             const t2Obj = term2Results.find(r => r.subject === result.subject);
             
             let t1Raw = t1Obj && t1Obj.marks ? parseInt(t1Obj.marks) : 0;
             let t2Raw = t2Obj && t2Obj.marks ? parseInt(t2Obj.marks) : 0;
             let finRaw = result.theoryMarks !== undefined ? result.theoryMarks : marks;
             let pracRaw = result.practicalMarks || 0;
             
             let t1 = t1Raw > 0 ? t1Raw.toFixed(1) : '-';
             let t2 = t2Raw > 0 ? t2Raw.toFixed(1) : '-';
             let fin = finRaw.toFixed(1);
             let prac = result.practicalMarks > 0 ? pracRaw.toFixed(1) : '-';
             let tot = marks.toFixed(1);

             tbody.innerHTML += `
                <tr>
                   <td>${index + 1}</td>
                   <td>${result.subject}</td>
                   <td>${t1}</td>
                   <td>${t2}</td>
                   <td>${fin}</td>
                   <td>${prac}</td>
                   <td><strong>${tot}</strong></td>
                   <td>${gpaData.grade}</td>
                </tr>
              `;
         } else {
             tbody.innerHTML += `
                <tr>
                   <td>${index + 1}</td>
                   <td>${result.subject}</td>
                   <td>${maxMarks === 100 ? 4 : (maxMarks/25).toFixed(1)}</td>
                   <td>${gpaData.gradePoint}</td>
                   <td>${gpaData.grade}</td>
                   <td>${remarks}</td>
                </tr>
             `;
         }
      });

      const overallPercentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0;
      const overallGpaData = calculateGPA(overallPercentage);
      overallGpaData.gpa = totalCreditHours > 0 ? (weightedGpaSum / totalCreditHours) : 0;
      
      document.getElementById('ms-overall-gpa').innerText = overallGpaData.gpa.toFixed(2);

      // Rank calculation - strict examType match
      const classResults = allResults.filter(r => r.class === className && r.examType === examType);
      const studentTotals = {};
      classResults.forEach(r => {
         if(!studentTotals[r.symbolNumber]) studentTotals[r.symbolNumber] = 0;
         studentTotals[r.symbolNumber] += parseInt(r.marks) || 0;
      });
      const sortedStudents = Object.keys(studentTotals).sort((a, b) => studentTotals[b] - studentTotals[a]);
      
      const studentKeysMatch = (k1, k2) => {
        const n1 = String(k1).replace(/^SYM/i, '').trim();
        const n2 = String(k2).replace(/^SYM/i, '').trim();
        return parseInt(n1) === parseInt(n2) || n1.toLowerCase() === n2.toLowerCase();
      };
      const rank = sortedStudents.findIndex(s => studentKeysMatch(s, symbolNumber)) + 1;
      document.getElementById('ms-rank').innerText = rank > 0 ? rank : '-';

      document.getElementById('marksheet-preview-modal').style.display = 'block';
    }

    function closeMarksheetPreview() {
      document.getElementById('marksheet-preview-modal').style.display = 'none';
    }

    // ── DIAGNOSTIC: CHECK AVAILABLE DATA ──
    async function diagnosisCheckData() {
      console.log("=== DIAGNOSIS CHECK ===");
      
      // Check localStorage
      const submitted = JSON.parse(localStorage.getItem('submitted_results') || '[]');
      const approved = JSON.parse(localStorage.getItem('approved_results') || '[]');
      console.log(`LocalStorage - Submitted Results: ${submitted.length}, Approved Results: ${approved.length}`);
      
      if (submitted.length > 0) {
        console.log("Submitted Results Classes:", submitted.map(s => `${s.class} (${s.examType})`));
      }
      if (approved.length > 0) {
        console.log("Approved Results Classes:", approved.map(a => `${a.class} (${a.examType})`));
      }
      
      // Check Supabase
      if (supabaseDb) {
        try {
          const { data: configs, error } = await supabaseDb
            .from('exam_configurations')
            .select('class, exam_type, subject');
          
          if (error) {
            console.error('Supabase error:', error);
          } else {
            const uniqueClasses = [...new Set(configs.map(c => `${c.class} (${c.exam_type}`))];
            console.log(`Supabase - Exam Configurations: ${configs.length}`);
            console.log("Available Class/ExamType combinations:", uniqueClasses);
          }
        } catch (e) {
          console.error('Exception querying Supabase:', e);
        }
      } else {
        console.log("Supabase not initialized");
      }
    }

    // ── RENDER RESULTS WITH GPA (LEADERSHEET) ──
        async function renderResultsWithGPA() {
      const wrapper = document.getElementById('leadersheet-wrapper');
      
      if (!wrapper) return;
      
      const className = document.getElementById('leadersheet-class')?.value || 'Grade 12 Technical - T';
      const examType = document.getElementById('leadersheet-exam')?.value || 'First Term';
      const academicYear = document.getElementById('leadersheet-year')?.value;

      // Use defaults if not selected - no longer require explicit selection
      // if (!className || !examType) {
      //    wrapper.innerHTML = '<div style="text-align:center; padding:2rem; color:var(--text-muted);">Please select a Class and Exam Type to generate the Terminal Ledger.</div>';
      //    return;
      // }

      wrapper.innerHTML = `
        <div style="text-align:center; padding:3rem; display:flex; flex-direction:column; align-items:center; gap:1rem;">
          <div class="loader-spinner" style="width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top: 4px solid var(--accent); border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
          <div style="color:var(--text-main); font-weight:600; font-size:1.1rem;">Loading exam results from database...</div>
          <div style="color:var(--text-muted); font-size:0.9rem;">Please wait a moment</div>
        </div>
      `;

      try {
        let allResults = [];
        let allStudentsData = []; // Declare outside to use across the function

        // Try to fetch from Supabase first (ignore academic year filter for initial load)
        if (supabaseDb) {
          console.log(`Querying Supabase for class="${className}", exam_type="${examType}"`);
          
          // FIRST: Fetch all students from the selected class (with error handling)
          try {
            const { data: studentsData, error: studentsError } = await supabaseDb
              .from('students_registry')
              .select('*')
              .eq('class', className);
            
            if (studentsError) {
              console.warn('Warning: Could not fetch students:', studentsError.message);
            } else if (studentsData && studentsData.length > 0) {
              console.log(`Found ${studentsData.length} students in class ${className}`);
              allStudentsData = studentsData;
            }
          } catch (err) {
            console.warn('Exception fetching students:', err);
            allStudentsData = [];
          }
          
          const { data: configs, error: configError } = await supabaseDb
            .from('exam_configurations')
            .select(`
              id,
              subject,
              class,
              exam_type,
              full_marks,
              pass_marks,
              academic_year,
              exam_session_id,
              exam_sessions(id, academic_year, terminal_number),
              exam_results(
                id,
                student_symbol,
                student_name,
                student_roll,
                theory_marks,
                practical_marks,
                total_marks,
                grade,
                percentage,
                approval_status,
                submission_date
              )
            `)
            .eq('class', className)
            .eq('exam_type', examType);

          if (configError) {
            console.error('Error fetching exam configs from Supabase:', configError);
          } else if (configs && configs.length > 0) {
            console.log(`Found ${configs.length} exam configurations`);
            configs.forEach(config => {
              // Filter by academic year either from the direct column (new) or fallback to session
              const configYear = config.academic_year || (config.exam_sessions ? config.exam_sessions.academic_year : null);
              if (academicYear && configYear && configYear !== academicYear) {
                return; // Skip this config if academic year doesn't match
              }
              
              if (config.exam_results && config.exam_results.length > 0) {
                console.log(`  Subject: ${config.subject}, Results: ${config.exam_results.length}`);
                config.exam_results.forEach(result => {
                  const rawSym = result.student_symbol || result.student_roll || '';
                  const normalizedSym = String(rawSym).replace(/^SYM/i, '').trim();
                  const marksVal = parseInt(result.total_marks) || 0;
                  // Calculate pass marks as 35% of full marks
                  const passMarks = Math.ceil(config.full_marks * 0.35);
                  allResults.push({
                    symbolNumber: normalizedSym,
                    name: result.student_name,
                    class: config.class,
                    examType: config.exam_type,
                    subject: config.subject,
                    marks: marksVal,
                    theoryMarks: (result.theory_marks !== null && result.theory_marks !== undefined) ? parseInt(result.theory_marks) : marksVal,
                    practicalMarks: (result.practical_marks !== null && result.practical_marks !== undefined) ? parseInt(result.practical_marks) : 0,
                    totalMarks: config.full_marks,
                    passMarks: passMarks,  // Store pass marks as 35% of total
                    grade: result.grade || '-',
                    percentage: result.percentage || 0,
                    approvalStatus: result.approval_status,
                    submissionDate: result.submission_date,
                    academicYear: config.exam_sessions?.academic_year,
                    isTemplate: marksVal === 0  // Mark as overwritable if marks are 0
                  });
                });
              } else {
                // No exam results for this subject - do not create template rows anymore
                // Only show subjects that have been filled out
              }
            });
          } else {
            console.log('No exam configurations found in Supabase for this class/exam');
            // Do not create default subjects templates anymore
          }
        } else {
          console.log('Supabase client not initialized');
        }

        // Directly query Supabase for submitted and approved results
        let submittedResults = [];
        let approvedResults = [];
        
        if (supabaseDb) {
          try {
            let subQuery = supabaseDb.from('submitted_results').select('*').eq('class', className);
            let appQuery = supabaseDb.from('approved_results').select('*').eq('class', className);
            
            if (academicYear) {
              subQuery = subQuery.eq('academic_year', academicYear);
              // Note: approved_results table in DB does not have academic_year column.
              // We will query by class only and filter by academicYear client-side.
            }
            
            const [subRes, appRes] = await Promise.all([subQuery, appQuery]);
            
            if (subRes.error) {
              console.warn('Supabase submitted_results query error:', subRes.error.message);
              submittedResults = JSON.parse(localStorage.getItem('submitted_results') || '[]');
            } else if (subRes.data) {
              submittedResults = subRes.data;
            }
            
            if (appRes.error) {
              console.warn('Supabase approved_results query error:', appRes.error.message);
              approvedResults = JSON.parse(localStorage.getItem('approved_results') || '[]');
            } else if (appRes.data) {
              approvedResults = appRes.data;
              if (academicYear) {
                approvedResults = approvedResults.filter(ar => {
                  if (ar.academic_year) {
                    return ar.academic_year === academicYear;
                  }
                  // Fallback to parsing from the date field if academic_year doesn't exist
                  return ar.date && ar.date.toString().includes(academicYear);
                });
              }
            }
          } catch(err) {
            console.warn('Error fetching results directly from Supabase:', err);
            // Fallback to localStorage
            submittedResults = JSON.parse(localStorage.getItem('submitted_results') || '[]');
            approvedResults = JSON.parse(localStorage.getItem('approved_results') || '[]');
          }
        } else {
          // Fallback to localStorage if no DB
          submittedResults = JSON.parse(localStorage.getItem('submitted_results') || '[]');
          approvedResults = JSON.parse(localStorage.getItem('approved_results') || '[]');
        }
        
        // Helper function to match exam types flexibly
        function examTypeMatches(storedType, selectedType) {
          const normalize = (type) => type?.toLowerCase().replace(/exam/gi, '').trim() || '';
          return normalize(storedType) === normalize(selectedType);
        }

        // Helper: find matching student in allResults by symbolNumber or name + subject
        function findStudentIdx(allResults, studentId, studentName, subject) {
          const normalizeId = (id) => String(id).replace(/^SYM/i, '').trim();
          const normStudentId = normalizeId(studentId);
          const normSubject = (subject || '').trim().toLowerCase();
          
          // Try by exact symbolNumber first
          let idx = allResults.findIndex(r => normalizeId(r.symbolNumber) === normStudentId && (r.subject || '').trim().toLowerCase() === normSubject);
          if (idx !== -1) return idx;
          
          // Try suffix match: e.g. '20831201' ends with '1201' or vice versa
          idx = allResults.findIndex(r => {
            const normExisting = normalizeId(r.symbolNumber);
            return (r.subject || '').trim().toLowerCase() === normSubject && (normExisting.endsWith(normStudentId) || normStudentId.endsWith(normExisting));
          });
          if (idx !== -1) return idx;
          
          // Fallback: try by name + subject
          idx = allResults.findIndex(r => r.name === studentName && (r.subject || '').trim().toLowerCase() === normSubject);
          return idx;
        }
        
        console.log(`[DEBUG] Queried ${submittedResults.length} submitted_results, ${approvedResults.length} approved_results from Supabase`);
        
        submittedResults.forEach(sub => {
          // Handle both camelCase (teacher direct save) and snake_case (Supabase sync)
          const subClass = sub.class;
          const subExamType = sub.examType || sub.exam_type;
          const subSubject = sub.subject;
          const subTotalMarks = sub.totalMarks || sub.total_marks || 100;
          const subTheoryFullMarks = sub.theory_full_marks !== undefined ? sub.theory_full_marks : (sub.theoryFullMarks !== undefined ? sub.theoryFullMarks : subTotalMarks);
          const subPracticalFullMarks = sub.practical_full_marks !== undefined ? sub.practical_full_marks : (sub.practicalFullMarks !== undefined ? sub.practicalFullMarks : 0);
          const subYear = String(sub.academic_year || sub.academicYear || '').trim();
          
          console.log(`[DEBUG] submitted_result row: class="${subClass}", exam="${subExamType}", subject="${subSubject}", year="${subYear}", students=${(sub.students || []).length}`);
          console.log(`[DEBUG] Matching: class=${subClass === className}, exam=${examTypeMatches(subExamType, examType)}, year=${!academicYear || subYear === String(academicYear).trim()}`);
          
          if (subClass === className && examTypeMatches(subExamType, examType) && (!academicYear || subYear === String(academicYear).trim())) {
            (sub.students || []).forEach(student => {
              const rawSymbol = student.symbolNumber || student.symbol_number || student.roll || '';
              const studentSymbol = String(rawSymbol).replace(/^SYM/i, '').trim();
              const resultObj = {
                symbolNumber: studentSymbol,
                name: student.name,
                class: subClass,
                examType: subExamType,
                subject: subSubject,
                marks: student.marks,
                theoryMarks: student.marks,
                practicalMarks: student.practicalMarks || student.practical_marks || 0,
                totalMarks: subTotalMarks,
                theoryFullMarks: subTheoryFullMarks,
                practicalFullMarks: subPracticalFullMarks,
                isTemplate: false
              };
              
              const existingIdx = findStudentIdx(allResults, studentSymbol, student.name, subSubject);
              
              if (existingIdx === -1) {
                allResults.push(resultObj);
              } else {
                // Always overwrite if submitted data has actual marks
                const existingMarks = parseInt(allResults[existingIdx].marks) || 0;
                const newMarks = parseInt(resultObj.marks) || 0;
                if (newMarks > 0 || existingMarks === 0) {
                  allResults[existingIdx] = resultObj;
                }
              }
            });
          }
        });

        approvedResults.forEach(approved => {
          const appClass = approved.class;
          const appExamType = approved.examType || approved.exam_type;
          const rawAppSymbol = approved.symbolNumber || approved.symbol_number || '';
          const appSymbol = String(rawAppSymbol).replace(/^SYM/i, '').trim();
          const appYear = String(approved.academic_year || approved.academicYear || '').trim();
          
          if (appClass === className && examTypeMatches(appExamType, examType) && (!academicYear || appYear === String(academicYear).trim())) {
            const existingIdx = findStudentIdx(allResults, appSymbol, approved.name, approved.subject);
            
            const approvedObj = {
              symbolNumber: appSymbol,
              name: approved.name,
              class: appClass,
              examType: appExamType,
              subject: approved.subject,
              marks: approved.marks || 0,
              theoryMarks: approved.theoryMarks || approved.theory_marks || approved.marks || 0,
              practicalMarks: approved.practicalMarks || approved.practical_marks || 0,
              totalMarks: approved.totalMarks || approved.total_marks || 100,
              theoryFullMarks: approved.theory_full_marks !== undefined ? approved.theory_full_marks : (approved.theoryFullMarks !== undefined ? approved.theoryFullMarks : (approved.totalMarks || approved.total_marks || 100)),
              practicalFullMarks: approved.practical_full_marks !== undefined ? approved.practical_full_marks : (approved.practicalFullMarks !== undefined ? approved.practicalFullMarks : 0),
              isTemplate: false
            };
            
            if (existingIdx === -1) {
              allResults.push(approvedObj);
            } else if (allResults[existingIdx].isTemplate || (parseInt(allResults[existingIdx].marks) || 0) === 0) {
              allResults[existingIdx] = approvedObj;
            }
          }
        });

        // Filter out template entries — only show subjects with actual filled marks
        // (We filter by !r.isTemplate instead of marks > 0 so we don't hide subjects where a student scored a 0)
        const filteredResults = allResults.filter(r => !r.isTemplate);
        console.log(`Total results after combining sources: ${allResults.length}, after filtering templates: ${filteredResults.length}`);
        allResults = filteredResults;
        window.currentAllResults = allResults;
        window.currentAllStudents = allStudentsData;

        if (allResults.length === 0) {
          // Show empty template table instead of just a message
          wrapper.innerHTML = `
            <div style="text-align:center; padding:1rem; background:#fff3cd; border-radius:8px; margin-bottom:1rem;">
              <strong>Empty Gradesheet Template</strong> - No results entered yet for this class/exam. Data will appear here as teachers submit marks.
            </div>
            <div class="custom-table-wrapper">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Subject</th>
                    <th>Exam Type</th>
                    <th>Marks (Out of 100)</th>
                    <th>Grade</th>
                    <th>GPA</th>
                    <th>Percentage</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colspan="9" style="text-align:center; padding:2rem;">No student records found. Waiting for teacher submissions...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          `;
          return;
        }

        // Extract unique subjects and their full/pass marks
        const subjectsSet = new Set();
        const subjectMarksMap = {}; // Map subject -> {fullMarks, passMarks, hasPractical}
        
        allResults.forEach(r => {
          // Normalize subject name case-insensitively
          let subjName = (r.subject || '').trim();
          let existingSubj = Array.from(subjectsSet).find(s => s.toLowerCase() === subjName.toLowerCase());
          if (existingSubj) {
            r.subject = existingSubj;
          } else {
            subjectsSet.add(subjName);
            r.subject = subjName;
          }

          if (!subjectMarksMap[r.subject]) {
            const tm = parseInt(r.totalMarks) || 100;
            const pm = r.passMarks || Math.ceil(tm * 0.35);
            let tfm = r.theoryFullMarks !== undefined ? parseInt(r.theoryFullMarks) : tm;
            let pfm = r.practicalFullMarks !== undefined ? parseInt(r.practicalFullMarks) : 0;
            let ch = r.creditHour !== undefined ? parseFloat(r.creditHour) : 4;
            
            subjectMarksMap[r.subject] = {
              fullMarks: tm,
              passMarks: pm,
              theoryFullMarks: tfm,
              practicalFullMarks: pfm,
              hasPractical: pfm > 0 || parseInt(r.practicalMarks) > 0,
              creditHour: ch
            };
          }
          if (parseInt(r.practicalMarks) > 0) {
            subjectMarksMap[r.subject].hasPractical = true;
          }
          if (r.practicalFullMarks > 0) {
            subjectMarksMap[r.subject].practicalFullMarks = parseInt(r.practicalFullMarks);
          }
        });
        
        const subjects = Array.from(subjectsSet);

        // Group by student
        const studentMap = {};
        allResults.forEach(r => {
          if (!studentMap[r.symbolNumber]) {
            studentMap[r.symbolNumber] = {
              symbolNumber: r.symbolNumber,
              name: r.name,
              marksBySubject: {},
              totalMarksObtained: 0,
              totalMaxMarks: 0
            };
          }
          
          const practicalMarks = parseInt(r.practicalMarks) || 0;
          const theoryMarks = parseInt(r.theoryMarks) || parseInt(r.marks) || 0;
          const totalMarks = parseInt(r.totalMarks) || 100;
          const hasPractical = subjectMarksMap[r.subject]?.hasPractical;
          
          studentMap[r.symbolNumber].marksBySubject[r.subject] = {
             marks: parseInt(r.marks) || 0,
             theoryMarks: theoryMarks,
             practicalMarks: practicalMarks,
             totalMarks: totalMarks,
             passMarks: r.passMarks || Math.ceil(totalMarks * 0.35),
             creditHour: parseFloat(r.creditHour) || 4
          };
          
          let subjectTotal = hasPractical ? (theoryMarks + practicalMarks) : theoryMarks;
          studentMap[r.symbolNumber].totalMarksObtained += subjectTotal;
          studentMap[r.symbolNumber].totalMaxMarks += totalMarks;
        });

        const isFinalTerm = (examType === 'Final Term');
        let term1Results = [];
        let term2Results = [];
        
        if (isFinalTerm) {
          // Helper to match symbol keys robustly (e.g. SYM001, 001, 1)
          const studentKeysMatch = (k1, k2) => {
            const n1 = String(k1).replace(/^SYM/i, '').trim();
            const n2 = String(k2).replace(/^SYM/i, '').trim();
            return parseInt(n1) === parseInt(n2) || n1.toLowerCase() === n2.toLowerCase();
          };

          // Fetch previous term results if available
          if (supabaseDb) {
            const { data: term1Data } = await supabaseDb
              .from('exam_configurations')
              .select(`
                subject,
                exam_sessions(academic_year),
                exam_results(student_symbol, student_roll, student_name, total_marks)
              `)
              .eq('class', className)
              .eq('exam_type', 'First Term');
            
            const { data: term2Data } = await supabaseDb
              .from('exam_configurations')
              .select(`
                subject,
                exam_sessions(academic_year),
                exam_results(student_symbol, student_roll, student_name, total_marks)
              `)
              .eq('class', className)
              .eq('exam_type', 'Mid Term');

            if (term1Data) {
              term1Data.forEach(config => {
                if (config.exam_sessions && config.exam_sessions.academic_year === academicYear && config.exam_results) {
                  config.exam_results.forEach(r => {
                    const matchedKey = Object.keys(studentMap).find(k => studentKeysMatch(k, r.student_symbol || r.student_roll));
                    if (matchedKey && studentMap[matchedKey].marksBySubject[config.subject]) {
                      studentMap[matchedKey].marksBySubject[config.subject].term1Marks = parseInt(r.total_marks) || 0;
                    }
                  });
                }
              });
            }
            if (term2Data) {
              term2Data.forEach(config => {
                if (config.exam_sessions && config.exam_sessions.academic_year === academicYear && config.exam_results) {
                  config.exam_results.forEach(r => {
                    const matchedKey = Object.keys(studentMap).find(k => studentKeysMatch(k, r.student_symbol || r.student_roll));
                    if (matchedKey && studentMap[matchedKey].marksBySubject[config.subject]) {
                      studentMap[matchedKey].marksBySubject[config.subject].term2Marks = parseInt(r.total_marks) || 0;
                    }
                  });
                }
              });
            }
          }
        }

        // Calculate ranks and summary
        const studentTotals = Object.values(studentMap).map(s => ({ sym: s.symbolNumber, name: s.name, total: s.totalMarksObtained }));
        studentTotals.sort((a, b) => b.total - a.total);
        
        const totalStudents = studentTotals.length;
        const firstPos = studentTotals[0]?.name || '-';
        const secondPos = studentTotals[1]?.name || '-';
        const thirdPos = studentTotals[2]?.name || '-';

        // Build Thead for Ledger
        let theadHtml = `
          <tr>
            <th rowspan="4">Roll No</th>
            <th rowspan="4">Name Of Students</th>
        `;
        
        const colspan = isFinalTerm ? 6 : 4;

        subjects.forEach(sub => {
           theadHtml += `<th colspan="${colspan}">${sub}</th>`;
        });
        theadHtml += '<th rowspan="4">Total<br>Marks</th><th rowspan="4">Pass<br>Marks (35%)</th><th rowspan="4">Obtained<br>Marks</th><th rowspan="4">Overall GPA</th><th rowspan="4">Grade</th><th rowspan="4">Remarks</th><th rowspan="4">Action</th></tr><tr>';

        subjects.forEach(sub => {
           if (isFinalTerm) {
               theadHtml += `<th>1st Term</th><th>2nd Term</th><th>Final</th><th>Th Total</th><th>Practical</th><th>Total</th>`;
           } else {
               theadHtml += `<th>Th Total</th><th>Practical</th><th>Total</th><th>Grade</th>`;
           }
        });
        theadHtml += '</tr><tr>';

        subjects.forEach(sub => {
           const fullMarks = subjectMarksMap[sub]?.fullMarks || 100;
           const passMarks = subjectMarksMap[sub]?.passMarks || Math.ceil(fullMarks * 0.35);
           const hasPractical = subjectMarksMap[sub]?.hasPractical;
           let tfm = subjectMarksMap[sub]?.theoryFullMarks;
           let pfm = subjectMarksMap[sub]?.practicalFullMarks;

           if (hasPractical && (!pfm || pfm === 0)) {
               tfm = fullMarks * 0.75;
               pfm = fullMarks * 0.25;
           } else if (!hasPractical) {
               tfm = fullMarks;
               pfm = 0;
           }
           
           if (isFinalTerm) {
               const fm1 = (fullMarks * 0.10).toFixed(1);
               const fm2 = (fullMarks * 0.30).toFixed(1);
               const fmTheoryTotal = tfm.toFixed(1);
               const fmPractical = hasPractical ? pfm.toFixed(1) : '-';
               
               theadHtml += `<th>FM<br>${fm1}</th><th>FM<br>${fm2}</th><th>FM<br>${fullMarks}</th><th>FM<br>${fmTheoryTotal}</th><th>FM<br>${fmPractical}</th><th>FM<br>${fullMarks}</th>`;
           } else {
               const fmTheory = tfm.toFixed(1);
               const fmPractical = hasPractical ? pfm.toFixed(1) : '-';
               theadHtml += `<th>FM<br>${fmTheory}</th><th>FM<br>${fmPractical}</th><th>FM<br>${fullMarks}</th><th>-</th>`;
           }
        });
        theadHtml += '</tr><tr>';

        subjects.forEach(sub => {
           const fullMarks = subjectMarksMap[sub]?.fullMarks || 100;
           const passMarks = subjectMarksMap[sub]?.passMarks || Math.ceil(fullMarks * 0.35);
           const hasPractical = subjectMarksMap[sub]?.hasPractical;
           let tfm = subjectMarksMap[sub]?.theoryFullMarks;
           let pfm = subjectMarksMap[sub]?.practicalFullMarks;

           if (hasPractical && (!pfm || pfm === 0)) {
               tfm = fullMarks * 0.75;
               pfm = fullMarks * 0.25;
           } else if (!hasPractical) {
               tfm = fullMarks;
               pfm = 0;
           }
           
           if (isFinalTerm) {
               const pm1 = (passMarks * 0.10).toFixed(1);
               const pm2 = (passMarks * 0.30).toFixed(1);
               const pmTheoryTotal = Math.ceil(tfm * 0.35).toFixed(1);
               const pmPractical = hasPractical ? Math.ceil(pfm * 0.35).toFixed(1) : '-';
               theadHtml += `<th>PM<br>${pm1}</th><th>PM<br>${pm2}</th><th>PM<br>${passMarks}</th><th>PM<br>${pmTheoryTotal}</th><th>PM<br>${pmPractical}</th><th>PM<br>${passMarks}</th>`;
           } else {
               const pmTheory = Math.ceil(tfm * 0.35).toFixed(1);
               const pmPractical = hasPractical ? Math.ceil(pfm * 0.35).toFixed(1) : '-';
               theadHtml += `<th>PM<br>${pmTheory}</th><th>PM<br>${pmPractical}</th><th>PM<br>${passMarks}</th><th>-</th>`;
           }
        });
        theadHtml += '</tr>';

        // Build Tbody for Ledger
        let tbodyHtml = '';
        Object.values(studentMap).forEach(student => {
          let rowHtml = `<tr>
            <td><strong>${student.symbolNumber}</strong></td>
            <td style="text-align:left; white-space:nowrap;">${student.name}</td>`;
          
          let failedSubjects = 0;

          subjects.forEach(sub => {
             const sm = student.marksBySubject[sub];
             const hasPractical = subjectMarksMap[sub]?.hasPractical;
             if (sm) {
                const fullMarks = sm.totalMarks || 100;
                const passMarks = sm.passMarks || Math.ceil(fullMarks * 0.35);
                
                // Calculate actual obtained marks: if practical exists, add both; otherwise only theory
                const obtainedMarks = hasPractical ? (sm.theoryMarks + sm.practicalMarks) : sm.theoryMarks;
                
                // Check if student failed (obtained marks < pass marks)
                if (obtainedMarks < passMarks) failedSubjects++;

                if (isFinalTerm) {
                    let t1Raw = sm.term1Marks || 0;
                    let t2Raw = sm.term2Marks || 0;
                    let finRaw = sm.theoryMarks || sm.marks || 0;
                    let pracRaw = sm.practicalMarks || 0;
                    
                    let t1 = t1Raw > 0 ? t1Raw.toFixed(1) : '-';
                    let t2 = t2Raw > 0 ? t2Raw.toFixed(1) : '-';
                    let fin = finRaw.toFixed(1);
                    let prac = hasPractical ? (pracRaw > 0 ? pracRaw.toFixed(1) : '0.0') : '-';
                    let tot = obtainedMarks.toFixed(1);
                    
                    rowHtml += `<td>${t1}</td><td>${t2}</td><td>${fin}</td><td>${finRaw.toFixed(1)}</td><td>${prac}</td><td><strong>${tot}</strong></td>`;
                } else {
                    let theory = sm.theoryMarks || sm.marks || 0;
                    let practicalRaw = sm.practicalMarks || 0;
                    let practical = hasPractical ? (practicalRaw > 0 ? practicalRaw.toFixed(1) : '0.0') : '-';
                    let subjectTotal = obtainedMarks.toFixed(1);
                    
                    rowHtml += `
                       <td>${theory.toFixed(1)}</td>
                       <td>${practical}</td>
                       <td><strong>${subjectTotal}</strong></td>
                       <td>${calculateGPA((obtainedMarks / fullMarks) * 100).grade}</td>
                    `;
                }
             } else {
                if (isFinalTerm) {
                    rowHtml += `<td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td>`;
                } else {
                    rowHtml += `<td>-</td><td>-</td><td>-</td><td>-</td>`;
                }
             }
          });

          let totalCreditHours = 0;
          let weightedGpaSum = 0;
          subjects.forEach(sub => {
             const sm = student.marksBySubject[sub];
             if(sm) {
                 const ch = sm.creditHour || subjectMarksMap[sub].creditHour || 4;
                 const fm = sm.totalMarks || subjectMarksMap[sub].fullMarks || 100;
                 const hasPrac = subjectMarksMap[sub].hasPractical;
                 const om = hasPrac ? (sm.theoryMarks + sm.practicalMarks) : sm.theoryMarks;
                 const perc = fm > 0 ? (om / fm) * 100 : 0;
                 const gp = calculateGPA(perc).gpa;
                 
                 totalCreditHours += ch;
                 weightedGpaSum += (ch * gp);
             }
          });
          const overallGpa = totalCreditHours > 0 ? (weightedGpaSum / totalCreditHours) : 0;
          const overallPercentage = student.totalMaxMarks > 0 ? (student.totalMarksObtained / student.totalMaxMarks) * 100 : 0;
          const gpaData = calculateGPA(overallPercentage);
          gpaData.gpa = overallGpa;

          // Calculate total pass marks as 35% of total maximum marks
          const totalPassMarks = Math.ceil(student.totalMaxMarks * 0.35);
          
          let remarksHtml = '-';
          if (failedSubjects > 0) {
              remarksHtml = `<span style="color: red; font-weight: bold;">*${failedSubjects}</span>`;
          } else if (student.totalMarksObtained >= totalPassMarks) {
              remarksHtml = '<span style="color: green; font-weight: bold;">Pass</span>';
          } else {
              remarksHtml = '<span style="color: red; font-weight: bold;">Fail</span>';
          }

          rowHtml += `
            <td><strong>${student.totalMaxMarks}</strong></td>
            <td><strong>${totalPassMarks}</strong></td>
            <td><strong>${student.totalMarksObtained}</strong></td>
            <td><strong>${gpaData.gpa.toFixed(2)}</strong></td>
            <td><strong>${gpaData.grade}</strong></td>
            <td>${remarksHtml}</td>
            <td>
               <button class="submit-btn" style="padding: 0.2rem 0.5rem; font-size: 0.7rem; background: #3b82f6; margin-bottom: 2px;" onclick="viewMarksheet('${student.symbolNumber}')">View</button>
             
            </td>
          </tr>`;

          tbodyHtml += rowHtml;
        });

        // Construct final wrapper HTML
        const finalHtml = `
          <div class="ledger-title">
            <h2>Shree Saraswati Secondary School</h2>
            <h3>${examType} Ledger ${academicYear}</h3>
            <button class="submit-btn" style="background: var(--primary); margin-top: 10px; padding: 0.5rem 1rem;" onclick="publishCurrentLedger('${className}', '${examType}')">
               <i class="fas fa-bullhorn"></i> Publish Result to Student Portal
            </button>
            <button class="submit-btn" style="background: var(--accent); margin-top: 10px; padding: 0.5rem 1rem; margin-left: 10px;" onclick="downloadLeadersheet('${className}', '${examType}', '${academicYear}')">
               <i class="fas fa-download"></i> Download Ledger (CSV)
            </button>
          </div>
          <div class="ledger-container">
            <div class="ledger-table-wrapper">
              <table class="ledger-table">
                <thead>${theadHtml}</thead>
                <tbody>${tbodyHtml}</tbody>
              </table>
            </div>
            <div class="ledger-summary">
              Total NO of Students=${totalStudents}<br><br>
              Cleared passed students=${totalStudents} <!-- Assuming all clear for now --><br><br>
              No of Boys=-<br><br>
              No of Girls=-<br><br>
              First Position:<br><span style="color:#0ea5e9;">${firstPos}</span><br><br>
              Second Position:<br><span style="color:#0ea5e9;">${secondPos}</span><br><br>
              Third Position:<br><span style="color:#0ea5e9;">${thirdPos}</span>
            </div>
          </div>
        `;

        wrapper.innerHTML = finalHtml;
      } catch (error) {
        console.error('Error rendering results:', error);
        wrapper.innerHTML = '<div style="text-align:center; padding:2rem; color:var(--text-muted);">Error loading exam results. Please try again.</div>';
      }
    }




    // ── FILTER STUDENT RESULTS ──
    function filterStudentResults() {
      const searchValue = document.getElementById('search-student')?.value.toLowerCase() || '';
      const wrapper = document.getElementById('leadersheet-wrapper');
      if (!wrapper) return;
      const rows = wrapper.querySelectorAll('.ledger-table tbody tr');
      
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchValue) ? '' : 'none';
      });
    }

    // ── WEBSITE CMS CONTROLS AND RENDERING LOGIC ──
    function renderWebsiteConfig() {
      // 1. Render Highlights Ticker
      const highlights = JSON.parse(localStorage.getItem('website_highlights')) || [];
      const highlightsTbody = document.getElementById('cms-highlights-tbody');
      if (highlightsTbody) {
        highlightsTbody.innerHTML = '';
        if (highlights.length === 0) {
          highlightsTbody.innerHTML = '<tr><td colspan="2" style="text-align:center; color:var(--text-muted);">No highlights configured.</td></tr>';
        } else {
          highlights.forEach((hl, idx) => {
            highlightsTbody.innerHTML += `
              <tr>
                <td><div style="font-weight: 500; font-size: 0.95rem; color: var(--primary);">${hl}</div></td>
                <td style="text-align:center;">
                  <button type="button" style="background:#fee2e2; color:#ef4444; border:none; padding:0.4rem 0.8rem; border-radius:6px; font-weight:bold; cursor:pointer;" onclick="deleteCmsHighlight(${idx})">Remove</button>
                </td>
              </tr>
            `;
          });
        }
      }

      // 2. School Statistics (Demographics)
      const demo = JSON.parse(localStorage.getItem('website_demographics')) || { total: 0, male: 0, female: 0, staff: 0 };
      const demoTotal = document.getElementById('demo-total');
      const demoMale = document.getElementById('demo-male');
      const demoFemale = document.getElementById('demo-female');
      const demoStaff = document.getElementById('demo-staff');
      if (demoTotal) demoTotal.value = demo.total;
      if (demoMale) demoMale.value = demo.male;
      if (demoFemale) demoFemale.value = demo.female;
      if (demoStaff) demoStaff.value = demo.staff;

      // 3. Stats Ribbon Counters
      const heroStats = JSON.parse(localStorage.getItem('website_hero_stats')) || [
        { label: "Students Enrolled", value: "800+", icon: "graduation-cap" },
        { label: "Qualified Teachers", value: "45+", icon: "users" },
        { label: "Years of Excellence", value: "8+", icon: "trophy" },
        { label: "Pass Rate", value: "95%", icon: "trending-up" },
        { label: "Award Honours", value: "6", icon: "award" }
      ];
      const heroContainer = document.getElementById('cms-hero-inputs-container');
      if (heroContainer) {
        heroContainer.innerHTML = '';
        heroStats.forEach((stat, idx) => {
          heroContainer.innerHTML += `
            <div style="background:rgba(0,0,0,0.02); padding:1rem; border-radius:8px; border:1px solid #edf2f7; display:flex; flex-direction:column; gap:0.5rem;">
              <h4 style="margin:0 0 0.5rem 0; font-size:0.9rem; color:var(--primary); font-weight:700;">Counter ${idx + 1}</h4>
              <div class="form-group" style="margin:0;">
                <label style="font-size:0.75rem; font-weight:bold; margin-bottom:2px; display:block;">Value</label>
                <input type="text" class="form-control hero-val-input" data-index="${idx}" value="${stat.value || ''}" style="padding:0.4rem; height:32px; font-size:0.85rem;" required>
              </div>
              <div class="form-group" style="margin:0;">
                <label style="font-size:0.75rem; font-weight:bold; margin-bottom:2px; display:block;">Label</label>
                <input type="text" class="form-control hero-lbl-input" data-index="${idx}" value="${stat.label || ''}" style="padding:0.4rem; height:32px; font-size:0.85rem;" required>
              </div>
              <div class="form-group" style="margin:0;">
                <label style="font-size:0.75rem; font-weight:bold; margin-bottom:2px; display:block;">Icon Name (lucide)</label>
                <input type="text" class="form-control hero-ico-input" data-index="${idx}" value="${stat.icon || ''}" style="padding:0.4rem; height:32px; font-size:0.85rem;" required>
              </div>
            </div>
          `;
        });
      }

      // 4. Co-curricular Activities & Clubs
      const clubs = JSON.parse(localStorage.getItem('school_clubs')) || [];
      const clubsTbody = document.getElementById('cms-clubs-tbody');
      if (clubsTbody) {
        clubsTbody.innerHTML = '';
        if (clubs.length === 0) {
          clubsTbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No clubs configured.</td></tr>';
        } else {
          clubs.forEach(club => {
            const imgHtml = club.image_url ? `<img src="${club.image_url}" style="width:60px; height:40px; object-fit:cover; border-radius:4px; display:block; margin:auto;" />` : '<span style="color:var(--text-muted); font-size:0.8rem;">No image</span>';
            clubsTbody.innerHTML += `
              <tr>
                <td><span class="status-badge active" style="font-size:0.8rem; padding:0.25rem 0.6rem; border-radius:12px;">${club.category}</span></td>
                <td><div style="font-weight:700; color:var(--primary);">${club.title}</div></td>
                <td><div style="font-size:0.85rem; color:var(--text-muted); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${club.description || ''}">${club.description || ''}</div></td>
                <td style="text-align:center;">${imgHtml}</td>
                <td style="text-align:center;">
                  <button type="button" style="background:#fee2e2; color:#ef4444; border:none; padding:0.4rem 0.8rem; border-radius:6px; font-weight:bold; cursor:pointer;" onclick="deleteCmsClub('${club.id}')">Remove</button>
                </td>
              </tr>
            `;
          });
        }
      }
    }

    async function addCmsHighlight(event) {
      event.preventDefault();
      const input = document.getElementById('new-highlight-text');
      if (!input) return;
      const val = input.value.trim();
      if (!val) return;
      
      const highlights = JSON.parse(localStorage.getItem('website_highlights')) || [];
      highlights.push(val);
      
      if (supabaseDb) {
        try {
          const { error } = await supabaseDb.from('school_config').upsert([{ key: 'website_highlights', val: highlights }]);
          if (error) throw error;
        } catch (e) {
          console.error("Failed to save highlights:", e);
          alert("Error saving announcement highlight to Supabase: " + e.message);
          return;
        }
      }
      
      localStorage.setItem('website_highlights', JSON.stringify(highlights));
      input.value = '';
      renderWebsiteConfig();
      alert("Announcement highlight added successfully!");
    }

    async function deleteCmsHighlight(idx) {
      if (!confirm("Are you sure you want to remove this highlight announcement ticker?")) return;
      const highlights = JSON.parse(localStorage.getItem('website_highlights')) || [];
      highlights.splice(idx, 1);
      
      if (supabaseDb) {
        try {
          const { error } = await supabaseDb.from('school_config').upsert([{ key: 'website_highlights', val: highlights }]);
          if (error) throw error;
        } catch (e) {
          console.error("Failed to delete highlight:", e);
          alert("Error deleting announcement highlight from Supabase: " + e.message);
          return;
        }
      }
      
      localStorage.setItem('website_highlights', JSON.stringify(highlights));
      renderWebsiteConfig();
      alert("Announcement highlight removed successfully!");
    }

    async function saveCmsDemographics(event) {
      event.preventDefault();
      const total = parseInt(document.getElementById('demo-total').value) || 0;
      const male = parseInt(document.getElementById('demo-male').value) || 0;
      const female = parseInt(document.getElementById('demo-female').value) || 0;
      const staff = parseInt(document.getElementById('demo-staff').value) || 0;
      
      const demo = { total, male, female, staff };
      
      if (supabaseDb) {
        try {
          const { error } = await supabaseDb.from('school_config').upsert([{ key: 'website_demographics', val: demo }]);
          if (error) throw error;
        } catch (e) {
          console.error("Failed to save demographics:", e);
          alert("Error saving demographics to Supabase: " + e.message);
          return;
        }
      }
      
      localStorage.setItem('website_demographics', JSON.stringify(demo));
      renderWebsiteConfig();
      alert("Detailed school demographics updated successfully!");
    }

    async function saveCmsHeroStats(event) {
      event.preventDefault();
      const heroStats = [];
      const valInputs = document.querySelectorAll('.hero-val-input');
      const lblInputs = document.querySelectorAll('.hero-lbl-input');
      const icoInputs = document.querySelectorAll('.hero-ico-input');
      
      for (let i = 0; i < valInputs.length; i++) {
        heroStats.push({
          value: valInputs[i].value.trim(),
          label: lblInputs[i].value.trim(),
          icon: icoInputs[i].value.trim()
        });
      }
      
      if (supabaseDb) {
        try {
          const { error } = await supabaseDb.from('school_config').upsert([{ key: 'website_hero_stats', val: heroStats }]);
          if (error) throw error;
        } catch (e) {
          console.error("Failed to save hero stats:", e);
          alert("Error saving ribbon counters to Supabase: " + e.message);
          return;
        }
      }
      
      localStorage.setItem('website_hero_stats', JSON.stringify(heroStats));
      renderWebsiteConfig();
      alert("Ribbon counters saved successfully!");
    }

    function previewClubImage(input) {
      const preview = document.getElementById('club-image-preview');
      const img = document.getElementById('club-img-el');
      if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
          img.src = e.target.result;
          preview.style.display = 'block';
        }
        reader.readAsDataURL(input.files[0]);
      } else {
        img.src = '';
        preview.style.display = 'none';
      }
    }

    async function addCmsClub(event) {
      event.preventDefault();
      const title = document.getElementById('club-title').value.trim();
      const category = document.getElementById('club-category').value.trim();
      const description = document.getElementById('club-desc').value.trim();
      const fileInput = document.getElementById('club-file');
      
      const submitBtn = document.getElementById('club-submit-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Publishing Club Card... ⏳';
      }
      
      let imageUrl = '';
      if (fileInput && fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const path = `clubs/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        imageUrl = await uploadMediaFile(file, path);
      } else {
        // use default splash unsplash
        imageUrl = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=500&q=50";
      }
      
      const newClub = {
        title,
        category,
        description,
        image_url: imageUrl
      };
      
      if (supabaseDb) {
        try {
          const { error } = await supabaseDb.from('school_clubs').insert([newClub]);
          if (error) throw error;
        } catch (e) {
          console.error("Failed to save club:", e);
          alert("Error saving club card to Supabase: " + e.message);
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Publish Club Card';
          }
          return;
        }
      }
      
      await pullAllFromSupabase();
      
      // Reset form
      event.target.reset();
      const preview = document.getElementById('club-image-preview');
      if (preview) preview.style.display = 'none';
      
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Publish Club Card';
      }
      
      renderWebsiteConfig();
      alert("Co-curricular club card published successfully!");
    }

    async function deleteCmsClub(id) {
      if (!confirm("Are you sure you want to remove this co-curricular club card? It will disappear from the homepage.")) return;
      
      if (supabaseDb) {
        try {
          const { error } = await supabaseDb.from('school_clubs').delete().eq('id', id);
          if (error) throw error;
        } catch (e) {
          console.error("Failed to delete club:", e);
          alert("Error deleting club card from Supabase: " + e.message);
          return;
        }
      }
      
      await pullAllFromSupabase();
      renderWebsiteConfig();
      alert("Co-curricular club card removed successfully!");
    }

    // ── ADMIN AUTHENTICATION ──
    let adminUser = null;

    function checkAndShowLogin() {
      const stored = localStorage.getItem('adminUser');
      if (stored) {
        try {
          adminUser = JSON.parse(stored);
          hideLoginModal();
          // Try to restore Supabase session
          restoreSupabaseSession();
          return true;
        } catch(e) {
          localStorage.removeItem('adminUser');
        }
      }
      showLoginModal();
      return false;
    }

    function showLoginModal() {
      document.getElementById('login-modal').classList.remove('hidden');
      document.getElementById('login-modal').style.display = 'flex';
    }

    function hideLoginModal() {
      document.getElementById('login-modal').classList.add('hidden');
      document.getElementById('login-modal').style.display = 'none';
    }

    async function restoreSupabaseSession() {
      try {
        if (!supabaseDb) {
          console.warn('[WARNING] Supabase client not available for session restoration');
          return;
        }

        // Check if demo user
        if (adminUser.isDemoUser) {
          console.log('[INFO] Demo user detected, skipping Supabase session restoration');
          return;
        }

        // Try to restore session from Supabase
        const { data: { session }, error } = await supabaseDb.auth.getSession();
        
        if (session) {
          console.log('[SUCCESS] Supabase session restored:', session.user.email);
          adminUser.session = session;
          localStorage.setItem('adminUser', JSON.stringify(adminUser));
          localStorage.setItem('authToken', session.access_token);
          return;
        }

        // If no session, try to refresh
        const { data: { session: refreshedSession }, error: refreshError } = await supabaseDb.auth.refreshSession();
        if (refreshedSession) {
          console.log('[SUCCESS] Supabase session refreshed:', refreshedSession.user.email);
          adminUser.session = refreshedSession;
          localStorage.setItem('adminUser', JSON.stringify(adminUser));
          localStorage.setItem('authToken', refreshedSession.access_token);
          return;
        }

        console.warn('[WARNING] Could not restore or refresh Supabase session');
        // Session expired, user will need to log in again
        localStorage.removeItem('adminUser');
        localStorage.removeItem('authToken');
        showLoginModal();
      } catch (error) {
        console.error('[ERROR] Error restoring Supabase session:', error);
      }
    }

    async function handleAdminLogin(event) {
      event.preventDefault();
      const email = document.getElementById('admin-email').value.trim();
      const password = document.getElementById('admin-password').value;
      const errorDiv = document.getElementById('login-error');
      const loginBtn = document.getElementById('login-btn');

      errorDiv.classList.remove('show');
      loginBtn.disabled = true;
      loginBtn.textContent = 'Signing In...';

      try {
        // Try to authenticate with Supabase
        if (supabaseDb) {
          const { data, error } = await supabaseDb.auth.signInWithPassword({
            email: email,
            password: password
          });

          if (error) {
            // If Supabase auth fails, check local credentials (for demo)
            if (email === 'info@sss.com' && password === 'sss@121') {
              console.log('[INFO] Using demo credentials for login');
              adminUser = { email: email, authenticated: true, timestamp: Date.now(), isDemoUser: true };
              localStorage.setItem('adminUser', JSON.stringify(adminUser));
              // Force RLS bypass for demo user by setting auth context
              localStorage.setItem('authToken', 'demo-admin-token');
              hideLoginModal();
              document.getElementById('admin-login-form').reset();
              location.reload();
              return;
            } else {
              throw new Error('Invalid email or password');
            }
          }

          // Supabase login successful
          console.log('[SUCCESS] Authenticated with Supabase:', data.user.email);
          adminUser = { email: data.user.email, id: data.user.id, authenticated: true, timestamp: Date.now(), session: data.session };
          localStorage.setItem('adminUser', JSON.stringify(adminUser));
          
          // Verify session is set
          const { data: { session } } = await supabaseDb.auth.getSession();
          console.log('[DEBUG] Session verified:', session ? 'Active' : 'Not found');
          
          if (session) {
            console.log('[SUCCESS] Session token acquired, RLS should work now');
            localStorage.setItem('authToken', session.access_token);
          }
          
          hideLoginModal();
          document.getElementById('admin-login-form').reset();
          location.reload();
        } else {
          // Fallback to local authentication
          if (email === 'info@sss.com' && password === 'sss@121') {
            console.log('[INFO] Supabase not available, using demo credentials');
            adminUser = { email: email, authenticated: true, timestamp: Date.now(), isDemoUser: true };
            localStorage.setItem('adminUser', JSON.stringify(adminUser));
            localStorage.setItem('authToken', 'demo-admin-token');
            hideLoginModal();
            document.getElementById('admin-login-form').reset();
            location.reload();
          } else {
            throw new Error('Invalid email or password');
          }
        }
      } catch(err) {
        console.error('Login error:', err);
        errorDiv.textContent = '❌ ' + (err.message || 'Login failed. Check credentials.');
        errorDiv.classList.add('show');
      } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Sign In';
      }
    }

    function logoutAdmin() {
      localStorage.removeItem('adminUser');
      adminUser = null;
      if (supabaseDb) {
        supabaseDb.auth.signOut();
      }
      showLoginModal();
      document.getElementById('admin-login-form').reset();
    }

    // ── DOM MOUNT ──
    document.addEventListener('DOMContentLoaded', async () => {
      // Wait for all scripts to load
      let attempts = 0;
      while (attempts < 100 && (typeof pullAllFromSupabase === 'undefined' || typeof supabaseDb === 'undefined')) {
        await new Promise(resolve => setTimeout(resolve, 50));
        attempts++;
      }
      
      if (typeof pullAllFromSupabase === 'undefined') {
        console.error('Critical error: pullAllFromSupabase not loaded after timeout');
        return;
      }

      // Check login first
      if (!checkAndShowLogin()) {
        return; // Wait for user to login
      }

      // Update admin email display
      if (adminUser) {
        document.getElementById('admin-email-display').textContent = adminUser.email;
      }

      // Pull all data from Supabase first
      await pullAllFromSupabase();
      await seedSupabaseIfEmpty();
      await pullAllFromSupabase();
      
      // Pull calendar config
      if (supabaseDb) {
        try {
          const { data: configData1 } = await supabaseDb.from('school_config').select('*').eq('key', 'calendar_events');
          if (configData1 && configData1.length > 0) {
            localStorage.setItem('school_calendar_events', JSON.stringify(configData1[0].val));
          }
          const { data: configData2 } = await supabaseDb.from('school_config').select('*').eq('key', 'calendar_published');
          if (configData2 && configData2.length > 0) {
            localStorage.setItem('school_calendar_published', JSON.stringify(configData2[0].val));
          }
        } catch(err) { console.error("Error fetching config from Supabase:", err); }
      }

      initializeSharedDatabase();
      renderDashboardMetrics();
      loadStudentAccounts();
      renderTeachers();
      renderPayments();
      renderGlobalFeeLedger();
      renderNotices();
      renderAdminLeaves();
      renderTimetable();
      renderGPABoard();
      renderPendingResults();
      
      // Set default values for leadersheet filters BEFORE rendering
      const leadershipClassSelect = document.getElementById('leadersheet-class');
      const leadershipExamSelect = document.getElementById('leadersheet-exam');
      const leadershipYearSelect = document.getElementById('leadersheet-year');
      
      if (leadershipClassSelect) leadershipClassSelect.value = 'Grade 12 Technical - T';
      if (leadershipExamSelect) leadershipExamSelect.value = 'First Term';
      if (leadershipYearSelect) leadershipYearSelect.value = '2083';
      
      renderResultsWithGPA();
      renderSchoolEvents();
      initCalendar();
      renderWebsiteConfig();
      setTimeout(populateAllSubjectDropdowns, 200);
    });

    // ── CUSTOM EVENT MANAGER LOGIC ──
    function getSchoolEvents() {
      try {
        return JSON.parse(localStorage.getItem('school_events')) || [];
      } catch(e) {
        return [];
      }
    }

    function saveSchoolEvents(events) {
      localStorage.setItem('school_events', JSON.stringify(events));
    }

    async function handleSchoolEventSubmit(event) {
      event.preventDefault();
      const title = document.getElementById('event-title').value;
      const date = document.getElementById('event-date').value;
      const time = document.getElementById('event-time').value;
      const location = document.getElementById('event-location').value;
      const desc = document.getElementById('event-desc').value;

      const newEvent = {
        title,
        date,
        time,
        location,
        desc,
        published: true
      };

      if (supabaseDb) {
        try {
          const { error } = await supabaseDb.from('school_events').insert([newEvent]);
          if (error) {
            alert("Error publishing event: " + error.message);
            return;
          }
        } catch(err) { console.error("Error saving event:", err); }
      }

      await pullAllFromSupabase();

      document.getElementById('add-school-event-form').reset();
      renderSchoolEvents();
      alert('Event successfully published to the website!');
    }

    async function deleteSchoolEvent(id) {
      if(!confirm("Are you sure you want to delete this event? It will be removed from the website.")) return;
      if (supabaseDb) {
        try {
          const numericId = parseInt(id);
          if (!isNaN(numericId)) {
            await supabaseDb.from('school_events').delete().eq('id', numericId);
          } else {
            await supabaseDb.from('school_events').delete().eq('title', id);
          }
        } catch(err) { console.error("Error deleting event:", err); }
      }
      
      let events = getSchoolEvents();
      events = events.filter(e => e.id.toString() !== id.toString());
      saveSchoolEvents(events);
      renderSchoolEvents();
    }

    function renderSchoolEvents() {
      const tbody = document.getElementById('published-events-table-body');
      if(!tbody) return;
      const events = getSchoolEvents();
      tbody.innerHTML = '';
      if(events.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#9ca3af;">No published events yet.</td></tr>';
        return;
      }

      events.forEach(ev => {
        // Format date simply
        const d = new Date(ev.date);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        tbody.innerHTML += `
          <tr>
            <td>
              <div style="font-weight:700; color:var(--primary);">${ev.title}</div>
              <div style="font-size:0.8rem; color:var(--text-muted);">${ev.location ? ev.location : 'School Campus'}</div>
            </td>
            <td>
              <div style="font-weight:600; color:var(--secondary);">${dateStr}</div>
              <div style="font-size:0.8rem; color:var(--text-muted);">${ev.time ? ev.time : 'Full Day'}</div>
            </td>
            <td>
              <button onclick="deleteSchoolEvent('${ev.id}')" style="background:#fee2e2; color:#ef4444; border:none; padding:0.4rem 0.8rem; border-radius:6px; font-weight:bold; cursor:pointer;">Remove</button>
            </td>
          </tr>
        `;
      });
    }

    // ══════════════════════════════════════════════
    // ──  CUSTOM NEPALI CALENDAR ENGINE ──
    // ══════════════════════════════════════════════
    const BS_MONTHS = ['Baisakh','Jestha','Ashadh','Shrawan','Bhadra','Ashwin','Kartik','Mangsir','Poush','Magh','Falgun','Chaitra'];
    const BS_MONTHS_NP = ['बैशाख','जेठ','असार','श्रावण','भाद्र','आश्विन','कार्तिक','मङ्सिर','पौष','माघ','फाल्गुण','चैत्र'];
    // Days per month for BS years 2079-2085
    const BS_DATA = {
      2079:[31,32,31,32,31,30,30,29,30,29,30,30],
      2080:[31,31,32,32,31,30,30,29,30,29,29,31],
      2081:[31,32,31,32,31,30,30,29,30,29,30,30],
      2082:[31,31,32,31,31,31,30,29,30,29,30,30],
      2083:[31,31,32,32,31,30,30,29,29,30,29,31],
      2084:[31,32,31,32,31,30,30,29,30,29,30,30],
      2085:[31,31,32,31,31,31,30,29,30,29,30,30]
    };
    // Reference: BS 2082 Baisakh 1 = AD April 14, 2025
    const REF_BS = { y:2082, m:1, d:1 };
    const REF_AD = new Date(2025, 3, 14); // April 14, 2025

    function adToBS(adDate) {
      let diff = Math.floor((adDate - REF_AD) / 86400000);
      let y = REF_BS.y, m = REF_BS.m - 1, d = REF_BS.d;
      if (diff >= 0) {
        while (diff > 0) {
          const days = BS_DATA[y] ? BS_DATA[y][m] : 30;
          if (d + diff <= days) { d += diff; diff = 0; }
          else { diff -= (days - d + 1); d = 1; m++; if (m >= 12) { m = 0; y++; } }
        }
      } else {
        diff = -diff;
        while (diff > 0) {
          if (d - diff >= 1) { d -= diff; diff = 0; }
          else { diff -= d; m--; if (m < 0) { m = 11; y--; } d = BS_DATA[y] ? BS_DATA[y][m] : 30; }
        }
      }
      return { y, m: m+1, d };
    }

    function bsToAD(y, m, d) {
      let totalDays = 0;
      let cy = REF_BS.y, cm = REF_BS.m - 1, cd = REF_BS.d;
      // Compute days from ref to (y,m,d)
      let target = { y, m: m-1, d };
      // Simple forward/backward traversal
      let cur = new Date(REF_AD);
      let bs = { y: cy, m: cm, d: cd };
      while (bs.y !== target.y || bs.m !== target.m || bs.d !== target.d) {
        // Step one day
        bs.d++;
        cur.setDate(cur.getDate() + 1);
        if (BS_DATA[bs.y] && bs.d > BS_DATA[bs.y][bs.m]) {
          bs.d = 1; bs.m++;
          if (bs.m >= 12) { bs.m = 0; bs.y++; }
        }
        // Safety
        if (Math.abs(cur - REF_AD) > 86400000 * 3700) break;
      }
      return cur;
    }

    // Get today in BS
    function getTodayBS() { return adToBS(new Date()); }

    let calState = { y: 0, m: 0 };
    let calEditKey = null; // key of event being edited: "y-m-d-idx"

    function initCalendar() {
      const today = getTodayBS();
      calState = { y: today.y, m: today.m };
      renderCalendar();
      updateCalPublishStatus();
    }

    function getCalEvents() {
      try { return JSON.parse(localStorage.getItem('school_calendar_events')) || {}; } catch(e) { return {}; }
    }
    async function saveCalEvents(data) {
      localStorage.setItem('school_calendar_events', JSON.stringify(data));
      if (supabaseDb) {
        try {
          await supabaseDb.from('school_config').upsert([{ key: 'calendar_events', val: data }]);
        } catch(err) { console.error("Error saving calendar events to Supabase:", err); }
      }
    }

    function renderCalendar() {
      const { y, m } = calState;
      const data = BS_DATA[y] || BS_DATA[2083];
      const daysInMonth = data[m-1];

      // Find what day of week month starts (use bsToAD for day 1)
      const firstAD = bsToAD(y, m, 1);
      const startDow = firstAD.getDay(); // 0=Sun

      const grid = document.getElementById('cal-grid');
      const titleEl = document.getElementById('cal-month-title');
      const rangeEl = document.getElementById('cal-ad-range');
      if (!grid) return;

      titleEl.textContent = `${BS_MONTHS_NP[m-1]} ${y}  (${BS_MONTHS[m-1]} ${y})`;
      const lastAD = bsToAD(y, m, daysInMonth);
      rangeEl.textContent = `${firstAD.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})} — ${lastAD.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}`;

      const today = getTodayBS();
      const calEvents = getCalEvents();

      let html = '';
      // Empty cells
      for (let i = 0; i < startDow; i++) html += '<div class="cal-cell empty"></div>';

      for (let d = 1; d <= daysInMonth; d++) {
        const adDate = new Date(firstAD);
        adDate.setDate(firstAD.getDate() + d - 1);
        const adStr = adDate.toLocaleDateString('en-US',{month:'short',day:'numeric'});
        const dow = adDate.getDay();
        const isToday = today.y === y && today.m === m && today.d === d;
        const dayKey = `${y}-${m}-${d}`;
        const dayEvts = calEvents[dayKey] || [];
        const isSun = dow === 0, isSat = dow === 6;

        let dotsHtml = '';
        let badgesHtml = '';
        dayEvts.slice(0, 3).forEach((ev, idx) => {
          dotsHtml += `<div class="cal-event-dot evt-${ev.type}" title="${ev.title}"></div>`;
          if (idx < 2) badgesHtml += `<span class="cal-event-badge evt-${ev.type}">${ev.title}</span>`;
        });
        if (dayEvts.length > 2) badgesHtml += `<span style="font-size:0.6rem;color:var(--text-muted);font-weight:700;">+${dayEvts.length-2} more</span>`;

        html += `
          <div class="cal-cell${isToday?' today':''}${isSun?' sunday':''}${isSat?' saturday':''}" onclick="openCaleModal(${y},${m},${d})">
            <div class="cal-day-bs">${d}</div>
            <div class="cal-day-ad">${adStr}</div>
            ${dotsHtml ? `<div class="cal-event-dots">${dotsHtml}</div>` : ''}
            ${badgesHtml}
          </div>`;
      }

      // Pad end
      const totalCells = startDow + daysInMonth;
      const remainder = totalCells % 7;
      if (remainder !== 0) for (let i = 0; i < 7 - remainder; i++) html += '<div class="cal-cell empty"></div>';

      grid.innerHTML = html;
      renderCalMonthList();
    }

    function renderCalMonthList() {
      const { y, m } = calState;
      const calEvents = getCalEvents();
      const list = document.getElementById('cal-month-events-list');
      if (!list) return;
      let items = [];
      for (let d = 1; d <= 32; d++) {
        const key = `${y}-${m}-${d}`;
        if (calEvents[key]) calEvents[key].forEach((ev, i) => items.push({ d, ev, i, key }));
      }
      if (items.length === 0) {
        list.innerHTML = '<p style="color:var(--text-muted);font-size:0.82rem;">No events this month.</p>';
        return;
      }
      list.innerHTML = items.map(({ d, ev }) => `
        <div class="event-list-item">
          <div class="event-list-date evt-${ev.type}">${d}</div>
          <div>
            <div class="event-list-title">${ev.title}</div>
            <div class="event-list-sub">${BS_MONTHS[m-1]} ${d}, ${y} · ${ev.type}</div>
          </div>
        </div>`).join('');
    }

    function calNavigate(dir) {
      calState.m += dir;
      if (calState.m > 12) { calState.m = 1; calState.y++; }
      if (calState.m < 1) { calState.m = 12; calState.y--; }
      renderCalendar();
    }
    function calGoToday() {
      const t = getTodayBS();
      calState = { y: t.y, m: t.m };
      renderCalendar();
    }

    // ─── MODAL ───
    let caleModalDate = null;
    function openCaleModal(y, m, d) {
      caleModalDate = { y, m, d };
      const calEvents = getCalEvents();
      const key = `${y}-${m}-${d}`;
      const dayEvts = calEvents[key] || [];
      const overlay = document.getElementById('cal-modal-overlay');
      document.getElementById('cal-modal-date-title').textContent = dayEvts.length > 0 ? `Events on ${BS_MONTHS[m-1]} ${d}` : `Add Event — ${BS_MONTHS[m-1]} ${d}, ${y}`;
      document.getElementById('cal-modal-date-sub').textContent = `${BS_MONTHS_NP[m-1]} ${d}, ${y} B.S.`;
      document.getElementById('cal-evt-title').value = dayEvts.length > 0 ? dayEvts[dayEvts.length-1].title : '';
      document.getElementById('cal-evt-desc').value = dayEvts.length > 0 ? (dayEvts[dayEvts.length-1].desc||'') : '';
      // Reset type buttons
      document.querySelectorAll('.cal-type-btn').forEach(b => b.classList.remove('selected'));
      const firstType = dayEvts.length > 0 ? dayEvts[dayEvts.length-1].type : 'holiday';
      document.querySelector(`.cal-type-btn[data-type="${firstType}"]`).classList.add('selected');
      const delBtn = document.getElementById('cal-modal-delete-btn');
      if (dayEvts.length > 0) { delBtn.style.display='block'; calEditKey = key; } else { delBtn.style.display='none'; calEditKey = null; }
      overlay.classList.add('open');
    }
    function closeCaleModal(e) { if (e.target === document.getElementById('cal-modal-overlay')) closeCaleModalDirect(); }
    function closeCaleModalDirect() { document.getElementById('cal-modal-overlay').classList.remove('open'); }
    function selectCalType(el) {
      document.querySelectorAll('.cal-type-btn').forEach(b => b.classList.remove('selected'));
      el.classList.add('selected');
    }
    function saveCaleEvent() {
      const title = document.getElementById('cal-evt-title').value.trim();
      if (!title) { alert('Please enter an event title.'); return; }
      const type = document.querySelector('.cal-type-btn.selected')?.dataset?.type || 'other';
      const desc = document.getElementById('cal-evt-desc').value.trim();
      const { y, m, d } = caleModalDate;
      const key = `${y}-${m}-${d}`;
      const calEvents = getCalEvents();
      if (!calEvents[key]) calEvents[key] = [];
      calEvents[key].push({ title, type, desc });
      saveCalEvents(calEvents);
      closeCaleModalDirect();
      renderCalendar();
    }
    function deleteCaleEvent() {
      if (!caleModalDate) return;
      const { y, m, d } = caleModalDate;
      const key = `${y}-${m}-${d}`;
      const calEvents = getCalEvents();
      if (calEvents[key] && calEvents[key].length > 0) {
        calEvents[key].pop();
        if (calEvents[key].length === 0) delete calEvents[key];
      }
      saveCalEvents(calEvents);
      closeCaleModalDirect();
      renderCalendar();
    }

    // ─── PUBLISH ───
    async function publishSchoolCalendar() {
      const calEvents = getCalEvents();
      const { y, m } = calState;
      const published = {
        publishedAt: new Date().toISOString(),
        year: y, month: m,
        monthName: BS_MONTHS[m-1],
        monthNameNP: BS_MONTHS_NP[m-1],
        events: calEvents
      };
      localStorage.setItem('school_calendar_published', JSON.stringify(published));
      if (supabaseDb) {
        try {
          await supabaseDb.from('school_config').upsert([{ key: 'calendar_published', val: published }]);
        } catch(err) { console.error("Error saving published calendar status to Supabase:", err); }
      }
      updateCalPublishStatus();
      alert(`✅ Calendar for ${BS_MONTHS[m-1]} ${y} has been published to your website!\n\nAll ${Object.keys(calEvents).length} events are now live on the Events section.`);
    }

    // Initialize Navigation & UI functionality
    document.addEventListener('DOMContentLoaded', () => {
      // initCalendar() is called from the main DOMContentLoaded handler above.
    });

    // Mobile Sidebar Toggle
    function toggleMobileSidebar() {
      const sidebar = document.querySelector('.sidebar');
      sidebar.classList.toggle('mobile-open');
    }

    // Close sidebar if clicking outside on mobile
    document.addEventListener('click', (e) => {
      const sidebar = document.querySelector('.sidebar');
      const mobileBtn = document.querySelector('.mobile-menu-btn');
      if (window.innerWidth <= 768 && sidebar.classList.contains('mobile-open')) {
        if (!sidebar.contains(e.target) && !mobileBtn.contains(e.target)) {
          sidebar.classList.remove('mobile-open');
        }
      }
    });


    function updateCalPublishStatus() {
      const pub = localStorage.getItem('school_calendar_published');
      const el = document.getElementById('cal-live-status');
      if (!el) return;
      if (pub) {
        const d = JSON.parse(pub);
        const dt = new Date(d.publishedAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
        el.className = 'publish-status';
        el.innerHTML = `<span class="live-dot"></span> Live · Published ${dt}`;
      } else {
        el.className = 'publish-status unpublished';
        el.innerHTML = `<span class="live-dot"></span> Not Published`;
      }
    }

    // initCalendar() is called from the main DOMContentLoaded handler above.

    // ========== NOTICES MANAGEMENT ==========
    async function loadNotices() {
      try {
        const result = await getSchoolNotices(false);
        const notices = result.success ? result.data : [];
        const tbody = document.getElementById('notices-list-tbody');
        
        if (!notices || notices.length === 0) {
          tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem; color: #7f8c8d;">No notices added yet.</td></tr>';
          return;
        }

        tbody.innerHTML = notices.map(notice => `
          <tr>
            <td>${notice.date || '-'}</td>
            <td>${notice.icon_emoji || '-'}</td>
            <td><strong>${notice.title}</strong></td>
            <td>
              <span style="padding:0.3rem 0.6rem; border-radius:12px; font-size:0.8rem; background:${notice.is_active ? '#dcfce7' : '#fee2e2'}; color:${notice.is_active ? '#166534' : '#991b1b'};">
                ${notice.is_active ? 'Active' : 'Hidden'}
              </span>
            </td>
            <td>
              <button onclick="editNotice(${notice.id})" style="padding:0.3rem 0.6rem; margin:0.2rem; background:#4f46e5; color:white; border:none; border-radius:6px; cursor:pointer; font-size:0.8rem;">Edit</button>
              <button onclick="deleteNotice(${notice.id})" style="padding:0.3rem 0.6rem; margin:0.2rem; background:#dc2626; color:white; border:none; border-radius:6px; cursor:pointer; font-size:0.8rem;">Delete</button>
            </td>
          </tr>
        `).join('');
      } catch(e) {
        console.error('Error loading notices:', e);
      }
    }

    async function saveNotice(event) {
      event.preventDefault();
      const date = document.getElementById('notice-date').value.trim();
      const icon = document.getElementById('notice-icon').value.trim();
      const title = document.getElementById('notice-title').value.trim();
      const desc = document.getElementById('notice-desc').value.trim();
      const isActive = document.getElementById('notice-active').checked;

      const btn = event.target.querySelector('button[type="submit"]');
      const noticeId = btn.dataset.noticeId;

      try {
        let result;
        if (noticeId) {
          result = await updateSchoolNotice(noticeId, {
            date, icon_emoji: icon, title, desc: desc, is_active: isActive
          });
        } else {
          result = await addSchoolNotice({
            date, icon_emoji: icon, title, desc: desc, is_active: isActive
          });
        }

        if (result.success) {
          alert('Notice saved successfully!');
          clearNoticeForm();
          loadNotices();
        } else {
          alert('Error: ' + result.error);
        }
      } catch(e) {
        alert('Error saving notice: ' + e.message);
      }
    }

    function clearNoticeForm() {
      document.getElementById('notice-date').value = '';
      document.getElementById('notice-icon').value = '';
      document.getElementById('notice-title').value = '';
      document.getElementById('notice-desc').value = '';
      document.getElementById('notice-active').checked = true;

      const btn = document.getElementById('notice-form').querySelector('button[type="submit"]');
      btn.textContent = 'Add Notice';
      delete btn.dataset.noticeId;
    }

    async function editNotice(id) {
      try {
        const result = await getSchoolNoticeById(id);
        if (result.success) {
          const notice = result.data;
          document.getElementById('notice-date').value = notice.date || '';
          document.getElementById('notice-icon').value = notice.icon_emoji || '';
          document.getElementById('notice-title').value = notice.title || '';
          document.getElementById('notice-desc').value = notice.desc || notice.description || '';
          document.getElementById('notice-active').checked = notice.is_active;

          const btn = document.getElementById('notice-form').querySelector('button[type="submit"]');
          btn.textContent = 'Update Notice';
          btn.dataset.noticeId = id;
        }
      } catch(e) {
        alert('Error loading notice: ' + e.message);
      }
    }

    async function deleteNotice(id) {
      if (!confirm('Are you sure you want to delete this notice?')) return;
      try {
        const result = await deleteSchoolNotice(id);
        if (result.success) {
          alert('Notice deleted successfully!');
          loadNotices();
        } else {
          alert('Error: ' + result.error);
        }
      } catch(e) {
        alert('Error deleting notice: ' + e.message);
      }
    }

    // ========== ABOUT US PAGE MANAGEMENT ==========
    function switchAboutTab(event, tabName) {
      event.preventDefault();
      
      // Reset active edit states to avoid state pollution
      if (window.aboutAdminState) {
        window.aboutAdminState.currentEditId = null;
      }
      
      // Hide all tabs
      document.querySelectorAll('.about-tab-content').forEach(tab => {
        tab.style.display = 'none';
      });
      
      // Remove active state from all buttons
      document.querySelectorAll('.tab-btn-about').forEach(btn => {
        btn.style.borderBottomColor = 'transparent';
        btn.style.color = '#64748b';
      });
      
      // Show selected tab
      const selectedTab = document.getElementById('about-' + tabName);
      if (selectedTab) {
        selectedTab.style.display = 'block';
      }
      
      // Mark button as active
      event.target.style.borderBottomColor = 'var(--primary)';
      event.target.style.color = 'var(--primary)';
    }

    // Statistics CRUD is managed by admin-about-handler.js



    function createAboutEraCard() {
      const name = document.getElementById('eraName').value.trim();
      const duration = document.getElementById('eraDuration').value.trim();
      const color = document.getElementById('eraColor').value;
      const description = document.getElementById('eraDescription').value.trim();

      if (!name || !duration) {
        showAboutAlert('Please fill in all required fields', 'error');
        return;
      }

      let eras = JSON.parse(localStorage.getItem('about_era_cards') || '[]');
      eras.push({ id: Date.now(), name, duration, color, description });
      localStorage.setItem('about_era_cards', JSON.stringify(eras));

      showAboutAlert('Era card added!', 'success');
      document.getElementById('eraName').value = '';
      document.getElementById('eraDuration').value = '';
      document.getElementById('eraDescription').value = '';
      loadAboutEraCards();
    }

    function loadAboutEraCards() {
      const eras = JSON.parse(localStorage.getItem('about_era_cards') || '[]');
      const tbody = document.getElementById('about-eraTable');
      
      if (eras.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 2rem;">No era cards added yet</td></tr>';
        return;
      }

      tbody.innerHTML = eras.map(era => `
        <tr>
          <td><strong>${era.name}</strong></td>
          <td>${era.duration}</td>
          <td>
            <button class="submit-btn" onclick="deleteAboutEraCard(${era.id})" style="background: var(--danger); padding: 0.5rem 1rem; font-size: 0.85rem;">Delete</button>
          </td>
        </tr>
      `).join('');
    }

    function deleteAboutEraCard(id) {
      if (!confirm('Delete this era card?')) return;
      let eras = JSON.parse(localStorage.getItem('about_era_cards') || '[]');
      eras = eras.filter(e => e.id !== id);
      localStorage.setItem('about_era_cards', JSON.stringify(eras));
      showAboutAlert('Deleted!', 'success');
      loadAboutEraCards();
    }

    function createAboutTimelineEvent() {
      const year = document.getElementById('timelineYear').value.trim();
      const milestone = document.getElementById('timelineMilestone').value.trim();
      const description = document.getElementById('timelineDescription').value.trim();

      if (!year || !milestone) {
        showAboutAlert('Please fill in all required fields', 'error');
        return;
      }

      let events = JSON.parse(localStorage.getItem('about_timeline') || '[]');
      events.push({ id: Date.now(), year, milestone, description });
      localStorage.setItem('about_timeline', JSON.stringify(events));

      showAboutAlert('Event added!', 'success');
      document.getElementById('timelineYear').value = '';
      document.getElementById('timelineMilestone').value = '';
      document.getElementById('timelineDescription').value = '';
      loadAboutTimeline();
    }

    function loadAboutTimeline() {
      const events = JSON.parse(localStorage.getItem('about_timeline') || '[]');
      const tbody = document.getElementById('about-timelineTable');
      
      if (events.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 2rem;">No events added yet</td></tr>';
        return;
      }

      tbody.innerHTML = events.map(evt => `
        <tr>
          <td><strong>${evt.year}</strong></td>
          <td>${evt.milestone}</td>
          <td>
            <button class="submit-btn" onclick="deleteAboutTimelineEvent(${evt.id})" style="background: var(--danger); padding: 0.5rem 1rem; font-size: 0.85rem;">Delete</button>
          </td>
        </tr>
      `).join('');
    }

    function deleteAboutTimelineEvent(id) {
      if (!confirm('Delete this event?')) return;
      let events = JSON.parse(localStorage.getItem('about_timeline') || '[]');
      events = events.filter(e => e.id !== id);
      localStorage.setItem('about_timeline', JSON.stringify(events));
      showAboutAlert('Deleted!', 'success');
      loadAboutTimeline();
    }

    function createAboutTeamMember() {
      const name = document.getElementById('teamMemberName').value.trim();
      const position = document.getElementById('teamMemberPosition').value.trim();
      const bio = document.getElementById('teamMemberBio').value.trim();

      if (!name || !position) {
        showAboutAlert('Please fill in all required fields', 'error');
        return;
      }

      let members = JSON.parse(localStorage.getItem('about_team') || '[]');
      members.push({ id: Date.now(), name, position, bio });
      localStorage.setItem('about_team', JSON.stringify(members));

      showAboutAlert('Team member added!', 'success');
      document.getElementById('teamMemberName').value = '';
      document.getElementById('teamMemberPosition').value = '';
      document.getElementById('teamMemberBio').value = '';
      loadAboutTeam();
    }

    function loadAboutTeam() {
      const members = JSON.parse(localStorage.getItem('about_team') || '[]');
      const tbody = document.getElementById('about-teamTable');
      
      if (members.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 2rem;">No team members added yet</td></tr>';
        return;
      }

      tbody.innerHTML = members.map(member => `
        <tr>
          <td><strong>${member.name}</strong></td>
          <td>${member.position}</td>
          <td>
            <button class="submit-btn" onclick="deleteAboutTeamMember(${member.id})" style="background: var(--danger); padding: 0.5rem 1rem; font-size: 0.85rem;">Delete</button>
          </td>
        </tr>
      `).join('');
    }

    function deleteAboutTeamMember(id) {
      if (!confirm('Delete this member?')) return;
      let members = JSON.parse(localStorage.getItem('about_team') || '[]');
      members = members.filter(m => m.id !== id);
      localStorage.setItem('about_team', JSON.stringify(members));
      showAboutAlert('Deleted!', 'success');
      loadAboutTeam();
    }

    function showAboutAlert(message, type) {
      // Try existing alert elements first
      const alertId = type === 'success' ? 'about-successAlert' : 'about-errorAlert';
      const alertElement = document.getElementById(alertId);
      
      if (alertElement) {
        alertElement.textContent = (type === 'success' ? '✓ ' : '✗ ') + message;
        alertElement.style.display = 'block';
        setTimeout(() => { alertElement.style.display = 'none'; }, 3000);
        return;
      }

      // Fallback: create a dynamic toast notification
      const toast = document.createElement('div');
      toast.textContent = (type === 'success' ? '✓ ' : '✗ ') + message;
      toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 99999;
        padding: 1rem 1.5rem; border-radius: 8px; color: #fff; font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: opacity 0.3s;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
      `;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }

    // Load data when About page is opened
    function initAboutPage() {
      if (typeof initializeAboutAdmin === 'function') {
        initializeAboutAdmin();
      } else {
        console.warn('initializeAboutAdmin is not defined yet');
      }
    }

    // ========== SCHOOL DOCUMENTS MANAGEMENT ==========
    async function loadAdminDocuments() {
      try {
        const result = await documentHandler.getAllDocuments();
        const docs = result.success ? result.data : [];
        const tbody = document.getElementById('admin-documents-list-tbody');
        
        if (!docs || docs.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem; color: #7f8c8d;">No documents uploaded yet.</td></tr>';
          return;
        }

        tbody.innerHTML = docs.map(doc => `
          <tr>
            <td><strong>${doc.title}</strong><br><small style="color: #718096;">${doc.description || ''}</small></td>
            <td><span class="status-badge" style="background:#e0e7ff; color:var(--accent); font-weight: 600; padding:0.2rem 0.5rem; border-radius:4px; font-size:0.8rem;">${doc.category}</span></td>
            <td><span style="font-weight: 500;">${doc.uploaded_by || 'Admin'}</span></td>
            <td>${doc.display_order ?? 0}</td>
            <td>
              <span style="padding:0.3rem 0.6rem; border-radius:12px; font-size:0.8rem; background:${doc.is_active ? '#dcfce7' : '#fee2e2'}; color:${doc.is_active ? '#166534' : '#991b1b'};">
                ${doc.is_active ? 'Active' : 'Hidden'}
              </span>
            </td>
            <td>
              <a href="${doc.file_url}" target="_blank" style="padding:0.3rem 0.6rem; margin:0.2rem; background:#10b981; color:white; border:none; border-radius:6px; cursor:pointer; font-size:0.8rem; text-decoration:none; display:inline-block;">View ↗</a>
              <button onclick="editAdminDocument(${doc.id})" style="padding:0.3rem 0.6rem; margin:0.2rem; background:#4f46e5; color:white; border:none; border-radius:6px; cursor:pointer; font-size:0.8rem;">Edit</button>
              <button onclick="deleteAdminDocument(${doc.id})" style="padding:0.3rem 0.6rem; margin:0.2rem; background:#dc2626; color:white; border:none; border-radius:6px; cursor:pointer; font-size:0.8rem;">Delete</button>
            </td>
          </tr>
        `).join('');
      } catch(e) {
        console.error('Error loading documents:', e);
      }
    }

    async function saveAdminDocument(event) {
      event.preventDefault();
      const title = document.getElementById('admin-doc-title').value.trim();
      const desc = document.getElementById('admin-doc-desc').value.trim();
      const category = document.getElementById('admin-doc-category').value;
      const fileInput = document.getElementById('admin-doc-file');
      const icon = document.getElementById('admin-doc-icon').value;
      const order = parseInt(document.getElementById('admin-doc-order').value || '0', 10);
      const isActive = document.getElementById('admin-doc-active').checked;
      const docId = document.getElementById('admin-doc-id').value;

      if (!title || !desc || !category || !fileInput.files.length) {
        alert('Please fill in all required fields and select a file');
        return;
      }

      try {
        const btn = event.target.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Uploading...';

        // Upload file
        const uploadResult = await documentHandler.uploadFile(fileInput.files[0], 'documents');
        if (!uploadResult.success) {
          alert('File upload failed: ' + uploadResult.error);
          btn.disabled = false;
          btn.textContent = originalText;
          return;
        }

        // Prepare document data
        const docData = {
          title,
          description: desc,
          category,
          file_name: uploadResult.fileName,
          file_url: uploadResult.fileUrl,
          file_size: uploadResult.fileSize,
          file_type: uploadResult.fileType,
          icon_type: icon,
          display_order: order,
          is_active: isActive,
          uploaded_by: 'Admin'
        };

        // Save to database
        let result;
        if (docId) {
          result = await documentHandler.updateDocument(docId, docData);
        } else {
          result = await documentHandler.addDocument(docData);
        }

        btn.disabled = false;
        btn.textContent = originalText;

        if (result.success) {
          alert('Document uploaded and saved successfully!');
          clearAdminDocumentForm();
          loadAdminDocuments();
        } else {
          alert('Error saving document: ' + result.error);
        }
      } catch(e) {
        alert('Error: ' + e.message);
        event.target.querySelector('button[type="submit"]').disabled = false;
      }
    }

    function clearAdminDocumentForm() {
      document.getElementById('admin-doc-id').value = '';
      document.getElementById('admin-doc-title').value = '';
      document.getElementById('admin-doc-desc').value = '';
      document.getElementById('admin-doc-category').value = 'Syllabus';
      document.getElementById('admin-doc-file').value = '';
      document.getElementById('admin-doc-icon').value = 'document';
      document.getElementById('admin-doc-order').value = '0';
      document.getElementById('admin-doc-active').checked = true;

      document.getElementById('document-form-title').textContent = 'Add New Document';
      document.getElementById('admin-doc-submit-btn').textContent = 'Add Document';
    }

    async function editAdminDocument(id) {
      try {
        const result = await documentHandler.getDocumentById(id);
        if (result.success) {
          const doc = result.data;
          document.getElementById('admin-doc-id').value = doc.id;
          document.getElementById('admin-doc-title').value = doc.title || '';
          document.getElementById('admin-doc-desc').value = doc.description || '';
          document.getElementById('admin-doc-category').value = doc.category || 'Syllabus';
          document.getElementById('admin-doc-file').value = ''; // Reset file input for security
          document.getElementById('admin-doc-icon').value = doc.icon_type || 'document';
          document.getElementById('admin-doc-order').value = doc.display_order ?? 0;
          document.getElementById('admin-doc-active').checked = doc.is_active;

          document.getElementById('document-form-title').textContent = 'Edit Document';
          document.getElementById('admin-doc-submit-btn').textContent = 'Update Document';

          // Scroll to form
          document.querySelector('.panel').scrollIntoView({ behavior: 'smooth' });
        } else {
          alert('Error: ' + result.error);
        }
      } catch(e) {
        alert('Error loading document: ' + e.message);
      }
    }

    async function deleteAdminDocument(id) {
      if (!confirm('Are you sure you want to delete this document?')) return;
      try {
        const result = await documentHandler.deleteDocument(id);
        if (result.success) {
          alert('Document deleted successfully!');
          loadAdminDocuments();
        } else {
          alert('Error: ' + result.error);
        }
      } catch(e) {
        alert('Error deleting document: ' + e.message);
      }
    }

    // ========== ACHIEVEMENTS MANAGEMENT ==========
    async function loadAchievements() {
      try {
        const result = await getSchoolAchievements(false);
        const achievements = result.success ? result.data : [];
        const tbody = document.getElementById('achievements-list-tbody');
        
        if (!achievements || achievements.length === 0) {
          tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem; color: #7f8c8d;">No achievements added yet.</td></tr>';
          return;
        }

        tbody.innerHTML = achievements.map(ach => `
          <tr>
            <td>${ach.icon_emoji || '⭐'}</td>
            <td>${ach.title}</td>
            <td>${ach.category || '-'}</td>
            <td>${ach.year || '-'}</td>
            <td>
              <button onclick="editAchievement(${ach.id})" style="padding:0.3rem 0.6rem; margin:0.2rem; background:#4f46e5; color:white; border:none; border-radius:6px; cursor:pointer; font-size:0.8rem;">Edit</button>
              <button onclick="deleteAchievement(${ach.id})" style="padding:0.3rem 0.6rem; margin:0.2rem; background:#dc2626; color:white; border:none; border-radius:6px; cursor:pointer; font-size:0.8rem;">Delete</button>
            </td>
          </tr>
        `).join('');
      } catch(e) {
        console.error('Error loading achievements:', e);
      }
    }

    async function saveAchievement(event) {
      event.preventDefault();
      const icon = document.getElementById('ach-icon').value.trim();
      const title = document.getElementById('ach-title').value.trim();
      const desc = document.getElementById('ach-desc').value.trim();
      const category = document.getElementById('ach-category').value.trim();
      const year = document.getElementById('ach-year').value.trim();
      const order = parseInt(document.getElementById('ach-order').value) || 0;
      const active = document.getElementById('ach-active').checked;

      try {
        const result = await addSchoolAchievement({
          title,
          description: desc,
          icon_emoji: icon,
          category: category || null,
          year: year || null,
          display_order: order,
          is_active: active
        });

        if (result.success) {
          alert('Achievement added successfully!');
          clearAchievementForm();
          loadAchievements();
        } else {
          alert('Error: ' + result.error);
        }
      } catch(e) {
        alert('Error saving achievement: ' + e.message);
      }
    }

    function clearAchievementForm() {
      document.getElementById('ach-icon').value = '';
      document.getElementById('ach-title').value = '';
      document.getElementById('ach-desc').value = '';
      document.getElementById('ach-category').value = '';
      document.getElementById('ach-year').value = '';
      document.getElementById('ach-order').value = '0';
      document.getElementById('ach-active').checked = true;
    }

    async function editAchievement(id) {
      try {
        const result = await getSchoolAchievementById(id);
        if (result.success) {
          const ach = result.data;
          document.getElementById('ach-icon').value = ach.icon_emoji || '';
          document.getElementById('ach-title').value = ach.title;
          document.getElementById('ach-desc').value = ach.description;
          document.getElementById('ach-category').value = ach.category || '';
          document.getElementById('ach-year').value = ach.year || '';
          document.getElementById('ach-order').value = ach.display_order || 0;
          document.getElementById('ach-active').checked = ach.is_active;
          
          // Change button text to "Update"
          const btn = event.target.closest('.panel').querySelector('button[type="submit"]');
          btn.textContent = 'Update Achievement';
          btn.dataset.achId = id;
        }
      } catch(e) {
        alert('Error loading achievement: ' + e.message);
      }
    }

    async function deleteAchievement(id) {
      if (!confirm('Are you sure you want to delete this achievement?')) return;
      try {
        const result = await deleteSchoolAchievement(id);
        if (result.success) {
          alert('Achievement deleted successfully!');
          loadAchievements();
        } else {
          alert('Error: ' + result.error);
        }
      } catch(e) {
        alert('Error deleting achievement: ' + e.message);
      }
    }

    // ========== ALUMNI MANAGEMENT ==========
    async function loadAlumni() {
      try {
        const result = await getAlumniProfiles(false);
        const alumni = result.success ? result.data : [];
        const tbody = document.getElementById('alumni-list-tbody');
        
        if (!alumni || alumni.length === 0) {
          tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem; color: #7f8c8d;">No alumni added yet.</td></tr>';
          return;
        }

        tbody.innerHTML = alumni.map(alm => `
          <tr>
            <td>${alm.alumni_name}</td>
            <td>${alm.position}</td>
            <td>${alm.company}</td>
            <td>
              <button onclick="editAlumni(${alm.id})" style="padding:0.3rem 0.6rem; margin:0.2rem; background:#4f46e5; color:white; border:none; border-radius:6px; cursor:pointer; font-size:0.8rem;">Edit</button>
              <button onclick="deleteAlumni(${alm.id})" style="padding:0.3rem 0.6rem; margin:0.2rem; background:#dc2626; color:white; border:none; border-radius:6px; cursor:pointer; font-size:0.8rem;">Delete</button>
            </td>
          </tr>
        `).join('');
      } catch(e) {
        console.error('Error loading alumni:', e);
      }
    }

    async function saveAlumniProfile(event) {
      event.preventDefault();
      const name = document.getElementById('alm-name').value.trim();
      const position = document.getElementById('alm-position').value.trim();
      const company = document.getElementById('alm-company').value.trim();
      const photo = document.getElementById('alm-photo').value.trim();
      const testimonial = document.getElementById('alm-testimonial').value.trim();
      const order = parseInt(document.getElementById('alm-order').value) || 0;
      const active = document.getElementById('alm-active').checked;

      try {
        const result = await addAlumniProfile({
          alumni_name: name,
          position,
          company,
          alumni_photo_url: photo || null,
          testimonial,
          display_order: order,
          is_active: active
        });

        if (result.success) {
          alert('Alumni profile added successfully!');
          clearAlumniForm();
          loadAlumni();
        } else {
          alert('Error: ' + result.error);
        }
      } catch(e) {
        alert('Error saving alumni profile: ' + e.message);
      }
    }

    function clearAlumniForm() {
      document.getElementById('alm-name').value = '';
      document.getElementById('alm-position').value = '';
      document.getElementById('alm-company').value = '';
      document.getElementById('alm-photo').value = '';
      document.getElementById('alm-testimonial').value = '';
      document.getElementById('alm-order').value = '0';
      document.getElementById('alm-active').checked = true;
    }

    async function editAlumni(id) {
      try {
        const result = await getAlumniProfileById(id);
        if (result.success) {
          const alm = result.data;
          document.getElementById('alm-name').value = alm.alumni_name;
          document.getElementById('alm-position').value = alm.position;
          document.getElementById('alm-company').value = alm.company;
          document.getElementById('alm-photo').value = alm.alumni_photo_url || '';
          document.getElementById('alm-testimonial').value = alm.testimonial;
          document.getElementById('alm-order').value = alm.display_order || 0;
          document.getElementById('alm-active').checked = alm.is_active;
          
          // Change button text to "Update"
          const btn = event.target.closest('.panel').querySelector('button[type="submit"]');
          btn.textContent = 'Update Alumni';
          btn.dataset.almId = id;
        }
      } catch(e) {
        alert('Error loading alumni profile: ' + e.message);
      }
    }

    async function deleteAlumni(id) {
      if (!confirm('Are you sure you want to delete this alumni profile?')) return;
      try {
        const result = await deleteAlumniProfile(id);
        if (result.success) {
          alert('Alumni profile deleted successfully!');
          loadAlumni();
        } else {
          alert('Error: ' + result.error);
        }
      } catch(e) {
        alert('Error deleting alumni profile: ' + e.message);
      }
    }

    // ==================== GALLERY MANAGEMENT FUNCTIONS ====================
    async function loadGalleryImages() {
      const tbody = document.getElementById('gallery-list-tbody');
      if (!tbody) return;

      try {
        const result = await getGalleryImages(false); // Get all images
        if (!result.success || !result.data || result.data.length === 0) {
          tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem; color: #7f8c8d;">No gallery images found. Upload one to get started.</td></tr>';
          return;
        }

        tbody.innerHTML = result.data.map(img => `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 0.75rem;">
              <img src="${img.image_url}" alt="${img.album_name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px;">
            </td>
            <td style="padding: 0.75rem;">${img.album_name}</td>
            <td style="padding: 0.75rem;">${img.gallery_category || 'General'}</td>
            <td style="padding: 0.75rem; text-align: center;">
              <button onclick="handleDeleteGalleryImage(${img.id})" style="padding: 0.4rem 0.8rem; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem;" onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">Delete</button>
            </td>
          </tr>
        `).join('');
      } catch(e) {
        console.error('Error loading gallery images:', e);
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem; color: #ef4444;">Error loading gallery images.</td></tr>';
      }
    }

    async function saveGalleryImage(event) {
      event.preventDefault();
      const fileInput = document.getElementById('gallery-file');
      const albumName = document.getElementById('gallery-album').value.trim();
      const caption = document.getElementById('gallery-caption').value.trim();
      const category = document.getElementById('gallery-category').value;
      const order = parseInt(document.getElementById('gallery-order').value) || 0;
      const isActive = document.getElementById('gallery-active').checked;

      if (!fileInput.files.length) {
        alert('Please select an image file.');
        return;
      }

      if (!albumName) {
        alert('Please enter an album name.');
        return;
      }

      try {
        // Upload image to storage
        const uploadResult = await uploadGalleryImage(fileInput.files[0], category);
        if (!uploadResult.success) {
          alert('Error uploading image: ' + uploadResult.error);
          return;
        }

        // Save gallery record to database
        const galleryData = {
          album_name: albumName,
          image_url: uploadResult.url,
          image_caption: caption,
          storage_path: uploadResult.path,
          uploaded_by: 'admin',
          display_order: order,
          gallery_category: category,
          is_active: isActive
        };

        const result = await addGalleryImage(galleryData);
        if (result.success) {
          alert('Image uploaded and gallery record created successfully!');
          clearGalleryForm();
          loadGalleryImages();
        } else {
          alert('Error saving gallery record: ' + result.error);
        }
      } catch(e) {
        alert('Error uploading image: ' + e.message);
        console.error('Gallery upload error:', e);
      }
    }

    async function handleDeleteGalleryImage(id) {
      if (!confirm('Are you sure you want to delete this gallery image?')) return;

      try {
        // Get image details first to find storage path
        const result = await getGalleryImages(false);
        const image = result.data?.find(img => img.id === id);

        if (image && image.storage_path) {
          // Delete from storage
          await deleteGalleryImageFromStorage(image.storage_path);
        }

        // Delete from database (calls the global function)
        const deleteResult = await deleteGalleryImage(id);
        if (deleteResult.success) {
          alert('Gallery image deleted successfully!');
          loadGalleryImages();
        } else {
          alert('Error: ' + deleteResult.error);
        }
      } catch(e) {
        alert('Error deleting gallery image: ' + e.message);
        console.error('Gallery delete error:', e);
      }
    }

    function clearGalleryForm() {
      document.getElementById('gallery-form').reset();
      document.getElementById('gallery-file').value = '';
      document.getElementById('gallery-album').value = '';
      document.getElementById('gallery-caption').value = '';
      document.getElementById('gallery-category').value = 'General';
      document.getElementById('gallery-order').value = '0';
      document.getElementById('gallery-active').checked = true;
    }

    // ==================== STUDENT CREDENTIAL MANAGEMENT FUNCTIONS ====================
    async function loadStudentAccounts() {
      const tbody = document.getElementById('admin-students-tbody');
      if (!tbody) return;

      try {
        const result = await getStudentCredentials(false); // Get all accounts
        if (!result.success || !result.data || result.data.length === 0) {
          tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem; color: #7f8c8d;">No student accounts created yet. Create one using the form.</td></tr>';
          return;
        }

        tbody.innerHTML = result.data.map(student => `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 0.75rem;">${student.student_roll}</td>
            <td style="padding: 0.75rem;">${student.student_name}</td>
            <td style="padding: 0.75rem;"><code style="background:#f3f4f6; padding:0.25rem 0.5rem; border-radius:3px;">${student.student_username}</code></td>
            <td style="padding: 0.75rem;"><code style="background:#f3f4f6; padding:0.25rem 0.5rem; border-radius:3px;">${student.student_password}</code></td>
            <td style="padding: 0.75rem;">${student.student_email || '-'}</td>
            <td style="padding: 0.75rem;">${student.student_class}</td>
            <td style="padding: 0.75rem;">
              <span style="background:${student.is_active ? '#d1fae5' : '#fee2e2'}; color:${student.is_active ? '#065f46' : '#7f1d1d'}; padding:0.25rem 0.75rem; border-radius:20px; font-size:0.8rem; font-weight:600;">
                ${student.is_active ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td style="padding: 0.75rem;">
              <button onclick="editStudentAccount(${student.id}, '${student.student_name.replace(/'/g, "\\'")}', '${student.student_roll}', '${student.student_username}', '${student.student_email || ''}', '${student.student_class}')" style="padding: 0.35rem 0.6rem; background: #f59e0b; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem; margin-right:0.25rem;" onmouseover="this.style.background='#d97706'" onmouseout="this.style.background='#f59e0b'">
                ✏️ Edit
              </button>
              <button onclick="toggleStudentStatus(${student.id}, ${!student.is_active})" style="padding: 0.35rem 0.6rem; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem; margin-right:0.25rem;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
                ${student.is_active ? 'Disable' : 'Enable'}
              </button>
              <button onclick="deleteStudentAccount(${student.id})" style="padding: 0.35rem 0.6rem; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;" onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">
                Delete
              </button>
            </td>
          </tr>
        `).join('');
      } catch(e) {
        console.error('Error loading student accounts:', e);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem; color: #ef4444;">Error loading student accounts.</td></tr>';
      }
    }

    function filterAdminStudents() {
      const searchTerm = document.getElementById('admin-student-search-name')?.value.toLowerCase().trim() || '';
      const selectedClass = document.getElementById('admin-student-search-class')?.value.toLowerCase().trim() || '';
      const tbody = document.getElementById('admin-students-tbody');
      if (!tbody) return;

      const rows = Array.from(tbody.querySelectorAll('tr'));
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const matchesName = !searchTerm || text.includes(searchTerm);
        const matchesClass = !selectedClass || text.includes(selectedClass);
        row.style.display = (matchesName && matchesClass) ? '' : 'none';
      });
    }

    // ==================== FEE MANAGEMENT FUNCTIONS ====================
    
    // Cloud Sync Helper for student fees
    async function syncStudentFeesToDb(fees) {
      if (typeof supabaseDb !== 'undefined' && supabaseDb) {
        try {
          await supabaseDb.from('school_config').delete().eq('key', 'student_fees_json');
          const { error } = await supabaseDb.from('school_config').insert([{ key: 'student_fees_json', val: JSON.stringify(fees) }]);
          if (error) throw error;
          console.log("✅ Synced student fees to database successfully.");
        } catch (e) {
          console.error("❌ Error syncing student fees to database:", e);
        }
      }
    }

    async function loadFeeCategories() {
      const tbody = document.getElementById('fee-categories-tbody');
      if (!tbody) return;

      try {
        const categories = JSON.parse(localStorage.getItem('fee_categories') || '[]');
        if (categories.length === 0) {
          tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:2rem; color:#94a3b8;">No fee categories created yet</td></tr>';
          return;
        }

        tbody.innerHTML = categories.map(cat => `
          <tr>
            <td><strong>${cat.name}</strong></td>
            <td>${cat.frequency}</td>
            <td>${cat.applicableTo}</td>
            <td>
              <button onclick="editFeeCategory(${cat.id})" style="padding:0.35rem 0.6rem; background:#f59e0b; color:white; border:none; border-radius:4px; cursor:pointer; font-size:0.8rem; margin-right:0.25rem;">Edit</button>
              <button onclick="deleteFeeCategory(${cat.id})" style="padding:0.35rem 0.6rem; background:#ef4444; color:white; border:none; border-radius:4px; cursor:pointer; font-size:0.8rem;">Delete</button>
            </td>
          </tr>
        `).join('');
      } catch(e) {
        console.error('Error loading fee categories:', e);
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:2rem; color:#ef4444;">Error loading categories</td></tr>';
      }
    }

    function addFeeCategory(e) {
      e.preventDefault();
      const name = document.getElementById('cat-name').value.trim();
      const desc = document.getElementById('cat-desc').value.trim();
      const frequency = document.getElementById('cat-frequency').value;
      const applicable = document.getElementById('cat-applicable-class').value.trim();

      if (!name) {
        alert('Category name is required');
        return;
      }

      const categories = JSON.parse(localStorage.getItem('fee_categories') || '[]');
      
      if (window.editingCategoryId) {
        const cat = categories.find(c => c.id === window.editingCategoryId);
        if (cat) {
          cat.name = name;
          cat.description = desc;
          cat.frequency = frequency;
          cat.applicableTo = applicable;
          alert('✅ Category updated successfully!');
        }
        delete window.editingCategoryId;
        const submitBtn = document.querySelector('#page-fee-categories form button[type="submit"]');
        if (submitBtn) submitBtn.textContent = '➕ Add Category';
      } else {
        const newCategory = {
          id: Date.now(),
          name,
          description: desc,
          frequency,
          applicableTo: applicable
        };
        categories.push(newCategory);
        alert('✅ Category added successfully!');
      }

      localStorage.setItem('fee_categories', JSON.stringify(categories));
      
      document.getElementById('cat-name').value = '';
      document.getElementById('cat-desc').value = '';
      document.getElementById('cat-applicable-class').value = '';
      loadFeeCategories();
    }

    function editFeeCategory(catId) {
      const categories = JSON.parse(localStorage.getItem('fee_categories') || '[]');
      const cat = categories.find(c => c.id === catId);
      if (cat) {
        document.getElementById('cat-name').value = cat.name;
        document.getElementById('cat-desc').value = cat.description || '';
        document.getElementById('cat-frequency').value = cat.frequency;
        document.getElementById('cat-applicable-class').value = cat.applicableTo || '';
        
        window.editingCategoryId = catId;
        const submitBtn = document.querySelector('#page-fee-categories form button[type="submit"]');
        if (submitBtn) submitBtn.textContent = '💾 Update Category';
        
        document.querySelector('#page-fee-categories form').scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    function deleteFeeCategory(catId) {
      if (confirm('Delete this category? Associated fees may be affected.')) {
        const categories = JSON.parse(localStorage.getItem('fee_categories') || '[]').filter(c => c.id !== catId);
        localStorage.setItem('fee_categories', JSON.stringify(categories));
        loadFeeCategories();
      }
    }

    async function loadStudentFeesDropdown() {
      const select = document.getElementById('fee-student');
      if (!select) return;

      try {
        const result = await getStudentCredentials(false);
        if (result.success && result.data) {
          select.innerHTML = '<option value="">-- Choose Student --</option>' + 
            result.data.map(s => `<option value="${s.student_roll}|${s.student_name}|${s.student_class}|${s.id}">${s.student_roll} - ${s.student_name} (${s.student_class})</option>`).join('');
        }
      } catch(e) {
        console.error('Error loading students:', e);
      }
    }

    async function loadFeeCategoriesDropdown() {
      const select = document.getElementById('fee-category');
      if (!select) return;

      const categories = JSON.parse(localStorage.getItem('fee_categories') || '[]');
      select.innerHTML = '<option value="">-- Select Category --</option>' + 
        categories.map(c => `<option value="${c.id}|${c.name}">${c.name}</option>`).join('');
    }

    function assignStudentFee(e) {
      e.preventDefault();
      
      const studentData = document.getElementById('fee-student').value;
      const categoryData = document.getElementById('fee-category').value;
      const amount = parseFloat(document.getElementById('fee-amount').value);
      const dueDate = document.getElementById('fee-due-date').value;
      const description = document.getElementById('fee-description').value.trim();
      const installment = parseInt(document.getElementById('fee-installment').value) || 1;

      if (!studentData || !categoryData || !amount || !dueDate) {
        alert('Please fill all required fields');
        return;
      }

      const [roll, name, studentClass, studentId] = studentData.split('|');
      const [categoryId, categoryName] = categoryData.split('|');

      const fees = JSON.parse(localStorage.getItem('student_fees') || '[]');
      
      if (window.editingStudentFeeId) {
        const fee = fees.find(f => f.id === window.editingStudentFeeId);
        if (fee) {
          fee.studentRoll = roll;
          fee.studentName = name;
          fee.studentClass = studentClass;
          fee.categoryId = categoryId;
          fee.categoryName = categoryName;
          fee.amount = amount;
          fee.dueDate = dueDate;
          fee.description = description;
          fee.installment = installment;
          alert(`✅ Fee updated successfully!`);
        }
        delete window.editingStudentFeeId;
        const submitBtn = document.querySelector('#page-manage-fees form button[type="submit"]');
        if (submitBtn) submitBtn.textContent = '💰 Assign Fee';
      } else {
        const newFee = {
          id: Date.now(),
          studentRoll: roll,
          studentName: name,
          studentClass: studentClass,
          categoryId,
          categoryName,
          amount,
          dueDate,
          description,
          installment,
          status: 'pending',
          paidAmount: 0,
          paidDate: null,
          createdDate: new Date().toLocaleDateString()
        };
        fees.push(newFee);
        alert(`✅ Fee of Rs.${amount} assigned to ${name}!`);
      }

      localStorage.setItem('student_fees', JSON.stringify(fees));
      syncStudentFeesToDb(fees);

      document.querySelector('#page-manage-fees form').reset();
      loadAssignedStudentFees();
    }

    function editStudentFee(feeId) {
      const fees = JSON.parse(localStorage.getItem('student_fees') || '[]');
      const fee = fees.find(f => f.id === feeId);
      if (fee) {
        const studentSelect = document.getElementById('fee-student');
        if (studentSelect) {
          const option = Array.from(studentSelect.options).find(opt => opt.value.startsWith((fee.studentRoll || fee.student_roll) + '|'));
          if (option) {
            studentSelect.value = option.value;
          }
        }
        
        const categorySelect = document.getElementById('fee-category');
        if (categorySelect) {
          const option = Array.from(categorySelect.options).find(opt => opt.value.startsWith((fee.categoryId || '') + '|') || opt.value.endsWith('|' + (fee.categoryName || fee.category_name)));
          if (option) {
            categorySelect.value = option.value;
          }
        }
        
        document.getElementById('fee-amount').value = fee.amount;
        document.getElementById('fee-due-date').value = fee.dueDate || fee.due_date;
        document.getElementById('fee-description').value = fee.description || '';
        document.getElementById('fee-installment').value = fee.installment || fee.installment_number || 1;
        
        window.editingStudentFeeId = feeId;
        const submitBtn = document.querySelector('#page-manage-fees form button[type="submit"]');
        if (submitBtn) submitBtn.textContent = '💾 Update Fee';
        
        document.querySelector('#page-manage-fees form').scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    function loadAssignedStudentFees() {
      const tbody = document.getElementById('student-fees-tbody');
      if (!tbody) return;

      const fees = JSON.parse(localStorage.getItem('student_fees') || '[]');
      
      if (fees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:2rem; color:#94a3b8;">No fees assigned yet</td></tr>';
        return;
      }

      tbody.innerHTML = fees.map(fee => {
        const statusColor = fee.status === 'cleared' ? '#d1fae5' : fee.status === 'partial' ? '#fef3c7' : '#fee2e2';
        const statusText = fee.status === 'cleared' ? 'Cleared' : fee.status === 'partial' ? 'Partial' : 'Pending';
        const statusTextColor = fee.status === 'cleared' ? '#065f46' : fee.status === 'partial' ? '#92400e' : '#7f1d1d';
        const roll = fee.studentRoll || fee.student_roll;
        const name = fee.studentName || fee.student_name;
        const categoryName = fee.categoryName || fee.category_name;
        const dueDate = fee.dueDate || fee.due_date;
        
        return `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 0.75rem;">${roll}</td>
            <td style="padding: 0.75rem;"><strong>${name}</strong></td>
            <td style="padding: 0.75rem;">${categoryName || 'N/A'}</td>
            <td style="padding: 0.75rem;"><strong>Rs. ${fee.amount}</strong></td>
            <td style="padding: 0.75rem;">${dueDate}</td>
            <td style="padding: 0.75rem;">
              <span style="background:${statusColor}; color:${statusTextColor}; padding:0.25rem 0.75rem; border-radius:20px; font-size:0.75rem; font-weight:600;">
                ${statusText}
              </span>
            </td>
            <td style="padding: 0.75rem;">
              <button onclick="editStudentFee(${fee.id})" style="padding:0.35rem 0.6rem; background:#3b82f6; color:white; border:none; border-radius:4px; cursor:pointer; font-size:0.75rem; margin-right:0.25rem;">Edit</button>
              <button onclick="deleteStudentFee(${fee.id})" style="padding:0.35rem 0.6rem; background:#ef4444; color:white; border:none; border-radius:4px; cursor:pointer; font-size:0.75rem;">Delete</button>
            </td>
          </tr>
        `;
      }).join('');
    }

    function filterStudentFees() {
      const searchTerm = document.getElementById('fee-search')?.value.toLowerCase() || '';
      const tbody = document.getElementById('student-fees-tbody');
      if (!tbody) return;

      const rows = Array.from(tbody.querySelectorAll('tr'));
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
      });
    }

    function deleteStudentFee(feeId) {
      if (confirm('Delete this fee assignment?')) {
        const fees = JSON.parse(localStorage.getItem('student_fees') || '[]').filter(f => f.id !== feeId);
        localStorage.setItem('student_fees', JSON.stringify(fees));
        syncStudentFeesToDb(fees);
        loadAssignedStudentFees();
      }
    }

    function loadFeeLedger() {
      const tbody = document.getElementById('fee-ledger-tbody');
      if (!tbody) return;

      const classFilter = document.getElementById('ledger-class-filter')?.value || '';
      const statusFilter = document.getElementById('ledger-status-filter')?.value || '';
      
      const fees = JSON.parse(localStorage.getItem('student_fees') || '[]');
      
      // Group by student
      const studentGroups = {};
      fees.forEach(fee => {
        const roll = fee.studentRoll || fee.student_roll;
        const name = fee.studentName || fee.student_name;
        const cls = fee.studentClass || fee.student_class;
        const key = `${roll}|${name}|${cls}`;
        
        if (!studentGroups[key]) {
          studentGroups[key] = { roll: roll, name: name, class: cls, fees: [] };
        }
        studentGroups[key].fees.push(fee);
      });

      // Calculate totals and filter
      let records = Object.values(studentGroups).map(group => {
        const totalDue = group.fees.reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);
        const totalPaid = group.fees.reduce((sum, f) => sum + parseFloat(f.paidAmount || f.paid_amount || 0), 0);
        const balance = totalDue - totalPaid;
        const status = balance === 0 ? 'cleared' : totalPaid > 0 ? 'partial' : 'pending';

        return { ...group, totalDue, totalPaid, balance, status };
      }).filter(r => {
        const matchClass = !classFilter || r.class.toLowerCase().includes(classFilter.toLowerCase());
        const matchStatus = !statusFilter || r.status === statusFilter;
        return matchClass && matchStatus;
      });

      if (records.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:2rem; color:#94a3b8;">No records found</td></tr>';
        return;
      }

      tbody.innerHTML = records.map(r => {
        const statusColor = r.status === 'cleared' ? '#d1fae5' : r.status === 'partial' ? '#fef3c7' : '#fee2e2';
        const statusText = r.status === 'cleared' ? 'Cleared' : r.status === 'partial' ? 'Partial' : 'Pending';
        const statusTextColor = r.status === 'cleared' ? '#065f46' : r.status === 'partial' ? '#92400e' : '#7f1d1d';
        
        return `
          <tr>
            <td>${r.roll}</td>
            <td><strong>${r.name}</strong></td>
            <td>${r.class}</td>
            <td>Rs. ${r.totalDue}</td>
            <td style="color:#16a34a; font-weight:600;">Rs. ${r.totalPaid}</td>
            <td style="color:#dc2626; font-weight:600;">Rs. ${r.balance}</td>
            <td><span style="background:${statusColor}; color:${statusTextColor}; padding:0.25rem 0.75rem; border-radius:20px; font-size:0.75rem; font-weight:600;">${statusText}</span></td>
            <td>
              <button onclick="viewStudentFeeDetails('${r.roll}', '${r.name}')" style="padding:0.35rem 0.6rem; background:#3b82f6; color:white; border:none; border-radius:4px; cursor:pointer; font-size:0.75rem;">View</button>
            </td>
          </tr>
        `;
      }).join('');
    }

    function viewStudentFeeDetails(roll, name) {
      const fees = JSON.parse(localStorage.getItem('student_fees') || '[]').filter(f => String(f.studentRoll || f.student_roll) === String(roll));
      const detailsHtml = fees.map(f => `
        <div style="padding:1rem; background:#f8fafc; border-radius:8px; margin-bottom:0.5rem;">
          <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
            <strong>${f.categoryName || f.category_name}</strong>
            <span style="font-weight:700; color:var(--primary);">Rs. ${f.amount}</span>
          </div>
          <div style="font-size:0.85rem; color:#64748b;">Due: ${f.dueDate || f.due_date} | Inst: ${f.installment || f.installment_number || 1}</div>
          <div style="font-size:0.8rem; color:#94a3b8; margin-top:0.25rem;">${f.description || ''}</div>
        </div>
      `).join('');

      alert(`Fee Details for ${name}:\n\n${fees.map(f => `${f.categoryName || f.category_name}: Rs. ${f.amount} (${f.status})`).join('\n')}`);
    }

    function loadPaymentTracking() {
      const tbody = document.getElementById('payment-tracking-tbody');
      if (!tbody) return;

      const fees = JSON.parse(localStorage.getItem('student_fees') || '[]');
      
      if (fees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:2rem; color:#94a3b8;">No payment records</td></tr>';
        return;
      }

      tbody.innerHTML = fees.map((f, idx) => {
        const invoiceId = `INV-${Date.now()}-${idx}`;
        const dueDate = new Date(f.dueDate || f.due_date);
        const today = new Date();
        const daysOverdue = Math.max(0, Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)));
        
        const statusColor = f.status === 'cleared' ? '#d1fae5' : f.status === 'partial' ? '#fef3c7' : daysOverdue > 0 ? '#fee2e2' : '#fef3c7';
        const statusText = f.status === 'cleared' ? 'Cleared' : f.status === 'partial' ? 'Partial' : daysOverdue > 0 ? 'Overdue' : 'Pending';
        const statusTextColor = f.status === 'cleared' ? '#065f46' : f.status === 'partial' ? '#92400e' : daysOverdue > 0 ? '#7f1d1d' : '#92400e';
        const name = f.studentName || f.student_name;
        const amount = f.amount;
        const paidAmount = f.paidAmount || f.paid_amount || 0;
        const displayDueDate = f.dueDate || f.due_date;

        return `
          <tr>
            <td><code style="background:#f3f4f6; padding:0.25rem 0.5rem; border-radius:3px;">${invoiceId}</code></td>
            <td><strong>${name}</strong></td>
            <td>Rs. ${amount}</td>
            <td style="color:#16a34a; font-weight:600;">Rs. ${paidAmount}</td>
            <td>${displayDueDate}</td>
            <td><span style="background:${statusColor}; color:${statusTextColor}; padding:0.25rem 0.75rem; border-radius:20px; font-size:0.75rem; font-weight:600;">${statusText}</span></td>
            <td>${daysOverdue > 0 ? `<span style="color:#dc2626; font-weight:600;">${daysOverdue} days</span>` : '—'}</td>
            <td>
              <button onclick="markPaymentReceived(${f.id}, ${amount})" style="padding:0.35rem 0.6rem; background:#10b981; color:white; border:none; border-radius:4px; cursor:pointer; font-size:0.75rem;">Mark Paid</button>
            </td>
          </tr>
        `;
      }).join('');
    }

    function filterPayments() {
      const searchTerm = document.getElementById('payment-search')?.value.toLowerCase() || '';
      const statusFilter = document.getElementById('payment-status-filter')?.value || '';
      const tbody = document.getElementById('payment-tracking-tbody');
      if (!tbody) return;

      const rows = Array.from(tbody.querySelectorAll('tr'));
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const matchSearch = !searchTerm || text.includes(searchTerm);
        const matchStatus = !statusFilter || text.includes(statusFilter);
        row.style.display = (matchSearch && matchStatus) ? '' : 'none';
      });
    }

    function markPaymentReceived(feeId, amount) {
      const fees = JSON.parse(localStorage.getItem('student_fees') || '[]');
      const fee = fees.find(f => f.id === feeId);
      
      if (fee) {
        fee.paidAmount = amount;
        fee.paidDate = new Date().toISOString().split('T')[0];
        fee.status = 'cleared';
        localStorage.setItem('student_fees', JSON.stringify(fees));
        syncStudentFeesToDb(fees);
        alert('✅ Payment marked as received!');
        loadPaymentTracking();
      }
    }

    function loadFeeReports() {
      const fees = JSON.parse(localStorage.getItem('student_fees') || '[]');
      
      // Calculate totals
      const totalRevenue = fees.reduce((sum, f) => sum + (f.paidAmount || f.paid_amount || 0), 0);
      const totalDue = fees.reduce((sum, f) => sum + f.amount, 0);
      const pendingAmount = totalDue - totalRevenue;
      const clearedStudents = new Set(fees.filter(f => f.status === 'cleared').map(f => f.studentRoll || f.student_roll)).size;
      const collectionRate = totalDue > 0 ? Math.round((totalRevenue / totalDue) * 100) : 0;

      document.getElementById('report-total-revenue').textContent = `Rs. ${totalRevenue.toLocaleString()}`;
      document.getElementById('report-pending-amount').textContent = `Rs. ${pendingAmount.toLocaleString()}`;
      document.getElementById('report-cleared-count').textContent = clearedStudents;
      document.getElementById('report-collection-rate').textContent = `${collectionRate}%`;

      // Category breakdown
      const categoryMap = {};
      fees.forEach(f => {
        const categoryName = f.categoryName || f.category_name;
        if (!categoryMap[categoryName]) {
          categoryMap[categoryName] = { due: 0, paid: 0 };
        }
        categoryMap[categoryName].due += f.amount;
        categoryMap[categoryName].paid += f.paidAmount || f.paid_amount || 0;
      });

      const categoryHtml = Object.entries(categoryMap).map(([cat, data]) => `
        <div style="padding:0.75rem; display:flex; justify-content:space-between; border-bottom:1px solid #e2e8f0;">
          <span><strong>${cat}</strong></span>
          <span style="color:var(--primary); font-weight:600;">Rs. ${data.paid} / ${data.due}</span>
        </div>
      `).join('');
      document.getElementById('category-report-tbody').innerHTML = categoryHtml || '<p style="text-align:center; color:#94a3b8;">No data</p>';

      // Class breakdown (if needed)
      document.getElementById('class-report-tbody').innerHTML = '<p style="text-align:center; color:#94a3b8;">Analysis by class available in detailed reports</p>';
    }

    async function loadClassesForDropdown() {

      console.log("=== START: loadClassesForDropdown ===");
      try {
        let classNames = [];

        // Try 1: Load from the classes table
        if (supabaseDb && typeof supabaseDb.from === 'function') {
          try {
            console.log("Try 1: Fetching classes from 'classes' table...");
            const { data, error } = await supabaseDb
              .from('classes')
              .select('id, grade_level, section_name, status')
              .eq('status', 'Active')
              .order('grade_level', { ascending: true });

            if (error) {
              console.warn("Try 1: Classes table query failed or blocked:", error.message);
            } else if (data && data.length > 0) {
              console.log(`Try 1: Success! Found ${data.length} classes.`);
              classNames = data.map(cls => `${cls.grade_level} - ${cls.section_name}`);
            } else {
              console.log("Try 1: Classes table query returned empty.");
            }
          } catch(e) {
            console.warn('Try 1: Exception querying classes table:', e);
          }

          // Try 2: If classes table was empty/blocked, extract from student_credentials
          if (classNames.length === 0) {
            try {
              console.log("Try 2: Fetching from student_credentials...");
              const { data: creds, error: credErr } = await supabaseDb
                .from('student_credentials')
                .select('student_class');
              
              if (credErr) {
                console.warn("Try 2: student_credentials query failed:", credErr.message);
              } else if (creds && creds.length > 0) {
                const unique = [...new Set(creds.map(c => c.student_class).filter(Boolean))];
                console.log(`Try 2: Success! Extracted ${unique.length} unique classes.`);
                classNames = unique.sort();
              } else {
                console.log("Try 2: student_credentials query returned empty.");
              }
            } catch(e2) {
              console.warn('Try 2: Exception querying student_credentials:', e2);
            }
          }

          // Try 3: Extract from students_registry
          if (classNames.length === 0) {
            try {
              console.log("Try 3: Fetching from students_registry...");
              const { data: students, error: stuErr } = await supabaseDb
                .from('students_registry')
                .select('class');
              
              if (stuErr) {
                console.warn("Try 3: students_registry query failed:", stuErr.message);
              } else if (students && students.length > 0) {
                const unique = [...new Set(students.map(s => s.class).filter(Boolean))];
                console.log(`Try 3: Success! Extracted ${unique.length} unique classes.`);
                classNames = unique.sort();
              } else {
                console.log("Try 3: students_registry query returned empty.");
              }
            } catch(e3) {
              console.warn('Try 3: Exception querying students_registry:', e3);
            }
          }
        } else {
          console.log("supabaseDb client is not initialized yet.");
        }

        // Try 4: Last resort — pull from localStorage
        if (classNames.length === 0) {
          try {
            console.log("Try 4: Pulling from localStorage...");
            const localStudents = JSON.parse(localStorage.getItem('students_registry') || '[]');
            const localCreds = JSON.parse(localStorage.getItem('student_credentials') || '[]');
            const allClasses = [
              ...localStudents.map(s => s.class || s.class_name),
              ...localCreds.map(c => c.student_class)
            ].filter(Boolean);
            classNames = [...new Set(allClasses)].sort();
            console.log(`Try 4: Extracted ${classNames.length} classes from localStorage.`);
          } catch(e4) {
            console.warn('Try 4: Exception reading localStorage:', e4);
          }
        }

        // Try 5: Ultimate Self-Healing Fallback (If all else fails, use standard classes)
        if (classNames.length === 0) {
          console.log("Try 5: No classes found anywhere. Using hardcoded standard fallbacks.");
          classNames = [
            "Grade 1 - Section A",
            "Grade 1 - Section B",
            "Grade 2 - Section A",
            "Grade 2 - Section B",
            "Grade 3 - Section A",
            "Grade 3 - Section B",
            "Grade 4 - Section A",
            "Grade 4 - Section B",
            "Grade 5 - Section A",
            "Grade 5 - Section B",
            "Grade 6 - Section A",
            "Grade 6 - Section B",
            "Grade 7 - Section A",
            "Grade 7 - Section B",
            "Grade 8 - Section A",
            "Grade 8 - Section B",
            "Grade 9 - Section A",
            "Grade 9 - Section B",
            "Grade 10 - Section A",
            "Grade 10 - Section B",
            "Grade 11 - Section A",
            "Grade 11 - Section B",
            "Grade 12 - Section A",
            "Grade 12 - Section B",
            "Grade 12 Technical - T"
          ];
        }

        console.log("Resolved classes to populate:", classNames);

        // Populate all matching select dropdowns
        const dropdownIds = [
          'std-class',
          'admin-student-search-class',
          'sched-class',
          'filter-class',
          'tt-class',
          'leadersheet-class'
        ];

        // Ensure we populate the dropdowns immediately
        dropdownIds.forEach(id => {
          const selectElement = document.getElementById(id);
          if (!selectElement) {
            console.log(`Dropdown '${id}' not found on this page - skipping.`);
            return;
          }

          // Clear existing options except the first one
          while (selectElement.options.length > 1) {
            selectElement.remove(1);
          }

          // Populate with all class names
          classNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            selectElement.appendChild(option);
          });
          console.log(`✓ Populated dropdown '${id}' with ${classNames.length} classes.`);
        });

      } catch(e) {
        console.error('Exception loading classes:', e);
        // Even on error, ensure dropdowns are populated with fallback values
        const fallbackClasses = [
          "Grade 1 - Section A", "Grade 2 - Section A", "Grade 3 - Section A", "Grade 4 - Section A",
          "Grade 5 - Section A", "Grade 6 - Section A", "Grade 7 - Section A", "Grade 8 - Section A",
          "Grade 9 - Section A", "Grade 10 - Section A", "Grade 11 - Section A", "Grade 12 - Section A",
          "Grade 12 Technical - T"
        ];
        
        const dropdownIds = ['std-class', 'admin-student-search-class', 'sched-class', 'filter-class', 'tt-class', 'leadersheet-class'];
        dropdownIds.forEach(id => {
          const selectElement = document.getElementById(id);
          if (selectElement) {
            while (selectElement.options.length > 1) {
              selectElement.remove(1);
            }
            fallbackClasses.forEach(name => {
              const option = document.createElement('option');
              option.value = name;
              option.textContent = name;
              selectElement.appendChild(option);
            });
          }
        });
      }
      console.log("=== END: loadClassesForDropdown ===");
    }

    async function enrollStudentWithCredentials(event) {
      event.preventDefault();
      
      const name = document.getElementById('std-name').value.trim();
      const roll = parseInt(document.getElementById('std-roll').value);
      const className = document.getElementById('std-class').value.trim();
      const username = document.getElementById('std-username').value.trim();
      const password = document.getElementById('std-password').value;
      const passwordConfirm = document.getElementById('std-password-confirm').value;
      const email = document.getElementById('std-email').value.trim();
      const phone = document.getElementById('std-phone').value.trim();

      if (!name || !roll || !className || !username || !password) {
        alert('Please fill in all required fields (marked with *)');
        return;
      }

      if (className === '') {
        alert('⚠️ Please select a class from the dropdown.\n\nIf the dropdown is empty:\n1. Check DATABASE_SETUP_GUIDE.md\n2. Add classes in Supabase\n3. Refresh this page');
        return;
      }

      if (password !== passwordConfirm) {
        alert('Passwords do not match. Please try again.');
        return;
      }

      if (password.length < 8) {
        alert('Password must be at least 8 characters long');
        return;
      }

      try {
        // Step 1: Check if student already exists in registry
        let studentExists = false;
        if (supabaseDb) {
          const { data: existingStudent } = await supabaseDb
            .from('students_registry')
            .select('*')
            .eq('roll', roll)
            .single();
          
          if (!existingStudent) {
            // Create student in registry first
            const { error: regError } = await supabaseDb.from('students_registry').insert([{
              roll: roll,
              name: name,
              class: className,
              attendance: "100.0%",
              overall_gpa: "0.00",
              status: "Active",
              billing_state: "unpaid"
            }]);
            
            if (regError && regError.code !== 'PGRST116') {
              alert('Error creating student registry: ' + regError.message);
              return;
            }
          }
          studentExists = true;
        }

        // Step 2: Create login credentials
        const credentialData = {
          student_roll: roll,
          student_name: name,
          student_username: username,
          student_password: password, // In production, hash this with bcrypt
          student_email: email || null,
          student_phone: phone || null,
          student_class: className,
          is_active: true
        };

        const result = await createStudentCredential(credentialData);
        if (result.success) {
          const action = result.updated ? 'Updated' : 'Created';
          alert(`✅ Student Account ${action} Successfully!\n\nRoll Number: ${roll}\nUsername: ${username}\nPassword: ${password}\nClass: ${className}\n\nShare these credentials with the student.`);
          clearStudentForm();
          loadStudentAccounts();
          loadClassesForDropdown();
        } else {
          // Enhanced error handling with specific error codes
          if (result.code === 'USERNAME_ALREADY_EXISTS' || result.error.includes('already taken')) {
            alert('❌ Username Not Available\n\nThe username "' + username + '" is already in use.\n\nPlease choose a different username and try again.');
            document.getElementById('std-username').focus();
            document.getElementById('std-username').value = ''; // Clear the username field
          } else if (result.code === 'DUPLICATE_KEY' || result.error.includes('duplicate')) {
            alert('❌ Error: Account Already Exists\n\nThis student account already exists in the system.\n\nPlease verify:\n1. The username is not already created\n2. The roll number is not already used\n\nError: ' + result.error);
          } else if (result.code === 'TABLE_NOT_FOUND' || result.error.includes('schema cache') || result.error.includes('not initialized') || result.error.includes('Could not find')) {
            alert('❌ Error: Database table "student_credentials" not initialized.\n\nPlease:\n1. Check DATABASE_SETUP_GUIDE.md in your project\n2. Open Supabase SQL Editor\n3. Run all SQL commands from setup.sql\n4. Refresh this page\n\nError details: ' + result.error);
          } else {
            alert('❌ Error creating student account:\n\n' + result.error);
          }
          console.error('Student creation error:', result);
        }
      } catch(e) {
        alert('Error: ' + e.message);
        console.error('Enrollment error:', e);
      }
    }

    async function toggleStudentStatus(id, newStatus) {
      try {
        const result = await updateStudentCredential(id, { is_active: newStatus });
        if (result.success) {
          alert(newStatus ? 'Student account enabled' : 'Student account disabled');
          loadStudentAccounts();
        } else {
          alert('Error updating account status: ' + result.error);
        }
      } catch(e) {
        alert('Error: ' + e.message);
      }
    }

    async function deleteStudentAccount(id) {
      if (!confirm('Are you sure you want to delete this student account? This cannot be undone.')) return;
      
      try {
        const result = await deleteStudentCredential(id);
        if (result.success) {
          alert('Student account deleted successfully');
          loadStudentAccounts();
        } else {
          alert('Error deleting account: ' + result.error);
        }
      } catch(e) {
        alert('Error: ' + e.message);
      }
    }

    function clearStudentForm() {
      document.getElementById('student-enrollment-form').reset();
      document.getElementById('std-name').focus();
    }

    // ─────────────── ADMISSIONS MANAGEMENT ───────────────
    let allAdmissions = [];
    let admissionsSummary = {};

    async function loadAdmissions() {
      if (!admissionHandler) {
        alert('Admission handler not initialized. Please refresh the page.');
        return;
      }

      try {
        // Show loading state
        document.getElementById('admissions-tbody').innerHTML = '<tr><td colspan="8" style="text-align:center; padding:2rem;">Loading applications...</td></tr>';
        
        // Load all applications
        const result = await admissionHandler.getAllApplications({ limit: 1000 });
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to load applications');
        }

        allAdmissions = result.data || [];
        
        // Load summary stats
        const summaryResult = await admissionHandler.getAdmissionSummary();
        if (summaryResult.success) {
          admissionsSummary = summaryResult.data?.[0] || {};
        }

        // Update summary display
        document.getElementById('admissions-total').textContent = admissionsSummary.total_applications || allAdmissions.length;
        document.getElementById('admissions-pending').textContent = admissionsSummary.pending_count || 0;
        document.getElementById('admissions-approved').textContent = admissionsSummary.shortlisted_count || 0;
        document.getElementById('badge-admissions-count').textContent = allAdmissions.length;

        // Display applications
        renderAdmissionsTable();
      } catch (e) {
        console.error('Error loading admissions:', e);
        document.getElementById('admissions-tbody').innerHTML = `<tr><td colspan="8" style="text-align:center; padding:2rem; color:#dc2626;">Error: ${e.message}</td></tr>`;
      }
    }

    function renderAdmissionsTable() {
      const tbody = document.getElementById('admissions-tbody');
      
      if (allAdmissions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:2rem; color:#7f8c8d;">No applications found.</td></tr>';
        return;
      }

      tbody.innerHTML = allAdmissions.map(app => {
        const submittedDate = new Date(app.submitted_date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });

        const statusBadgeColor = {
          'pending': '#f59e0b',
          'shortlisted': '#10b981',
          'admitted': '#3b82f6',
          'rejected': '#dc2626'
        }[app.application_status] || '#6b7280';

        return `
          <tr>
            <td><strong>#${app.id}</strong></td>
            <td>${app.full_name || 'N/A'}</td>
            <td>${app.class_applying_for || 'N/A'}</td>
            <td>${app.father_phone || 'N/A'}</td>
            <td>
              <span style="background:${statusBadgeColor}; color:white; padding:0.3rem 0.8rem; border-radius:20px; font-size:0.85rem; font-weight:600;">
                ${app.application_status?.charAt(0).toUpperCase() + app.application_status?.slice(1) || 'Pending'}
              </span>
            </td>
            <td><small>${submittedDate}</small></td>
            <td>
              <button onclick="viewApplicationDocuments(${app.id})" style="background:none; border:none; color:var(--accent); cursor:pointer; font-weight:600; text-decoration:underline;">
                View
              </button>
            </td>
            <td style="display:flex; gap:0.5rem;">
              <button onclick="updateApplicationStatus(${app.id}, '${app.full_name}')" class="action-btn" title="Update Status">✏️</button>
              <button onclick="deleteApplication(${app.id})" class="action-btn" style="color:#dc2626;" title="Delete">🗑️</button>
            </td>
          </tr>
        `;
      }).join('');
    }

    function filterAdmissions() {
      const statusFilter = document.getElementById('filter-status').value.toLowerCase();
      const classFilter = document.getElementById('filter-class').value.toLowerCase();
      const nameFilter = document.getElementById('filter-name').value.toLowerCase();

      const filtered = allAdmissions.filter(app => {
        const matchStatus = !statusFilter || (app.application_status || '').toLowerCase().includes(statusFilter);
        const matchClass = !classFilter || (app.class_applying_for || '').toLowerCase().includes(classFilter);
        const matchName = !nameFilter || 
          (app.full_name || '').toLowerCase().includes(nameFilter) ||
          (app.father_name || '').toLowerCase().includes(nameFilter);
        
        return matchStatus && matchClass && matchName;
      });

      // Temporarily replace allAdmissions for rendering
      const temp = allAdmissions;
      allAdmissions = filtered;
      renderAdmissionsTable();
      allAdmissions = temp;
    }

    async function viewApplicationDocuments(applicationId) {
      if (!admissionHandler) return;

      try {
        const appResult = await admissionHandler.getApplicationDetails(applicationId);
        const docsResult = await admissionHandler.getApplicationDocuments(applicationId);

        if (!appResult.success || !docsResult.success) {
          alert('Error loading application details');
          return;
        }

        const app = appResult.data;
        const docs = docsResult.data || [];

        // Build the beautiful modal content
        let html = `
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-bottom:1.5rem; background:#f8fafc; padding:1.5rem; border-radius:12px; border:1px solid #e2e8f0;">
            <div>
              <p style="margin:0 0 0.5rem; font-size:0.85rem; color:#64748b; font-weight:700; text-transform:uppercase;">Student Name</p>
              <p style="margin:0; font-size:1.1rem; color:var(--primary); font-weight:700;">${app.full_name}</p>
            </div>
            <div>
              <p style="margin:0 0 0.5rem; font-size:0.85rem; color:#64748b; font-weight:700; text-transform:uppercase;">Applying For</p>
              <p style="margin:0; font-size:1.1rem; color:var(--primary); font-weight:700;">${app.class_applying_for}</p>
            </div>
            <div>
              <p style="margin:0 0 0.5rem; font-size:0.85rem; color:#64748b; font-weight:700; text-transform:uppercase;">Application ID</p>
              <p style="margin:0; font-size:1.1rem; color:var(--primary); font-weight:700;">#${app.id}</p>
            </div>
            <div>
              <p style="margin:0 0 0.5rem; font-size:0.85rem; color:#64748b; font-weight:700; text-transform:uppercase;">Contact Phone</p>
              <p style="margin:0; font-size:1.1rem; color:var(--primary); font-weight:700;">${app.father_phone}</p>
            </div>
          </div>
        `;

        html += '<h4 style="color:var(--primary); margin-bottom:1rem; font-family:\'Playfair Display\', serif; font-size:1.25rem;">Uploaded Documents</h4>';

        if (docs.length === 0) {
          html += '<div style="text-align:center; padding:2rem; background:#f1f5f9; border-radius:12px;"><p style="color:#64748b; margin:0;">No documents uploaded for this application.</p></div>';
        } else {
          html += '<div style="display:grid; gap:1rem;">';
          docs.forEach(doc => {
            const uploadDate = new Date(doc.upload_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const docName = doc.document_type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            
            // Generate icon based on doc type
            let icon = '📄';
            if (doc.document_type === 'student_photo') icon = '🖼️';
            
            html += `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:1rem 1.5rem; background:#fff; border:1px solid #e2e8f0; border-radius:12px; box-shadow:0 2px 5px rgba(0,0,0,0.02); transition:transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 10px rgba(0,0,0,0.05)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 5px rgba(0,0,0,0.02)';">
                <div style="display:flex; align-items:center; gap:1rem;">
                  <div style="font-size:1.5rem; background:#f0f7ff; width:40px; height:40px; display:flex; align-items:center; justify-content:center; border-radius:8px;">${icon}</div>
                  <div>
                    <p style="margin:0 0 0.2rem; font-weight:700; color:#1e293b;">${docName}</p>
                    <p style="margin:0; font-size:0.8rem; color:#64748b;">Uploaded on ${uploadDate}</p>
                  </div>
                </div>
                <a href="${doc.document_url}" target="_blank" style="display:inline-block; padding:0.5rem 1.25rem; background:var(--accent); color:#fff; text-decoration:none; font-weight:700; border-radius:6px; font-size:0.9rem; transition:background 0.2s;" onmouseover="this.style.background='#d97014'" onmouseout="this.style.background='var(--accent)'">
                  View File
                </a>
              </div>
            `;
          });
          html += '</div>';
        }

        const modal = document.getElementById('application-details-modal');
        document.getElementById('app-modal-body').innerHTML = html;
        
        modal.style.display = 'flex';
        // Trigger reflow for transition
        void modal.offsetWidth;
        modal.style.opacity = '1';
        modal.querySelector('.custom-modal-content').style.transform = 'translateY(0)';
      } catch (e) {
        console.error('Error:', e);
        alert('Error loading document details: ' + e.message);
      }
    }

    async function updateApplicationStatus(applicationId, studentName) {
      const newStatus = prompt(
        `Update application status for ${studentName}:\n\nEnter: pending, shortlisted, admitted, or rejected`,
        'shortlisted'
      );

      if (!newStatus) return;

      const validStatuses = ['pending', 'shortlisted', 'admitted', 'rejected'];
      if (!validStatuses.includes(newStatus.toLowerCase())) {
        alert('Invalid status. Please enter: pending, shortlisted, admitted, or rejected');
        return;
      }

      try {
        const result = await admissionHandler.updateApplicationStatus(
          applicationId,
          newStatus.toLowerCase(),
          `Status updated to ${newStatus} by admin`
        );

        if (result.success) {
          alert(`✅ Application status updated to: ${newStatus}`);
          loadAdmissions();
        } else {
          alert('Error: ' + result.error);
        }
      } catch (e) {
        console.error('Error:', e);
        alert('Error updating status: ' + e.message);
      }
    }

    async function deleteApplication(applicationId) {
      if (!confirm('⚠️ Delete this application? All associated documents will be removed. This cannot be undone.')) {
        return;
      }

      try {
        const result = await admissionHandler.deleteApplication(applicationId);

        if (result.success) {
          alert('✅ Application deleted successfully');
          loadAdmissions();
        } else {
          alert('Error: ' + result.error);
        }
      } catch (e) {
        console.error('Error:', e);
        alert('Error deleting application: ' + e.message);
      }
    }

    // Load admissions when page loads if it's in the view
    window.addEventListener('load', () => {
      // Check if admissions page is being shown initially, otherwise load on switchPage call
      const page = document.getElementById('page-admissions');
      if (page && page.classList.contains('active')) {
        loadAdmissions();
      }
    });

    // Load achievements and alumni when pages are switched to them
    // (Now handled in switchPage function above)

    // ═══════════════════════════════════════════════════════════════════
    // TIMETABLE MANAGEMENT FUNCTIONS (MATRIX UI)
    // ═══════════════════════════════════════════════════════════════════

    async function initTimetablePage() {
      try {
        console.log('[DEBUG] Initializing timetable matrix page...');
        const authCheck = await timetableHandler.checkAuthentication();
        if (!authCheck.authenticated) console.warn('[WARNING] User may not be authenticated');

        // Load Class Dropdown
        const select = document.getElementById('matrix-class-select');
        select.innerHTML = '<option value="">-- Select Class --</option>';
        
        const classesGrouped = await timetableHandler.getClassesByGradeLevel();
        if (classesGrouped) {
          for (const [gradeLevel, classes] of Object.entries(classesGrouped)) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = gradeLevel;
            classes.forEach(cls => {
              const option = document.createElement('option');
              option.value = JSON.stringify({
                id: cls.id,
                grade_level: cls.grade_level,
                section_name: cls.section_name
              });
              option.textContent = cls.display;
              optgroup.appendChild(option);
            });
            select.appendChild(optgroup);
          }
        }

        // Load Subject and Teacher Dropdowns for Modal
        await populateMatrixSubjectDropdown();
        await populateMatrixTeacherDropdown();
        
        console.log('[SUCCESS] Timetable page initialized');
      } catch (error) {
        console.error('[ERROR] Failed to initialize timetable page:', error);
      }
    }

    async function populateMatrixSubjectDropdown() {
      try {
        const subjectsGrouped = await timetableHandler.getSubjectsByCategory();
        const select = document.getElementById('matrix-subject');
        select.innerHTML = '<option value="">-- Select Subject --</option>';

        for (const [category, subjects] of Object.entries(subjectsGrouped)) {
          const optgroup = document.createElement('optgroup');
          optgroup.label = category;
          subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = JSON.stringify({ id: subject.id, name: subject.subject_name });
            option.textContent = subject.display;
            optgroup.appendChild(option);
          });
          select.appendChild(optgroup);
        }
      } catch (error) { console.error("Error populating subjects:", error); }
    }

    async function populateMatrixTeacherDropdown() {
      try {
        const teachersGrouped = await timetableHandler.getTeachersByCategory();
        const select = document.getElementById('matrix-teacher');
        select.innerHTML = '<option value="">-- Select Teacher --</option>';

        for (const [category, teachers] of Object.entries(teachersGrouped)) {
          const optgroup = document.createElement('optgroup');
          optgroup.label = category;
          teachers.forEach(teacher => {
            const option = document.createElement('option');
            option.value = JSON.stringify({ code: teacher.code, name: teacher.name });
            option.textContent = teacher.display;
            optgroup.appendChild(option);
          });
          select.appendChild(optgroup);
        }
      } catch (error) { console.error("Error populating teachers:", error); }
    }

    let currentMatrixClassData = null;

    async function loadTimetableMatrix(classJson) {
      if (!classJson) {
        document.getElementById('timetable-matrix-container').style.display = 'none';
        return;
      }
      try {
        currentMatrixClassData = JSON.parse(classJson);
        document.getElementById('matrix-class-title').innerText = `Timetable for ${currentMatrixClassData.grade_level} - ${currentMatrixClassData.section_name}`;
        document.getElementById('timetable-matrix-container').style.display = 'block';

        const records = await timetableHandler.getTimetableEntries({ class_id: currentMatrixClassData.id });
        renderMatrixGrid(records);
      } catch (e) { console.error("Error loading matrix:", e); }
    }

    // Mapping periods to roughly start/end times if empty
    const defaultPeriods = [
      { p: 1, start: "10:00", end: "10:45" },
      { p: 2, start: "10:45", end: "11:30" },
      { p: 3, start: "11:30", end: "12:15" },
      { p: 4, start: "12:15", end: "13:00" },
      { p: 5, start: "13:30", end: "14:15" },
      { p: 6, start: "14:15", end: "15:00" },
      { p: 7, start: "15:00", end: "15:45" },
      { p: 8, start: "15:45", end: "16:30" }
    ];

    function renderMatrixGrid(records) {
      const tbody = document.getElementById('matrix-body');
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      
      let html = '';
      days.forEach(day => {
        html += `<tr><td style="font-weight:bold; background:var(--bg-color);">${day}</td>`;
        for (let period = 1; period <= 8; period++) {
          // Find if there is an entry for this day and roughly this period
          // To map periods accurately, we just sort the day's records by start_time
          const dayRecords = records.filter(r => r.day_of_week === day).sort((a,b) => a.start_time.localeCompare(b.start_time));
          const entry = dayRecords[period - 1]; // Assuming they map 1-to-1 to periods
          
          if (entry) {
            html += `
              <td style="padding: 0.5rem; border: 1px solid var(--border); cursor:pointer; background:#f0fdf4;" onclick='openTimetableMatrixModal("${day}", ${period}, ${JSON.stringify(entry).replace(/'/g, "&#39;")})'>
                <div style="font-weight:600; color:var(--primary); font-size:0.9rem;">${entry.subject_name}</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">${entry.teacher_name}</div>
                <div style="font-size:0.75rem; color:#6b7280; margin-top:4px;">${entry.start_time.substring(0,5)} - ${entry.end_time.substring(0,5)}</div>
              </td>
            `;
          } else {
            html += `
              <td style="padding: 0.5rem; border: 1px solid var(--border); cursor:pointer;" onclick='openTimetableMatrixModal("${day}", ${period}, null)'>
                <div style="color:#cbd5e1; font-size:0.85rem; padding:1rem 0;">+ Assign</div>
              </td>
            `;
          }
        }
        html += `</tr>`;
      });
      tbody.innerHTML = html;
    }

    function openTimetableMatrixModal(day, period, entryData) {
      document.getElementById('timetable-matrix-modal').style.display = 'flex';
      document.getElementById('matrix-modal-title').innerText = entryData ? `Edit Assignment: ${day} Period ${period}` : `New Assignment: ${day} Period ${period}`;
      
      document.getElementById('matrix-cell-day').value = day;
      document.getElementById('matrix-cell-period').value = period;
      
      if (entryData) {
        document.getElementById('matrix-cell-id').value = entryData.id;
        document.getElementById('matrix-subject').value = JSON.stringify({id: entryData.subject_id, name: entryData.subject_name});
        document.getElementById('matrix-teacher').value = JSON.stringify({code: entryData.teacher_code, name: entryData.teacher_name});
        document.getElementById('matrix-start-time').value = entryData.start_time.substring(0,5);
        document.getElementById('matrix-end-time').value = entryData.end_time.substring(0,5);
        document.getElementById('matrix-delete-btn').style.display = 'block';
      } else {
        document.getElementById('matrix-cell-id').value = '';
        document.getElementById('matrix-subject').value = '';
        document.getElementById('matrix-teacher').value = '';
        const def = defaultPeriods[period-1];
        document.getElementById('matrix-start-time').value = def ? def.start : "";
        document.getElementById('matrix-end-time').value = def ? def.end : "";
        document.getElementById('matrix-delete-btn').style.display = 'none';
      }
    }

    function closeTimetableMatrixModal() {
      document.getElementById('timetable-matrix-modal').style.display = 'none';
    }

    async function saveMatrixCell(event) {
      event.preventDefault();
      const id = document.getElementById('matrix-cell-id').value;
      const day = document.getElementById('matrix-cell-day').value;
      const subjectJson = document.getElementById('matrix-subject').value;
      const teacherJson = document.getElementById('matrix-teacher').value;
      const startTime = document.getElementById('matrix-start-time').value;
      const endTime = document.getElementById('matrix-end-time').value;

      if (!subjectJson || !teacherJson || !startTime || !endTime) return;
      const subjectData = JSON.parse(subjectJson);
      const teacherData = JSON.parse(teacherJson);

      const entryData = {
        class_id: currentMatrixClassData.id,
        grade_level: currentMatrixClassData.grade_level,
        section_name: currentMatrixClassData.section_name,
        subject_id: subjectData.id,
        subject_name: subjectData.name,
        teacher_code: teacherData.code,
        teacher_name: teacherData.name,
        day_of_week: day,
        start_time: startTime,
        end_time: endTime,
        status: "Active"
      };

      try {
        let result;
        if (id) {
          result = await timetableHandler.updateTimetableEntry(id, entryData);
        } else {
          result = await timetableHandler.addTimetableEntry(entryData);
        }

        if (result.success) {
          closeTimetableMatrixModal();
          loadTimetableMatrix(JSON.stringify(currentMatrixClassData));
        } else {
          alert('Error: ' + result.error);
        }
      } catch(e) { alert('Error: ' + e.message); }
    }

    async function deleteMatrixCell() {
      const id = document.getElementById('matrix-cell-id').value;
      if (!id || !confirm("Remove this assignment?")) return;
      try {
        const result = await timetableHandler.deleteTimetableEntry(id);
        if (result.success) {
          closeTimetableMatrixModal();
          loadTimetableMatrix(JSON.stringify(currentMatrixClassData));
        } else {
          alert('Error: ' + result.error);
        }
      } catch(e) { alert('Error: ' + e.message); }
    }

    // Update switchPage to initialize timetable when switching to it
    const originalSwitchPage = window.switchPage;
    window.switchPage = function(pageId, element) {
      originalSwitchPage(pageId, element);
      
      if (pageId === 'Academic_ClassTimetable') {
        setTimeout(() => initTimetablePage(), 100);
      }

      if (pageId === 'exam-portal' && typeof window.initDynamicExamPortal === 'function') {
        setTimeout(() => window.initDynamicExamPortal(), 100);
      }
    };

    // ═══════════════════════════════════════════════════════════════════
    // ABOUT TEAM MANAGEMENT & ORG TREE
    // ═══════════════════════════════════════════════════════════════════
    function switchTeamView(view) {
      document.querySelectorAll('.tree-view-tab').forEach(t => {
        t.classList.remove('active');
        if (t.textContent.toLowerCase().includes(view)) {
          t.classList.add('active');
        }
      });
      document.getElementById('team-edit-view').style.display = 'none';
      document.getElementById('team-tree-view').style.display = 'none';
      
      if (view === 'edit') {
        document.getElementById('team-edit-view').style.display = 'block';
      } else {
        document.getElementById('team-tree-view').style.display = 'block';
        renderOrgTree();
      }
    }

    async function createAdvancedTeamMember() {
      const name = document.getElementById('teamMemberName').value;
      const position = document.getElementById('teamMemberPosition').value;
      const department = document.getElementById('teamMemberDepartment').value;
      const level = parseInt(document.getElementById('teamMemberLevel').value) || 0;
      const parentId = document.getElementById('teamMemberParent').value || null;
      const order = parseInt(document.getElementById('teamMemberOrder').value) || 0;
      const email = document.getElementById('teamMemberEmail').value;
      const photoInput = document.getElementById('teamMemberImage');
      
      if (!name || !position) {
        showAboutAlert('Please provide at least Name and Position', false);
        return;
      }
      
      let photoUrl = '';
      if (photoInput.files.length > 0) {
        const file = photoInput.files[0];
        const fileName = `${Date.now()}_${file.name}`;
        
        try {
          const { data, error } = await supabaseMedia.storage
            .from('team-photos')
            .upload(fileName, file);
            
          if (error) {
            console.warn('Storage upload error:', error);
            showAboutAlert('⚠️ Photo upload failed (storage may not be configured). Continuing without photo.', false);
          } else {
            const { data: { publicUrl } } = supabaseMedia.storage
              .from('team-photos')
              .getPublicUrl(fileName);
            photoUrl = publicUrl;
          }
        } catch (e) {
          console.warn('Image upload error:', e);
          showAboutAlert('⚠️ Could not upload photo (using local storage). You can add a photo URL manually later.', false);
        }
      }

      try {
        if (typeof createAdminMember === 'undefined') {
          throw new Error('Create admin member function not available');
        }
        
        const result = await createAdminMember(name, position, department, photoUrl, email, level, parentId, order);
        
        if (!result) {
          showAboutAlert('⚠️ Team member saved locally (database sync may be unavailable)', true);
        } else {
          showAboutAlert('✅ Team Member added successfully', true);
        }
        
        // Reset form
        document.getElementById('teamMemberName').value = '';
        document.getElementById('teamMemberPosition').value = '';
        document.getElementById('teamMemberDepartment').value = '';
        document.getElementById('teamMemberImage').value = '';
        document.getElementById('imagePreview').src = '';
        document.getElementById('imagePreview').style.display = 'none';
        
        await loadAdminTeamTable();
      } catch (error) {
        console.error('Error creating team member:', error);
        showAboutAlert('❌ Error: ' + (error.message || 'Failed to create team member. Check console for details.'), false);
      }
    }

    async function loadAdminTeamTable() {
      try {
        if (typeof readAllAdminTeam === 'undefined') {
          console.error('readAllAdminTeam function not loaded yet');
          document.getElementById('about-teamTable').innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem; color: #7f8c8d;">Loading... Please wait.</td></tr>';
          return;
        }
        const team = await readAllAdminTeam(); // fetches from cache or DB
        const tbody = document.getElementById('about-teamTable');
        if (team.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem; color: #7f8c8d;">No members found.</td></tr>';
        } else {
          tbody.innerHTML = team.map(m => `
            <tr>
              <td>${m.member_photo_url ? `<img src="${m.member_photo_url}" width="40" height="40" style="border-radius:50%; object-fit:cover;">` : '📸'}</td>
              <td>${m.member_name}</td>
              <td>${m.member_role}</td>
              <td>${m.member_department}</td>
              <td>Level ${m.hierarchy_level}</td>
              <td>
                <button onclick="deleteAboutAdminMember(${m.id})" style="background:#ef4444; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">Delete</button>
              </td>
            </tr>
          `).join('');
        }
        
        // Update parent dropdown
        const parentSelect = document.getElementById('teamMemberParent');
        parentSelect.innerHTML = '<option value="">None - Top Level</option>' + 
          team.map(m => `<option value="${m.id}">${m.member_name} (${m.member_role})</option>`).join('');
      } catch (error) {
        console.error('Error loading admin team:', error);
        document.getElementById('about-teamTable').innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem; color: #ef4444;">Error loading team data</td></tr>';
      }
    }

    async function deleteAboutAdminMember(id) {
      if(confirm('Delete this member?')) {
        try {
          if (typeof deleteAdminMember === 'undefined') {
            throw new Error('Delete function not available');
          }
          await deleteAdminMember(id);
          await loadAdminTeamTable();
          showAboutAlert('Team member deleted successfully', true);
        } catch (error) {
          console.error('Error deleting team member:', error);
          showAboutAlert('Error deleting member: ' + error.message, false);
        }
      }
    }

    async function renderOrgTree() {
      try {
        const container = document.getElementById('org-tree-container');
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Loading organization structure...</p>';
        
        if (typeof readAllAdminTeam === 'undefined') {
          console.error('readAllAdminTeam function not loaded yet');
          container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Scripts loading... Please wait.</p>';
          return;
        }
        
        const team = await readAllAdminTeam();
        if(team.length === 0) {
           container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">No members to display.</p>';
           return;
        }
        
        // Build tree
        const tree = buildHierarchy(team);
        container.innerHTML = generateTreeHTML(tree);
      } catch (error) {
        console.error('Error rendering org tree:', error);
        document.getElementById('org-tree-container').innerHTML = '<p style="text-align: center; color: var(--text-muted);">Error loading organization structure</p>';
      }
    }
    
    function buildHierarchy(members) {
      const map = {};
      const roots = [];
      members.forEach(m => { map[m.id] = {...m, children: []}; });
      members.forEach(m => {
        if (m.reports_to_id && map[m.reports_to_id]) {
          map[m.reports_to_id].children.push(map[m.id]);
        } else {
          roots.push(map[m.id]);
        }
      });
      return roots;
    }
    
    function generateTreeHTML(nodes) {
      if (!nodes || nodes.length === 0) return '';
      let html = '<ul>';
      nodes.forEach(node => {
        html += `
          <li>
            <div class="tree-node" style="background:#f8fafc; border:1px solid #e2e8f0; border-top:4px solid var(--primary); padding:1rem; border-radius:8px; display:inline-block; text-align:center; min-width:150px; margin: 10px;">
              ${node.member_photo_url ? `<img src="${node.member_photo_url}" style="width:60px; height:60px; border-radius:50%; margin-bottom:10px; object-fit:cover;">` : `<div style="width:60px; height:60px; border-radius:50%; background:#e2e8f0; display:flex; align-items:center; justify-content:center; margin:0 auto 10px; font-size:1.5rem;">👤</div>`}
              <div style="font-weight:700; color:var(--primary);">${node.member_name}</div>
              <div style="font-size:0.85rem; color:#64748b;">${node.member_role}</div>
            </div>
            ${generateTreeHTML(node.children)}
          </li>
        `;
      });
      html += '</ul>';
      return html;
    }

    // Photo preview
    document.getElementById('teamMemberImage')?.addEventListener('change', function(e) {
      if(e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = function(ev) {
          const preview = document.getElementById('imagePreview');
          preview.src = ev.target.result;
          preview.style.display = 'block';
        }
        reader.readAsDataURL(e.target.files[0]);
      }
    });

    // Initialize team data when switching to that tab
    const originalSwitchAboutTab = window.switchAboutTab || function(e, tabId) {
        document.querySelectorAll('.about-tab-content').forEach(t => t.style.display = 'none');
        document.querySelectorAll('.tab-btn-about').forEach(t => t.classList.remove('active'));
        document.getElementById('about-' + tabId).style.display = 'block';
        e.target.classList.add('active');
    };
    window.switchAboutTab = function(e, tabId) {
      originalSwitchAboutTab(e, tabId);
      
      if(tabId === 'legacy') {
        if (typeof loadLegacyStoryForAdmin === 'function') {
          loadLegacyStoryForAdmin();
        }
      } else if(tabId === 'admin-team') {
        loadAdminTeamTable();
      } else if (tabId === 'vision-mission') {
        if (typeof loadVisionMissionForAdmin === 'function') {
          loadVisionMissionForAdmin();
        }
      } else if (tabId === 'alumni') {
        if (typeof loadAlumniForAdmin === 'function') {
          loadAlumniForAdmin();
        }
      } else if (tabId === 'blogs') {
        if (typeof loadBlogsForAdmin === 'function') {
          loadBlogsForAdmin();
        }
      }
    };

    function openAdminProofModal(filename) {
      const modal = document.getElementById('admin-proof-modal');
      const imgContainer = document.getElementById('admin-proof-image-container');
      const textContainer = document.getElementById('admin-proof-text-container');
      const imgEl = document.getElementById('admin-proof-image');
      const textEl = document.getElementById('admin-proof-filename');

      if (filename && (filename.startsWith('http') || filename.startsWith('data:image'))) {
        imgEl.src = filename;
        imgContainer.style.display = 'flex';
        textContainer.style.display = 'none';
      } else {
        textEl.textContent = filename || 'No proof provided';
        imgContainer.style.display = 'none';
        textContainer.style.display = 'flex';
      }
      modal.classList.add('active');
    }

    function closeAdminProofModal() {
      const modal = document.getElementById('admin-proof-modal');
      modal.classList.remove('active');
    }

    function closeApplicationModal() {
      const modal = document.getElementById('application-details-modal');
      modal.style.opacity = '0';
      modal.querySelector('.custom-modal-content').style.transform = 'translateY(20px)';
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
    }

    // ==================== EDIT FUNCTIONS ====================
    let editingStudentId = null;
    let editingTeacherCredId = null;
    let editingTeacherCode = null;

    function editStudentAccount(id, name, roll, username, email, className) {
      editingStudentId = id;
      document.getElementById('std-name').value = name;
      document.getElementById('std-roll').value = roll;
      document.getElementById('std-username').value = username;
      document.getElementById('std-email').value = email || '';
      document.getElementById('std-password').value = '';
      document.getElementById('std-password').removeAttribute('required');
      document.getElementById('std-password-confirm').value = '';
      document.getElementById('std-password-confirm').removeAttribute('required');
      
      const classSelect = document.getElementById('std-class');
      for (let i = 0; i < classSelect.options.length; i++) {
        if (classSelect.options[i].text === className || classSelect.options[i].value === className) {
          classSelect.selectedIndex = i;
          break;
        }
      }
      
      const submitBtn = document.querySelector('#student-enrollment-form button[type="submit"]');
      if(submitBtn) {
        submitBtn.innerHTML = '✏️ Update Student Account';
      }
      document.getElementById('student-enrollment-form').scrollIntoView({ behavior: 'smooth' });
    }

    function editTeacherAccount(credId, code, name, email) {
      editingTeacherCredId = credId;
      editingTeacherCode = code;
      
      document.getElementById('tch-name').value = name;
      document.getElementById('tch-code').value = code;
      document.getElementById('tch-email').value = email || '';
      document.getElementById('tch-password').value = '';
      document.getElementById('tch-password').removeAttribute('required');
      document.getElementById('tch-password-confirm').value = '';
      document.getElementById('tch-password-confirm').removeAttribute('required');
      
      const submitBtn = document.querySelector('#teacher-enrollment-form button[type="submit"]');
      if(submitBtn) {
        submitBtn.innerHTML = '✏️ Update Faculty Member';
      }
      document.getElementById('teacher-enrollment-form').scrollIntoView({ behavior: 'smooth' });
    }

    function editTeacherWithoutCred(code, name, subject) {
      editingTeacherCredId = null;
      editingTeacherCode = code;
      
      document.getElementById('tch-name').value = name;
      document.getElementById('tch-code').value = code;
      document.getElementById('tch-email').value = '';
      document.getElementById('tch-password').value = '';
      document.getElementById('tch-password').setAttribute('required', 'required');
      document.getElementById('tch-password-confirm').value = '';
      document.getElementById('tch-password-confirm').setAttribute('required', 'required');
      
      const submitBtn = document.querySelector('#teacher-enrollment-form button[type="submit"]');
      if(submitBtn) {
        submitBtn.innerHTML = '✏️ Update Faculty Member';
      }
      document.getElementById('teacher-enrollment-form').scrollIntoView({ behavior: 'smooth' });
    }

    // Override the submit behavior for student enrollment
    const originalEnrollStudent = window.enrollStudentWithCredentials;
    window.enrollStudentWithCredentials = async function(e) {
      if (editingStudentId) {
        e.preventDefault();
        alert('Student account updated! (Local preview only)');
        
        // Reset form
        editingStudentId = null;
        document.getElementById('student-enrollment-form').reset();
        document.getElementById('std-password').setAttribute('required', 'required');
        document.getElementById('std-password-confirm').setAttribute('required', 'required');
        const submitBtn = document.querySelector('#student-enrollment-form button[type="submit"]');
        if(submitBtn) submitBtn.innerHTML = 'Create Student Account';
        
        loadStudentAccounts();
        return false;
      } else {
        if (originalEnrollStudent) return originalEnrollStudent(e);
      }
    };

    // Override the submit behavior for teacher enrollment
    const originalEnrollTeacher = window.enrollTeacher;
    window.enrollTeacher = async function(e) {
      if (editingTeacherCode) {
        e.preventDefault();
        
        // Update local storage for teacher
        let teachers = [];
        try { teachers = JSON.parse(localStorage.getItem('teachers_registry') || '[]'); } catch(e){}
        const tIndex = teachers.findIndex(t => t.code === editingTeacherCode);
        if (tIndex >= 0) {
          teachers[tIndex].name = document.getElementById('tch-name').value;
          teachers[tIndex].code = document.getElementById('tch-code').value;
          localStorage.setItem('teachers_registry', JSON.stringify(teachers));
        }
        
        alert('Faculty member updated! (Local preview only)');
        
        // Reset form
        editingTeacherCode = null;
        editingTeacherCredId = null;
        document.getElementById('teacher-enrollment-form').reset();
        document.getElementById('tch-password').setAttribute('required', 'required');
        document.getElementById('tch-password-confirm').setAttribute('required', 'required');
        const submitBtn = document.querySelector('#teacher-enrollment-form button[type="submit"]');
        if(submitBtn) submitBtn.innerHTML = '✓ Register Faculty';
        
        loadTeacherAccounts();
        return false;
      } else {
        if (originalEnrollTeacher) return originalEnrollTeacher(e);
      }
    };
    // ==========================================
    // ACADEMIC CATEGORIES CONTROLLER
    // ==========================================
    async function loadAcademicCategories() {
      const tbody = document.getElementById('admin-categories-tbody');
      if (!tbody) return;
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Loading...</td></tr>';
      
      try {
        let result;
        if (typeof getAcademicCategories === 'function') {
          result = await getAcademicCategories(false); // get all, not just active
        } else {
          result = { success: true, data: [] }; // fallback
        }
        
        if (result.success) {
          const categories = result.data || [];
          if (categories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No categories found</td></tr>';
          } else {
            tbody.innerHTML = categories.map(cat => `
              <tr>
                <td><strong>${cat.category_type}</strong></td>
                <td>${cat.category_name}</td>
                <td>
                  <span style="padding:0.3rem 0.6rem; border-radius:12px; font-size:0.8rem; background:${cat.is_active ? '#dcfce7' : '#fee2e2'}; color:${cat.is_active ? '#166534' : '#991b1b'};">
                    ${cat.is_active ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td>
                  <button onclick="editCategory(${cat.id}, '${cat.category_type}', '${cat.category_name}', ${cat.is_active})" style="padding:0.3rem 0.6rem; margin:0.2rem; background:#4f46e5; color:white; border:none; border-radius:6px; cursor:pointer; font-size:0.8rem;">Edit</button>
                  <button onclick="deleteCategory(${cat.id})" style="padding:0.3rem 0.6rem; margin:0.2rem; background:#dc2626; color:white; border:none; border-radius:6px; cursor:pointer; font-size:0.8rem;">Delete</button>
                </td>
              </tr>
            `).join('');
          }
        }
      } catch (e) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:red;">Failed to load</td></tr>';
      }
    }

    async function saveAcademicCategory(event) {
      event.preventDefault();
      const catType = document.getElementById('cat-type').value;
      const catName = document.getElementById('cat-name').value.trim();
      const isActive = document.getElementById('cat-active').checked;

      const btn = event.target.querySelector('button[type="submit"]');
      const catId = btn.dataset.catId;

      try {
        let result;
        if (catId) {
          result = await updateAcademicCategory(catId, {
            category_type: catType, category_name: catName, is_active: isActive
          });
        } else {
          result = await addAcademicCategory({
            category_type: catType, category_name: catName, is_active: isActive
          });
        }

        if (result.success) {
          alert('Category saved successfully!');
          document.getElementById('category-form').reset();
          btn.textContent = 'Save Category';
          delete btn.dataset.catId;
          document.getElementById('category-form-title').textContent = 'Add New Category';
          loadAcademicCategories();
        } else {
          alert('Error: ' + result.error);
        }
      } catch(e) {
        alert('Error saving category: ' + e.message);
      }
    }

    function editCategory(id, type, name, isActive) {
      document.getElementById('cat-type').value = type;
      document.getElementById('cat-name').value = name;
      document.getElementById('cat-active').checked = isActive;
      
      const btn = document.getElementById('category-form').querySelector('button[type="submit"]');
      btn.textContent = 'Update Category';
      btn.dataset.catId = id;
      document.getElementById('category-form-title').textContent = 'Edit Category';
    }

    async function deleteCategory(id) {
      if (!confirm('Are you sure you want to delete this category?')) return;
      try {
        const result = await deleteAcademicCategory(id);
        if (result.success) {
          loadAcademicCategories();
        } else {
          alert('Error deleting category: ' + result.error);
        }
      } catch(e) {
        alert('Error: ' + e.message);
      }
    }

    // ==========================================
    // STUDENT REMARKS CONTROLLER
    // ==========================================
    async function loadStudentRemarks() {
      const tbody = document.getElementById('admin-remarks-tbody');
      if (!tbody) return;
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading...</td></tr>';

      try {
        let result;
        if (typeof getStudentRemarks === 'function') {
          result = await getStudentRemarks(); // all remarks
        } else {
          result = { success: true, data: [] };
        }

        if (result.success) {
          const remarks = result.data || [];
          if (remarks.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No remarks found</td></tr>';
          } else {
            const typeColors = {
              'Positive': { bg: '#dcfce7', color: '#166534' },
              'Neutral':  { bg: '#e0e7ff', color: '#3730a3' },
              'Warning':  { bg: '#fee2e2', color: '#991b1b' }
            };
            tbody.innerHTML = remarks.map(r => {
              const tc = typeColors[r.remark_type] || typeColors['Neutral'];
              return `
              <tr>
                <td><strong>${r.student_roll}</strong></td>
                <td>
                  <span style="padding:0.3rem 0.6rem; border-radius:12px; font-size:0.8rem; background:${tc.bg}; color:${tc.color};">
                    ${r.remark_type}
                  </span>
                </td>
                <td style="max-width:250px; white-space:normal;">${r.remark_text}</td>
                <td>${r.given_by || '-'}<br><small>${r.given_date || ''}</small></td>
                <td>
                  <button onclick="deleteRemarkEntry(${r.id})" style="padding:0.3rem 0.6rem; background:#dc2626; color:white; border:none; border-radius:6px; cursor:pointer; font-size:0.8rem;">Delete</button>
                </td>
              </tr>`;
            }).join('');
          }
        }
      } catch (e) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Failed to load</td></tr>';
      }
    }

    async function saveStudentRemarkForm(event) {
      event.preventDefault();
      const roll = parseInt(document.getElementById('rmk-roll').value);
      const remarkType = document.getElementById('rmk-type').value;
      const remarkText = document.getElementById('rmk-text').value.trim();
      const givenBy = document.getElementById('rmk-given-by').value.trim();
      const givenDate = document.getElementById('rmk-date').value;
      const isActive = document.getElementById('rmk-active').checked;

      if (!roll || !remarkText) return;

      try {
        const result = await addStudentRemark({
          student_roll: roll,
          remark_text: remarkText,
          remark_type: remarkType,
          given_by: givenBy,
          given_date: givenDate,
          is_active: isActive
        });

        if (result.success) {
          alert('Remark saved successfully!');
          document.getElementById('remark-form').reset();
          document.getElementById('rmk-active').checked = true;
          loadStudentRemarks();
        } else {
          alert('Error: ' + result.error);
        }
      } catch(e) {
        alert('Error saving remark: ' + e.message);
      }
    }

    async function deleteRemarkEntry(id) {
      if (!confirm('Delete this remark?')) return;
      try {
        const result = await deleteStudentRemark(id);
        if (result.success) {
          loadStudentRemarks();
        } else {
          alert('Error: ' + result.error);
        }
      } catch(e) {
        alert('Error: ' + e.message);
      }
    }

    // ==========================================
    // STUDENT CERTIFICATES CONTROLLER
    // ==========================================
    function fetchStudentNameForCert() {
      const rollInput = document.getElementById('cert-roll').value;
      const nameInput = document.getElementById('cert-name');
      if (!rollInput) { nameInput.value = ''; return; }
      
      try {
        const students = JSON.parse(localStorage.getItem('students_registry')) || [];
        const student = students.find(s => parseInt(s.roll) === parseInt(rollInput));
        if (student) {
          nameInput.value = student.name;
        } else {
          nameInput.value = '';
          alert('Student not found with this Roll No.');
        }
      } catch(e) { console.error(e); }
    }

    async function loadStudentCertificates() {
      const tbody = document.getElementById('admin-certs-tbody');
      if (!tbody) return;
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading...</td></tr>';

      try {
        let result = await getStudentCertificates();
        if (result.success) {
          window._allCertificates = result.data || [];
          renderCertificatesTable(window._allCertificates);
        } else {
          tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Failed to load</td></tr>';
        }
      } catch (e) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Failed to load</td></tr>';
      }
    }

    function renderCertificatesTable(certs) {
      const tbody = document.getElementById('admin-certs-tbody');
      if (!tbody) return;
      if (certs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No certificates found</td></tr>';
        return;
      }
      tbody.innerHTML = certs.map(c => `
        <tr>
          <td><strong>Roll: ${c.student_roll}</strong><br><small>${c.student_name}</small></td>
          <td>${c.certificate_type}</td>
          <td>${c.issue_date || '-'}<br><span class="status-badge ${c.status === 'Issued' ? 'approved' : 'pending'}">${c.status}</span></td>
          <td>
            ${c.file_url ? `<a href="${c.file_url}" target="_blank" style="color:var(--primary); text-decoration:underline;">View Document</a>` : '-'}
          </td>
          <td>
            <button onclick="deleteCertificateEntry(${c.id})" style="padding:0.3rem 0.6rem; background:#dc2626; color:white; border:none; border-radius:6px; cursor:pointer; font-size:0.8rem;">Delete</button>
          </td>
        </tr>
      `).join('');
    }

    function filterCertificates() {
      const q = document.getElementById('cert-search').value.toLowerCase();
      if (!window._allCertificates) return;
      const filtered = window._allCertificates.filter(c => 
        (c.student_name && c.student_name.toLowerCase().includes(q)) || 
        (c.student_roll && c.student_roll.toString().includes(q))
      );
      renderCertificatesTable(filtered);
    }

    async function saveStudentCertificateForm(event) {
      event.preventDefault();
      const roll = document.getElementById('cert-roll').value;
      const name = document.getElementById('cert-name').value;
      const type = document.getElementById('cert-type').value;
      const date = document.getElementById('cert-date').value;
      const status = document.getElementById('cert-status').value;
      const fileInput = document.getElementById('cert-file');

      if (!roll || !name) {
        alert('Valid student roll and name are required.');
        return;
      }

      const btn = document.getElementById('cert-save-btn');
      btn.innerText = 'Uploading...';
      btn.disabled = true;

      try {
        let fileUrl = null;
        if (fileInput.files && fileInput.files[0]) {
          // Use Supabase Media Upload
          if (typeof window.uploadMedia === 'function') {
            fileUrl = await window.uploadMedia(fileInput.files[0], 'certificates');
          } else {
            alert('Upload function not found. Save aborted.');
            btn.innerText = 'Upload Certificate';
            btn.disabled = false;
            return;
          }
        }

        const result = await addStudentCertificate({
          student_roll: roll,
          student_name: name,
          certificate_type: type,
          issue_date: date,
          status: status,
          file_url: fileUrl
        });

        if (result.success) {
          alert('Certificate saved successfully!');
          document.getElementById('cert-form').reset();
          loadStudentCertificates();
        } else {
          alert('Error: ' + result.error);
        }
      } catch(e) {
        alert('Error: ' + e.message);
      } finally {
        btn.innerText = 'Upload Certificate';
        btn.disabled = false;
      }
    }

    async function deleteCertificateEntry(id) {
      if (!confirm('Delete this certificate?')) return;
      try {
        const result = await deleteStudentCertificate(id);
        if (result.success) {
          loadStudentCertificates();
        } else {
          alert('Error: ' + result.error);
        }
      } catch(e) {
        alert('Error: ' + e.message);
      }
    }

    // ==========================================
    // DYNAMIC REPORTS CONTROLLER
    // ==========================================
    async function loadDynamicReports() {
      const tbody = document.getElementById('admin-reports-tbody');
      if (!tbody) return;
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading...</td></tr>';

      try {
        let result = await getDynamicReports();
        if (result.success) {
          window._allReports = result.data || [];
          renderReportsTable(window._allReports);
        } else {
          tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Failed to load</td></tr>';
        }
      } catch (e) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Failed to load</td></tr>';
      }
    }

    function renderReportsTable(reports) {
      const tbody = document.getElementById('admin-reports-tbody');
      if (!tbody) return;
      if (reports.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No reports found</td></tr>';
        return;
      }
      tbody.innerHTML = reports.map(r => `
        <tr>
          <td><strong>${r.report_title}</strong></td>
          <td>${r.module_area}</td>
          <td>${r.generated_date || '-'}<br><span class="status-badge ${r.status === 'Finalized' ? 'approved' : 'pending'}">${r.status}</span></td>
          <td>
            ${r.file_url ? `<a href="${r.file_url}" target="_blank" style="color:var(--primary); text-decoration:underline;">View Document</a>` : '-'}
          </td>
          <td>
            <button onclick="deleteReportEntry(${r.id})" style="padding:0.3rem 0.6rem; background:#dc2626; color:white; border:none; border-radius:6px; cursor:pointer; font-size:0.8rem;">Delete</button>
          </td>
        </tr>
      `).join('');
    }

    function filterReports() {
      const q = document.getElementById('rep-search').value.toLowerCase();
      if (!window._allReports) return;
      const filtered = window._allReports.filter(r => 
        (r.report_title && r.report_title.toLowerCase().includes(q)) || 
        (r.module_area && r.module_area.toLowerCase().includes(q))
      );
      renderReportsTable(filtered);
    }

    async function saveDynamicReportForm(event) {
      event.preventDefault();
      const title = document.getElementById('rep-title').value;
      const area = document.getElementById('rep-area').value;
      const date = document.getElementById('rep-date').value;
      const status = document.getElementById('rep-status').value;
      const fileInput = document.getElementById('rep-file');

      if (!title) return;

      const btn = document.getElementById('rep-save-btn');
      btn.innerText = 'Uploading...';
      btn.disabled = true;

      try {
        let fileUrl = null;
        if (fileInput.files && fileInput.files[0]) {
          // Use Supabase Media Upload
          if (typeof window.uploadMedia === 'function') {
            fileUrl = await window.uploadMedia(fileInput.files[0], 'reports');
          } else {
            alert('Upload function not found. Save aborted.');
            btn.innerText = 'Save Report';
            btn.disabled = false;
            return;
          }
        }

        const result = await addDynamicReport({
          report_title: title,
          module_area: area,
          generated_date: date,
          status: status,
          file_url: fileUrl
        });

        if (result.success) {
          alert('Report saved successfully!');
          document.getElementById('report-form').reset();
          loadDynamicReports();
        } else {
          alert('Error: ' + result.error);
        }
      } catch(e) {
        alert('Error: ' + e.message);
      } finally {
        btn.innerText = 'Save Report';
        btn.disabled = false;
      }
    }

    async function deleteReportEntry(id) {
      if (!confirm('Delete this report?')) return;
      try {
        const result = await deleteDynamicReport(id);
        if (result.success) {
          loadDynamicReports();
        } else {
          alert('Error: ' + result.error);
        }
      } catch(e) {
        alert('Error: ' + e.message);
      }
    }

    // Combined switchPage hook for categories, remarks, certs, reports
    const originalSwitchPageForCategories = window.switchPage;
    window.switchPage = function(pageId, navLinkElement) {
      if (originalSwitchPageForCategories) originalSwitchPageForCategories(pageId, navLinkElement);
      if (pageId === 'categories') {
        loadAcademicCategories();
      }
      if (pageId === 'Academic_StudentRemarks') {
        loadStudentRemarks();
      }
      if (pageId === 'Academic_TCCC') {
        loadStudentCertificates();
      }
      if (pageId === 'Academic_Report') {
        loadDynamicReports();
      }
    };