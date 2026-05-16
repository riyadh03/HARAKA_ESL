import { useState, useEffect } from 'react'
import { Download, Edit2, ShieldCheck, Database } from 'lucide-react'
import { motion } from 'framer-motion'

interface Patient {
  id: string
  name: string
  status: 'critical' | 'review' | 'clean'
  painScore?: number
  redFlags?: string[]
}

interface PatientReportProps {
  patient: Patient
}

const MOCK_JSON = {
  session_id: 'SES-2024-0518-001',
  patient_name: 'Aammi Lahcen',
  timestamp: '2024-05-18T14:32:00Z',
  exercise_type: 'Knee Flexion',
  total_reps: 15,
  completed_reps: 8,
  joint_angles: [45, 47, 46, 48, 50, 49, 51, 52],
  pain_score: 4,
  warnings: ['Mobilité réduite détectée']
}

const MOCK_REPORT = `**Rapport Clinique: Aammi Lahcen**

La session de rééducation effectuée indique une progression modérée avec quelques points d'attention. Le patient a complété 8 répétitions sur les 15 prescrites pour l'exercice de flexion du genou. 

Le score de douleur rapporté est de 4/5. **L'analyse IA a détecté une instabilité potentielle de l'articulation lors des dernières répétitions, non mesurée directement par les capteurs d'angle.** Une validation spécialiste est requise.

Globalement, la trajectoire de récupération est positive. Un maintien de l'intensité actuelle avec correction posturale est suggéré.`

export default function PatientReport({ patient }: PatientReportProps) {
  const [protocol, setProtocol] = useState('Continuer le protocole actuel')
  const [isLoading, setIsLoading] = useState(true)

  // Simulate AI Loading
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [patient])

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-outfit text-4xl font-bold text-slate-900 mb-2">{patient.name}</h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <span>ID: SES-2024-0518-001</span>
            <span>•</span>
            <span>Transmission Edge-AI validée</span>
          </p>
        </div>
        <div className="bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm flex items-center gap-2 text-slate-700 font-bold">
          <ShieldCheck size={18} className="text-emerald-600" />
          CNDP Compliant
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1">
        
        {/* Left Column: Tiny JSON Terminal */}
        <div className="bg-slate-900 rounded-[2.5rem] p-6 lg:p-8 flex flex-col shadow-xl border border-slate-800">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
            <div className="p-2 bg-slate-800 rounded-xl text-emerald-400">
              <Database size={24} />
            </div>
            <div>
              <h2 className="font-outfit font-bold text-white text-xl">Raw Edge Data</h2>
              <p className="text-slate-400 text-sm">Payload 5KB • Latence 120ms</p>
            </div>
          </div>
          
          <div className="flex-1 bg-black/50 rounded-2xl p-4 overflow-auto border border-white/5">
            <pre className="text-emerald-400 font-mono text-xs sm:text-sm leading-relaxed">
              {JSON.stringify({ ...MOCK_JSON, patient_name: patient.name }, null, 2)}
            </pre>
          </div>
        </div>

        {/* Right Column: AI Insight */}
        <div className="bg-white rounded-[2.5rem] p-6 lg:p-8 border border-slate-200 shadow-xl flex flex-col">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold font-outfit text-xl">
              AI
            </div>
            <div>
              <h2 className="font-outfit font-bold text-slate-900 text-xl">Gemini Insight</h2>
              <p className="text-slate-500 text-sm">Génération basée sur le JSON brut</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            {isLoading ? (
              <div className="space-y-4">
                <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-slate-200 rounded animate-pulse w-5/6"></div>
                <div className="h-4 bg-slate-200 rounded animate-pulse w-full mt-8"></div>
                <div className="h-4 bg-slate-200 rounded animate-pulse w-4/5"></div>
              </div>
            ) : (
              <div className="prose prose-slate max-w-none text-slate-700 italic font-serif leading-loose text-lg">
                {MOCK_REPORT.split('\n').map((line, idx) => {
                  const isHighlighted = line.includes('L\'analyse IA a détecté')
                  return (
                    <p
                      key={idx}
                      className={`mb-4 ${
                        isHighlighted ? 'bg-amber-100 text-amber-900 not-italic px-4 py-2 rounded-xl font-medium border border-amber-200 shadow-sm' : ''
                      }`}
                    >
                      {line}
                    </p>
                  )
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                <Edit2 size={16} className="inline mr-2" />
                Ajustement du Protocole
              </label>
              <textarea
                value={protocol}
                onChange={(e) => setProtocol(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 resize-none h-20 transition-colors text-slate-800 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
              >
                <Download size={18} />
                Exporter
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
              >
                Valider
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
