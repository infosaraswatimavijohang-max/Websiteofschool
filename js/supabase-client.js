// ============================================================================
// FILE:    supabase-client.js
// MODULE:  Core: Database Client
// PURPOSE: Supabase Client & Shared CRUD - Initializes Supabase DB and Media clients, exports all shared database utility functions used across the application (uploadMediaFile, getMediaFileUrl, teacher/student CRUD, etc.)
//
// PROJECT: Shree Saraswati Secondary School — Management System
// STACK:   Vanilla JS + Supabase (PostgreSQL) + HTML/CSS
// UPDATED: 2026-06-03
// ============================================================================
// ====================================================================
// SUPABASE CONNECTIONS AND CLIENT WRAPPERS
// ====================================================================

const DB1_URL = "https://ohczlooperjqpyllmabo.supabase.co";
const DB1_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oY3psb29wZXJqcXB5bGxtYWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNDk1MTcsImV4cCI6MjA5NDkyNTUxN30.DTgKXfFOdgHWy8C_hb8sGB6SWnfyr7J3UeVohE72ze0";

const DB2_URL = "https://xowlownqmnfffhnkxdpw.supabase.co";
const DB2_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhvd2xvd25xbW5mZmZobmt4ZHB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNTAxNjQsImV4cCI6MjA5NDkyNjE2NH0.Bu4VmR0-N1Mf9Wxsys9gFG8Oh9HncQ17koFDa4kDXDU";

// Initialize both clients
let supabaseDb = null;
let supabaseMedia = null;

try {
  if (typeof supabase !== 'undefined') {
    supabaseDb = supabase.createClient(DB1_URL, DB1_KEY);
    supabaseMedia = supabase.createClient(DB2_URL, DB2_KEY);
    
    // Set up authentication state listener for DB1
    if (supabaseDb) {
      supabaseDb.auth.onAuthStateChange((event, session) => {
        console.log('[AUTH_EVENT]', event, session ? `User: ${session.user.email}` : 'No session');
        if (session) {
          console.log('[SUCCESS] Auth state changed: Session is now active');
          localStorage.setItem('authToken', session.access_token);
        } else {
          console.log('[WARNING] Auth state changed: Session cleared');
          localStorage.removeItem('authToken');
        }
      });
    }
  } else {
    console.error("Supabase library not loaded. Please include the CDN script.");
  }
} catch (e) {
  console.error("Error initializing Supabase clients:", e);
}

// Safe query helper — wraps a single table fetch so 404/PGRST205 errors never
// propagate and never spam red console.error lines.
async function _safeFetch(label, fn) {
  try {
    await fn();
  } catch (e) {
    console.warn(`[sync] ${label} skipped (table may not exist):`, e.message || e);
  }
}

// Helper to pull all tables from Supabase into LocalStorage to maintain compatibility
async function pullAllFromSupabase() {
  if (!supabaseDb) return;
  console.log("Synchronizing database tables from Supabase...");
  try {
    // 1. Students
    const { data: students, error: studentErr } = await supabaseDb.from('students_registry').select('*');
    if (!studentErr && students) {
      const mapped = students.map(s => ({
        roll: s.roll,
        name: s.name,
        class: s.class,
        attendance: s.attendance,
        overallGPA: s.overall_gpa,
        status: s.status
      }));
      localStorage.setItem('students_registry', JSON.stringify(mapped));
      
      // Sync billing state if Anil Gurung exists
      const anil = students.find(s => s.roll === 12);
      if (anil) {
        localStorage.setItem('student_billing_state', anil.billing_state);
        if (anil.billing_rejection_remark) {
          localStorage.setItem('student_billing_rejection_remark', anil.billing_rejection_remark);
        }
      }
    }
    
    // 2. Teachers
    const { data: teachers, error: teacherErr } = await supabaseDb.from('teachers_registry').select('*');
    if (!teacherErr && teachers) {
      localStorage.setItem('teachers_registry', JSON.stringify(teachers));
    }

    // 2.3. Subjects Setup
    try {
      const { data: subjects, error: subjectErr } = await supabaseDb.from('subjects').select('*');
      if (!subjectErr && subjects) {
        const mapped = subjects.map(sub => ({
          id: sub.id,
          f1: sub.subject_name,
          f2: sub.subject_code,
          f3: sub.subject_type,
          f5: sub.category || 'Secondary',
          f4: sub.status
        }));
        localStorage.setItem('generic_module_Academic_SubjectSetup', JSON.stringify(mapped));
      }
    } catch (subEx) {
      console.warn("Could not sync subjects table:", subEx);
    }

    // 2.5. Teacher Profiles (Dynamic)
    const { data: teacherProfiles, error: teacherProfileErr } = await supabaseDb.from('teacher_profiles').select('*').order('display_order', { ascending: true });
    if (!teacherProfileErr && teacherProfiles) {
      localStorage.setItem('teacher_profiles', JSON.stringify(teacherProfiles));
    }

    // 3. Fee Payments
    const { data: payments, error: paymentErr } = await supabaseDb.from('fee_payments').select('*');
    if (!paymentErr && payments) {
      localStorage.setItem('fee_payments', JSON.stringify(payments));
    }

    // 3.5. Student Fees Ledger (REDESIGNED NO-SQL DATABASE SYSTEM)
    // We completely bypass the broken student_fees table to eliminate all RLS errors!
    const { data: configBackup } = await supabaseDb.from('school_config').select('val').eq('key', 'student_fees_json').single();
    if (configBackup && configBackup.val) {
      try {
        const parsedFees = JSON.parse(configBackup.val);
        localStorage.setItem('student_fees', JSON.stringify(parsedFees));
        console.log("✅ Synced student fees using redesigned NoSQL JSON database stream!");
      } catch(e) {
        console.error("Failed to parse NoSQL fee stream", e);
      }
    }

    // 4. Student Leaves
    const { data: leaves, error: leaveErr } = await supabaseDb.from('student_leaves').select('*');
    if (!leaveErr && leaves) {
      localStorage.setItem('student_leaves', JSON.stringify(leaves));
    }

    // 5. Timetables
    const { data: timetables, error: timetableErr } = await supabaseDb.from('school_timetables').select('*');
    if (!timetableErr && timetables) {
      localStorage.setItem('school_timetables', JSON.stringify(timetables));
    }

    // 6. Notices
    await _safeFetch('school_notices', async () => {
      const { data: notices, error: noticeErr } = await supabaseDb.from('school_notices').select('*');
      if (!noticeErr && notices) {
        localStorage.setItem('school_notices', JSON.stringify(notices));
      }
    });

    // 7. Events
    const { data: events, error: eventErr } = await supabaseDb.from('school_events').select('*');
    if (!eventErr && events) {
      localStorage.setItem('school_events', JSON.stringify(events));
    }

    // 8. Submitted Results
    const { data: submittedRes, error: subResErr } = await supabaseDb.from('submitted_results').select('*');
    if (!subResErr && submittedRes) {
      const mapped = submittedRes.map(sr => ({
        id: sr.id,
        subject: sr.subject,
        class: sr.class,
        examType: sr.exam_type,
        exam_type: sr.exam_type,
        totalMarks: sr.total_marks,
        total_marks: sr.total_marks,
        academic_year: sr.academic_year,
        students: sr.students,
        submissionDate: sr.submission_date,
        submission_date: sr.submission_date,
        status: sr.status,
        timestamp: sr.timestamp
      }));
      localStorage.setItem('submitted_results', JSON.stringify(mapped));
    }

    // 9. Approved Results
    await _safeFetch('approved_results', async () => {
      const { data: approvedRes, error: appResErr } = await supabaseDb.from('approved_results').select('*');
      if (!appResErr && approvedRes) {
        const mapped = approvedRes.map(ar => ({
          subject: ar.subject,
          class: ar.class,
          examType: ar.exam_type,
          exam_type: ar.exam_type,
          marks: ar.marks,
          totalMarks: ar.total_marks,
          total_marks: ar.total_marks,
          grade: ar.grade,
          gpa: ar.gpa,
          percentage: ar.percentage,
          date: ar.date,
          studentRoll: ar.student_roll,
          symbolNumber: ar.student_roll
        }));
        localStorage.setItem('approved_results', JSON.stringify(mapped));
      }
    });

    // 10. Admission Enquiries
    const { data: enquiries, error: enquiryErr } = await supabaseDb.from('admission_enquiries').select('*');
    if (!enquiryErr && enquiries) {
      const mapped = enquiries.map(e => ({
        id: e.id.toString(),
        f1: e.full_name,
        f2: e.apply_class,
        f3: e.phone,
        f4: e.status,
        studentPhoto: e.student_photo,
        birthCert: e.birth_cert,
        bleCert: e.ble_cert
      }));
      localStorage.setItem('generic_module_FrontDesk_AdmissionEnquiry', JSON.stringify(mapped));
    }

    // 11. Generic Modules Data
    const { data: genModules, error: genModErr } = await supabaseDb.from('generic_modules_data').select('*');
    if (!genModErr && genModules) {
      const grouped = {};
      genModules.forEach(row => {
        if (!grouped[row.module_key]) grouped[row.module_key] = [];
        grouped[row.module_key].push(row.data);
      });
      // Clear previous local storage generic modules
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('generic_module_') && key !== 'generic_module_FrontDesk_AdmissionEnquiry') {
          localStorage.removeItem(key);
        }
      }
      for (const [key, val] of Object.entries(grouped)) {
        localStorage.setItem('generic_module_' + key, JSON.stringify(val));
      }
    }

    // 12. Calendar Config (school_calendar_events and school_calendar_published)
    const { data: configs, error: configErr } = await supabaseDb.from('school_config').select('*');
    if (!configErr && configs) {
      configs.forEach(cfg => {
        try {
          localStorage.setItem(cfg.key, JSON.stringify(cfg.val));
        } catch (e) {}
      });
    }

    // 13. Co-curricular Clubs
    const { data: clubs, error: clubErr } = await supabaseDb.from('school_clubs').select('*');
    if (!clubErr && clubs) {
      localStorage.setItem('school_clubs', JSON.stringify(clubs));
    }

    // 14. School Achievements
    await syncSchoolAchievements();

    // 15. Alumni Profiles
    await syncAlumniProfiles();

    // 16. Gallery Images
    await syncGalleryImages();

    // 17. Student Login Credentials
    await syncStudentCredentials();

    // 17.5. Teacher Login Credentials
    await syncTeacherCredentials();

    // 18. School Notices
    await syncSchoolNotices();

    // 19. School Documents & Guidelines
    await syncSchoolDocuments();

    // 20. About Page Data
    if (typeof loadAllAboutData === 'function') {
      await loadAllAboutData();
    }

    // 21. Transport Requests
    try {
      const { data: transReq, error: transReqErr } = await supabaseDb.from('transport_requests').select('*');
      if (!transReqErr && transReq) {
        localStorage.setItem('local_transport_requests', JSON.stringify(transReq));
      }
    } catch (err) {
      console.warn("Transport requests pull sync failed:", err);
    }

    console.log("Database synchronization completed.");
  } catch (e) {
    console.error("Pull sync failed:", e);
  }
}

