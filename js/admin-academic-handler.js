// admin-academic-handler.js
// Handles Academic Divisions (CRUD) and Lesson Plans (Admin View Only)

document.addEventListener('DOMContentLoaded', () => {
  // We can initialize when these pages become active, or just load data initially.
  // We will hook into the switchPage method if possible, or just load it now.
  
  const originalSwitchPage = window.switchPage;
  window.switchPage = function(pageId, element) {
    if (originalSwitchPage) originalSwitchPage(pageId, element);
    
    if (pageId === 'divisions') {
      loadAdminDivisions();
    } else if (pageId === 'lesson-plan') {
      loadAdminLessonPlans();
      populateLessonPlanClassFilter();
    }
  };

  // Initial load if starting on these pages
  const activePage = document.querySelector('.page-view.active');
  if (activePage && activePage.id === 'page-divisions') loadAdminDivisions();
  if (activePage && activePage.id === 'page-lesson-plan') {
    loadAdminLessonPlans();
    populateLessonPlanClassFilter();
  }
});

// ==========================================
// ACADEMIC DIVISIONS (ADMIN CRUD)
// ==========================================
let divisionsData = [];

async function loadAdminDivisions() {
  const tbody = document.getElementById('divisions-tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading...</td></tr>';
  
  if (!window.getAcademicDivisions) {
    console.error("getAcademicDivisions not found. Make sure supabase-client.js is loaded.");
    return;
  }
  
  const res = await window.getAcademicDivisions(false); // get all including inactive
  if (!res.success) {
    tbody.innerHTML = `<tr><td colspan="5" style="color:var(--danger); text-align:center;">Error: ${res.error}</td></tr>`;
    return;
  }
  
  divisionsData = res.data;
  renderDivisionsTable();
}

function renderDivisionsTable() {
  const tbody = document.getElementById('divisions-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  if (divisionsData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No divisions found.</td></tr>';
    return;
  }
  
  divisionsData.forEach(div => {
    const statusBadge = div.is_active 
      ? '<span class="status-badge approved">Active</span>' 
      : '<span class="status-badge pending">Inactive</span>';
      
    tbody.innerHTML += `
      <tr>
        <td><strong>${div.division_name}</strong></td>
        <td>${div.division_type}</td>
        <td>${div.assigned_classes || '-'}</td>
        <td>${statusBadge}</td>
        <td>
          <button class="submit-btn" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="editDivision(${div.id})">Edit</button>
          <button class="submit-btn" style="padding:0.3rem 0.6rem; font-size:0.8rem; background:var(--danger);" onclick="deleteDivision(${div.id})">Delete</button>
        </td>
      </tr>
    `;
  });
}

async function handleDivisionSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('division-id').value;
  const data = {
    division_name: document.getElementById('division-name').value,
    division_type: document.getElementById('division-type').value,
    description: document.getElementById('division-desc').value,
    assigned_classes: document.getElementById('division-classes').value,
    is_active: true
  };
  
  let res;
  if (id) {
    res = await window.updateAcademicDivision(id, data);
  } else {
    res = await window.addAcademicDivision(data);
  }
  
  if (res.success) {
    alert(id ? 'Division updated successfully!' : 'Division created successfully!');
    resetDivisionForm();
    loadAdminDivisions();
  } else {
    alert('Error: ' + res.error);
  }
}

