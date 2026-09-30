const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ohczlooperjqpyllmabo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oY3psb29wZXJqcXB5bGxtYWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNDk1MTcsImV4cCI6MjA5NDkyNTUxN30.DTgKXfFOdgHWy8C_hb8sGB6SWnfyr7J3UeVohE72ze0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkTables() {
  console.log("Checking tables...");
  
  const tables = ['attendance_devices', 'devices', 'biometric_devices'];
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`Table ${table} error:`, error.message);
      } else {
        console.log(`Table ${table} exists! Data:`, data);
      }
    } catch (e) {
      console.log(`Table ${table} exception:`, e.message);
    }
  }
}

checkTables();
