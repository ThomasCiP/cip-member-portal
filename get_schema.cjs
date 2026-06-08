const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data: pData } = await supabase.from('profiles').select('*').limit(1);
  const { data: gData } = await supabase.from('groups').select('*').limit(1);
  console.log("Profiles sample:", pData ? Object.keys(pData[0] || {}) : "error");
  console.log("Groups sample:", gData ? Object.keys(gData[0] || {}) : "error");
}
check();
