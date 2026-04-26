const puppeteer = require("puppeteer");
(async () => {
  const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const page = await browser.newPage();
  page.on("console", msg => console.log("PAGE LOG:", msg.text()));
  await page.goto("https://she-scam.vercel.app");
  
  const result = await page.evaluate(async () => {
    try {
      const res = await fetch("https://shescam.onrender.com/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "test", city: "test" })
      });
      return await res.text();
    } catch(e) {
      return "ERROR: " + e.message;
    }
  });
  console.log("EVAL RESULT:", result);
  
  await browser.close();
})();
