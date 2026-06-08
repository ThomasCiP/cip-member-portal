import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('PAGE ERROR LOG:', msg.text());
  });
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('https://members.christiansinpolitics.com/');
  await new Promise(r => setTimeout(r, 5000));
  
  // Try to wait for the first name field. If it's not there, maybe we are already logged in?
  // No, incognito browser is used by default in puppeteer.
  const email = 'testcrash' + Date.now() + '@example.com';
  console.log("Using email:", email);
  
  await page.type('input[placeholder="First name"]', 'Test');
  await page.type('input[placeholder="Last name"]', 'Crash');
  await page.type('input[type="email"]', email);
  await page.type('input[type="password"]', 'Password123!');
  await page.type('input[placeholder="Confirm password"]', 'Password123!');
  await page.click('input[type="checkbox"]');
  await page.click('button.bg-\\[\\#c9a227\\]'); // Continue button
  
  await new Promise(r => setTimeout(r, 4000));
  
  // They require email verification. We can't proceed without it.
  
  await browser.close();
})();
