// ============================================================================
// FILE:    subject-handler.js
// MODULE:  Subjects
// PURPOSE: Subject Handler - Academic subject CRUD: create subjects, assign to classes, and manage subject-teacher mappings
//
// PROJECT: Shree Saraswati Secondary School — Management System
// STACK:   Vanilla JS + Supabase (PostgreSQL) + HTML/CSS
// UPDATED: 2026-06-03
// ============================================================================
// ====================================================================
// SUBJECT MANAGEMENT HANDLER - Dynamic Subject Setup & Population
// ====================================================================

class SubjectHandler {
  constructor() {
    this.supabaseDb = window.supabaseDb;
    this.subjectsCache = null;
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes
    this.lastCacheUpdate = 0;
  }

  /**
   * Get all active subjects with optional caching
   * Returns array of subjects suitable for dropdowns
   */
  async getActiveSubjects() {
    try {
      if (!this.supabaseDb) {
        console.error("Supabase database not initialized");
        return [];
      }

      // Check cache
      if (this.subjectsCache && (Date.now() - this.lastCacheUpdate < this.cacheDuration)) {
        return this.subjectsCache;
      }

      const { data, error } = await this.supabaseDb
        .from("subjects")
        .select("*")
        .eq("status", "Active")
        .order("category", { ascending: true })
        .order("subject_name", { ascending: true });

      if (error) {
        console.error("Error loading subjects:", error);
        return [];
      }

      // Transform data for display
      const subjects = data.map(sub => ({
        id: sub.id,
        display: sub.category ? `${sub.subject_name} (${sub.category})` : sub.subject_name,
        subject_name: sub.subject_name,
        subject_code: sub.subject_code,
        subject_type: sub.subject_type,
        category: sub.category || "Uncategorized",
        status: sub.status,
        raw: sub
      }));

      // Update cache
      this.subjectsCache = subjects;
      this.lastCacheUpdate = Date.now();

      return subjects;
    } catch (error) {
      console.error("Exception in getActiveSubjects:", error);
      return [];
    }
  }

  /**
   * Get all subjects including inactive ones (for admin viewing)
   */
  async getAllSubjects() {
    try {
      if (!this.supabaseDb) {
        console.error("Supabase database not initialized");
        return [];
      }

      const { data, error } = await this.supabaseDb
        .from("subjects")
        .select("*")
        .order("category", { ascending: true })
        .order("subject_name", { ascending: true });

      if (error) {
        console.error("Error loading all subjects:", error);
        return [];
      }

      return data.map(sub => ({
        id: sub.id,
        display: sub.category ? `${sub.subject_name} (${sub.category})` : sub.subject_name,
        subject_name: sub.subject_name,
        subject_code: sub.subject_code,
        subject_type: sub.subject_type,
        category: sub.category || "Uncategorized",
        status: sub.status,
        raw: sub
      }));
    } catch (error) {
      console.error("Exception in getAllSubjects:", error);
      return [];
    }
  }

