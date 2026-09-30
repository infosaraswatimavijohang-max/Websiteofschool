// ============================================================================
// FILE:    admin-about-handler.js
// MODULE:  Admin: About Management
// PURPOSE: About Page Admin Panel Handler - Admin CRUD operations for all About page dynamic content (team members, principal legacies, stories, vision/mission, timeline, alumni, blogs)
//
// PROJECT: Shree Saraswati Secondary School — Management System
// STACK:   Vanilla JS + Supabase (PostgreSQL) + HTML/CSS
// UPDATED: 2026-06-04
// ============================================================================

// ─ STATE MANAGEMENT ─
window.aboutAdminState = {
  currentEditId: null,
  currentEditType: null,
  activeTab: 'stats'
};

// ═════════════════════════════════════════════════════════════════
// HERO SECTION MANAGEMENT
// ═════════════════════════════════════════════════════════════════

async function loadHeroForAdmin() {
  try {
    const heroes = await readAllAboutHero();
    const tableBody = document.getElementById('heroTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = heroes.map(hero => `
      <tr data-hero-id="${hero.id}">
        <td>${hero.hero_title}</td>
        <td style="max-width:300px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${hero.hero_subtitle}</td>
        <td>${hero.display_order}</td>
        <td>
          <span class="badge ${hero.is_active ? 'badge-success' : 'badge-danger'}">
            ${hero.is_active ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td>
          <button class="btn-sm btn-edit" onclick="openEditHeroModal('${hero.id}')">✏️ Edit</button>
          <button class="btn-sm btn-delete" onclick="deleteHeroAdmin('${hero.id}')">🗑️ Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading hero for admin:', error);
  }
}

async function saveHeroSection() {
  try {
    const title = document.getElementById('heroTitle').value;
    const subtitle = document.getElementById('heroSubtitle').value;
    const bgImage = document.getElementById('heroBgImage').value;
    const order = parseInt(document.getElementById('heroOrder').value) || 0;

    if (!title || !subtitle) {
      alert('Please fill Title and Subtitle fields');
      return;
    }

    if (aboutAdminState.currentEditId) {
      await updateAboutHero(aboutAdminState.currentEditId, {
        hero_title: title,
        hero_subtitle: subtitle,
        hero_background_image: bgImage || null,
        display_order: order
      });
      alert('Hero section updated successfully!');
    } else {
      await createAboutHero(title, subtitle, bgImage || null, order);
      alert('Hero section created successfully!');
    }

    closeHeroModal();
    await loadHeroForAdmin();
  } catch (error) {
    console.error('Error saving hero section:', error);
    alert('Error saving hero section');
  }
}

async function openEditHeroModal(id) {
  try {
    const { data } = await supabaseDb.from('about_hero').select('*').eq('id', id).single();
    if (!data) return;

    aboutAdminState.currentEditId = id;
    document.getElementById('heroTitle').value = data.hero_title;
    document.getElementById('heroSubtitle').value = data.hero_subtitle;
    document.getElementById('heroBgImage').value = data.hero_background_image || '';
    document.getElementById('heroOrder').value = data.display_order;
    document.getElementById('heroModalTitle').innerText = 'Edit Hero Section';
    
    const modal = document.getElementById('heroModal');
    if (modal) modal.style.display = 'flex';
  } catch (error) {
    console.error('Error opening edit hero modal:', error);
  }
}

function openNewHeroModal() {
  aboutAdminState.currentEditId = null;
  document.getElementById('heroTitle').value = '';
  document.getElementById('heroSubtitle').value = '';
  document.getElementById('heroBgImage').value = '';
  document.getElementById('heroOrder').value = 0;
  document.getElementById('heroModalTitle').innerText = 'Add New Hero Section';
  
  const modal = document.getElementById('heroModal');
  if (modal) modal.style.display = 'flex';
}

function closeHeroModal() {
  const modal = document.getElementById('heroModal');
  if (modal) modal.style.display = 'none';
}

async function deleteHeroAdmin(id) {
  if (confirm('Are you sure you want to delete this hero section?')) {
    await deleteAboutHero(id);
    await loadHeroForAdmin();
  }
}

// ═════════════════════════════════════════════════════════════════
// STATS MANAGEMENT
// ═════════════════════════════════════════════════════════════════

async function loadAboutStatsForAdmin() {
  try {
    const stats = await readAllAboutStats();
    const tableBody = document.getElementById('aboutStatsTableBody');
    if (!tableBody) return;
    
    if (!stats || stats.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem; color: #7f8c8d;">No statistics added yet</td></tr>';
      return;
    }
    
    tableBody.innerHTML = stats.map(stat => `
      <tr data-stat-id="${stat.id}">
        <td>${stat.icon_emoji}</td>
        <td>${stat.stat_number}</td>
        <td>${stat.stat_label}</td>
        <td>${stat.display_order}</td>
        <td>
          <span class="badge ${stat.is_active ? 'badge-success' : 'badge-danger'}">
            ${stat.is_active ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td>
          <button class="btn-sm btn-edit" onclick="openEditStatModal('${stat.id}')">✏️ Edit</button>
          <button class="btn-sm btn-delete" onclick="deleteStatAdmin('${stat.id}')">🗑️ Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading stats for admin:', error);
    const tableBody = document.getElementById('aboutStatsTableBody');
    if (tableBody) tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--danger);">Error loading statistics</td></tr>';
  }
}

async function saveAboutStat() {
  try {
    const icon = document.getElementById('statIcon').value;
    const number = document.getElementById('statNumber').value;
    const label = document.getElementById('statLabel').value;
    const order = parseInt(document.getElementById('statOrder').value) || 0;

    if (!icon || !number || !label) {
      if (typeof showAboutAlert === 'function') showAboutAlert('Please fill all required fields', 'error');
      else alert('Please fill all required fields');
      return;
    }

    let result;
    if (aboutAdminState.currentEditId) {
      result = await updateAboutStat(aboutAdminState.currentEditId, {
        icon_emoji: icon,
        stat_number: number,
        stat_label: label,
        display_order: order
      });
      if (result) {
        if (typeof showAboutAlert === 'function') showAboutAlert('Stat updated successfully!', 'success');
        else alert('Stat updated successfully!');
      }
    } else {
      result = await createAboutStat(icon, number, label, order);
      if (result) {
        if (typeof showAboutAlert === 'function') showAboutAlert('Stat created successfully!', 'success');
        else alert('Stat created successfully!');
      }
    }

    if (!result) {
      if (typeof showAboutAlert === 'function') showAboutAlert('Error saving statistic to database', 'error');
      else alert('Error saving statistic to database');
      return; // Stop if failed
    }

    closeStatModal();
    await loadAboutStatsForAdmin();
  } catch (error) {
    console.error('Error saving stat:', error);
    if (typeof showAboutAlert === 'function') showAboutAlert('Error saving stat: ' + error.message, 'error');
    else alert('Error saving stat');
  }
}

async function openEditStatModal(id) {
  try {
    const { data } = await supabaseDb.from('about_stats').select('*').eq('id', id).single();
    if (!data) return;

    aboutAdminState.currentEditId = id;
    document.getElementById('statIcon').value = data.icon_emoji;
    document.getElementById('statNumber').value = data.stat_number;
    document.getElementById('statLabel').value = data.stat_label;
    document.getElementById('statOrder').value = data.display_order;
    document.getElementById('statFormTitle').innerText = '✏️ Edit Statistic';
    document.getElementById('statFormBtn').innerText = '✅ Update Statistic';
    document.getElementById('statFormTitle').scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    console.error('Error opening edit modal:', error);
  }
}

function openNewStatModal() {
  aboutAdminState.currentEditId = null;
  document.getElementById('statIcon').value = '';
  document.getElementById('statNumber').value = '';
  document.getElementById('statLabel').value = '';
  document.getElementById('statOrder').value = 0;
  
  if (document.getElementById('statFormTitle')) document.getElementById('statFormTitle').innerText = '➕ Add New Statistic';
  if (document.getElementById('statFormBtn')) document.getElementById('statFormBtn').innerText = '✅ Save Statistic';
}

function closeStatModal() {
  openNewStatModal();
}

async function deleteStatAdmin(id) {
  if (confirm('Are you sure you want to delete this stat?')) {
    await deleteAboutStat(id);
    await loadAboutStatsForAdmin();
  }
}

// ═════════════════════════════════════════════════════════════════
// VISION & MISSION MANAGEMENT
// ═════════════════════════════════════════════════════════════════

async function loadVisionMissionForAdmin() {
  try {
    const items = await readAllVisionMission();
    const tableBody = document.getElementById('visionMissionTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = items.map(item => `
      <tr data-vm-id="${item.id}">
        <td>${item.section_type.toUpperCase()}</td>
        <td>${item.section_title}</td>
        <td>${item.icon_emoji}</td>
        <td>${item.display_order}</td>
        <td>
          <button class="btn-sm btn-edit" onclick="openEditVMModal('${item.id}')">✏️ Edit</button>
          <button class="btn-sm btn-delete" onclick="deleteVMAdmin('${item.id}')">🗑️ Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading vision/mission for admin:', error);
  }
}

async function saveVisionMission() {
  try {
    const type = document.getElementById('vmType').value;
    const icon = document.getElementById('vmIcon').value;
    const title = document.getElementById('vmTitle').value;
    const description = document.getElementById('vmDescription').value;
    const pointsText = document.getElementById('vmPoints').value;
    const order = parseInt(document.getElementById('vmOrder').value) || 0;

    if (!type || !icon || !title || !description || !pointsText) {
      alert('Please fill all required fields');
      return;
    }

    const points = pointsText.split('\n').filter(p => p.trim());

    if (aboutAdminState.currentEditId) {
      await updateVisionMission(aboutAdminState.currentEditId, {
        section_type: type,
        icon_emoji: icon,
        section_title: title,
        section_description: description,
        key_points: JSON.stringify(points),
        display_order: order
      });
      alert('Vision/Mission updated successfully!');
    } else {
      await createVisionMission(type, icon, title, description, points, order);
      alert('Vision/Mission created successfully!');
    }

    closeVMModal();
    await loadVisionMissionForAdmin();
  } catch (error) {
    console.error('Error saving vision/mission:', error);
    alert('Error saving vision/mission');
  }
}

async function openEditVMModal(id) {
  try {
    const { data } = await supabaseDb.from('about_vision_mission').select('*').eq('id', id).single();
    if (!data) return;

    aboutAdminState.currentEditId = id;
    document.getElementById('vmType').value = data.section_type;
    document.getElementById('vmIcon').value = data.icon_emoji;
    document.getElementById('vmTitle').value = data.section_title;
    document.getElementById('vmDescription').value = data.section_description;
    
    const points = typeof data.key_points === 'string' ? JSON.parse(data.key_points) : data.key_points;
    document.getElementById('vmPoints').value = points.join('\n');
    document.getElementById('vmOrder').value = data.display_order;
    document.getElementById('vmModalTitle').innerText = 'Edit Vision/Mission';
    
    const modal = document.getElementById('vmModal');
    if (modal) modal.style.display = 'flex';
  } catch (error) {
    console.error('Error opening edit VM modal:', error);
  }
}

function openNewVMModal() {
  aboutAdminState.currentEditId = null;
  document.getElementById('vmType').value = 'vision';
  document.getElementById('vmIcon').value = '';
  document.getElementById('vmTitle').value = '';
  document.getElementById('vmDescription').value = '';
  document.getElementById('vmPoints').value = '';
  document.getElementById('vmOrder').value = 0;
  document.getElementById('vmModalTitle').innerText = 'Add New Vision/Mission';
  
  const modal = document.getElementById('vmModal');
  if (modal) modal.style.display = 'flex';
}

function closeVMModal() {
  const modal = document.getElementById('vmModal');
  if (modal) modal.style.display = 'none';
}

async function deleteVMAdmin(id) {
  if (confirm('Are you sure you want to delete this section?')) {
    await deleteVisionMission(id);
    await loadVisionMissionForAdmin();
  }
}

// ═════════════════════════════════════════════════════════════════
// OUR LEGACY STORY MANAGEMENT
// ═════════════════════════════════════════════════════════════════

async function loadLegacyStoryForAdmin() {
  try {
    const stories = await readAllStory();
    if (stories && stories.length > 0) {
      const story = stories[0];
      document.getElementById('legacySubtitle').value = story.story_subtitle || 'OUR LEGACY';
      document.getElementById('legacyTitle').value = story.story_title || '';
      document.getElementById('legacyParagraph1').value = story.story_paragraph1 || '';
      document.getElementById('legacyParagraph2').value = story.story_paragraph2 || '';
      
      const values = typeof story.story_values_list === 'string' ? JSON.parse(story.story_values_list) : (story.story_values_list || []);
      document.getElementById('legacyValues').value = values.join('\n');
      document.getElementById('legacyOrder').value = story.display_order || 0;
      
      // Set preview image
      if (story.story_visual_image) {
        const previewImg = document.getElementById('previewImg');
        const previewPlaceholder = document.getElementById('previewPlaceholder');
        if (previewImg && previewPlaceholder) {
          previewImg.src = story.story_visual_image;
          previewImg.style.display = 'block';
          previewPlaceholder.style.display = 'none';
        }
      }
      
      // Show current preview
      updateLegacyPreview(story);
      aboutAdminState.currentEditId = story.id;
    } else {
      document.getElementById('legacyCurrentPreview').innerHTML = '<p style="text-align: center; color: #94a3b8;">No story created yet. Fill the form below to create one.</p>';
    }
  } catch (error) {
    console.error('Error loading legacy story:', error);
  }
}

function updateLegacyPreview(story) {
  const preview = document.getElementById('legacyCurrentPreview');
  if (!preview) return;
  
  const values = typeof story.story_values_list === 'string' ? JSON.parse(story.story_values_list) : (story.story_values_list || []);
  
  preview.innerHTML = `
    <div style="display: grid; grid-template-columns: 200px 1fr; gap: 1.5rem; align-items: start;">
      <div style="width: 100%; height: 150px; border-radius: 8px; overflow: hidden;">
        <img src="${story.story_visual_image || '../images/img.jpg'}" alt="Story" style="width: 100%; height: 100%; object-fit: cover;">
      </div>
      <div>
        <span style="color: var(--accent); font-weight: 600; font-size: 0.85rem; text-transform: uppercase;">— ${story.story_subtitle || 'OUR LEGACY'}</span>
        <h3 style="margin: 0.5rem 0; color: var(--primary); font-size: 1.2rem; font-family: 'Playfair Display', serif;">${story.story_title || ''}</h3>
        <p style="color: #64748b; margin: 0.5rem 0; font-size: 0.95rem;">${story.story_paragraph1 || ''}</p>
        <ul style="margin: 0.5rem 0; padding-left: 1.5rem; color: #64748b;">
          ${values.map(v => `<li style="margin: 0.3rem 0;">${v}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}

async function saveLegacyStory(event) {
  event.preventDefault();
  try {
    const subtitle = document.getElementById('legacySubtitle').value.trim();
    const title = document.getElementById('legacyTitle').value.trim();
    const para1 = document.getElementById('legacyParagraph1').value.trim();
    const para2 = document.getElementById('legacyParagraph2').value.trim();
    const valuesText = document.getElementById('legacyValues').value.trim();
    const order = parseInt(document.getElementById('legacyOrder').value) || 0;
    const fileInput = document.getElementById('legacyImage');

    if (!subtitle || !title || !para1 || !valuesText) {
      alert('Please fill all required fields');
      return;
    }

    const values = valuesText.split('\n').filter(v => v.trim()).map(v => v.replace(/^[•\\-\\*]\\s*/, '').trim());

    let imageUrl = null;
    
    // Handle image upload
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      try {
        const timestamp = Date.now();
        const filename = `legacy-story-${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
        
        if (typeof uploadMediaFile === 'function') {
          console.log('Using robust uploadMediaFile mechanism...');
          const uploadedUrl = await uploadMediaFile(file, filename);
          if (uploadedUrl) {
            imageUrl = uploadedUrl;
            console.log('✓ Image uploaded successfully:', imageUrl);
          } else {
            throw new Error('Robust upload mechanism returned empty URL.');
          }
        } else {
          // Fallback to legacy behavior if uploadMediaFile is missing
          const { data, error } = await supabaseDb.storage.from('about-images').upload(filename, file);
          
          if (error) {
            console.error('Upload error:', error);
            if (error.message && error.message.includes('row level security')) {
              alert('⚠️ Image upload blocked by database security policies (RLS).\\nPlease contact admin to fix Supabase Storage policies for bucket \"about-images\".\\n\\nUsing placeholder image.');
            } else if (error.message && error.message.includes('not found')) {
              alert('⚠️ Storage bucket \"about-images\" not found.\\n\\nTo enable image uploads:\\n1. Go to Supabase Dashboard\\n2. Go to Storage\\n3. Create new bucket named: about-images\\n4. Set visibility to: Public\\n5. Click Save\\n\\nFor now, using placeholder image.');
            } else {
              alert('Image upload failed: ' + error.message + '\\n\\nUsing placeholder image.');
            }
            throw new Error(error.message);
          } else {
            const { data: publicUrl } = supabaseDb.storage.from('about-images').getPublicUrl(filename);
            imageUrl = publicUrl.publicUrl;
            console.log('✓ Image uploaded successfully:', imageUrl);
          }
        }
      } catch (uploadErr) {
        console.error('Upload exception:', uploadErr);
        if (!imageUrl) {
          alert('Image upload failed. Using placeholder image.');
          imageUrl = '../images/img.jpg';
        }
      }
    } else if (aboutAdminState.currentEditId) {
      // Keep existing image if editing and no new image selected
      const existingStories = await readAllStory();
      if (existingStories && existingStories.length > 0) {
        imageUrl = existingStories[0].story_visual_image || '../images/img.jpg';
      }
    } else {
      alert('Please select an image');
      return;
    }

    // Save or update story
    if (aboutAdminState.currentEditId) {
      await updateStory(aboutAdminState.currentEditId, {
        story_subtitle: subtitle,
        story_title: title,
        story_paragraph1: para1,
        story_paragraph2: para2,
        story_visual_image: imageUrl,
        story_values_list: JSON.stringify(values),
        display_order: order
      });
      alert('✅ Legacy story updated successfully!');
    } else {
      await createStory(subtitle, title, para1, para2, imageUrl, values, order);
      alert('✅ Legacy story created successfully!');
    }

    await loadLegacyStoryForAdmin();
    document.getElementById('legacyForm').reset();
  } catch (error) {
    console.error('Error saving legacy story:', error);
    alert('Error saving legacy story: ' + error.message);
  }
}

// Image preview functionality
document.addEventListener('DOMContentLoaded', function() {
  const legacyImageInput = document.getElementById('legacyImage');
  if (legacyImageInput) {
    legacyImageInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          const previewImg = document.getElementById('previewImg');
          const previewPlaceholder = document.getElementById('previewPlaceholder');
          if (previewImg && previewPlaceholder) {
            previewImg.src = event.target.result;
            previewImg.style.display = 'block';
            previewPlaceholder.style.display = 'none';
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }
});

// ═════════════════════════════════════════════════════════════════
// ERA CARDS MANAGEMENT
// ═════════════════════════════════════════════════════════════════

async function loadEraCardsForAdmin() {
  try {
    const cards = await readAllEraCards();
    const tableBody = document.getElementById('eraCardsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = cards.map(card => `
      <tr data-era-id="${card.id}">
        <td>${card.icon_emoji}</td>
        <td>${card.era_badge}</td>
        <td>${card.era_title}</td>
        <td>${card.display_order}</td>
        <td>
          <button class="btn-sm btn-edit" onclick="openEditEraModal('${card.id}')">✏️ Edit</button>
          <button class="btn-sm btn-delete" onclick="deleteEraAdmin('${card.id}')">🗑️ Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading era cards for admin:', error);
  }
}

async function saveEraCard() {
  try {
    const icon = document.getElementById('eraIcon').value;
    const badge = document.getElementById('eraBadge').value;
    const title = document.getElementById('eraTitle').value;
    const description = document.getElementById('eraDescription').value;
    const order = parseInt(document.getElementById('eraOrder').value) || 0;

    if (!icon || !badge || !title || !description) {
      alert('Please fill all required fields');
      return;
    }

    if (aboutAdminState.currentEditId) {
      await updateEraCard(aboutAdminState.currentEditId, {
        icon_emoji: icon,
        era_badge: badge,
        era_title: title,
        era_description: description,
        display_order: order
      });
      alert('Era card updated successfully!');
    } else {
      await createEraCard(icon, badge, title, description, order);
      alert('Era card created successfully!');
    }

    closeEraModal();
    await loadEraCardsForAdmin();
  } catch (error) {
    console.error('Error saving era card:', error);
    alert('Error saving era card');
  }
}

async function openEditEraModal(id) {
  try {
    const { data } = await supabaseDb.from('about_era_cards').select('*').eq('id', id).single();
    if (!data) return;

    aboutAdminState.currentEditId = id;
    document.getElementById('eraIcon').value = data.icon_emoji;
    document.getElementById('eraBadge').value = data.era_badge;
    document.getElementById('eraTitle').value = data.era_title;
    document.getElementById('eraDescription').value = data.era_description;
    document.getElementById('eraOrder').value = data.display_order;
    document.getElementById('eraFormTitle').innerText = '✏️ Edit Era Card';
    document.getElementById('eraFormBtn').innerText = '✅ Update Era Card';
    document.getElementById('eraFormTitle').scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    console.error('Error opening edit era modal:', error);
  }
}

function openNewEraModal() {
  aboutAdminState.currentEditId = null;
  document.getElementById('eraIcon').value = '';
  document.getElementById('eraBadge').value = '';
  document.getElementById('eraTitle').value = '';
  document.getElementById('eraDescription').value = '';
  document.getElementById('eraOrder').value = 0;
  if (document.getElementById('eraFormTitle')) document.getElementById('eraFormTitle').innerText = '➕ Add New Era Card';
  if (document.getElementById('eraFormBtn')) document.getElementById('eraFormBtn').innerText = '✅ Save Era Card';
}

function closeEraModal() {
  openNewEraModal();
}

async function deleteEraAdmin(id) {
  if (confirm('Are you sure you want to delete this era card?')) {
    await deleteEraCard(id);
    await loadEraCardsForAdmin();
  }
}

// ═════════════════════════════════════════════════════════════════
// TIMELINE MANAGEMENT
// ═════════════════════════════════════════════════════════════════

async function loadTimelineForAdmin() {
  try {
    const items = await readAllTimeline();
    const tableBody = document.getElementById('timelineTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = items.map(item => `
      <tr data-timeline-id="${item.id}">
        <td>${item.icon_emoji}</td>
        <td>${item.timeline_date}</td>
        <td>${item.timeline_title}</td>
        <td>${item.timeline_position}</td>
        <td>
          <button class="btn-sm btn-edit" onclick="openEditTimelineModal('${item.id}')">✏️ Edit</button>
          <button class="btn-sm btn-delete" onclick="deleteTimelineAdmin('${item.id}')">🗑️ Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading timeline for admin:', error);
  }
}

async function saveTimeline() {
  try {
    const icon = document.getElementById('timelineIcon').value;
    const date = document.getElementById('timelineDate').value;
    const title = document.getElementById('timelineTitle').value;
    const description = document.getElementById('timelineDescription').value;
    const position = document.getElementById('timelinePosition').value;
    const order = parseInt(document.getElementById('timelineOrder').value) || 0;

    if (!icon || !date || !title || !description || !position) {
      alert('Please fill all required fields');
      return;
    }

    if (aboutAdminState.currentEditId) {
      await updateTimelineItem(aboutAdminState.currentEditId, {
        icon_emoji: icon,
        timeline_date: date,
        timeline_title: title,
        timeline_description: description,
        timeline_position: position,
        display_order: order
      });
      alert('Timeline item updated successfully!');
    } else {
      await createTimelineItem(icon, date, title, description, position, order);
      alert('Timeline item created successfully!');
    }

    closeTimelineModal();
    await loadTimelineForAdmin();
  } catch (error) {
    console.error('Error saving timeline:', error);
    alert('Error saving timeline');
  }
}

async function openEditTimelineModal(id) {
  try {
    const { data } = await supabaseDb.from('about_timeline').select('*').eq('id', id).single();
    if (!data) return;

    aboutAdminState.currentEditId = id;
    document.getElementById('timelineIcon').value = data.icon_emoji;
    document.getElementById('timelineDate').value = data.timeline_date;
    document.getElementById('timelineTitle').value = data.timeline_title;
    document.getElementById('timelineDescription').value = data.timeline_description;
    document.getElementById('timelinePosition').value = data.timeline_position;
    document.getElementById('timelineOrder').value = data.display_order;
    document.getElementById('timelineFormTitle').innerText = '✏️ Edit Timeline Item';
    document.getElementById('timelineFormBtn').innerText = '✅ Update Event';
    document.getElementById('timelineFormTitle').scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    console.error('Error opening edit timeline modal:', error);
  }
}

function openNewTimelineModal() {
  aboutAdminState.currentEditId = null;
  document.getElementById('timelineIcon').value = '';
  document.getElementById('timelineDate').value = '';
  document.getElementById('timelineTitle').value = '';
  document.getElementById('timelineDescription').value = '';
  document.getElementById('timelinePosition').value = 'left';
  document.getElementById('timelineOrder').value = 0;
  if (document.getElementById('timelineFormTitle')) document.getElementById('timelineFormTitle').innerText = '➕ Add Timeline Event';
  if (document.getElementById('timelineFormBtn')) document.getElementById('timelineFormBtn').innerText = '✅ Save Event';
}

function closeTimelineModal() {
  openNewTimelineModal();
}

async function deleteTimelineAdmin(id) {
  if (confirm('Are you sure you want to delete this timeline item?')) {
    await deleteTimelineItem(id);
    await loadTimelineForAdmin();
  }
}

// ═════════════════════════════════════════════════════════════════
// LEADERSHIP DESKS MANAGEMENT
// ═════════════════════════════════════════════════════════════════

async function loadLeadershipDesksForAdmin() {
  try {
    const leaders = await readAllLeadershipDesks();
    const tableBody = document.getElementById('leadershipDesksTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = leaders.map(leader => `
      <tr data-leader-id="${leader.id}">
        <td>${leader.leader_name}</td>
        <td>${leader.leader_role}</td>
        <td>${leader.display_order ?? 0}</td>
        <td>
          <button class="btn-sm btn-edit" onclick="openEditLeadershipModal('${leader.id}')">✏️ Edit</button>
          <button class="btn-sm btn-delete" onclick="deleteLeadershipAdmin('${leader.id}')">🗑️ Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading leadership desks for admin:', error);
  }
}

async function saveLeadershipDesk() {
  try {
    const name = document.getElementById('leaderName').value;
    const role = document.getElementById('leaderRole').value;
    const photoUrl = document.getElementById('leaderPhoto').value;
    const quote = document.getElementById('leaderQuote').value;
    const description = document.getElementById('leaderDescription').value;
    const order = parseInt(document.getElementById('leaderOrder').value) || 0;

    if (!name || !role || !photoUrl || !quote || !description) {
      alert('Please fill all required fields');
      return;
    }

    if (aboutAdminState.currentEditId) {
      await updateLeadershipDesk(aboutAdminState.currentEditId, {
        leader_name: name,
        leader_role: role,
        leader_photo_url: photoUrl,
        leader_quote: quote,
        leader_description: description,
        display_order: order
      });
      alert('Leadership desk updated successfully!');
    } else {
      await createLeadershipDesk(name, role, photoUrl, quote, description, null, order);
      alert('Leadership desk created successfully!');
    }

    closeLeadershipModal();
    await loadLeadershipDesksForAdmin();
  } catch (error) {
    console.error('Error saving leadership desk:', error);
    alert('Error saving leadership desk');
  }
}

async function openEditLeadershipModal(id) {
  try {
    const { data } = await supabaseDb.from('about_leadership_desks').select('*').eq('id', id).single();
    if (!data) return;

    aboutAdminState.currentEditId = id;
    document.getElementById('leaderName').value = data.leader_name;
    document.getElementById('leaderRole').value = data.leader_role;
    document.getElementById('leaderPhoto').value = data.leader_photo_url;
    document.getElementById('leaderQuote').value = data.leader_quote;
    document.getElementById('leaderDescription').value = data.leader_description;
    document.getElementById('leaderOrder').value = data.display_order;
    document.getElementById('leadershipModalTitle').innerText = 'Edit Leadership Desk';
    
    const modal = document.getElementById('leadershipModal');
    if (modal) modal.style.display = 'flex';
  } catch (error) {
    console.error('Error opening edit leadership modal:', error);
  }
}

function openNewLeadershipModal() {
  aboutAdminState.currentEditId = null;
  document.getElementById('leaderName').value = '';
  document.getElementById('leaderRole').value = '';
  document.getElementById('leaderPhoto').value = '';
  document.getElementById('leaderQuote').value = '';
  document.getElementById('leaderDescription').value = '';
  document.getElementById('leaderOrder').value = 0;
  document.getElementById('leadershipModalTitle').innerText = 'Add New Leadership Desk';
  
  const modal = document.getElementById('leadershipModal');
  if (modal) modal.style.display = 'flex';
}

function closeLeadershipModal() {
  const modal = document.getElementById('leadershipModal');
  if (modal) modal.style.display = 'none';
}

async function deleteLeadershipAdmin(id) {
  if (confirm('Are you sure you want to delete this leadership desk?')) {
    await deleteLeadershipDesk(id);
    await loadLeadershipDesksForAdmin();
  }
}

// ═════════════════════════════════════════════════════════════════
// ADMIN TEAM MANAGEMENT
// ═════════════════════════════════════════════════════════════════

async function loadAdminTeamForAdmin() {
  try {
    const members = await readAllAdminTeam();
    const tableBody = document.getElementById('adminTeamTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = members.map(member => `
      <tr data-member-id="${member.id}">
        <td>${member.member_name}</td>
        <td>${member.member_role}</td>
        <td>${member.member_department}</td>
        <td>${member.hierarchy_level}</td>
        <td>
          <button class="btn-sm btn-edit" onclick="openEditMemberModal('${member.id}')">✏️ Edit</button>
          <button class="btn-sm btn-delete" onclick="deleteMemberAdmin('${member.id}')">🗑️ Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading admin team for admin:', error);
  }
}

async function saveAdminTeamMember() {
  try {
    const name = document.getElementById('memberName').value.trim();
    const role = document.getElementById('memberRole').value.trim();
    const dept = document.getElementById('memberDept').value;
    const email = document.getElementById('memberEmail').value.trim();
    const level = parseInt(document.getElementById('memberLevel').value) || 0;
    const order = parseInt(document.getElementById('memberOrder').value) || 1;

    // Get photo: prefer uploaded file result, then URL text input
    let photoUrl = window._memberPhotoFinalUrl || document.getElementById('memberPhoto').value.trim();

    if (!name || !role || !dept || !email) {
      alert('Please fill in Full Name, Role, Department, and Email.');
      return;
    }

    // If a file was selected but not yet uploaded, upload now
    const pendingFile = window._memberPhotoPendingFile;
    if (pendingFile && !photoUrl) {
      const statusEl = document.getElementById('memberPhotoUploadStatus');
      if (statusEl) { statusEl.textContent = '⏳ Uploading photo...'; statusEl.style.color = '#3b82f6'; }
      photoUrl = await uploadMemberPhotoFile(pendingFile);
      if (statusEl) { statusEl.textContent = photoUrl ? '✅ Uploaded!' : '⚠️ Upload failed, using base64.'; statusEl.style.color = photoUrl ? '#10b981' : '#f59e0b'; }
    }

    // Use placeholder if still empty
    if (!photoUrl) {
      photoUrl = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=50';
    }

    const btn = document.getElementById('memberFormBtn');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Saving...'; }

    if (aboutAdminState.currentEditId) {
      await updateAdminTeamMember(aboutAdminState.currentEditId, {
        member_name: name,
        member_role: role,
        member_department: dept,
        member_photo_url: photoUrl,
        member_email: email,
        hierarchy_level: level,
        display_order: order
      });
      alert('✅ Team member updated successfully!');
    } else {
      await createAdminTeamMember(name, role, dept, photoUrl, email, level, null, order);
      alert('✅ Team member added successfully!');
    }

    closeMemberModal();
    await loadAdminTeamForAdmin();
  } catch (error) {
    console.error('Error saving team member:', error);
    alert('Error saving team member: ' + (error.message || error));
  } finally {
    const btn = document.getElementById('memberFormBtn');
    if (btn) { btn.disabled = false; btn.textContent = aboutAdminState.currentEditId ? '✅ Update Member' : '✅ Add Member'; }
  }
}

async function openEditMemberModal(id) {
  try {
    const { data } = await supabaseDb.from('about_admin_team').select('*').eq('id', id).single();
    if (!data) return;

    aboutAdminState.currentEditId = id;
    document.getElementById('memberName').value = data.member_name || '';
    document.getElementById('memberRole').value = data.member_role || '';
    document.getElementById('memberDept').value = data.member_department || '';
    document.getElementById('memberPhoto').value = data.member_photo_url || '';
    document.getElementById('memberEmail').value = data.member_email || '';
    document.getElementById('memberLevel').value = data.hierarchy_level || 0;
    document.getElementById('memberOrder').value = data.display_order || 1;
    if (document.getElementById('memberFormTitle')) document.getElementById('memberFormTitle').innerText = '✏️ Edit Team Member';
    if (document.getElementById('memberFormBtn')) { document.getElementById('memberFormBtn').textContent = '✅ Update Member'; }
    // Show existing photo in upload zone
    if (data.member_photo_url) {
      setMemberPhotoPreview(data.member_photo_url);
      window._memberPhotoFinalUrl = data.member_photo_url;
    } else {
      resetMemberPhotoUpload();
    }
    document.getElementById('memberPhotoSection') && document.getElementById('memberPhotoSection').scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    console.error('Error opening edit member modal:', error);
  }
}

function openNewMemberModal() {
  aboutAdminState.currentEditId = null;
  document.getElementById('memberName').value = '';
  document.getElementById('memberRole').value = '';
  document.getElementById('memberDept').value = '';
  document.getElementById('memberPhoto').value = '';
  document.getElementById('memberEmail').value = '';
  document.getElementById('memberLevel').value = 0;
  document.getElementById('memberOrder').value = 1;
  if (document.getElementById('memberFormTitle')) document.getElementById('memberFormTitle').innerText = '➕ Add Team Member with Image';
  if (document.getElementById('memberFormBtn')) { document.getElementById('memberFormBtn').textContent = '✅ Add Member'; document.getElementById('memberFormBtn').disabled = false; }
  resetMemberPhotoUpload();
}

function closeMemberModal() {
  openNewMemberModal();
}

async function deleteMemberAdmin(id) {
  if (confirm('Are you sure you want to delete this team member?')) {
    await deleteAdminTeamMember(id);
    await loadAdminTeamForAdmin();
  }
}

// ═════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════
// IMPORT/EXPORT FUNCTIONS
// ════════════════════════════════════════════════════════════════════

/**
 * Parse CSV string to array of objects
 */
function parseCSV(csv) {
  const lines = csv.trim().split('\n');
  if (lines.length === 0) throw new Error('CSV file is empty');
  
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;
    
    const obj = {};
    const values = lines[i].split(',').map(v => v.trim());
    
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    
    data.push(obj);
  }
  
  return data;
}

/**
 * Convert array to CSV string
 */
function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  let csv = headers.join(',') + '\n';
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] || '';
      // Escape quotes and wrap in quotes if contains comma
      if (value.toString().includes(',') || value.toString().includes('"')) {
        return `"${value.toString().replace(/"/g, '""')}"`;
      }
      return value;
    });
    csv += values.join(',') + '\n';
  });
  
  return csv;
}

