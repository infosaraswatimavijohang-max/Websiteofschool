const fs = require('fs');
const path = require('path');

const targetFile = 'c:\\Users\\diwas\\OneDrive\\Documents\\Desktop\\school management saraswati\\html\\admin-portal.html';
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Update Schema
const oldSchema = `"Academic_TCCC": {
        headers: ["Student Name", "Certificate Type", "Issue Date", "Status"],
        fields: [
          { id: "f1", label: "Student Name", type: "text", placeholder: "e.g. Gita Adhikari" },
          { id: "f2", label: "Certificate Type", type: "select", options: ["Transfer Certificate (TC)", "Character Certificate (CC)", "Both TC and CC"] },
          { id: "f3", label: "Issue Date", type: "date", placeholder: "" },
          { id: "f4", label: "Status", type: "select", options: ["Issued", "Pending Approval", "Cancelled"] }
        ]
      }`;
const newSchema = `"Academic_TCCC": {
        headers: ["Student Name", "Certificate Type", "Issue Date", "Status", "Certificate File"],
        fields: [
          { id: "f1", label: "Student Name", type: "text", placeholder: "e.g. Gita Adhikari" },
          { id: "f2", label: "Certificate Type", type: "select", options: ["Transfer Certificate (TC)", "Character Certificate (CC)", "Both TC and CC"] },
          { id: "f3", label: "Issue Date", type: "date", placeholder: "" },
          { id: "f4", label: "Status", type: "select", options: ["Issued", "Pending Approval", "Cancelled"] },
          { id: "f5", label: "Upload Certificate", type: "file", placeholder: "" }
        ]
      }`;
content = content.replace(oldSchema, newSchema);

// 2. Update renderGenericForm
const oldFormRender = `        } else if (field.type === 'student-dropdown') {
          formHTML += \`<select id="dyn-\${field.id}" class="form-control"><option value="">-- Select Student --</option></select>\`;
        } else {
          formHTML += \`<input type="\${field.type}" id="dyn-\${field.id}" class="form-control" placeholder="\${field.placeholder}" required>\`;
        }`;
const newFormRender = `        } else if (field.type === 'student-dropdown') {
          formHTML += \`<select id="dyn-\${field.id}" class="form-control"><option value="">-- Select Student --</option></select>\`;
        } else if (field.type === 'file') {
          formHTML += \`<input type="file" id="dyn-\${field.id}" class="form-control" accept="image/*,.pdf" \${field.required ? 'required' : ''}>\`;
          formHTML += \`<div id="preview-\${field.id}" style="margin-top: 5px; font-size: 12px; display: none;"></div>\`;
        } else {
          formHTML += \`<input type="\${field.type}" id="dyn-\${field.id}" class="form-control" placeholder="\${field.placeholder}" required>\`;
        }`;
content = content.replace(oldFormRender, newFormRender);

// 3. Update renderGenericTable Field Loop
const oldTableRender = `          else if (field.type === 'select') {
             let badgeClass = (val.includes('Active') || val.includes('Completed') || val.includes('Available') || val.includes('Income')) ? 'approved' : 
                              (val.includes('Pending') || val.includes('Issued')) ? 'pending' : 'rejected';
             trHTML += \`<td><span class="status-badge \${badgeClass}">\${val}</span></td>\`;
          } else {
             trHTML += \`<td>\${val}</td>\`;
          }`;
const newTableRender = `          else if (field.type === 'select') {
             let badgeClass = (val.includes('Active') || val.includes('Completed') || val.includes('Available') || val.includes('Income')) ? 'approved' : 
                              (val.includes('Pending') || val.includes('Issued')) ? 'pending' : 'rejected';
             trHTML += \`<td><span class="status-badge \${badgeClass}">\${val}</span></td>\`;
          } else if (field.type === 'file') {
             if (val && val.startsWith('http')) {
               trHTML += \`<td><a href="\${val}" target="_blank" style="color:var(--primary); text-decoration:underline;">View File</a></td>\`;
             } else {
               trHTML += \`<td><span style="color:#94a3b8; font-size:0.85em;">No file</span></td>\`;
             }
          } else {
             trHTML += \`<td>\${val}</td>\`;
          }`;
