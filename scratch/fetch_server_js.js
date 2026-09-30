const http = require('http');

http.get('http://localhost:8080/js/manual-attendance.js', (res) => {
  console.log("Response status code for manual-attendance.js:", res.statusCode);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log("Response content preview:", data.substring(0, 200));
  });
}).on('error', (err) => {
  console.error("Error connecting to server:", err.message);
});
