const fs = require('fs');

// ===== FIX 1: about-data.js =====
let about = fs.readFileSync('js/about-data.js', 'utf8');

// 1a. Make readAll* functions fall back to localStorage on error (for simple if-error patterns)
const simpleErrorTables = [
  ['about_vision_mission', 'vision/mission'],
  ['about_era_cards', 'era cards'],
  ['about_timeline', 'timeline'],
  ['about_technical_incharge_tree', 'technical incharge'],
  ['about_primary_incharge_tree', 'primary incharge'],
];
for (const [table, label] of simpleErrorTables) {
  const old = `if (error) { console.error('Error reading ${label}:', error); return []; }`;
  const nw  = `if (error) { console.warn('Error reading ${label} (table may not exist):', error.message || error); const cached = localStorage.getItem('${table}'); return cached ? JSON.parse(cached) : []; }`;
  about = about.split(old).join(nw);
}

// 1b. Make readAllLeadershipDesks, readAllAlumniHighlights, readAllAboutBlogs catch blocks fall back to localStorage
const catchTables = [
  ['about_leadership_desks', 'leadership desks'],
  ['about_alumni', 'alumni highlights'],
  ['about_blogs', 'blog posts'],
];
for (const [table, label] of catchTables) {
  const pattern = new RegExp(
    `catch\\s*\\(\\s*error\\s*\\)\\s*\\{\\s*console\\.error\\('Error reading ${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:',\\s*error\\);\\s*return\\s*\\[\\];\\s*\\}`,
    'gm'
  );
  const nw = `catch (error) {\n    console.warn('Error reading ${label} (table may not exist):', error.message || error);\n    const cached = localStorage.getItem('${table}');\n    return cached ? JSON.parse(cached) : [];\n  }`;
  about = about.replace(pattern, nw);
}

// 1c. Replace loadAllAboutData to wrap each call safely
const oldLoad = `async function loadAllAboutData() {
  console.log('Loading all about page data from Supabase...');
  await Promise.all([
    readAllAboutHero(),
    readAllAboutStats(),
    readAllStory(),
    readAllVisionMission(),
    readAllEraCards(),
    readAllTimeline(),
    readAllAdminTeam(),
    readAllPrincipals(),
    readAllTechnicalIncharge(),
    readAllPrimaryIncharge(),
    readAllLeadershipDesks(),
    readAllAlumniHighlights(),
    readAllAboutBlogs()
  ]);
  console.log('About page data loaded and cached in localStorage');
}`;

const newLoad = `async function loadAllAboutData() {
  console.log('Loading all about page data from Supabase...');
  const safe = (label, fn) => fn().catch(e => console.warn('[about] ' + label + ' skipped:', e.message || e));
  await Promise.all([
    safe('hero', readAllAboutHero),
    safe('stats', readAllAboutStats),
    safe('story', readAllStory),
    safe('vision_mission', readAllVisionMission),
    safe('era_cards', readAllEraCards),
    safe('timeline', readAllTimeline),
    safe('admin_team', readAllAdminTeam),
    safe('principals', readAllPrincipals),
    safe('technical_incharge', readAllTechnicalIncharge),
    safe('primary_incharge', readAllPrimaryIncharge),
    safe('leadership_desks', readAllLeadershipDesks),
    safe('alumni', readAllAlumniHighlights),
    safe('blogs', readAllAboutBlogs)
  ]);
  console.log('About page data loaded and cached in localStorage');
}`;

about = about.replace(oldLoad, newLoad);

fs.writeFileSync('js/about-data.js', about, 'utf8');
console.log('✅ about-data.js fixed');


// ===== FIX 2: supabase-client.js =====
let sc = fs.readFileSync('js/supabase-client.js', 'utf8');

// 2a. Add _safeFetch helper after the initialization block
const markerAfterInit = `console.error("Error initializing Supabase clients:", e);
}

// Helper to pull all tables`;

const markerReplacement = `console.error("Error initializing Supabase clients:", e);
}

// Safe query helper — wraps a single table fetch so 404/PGRST205 errors never
// propagate and never spam red console.error lines.
async function _safeFetch(label, fn) {
  try {
    await fn();
  } catch (e) {
    console.warn('[sync] ' + label + ' skipped (table may not exist):', e.message || e);
  }
}

// Helper to pull all tables`;

sc = sc.replace(markerAfterInit, markerReplacement);

// 2b. Wrap school_announcements sync in _safeFetch
const oldAnnounce = `    // 6. Announcements
    const { data: notices, error: noticeErr } = await supabaseDb.from('school_announcements').select('*');
    if (!noticeErr && notices) {
      localStorage.setItem('school_announcements', JSON.stringify(notices));
    }`;

const newAnnounce = `    // 6. Announcements
    await _safeFetch('school_announcements', async () => {
      const { data: notices, error: noticeErr } = await supabaseDb.from('school_announcements').select('*');
      if (!noticeErr && notices) {
        localStorage.setItem('school_announcements', JSON.stringify(notices));
      }
    });`;

sc = sc.replace(oldAnnounce, newAnnounce);

// 2c. Wrap approved_results sync in _safeFetch
const oldApproved = `    // 9. Approved Results
    const { data: approvedRes, error: appResErr } = await supabaseDb.from('approved_results').select('*');
    if (!appResErr && approvedRes) {`;

const newApproved = `    // 9. Approved Results
    await _safeFetch('approved_results', async () => {
      const { data: approvedRes, error: appResErr } = await supabaseDb.from('approved_results').select('*');
      if (!appResErr && approvedRes) {`;

sc = sc.replace(oldApproved, newApproved);

// Close the _safeFetch wrapper for approved_results
const oldApprovedEnd = `      localStorage.setItem('approved_results', JSON.stringify(mapped));
    }

    // 10. Admission Enquiries`;

const newApprovedEnd = `      localStorage.setItem('approved_results', JSON.stringify(mapped));
      }
    });

    // 10. Admission Enquiries`;

sc = sc.replace(oldApprovedEnd, newApprovedEnd);

// 2d. Fix getSchoolNotices to handle missing columns gracefully
const oldNotices = `async function getSchoolNotices(activeOnly = true) {
  try {
    let query = supabaseDb.from('school_announcements').select('*');
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    const { data, error } = await query.order('display_order', { ascending: true });
    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  } catch (e) {
    return { success: false, error: e.message };
  }
}`;

const newNotices = `async function getSchoolNotices(activeOnly = true) {
  try {
    // Try with is_active/display_order first; fall back to simple select if columns don't exist
    if (activeOnly) {
      try {
        const { data, error } = await supabaseDb.from('school_announcements').select('*').eq('is_active', true).order('display_order', { ascending: true });
        if (!error) return { success: true, data: data || [] };
      } catch (_) { /* fall through */ }
    }
    const { data, error } = await supabaseDb.from('school_announcements').select('*');
    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  } catch (e) {
    return { success: false, error: e.message };
  }
}`;

sc = sc.replace(oldNotices, newNotices);

fs.writeFileSync('js/supabase-client.js', sc, 'utf8');
console.log('✅ supabase-client.js fixed');
console.log('Done! Both files updated.');
