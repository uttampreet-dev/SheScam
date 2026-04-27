import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function detectScam(message: string) {
  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
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
}`,
            },
            {
              role: "user",
              content: `Analyze this for scam indicators: "${message}"`,
            },
          ],
          temperature: 0.1,
          response_format: { type: "json_object" },
        }),
      }
    );
    const data: any = await response.json();
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
    const text = data.choices?.[0]?.message?.content || "";
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    try {
  return JSON.parse(cleanText);
} catch {
  const lower = cleanText.toLowerCase();

  let verdict = "SUSPICIOUS";
  if (lower.includes("scam")) verdict = "SCAM";
  else if (lower.includes("safe")) verdict = "SAFE";

  return {
    verdict,
    scam_type: "other",
    red_flags: ["Heuristic fallback used"],
    explanation: "AI format issue, used keyword detection.",
    next_steps: "Avoid sharing personal info.",
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

  .get("/", () => ({ status: "SheScam backend running!" }))

  .post("/api/analyze", async ({ body }: { body: any }) => {
    const { message, city } = body;
    if (!message) return { error: "Message is required" };

    const result = await detectScam(message);

    await supabase.from("reports").insert({
      message: message.substring(0, 500),
      verdict: result.verdict,
      scam_type: result.scam_type,
      red_flags: result.red_flags.join(", "),
      language: "auto",
      city: city || "Unknown",
    });

    return result;
  })

  .get("/api/reports", async () => {
    const { data } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    return data || [];
  })

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
