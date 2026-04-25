# 🛡️ SheScam — AI Scam Detection for Women

> **"Because the next scam is already in her inbox."**

SheScam is an AI-powered platform that helps women **instantly detect scams** via WhatsApp or web — turning confusion into clarity in seconds.

---

## 🌐 Live Demo

🔗 https://she-scam.vercel.app

---

## 🧠 Why SheScam?

Online scams are fast, manipulative, and everywhere.

* 1 in 3 Indian women face scam attempts yearly
* ₹1.25L average loss in fraud cases
* Most victims have **no instant way to verify messages**

SheScam solves this with **real-time AI detection + community intelligence**.

---

## ✨ Features

* 🤖 **WhatsApp Bot** — forward messages, get instant scam verdict
* 🔍 **Web Checker** — paste suspicious text, analyze instantly
* 📊 **Live Dashboard** — real-time scam trends & alerts
* 🗺️ **India Heatmap** — location-based scam hotspots
* 🌐 **Hindi + English support**
* 📢 **Anonymous reporting system**
* 🆘 **Emergency helplines (1930, 1091, 100)**
* 💯 **Free & accessible**

---

## ⚙️ How It Works

1. User submits message (WhatsApp or web)
2. Backend processes request (Bun + Elysia)
3. AI analyzes content (LLaMA 3 via Groq)
4. Risk verdict + explanation generated
5. Stored anonymously (Supabase)
6. Insights reflected in live dashboard

---

## 🏗️ Architecture

```
User (WhatsApp / Web)
        ↓
Backend API (Bun + Elysia)
        ↓
AI Detection (Groq - LLaMA 3)
        ↓
Supabase (anonymous reports)
        ↓
React Dashboard (visualization)
```

---

## 🛠️ Tech Stack

| Layer        | Technology      |
| ------------ | --------------- |
| Frontend     | React, Vite     |
| Backend      | Bun.js, Elysia  |
| WhatsApp Bot | whatsapp-web.js |
| AI Model     | Groq (LLaMA 3)  |
| Database     | Supabase        |
| Deployment   | Vercel + Render |

---

## 🚀 Quick Start

```bash
# Backend
cd backend && bun install && bun run index.ts

# WhatsApp Bot
cd whatsapp && npm install && node index.js

# Frontend
cd dashboard && npm install && npm run dev
```

---

## 🔐 Environment Variables

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
GROQ_API_KEY=
```

---

## 🧪 Demo Flow

* Paste a scam message on website → get instant verdict
* Forward message to WhatsApp bot → receive AI response
* View dashboard → explore live scam trends
* Check heatmap → identify regional scam patterns

---

## 🔮 Future Scope

* Voice-based scam detection
* More Indian language support
* Browser extension for real-time alerts
* Scam number auto-blocking

---

## ❤️ Impact

SheScam empowers women to **verify before they trust** —
making digital spaces safer, one message at a time.