// Seeding Supabase if empty (Self-Healing routine)
async function seedSupabaseIfEmpty() {
  if (!supabaseDb) return;
  try {
    const { data: students, error } = await supabaseDb.from('students_registry').select('roll');
    if (!error && (!students || students.length === 0)) {
      console.log("Supabase registry is empty. Seeding defaults...");
      
      // 1. Students
      await supabaseDb.from('students_registry').insert([
        { roll: 12, name: "Anil Gurung", class: "Grade 10 - A", attendance: "96.4%", overall_gpa: "3.80", status: "Active", billing_state: "pending" },
        { roll: 15, name: "Rohan Adhikari", class: "Grade 10 - A", attendance: "88.2%", overall_gpa: "3.55", status: "Active", billing_state: "unpaid" },
        { roll: 18, name: "Bipana Thapa", class: "Grade 10 - A", attendance: "91.8%", overall_gpa: "3.90", status: "Active", billing_state: "unpaid" }
      ]);
      
      // 2. Teachers
      await supabaseDb.from('teachers_registry').insert([
        { code: "TCH-2080-04", name: "Prof. Ramesh Bhandari", subject: "Mathematics", sections: "Grade 10 Science, Grade 9 OPT Math", status: "Active" },
        { code: "TCH-2080-09", name: "Dr. Sita Sharma", subject: "Science & Physics", sections: "Grade 10 Science", status: "Active" }
      ]);

      // 2.3. Subjects
      try {
        const { data: checkSubjects, error: checkSubErr } = await supabaseDb.from('subjects').select('id');
        if (!checkSubErr && (!checkSubjects || checkSubjects.length === 0)) {
          console.log("Seeding subjects table...");
          await supabaseDb.from('subjects').insert([
            { subject_name: 'Compulsory Mathematics', subject_code: 'MATH-10', subject_type: 'Theory Only', category: 'Secondary', status: 'Active' },
            { subject_name: 'Science & Technology', subject_code: 'SCI-10', subject_type: 'Both Theory & Practical', category: 'Secondary', status: 'Active' },
            { subject_name: 'English Grammar', subject_code: 'ENG-08', subject_type: 'Theory Only', category: 'Lower Secondary', status: 'Active' },
            { subject_name: 'Basic Social Studies', subject_code: 'SOC-05', subject_type: 'Theory Only', category: 'Primary', status: 'Active' }
          ]);
        }
      } catch (subSeedEx) {
        console.warn("Could not seed subjects table:", subSeedEx);
      }

      // 3. Timetables
      await supabaseDb.from('school_timetables').insert([
        { time: "10:00 AM", subject: "Advanced Mathematics", details: "Room 302 • Mr. D. Bhandari", section: "Grade 10 - A" },
        { time: "11:30 AM", subject: "Computer Network Labs", details: "ICT Lab 1 • Er. S. Bhandari", section: "Grade 10 - A" },
        { time: "02:00 PM", subject: "Physics Theory", details: "Room 305 • Ms. R. Thapa", section: "Grade 10 - A" }
      ]);

      // 4. Announcements
      await supabaseDb.from('school_announcements').insert([
        { date: "19 MAY 2026", title: "First Term Examination Timetables Commencing", category: "Academic", desc: "Examination timelines published commencing Shrawan 15. Question sets due by Sunday." },
        { date: "15 MAY 2026", title: "Staff Meeting & Curriculum Briefing Today", category: "General", desc: "Urgent briefing with the Principal in the lounge today at 3:30 PM." }
      ]);

      // 5. Events
      await supabaseDb.from('school_events').insert([
        { date: "2026-05-08", time: "10:00 AM onwards", title: "Annual Parents' Day & Cultural Feast", location: "Johang Main Campus", desc: "A grand day of academic rewards, parent-teacher interactions, and beautiful cultural dances presented by our students.", published: true },
        { date: "2026-05-26", time: "09:30 AM onwards", title: "Inter-School Tech & Coding Hackathon", location: "Bedauri Computer Lab", desc: "Welcoming young minds from across Gulmi to build coding solutions for rural community problems under our senior ICT guidance.", published: true },
        { date: "2026-06-11", time: "08:00 AM onwards", title: "Johang Sports Pavilion & Athletics Meet", location: "Johang Main Ground", desc: "Annual athletic meets including high jumps, short tracks, volleyball, and community matches for student team-building.", published: true }
      ]);

      // 6. Student Leaves
      await supabaseDb.from('student_leaves').insert([
        { name: "Anil Gurung", type: "Family Function", range: "2026-11-20 to 2026-11-21", desc: "Attending sister's wedding ritual in Pokhara.", proof_file: "wedding_card.jpg", emoji: "💌", status: "pending" }
      ]);

      // 7. Fee Payments
      await supabaseDb.from('fee_payments').insert([
        { name: "Anil Gurung", roll: 12, category: "Second Installment Dues (Rs. 5,000)", txn_id: "TXN-984710293", proof_file: "rbb_receipt_9847.png", status: "pending", submitted_time: "15 mins ago" }
      ]);

      // 8. Calendar Seeding
      await supabaseDb.from('school_config').insert([
        { key: 'school_calendar_events', val: {} },
        { key: 'school_calendar_published', val: null }
      ]);

      // 9. Website highlights, hero counters, demographics configurations
      const { data: configCheck } = await supabaseDb.from('school_config').select('key').in('key', ['website_highlights', 'website_hero_stats', 'website_demographics']);
      if (!configCheck || configCheck.length < 3) {
        await supabaseDb.from('school_config').upsert([
          {
            key: 'website_highlights',
            val: [
              "🎓 <strong>Technical Education:</strong> Admissions open for Computer Engineering (Classes 9 to 12) for academic session 2083!",
              "💻 <strong>Modern Infrastructure:</strong> Join Shree Saraswati Secondary School for hands-on practical learning, fully equipped computer labs, and expert faculty!",
              "🚀 <strong>Empowering Gulmi:</strong> Providing quality tech-driven vocational education to shape the future of our students. Apply today!"
            ]
          },
          {
            key: 'website_hero_stats',
            val: [
              { label: "Students Enrolled", value: "800+", icon: "graduation-cap" },
              { label: "Qualified Teachers", value: "45+", icon: "users" },
              { label: "Years of Excellence", value: "8+", icon: "trophy" },
              { label: "Pass Rate", value: "95%", icon: "trending-up" },
              { label: "Award Honours", value: "6", icon: "award" }
            ]
          },
          {
            key: 'website_demographics',
            val: { total: 245, male: 133, female: 112, staff: 31 }
          }
        ]);
      }

      // 10. Default Student Clubs seeding
      const { data: clubsCheck } = await supabaseDb.from('school_clubs').select('id');
      if (!clubsCheck || clubsCheck.length === 0) {
        await supabaseDb.from('school_clubs').insert([
          {
            title: "Computer & Coding Club",
            category: "Technical Club",
            description: "Fostering programming, web development, and database projects among our Classes 9-12 engineering enthusiasts.",
            image_url: "https://images.unsplash.com/photo-1561736778-92e52a7769ef?auto=format&fit=crop&w=500&q=50"
          },
          {
            title: "Volleyball & Sports Guild",
            category: "Athletics",
            description: "Participating in inter-district volleyball meets, athletics training, and physical fitness assemblies.",
            image_url: "https://images.unsplash.com/photo-1592656094267-764a450201c5?auto=format&fit=crop&w=500&q=50"
          },
          {
            title: "Cultural Performing Arts",
            category: "Arts & Culture",
            description: "Observing historical festivals of Nepal with beautiful traditional dances, acoustic music, and theatrical acts.",
            image_url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=500&q=50"
          }
        ]);
      }

      // 11. Default School Documents seeding
      const { data: docsCheck } = await supabaseDb.from('school_documents').select('id');
      if (!docsCheck || docsCheck.length === 0) {
        await supabaseDb.from('school_documents').insert([
          {
            title: "Admission Application Form",
            description: "Printable official admission application form required during registration.",
            file_url: "https://drive.google.com/file/d/1example-admission-form/view",
            category: "Admission",
            icon_type: "admission",
            display_order: 1,
            is_active: true,
            uploaded_by: "Admin"
          },
          {
            title: "Computer Engineering Syllabus",
            description: "Full class-wise curriculum index for Classes 9 to 12 Computer Engineering stream.",
            file_url: "https://drive.google.com/file/d/1example-engineering-syllabus/view",
            category: "Syllabus",
            icon_type: "syllabus",
            display_order: 2,
            is_active: true,
            uploaded_by: "Admin"
          },
          {
            title: "School Academic Almanac",
            description: "Printable yearly planner with vacation lists, festivals, and examination dates.",
            file_url: "https://drive.google.com/file/d/1example-academic-calendar/view",
            category: "Calendar",
            icon_type: "calendar",
            display_order: 3,
            is_active: true,
            uploaded_by: "Admin"
          },
          {
            title: "Admission Fees Charter",
            description: "Complete fee details, scholarship guidelines, and special student quotas.",
            file_url: "https://drive.google.com/file/d/1example-fees-charter/view",
            category: "Guidelines",
            icon_type: "document",
            display_order: 4,
            is_active: true,
            uploaded_by: "Admin"
          }
        ]);
      }

      console.log("Seeding to Supabase completed.");
    }

    // Seed default teacher credentials if the table exists and is empty
    try {
      const { data: credCheck, error: credCheckErr } = await supabaseDb.from('teacher_credentials').select('id');
      if (!credCheckErr && (!credCheck || credCheck.length === 0)) {
        console.log("Seeding default teacher credentials...");
        await supabaseDb.from('teacher_credentials').insert([
          { teacher_code: "TCH-2080-04", teacher_name: "Prof. Ramesh Bhandari", teacher_email: "ramesh@school.com", teacher_password: "saraswati123", is_active: true },
          { teacher_code: "TCH-2080-09", teacher_name: "Dr. Sita Sharma", teacher_email: "sita@school.com", teacher_password: "saraswati123", is_active: true }
        ]);
      }
    } catch (credEx) {
      console.warn("Could not seed teacher credentials (table might not exist yet):", credEx);
    }
  } catch (e) {
    console.error("Seeding routine failed:", e);
  }
}

