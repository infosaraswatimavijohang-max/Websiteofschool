// ============================================================================
// FILE:    staff-handler.js
// MODULE:  Staff Management
// PURPOSE: Staff Handler - Teacher and staff profile CRUD, department management, staff directory, and hierarchy assignments
//
// PROJECT: Shree Saraswati Secondary School — Management System
// STACK:   Vanilla JS + Supabase (PostgreSQL) + HTML/CSS
// UPDATED: 2026-06-03
// ============================================================================
// ============================================================================
// STAFF HIERARCHY HANDLER - CRUD & IMAGE MANAGEMENT
// ============================================================================
// Comprehensive handler for managing staff hierarchy with image uploads,
// tree structure, and full CRUD operations
// ============================================================================

class StaffHierarchyHandler {
    constructor() {
        this.supabaseDb = supabaseDb;
        this.supabaseMedia = supabaseMedia;
        this.BUCKET_NAME = 'media';
        this.MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        this.ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
        
        // Verify initialization
        console.log('[StaffHandler] Initializing...');
        if (!this.supabaseDb) {
            console.error('[StaffHandler] ERROR: supabaseDb is not initialized!');
        } else {
            console.log('[StaffHandler] ✓ supabaseDb initialized');
        }
    }

    /**
     * Check database connection
     */
    async checkConnection() {
        try {
            if (!this.supabaseDb) {
                return { success: false, error: 'supabaseDb not initialized' };
            }
            const { data, error } = await this.supabaseDb.from('staff_hierarchy').select('count()', { count: 'exact', head: true });
            if (error) {
                console.warn('[StaffHandler] Database check - Table may not exist:', error.message);
                return { success: false, error: error.message, tableExists: false };
            }
            console.log('[StaffHandler] ✓ Database connection OK');
            return { success: true, tableExists: true };
        } catch (err) {
            console.error('[StaffHandler] Connection check failed:', err);
            return { success: false, error: err.message };
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // 1. CREATE OPERATIONS
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Create a new staff member
     */
    async createStaff(staffData) {
        try {
            console.log('Creating staff member:', staffData.name);
            
            // Validate required fields
            if (!staffData.name || !staffData.position || !staffData.department) {
                throw new Error('Name, position, and department are required');
            }

            const insertData = {
                name: staffData.name.trim(),
                position: staffData.position.trim(),
                department: staffData.department.trim(),
                bio: staffData.bio || null,
                parent_id: staffData.parent_id || null,
                hierarchy_level: staffData.hierarchy_level || 0,
                order_index: staffData.order_index || 0,
                email: staffData.email || null,
                phone: staffData.phone || null,
                office_location: staffData.office_location || null,
                qualification: staffData.qualification || null,
                experience_years: staffData.experience_years || 0,
                specialization: staffData.specialization || null,
                linkedin_url: staffData.linkedin_url || null,
                social_links: staffData.social_links || null,
                is_active: staffData.is_active !== false,
                featured: staffData.featured || false,
                display_order: staffData.display_order || 0
            };

            const { data, error } = await this.supabaseDb
                .from('staff_hierarchy')
                .insert([insertData])
                .select();

            if (error) throw new Error(`Database error: ${error.message}`);

            console.log('✓ Staff created successfully:', data[0].id);
            return { success: true, data: data[0] };

        } catch (error) {
            console.error('✗ Error creating staff:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // 2. READ OPERATIONS
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Get all active staff members with optional filtering
     */
    async getAllStaff(filters = {}) {
        try {
            console.log('[StaffHandler] getAllStaff called with filters:', filters);
            
            // Check connection first
            const connCheck = await this.checkConnection();
            if (!connCheck.success) {
                console.warn('[StaffHandler] Database connection issue:', connCheck.error);
            }
            
            if (!this.supabaseDb) {
                throw new Error('Database client not initialized');
            }
            
            let query = this.supabaseDb
                .from('staff_hierarchy')
                .select('*');

            // Apply filters
            if (filters.is_active !== undefined) {
                query = query.eq('is_active', filters.is_active);
            }
            if (filters.department) {
                query = query.eq('department', filters.department);
            }
            if (filters.hierarchy_level !== undefined) {
                query = query.eq('hierarchy_level', filters.hierarchy_level);
            }

            query = query.order('hierarchy_level', { ascending: true })
                        .order('display_order', { ascending: true })
                        .order('order_index', { ascending: true });

            const { data, error } = await query;

            if (error) {
                console.error('[StaffHandler] Query error:', error);
                throw new Error(`Database error: ${error.message}`);
            }

            console.log(`[StaffHandler] ✓ Retrieved ${data ? data.length : 0} staff members`);
            return { success: true, data: data || [] };

        } catch (error) {
            console.error('[StaffHandler] Error fetching staff:', error.message);
            return { success: false, error: error.message, data: [] };
        }
    }

    /**
     * Get a single staff member by ID
     */
    async getStaffById(staffId) {
        try {
            const { data, error } = await this.supabaseDb
                .from('staff_hierarchy')
                .select('*')
                .eq('id', staffId)
                .single();

            if (error) throw new Error(`Database error: ${error.message}`);
            if (!data) throw new Error('Staff member not found');

            console.log('✓ Retrieved staff member:', data.name);
            return { success: true, data };

        } catch (error) {
            console.error('✗ Error fetching staff by ID:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get organizational tree structure recursively
     */
    async getStaffTree(parentId = null) {
        try {
            let query = this.supabaseDb
                .from('staff_hierarchy')
                .select('*')
                .eq('is_active', true);

            if (parentId === null) {
                query = query.eq('parent_id', null).eq('hierarchy_level', 0);
            } else {
                query = query.eq('parent_id', parentId);
            }

            query = query.order('order_index', { ascending: true });

            const { data, error } = await query;

            if (error) throw new Error(`Database error: ${error.message}`);

            // Recursively fetch children
            const treeData = await Promise.all(
                data.map(async (staff) => {
                    const children = await this.getStaffTree(staff.id);
                    return {
                        ...staff,
                        children: children.success ? children.data : []
                    };
                })
            );

            return { success: true, data: treeData };

        } catch (error) {
            console.error('✗ Error fetching staff tree:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get staff by department
     */
    async getStaffByDepartment(department) {
        try {
            const { data, error } = await this.supabaseDb
                .from('staff_hierarchy')
                .select('*')
                .eq('department', department)
                .eq('is_active', true)
                .order('hierarchy_level', { ascending: true })
                .order('order_index', { ascending: true });

            if (error) throw new Error(`Database error: ${error.message}`);

            console.log(`✓ Retrieved ${data.length} staff members from ${department}`);
            return { success: true, data };

        } catch (error) {
            console.error('✗ Error fetching by department:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Search staff by name, position, or specialization
     */
    async searchStaff(query) {
        try {
            const { data, error } = await this.supabaseDb
                .from('staff_hierarchy')
                .select('*')
                .or(`name.ilike.%${query}%,position.ilike.%${query}%,specialization.ilike.%${query}%`)
                .eq('is_active', true)
                .order('hierarchy_level', { ascending: true });

            if (error) throw new Error(`Database error: ${error.message}`);

            console.log(`✓ Found ${data.length} matching staff members`);
            return { success: true, data };

        } catch (error) {
            console.error('✗ Error searching staff:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // 3. UPDATE OPERATIONS
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Update staff member details
     */
    async updateStaff(staffId, updateData) {
        try {
            console.log('Updating staff member:', staffId);

            const { data, error } = await this.supabaseDb
                .from('staff_hierarchy')
                .update({
                    ...updateData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', staffId)
                .select();

            if (error) throw new Error(`Database error: ${error.message}`);
            if (!data || data.length === 0) throw new Error('Staff member not found');

            console.log('✓ Staff updated successfully');
            return { success: true, data: data[0] };

        } catch (error) {
            console.error('✗ Error updating staff:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update hierarchy position (move to different parent)
     */
    async updateHierarchy(staffId, newParentId, hierarchyLevel, orderIndex) {
        try {
            console.log(`Moving staff ${staffId} under parent ${newParentId}`);

            const { data, error } = await this.supabaseDb
                .from('staff_hierarchy')
                .update({
                    parent_id: newParentId,
                    hierarchy_level: hierarchyLevel,
                    order_index: orderIndex,
                    updated_at: new Date().toISOString()
                })
                .eq('id', staffId)
                .select();

            if (error) throw new Error(`Database error: ${error.message}`);

            console.log('✓ Hierarchy updated successfully');
            return { success: true, data: data[0] };

        } catch (error) {
            console.error('✗ Error updating hierarchy:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // 4. DELETE OPERATIONS
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Delete staff member (soft delete via is_active flag)
     */
    async deleteStaff(staffId) {
        try {
            console.log('Deleting staff member:', staffId);

            // Get staff details to find image
            const staffRes = await this.getStaffById(staffId);
            if (!staffRes.success) throw new Error('Staff member not found');

            // Delete image if exists
            if (staffRes.data.image_name) {
                await this.deleteImage(staffRes.data.image_name);
            }

            // Soft delete
            const { data, error } = await this.supabaseDb
                .from('staff_hierarchy')
                .update({
                    is_active: false,
                    updated_at: new Date().toISOString()
                })
                .eq('id', staffId)
                .select();

            if (error) throw new Error(`Database error: ${error.message}`);

            console.log('✓ Staff deleted successfully');
            return { success: true };

        } catch (error) {
            console.error('✗ Error deleting staff:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Hard delete staff member (use with caution)
     */
    async hardDeleteStaff(staffId) {
        try {
            console.log('Hard deleting staff member:', staffId);

            // Get staff details
            const staffRes = await this.getStaffById(staffId);
            if (!staffRes.success) throw new Error('Staff member not found');

            // Delete image if exists
            if (staffRes.data.image_name) {
                await this.deleteImage(staffRes.data.image_name);
            }

            // Hard delete
            const { error } = await this.supabaseDb
                .from('staff_hierarchy')
                .delete()
                .eq('id', staffId);

            if (error) throw new Error(`Database error: ${error.message}`);

            console.log('✓ Staff hard deleted successfully');
            return { success: true };

        } catch (error) {
            console.error('✗ Error hard deleting staff:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // 5. IMAGE MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Upload image for staff member
     */
    async uploadImage(staffId, file) {
        try {
            // Validate file
            if (!file) throw new Error('No file provided');
            if (!this.ALLOWED_TYPES.includes(file.type)) {
                throw new Error(`Invalid file type. Allowed: ${this.ALLOWED_TYPES.join(', ')}`);
            }
            if (file.size > this.MAX_FILE_SIZE) {
                throw new Error(`File size exceeds ${this.MAX_FILE_SIZE / 1024 / 1024}MB limit`);
            }

            console.log(`Uploading image for staff ${staffId}`);

            // Generate unique filename
            const timestamp = Date.now();
            const fileExtension = file.name.split('.').pop();
            const fileName = `staff_${staffId}_${timestamp}.${fileExtension}`;

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await this.supabaseMedia
                .storage
                .from(this.BUCKET_NAME)
                .upload(fileName, file, { upsert: false });

            if (uploadError) throw new Error(`Upload error: ${uploadError.message}`);

            // Get public URL
            const { data: urlData } = this.supabaseMedia
                .storage
                .from(this.BUCKET_NAME)
                .getPublicUrl(fileName);

            const imageUrl = urlData.publicUrl;

            // Update staff record with image info
            const { data: updateData, error: updateError } = await this.supabaseDb
                .from('staff_hierarchy')
                .update({
                    image_url: imageUrl,
                    image_name: fileName,
                    image_size: file.size,
                    image_uploaded_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', staffId)
                .select();

            if (updateError) throw new Error(`Database error: ${updateError.message}`);

            console.log('✓ Image uploaded successfully:', imageUrl);
            return {
                success: true,
                imageUrl,
                fileName
            };

        } catch (error) {
            console.error('✗ Error uploading image:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete image from storage
     */
    async deleteImage(fileName) {
        try {
            console.log('Deleting image:', fileName);

            const { error } = await this.supabaseMedia
                .storage
                .from(this.BUCKET_NAME)
                .remove([fileName]);

            if (error) throw new Error(`Storage error: ${error.message}`);

            console.log('✓ Image deleted successfully');
            return { success: true };

        } catch (error) {
            console.error('✗ Error deleting image:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Replace staff image
     */
    async replaceImage(staffId, newFile) {
        try {
            console.log(`Replacing image for staff ${staffId}`);

            // Get current staff to find old image
            const staffRes = await this.getStaffById(staffId);
            if (!staffRes.success) throw new Error('Staff member not found');

            // Delete old image if exists
            if (staffRes.data.image_name) {
                await this.deleteImage(staffRes.data.image_name);
            }

            // Upload new image
            return await this.uploadImage(staffId, newFile);

        } catch (error) {
            console.error('✗ Error replacing image:', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // 6. HELPER FUNCTIONS
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Get departments list
     */
    async getDepartments() {
        try {
            const { data, error } = await this.supabaseDb
                .from('staff_hierarchy')
                .select('department')
                .eq('is_active', true)
                .distinct();

            if (error) throw new Error(`Database error: ${error.message}`);

            const departments = data
                .map(item => item.department)
                .filter(Boolean)
                .sort();

            return { success: true, data: departments };

        } catch (error) {
            console.error('✗ Error fetching departments:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get featured staff members
     */
    async getFeaturedStaff() {
        try {
            const { data, error } = await this.supabaseDb
                .from('staff_hierarchy')
                .select('*')
                .eq('is_active', true)
                .eq('featured', true)
                .order('display_order', { ascending: true });

            if (error) throw new Error(`Database error: ${error.message}`);

            return { success: true, data };

        } catch (error) {
            console.error('✗ Error fetching featured staff:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get organizational statistics
     */
    async getStatistics() {
        try {
            console.log('[StaffHandler] getStatistics called');
            
            const { data: totalStaff, error: err1 } = await this.supabaseDb
                .from('staff_hierarchy')
                .select('id', { count: 'exact' })
                .eq('is_active', true);

            if (err1) {
                console.warn('[StaffHandler] Error getting total staff count:', err1);
            }

            const { data: byLevel, error: err2 } = await this.supabaseDb
                .from('staff_hierarchy')
                .select('hierarchy_level')
                .eq('is_active', true);

            if (err2) {
                console.warn('[StaffHandler] Error getting staff by level:', err2);
            }

            const deptResult = await this.getDepartments();
            const departments = deptResult.data || [];

            const stats = {
                totalStaff: totalStaff ? totalStaff.length : 0,
                byLevel: byLevel ? this.groupBy(byLevel, 'hierarchy_level') : {},
                departmentCount: departments.length,
                departments
            };

            console.log('[StaffHandler] Statistics:', stats);
            return { success: true, data: stats };

        } catch (error) {
            console.error('[StaffHandler] Error fetching statistics:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Helper: Group array by property
     */
    groupBy(array, property) {
        return array.reduce((groups, item) => {
            const key = item[property];
            groups[key] = (groups[key] || 0) + 1;
            return groups;
        }, {});
    }

    /**
     * Export staff data to JSON
     */
    async exportToJSON() {
        try {
            const result = await this.getAllStaff({ is_active: true });
            if (!result.success) throw new Error('Failed to fetch staff data');

            const dataStr = JSON.stringify(result.data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `staff_hierarchy_${Date.now()}.json`;
            link.click();

            return { success: true, message: 'Export completed' };

        } catch (error) {
            console.error('✗ Error exporting data:', error);
            return { success: false, error: error.message };
        }
    }
}

// Initialize globally
const staffHandler = new StaffHierarchyHandler();

// Expose globally
window.staffHandler = staffHandler;
window.StaffHierarchyHandler = StaffHierarchyHandler;
