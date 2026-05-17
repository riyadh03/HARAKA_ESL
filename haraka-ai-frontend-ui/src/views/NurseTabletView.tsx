import { useState } from 'react'
import { Volume2 } from 'lucide-react'
import { motion } from 'framer-motion'
import HardwareHealthBadge from '../components/nurse/HardwareHealthBadge'
import CameraFeed from '../components/nurse/CameraFeed'
import SessionPanel from '../components/nurse/SessionPanel'
import PrivacyToggle from '../components/nurse/PrivacyToggle'

type SessionState = 'calibration' | 'exercise' | 'post-session'
type PrivacyMode = 'normal' | 'silhouette' | 'blur'

export default function NurseTabletView() {
  const [sessionState, setSessionState] = useState<SessionState>('calibration')
  const [privacyMode, setPrivacyMode] = useState<PrivacyMode>('normal')
  const [showCountdown, setShowCountdown] = useState(true)
  const [repsCount, setRepsCount] = useState(8)
  const [totalReps, setTotalReps] = useState(15)
  const [jointAngle, setJointAngle] = useState(45)
  const [showAlert, setShowAlert] = useState(false)
  const [painScore, setPainScore] = useState(2)

  const handleSimulateExercise = () => {
    setSessionState('exercise')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  const handleCompleteSession = () => {
    setSessionState('post-session')
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-slate-50 p-4 gap-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-outfit text-2xl font-bold text-slate-900">Patient: Aammi Lahcen</h2>
          <p className="text-slate-700">Session ID: SES-2024-0518-001</p>
        </div>
        <HardwareHealthBadge />
      </div>

      {/* Main content */}
      <div className="flex-1 flex gap-4">
        {/* Camera Feed */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="relative flex-1 bg-slate-800 rounded-xl overflow-hidden border-2 border-emerald-600">
            <CameraFeed privacyMode={privacyMode} showCountdown={showCountdown} />
          </div>

          {/* Audio Countdown Trigger */}
          {showCountdown && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-amber-400 text-slate-900 px-4 py-3 rounded-lg flex items-center justify-center gap-3 font-outfit font-bold text-lg"
            >
              <Volume2 size={24} />
              3... 2... 1... Bda!
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 flex flex-col gap-3">
          {/* Privacy Toggle */}
          <PrivacyToggle privacyMode={privacyMode} onPrivacyModeChange={setPrivacyMode} />

          {/* Session Panel */}
          <SessionPanel
            sessionState={sessionState}
            repsCount={repsCount}
            totalReps={totalReps}
            jointAngle={jointAngle}
            showAlert={showAlert}
            painScore={painScore}
            onPainScoreChange={setPainScore}
            onSimulateExercise={handleSimulateExercise}
            onCompleteSession={handleCompleteSession}
          />
        </div>
      </div>
    </div>
  )
}
