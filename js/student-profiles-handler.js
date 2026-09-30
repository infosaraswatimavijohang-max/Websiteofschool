// ============================================================================
// FILE:    student-profiles-handler.js
// MODULE:  Student Profiles
// PURPOSE: Student Profiles Handler - Student CRUD operations: enrolment, profile updates, class assignment, and ID card data
//
// PROJECT: Shree Saraswati Secondary School — Management System
// STACK:   Vanilla JS + Supabase (PostgreSQL) + HTML/CSS
// UPDATED: 2026-06-03
// ============================================================================
// Student Profiles & ID Card Handler

let allProfilesStudents = [];

async function initStudentProfiles() {
  await loadProfilesStudents();
  setupProfilesModal();
}

async function loadProfilesStudents() {
  try {
    // Load official signatures from database
    if (typeof supabaseDb !== 'undefined' && supabaseDb) {
      try {
        const { data: sigData, error: sigErr } = await supabaseDb
          .from('school_settings')
          .select('setting_value')
          .eq('setting_key', 'official_signatures')
          .single();
        if (!sigErr && sigData && sigData.setting_value) {
          localStorage.setItem('school_official_signatures', JSON.stringify(sigData.setting_value));
        }
      } catch (e) {
        console.warn('Failed to load official signatures:', e);
      }
    }

    // Load students from registry
    const { data: students, error: studErr } = await supabaseDb
      .from('students_registry')
      .select('*');

    if (studErr) throw studErr;

    // Load profiles separately (avoids join/relation issues)
    let profiles = [];
    try {
      const { data: profileData, error: profErr } = await supabaseDb
        .from('student_profiles')
        .select('*');
      if (!profErr && profileData) {
        profiles = profileData;
      }
    } catch (e) {
      console.warn('student_profiles table may not exist yet:', e);
    }

    // Merge students with their profiles
    allProfilesStudents = (students || []).map(s => {
      const matchedProfile = profiles.find(p => p.student_roll === s.roll);
      return {
        ...s,
        student_profiles: matchedProfile ? [matchedProfile] : []
      };
    });

    // Populate the class filter dropdown
    populateClassFilter();

    renderProfilesStudents();
  } catch (error) {
    console.error('Error loading student profiles:', error);
    alert('Failed to load student profiles.');
  }
}

/**
 * Populate the class filter dropdown with unique class names from loaded students
 */
function populateClassFilter() {
  const filterSelect = document.getElementById('id-class-filter');
  if (!filterSelect) return;

  // Get unique class names and sort them
  const classes = [...new Set(allProfilesStudents.map(s => s.class).filter(Boolean))];
  classes.sort((a, b) => {
    // Try numeric sort first (e.g., "Grade 1" before "Grade 10")
    const numA = parseInt(a.replace(/\D/g, '')) || 0;
    const numB = parseInt(b.replace(/\D/g, '')) || 0;
    if (numA !== numB) return numA - numB;
    return a.localeCompare(b);
  });

  // Preserve current selection
  const currentValue = filterSelect.value;

  filterSelect.innerHTML = '<option value="">All Classes</option>';
  classes.forEach(cls => {
    const option = document.createElement('option');
    option.value = cls;
    option.textContent = cls;
    filterSelect.appendChild(option);
  });

  // Restore selection if it still exists
  if (currentValue && classes.includes(currentValue)) {
    filterSelect.value = currentValue;
  }
}

/**
 * Filter profiles by selected class
 */
function filterProfilesByClass() {
  renderProfilesStudents();
}

