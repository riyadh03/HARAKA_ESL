# Haraka: Edge-AI Tele-Rehabilitation for Rural Morocco
# 🇲🇦 Haraka.ai — Edge-AI Tele-Rehabilitation (Technical README)

## Overview
Haraka.ai is a tele-rehabilitation software solution (B2G) designed to run on tablets used by Connected Mobile Medical Units (UMMC-FMVS) in Morocco. The architecture separates Edge and Cloud environments to handle poor rural bandwidth while keeping clinical intelligence centralized when needed.

Privacy-first design: the system follows a strict Zero-Recording policy — no video files are stored or transmitted — to comply with Moroccan data protection rules (CNDP 09-08).

---

## Technical Stack (Tools & Technologies)

### 1. Frontend — Patient Interface & Specialist Dashboard
- Framework: React.js — selected for robust UI, camera state management, and interactive dashboard transitions.
- Styling: Tailwind CSS for rapid prototyping of nursing and clinician triage inbox interfaces.
- In-Browser Computer Vision: MediaPipe Pose for Web (JavaScript). When running on the tablet, MediaPipe runs directly in the browser (Edge AI). Video never leaves the device; privacy-preserving rendering modes (silhouette or blur) are performed via HTML5 Canvas.
- Audio Handling: Web Audio API for local voice prompts in Darija (e.g., "3, 2, 1, Bda!").

### 2. Backend & Edge Processing (Local API & Cloud)
- Framework: Python + FastAPI — lightweight, async-friendly, ideal for receiving compact JSON payloads and interacting with LLMs.
- Data Validation: Pydantic for strongly typed, validated JSON session payloads (~5 KB per session).
- Hardware Checks: OpenCV (Python) for a short camera diagnostic (5-second variance-of-Laplacian check to detect dirty/scratched lenses).

### 3. Cloud AI
- Speech-to-Text: OpenAI Whisper API — used only to transcribe the patient’s qualitative pain description in Darija as a secondary signal for the pain scale.
- LLM: OpenAI GPT-4 or Google Gemini Pro for structured clinical report generation.
    - Prompting approach: few-shot prompt engineering with Grounded Generation. The model must reference the JSON source fields for every factual sentence in the clinical report.

---

## File / Folder Layout (Suggested)

```
haraka_ai_project/
│
├── haraka-ai-frontend-ui/         # ⚛️ React app (Nurse + Clinician) + Express Server
│   ├── public/
│   │   └── audio/                 # Offline audio files
│   ├── src/
│   │   ├── components/
│   │   │   ├── CameraTracker.jsx  # MediaPipe Pose + Canvas (privacy blur)
│   │   │   ├── EmojiPainScale.jsx # 5-face pain scale UI
│   │   │   └── TriageInbox.jsx    # Clinician dashboard
│   │   ├── hooks/
│   │   │   └── useCalibration.js  # Patient-relative baseline calibration
│   │   └── App.js
│   ├── server.ts                  # Express Backend for LLM Bridge
│   ├── Dockerfile
│   └── package.json
│
├── backend_api/                   # 🐍 Python FastAPI server
│   ├── main.py                    # API endpoints
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env                       # API keys - DO NOT COMMIT
│
├── docker-compose.yml             # Orchestrates Frontend, Node API, and Python API
└── README.md
```

---

## Key Technical Features (Hackathon Highlights)

1. Patient-Relative Baseline Calibration
- Instead of hard-coded thresholds (e.g., trunk deviation > 25mm), the React `useCalibration.js` hook records a patient-specific baseline during the first 30 seconds. This reduces false positives from age-related posture differences or scoliosis. The UI plays a reassuring Darija audio prompt explaining Zero-Recording.

2. Dual-Signal Pain Processing
- A 5-emoji Wong–Baker style scale provides a low-literacy quantitative pain measure. Whisper transcribes the patient’s Darija verbal description to add qualitative nuance for the LLM.

3. Triage Dashboard & Amber Flags
- `TriageInbox.jsx` sorts clinician JSON reports. The backend validates LLM output: every factual sentence must cite the JSON field it was grounded from (e.g., `[exercise_analytics.max_angle]`). Any sentence not supported by the JSON is highlighted as an ORANGE "Amber Flag" to help clinicians quickly find hallucinations.

---

## Quick Start — Local Development

The project is fully Dockerized for an easy, consistent development environment.

### Prerequisites
- Docker and Docker Compose installed and running on your machine.
- Set up your `.env` variables (e.g. `OPENAI_API_KEY`, `GOOGLE_API_KEY`) locally.

### Run with Docker

Simply run the following command in the root directory:

```bash
docker compose up --build
```

The services will be exposed at the following local ports:
- **Frontend UI (React/Vite):** `http://localhost:3000`
- **Express Backend (Node.js):** `http://localhost:4000/api/health`
- **FastAPI Backend (Python):** `http://localhost:8000`

> **Note:** Hot-reloading is enabled via Docker volume mounts. Changes to your local source code will immediately reflect in the running containers without needing to rebuild.

---

## Compliance & Legal Notes
This project is designed to comply with Moroccan laws on telemedicine and personal data protection (Law 131-13 and CNDP 09-08). The Zero-Recording policy, in-browser CV, and minimal JSON payloads (no raw images/video uploaded) are core design constraints.

---

### B. Cloud AI (Report Generation)
git clone https://github.com/yourusername/haraka.git
If you want, I can scaffold the frontend and backend starter skeletons (React + FastAPI) next and add minimal starter files to help judges run the demo locally.

*Developed for HackAI.*

Projet développé dans le cadre du HackAI. Conforme aux lois 131-13 (Télémédecine) et 09-08 (CNDP) du Royaume du Maroc. Par team ESL du EMSI Student Lab.
