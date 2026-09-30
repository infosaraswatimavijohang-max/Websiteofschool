const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to admin portal...');
    await page.goto('http://127.0.0.1:8080/html/admin-portal.html');
    
    console.log('Logging in...');
    await page.waitForSelector('#admin-email', { timeout: 10000 });
    await page.fill('#admin-email', 'info@sss.com');
    await page.fill('#admin-password', 'sss@121');
    await page.click('#admin-login-form button[type="submit"]');

    // Wait for dashboard to load
    await page.waitForSelector('[data-page="dashboard"].active', { timeout: 10000 });
    console.log('Login successful.');

    // ----------------------------------------------------
    // TEST 1: NOTICES MODULE (CUD)
    // ----------------------------------------------------
    console.log('\n--- Testing Notices Module ---');
    // Open CMS -> Notice Board
    await page.evaluate(() => {
       document.querySelector('a.nav-link[onclick*="toggleSubmenu"]').click(); 
       // Need to click the specific Notice Board submenu
       const links = Array.from(document.querySelectorAll('.submenu-link'));
       const noticeLink = links.find(l => l.textContent.includes('Notice Board'));
       if(noticeLink) noticeLink.click();
    });
    
    // Check if notice form is visible
    await page.waitForSelector('#notice-form', { timeout: 10000 });
    
    // Create Notice
    console.log('Creating new notice...');
    const testTitle = `Test Notice ${Date.now()}`;
    await page.fill('#notice-title', testTitle);
    await page.fill('#notice-desc', 'This is an automated test notice.');
    await page.click('#notice-form button[type="submit"]');
    await page.waitForTimeout(1000); // Wait for alert/save
    
    // Check if created
    const noticesHtml = await page.innerHTML('.admin-card'); // Need to find notice table/list
    if(noticesHtml.includes(testTitle)) {
       console.log('✅ Notice created successfully');
    } else {
       console.log('❌ Failed to find created notice');
    }
    
    // Delete Notice
    // This requires clicking the delete button for the specific notice
    // I will write the specific logic after I verify the table structure
    
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await browser.close();
  }
})();
