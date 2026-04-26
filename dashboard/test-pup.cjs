const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:8083/test4.html');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const content = await page.content();
  console.log("HTML:", content);
  
  await browser.close();
})();
