const { createClient } = require('@supabase/supabase-js');

const DB1_URL = "https://ohczlooperjqpyllmabo.supabase.co";
const DB1_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oY3psb29wZXJqcXB5bGxtYWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNDk1MTcsImV4cCI6MjA5NDkyNTUxN30.DTgKXfFOdgHWy8C_hb8sGB6SWnfyr7J3UeVohE72ze0";

const supabase = createClient(DB1_URL, DB1_KEY);

async function checkTeachers() {
  const { data, error } = await supabase.from('teacher_profiles').select('*').limit(10);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('First 10 Teachers in teacher_profiles:', JSON.stringify(data, null, 2));
  }
}

checkTeachers();
