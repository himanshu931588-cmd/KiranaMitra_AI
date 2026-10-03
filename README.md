# 🏪 KiranaMitra AI — Open-Source Shopkeeper Assistant
### Grounded, Voice-First Inventory & Margin Co-Pilot for Indian Kirana Stores

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.0+-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0+-646CFF.svg)](https://vitejs.dev/)
[![Open-Weight AI](https://img.shields.io/badge/AI-Open--Weight-orange.svg)](#-open-weight-models--attributions)

> **"The AI that understands your dukaan."**  
> A shopkeeper speaks naturally in Hinglish, and our open-weight AI turns that conversation into real-time inventory actions, explainable demand predictions, and smart purchasing decisions.

---

## 🏆 Open-Weight AI Architecture

KiranaMitra AI is built on **open-weight AI models** that perform tool calling, multi-intent extraction, Hinglish voice transcription, and explainable demand reasoning for small Indian Kirana stores.

```
                  🗣️ SHOPKEEPER VOICE / TEXT
                      (Hindi / Hinglish)
                              │
                              ▼
                  🎙️ Srota-Hinglish-ASR v2.1 / Whisper-Open-Weight
                     (Speech-to-Text Model)
                              │
                              ▼
                  🧠 Qwen2.5-7B-Instruct / DeepSeek-R1-Distill
                     (Open-Weight LLM Agent)
                              │
                              ▼
                  ⚙️ TOOL SELECTION & CALLING
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
 `update_inventory`    `predict_demand`     `add_purchase_list`
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
                  🗄️ SQLite Shop Database
                              │
                              ▼
                  🔍 EXPLAINABLE AI REASONING
                              │
                              ▼
                  🛒 Smart Purchase List & Order
```

---

## 🤖 Open-Weight Models & Attributions

KiranaMitra AI relies strictly on open-weight AI models to ensure vendor neutrality, privacy, and local deployment capability for small businesses:

1. **Qwen2.5-7B-Instruct / Qwen-3 (Alibaba Cloud)**
   - **Role**: Core reasoning engine & tool-calling agent.
   - **License**: Apache 2.0 / Qwen Open License.
   - **Function**: Parses complex multi-intent Hinglish sentences (e.g., *"Bhai Maggi 20 packet aur 5kg chini purchase list mein daal de"*), extracts entities, and formats JSON tool calls.

2. **Whisper-Large-v3 / Srota-Hinglish-ASR (OpenAI / Open-Source Community)**
   - **Role**: Hinglish Speech-to-Text transcription.
   - **License**: MIT License.
   - **Function**: Transcribes code-switched Hindi-English audio streams accurately under ambient noise conditions typical of bustling retail stores.

3. **DeepSeek-R1-Distill-Qwen (DeepSeek AI)**
   - **Role**: Mathematical demand forecasting & explainable reasoning.
   - **License**: MIT License.
   - **Function**: Calculates stockout risk probabilities, optimal reorder quantities, and weekend surge multipliers with step-by-step reasoning proofs.

---

## 🔥 Key Features

### 1. 🎙️ "Bolo → Kaam Ho Gaya" — Hinglish Voice Agent
- The shopkeeper speaks naturally:
  > **“Bhai Maggi ke 20 packet aur 5 kilo chini order mein daal de.”**
- Open-weight AI extracts entities, quantities, units, and executes `add_to_purchase_list()` tool calls directly.

### 2. 🧠 "Dukaan Ka Dimaag" — AI Demand Prediction
- Learns from 7-day shop sales history (e.g. Day 1: 7, Day 2: 5, Day 3: 8, Day 4: 6, Day 5: 5, Day 6: 7, Day 7: 6).
- Highlights stockout risk:
  - **Maggi Current Stock**: `4 packets`
  - **Expected 3-Day Demand**: `21 packets`
  - ⚠️ **STOCKOUT RISK: HIGH**
  - **Recommended Purchase**: `30 packets`

### 3. 🔍 "Why am I buying this?" — Explainable AI
- Click **"Why?"** on any recommendation to see the exact AI reasoning proof:
  - Average daily sales from 7-day memory
  - Weekend demand surge multiplier (+28%)
  - Current stock runway
  - Supplier lead time window (2 days)
  - Formula: `Recommended Order = (Avg Sales × Target Days × Weekend Factor) - Current Stock + Buffer`

### 4. 💡 "What-if?" Simulator — Decision Support
- Simulates shop decisions before committing capital:
  - **"Agar main Maggi ka price ₹5 badha du toh?"** → Simulates price elasticity, weekly demand drop, and revenue impact.
  - **"What if I buy 100 packets?"** → Calculates stock duration (~16 days) and flags overstock capital lockup risk.

### 5. 🚛 Smart Supplier Comparison
- Compares suppliers by price (₹/unit), lead time (days), min order, and AI balance rating.

---

## ⚔️ Competitive Advantage: How KiranaMitra Differs

Traditional retail tools force shopkeepers into tedious manual data entry, while generic LLMs hallucinate numbers and cost too much to run. KiranaMitra bridges this gap with deterministic inventory math powered by lightweight open-weight intelligence.

| Dimension | Legacy Apps (Vyapar, Khatabook) | Generic Closed LLMs (ChatGPT, Claude) | KiranaMitra AI (Our Solution) |
| :--- | :--- | :--- | :--- |
| **Input Barrier** | High — requires complex forms, barcodes, and manual typing | Medium — requires prompt typing or rigid voice transcription | **Zero** — hands-free code-switched Hinglish voice understanding |
| **Recurring Cost** | Monthly subscription fees (₹2,000–₹5,000/yr) | Costly per-token API bills; unsustainable at scale | **₹0 recurring** — 100% open-weight, runs on cheap local hardware |
| **Math & Inventory Logic** | Rigid rule-based tracking; zero predictive foresight | Prone to numeric hallucinations and unsafe order estimates | **Explainable AI (XAI)** — deterministic math validated by DeepSeek-R1 CoT |
| **Data Privacy** | Stored on third-party cloud servers | Sent to proprietary US-hosted LLM endpoints | **100% On-Premise** — distributor pricing and sales records stay in-store |
| **Decision Support** | Simple static alerts ("Item low") | Generic advice without live stock context | **Actionable Trade-offs** — price elasticity & dead-stock capital lockup simulator |

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Backend Setup (FastAPI + SQLite + Open-Weight Agent)
```bash
cd backend
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
python database.py
python main.py
```
Backend server runs on `http://localhost:8000`.

### 2. Frontend Setup (React + Vite + Modern CSS)
```bash
cd frontend
npm install
npm run dev
```
Frontend app runs on `http://localhost:3000`.

---

## 🐳 Docker Deployment

To build and run the full stack container:
```bash
docker build -t kiranamitra-ai .
docker run -p 8000:8000 kiranamitra-ai
```

---

## 📁 Repository Structure

```
kiranamitra-ai/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── VoiceInput.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── Recommendations.jsx
│   │   │   ├── ExplainModal.jsx
│   │   │   ├── WhatIfSimulator.jsx
│   │   │   ├── SupplierCompareModal.jsx
│   │   │   ├── PurchaseList.jsx
│   │   │   └── AgentLogVisualizer.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   └── vite.config.js
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── inventory.py
│   ├── ai_agent.py
│   ├── demand.py
│   ├── speech.py
│   └── requirements.txt
├── data/
│   └── shop.json
├── prompts/
│   └── kirana_agent.txt
├── Dockerfile
├── README.md
└── LICENSE
```

---

## This is my AI Agent Link(Deploy with Vercel) : https://kirana-mitra-ai.vercel.app/

## 📜 License & Open-Source Transparency

This project is licensed under the [MIT License](LICENSE).

All open-weight models referenced (Qwen, Whisper, DeepSeek) retain their respective open licenses (Apache 2.0 / MIT) and are fully compliant with open-source hackathon requirements.
