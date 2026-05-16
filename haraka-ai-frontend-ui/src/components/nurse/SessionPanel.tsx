import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff, AlertCircle } from 'lucide-react'

interface SessionPanelProps {
  sessionState: 'calibration' | 'exercise' | 'post-session'
  repsCount: number
  totalReps: number
  jointAngle: number
  showAlert: boolean
  painScore: number
  isRecording: boolean
  onPainScoreChange: (score: number) => void
  onRecordingToggle: (recording: boolean) => void
  onSimulateExercise: () => void
  onCompleteSession: () => void
}

export default function SessionPanel({
  sessionState,
  repsCount,
  totalReps,
  jointAngle,
  showAlert,
  painScore,
  isRecording,
  onPainScoreChange,
  onRecordingToggle,
  onSimulateExercise,
  onCompleteSession,
}: SessionPanelProps) {
  const [calibrationTime, setCalibrationTime] = useState(30)

  useEffect(() => {
    if (sessionState === 'calibration' && calibrationTime > 0) {
      const timer = setTimeout(() => setCalibrationTime(calibrationTime - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [calibrationTime, sessionState])

  const painEmojis = ['😊', '🙂', '😐', '😕', '😢']
  const painColors = ['bg-green-500', 'bg-yellow-500', 'bg-orange-400', 'bg-orange-600', 'bg-red-600']

  return (
    <div className="flex-1 flex flex-col gap-3">
      {sessionState === 'calibration' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 rounded-xl p-4 border-2 border-emerald-600"
        >
          <div className="text-center mb-4">
            <h3 className="font-outfit font-bold text-slate-900 mb-2">Calibration</h3>
            <p className="text-sm text-slate-700">
              Video ma kay tsejjelch w wjhek ma baynch
            </p>
            <p className="text-xs text-slate-600 mt-1">(Video is not recorded)</p>
          </div>

          {/* Progress ring */}
          <div className="flex justify-center mb-4">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="4"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 * (1 - calibrationTime / 30)}
                  animate={{ strokeDashoffset: 251.2 * (1 - calibrationTime / 30) }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="font-outfit font-bold text-lg text-emerald-600">{calibrationTime}s</p>
                </div>
              </div>
            </div>
          </div>

          <motion.button
            onClick={onSimulateExercise}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg"
          >
            Start Exercise
          </motion.button>
        </motion.div>
      )}

      {sessionState === 'exercise' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 border border-slate-200 flex-1 flex flex-col"
        >
          <h3 className="font-outfit font-bold text-slate-900 mb-4">Exercise Session</h3>

          {/* Repetition Counter */}
          <div className="text-center mb-4">
            <p className="text-sm text-slate-600 mb-1">Repetitions</p>
            <p className="font-outfit text-5xl font-bold text-emerald-600">
              {repsCount} / {totalReps}
            </p>
          </div>

          {/* Joint Angle */}
          <div className="bg-slate-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-slate-600 mb-2">Joint Angle</p>
            <div className="flex items-end justify-between">
              <p className="font-outfit text-4xl font-bold text-slate-900">{jointAngle}°</p>
              <div className="flex gap-1 h-16">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t ${
                      i * 10 <= jointAngle ? 'bg-emerald-600' : 'bg-slate-200'
                    }`}
                    style={{ height: `${(i + 1) * 10}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Red Alert */}
          {showAlert && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border-2 border-red-600 rounded-lg p-3 mb-4 flex items-center gap-2"
            >
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <div>
                <p className="font-outfit font-bold text-red-600">Mouvement incorrect</p>
                <p className="text-xs text-red-700">Check form and alignment</p>
              </div>
            </motion.div>
          )}

          <motion.button
            onClick={onCompleteSession}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg"
          >
            Complete Session
          </motion.button>
        </motion.div>
      )}

      {sessionState === 'post-session' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 border border-slate-200 flex-1 flex flex-col"
        >
          <h3 className="font-outfit font-bold text-slate-900 mb-4">Pain Assessment</h3>

          {/* Pain Scale */}
          <div className="mb-4">
            <div className="flex gap-2 mb-3">
              {painEmojis.map((emoji, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => onPainScoreChange(idx)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-1 py-3 rounded-lg text-2xl transition-all ${
                    painScore === idx ? `${painColors[idx]} scale-110 shadow-lg` : 'bg-slate-100 scale-100'
                  }`}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
            <p className="text-xs text-slate-600 text-center">
              {['No pain', 'Mild', 'Moderate', 'Severe', 'Worst pain'][painScore]}
            </p>
          </div>

          {/* Voice Recording */}
          <motion.button
            onClick={() => onRecordingToggle(!isRecording)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg ${
              isRecording
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
            {isRecording ? 'Stop Recording' : 'Record Voice Note'}
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
