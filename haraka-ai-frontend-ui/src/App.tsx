import { useState } from 'react'
import { motion } from 'framer-motion'
import NurseDashboard from './views/NurseDashboard'
import DoctorDashboardView from './views/DoctorDashboardView'
import ModeToggle from './components/ModeToggle'

type ViewMode = 'nurse' | 'doctor'

export default function App() {
  const [mode, setMode] = useState<ViewMode>('nurse')

  return (
    <div className="min-h-screen bg-slate-50">
      <ModeToggle currentMode={mode} onModeChange={setMode} />
      <motion.div
        key={mode}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {mode === 'nurse' ? <NurseDashboard onSessionComplete={(data) => console.log('Session:', data)} /> : <DoctorDashboardView />}
      </motion.div>
    </div>
  )
}
