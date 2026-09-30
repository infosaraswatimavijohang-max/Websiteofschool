// ============================================================================
// FILE:    exam-result-admin-handler.js
// MODULE:  Exam Results Admin
// PURPOSE: Exam Results Admin Handler - Admin interface for entering, editing, and publishing student exam results
//
// PROJECT: Shree Saraswati Secondary School — Management System
// STACK:   Vanilla JS + Supabase (PostgreSQL) + HTML/CSS
// UPDATED: 2026-06-03
// ============================================================================
// ====================================================================
// EXAM RESULTS HANDLER - Admin Portal
// ====================================================================

/**
 * Fetch all exam sessions with submission statistics
 */
async function fetchExamSessionsWithStats() {
  try {
    if (!supabaseDb) return [];
    
    const { data, error } = await supabaseDb
      .from('exam_sessions')
      .select(`
        id,
        session_name,
        terminal_number,
        academic_year,
        status,
        exam_configurations (
          id,
          subject,
          class,
          exam_type,
          full_marks,
          pass_marks,
          exam_results (
            id,
            approval_status
          )
        )
      `)
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
 * Fetch detailed exam results for a specific configuration
 */
async function fetchExamConfigResults(configId) {
  try {
    if (!supabaseDb) return [];
    
    const { data, error } = await supabaseDb
      .from('exam_results')
      .select(`
        id,
        student_roll,
        student_symbol,
        student_name,
        theory_marks,
        practical_marks,
        total_marks,
        percentage,
        grade,
        result_status,
        approval_status,
        submission_date,
        rejection_reason
      `)
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
 * Get exam configuration details
 */
async function fetchExamConfigDetails(configId) {
  try {
    if (!supabaseDb) return null;
    
    const { data, error } = await supabaseDb
      .from('exam_configurations')
      .select(`
        *,
        exam_sessions(session_name, terminal_number, academic_year)
      `)
      .eq('id', configId)
      .single();

    if (error) {
      console.error('Error fetching exam config details:', error);
      return null;
    }
    return data;
  } catch (e) {
    console.error('Exception fetching exam config details:', e);
    return null;
  }
}

/**
 * Approve all exam results for a specific configuration
 */
async function approveAllExamResults(configId, adminEmail) {
  try {
    if (!supabaseDb) {
      alert('Database connection failed');
      return false;
    }

    const { error } = await supabaseDb
      .from('exam_results')
      .update({
        approval_status: 'Approved',
        approval_by: adminEmail,
        approval_date: new Date().toISOString()
      })
      .eq('exam_config_id', configId)
      .eq('approval_status', 'Pending');

    if (error) {
      console.error('Error approving results:', error);
      alert('Failed to approve results: ' + error.message);
      return false;
    }

    return true;
  } catch (e) {
    console.error('Exception approving results:', e);
    alert('Exception: ' + e.message);
    return false;
  }
}

/**
 * Reject specific exam result
 */
async function rejectExamResult(resultId, rejectionReason, adminEmail) {
  try {
    if (!supabaseDb) {
      alert('Database connection failed');
      return false;
    }

    const { error } = await supabaseDb
      .from('exam_results')
      .update({
        approval_status: 'Rejected',
        rejection_reason: rejectionReason,
        approval_by: adminEmail,
        approval_date: new Date().toISOString()
      })
      .eq('id', resultId);

    if (error) {
      console.error('Error rejecting result:', error);
      alert('Failed to reject result: ' + error.message);
      return false;
    }

    return true;
  } catch (e) {
    console.error('Exception rejecting result:', e);
    alert('Exception: ' + e.message);
    return false;
  }
}

/**
 * Fetch class-wise exam performance report
 */
async function fetchClassWiseExamPerformance(terminalNumber) {
  try {
    if (!supabaseDb) return [];
    
    // This requires RPC call or manual calculation
    const { data: results, error } = await supabaseDb
      .from('exam_results')
      .select(`
        student_roll,
        total_marks,
        result_status,
        approval_status,
        exam_configurations (
          class,
          exam_sessions (
            terminal_number
          )
        ),
        students_registry (
          class
        )
      `)
      .eq('approval_status', 'Approved')
      .eq('exam_configurations.exam_sessions.terminal_number', terminalNumber);

    if (error) {
      console.error('Error fetching class-wise performance:', error);
      return [];
    }

    // Group and calculate statistics
    const classStats = {};
    results.forEach(result => {
      const className = result.students_registry?.class || 'Unknown';
      if (!classStats[className]) {
        classStats[className] = {
          class: className,
          total_students: 0,
          total_passed: 0,
          total_failed: 0,
          total_marks_sum: 0
        };
      }
      classStats[className].total_students++;
      classStats[className].total_marks_sum += result.total_marks || 0;
      if (result.result_status === 'Pass') {
        classStats[className].total_passed++;
      } else {
        classStats[className].total_failed++;
      }
    });

    // Calculate percentages
    return Object.values(classStats).map(stat => ({
      ...stat,
      avg_marks: (stat.total_marks_sum / stat.total_students).toFixed(2),
      pass_percentage: ((stat.total_passed / stat.total_students) * 100).toFixed(2)
    }));
  } catch (e) {
    console.error('Exception fetching class-wise performance:', e);
    return [];
  }
}

/**
 * Render exam results management view for admin
 */
async function renderAdminExamResults() {
  const container = document.getElementById('page-admin-exam-results');
  if (!container) return;

  const sessions = await fetchExamSessionsWithStats();

  let html = `
    <h2 style="font-family:'Playfair Display', serif; margin-bottom: 2rem; color: var(--primary);">📊 Terminal Exam Results Management</h2>
    
    <!-- Statistics Cards -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
      <div style="background: var(--white); padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <div style="font-size: 2rem; font-weight: 800; color: var(--accent);">0</div>
        <p style="color: var(--text-muted); font-weight: 600; margin-top: 0.5rem;">Total Exam Configs</p>
      </div>
      <div style="background: var(--white); padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <div style="font-size: 2rem; font-weight: 800; color: var(--warning);">0</div>
        <p style="color: var(--text-muted); font-weight: 600; margin-top: 0.5rem;">Pending Approvals</p>
      </div>
      <div style="background: var(--white); padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <div style="font-size: 2rem; font-weight: 800; color: var(--success);">0</div>
        <p style="color: var(--text-muted); font-weight: 600; margin-top: 0.5rem;">Approved Results</p>
      </div>
      <div style="background: var(--white); padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <div style="font-size: 2rem; font-weight: 800; color: var(--danger);">0</div>
        <p style="color: var(--text-muted); font-weight: 600; margin-top: 0.5rem;">Rejected Results</p>
      </div>
    </div>

    <!-- Exam Sessions Accordion -->
    <div class="panel">
      <div class="panel-header">
        <h3>Exam Sessions & Pending Approvals</h3>
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 1rem;">
  `;

  sessions.forEach((session, idx) => {
    const totalConfigs = session.exam_configurations?.length || 0;
    const totalResults = session.exam_configurations?.reduce((sum, config) => 
      sum + (config.exam_results?.length || 0), 0) || 0;
    const pendingCount = session.exam_configurations?.reduce((sum, config) =>
      sum + (config.exam_results?.filter(r => r.approval_status === 'Pending').length || 0), 0) || 0;
    const approvedCount = session.exam_configurations?.reduce((sum, config) =>
      sum + (config.exam_results?.filter(r => r.approval_status === 'Approved').length || 0), 0) || 0;

    html += `
      <div style="background: var(--white); border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; cursor: pointer;" onclick="toggleSessionDetails(${session.id})">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h4 style="font-size: 1rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">${session.session_name}</h4>
            <p style="font-size: 0.85rem; color: var(--text-muted);">${session.academic_year}</p>
          </div>
          <div style="display: flex; gap: 2rem; align-items: center;">
            <div style="text-align: center;">
              <div style="font-size: 1.5rem; font-weight: 800; color: var(--accent);">${totalConfigs}</div>
              <p style="font-size: 0.75rem; color: var(--text-muted);">Exam Configs</p>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 1.5rem; font-weight: 800; color: var(--warning);">${pendingCount}</div>
              <p style="font-size: 0.75rem; color: var(--text-muted);">Pending</p>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 1.5rem; font-weight: 800; color: var(--success);">${approvedCount}</div>
              <p style="font-size: 0.75rem; color: var(--text-muted);">Approved</p>
            </div>
          </div>
        </div>
      </div>

      <div id="session-details-${session.id}" style="display: none; margin-top: 1rem; padding-left: 2rem;">
        ${session.exam_configurations?.map((config, cIdx) => `
          <div style="background: #f8fafc; border-left: 4px solid var(--accent); padding: 1rem; border-radius: 6px; margin-bottom: 0.8rem; cursor: pointer;" onclick="viewExamConfigResults(${config.id}, '${config.subject}', '${config.class}')">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <p style="font-weight: 700; color: var(--primary);">${config.subject} (${config.exam_type})</p>
                <p style="font-size: 0.85rem; color: var(--text-muted);">${config.class} • Full: ${config.full_marks}, Pass: ${config.pass_marks}</p>
              </div>
              <div style="display: flex; gap: 1rem;">
                <span style="background: #fee2e2; color: var(--danger); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700;">
                  ${config.exam_results?.filter(r => r.approval_status === 'Pending').length || 0} Pending
                </span>
                <span style="background: #dcfce7; color: var(--success); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700;">
                  ${config.exam_results?.filter(r => r.approval_status === 'Approved').length || 0} Approved
                </span>
              </div>
            </div>
          </div>
        `).join('') || '<p style="color: var(--text-muted);">No exam configurations</p>'}
      </div>
    `;
  });

  html += `
      </div>
    </div>

    <!-- Detailed Results View (Hidden by default) -->
    <div id="exam-config-details" style="display: none; margin-top: 2rem;">
      <button onclick="closeExamConfigView()" style="background: #94a3b8; color: white; border: none; padding: 0.6rem 1rem; border-radius: 6px; cursor: pointer; margin-bottom: 1rem;">← Back</button>
      <div class="panel" id="config-details-panel"></div>
    </div>
  `;

  container.innerHTML = html;
}

/**
 * Toggle session details visibility
 */
function toggleSessionDetails(sessionId) {
  const detailsDiv = document.getElementById(`session-details-${sessionId}`);
  if (detailsDiv) {
    detailsDiv.style.display = detailsDiv.style.display === 'none' ? 'block' : 'none';
  }
}

/**
 * View detailed results for specific exam configuration
 */
async function viewExamConfigResults(configId, subject, className) {
  const config = await fetchExamConfigDetails(configId);
  const results = await fetchExamConfigResults(configId);

  if (!config || !results) return;

  let html = `
    <div class="panel-header">
      <h3>${config.subject} - ${config.exam_configurations?.class || className}</h3>
      <div style="font-size: 0.9rem; color: var(--text-muted);">
        ${config.exam_type} | Full Marks: ${config.full_marks} | Pass Marks: ${config.pass_marks}
      </div>
    </div>

    <div style="margin-bottom: 1.5rem;">
      <button onclick="approveAllResults(${configId})" class="submit-btn" style="background: var(--success); margin-right: 0.5rem;">✓ Approve All Pending</button>
      <button onclick="exportExamResults(${configId})" class="submit-btn" style="background: var(--accent);">⬇ Export Results</button>
    </div>

    <div class="custom-table-wrapper">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Roll #</th>
            <th>Symbol #</th>
            <th>Student Name</th>
            <th>${config.exam_type === 'Theory Only' ? 'Theory' : config.exam_type === 'Practical Only' ? 'Practical' : 'Theory + Practical'}</th>
            <th>Total Marks</th>
            <th>Percentage</th>
            <th>Grade</th>
            <th>Result</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
  `;

  results.forEach(result => {
    const marksDisplay = config.exam_type === 'Theory Only' 
      ? result.theory_marks
      : config.exam_type === 'Practical Only'
      ? result.practical_marks
      : `${result.theory_marks || 0} + ${result.practical_marks || 0}`;

    const statusColor = result.result_status === 'Pass' ? 'var(--success)' : 'var(--danger)';
    const approvalColor = result.approval_status === 'Pending' ? 'var(--warning)' 
      : result.approval_status === 'Approved' ? 'var(--success)' : 'var(--danger)';

    html += `
      <tr>
        <td>${result.student_roll}</td>
        <td>${result.student_symbol}</td>
        <td>${result.student_name}</td>
        <td>${marksDisplay}</td>
        <td>${result.total_marks}/${config.full_marks}</td>
        <td>${(result.percentage || 0).toFixed(2)}%</td>
        <td><strong>${result.grade}</strong></td>
        <td style="color: ${statusColor}; font-weight: 700;">${result.result_status}</td>
        <td><span style="background: ${approvalColor}20; color: ${approvalColor}; padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700;">${result.approval_status}</span></td>
        <td>
          ${result.approval_status === 'Pending' ? `
            <button onclick="quickApproveResult(${result.id})" style="background: var(--success); color: white; border: none; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">Approve</button>
            <button onclick="quickRejectResult(${result.id}, '${result.student_name}')" style="background: var(--danger); color: white; border: none; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.75rem; margin-left: 0.3rem;">Reject</button>
          ` : result.approval_status === 'Approved' ? '✓' : '✗'}
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('config-details-panel').innerHTML = html;
  document.getElementById('exam-config-details').style.display = 'block';
  document.getElementById('exam-config-details').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Close exam configuration details view
 */
function closeExamConfigView() {
  document.getElementById('exam-config-details').style.display = 'none';
}

/**
 * Quick approve result
 */
async function quickApproveResult(resultId) {
  const adminEmail = localStorage.getItem('admin_email') || 'Admin';
  const success = await supabaseDb
    .from('exam_results')
    .update({
      approval_status: 'Approved',
      approval_by: adminEmail,
      approval_date: new Date().toISOString()
    })
    .eq('id', resultId);

  if (success) {
    alert('Result approved successfully');
    // Refresh the view
    const button = event.target;
    const row = button.closest('tr');
    row.style.opacity = '0.6';
  }
}

/**
 * Quick reject result (with reason)
 */
async function quickRejectResult(resultId, studentName) {
  const reason = prompt(`Reject exam result for ${studentName}?\nEnter rejection reason:`);
  if (!reason) return;

  const adminEmail = localStorage.getItem('admin_email') || 'Admin';
  const success = await supabaseDb
    .from('exam_results')
    .update({
      approval_status: 'Rejected',
      rejection_reason: reason,
      approval_by: adminEmail,
      approval_date: new Date().toISOString()
    })
    .eq('id', resultId);

  if (success) {
    alert('Result rejected successfully');
    const button = event.target;
    const row = button.closest('tr');
    row.style.opacity = '0.6';
  }
}

/**
 * Approve all results for a configuration
 */
async function approveAllResults(configId) {
  if (!confirm('Approve all pending exam results for this configuration?')) return;

  const adminEmail = localStorage.getItem('admin_email') || 'Admin';
  const success = await approveAllExamResults(configId, adminEmail);
  
  if (success) {
    alert('All results approved successfully');
    // Refresh the view
    renderAdminExamResults();
  }
}

/**
 * Export exam results (CSV)
 */
function exportExamResults(configId) {
  alert('Export functionality - will generate CSV file of exam results');
  // Implementation for CSV export can be added later
}
