import { motion } from 'framer-motion'

interface CameraFeedProps {
  privacyMode: 'normal' | 'silhouette' | 'blur'
  showCountdown: boolean
}

export default function CameraFeed({ privacyMode, showCountdown }: CameraFeedProps) {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
      {/* Skeleton landmarks visualization */}
      <div className="absolute inset-0 flex items-center justify-center">
        {privacyMode === 'silhouette' ? (
          <div className="w-32 h-48 bg-gradient-to-b from-slate-600 to-slate-700 rounded-full opacity-60" />
        ) : privacyMode === 'blur' ? (
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-32 h-48 bg-slate-600 rounded-full blur-xl opacity-40"
          />
        ) : (
          <div className="relative w-40 h-48">
            {/* Simple skeleton visualization */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-full" />
              <div className="w-2 h-12 bg-emerald-500" />
              <div className="flex gap-8 w-full justify-center">
                <div className="w-2 h-16 bg-emerald-500" />
                <div className="w-2 h-16 bg-emerald-500" />
              </div>
              <div className="flex gap-8 w-full justify-center">
                <div className="w-2 h-16 bg-emerald-500" />
                <div className="w-2 h-16 bg-emerald-500" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Corner labels */}
      <div className="absolute top-4 left-4 text-slate-400 text-sm font-medium">MediaPipe</div>
      <div className="absolute bottom-4 right-4 text-slate-400 text-sm font-medium">Live Feed</div>
    </div>
  )
}
