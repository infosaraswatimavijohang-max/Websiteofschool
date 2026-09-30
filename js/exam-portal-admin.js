// ============================================================================
// FILE:    exam-portal-admin.js
// MODULE:  Exam Admin
// PURPOSE: Exam Portal Admin - Admin-side exam management: create exams, assign marks, manage exam schedules and subject mappings
//
// PROJECT: Shree Saraswati Secondary School — Management System
// STACK:   Vanilla JS + Supabase (PostgreSQL) + HTML/CSS
// UPDATED: 2026-06-03
// ============================================================================
// ============================================================
// Dynamic Exam Portal Admin
// ============================================================

(function () {
  const state = {
    classes: [],
    students: [],
    profiles: [],
    sessions: [],
    examTypes: [],
    configs: [],
    symbols: [],
    generatedPreview: []
  };

  const $ = (id) => document.getElementById(id);
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));

  function todayNepaliLikeYear() {
    const year = new Date().getFullYear();
    return String(year + 57);
  }

  function showExamPortalMessage(message, type = 'success') {
    const box = $('exam-portal-message');
    if (!box) return;
    box.textContent = message;
    box.style.display = 'block';
    box.style.background = type === 'error' ? '#fee2e2' : '#dcfce7';
    box.style.color = type === 'error' ? '#991b1b' : '#166534';
    box.style.borderColor = type === 'error' ? '#fca5a5' : '#86efac';
    setTimeout(() => { box.style.display = 'none'; }, 4500);
  }

  async function loadExamPortalData() {
    if (!window.supabaseDb) throw new Error('Supabase is not connected.');

    const [
      studentsRes,
      profilesRes,
      sessionsRes,
      typesRes,
      configsRes,
      symbolsRes,
      subjectsRes
    ] = await Promise.all([
      supabaseDb.from('students_registry').select('*').order('class', { ascending: true }).order('roll', { ascending: true }),
      supabaseDb.from('student_profiles').select('*').then((r) => r).catch(() => ({ data: [] })),
      supabaseDb.from('exam_sessions').select('*').order('academic_year', { ascending: false }).order('terminal_number', { ascending: true }),
      supabaseDb.from('exam_types').select('*').order('display_order', { ascending: true }).then((r) => r).catch(() => ({ data: [] })),
      supabaseDb.from('exam_configurations').select('*').order('created_at', { ascending: false }).then((r) => r).catch(() => ({ data: [] })),
      supabaseDb.from('exam_symbol_numbers').select('*').order('created_at', { ascending: false }).then((r) => r).catch(() => ({ data: [] })),
      supabaseDb.from('subjects').select('*').order('subject_name', { ascending: true }).then((r) => r).catch(() => ({ data: [] }))
    ]);

    if (studentsRes.error) throw studentsRes.error;
    if (sessionsRes.error) throw sessionsRes.error;

    state.students = studentsRes.data || [];
    state.profiles = profilesRes.data || [];
    state.sessions = sessionsRes.data || [];
    state.examTypes = typesRes.data || [];
    state.configs = configsRes.data || [];
    state.symbols = symbolsRes.data || [];
    state.subjects = subjectsRes.data || [];
    state.classes = [...new Set(state.students.map((s) => s.class).filter(Boolean))].sort();
  }

  function classOptions(selected = '') {
    return `<option value="">Select class</option>${state.classes.map((cls) =>
      `<option value="${esc(cls)}" ${cls === selected ? 'selected' : ''}>${esc(cls)}</option>`
    ).join('')}`;
  }

  function sessionOptions(selected = '') {
    return `<option value="">Select exam session</option>${state.sessions.map((session) =>
      `<option value="${session.id}" ${String(session.id) === String(selected) ? 'selected' : ''}>${esc(session.session_name)} (${esc(session.academic_year)})</option>`
    ).join('')}`;
  }

  function examTypeOptions(selected = '') {
    const defaults = ['First Term', 'Mid Term', 'Final Term', 'Class Test', 'CAS'];
    const names = state.examTypes.length ? state.examTypes.map((t) => t.type_name) : defaults;
    return `<option value="">Select exam type</option>${names.map((name) =>
      `<option value="${esc(name)}" ${name === selected ? 'selected' : ''}>${esc(name)}</option>`
    ).join('')}`;
  }

  function subjectOptions(selected = '') {
    if (!state.subjects || state.subjects.length === 0) return '<option value="">No subjects found</option>';
    return `<option value="">Select subject</option>${state.subjects.map((sub) =>
      `<option value="${esc(sub.subject_name)}" ${sub.subject_name === selected ? 'selected' : ''}>${esc(sub.subject_name)}</option>`
    ).join('')}`;
  }

  function getProfileByRoll(roll) {
    return state.profiles.find((p) => String(p.student_roll) === String(roll)) || {};
  }

  function getStudentDob(student) {
    const profile = getProfileByRoll(student.roll);
    return profile.dob || student.dob || student.date_of_birth || '';
  }

  function renderExamPortal() {
    const root = $('dynamic-exam-portal-root');
    if (!root) return;

    root.innerHTML = `
      <div id="exam-portal-message" style="display:none; padding:0.9rem 1rem; border:1px solid; border-radius:8px; margin-bottom:1rem; font-weight:700;"></div>

      <div style="display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap:1rem; margin-bottom:1.5rem;">
        <div class="panel"><strong style="font-size:1.8rem;color:var(--accent);">${state.sessions.length}</strong><span style="color:var(--text-muted);">Exam Sessions</span></div>
        <div class="panel"><strong style="font-size:1.8rem;color:var(--primary);">${state.examTypes.length}</strong><span style="color:var(--text-muted);">Exam Types</span></div>
        <div class="panel"><strong style="font-size:1.8rem;color:var(--success);">${state.configs.length}</strong><span style="color:var(--text-muted);">Mark Setups</span></div>
        <div class="panel"><strong style="font-size:1.8rem;color:#0ea5e9;">${state.symbols.length}</strong><span style="color:var(--text-muted);">Symbols Generated</span></div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.5rem; align-items:start;">
        <div class="panel">
          <div class="panel-header"><h3>Exam Type Setup</h3></div>
          <form onsubmit="saveExamTypeAdmin(event)">
            <input type="hidden" id="exam-type-id">
            <div class="form-group"><label>Exam Type Name</label><input id="exam-type-name" class="form-control" placeholder="Final Term" required></div>
            <div class="form-group"><label>Short Code</label><input id="exam-type-code" class="form-control" placeholder="FN"></div>
            <div class="form-group"><label>Description</label><input id="exam-type-desc" class="form-control" placeholder="Final examination"></div>
            <div class="form-group"><label>Order</label><input id="exam-type-order" type="number" class="form-control" value="0"></div>
            <button class="submit-btn" type="submit">Save Exam Type</button>
            <button class="submit-btn" type="button" onclick="resetExamTypeForm()" style="background:#94a3b8; margin-top:0.6rem;">Clear</button>
          </form>
        </div>

        <div class="panel">
          <div class="panel-header"><h3>Exam Session</h3></div>
          <form onsubmit="saveExamSessionAdmin(event)">
            <input type="hidden" id="exam-session-id">
            <div class="form-group"><label>Session Name</label><input id="exam-session-name" class="form-control" placeholder="Final Term Examination" required></div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
              <div class="form-group"><label>Terminal No.</label><input id="exam-session-terminal" type="number" class="form-control" value="1" required></div>
              <div class="form-group"><label>Academic Year</label><input id="exam-session-year" class="form-control" value="${todayNepaliLikeYear()}" required></div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
              <div class="form-group"><label>Start Date</label><input id="exam-session-start" type="date" class="form-control"></div>
              <div class="form-group"><label>End Date</label><input id="exam-session-end" type="date" class="form-control"></div>
            </div>
            <div class="form-group"><label>Status</label><select id="exam-session-status" class="form-control"><option>Active</option><option>Scheduled</option><option>Completed</option></select></div>
            <button class="submit-btn" type="submit">Save Session</button>
            <button class="submit-btn" type="button" onclick="resetExamSessionForm()" style="background:#94a3b8; margin-top:0.6rem;">Clear</button>
          </form>
        </div>
      </div>

      <div class="panel" style="margin-top:1.5rem;">
        <div class="panel-header"><h3>Subject Mark Setup</h3></div>
        <form onsubmit="saveMarkSetupAdmin(event)" style="display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap:1rem; align-items:end;">
          <input type="hidden" id="mark-config-id">
          <div class="form-group"><label>Session</label><select id="mark-session" class="form-control" required>${sessionOptions()}</select></div>
          <div class="form-group"><label>Class</label><select id="mark-class" class="form-control" required>${classOptions()}</select></div>
          <div class="form-group"><label>Exam Type</label><select id="mark-exam-type" class="form-control" required>${examTypeOptions()}</select></div>
          <div class="form-group"><label>Subject</label><select id="mark-subject" class="form-control" required>${subjectOptions()}</select></div>
          <div class="form-group"><label>Credit Hour</label><input id="mark-credit-hour" type="number" step="0.5" class="form-control" value="4"></div>
          <div class="form-group"><label>Theory Full</label><input id="mark-theory-full" type="number" class="form-control" value="75"></div>
          <div class="form-group"><label>Theory Pass</label><input id="mark-theory-pass" type="number" class="form-control" value="27"></div>
          <div class="form-group"><label>Practical Full</label><input id="mark-practical-full" type="number" class="form-control" value="25"></div>
          <div class="form-group"><label>Practical Pass</label><input id="mark-practical-pass" type="number" class="form-control" value="10"></div>
          <div class="form-group"><label>Total Full Marks</label><input id="mark-full" type="number" class="form-control" value="100" required></div>
          <div class="form-group"><label>Total Pass Marks</label><input id="mark-pass" type="number" class="form-control" value="35" required></div>
          <button class="submit-btn" type="submit">Save Mark Setup</button>
        </form>
      </div>

      <div class="panel" style="margin-top:1.5rem;">
        <div class="panel-header"><h3>Generate Symbol Numbers</h3></div>
        <form onsubmit="previewSymbolNumbersAdmin(event)" style="display:grid; grid-template-columns: repeat(5, minmax(0,1fr)); gap:1rem; align-items:end;">
          <div class="form-group"><label>Session</label><select id="symbol-session" class="form-control" required>${sessionOptions()}</select></div>
          <div class="form-group"><label>Class</label><select id="symbol-class" class="form-control" required>${classOptions()}</select></div>
          <div class="form-group"><label>Prefix</label><input id="symbol-prefix" class="form-control" value="SSS-${todayNepaliLikeYear()}-"></div>
          <div class="form-group"><label>Start Number</label><input id="symbol-start" type="number" class="form-control" value="1"></div>
          <div class="form-group"><label>Padding</label><input id="symbol-padding" type="number" class="form-control" value="3"></div>
          <button class="submit-btn" type="submit">Preview Symbols</button>
          <button class="submit-btn" type="button" onclick="saveGeneratedSymbolsAdmin()" style="background:var(--success);">Save Generated Symbols</button>
        </form>
        <div id="symbol-preview" style="margin-top:1rem;"></div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-top:1.5rem;">
        <div class="panel"><div class="panel-header"><h3>Exam Types</h3></div><div class="custom-table-wrapper">${renderExamTypesTable()}</div></div>
        <div class="panel"><div class="panel-header"><h3>Exam Sessions</h3></div><div class="custom-table-wrapper">${renderSessionsTable()}</div></div>
      </div>
      <div class="panel" style="margin-top:1.5rem;"><div class="panel-header"><h3>Mark Setups</h3></div><div class="custom-table-wrapper">${renderConfigsTable()}</div></div>
      <div class="panel" style="margin-top:1.5rem;"><div class="panel-header"><h3>Generated Symbol Numbers</h3></div><div class="custom-table-wrapper">${renderSymbolsTable()}</div></div>
    `;
  }

  function renderExamTypesTable() {
    if (!state.examTypes.length) return '<p style="padding:1rem;color:var(--text-muted);">No exam types yet.</p>';
    return `<table class="custom-table"><thead><tr><th>Name</th><th>Code</th><th>Order</th><th>Action</th></tr></thead><tbody>${state.examTypes.map((t) => `
      <tr><td>${esc(t.type_name)}</td><td>${esc(t.type_code || '')}</td><td>${t.display_order ?? 0}</td><td><button class="submit-btn" style="padding:.35rem .7rem;font-size:.8rem;" onclick="editExamTypeAdmin(${t.id})">Edit</button> <button class="submit-btn" style="padding:.35rem .7rem;font-size:.8rem;background:var(--danger);" onclick="deleteExamTypeAdmin(${t.id})">Delete</button></td></tr>
    `).join('')}</tbody></table>`;
  }

  function renderSessionsTable() {
    if (!state.sessions.length) return '<p style="padding:1rem;color:var(--text-muted);">No sessions yet.</p>';
    return `<table class="custom-table"><thead><tr><th>Name</th><th>Year</th><th>Status</th><th>Action</th></tr></thead><tbody>${state.sessions.map((s) => `
      <tr><td>${esc(s.session_name)}</td><td>${esc(s.academic_year)}</td><td><span class="status-badge ${s.status === 'Completed' ? 'approved' : 'pending'}">${esc(s.status)}</span></td><td><button class="submit-btn" style="padding:.35rem .7rem;font-size:.8rem;" onclick="editExamSessionAdmin(${s.id})">Edit</button> <button class="submit-btn" style="padding:.35rem .7rem;font-size:.8rem;background:var(--danger);" onclick="deleteExamSessionAdmin(${s.id})">Delete</button></td></tr>
    `).join('')}</tbody></table>`;
  }

  function renderConfigsTable() {
    if (!state.configs.length) return '<p style="padding:1rem;color:var(--text-muted);">No mark setups yet.</p>';
    return `<table class="custom-table"><thead><tr><th>Subject</th><th>Class</th><th>Exam Type</th><th>Full/Pass</th><th>Credit</th><th>Action</th></tr></thead><tbody>${state.configs.map((c) => `
      <tr><td>${esc(c.subject)}</td><td>${esc(c.class)}</td><td>${esc(c.exam_type)}</td><td>${c.full_marks}/${c.pass_marks}</td><td>${c.credit_hour || 4}</td><td><button class="submit-btn" style="padding:.35rem .7rem;font-size:.8rem;" onclick="editMarkSetupAdmin(${c.id})">Edit</button> <button class="submit-btn" style="padding:.35rem .7rem;font-size:.8rem;background:var(--danger);" onclick="deleteMarkSetupAdmin(${c.id})">Delete</button></td></tr>
    `).join('')}</tbody></table>`;
  }

  function renderSymbolsTable() {
    if (!state.symbols.length) return '<p style="padding:1rem;color:var(--text-muted);">No symbol numbers generated yet.</p>';
    return `<table class="custom-table"><thead><tr><th>Symbol</th><th>Student</th><th>Roll</th><th>Class</th><th>DOB</th><th>Session</th></tr></thead><tbody>${state.symbols.slice(0, 150).map((s) => `
      <tr><td><strong>${esc(s.symbol_number)}</strong></td><td>${esc(s.student_name)}</td><td>${s.student_roll}</td><td>${esc(s.class)}</td><td>${esc(s.date_of_birth || '-')}</td><td>${s.exam_session_id}</td></tr>
    `).join('')}</tbody></table>`;
  }

  async function refreshExamPortalAdmin() {
    try {
      await loadExamPortalData();
      renderExamPortal();
    } catch (error) {
      console.error('Exam portal load error:', error);
      const root = $('dynamic-exam-portal-root');
      if (root) root.innerHTML = `<div class="panel"><div style="padding:2rem;color:var(--danger);">Exam portal could not load: ${esc(error.message)}</div><p style="padding:0 2rem 2rem;color:var(--text-muted);">Run <code>sql/EXAM_PORTAL_DYNAMIC_SETUP.sql</code> in Supabase if this is the first setup.</p></div>`;
    }
  }

  window.saveExamTypeAdmin = async function (event) {
    event.preventDefault();
    const id = $('exam-type-id').value;
    const payload = {
      type_name: $('exam-type-name').value.trim(),
      type_code: $('exam-type-code').value.trim() || null,
      description: $('exam-type-desc').value.trim() || null,
      display_order: parseInt($('exam-type-order').value, 10) || 0,
      is_active: true,
      updated_at: new Date().toISOString()
    };
    const res = id
      ? await supabaseDb.from('exam_types').update(payload).eq('id', id)
      : await supabaseDb.from('exam_types').insert([payload]);
    if (res.error) return showExamPortalMessage(res.error.message, 'error');
    showExamPortalMessage('Exam type saved.');
    await refreshExamPortalAdmin();
  };

  window.editExamTypeAdmin = function (id) {
    const item = state.examTypes.find((t) => t.id === id);
    if (!item) return;
    $('exam-type-id').value = item.id;
    $('exam-type-name').value = item.type_name || '';
    $('exam-type-code').value = item.type_code || '';
    $('exam-type-desc').value = item.description || '';
    $('exam-type-order').value = item.display_order || 0;
    $('exam-type-name').scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  window.resetExamTypeForm = function () {
    ['exam-type-id', 'exam-type-name', 'exam-type-code', 'exam-type-desc'].forEach((id) => { if ($(id)) $(id).value = ''; });
    if ($('exam-type-order')) $('exam-type-order').value = 0;
  };

  window.deleteExamTypeAdmin = async function (id) {
    if (!confirm('Delete this exam type?')) return;
    const { error } = await supabaseDb.from('exam_types').delete().eq('id', id);
    if (error) return showExamPortalMessage(error.message, 'error');
    await refreshExamPortalAdmin();
  };

  window.saveExamSessionAdmin = async function (event) {
    event.preventDefault();
    const id = $('exam-session-id').value;
    const payload = {
      session_name: $('exam-session-name').value.trim(),
      terminal_number: parseInt($('exam-session-terminal').value, 10) || 1,
      academic_year: $('exam-session-year').value.trim(),
      start_date: $('exam-session-start').value || null,
      end_date: $('exam-session-end').value || null,
      status: $('exam-session-status').value,
      updated_at: new Date().toISOString()
    };
    const res = id ? await supabaseDb.from('exam_sessions').update(payload).eq('id', id) : await supabaseDb.from('exam_sessions').insert([payload]);
    if (res.error) return showExamPortalMessage(res.error.message, 'error');
    showExamPortalMessage('Exam session saved.');
    await refreshExamPortalAdmin();
  };

  window.editExamSessionAdmin = function (id) {
    const item = state.sessions.find((s) => s.id === id);
    if (!item) return;
    $('exam-session-id').value = item.id;
    $('exam-session-name').value = item.session_name || '';
    $('exam-session-terminal').value = item.terminal_number || 1;
    $('exam-session-year').value = item.academic_year || '';
    $('exam-session-start').value = item.start_date || '';
    $('exam-session-end').value = item.end_date || '';
    $('exam-session-status').value = item.status || 'Active';
    $('exam-session-name').scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  window.resetExamSessionForm = function () {
    ['exam-session-id', 'exam-session-name', 'exam-session-start', 'exam-session-end'].forEach((id) => { if ($(id)) $(id).value = ''; });
    $('exam-session-terminal').value = 1;
    $('exam-session-year').value = todayNepaliLikeYear();
    $('exam-session-status').value = 'Active';
  };

  window.deleteExamSessionAdmin = async function (id) {
    if (!confirm('Delete this session and related exam setup/results?')) return;
    const { error } = await supabaseDb.from('exam_sessions').delete().eq('id', id);
    if (error) return showExamPortalMessage(error.message, 'error');
    await refreshExamPortalAdmin();
  };

  window.saveMarkSetupAdmin = async function (event) {
    event.preventDefault();
    const id = $('mark-config-id').value;
    const theoryFull = parseInt($('mark-theory-full').value, 10) || 0;
    const practicalFull = parseInt($('mark-practical-full').value, 10) || 0;
    const payload = {
      exam_session_id: parseInt($('mark-session').value, 10),
      class: $('mark-class').value,
      exam_type: $('mark-exam-type').value,
      subject: $('mark-subject').value.trim(),
      credit_hour: parseFloat($('mark-credit-hour').value) || 4,
      theory_full_marks: theoryFull,
      theory_pass_marks: parseInt($('mark-theory-pass').value, 10) || 0,
      practical_full_marks: practicalFull,
      practical_pass_marks: parseInt($('mark-practical-pass').value, 10) || 0,
      full_marks: parseInt($('mark-full').value, 10) || (theoryFull + practicalFull),
      pass_marks: parseInt($('mark-pass').value, 10) || 35,
      teacher_code: localStorage.getItem('admin_email') || 'admin',
      updated_at: new Date().toISOString()
    };
    const res = id ? await supabaseDb.from('exam_configurations').update(payload).eq('id', id) : await supabaseDb.from('exam_configurations').insert([payload]);
    if (res.error) return showExamPortalMessage(res.error.message, 'error');
    showExamPortalMessage('Mark setup saved.');
    await refreshExamPortalAdmin();
  };

  window.editMarkSetupAdmin = function (id) {
    const item = state.configs.find((c) => c.id === id);
    if (!item) return;
    $('mark-config-id').value = item.id;
    $('mark-session').value = item.exam_session_id;
    $('mark-class').value = item.class;
    $('mark-exam-type').value = item.exam_type;
    $('mark-subject').value = item.subject || '';
    $('mark-credit-hour').value = item.credit_hour || 4;
    $('mark-theory-full').value = item.theory_full_marks || 0;
    $('mark-theory-pass').value = item.theory_pass_marks || 0;
    $('mark-practical-full').value = item.practical_full_marks || 0;
    $('mark-practical-pass').value = item.practical_pass_marks || 0;
    $('mark-full').value = item.full_marks || 100;
    $('mark-pass').value = item.pass_marks || 35;
    $('mark-session').scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  window.deleteMarkSetupAdmin = async function (id) {
    if (!confirm('Delete this mark setup?')) return;
    const { error } = await supabaseDb.from('exam_configurations').delete().eq('id', id);
    if (error) return showExamPortalMessage(error.message, 'error');
    await refreshExamPortalAdmin();
  };

  window.previewSymbolNumbersAdmin = async function (event) {
    event.preventDefault();
    const sessionId = parseInt($('symbol-session').value, 10);
    const className = $('symbol-class').value;
    const prefix = $('symbol-prefix').value;
    const start = parseInt($('symbol-start').value, 10) || 1;
    const padding = parseInt($('symbol-padding').value, 10) || 3;

    const students = state.students
      .filter((s) => String(s.class).trim() === String(className).trim() && String(s.status || 'Active').toLowerCase() === 'active')
      .sort((a, b) => Number(a.roll) - Number(b.roll));

    state.generatedPreview = students.map((student, index) => ({
      exam_session_id: sessionId,
      class: className,
      student_roll: student.roll,
      student_name: student.name,
      date_of_birth: getStudentDob(student) || null,
      symbol_number: `${prefix}${String(start + index).padStart(padding, '0')}`,
      generated_order: index + 1,
      generated_by: localStorage.getItem('admin_email') || 'admin',
      is_active: true,
      updated_at: new Date().toISOString()
    }));

    const preview = $('symbol-preview');
    if (!state.generatedPreview.length) {
      preview.innerHTML = '<div style="padding:1rem; color:var(--danger);">No active students found for this class.</div>';
      return;
    }

    preview.innerHTML = `<div class="custom-table-wrapper"><table class="custom-table"><thead><tr><th>Order</th><th>Roll</th><th>Name</th><th>DOB</th><th>Symbol Number</th></tr></thead><tbody>${state.generatedPreview.map((row) => `
      <tr><td>${row.generated_order}</td><td>${row.student_roll}</td><td>${esc(row.student_name)}</td><td>${esc(row.date_of_birth || 'Missing DOB')}</td><td><strong>${esc(row.symbol_number)}</strong></td></tr>
    `).join('')}</tbody></table></div>`;
  };

  window.saveGeneratedSymbolsAdmin = async function () {
    if (!state.generatedPreview.length) {
      showExamPortalMessage('Preview symbols before saving.', 'error');
      return;
    }
    const { error } = await supabaseDb
      .from('exam_symbol_numbers')
      .upsert(state.generatedPreview, { onConflict: 'exam_session_id,student_roll' });
    if (error) return showExamPortalMessage(error.message, 'error');
    showExamPortalMessage(`Saved ${state.generatedPreview.length} symbol numbers in ascending roll order.`);
    state.generatedPreview = [];
    await refreshExamPortalAdmin();
  };

  window.initDynamicExamPortal = refreshExamPortalAdmin;

  document.addEventListener('DOMContentLoaded', () => {
    if ($('dynamic-exam-portal-root')) refreshExamPortalAdmin();
  });
})();
