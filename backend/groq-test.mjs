async function run() {
  const message = "Congratulations! You have won ₹10,00,000 in PM Modi Swachh Bharat Yojana lottery. Send your Aadhaar card and ₹999 registration fee to claim your prize immediately.";
  const body = {
    model: "mixtral-8x7b-32768",
    messages: [
      {
        role: "system",
        content: `You are SheScam, a scam detection assistant.

You MUST respond ONLY in valid JSON.

STRICT RULES:

* No explanation outside JSON
* No text before or after JSON
* No markdown or code blocks
* No comments
* Output must start with { and end with }

Return EXACTLY this format:

{
"verdict": "SAFE" or "SUSPICIOUS" or "SCAM",
"scam_type": "lottery" or "job" or "phishing" or "loan" or "other" or "none",
"red_flags": ["short bullet points"],
"explanation": "2-3 sentence explanation in same language as input",
"next_steps": "clear actionable advice"
}`
      },
      {
        role: "user",
        content: `Analyze this message for scam indicators: "${message}"`
      }
    ],
    temperature: 0.1,
    response_format: { type: "json_object" }
  };
  
  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer undefined`
      }
    });
    const data = await r.json();
    console.log("RESPONSE:", JSON.stringify(data, null, 2));
  } catch(e) {
    console.log("ERR:", e.message);
  }
}
run();
