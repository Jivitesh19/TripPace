# TripPace 🧭

A smart, pace-aware travel itinerary planner built for the Open-Source/Open-Weight AI track. TripPace dynamically balances day schedules, tracks fatigue pacing, and estimates real-time costs using local open-weight intelligence.

---

## Prerequisites

1. **Node.js**: (v18 or higher recommended)

2. **Ollama**: [Download Ollama](https://ollama.com)

---

## Quick Start Guide

### 1. Launch the Local AI Engine (Ollama)

Download the open-weight model:

```bash
ollama run llama3.2:3b
```

Start Ollama with open browser permissions so the web frontend can reach it:

**Windows (PowerShell):**

```powershell
$env:OLLAMA_ORIGINS="*"
ollama serve
```

**macOS / Linux:**

```bash
OLLAMA_ORIGINS="*" ollama serve
```

Confirm it is running by checking [http://localhost:11434](http://localhost:11434) in your browser.

### 2. Run the Web Application

Clone the repository and install dependencies:

```bash
git clone <YOUR-GITHUB-REPO-URL>
cd trippace-planner-main
npm install
npm run dev
```

Visit the local URL shown in your terminal (usually [http://localhost:5173](http://localhost:5173) or [http://localhost:8080](http://localhost:8080)).

---

## Demo Presets (No Setup Required)

If you are evaluating without Ollama installed locally, click either of the Demo Trip preset buttons in the sidebar ("D.C. Smithsonian Blitz" or "UMD & College Park") to preview the dynamic pacing engine and UI immediately.
