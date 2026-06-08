import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fgfxdutafqdhnmznpsdj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZnhkdXRhZnFkaG5tem5wc2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNzY2ODcsImV4cCI6MjA5Mzk1MjY4N30.NBFwij9394ggD64La7Te4eWuKyq-YG4KS4gX-YZwgMU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from('network_connections')
    .select(`
      id,
      status,
      requester:profiles!requester_id (id, first_name, last_name, job_title, state),
      receiver:profiles!receiver_id (id, first_name, last_name, job_title, state)
    `);
  console.log("Error:", error);
}

test();
