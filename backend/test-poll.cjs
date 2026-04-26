const https = require('https');

function check() {
  const data = JSON.stringify({
    message: "Congratulations! You have won ₹10,00,000 in PM Modi Swachh Bharat Yojana lottery. Send your Aadhaar card and ₹999 registration fee to claim your prize immediately.",
    city: "delhi"
  });

  const options = {
    hostname: 'shescam.onrender.com',
    port: 443,
    path: '/api/analyze',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      console.log(new Date().toISOString(), body);
    });
  });

  req.write(data);
  req.end();
}

check();
