// 🎨 ENHANCED STUDENT TABLE RENDERING
// This script provides improved student account table rendering with attractive styling

let allAdminStudentsData = []; // Store fetched students for filtering

async function loadStudentAccountsEnhanced() {
  const tbody = document.getElementById('admin-students-tbody');
  if (!tbody) return;

  try {
    const result = await getStudentCredentials(false);
    if (!result.success || !result.data || result.data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center; padding: 3rem; color: #94a3b8;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">✨</div>
            <strong>No student accounts created yet</strong>
            <div style="font-size: 0.9rem; margin-top: 0.5rem;">Create your first account using the form on the left</div>
          </td>
        </tr>
      `;
      return;
    }

    allAdminStudentsData = result.data;
    
    // Populate class dropdown dynamically based on actual data
    const classSelect = document.getElementById('admin-student-search-class');
    if (classSelect) {
      const uniqueClasses = [...new Set(allAdminStudentsData.map(s => s.student_class))].filter(Boolean).sort();
      const currentVal = classSelect.value;
      classSelect.innerHTML = '<option value="">All Classes</option>' + uniqueClasses.map(c => `<option value="${c}">${c}</option>`).join('');
      classSelect.value = currentVal; // preserve selection
    }

    // Initial render
    filterAdminStudents();
  } catch(e) {
    console.error('Error loading student accounts:', e);
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding: 2rem; color: #ef4444; font-weight: 600;">
          ⚠️ Error loading student accounts. Please try again.
        </td>
      </tr>
    `;
  }
}

function filterAdminStudents() {
  const nameQuery = document.getElementById('admin-student-search-name')?.value.toLowerCase() || '';
  const classQuery = document.getElementById('admin-student-search-class')?.value || '';

  const filtered = allAdminStudentsData.filter(s => {
    const matchName = !nameQuery || (s.student_name && s.student_name.toLowerCase().includes(nameQuery));
    const matchClass = !classQuery || s.student_class === classQuery;
    return matchName && matchClass;
  });

  renderAdminStudents(filtered);
}

function renderAdminStudents(students) {
  const tbody = document.getElementById('admin-students-tbody');
  if (!tbody) return;

  if (students.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding: 2rem; color: #94a3b8;">
          <strong style="display:block; margin-bottom: 0.5rem;">No matching students found</strong>
          <span style="font-size:0.85rem;">Try adjusting your search criteria</span>
        </td>
      </tr>
    `;
    return;
  }

  // Render enhanced table rows
  tbody.innerHTML = students.map(student => `
    <tr style="transition: all 0.2s ease;">
      <!-- Roll Number -->
      <td style="padding: 0.6rem 0.5rem;">
        <span style="
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          color: white;
          padding: 0.35rem 0.6rem;
          border-radius: 20px;
          font-weight: 700;
          font-size: 0.8rem;
          white-space: nowrap;
        ">#${student.student_roll}</span>
      </td>
      
      <!-- Name -->
      <td style="padding: 0.6rem 0.5rem;">
        <strong style="color: #1e1b4b; font-size: 0.9rem; white-space: nowrap;">${student.student_name}</strong>
      </td>
      
      <!-- Username -->
      <td style="padding: 0.6rem 0.5rem;">
        <code style="
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          padding: 0.3rem 0.5rem;
          border-radius: 6px;
          border-left: 3px solid #7c3aed;
          font-weight: 600;
          color: #1e1b4b;
          font-size: 0.8rem;
          white-space: nowrap;
        ">${student.student_username}</code>
      </td>
      
      <!-- Password -->
      <td style="padding: 0.6rem 0.5rem;">
        <code style="
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          padding: 0.3rem 0.5rem;
          border-radius: 6px;
          border-left: 3px solid #f59e0b;
          font-weight: 600;
          color: #92400e;
          font-size: 0.8rem;
          white-space: nowrap;
        ">${student.student_password}</code>
      </td>
      
      <!-- Email -->
      <td style="padding: 0.6rem 0.5rem;">
        <a href="mailto:${student.student_email}" style="
          color: #0284c7;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.85rem;
        ">${student.student_email || '<span style="color: #cbd5e1;">-</span>'}</a>
      </td>
      
      <!-- Class -->
      <td style="padding: 0.6rem 0.5rem;">
        <span style="
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          color: #1e40af;
          padding: 0.3rem 0.6rem;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.8rem;
          white-space: nowrap;
        ">${student.student_class}</span>
      </td>
      
      <!-- Status -->
      <td style="padding: 0.6rem 0.5rem;">
        <span class="student-status-badge ${student.is_active ? 'active' : 'inactive'}" style="
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.8rem;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          white-space: nowrap;
          background: ${student.is_active ? 'linear-gradient(135deg, #dcfce7 0%, #c7f0d8 100%)' : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'};
          color: ${student.is_active ? '#15803d' : '#991b1b'};
          box-shadow: 0 4px 12px ${student.is_active ? 'rgba(22, 163, 74, 0.15)' : 'rgba(220, 38, 38, 0.15)'};
        ">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: currentColor;"></span>
          ${student.is_active ? '✓ Active' : '✗ Inactive'}
        </span>
      </td>
      
      <!-- Actions -->
      <td style="padding: 0.6rem 0.5rem;">
        <div class="action-buttons" style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: nowrap;">
          <button onclick="toggleStudentStatus(${student.id}, ${!student.is_active})" class="action-btn edit" title="${student.is_active ? 'Disable Account' : 'Enable Account'}" style="
            padding: 0.5rem 0.8rem;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
            transition: all 0.2s ease;
            min-width: 36px;
            height: 36px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          " onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 4px 12px rgba(59, 130, 246, 0.3)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 2px 8px rgba(59, 130, 246, 0.2)';">
            ${student.is_active ? '🔒' : '🔓'}
          </button>
          
          <button onclick="alert('View details for: ' + '${student.student_name}')" class="action-btn view" title="View Details" style="
            padding: 0.5rem 0.8rem;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
            transition: all 0.2s ease;
            min-width: 36px;
            height: 36px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          " onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 4px 12px rgba(16, 185, 129, 0.3)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 2px 8px rgba(16, 185, 129, 0.2)';">
            👁️
          </button>
          
          <button onclick="if(confirm('⚠️ Delete this account? This cannot be undone.')) { deleteStudentAccount(${student.id}); }" class="action-btn delete" title="Delete Account" style="
            padding: 0.5rem 0.8rem;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
            transition: all 0.2s ease;
            min-width: 36px;
            height: 36px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          " onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 4px 12px rgba(239, 68, 68, 0.3)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 2px 8px rgba(239, 68, 68, 0.2)';">
            🗑️
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Auto-load when function is defined
if (typeof loadStudentAccounts !== 'undefined') {
  // Override the original function
  window.loadStudentAccounts = loadStudentAccountsEnhanced;
}
