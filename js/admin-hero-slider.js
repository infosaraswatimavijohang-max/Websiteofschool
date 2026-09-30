// ==========================================
// HERO SLIDER CMS HANDLER
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // Try to load hero slides if we start on the hero slider page or it's clicked
  const heroSlideBtn = document.querySelector('[onclick*="hero-slider"]');
  if (heroSlideBtn) {
    heroSlideBtn.addEventListener('click', () => {
      loadHeroSlidesAdmin();
    });
  }
});

async function handleHeroSlideSubmit(event) {
  event.preventDefault();
  
  const title = document.getElementById('heroSlideTitle').value.trim();
  const caption = document.getElementById('heroSlideCaption').value.trim();
  const status = document.getElementById('heroSlideStatus').value;
  
  const fileInputs = document.querySelectorAll('input[name="heroSlideFile"]');
  let files = [];
  fileInputs.forEach(input => {
    if (input.files) {
      files = files.concat(Array.from(input.files));
    }
  });
  
  const btn = document.getElementById('btnSaveHeroSlide');
  const btnText = btn.querySelector('.btn-text');
  const loader = btn.querySelector('.loader');
  
  if (files.length === 0) {
    alert("Please select at least one image file.");
    return;
  }
  
  // Show loading state
  btn.disabled = true;
  btnText.style.display = 'none';
  loader.style.display = 'block';
  
  try {
    let successCount = 0;
    const baseDisplayOrder = document.querySelectorAll('#heroSliderTableBody tr:not(:first-child)').length || 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // 1. Upload the image
      const uploadResult = await uploadHeroImage(file);
      if (!uploadResult.success) {
        console.error("Failed to upload " + file.name, uploadResult.error);
        continue; // Skip this file and try next
      }
      
      // 2. Save the database record
      const slideData = {
        title: title || 'Welcome',
        caption: caption || null,
        status: status,
        image_url: uploadResult.url,
        display_order: baseDisplayOrder + 1 + i
      };
      
      const dbResult = await addHeroSlide(slideData);
      if (dbResult.success) {
        successCount++;
      } else {
        console.error("Failed to save DB record for " + file.name, dbResult.error);
      }
    }
    
    if (successCount === files.length) {
      alert(`Successfully published ${successCount} slide(s)!`);
    } else {
      alert(`Published ${successCount} out of ${files.length} slides. Some errors occurred.`);
    }
    
    // Reset form
    document.getElementById('heroSliderForm').reset();
    document.getElementById('heroFileLabel').textContent = "Click to Browse Images";
    
    // Reload table
    loadHeroSlidesAdmin();
    
  } catch (error) {
    console.error("Hero Slider Submit Error:", error);
    alert("Error: " + error.message);
  } finally {
    btn.disabled = false;
    btnText.style.display = 'flex';
    loader.style.display = 'none';
  }
}

async function loadHeroSlidesAdmin() {
  const tbody = document.getElementById('heroSliderTableBody');
  if (!tbody) return;
  
  tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem;">Loading slides...</td></tr>';
  
  // Fetch ALL slides (including drafts)
  const result = await getHeroSlides(false);
  
  if (!result.success || !result.data || result.data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem; color: #64748b;">No slides found. Upload your first slide above!</td></tr>';
    return;
  }
  
  tbody.innerHTML = result.data.map(slide => `
    <tr>
      <td>
        <img src="${slide.image_url}" alt="${slide.title}" style="width: 120px; height: 60px; object-fit: cover; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      </td>
      <td>
        <div style="font-weight: 600; color: var(--text);">${slide.title}</div>
        <div style="font-size: 0.85rem; color: #64748b; max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${slide.caption || '-'}</div>
      </td>
      <td>
        <span class="badge ${slide.status === 'Published' ? 'badge-success' : 'badge-warning'}">
          ${slide.status}
        </span>
      </td>
      <td>
        <div class="action-buttons">
          <button class="action-btn" title="Toggle Status" onclick="toggleHeroSlideStatus('${slide.id}', '${slide.status}')">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          </button>
          <button class="action-btn" title="Delete Slide" style="color: var(--danger); background: #fef2f2; border-color: #fecaca;" onclick="deleteHeroSlideAdmin('${slide.id}')">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function toggleHeroSlideStatus(id, currentStatus) {
  const newStatus = currentStatus === 'Published' ? 'Draft' : 'Published';
  const result = await updateHeroSlideStatus(id, newStatus);
  if (result.success) {
    loadHeroSlidesAdmin();
  } else {
    alert("Failed to update status: " + result.error);
  }
}

async function deleteHeroSlideAdmin(id) {
  if (confirm("Are you sure you want to permanently delete this slide?")) {
    const result = await deleteHeroSlide(id);
    if (result.success) {
      loadHeroSlidesAdmin();
    } else {
      alert("Failed to delete slide: " + result.error);
    }
  }
}
