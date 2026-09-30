// ============================================================================
// FILE:    class-handler.js
// MODULE:  Classes & Sections
// PURPOSE: Class & Section Handler - CRUD for academic classes, sections, and class-student assignments
//
// PROJECT: Shree Saraswati Secondary School — Management System
// STACK:   Vanilla JS + Supabase (PostgreSQL) + HTML/CSS
// UPDATED: 2026-06-03
// ============================================================================
// ====================================================================
// CLASS MANAGEMENT HANDLER - Dynamic Class Setup & Population
// ====================================================================

class ClassHandler {
  constructor() {
    this.supabaseDb = window.supabaseDb;
    this.classesCache = null;
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes
    this.lastCacheUpdate = 0;
  }

  /**
   * Get all active classes with optional caching
   * Returns array of classes suitable for dropdowns
   */
  async getActiveClasses() {
    try {
      if (!this.supabaseDb) {
        console.error("Supabase database not initialized");
        return [];
      }

      // Check cache
      if (this.classesCache && (Date.now() - this.lastCacheUpdate < this.cacheDuration)) {
        return this.classesCache;
      }

      const { data, error } = await this.supabaseDb
        .from("classes")
        .select("*")
        .eq("status", "Active")
        .order("grade_level", { ascending: true })
        .order("section_name", { ascending: true });

      if (error) {
        console.error("Error loading classes:", error);
        return [];
      }

      // Transform data for display
      const classes = data.map(cls => ({
        id: cls.id,
        display: `${cls.grade_level} - ${cls.section_name}`,
        grade_level: cls.grade_level,
        section_name: cls.section_name,
        class_teacher: cls.class_teacher || "Unassigned",
        total_strength: cls.total_strength || 0,
        status: cls.status,
        raw: cls
      }));

      // Update cache
      this.classesCache = classes;
      this.lastCacheUpdate = Date.now();

      return classes;
    } catch (error) {
      console.error("Exception in getActiveClasses:", error);
      return [];
    }
  }

  /**
   * Get all classes including inactive ones (for admin viewing)
   */
  async getAllClasses() {
    try {
      if (!this.supabaseDb) {
        console.error("Supabase database not initialized");
        return [];
      }

      const { data, error } = await this.supabaseDb
        .from("classes")
        .select("*")
        .order("grade_level", { ascending: true })
        .order("section_name", { ascending: true });

      if (error) {
        console.error("Error loading all classes:", error);
        return [];
      }

      return data.map(cls => ({
        id: cls.id,
        display: `${cls.grade_level} - ${cls.section_name}`,
        grade_level: cls.grade_level,
        section_name: cls.section_name,
        class_teacher: cls.class_teacher || "Unassigned",
        total_strength: cls.total_strength || 0,
        status: cls.status,
        raw: cls
      }));
    } catch (error) {
      console.error("Exception in getAllClasses:", error);
      return [];
    }
  }