/**
 * Handle file import
 */
async function handleFileImport() {
  try {
    const fileInput = document.getElementById('importFile');
    const dataType = document.getElementById('importDataType').value;
    const replaceExisting = document.getElementById('replaceExisting').checked;
    const statusDiv = document.getElementById('importStatus');
    
    if (!fileInput.files.length) {
      showStatus('error', '❌ Please select a file to import');
      return;
    }
    
    if (!dataType) {
      showStatus('error', '❌ Please select data type');
      return;
    }
    
    const file = fileInput.files[0];
    const fileFormat = document.querySelector('input[name="fileFormat"]:checked').value;
    const fileContent = await file.text();
    
    let data = [];
    if (fileFormat === 'csv') {
      data = parseCSV(fileContent);
    } else {
      data = JSON.parse(fileContent);
    }
    
    if (!Array.isArray(data)) {
      showStatus('error', '❌ Data must be an array');
      return;
    }
    
    showStatus('info', `⏳ Importing ${data.length} records...`);
    
    let imported = 0;
    let errors = 0;
    
    // If replace existing, delete all records first
    if (replaceExisting) {
      await deleteAllRecordsOfType(dataType);
      showStatus('info', `⏳ Deleted existing records. Importing ${data.length} new records...`);
    }
    
    // Import each record
    for (let i = 0; i < data.length; i++) {
      try {
        const record = data[i];
        await importRecordByType(dataType, record);
        imported++;
      } catch (err) {
        console.error(`Error importing record ${i + 1}:`, err);
        errors++;
      }
    }
    
    showStatus('success', `✅ Import complete! ${imported} records imported, ${errors} errors`);
    
    // Reload the appropriate section
    await reloadSectionData(dataType);
    
    // Clear file input
    fileInput.value = '';
    
  } catch (error) {
    console.error('Import error:', error);
    showStatus('error', `❌ Import failed: ${error.message}`);
  }
}

