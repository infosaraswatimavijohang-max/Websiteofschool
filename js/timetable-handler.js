// ============================================================================
// FILE:    timetable-handler.js
// MODULE:  Timetable
// PURPOSE: Timetable Handler - Weekly timetable builder: slot management, subject-teacher-class assignments, and timetable rendering
//
// PROJECT: Shree Saraswati Secondary School — Management System
// STACK:   Vanilla JS + Supabase (PostgreSQL) + HTML/CSS
// UPDATED: 2026-06-03
// ============================================================================
// ====================================================================
// TIMETABLE MANAGEMENT HANDLER - Dynamic Timetable & Teacher Assignments
// ====================================================================

class TimetableHandler {
  constructor() {
    this.supabaseDb = window.supabaseDb;
    this.classesCache = null;
    this.teachersCache = null;
    this.subjectsCache = null;
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes
    this.lastCacheUpdate = 0;
  }

  /**
   * Ensure user is authenticated with Supabase
   */
  async ensureAuthenticated() {
    try {
      if (!this.supabaseDb) {
        console.error('[ERROR] Supabase client not available');
        return { authenticated: false, reason: 'Supabase client not initialized' };
      }

      // Check if demo user
      const adminUser = localStorage.getItem('adminUser');
      if (adminUser) {
        const user = JSON.parse(adminUser);
        if (user.isDemoUser) {
          console.log('[INFO] Demo user authenticated, bypassing Supabase session check');
          return { authenticated: true, isDemoUser: true };
        }
      }

      // Get current session
      const { data: { session }, error } = await this.supabaseDb.auth.getSession();
      
      if (error) {
        console.error('[ERROR] Error checking session:', error);
        return { authenticated: false, reason: 'Error checking session: ' + error.message };
      }

      if (session && session.user) {
        console.log('[SUCCESS] User authenticated with Supabase:', session.user.email);
        return { authenticated: true, user: session.user };
      }

      // Try to restore session from localStorage
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        console.log('[INFO] Auth token found in localStorage, attempting to restore session');
        const { data: { session: restoredSession }, error: restoreError } = await this.supabaseDb.auth.refreshSession();
        if (restoredSession && restoredSession.user) {
          console.log('[SUCCESS] Session restored from token');
          return { authenticated: true, user: restoredSession.user };
        }
      }

      console.warn('[WARNING] User not authenticated with Supabase');
      return { authenticated: false, reason: 'No active session' };
    } catch (error) {
      console.error('[ERROR] Exception in ensureAuthenticated:', error);
      return { authenticated: false, reason: 'Exception: ' + error.message };
    }
  }

  /**
   * Get all teachers grouped by category (with unique names)
   */
  async getTeachersByCategory() {
    try {
      if (!this.supabaseDb) {
        console.error("Supabase database not initialized");
        return {};
      }

      // Check cache
      if (this.teachersCache && (Date.now() - this.lastCacheUpdate < this.cacheDuration)) {
        return this.teachersCache;
      }

      const { data, error } = await this.supabaseDb
        .from("teachers_registry")
        .select("code, name, subject, status")
        .eq("status", "Active")
        .order("subject", { ascending: true })
        .order("name", { ascending: true });

      if (error) {
        console.error("Error loading teachers:", error);
        return {};
      }

      // Group teachers by subject (category)
      const groupedTeachers = {};
      data.forEach(teacher => {
        const category = teacher.subject || "Unassigned";
        if (!groupedTeachers[category]) {
          groupedTeachers[category] = [];
        }
        groupedTeachers[category].push({
          code: teacher.code,
          name: teacher.name,
          subject: teacher.subject,
          display: teacher.name
        });
      });

      // Update cache
      this.teachersCache = groupedTeachers;
      this.lastCacheUpdate = Date.now();

      return groupedTeachers;
    } catch (error) {
      console.error("Exception in getTeachersByCategory:", error);
      return {};
    }
  }

  /**
   * Get all classes grouped by grade level (category)
   */
  async getClassesByGradeLevel() {
    try {
      if (!this.supabaseDb) {
        console.error("Supabase database not initialized");
        return {};
      }

      const { data, error } = await this.supabaseDb
        .from("classes")
        .select("*")
        .eq("status", "Active")
        .order("grade_level", { ascending: true })
        .order("section_name", { ascending: true });

      if (error) {
        console.error("Error loading classes:", error);
        return {};
      }

      // Group classes by grade level
      const groupedClasses = {};
      data.forEach(cls => {
        const gradeLevel = cls.grade_level || "Unassigned";
        if (!groupedClasses[gradeLevel]) {
          groupedClasses[gradeLevel] = [];
        }
        groupedClasses[gradeLevel].push({
          id: cls.id,
          display: `${cls.section_name || 'Default'}`,
          grade_level: cls.grade_level,
          section_name: cls.section_name,
          class_teacher: cls.class_teacher || "Unassigned",
          raw: cls
        });
      });

      return groupedClasses;
    } catch (error) {
      console.error("Exception in getClassesByGradeLevel:", error);
      return {};
    }
  }

  /**
   * Get all active subjects grouped by category
   */
  async getSubjectsByCategory() {
    try {
      if (!this.supabaseDb) {
        console.error("Supabase database not initialized");
        return {};
      }

      const { data, error } = await this.supabaseDb
        .from("subjects")
        .select("*")
        .eq("status", "Active")
        .order("category", { ascending: true })
        .order("subject_name", { ascending: true });

      if (error) {
        console.error("Error loading subjects:", error);
        return {};
      }

      // Group subjects by category
      const groupedSubjects = {};
      data.forEach(subject => {
        const category = subject.category || "Uncategorized";
        if (!groupedSubjects[category]) {
          groupedSubjects[category] = [];
        }
        groupedSubjects[category].push({
          id: subject.id,
          display: subject.subject_name,
          subject_name: subject.subject_name,
          subject_code: subject.subject_code,
          category: subject.category,
          raw: subject
        });
      });

      return groupedSubjects;
    } catch (error) {
      console.error("Exception in getSubjectsByCategory:", error);
      return {};
    }
  }

  /**
   * Helper to get local timetable from localStorage
   */
  getLocalTimetable() {
    try {
      return JSON.parse(localStorage.getItem('class_timetable') || '[]');
    } catch(e) {
      console.error("Error parsing local timetable:", e);
      return [];
    }
  }

  /**
   * Helper to save local timetable to localStorage
   */
  saveLocalTimetable(data) {
    try {
      localStorage.setItem('class_timetable', JSON.stringify(data));
    } catch(e) {
      console.error("Error saving local timetable:", e);
    }
  }

  /**
   * Helper to filter local timetable entries
   */
  getLocalTimetableFiltered(filters) {
    const all = this.getLocalTimetable();
    return all.filter(entry => {
      if (entry.status !== "Active") return false;
      if (filters.class_id && String(entry.class_id) !== String(filters.class_id)) return false;
      if (filters.teacher_code && entry.teacher_code !== filters.teacher_code) return false;
      if (filters.day && entry.day_of_week !== filters.day) return false;
      return true;
    });
  }

  /**
   * Get all timetable entries for display
   */
  async getTimetableEntries(filters = {}) {
    try {
      if (!this.supabaseDb) {
        console.warn("Supabase database not initialized. Using local storage fallback.");
        return this.getLocalTimetableFiltered(filters);
      }

      let query = this.supabaseDb
        .from("class_timetable")
        .select("*")
        .eq("status", "Active");

      if (filters.class_id) {
        query = query.eq("class_id", filters.class_id);
      }
      if (filters.teacher_code) {
        query = query.eq("teacher_code", filters.teacher_code);
      }
      if (filters.day) {
        query = query.eq("day_of_week", filters.day);
      }

      const { data, error } = await query.order("day_of_week", { ascending: true });

      if (error) {
        console.warn("Error loading timetable entries from database, falling back to local storage:", error);
        return this.getLocalTimetableFiltered(filters);
      }

      // Sync local storage cache
      this.saveLocalTimetable(data || []);
      return data;
    } catch (error) {
      console.warn("Exception in getTimetableEntries, using local storage:", error);
      return this.getLocalTimetableFiltered(filters);
    }
  }

  /**
   * Check if user is authenticated with Supabase
   */
  async checkAuthentication() {
    try {
      if (!this.supabaseDb) {
        return { authenticated: false, error: "Database not initialized" };
      }
      
      const { data: { session }, error } = await this.supabaseDb.auth.getSession();
      
      if (error) {
        console.warn("Auth check error:", error);
        return { authenticated: false, error: error.message };
      }
      
      return { 
        authenticated: !!session, 
        session: session,
        message: session ? "User authenticated" : "No active session"
      };
    } catch (error) {
      console.error("Exception in checkAuthentication:", error);
      return { authenticated: false, error: error.message };
    }
  }

  /**
   * Add new timetable entry with improved error handling and local storage fallback
   */
  async addTimetableEntry(entryData) {
    try {
      // Validate required fields
      if (!entryData.class_id || !entryData.subject_id || !entryData.teacher_code || 
          !entryData.day_of_week || !entryData.start_time || !entryData.end_time) {
        return { success: false, error: "All fields are required" };
      }

      const newEntry = {
        class_id: entryData.class_id,
        grade_level: entryData.grade_level || "",
        section_name: entryData.section_name || "",
        subject_id: entryData.subject_id,
        subject_name: entryData.subject_name || "",
        teacher_code: entryData.teacher_code,
        teacher_name: entryData.teacher_name || "",
        day_of_week: entryData.day_of_week,
        start_time: entryData.start_time,
        end_time: entryData.end_time,
        classroom_number: entryData.classroom_number || null,
        remarks: entryData.remarks || null,
        status: "Active"
      };

      if (!this.supabaseDb) {
        console.warn("Database not initialized, saving entry to local storage.");
        const local = this.getLocalTimetable();
        newEntry.id = Date.now();
        local.push(newEntry);
        this.saveLocalTimetable(local);
        return { success: true, id: newEntry.id, message: "✅ Class timetable entry added to local storage!" };
      }

      // Ensure user is authenticated before proceeding
      const authStatus = await this.ensureAuthenticated();
      if (!authStatus.authenticated && !authStatus.isDemoUser) {
        console.error('[ERROR] Authentication failed:', authStatus.reason);
        return { 
          success: false, 
          error: "❌ Authentication Required: You must be logged in to add timetable entries. Please log in first.",
          code: "AUTH_REQUIRED",
          details: authStatus.reason
        };
      }

      const { data, error } = await this.supabaseDb
        .from("class_timetable")
        .insert([newEntry])
        .select();

      if (error) {
        console.warn("Error adding timetable entry, falling back to local storage:", error);
        const local = this.getLocalTimetable();
        newEntry.id = Date.now();
        local.push(newEntry);
        this.saveLocalTimetable(local);
        return { success: true, id: newEntry.id, message: "✅ Class timetable entry added to local storage (fallback)!" };
      }

      return {
        success: true,
        id: data[0].id,
        message: "✅ Class timetable entry added successfully!"
      };
    } catch (error) {
      console.warn("Exception in addTimetableEntry, falling back to local storage:", error);
      const local = this.getLocalTimetable();
      const newEntry = {
        ...entryData,
        id: Date.now(),
        status: "Active"
      };
      local.push(newEntry);
      this.saveLocalTimetable(local);
      return { success: true, id: newEntry.id, message: "✅ Class timetable entry added to local storage (fallback)!" };
    }
  }

  /**
   * Update timetable entry
   */
  async updateTimetableEntry(entryId, entryData) {
    try {
      const updateData = {};
      if (entryData.subject_id) updateData.subject_id = entryData.subject_id;
      if (entryData.subject_name) updateData.subject_name = entryData.subject_name;
      if (entryData.teacher_code) updateData.teacher_code = entryData.teacher_code;
      if (entryData.teacher_name) updateData.teacher_name = entryData.teacher_name;
      if (entryData.day_of_week) updateData.day_of_week = entryData.day_of_week;
      if (entryData.start_time) updateData.start_time = entryData.start_time;
      if (entryData.end_time) updateData.end_time = entryData.end_time;
      if (entryData.classroom_number !== undefined) updateData.classroom_number = entryData.classroom_number;
      if (entryData.remarks !== undefined) updateData.remarks = entryData.remarks;

      if (!this.supabaseDb) {
        console.warn("Database not initialized, updating entry in local storage.");
        const local = this.getLocalTimetable();
        const idx = local.findIndex(e => String(e.id) === String(entryId));
        if (idx >= 0) {
          local[idx] = { ...local[idx], ...updateData };
          this.saveLocalTimetable(local);
          return { success: true, message: "Timetable entry updated in local storage!" };
        }
        return { success: false, error: "Entry not found in local storage" };
      }

      const { error } = await this.supabaseDb
        .from("class_timetable")
        .update(updateData)
        .eq("id", entryId);

      if (error) {
        console.warn("Error updating timetable entry, falling back to local storage:", error);
        const local = this.getLocalTimetable();
        const idx = local.findIndex(e => String(e.id) === String(entryId));
        if (idx >= 0) {
          local[idx] = { ...local[idx], ...updateData };
          this.saveLocalTimetable(local);
          return { success: true, message: "Timetable entry updated in local storage (fallback)!" };
        }
        return { success: false, error: error.message };
      }

      return { success: true, message: "Timetable entry updated successfully!" };
    } catch (error) {
      console.warn("Exception in updateTimetableEntry, falling back to local storage:", error);
      const local = this.getLocalTimetable();
      const idx = local.findIndex(e => String(e.id) === String(entryId));
      if (idx >= 0) {
        local[idx] = { ...local[idx], ...entryData };
        this.saveLocalTimetable(local);
        return { success: true, message: "Timetable entry updated in local storage (fallback)!" };
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete timetable entry
   */
  async deleteTimetableEntry(entryId) {
    try {
      if (!this.supabaseDb) {
        console.warn("Database not initialized, deleting from local storage.");
        const local = this.getLocalTimetable();
        const filtered = local.filter(e => String(e.id) !== String(entryId));
        this.saveLocalTimetable(filtered);
        return { success: true, message: "Timetable entry deleted from local storage!" };
      }

      const { error } = await this.supabaseDb
        .from("class_timetable")
        .delete()
        .eq("id", entryId);

      if (error) {
        console.warn("Error deleting timetable entry, falling back to local storage:", error);
        const local = this.getLocalTimetable();
        const filtered = local.filter(e => String(e.id) !== String(entryId));
        this.saveLocalTimetable(filtered);
        return { success: true, message: "Timetable entry deleted from local storage (fallback)!" };
      }

      return { success: true, message: "Timetable entry deleted successfully!" };
    } catch (error) {
      console.warn("Exception in deleteTimetableEntry, falling back to local storage:", error);
      const local = this.getLocalTimetable();
      const filtered = local.filter(e => String(e.id) !== String(entryId));
      this.saveLocalTimetable(filtered);
      return { success: true, message: "Timetable entry deleted from local storage (fallback)!" };
    }
  }

  /**
   * Get teacher assigned subjects for teacher portal
   */
  async getTeacherAssignedSubjects(teacherCode) {
    try {
      if (!this.supabaseDb) {
        console.error("Supabase database not initialized");
        return [];
      }

      const { data, error } = await this.supabaseDb
        .from("class_timetable")
        .select("*")
        .eq("teacher_code", teacherCode)
        .eq("status", "Active")
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Error loading teacher assignments:", error);
        return [];
      }

      return data;
    } catch (error) {
      console.error("Exception in getTeacherAssignedSubjects:", error);
      return [];
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.classesCache = null;
    this.teachersCache = null;
    this.subjectsCache = null;
    this.lastCacheUpdate = 0;
  }
}

// Initialize handler
const timetableHandler = new TimetableHandler();

// Expose globally
window.timetableHandler = timetableHandler;
window.TimetableHandler = TimetableHandler;
