const { createClient } = require('@supabase/supabase-client');

const DB1_URL = "https://ohczlooperjqpyllmabo.supabase.co";
const DB1_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oY3psb29wZXJqcXB5bGxtYWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNDk1MTcsImV4cCI6MjA5NDkyNTUxN30.DTgKXfFOdgHWy8C_hb8sGB6SWnfyr7J3UeVohE72ze0";

const supabase = createClient(DB1_URL, DB1_KEY);

async function run() {
  console.log("Querying teachers_registry...");
  const { data, error } = await supabase.from('teachers_registry').select('*');
  if (error) {
    console.error("Error fetching teachers:", error);
  } else {
    console.log("Teachers found:", data.length);
    console.log(data);
  }
}

run();
