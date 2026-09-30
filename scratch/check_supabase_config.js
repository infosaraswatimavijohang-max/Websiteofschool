const https = require('https');

const DB1_URL = "https://ohczlooperjqpyllmabo.supabase.co";
const DB1_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oY3psb29wZXJqcXB5bGxtYWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNDk1MTcsImV4cCI6MjA5NDkyNTUxN30.DTgKXfFOdgHWy8C_hb8sGB6SWnfyr7J3UeVohE72ze0";

const url = `${DB1_URL}/rest/v1/school_config?key=eq.principal_info`;

const options = {
  method: 'GET',
  headers: {
    'apikey': DB1_KEY,
    'Authorization': `Bearer ${DB1_KEY}`
  }
};

console.log("Querying Supabase REST API directly...");
const req = https.request(url, options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log(`HTTP Status: ${res.statusCode}`);
    try {
      const parsed = JSON.parse(body);
      console.log("✅ Config retrieved successfully:");
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log("Response body could not be parsed as JSON:");
      console.log(body);
    }
  });
});

req.on('error', (e) => {
  console.error("❌ Connection error:", e.message);
});

req.end();