  /**
   * Get class by ID
   */
  async getClassById(classId) {
    try {
      if (!this.supabaseDb) return null;

      const { data, error } = await this.supabaseDb
        .from("classes")
        .select("*")
        .eq("id", classId)
        .single();

      if (error) {
        console.error("Error loading class:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Exception in getClassById:", error);
      return null;
    }
  }

  /**
   * Add new class
   */
  async addClass(classData) {
    try {
      if (!this.supabaseDb) {
        return { success: false, error: "Database not initialized" };
      }

      // Validate required fields
      if (!classData.grade_level || !classData.section_name) {
        return { success: false, error: "Grade Level and Section Name are required" };
      }

      const newClass = {
        grade_level: classData.grade_level.trim(),
        section_name: classData.section_name.trim(),
        class_teacher: classData.class_teacher?.trim() || null,
        class_teacher_code: classData.class_teacher_code?.trim() || null,
        total_strength: classData.total_strength || 0,
        status: classData.status || "Active",
        notes: classData.notes?.trim() || null
      };

      const { data, error } = await this.supabaseDb
        .from("classes")
        .insert([newClass])
        .select();

      if (error) {
        console.error("Error adding class:", error);
        return { 
          success: false, 
          error: error.message.includes("unique") 
            ? `Class "${newClass.grade_level} - ${newClass.section_name}" already exists!`
            : error.message
        };
      }

      // Clear cache
      this.classesCache = null;

      return {
        success: true,
        id: data[0].id,
        message: `Class "${newClass.grade_level} - ${newClass.section_name}" added successfully!`
      };
    } catch (error) {
      console.error("Exception in addClass:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update existing class
   */
  async updateClass(classId, classData) {
    try {
      if (!this.supabaseDb) {
        return { success: false, error: "Database not initialized" };
      }

      const updateData = {};
      
      if (classData.grade_level) updateData.grade_level = classData.grade_level.trim();
      if (classData.section_name) updateData.section_name = classData.section_name.trim();
      if (classData.class_teacher !== undefined) updateData.class_teacher = classData.class_teacher?.trim() || null;
      if (classData.class_teacher_code !== undefined) updateData.class_teacher_code = classData.class_teacher_code?.trim() || null;
      if (classData.total_strength !== undefined) updateData.total_strength = classData.total_strength;
      if (classData.status !== undefined) updateData.status = classData.status;
      if (classData.notes !== undefined) updateData.notes = classData.notes?.trim() || null;

      const { error } = await this.supabaseDb
        .from("classes")
        .update(updateData)
        .eq("id", classId);

      if (error) {
        console.error("Error updating class:", error);
        return { success: false, error: error.message };
      }

      // Clear cache
      this.classesCache = null;

      return { success: true, message: "Class updated successfully!" };
    } catch (error) {
      console.error("Exception in updateClass:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete class
   */
  async deleteClass(classId) {
    try {
      if (!this.supabaseDb) {
        return { success: false, error: "Database not initialized" };
      }

      // Check if class has students
      const { count, error: countError } = await this.supabaseDb
        .from("students_registry")
        .select("*", { count: "exact", head: true })
        .ilike("class", `%Grade%`); // Basic check - update logic as needed

      const { error } = await this.supabaseDb
        .from("classes")
        .delete()
        .eq("id", classId);

      if (error) {
        console.error("Error deleting class:", error);
        return { success: false, error: error.message };
      }

      // Clear cache
      this.classesCache = null;

      return { success: true, message: "Class deleted successfully!" };
    } catch (error) {
      console.error("Exception in deleteClass:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Populate a select dropdown with active classes
   */
  async populateClassDropdown(selectElementId) {
    try {
      const selectElement = document.getElementById(selectElementId);
      if (!selectElement) {
        console.warn(`Element with id "${selectElementId}" not found`);
        return false;
      }

      const classes = await this.getActiveClasses();

      // Clear existing options except first (placeholder)
      const firstOption = selectElement.options[0];
      selectElement.innerHTML = '';
      
      if (firstOption) {
        selectElement.appendChild(firstOption.cloneNode(true));
      }

      // Add class options
      classes.forEach(cls => {
        const option = document.createElement("option");
        option.value = cls.display; // Store full display format
        option.textContent = cls.display;
        selectElement.appendChild(option);
      });

      return true;
    } catch (error) {
      console.error("Exception in populateClassDropdown:", error);
      return false;
    }
  }

  /**
   * Get classes for specific grade level
   */
  async getClassesByGrade(gradeLevelText) {
    try {
      const classes = await this.getActiveClasses();
      return classes.filter(cls => cls.grade_level === gradeLevelText);
    } catch (error) {
      console.error("Exception in getClassesByGrade:", error);
      return [];
    }
  }

  /**
   * Invalidate cache (call after manual database operations)
   */
  invalidateCache() {
    this.classesCache = null;
    this.lastCacheUpdate = 0;
  }

  /**
   * Search classes by text
   */
  async searchClasses(searchTerm) {
    try {
      if (!this.supabaseDb) return [];

      const { data, error } = await this.supabaseDb
        .from("classes")
        .select("*")
        .or(`grade_level.ilike.%${searchTerm}%,section_name.ilike.%${searchTerm}%,class_teacher.ilike.%${searchTerm}%`)
        .eq("status", "Active")
        .order("grade_level", { ascending: true });

      if (error) {
        console.error("Error searching classes:", error);
        return [];
      }

      return data;
    } catch (error) {
      console.error("Exception in searchClasses:", error);
      return [];
    }
  }

  /**
   * Get statistics about classes
   */
  async getClassStatistics() {
    try {
      if (!this.supabaseDb) return null;

      const classes = await this.getAllClasses();

      const stats = {
        total_classes: classes.length,
        active_classes: classes.filter(c => c.status === "Active").length,
        inactive_classes: classes.filter(c => c.status === "Inactive").length,
        total_strength: classes.reduce((sum, c) => sum + (c.total_strength || 0), 0),
        classes_with_teacher: classes.filter(c => c.class_teacher !== "Unassigned").length
      };

      return stats;
    } catch (error) {
      console.error("Exception in getClassStatistics:", error);
      return null;
    }
  }
}

// Initialize global instance
let classHandler = null;

if (typeof supabaseDb !== 'undefined' && supabaseDb) {
  classHandler = new ClassHandler();
  console.log("✅ ClassHandler initialized successfully");
} else {
  console.warn("⚠️ Supabase not loaded yet. ClassHandler will initialize when Supabase is ready.");
  // Initialize after supabase-client.js loads
  setTimeout(() => {
    if (typeof supabaseDb !== 'undefined' && supabaseDb) {
      classHandler = new ClassHandler();
      console.log("✅ ClassHandler initialized successfully (delayed)");
    }
  }, 1000);
}

// Make available globally
window.classHandler = classHandler;
window.ClassHandler = ClassHandler;
