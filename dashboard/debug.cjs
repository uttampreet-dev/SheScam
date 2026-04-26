const puppeteer = require("puppeteer");
(async () => {
  const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const page = await browser.newPage();
  
  // Intercept requests to see what is failing
  page.on("request", req => console.log("REQ:", req.method(), req.url()));
  page.on("response", res => console.log("RES:", res.status(), res.url()));
  page.on("requestfailed", req => console.log("FAIL:", req.url(), req.failure()?.errorText));
  page.on("console", msg => console.log("PAGE LOG:", msg.text()));

  await page.goto("https://she-scam.vercel.app");
  
  // Fill the text area
  await page.waitForSelector("textarea");
  await page.type("textarea", "Congratulations! You have won ₹10,00,000 in PM Modi Swachh Bharat Yojana lottery. Send your Aadhaar card and ₹999 registration fee to claim your prize immediately.");
  
  // Fill city
  const inputs = await page.$$("input");
  await inputs[0].type("delhi");
  
  // Click check
  const buttons = await page.$$("button");
  for (let b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes("Check Now")) {
      await b.click();
      break;
    }
  }
  
  await new Promise(r => setTimeout(r, 5000));
  await browser.close();
})();
