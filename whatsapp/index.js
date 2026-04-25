const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const axios = require("axios");

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

function formatResponse(result) {
  const verdictEmoji = {
    SCAM: "🚨",
    SUSPICIOUS: "⚠️",
    SAFE: "✅",
  };

  const emoji = verdictEmoji[result.verdict] || "❓";
  let msg = `${emoji} *${result.verdict} DETECTED*\n\n`;

  if (result.scam_type && result.scam_type !== "none") {
    msg += `📌 *Type:* ${result.scam_type.toUpperCase()}\n\n`;
  }

  if (result.red_flags && result.red_flags.length > 0) {
    msg += `🚩 *Red Flags:*\n`;
    result.red_flags.forEach((flag) => {
      msg += `• ${flag}\n`;
    });
    msg += "\n";
  }

  msg += `💬 *Analysis:*\n${result.explanation}\n\n`;
  msg += `👉 *What to do:*\n${result.next_steps}\n\n`;
  msg += `─────────────────\n`;
  msg += `_SheScam Bot — Protecting women from scams_ 💜`;

  return msg;
}

async function analyzeMessage(text) {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/analyze`, {
      message: text,
      city: "Unknown",
    });
    return response.data;
  } catch (err) {
    console.error("Backend error:", err.message);
    return null;
  }
}

// QR code for linking
client.on("qr", (qr) => {
  console.log("\n📱 Scan this QR code with WhatsApp:\n");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("✅ SheScam WhatsApp Bot is live!");
});

client.on("auth_failure", (msg) => {
  console.error("Auth failed:", msg);
});

client.on("message", async (msg) => {
  // ignore group messages
  if (msg.from.includes("@g.us")) return;

  const text = msg.body.trim();
  if (!text || text.length < 5) return;

  console.log(`📨 Message: ${text.substring(0, 60)}...`);

  // Welcome message
  if (["hi", "hello", "start"].includes(text.toLowerCase())) {
    await msg.reply(
      `👋 *Welcome to SheScam Bot!*\n\nI help you detect scams instantly.\n\n*How to use:*\nJust forward or type any suspicious message and I will analyze it for you.\n\n🌐 Works in Hindi and English\n🔒 Your messages are anonymous\n\n_Stay safe! 💜_`
    );
    return;
  }

  // Analyze
  await msg.reply("🔍 Analyzing your message...");
  const result = await analyzeMessage(text);

  if (!result) {
    await msg.reply("❌ Could not analyze right now. Please try again.");
    return;
  }

  await msg.reply(formatResponse(result));
  console.log(`✅ Replied: ${result.verdict}`);
});

client.initialize();