/**
 * Handle file export
 */
async function handleFileExport() {
  try {
    const dataType = document.getElementById('exportDataType').value;
    const exportFormat = document.querySelector('input[name="exportFormat"]:checked').value;
    
    if (!dataType) {
      showStatus('error', '❌ Please select data type to export');
      return;
    }
    
    let data = [];
    
    if (dataType === 'all') {
      // Export all data
      data = {
        stats: await readAllAboutStats(),
        visionMission: await readAllVisionMission(),
        eraCards: await readAllEraCards(),
        timeline: await readAllTimeline(),
        leadership: await readAllLeadershipDesks(),
        team: await readAllAdminTeam()
      };
    } else {
      // Export specific data type
      switch(dataType) {
        case 'stats':
          data = await readAllAboutStats();
          break;
        case 'visionMission':
          data = await readAllVisionMission();
          break;
        case 'eraCards':
          data = await readAllEraCards();
          break;
        case 'timeline':
          data = await readAllTimeline();
          break;
        case 'leadership':
          data = await readAllLeadershipDesks();
          break;
        case 'team':
          data = await readAllAdminTeam();
          break;
      }
    }
    
    // Generate file content
    let fileContent = '';
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `about-${dataType}-${timestamp}`;
    
    if (exportFormat === 'csv') {
      if (Array.isArray(data)) {
        fileContent = convertToCSV(data);
      } else {
        fileContent = JSON.stringify(data, null, 2);
      }
    } else {
      fileContent = JSON.stringify(data, null, 2);
    }
    
    // Download file
    downloadFile(fileContent, `${filename}.${exportFormat}`, `text/${exportFormat}`);
    
    showStatus('success', `✅ Export complete! File downloaded: ${filename}.${exportFormat}`);
    
  } catch (error) {
    console.error('Export error:', error);
    showStatus('error', `❌ Export failed: ${error.message}`);
  }
}

