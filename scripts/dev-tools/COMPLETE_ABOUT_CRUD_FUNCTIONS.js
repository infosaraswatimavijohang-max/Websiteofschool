// ════════════════════════════════════════════════════════════════════════════
// COMPLETE ABOUT PAGE CRUD FUNCTIONS - ADD TO about-data.js
// ════════════════════════════════════════════════════════════════════════════
// Copy these functions and append to your existing about-data.js file

// ─ TIMELINE CRUD & RENDERING ─
async function createTimelineItem(icon_emoji, timeline_date, timeline_title, timeline_description, timeline_position, display_order = 0) {
  try {
    const { data, error } = await supabaseDb.from('about_timeline').insert([{
      icon_emoji, timeline_date, timeline_title, timeline_description, timeline_position, display_order, is_active: true
    }]).select();
    if (error) throw error;
    await renderTimeline();
    return data?.[0];
  } catch (error) {
    console.error('Error creating timeline:', error);
    return null;
  }
}

async function readAllTimeline() {
  try {
    const { data, error } = await supabaseDb.from('about_timeline')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (error) throw error;
    localStorage.setItem('about_timeline', JSON.stringify(data || []));
    return data || [];
  } catch (error) {
    console.error('Error reading timeline:', error);
    return [];
  }
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
  try {
    const { data, error } = await supabaseDb.from('about_timeline')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    if (error) throw error;
    await renderTimeline();
    return data?.[0];
  } catch (error) {
    console.error('Error updating timeline:', error);
    return null;
  }
}

async function deleteTimelineItem(id) {
  try {
    const { error } = await supabaseDb.from('about_timeline').delete().eq('id', id);
    if (error) throw error;
    await renderTimeline();
    return true;
  } catch (error) {
    console.error('Error deleting timeline:', error);
    return false;
  }
}

// ─ LEADERSHIP DESKS CRUD & RENDERING ─
async function createLeadershipDesk(leader_name, leader_role, leader_photo_url, leader_quote, leader_description, leader_signature_url = null, display_order = 0) {
  try {
    const { data, error } = await supabaseDb.from('about_leadership_desks').insert([{
      leader_name, leader_role, leader_photo_url, leader_quote, leader_description, leader_signature_url, display_order, is_active: true
    }]).select();
    if (error) throw error;
    await renderLeadershipDesks();
    return data?.[0];
  } catch (error) {
    console.error('Error creating leadership desk:', error);
    return null;
  }
}

