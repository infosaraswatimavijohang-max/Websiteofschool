const { chromium } = require('playwright');
const fs = require('fs');

function report(moduleName, operation, status, message) {
    console.log(`[${moduleName}] ${operation} - ${status === 'PASS' ? '✅ PASS' : '❌ FAIL'}: ${message}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('dialog', async dialog => {
    console.log(`Dialog accepted: ${dialog.message()}`);
    await dialog.accept();
  });

  try {
    console.log('Navigating to admin portal...');
    await page.goto('http://127.0.0.1:8080/html/admin-portal.html');
    
    await page.waitForSelector('#admin-email', { timeout: 10000 });
    await page.fill('#admin-email', 'info@sss.com');
    await page.fill('#admin-password', 'sss@121');
    await page.click('#admin-login-form button[type="submit"]');

    await page.waitForSelector('[data-page="dashboard"].active', { timeout: 10000 });
    console.log('Login successful.\n');

    // ====================================================================================
    // MODULE 1: NOTICES
    // ====================================================================================
    console.log('--- Testing MODULE: Notices ---');
    try {
        await page.evaluate(() => {
            document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));
            document.getElementById('page-manage-notices').classList.add('active');
            if(typeof loadNotices === 'function') loadNotices();
        });
        
        await page.waitForTimeout(1000); 

        // CREATE
        const testNoticeTitle = `E2E Test Notice ${Date.now()}`;
        await page.fill('#notice-date', 'Test Date 101', { force: true });
        await page.fill('#notice-icon', '📝', { force: true });
        await page.fill('#notice-title', testNoticeTitle, { force: true });
        await page.fill('#notice-desc', 'This is an automated E2E test notice description.', { force: true });
        await page.evaluate(() => document.querySelector('#notice-form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })));
        
        await page.locator('#notices-list-tbody').filter({ hasText: testNoticeTitle }).waitFor({ state: 'visible', timeout: 15000 });
        report('Notices', 'CREATE', 'PASS', 'Notice appeared in table');

        // UPDATE
        await page.evaluate((title) => {
            const rows = Array.from(document.querySelectorAll('#notices-list-tbody tr'));
            const testRow = rows.find(r => r.textContent.includes(title));
            if(testRow) {
                const editBtn = testRow.querySelector('button[onclick^="editNotice"]');
                if(editBtn) editBtn.click();
            }
        }, testNoticeTitle);

        await page.waitForTimeout(1000);
        
        const updatedTitle = `${testNoticeTitle} (Updated)`;
        await page.fill('#notice-title', updatedTitle, { force: true });
        await page.evaluate(() => document.querySelector('#notice-form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })));
        
        await page.locator('#notices-list-tbody').filter({ hasText: updatedTitle }).waitFor({ state: 'visible', timeout: 15000 });
        report('Notices', 'UPDATE', 'PASS', 'Notice title successfully updated');

        // DELETE
        await page.evaluate((title) => {
            const rows = Array.from(document.querySelectorAll('#notices-list-tbody tr'));
            const testRow = rows.find(r => r.textContent.includes(title));
            if(testRow) {
                const deleteBtn = testRow.querySelector('button[onclick^="deleteNotice"]');
                if(deleteBtn) deleteBtn.click();
            }
        }, updatedTitle);

        await page.locator('#notices-list-tbody').filter({ hasText: updatedTitle }).waitFor({ state: 'hidden', timeout: 15000 });
        report('Notices', 'DELETE', 'PASS', 'Notice successfully removed from table');
    } catch(err) {
        await page.screenshot({ path: 'notices_error.png' });
        report('Notices', 'ALL', 'FAIL', err.message);
    }

    // ====================================================================================
    // MODULE 2: TEACHERS
    // ====================================================================================
    console.log('\n--- Testing MODULE: Teachers ---');
    try {
        await page.evaluate(() => {
            document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));
            const p = document.getElementById('page-teachers');
            if(p) p.classList.add('active');
            if(typeof loadTeacherAccounts === 'function') loadTeacherAccounts();
        });
        await page.waitForTimeout(1000);

        const testTeacherName = `E2E Dr. Test ${Date.now()}`;
        const teacherCode = `TCH-${Date.now().toString().slice(-4)}`;
        
        // CREATE
        await page.fill('#tch-name', testTeacherName, { force: true });
        await page.fill('#tch-code', teacherCode, { force: true });
        await page.fill('#tch-email', `test_tch_${Date.now()}@school.com`, { force: true });
        await page.fill('#tch-phone', '9800000000', { force: true });
        await page.fill('#tch-position', 'Test Subject', { force: true });
        await page.fill('#tch-joined-date', '2023-01-01', { force: true });
        await page.fill('#tch-password', 'testpassword123', { force: true });
        await page.fill('#tch-password-confirm', 'testpassword123', { force: true });
        
        // Handle teacher photo
        await page.setInputFiles('#tch-image-input', 'scratch/test.png');
        
        // Handle subject dropdown
        await page.evaluate(() => {
            const select = document.querySelector('#subjects-container .subject-input');
            if(select && select.options.length > 1) {
                select.selectedIndex = 1;
                select.dispatchEvent(new Event('change'));
            }
        });
        
        await page.evaluate(() => document.querySelector('#teacher-enrollment-form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })));

        await page.locator('#admin-teachers-tbody').filter({ hasText: testTeacherName }).waitFor({ state: 'visible', timeout: 15000 });
        report('Teachers', 'CREATE', 'PASS', 'Teacher appeared in table');

        // DELETE
        await page.evaluate((name) => {
            const rows = Array.from(document.querySelectorAll('#admin-teachers-tbody tr'));
            const testRow = rows.find(r => r.textContent.includes(name));
            if(testRow) {
                const deleteBtn = Array.from(testRow.querySelectorAll('button')).find(b => b.textContent.includes('Delete') || b.getAttribute('onclick')?.includes('delete'));
                if(deleteBtn) deleteBtn.click();
            }
        }, testTeacherName);

        await page.locator('#admin-teachers-tbody').filter({ hasText: testTeacherName }).waitFor({ state: 'hidden', timeout: 15000 });
        report('Teachers', 'DELETE', 'PASS', 'Teacher deleted from table');

    } catch(err) {
        await page.screenshot({ path: 'teachers_error.png' });
        report('Teachers', 'ALL', 'FAIL', err.message);
    }
    
    // ====================================================================================
    // MODULE 3: STUDENTS
    // ====================================================================================
    console.log('\n--- Testing MODULE: Students ---');
    try {
        await page.evaluate(() => {
            document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));
            const p = document.getElementById('page-students');
            if(p) p.classList.add('active');
            if(typeof loadStudents === 'function') loadStudents();
        });
        await page.waitForTimeout(1000);

        const testStudentName = `E2E Student ${Date.now()}`;
        
        // CREATE
        await page.fill('#std-name', testStudentName, { force: true });
        await page.fill('#std-roll', '999', { force: true });
        await page.fill('#std-dob', '2010-05-05', { force: true });
        await page.evaluate(() => {
            const select = document.getElementById('std-class');
            if(select && select.options.length > 1) {
                select.selectedIndex = 1;
                select.dispatchEvent(new Event('change'));
            }
        });
        
        await page.fill('#std-email', `test_std_${Date.now()}@school.com`, { force: true });
        await page.fill('#std-phone', '9811111111', { force: true });
        await page.fill('#std-password', 'studentpass123', { force: true });
        await page.fill('#std-password-confirm', 'studentpass123', { force: true });
        
        await page.fill('#std-username', `test_std_usr_${Date.now()}`, { force: true });
        // Handle gender and photo if they exist
        await page.evaluate(() => {
            const gender = document.getElementById('std-gender');
            if(gender && gender.options.length > 1) {
                gender.selectedIndex = 1;
                gender.dispatchEvent(new Event('change'));
            }
        });
        await page.fill('#std-parent', 'Test Parent', { force: true }).catch(() => {});
        await page.fill('#std-address', 'Test Address', { force: true }).catch(() => {});
        try { await page.setInputFiles('#std-photo', 'scratch/test.png'); } catch(e) {}
        try { await page.setInputFiles('#std-image', 'scratch/test.png'); } catch(e) {}
        
        await page.evaluate(() => document.querySelector('#student-enrollment-form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })));

        await page.locator('#admin-students-tbody').filter({ hasText: testStudentName }).waitFor({ state: 'visible', timeout: 15000 });
        report('Students', 'CREATE', 'PASS', 'Student appeared in table');

        // DELETE
        await page.evaluate((name) => {
            const rows = Array.from(document.querySelectorAll('#admin-students-tbody tr'));
            const testRow = rows.find(r => r.textContent.includes(name));
            if(testRow) {
                const deleteBtn = Array.from(testRow.querySelectorAll('button')).find(b => b.textContent.includes('Delete') || b.getAttribute('onclick')?.includes('delete'));
                if(deleteBtn) deleteBtn.click();
            }
        }, testStudentName);

        await page.locator('#admin-students-tbody').filter({ hasText: testStudentName }).waitFor({ state: 'hidden', timeout: 15000 });
        report('Students', 'DELETE', 'PASS', 'Student deleted from table');

    } catch(err) {
        await page.screenshot({ path: 'students_error.png' });
        report('Students', 'ALL', 'FAIL', err.message);
    }
    
  } catch (err) {
    console.error('Fatal Test Framework Error:', err);
  } finally {
    await browser.close();
  }
})();
