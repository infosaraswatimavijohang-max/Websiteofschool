const fs = require('fs');

// 1. Read about-data.js and COMPLETE_ABOUT_CRUD_FUNCTIONS.js
const about = fs.readFileSync('js/about-data.js', 'utf8');
const complete = fs.readFileSync('docs/COMPLETE_ABOUT_CRUD_FUNCTIONS.js', 'utf8');

// 2. Extract sections from about-data.js
// We keep lines before '// ─ TIMELINE CRUD ─'
const split1 = about.split('// ─ TIMELINE CRUD ─');
const part1 = split1[0];

// We need to extract Technical and Primary Incharge
const split2 = about.split('// ─ TECHNICAL INCHARGE CRUD ─');
let part2 = '';
if (split2.length > 1) {
  // Extract up to the window exports block
  const split3 = split2[1].split('window.createPrincipal = createPrincipal;');
  part2 = '// ─ TECHNICAL INCHARGE CRUD ─\n' + split3[0];
}

// 3. Generate Hero and Story CRUD functions
const heroStory = `
// ─ HERO CRUD ─
async function createAboutHero(hero_title, hero_subtitle, hero_description, primary_button_text, primary_button_link, secondary_button_text, secondary_button_link, background_image_url, is_active = true) {
  const { data, error } = await supabaseDb.from('about_hero').insert([{
    hero_title, hero_subtitle, hero_description, primary_button_text, primary_button_link, secondary_button_text, secondary_button_link, background_image_url, is_active
  }]).select();
  if (error) { console.error('Error creating hero:', error); return null; }
  return data?.[0];
}

async function readAllAboutHero() {
  const { data, error } = await supabaseDb.from('about_hero').select('*').order('created_at', { ascending: false }).limit(1);
  if (error) { console.warn('Error reading hero (table may not exist):', error.message || error); const cached = localStorage.getItem('about_hero'); return cached ? JSON.parse(cached) : []; }
  localStorage.setItem('about_hero', JSON.stringify(data));
  return data;
}

async function updateAboutHero(id, updates) {
  const { data, error } = await supabaseDb.from('about_hero').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select();
  if (error) { console.error('Error updating hero:', error); return null; }
  return data?.[0];
}

async function deleteAboutHero(id) {
  const { error } = await supabaseDb.from('about_hero').delete().eq('id', id);
  if (error) { console.error('Error deleting hero:', error); return false; }
  return true;
}

// ─ STORY CRUD ─
async function createStory(story_subtitle, story_title, story_paragraph1, story_paragraph2, story_visual_image, story_values_list, display_order = 0) {
  const { data, error } = await supabaseDb.from('about_story').insert([{
    story_subtitle, story_title, story_paragraph1, story_paragraph2, story_visual_image, story_values_list, display_order, is_active: true
  }]).select();
  if (error) { console.error('Error creating story:', error); return null; }
  return data?.[0];
}

async function readAllStory() {
  const { data, error } = await supabaseDb.from('about_story').select('*').eq('is_active', true).order('display_order', { ascending: true });
  if (error) { console.warn('Error reading story (table may not exist):', error.message || error); const cached = localStorage.getItem('about_story'); return cached ? JSON.parse(cached) : []; }
  localStorage.setItem('about_story', JSON.stringify(data));
  return data;
}

async function updateStory(id, updates) {
  const { data, error } = await supabaseDb.from('about_story').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select();
  if (error) { console.error('Error updating story:', error); return null; }
  return data?.[0];
}

async function deleteStory(id) {
  const { error } = await supabaseDb.from('about_story').delete().eq('id', id);
  if (error) { console.error('Error deleting story:', error); return false; }
  return true;
}
`;

