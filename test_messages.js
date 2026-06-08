import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fgfxdutafqdhnmznpsdj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZnhkdXRhZnFkaG5tem5wc2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNzY2ODcsImV4cCI6MjA5Mzk1MjY4N30.NBFwij9394ggD64La7Te4eWuKyq-YG4KS4gX-YZwgMU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  // First get a real user from profiles
  const { data: profiles } = await supabase.from('profiles').select('*').limit(2);
  console.log("Profiles:", profiles);
  
  if (profiles && profiles.length > 0) {
    const userId = profiles[0].id;
    const peerId = profiles[1] ? profiles[1].id : userId; // fallback to self if only 1 user
    
    console.log("Using users:", userId, peerId);
    
    // Insert a connection
    const { error: insErr } = await supabase.from('network_connections').insert({
      requester_id: userId,
      receiver_id: peerId,
      status: 'accepted'
    });
    console.log("Insert Connection Error:", insErr);
    
    // Query it
    const { data, error } = await supabase
      .from('network_connections')
      .select(`
        id,
        status,
        requester:profiles!requester_id (id, first_name, last_name, job_title, state),
        receiver:profiles!receiver_id (id, first_name, last_name, job_title, state)
      `)
      .limit(1);
    
    console.log("Connection Query Data:", JSON.stringify(data, null, 2));
    console.log("Connection Query Error:", error);
  } else {
    console.log("No profiles found to test with.");
  }
}

test();