/**
 * Download file helper
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Download sample template
 */
async function downloadTemplate(dataType) {
  try {
    const templates = {
      stats: [
        { icon_emoji: '👥', stat_number: '2500+', stat_label: 'Total Students', display_order: 1 },
        { icon_emoji: '📚', stat_number: '45+', stat_label: 'Expert Teachers', display_order: 2 },
        { icon_emoji: '🏆', stat_number: '150+', stat_label: 'Achievements', display_order: 3 }
      ],
      visionMission: [
        { section_type: 'Vision', icon_emoji: '🎯', section_title: 'Our Vision', section_description: 'To be a center of excellence...', key_points: '• Excellence\\n• Innovation\\n• Integrity', display_order: 1 },
        { section_type: 'Mission', icon_emoji: '🚀', section_title: 'Our Mission', section_description: 'To provide quality education...', key_points: '• Quality Education\\n• Student Development\\n• Community Service', display_order: 2 }
      ],
      eraCards: [
        { icon_emoji: '📚', era_badge: '2076 B.S. (2019 A.D.)', era_title: 'Foundation Era', era_description: 'School was founded with vision...', display_order: 1 },
        { icon_emoji: '🏗️', era_badge: '2078-2080 B.S.', era_title: 'Expansion Era', era_description: 'Expanded facilities and programs...', display_order: 2 }
      ],
      timeline: [
        { icon_emoji: '🎓', timeline_date: '2076 B.S.', timeline_title: 'School Founded', timeline_description: 'Official establishment...', timeline_position: 'left', display_order: 1 },
        { icon_emoji: '🏢', timeline_date: '2078 B.S.', timeline_title: 'New Building', timeline_description: 'Inaugurated new campus...', timeline_position: 'right', display_order: 2 }
      ],
      leadership: [
        { leader_name: 'Ramesh Sharma', leader_role: 'Principal', leader_photo_url: 'https://...', leader_quote: 'Education is key to success', leader_description: '20+ years in education', display_order: 1 }
      ],
      team: [
        { member_name: 'Priya Sharma', member_role: 'Vice Principal', member_department: 'Academic', member_photo_url: 'https://...', member_email: 'priya@school.com', hierarchy_level: 1, display_order: 1 }
      ]
    };
    
    const template = templates[dataType] || [];
    const timestamp = new Date().toISOString().split('T')[0];
    const content = JSON.stringify(template, null, 2);
    
    downloadFile(content, `template-${dataType}-${timestamp}.json`, 'application/json');
    
  } catch (error) {
    console.error('Template download error:', error);
    showStatus('error', `❌ Failed to download template: ${error.message}`);
  }
}

/**
 * Import single record based on type
 */
async function importRecordByType(dataType, record) {
  switch(dataType) {
    case 'stats':
      return await createAboutStat(
        record.icon_emoji,
        record.stat_number,
        record.stat_label,
        parseInt(record.display_order) || 0
      );
    case 'visionMission':
      return await createVisionMission(
        record.section_type,
        record.icon_emoji,
        record.section_title,
        record.section_description,
        record.key_points ? record.key_points.split('\\n') : [],
        parseInt(record.display_order) || 0
      );
    case 'eraCards':
      return await createEraCard(
        record.icon_emoji,
        record.era_badge,
        record.era_title,
        record.era_description,
        parseInt(record.display_order) || 0
      );
    case 'timeline':
      return await createTimelineItem(
        record.icon_emoji,
        record.timeline_date,
        record.timeline_title,
        record.timeline_description,
        record.timeline_position || 'left',
        parseInt(record.display_order) || 0
      );
    case 'leadership':
      return await createLeadershipDesk(
        record.leader_name,
        record.leader_role,
        record.leader_photo_url,
        record.leader_quote,
        record.leader_description,
        parseInt(record.display_order) || 0
      );
    case 'team':
      return await createAdminTeamMember(
        record.member_name,
        record.member_role,
        record.member_department,
        record.member_photo_url,
        record.member_email,
        parseInt(record.hierarchy_level) || 0,
        null,
        parseInt(record.display_order) || 0
      );
    default:
      throw new Error('Unknown data type: ' + dataType);
  }
}