content = content.replace(oldTableRender, newTableRender);

// 4. Update renderGenericTable Fetch block
const oldFetch = `      } else if (currentGenericModule === 'Academic_SubjectSetup' && supabaseDb) {
        try {
          const { data: subjectsData, error } = await supabaseDb.from('subjects').select('*').order('created_at', { ascending: false });
          if (error) {
            console.error("Error loading subjects:", error);
            data = [];
          } else {
            // Transform database data to match the schema format
            data = subjectsData.map(cls => ({
              id: cls.id,
              f1: cls.subject_name,
              f2: cls.subject_code,
              f3: cls.subject_type,
              f6: cls.credit_hour || '',
              f5: cls.category || 'Secondary',
              f4: cls.status
            }));
          }
        } catch(err) {
          console.error("Exception loading subjects:", err);
          data = [];
        }
      } else {
        // Fallback to localStorage`;
const newFetch = `      } else if (currentGenericModule === 'Academic_SubjectSetup' && supabaseDb) {
        try {
          const { data: subjectsData, error } = await supabaseDb.from('subjects').select('*').order('created_at', { ascending: false });
          if (error) {
            console.error("Error loading subjects:", error);
            data = [];
          } else {
            // Transform database data to match the schema format
            data = subjectsData.map(cls => ({
              id: cls.id,
              f1: cls.subject_name,
              f2: cls.subject_code,
              f3: cls.subject_type,
              f6: cls.credit_hour || '',
              f5: cls.category || 'Secondary',
              f4: cls.status
            }));
          }
        } catch(err) {
          console.error("Exception loading subjects:", err);
          data = [];
        }
      } else if (currentGenericModule === 'Academic_TCCC' && supabaseDb) {
        try {
          const { data: tcccData, error } = await supabaseDb.from('tccc_records').select('*').order('created_at', { ascending: false });
          if (error) {
            console.error("Error loading TCCC records:", error);
            data = [];
          } else {
            data = tcccData.map(record => ({
              id: record.id,
              f1: record.student_name,
              f2: record.certificate_type,
              f3: record.issue_date || '',
              f4: record.status,
              f5: record.certificate_file_url || ''
            }));
          }
        } catch(err) {
          console.error("Exception loading TCCC records:", err);
          data = [];
        }
      } else {
        // Fallback to localStorage`;
content = content.replace(oldFetch, newFetch);

// 5. Update handleGenericSubmit Form parsing
const oldParsing = `      let editId = document.getElementById('generic-form').dataset.editId;
      let entry = { id: editId ? editId : Date.now() };
      currentSchema.fields.forEach(field => {
        entry[field.id] = document.getElementById(\`dyn-\${field.id}\`).value;
      });`;
const newParsing = `      const submitBtn = document.querySelector('#generic-form button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerText : 'Save Record to System';
      if (submitBtn) { submitBtn.innerText = 'Uploading... Please wait'; submitBtn.disabled = true; }
      
      let editId = document.getElementById('generic-form').dataset.editId;
      let entry = { id: editId ? editId : Date.now() };
      
      let fileInputs = [];
      currentSchema.fields.forEach(field => {
        const el = document.getElementById(\`dyn-\${field.id}\`);
        if (field.type === 'file') {
          if (el.files && el.files[0]) {
             fileInputs.push({ id: field.id, file: el.files[0] });
          }
          entry[field.id] = el.dataset.existingUrl || ''; 
        } else {
          entry[field.id] = el.value;
        }
      });
      
      // Handle file uploads
      for (const fi of fileInputs) {
        const filename = \`tccc_\${Date.now()}_\${fi.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}\`;
        const url = await window.uploadMediaFile(fi.file, 'certificates/' + filename);
        if (url) {
           entry[fi.id] = url;
        }
      }`;
content = content.replace(oldParsing, newParsing);

// Restore submit button at the end of handleGenericSubmit
content = content.replace(
  `      event.target.reset();\n      renderGenericTable();\n    }`,
  `      event.target.reset();\n      renderGenericTable();\n      if (submitBtn) { submitBtn.innerText = 'Save Record to System'; submitBtn.disabled = false; }\n    }`
);

