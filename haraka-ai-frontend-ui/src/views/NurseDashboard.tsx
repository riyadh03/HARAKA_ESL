import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera as CameraIcon, CheckCircle2, AlertCircle, Play, RefreshCw, Send } from "lucide-react";

interface NurseDashboardProps {
  onSessionComplete: (data: any) => void;
}

const NurseDashboard: React.FC<NurseDashboardProps> = ({ onSessionComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [reps, setReps] = useState(0);
  const [maxAngle, setMaxAngle] = useState(0);
  const [isPoseAligned, setIsPoseAligned] = useState(true);
  const [isCounterActive, setIsCounterActive] = useState(false);
  const [lastAngle, setLastAngle] = useState(0);

  // Mock pose detection
  useEffect(() => {
    if (isCounterActive) {
      const interval = setInterval(() => {
        const angle = Math.random() * 180;
        setLastAngle(Math.round(angle));
        if (angle > maxAngle) {
          setMaxAngle(Math.round(angle));
        }
        if (Math.random() > 0.7) {
          setReps(prev => prev + 1);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isCounterActive, maxAngle]);

  const startWorkout = () => {
    if (!isPoseAligned) return;
    setIsStarted(true);
    let count = 3;
    setCountdown(count);

    const interval = setInterval(() => {
      count -= 1;
      if (count === 0) {
        clearInterval(interval);
        setCountdown(null);
        setIsCounterActive(true);
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const stopWorkout = async () => {
    setIsCounterActive(false);
    
    const sessionData = {
      exerciseName: "Élévation Latérale du Bras",
      reps,
      maxAngle,
      patientId: "AL-1956",
      timestamp: new Date().toISOString(),
      warnings: maxAngle < 90 ? ["Mobilité réduite détectée"] : [],
    };

    try {
      const response = await fetch('http://localhost:4000/api/analyze-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });

      if (response.ok) {
        const result = await response.json();
        onSessionComplete(result);
      } else {
        onSessionComplete(sessionData);
      }
    } catch (error) {
      onSessionComplete(sessionData);
    }
  };

  const getCountdownText = (num: number) => {
    switch (num) {
      case 3: return "Tleta";
      case 2: return "Jouj";
      case 1: return "Wahed";
      default: return "Bda!";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Compact Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-3 max-w-full">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-slate-800 truncate">Haraka.ai</h1>
            <p className="text-xs text-slate-500">Patient: AL-1956</p>
          </div>
          <div className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold flex-shrink-0 whitespace-nowrap ${
            isPoseAligned ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {isPoseAligned ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            <span className="hidden sm:inline">{isPoseAligned ? 'Prêt' : 'Position'}</span>
          </div>
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto flex flex-col pb-4">
        {/* Video Feed Section - Priority */}
        <div className="relative bg-black w-full flex-shrink-0 border-b-4 border-white aspect-square">
          <canvas ref={canvasRef} className="w-full h-full object-cover" width={640} height={480} />
          
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-black flex items-center justify-center">
            <div className="text-center pointer-events-none">
              <CameraIcon className="text-white/20 mb-4 mx-auto" size={64} />
              <p className="text-white/30 text-sm">Flux vidéo</p>
            </div>
          </div>
          
          <AnimatePresence>
            {countdown !== null && (
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10"
              >
                <div className="text-center">
                  <span className="text-7xl sm:text-8xl font-black text-white drop-shadow-lg">{countdown}</span>
                  <p className="text-lg sm:text-xl font-bold text-white mt-2 uppercase tracking-wider">
                    {getCountdownText(countdown)}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isStarted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-20 p-4">
              <div className="text-center">
                <div className="bg-emerald-500 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/50">
                  <CameraIcon className="text-white" size={28} />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white mb-2">Positionner le Patient</h2>
                <p className="text-slate-300 text-xs sm:text-sm mb-4">2 mètres de la tablette</p>
                <button
                  onClick={startWorkout}
                  disabled={!isPoseAligned}
                  className={`px-6 sm:px-8 py-3 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 mx-auto transition-all ${
                    isPoseAligned ? 'bg-white text-emerald-600 shadow-xl hover:shadow-2xl active:scale-95' : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Play fill="currentColor" size={16} />
                  Démarrer
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Metrics Section - Stacked on Mobile */}
        <div className="px-3 py-3 sm:px-4 sm:py-4 space-y-2 sm:space-y-3 flex-1">
          {/* Big Reps Counter */}
          <motion.div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm">
            <div className="text-center">
              <span className="block text-5xl sm:text-6xl font-black text-emerald-600 tabular-nums">{reps}</span>
              <span className="text-xs sm:text-sm text-slate-500 font-bold uppercase tracking-wider">Répétitions</span>
            </div>
          </motion.div>

          {/* Angle Metrics - 2 Column */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-sm text-center">
              <span className="block text-2xl sm:text-3xl font-black text-slate-800 tabular-nums">{maxAngle}°</span>
              <span className="text-xs text-slate-500 font-bold uppercase">Max</span>
            </div>
            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-sm text-center">
              <span className="block text-2xl sm:text-3xl font-black text-slate-800 tabular-nums">{Math.round(lastAngle)}°</span>
              <span className="text-xs text-slate-500 font-bold uppercase">Actuel</span>
            </div>
          </div>

          {/* Alert Box */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 rounded">
            <p className="text-xs sm:text-sm font-medium text-blue-900">
              ✓ Bras entièrement visibles
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Controls - Fixed */}
      <div className="bg-white border-t border-slate-200 px-3 sm:px-4 py-2 sm:py-3 gap-2 sm:gap-3 flex flex-col flex-shrink-0">
        {isCounterActive ? (
          <>
            <button
              onClick={stopWorkout}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold py-3 sm:py-4 rounded-lg sm:rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Send size={18} />
              <span className="text-sm sm:text-base">Terminer</span>
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-2.5 sm:py-3 text-slate-600 font-semibold flex items-center justify-center gap-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw size={16} />
              <span className="text-xs sm:text-sm">Réinitialiser</span>
            </button>
          </>
        ) : (
          <p className="text-center text-slate-500 text-xs sm:text-sm py-2">En attente...</p>
        )}
      </div>
    </div>
  );
};

export default NurseDashboard;