/**
 * Delete all records of a specific type (soft delete)
 */
async function deleteAllRecordsOfType(dataType) {
  try {
    let tableName = '';
    
    switch(dataType) {
      case 'stats': tableName = 'about_stats'; break;
      case 'visionMission': tableName = 'about_vision_mission'; break;
      case 'eraCards': tableName = 'about_era_cards'; break;
      case 'timeline': tableName = 'about_timeline'; break;
      case 'leadership': tableName = 'about_leadership_desks'; break;
      case 'team': tableName = 'about_admin_team'; break;
    }
    
    if (tableName) {
      const { error } = await supabaseDb
        .from(tableName)
        .update({ is_active: false })
        .eq('is_active', true);
      
      if (error) throw error;
    }
  } catch (error) {
    console.error('Error deleting records:', error);
    throw error;
  }
}

/**
 * Reload section data after import
 */
async function reloadSectionData(dataType) {
  try {
    switch(dataType) {
      case 'hero':
        await loadHeroForAdmin();
        switchAboutTab('hero');
        break;
      case 'stats':
        await loadAboutStatsForAdmin();
        switchAboutTab('stats');
        break;
      case 'visionMission':
        await loadVisionMissionForAdmin();
        switchAboutTab('visionMission');
        break;
      case 'eraCards':
        await loadEraCardsForAdmin();
        switchAboutTab('eraCards');
        break;
      case 'timeline':
        await loadTimelineForAdmin();
        switchAboutTab('timeline');
        break;
      case 'leadership':
        await loadLeadershipDesksForAdmin();
        switchAboutTab('leadership');
        break;
      case 'team':
        await loadAdminTeamForAdmin();
        switchAboutTab('team');
        break;
    }
  } catch (error) {
    console.error('Error reloading section:', error);
  }
}

/**
 * Show status message
 */
function showStatus(type, message) {
  const statusDiv = document.getElementById('importStatus');
  statusDiv.className = `status-message ${type}`;
  statusDiv.textContent = message;
  statusDiv.style.display = 'block';
  
  // Auto-hide success messages after 5 seconds
  if (type === 'success') {
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 5000);
  }
}

async function initializeAboutAdmin() {
  await loadHeroForAdmin();
  await loadAboutStatsForAdmin();
  await loadVisionMissionForAdmin();
  await loadEraCardsForAdmin();
  await loadTimelineForAdmin();
  await loadLeadershipDesksForAdmin();
  await loadAdminTeamForAdmin();
  await loadPrincipalsLegacyForAdmin();
  await loadTechnicalLegacyForAdmin();
  await loadPrimaryLegacyForAdmin();
  await loadPrincipalMessageForAdmin();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAboutAdmin);
} else {
  initializeAboutAdmin();
}

// ====== PRINCIPALS LEGACY ======
async function loadPrincipalsLegacyForAdmin() {
  if (typeof supabaseDb === 'undefined' || !supabaseDb) return;
  try {
    const { data, error } = await supabaseDb
      .from('principals_legacy')
      .select('*')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const tbody = document.getElementById('principalsLegacyTableBody');
    if (!tbody) return;
    
    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No legacy data found</td></tr>';
      return;
    }
    
    window.currentPrincipalsLegacyData = data; // Cache for editing
    
    tbody.innerHTML = data.map(item => {
      // Validate image URL - check if it's a valid format
      const isValidImageUrl = item.image_url && 
                              typeof item.image_url === 'string' &&
                              (item.image_url.startsWith('http') || item.image_url.startsWith('data:')) &&
                              !item.image_url.includes('undefined') &&
                              item.image_url.length > 10;
      
      return `
      <tr>
        <td>
          <div style="width: 40px; height: 40px; border-radius: 50%; overflow: hidden; background: #f1f5f9;">
            ${isValidImageUrl ? `<img src="${item.image_url}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none';" onload="this.style.display='block';">` : '<span style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#cbd5e1; font-size:0.8rem;">No image</span>'}
          </div>
        </td>
        <td style="font-weight: 600;">${item.name}</td>
        <td>${item.tenure}</td>
        <td>${item.is_current ? '<span style="background:#dcfce7; color:#16a34a; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.75rem;">Current</span>' : 'Legacy'}</td>
        <td>${item.order_index}</td>
        <td>
          <button onclick="editPrincipalLegacy('${item.id}')" style="background: none; border: none; cursor: pointer; font-size: 1.1rem; margin-right: 0.5rem;">✏️</button>
          <button onclick="deletePrincipalLegacy('${item.id}')" style="background: none; border: none; cursor: pointer; font-size: 1.1rem; color: #dc2626;">🗑️</button>
        </td>
      </tr>
    `;
    }).join('');
    
  } catch (err) {
    console.error('Error loading principals legacy:', err);
  }
}

async function uploadPrincipalImage(file) {
  if (!file) return null;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file');
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image size must be less than 5MB');
  }

  const fileExt = file.name.split('.').pop().toLowerCase();
  const allowedExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  
  if (!allowedExt.includes(fileExt)) {
    throw new Error('Only JPG, PNG, GIF, or WebP files are allowed');
  }

  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  
  try {
    // Try uploading to 'media' bucket first (working bucket)
    const { data: mediaData, error: mediaError } = await supabaseDb.storage
      .from('media')
      .upload(`about/${fileName}`, file, { cacheControl: '3600', upsert: false });

    if (!mediaError) {
      const { data: publicUrlData } = supabaseDb.storage
        .from('media')
        .getPublicUrl(`about/${fileName}`);
      return publicUrlData.publicUrl;
    }

    console.warn('Media bucket upload failed, trying principals-images:', mediaError);

    // Fallback 1: Try principals-images
    const { data, error } = await supabaseDb.storage
      .from('principals-images')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (error) {
      console.warn('Principals-images bucket error, trying about-images bucket:', error);
      
      // Fallback 2: Try about-images
      const { data: fallbackData, error: fallbackError } = await supabaseDb.storage
        .from('about-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });
      
      if (fallbackError) {
        console.error('All bucket uploads failed:', fallbackError);
        throw new Error('Image storage buckets not configured. Please contact administrator.');
      }
      
      const { data: publicUrlData } = supabaseDb.storage
        .from('about-images')
        .getPublicUrl(fileName);
      return publicUrlData.publicUrl;
    }
    
    // Successfully uploaded to principals-images
    const { data: publicUrlData } = supabaseDb.storage
      .from('principals-images')
      .getPublicUrl(fileName);
      
    const publicUrl = publicUrlData.publicUrl;
    
    // Validate that the URL is properly formed
    if (!publicUrl || !publicUrl.includes('http') || publicUrl.includes('undefined')) {
      throw new Error('Invalid image URL generated. Please try again.');
    }
    
    return publicUrl;
  } catch (err) {
    console.error('Image upload error:', err);
    throw new Error(`Image upload failed: ${err.message}`);
  }
}

document.getElementById('legacyPrincipalImage')?.addEventListener('change', function(e) {
  if (e.target.files && e.target.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('legacyPrincipalPreviewImg').src = e.target.result;
      document.getElementById('legacyPrincipalPreviewImg').style.display = 'block';
      document.getElementById('legacyPrincipalPreviewPlaceholder').style.display = 'none';
    }
    reader.readAsDataURL(e.target.files[0]);
  }
});