async function readAllLeadershipDesks() {
  try {
    const { data, error } = await supabaseDb.from('about_leadership_desks')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (error) throw error;
    localStorage.setItem('about_leadership_desks', JSON.stringify(data || []));
    return data || [];
  } catch (error) {
    console.error('Error reading leadership desks:', error);
    return [];
  }
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
            <img src="${leader.leader_photo_url}" alt="${leader.leader_name}" />
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
  try {
    const { data, error } = await supabaseDb.from('about_leadership_desks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    if (error) throw error;
    await renderLeadershipDesks();
    return data?.[0];
  } catch (error) {
    console.error('Error updating leadership desk:', error);
    return null;
  }
}

async function deleteLeadershipDesk(id) {
  try {
    const { error } = await supabaseDb.from('about_leadership_desks').delete().eq('id', id);
    if (error) throw error;
    await renderLeadershipDesks();
    return true;
  } catch (error) {
    console.error('Error deleting leadership desk:', error);
    return false;
  }
}

// ─ ADMIN TEAM CRUD & RENDERING ─
async function createAdminMember(member_name, member_role, member_department, member_photo_url = '', member_email = '', hierarchy_level = 0, reports_to_id = null, display_order = 0) {
  try {
    const { data, error } = await supabaseDb.from('about_admin_team').insert([{
      member_name, member_role, member_department, member_photo_url, member_email, hierarchy_level, reports_to_id, display_order, is_active: true
    }]).select();
    if (error) throw error;
    await renderAdminTeam();
    return data?.[0];
  } catch (error) {
    console.error('Error creating admin member:', error);
    return null;
  }
}

async function readAllAdminTeam() {
  try {
    const { data, error } = await supabaseDb.from('about_admin_team')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (error) throw error;
    localStorage.setItem('about_admin_team', JSON.stringify(data || []));
    return data || [];
  } catch (error) {
    console.error('Error reading admin team:', error);
    return [];
  }
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
            <img src="${member.member_photo_url || 'https://via.placeholder.com/150'}" alt="${member.member_name}" />
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
  try {
    const { data, error } = await supabaseDb.from('about_admin_team')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    if (error) throw error;
    await renderAdminTeam();
    return data?.[0];
  } catch (error) {
    console.error('Error updating admin member:', error);
    return null;
  }
}

async function deleteAdminMember(id) {
  try {
    const { error } = await supabaseDb.from('about_admin_team').delete().eq('id', id);
    if (error) throw error;
    await renderAdminTeam();
    return true;
  } catch (error) {
    console.error('Error deleting admin member:', error);
    return false;
  }
}

// ─ PRINCIPALS TREE CRUD & RENDERING ─
async function createPrincipal(principal_name, principal_tenure_start, principal_tenure_end, principal_description, principal_photo_url = '', tree_position, display_order = 0) {
  try {
    const { data, error } = await supabaseDb.from('about_principals_tree').insert([{
      principal_name, principal_tenure_start, principal_tenure_end, principal_description, principal_photo_url, tree_position, display_order, is_active: true
    }]).select();
    if (error) throw error;
    await renderPrincipalsTree();
    return data?.[0];
  } catch (error) {
    console.error('Error creating principal:', error);
    return null;
  }
}

async function readAllPrincipals() {
  try {
    const { data, error } = await supabaseDb.from('about_principals_tree')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (error) throw error;
    localStorage.setItem('about_principals_tree', JSON.stringify(data || []));
    return data || [];
  } catch (error) {
    console.error('Error reading principals:', error);
    return [];
  }
}

async function renderPrincipalsTree() {
  try {
    const principals = await readAllPrincipals();
    const wrapper = document.querySelector('#principals-legacy .tree-wrapper');
    if (!wrapper) return;
    
    wrapper.innerHTML = `
      <div class="tree-trunk"></div>
      ${principals.map(principal => `
        <div class="tree-node ${principal.tree_position}" data-principal-id="${principal.id}">
          <div class="tree-card">
            <div class="leader-photo-wrap">
              <img src="${principal.principal_photo_url}" alt="${principal.principal_name}" />
            </div>
            <h5>${principal.principal_name}</h5>
            <span>${principal.principal_tenure_start} - ${principal.principal_tenure_end}</span>
            <p>${principal.principal_description}</p>
          </div>
        </div>
      `).join('')}
    `;
  } catch (error) {
    console.error('Error rendering principals tree:', error);
  }
}

async function updatePrincipal(id, updates) {
  try {
    const { data, error } = await supabaseDb.from('about_principals_tree')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    if (error) throw error;
    await renderPrincipalsTree();
    return data?.[0];
  } catch (error) {
    console.error('Error updating principal:', error);
    return null;
  }
}

async function deletePrincipal(id) {
  try {
    const { error } = await supabaseDb.from('about_principals_tree').delete().eq('id', id);
    if (error) throw error;
    await renderPrincipalsTree();
    return true;
  } catch (error) {
    console.error('Error deleting principal:', error);
    return false;
  }
}

// ─ ALUMNI CRUD & RENDERING ─
async function createAlumnus(alumni_name, alumni_batch_year, alumni_achievement, alumni_photo_url = '', alumni_current_position = '', display_order = 0) {
  try {
    const { data, error } = await supabaseDb.from('about_alumni').insert([{
      alumni_name, alumni_batch_year, alumni_achievement, alumni_photo_url, alumni_current_position, display_order, is_active: true
    }]).select();
    if (error) throw error;
    await renderAlumni();
    return data?.[0];
  } catch (error) {
    console.error('Error creating alumnus:', error);
    return null;
  }
}

async function readAllAlumni() {
  try {
    const { data, error } = await supabaseDb.from('about_alumni')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (error) throw error;
    localStorage.setItem('about_alumni', JSON.stringify(data || []));
    return data || [];
  } catch (error) {
    console.error('Error reading alumni:', error);
    return [];
  }
}

async function renderAlumni() {
  try {
    const alumni = await readAllAlumni();
    const container = document.querySelector('.alumni-grid');
    if (!container) return;
    
    container.innerHTML = alumni.map(person => `
      <div class="alumni-card" data-alumni-id="${person.id}">
        <div class="alumni-photo">
          <img src="${person.alumni_photo_url}" alt="${person.alumni_name}" />
        </div>
        <h4>${person.alumni_name}</h4>
        <span class="batch">Batch: ${person.alumni_batch_year}</span>
        <span class="position">${person.alumni_current_position}</span>
        <p>${person.alumni_achievement}</p>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error rendering alumni:', error);
  }
}

async function updateAlumnus(id, updates) {
  try {
    const { data, error } = await supabaseDb.from('about_alumni')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    if (error) throw error;
    await renderAlumni();
    return data?.[0];
  } catch (error) {
    console.error('Error updating alumnus:', error);
    return null;
  }
}

async function deleteAlumnus(id) {
  try {
    const { error } = await supabaseDb.from('about_alumni').delete().eq('id', id);
    if (error) throw error;
    await renderAlumni();
    return true;
  } catch (error) {
    console.error('Error deleting alumnus:', error);
    return false;
  }
}

// ─ BLOG POSTS CRUD & RENDERING ─
async function createBlogPost(blog_title, blog_content, blog_excerpt, featured_image_url = '', author_name = '', display_order = 0) {
  try {
    const { data, error } = await supabaseDb.from('about_blogs').insert([{
      blog_title, blog_content, blog_excerpt, featured_image_url, author_name, display_order, is_active: true
    }]).select();
    if (error) throw error;
    await renderBlogs();
    return data?.[0];
  } catch (error) {
    console.error('Error creating blog post:', error);
    return null;
  }
}

async function readAllBlogs() {
  try {
    const { data, error } = await supabaseDb.from('about_blogs')
      .select('*')
      .eq('is_active', true)
      .order('published_date', { ascending: false });
    if (error) throw error;
    localStorage.setItem('about_blogs', JSON.stringify(data || []));
    return data || [];
  } catch (error) {
    console.error('Error reading blogs:', error);
    return [];
  }
}

async function renderBlogs() {
  try {
    const blogs = await readAllBlogs();
    const container = document.querySelector('.blogs-grid');
    if (!container) return;
    
    container.innerHTML = blogs.map(blog => `
      <div class="blog-card" data-blog-id="${blog.id}">
        <div class="blog-image">
          <img src="${blog.featured_image_url}" alt="${blog.blog_title}" />
        </div>
        <div class="blog-content">
          <h4>${blog.blog_title}</h4>
          <p class="excerpt">${blog.blog_excerpt}</p>
          <div class="blog-meta">
            <span class="author">By ${blog.author_name}</span>
            <span class="date">${new Date(blog.published_date).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error rendering blogs:', error);
  }
}

async function updateBlogPost(id, updates) {
  try {
    const { data, error } = await supabaseDb.from('about_blogs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    if (error) throw error;
    await renderBlogs();
    return data?.[0];
  } catch (error) {
    console.error('Error updating blog post:', error);
    return null;
  }
}

async function deleteBlogPost(id) {
  try {
    const { error } = await supabaseDb.from('about_blogs').delete().eq('id', id);
    if (error) throw error;
    await renderBlogs();
    return true;
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return false;
  }
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

// ─ COMPREHENSIVE INITIALIZATION ─
async function initializeAboutPageFull() {
  try {
    console.log('🚀 Initializing About page with all sections...');
    await Promise.all([
      renderAboutStats(),
      renderVisionMission(),
      renderEraCards(),
      renderTimeline(),
      renderLeadershipDesks(),
      renderAdminTeam(),
      renderPrincipalsTree(),
      renderAlumni(),
      renderBlogs()
    ]);
    console.log('✅ About page fully initialized!');
  } catch (error) {
    console.error('❌ Error initializing about page:', error);
  }
}

// Auto-initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAboutPageFull);
} else {
  initializeAboutPageFull();
}
