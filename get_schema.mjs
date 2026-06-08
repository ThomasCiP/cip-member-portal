import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://fgfxdutafqdhnmznpsdj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZnhkdXRhZnFkaG5tem5wc2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNzY2ODcsImV4cCI6MjA5Mzk1MjY4N30.NBFwij9394ggD64La7Te4eWuKyq-YG4KS4gX-YZwgMU";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
  const { data: pData } = await supabase.from('profiles').select('*').limit(1);
  const { data: gData } = await supabase.from('groups').select('*').limit(1);
  console.log("Profiles sample:", pData ? Object.keys(pData[0] || {}) : "error");
  console.log("Groups sample:", gData ? Object.keys(gData[0] || {}) : "error");
}
check();