async function savePrincipalsLegacy(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.innerHTML;
  btn.innerHTML = '⏳ Saving...';
  btn.disabled = true;

  try {
    const id = document.getElementById('legacyPrincipalId').value;
    const name = document.getElementById('legacyPrincipalName').value;
    const tenure = document.getElementById('legacyPrincipalTenure').value;
    const desc = document.getElementById('legacyPrincipalDesc').value;
    const isCurrent = document.getElementById('legacyPrincipalCurrent').checked;
    const orderIndex = parseInt(document.getElementById('legacyPrincipalOrder').value || '0');
    const imageFile = document.getElementById('legacyPrincipalImage').files[0];

    let imageUrl = null;
    
    try {
      if (imageFile) {
        imageUrl = await uploadPrincipalImage(imageFile);
      } else if (id && window.currentPrincipalsLegacyData) {
        const existing = window.currentPrincipalsLegacyData.find(x => x.id === id);
        if (existing && existing.image_url) imageUrl = existing.image_url;
      }
    } catch (uploadErr) {
      console.error('Image upload error:', uploadErr);
      const confirmUploadFail = confirm(`⚠️ Image upload failed: ${uploadErr.message}\n\nWould you like to continue saving without an image?\n\n(Click OK to continue, Cancel to try again)`);
      if (!confirmUploadFail) {
        throw uploadErr;
      }
      // Continue without image
      imageUrl = null;
    }

    if (!imageUrl && !id) {
       alert('❌ Image is required for new entries');
       throw new Error('Image required');
    }

    const payload = {
      name,
      tenure,
      description: desc,
      is_current: isCurrent,
      order_index: orderIndex,
      image_url: imageUrl
    };

    let error;
    if (id) {
      const res = await supabaseDb.from('principals_legacy').update(payload).eq('id', id);
      error = res.error;
    } else {
      const res = await supabaseDb.from('principals_legacy').insert([payload]);
      error = res.error;
    }

    if (error) throw error;

    alert('✅ Saved successfully!');
    resetPrincipalsLegacyForm();
    await loadPrincipalsLegacyForAdmin();
  } catch (err) {
    console.error('Error in savePrincipalsLegacy:', err);
    alert('❌ Error saving principal legacy:\n' + (err.message || String(err)));
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

function editPrincipalLegacy(id) {
  if (!window.currentPrincipalsLegacyData) return;
  const item = window.currentPrincipalsLegacyData.find(x => x.id === id);
  if (!item) return;

  document.getElementById('legacyPrincipalId').value = item.id;
  document.getElementById('legacyPrincipalName').value = item.name;
  document.getElementById('legacyPrincipalTenure').value = item.tenure;
  document.getElementById('legacyPrincipalDesc').value = item.description || '';
  document.getElementById('legacyPrincipalCurrent').checked = item.is_current;
  document.getElementById('legacyPrincipalOrder').value = item.order_index;
  document.getElementById('legacyPrincipalImage').required = false;

  if (item.image_url) {
    document.getElementById('legacyPrincipalPreviewImg').src = item.image_url;
    document.getElementById('legacyPrincipalPreviewImg').style.display = 'block';
    document.getElementById('legacyPrincipalPreviewPlaceholder').style.display = 'none';
  } else {
    document.getElementById('legacyPrincipalPreviewImg').style.display = 'none';
    document.getElementById('legacyPrincipalPreviewPlaceholder').style.display = 'block';
  }
}

function resetPrincipalsLegacyForm() {
  document.getElementById('principalsLegacyForm').reset();
  document.getElementById('legacyPrincipalId').value = '';
  document.getElementById('legacyPrincipalImage').required = true;
  document.getElementById('legacyPrincipalPreviewImg').style.display = 'none';
  document.getElementById('legacyPrincipalPreviewImg').src = '';
  document.getElementById('legacyPrincipalPreviewPlaceholder').style.display = 'block';
}

async function deletePrincipalLegacy(id) {
  if (!confirm('Are you sure you want to delete this record?')) return;
  try {
    if (typeof window.deletePrincipal === 'function') {
      await window.deletePrincipal(id);
    } else {
      const { error } = await supabaseDb.from('principals_legacy').delete().eq('id', id);
      if (error) throw error;
    }
    alert('Deleted successfully');
    await loadPrincipalsLegacyForAdmin();
  } catch (err) {
    alert('Error deleting: ' + err.message);
  }
}

// ====== PRINCIPAL MESSAGE ======
async function loadPrincipalMessageForAdmin() {
  if (typeof supabaseDb === 'undefined' || !supabaseDb) return;
  try {
    const { data, error } = await supabaseDb
      .from('about_leadership_desks')
      .select('*')
      .eq('is_active', true)
      .limit(1);

    if (error) {
      console.warn('Database query failed, trying local storage:', error);
      // Try loading from localStorage fallback
      const localData = JSON.parse(localStorage.getItem('principal_message_local') || '[]');
      if (localData.length > 0) {
        const item = localData[0];
        window.currentPrincipalMessage = item;
        
        document.getElementById('pmId').value = item.id || '';
        document.getElementById('pmName').value = item.leader_name || '';
        document.getElementById('pmRole').value = item.leader_role || '';
        document.getElementById('pmQuote').value = item.leader_quote || '';
        document.getElementById('pmDescription').value = item.leader_description || '';
        document.getElementById('pmSignature').value = item.leader_signature_url || '';
        document.getElementById('pmImage').required = false;

        if (item.leader_photo_url) {
          document.getElementById('pmPreviewImg').src = item.leader_photo_url;
          document.getElementById('pmPreviewImg').style.display = 'block';
          document.getElementById('pmPreviewPlaceholder').style.display = 'none';
        }
      }
      return;
    }
    
    if (data && data.length > 0) {
      const item = data[0];
      window.currentPrincipalMessage = item;
      
      document.getElementById('pmId').value = item.id || '';
      document.getElementById('pmName').value = item.leader_name || '';
      document.getElementById('pmRole').value = item.leader_role || '';
      document.getElementById('pmQuote').value = item.leader_quote || '';
      document.getElementById('pmDescription').value = item.leader_description || '';
      document.getElementById('pmSignature').value = item.leader_signature_url || '';
      document.getElementById('pmImage').required = false;

      if (item.leader_photo_url) {
        document.getElementById('pmPreviewImg').src = item.leader_photo_url;
        document.getElementById('pmPreviewImg').style.display = 'block';
        document.getElementById('pmPreviewPlaceholder').style.display = 'none';
      }
    } else {
      // Try local storage as fallback
      const localData = JSON.parse(localStorage.getItem('principal_message_local') || '[]');
      if (localData.length > 0) {
        const item = localData[0];
        window.currentPrincipalMessage = item;
        
        document.getElementById('pmId').value = item.id || '';
        document.getElementById('pmName').value = item.leader_name || '';
        document.getElementById('pmRole').value = item.leader_role || '';
        document.getElementById('pmQuote').value = item.leader_quote || '';
        document.getElementById('pmDescription').value = item.leader_description || '';
        document.getElementById('pmSignature').value = item.leader_signature_url || '';
        document.getElementById('pmImage').required = false;

        if (item.leader_photo_url) {
          document.getElementById('pmPreviewImg').src = item.leader_photo_url;
          document.getElementById('pmPreviewImg').style.display = 'block';
          document.getElementById('pmPreviewPlaceholder').style.display = 'none';
        }
      }
    }
  } catch (err) {
    console.error('Error loading principal message:', err);
    // Try local storage fallback
    const localData = JSON.parse(localStorage.getItem('principal_message_local') || '[]');
    if (localData.length > 0) {
      const item = localData[0];
      window.currentPrincipalMessage = item;
      
      document.getElementById('pmId').value = item.id || '';
      document.getElementById('pmName').value = item.leader_name || '';
      document.getElementById('pmRole').value = item.leader_role || '';
      document.getElementById('pmQuote').value = item.leader_quote || '';
      document.getElementById('pmDescription').value = item.leader_description || '';
      document.getElementById('pmSignature').value = item.leader_signature_url || '';
      document.getElementById('pmImage').required = false;

      if (item.leader_photo_url) {
        document.getElementById('pmPreviewImg').src = item.leader_photo_url;
        document.getElementById('pmPreviewImg').style.display = 'block';
        document.getElementById('pmPreviewPlaceholder').style.display = 'none';
      }
    }
  }
}

document.getElementById('pmImage')?.addEventListener('change', function(e) {
  if (e.target.files && e.target.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('pmPreviewImg').src = e.target.result;
      document.getElementById('pmPreviewImg').style.display = 'block';
      document.getElementById('pmPreviewPlaceholder').style.display = 'none';
    }
    reader.readAsDataURL(e.target.files[0]);
  }
});

async function savePrincipalMessage(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Saving...';
  btn.disabled = true;

  try {
    const id = document.getElementById('pmId').value;
    const name = document.getElementById('pmName').value;
    const role = document.getElementById('pmRole').value;
    const quote = document.getElementById('pmQuote').value;
    const desc = document.getElementById('pmDescription').value;
    const signature = document.getElementById('pmSignature').value;
    const imageFile = document.getElementById('pmImage').files[0];

    let photoUrl = null;
    let imageUploadFailed = false;
    
    if (imageFile) {
      try {
        photoUrl = await uploadPrincipalImage(imageFile);
      } catch (imgErr) {
        console.warn('Image upload failed:', imgErr);
        imageUploadFailed = true;
        if (!id) {
          alert('⚠️ Image upload failed: ' + imgErr.message + '\n\nPlease try again or use a different image.');
          throw imgErr;
        }
        // For updates, allow continuing without uploading new image
      }
    } else if (window.currentPrincipalMessage) {
      photoUrl = window.currentPrincipalMessage.leader_photo_url;
    }

    if (!photoUrl && !id) {
       alert('Image is required for new principal message');
       throw new Error('Image required');
    }

    const payload = {
      leader_name: name,
      leader_role: role,
      leader_quote: quote,
      leader_description: desc,
      leader_signature_url: signature,
      leader_photo_url: photoUrl,
      is_active: true
    };

    let error;
    if (id) {
      const res = await supabaseDb.from('about_leadership_desks').update(payload).eq('id', id);
      error = res.error;
    } else {
      const res = await supabaseDb.from('about_leadership_desks').insert([payload]);
      error = res.error;
    }

    if (error) {
      console.error('Database error:', error);
      
      // Check for RLS policy errors
      if (error.message && (error.message.includes('RLS') || error.message.includes('policy') || error.message.includes('permission'))) {
        console.warn('RLS Policy blocking insert - using local storage fallback');
        
        // Store locally as fallback
        const localData = JSON.parse(localStorage.getItem('principal_message_local') || '[]');
        const newMessage = {
          id: id || Date.now(),
          leader_name: name,
          leader_role: role,
          leader_quote: quote,
          leader_description: desc,
          leader_signature_url: signature,
          leader_photo_url: photoUrl,
          is_active: true,
          created_at: new Date().toISOString(),
          is_local: true
        };
        
        if (id) {
          const idx = localData.findIndex(m => m.id == id);
          if (idx >= 0) {
            localData[idx] = newMessage;
          } else {
            localData.push(newMessage);
          }
        } else {
          localData.push(newMessage);
        }
        
        localStorage.setItem('principal_message_local', JSON.stringify(localData));
        alert('✅ Principal message saved locally (database sync unavailable)');
        await loadPrincipalMessageForAdmin();
        return;
      }
      
      throw error;
    }

    alert('✅ Principal message saved successfully!');
    await loadPrincipalMessageForAdmin();
  } catch (err) {
    console.error('Error:', err);
    alert('❌ Error saving principal message:\n' + (err.message || String(err)) + '\n\nPlease check the console for more details.');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// ====== TECHNICAL INCHARGE LEGACY ======
async function loadTechnicalLegacyForAdmin() {
  if (typeof supabaseDb === 'undefined' || !supabaseDb) return;
  try {
    const { data, error } = await supabaseDb
      .from('technical_legacy')
      .select('*')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const tbody = document.getElementById('technicalLegacyTableBody');
    if (!tbody) return;
    
    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No technical legacy data found</td></tr>';
      return;
    }
    
    window.currentTechnicalLegacyData = data;
    
    tbody.innerHTML = data.map(item => {
      // Validate image URL - check if it's a valid format
      const isValidImageUrl = item.image_url && 
                              typeof item.image_url === 'string' &&
                              (item.image_url.startsWith('http') || item.image_url.startsWith('data:')) &&
                              !item.image_url.includes('undefined') &&
                              item.image_url.length > 10;
      
      return `
      <tr>
        <td>
          <div style="width: 40px; height: 40px; border-radius: 50%; overflow: hidden; background: #f1f5f9;">
            ${isValidImageUrl ? `<img src="${item.image_url}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none';" onload="this.style.display='block';">` : '<span style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#cbd5e1; font-size:0.8rem;">No image</span>'}
          </div>
        </td>
        <td style="font-weight: 600;">${item.name}</td>
        <td>${item.tenure}</td>
        <td>${item.is_current ? '<span style="background:#dcfce7; color:#16a34a; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.75rem;">Current</span>' : 'Legacy'}</td>
        <td>${item.order_index}</td>
        <td>
          <button onclick="editTechnicalLegacy('${item.id}')" style="background: none; border: none; cursor: pointer; font-size: 1.1rem; margin-right: 0.5rem;">✏️</button>
          <button onclick="deleteTechnicalLegacy('${item.id}')" style="background: none; border: none; cursor: pointer; font-size: 1.1rem; color: #dc2626;">🗑️</button>
        </td>
      </tr>
    `;
    }).join('');
    
  } catch (err) {
    console.error('Error loading technical legacy:', err);
  }
}

document.getElementById('techLegacyImage')?.addEventListener('change', function(e) {
  if (e.target.files && e.target.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('techLegacyPreviewImg').src = e.target.result;
      document.getElementById('techLegacyPreviewImg').style.display = 'block';
      document.getElementById('techLegacyPreviewPlaceholder').style.display = 'none';
    }
    reader.readAsDataURL(e.target.files[0]);
  }
});

async function saveTechnicalLegacy(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Saving...';
  btn.disabled = true;

  try {
    const id = document.getElementById('techLegacyId').value;
    const name = document.getElementById('techLegacyName').value;
    const tenure = document.getElementById('techLegacyTenure').value;
    const desc = document.getElementById('techLegacyDesc').value;
    const isCurrent = document.getElementById('techLegacyCurrent').checked;
    const orderIndex = parseInt(document.getElementById('techLegacyOrder').value || '0');
    const imageFile = document.getElementById('techLegacyImage').files[0];

    let imageUrl = null;
    
    if (imageFile) {
      imageUrl = await uploadPrincipalImage(imageFile);
    } else if (id && window.currentTechnicalLegacyData) {
      const existing = window.currentTechnicalLegacyData.find(x => x.id === id);
      if (existing) imageUrl = existing.image_url;
    }

    if (!imageUrl && !id) {
       alert('Image is required for new entries');
       throw new Error('Image required');
    }

    const payload = {
      name,
      tenure,
      description: desc,
      is_current: isCurrent,
      order_index: orderIndex,
      image_url: imageUrl
    };

    let error;
    if (id) {
      const res = await supabaseDb.from('technical_legacy').update(payload).eq('id', id);
      error = res.error;
    } else {
      const res = await supabaseDb.from('technical_legacy').insert([payload]);
      error = res.error;
    }

    if (error) throw error;

    alert('Saved successfully!');
    resetTechnicalLegacyForm();
    await loadTechnicalLegacyForAdmin();
  } catch (err) {
    console.error(err);
    alert('Error saving technical legacy: ' + err.message);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

function editTechnicalLegacy(id) {
  if (!window.currentTechnicalLegacyData) return;
  const item = window.currentTechnicalLegacyData.find(x => x.id === id);
  if (!item) return;

  document.getElementById('techLegacyId').value = item.id;
  document.getElementById('techLegacyName').value = item.name;
  document.getElementById('techLegacyTenure').value = item.tenure;
  document.getElementById('techLegacyDesc').value = item.description || '';
  document.getElementById('techLegacyCurrent').checked = item.is_current;
  document.getElementById('techLegacyOrder').value = item.order_index;
  document.getElementById('techLegacyImage').required = false;

  if (item.image_url) {
    document.getElementById('techLegacyPreviewImg').src = item.image_url;
    document.getElementById('techLegacyPreviewImg').style.display = 'block';
    document.getElementById('techLegacyPreviewPlaceholder').style.display = 'none';
  } else {
    document.getElementById('techLegacyPreviewImg').style.display = 'none';
    document.getElementById('techLegacyPreviewPlaceholder').style.display = 'block';
  }
}

function resetTechnicalLegacyForm() {
  document.getElementById('technicalLegacyForm').reset();
  document.getElementById('techLegacyId').value = '';
  document.getElementById('techLegacyImage').required = true;
  document.getElementById('techLegacyPreviewImg').style.display = 'none';
  document.getElementById('techLegacyPreviewImg').src = '';
  document.getElementById('techLegacyPreviewPlaceholder').style.display = 'block';
}

async function deleteTechnicalLegacy(id) {
  if (!confirm('Are you sure you want to delete this record?')) return;
  try {
    if (typeof window.deleteTechnicalIncharge === 'function') {
      await window.deleteTechnicalIncharge(id);
    } else {
      const { error } = await supabaseDb.from('technical_legacy').delete().eq('id', id);
      if (error) throw error;
    }
    alert('Deleted successfully');
    await loadTechnicalLegacyForAdmin();
  } catch (err) {
    alert('Error deleting: ' + err.message);
  }
}

// ====== PRIMARY INCHARGE LEGACY ======
async function loadPrimaryLegacyForAdmin() {
  if (typeof supabaseDb === 'undefined' || !supabaseDb) return;
  try {
    const { data, error } = await supabaseDb
      .from('primary_legacy')
      .select('*')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const tbody = document.getElementById('primaryLegacyTableBody');
    if (!tbody) return;
    
    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No primary legacy data found</td></tr>';
      return;
    }
    
    window.currentPrimaryLegacyData = data;
    
    tbody.innerHTML = data.map(item => {
      // Validate image URL - check if it's a valid format
      const isValidImageUrl = item.image_url && 
                              typeof item.image_url === 'string' &&
                              (item.image_url.startsWith('http') || item.image_url.startsWith('data:')) &&
                              !item.image_url.includes('undefined') &&
                              item.image_url.length > 10;
      
      return `
      <tr>
        <td>
          <div style="width: 40px; height: 40px; border-radius: 50%; overflow: hidden; background: #f1f5f9;">
            ${isValidImageUrl ? `<img src="${item.image_url}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none';" onload="this.style.display='block';">` : '<span style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#cbd5e1; font-size:0.8rem;">No image</span>'}
          </div>
        </td>
        <td style="font-weight: 600;">${item.name}</td>
        <td>${item.tenure}</td>
        <td>${item.is_current ? '<span style="background:#dcfce7; color:#16a34a; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.75rem;">Current</span>' : 'Legacy'}</td>
        <td>${item.order_index}</td>
        <td>
          <button onclick="editPrimaryLegacy('${item.id}')" style="background: none; border: none; cursor: pointer; font-size: 1.1rem; margin-right: 0.5rem;">✏️</button>
          <button onclick="deletePrimaryLegacy('${item.id}')" style="background: none; border: none; cursor: pointer; font-size: 1.1rem; color: #dc2626;">🗑️</button>
        </td>
      </tr>
    `;
    }).join('');
    
  } catch (err) {
    console.error('Error loading primary legacy:', err);
  }
}

document.getElementById('primaryLegacyImage')?.addEventListener('change', function(e) {
  if (e.target.files && e.target.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('primaryLegacyPreviewImg').src = e.target.result;
      document.getElementById('primaryLegacyPreviewImg').style.display = 'block';
      document.getElementById('primaryLegacyPreviewPlaceholder').style.display = 'none';
    }
    reader.readAsDataURL(e.target.files[0]);
  }
});

async function savePrimaryLegacy(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Saving...';
  btn.disabled = true;

  try {
    const id = document.getElementById('primaryLegacyId').value;
    const name = document.getElementById('primaryLegacyName').value;
    const tenure = document.getElementById('primaryLegacyTenure').value;
    const desc = document.getElementById('primaryLegacyDesc').value;
    const isCurrent = document.getElementById('primaryLegacyCurrent').checked;
    const orderIndex = parseInt(document.getElementById('primaryLegacyOrder').value || '0');
    const imageFile = document.getElementById('primaryLegacyImage').files[0];

    let imageUrl = null;
    
    if (imageFile) {
      imageUrl = await uploadPrincipalImage(imageFile);
    } else if (id && window.currentPrimaryLegacyData) {
      const existing = window.currentPrimaryLegacyData.find(x => x.id === id);
      if (existing) imageUrl = existing.image_url;
    }

    if (!imageUrl && !id) {
       alert('Image is required for new entries');
       throw new Error('Image required');
    }

    const payload = {
      name,
      tenure,
      description: desc,
      is_current: isCurrent,
      order_index: orderIndex,
      image_url: imageUrl
    };

    let error;
    if (id) {
      const res = await supabaseDb.from('primary_legacy').update(payload).eq('id', id);
      error = res.error;
    } else {
      const res = await supabaseDb.from('primary_legacy').insert([payload]);
      error = res.error;
    }

    if (error) throw error;

    alert('Saved successfully!');
    resetPrimaryLegacyForm();
    await loadPrimaryLegacyForAdmin();
  } catch (err) {
    console.error(err);
    alert('Error saving primary legacy: ' + err.message);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// ====== ALUMNI HIGHLIGHTS ======
async function loadAlumniForAdmin() {
  if (typeof readAllAlumni !== 'function') return;
  try {
    const data = await readAllAlumni();
    const tbody = document.getElementById('alumniTableBody');
    if (!tbody) return;
    
    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No alumni highlights found</td></tr>';
      return;
    }
    
    window.currentAlumniData = data;
    
    tbody.innerHTML = data.map(item => {
      const isValidImageUrl = item.alumni_photo_url && 
                              typeof item.alumni_photo_url === 'string' &&
                              item.alumni_photo_url.length > 10;
      
      return `
      <tr>
        <td>
          <div style="width: 40px; height: 40px; border-radius: 50%; overflow: hidden; background: #f1f5f9;">
            ${isValidImageUrl ? `<img src="${item.alumni_photo_url}" style="width:100%; height:100%; object-fit:cover;">` : '<span style="color:#cbd5e1; font-size:0.75rem;">No pic</span>'}
          </div>
        </td>
        <td style="font-weight: 600;">${item.alumni_name}</td>
        <td>${item.alumni_batch_year}</td>
        <td>${item.alumni_achievement}</td>
        <td>${item.alumni_current_position || ''}</td>
        <td>${item.display_order}</td>
        <td>
          <button type="button" onclick="editAlumni('${item.id}')" style="background: none; border: none; cursor: pointer; font-size: 1.1rem; margin-right: 0.5rem;">✏️</button>
          <button type="button" onclick="deleteAlumniAdmin('${item.id}')" style="background: none; border: none; cursor: pointer; font-size: 1.1rem; color: #dc2626;">🗑️</button>
        </td>
      </tr>
    `;
    }).join('');
  } catch (err) {
    console.error('Error loading alumni:', err);
  }
}

// Preview listener for file inputs
document.addEventListener('change', function(e) {
  if (e.target && e.target.id === 'alumniImage') {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = function(event) {
        const preview = document.getElementById('alumniPreviewImg');
        const placeholder = document.getElementById('alumniPreviewPlaceholder');
        if (preview && placeholder) {
          preview.src = event.target.result;
          preview.style.display = 'block';
          placeholder.style.display = 'none';
        }
      }
      reader.readAsDataURL(e.target.files[0]);
    }
  }
  if (e.target && e.target.id === 'blogImage') {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = function(event) {
        const preview = document.getElementById('blogPreviewImg');
        const placeholder = document.getElementById('blogPreviewPlaceholder');
        if (preview && placeholder) {
          preview.src = event.target.result;
          preview.style.display = 'block';
          placeholder.style.display = 'none';
        }
      }
      reader.readAsDataURL(e.target.files[0]);
    }
  }
});

