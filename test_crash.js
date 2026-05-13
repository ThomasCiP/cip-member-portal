const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.toString()));
  
  await page.goto('https://members.christiansinpolitics.com/');
  
  // Wait for load
  await page.waitForTimeout(5000);
  
  console.log("Done checking for initial errors.");
  await browser.close();
})();
