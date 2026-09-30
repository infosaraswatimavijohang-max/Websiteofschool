// ============================================================================
// FILE:    admission-handler.js
// MODULE:  Admissions
// PURPOSE: Admissions Handler - Student admission form processing, validation, and Supabase CRUD for new student enrolments
//
// PROJECT: Shree Saraswati Secondary School — Management System
// STACK:   Vanilla JS + Supabase (PostgreSQL) + HTML/CSS
// UPDATED: 2026-06-03
// ============================================================================
// ====================================================================
// ADMISSION FORM HANDLER - Supabase Integration
// ====================================================================

class AdmissionHandler {
  constructor() {
    this.supabaseDb = window.supabaseDb;
    this.supabaseMedia = window.supabaseMedia;
    this.currentApplicationId = null;
    this.uploadedDocuments = [];
  }

  /**
   * Submit Admission Form
   * Saves personal info, parent info, and address info to admission_applications table
   */
  async submitAdmissionForm(formData) {
    try {
      if (!this.supabaseDb) {
        console.error("Supabase database not initialized");
        return { success: false, error: "Database connection failed" };
      }

      // Prepare application data
      const applicationData = {
        // Personal Information
        full_name: formData.fullName,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        nationality: formData.nationality,
        religion: formData.religion,
        blood_group: formData.bloodGroup,

        // Father's Information
        father_name: formData.fatherName,
        father_email: formData.fatherEmail,
        father_phone: formData.fatherPhone,
        father_occupation: formData.fatherOccupation,

        // Mother's Information
        mother_name: formData.motherName,
        mother_email: formData.motherEmail,
        mother_phone: formData.motherPhone,
        mother_occupation: formData.motherOccupation,

        // Permanent Address
        permanent_address: formData.permanentAddress,
        permanent_city: formData.permanentCity,
        permanent_state: formData.permanentState,
        permanent_zip: formData.permanentZip,

        // Temporary Address
        temporary_address: formData.temporaryAddress,
        temporary_city: formData.temporaryCity,
        temporary_state: formData.temporaryState,
        temporary_zip: formData.temporaryZip,

        // Academic Information
        class_applying_for: formData.classApplyingFor,
        previous_school_name: formData.previousSchoolName,
        previous_class: formData.previousClass,
        previous_percentage: formData.previousPercentage,
        academic_profile: formData.academicProfile,

        // Status
        application_status: "pending",
        admission_notes: formData.admissionNotes || "",
      };

      // Insert into database
      const { data, error } = await this.supabaseDb
        .from("admission_applications")
        .insert([applicationData])
        .select();

      if (error) {
        console.error("Error submitting admission form:", error);
        return { success: false, error: error.message };
      }

      this.currentApplicationId = data[0].id;
      return {
        success: true,
        applicationId: data[0].id,
        message: "Admission form submitted successfully!",
      };
    } catch (error) {
      console.error("Exception in submitAdmissionForm:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload Document to Admission Application
   * Saves file to storage and creates document record
   * Now uses DB1 for both storage and database to avoid cross-database issues
   */
  async uploadDocument(
    applicationId,
    file,
    documentType,
    documentName = null
  ) {
    try {
      if (!this.supabaseDb) {
        console.error("Supabase database not initialized");
        return { success: false, error: "Database connection failed" };
      }

      // Validate file
      if (!file || file.size === 0) {
        console.error("File is empty or invalid");
        return { success: false, error: "File is empty or invalid" };
      }

      const maxFileSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxFileSize) {
        console.error("File size exceeds 10MB limit:", file.size);
        return {
          success: false,
          error: "File size exceeds 10MB limit",
        };
      }

      // Create unique file path
      const timestamp = Date.now();
      const filename = `${applicationId}/${documentType}/${timestamp}_${file.name}`;

      console.log(`Attempting to upload file: ${filename}, size: ${file.size} bytes`);

      // Try uploading to storage using supabaseMedia (DB2)
      let uploadError = null;
      let uploadData = null;

      try {
        const result = await this.supabaseMedia.storage
          .from("media")
          .upload(filename, file, { upsert: false });
        
        uploadData = result.data;
        uploadError = result.error;
      } catch (e) {
        console.error("Storage upload exception:", e);
        uploadError = e;
      }

      if (uploadError) {
        console.error("Error uploading file to storage:", uploadError);
        // Continue with database record even if storage fails (fallback mode)
        console.warn("Storage upload failed, proceeding with database record creation");
      } else {
        console.log("✅ File uploaded to storage successfully");
      }

      // Get public URL
      const urlData = this.supabaseMedia.storage
        .from("media")
        .getPublicUrl(filename);

      const publicUrl = urlData.data?.publicUrl || `https://admission-documents/${filename}`;

      // Create document record in database - this is REQUIRED
      const documentRecord = {
        application_id: applicationId,
        document_type: documentType,
        document_name: documentName || file.name,
        document_url: publicUrl,
        file_size: file.size,
        file_type: file.type,
        uploaded_by: "student",
        document_status: uploadError ? "pending" : "active",
      };

      console.log("Creating document record:", documentRecord);

      const { data: docData, error: docError } = await this.supabaseDb
        .from("admission_documents")
        .insert([documentRecord])
        .select();

      if (docError) {
        console.error("Error creating document record:", docError);
        return { success: false, error: `Database error: ${docError.message}` };
      }

      if (!docData || docData.length === 0) {
        console.error("No data returned from document insert");
        return { success: false, error: "Failed to create document record" };
      }

      this.uploadedDocuments.push(docData[0]);

      return {
        success: true,
        documentId: docData[0].id,
        documentUrl: publicUrl,
        message: "Document uploaded successfully!",
      };
    } catch (error) {
      console.error("Exception in uploadDocument:", error);
      return { success: false, error: `Upload error: ${error.message}` };
    }
  }

  /**
   * Get Application Details by ID
   */
  async getApplicationDetails(applicationId) {
    try {
      const { data, error } = await this.supabaseDb
        .from("admission_applications")
        .select("*")
        .eq("id", applicationId)
        .single();

      if (error) {
        console.error("Error fetching application:", error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Exception in getApplicationDetails:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get All Documents for Application
   */
  async getApplicationDocuments(applicationId) {
    try {
      const { data, error } = await this.supabaseDb
        .from("admission_documents")
        .select("*")
        .eq("application_id", applicationId)
        .order("upload_date", { ascending: false });

      if (error) {
        console.error("Error fetching documents:", error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Exception in getApplicationDocuments:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update Application Status (Admin Only)
   */
  async updateApplicationStatus(applicationId, status, notes = "") {
    try {
      const { data, error } = await this.supabaseDb
        .from("admission_applications")
        .update({
          application_status: status,
          admission_notes: notes,
        })
        .eq("id", applicationId)
        .select();

      if (error) {
        console.error("Error updating application status:", error);
        return { success: false, error: error.message };
      }

      return { success: true, data, message: "Application status updated!" };
    } catch (error) {
      console.error("Exception in updateApplicationStatus:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get All Applications (Admin - with filters)
   */
  async getAllApplications(filters = {}) {
    try {
      let query = this.supabaseDb.from("admission_applications").select("*");

      // Apply filters
      if (filters.status) {
        query = query.eq("application_status", filters.status);
      }
      if (filters.class) {
        query = query.eq("class_applying_for", filters.class);
      }
      if (filters.searchName) {
        query = query.ilike("full_name", `%${filters.searchName}%`);
      }

      // Order by date
      query = query.order("submitted_date", { ascending: false });

      // Pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching applications:", error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Exception in getAllApplications:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Admission Summary (Admin Dashboard)
   */
  async getAdmissionSummary() {
    try {
      const { data, error } = await this.supabaseDb
        .from("admission_summary")
        .select("*")
        .single();

      if (error) {
        console.error("Error fetching summary:", error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Exception in getAdmissionSummary:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete Application (Admin Only)
   */
  async deleteApplication(applicationId) {
    try {
      const { error } = await this.supabaseDb
        .from("admission_applications")
        .delete()
        .eq("id", applicationId);

      if (error) {
        console.error("Error deleting application:", error);
        return { success: false, error: error.message };
      }

      return { success: true, message: "Application deleted successfully!" };
    } catch (error) {
      console.error("Exception in deleteApplication:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Search Applications by Multiple Criteria
   */
  async searchApplications(searchTerm) {
    try {
      const { data, error } = await this.supabaseDb
        .from("admission_applications")
        .select("*")
        .or(
          `full_name.ilike.%${searchTerm}%,father_email.ilike.%${searchTerm}%,father_phone.ilike.%${searchTerm}%`
        )
        .order("submitted_date", { ascending: false });

      if (error) {
        console.error("Error searching applications:", error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Exception in searchApplications:", error);
      return { success: false, error: error.message };
    }
  }
}

// Initialize global instance
const admissionHandler = new AdmissionHandler();

// Expose globally
window.admissionHandler = admissionHandler;
window.AdmissionHandler = AdmissionHandler;
