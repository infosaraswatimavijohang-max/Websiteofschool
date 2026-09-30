const { chromium } = require('playwright');

(async () => {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
  });
  
  page.on('pageerror', err => {
    console.log(`[BROWSER ERROR] ${err.message}`);
    console.log(err.stack);
  });
  
  console.log("Navigating to admin portal...");
  await page.goto('http://localhost:8080/html/admin-portal.html?');
  
  console.log("Waiting 3 seconds for scripts to load...");
  await page.waitForTimeout(3000);
  
  const state = await page.evaluate(() => {
    return {
      typeof_handleAdminLogin: typeof handleAdminLogin,
      typeof_switchPage: typeof switchPage,
      typeof_supabaseDb: typeof supabaseDb
    };
  });
  
  console.log("Browser State of Functions:", state);
  
  await browser.close();
})();
