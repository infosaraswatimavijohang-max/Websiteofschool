// ============================================================================
// FILE:    about-data.js
// MODULE:  About Page Data
// PURPOSE: About Page Data Layer - Fetch, cache, render, and CRUD operations for all About page sections (stats, vision/mission, era cards, timeline, team, alumni, blogs, legacy trees)
//
// PROJECT: Shree Saraswati Secondary School — Management System
// STACK:   Vanilla JS + Supabase (PostgreSQL) + HTML/CSS
// UPDATED: 2026-06-03
// ============================================================================
// ====================================================================
// ABOUT PAGE DATA MANAGEMENT - CRUD & RENDER OPERATIONS
// ====================================================================

// ─ GLOBAL MOCK DATA FALLBACKS ─
const ABOUT_FALLBACKS = {
  stats: [
    { id: 'f-1', icon_emoji: '🏫', stat_number: '65+ Years', stat_label: 'Academic Legacy', display_order: 1 },
    { id: 'f-2', icon_emoji: '🎓', stat_number: '1,200+', stat_label: 'Meritorious Alumni', display_order: 2 },
    { id: 'f-3', icon_emoji: '👨‍🏫', stat_number: '45+', stat_label: 'Expert Educators', display_order: 3 },
    { id: 'f-4', icon_emoji: '💻', stat_number: '100%', stat_label: 'Tech-Enabled Labs', display_order: 4 }
  ],
  vision_mission: [
    {
      id: 'f-vm-1',
      section_type: 'Vision',
      icon_emoji: '🎯',
      section_title: 'Our Vision',
      section_description: 'To be a premier center of educational excellence, nurturing creative, confident, and socially responsible leaders of tomorrow.',
      key_points: '["Excellence in Academics", "Holistic Character Building", "Global Citizenship Mindset", "Innovation & Critical Thinking"]',
      display_order: 1
    },
    {
      id: 'f-vm-2',
      section_type: 'Mission',
      icon_emoji: '🚀',
      section_title: 'Our Mission',
      section_description: 'To provide a stimulating learning environment, state-of-the-art infrastructure, and dedicated faculty to help students realize their full potential.',
      key_points: '["Nurturing Modern Skills", "Fostering Ethical & Moral values", "Inclusive Learning Pathways", "Leveraging Educational Tech"]',
      display_order: 2
    }
  ],
  era_cards: [
    { id: 'f-era-1', icon_emoji: '🌱', era_badge: 'Phase I: The Genesis', era_title: 'Seeds of Literacy', era_description: 'Starting in 2016 B.S., our journey began under humble mud-and-thatch roofs. With zero resources but a resolute municipal drive, local volunteers gathered in Satyawati-6 Johang to combat child illiteracy, creating the first basic primary classrooms in the region.', display_order: 1 },
    { id: 'f-era-2', icon_emoji: '🧱', era_badge: 'Phase II: Structural Rise', era_title: 'Building Brick by Brick', era_description: 'Across the mid-2030s to 2050s B.S., the institution expanded to Lower Secondary and full High School tiers. Local villagers manually transported building materials across steep hills, constructing permanent brick halls and welcoming students.', display_order: 2 },
    { id: 'f-era-3', icon_emoji: '⚡', era_badge: 'Phase III: Digital Pioneer', era_title: 'Technological Model', era_description: 'Launched in 2076 B.S., the prestigious Computer Engineering stream (CTEVT track) marked our rise as a modern technical hub. By 2082 B.S., the school implemented complete digital pedagogy, high-speed labs, and interactive smart classroom networks.', display_order: 3 }
  ],
  hero: [
    {
      id: 'f-hero-1',
      hero_title: 'About Our School',
      hero_subtitle: 'Shaping Lives, Nurturing Potential, and Building Educational Legacies in Satyawati, Gulmi since 2016 B.S.',
      hero_description: 'Since 1990, we have been dedicated to providing quality education, fostering holistic growth, and inspiring students to reach their highest potential in a dynamic learning environment.',
      primary_button_text: 'Explore Portals',
      primary_button_link: '#portals',
      secondary_button_text: 'Our Legacy',
      secondary_button_link: '#storyContainer',
      background_image_url: '../images/img.jpg',
      is_active: true
    }
  ],
  story: [
    {
      id: 'f-story-1',
      story_subtitle: '— OUR LEGACY',
      story_title: 'A Legacy of Excellence & Value-based Education',
      story_paragraph1: 'Shree Saraswati Secondary School stands proud as a pioneer of quality public education in the Satyawati Municipality of Gulmi. Driven by rural community leaders, the school set out to serve Satyawati-6 Bedauri children under minimal thatch structures.',
      story_paragraph2: 'Our dedicated faculty, modern infrastructure, and student-centric approach ensure that every learner is equipped with the skills and knowledge needed to succeed in an ever-changing world.',
      story_visual_image: '../images/img.jpg',
      story_values_list: '["Holistic Student Development", "Innovative & Interactive Teaching", "Inclusive & Diverse Environment", "Strong Community & Moral Values"]',
      display_order: 1
    }
  ],
  timeline: [
    { id: 'f-tl-1', icon_emoji: '🚩', timeline_date: '2016 B.S. (1959 A.D.)', timeline_title: 'Foundation Inception', timeline_description: 'Established as a basic primary class on Saraswati Puja. Driven by rural community leaders, the school set out to serve Satyawati-6 Bedauri children under minimal thatch structures.', timeline_position: 'left', display_order: 1 },
    { id: 'f-tl-2', icon_emoji: '📈', timeline_date: '2035 B.S. (1978 A.D.)', timeline_title: 'Lower Secondary Expansion', timeline_description: 'Officially upgraded to a Lower Secondary Tier (up to Class 7). Local families contributed building resources and manual labor to assemble permanent stone and timber classrooms.', timeline_position: 'right', display_order: 2 },
    { id: 'f-tl-3', icon_emoji: '🏛️', timeline_date: '2045 B.S. (1988 A.D.)', timeline_title: 'High School Tier Upgrade', timeline_description: 'Reached Secondary School status. Initiated the first batch of Class 9 and 10 students, raising permanent brick campus chambers and preparing candidates for early SLC board exams.', timeline_position: 'left', display_order: 3 },
    { id: 'f-tl-4', icon_emoji: '🎉', timeline_date: '2065 B.S. (2008 A.D.)', timeline_title: 'Golden Jubilee & Expansion', timeline_description: 'Celebrated 50 years of educational service! Constructed a spacious library wing, raised the multi-story administrative block, and established the primary science cabinet facilities.', timeline_position: 'right', display_order: 4 },
    { id: 'f-tl-5', icon_emoji: '💻', timeline_date: '2076 B.S. (2019 A.D.)', timeline_title: 'Computer Engineering Stream', timeline_description: 'Introduced the CTEVT technical Computer Engineering stream (Classes 9 to 12). Set up a premium ICT testing lab, complete with networking systems and servers.', timeline_position: 'left', display_order: 5 },
    { id: 'f-tl-6', icon_emoji: '🚀', timeline_date: '2082 B.S. (2025 A.D.)', timeline_title: 'Smart Classrooms Upgrade', timeline_description: 'Crowned as a Model Technical School. Installed high-tech interactive touch displays in all secondary classrooms, integrated digital libraries, and updated hardware testing arrays.', timeline_position: 'right', display_order: 6 }
  ],
  admin_team: [
    { id: 'f-admin-2', member_name: 'Yam Bahadur Khatri', member_role: 'Chief Accountant', member_department: 'Finance, Admissions & Operations Lead', member_photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=50', member_email: 'yam.khatri@gmail.com', display_order: 2 },
    { id: 'f-admin-3', member_name: 'Er. Sandesh Bhandari', member_role: 'CTEVT Coordinator', member_department: 'Computer Engineering Technical Stream Incharge', member_photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=50', member_email: 'sandesh.ctevt@gmail.com', display_order: 3 },
    { id: 'f-admin-4', member_name: 'Saraswati Sen', member_role: 'Primary Lead', member_department: 'Early Childhood Education & Primary Coordinator', member_photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=50', member_email: 'saraswati.sen@gmail.com', display_order: 4 }
  ],
  leadership_desks: [
    { id: 'f-lead-1', leader_name: 'Til Bahadur Sen', leader_role: 'Headmaster / Principal', leader_photo_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=50', leader_quote: 'Education is not the learning of facts, but the training of the mind to think critically. We strive to empower every child from Johang with functional technical skillsets and character discipline.', leader_description: 'Shree Saraswati has always remained a second home to our children. By integrating high-end Computer Engineering streams with classic primary values, we ensure that students emerge as complete, confident professionals who remain deeply connected to their native community roots.', display_order: 1 },
    { id: 'f-lead-2', leader_name: 'Jagat Bahadur Khatri', leader_role: 'SMC Chairman', leader_photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=50', leader_quote: 'Our community is our strength. By bringing local guardians, municipalities, and tech facilities together, we create a secure, encouraging space for educational growth.', leader_description: 'The School Management Committee works day and night to upgrade physical infrastructures, maintain complete transparency in administrative allocations, secure technical resources, and expand free scholarship provisions for underprivileged sectors.', display_order: 2 }
  ],
  alumni: [
    { id: 'f-al-1', alumni_name: 'Aarati Dhakal', alumni_batch_year: 'Batch of 2081', alumni_achievement: '3.98 GPA', alumni_current_position: 'CTEVT Comp Engineering Board Topper', alumni_photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256', display_order: 1 },
    { id: 'f-al-2', alumni_name: 'Rohan Shrestha', alumni_batch_year: 'Batch of 2080', alumni_achievement: '3.94 GPA', alumni_current_position: 'IOE Entrance Rank #15', alumni_photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256', display_order: 2 },
    { id: 'f-al-3', alumni_name: 'Deepa Karki', alumni_batch_year: 'Batch of 2081', alumni_achievement: '3.92 GPA', alumni_current_position: 'Pulchowk Campus CSE Scholar', alumni_photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256', display_order: 3 }
  ],
  blogs: [
    { id: 'f-blog-1', blog_title: 'Annual Science & Technology Expo 2026', blog_excerpt: 'Our students showcased groundbreaking AI and robotics projects at this year\'s expo, highlighting creative problem-solving and collaboration.', author_name: 'Principal\'s Office', published_date: '2026-05-15T00:00:00.000Z', featured_image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=600', display_order: 1 },
    { id: 'f-blog-2', blog_title: 'Smart Classroom Initiatives Launched', blog_excerpt: 'We have upgraded all classrooms in secondary blocks with interactive screens, high-speed Wi-Fi, and smart-sync software.', author_name: 'IT Department', published_date: '2026-04-10T00:00:00.000Z', featured_image_url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=600', display_order: 2 }
  ],
  principals_legacy: [
    { id: 'f-pl-1', name: 'Kedar Nath Upadhyay', tenure: '2016 B.S. - 2038 B.S.', description: 'Founding Headmaster who laid the academic and moral foundation of the institution with dedication.', image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256', order_index: 1 },
    { id: 'f-pl-2', name: 'Shanti Devi Sharma', tenure: '2038 B.S. - 2065 B.S.', description: 'Championed infrastructure expansion and led the school through modern accreditation phases.', image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256', order_index: 2 },
    { id: 'f-pl-3', name: 'Til Bahadur Sen', tenure: '2065 B.S. - Present', description: 'Introduced CTEVT Computer Engineering streams, smart classes, and portal-based management systems.', image_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256', order_index: 3 }
  ],
  technical_legacy: [
    { id: 'f-tl-l1', name: 'Er. Ramesh KC', tenure: '2076 B.S. - 2081 B.S.', description: 'Architect of the school\'s initial computer network and digital learning labs.', image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256', order_index: 1 },
    { id: 'f-tl-l2', name: 'Mr. Diwas Lamsal', tenure: '2081 B.S. - Present', description: 'Pioneered the school management system portal integration and automated databases.', image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256', order_index: 2 }
  ],
  primary_legacy: [
    { id: 'f-pr-1', name: 'Mrs. Tara Devi Bhattarai', tenure: '2060 B.S. - 2075 B.S.', description: 'Created activity-based learning structures for primary grade students.', image_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256', order_index: 1 },
    { id: 'f-pr-2', name: 'Miss Aarati Adhikari', tenure: '2075 B.S. - Present', description: 'Nurturing early childhood education with modern audio-visual teaching aids.', image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256', order_index: 2 }
  ]
};

// ─ SAFE ARRAY PARSER HELPER ─
function safeParseArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        return JSON.parse(trimmed);
      } catch (e) {
        console.warn('[about] Failed to parse JSON array:', e);
      }
    }
    // Fallback: split by newlines and filter empty items
    return trimmed.split('\n').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

// ─ DB OR CACHE GETTER WRAPPER ─
async function getFromDbOrCache(key, supabaseQueryPromise) {
  try {
    if (typeof supabaseDb !== 'undefined' && supabaseDb) {
      const { data, error } = await supabaseQueryPromise;
      if (!error && data) {
        let mergedData = [...data];
        try {
          const cached = localStorage.getItem('about_' + key);
          if (cached) {
            const cachedParsed = JSON.parse(cached);
            if (Array.isArray(cachedParsed)) {
              // 1. Keep local-only additions (id starts with 'local-')
              const localAdditions = cachedParsed.filter(item => item && item.id && String(item.id).startsWith('local-'));
              localAdditions.forEach(localItem => {
                if (!mergedData.some(dbItem => String(dbItem.id) === String(localItem.id))) {
                  mergedData.push(localItem);
                }
              });

              // 2. Keep locally updated modifications (marked with _dirty or is_local_dirty)
              const dirtyModifications = cachedParsed.filter(item => item && (item._dirty === true || item.is_local_dirty === true));
              dirtyModifications.forEach(dirtyItem => {
                const dbIndex = mergedData.findIndex(dbItem => String(dbItem.id) === String(dirtyItem.id));
                if (dbIndex > -1) {
                  // Override DB version with our locally updated/dirty version
                  mergedData[dbIndex] = dirtyItem;
                }
              });
            }
          }
        } catch (cacheErr) {
          console.warn(`[about] Error merging cache for "${key}":`, cacheErr);
        }

        localStorage.setItem('about_' + key, JSON.stringify(mergedData));
        return mergedData;
      }
      if (error) {
        console.warn(`[about] Database read for "${key}" failed (e.g. 404):`, error.message || error);
      }
    }
  } catch (err) {
    console.warn(`[about] Database exception for "${key}":`, err);
  }
  
  // Try localStorage
  const cached = localStorage.getItem('about_' + key);
  if (cached !== null) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.warn(`[about] Failed to parse cache for "${key}":`, e);
    }
  }
  
  // Fall back to hardcoded mock data and initialize cache
  console.info(`[about] Serving hardcoded fallback for "${key}"`);
  const fallbacks = ABOUT_FALLBACKS[key] || [];
  localStorage.setItem('about_' + key, JSON.stringify(fallbacks));
  return fallbacks;
}

function fallbackDeleteFromCache(key, id) {
  const storageKey = 'about_' + key;
  const cached = localStorage.getItem(storageKey);
  let items = [];
  if (cached !== null) {
    try { items = JSON.parse(cached); } catch (e) { items = ABOUT_FALLBACKS[key] || []; }
  } else {
    items = ABOUT_FALLBACKS[key] || [];
  }
  if (!Array.isArray(items)) items = [];
  items = items.filter(item => String(item.id) !== String(id));
  localStorage.setItem(storageKey, JSON.stringify(items));
  if (ABOUT_FALLBACKS[key]) ABOUT_FALLBACKS[key] = items;
  return true;
}

// ─ STATS CRUD & RENDERING ─
async function createAboutStat(icon_emoji, stat_number, stat_label, display_order = 0) {
  const { data, error } = await supabaseDb.from('about_stats').insert([{
    icon_emoji, stat_number, stat_label, display_order, is_active: true
  }]).select();
  if (error) { console.error('Error creating stat:', error); return null; }
  await readAllAboutStats();
  return data?.[0];
}

async function readAllAboutStats() {
  return getFromDbOrCache('stats', supabaseDb.from('about_stats')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true }));
}

async function renderAboutStats() {
  try {
    const stats = await readAllAboutStats();
    const statsContainer = document.getElementById('statsContainer');
    if (!statsContainer) return;
    if (stats && stats.length > 0) {
      statsContainer.innerHTML = stats.map(s => `
        <div class="stat-badge-card">
          <div class="icon-circle">${s.icon_emoji}</div>
          <h4>${s.stat_number}</h4>
          <span>${s.stat_label}</span>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Error rendering stats:', err);
  }
}

async function updateAboutStat(id, updates) {
  const { data, error } = await supabaseDb.from('about_stats')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();
  if (error) { console.error('Error updating stat:', error); return null; }
  await readAllAboutStats();
  return data?.[0];
}

async function deleteAboutStat(id) {
  try {
    if (typeof supabaseDb !== 'undefined' && supabaseDb) {
      await supabaseDb.from('about_stats').delete().eq('id', id);
    }
  } catch (err) { console.warn('DB delete exception for stat:', err); }
  fallbackDeleteFromCache('stats', id);
  await readAllAboutStats();
  return true;
}

// ─ VISION & MISSION CRUD & RENDERING ─
async function createVisionMission(section_type, icon_emoji, section_title, section_description, key_points, display_order = 0) {
  const { data, error } = await supabaseDb.from('about_vision_mission').insert([{
    section_type, icon_emoji, section_title, section_description, key_points, display_order, is_active: true
  }]).select();
  if (error) { console.error('Error creating vision/mission:', error); return null; }
  await readAllVisionMission();
  return data?.[0];
}

async function readAllVisionMission() {
  return getFromDbOrCache('vision_mission', supabaseDb.from('about_vision_mission')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true }));
}

async function renderVisionMission() {
  try {
    const vms = await readAllVisionMission();
    const vmContainer = document.getElementById('visionMissionContainer');
    if (!vmContainer) return;
    if (vms && vms.length > 0) {
      vmContainer.innerHTML = vms.map(vm => {
        const titleLower = (vm.section_title || vm.title || '').toLowerCase();
        let fallbackIcon = '✨';
        if (titleLower.includes('vision')) fallbackIcon = '🔭';
        if (titleLower.includes('mission')) fallbackIcon = '🚀';
        
        const finalIcon = vm.icon_emoji || vm.icon || fallbackIcon;
        
        return `
        <div class="glass-card">
          <div class="badge-icon">${finalIcon}</div>
          <h3>${vm.section_title || vm.title || ''}</h3>
          <p>${vm.section_description || vm.description || ''}</p>
          <ul>
            ${safeParseArray(vm.key_points).map(kp => `<li>${kp}</li>`).join('')}
          </ul>
        </div>
        `;
      }).join('');
    }
  } catch (err) {
    console.error('Error rendering vision mission:', err);
  }
}

async function updateVisionMission(id, updates) {
  const { data, error } = await supabaseDb.from('about_vision_mission')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();
  if (error) { console.error('Error updating vision/mission:', error); return null; }
  await readAllVisionMission();
  return data?.[0];
}

async function deleteVisionMission(id) {
  try {
    if (typeof supabaseDb !== 'undefined' && supabaseDb) {
      await supabaseDb.from('about_vision_mission').delete().eq('id', id);
    }
  } catch (err) { console.warn('DB delete exception for vision/mission:', err); }
  fallbackDeleteFromCache('vision_mission', id);
  await readAllVisionMission();
  return true;
}

// ─ ERA CARDS CRUD & RENDERING ─
async function createEraCard(icon_emoji, era_badge, era_title, era_description, display_order = 0) {
  let result = null;
  try {
    if (typeof supabaseDb !== 'undefined' && supabaseDb) {
      const { data, error } = await supabaseDb.from('about_era_cards').insert([{
        icon_emoji, era_badge, era_title, era_description, display_order, is_active: true
      }]).select();
      if (!error && data && data.length > 0) result = data[0];
      if (error) console.error('Error creating era card in DB:', error);
    }
  } catch (e) { console.warn('DB error in createEraCard:', e); }

  if (!result) {
    let eras = [];
    try { eras = JSON.parse(localStorage.getItem('about_era_cards') || '[]'); } catch (e) { eras = []; }
    result = { id: 'local-' + Date.now(), icon_emoji, era_badge, era_title, era_description, display_order, is_active: true };
    eras.push(result);
    localStorage.setItem('about_era_cards', JSON.stringify(eras));
  }
  await readAllEraCards();
  return result;
}

async function readAllEraCards() {
  return getFromDbOrCache('era_cards', supabaseDb.from('about_era_cards')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true }));
}

async function renderEraCards() {
  try {
    const eras = await readAllEraCards();
    const eraGrid = document.querySelector('.history-era-grid');
    if (!eraGrid) return;
    if (eras && eras.length > 0) {
      eraGrid.innerHTML = eras.map(era => {
        const title = era.era_title || era.name || era.title || 'Untitled Era';
        const badge = era.era_badge || era.duration || era.badge || 'Time Period';
        const icon = era.icon_emoji || era.icon || '🌱';
        const desc = era.era_description || era.description || '';
        return `
        <div class="era-card">
          <div class="era-icon">${icon}</div>
          <span class="era-badge">${badge}</span>
          <h4>${title}</h4>
          <p style="margin-bottom:0px;">${desc}</p>
        </div>
      `}).join('');
    }
  } catch (err) {
    console.error('Error rendering era cards:', err);
  }
}

async function updateEraCard(id, updates) {
  let result = null;
  try {
    if (typeof supabaseDb !== 'undefined' && supabaseDb) {
      const { data, error } = await supabaseDb.from('about_era_cards')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select();
      if (!error && data && data.length > 0) result = data[0];
      if (error) console.error('Error updating era card in DB:', error);
    }
  } catch (e) { console.warn('DB error in updateEraCard:', e); }

  if (!result) {
    let eras = [];
    try { eras = JSON.parse(localStorage.getItem('about_era_cards') || '[]'); } catch (e) { eras = []; }
    const idx = eras.findIndex(item => String(item.id) === String(id));
    if (idx > -1) {
      eras[idx] = { ...eras[idx], ...updates };
      result = eras[idx];
    }
    localStorage.setItem('about_era_cards', JSON.stringify(eras));
  }
  await readAllEraCards();
  return result;
}

async function deleteEraCard(id) {
  try {
    if (typeof supabaseDb !== 'undefined' && supabaseDb) {
      await supabaseDb.from('about_era_cards').delete().eq('id', id);
    }
  } catch (err) { console.warn('DB delete exception for era card:', err); }
  fallbackDeleteFromCache('era_cards', id);
  await readAllEraCards();
  return true;
}

// ─ HERO CRUD & RENDERING ─
async function createAboutHero(hero_title, hero_subtitle, hero_description, primary_button_text, primary_button_link, secondary_button_text, secondary_button_link, background_image_url, is_active = true) {
  const { data, error } = await supabaseDb.from('about_hero').insert([{
    hero_title, hero_subtitle, hero_description, primary_button_text, primary_button_link, secondary_button_text, secondary_button_link, background_image_url, is_active
  }]).select();
  if (error) { console.error('Error creating hero:', error); return null; }
  await readAllAboutHero();
  return data?.[0];
}

async function readAllAboutHero() {
  return getFromDbOrCache('hero', supabaseDb.from('about_hero')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1));
}

async function renderAboutHero() {
  try {
    const heroes = await readAllAboutHero();
    if (!heroes || heroes.length === 0) return;
    const hero = heroes[0];
    const titleEl = document.getElementById('aboutHeroTitle');
    const subtitleEl = document.getElementById('aboutHeroSubtitle');
    if (titleEl) titleEl.innerText = hero.hero_title || 'About Our School';
    if (subtitleEl) subtitleEl.innerText = hero.hero_subtitle || hero.hero_description || '';
    
    let url = hero.background_image_url || '../images/img.jpg';
    try {
      if (typeof supabaseDb !== 'undefined' && supabaseDb) {
         try {
           const {data} = await supabaseDb.from('school_settings').select('setting_value').eq('setting_key', 'about_main_image').single();
           if (data && data.setting_value) {
             url = (typeof data.setting_value === 'string') ? data.setting_value : (data.setting_value.url || data.setting_value.value || url);
           }
         } catch (e) {
           // Fallback to legacy table name if it exists
           try {
             const {data} = await supabaseDb.from('website_settings').select('value').eq('key', 'about_main_image').single();
             if (data && data.value) url = data.value;
           } catch (e2) { /* ignore */ }
         }
      } else {
         const localUrl = localStorage.getItem('generic_module_Settings_about_main_image');
         if (localUrl) url = localUrl;
      }
    } catch(e) { }

    const heroSec = document.querySelector('.about-hero');
    if (heroSec && url) {
      heroSec.style.backgroundImage = `linear-gradient(to bottom, rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.9)), url('${url}')`;
    }
  } catch (error) {
    console.error('Error rendering about hero:', error);
  }
}

async function updateAboutHero(id, updates) {
  const { data, error } = await supabaseDb.from('about_hero')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();
  if (error) { console.error('Error updating hero:', error); return null; }
  await readAllAboutHero();
  return data?.[0];
}

async function deleteAboutHero(id) {
  try {
    if (typeof supabaseDb !== 'undefined' && supabaseDb) {
      await supabaseDb.from('about_hero').delete().eq('id', id);
    }
  } catch (err) { console.warn('DB delete exception for hero:', err); }
  fallbackDeleteFromCache('hero', id);
  await readAllAboutHero();
  return true;
}

// ─ STORY CRUD & RENDERING ─
async function createStory(story_subtitle, story_title, story_paragraph1, story_paragraph2, story_visual_image, story_values_list, display_order = 0) {
  const { data, error } = await supabaseDb.from('about_story').insert([{
    story_subtitle, story_title, story_paragraph1, story_paragraph2, story_visual_image, story_values_list, display_order, is_active: true
  }]).select();
  if (error) { console.error('Error creating story:', error); return null; }
  await readAllStory();
  return data?.[0];
}

async function readAllStory() {
  return getFromDbOrCache('story', supabaseDb.from('about_story')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true }));
}

async function renderStory() {
  try {
    const stories = await readAllStory();
    const container = document.getElementById('storyContainer');
    if (!container) return;

    if (!stories || stories.length === 0) {
      console.info('renderStory: no stories found');
      return;
    }

    const story = stories[0];
    const values = safeParseArray(story.story_values_list);

    container.innerHTML = `
      <div class="story-grid">
        <div class="story-visual">
          <div class="story-visual-frame">
            <img src="${story.story_visual_image || '../images/img.jpg'}" alt="${story.story_title || 'Story Visual'}" />
          </div>
        </div>
        <div class="story-text">
          <span class="about-subtitle">${story.story_subtitle || '— OUR LEGACY'}</span>
          <h3 class="about-title">${story.story_title || ''}</h3>
          <p>${story.story_paragraph1 || ''}</p>
          ${story.story_paragraph2 ? `<p>${story.story_paragraph2}</p>` : ''}
          ${values && values.length ? `<ul class="story-values-list">${values.map(v => `<li>${v}</li>`).join('')}</ul>` : ''}
        </div>
      </div>
    `;
  } catch (err) {
    console.error('Error rendering story:', err);
  }
}

async function updateStory(id, updates) {
  const { data, error } = await supabaseDb.from('about_story')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();
  if (error) { console.error('Error updating story:', error); return null; }
  await readAllStory();
  return data?.[0];
}

async function deleteStory(id) {
  try {
    if (typeof supabaseDb !== 'undefined' && supabaseDb) {
      await supabaseDb.from('about_story').delete().eq('id', id);
    }
  } catch (err) { console.warn('DB delete exception for story:', err); }
  fallbackDeleteFromCache('story', id);
  await readAllStory();
  return true;
}

// ─ TIMELINE CRUD & RENDERING ─
async function createTimelineItem(icon_emoji, timeline_date, timeline_title, timeline_description, timeline_position, display_order = 0) {
  const { data, error } = await supabaseDb.from('about_timeline').insert([{
    icon_emoji, timeline_date, timeline_title, timeline_description, timeline_position, display_order, is_active: true
  }]).select();
  if (error) { console.error('Error creating timeline:', error); return null; }
  await renderTimeline();
  return data?.[0];
}

async function readAllTimeline() {
  return getFromDbOrCache('timeline', supabaseDb.from('about_timeline')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('timeline_date', { ascending: true }));
}

async function renderTimeline() {
  try {
    const items = await readAllTimeline();
    const wrapper = document.querySelector('.timeline-wrapper');
    if (!wrapper) return;
    
    wrapper.innerHTML = `
      <div class="timeline-line"></div>
      ${items.map(item => `
        <div class="timeline-item ${item.timeline_position}" data-timeline-id="${item.id}">
          <div class="timeline-badge">${item.icon_emoji}</div>
          <div class="timeline-card">
            <div class="timeline-date">${item.timeline_date}</div>
            <h4>${item.timeline_title}</h4>
            <p>${item.timeline_description}</p>
          </div>
        </div>
      `).join('')}
    `;
  } catch (error) {
    console.error('Error rendering timeline:', error);
  }
}

async function updateTimelineItem(id, updates) {
  const { data, error } = await supabaseDb.from('about_timeline')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();
  if (error) { console.error('Error updating timeline:', error); return null; }
  await renderTimeline();
  return data?.[0];
}

async function deleteTimelineItem(id) {
  try {
    if (typeof supabaseDb !== 'undefined' && supabaseDb) {
      await supabaseDb.from('about_timeline').delete().eq('id', id);
    }
  } catch (err) { console.warn('DB delete exception for timeline:', err); }
  fallbackDeleteFromCache('timeline', id);
  await renderTimeline();
  return true;
}

// ─ LEADERSHIP DESKS CRUD & RENDERING ─
async function createLeadershipDesk(leader_name, leader_role, leader_photo_url, leader_quote, leader_description, leader_signature_url = null, display_order = 0) {
  const { data, error } = await supabaseDb.from('about_leadership_desks').insert([{
    leader_name, leader_role, leader_photo_url, leader_quote, leader_description, leader_signature_url, display_order, is_active: true
  }]).select();
  if (error) { 
    console.warn('DB error, using cache fallback:', error); 
    let items = JSON.parse(localStorage.getItem('about_leadership_desks') || '[]');
    const newItem = { id: 'local-' + Date.now(), leader_name, leader_role, leader_photo_url, leader_quote, leader_description, leader_signature_url, display_order, is_active: true };
    items.push(newItem);
    localStorage.setItem('about_leadership_desks', JSON.stringify(items));
    ABOUT_FALLBACKS['leadership_desks'] = items;
    await renderLeadershipDesks();
    return newItem;
  }
  await renderLeadershipDesks();
  return data?.[0];
}

async function readAllLeadershipDesks() {
  return getFromDbOrCache('leadership_desks', supabaseDb.from('about_leadership_desks')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true }));
}

async function renderLeadershipDesks() {
  try {
    const leaders = await readAllLeadershipDesks();
    const container = document.querySelector('.leadership-grid');
    if (!container) return;
    
    container.innerHTML = leaders.map(leader => `
      <div class="leader-desk-card" data-leader-id="${leader.id}">
        <div class="leader-profile">
          <div class="leader-photo-wrap">
            <img src="${leader.leader_photo_url || 'https://via.placeholder.com/150'}" alt="${leader.leader_name}" />
          </div>
          <div class="leader-info">
            <h5>${leader.leader_name}</h5>
            <span>${leader.leader_role}</span>
          </div>
        </div>
        <div class="leader-quote">${leader.leader_quote}</div>
        <div class="leader-desc">${leader.leader_description}</div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error rendering leadership desks:', error);
  }
}

async function updateLeadershipDesk(id, updates) {
  const { data, error } = await supabaseDb.from('about_leadership_desks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();
  if (error) { 
    console.warn('DB update error, using cache fallback:', error); 
    let items = JSON.parse(localStorage.getItem('about_leadership_desks') || '[]');
    const idx = items.findIndex(i => String(i.id) === String(id));
    if (idx > -1) {
      items[idx] = { ...items[idx], ...updates };
    } else {
      items.push({ id, ...updates });
    }
    localStorage.setItem('about_leadership_desks', JSON.stringify(items));
    ABOUT_FALLBACKS['leadership_desks'] = items;
    await renderLeadershipDesks();
    return idx > -1 ? items[idx] : items[items.length - 1];
  }
  await renderLeadershipDesks();
  return data?.[0];
}

async function deleteLeadershipDesk(id) {
  try {
    if (typeof supabaseDb !== 'undefined' && supabaseDb) {
      await supabaseDb.from('about_leadership_desks').delete().eq('id', id);
    }
  } catch (err) { console.warn('DB delete exception for leadership desk:', err); }
  fallbackDeleteFromCache('leadership_desks', id);
  await renderLeadershipDesks();
  return true;
}

// ─ ADMIN TEAM CRUD & RENDERING ─
async function createAdminMember(member_name, member_role, member_department, member_photo_url = '', member_email = '', hierarchy_level = 0, reports_to_id = null, display_order = 0) {
  const { data, error } = await supabaseDb.from('about_admin_team').insert([{
    member_name, member_role, member_department, member_photo_url, member_email, reports_to_id, display_order, is_active: true
  }]).select();
  if (error) { 
    console.warn('DB error, using cache fallback:', error); 
    let items = JSON.parse(localStorage.getItem('about_admin_team') || '[]');
    const newItem = { 
      id: 'local-' + Date.now(), 
      member_name, 
      member_role, 
      member_department, 
      member_photo_url, 
      member_email, 
      hierarchy_level, 
      reports_to_id, 
      display_order, 
      is_active: true 
    };
    items.push(newItem);
    localStorage.setItem('about_admin_team', JSON.stringify(items));
    ABOUT_FALLBACKS['admin_team'] = items;
    await renderAdminTeam();
    return newItem;
  }
  await renderAdminTeam();
  return data?.[0];
}

async function readAllAdminTeam() {
  return getFromDbOrCache('admin_team', supabaseDb.from('about_admin_team')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true }));
}

async function renderAdminTeam() {
  try {
    const members = await readAllAdminTeam();
    const container = document.querySelector('.admin-team-grid');
    if (!container) return;
    
    container.innerHTML = members.map(member => `
      <div class="admin-member-card" data-member-id="${member.id}">
        <div class="admin-photo-container">
          <div class="admin-photo-inner">
            <img src="${member.member_photo_url || '../images/logo.png'}" alt="${member.member_name}" />
          </div>
        </div>
        <h4>${member.member_name}</h4>
        <span class="role">${member.member_role}</span>
        <div class="dept">${member.member_department}</div>
        <div class="admin-socials">
          ${member.member_email ? `<a href="mailto:${member.member_email}" class="admin-social-btn">✉️</a>` : ''}
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error rendering admin team:', error);
  }
}

async function updateAdminMember(id, updates) {
  const { data, error } = await supabaseDb.from('about_admin_team')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();
  if (error) { 
    console.warn('DB update error, using cache fallback:', error);
    let items = JSON.parse(localStorage.getItem('about_admin_team') || '[]');
    const idx = items.findIndex(i => String(i.id) === String(id));
    if (idx > -1) {
      items[idx] = { ...items[idx], ...updates };
    } else {
      items.push({ id, ...updates });
    }
    localStorage.setItem('about_admin_team', JSON.stringify(items));
    ABOUT_FALLBACKS['admin_team'] = items;
    await renderAdminTeam();
    return idx > -1 ? items[idx] : items[items.length - 1];
  }
  await renderAdminTeam();
  return data?.[0];
}

async function deleteAdminMember(id) {
  try {
    if (typeof supabaseDb !== 'undefined' && supabaseDb) {
      await supabaseDb.from('about_admin_team').delete().eq('id', id);
    }
  } catch (err) { console.warn('DB delete exception for admin member:', err); }
  fallbackDeleteFromCache('admin_team', id);
  await renderAdminTeam();
  return true;
}

// ─ PRINCIPALS TREE CRUD & RENDERING ─
async function createPrincipal(name, tenure, description, image_url = '', order_index = 0, is_current = false) {
  const { data, error } = await supabaseDb.from('principals_legacy').insert([{
    name, tenure, description, image_url, order_index, is_current
  }]).select();
  if (error) { 
    console.error('Error creating principal:', error); 
    let items = JSON.parse(localStorage.getItem('about_principals_legacy') || '[]');
    const newItem = { id: 'local-' + Date.now(), name, tenure, description, image_url, order_index, is_current };
    items.push(newItem);
    localStorage.setItem('about_principals_legacy', JSON.stringify(items));
    if (ABOUT_FALLBACKS['principals_legacy']) ABOUT_FALLBACKS['principals_legacy'] = items;
    await renderPrincipalsTree();
    return newItem;
  }
  await renderPrincipalsTree();
  return data?.[0];
}

async function readAllPrincipals() {
  return getFromDbOrCache('principals_legacy', supabaseDb.from('principals_legacy')
    .select('*')
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true }));
}

async function renderPrincipalsTree() {
  try {
    const principals = await readAllPrincipals();
    const wrapper = document.getElementById('principals-legacy-tree-wrapper');
    if (!wrapper) return;
    
    let html = '<div class="tree-trunk"></div>';
    principals.forEach((item, index) => {
      const position = index % 2 === 0 ? 'left' : 'right';
      const stepNumber = String(index + 1).padStart(2, '0');
      html += `
        <div class="tree-node ${position}" data-step="${stepNumber}">
          <div class="tree-photo">
            <img src="${item.image_url || 'https://via.placeholder.com/150'}" alt="${item.name} Portrait" />
          </div>
          <div class="tree-card">
            <span class="tree-date">${item.tenure}</span>
            <h4>${item.name}</h4>
            <p>${item.description || ''}</p>
          </div>
        </div>
      `;
    });
    wrapper.innerHTML = html;
  } catch (error) {
    console.error('Error rendering principals tree:', error);
  }
}

async function updatePrincipal(id, updates) {
  const mappedUpdates = { ...updates };
  if (updates.principal_name !== undefined) mappedUpdates.name = updates.principal_name;
  if (updates.principal_description !== undefined) mappedUpdates.description = updates.principal_description;
  if (updates.principal_photo_url !== undefined) mappedUpdates.image_url = updates.principal_photo_url;
  
  delete mappedUpdates.principal_name;
  delete mappedUpdates.principal_description;
  delete mappedUpdates.principal_photo_url;

  const { data, error } = await supabaseDb.from('principals_legacy')
    .update({ ...mappedUpdates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();
  if (error) { 
    console.error('Error updating principal:', error); 
    // Fallback
    let items = JSON.parse(localStorage.getItem('about_principals_legacy') || '[]');
    const idx = items.findIndex(i => String(i.id) === String(id));
    if (idx > -1) {
      items[idx] = { 
        ...items[idx], 
        ...mappedUpdates, 
        _dirty: true 
      };
      localStorage.setItem('about_principals_legacy', JSON.stringify(items));
      if (ABOUT_FALLBACKS['principals_legacy']) ABOUT_FALLBACKS['principals_legacy'] = items;
    }
    await renderPrincipalsTree();
    return items[idx];
  }
  await renderPrincipalsTree();
  return data?.[0];
}

async function deletePrincipal(id) {
  try {
    if (typeof supabaseDb !== 'undefined' && supabaseDb) {
      const { error } = await supabaseDb.from('principals_legacy').delete().eq('id', id);
      if (error) console.warn('DB delete error for principal:', error);
    }
  } catch (err) {
    console.warn('Exception deleting principal from DB:', err);
  }
  fallbackDeleteFromCache('principals_legacy', id);
  await renderPrincipalsTree();
  return true;
}

// ─ TECHNICAL INCHARGE CRUD & RENDERING ─
async function createTechnicalIncharge(incharge_name, tenure, incharge_description, incharge_photo_url = '', display_order = 1, is_active = true) {
  const payload = {
    name: incharge_name,
    tenure,
    description: incharge_description,
    image_url: incharge_photo_url,
    order_index: display_order,
    is_current: is_active
  };
  const { data, error } = await supabaseDb.from('technical_legacy').insert([payload]).select();
  if (error) { 
    console.error('Error creating tech incharge:', error); 
    // Fallback
    let items = JSON.parse(localStorage.getItem('about_technical_legacy') || '[]');
    const newItem = { id: 'local-' + Date.now(), ...payload };
    items.push(newItem);
    localStorage.setItem('about_technical_legacy', JSON.stringify(items));
    if (ABOUT_FALLBACKS['technical_legacy']) ABOUT_FALLBACKS['technical_legacy'] = items;
    await renderTechnicalTree();
    return newItem;
  }
  await renderTechnicalTree();
  return data?.[0];
}

async function readAllTechnicalIncharge() {
  return getFromDbOrCache('technical_legacy', supabaseDb.from('technical_legacy')
    .select('*')
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true }));
}

async function renderTechnicalTree() {
  try {
    const tech = await readAllTechnicalIncharge();
    const wrapper = document.getElementById('technical-legacy-tree-wrapper');
    if (!wrapper) return;
    
    let html = '<div class="tree-trunk" style="background: linear-gradient(to bottom, var(--accent) 0%, var(--primary) 100%);"></div>';
    tech.forEach((item, index) => {
      const position = index % 2 === 0 ? 'left' : 'right';
      const stepNumber = String(index + 1).padStart(2, '0');
      html += `
        <div class="tree-node ${position}" data-step="${stepNumber}">
          <div class="tree-photo" style="border-color: var(--accent);">
            <img src="${item.image_url || 'https://via.placeholder.com/150'}" alt="${item.name} Portrait" />
          </div>
          <div class="tree-card" style="background: var(--white);">
            <span class="tree-date" style="background: var(--accent);">${item.tenure}</span>
            <h4>${item.name}</h4>
            <p>${item.description || ''}</p>
          </div>
        </div>
      `;
    });
    wrapper.innerHTML = html;
  } catch (error) {
    console.error('Error rendering technical tree:', error);
  }
}

async function updateTechnicalIncharge(id, updates) {
  const mappedUpdates = { ...updates };
  if (updates.incharge_name !== undefined) mappedUpdates.name = updates.incharge_name;
  if (updates.incharge_description !== undefined) mappedUpdates.description = updates.incharge_description;
  if (updates.incharge_photo_url !== undefined) mappedUpdates.image_url = updates.incharge_photo_url;
  if (updates.display_order !== undefined) mappedUpdates.order_index = updates.display_order;
  if (updates.is_active !== undefined) mappedUpdates.is_current = updates.is_active;

  delete mappedUpdates.incharge_name;
  delete mappedUpdates.incharge_description;
  delete mappedUpdates.incharge_photo_url;
  delete mappedUpdates.display_order;
  delete mappedUpdates.is_active;

  const { data, error } = await supabaseDb.from('technical_legacy')
    .update({ ...mappedUpdates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();
  if (error) { 
    console.error('Error updating tech incharge:', error); 
    // Fallback
    let items = JSON.parse(localStorage.getItem('about_technical_legacy') || '[]');
    const idx = items.findIndex(i => String(i.id) === String(id));
    if (idx > -1) {
      items[idx] = { ...items[idx], ...mappedUpdates, _dirty: true };
      localStorage.setItem('about_technical_legacy', JSON.stringify(items));
      if (ABOUT_FALLBACKS['technical_legacy']) ABOUT_FALLBACKS['technical_legacy'] = items;
    }
    await renderTechnicalTree();
    return items[idx];
  }
  await renderTechnicalTree();
  return data?.[0];
}

async function deleteTechnicalIncharge(id) {
  try {
    if (typeof supabaseDb !== 'undefined' && supabaseDb) {
      const { error } = await supabaseDb.from('technical_legacy').delete().eq('id', id);
      if (error) console.warn('DB delete error for tech incharge:', error);
    }
  } catch (err) {
    console.warn('Exception deleting tech incharge from DB:', err);
  }
  fallbackDeleteFromCache('technical_legacy', id);
  await renderTechnicalTree();
  return true;
}

// ─ PRIMARY INCHARGE CRUD & RENDERING ─
async function createPrimaryIncharge(name, tenure, description, image_url = '', order_index = 0) {
  const { data, error } = await supabaseDb.from('primary_legacy').insert([{
    name, tenure, description, image_url, order_index
  }]).select();
  if (error) { 
    console.error('Error creating primary incharge:', error); 
    let items = JSON.parse(localStorage.getItem('about_primary_legacy') || '[]');
    const newItem = { id: 'local-' + Date.now(), name, tenure, description, image_url, order_index };
    items.push(newItem);
    localStorage.setItem('about_primary_legacy', JSON.stringify(items));
    if (ABOUT_FALLBACKS['primary_legacy']) ABOUT_FALLBACKS['primary_legacy'] = items;
    await renderPrimaryTree();
    return newItem;
  }
  await renderPrimaryTree();
  return data?.[0];
}

async function readAllPrimaryIncharge() {
  return getFromDbOrCache('primary_legacy', supabaseDb.from('primary_legacy')
    .select('*')
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true }));
}

async function renderPrimaryTree() {
  try {
    const primary = await readAllPrimaryIncharge();
    const wrapper = document.getElementById('primary-legacy-tree-wrapper');
    if (!wrapper) return;
    
    let html = '<div class="tree-trunk" style="background: linear-gradient(to bottom, #2ecc71 0%, var(--primary) 100%);"></div>';
    primary.forEach((item, index) => {
      const position = index % 2 === 0 ? 'left' : 'right';
      const stepNumber = String(index + 1).padStart(2, '0');
      html += `
        <div class="tree-node ${position}" data-step="${stepNumber}">
          <div class="tree-photo" style="border-color: #2ecc71;">
            <img src="${item.image_url || 'https://via.placeholder.com/150'}" alt="${item.name} Portrait" />
          </div>
          <div class="tree-card" style="background: #f8fafc;">
            <span class="tree-date" style="background: #2ecc71;">${item.tenure}</span>
            <h4>${item.name}</h4>
            <p>${item.description || ''}</p>
          </div>
        </div>
      `;
    });
    wrapper.innerHTML = html;
  } catch (error) {
    console.error('Error rendering primary tree:', error);
  }
}

async function updatePrimaryIncharge(id, updates) {
  const { data, error } = await supabaseDb.from('primary_legacy')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();
  if (error) { 
    console.error('Error updating primary incharge:', error); 
    let items = JSON.parse(localStorage.getItem('about_primary_legacy') || '[]');
    const idx = items.findIndex(i => String(i.id) === String(id));
    if (idx > -1) {
      items[idx] = { ...items[idx], ...updates };
      localStorage.setItem('about_primary_legacy', JSON.stringify(items));
      if (ABOUT_FALLBACKS['primary_legacy']) ABOUT_FALLBACKS['primary_legacy'] = items;
    }
    await renderPrimaryTree();
    return items[idx];
  }
  await renderPrimaryTree();
  return data?.[0];
}

async function deletePrimaryIncharge(id) {
  try {
    if (typeof supabaseDb !== 'undefined' && supabaseDb) {
      await supabaseDb.from('primary_legacy').delete().eq('id', id);
    }
  } catch (err) { console.warn('DB delete exception for primary incharge:', err); }
  fallbackDeleteFromCache('primary_legacy', id);
  await renderPrimaryTree();
  return true;
}

// ─ ALUMNI CRUD & RENDERING ─
async function createAlumnus(alumni_name, alumni_batch_year, alumni_achievement, alumni_photo_url = '', alumni_current_position = '', display_order = 0) {
  const { data, error } = await supabaseDb.from('about_alumni').insert([{
    alumni_name, alumni_batch_year, alumni_achievement, alumni_photo_url, alumni_current_position, display_order, is_active: true
  }]).select();
  if (error) {
    console.warn('Supabase insert failed, falling back to local storage:', error.message);
    const newAlumnus = { id: 'local-' + Date.now(), alumni_name, alumni_batch_year, alumni_achievement, alumni_photo_url, alumni_current_position, display_order, is_active: true };
    const currentData = await readAllAlumni();
    const updatedData = [...currentData, newAlumnus];
    localStorage.setItem('about_alumni', JSON.stringify(updatedData));
    ABOUT_FALLBACKS['alumni'] = updatedData;
    await renderAlumniHighlights();
    return newAlumnus;
  }
  await renderAlumniHighlights();
  return data?.[0];
}

async function readAllAlumni() {
  return getFromDbOrCache('alumni', supabaseDb.from('about_alumni')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true }));
}

async function renderAlumniHighlights() {
  try {
    const alumni = await readAllAlumni();
    const container = document.querySelector('.alumni-grid');
    if (!container) return;

    if (!alumni || alumni.length === 0) {
      container.innerHTML = '<div class="about-empty-state">No alumni profiles available.</div>';
      return;
    }

    container.innerHTML = alumni.map(person => `
      <div class="alumni-card" data-alumni-id="${person.id}">
        <img src="${person.alumni_photo_url || 'https://via.placeholder.com/150'}" alt="${person.alumni_name}" class="alumni-photo" />
        <h4 class="alumni-name">${person.alumni_name}</h4>
        <div class="alumni-batch">${person.alumni_batch_year || person.alumni_current_position || ''}</div>
        <div class="alumni-gpa-wrap">
          <span class="alumni-gpa-label">Secured</span>
          <span class="alumni-gpa">${person.alumni_achievement || ''}</span>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error rendering alumni highlights:', err);
  }
}

async function updateAlumnus(id, updates) {
  const { data, error } = await supabaseDb.from('about_alumni')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();
  if (error) {
    console.warn('Supabase update failed, falling back to local storage:', error.message);
    const currentData = await readAllAlumni();
    const idx = currentData.findIndex(x => x.id == id);
    if (idx !== -1) {
      currentData[idx] = { ...currentData[idx], ...updates };
      localStorage.setItem('about_alumni', JSON.stringify(currentData));
      ABOUT_FALLBACKS['alumni'] = currentData;
    }
    await renderAlumniHighlights();
    return currentData[idx];
  }
  await renderAlumniHighlights();
  return data?.[0];
}

async function deleteAlumnus(id) {
  try {
    if (typeof supabaseDb !== 'undefined' && supabaseDb) {
      await supabaseDb.from('about_alumni').delete().eq('id', id);
    }
  } catch (err) { console.warn('DB delete exception for alumnus:', err); }
  fallbackDeleteFromCache('alumni', id);
  await renderAlumniHighlights();
  return true;
}

// ─ BLOG POSTS CRUD & RENDERING ─
async function createBlogPost(blog_title, blog_content, blog_excerpt, featured_image_url = '', author_name = '', display_order = 0) {
  const { data, error } = await supabaseDb.from('about_blogs').insert([{
    blog_title, blog_content, blog_excerpt, featured_image_url, author_name, display_order, is_active: true
  }]).select();
  if (error) {
    console.warn('Supabase insert failed, falling back to local storage:', error.message);
    const newBlog = { id: 'local-' + Date.now(), blog_title, blog_content, blog_excerpt, featured_image_url, author_name, display_order, is_active: true, published_date: new Date().toISOString() };
    const currentData = await readAllBlogs();
    const updatedData = [...currentData, newBlog];
    localStorage.setItem('about_blogs', JSON.stringify(updatedData));
    ABOUT_FALLBACKS['blogs'] = updatedData;
    await renderBlogs();
    return newBlog;
  }
  await renderBlogs();
  return data?.[0];
}

async function readAllBlogs() {
  return getFromDbOrCache('blogs', supabaseDb.from('about_blogs')
    .select('*')
    .eq('is_active', true)
    .order('published_date', { ascending: false }));
}

async function renderBlogs() {
  try {
    const blogs = await readAllBlogs();
    const container = document.querySelector('.premium-blog-grid') || document.querySelector('.blogs-grid');
    if (!container) return;
    
    if (!blogs || blogs.length === 0) {
      container.innerHTML = '<div class="about-empty-state">No news or articles available.</div>';
      return;
    }
    
    container.innerHTML = blogs.map(blog => {
      const dateStr = blog.published_date ? new Date(blog.published_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recent';
      const readTime = blog.read_time || '3 min read';
      const category = blog.badge || 'News';
      
      return `
        <div class="premium-blog-card" data-blog-id="${blog.id}">
          <div class="premium-blog-img-wrap">
            <span class="blog-badge">${category}</span>
            <img src="${blog.featured_image_url || 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=600'}" alt="${blog.blog_title}" />
          </div>
          <div class="premium-blog-content">
            <div class="premium-blog-meta">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-right:4px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span>${dateStr}</span>
              <span style="margin: 0 6px; color: rgba(148, 163, 184, 0.4);">•</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-right:4px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span>${readTime}</span>
            </div>
            <h4 class="premium-blog-title">${blog.blog_title}</h4>
            <p class="premium-blog-excerpt">${blog.blog_excerpt || ''}</p>
            <a href="blog.html?post=${blog.slug || blog.id}" class="premium-read-more">Read Full Article</a>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error rendering blogs:', error);
  }
}

async function updateBlogPost(id, updates) {
  const { data, error } = await supabaseDb.from('about_blogs')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();
  if (error) {
    console.warn('Supabase update failed, falling back to local storage:', error.message);
    const currentData = await readAllBlogs();
    const idx = currentData.findIndex(x => x.id == id);
    if (idx !== -1) {
      currentData[idx] = { ...currentData[idx], ...updates };
      localStorage.setItem('about_blogs', JSON.stringify(currentData));
      ABOUT_FALLBACKS['blogs'] = currentData;
    }
    await renderBlogs();
    return currentData[idx];
  }
  await renderBlogs();
  return data?.[0];
}

async function deleteBlogPost(id) {
  try {
    if (typeof supabaseDb !== 'undefined' && supabaseDb) {
      await supabaseDb.from('about_blogs').delete().eq('id', id);
    }
  } catch (err) { console.warn('DB delete exception for blog post:', err); }
  fallbackDeleteFromCache('blogs', id);
  await renderBlogs();
  return true;
}

// ─ COMPATIBILITY ALIASES ─
const createTimeline = createTimelineItem;
const updateTimeline = updateTimelineItem;
const deleteTimeline = deleteTimelineItem;
const createAdminTeamMember = createAdminMember;
const updateAdminTeamMember = updateAdminMember;
const deleteAdminTeamMember = deleteAdminMember;

// ─ HELPER FUNCTIONS ─
function isAdminUser() {
  const currentUserRole = localStorage.getItem('currentUserRole');
  return currentUserRole === 'admin' || currentUserRole === 'staff';
}

// ─ BULK LOAD ALL ABOUT DATA ─
async function loadAllAboutData() {
  console.log('Loading all about page data from Supabase...');
  const safe = (label, fn) => fn().catch(e => console.warn('[about] ' + label + ' skipped:', e.message || e));
  await Promise.all([
    safe('stats', readAllAboutStats),
    safe('vision_mission', readAllVisionMission),
    safe('era_cards', readAllEraCards),
    safe('hero', readAllAboutHero),
    safe('story', readAllStory),
    safe('timeline', readAllTimeline),
    safe('admin_team', readAllAdminTeam),
    safe('principals', readAllPrincipals),
    safe('technical_incharge', readAllTechnicalIncharge),
    safe('primary_incharge', readAllPrimaryIncharge),
    safe('leadership_desks', readAllLeadershipDesks),
    safe('alumni', readAllAlumni),
    safe('blogs', readAllBlogs)
  ]);
  console.log('About page data loaded and cached in localStorage');
}

// ====================================================================
// EXPORT FUNCTIONS TO WINDOW OBJECT FOR GLOBAL ACCESS
// ====================================================================
window.ABOUT_FALLBACKS = ABOUT_FALLBACKS;
window.safeParseArray = safeParseArray;

window.createAboutStat = createAboutStat;
window.readAllAboutStats = readAllAboutStats;
window.renderAboutStats = renderAboutStats;
window.updateAboutStat = updateAboutStat;
window.deleteAboutStat = deleteAboutStat;

window.createVisionMission = createVisionMission;
window.readAllVisionMission = readAllVisionMission;
window.renderVisionMission = renderVisionMission;
window.updateVisionMission = updateVisionMission;
window.deleteVisionMission = deleteVisionMission;

window.createEraCard = createEraCard;
window.readAllEraCards = readAllEraCards;
window.renderEraCards = renderEraCards;
window.updateEraCard = updateEraCard;
window.deleteEraCard = deleteEraCard;

window.createAboutHero = createAboutHero;
window.readAllAboutHero = readAllAboutHero;
window.renderAboutHero = renderAboutHero;
window.updateAboutHero = updateAboutHero;
window.deleteAboutHero = deleteAboutHero;

window.createStory = createStory;
window.readAllStory = readAllStory;
window.renderStory = renderStory;
window.updateStory = updateStory;
window.deleteStory = deleteStory;

window.createTimelineItem = createTimelineItem;
window.readAllTimeline = readAllTimeline;
window.renderTimeline = renderTimeline;
window.updateTimelineItem = updateTimelineItem;
window.deleteTimelineItem = deleteTimelineItem;

window.createLeadershipDesk = createLeadershipDesk;
window.readAllLeadershipDesks = readAllLeadershipDesks;
window.renderLeadershipDesks = renderLeadershipDesks;
window.updateLeadershipDesk = updateLeadershipDesk;
window.deleteLeadershipDesk = deleteLeadershipDesk;

window.createAdminMember = createAdminMember;
window.readAllAdminTeam = readAllAdminTeam;
window.renderAdminTeam = renderAdminTeam;
window.updateAdminMember = updateAdminMember;
window.deleteAdminMember = deleteAdminMember;

window.createAdminMember_REAL = createAdminMember;
window.readAllAdminTeam_REAL = readAllAdminTeam;
window.deleteAdminMember_REAL = deleteAdminMember;

window.createPrincipal = createPrincipal;
window.readAllPrincipals = readAllPrincipals;
window.renderPrincipalsTree = renderPrincipalsTree;
window.updatePrincipal = updatePrincipal;
window.deletePrincipal = deletePrincipal;

window.createTechnicalIncharge = createTechnicalIncharge;
window.readAllTechnicalIncharge = readAllTechnicalIncharge;
window.renderTechnicalTree = renderTechnicalTree;
window.updateTechnicalIncharge = updateTechnicalIncharge;
window.deleteTechnicalIncharge = deleteTechnicalIncharge;

window.createPrimaryIncharge = createPrimaryIncharge;
window.readAllPrimaryIncharge = readAllPrimaryIncharge;
window.renderPrimaryTree = renderPrimaryTree;
window.updatePrimaryIncharge = updatePrimaryIncharge;
window.deletePrimaryIncharge = deletePrimaryIncharge;

window.createAlumnus = createAlumnus;
window.readAllAlumni = readAllAlumni;
window.renderAlumniHighlights = renderAlumniHighlights;
window.updateAlumnus = updateAlumnus;
window.deleteAlumnus = deleteAlumnus;

window.createBlogPost = createBlogPost;
window.readAllBlogs = readAllBlogs;
window.renderBlogs = renderBlogs;
window.renderAboutBlogs = renderBlogs; // Alias for index/about script compatibility
window.updateBlogPost = updateBlogPost;
window.deleteBlogPost = deleteBlogPost;

window.loadAllAboutData = loadAllAboutData;

console.log('✓ Next-Level About-data.js functions exported to window object');
