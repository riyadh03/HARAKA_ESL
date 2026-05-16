import { Smartphone, MonitorPlay } from 'lucide-react'
import { motion } from 'framer-motion'

interface ModeToggleProps {
  currentMode: 'nurse' | 'doctor'
  onModeChange: (mode: 'nurse' | 'doctor') => void
}

export default function ModeToggle({ currentMode, onModeChange }: ModeToggleProps) {
  return (
    <div className="bg-slate-800 text-slate-50 px-6 py-4 flex items-center justify-between shadow-lg">
      <div>
        <h1 className="font-outfit text-2xl font-bold text-emerald-600">Haraka.ai</h1>
        <p className="text-sm text-slate-300">Edge-to-Cloud Tele-Rehabilitation</p>
      </div>
      <div className="flex gap-3">
        {[
          { id: 'nurse', label: 'Nurse Tablet', icon: Smartphone },
          { id: 'doctor', label: 'Doctor Dashboard', icon: MonitorPlay },
        ].map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            onClick={() => onModeChange(id as any)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              currentMode === id
                ? 'bg-emerald-600 text-slate-50 shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Icon size={18} />
            {label}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
