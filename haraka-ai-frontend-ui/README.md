# Haraka.ai – Edge-to-Cloud Tele-Rehabilitation Platform

## 🎯 Overview

Haraka.ai est une plateforme de télé-réadaptation innovante qui combine:
- **Edge AI** (détection de pose en temps réel via MediaPipe) sur les tablettes des infirmiers
- **Cloud AI** (Gemini 1.5 Flash) pour l'analyse médicale et la génération de rapports
- **Design mobile-first minimaliste** optimisé pour tablettes et petits écrans

## 📱 Responsive Design

L'application est **entièrement optimisée pour mobile**:
- **Vue Infirmier**: Flux vidéo en plein écran prioritaire + métriques en bas (mobile-first)
- **Doctor Dashboard**: Layout adaptif avec triage vertical sur petit écran
- **Mode toggle**: Compact et accessible sur tous les appareils
- **Boutons tactiles**: Tailles généreuses (48x48px+) pour utilisation en environnement clinique

## 🏗️ Architecture

```
Haraka.ai
├── Frontend (React 19 + Vite)
│   ├── NurseDashboard     → Détection de pose + métriques en temps réel (Edge)
│   ├── DoctorDashboard    → Triage de priorité + rapports médicaux (Cloud)
│   └── ModeToggle         → Commutation fluide infirmier/docteur
├── Backend (Express + Node.js)
│   ├── /api/analyze-session → Pont vers Gemini 1.5 Flash
│   └── /api/health          → Health check
└── MediaPipe SDK (CDN)
    └── Pose detection en temps réel (edge device)
```

## 🚀 Installation & Setup

### Prérequis
- Node.js 18+
- pnpm (ou npm/yarn)
- Google Generative AI API Key (optionnel pour démo)

### Installation

```bash
# Cloner et installer les dépendances
pnpm install

# Créer .env (optionnel pour backend Gemini)
cp .env.example .env
# Editer .env et ajouter GOOGLE_API_KEY si désiré

# Démarrer l'app frontend seulement
pnpm run dev

# Démarrer frontend + backend (si Gemini API disponible)
pnpm run dev:full
```

L'app sera disponible à `http://localhost:3000`

## 📱 Vue Infirmier (Edge AI)

### Layout Mobile-First
- Header compact (patient info + status badge)
- Flux vidéo square (aspect 1:1) prioritaire
- Metrics empilées verticalement sous la vidéo
- Boutons "Terminer" et "Réinitialiser" au pied fixe

### Fonctionnalités
- **Détection de pose** automatique (MediaPipe)
- **Countdown français**: "Tleta" (3) → "Jouj" (2) → "Wahed" (1) → "Bda!" (Go!)
- **Compteur de répétitions** en temps réel
- **Métriques d'angle** (Max et Courant)
- **Alarmes visuelles** si mobilité réduite
- **Support tactile** optimisé pour tablettes

### Flux de travail
1. Positionner le patient à 2m de la tablette
2. Système détecte automatiquement l'alignement pose
3. Cliquer "Démarrer"
4. Les répétitions sont comptées automatiquement
5. Cliquer "Terminer" pour envoyer les données

## 👨‍⚕️ Doctor Dashboard (Cloud AI)

### Layout Responsive
- Triage vertical en colonne sur mobile
- Patient cards pleines largeurs
- Scrollable pour voir tous les cas
- Bouton "1-Tap Validate All" au pied

### Fonctionnalités
- **Triage par priorité**: Critical (rouge) → Review (orange) → Conformes (vert)
- **Patient cards** avec pain scores et AI flags
- **3 onglets de rapport**:
  - Session JSON (raw data from edge)
  - LLM Reasoning (analyse Gemini)
  - Specialist Report (rapport médical)
- **Grounded Generation Flags** (highlights potential hallucinations)

## ⚙️ Configuration Backend

Le serveur Express (port 4000) expose 2 endpoints:

### POST /api/analyze-session
Reçoit les données de la session edge et les envoie à Gemini 1.5 Flash pour analyse.

Input:
```json
{
  "exerciseName": "Élévation Latérale du Bras",
  "reps": 8,
  "maxAngle": 145,
  "patientId": "AL-1956",
  "timestamp": "2024-05-18T14:32:00Z",
  "warnings": ["Mobilité réduite détectée"]
}
```

Output (exemple):
```json
{
  "success": true,
  "sessionId": "SES-1715947520000",
  "patientId": "AL-1956",
  "report": "Évaluation positive de la mobilité latérale...",
  "metrics": { "reps": 8, "maxAngle": 145 }
}
```

### GET /api/health
Retourne `{ "status": "ok", "timestamp": "..." }`

## 🎨 Tech Stack

- **Frontend**: React 19 + Vite + TypeScript
- **Styling**: Tailwind CSS v3.4.3 + Framer Motion
- **Responsive**: Mobile-first avec breakpoints sm/md/lg
- **Backend**: Express.js + Node.js
- **AI**: Google Generative AI (Gemini 1.5 Flash via API)
- **Vision**: MediaPipe Pose (serveur via CDN jsdelivr.net)
- **Icons**: Lucide React

## 📋 Langues & Localisation

- **Frontend UI**: Français + Darija
- **Messages médicaux**: Générés par Gemini en français
- **Countdown**: "Tleta" (3), "Jouj" (2), "Wahed" (1), "Bda!" (Go!)
- **Patient context**: Prénoms marocains/français d'exemple

## 📦 Structure du Projet

```
/vercel/share/v0-project/
├── src/
│   ├── views/
│   │   ├── NurseDashboard.tsx       ← Edge AI dashboard (mobile-optimisé)
│   │   ├── DoctorDashboardView.tsx  ← Cloud AI dashboard (responsive)
│   ├── components/
│   │   ├── ModeToggle.tsx           ← Infirmier/Docteur toggle
│   │   ├── nurse/                   ← Nurse-specific components
│   │   └── doctor/                  ← Doctor-specific components
│   ├── App.tsx                      ← Main app + router
│   └── main.tsx                     ← React entry point
├── index.html                       ← HTML root
├── vite.config.ts                   ← Vite configuration
├── tailwind.config.js               ← Tailwind theming
├── server.ts                        ← Express backend (optionnel)
└── package.json
```

## 🔐 Environnement

```env
# .env (optionnel pour backend Gemini)
GOOGLE_API_KEY=your_google_api_key_here
PORT=4000
NODE_ENV=development
```

## 🚀 Déploiement

### Vercel
```bash
pnpm run build
vercel deploy
```

### Docker
```bash
docker build -t haraka-ai .
docker run -p 3000:3000 haraka-ai
```

## ✅ Vérification Locale

```bash
# Terminal 1: Frontend
pnpm run dev

# Terminal 2: Backend (si API key disponible)
pnpm run server

# Accéder à http://localhost:3000
```

**Sur mobile**: Utilisez Chrome DevTools (F12 → Toggle device toolbar) pour voir le design mobile.

## 📝 Licence

Développé pour UMMC (Unité Médicale Mobile de Rééducation)

## 🤝 Support

Pour plus d'informations sur l'intégration MediaPipe réelle ou l'API Gemini, consultez:
- [MediaPipe Pose](https://mediapipe.dev/solutions/pose)
- [Google Generative AI](https://ai.google.dev)
