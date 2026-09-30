const fs = require('fs');

const path = 'c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/js/supabase-client.js';
let txt = fs.readFileSync(path, 'utf8');

const injectCode = `

// ====================================================================
// LOCALSTORAGE-TO-SUPABASE SYNC BRIDGE
// ====================================================================

// Override setItem to sync to database
const originalSetItem = Storage.prototype.setItem;
Storage.prototype.setItem = function(key, value) {
    originalSetItem.apply(this, [key, value]);
    if (window.supabaseDb && this === window.localStorage) {
        window.supabaseDb.from('generic_modules')
           .upsert({ module_name: key, json_data: value }, { onConflict: 'module_name' })
           .then(({error}) => { if(error) console.error("LocalStorage Sync Error (SET):", error); });
    }
};

// Override removeItem to sync to database
const originalRemoveItem = Storage.prototype.removeItem;
Storage.prototype.removeItem = function(key) {
    originalRemoveItem.apply(this, [key]);
    if (window.supabaseDb && this === window.localStorage) {
        window.supabaseDb.from('generic_modules')
           .delete().eq('module_name', key)
           .then(({error}) => { if(error) console.error("LocalStorage Sync Error (REMOVE):", error); });
    }
};

// Initial Sync from DB to LocalStorage
window.syncSupabaseToLocal = async function() {
    if (!window.supabaseDb) return;
    const { data, error } = await window.supabaseDb.from('generic_modules').select('*');
    if (!error && data) {
        data.forEach(row => {
            // Use originalSetItem to prevent triggering infinite loop of upserts
            originalSetItem.apply(window.localStorage, [row.module_name, row.json_data]);
        });
        console.log('✓ Successfully synced ' + data.length + ' modules from Supabase to LocalStorage');
    } else {
        console.error('Failed to sync Supabase to LocalStorage:', error);
    }
};

// Trigger sync immediately on script load
window.syncSupabaseToLocal();
`;

if (!txt.includes('LOCALSTORAGE-TO-SUPABASE SYNC BRIDGE')) {
    fs.appendFileSync(path, injectCode);
    console.log('Successfully injected sync bridge');
} else {
    console.log('Bridge already exists');
}
