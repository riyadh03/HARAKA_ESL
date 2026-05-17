import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera as CameraIcon, CheckCircle2, AlertCircle, Play, RefreshCw, Send, ArrowLeft } from "lucide-react";
import EmojiPainScale from "../components/nurse/EmojiPainScale";

interface NurseDashboardProps {
  onSessionComplete: (data: any) => void;
  onBack?: () => void;
}

const NurseDashboard: React.FC<NurseDashboardProps> = ({ onSessionComplete, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [reps, setReps] = useState(0);
  const [maxAngle, setMaxAngle] = useState(0);
  const [isPoseAligned] = useState(true);
  const [isPostSession, setIsPostSession] = useState(false);
  const [painScore, setPainScore] = useState(2);
  const [isCounterActive, setIsCounterActive] = useState(false);
  const [lastAngle, setLastAngle] = useState(0);

  const speak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ar-MA'
    utterance.rate = 0.95
    utterance.pitch = 1
    window.speechSynthesis.speak(utterance)
  }

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

  useEffect(() => {
    if (countdown === null) {
      return
    }

    const countdownSpeech: Record<number, string> = {
      3: 'Tlata',
      2: 'Jouj',
      1: 'Wahed',
      0: 'Bda',
    }

    const spokenWord = countdownSpeech[countdown]
    if (spokenWord) {
      speak(spokenWord)
    }

    if (countdown === 0) {
      setCountdown(null)
      setIsCounterActive(true)
      return
    }

    const timer = window.setTimeout(() => {
      setCountdown((currentCount) => (currentCount !== null ? currentCount - 1 : currentCount))
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [countdown])

  const startWorkout = () => {
    if (!isPoseAligned) return;
    setIsStarted(true);
    setIsCounterActive(false);
    setCountdown(3);
  };

  const stopWorkout = async () => {
    setIsCounterActive(false);
    setIsPostSession(true);
    speak('Kidayr m3a lewja3 daba ?');
    
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
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8 flex flex-col font-inter">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <ArrowLeft size={24} className="text-slate-600" />
            </button>
          )}
          <div>
            <h1 className="font-outfit text-2xl md:text-3xl font-bold text-slate-900">Patient: AL-1956</h1>
            <p className="text-slate-500 font-medium">Session de rééducation assistée par Edge-AI</p>
          </div>
        </div>
        
        {/* Alignment Pill */}
        <div className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold shadow-sm transition-colors duration-300 ${
          isPoseAligned ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {isPoseAligned ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{isPoseAligned ? 'Sujet Aligné' : 'Recherche du Sujet...'}</span>
        </div>
      </header>

      {/* Main Content: 3-column split on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 flex-1">
        
        {/* The Edge-AI Camera Feed (Spans 2 columns) */}
        <div className="lg:col-span-2 relative bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white flex flex-col items-center justify-center min-h-[500px]">
          {/* Mock Canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover opacity-80" />
          
          <div className="z-0 flex flex-col items-center justify-center text-slate-700 pointer-events-none">
            <CameraIcon size={64} className="mb-4 opacity-30" />
            <p className="font-outfit font-semibold opacity-50">Flux Vidéo Sécurisé (Local)</p>
          </div>

          <AnimatePresence>
            {countdown !== null && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10"
              >
                <div className="text-center">
                  <span className="font-outfit text-8xl md:text-9xl font-black text-white drop-shadow-2xl">{countdown}</span>
                  <p className="text-2xl font-bold text-white mt-4 tracking-widest uppercase font-outfit drop-shadow-lg">
                    {getCountdownText(countdown)}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isStarted && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-md z-20">
              <div className="text-center bg-white/10 p-8 rounded-[2rem] border border-white/20 shadow-2xl backdrop-blur-lg">
                <div className="bg-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
                  <CameraIcon className="text-white" size={32} />
                </div>
                <h2 className="font-outfit text-2xl font-bold text-white mb-2">Positionner le Patient</h2>
                <p className="text-slate-300 mb-8 font-medium">Placez la tablette à 2 mètres environ.</p>
                <button
                  onClick={startWorkout}
                  disabled={!isPoseAligned}
                  className={`px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 mx-auto transition-all ${
                    isPoseAligned ? 'bg-white text-emerald-600 shadow-xl hover:scale-105 active:scale-95' : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  <Play fill="currentColor" size={20} />
                  Démarrer la Session
                </button>
              </div>
            </div>
          )}
        </div>

        {/* The Stats Column (Spans 1 column) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Reps Box */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm flex flex-col items-center justify-center flex-1">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Répétitions</span>
            <motion.span 
              key={reps}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-outfit font-black text-8xl text-emerald-600 tabular-nums leading-none"
            >
              {reps}
            </motion.span>
          </div>

          {/* Angles Box */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm grid grid-cols-2 gap-4">
            <div className="text-center">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-2">Max</span>
              <span className="font-outfit font-bold text-4xl text-slate-800 tabular-nums">{maxAngle}°</span>
            </div>
            <div className="text-center border-l border-slate-100">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-2">Actuel</span>
              <span className="font-outfit font-bold text-4xl text-slate-800 tabular-nums">{Math.round(lastAngle)}°</span>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
            {isPostSession ? (
              <div>
                <h3 className="font-outfit text-lg font-bold text-slate-900 mb-4">Pain Assessment</h3>
                <EmojiPainScale painScore={painScore} onPainScoreChange={setPainScore} />
              </div>
            ) : isCounterActive ? (
              <>
                <button
                  onClick={stopWorkout}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  Terminer
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full py-3 text-slate-500 font-bold flex items-center justify-center gap-2 hover:bg-slate-100 hover:text-slate-700 rounded-2xl transition-colors"
                >
                  <RefreshCw size={18} />
                  Réinitialiser
                </button>
              </>
            ) : (
              <div className="flex items-center justify-center h-[104px] text-slate-400 font-medium">
                En attente du démarrage...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;
