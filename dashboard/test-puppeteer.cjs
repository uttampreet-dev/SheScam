const puppeteer = require("puppeteer");
(async () => {
  const browser = await puppeteer.launch({ 
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
  });
  const page = await browser.newPage();
  
  page.on("console", msg => console.log("PAGE LOG:", msg.text()));
  
  await page.goto("https://she-scam.vercel.app");
  
  await page.waitForSelector("textarea");
  await page.type("textarea", "Congratulations! You have won ₹10,00,000 in PM Modi Swachh Bharat Yojana lottery. Send your Aadhaar card and ₹999 registration fee to claim your prize immediately.");
  
  const inputs = await page.$$("input");
  await inputs[0].type("delhi");
  
  const buttons = await page.$$("button");
  for (let b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes("Check Now")) {
      await b.click();
      break;
    }
  }
  
  await new Promise(r => setTimeout(r, 5000));
  
  const body = await page.content();
  console.log("UI Contains 'Could not connect':", body.includes("Could not connect. Make sure backend is running."));
  console.log("UI Contains 'Could not analyze properly':", body.includes("Could not analyze properly"));
  console.log("UI Contains 'SUSPICIOUS':", body.includes("SUSPICIOUS"));
  console.log("UI Contains 'SCAM':", body.includes("SCAM"));
  
  await browser.close();
})();
