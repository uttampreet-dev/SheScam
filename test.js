fetch("https://shescam.onrender.com/api/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: "test", city: "Delhi" })
}).then(r => r.text()).then(console.log).catch(console.error);
