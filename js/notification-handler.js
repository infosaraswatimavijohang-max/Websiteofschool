/**
 * notification-handler.js
 * Handles fetching, rendering, and creating notifications using Supabase.
 */

// We assume supabaseDb is already initialized in supabase-client.js

window.NotificationService = {
  /**
   * Fetch unread notifications for a specific role and user ID.
   * Also fetches broadcasts ('all').
   * @param {string} role - 'admin', 'teacher', 'student'
   * @param {string} userId - Optional specific user ID (roll number or email)
   */
  async fetchNotifications(role, userId = null) {
    if (typeof supabaseDb === 'undefined' || !supabaseDb) {
      console.warn("Supabase not initialized, cannot fetch notifications.");
      return [];
    }

    try {
      let query = supabaseDb
        .from('system_notifications')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(20);

      // We want to fetch notifications where recipient_role is 'all' 
      // OR (recipient_role is 'role' AND (recipient_id is null OR recipient_id is 'userId'))
      
      const { data, error } = await query;
      
      if (error) throw error;

      // Filter in memory since Supabase JS OR queries can be tricky
      return data.filter(n => {
        if (n.recipient_role === 'all') return true;
        if (n.recipient_role === role) {
          if (!n.recipient_id) return true; // Role-wide broadcast
          if (userId && String(n.recipient_id) === String(userId)) return true; // Specific user
        }
        return false;
      });

    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  },

  /**
   * Create a new notification
   */
  async createNotification(role, userId, title, message, type = 'info', actionUrl = null) {
    if (typeof supabaseDb === 'undefined' || !supabaseDb) return false;

    try {
      const { error } = await supabaseDb
        .from('system_notifications')
        .insert([{
          recipient_role: role,
          recipient_id: userId,
          title: title,
          message: message,
          type: type,
          action_url: actionUrl
        }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error creating notification:", error);
      return false;
    }
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(id) {
    if (typeof supabaseDb === 'undefined' || !supabaseDb) return false;

    try {
      const { error } = await supabaseDb
        .from('system_notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  },

  /**
   * Helper to format relative time (e.g. "2 hours ago")
   */
  timeAgo(dateString) {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return Math.floor(seconds) + " secs ago";
  },

  /**
   * Standardized rendering of notifications to a dropdown container
   */
  renderToContainer(containerId, badgeId, notifications) {
    const container = document.getElementById(containerId);
    const badge = document.getElementById(badgeId);
    
    if (!container) return;

    if (badge) {
      if (notifications.length > 0) {
        badge.textContent = notifications.length > 9 ? '9+' : notifications.length;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }

    if (notifications.length === 0) {
      container.innerHTML = `<div style="padding:1.5rem; text-align:center; color:#9ca3af; font-size:0.9rem;">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width:40px;height:40px;margin:0 auto 10px;opacity:0.5;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
        No new notifications
      </div>`;
      return;
    }

    const typeIcons = {
      'info': '<div style="width:32px;height:32px;border-radius:50%;background:#e0f2fe;color:#0284c7;display:flex;align-items:center;justify-content:center;flex-shrink:0;">ℹ️</div>',
      'success': '<div style="width:32px;height:32px;border-radius:50%;background:#dcfce7;color:#16a34a;display:flex;align-items:center;justify-content:center;flex-shrink:0;">✓</div>',
      'warning': '<div style="width:32px;height:32px;border-radius:50%;background:#fef3c7;color:#d97706;display:flex;align-items:center;justify-content:center;flex-shrink:0;">⚠️</div>',
      'danger': '<div style="width:32px;height:32px;border-radius:50%;background:#fee2e2;color:#dc2626;display:flex;align-items:center;justify-content:center;flex-shrink:0;">!</div>'
    };

    container.innerHTML = notifications.map(n => `
      <div class="notification-item" data-id="${n.id}" data-url="${n.action_url || ''}" style="padding:1rem; border-bottom:1px solid #f3f4f6; display:flex; gap:1rem; cursor:pointer; transition:background 0.2s;" onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='white'">
        ${typeIcons[n.type] || typeIcons['info']}
        <div style="flex-grow:1;">
          <div style="font-weight:600; font-size:0.9rem; color:#111827; margin-bottom:0.2rem;">${n.title}</div>
          <div style="font-size:0.8rem; color:#4b5563; line-height:1.4; margin-bottom:0.4rem;">${n.message}</div>
          <div style="font-size:0.7rem; color:#9ca3af; display:flex; justify-content:space-between; align-items:center;">
            <span>${this.timeAgo(n.created_at)}</span>
            <span class="mark-read-btn" style="color:#3b82f6; font-weight:600; padding:2px 6px; border-radius:4px;" onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background='transparent'">Mark Read</span>
          </div>
        </div>
      </div>
    `).join('');

    // Attach event listeners
    const items = container.querySelectorAll('.notification-item');
    items.forEach(item => {
      item.addEventListener('click', async (e) => {
        // Prevent double trigger if clicking "Mark Read" specifically
        e.stopPropagation();
        
        const id = item.dataset.id;
        const url = item.dataset.url;
        
        // Optimistic UI update
        item.style.opacity = '0.5';
        
        // Mark read in DB
        await this.markAsRead(id);
        
        // Hide item
        item.style.display = 'none';
        
        // Update badge
        const currentCount = parseInt(badge.textContent) || 0;
        if (currentCount > 1) {
          badge.textContent = currentCount - 1;
        } else {
          badge.style.display = 'none';
        }

        // Check if empty
        const remainingItems = Array.from(container.querySelectorAll('.notification-item')).filter(i => i.style.display !== 'none');
        if (remainingItems.length === 0) {
          this.renderToContainer(containerId, badgeId, []);
        }

        // Navigate if action URL exists
        if (url && url !== 'null' && url !== 'undefined') {
          window.location.href = url;
        }
      });
    });
  }
};
