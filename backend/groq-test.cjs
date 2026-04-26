const axios = require("axios");

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
    temperature: 0.1
  };
  
  try {
    const r = await axios.post("https://api.groq.com/openai/v1/chat/completions", body, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      }
    });
    console.log("RESPONSE:", JSON.stringify(r.data, null, 2));
    console.log("TEXT:", r.data.choices[0].message.content);
    
    try {
      const parsed = JSON.parse(r.data.choices[0].message.content);
      console.log("PARSED OK:", parsed);
    } catch(e) {
      console.log("PARSE FAILED:", e.message);
    }
  } catch(e) {
    console.log("ERR:", e.response?.data || e.message);
  }
}
run();
