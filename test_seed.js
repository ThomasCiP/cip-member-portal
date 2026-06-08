import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fgfxdutafqdhnmznpsdj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZnhkdXRhZnFkaG5tem5wc2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNzY2ODcsImV4cCI6MjA5Mzk1MjY4N30.NBFwij9394ggD64La7Te4eWuKyq-YG4KS4gX-YZwgMU';

// Create two separate clients!
const supabaseA = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
const supabaseB = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

async function createTestAccounts() {
  const emailA = `testA_${Date.now()}@test.com`;
  const emailB = `testB_${Date.now()}@test.com`;
  
  const { data: userA } = await supabaseA.auth.signUp({ email: emailA, password: 'password123' });
  const { data: userB } = await supabaseB.auth.signUp({ email: emailB, password: 'password123' });

  if (userA?.user && userB?.user) {
    await new Promise(r => setTimeout(r, 2000));
    
    // Connect them (User A sends request to User B)
    const { error: connErr } = await supabaseA.from('network_connections').insert({
      requester_id: userA.user.id,
      receiver_id: userB.user.id,
      status: 'accepted'
    });
    console.log("Connection inserted by A:", connErr);
    
    // Send a message
    const { error: msgErr } = await supabaseA.from('messages').insert({
      sender_id: userA.user.id,
      receiver_id: userB.user.id,
      content: 'Hello from User A!'
    });
    console.log("Message inserted by A:", msgErr);

    // Read messages as A
    const { data: msgs, error: readErr } = await supabaseA.from('messages').select('*');
    console.log("A reads messages:", msgs?.length, readErr);

    // Read connections as A
    const { data: conns, error: connReadErr } = await supabaseA.from('network_connections').select('*');
    console.log("A reads connections:", conns?.length, connReadErr);
  }
}

createTestAccounts();
