const fs = require('fs');
const file = 'c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/html/admin-portal.html';
let content = fs.readFileSync(file, 'utf8');

// Fix render
content = content.replace("f2: e.role, f3: e.phone, f4: e.address, f5: e.employee_type, f6: e.status",
                          "f3: e.role, f4: e.phone, f2: e.employee_type, f5: e.status");

// Fix insert
content = content.replace("role: entry.f2, phone: entry.f3, address: entry.f4, employee_type: entry.f5, status: entry.f6",
                          "role: entry.f3, phone: entry.f4, employee_type: entry.f2, status: entry.f5");

fs.writeFileSync(file, content);
console.log("Fixed phase 2 mappings.");
