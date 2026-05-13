const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('PAGE ERROR LOG:', msg.text());
  });
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('https://members.christiansinpolitics.com/');
  await new Promise(r => setTimeout(r, 3000));
  
  // Click first name field
  await page.type('input[placeholder="First name"]', 'Test');
  await page.type('input[placeholder="Last name"]', 'Crash');
  await page.type('input[type="email"]', 'testcrash' + Date.now() + '@example.com');
  await page.type('input[type="password"]', 'Password123!');
  await page.type('input[placeholder="Confirm password"]', 'Password123!');
  await page.click('input[type="checkbox"]');
  await page.click('button.bg-\\[\\#c9a227\\]'); // Continue button
  
  await new Promise(r => setTimeout(r, 4000));
  console.log("Completed signup step 1.");
  
  // Try to click creed
  try {
    await page.click('input[type="checkbox"]');
    await page.click('button.bg-\\[\\#c9a227\\]');
  } catch(e) {}
  
  await new Promise(r => setTimeout(r, 3000));
  
  // Now we should see the verification screen or the dashboard if auto confirm is on.
  // Wait! This dummy account requires email verification because it's Supabase auth.
  // I cannot log in without email verification!
  // Unless... the user has a test account they are using? I can just run it against localhost, mock the auth context!
  
  await browser.close();
})();
