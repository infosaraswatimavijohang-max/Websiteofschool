const url = "https://ohczlooperjqpyllmabo.supabase.co/rest/v1/school_settings?setting_key=eq.official_signatures";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oY3psb29wZXJqcXB5bGxtYWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNDk1MTcsImV4cCI6MjA5NDkyNTUxN30.DTgKXfFOdgHWy8C_hb8sGB6SWnfyr7J3UeVohE72ze0";

fetch(url, {
  method: 'DELETE',
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`
  }
}).then(res => {
  console.log("Deleted status:", res.status);
}).catch(console.error);