  /**
   * Get subject by ID
   */
  async getSubjectById(subjectId) {
    try {
      if (!this.supabaseDb) return null;

      const { data, error } = await this.supabaseDb
        .from("subjects")
        .select("*")
        .eq("id", subjectId)
        .single();

      if (error) {
        console.error("Error loading subject:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Exception in getSubjectById:", error);
      return null;
    }
  }

  /**
   * Add new subject
   */
  async addSubject(subjectData) {
    try {
      if (!this.supabaseDb) {
        return { success: false, error: "Database not initialized" };
      }

      if (!subjectData.subject_name || !subjectData.subject_code) {
        return { success: false, error: "Subject Name and Subject Code are required" };
      }

      const newSubject = {
        subject_name: subjectData.subject_name.trim(),
        subject_code: subjectData.subject_code.trim(),
        subject_type: subjectData.subject_type || "Theory Only",
        credit_hour: subjectData.credit_hour !== undefined ? subjectData.credit_hour : null,
        category: subjectData.category ? subjectData.category.trim() : "Secondary",
        status: subjectData.status || "Active",
        created_by: subjectData.created_by || null
      };

      const { data, error } = await this.supabaseDb
        .from("subjects")
        .insert([newSubject])
        .select();

      if (error) {
        console.error("Error adding subject:", error);
        return {
          success: false,
          error: error.message.includes("unique")
            ? `Subject Code "${newSubject.subject_code}" already exists!`
            : error.message
        };
      }

      // Clear cache
      this.invalidateCache();

      return {
        success: true,
        id: data[0].id,
        message: `Subject "${newSubject.subject_name}" added successfully!`
      };
    } catch (error) {
      console.error("Exception in addSubject:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update existing subject
   */
  async updateSubject(subjectId, subjectData) {
    try {
      if (!this.supabaseDb) {
        return { success: false, error: "Database not initialized" };
      }

      const updateData = {};
      if (subjectData.subject_name) updateData.subject_name = subjectData.subject_name.trim();
      if (subjectData.subject_code) updateData.subject_code = subjectData.subject_code.trim();
      if (subjectData.subject_type) updateData.subject_type = subjectData.subject_type;
      if (subjectData.credit_hour !== undefined) updateData.credit_hour = subjectData.credit_hour;
      if (subjectData.category) updateData.category = subjectData.category.trim();
      if (subjectData.status) updateData.status = subjectData.status;

      const { error } = await this.supabaseDb
        .from("subjects")
        .update(updateData)
        .eq("id", subjectId);

      if (error) {
        console.error("Error updating subject:", error);
        return { success: false, error: error.message };
      }

      // Clear cache
      this.invalidateCache();

      return { success: true, message: "Subject updated successfully!" };
    } catch (error) {
      console.error("Exception in updateSubject:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete subject
   */
  async deleteSubject(subjectId) {
    try {
      if (!this.supabaseDb) {
        return { success: false, error: "Database not initialized" };
      }

      const { error } = await this.supabaseDb
        .from("subjects")
        .delete()
        .eq("id", subjectId);

      if (error) {
        console.error("Error deleting subject:", error);
        return { success: false, error: error.message };
      }

      // Clear cache
      this.invalidateCache();

      return { success: true, message: "Subject deleted successfully!" };
    } catch (error) {
      console.error("Exception in deleteSubject:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Populate a select dropdown element with active subjects
   */
  async populateSubjectDropdownElement(selectElement, initialValue = '') {
    try {
      if (!selectElement) return false;

      const subjects = await this.getActiveSubjects();

      // Clear existing options except first placeholder (if present)
      const firstOption = selectElement.options[0];
      selectElement.innerHTML = '';

      if (firstOption && !firstOption.value) {
        selectElement.appendChild(firstOption.cloneNode(true));
      } else {
        const defaultOpt = document.createElement("option");
        defaultOpt.value = "";
        defaultOpt.textContent = "-- Select Subject --";
        selectElement.appendChild(defaultOpt);
      }

      // Add subject options
      subjects.forEach(sub => {
        const option = document.createElement("option");
        option.value = sub.subject_name; // Value is subject_name for compatibility
        option.textContent = sub.display; // Label shows Subject Name (Category)
        
        if (initialValue && (sub.subject_name.toLowerCase() === initialValue.toLowerCase())) {
          option.selected = true;
        }
        
        selectElement.appendChild(option);
      });

      return true;
    } catch (error) {
      console.error("Exception in populateSubjectDropdownElement:", error);
      return false;
    }
  }

  /**
   * Populate a select dropdown by ID with active subjects
   */
  async populateSubjectDropdown(selectElementId, initialValue = '') {
    try {
      const selectElement = document.getElementById(selectElementId);
      if (!selectElement) {
        console.warn(`Element with id "${selectElementId}" not found`);
        return false;
      }

      return await this.populateSubjectDropdownElement(selectElement, initialValue);
    } catch (error) {
      console.error("Exception in populateSubjectDropdown:", error);
      return false;
    }
  }

  /**
   * Invalidate cache
   */
  invalidateCache() {
    this.subjectsCache = null;
    this.lastCacheUpdate = 0;
  }
}

// Initialize global instance
let subjectHandler = null;

if (typeof supabaseDb !== 'undefined' && supabaseDb) {
  subjectHandler = new SubjectHandler();
  console.log("✅ SubjectHandler initialized successfully");
} else {
  console.warn("⚠️ Supabase not loaded yet. SubjectHandler will initialize when Supabase is ready.");
  setTimeout(() => {
    if (typeof supabaseDb !== 'undefined' && supabaseDb) {
      subjectHandler = new SubjectHandler();
      console.log("✅ SubjectHandler initialized successfully (delayed)");
    }
  }, 1000);
}

// Make available globally
window.subjectHandler = subjectHandler;
window.SubjectHandler = SubjectHandler;
