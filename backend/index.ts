// console.log("Hello via Bun!");

import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { createClient } from "@supabase/supabase-js";

// Supabase setup
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Groq AI scam detection
async function detectScam(message: string) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("GROQ_API_KEY is not set");
      return {
        verdict: "SUSPICIOUS",
        scam_type: "other",
        red_flags: ["Could not analyze properly"],
        explanation: "Please be careful with this message.",
        next_steps: "Do not share personal information.",
      };
    }
    
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content: `You are SheScam, a scam detection assistant for women in India. 
Analyze the message and respond ONLY in this exact JSON format, nothing else:
{
  "verdict": "SAFE" or "SUSPICIOUS" or "SCAM",
  "scam_type": "lottery" or "job" or "matrimonial" or "loan" or "phishing" or "government" or "other" or "none",
  "red_flags": ["flag1", "flag2"],
  "explanation": "2-3 sentence plain explanation in same language as input",
  "next_steps": "What the user should do now"
}`,
            },
            {
              role: "user",
              content: `Analyze this message for scam indicators: "${message}"`,
            },
          ],
          temperature: 0.1,
        }),
      }
    );
    const data = await response.json();
    if (!data.choices || !data.choices[0]) {
      console.error("Groq API error:", data);
      return {
        verdict: "SUSPICIOUS",
        scam_type: "other",
        red_flags: ["Could not analyze properly"],
        explanation: "Please be careful with this message.",
        next_steps: "Do not share personal information.",
      };
    }
    const text = data.choices[0].message.content;
    try {
      return JSON.parse(text);
    } catch {
      return {
        verdict: "SUSPICIOUS",
        scam_type: "other",
        red_flags: ["Could not analyze properly"],
        explanation: "Please be careful with this message.",
        next_steps: "Do not share personal information.",
      };
    }
  } catch (error) {
    console.error("detectScam error:", error);
    return {
      verdict: "SUSPICIOUS",
      scam_type: "other",
      red_flags: ["Could not analyze properly"],
      explanation: "Please be careful with this message.",
      next_steps: "Do not share personal information.",
    };
  }
}

const app = new Elysia()
  .use(cors())
  // .use(cors({
  // origin: [
  //   "http://localhost:5173",
  //   "https://she-scam.vercel.app",  // your vercel URL
  //   "https://she-scam.vercel.app/",
  //   "*"  // or allow all for hackathon
  // ]
// }))

  // Health check
  .get("/", () => ({ status: "SheScam backend running!" }))

  // Main scam detection endpoint
  .post("/api/analyze", async ({ body }: { body: any }) => {
    try {
      const { message, city } = body;
      if (!message) return { error: "Message is required" };

      const result = await detectScam(message);

      // Save to Supabase
      await supabase.from("reports").insert({
        message: message.substring(0, 500),
        verdict: result.verdict,
        scam_type: result.scam_type,
        red_flags: result.red_flags.join(", "),
        language: "auto",
        city: city || "Unknown",
      });

      return result;
    } catch (err: any) {
      console.error("API error:", err);
      return { error: err.message || "Internal Server Error" };
    }
  })

  // Get all reports for dashboard
  .get("/api/reports", async () => {
    const { data } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    return data || [];
  })

  // Get scam stats for dashboard charts
  .get("/api/stats", async () => {
    const { data } = await supabase.from("reports").select("*");
    if (!data) return {};

    const total = data.length;
    const scams = data.filter((r) => r.verdict === "SCAM").length;
    const suspicious = data.filter((r) => r.verdict === "SUSPICIOUS").length;
    const safe = data.filter((r) => r.verdict === "SAFE").length;

    const byType: Record<string, number> = {};
    data.forEach((r) => {
      byType[r.scam_type] = (byType[r.scam_type] || 0) + 1;
    });

    const byCity: Record<string, number> = {};
    data.forEach((r) => {
      if (r.city && r.city !== "Unknown") {
        byCity[r.city] = (byCity[r.city] || 0) + 1;
      }
    });

    return { total, scams, suspicious, safe, byType, byCity };
  })

  .listen(process.env.PORT || 4000);

console.log(`SheScam backend running on port ${app.server?.port}`);