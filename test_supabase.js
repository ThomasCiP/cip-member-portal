import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://fgfxdutafqdhnmznpsdj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZnhkdXRhZnFkaG5tem5wc2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNzY2ODcsImV4cCI6MjA5Mzk1MjY4N30.NBFwij9394ggD64La7Te4eWuKyq-YG4KS4gX-YZwgMU'
);

async function signInAndTest() {
  // Let's try to simulate a failure to see what happens
  const { data, error } = await supabase.from('profiles').upsert({
    id: "00000000-0000-0000-0000-000000000000",
    first_name: "Test"
  });
  console.log("Upsert result:", { data, error });
}

signInAndTest();