// 4. Update the COMPLETE_ABOUT_CRUD_FUNCTIONS to have the safe error fallback
let completeFixed = complete.replace(
  /catch \(\s*error\s*\) \{\s*console\.error\('Error reading (.+?)':,\s*error\);\s*return \[\];\s*\}/gm,
  (match, p1) => {
    let tableName = 'about_' + p1.replace(/\s+/g, '_').toLowerCase();
    if (p1 === 'timeline') tableName = 'about_timeline';
    if (p1 === 'leadership desks') tableName = 'about_leadership_desks';
    if (p1 === 'admin team') tableName = 'about_admin_team';
    if (p1 === 'principals') tableName = 'about_principals_tree';
    if (p1 === 'alumni') tableName = 'about_alumni';
    if (p1 === 'blogs') tableName = 'about_blogs';
    return "catch (error) {\\n    console.warn('Error reading " + p1 + " (table may not exist):', error.message || error);\\n    const cached = localStorage.getItem('" + tableName + "');\\n    return cached ? JSON.parse(cached) : [];\\n  }";
  }
);


// Remove the 'initializeAboutPageFull' stuff from complete
const splitComplete = completeFixed.split('// ─ COMPREHENSIVE INITIALIZATION ─');
const part3 = splitComplete[0];

// 5. Construct loadAllAboutData with safe wrapper
const loadAll = `
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
`;

// 6. Exports
const exportsCode = `
// ====================================================================
// EXPORT FUNCTIONS TO WINDOW OBJECT FOR GLOBAL ACCESS
// ====================================================================

window.createAboutStat = createAboutStat;
window.readAllAboutStats = readAllAboutStats;
window.updateAboutStat = updateAboutStat;
window.deleteAboutStat = deleteAboutStat;

window.createVisionMission = createVisionMission;
window.readAllVisionMission = readAllVisionMission;
window.updateVisionMission = updateVisionMission;
window.deleteVisionMission = deleteVisionMission;

window.createEraCard = createEraCard;
window.readAllEraCards = readAllEraCards;
window.updateEraCard = updateEraCard;
window.deleteEraCard = deleteEraCard;

window.createAboutHero = createAboutHero;
window.readAllAboutHero = readAllAboutHero;
window.updateAboutHero = updateAboutHero;
window.deleteAboutHero = deleteAboutHero;

window.createStory = createStory;
window.readAllStory = readAllStory;
window.updateStory = updateStory;
window.deleteStory = deleteStory;

window.createTimelineItem = createTimelineItem;
window.readAllTimeline = readAllTimeline;
window.updateTimelineItem = updateTimelineItem;
window.deleteTimelineItem = deleteTimelineItem;

window.createLeadershipDesk = createLeadershipDesk;
window.readAllLeadershipDesks = readAllLeadershipDesks;
window.updateLeadershipDesk = updateLeadershipDesk;
window.deleteLeadershipDesk = deleteLeadershipDesk;

window.createAdminMember = createAdminMember;
window.readAllAdminTeam = readAllAdminTeam;
window.updateAdminMember = updateAdminMember;
window.deleteAdminMember = deleteAdminMember;

window.createPrincipal = createPrincipal;
window.readAllPrincipals = readAllPrincipals;
window.updatePrincipal = updatePrincipal;
window.deletePrincipal = deletePrincipal;

window.createTechnicalIncharge = createTechnicalIncharge;
window.readAllTechnicalIncharge = readAllTechnicalIncharge;
window.updateTechnicalIncharge = updateTechnicalIncharge;
window.deleteTechnicalIncharge = deleteTechnicalIncharge;

window.createPrimaryIncharge = createPrimaryIncharge;
window.readAllPrimaryIncharge = readAllPrimaryIncharge;
window.updatePrimaryIncharge = updatePrimaryIncharge;
window.deletePrimaryIncharge = deletePrimaryIncharge;

window.createAlumnus = createAlumnus;
window.readAllAlumni = readAllAlumni;
window.updateAlumnus = updateAlumnus;
window.deleteAlumnus = deleteAlumnus;

window.createBlogPost = createBlogPost;
window.readAllBlogs = readAllBlogs;
window.updateBlogPost = updateBlogPost;
window.deleteBlogPost = deleteBlogPost;

window.loadAllAboutData = loadAllAboutData;

console.log('✓ About-data.js functions exported to window object');
`;


// 7. Combine everything
const finalCode = part1 + '\n' + heroStory + '\n' + part2 + '\n' + part3 + '\n' + loadAll + '\n' + exportsCode;
fs.writeFileSync('js/about-data.js', finalCode, 'utf8');
console.log('✅ Rebuilt about-data.js completely!');
