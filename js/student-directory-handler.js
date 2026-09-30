// ============================================================================
// FILE:    student-directory-handler.js
// MODULE:  Student Directory
// PURPOSE: Student Directory Handler - Public-facing student directory with search, filter, and profile display
//
// PROJECT: Shree Saraswati Secondary School — Management System
// STACK:   Vanilla JS + Supabase (PostgreSQL) + HTML/CSS
// UPDATED: 2026-06-03
// ============================================================================
// ====================================================================
// STUDENT DIRECTORY HANDLER
// ====================================================================

class StudentDirectoryHandler {
  constructor() {
    this.supabaseDb = window.supabaseDb;
    this.allStudents = [];
    this.filteredStudents = [];
  }

  /**
   * Load all students from both enrolled and admission tables
   */
  async loadAllStudents() {
    try {
      if (!this.supabaseDb) {
        console.error("Supabase database not initialized");
        return { success: false, students: [] };
      }

      // Load enrolled students
      const { data: students, error: studentsError } = await this.supabaseDb
        .from('students')
        .select('*')
        .order('full_name', { ascending: true });

      if (studentsError) {
        console.error('Error loading students:', studentsError);
      }

      // Load admission applications
      const { data: admissions, error: admissionsError } = await this.supabaseDb
        .from('admission_applications')
        .select('*')
        .order('full_name', { ascending: true });

      if (admissionsError) {
        console.error('Error loading admissions:', admissionsError);
      }

      // Combine and normalize data
      this.allStudents = [];

      // Add enrolled students
      if (students && students.length > 0) {
        students.forEach(student => {
          this.allStudents.push(this.normalizeStudentData(student, 'enrolled'));
        });
      }

      // Add admission applications
      if (admissions && admissions.length > 0) {
        admissions.forEach(app => {
          this.allStudents.push(this.normalizeStudentData(app, 'admission'));
        });
      }

      this.filteredStudents = [...this.allStudents];
      return { success: true, students: this.allStudents };
    } catch (error) {
      console.error('Exception in loadAllStudents:', error);
      return { success: false, students: [], error: error.message };
    }
  }

  /**
   * Normalize student data from different sources
   */
  normalizeStudentData(data, type) {
    return {
      ...data,
      type,
      source: type === 'enrolled' ? 'students' : 'admission_applications',
      displayName: data.full_name || 'Unknown',
      displayClass: type === 'enrolled' ? (data.class_name || '-') : (data.class_applying_for || '-'),
      displayStatus: (data.application_status || data.status || 'pending').toLowerCase(),
      displayRoll: type === 'enrolled' ? (data.roll_number || '-') : 'N/A',
      displayPhone: data.phone_number || data.father_phone || data.mother_phone || '-',
      displayEmail: data.email || data.father_email || data.mother_email || '-',
      displayDOB: data.date_of_birth || '-',
      displayGender: data.gender || '-',
      displayParents: this.getParentNames(data, type)
    };
  }

  /**
   * Get parent names based on student type
   */
  getParentNames(data, type) {
    if (type === 'enrolled') {
      return (data.parent_name || data.guardian_name || '-');
    } else {
      const parents = [];
      if (data.father_name) parents.push(data.father_name);
      if (data.mother_name) parents.push(data.mother_name);
      return parents.length > 0 ? parents.join(', ') : '-';
    }
  }

  /**
   * Get unique classes from all students
   */
  getClassesForFilter() {
    const classesSet = new Set();
    this.allStudents.forEach(student => {
      if (student.displayClass && student.displayClass !== '-') {
        classesSet.add(student.displayClass);
      }
    });
    return Array.from(classesSet).sort();
  }

  /**
   * Filter students based on criteria
   */
  filterStudents(searchText = '', className = '', status = '') {
    this.filteredStudents = this.allStudents.filter(student => {
      const matchSearch = !searchText || 
        student.displayName.toLowerCase().includes(searchText.toLowerCase()) ||
        student.displayPhone.includes(searchText) ||
        (student.admission_number && student.admission_number.toString().includes(searchText)) ||
        (student.roll_number && student.roll_number.toString().includes(searchText));
      
      const matchClass = !className || student.displayClass === className;
      const matchStatus = !status || student.displayStatus === status.toLowerCase();

      return matchSearch && matchClass && matchStatus;
    });

    return this.filteredStudents;
  }

  /**
   * Get statistics about students
   */
  getStatistics() {
    return {
      totalStudents: this.allStudents.length,
      enrolledCount: this.allStudents.filter(s => s.displayStatus === 'enrolled').length,
      pendingCount: this.allStudents.filter(s => s.displayStatus === 'pending').length,
      approvedCount: this.allStudents.filter(s => s.displayStatus === 'approved').length,
      rejectedCount: this.allStudents.filter(s => s.displayStatus === 'rejected').length,
      uniqueClasses: new Set(this.allStudents.filter(s => s.displayClass !== '-').map(s => s.displayClass)).size
    };
  }

  /**
   * Get student details including parent information
   */
  getStudentDetails(studentId, type) {
    return this.allStudents.find(s => s.id === studentId && s.type === type) || null;
  }

  /**
   * Export filtered students to CSV
   */
  exportToCSV(students = null) {
    const data = students || this.filteredStudents;
    
    if (data.length === 0) {
      console.warn('No students to export');
      return;
    }

    const headers = [
      'Name', 'Class', 'Type', 'Status', 'Phone', 'Email', 'DOB', 'Gender'
    ];

    let csv = headers.join(',') + '\n';

    data.forEach(student => {
      const row = [
        `"${student.displayName}"`,
        `"${student.displayClass}"`,
        student.type,
        student.displayStatus,
        `"${student.displayPhone}"`,
        `"${student.displayEmail}"`,
        `"${student.displayDOB}"`,
        student.displayGender
      ];
      csv += row.join(',') + '\n';
    });

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_directory_${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  /**
   * Get students by class
   */
  getStudentsByClass(className) {
    return this.allStudents.filter(s => s.displayClass === className);
  }

  /**
   * Get students by status
   */
  getStudentsByStatus(status) {
    return this.allStudents.filter(s => s.displayStatus === status.toLowerCase());
  }

  /**
   * Search students
   */
  searchStudents(searchText) {
    return this.allStudents.filter(student => {
      const text = searchText.toLowerCase();
      return student.displayName.toLowerCase().includes(text) ||
             student.displayPhone.includes(text) ||
             student.displayEmail.toLowerCase().includes(text) ||
             student.displayClass.toLowerCase().includes(text);
    });
  }

  /**
   * Get count by status
   */
  getCountByStatus() {
    const counts = {};
    this.allStudents.forEach(student => {
      counts[student.displayStatus] = (counts[student.displayStatus] || 0) + 1;
    });
    return counts;
  }

  /**
   * Get admission applications pending approval
   */
  async getPendingApplications() {
    return this.allStudents.filter(s => 
      s.type === 'admission' && 
      (s.displayStatus === 'pending' || s.displayStatus === 'approved')
    );
  }
}

// Initialize globally when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.studentDirectoryHandler = new StudentDirectoryHandler();
  });
} else {
  window.studentDirectoryHandler = new StudentDirectoryHandler();
}