function renderProfilesStudents() {
  const container = document.getElementById('student-profiles-container');
  if (!container) return;

  // Get filter value
  const filterSelect = document.getElementById('id-class-filter');
  const selectedClass = filterSelect ? filterSelect.value : '';

  // Filter students by class
  const filteredStudents = selectedClass
    ? allProfilesStudents.filter(s => s.class === selectedClass)
    : allProfilesStudents;

  if (filteredStudents.length === 0) {
    container.innerHTML = selectedClass
      ? `<p style="grid-column: 1 / -1; text-align: center; color: #64748b; padding: 2rem;">No students found in <strong>${selectedClass}</strong>.</p>`
      : '<p>No students found.</p>';
    return;
  }

  container.innerHTML = filteredStudents.map(student => {
    const profile = student.student_profiles && student.student_profiles.length > 0 ? student.student_profiles[0] : null;
    const hasPhoto = profile && profile.photo_url;
    const photoHtml = hasPhoto
      ? `<img src="${profile.photo_url}" alt="Photo" style="width:60px; height:60px; border-radius:50%; object-fit:cover; border:2px solid var(--primary);">`
      : `<div style="width:60px; height:60px; border-radius:50%; background:#e2e8f0; display:flex; align-items:center; justify-content:center; border:2px solid var(--primary); font-size:11px; color:#64748b;">Photo</div>`;
    const missingInfo = !profile ? '<span style="color:red; font-size:12px;">(Info Missing)</span>' : '';
    
    return `
      <div class="profile-card" style="background:#fff; border:1px solid #ddd; border-radius:10px; padding:15px; display:flex; flex-direction:column; gap:15px; box-shadow:0 4px 6px rgba(0,0,0,0.05);">
        <div style="display:flex; align-items:center; gap:15px;">
          ${photoHtml}
          <div style="flex:1;">
            <h3 style="margin:0; font-size:16px; color:var(--primary);">${student.name}</h3>
            ${missingInfo}
            <p style="margin:5px 0 0; font-size:13px; color:#555;"><strong>Roll:</strong> ${student.roll} &nbsp;|&nbsp; <strong>Class:</strong> ${student.class}</p>
          </div>
        </div>
        <div style="display:flex; gap:8px; width:100%;">
          <button onclick="openProfileModal(${student.roll})" style="flex:1; background:var(--secondary); color:#fff; border:none; padding:8px 5px; font-size:12px; border-radius:6px; cursor:pointer; font-weight:600;">Edit Info & Photo</button>
          <button onclick="previewIdCard(${student.roll})" style="flex:1; background:#0ea5e9; color:#fff; border:none; padding:8px 5px; font-size:12px; border-radius:6px; cursor:pointer; font-weight:600;" ${!profile ? 'disabled title="Please add info first"' : ''}>Preview ID</button>
          <button onclick="printIdCard(${student.roll})" style="flex:1; background:var(--primary); color:#fff; border:none; padding:8px 5px; font-size:12px; border-radius:6px; cursor:pointer; font-weight:600;" ${!profile ? 'disabled title="Please add info first"' : ''}>Print ID</button>
        </div>
      </div>
    `;
  }).join('');
}

function setupProfilesModal() {
  // Modal HTML is in admin-portal.html
}

function closeStudentProfileModal() {
  document.getElementById('student-profile-modal').classList.remove('active');
}

function generateIDCard() {
  const roll = parseInt(document.getElementById('sp-id').value);
  if (roll) {
    printIdCard(roll);
  }
}

function openProfileModal(roll) {
  const student = allProfilesStudents.find(s => s.roll === roll);
  if (!student) return;

  const profile = student.student_profiles && student.student_profiles.length > 0 ? student.student_profiles[0] : {};

  document.getElementById('sp-id').value = student.roll;
  document.getElementById('sp-name').value = student.name;
  document.getElementById('sp-roll').value = student.roll;
  document.getElementById('sp-grade').value = student.class;

  document.getElementById('sp-dob').value = profile.dob || '';
  document.getElementById('sp-father').value = profile.father_name || '';
  document.getElementById('sp-mother').value = profile.mother_name || '';
  document.getElementById('sp-address').value = profile.address || '';
  document.getElementById('sp-contact').value = profile.contact || '';
  document.getElementById('sp-school-email').value = profile.school_email || '';

  const photoPreview = document.getElementById('sp-photo-img');
  const placeholder = document.getElementById('sp-photo-placeholder');
  
  if (profile.photo_url) {
    photoPreview.src = profile.photo_url;
    photoPreview.style.display = 'block';
    if(placeholder) placeholder.style.display = 'none';
  } else {
    photoPreview.src = '';
    photoPreview.style.display = 'none';
    if(placeholder) placeholder.style.display = 'block';
  }

  document.getElementById('student-profile-modal').classList.add('active');
}

function handleStudentPhotoUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = document.getElementById('sp-photo-img');
      const placeholder = document.getElementById('sp-photo-placeholder');
      img.src = e.target.result;
      img.style.display = 'block';
      if (placeholder) placeholder.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }
}

async function uploadStudentPhoto(file, roll) {
  const fileExt = file.name.split('.').pop();
  const fileName = `student_${roll}_${Date.now()}.${fileExt}`;
  const filePath = `student-photos/${fileName}`;

  return await uploadMediaFile(file, filePath);
}

async function saveStudentProfile(event) {
  event.preventDefault();
  
  const btn = event.target.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.textContent = 'Saving...';
  btn.disabled = true;

  try {
    const roll = parseInt(document.getElementById('sp-id').value);
    const dob = document.getElementById('sp-dob').value;
    const father_name = document.getElementById('sp-father').value;
    const mother_name = document.getElementById('sp-mother').value;
    const address = document.getElementById('sp-address').value;
    const contact = document.getElementById('sp-contact').value;
    const school_email = document.getElementById('sp-school-email').value;
    
    const fileInput = document.getElementById('sp-photo-upload');
    
    const student = allProfilesStudents.find(s => s.roll === roll);
    const existingProfile = student.student_profiles && student.student_profiles.length > 0 ? student.student_profiles[0] : null;
    
    let photo_url = existingProfile ? existingProfile.photo_url : null;

    if (fileInput.files.length > 0) {
      photo_url = await uploadStudentPhoto(fileInput.files[0], roll);
    }

    const payload = {
      student_roll: roll,
      dob,
      father_name,
      mother_name,
      address,
      contact,
      school_email,
      photo_url,
      updated_at: new Date().toISOString()
    };

    // Use UPSERT to avoid duplicate key errors
    const { error } = await supabaseDb
      .from('student_profiles')
      .upsert(payload, { onConflict: 'student_roll' });

    if (error) throw error;

    alert('Profile saved successfully!');
    document.getElementById('student-profile-modal').classList.remove('active');
    await loadProfilesStudents(); // Reload data
  } catch (error) {
    console.error('Error saving profile:', error);
    alert('Failed to save profile: ' + error.message);
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

function generateIdCardHTML(student, profile) {
  const photoUrl = profile.photo_url || '';
  
  // Read dynamic academic year if input exists, fallback to 2082
  const academicYearEl = document.getElementById('id-academic-year');
  const academicYear = academicYearEl ? academicYearEl.value : '2082';

  // Read head teacher signature from official signatures database config
  const sigs = JSON.parse(localStorage.getItem('school_official_signatures') || '{}');
  let principalSig = sigs.principal || '../images/signature.jpg';
  
  // Sanitize the signature string to prevent HTML injection that breaks the ID card template
  if (typeof principalSig === 'string') {
    // If it accidentally contains an img tag, extract the src
    const srcMatch = principalSig.match(/src\s*=\s*["']([^"']+)["']/i);
    if (srcMatch) {
      principalSig = srcMatch[1];
    }
    // Escape double quotes as HTML entities so it doesn't break the src="..." attribute,
    // while keeping < and > intact for valid SVG data URIs.
    principalSig = principalSig.replace(/"/g, '&quot;');
  }

  return `
    <div class="id-card-wrapper">
      <img src="../images/logo.png" alt="Logo Watermark" class="id-card-logo-watermark">
      
      <div class="id-card-header">
        <h2 class="id-card-school-name">Shree Saraswati Secondary School</h2>
        <p class="id-card-school-address">Satyawati Rural Municipality-6 Johang, Gulmi</p>
        <p style="font-size: 10px; opacity: 0.9; margin-bottom: 8px;">Academic Year: ${academicYear}</p>
        <div class="id-card-title-badge">STUDENT ID CARD</div>
      </div>
      
      <div class="id-card-body">
        <div class="id-card-photo-container">
          ${photoUrl ? `<img src="${photoUrl}" alt="Student Photo" class="id-card-photo">` : `<div class="id-card-photo" style="display:flex;align-items:center;justify-content:center;background:#e2e8f0;color:#64748b;font-size:12px;">No Photo</div>`}
        </div>
        
        <div class="id-card-details">
          <div class="id-card-student-name">${student.name}</div>
          <div class="id-card-info-grid">
            <strong>Regd ID:</strong> <span>${student.roll}</span>
            <strong>Grade:</strong> <span>${student.class}</span>
            <strong>DoB:</strong> <span>${profile.dob || '-'}</span>
            <strong>Father:</strong> <span>${profile.father_name || '-'}</span>
            <strong>Mother:</strong> <span>${profile.mother_name || '-'}</span>
            <strong>Address:</strong> <span>${profile.address || '-'}</span>
            <strong>Contact:</strong> <span>${profile.contact || '-'}</span>
          </div>
        </div>
      </div>
        
      <div class="id-card-signatures">
        <div class="id-card-barcode"></div>
        <div class="id-card-signature-box">
          <img src="${principalSig}" alt="Signature" class="id-card-signature-img" onerror="this.style.display='none'">
          <div class="id-card-signature-line">Principal</div>
        </div>
      </div>
      
      <div class="id-card-footer">
        <div class="id-card-footer-top">If found, please return to the school.</div>
        <div class="id-card-footer-bottom">Phone: 079-412035 | Web: www.saraswatimavigulmi.edu.np</div>
        ${profile.school_email ? `<div class="id-card-footer-bottom" style="margin-top: 2px;">Email: ${profile.school_email}</div>` : ''}
      </div>
    </div>
  `;
}

function previewIdCard(roll) {
  const student = allProfilesStudents.find(s => s.roll === roll);
  if (!student) return;
  const profile = student.student_profiles && student.student_profiles.length > 0 ? student.student_profiles[0] : null;
  if (!profile) return;

  const container = document.getElementById('preview-id-container');
  container.innerHTML = generateIdCardHTML(student, profile);
  
  // Store roll number for the print button inside the preview modal
  container.setAttribute('data-current-roll', roll);
  
  document.getElementById('preview-id-modal').classList.add('active');
}

function closePreviewIdModal() {
  document.getElementById('preview-id-modal').classList.remove('active');
}

function triggerPrintFromPreview() {
  const roll = document.getElementById('preview-id-container').getAttribute('data-current-roll');
  if (roll) {
    printIdCard(parseInt(roll));
  }
}

function printIdCard(roll) {
  const student = allProfilesStudents.find(s => s.roll === roll);
  if (!student) return;
  const profile = student.student_profiles && student.student_profiles.length > 0 ? student.student_profiles[0] : null;
  if (!profile) {
    alert("Please add student information first before printing the ID card.");
    return;
  }

  const cardHTML = generateIdCardHTML(student, profile);

  // Open a brand new window with ALL styles embedded inline.
  // This is the most reliable printing method for local file:// pages.
  const printWin = window.open('', '_blank', 'width=500,height=700');
  printWin.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Print ID Card - ${student.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { display: flex; justify-content: center; padding: 20px; background: #fff; font-family: 'Inter', sans-serif; }

    @media print {
      @page { margin: 0; size: auto; }
      body { padding: 10px; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .id-card-wrapper { box-shadow: none !important; }
    }

    .id-card-wrapper {
      width: 324px; height: 540px; background: #fff; border-radius: 14px;
      overflow: hidden; position: relative; font-family: 'Inter', sans-serif;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2); display: flex; flex-direction: column;
    }
    .id-card-wrapper::before {
      content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 200px;
      background: linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #4f46e5 100%);
      z-index: 1; clip-path: polygon(0 0, 100% 0, 100% 75%, 0 100%);
    }
    .id-card-wrapper::after {
      content: ''; position: absolute; top: 0; right: 0; width: 250px; height: 250px;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
      z-index: 1; border-radius: 50%; transform: translate(30%, -20%); pointer-events: none;
    }
    .id-card-logo-watermark {
      position: absolute; top: 45%; left: 50%; transform: translate(-50%, -50%);
      width: 220px; opacity: 0.04; z-index: 1; pointer-events: none; filter: grayscale(100%);
    }
    .id-card-header {
      text-align: center; padding: 18px 15px 5px; position: relative; z-index: 2; color: #fff;
    }
    .id-card-school-name {
      font-family: 'Playfair Display', serif; font-size: 21px; font-weight: 800;
      margin: 0 0 4px; line-height: 1.1; text-shadow: 0 2px 4px rgba(0,0,0,0.3); letter-spacing: 0.5px;
    }
    .id-card-school-address {
      font-size: 10px; color: rgba(255,255,255,0.85); margin: 0 0 6px;
      font-weight: 400; letter-spacing: 0.3px; text-transform: uppercase;
    }
    .id-card-title-badge {
      display: inline-block; background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
      color: #78350f; font-size: 10px; font-weight: 800; padding: 5px 16px;
      border-radius: 20px; letter-spacing: 2px; text-transform: uppercase;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15); margin-top: 2px;
    }
    .id-card-body {
      position: relative; z-index: 3; flex: 1; display: flex; flex-direction: column;
      align-items: center; padding: 0 20px; margin-top: 5px;
    }
    .id-card-photo-container {
      width: 100px; height: 100px; border-radius: 50%; padding: 3px;
      background: linear-gradient(135deg, #f59e0b 0%, #4f46e5 100%);
      box-shadow: 0 8px 20px rgba(0,0,0,0.15); margin-bottom: 8px; position: relative;
    }
    .id-card-photo {
      width: 100%; height: 100%; border-radius: 50%; object-fit: cover;
      background: #f8fafc; border: 2px solid #fff;
    }
    .id-card-details { width: 100%; text-align: center; }
    .id-card-student-name {
      font-size: 19px; font-weight: 800; color: #0f172a; margin-bottom: 8px; letter-spacing: -0.5px;
    }
    .id-card-info-grid {
      display: grid; grid-template-columns: 60px 1fr; gap: 3px 6px; text-align: left;
      background: #f8fafc; padding: 8px 10px; border-radius: 8px; font-size: 10px;
      border: 1px solid #e2e8f0; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
    }
    .id-card-info-grid strong {
      color: #4f46e5; font-weight: 700; font-size: 9px; text-transform: uppercase;
      letter-spacing: 0.5px; display: flex; align-items: center;
    }
    .id-card-info-grid span {
      color: #334155; font-weight: 600; border-bottom: 1px dashed #cbd5e1; padding-bottom: 1px;
      font-size: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .id-card-signatures {
      position: absolute; bottom: 40px; left: 0; width: 100%; display: flex;
      justify-content: space-between; align-items: flex-end; padding: 0 25px; z-index: 2;
    }
    .id-card-barcode {
      width: 90px; height: 28px; opacity: 0.8; border-radius: 2px;
      background: repeating-linear-gradient(90deg, #0f172a, #0f172a 2px, transparent 2px, transparent 4px, #0f172a 4px, #0f172a 5px, transparent 5px, transparent 8px, #0f172a 8px, #0f172a 11px, transparent 11px, transparent 12px);
    }
    .id-card-signature-box { text-align: center; width: 100px; }
    .id-card-signature-img {
      height: 28px; max-width: 100%; object-fit: contain; margin-bottom: 2px;
      mix-blend-mode: multiply; opacity: 0.9;
    }
    .id-card-signature-line {
      border-top: 1px solid #94a3b8; padding-top: 3px; font-size: 9px; color: #475569;
      font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .id-card-footer {
      position: absolute; bottom: 0; left: 0; width: 100%; background: #1e1b4b;
      color: #fff; text-align: center; padding: 6px 10px; font-size: 8px; z-index: 2;
    }
    .id-card-footer-top { color: #fbbf24; font-weight: 700; margin-bottom: 2px; }
    .id-card-footer-bottom { opacity: 0.85; letter-spacing: 0.5px; }
  </style>
</head>
<body>
  ${cardHTML}
  <scr` + `ipt>
    // Wait for fonts and images to load, then auto-print
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </scr` + `ipt>
</body>
</html>`);
  printWin.document.close();
}
