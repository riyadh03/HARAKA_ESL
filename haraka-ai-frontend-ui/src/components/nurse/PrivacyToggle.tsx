import { Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'

interface PrivacyToggleProps {
  privacyMode: 'normal' | 'silhouette' | 'blur'
  onPrivacyModeChange: (mode: 'normal' | 'silhouette' | 'blur') => void
}

export default function PrivacyToggle({ privacyMode, onPrivacyModeChange }: PrivacyToggleProps) {
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
      <h3 className="font-outfit font-bold text-slate-900 mb-3 flex items-center gap-2">
        <Eye size={18} /> Visual Privacy Mode
      </h3>
      <div className="flex gap-2">
        {[
          { id: 'normal', label: 'Normal' },
          { id: 'silhouette', label: 'Silhouette' },
          { id: 'blur', label: 'Blur Face' },
        ].map((option) => (
          <motion.button
            key={option.id}
            onClick={() => onPrivacyModeChange(option.id as any)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
              privacyMode === option.id
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {option.label}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
