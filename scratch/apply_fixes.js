const fs = require('fs');
let txt = fs.readFileSync('c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/html/admin-portal.html', 'utf8');

const target = `          { id: 2, studentRoll: 2, studentName: "Kunjan Bhandari", studentClass: "Grade 11 - Technical", categoryId: 1, amount: 5000, dueDate: "2026-06-15", description: "Mangsir term tuition", installment: 1, status: "pending", paidAmount: 0, paidDate: null }
          { id: 2, time: "11:30 AM", subject: "Computer Network Labs", details: "ICT Lab 1 • Er. S. Bhandari", section: "Grade 10 - A" },
    // ── SWITCH PAGES ──
    async function switchPage(pageId, element) {`;

const replacement = `          { id: 2, studentRoll: 2, studentName: "Kunjan Bhandari", studentClass: "Grade 11 - Technical", categoryId: 1, amount: 5000, dueDate: "2026-06-15", description: "Mangsir term tuition", installment: 1, status: "pending", paidAmount: 0, paidDate: null }
        ]));
      }

      if (!localStorage.getItem('student_leaves')) {
        localStorage.setItem('student_leaves', JSON.stringify([
          { id: 1, name: "Anil Gurung", type: "Family Function", range: "2026-11-20 to 2026-11-21", desc: "Attending sister's wedding ritual in Pokhara.", proofFile: "wedding_card.jpg", emoji: "💌", status: "pending" }
        ]));
      }

      if (!localStorage.getItem('school_timetables')) {
        localStorage.setItem('school_timetables', JSON.stringify([
          { id: 1, time: "10:00 AM", subject: "Advanced Mathematics", details: "Room 302 • Mr. D. Bhandari", section: "Grade 10 - A" },
          { id: 2, time: "11:30 AM", subject: "Computer Network Labs", details: "ICT Lab 1 • Er. S. Bhandari", section: "Grade 10 - A" },
          { id: 3, time: "02:00 PM", subject: "Physics Theory", details: "Room 305 • Ms. R. Thapa", section: "Grade 10 - A" }
        ]));
      }

      if (!localStorage.getItem('school_announcements')) {
        localStorage.setItem('school_announcements', JSON.stringify([
          { date: "19 MAY 2026", title: "First Term Examination Timetables Commencing", category: "Academic", desc: "Examination timelines published commencing Shrawan 15. Question sets due by Sunday." },
          { date: "15 MAY 2026", title: "Staff Meeting & Curriculum Briefing Today", category: "General", desc: "Urgent briefing with the Principal in the lounge today at 3:30 PM." }
        ]));
      }
    }

    // ── SWITCH PAGES ──
    async function switchPage(pageId, element) {`;

if (txt.includes(target)) {
    txt = txt.replace(target, replacement);
    fs.writeFileSync('c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/html/admin-portal.html', txt);
    console.log('Successfully restored the accidentally deleted JSON configurations.');
} else {
    console.log('Could not find the target string. Replacement failed.');
}
