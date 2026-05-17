# Haraka.ai Project Scope & Team Responsibilities

## Objective

Define a clear feature scope for Haraka.ai and assign ownership to the team members responsible for each core area.

---

## Feature Scope

### FRONTEND (React.js) — User Experience

#### Task 1: Nurse Tablet UI

- Goal: Build the main tablet interface for the nurse.
- Actions:
  - Integrate the central webcam feed.
  - Add a "Visual Privacy" toggle button for Silhouette/Blur mode.
  - Display the repetition counter in large, readable text.

#### Task 2: Post-Session Flow ZAK

- Goal: Capture pain without text input.
- Actions:
  - Create `EmojiPainScale.jsx` with 5 clickable faces.
  - Remove the microphone button; the patient selects the pain emoji directly.
  - Add an end-of-session voice prompt: "Kidayr m3a lewja3 daba ?"

#### Task 3: Specialist Triage Dashboard

- Goal: Build the desktop interface for the Casablanca specialist.
- Actions:
  - Implement a sidebar Priority Inbox with color-coded Red/Yellow/Green status.
  - Add a "1-Tap Validate All" action button.
  - Build a main panel with 3 tabs: Session JSON, LLM Reasoning, Specialist Report.

---

## EDGE-AI & VISION (Local Processing)

#### Task 4: MediaPipe Logic & Angle Calculations [COMPLETED]

- Goal: Convert video into biomechanical data in the browser.
- Actions:
  - Integrated MediaPipe Pose directly into the React edge client (NurseDashboard.tsx).
  - Wrote the vector math to compute joint angles (Hip-Shoulder-Elbow) in real-time.
  - Implemented an automatic repetition counter state machine based on exact angle thresholds.

#### Task 5: Relative Calibration & Coaching Audio RIM

- Goal: Make the edge system adaptive and interactive.
- Actions:
  - Code the 30-second calibration phase to capture the patient’s base posture.
  - Add start-of-session reassuring audio: "Hna gha kan tb3o lharakat dyalek bach n3awnouk. Lvideo ma kay tsejjelch. Rta7 a Aammi."
  - Start the countdown voice sequence: "Tleta... Jouj... Wahed... Bda !" [COMPLETED]
  - Add active coaching audio during the session:
    - if the patient slows down: "Yalah a Aammi !" or "T9der dirha !"
    - if the target angle is not reached: "Zid chwiya a Aammi, rak 9rib !"

#### Task 6: Hardware Health Check (OpenCV)

- Goal: Secure data quality before exercise begins.
- Actions:
  - Write a small Python/OpenCV script to run a 5-second camera health check.
  - Measure Laplacian variance to detect dirty or blurred lenses.
  - Check ambient lighting before allowing the session to start.

---

## BACKEND & CLOUD-AI (Server & LLM)

#### Task 7: Session JSON Packaging [COMPLETED]

- Goal: Manage low-bandwidth data transfer directly from Frontend to Python Backend.
- Actions:
  - Built an API endpoint (`/api/v1/session/submit` in FastAPI) that receives the final session payload from the React frontend.
  - Successfully bypassed the redundant Node.js layer to reduce latency and attack surface.
  - Package the complete session payload into `session_data.json` with angles, reps, and warnings.

#### Task 8: Prompt Engineering & Amber Flag Verifier ALI [COMPLETED]

- Goal: Generate the medical report while preventing hallucinations.
- Actions:
  - Configured the LLM call using the OpenAI SDK routed through OpenRouter (Llama 3).
  - Built a regex-based `AmberFlagVerifier` that checks each generated sentence for JSON citations.
  - Successfully flags unsupported or invented sentences as Amber Flags in orange HTML spans before returning to the UI.

The pdf report to do also include the amber flags.
--------------------------------------------------

## PRODUCT & BUSINESS

#### Task 9: Pitch Preparation & README

- Goal: Present the solution clearly to judges.
- Actions:
  - Refine the GitHub repository with the technical README.
  - Prepare the live demo flow.
  - Structure the 2-minute pitch around AMO-Tadamon, the B2G UMMC use case, and the Moroccan government budget context.

---

## Team Responsibilities

### 1. RIM — Backend, API & Darija Integration

- Role: Backend owner and Darija integration lead.

#### Assigned Tasks:

- Task 7: Session JSON Packaging
  - Reason: Best fit for REST API design and packaging the final session payload.
- Task 2: Post-Session Flow
  - Reason: Responsible for the pain scale UI and the emoji-based post-session evaluation.

---

### 2. ALI — Edge-AI & Computer Vision

- Role: Data pipeline and vision processing specialist.

#### Assigned Tasks:

- Task 4: MediaPipe Logic & Angle Calculations
  - Reason: Handles real-time video data, joint extraction, angle math, and repetition logic.
- Task 6: Hardware Health Check
  - Reason: Works on data quality validation and camera image analysis.

---

### 3. ZAKI — Cloud-AI, LLM Logic & Reasoning

- Role: LLM prompt architect and reasoning verifier.

#### Assigned Tasks:

- Task 8: Prompt Engineering & Amber Flag Verifier
  - Reason: Matches his strength in RAG, LangGraph-style logic, and hallucination mitigation.
- Task 5: Relative Calibration & Coaching Audio
  - Reason: Builds the state logic that triggers coaching audio and handles motion state.

---

### 4. Ri — Full-Stack Lead, UI Analytics & Product

- Role: Tech lead and product integrator.

#### Assigned Tasks:

- Task 3: Specialist Triage Dashboard
  - Reason: Requires analytical UI design and the organization of complex clinician workflows.
- Task 1: Nurse Tablet UI
  - Reason: Builds the core React shell, camera UX, and interface for the edge workflow.
- Task 9: Pitch Preparation & README
  - Reason: Owns the product narrative and prepares the demo for judges.

---

## Delivery Notes

- The project can be broken into an MVP path: start with Task 1, Task 4, Task 5, Task 6, then connect Task 7 and Task 8, while Task 2 and Task 3 complete the UX.
- This scope ensures each team member has a defined area of ownership and a clear handoff between edge, backend, and product.
