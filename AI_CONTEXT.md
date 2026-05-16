# Haraka.ai — AI Developer Guidelines

**ATTENTION ALL AI ASSISTANTS (Cursor, GitHub Copilot, Gemini, ChatGPT):**
If you are generating code for the `Haraka.ai` project, you **MUST** strictly adhere to the following constraints and context. This is a 24-hour hackathon project for the Moroccan government's mobile medical units (UMMC-FMVS).

## 1. Zero-Recording Privacy Architecture (CNDP 09-08 Compliance)
- **Rule:** Never write code that records, saves, or transmits video/images of the patient.
- **Implementation:** All Computer Vision (MediaPipe) must process frames in the browser's memory and discard them immediately.
- **UI Fallback:** The UI should support a "Visual Privacy Mode" (rendering only skeletal lines/silhouettes or heavily blurring the background).

## 2. Low-Bandwidth Constraints
- **Rule:** Do not send large payloads from the frontend to the backend.
- **Implementation:** The Edge AI (MediaPipe in browser) calculates the angles, counts repetitions, and identifies errors. It only transmits a lightweight JSON payload (~5KB) containing structured metrics (e.g., `maxAngle: 45`, `reps: 10`, `warnings: ["trunk_shift"]`) to the backend API.

## 3. Localization (Darija/Tamazight)
- **Rule:** Audio prompts and UI text (where applicable for patients) must consider local low-literacy environments.
- **Implementation:** Use Darija for verbal counts ("Tleta, Jouj, Wahed, Bda!") and provide visual cues like the Wong-Baker Emoji pain scale instead of text-heavy surveys. 
- **Voice Input:** Qualitative pain descriptions are recorded in Darija and sent to the Whisper API.

## 4. Technology Stack Expectations
- **Frontend:** React 19, Vite, Tailwind CSS 4.0, Framer Motion.
- **Edge AI:** MediaPipe Pose for Web (JavaScript/TypeScript).
- **Backend:** Node.js / Express (for routing LLM calls).
- **Cloud AI:** Gemini 1.5 Flash or GPT-4 for the clinical reasoning engine.

## 5. The "llm_context" File
- When modifying backend LLM prompts, always reference `haraka-ai-frontend-ui/server/prompts/llm_context.md`. This file contains the true medical knowledge injected by the physiotherapist team. The LLM must not guess biomechanical rules; it must follow this context strictly.
