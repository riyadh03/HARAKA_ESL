import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Stethoscope } from 'lucide-react'
import NurseDashboard from './views/NurseDashboard'
import DoctorDashboardView from './views/DoctorDashboardView'

type ViewMode = 'selection' | 'nurse' | 'doctor'

export default function App() {
  const [mode, setMode] = useState<ViewMode>('selection')

  return (
    <div className="min-h-screen bg-slate-50 font-inter text-slate-900">
      <AnimatePresence mode="wait">
        {mode === 'selection' && (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen flex items-center justify-center p-4 md:p-8 lg:p-12"
          >
            <div className="max-w-5xl w-full">
              <div className="text-center mb-12">
                <h1 className="font-outfit text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight mb-4">
                  Haraka.ai
                </h1>
                <p className="text-lg md:text-xl text-slate-600 font-medium">
                  Sélectionnez votre rôle pour continuer
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                {/* Nurse Hero Card */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMode('nurse')}
                  className="relative overflow-hidden group text-left rounded-[2.5rem] bg-white border border-slate-200 p-8 md:p-12 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 h-[400px] flex flex-col justify-end"
                >
                  {/* Decorative Blob */}
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 group-hover:opacity-70 transition-opacity" />
                  
                  <div className="absolute top-8 left-8 bg-blue-50 text-blue-600 p-4 rounded-3xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <Activity size={48} strokeWidth={1.5} />
                  </div>
                  
                  <div className="relative z-10">
                    <h2 className="font-outfit text-3xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                      Espace Infirmier
                    </h2>
                    <p className="text-slate-600 text-lg leading-relaxed">
                      Capture biométrique en temps réel et accompagnement Edge-AI du patient.
                    </p>
                  </div>
                </motion.button>

                {/* Doctor Hero Card */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMode('doctor')}
                  className="relative overflow-hidden group text-left rounded-[2.5rem] bg-white border border-slate-200 p-8 md:p-12 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 h-[400px] flex flex-col justify-end"
                >
                  {/* Decorative Blob */}
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 group-hover:opacity-70 transition-opacity" />
                  
                  <div className="absolute top-8 left-8 bg-emerald-50 text-emerald-600 p-4 rounded-3xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <Stethoscope size={48} strokeWidth={1.5} />
                  </div>
                  
                  <div className="relative z-10">
                    <h2 className="font-outfit text-3xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">
                      Espace Médecin
                    </h2>
                    <p className="text-slate-600 text-lg leading-relaxed">
                      Dashboard de triage, analyse de données brutes et rapports Gemini.
                    </p>
                  </div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {mode === 'nurse' && (
          <motion.div
            key="nurse"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="min-h-screen bg-slate-50"
          >
            <NurseDashboard onSessionComplete={(data) => console.log('Session:', data)} onBack={() => setMode('selection')} />
          </motion.div>
        )}

        {mode === 'doctor' && (
          <motion.div
            key="doctor"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="min-h-screen bg-slate-50"
          >
            <DoctorDashboardView onBack={() => setMode('selection')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
