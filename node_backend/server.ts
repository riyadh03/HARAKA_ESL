import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

interface SessionData {
  exerciseName: string
  reps: number
  maxAngle: number
  patientId: string
  timestamp: string
  warnings: string[]
}

app.post('/api/analyze-session', async (req, res) => {
  try {
    const sessionData: SessionData = req.body

    // Construire le prompt pour Gemini
    const prompt = `Tu es un médecin spécialiste en rééducation fonctionnelle. Analyse cette session de réadaptation:

Exercice: ${sessionData.exerciseName}
Répétitions: ${sessionData.reps}
Angle maximal détecté: ${sessionData.maxAngle}°
ID Patient: ${sessionData.patientId}
Timestamp: ${sessionData.timestamp}
Alertes détectées: ${sessionData.warnings.length > 0 ? sessionData.warnings.join(', ') : 'Aucune'}

Génère un rapport médical en FRANÇAIS (Darija et français mélangés naturellement) incluant:
1. Évaluation de la mobilité articulaire
2. Compliance du patient
3. Recommandations pour la prochaine session
4. Alertes si mobilité réduite
5. Suggestion d'intensité (Maintien / Progression / Léger)

Format: Rapport structuré, concis, adapté à une unité médicale mobile.`

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(prompt)
    const reportText = result.response.text()

    res.json({
      success: true,
      sessionId: `SES-${Date.now()}`,
      patientId: sessionData.patientId,
      exerciseName: sessionData.exerciseName,
      report: reportText,
      metrics: {
        reps: sessionData.reps,
        maxAngle: sessionData.maxAngle,
        warnings: sessionData.warnings,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error analyzing session:', error)
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'analyse de la session',
    })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`[Haraka.ai Backend] Serveur démarré sur le port ${PORT}`)
  console.log(`[Edge-to-Cloud] Pont Express ↔ Gemini 1.5 Flash activé`)
})
