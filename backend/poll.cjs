const http = require('http');
const https = require('https');

function poll() {
  const req = https.request('https://shescam.onrender.com/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(new Date().toISOString(), "->", data);
      if (!data.includes("Could not analyze properly")) {
        console.log("IT CHANGED!");
        process.exit(0);
      }
      setTimeout(poll, 5000);
    });
  });
  req.write(JSON.stringify({ message: "Congratulations! You have won ₹10,00,000 in PM Modi Swachh Bharat Yojana lottery. Send your Aadhaar card and ₹999 registration fee to claim your prize immediately.", city: "delhi" }));
  req.end();
}
poll();