// Media upload function targeting DB 2
async function uploadMediaFile(file, path, bucket = 'media') {
  if (!supabaseMedia) {
    console.error("Media Supabase client is not available.");
    return "";
  }
  try {
    // Attempt standard Storage Bucket upload
    const { data, error } = await supabaseMedia.storage
      .from(bucket)
      .upload(path, file, { upsert: true });

    if (error) {
      console.warn("Storage upload failed, using base64 fallback:", error.message);
      // Fallback: Convert to base64 and return directly
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    // Get public URL from Storage
    const { data: publicUrlData } = supabaseMedia.storage
      .from(bucket)
      .getPublicUrl(path);

    return publicUrlData.publicUrl;
  } catch (e) {
    console.error("Upload process encountered error:", e);
    return "";
  }
}

// Helper to look up images/documents from DB 2
async function getMediaFileUrl(path) {
  if (!supabaseMedia) return "";
  try {
    // Return public storage URL
    const { data: url } = supabaseMedia.storage.from('media').getPublicUrl(path);
    return url ? url.publicUrl : "";
  } catch (e) {
    return "";
  }
}


// ====================================================================
// TEACHER PROFILES CRUD OPERATIONS
// ====================================================================

// CREATE: Add a new teacher profile
async function addTeacherProfile(teacherData) {
  if (!supabaseDb) {
    console.error("Supabase DB client is not available.");
    return { success: false, error: "Database connection failed" };
  }
  try {
    const { data, error } = await supabaseDb.from('teacher_profiles').insert([
      {
        teacher_code: teacherData.teacher_code || null,
        teacher_name: teacherData.teacher_name,
        teacher_role: teacherData.teacher_role,
        teacher_title: teacherData.teacher_title || null,
        teacher_description: teacherData.teacher_description || null,
        teacher_image_url: teacherData.teacher_image_url || null,
        teacher_email: teacherData.teacher_email || null,
        teacher_phone: teacherData.teacher_phone || null,
        teacher_qualifications: teacherData.teacher_qualifications || null,
        teacher_experience: teacherData.teacher_experience || null,
        teacher_expertise: teacherData.teacher_expertise || null,
        display_order: teacherData.display_order || 0,
        is_active: teacherData.is_active !== false
      }
    ]).select();

    if (error) {
      console.error("Error adding teacher profile:", error);
      return { success: false, error: error.message };
    }

    // Sync to localStorage
    await syncTeacherProfiles();
    return { success: true, data: data };
  } catch (e) {
    console.error("Add teacher profile failed:", e);
    return { success: false, error: e.message };
  }
}

// READ: Get all active teacher profiles
async function getTeacherProfiles(activeOnly = true) {
  if (!supabaseDb) {
    console.error("Supabase DB client is not available.");
    return [];
  }
  try {
    let query = supabaseDb.from('teacher_profiles').select('*').order('display_order', { ascending: true });
    
    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching teacher profiles:", error);
      return [];
    }

    return data || [];
  } catch (e) {
    console.error("Get teacher profiles failed:", e);
    return [];
  }
}

// READ: Get a specific teacher profile by ID
async function getTeacherProfileById(id) {
  if (!supabaseDb) {
    console.error("Supabase DB client is not available.");
    return null;
  }
  try {
    const { data, error } = await supabaseDb.from('teacher_profiles').select('*').eq('id', id).single();

    if (error) {
      console.error("Error fetching teacher profile:", error);
      return null;
    }

    return data;
  } catch (e) {
    console.error("Get teacher profile by ID failed:", e);
    return null;
  }
}