async function saveAlumniHighlight(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Saving...';
  btn.disabled = true;

  try {
    const id = document.getElementById('alumniId').value;
    const name = document.getElementById('alumniName').value;
    const batch = document.getElementById('alumniBatchYear').value;
    const achievement = document.getElementById('alumniAchievement').value;
    const position = document.getElementById('alumniCurrentPosition').value;
    const order = parseInt(document.getElementById('alumniOrder').value || '0');
    const imageFile = document.getElementById('alumniImage').files[0];

    let photoUrl = '';
    if (imageFile) {
      photoUrl = await uploadPrincipalImage(imageFile);
    } else if (id && window.currentAlumniData) {
      const existing = window.currentAlumniData.find(x => x.id === id);
      if (existing) photoUrl = existing.alumni_photo_url;
    }

    const payload = {
      alumni_name: name,
      alumni_batch_year: batch,
      alumni_achievement: achievement,
      alumni_current_position: position,
      display_order: order,
      alumni_photo_url: photoUrl
    };

    let result;
    if (id) {
      result = await updateAlumnus(id, payload);
    } else {
      result = await createAlumnus(name, batch, achievement, photoUrl, position, order);
    }

    if (!result) throw new Error('Action failed');

    alert('Alumni record saved successfully!');
    resetAlumniForm();
    await loadAlumniForAdmin();
  } catch (err) {
    console.error(err);
    alert('Error saving alumni record: ' + err.message);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

function editAlumni(id) {
  if (!window.currentAlumniData) return;
  const item = window.currentAlumniData.find(x => x.id === id);
  if (!item) return;

  document.getElementById('alumniId').value = item.id;
  document.getElementById('alumniName').value = item.alumni_name;
  document.getElementById('alumniBatchYear').value = item.alumni_batch_year || '';
  document.getElementById('alumniAchievement').value = item.alumni_achievement || '';
  document.getElementById('alumniCurrentPosition').value = item.alumni_current_position || '';
  document.getElementById('alumniOrder').value = item.display_order;

  const preview = document.getElementById('alumniPreviewImg');
  const placeholder = document.getElementById('alumniPreviewPlaceholder');
  if (item.alumni_photo_url && preview && placeholder) {
    preview.src = item.alumni_photo_url;
    preview.style.display = 'block';
    placeholder.style.display = 'none';
  } else if (preview && placeholder) {
    preview.style.display = 'none';
    placeholder.style.display = 'block';
  }
}

function resetAlumniForm() {
  const form = document.getElementById('alumniForm');
  if (form) form.reset();
  document.getElementById('alumniId').value = '';
  const preview = document.getElementById('alumniPreviewImg');
  const placeholder = document.getElementById('alumniPreviewPlaceholder');
  if (preview && placeholder) {
    preview.style.display = 'none';
    preview.src = '';
    placeholder.style.display = 'block';
  }
}

async function deleteAlumniAdmin(id) {
  if (!confirm('Are you sure you want to delete this alumni record?')) return;
  try {
    const success = await deleteAlumnus(id);
    if (!success) throw new Error('Failed to delete');
    alert('Deleted successfully');
    await loadAlumniForAdmin();
  } catch (err) {
    alert('Error deleting alumni record: ' + err.message);
  }
}

// ====== NEWS & BLOGS ======
async function loadBlogsForAdmin() {
  if (typeof readAllBlogs !== 'function') return;
  try {
    const data = await readAllBlogs();
    const tbody = document.getElementById('blogsTableBody');
    if (!tbody) return;
    
    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No blog posts found</td></tr>';
      return;
    }
    
    window.currentBlogsData = data;
    
    tbody.innerHTML = data.map(item => {
      const isValidImageUrl = item.featured_image_url && 
                              typeof item.featured_image_url === 'string' &&
                              item.featured_image_url.length > 10;
      
      return `
      <tr>
        <td>
          <div style="width: 60px; height: 40px; border-radius: 4px; overflow: hidden; background: #f1f5f9;">
            ${isValidImageUrl ? `<img src="${item.featured_image_url}" style="width:100%; height:100%; object-fit:cover;">` : '<span style="color:#cbd5e1; font-size:0.75rem;">No img</span>'}
          </div>
        </td>
        <td style="font-weight: 600; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.blog_title}</td>
        <td>${item.author_name || item.blog_author || ''}</td>
        <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.blog_excerpt || ''}</td>
        <td>${item.display_order || 0}</td>
        <td>
          <button type="button" onclick="editBlog('${item.id}')" style="background: none; border: none; cursor: pointer; font-size: 1.1rem; margin-right: 0.5rem;">✏️</button>
          <button type="button" onclick="deleteBlogAdmin('${item.id}')" style="background: none; border: none; cursor: pointer; font-size: 1.1rem; color: #dc2626;">🗑️</button>
        </td>
      </tr>
    `;
    }).join('');
  } catch (err) {
    console.error('Error loading blogs:', err);
  }
}

async function saveBlogPostAdmin(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Saving...';
  btn.disabled = true;

  try {
    const id = document.getElementById('blogId').value;
    const title = document.getElementById('blogTitle').value;
    const author = document.getElementById('blogAuthor').value;
    const excerpt = document.getElementById('blogExcerpt').value;
    const content = document.getElementById('blogContent').value;
    const order = parseInt(document.getElementById('blogOrder').value || '0');
    const imageFile = document.getElementById('blogImage').files[0];

    let featuredImage = '';
    if (imageFile) {
      featuredImage = await uploadPrincipalImage(imageFile);
    } else if (id && window.currentBlogsData) {
      const existing = window.currentBlogsData.find(x => x.id === id);
      if (existing) featuredImage = existing.featured_image_url;
    }

    const payload = {
      blog_title: title,
      author_name: author,
      blog_excerpt: excerpt,
      blog_content: content,
      display_order: order,
      featured_image_url: featuredImage
    };

    let result;
    if (id) {
      result = await updateBlogPost(id, payload);
    } else {
      result = await createBlogPost(title, content, excerpt, featuredImage, author, order);
    }

    if (!result) throw new Error('Action failed');

    alert('Blog post saved successfully!');
    resetBlogForm();
    await loadBlogsForAdmin();
  } catch (err) {
    console.error(err);
    alert('Error saving blog post: ' + err.message);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

function editBlog(id) {
  if (!window.currentBlogsData) return;
  const item = window.currentBlogsData.find(x => x.id === id);
  if (!item) return;

  document.getElementById('blogId').value = item.id;
  document.getElementById('blogTitle').value = item.blog_title;
  document.getElementById('blogAuthor').value = item.author_name || item.blog_author || '';
  document.getElementById('blogExcerpt').value = item.blog_excerpt || '';
  document.getElementById('blogContent').value = item.blog_content || '';
  document.getElementById('blogOrder').value = item.display_order || 0;

  const preview = document.getElementById('blogPreviewImg');
  const placeholder = document.getElementById('blogPreviewPlaceholder');
  if (item.featured_image_url && preview && placeholder) {
    preview.src = item.featured_image_url;
    preview.style.display = 'block';
    placeholder.style.display = 'none';
  } else if (preview && placeholder) {
    preview.style.display = 'none';
    placeholder.style.display = 'block';
  }
}

function resetBlogForm() {
  const form = document.getElementById('blogsForm');
  if (form) form.reset();
  document.getElementById('blogId').value = '';
  const preview = document.getElementById('blogPreviewImg');
  const placeholder = document.getElementById('blogPreviewPlaceholder');
  if (preview && placeholder) {
    preview.style.display = 'none';
    preview.src = '';
    placeholder.style.display = 'block';
  }
}

async function deleteBlogAdmin(id) {
  if (!confirm('Are you sure you want to delete this blog post?')) return;
  try {
    const success = await deleteBlogPost(id);
    if (!success) throw new Error('Failed to delete');
    alert('Deleted successfully');
    await loadBlogsForAdmin();
  } catch (err) {
    alert('Error deleting blog post: ' + err.message);
  }
}

function editPrimaryLegacy(id) {
  if (!window.currentPrimaryLegacyData) return;
  const item = window.currentPrimaryLegacyData.find(x => x.id === id);
  if (!item) return;

  document.getElementById('primaryLegacyId').value = item.id;
  document.getElementById('primaryLegacyName').value = item.name;
  document.getElementById('primaryLegacyTenure').value = item.tenure;
  document.getElementById('primaryLegacyDesc').value = item.description || '';
  document.getElementById('primaryLegacyCurrent').checked = item.is_current;
  document.getElementById('primaryLegacyOrder').value = item.order_index;
  document.getElementById('primaryLegacyImage').required = false;

  if (item.image_url) {
    document.getElementById('primaryLegacyPreviewImg').src = item.image_url;
    document.getElementById('primaryLegacyPreviewImg').style.display = 'block';
    document.getElementById('primaryLegacyPreviewPlaceholder').style.display = 'none';
  } else {
    document.getElementById('primaryLegacyPreviewImg').style.display = 'none';
    document.getElementById('primaryLegacyPreviewPlaceholder').style.display = 'block';
  }
}

function resetPrimaryLegacyForm() {
  document.getElementById('primaryLegacyForm').reset();
  document.getElementById('primaryLegacyId').value = '';
  document.getElementById('primaryLegacyImage').required = true;
  document.getElementById('primaryLegacyPreviewImg').style.display = 'none';
  document.getElementById('primaryLegacyPreviewImg').src = '';
  document.getElementById('primaryLegacyPreviewPlaceholder').style.display = 'block';
}

async function deletePrimaryLegacy(id) {
  if (!confirm('Are you sure you want to delete this record?')) return;
  try {
    if (typeof window.deletePrimaryIncharge === 'function') {
      await window.deletePrimaryIncharge(id);
    } else {
      const { error } = await supabaseDb.from('primary_legacy').delete().eq('id', id);
      if (error) throw error;
    }
    alert('Deleted successfully');
    await loadPrimaryLegacyForAdmin();
  } catch (err) {
    alert('Error deleting: ' + err.message);
  }
}

// ═════════════════════════════════════════════════════════════════
// INIT FUNCTION FOR ADMIN PORTAL
// ═════════════════════════════════════════════════════════════════
async function initAboutPage() {
  if (document.getElementById('alumniTableBody')) await loadAlumniForAdmin();
  if (document.getElementById('blogsTableBody')) await loadBlogsForAdmin();
  if (document.getElementById('heroTableBody')) await loadHeroForAdmin();
  await loadAboutStatsForAdmin();
  // Call other initializers here if their UI elements exist in the DOM
  if (document.getElementById('visionMissionTableBody')) await loadVisionMissionForAdmin();
  if (document.getElementById('legacySubtitle')) await loadLegacyStoryForAdmin();
  if (document.getElementById('eraCardsTableBody')) await loadEraCardsForAdmin();
  if (document.getElementById('timelineTableBody')) await loadTimelineForAdmin();
  if (document.getElementById('leadershipDesksTableBody')) await loadLeadershipDesksForAdmin();
  if (document.getElementById('adminTeamTableBody')) await loadAdminTeamForAdmin();
}
