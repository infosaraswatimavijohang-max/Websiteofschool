const fs = require('fs');

const adminPortal = 'c:/Users/diwas/OneDrive/Documents/Desktop/school management saraswati/html/admin-portal.html';
let content = fs.readFileSync(adminPortal, 'utf8');

// 1. Modifying renderGenericTable
const renderInject = `      } else if (currentGenericModule === 'Academic_Categories' && supabaseDb) {
        try {
          const { data: catData, error } = await supabaseDb.from('categories').select('*').order('created_at', { ascending: false });
          if (!error && catData) {
            data = catData.map(c => ({ id: c.id, f1: c.category_name, f2: c.category_type, f3: c.description, f4: c.status }));
          }
        } catch(err) { console.error(err); data = []; }
      } else if (currentGenericModule === 'Academic_AddEmployee' && supabaseDb) {
        try {
          const { data: empData, error } = await supabaseDb.from('employees').select('*').order('created_at', { ascending: false });
          if (!error && empData) {
            data = empData.map(e => ({ id: e.id, f1: e.name, f2: e.role, f3: e.phone, f4: e.address, f5: e.employee_type, f6: e.status }));
          }
        } catch(err) { console.error(err); data = []; }
      } else if (currentGenericModule === 'Academic_Report' && supabaseDb) {
        try {
          const { data: repData, error } = await supabaseDb.from('reports').select('*').order('created_at', { ascending: false });
          if (!error && repData) {
            data = repData.map(r => ({ id: r.id, f1: r.report_title, f2: r.module_area, f3: r.generated_by, f4: r.status, f5: r.file_url }));
          }
        } catch(err) { console.error(err); data = []; }
      } else {
        // Fallback to localStorage`;

content = content.replace("      } else {", renderInject);

// 2. Modifying handleGenericSubmit
const submitInject = `      } else if (currentGenericModule === 'Academic_Categories' && supabaseDb) {
        try {
          let catData = { category_name: entry.f1, category_type: entry.f2, description: entry.f3, status: entry.f4 };
          if (editId) await supabaseDb.from('categories').update(catData).eq('id', editId);
          else await supabaseDb.from('categories').insert([catData]);
        } catch(e) { console.error(e); }
      } else if (currentGenericModule === 'Academic_AddEmployee' && supabaseDb) {
        try {
          let empData = { name: entry.f1, role: entry.f2, phone: entry.f3, address: entry.f4, employee_type: entry.f5, status: entry.f6 };
          if (editId) await supabaseDb.from('employees').update(empData).eq('id', editId);
          else await supabaseDb.from('employees').insert([empData]);
        } catch(e) { console.error(e); }
      } else if (currentGenericModule === 'Academic_Report' && supabaseDb) {
        try {
          let repData = { report_title: entry.f1, module_area: entry.f2, generated_by: entry.f3, status: entry.f4, file_url: entry.f5 };
          if (editId) await supabaseDb.from('reports').update(repData).eq('id', editId);
          else await supabaseDb.from('reports').insert([repData]);
        } catch(e) { console.error(e); }
      }

      // Also save to localStorage`;

content = content.replace("      // Also save to localStorage", submitInject);

// 3. Modifying schemas in moduleSchemas
// Modify AddEmployee to add employee_type
const oldEmpSchema = `"Academic_AddEmployee": {
        headers: ["Employee Name", "Role / Designation", "Contact Number", "Status"],
        fields: [
          { id: "f1", label: "Full Name", type: "text", placeholder: "e.g. Sita Sharma" },
          { id: "f2", label: "Role", type: "text", placeholder: "e.g. Accountant, Guard" },
          { id: "f3", label: "Phone", type: "text", placeholder: "e.g. 9800000000" },
          { id: "f4", label: "Address", type: "text", placeholder: "e.g. Butwal", required: false },
          { id: "f5", label: "Status", type: "select", options: ["Active", "Inactive"] }
        ]
      }`;

const newEmpSchema = `"Academic_AddEmployee": {
        headers: ["Employee Name", "Role", "Phone", "Type", "Status"],
        fields: [
          { id: "f1", label: "Full Name", type: "text", placeholder: "e.g. Sita Sharma" },
          { id: "f2", label: "Role", type: "text", placeholder: "e.g. Accountant, Guard" },
          { id: "f3", label: "Phone", type: "text", placeholder: "e.g. 9800000000" },
          { id: "f4", label: "Address", type: "text", placeholder: "e.g. Butwal", required: false },
          { id: "f5", label: "Employee Type", type: "select", options: ["Internal Staff", "Outer Employee"] },
          { id: "f6", label: "Status", type: "select", options: ["Active", "Inactive"] }
        ]
      }`;

if (content.includes(oldEmpSchema)) {
    content = content.replace(oldEmpSchema, newEmpSchema);
} else {
    // If exact match fails, let's fallback
    console.log("Could not exact match AddEmployee schema, skipping or please manually patch");
}

fs.writeFileSync(adminPortal, content);
console.log("Phase 2 fixes applied successfully.");