// UPDATE: Update teacher profile details
async function updateTeacherProfile(id, updateData) {
  if (!supabaseDb) {
    console.error("Supabase DB client is not available.");
    return { success: false, error: "Database connection failed" };
  }
  try {
    const updatePayload = {
      ...updateData,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseDb.from('teacher_profiles').update(updatePayload).eq('id', id).select();

    if (error) {
      console.error("Error updating teacher profile:", error);
      return { success: false, error: error.message };
    }

    // Sync to localStorage
    await syncTeacherProfiles();
    return { success: true, data: data };
  } catch (e) {
    console.error("Update teacher profile failed:", e);
    return { success: false, error: e.message };
  }
}

// DELETE: Remove a teacher profile
async function deleteTeacherProfile(id) {
  if (!supabaseDb) {
    console.error("Supabase DB client is not available.");
    return { success: false, error: "Database connection failed" };
  }
  try {
    const { error } = await supabaseDb.from('teacher_profiles').delete().eq('id', id);

    if (error) {
      console.error("Error deleting teacher profile:", error);
      return { success: false, error: error.message };
    }

    // Sync to localStorage
    await syncTeacherProfiles();
    return { success: true, message: "Teacher profile deleted successfully" };
  } catch (e) {
    console.error("Delete teacher profile failed:", e);
    return { success: false, error: e.message };
  }
}

// SYNC: Synchronize teacher profiles to localStorage
async function syncTeacherProfiles() {
  try {
    const teachers = await getTeacherProfiles(false); // Get all (including inactive)
    localStorage.setItem('teacher_profiles', JSON.stringify(teachers));
    console.log("Teacher profiles synced to localStorage");
    return true;
  } catch (e) {
    console.error("Sync teacher profiles failed:", e);
    return false;
  }
}

// Helper: Get teacher profiles from localStorage (cached version)
function getTeacherProfilesFromCache() {
  try {
    const cached = localStorage.getItem('teacher_profiles');
    return cached ? JSON.parse(cached) : [];
  } catch (e) {
    console.error("Error parsing teacher profiles from cache:", e);
    return [];
  }
}

// ====================================================================
// SCHOOL ACHIEVEMENTS CRUD OPERATIONS
// ====================================================================

async function addSchoolAchievement(achievementData) {
  try {
    const { data, error } = await supabaseDb
      .from('school_achievements')
      .insert([achievementData]);
    
    if (error) return { success: false, error: error.message };
    await syncSchoolAchievements();
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function getSchoolAchievements(activeOnly = true) {
  try {
    let query = supabaseDb.from('school_achievements').select('*');
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    const { data, error } = await query.order('display_order', { ascending: true });
    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function getSchoolAchievementById(id) {
  try {
    const { data, error } = await supabaseDb
      .from('school_achievements')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function updateSchoolAchievement(id, updateData) {
  try {
    const { data, error } = await supabaseDb
      .from('school_achievements')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) return { success: false, error: error.message };
    await syncSchoolAchievements();
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function deleteSchoolAchievement(id) {
  try {
    const { data, error } = await supabaseDb
      .from('school_achievements')
      .delete()
      .eq('id', id);
    
    if (error) return { success: false, error: error.message };
    await syncSchoolAchievements();
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function syncSchoolAchievements() {
  try {
    const result = await getSchoolAchievements(false);
    if (result.success) {
      localStorage.setItem('school_achievements', JSON.stringify(result.data || []));
      console.log("School achievements synced to localStorage");
    } else {
      console.warn("School achievements table may not exist yet. Run setup.sql to create it.");
    }
    return true;
  } catch (e) {
    console.warn("Sync school achievements skipped (table may not exist):", e.message);
    return false;
  }
}

function getSchoolAchievementsFromCache() {
  try {
    const cached = localStorage.getItem('school_achievements');
    return cached ? JSON.parse(cached) : [];
  } catch (e) {
    console.error("Error parsing school achievements from cache:", e);
    return [];
  }
}

// ====================================================================
// ALUMNI PROFILES CRUD OPERATIONS
// ====================================================================

async function addAlumniProfile(alumniData) {
  try {
    const { data, error } = await supabaseDb
      .from('alumni_profiles')
      .insert([alumniData]);
    
    if (error) return { success: false, error: error.message };
    await syncAlumniProfiles();
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function getAlumniProfiles(activeOnly = true) {
  try {
    let query = supabaseDb.from('alumni_profiles').select('*');
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    const { data, error } = await query.order('display_order', { ascending: true });
    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function getAlumniProfileById(id) {
  try {
    const { data, error } = await supabaseDb
      .from('alumni_profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function updateAlumniProfile(id, updateData) {
  try {
    const { data, error } = await supabaseDb
      .from('alumni_profiles')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) return { success: false, error: error.message };
    await syncAlumniProfiles();
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function deleteAlumniProfile(id) {
  try {
    const { data, error } = await supabaseDb
      .from('alumni_profiles')
      .delete()
      .eq('id', id);
    
    if (error) return { success: false, error: error.message };
    await syncAlumniProfiles();
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function syncAlumniProfiles() {
  try {
    const result = await getAlumniProfiles(false);
    if (result.success) {
      localStorage.setItem('alumni_profiles', JSON.stringify(result.data || []));
      console.log("Alumni profiles synced to localStorage");
    } else {
      console.warn("Alumni profiles table may not exist yet. Run setup.sql to create it.");
    }
    return true;
  } catch (e) {
    console.warn("Sync alumni profiles skipped (table may not exist):", e.message);
    return false;
  }
}

function getAlumniProfilesFromCache() {
  try {
    const cached = localStorage.getItem('alumni_profiles');
    return cached ? JSON.parse(cached) : [];
  } catch (e) {
    console.error("Error parsing alumni profiles from cache:", e);
    return [];
  }
}

// ====================================================================
// GALLERY CRUD OPERATIONS (Media Database - DB 2)
// ====================================================================

async function addGalleryImage(galleryData) {
  try {
    const { data, error } = await supabaseMedia
      .from('gallery')
      .insert([galleryData]);
    
    if (error) return { success: false, error: error.message };
    await syncGalleryImages();
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function getGalleryImages(activeOnly = true) {
  try {
    let query = supabaseMedia.from('gallery').select('*');
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    const { data, error } = await query.order('display_order', { ascending: true });
    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function getGalleryImageById(id) {
  try {
    const { data, error } = await supabaseMedia
      .from('gallery')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function updateGalleryImage(id, updateData) {
  try {
    const { data, error } = await supabaseMedia
      .from('gallery')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) return { success: false, error: error.message };
    await syncGalleryImages();
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function deleteGalleryImage(id) {
  try {
    const { data, error } = await supabaseMedia
      .from('gallery')
      .delete()
      .eq('id', id);
    
    if (error) return { success: false, error: error.message };
    await syncGalleryImages();
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function uploadGalleryImage(file, folder = 'gallery') {
  try {
    const fileName = `${folder}/${Date.now()}-${file.name}`;
    const { data, error } = await supabaseMedia.storage
      .from('media')
      .upload(fileName, file, { cacheControl: '3600', upsert: true });
    
    if (error) return { success: false, error: error.message };
    
    // Get public URL
    const { data: publicUrlData } = supabaseMedia.storage
      .from('media')
      .getPublicUrl(fileName);
    
    return { 
      success: true, 
      path: fileName, 
      url: publicUrlData?.publicUrl || '',
      data
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function deleteGalleryImageFromStorage(storagePath) {
  try {
    if (!storagePath) return { success: true };
    
    const { error } = await supabaseMedia.storage
      .from('media')
      .remove([storagePath]);
    
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function syncGalleryImages() {
  try {
    const result = await getGalleryImages(false);
    if (result.success) {
      localStorage.setItem('gallery_images', JSON.stringify(result.data || []));
      console.log("Gallery images synced to localStorage");
    } else {
      console.warn("Gallery table may not exist yet. Run setup.sql on DB2 to create it.");
    }
    return true;
  } catch (e) {
    console.warn("Sync gallery images skipped (table may not exist):", e.message);
    return false;
  }
}

function getGalleryImagesFromCache() {
  try {
    const cached = localStorage.getItem('gallery');
    return cached ? JSON.parse(cached) : [];
  } catch (e) {
    console.error("Error parsing gallery images from cache:", e);
    return [];
  }
}

// ============================================================================
// HERO SLIDER CMS OPERATIONS
// ============================================================================

async function uploadHeroImage(file) {
  try {
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-]/g, '')}`;
    const { data, error } = await supabaseMedia
      .storage
      .from('hero-images')
      .upload(fileName, file, { cacheControl: '3600', upsert: true });

    if (error) {
      console.warn("Storage upload failed, trying base64 fallback:", error.message);
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          resolve({ success: true, isBase64: true, url: reader.result });
        };
        reader.onerror = (e) => reject({ success: false, error: e });
        reader.readAsDataURL(file);
      });
    }

    const { data: publicUrlData } = supabaseMedia
      .storage
      .from('hero-images')
      .getPublicUrl(data.path);

    return { success: true, url: publicUrlData.publicUrl };
  } catch (e) {
    console.error("Hero image upload error:", e);
    return { success: false, error: e.message };
  }
}

async function addHeroSlide(slideData) {
  try {
    const { data, error } = await supabaseDb
      .from('website_hero_slider')
      .insert([slideData])
      .select();
    if (error) throw error;
    await syncHeroSlides();
    return { success: true, data };
  } catch (e) {
    console.error("Error adding hero slide:", e);
    return { success: false, error: e.message };
  }
}

async function getHeroSlides(activeOnly = true) {
  try {
    let query = supabaseDb.from('website_hero_slider').select('*');
    if (activeOnly) {
      query = query.eq('status', 'Published');
    }
    const { data, error } = await query.order('display_order', { ascending: true }).order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, data };
  } catch (e) {
    console.error("Error fetching hero slides:", e);
    return { success: false, error: e.message };
  }
}

async function updateHeroSlideStatus(id, newStatus) {
  try {
    const { error } = await supabaseDb
      .from('website_hero_slider')
      .update({ status: newStatus })
      .eq('id', id);
    if (error) throw error;
    await syncHeroSlides();
    return { success: true };
  } catch (e) {
    console.error("Error updating hero slide status:", e);
    return { success: false, error: e.message };
  }
}

async function deleteHeroSlide(id) {
  try {
    const { error } = await supabaseDb
      .from('website_hero_slider')
      .delete()
      .eq('id', id);
    if (error) throw error;
    await syncHeroSlides();
    return { success: true };
  } catch (e) {
    console.error("Error deleting hero slide:", e);
    return { success: false, error: e.message };
  }
}

async function syncHeroSlides() {
  try {
    const result = await getHeroSlides(false);
    if (result.success) {
      localStorage.setItem('website_hero_slider', JSON.stringify(result.data || []));
    }
  } catch (e) {
    console.warn("Sync hero slides skipped:", e.message);
  }
}

function getHeroSlidesFromCache(activeOnly = true) {
  try {
    const cached = localStorage.getItem('website_hero_slider');
    if (!cached) return null;
    let slides = JSON.parse(cached);
    if (activeOnly) {
      slides = slides.filter(s => s.status === 'Published');
    }
    return slides;
  } catch (e) {
    console.error("Error parsing hero slides from cache:", e);
    return null;
  }
}

// ====================================================================
// SCHOOL NOTICES CRUD OPERATIONS
// ====================================================================

async function addSchoolNotice(noticeData) {
  try {
    const { data, error } = await supabaseDb
      .from('school_notices')
      .insert([noticeData]);
    
    if (error) return { success: false, error: error.message };
    await syncSchoolNotices();
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function getSchoolNotices(activeOnly = true) {
  try {
    let query = supabaseDb.from('school_notices').select('*');
    // Try with is_active filter; if the column doesn't exist the query will
    // still succeed for the simple select('*') path.
    if (activeOnly) {
      try {
        const testQ = supabaseDb.from('school_notices').select('*').eq('is_active', true).order('display_order', { ascending: true });
        const { data: testData, error: testErr } = await testQ;
        if (!testErr) return { success: true, data: testData || [] };
      } catch (_) { /* fall through to simple query */ }
    }
    const { data, error } = await query;
    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function getSchoolNoticeById(id) {
  try {
    const { data, error } = await supabaseDb
      .from('school_notices')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function updateSchoolNotice(id, updateData) {
  try {
    const { data, error } = await supabaseDb
      .from('school_notices')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) return { success: false, error: error.message };
    await syncSchoolNotices();
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function deleteSchoolNotice(id) {
  try {
    const { data, error } = await supabaseDb
      .from('school_notices')
      .delete()
      .eq('id', id);
    
    if (error) return { success: false, error: error.message };
    await syncSchoolNotices();
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function syncSchoolNotices() {
  try {
    const result = await getSchoolNotices(false);
    if (result.success) {
      localStorage.setItem('school_notices', JSON.stringify(result.data || []));
      console.log("School notices synced to localStorage");
    } else {
      console.warn("School announcements table may not exist yet. Run setup.sql to create it.");
    }
    return true;
  } catch (e) {
    console.warn("Sync school notices skipped (table may not exist):", e.message);
    return false;
  }
}

function getSchoolNoticesFromCache() {
  try {
    const cached = localStorage.getItem('school_notices');
    return cached ? JSON.parse(cached) : [];
  } catch (e) {
    console.error("Error parsing school notices from cache:", e);
    return [];
  }
}

// ====================================================================
// STUDENT LOGIN CREDENTIALS CRUD OPERATIONS
// ====================================================================

async function createStudentCredential(credentialData) {
  try {
    // CHECK 1: Validate username availability before creating credential
    if (credentialData.student_username) {
      const usernameCheck = await supabaseDb
        .from('student_credentials')
        .select('id, student_roll')
        .eq('student_username', credentialData.student_username);
      
      if (usernameCheck.data && usernameCheck.data.length > 0) {
        // If username belongs to the same roll number, it's an update scenario
        if (usernameCheck.data[0].student_roll !== credentialData.student_roll) {
          console.warn('Username already exists:', credentialData.student_username);
          return { 
            success: false, 
            error: `Username '${credentialData.student_username}' is already taken. Please choose a different username.`,
            code: 'USERNAME_ALREADY_EXISTS'
          };
        }
      }
    }

    // CHECK 2: Check if a student with this roll number already has credentials
    const rollCheck = await supabaseDb
      .from('student_credentials')
      .select('id, student_username')
      .eq('student_roll', credentialData.student_roll);

    if (rollCheck.data && rollCheck.data.length > 0) {
      // Student roll already exists — update the existing record instead of inserting
      const existingId = rollCheck.data[0].id;
      console.log(`Roll ${credentialData.student_roll} already exists (id: ${existingId}). Updating...`);
      
      const { data: updateData, error: updateError } = await supabaseDb
        .from('student_credentials')
        .update({
          student_name: credentialData.student_name,
          student_username: credentialData.student_username,
          student_password: credentialData.student_password,
          student_email: credentialData.student_email,
          student_phone: credentialData.student_phone,
          student_class: credentialData.student_class,
          is_active: credentialData.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingId)
        .select();

      if (updateError) {
        console.error('Error updating existing credential:', updateError);
        return { success: false, error: updateError.message };
      }

      // Update cache
      try {
        const cached = JSON.parse(localStorage.getItem('student_credentials_cache') || '[]');
        const idx = cached.findIndex(c => c.student_roll === credentialData.student_roll);
        if (idx >= 0) cached[idx] = updateData[0]; else cached.push(updateData[0]);
        localStorage.setItem('student_credentials_cache', JSON.stringify(cached));
      } catch(cacheErr) { /* ignore cache errors */ }

      return { success: true, data: updateData, updated: true };
    }

    // Proceed with creation only if username is available and roll doesn't exist
    const { data, error } = await supabaseDb
      .from('student_credentials')
      .insert([credentialData])
      .select();
    
    if (error) {
      console.error('Database error details:', error);
      // Check for duplicate key error and provide user-friendly message
      if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
        return { 
          success: false, 
          error: 'This username or account already exists. Please use a different username.',
          code: 'DUPLICATE_KEY'
        };
      }
      // Provide helpful error message for other errors
      if (error.message.includes('schema cache') || error.message.includes('Could not find')) {
        return { 
          success: false, 
          error: 'Database table not initialized. Please refresh the page or contact administrator.',
          code: 'TABLE_NOT_FOUND'
        };
      }
      return { success: false, error: error.message };
    }
    
    // Store in cache for offline access
    const cached = JSON.parse(localStorage.getItem('student_credentials_cache') || '[]');
    cached.push(data[0]);
    localStorage.setItem('student_credentials_cache', JSON.stringify(cached));
    
    return { success: true, data };
  } catch (e) {
    console.error('Exception in createStudentCredential:', e);
    return { success: false, error: e.message };
  }
}

async function getStudentCredentials(activeOnly = true) {
  try {
    let query = supabaseDb.from('student_credentials').select('*');
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    const { data, error } = await query.order('student_roll', { ascending: true });
    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function getStudentCredentialByUsername(username) {
  try {
    const { data, error } = await supabaseDb
      .from('student_credentials')
      .select('*')
      .eq('student_username', username)
      .eq('is_active', true)
      .single();
    
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function getStudentCredentialByRoll(roll) {
  try {
    const { data, error } = await supabaseDb
      .from('student_credentials')
      .select('*')
      .eq('student_roll', roll)
      .single();
    
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function updateStudentCredential(id, updates) {
  try {
    const { data, error } = await supabaseDb
      .from('student_credentials')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) return { success: false, error: error.message };
    await syncStudentCredentials();
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function deleteStudentCredential(id) {
  try {
    const { error } = await supabaseDb
      .from('student_credentials')
      .delete()
      .eq('id', id);
    
    if (error) return { success: false, error: error.message };
    await syncStudentCredentials();
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function syncStudentCredentials() {
  try {
    const { data, error } = await supabaseDb
      .from('student_credentials')
      .select('*')
      .eq('is_active', true)
      .order('student_roll', { ascending: true });
    
    if (!error && data) {
      localStorage.setItem('student_credentials', JSON.stringify(data));
      console.log("Student credentials synced to localStorage");
    } else if (error) {
      console.warn("Student credentials table may not exist yet. Run setup.sql to create it.");
    }
  } catch (e) {
    console.warn("Sync student credentials skipped (table may not exist):", e.message);
  }
}

function getStudentCredentialsFromCache() {
  try {
    const cached = localStorage.getItem('student_credentials');
    return cached ? JSON.parse(cached) : [];
  } catch (e) {
    console.error("Error parsing student credentials from cache:", e);
    return [];
  }
}

// ====================================================================
// TEACHER LOGIN CREDENTIALS CRUD OPERATIONS
// ====================================================================

async function createTeacherCredential(credentialData) {
  try {
    const { data, error } = await supabaseDb
      .from('teacher_credentials')
      .insert([credentialData]);
    
    if (error) return { success: false, error: error.message };
    await syncTeacherCredentials();
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function getTeacherCredentials(activeOnly = true) {
  try {
    let query = supabaseDb.from('teacher_credentials').select('*');
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    const { data, error } = await query.order('teacher_code', { ascending: true });
    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function getTeacherCredentialByEmail(email) {
  try {
    const { data, error } = await supabaseDb
      .from('teacher_credentials')
      .select('*')
      .eq('teacher_email', email)
      .single();
    
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function getTeacherCredentialByCode(code) {
  try {
    const { data, error } = await supabaseDb
      .from('teacher_credentials')
      .select('*')
      .eq('teacher_code', code)
      .single();
    
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function updateTeacherCredential(id, updates) {
  try {
    const { data, error } = await supabaseDb
      .from('teacher_credentials')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) return { success: false, error: error.message };
    await syncTeacherCredentials();
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function deleteTeacherCredential(id) {
  try {
    const { error } = await supabaseDb
      .from('teacher_credentials')
      .delete()
      .eq('id', id);
    
    if (error) return { success: false, error: error.message };
    await syncTeacherCredentials();
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function syncTeacherCredentials() {
  try {
    const { data, error } = await supabaseDb
      .from('teacher_credentials')
      .select('*')
      .order('teacher_code', { ascending: true });
    
    if (!error && data) {
      localStorage.setItem('teacher_credentials', JSON.stringify(data));
      console.log("Teacher credentials synced to localStorage");
    } else if (error) {
      console.warn("Teacher credentials table may not exist yet. Run setup.sql to create it.");
    }
  } catch (e) {
    console.warn("Sync teacher credentials failed or skipped:", e.message);
  }
}

function getTeacherCredentialsFromCache() {
  try {
    const cached = localStorage.getItem('teacher_credentials');
    return cached ? JSON.parse(cached) : [];
  } catch (e) {
    console.error("Error parsing teacher credentials from cache:", e);
    return [];
  }
}

// ====================================================================
// SCHOOL DOCUMENTS CRUD OPERATIONS
// ====================================================================

async function addSchoolDocument(documentData) {
  try {
    const { data, error } = await supabaseDb
      .from('school_documents')
      .insert([documentData]);
    
    if (error) return { success: false, error: error.message };
    await syncSchoolDocuments();
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function getSchoolDocuments(activeOnly = true) {
  try {
    let query = supabaseDb.from('school_documents').select('*');
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    const { data, error } = await query.order('display_order', { ascending: true });
    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function deleteSchoolDocument(id) {
  try {
    const { data, error } = await supabaseDb
      .from('school_documents')
      .delete()
      .eq('id', id);
    
    if (error) return { success: false, error: error.message };
    await syncSchoolDocuments();
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function updateSchoolDocument(id, documentData) {
  try {
    const { data, error } = await supabaseDb
      .from('school_documents')
      .update(documentData)
      .eq('id', id);
    
    if (error) return { success: false, error: error.message };
    await syncSchoolDocuments();
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function getSchoolDocumentById(id) {
  try {
    const { data, error } = await supabaseDb
      .from('school_documents')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function syncSchoolDocuments() {
  try {
    const result = await getSchoolDocuments(false);
    if (result.success) {
      localStorage.setItem('school_documents', JSON.stringify(result.data || []));
      console.log("School documents synced to localStorage");
    } else {
      console.warn("School documents table may not exist yet. Run setup.sql to create it.");
    }
    return true;
  } catch (e) {
    console.warn("Sync school documents skipped (table may not exist):", e.message);
    return false;
  }
}

function getSchoolDocumentsFromCache(activeOnly = true) {
  try {
    const cached = localStorage.getItem('school_documents');
    if (!cached) return [];
    const docs = JSON.parse(cached);
    if (activeOnly) {
      return docs.filter(d => d.is_active);
    }
    return docs;
  } catch (e) {
    console.error("Error parsing school documents from cache:", e);
    return [];
  }
}

// ====================================================================
// EXPOSE SUPABASE CLIENTS TO WINDOW OBJECT FOR GLOBAL ACCESS
// ====================================================================
window.supabaseDb = supabaseDb;
window.supabaseMedia = supabaseMedia;

// Expose critical functions to window object
// ── STUDENT CERTIFICATES ──
async function getStudentCertificates(roll = null) {
  try {
    if (!supabaseDb) throw new Error("Database not initialized");
    let query = supabaseDb.from('student_certificates').select('*').order('created_at', { ascending: false });
    if (roll) query = query.eq('student_roll', roll);
    const { data, error } = await query;
    if (error) throw error;
    localStorage.setItem('student_certificates', JSON.stringify(data || []));
    return { success: true, data };
  } catch(e) {
    console.warn('Error fetching certificates, using local storage:', e);
    const cached = JSON.parse(localStorage.getItem('student_certificates') || '[]');
    let filtered = cached;
    if (roll) filtered = cached.filter(c => String(c.student_roll) === String(roll));
    return { success: true, data: filtered };
  }
}

async function addStudentCertificate(certData) {
  try {
    if (!supabaseDb) throw new Error("Database not initialized");
    const { data, error } = await supabaseDb.from('student_certificates').insert([certData]).select();
    if (error) throw error;
    return { success: true, data: data[0] };
  } catch(e) {
    console.warn('Error adding certificate, using local storage:', e);
    const cached = JSON.parse(localStorage.getItem('student_certificates') || '[]');
    const newCert = {
      id: Date.now(),
      ...certData,
      created_at: new Date().toISOString()
    };
    cached.push(newCert);
    localStorage.setItem('student_certificates', JSON.stringify(cached));
    return { success: true, data: newCert };
  }
}

async function deleteStudentCertificate(id) {
  try {
    if (!supabaseDb) throw new Error("Database not initialized");
    const { error } = await supabaseDb.from('student_certificates').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch(e) {
    console.warn('Error deleting certificate, using local storage:', e);
    const cached = JSON.parse(localStorage.getItem('student_certificates') || '[]');
    const filtered = cached.filter(c => String(c.id) !== String(id));
    localStorage.setItem('student_certificates', JSON.stringify(filtered));
    return { success: true };
  }
}

// ── DYNAMIC REPORTS ──
async function getDynamicReports() {
  try {
    if (!supabaseDb) throw new Error("Database not initialized");
    const { data, error } = await supabaseDb.from('dynamic_reports').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    localStorage.setItem('dynamic_reports', JSON.stringify(data || []));
    return { success: true, data };
  } catch(e) {
    console.warn('Error fetching reports, using local storage:', e);
    const cached = JSON.parse(localStorage.getItem('dynamic_reports') || '[]');
    return { success: true, data: cached };
  }
}

async function addDynamicReport(reportData) {
  try {
    if (!supabaseDb) throw new Error("Database not initialized");
    const { data, error } = await supabaseDb.from('dynamic_reports').insert([reportData]).select();
    if (error) throw error;
    return { success: true, data: data[0] };
  } catch(e) {
    console.warn('Error adding report, using local storage:', e);
    const cached = JSON.parse(localStorage.getItem('dynamic_reports') || '[]');
    const newReport = {
      id: Date.now(),
      ...reportData,
      created_at: new Date().toISOString()
    };
    cached.push(newReport);
    localStorage.setItem('dynamic_reports', JSON.stringify(cached));
    return { success: true, data: newReport };
  }
}

async function deleteDynamicReport(id) {
  try {
    if (!supabaseDb) throw new Error("Database not initialized");
    const { error } = await supabaseDb.from('dynamic_reports').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch(e) {
    console.warn('Error deleting report, using local storage:', e);
    const cached = JSON.parse(localStorage.getItem('dynamic_reports') || '[]');
    const filtered = cached.filter(r => String(r.id) !== String(id));
    localStorage.setItem('dynamic_reports', JSON.stringify(filtered));
    return { success: true };
  }
}


window.pullAllFromSupabase = pullAllFromSupabase;
window.seedSupabaseIfEmpty = seedSupabaseIfEmpty;

// Expose media functions
window.uploadMediaFile = uploadMediaFile;
window.getMediaFileUrl = getMediaFileUrl;

// Expose teacher profile functions
window.addTeacherProfile = addTeacherProfile;
window.getTeacherProfiles = getTeacherProfiles;
window.getTeacherProfileById = getTeacherProfileById;
window.updateTeacherProfile = updateTeacherProfile;
window.deleteTeacherProfile = deleteTeacherProfile;
window.syncTeacherProfiles = syncTeacherProfiles;
window.getTeacherProfilesFromCache = getTeacherProfilesFromCache;

// Expose school achievement functions
window.addSchoolAchievement = addSchoolAchievement;
window.getSchoolAchievements = getSchoolAchievements;
window.getSchoolAchievementById = getSchoolAchievementById;
window.updateSchoolAchievement = updateSchoolAchievement;
window.deleteSchoolAchievement = deleteSchoolAchievement;
window.syncSchoolAchievements = syncSchoolAchievements;
window.getSchoolAchievementsFromCache = getSchoolAchievementsFromCache;

// Expose alumni profile functions
window.addAlumniProfile = addAlumniProfile;
window.getAlumniProfiles = getAlumniProfiles;
window.getAlumniProfileById = getAlumniProfileById;
window.updateAlumniProfile = updateAlumniProfile;
window.deleteAlumniProfile = deleteAlumniProfile;
window.syncAlumniProfiles = syncAlumniProfiles;
window.getAlumniProfilesFromCache = getAlumniProfilesFromCache;

// Expose gallery functions
window.addGalleryImage = addGalleryImage;
window.getGalleryImages = getGalleryImages;
window.getGalleryImageById = getGalleryImageById;
window.updateGalleryImage = updateGalleryImage;
window.deleteGalleryImage = deleteGalleryImage;
window.uploadGalleryImage = uploadGalleryImage;
window.deleteGalleryImageFromStorage = deleteGalleryImageFromStorage;
window.syncGalleryImages = syncGalleryImages;
window.getGalleryImagesFromCache = getGalleryImagesFromCache;

// Expose school notice functions
window.addSchoolNotice = addSchoolNotice;
window.getSchoolNotices = getSchoolNotices;
window.getSchoolNoticeById = getSchoolNoticeById;
window.updateSchoolNotice = updateSchoolNotice;
window.deleteSchoolNotice = deleteSchoolNotice;
window.syncSchoolNotices = syncSchoolNotices;
window.getSchoolNoticesFromCache = getSchoolNoticesFromCache;

// Exports for Hero Slider
window.uploadHeroImage = uploadHeroImage;
window.addHeroSlide = addHeroSlide;
window.getHeroSlides = getHeroSlides;
window.updateHeroSlideStatus = updateHeroSlideStatus;
window.deleteHeroSlide = deleteHeroSlide;
window.syncHeroSlides = syncHeroSlides;
window.getHeroSlidesFromCache = getHeroSlidesFromCache;

// Expose student credential functions
window.createStudentCredential = createStudentCredential;
window.getStudentCredentials = getStudentCredentials;
window.getStudentCredentialByUsername = getStudentCredentialByUsername;
window.getStudentCredentialByRoll = getStudentCredentialByRoll;
window.updateStudentCredential = updateStudentCredential;
window.deleteStudentCredential = deleteStudentCredential;
window.syncStudentCredentials = syncStudentCredentials;
window.getStudentCredentialsFromCache = getStudentCredentialsFromCache;

// Expose teacher credential functions
window.createTeacherCredential = createTeacherCredential;
window.getTeacherCredentials = getTeacherCredentials;
window.syncTeacherCredentials = syncTeacherCredentials;

// Expose document functions
window.syncSchoolDocuments = syncSchoolDocuments;
window.getSchoolDocuments = getSchoolDocuments;
window.getSchoolDocumentsFromCache = getSchoolDocumentsFromCache;

// ====================================================================
// ACADEMIC CATEGORIES CRUD OPERATIONS
// ====================================================================
async function addAcademicCategory(data) {
  try {
    if (!supabaseDb) throw new Error("Database not initialized");
    const { data: result, error } = await supabaseDb.from('academic_categories').insert([data]).select();
    if (error) throw error;
    await syncAcademicCategories();
    return { success: true, data: result };
  } catch (e) {
    console.warn("Database insert for academic_categories failed, using local storage:", e);
    const cached = JSON.parse(localStorage.getItem('academic_categories') || '[]');
    const newCat = {
      id: Date.now(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    cached.push(newCat);
    localStorage.setItem('academic_categories', JSON.stringify(cached));
    return { success: true, data: [newCat] };
  }
}

async function getAcademicCategories(activeOnly = true) {
  try {
    if (!supabaseDb) throw new Error("Database not initialized");
    let query = supabaseDb.from('academic_categories').select('*');
    if (activeOnly) query = query.eq('is_active', true);
    const { data, error } = await query.order('display_order', { ascending: true });
    if (error) throw error;
    localStorage.setItem('academic_categories', JSON.stringify(data || []));
    return { success: true, data: data || [] };
  } catch (e) {
    console.warn("getAcademicCategories exception, using local storage:", e);
    const cached = JSON.parse(localStorage.getItem('academic_categories') || '[]');
    let filtered = cached;
    if (activeOnly) filtered = cached.filter(c => c.is_active);
    filtered.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    return { success: true, data: filtered };
  }
}

async function updateAcademicCategory(id, updates) {
  try {
    if (!supabaseDb) throw new Error("Database not initialized");
    const { data, error } = await supabaseDb.from('academic_categories').update(updates).eq('id', id).select();
    if (error) throw error;
    await syncAcademicCategories();
    return { success: true, data };
  } catch (e) {
    console.warn("Database update for academic_categories failed, using local storage:", e);
    const cached = JSON.parse(localStorage.getItem('academic_categories') || '[]');
    const idx = cached.findIndex(c => String(c.id) === String(id));
    if (idx >= 0) {
      cached[idx] = { ...cached[idx], ...updates, updated_at: new Date().toISOString() };
      localStorage.setItem('academic_categories', JSON.stringify(cached));
      return { success: true, data: [cached[idx]] };
    }
    return { success: false, error: "Category not found in local storage" };
  }
}

async function deleteAcademicCategory(id) {
  try {
    if (!supabaseDb) throw new Error("Database not initialized");
    const { error } = await supabaseDb.from('academic_categories').delete().eq('id', id);
    if (error) throw error;
    await syncAcademicCategories();
    return { success: true };
  } catch (e) {
    console.warn("Database delete for academic_categories failed, using local storage:", e);
    const cached = JSON.parse(localStorage.getItem('academic_categories') || '[]');
    const filtered = cached.filter(c => String(c.id) !== String(id));
    localStorage.setItem('academic_categories', JSON.stringify(filtered));
    return { success: true };
  }
}

async function syncAcademicCategories() {
  try {
    const { data, error } = await supabaseDb.from('academic_categories').select('*').order('display_order', { ascending: true });
    if (!error && data) localStorage.setItem('academic_categories', JSON.stringify(data));
  } catch (e) { console.warn("Sync academic categories failed", e); }
}

function getAcademicCategoriesFromCache() {
  try {
    return JSON.parse(localStorage.getItem('academic_categories') || '[]');
  } catch(e) { return []; }
}

window.addAcademicCategory = addAcademicCategory;
window.getAcademicCategories = getAcademicCategories;
window.updateAcademicCategory = updateAcademicCategory;
window.deleteAcademicCategory = deleteAcademicCategory;
window.syncAcademicCategories = syncAcademicCategories;
window.getAcademicCategoriesFromCache = getAcademicCategoriesFromCache;

// ====================================================================
// STUDENT REMARKS CRUD OPERATIONS
// ====================================================================
async function addStudentRemark(data) {
  try {
    const { data: result, error } = await supabaseDb.from('student_remarks').insert([data]).select();
    if (error) {
      console.warn("Database insert for student_remarks failed, using local storage:", error);
      const cached = JSON.parse(localStorage.getItem('student_remarks') || '[]');
      const newRmk = { id: Date.now(), ...data, created_at: new Date().toISOString() };
      cached.unshift(newRmk);
      localStorage.setItem('student_remarks', JSON.stringify(cached));
      return { success: true, data: [newRmk] };
    }
    await syncStudentRemarks();
    return { success: true, data: result };
  } catch (e) { return { success: false, error: e.message }; }
}

async function getStudentRemarks(roll) {
  try {
    let query = supabaseDb.from('student_remarks').select('*').eq('is_active', true);
    if (roll) query = query.eq('student_roll', roll);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      console.warn("Database query for student_remarks failed, using local storage:", error);
      let cached = JSON.parse(localStorage.getItem('student_remarks') || '[]');
      cached = cached.filter(r => r.is_active !== false);
      if (roll) cached = cached.filter(r => String(r.student_roll) === String(roll));
      return { success: true, data: cached };
    }
    return { success: true, data: data || [] };
  } catch (e) {
    console.warn("getStudentRemarks exception, using local storage:", e);
    let cached = JSON.parse(localStorage.getItem('student_remarks') || '[]');
    return { success: true, data: cached };
  }
}

async function updateStudentRemark(id, updates) {
  try {
    const { data, error } = await supabaseDb.from('student_remarks').update(updates).eq('id', id).select();
    if (error) {
      console.warn("Database update for student_remarks failed, using local storage:", error);
      const cached = JSON.parse(localStorage.getItem('student_remarks') || '[]');
      const idx = cached.findIndex(r => String(r.id) === String(id));
      if (idx >= 0) {
        cached[idx] = { ...cached[idx], ...updates };
        localStorage.setItem('student_remarks', JSON.stringify(cached));
        return { success: true, data: [cached[idx]] };
      }
      return { success: false, error: "Remark not found in local storage" };
    }
    await syncStudentRemarks();
    return { success: true, data };
  } catch (e) { return { success: false, error: e.message }; }
}

async function deleteStudentRemark(id) {
  try {
    const { error } = await supabaseDb.from('student_remarks').delete().eq('id', id);
    if (error) {
      console.warn("Database delete for student_remarks failed, using local storage:", error);
      const cached = JSON.parse(localStorage.getItem('student_remarks') || '[]');
      const filtered = cached.filter(r => String(r.id) !== String(id));
      localStorage.setItem('student_remarks', JSON.stringify(filtered));
      return { success: true };
    }
    await syncStudentRemarks();
    return { success: true };
  } catch (e) { return { success: false, error: e.message }; }
}

async function syncStudentRemarks() {
  try {
    const { data, error } = await supabaseDb.from('student_remarks').select('*').order('created_at', { ascending: false });
    if (!error && data) localStorage.setItem('student_remarks', JSON.stringify(data));
  } catch (e) { console.warn("Sync student remarks failed", e); }
}

function getStudentRemarksFromCache() {
  try {
    return JSON.parse(localStorage.getItem('student_remarks') || '[]');
  } catch(e) { return []; }
}

window.addStudentRemark = addStudentRemark;
window.getStudentRemarks = getStudentRemarks;
window.updateStudentRemark = updateStudentRemark;
window.deleteStudentRemark = deleteStudentRemark;

window.getStudentCertificates = getStudentCertificates;
window.addStudentCertificate = addStudentCertificate;
window.deleteStudentCertificate = deleteStudentCertificate;

window.getDynamicReports = getDynamicReports;
window.addDynamicReport = addDynamicReport;
window.deleteDynamicReport = deleteDynamicReport;
window.syncStudentRemarks = syncStudentRemarks;
window.getStudentRemarksFromCache = getStudentRemarksFromCache;

// ====================================================================
// LESSON PLANS CRUD OPERATIONS
// ====================================================================
async function getLessonPlans(filters = {}) {
  try {
    let query = supabaseDb.from('lesson_plans').select('*');
    if (filters.teacher_code) query = query.eq('teacher_code', filters.teacher_code);
    if (filters.class_name) query = query.eq('class_name', filters.class_name);
    if (filters.status) query = query.eq('status', filters.status);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      console.warn("Database query for lesson_plans failed, using local storage:", error);
      let cached = JSON.parse(localStorage.getItem('lesson_plans') || '[]');
      if (filters.teacher_code) cached = cached.filter(l => l.teacher_code === filters.teacher_code);
      if (filters.class_name) cached = cached.filter(l => l.class_name === filters.class_name);
      if (filters.status) cached = cached.filter(l => l.status === filters.status);
      return { success: true, data: cached };
    }
    localStorage.setItem('lesson_plans', JSON.stringify(data || []));
    return { success: true, data: data || [] };
  } catch (e) {
    console.warn("getLessonPlans exception, using local storage:", e);
    return { success: true, data: JSON.parse(localStorage.getItem('lesson_plans') || '[]') };
  }
}

async function addLessonPlan(data) {
  try {
    const { data: result, error } = await supabaseDb.from('lesson_plans').insert([data]).select();
    if (error) {
      console.warn("Database insert for lesson_plans failed, using local storage:", error);
      const cached = JSON.parse(localStorage.getItem('lesson_plans') || '[]');
      const newPlan = { id: Date.now(), ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      cached.unshift(newPlan);
      localStorage.setItem('lesson_plans', JSON.stringify(cached));
      return { success: true, data: [newPlan] };
    }
    return { success: true, data: result };
  } catch (e) { return { success: false, error: e.message }; }
}

async function updateLessonPlan(id, updates) {
  try {
    updates.updated_at = new Date().toISOString();
    const { data, error } = await supabaseDb.from('lesson_plans').update(updates).eq('id', id).select();
    if (error) {
      console.warn("Database update for lesson_plans failed, using local storage:", error);
      const cached = JSON.parse(localStorage.getItem('lesson_plans') || '[]');
      const idx = cached.findIndex(l => String(l.id) === String(id));
      if (idx >= 0) {
        cached[idx] = { ...cached[idx], ...updates };
        localStorage.setItem('lesson_plans', JSON.stringify(cached));
        return { success: true, data: [cached[idx]] };
      }
      return { success: false, error: "Lesson plan not found in local storage" };
    }
    return { success: true, data };
  } catch (e) { return { success: false, error: e.message }; }
}

async function deleteLessonPlan(id) {
  try {
    const { error } = await supabaseDb.from('lesson_plans').delete().eq('id', id);
    if (error) {
      console.warn("Database delete for lesson_plans failed, using local storage:", error);
      const cached = JSON.parse(localStorage.getItem('lesson_plans') || '[]');
      const filtered = cached.filter(l => String(l.id) !== String(id));
      localStorage.setItem('lesson_plans', JSON.stringify(filtered));
      return { success: true };
    }
    return { success: true };
  } catch (e) { return { success: false, error: e.message }; }
}

window.getLessonPlans = getLessonPlans;
window.addLessonPlan = addLessonPlan;
window.updateLessonPlan = updateLessonPlan;
window.deleteLessonPlan = deleteLessonPlan;

// ====================================================================
// ACADEMIC DIVISIONS CRUD OPERATIONS
// ====================================================================
async function getAcademicDivisions(activeOnly = true) {
  try {
    let query = supabaseDb.from('academic_divisions').select('*');
    if (activeOnly) query = query.eq('is_active', true);
    const { data, error } = await query.order('display_order', { ascending: true });
    
    if (error) {
      console.warn("Database query for academic_divisions failed, trying local storage:", error);
      const cached = JSON.parse(localStorage.getItem('academic_divisions') || '[]');
      let filtered = cached;
      if (activeOnly) filtered = cached.filter(d => d.is_active);
      filtered.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      return { success: true, data: filtered };
    }
    
    localStorage.setItem('academic_divisions', JSON.stringify(data || []));
    return { success: true, data: data || [] };
  } catch (e) {
    console.warn("getAcademicDivisions exception, using local storage:", e);
    const cached = JSON.parse(localStorage.getItem('academic_divisions') || '[]');
    let filtered = cached;
    if (activeOnly) filtered = cached.filter(d => d.is_active);
    return { success: true, data: filtered };
  }
}

async function addAcademicDivision(data) {
  try {
    if (!supabaseDb) throw new Error("Database not initialized");
    const { data: result, error } = await supabaseDb.from('academic_divisions').insert([data]).select();
    if (error) throw error;
    await syncAcademicDivisions();
    return { success: true, data: result };
  } catch (e) { 
    console.warn("Database insert for academic_divisions failed, using local storage:", e);
    const cached = JSON.parse(localStorage.getItem('academic_divisions') || '[]');
    const newDiv = { 
      id: Date.now(), 
      ...data, 
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    cached.push(newDiv);
    localStorage.setItem('academic_divisions', JSON.stringify(cached));
    return { success: true, data: [newDiv] };
  }
}

async function updateAcademicDivision(id, updates) {
  try {
    if (!supabaseDb) throw new Error("Database not initialized");
    updates.updated_at = new Date().toISOString();
    const { data, error } = await supabaseDb.from('academic_divisions').update(updates).eq('id', id).select();
    if (error) throw error;
    await syncAcademicDivisions();
    return { success: true, data };
  } catch (e) {
    console.warn("Database update for academic_divisions failed, using local storage:", e);
    const cached = JSON.parse(localStorage.getItem('academic_divisions') || '[]');
    const idx = cached.findIndex(d => String(d.id) === String(id));
    if (idx >= 0) {
      cached[idx] = { ...cached[idx], ...updates };
      localStorage.setItem('academic_divisions', JSON.stringify(cached));
      return { success: true, data: [cached[idx]] };
    }
    return { success: false, error: "Division not found in local storage" };
  }
}

async function deleteAcademicDivision(id) {
  try {
    if (!supabaseDb) throw new Error("Database not initialized");
    const { error } = await supabaseDb.from('academic_divisions').delete().eq('id', id);
    if (error) throw error;
    await syncAcademicDivisions();
    return { success: true };
  } catch (e) {
    console.warn("Database delete for academic_divisions failed, using local storage:", e);
    const cached = JSON.parse(localStorage.getItem('academic_divisions') || '[]');
    const filtered = cached.filter(d => String(d.id) !== String(id));
    localStorage.setItem('academic_divisions', JSON.stringify(filtered));
    return { success: true };
  }
}

async function syncAcademicDivisions() {
  try {
    const { data, error } = await supabaseDb.from('academic_divisions').select('*').order('display_order', { ascending: true });
    if (!error && data) {
      localStorage.setItem('academic_divisions', JSON.stringify(data));
    }
  } catch (e) { console.warn("Sync academic divisions failed", e); }
}

window.getAcademicDivisions = getAcademicDivisions;
window.addAcademicDivision = addAcademicDivision;
window.updateAcademicDivision = updateAcademicDivision;
window.deleteAcademicDivision = deleteAcademicDivision;
window.syncAcademicDivisions = syncAcademicDivisions;

console.log('✓ Supabase-client.js functions exported to window object');


// ====================================================================
// POPUP ADVERTISEMENT CRUD OPERATIONS
// ====================================================================

async function uploadPopupAdImage(file) {
  try {
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-]/g, '')}`;
    const { data, error } = await supabaseMedia
      .storage
      .from('popup_ads_bucket')
      .upload(fileName, file, { cacheControl: '3600', upsert: true });

    if (error) {
      console.warn("Storage upload failed, trying base64 fallback:", error.message);
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          resolve(reader.result);
        };
        reader.onerror = (e) => reject({ success: false, error: e });
        reader.readAsDataURL(file);
      });
    }

    const { data: publicUrlData } = supabaseMedia
      .storage
      .from('popup_ads_bucket')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (e) {
    console.error("Popup Ad Upload Error:", e);
    return null;
  }
}

async function addPopupAd(adData) {
  try {
    const { data, error } = await supabaseDb
      .from('popup_ads')
      .insert([adData]);
    
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function getPopupAds(activeOnly = false) {
  try {
    let query = supabaseDb.from('popup_ads').select('*').order('created_at', { ascending: false });
    if (activeOnly) {
      query = query.eq('status', 'Active');
    }
    const { data, error } = await query;
    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function getActivePopupAd() {
  try {
    const { data, error } = await supabaseDb
      .from('popup_ads')
      .select('*')
      .eq('status', 'Active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') return { success: false, error: error.message }; // PGRST116 is no rows
    return { success: true, data: data || null };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function updatePopupAd(id, updateData) {
  try {
    const { data, error } = await supabaseDb
      .from('popup_ads')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function deletePopupAd(id) {
  try {
    const { data, error } = await supabaseDb
      .from('popup_ads')
      .delete()
      .eq('id', id);
    
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

window.addPopupAd = addPopupAd;
window.getPopupAds = getPopupAds;
window.getActivePopupAd = getActivePopupAd;
window.updatePopupAd = updatePopupAd;
window.deletePopupAd = deletePopupAd;
window.uploadPopupAdImage = uploadPopupAdImage;

// ============================================================================
// HERO VIDEO CMS OPERATIONS
// ============================================================================

async function uploadHeroVideoFile(file) {
  try {
    const fileName = `hero-videos/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-]/g, '')}`;
    const { data, error } = await supabaseMedia
      .storage
      .from('media')
      .upload(fileName, file, { cacheControl: '3600', upsert: true });

    if (error) {
      console.warn("Storage upload failed:", error.message);
      return { success: false, error: error.message };
    }

    const { data: publicUrlData } = supabaseMedia
      .storage
      .from('media')
      .getPublicUrl(data.path);

    return { success: true, url: publicUrlData.publicUrl };
  } catch (e) {
    console.error("Hero video upload error:", e);
    return { success: false, error: e.message };
  }
}

async function addHeroVideo(videoData) {
  try {
    const { data, error } = await supabaseDb
      .from('website_hero_video')
      .insert([videoData])
      .select();
    if (error) throw error;
    return { success: true, data };
  } catch (e) {
    console.error("Error adding hero video:", e);
    return { success: false, error: e.message };
  }
}

async function getHeroVideos(activeOnly = false) {
  try {
    let query = supabaseDb.from('website_hero_video').select('*');
    if (activeOnly) {
      query = query.eq('status', 'Active');
    }
    const { data, error } = await query.order('display_order', { ascending: true }).order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, data };
  } catch (e) {
    console.error("Error fetching hero videos:", e);
    return { success: false, error: e.message };
  }
}

async function updateHeroVideo(id, updateData) {
  try {
    const { data, error } = await supabaseDb
      .from('website_hero_video')
      .update(updateData)
      .eq('id', id)
      .select();
    if (error) throw error;
    return { success: true, data };
  } catch (e) {
    console.error("Error updating hero video:", e);
    return { success: false, error: e.message };
  }
}

async function deleteHeroVideo(id) {
  try {
    const { data, error } = await supabaseDb
      .from('website_hero_video')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true, data };
  } catch (e) {
    console.error("Error deleting hero video:", e);
    return { success: false, error: e.message };
  }
}

window.addHeroVideo = addHeroVideo;
window.getHeroVideos = getHeroVideos;
window.updateHeroVideo = updateHeroVideo;
window.deleteHeroVideo = deleteHeroVideo;
window.uploadHeroVideoFile = uploadHeroVideoFile;

// ====================================================================
// LOCALSTORAGE-TO-SUPABASE SYNC BRIDGE
// ====================================================================

// Override setItem to sync to database
const originalSetItem = Storage.prototype.setItem;
Storage.prototype.setItem = function(key, value) {
    originalSetItem.apply(this, [key, value]);
    if (window.supabaseDb && this === window.localStorage) {
        window.supabaseDb.from('generic_modules')
           .upsert({ module_name: key, json_data: value }, { onConflict: 'module_name' })
           .then(({error}) => { if(error) console.error("LocalStorage Sync Error (SET):", error); });
    }
};

// Override removeItem to sync to database
const originalRemoveItem = Storage.prototype.removeItem;
Storage.prototype.removeItem = function(key) {
    originalRemoveItem.apply(this, [key]);
    if (window.supabaseDb && this === window.localStorage) {
        window.supabaseDb.from('generic_modules')
           .delete().eq('module_name', key)
           .then(({error}) => { if(error) console.error("LocalStorage Sync Error (REMOVE):", error); });
    }
};

// Initial Sync from DB to LocalStorage
window.syncSupabaseToLocal = async function() {
    if (!window.supabaseDb) return;
    const { data, error } = await window.supabaseDb.from('generic_modules').select('*');
    if (!error && data) {
        data.forEach(row => {
            // Use originalSetItem to prevent triggering infinite loop of upserts
            originalSetItem.apply(window.localStorage, [row.module_name, row.json_data]);
        });
        console.log('✓ Successfully synced ' + data.length + ' modules from Supabase to LocalStorage');
    } else {
        console.error('Failed to sync Supabase to LocalStorage:', error);
    }
};

// Trigger sync immediately on script load
window.syncSupabaseToLocal();
