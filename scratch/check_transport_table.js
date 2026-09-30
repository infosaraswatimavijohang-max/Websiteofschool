const DB1_URL = "https://ohczlooperjqpyllmabo.supabase.co";
const DB1_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oY3psb29wZXJqcXB5bGxtYWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNDk1MTcsImV4cCI6MjA5NDkyNTUxN30.DTgKXfFOdgHWy8C_hb8sGB6SWnfyr7J3UeVohE72ze0";

async function check() {
  try {
    const res = await fetch(`${DB1_URL}/rest/v1/transport_requests?limit=1`, {
      headers: {
        'apikey': DB1_KEY,
        'Authorization': `Bearer ${DB1_KEY}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      console.log('transport_requests table exists! Data:', data);
    } else {
      console.log('Failed to query table. Status:', res.status, res.statusText);
      const errText = await res.text();
      console.log('Error text:', errText);
    }
  } catch (e) {
    console.error('Exception:', e.message);
  }
}

check();
