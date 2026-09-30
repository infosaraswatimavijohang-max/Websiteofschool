const http = require('http');

http.get('http://localhost:8080/html/admin-portal.html', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log("Response status code:", res.statusCode);
    console.log("Response length:", data.length);
    
    // Check if it has the bad injection
    const hasBad = data.includes("manual-attendance.js?v=");
    console.log("Contains 'manual-attendance.js?v=':", hasBad);
    
    // Check if it has the missing brace fix at line 4878 area
    const hasFix = data.includes("initializeSharedDatabase") && data.includes("    }\n    // ── SWITCH PAGES ──");
    console.log("Contains the closing brace fix:", hasFix);
  });
}).on('error', (err) => {
  console.error("Error connecting to server:", err.message);
});