function editDivision(id) {
  const div = divisionsData.find(d => d.id === id);
  if (!div) return;
  document.getElementById('division-id').value = div.id;
  document.getElementById('division-name').value = div.division_name;
  document.getElementById('division-type').value = div.division_type;
  document.getElementById('division-desc').value = div.description || '';
  document.getElementById('division-classes').value = div.assigned_classes || '';
  document.getElementById('division-name').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function deleteDivision(id) {
  if (!confirm("Are you sure you want to delete this division?")) return;
  const res = await window.deleteAcademicDivision(id);
  if (res.success) {
    loadAdminDivisions();
  } else {
    alert("Error deleting division: " + res.error);
  }
}

function resetDivisionForm() {
  document.getElementById('division-id').value = '';
  document.getElementById('division-name').value = '';
  document.getElementById('division-type').value = 'Section';
  document.getElementById('division-desc').value = '';
  document.getElementById('division-classes').value = '';
}

window.handleDivisionSubmit = handleDivisionSubmit;
window.resetDivisionForm = resetDivisionForm;
window.editDivision = editDivision;
window.deleteDivision = deleteDivision;
window.loadAdminDivisions = loadAdminDivisions;

// ==========================================
// LESSON PLANS (ADMIN VIEW ONLY)
// ==========================================
let lessonPlansAdminData = [];

async function loadAdminLessonPlans() {
  const tbody = document.getElementById('lesson-plan-admin-tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading...</td></tr>';
  
  if (!window.getLessonPlans) return;
  
  const classFilter = document.getElementById('lesson-plan-filter-class');
  const filters = {};
  if (classFilter && classFilter.value) filters.class_name = classFilter.value;
  
  const res = await window.getLessonPlans(filters);
  if (!res.success) {
    tbody.innerHTML = `<tr><td colspan="6" style="color:var(--danger); text-align:center;">Error: ${res.error}</td></tr>`;
    return;
  }
  
  lessonPlansAdminData = res.data;
  renderAdminLessonPlansTable();
}

function renderAdminLessonPlansTable() {
  const tbody = document.getElementById('lesson-plan-admin-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  if (lessonPlansAdminData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">No lesson plans submitted yet.</td></tr>';
    return;
  }
  
  lessonPlansAdminData.forEach(plan => {
    let statusClass = 'pending';
    if (plan.status === 'Completed') statusClass = 'approved';
    else if (plan.status === 'In Progress') statusClass = 'pending'; // could use a different color
    
    const statusBadge = `<span class="status-badge ${statusClass}">${plan.status}</span>`;
    
    tbody.innerHTML += `
      <tr>
        <td>${plan.planned_date || '-'}</td>
        <td><strong>${plan.teacher_name}</strong><br><small style="color:var(--text-muted);">${plan.teacher_code}</small></td>
        <td>${plan.class_name}<br><small>${plan.subject_name}</small></td>
        <td>${plan.topic}</td>
        <td>${statusBadge}</td>
        <td>
          <button class="submit-btn" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="viewLessonPlanDetails(${plan.id})">View Details</button>
        </td>
      </tr>
    `;
  });
}

function viewLessonPlanDetails(id) {
  const plan = lessonPlansAdminData.find(p => p.id === id);
  if (!plan) return;
  
  const details = `
    Teacher: ${plan.teacher_name}
    Class: ${plan.class_name} | Subject: ${plan.subject_name}
    Topic: ${plan.topic}
    Date: ${plan.planned_date}
    Status: ${plan.status}
    
    Objectives:
    ${plan.objectives || 'None provided'}
    
    Materials:
    ${plan.materials || 'None provided'}
    
    Activities:
    ${plan.activities || 'None provided'}
    
    Assessment:
    ${plan.assessment || 'None provided'}
    
    Remarks:
    ${plan.remarks || 'None provided'}
  `;
  alert(details); // Temporary native alert for viewing details. A modal would be better in the future.
}

async function populateLessonPlanClassFilter() {
  const select = document.getElementById('lesson-plan-filter-class');
  if (!select) return;
  
  // if classHandler is available, use it
  if (window.classHandler && window.classHandler.getClasses) {
    const res = await window.classHandler.getClasses();
    if (res.success) {
      const currentVal = select.value;
      select.innerHTML = '<option value="">All Classes</option>';
      res.data.forEach(c => {
         const val = `${c.grade_level} - ${c.section_name}`;
         select.innerHTML += `<option value="${val}">${val}</option>`;
      });
      select.value = currentVal;
    }
  }
}

window.loadAdminLessonPlans = loadAdminLessonPlans;
window.viewLessonPlanDetails = viewLessonPlanDetails;