// 6. Update handleGenericSubmit DB Logic
const oldSubmitDB = `      } else if (currentGenericModule === 'Academic_SubjectSetup' && supabaseDb) {
        try {
          let subjectData = {
            subject_name: entry.f1,
            subject_code: entry.f2,
            subject_type: entry.f3,
            credit_hour: entry.f6,
            category: entry.f5,
            status: entry.f4,
            created_by: adminUser.email
          };`;
const newSubmitDB = `      } else if (currentGenericModule === 'Academic_TCCC' && supabaseDb) {
        try {
          let tcccData = {
            student_name: entry.f1,
            certificate_type: entry.f2,
            issue_date: entry.f3,
            status: entry.f4,
            certificate_file_url: entry.f5
          };
          
          let dbData, error;
          if (editId) {
             const result = await supabaseDb.from('tccc_records').update(tcccData).eq('id', editId).select();
             dbData = result.data; error = result.error;
          } else {
             const result = await supabaseDb.from('tccc_records').insert([tcccData]).select();
             dbData = result.data; error = result.error;
          }
          
          if (error) {
             console.error("Database error:", error);
             alert("❌ Error saving record: " + error.message + "\\n\\nData saved to local storage.");
          } else {
             alert(editId ? "✅ Record updated successfully in database!" : "✅ Record added successfully to database!");
          }
        } catch(err) {
          console.error("Exception saving TCCC record:", err);
          alert("⚠️ Error saving to database.\\nData has been saved locally.");
        }
      } else if (currentGenericModule === 'Academic_SubjectSetup' && supabaseDb) {
        try {
          let subjectData = {
            subject_name: entry.f1,
            subject_code: entry.f2,
            subject_type: entry.f3,
            credit_hour: entry.f6,
            category: entry.f5,
            status: entry.f4,
            created_by: adminUser.email
          };`;
content = content.replace(oldSubmitDB, newSubmitDB);

// 7. Update deleteGenericEntry DB Logic
const oldDeleteDB = `      } else if (currentGenericModule === 'Academic_SubjectSetup' && supabaseDb) {
        try {
          const { error } = await supabaseDb.from('subjects').delete().eq('id', id);`;
const newDeleteDB = `      } else if (currentGenericModule === 'Academic_TCCC' && supabaseDb) {
        try {
          const { error } = await supabaseDb.from('tccc_records').delete().eq('id', id);
          if (error) {
            console.error("Database error:", error);
            alert("❌ Error deleting TCCC record: " + error.message);
            return;
          }
        } catch(err) {
          console.error("Exception deleting TCCC record:", err);
        }
      } else if (currentGenericModule === 'Academic_SubjectSetup' && supabaseDb) {
        try {
          const { error } = await supabaseDb.from('subjects').delete().eq('id', id);`;
content = content.replace(oldDeleteDB, newDeleteDB);

// 8. Update editGenericEntry logic
const oldEditLogic = `       currentSchema.fields.forEach(field => {
         const el = document.getElementById(\`dyn-\${field.id}\`);
         if (el) el.value = record[field.id] || '';
       });`;
const newEditLogic = `       currentSchema.fields.forEach(field => {
         const el = document.getElementById(\`dyn-\${field.id}\`);
         if (!el) return;
         if (field.type === 'file') {
             el.dataset.existingUrl = record[field.id] || '';
             let previewEl = document.getElementById(\`preview-\${field.id}\`);
             if (previewEl) {
                 if (record[field.id] && record[field.id].startsWith('http')) {
                     previewEl.innerHTML = \`Current: <a href="\${record[field.id]}" target="_blank">View Uploaded File</a>\`;
                     previewEl.style.display = 'block';
                 } else {
                     previewEl.style.display = 'none';
                 }
             }
         } else {
             el.value = record[field.id] || '';
         }
       });`;
content = content.replace(oldEditLogic, newEditLogic);

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully applied TCCC fixes to admin-portal.html');
