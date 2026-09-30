// ============================================================================
// FILE:    principal-handler.js
// MODULE:  Principal / Head Teacher Management
// PURPOSE: CRUD operations for principal photo, name, and message
//          Stores data in school_config table with key 'principal_info'
//
// PROJECT: Shree Saraswati Secondary School — Management System
// STACK:   Vanilla JS + Supabase (PostgreSQL)
// ============================================================================

(function() {
  'use strict';

  // Temporary photo data (base64) before saving
  let pendingPhotoData = null;

  // ── LOAD Principal Info ──
  async function loadPrincipalInfo() {
    try {
      // Try from Supabase first
      if (typeof supabaseDb !== 'undefined' && supabaseDb) {
        const { data, error } = await supabaseDb
          .from('school_config')
          .select('val')
          .eq('key', 'principal_info')
          .single();

        if (!error && data && data.val) {
          const info = typeof data.val === 'string' ? JSON.parse(data.val) : data.val;
          localStorage.setItem('principal_info', JSON.stringify(info));
          populateForm(info);
          return;
        }
      }

      // Fallback: localStorage
      const cached = localStorage.getItem('principal_info');
      if (cached) {
        populateForm(JSON.parse(cached));
        return;
      }

      // Load defaults from the existing HTML content
      populateForm({
        name: 'Chhabilal Bhandari',
        title: 'Head Teacher',
        school: 'Shree Saraswati Secondary School, Gulmi',
        greeting: 'Dear Students, Parents, and Well-wishers,',
        message: 'It is my absolute privilege and joy to welcome you to Shree Saraswati Secondary School, a center of educational excellence nestled in the gorgeous, peaceful hills of Satyawati-6, Johang, Gulmi. Since our historical establishment in 2016 B.S., we have committed ourselves to bringing standard, career-empowering education to the youth of our community.',
        quote: '"We do not merely teach curriculum; we spark curiosity, cultivate strong moral character, and inspire each student to realize their ultimate potential."',
        message2: 'In this digital age, we have integrated modern pedagogical techniques alongside our values-based general studies. Our specialized Computer Engineering program (Grades 9 to 12) prepares students directly for tech-focused careers. We invite you to join us on this beautiful journey of knowledge, leadership, and success.',
        photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=50'
      });

    } catch (e) {
      console.error('Error loading principal info:', e);
    }
  }

  // ── Populate the form fields ──
  function populateForm(info) {
    const nameInput = document.getElementById('principal-name-input');
    const titleInput = document.getElementById('principal-title-input');
    const schoolInput = document.getElementById('principal-school-input');
    const greetingInput = document.getElementById('principal-greeting-input');
    const messageInput = document.getElementById('principal-message-input');
    const quoteInput = document.getElementById('principal-quote-input');
    const message2Input = document.getElementById('principal-message2-input');
    const photoImg = document.getElementById('principal-photo-img');
    const photoPlaceholder = document.getElementById('principal-photo-placeholder');

    if (nameInput) nameInput.value = info.name || '';
    if (titleInput) titleInput.value = info.title || '';
    if (schoolInput) schoolInput.value = info.school || '';
    if (greetingInput) greetingInput.value = info.greeting || '';
    if (messageInput) messageInput.value = info.message || '';
    if (quoteInput) quoteInput.value = info.quote || '';
    if (message2Input) message2Input.value = info.message2 || '';

    // Photo
    if (info.photoUrl && photoImg) {
      photoImg.src = info.photoUrl;
      photoImg.style.display = 'block';
      if (photoPlaceholder) photoPlaceholder.style.display = 'none';
    }

    // Reset pending photo
    pendingPhotoData = null;

    // Update live preview
    updatePreview(info);
  }

  // ── Update live preview ──
  function updatePreview(info) {
    const previewImg = document.getElementById('principal-preview-img');
    const previewName = document.getElementById('principal-preview-name');
    const previewTitle = document.getElementById('principal-preview-title');
    const previewQuote = document.getElementById('principal-preview-quote');

    if (previewName) previewName.textContent = info.name || '';
    if (previewTitle) previewTitle.textContent = (info.title || '') + ' · ' + (info.school || '');
    if (previewQuote) previewQuote.textContent = info.quote || '';

    if (previewImg && info.photoUrl) {
      previewImg.src = info.photoUrl;
      previewImg.style.display = 'block';
    }
  }

  // ── Handle photo upload ──
  function handlePrincipalPhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, etc.).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      const base64Data = e.target.result;
      pendingPhotoData = base64Data;

      // Update preview immediately
      const photoImg = document.getElementById('principal-photo-img');
      const photoPlaceholder = document.getElementById('principal-photo-placeholder');
      const previewImg = document.getElementById('principal-preview-img');

      if (photoImg) {
        photoImg.src = base64Data;
        photoImg.style.display = 'block';
      }
      if (photoPlaceholder) photoPlaceholder.style.display = 'none';
      if (previewImg) {
        previewImg.src = base64Data;
        previewImg.style.display = 'block';
      }
    };
    reader.readAsDataURL(file);
  }

  // ── SAVE Principal Info ──
  async function savePrincipalInfo() {
    const nameInput = document.getElementById('principal-name-input');
    const titleInput = document.getElementById('principal-title-input');
    const schoolInput = document.getElementById('principal-school-input');
    const greetingInput = document.getElementById('principal-greeting-input');
    const messageInput = document.getElementById('principal-message-input');
    const quoteInput = document.getElementById('principal-quote-input');
    const message2Input = document.getElementById('principal-message2-input');
    const statusDiv = document.getElementById('principal-save-status');

    // Validate required field
    if (!nameInput.value.trim()) {
      showStatus(statusDiv, '⚠️ Please enter the Principal\'s name.', 'error');
      return;
    }

    // Build info object
    const info = {
      name: nameInput.value.trim(),
      title: titleInput.value.trim(),
      school: schoolInput.value.trim(),
      greeting: greetingInput.value.trim(),
      message: messageInput.value.trim(),
      quote: quoteInput.value.trim(),
      message2: message2Input.value.trim(),
      photoUrl: ''
    };

    // Handle photo
    if (pendingPhotoData) {
      // Upload via media client if available
      try {
        if (typeof uploadMediaFile === 'function') {
          // Create a blob from the base64 data
          const blob = await fetch(pendingPhotoData).then(r => r.blob());
          const file = new File([blob], 'principal_photo.jpg', { type: blob.type });
          const uploadedUrl = await uploadMediaFile(file, 'principal/principal_photo.jpg');
          info.photoUrl = uploadedUrl || pendingPhotoData;
        } else {
          info.photoUrl = pendingPhotoData;
        }
      } catch (uploadErr) {
        console.warn('Photo upload failed, using base64 fallback:', uploadErr);
        info.photoUrl = pendingPhotoData;
      }
    } else {
      // Keep existing photo URL
      const existingImg = document.getElementById('principal-photo-img');
      if (existingImg && existingImg.src && existingImg.style.display !== 'none') {
        info.photoUrl = existingImg.src;
      }
    }

    // Save to Supabase
    try {
      if (typeof supabaseDb !== 'undefined' && supabaseDb) {
        // Check if the key already exists
        const { data: existing } = await supabaseDb
          .from('school_config')
          .select('key')
          .eq('key', 'principal_info')
          .single();

        if (existing) {
          // Update
          const { error } = await supabaseDb
            .from('school_config')
            .update({ val: info })
            .eq('key', 'principal_info');

          if (error) throw error;
        } else {
          // Insert
          const { error } = await supabaseDb
            .from('school_config')
            .insert({ key: 'principal_info', val: info });

          if (error) throw error;
        }
      }

      // Save to localStorage safely
      try {
        localStorage.setItem('principal_info', JSON.stringify(info));
      } catch (lsErr) {
        console.warn('Could not save to localStorage (quota exceeded?):', lsErr);
      }

      // Update preview
      updatePreview(info);

      // Reset pending photo
      pendingPhotoData = null;

      showStatus(statusDiv, '✅ Principal information saved successfully! Changes will reflect on the website.', 'success');
      console.log('✅ Principal info saved:', info.name);

    } catch (e) {
      console.error('Error saving principal info:', e);
      // Still save to localStorage as fallback, safely
      try {
        localStorage.setItem('principal_info', JSON.stringify(info));
      } catch (lsErr) {}
      showStatus(statusDiv, '⚠️ Saved. Cloud sync may have failed: ' + (e.message || e), 'warning');
    }
  }

  // ── Show status message ──
  function showStatus(element, message, type) {
    if (!element) return;

    const colors = {
      success: { bg: '#dcfce7', border: '#86efac', text: '#15803d' },
      error: { bg: '#fee2e2', border: '#fca5a5', text: '#dc2626' },
      warning: { bg: '#fef3c7', border: '#fde68a', text: '#d97706' }
    };

    const style = colors[type] || colors.success;
    element.style.display = 'block';
    element.style.background = style.bg;
    element.style.border = '1px solid ' + style.border;
    element.style.color = style.text;
    element.style.fontWeight = '600';
    element.style.fontSize = '0.9rem';
    element.innerHTML = message;

    // Auto-hide after 5 seconds
    setTimeout(() => {
      element.style.display = 'none';
    }, 5000);
  }

  // ── Expose functions globally ──
  window.loadPrincipalInfo = loadPrincipalInfo;
  window.savePrincipalInfo = savePrincipalInfo;
  window.handlePrincipalPhotoUpload = handlePrincipalPhotoUpload;

  console.log('✓ Principal handler loaded');
})();
