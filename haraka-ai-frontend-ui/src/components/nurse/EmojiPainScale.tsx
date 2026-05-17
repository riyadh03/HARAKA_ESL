import { motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'

export default function EmojiPainScale({ painScore, onPainScoreChange }) {
  const painEmojis = ['😊', '🙂', '😐', '😕', '😢']
  const painColors = ['bg-green-500', 'bg-yellow-500', 'bg-orange-400', 'bg-orange-600', 'bg-red-600']
  const painLabels = ['No pain', 'Mild', 'Moderate', 'Severe', 'Worst pain']

  return (
    <div className="flex flex-col gap-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-amber-100 text-amber-900 px-4 py-3 rounded-lg flex items-center justify-center gap-3 font-outfit font-bold text-lg"
      >
        <Volume2 size={24} className="text-amber-600" />
        Kidayr m3a lewja3 daba ?
      </motion.div>

      <div>
        <div className="flex gap-2 mb-3">
          {painEmojis.map((emoji, idx) => (
            <motion.button
              key={idx}
              onClick={() => onPainScoreChange(idx)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 py-3 rounded-lg text-2xl transition-all ${
                painScore === idx
                  ? `${painColors[idx]} scale-110 shadow-lg text-white`
                  : 'bg-slate-100 scale-100'
              }`}
            >
              {emoji}
            </motion.button>
          ))}
        </div>
        <p className="text-xs text-slate-600 text-center font-medium">
          {painLabels[painScore] || 'Select your pain level'}
        </p>
      </div>
    </div>
  )
}
