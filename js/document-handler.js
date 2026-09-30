// ============================================================================
// FILE:    document-handler.js
// MODULE:  Documents
// PURPOSE: Document Handler - Upload, manage, and retrieve school documents (circulars, certificates, notices)
//
// PROJECT: Shree Saraswati Secondary School — Management System
// STACK:   Vanilla JS + Supabase (PostgreSQL) + HTML/CSS
// UPDATED: 2026-06-03
// ============================================================================
// ════════════════════════════════════════════════════════════════════════════
// DOCUMENT HANDLER - Document Management System
// ════════════════════════════════════════════════════════════════════════════
// Manages upload, retrieval, and deletion of school documents

class DocumentHandler {
  constructor() {
    this.tableName = 'school_documents';
    this.storageBucket = 'media';
    this.cacheDocuments = null;
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this.lastCacheTime = 0;
  }

  /**
   * Get all active public documents
   * @returns {Promise<Array>} Array of document objects
   */
  async getPublicDocuments() {
    try {
      // Return cached data if still valid
      if (this.cacheDocuments && (Date.now() - this.lastCacheTime < this.cacheExpiry)) {
        return { success: true, data: this.cacheDocuments };
      }

      const { data, error } = await window.supabaseDb
        .from(this.tableName)
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching public documents:', error);
        return { success: false, error: error.message };
      }

      // Cache the results
      this.cacheDocuments = data || [];
      this.lastCacheTime = Date.now();

      return { success: true, data: data || [] };
    } catch (err) {
      console.error('Error in getPublicDocuments:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Get documents by category
   * @param {string} category - Document category
   * @returns {Promise<Array>} Array of documents in the category
   */
  async getDocumentsByCategory(category) {
    try {
      const { data, error } = await window.supabaseDb
        .from(this.tableName)
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('display_order', { ascending: false });

      if (error) {
        console.error('Error fetching documents by category:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (err) {
      console.error('Error in getDocumentsByCategory:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Get a single document by ID
   * @param {number} documentId - Document ID
   * @returns {Promise<Object>} Document object or error
   */
  async getDocumentById(documentId) {
    try {
      const { data, error } = await window.supabaseDb
        .from(this.tableName)
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) {
        console.error('Error fetching document:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (err) {
      console.error('Error in getDocumentById:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Upload a document file to Supabase Storage
   * @param {File} file - File object to upload
   * @param {string} fileFolder - Optional folder path in storage
   * @returns {Promise<Object>} Upload result with file path
   */
  async uploadFile(file, fileFolder = '') {
    try {
      if (!file) {
        return { success: false, error: 'No file selected' };
      }

      // Validate file size (max 50MB)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        return { success: false, error: 'File size exceeds 50MB limit' };
      }

      // Create unique file name with timestamp
      const timestamp = Date.now();
      const sanitizedFileName = file.name
        .toLowerCase()
        .replace(/[^a-z0-9.]/g, '-')
        .replace(/-+/g, '-');
      const uniqueFileName = `${timestamp}_${sanitizedFileName}`;
      const filePath = fileFolder ? `${fileFolder}/${uniqueFileName}` : uniqueFileName;

      // Upload to Supabase Storage
      const { data, error } = await window.supabaseMedia.storage
        .from(this.storageBucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading file:', error);
        return { success: false, error: error.message };
      }

      // Get public URL for the file
      const { data: urlData } = window.supabaseMedia.storage
        .from(this.storageBucket)
        .getPublicUrl(filePath);

      return {
        success: true,
        filePath: filePath,
        fileUrl: urlData.publicUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      };
    } catch (err) {
      console.error('Error in uploadFile:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Add a new document to the database
   * @param {Object} docData - Document data
   * @returns {Promise<Object>} Result with new document ID
   */
  async addDocument(docData) {
    try {
      if (!docData.title || !docData.category || !docData.file_url) {
        return { success: false, error: 'Missing required fields: title, category, file_url' };
      }

      const document = {
        title: docData.title,
        description: docData.description || '',
        category: docData.category,
        file_name: docData.file_name || docData.title,
        file_url: docData.file_url,
        file_size: docData.file_size || 0,
        file_type: docData.file_type || 'application/octet-stream',
        icon_type: docData.icon_type || 'document',
        uploaded_by: docData.uploaded_by || 'Admin',
        display_order: docData.display_order || 0,
        is_active: docData.is_active !== false
      };

      const { data, error } = await window.supabaseDb
        .from(this.tableName)
        .insert([document])
        .select();

      if (error) {
        console.error('Error adding document:', error);
        return { success: false, error: error.message };
      }

      // Clear cache
      this.cacheDocuments = null;

      return { success: true, data: data?.[0] };
    } catch (err) {
      console.error('Error in addDocument:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Update an existing document
   * @param {number} documentId - Document ID to update
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Update result
   */
  async updateDocument(documentId, updateData) {
    try {
      const { data, error } = await window.supabaseDb
        .from(this.tableName)
        .update(updateData)
        .eq('id', documentId)
        .select();

      if (error) {
        console.error('Error updating document:', error);
        return { success: false, error: error.message };
      }

      // Clear cache
      this.cacheDocuments = null;

      return { success: true, data: data?.[0] };
    } catch (err) {
      console.error('Error in updateDocument:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Delete a document (soft delete - mark as inactive)
   * @param {number} documentId - Document ID to delete
   * @returns {Promise<Object>} Delete result
   */
  async deleteDocument(documentId) {
    try {
      // Soft delete - mark as inactive
      const { error } = await window.supabaseDb
        .from(this.tableName)
        .update({ is_active: false })
        .eq('id', documentId);

      if (error) {
        console.error('Error deleting document:', error);
        return { success: false, error: error.message };
      }

      // Clear cache
      this.cacheDocuments = null;

      return { success: true };
    } catch (err) {
      console.error('Error in deleteDocument:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Permanently delete a document from storage and database
   * @param {number} documentId - Document ID
   * @param {string} filePath - File path in storage
   * @returns {Promise<Object>} Delete result
   */
  async deleteDocumentPermanent(documentId, filePath) {
    try {
      // Delete from storage first
      if (filePath && !filePath.startsWith('http')) {
        const { error: storageError } = await window.supabaseMedia.storage
          .from(this.storageBucket)
          .remove([filePath]);

        if (storageError) {
          console.error('Error deleting from storage:', storageError);
        }
      }

      // Delete from database (hard delete)
      const { error } = await window.supabaseDb
        .from(this.tableName)
        .delete()
        .eq('id', documentId);

      if (error) {
        console.error('Error deleting document:', error);
        return { success: false, error: error.message };
      }

      // Clear cache
      this.cacheDocuments = null;

      return { success: true };
    } catch (err) {
      console.error('Error in deleteDocumentPermanent:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Increment download count for a document
   * @param {number} documentId - Document ID
   * @returns {Promise<Object>} Update result
   */
  async incrementDownloadCount(documentId) {
    try {
      const { data } = await window.supabaseDb
        .from(this.tableName)
        .select('download_count')
        .eq('id', documentId)
        .single();

      const newCount = (data?.download_count || 0) + 1;

      const { error } = await window.supabaseDb
        .from(this.tableName)
        .update({ download_count: newCount })
        .eq('id', documentId);

      if (error) {
        console.error('Error incrementing download count:', error);
      }

      return { success: !error };
    } catch (err) {
      console.error('Error in incrementDownloadCount:', err);
      return { success: false };
    }
  }

  /**
   * Get all documents (admin view - includes inactive)
   * @returns {Promise<Array>} All documents
   */
  async getAllDocuments() {
    try {
      const { data, error } = await window.supabaseDb
        .from(this.tableName)
        .select('*')
        .order('display_order', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all documents:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (err) {
      console.error('Error in getAllDocuments:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cacheDocuments = null;
    this.lastCacheTime = 0;
  }
}

// Initialize and expose globally
const documentHandler = new DocumentHandler();
window.documentHandler = documentHandler;
