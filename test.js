fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: "Bearer undefined" },
  body: JSON.stringify({
    model: "llama3-8b-8192",
    messages: [{ role: "user", content: "test" }]
  })
}).then(r => r.json()).then(console.log);
