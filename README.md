# 🥦 NutriGuard AI

> **AI-powered food quality assessment system** — developed as part of the *Starting with AI* course in the [Digital Life Sciences (DLS)](https://www.hevs.ch/en/schools/school-of-engineering/life-sciences/bachelor-s-degree-programme-in-life-sciences-engineering/digital-life-sciences/) major at HES-SO Valais-Wallis.

---

## 📖 Overview

NutriGuard AI is a web application that combines **computer vision**, **sensor data analysis**, and **large language models** to assess food quality. Rather than relying on a single data source, the system integrates multiple heterogeneous inputs — visual appearance, chemical indicators, and storage conditions — and delivers interpretable, actionable quality assessments.

The project was featured by [BioArk](https://bioark.ch/news/digital-life-sciences-turning-artificial-intelligence-into-applied-solutions/) as an example of how Digital Life Sciences students at HES-SO Valais-Wallis apply AI to concrete life-science challenges.

---

## 🎯 Key Features

- 🖼️ **Computer Vision** — YOLOv8-based freshness detection via Roboflow API (99.6% accuracy on `freshness-fruits-and-vegetables`)
- 🔬 **Multi-Sensor Signal Processing** — pH, gas levels, storage time, and temperature analysis
- 🤖 **Multi-Agent Architecture** — 4 independent AI agents communicating via a shared memory service
- 💬 **LLM-Powered Feedback** — Natural language quality reports via Flowise chatflow agents
- 📊 **Real-time Terminal UI** — Live logging and feedback during analysis pipeline execution
- 🔄 **Offline Fallback** — Automatic mock data fallback when API is unavailable
- ✅ **TypeScript** — Fully typed codebase, zero additional npm dependencies

---

## 🏗️ Architecture

NutriGuard AI is built around a **multi-agent pipeline** where each agent handles a distinct stage of the analysis. Agents communicate through a **shared singleton memory service** (`AgentMemoryService`), avoiding direct React prop drilling.

```
┌──────────────────┐     ┌──────────────────────┐     ┌───────────────────────┐     ┌──────────────────┐
│  Agent 1         │     │  Agent 2             │     │  Agent 3              │     │  Agent 4         │
│  Image Analysis  │────▶│  Signal Processing   │────▶│  Quality              │────▶│  Final Feedback  │
│  (Roboflow/YOLO) │     │  (pH, Gas, Temp)     │     │  Classification       │     │  (LLM Report)    │
└──────────────────┘     └──────────────────────┘     └───────────────────────┘     └──────────────────┘
         │                         │                             │                            │
         └─────────────────────────┴─────────────────────────────┴────────────────────────────┘
                                             AgentMemoryService (Singleton)
```

### Agent Details

| Agent | Role | Key Outputs |
|---|---|---|
| **Image Analysis** | Food type detection, mold detection, color health score | `foodType`, `moldDetected`, `colorAnalysis`, `confidence` |
| **Signal Processing** | Sensor data aggregation, threshold-based classification | `ph`, `gasLevel`, `storageTime`, `temperature` |
| **Quality Classification** | Grade assignment (A–F), multi-factor scoring | `grade`, `score`, `factors` |
| **Final Feedback** | LLM-generated recommendation (via Flowise) | Natural language safety report |

---

## 🔍 Detection Classes (Roboflow Model)

| Label | Meaning |
|---|---|
| ✅ `Fresh` | Food is fresh and safe |
| 🔄 `Ripening` | In the process of ripening |
| ⚠️ `Overripe` | Past optimal consumption window |
| 🟡 `Unripe` | Not yet ready for consumption |
| ❌ `Rotten` | Spoiled, unsafe to consume |
| 🦠 `Mold` | Fungal contamination detected |

**Model**: `freshness-fruits-and-vegetables` on [Roboflow Universe](https://universe.roboflow.com/college-74jj5/freshness-fruits-and-vegetables) — YOLOv8, 99.6% accuracy.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| **Computer Vision** | Roboflow Hosted API (YOLOv8) |
| **LLM Orchestration** | Flowise (self-hosted or cloud) |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- A [Roboflow](https://app.roboflow.com) account (free tier is sufficient)
- *(Optional)* A running Flowise instance for Agents 3 & 4

### Installation

```bash
git clone https://github.com/samuelemoungang/NutriGuard_AI.git
cd NutriGuard_AI
npm install
```

### Configuration

Create a `.env.local` file in the project root:

```env
# Required
NEXT_PUBLIC_ROBOFLOW_API_KEY=your_roboflow_api_key_here

# Optional (defaults are set in code)
NEXT_PUBLIC_ROBOFLOW_API_URL=https://detect.roboflow.com
NEXT_PUBLIC_ROBOFLOW_PROJECT_ID=freshness-fruits-and-vegetables
NEXT_PUBLIC_ROBOFLOW_MODEL_VERSION=1

# Optional — Flowise agents (Agents 3 & 4)
NEXT_PUBLIC_FLOWISE_API_URL=http://localhost:3001
NEXT_PUBLIC_FLOWISE_QUALITY_CHATFLOW_ID=your_chatflow_id
NEXT_PUBLIC_FLOWISE_FEEDBACK_CHATFLOW_ID=your_chatflow_id
```

> Get your Roboflow API key at: [app.roboflow.com/settings/account/api](https://app.roboflow.com/settings/account/api)

### Run

```bash
npm run dev
# → Open http://localhost:3000
```

---

## 📁 Project Structure

```
NutriGuard_AI/
├── src/
│   ├── app/
│   │   ├── page.tsx                     # Main app — step orchestration
│   │   └── globals.css
│   ├── components/
│   │   ├── HeroSection.tsx              # Landing / upload UI
│   │   ├── ImageAnalysisStep.tsx        # Agent 1 — Vision
│   │   ├── SignalProcessingStep.tsx     # Agent 2 — Sensors
│   │   ├── QualityClassificationStep.tsx # Agent 3 — Grading
│   │   ├── FinalFeedbackStep.tsx        # Agent 4 — LLM Report
│   │   ├── RoboFlowVisualizer.tsx       # Bounding box canvas renderer
│   │   ├── StepNavigation.tsx
│   │   └── TerminalUI.tsx
│   ├── services/
│   │   ├── roboflowService.ts           # Roboflow API client
│   │   └── agentMemoryService.ts        # Shared singleton memory
│   ├── hooks/
│   │   └── useRoboFlow.ts               # React hook for Roboflow state
│   └── types/
│       └── index.ts                     # Shared TypeScript types
├── public/images/
├── .env.example
├── next.config.ts
└── package.json
```

---

## 🧠 Shared Memory Service

The `AgentMemoryService` is a **singleton** that decouples agents from direct React prop dependencies. Each agent reads and writes its results to a central store:

```typescript
import agentMemoryService from '@/services/agentMemoryService';

// Write
agentMemoryService.setImageAnalysis(result);
agentMemoryService.setSignalData(formData);

// Read (from any agent)
const imageAnalysis = agentMemoryService.getImageAnalysis();
const allData = agentMemoryService.getAllMemory();

// Reset on new session
agentMemoryService.reset();
agentMemoryService.startSession();
```

---

## ⚠️ Troubleshooting

| Error | Solution |
|---|---|
| `API Key not configured` | Add `NEXT_PUBLIC_ROBOFLOW_API_KEY` to `.env.local` |
| `401 Unauthorized` | Verify your key at [Roboflow Settings](https://app.roboflow.com/settings/account/api) |
| Always showing mock data | Check that your Roboflow project is set to **Public** |
| `Rate limit exceeded` | Wait a few minutes or upgrade your Roboflow plan |
| Flowise agents not responding | Verify your Flowise instance is running and chatflow IDs are correct |

---

## 🎓 Academic Context

NutriGuard AI was developed as part of the **Starting with AI** course in the [Digital Life Sciences (DLS)](https://www.hevs.ch/en/schools/school-of-engineering/life-sciences/bachelor-s-degree-programme-in-life-sciences-engineering/digital-life-sciences/) major — Bachelor in Life Sciences Engineering, School of Engineering, **HES-SO Valais-Wallis**.

The project demonstrates how AI can address real-world life-science challenges, specifically around food quality assessment: a domain characterised by biological variability, complex multi-source data, and increasing demands for traceability and reliability.

> *"NutriGuard AI illustrates how education, applied innovation and real-world challenges intersect in Valais."*
> — [BioArk, January 2026](https://bioark.ch/news/digital-life-sciences-turning-artificial-intelligence-into-applied-solutions/)

---

## 📄 License

Private academic project — HES-SO Valais-Wallis, 2026.
Project created by Samuele Moungang Moussandja and Olivia Kaloa Farias Melo
---

*Built with ❤️ in Valais, Switzerland.*
