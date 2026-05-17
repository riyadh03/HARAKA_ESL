import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera as CameraIcon, CheckCircle2, AlertCircle, Play, RefreshCw, Send, ArrowLeft } from "lucide-react";
import { calculateAngle, areLandmarksVisible } from "../utils/biomechanics";
import { Pose, POSE_CONNECTIONS } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import EmojiPainScale from "../components/nurse/EmojiPainScale";

interface NurseDashboardProps {
  onSessionComplete: (data: any) => void;
  onBack?: () => void;
}

const NurseDashboard: React.FC<NurseDashboardProps> = ({ onSessionComplete, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const countdownAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const [isStarted, setIsStarted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCountdownAudioPlaying, setIsCountdownAudioPlaying] = useState(false);
  const [reps, setReps] = useState(0);
  const [maxAngle, setMaxAngle] = useState(0);
  const [isPoseAligned, setIsPoseAligned] = useState(false);
  const [isPostSession, setIsPostSession] = useState(false);
  const [painScore, setPainScore] = useState(2);
  const [isCounterActive, setIsCounterActive] = useState(false);
  const [lastAngle, setLastAngle] = useState(0);

  // Refs for tracking mutable state inside MediaPipe callbacks without causing stale closures
  const repsRef = useRef(0);
  const maxAngleRef = useRef(0);
  const repStateRef = useRef<'RELAXED' | 'EXTENDED'>('RELAXED');
  const isCounterActiveRef = useRef(false);

  useEffect(() => {
    isCounterActiveRef.current = isCounterActive;
  }, [isCounterActive]);

  // MediaPipe Initialization
  useEffect(() => {
    let camera: Camera | null = null;
    let pose: Pose | null = null;

    const initializeMediaPipe = () => {
      if (!videoRef.current || !canvasRef.current) return;

      pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults((results) => {
        const canvasCtx = canvasRef.current?.getContext('2d');
        if (!canvasCtx || !canvasRef.current) return;

        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Draw the camera frame
        if (results.image) {
          canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
        }

        // Ensure we have landmarks
        if (results.poseLandmarks) {
          // Draw skeleton
          drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#10b981', lineWidth: 4 });
          drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#ffffff', lineWidth: 2, radius: 4 });

          // Extract Left Arm Joints (11: Shoulder, 13: Elbow, 15: Wrist)
          // For a lateral raise, we typically measure the angle between Hip(23), Shoulder(11), and Elbow(13)
          // Or just Torso to Arm angle
          const leftHip = results.poseLandmarks[23];
          const leftShoulder = results.poseLandmarks[11];
          const leftElbow = results.poseLandmarks[13];

          // Check if patient is fully in frame (segmentation accuracy)
          const isAligned = areLandmarksVisible([leftHip, leftShoulder, leftElbow], 0.65);
          setIsPoseAligned(isAligned);

          if (isAligned && isCounterActiveRef.current) {
            // Calculate biomechanical angle
            const angle = calculateAngle(leftHip, leftShoulder, leftElbow);
            const currentAngle = Math.round(angle);
            
            // Only update React state if changed significantly to avoid lagging the UI
            setLastAngle((prev) => (Math.abs(prev - currentAngle) > 2 ? currentAngle : prev));

            // Track Max Angle
            if (currentAngle > maxAngleRef.current) {
              maxAngleRef.current = currentAngle;
              setMaxAngle(currentAngle);
            }

            // Automatic Repetition State Machine
            if (currentAngle < 30) {
              if (repStateRef.current === 'EXTENDED') {
                repsRef.current += 1;
                setReps(repsRef.current);
              }
              repStateRef.current = 'RELAXED';
            } else if (currentAngle > 80) {
              repStateRef.current = 'EXTENDED';
            }
          }
        } else {
          setIsPoseAligned(false);
        }
        
        canvasCtx.restore();
      });

      // Start the Camera
      camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && pose) {
            await pose.send({ image: videoRef.current });
          }
        },
        width: 1280,
        height: 720,
      });
      
      camera.start();
    };

    initializeMediaPipe();

    // Cleanup
    return () => {
      if (camera) camera.stop();
      if (pose) pose.close();
    };
  }, []);

  const startWorkout = () => {
    if (!isPoseAligned) return;
    setIsStarted(true);
    setIsCounterActive(false);

    if (typeof window === 'undefined') {
      setCountdown(null);
      setIsCounterActive(true);
      return;
    }

    setCountdown(3);
    const audio = new Audio('/audio/tlatajoujwahed.mp3');
    countdownAudioRef.current = audio;
    setIsCountdownAudioPlaying(true);
    
    audio.onended = () => {
      setIsCountdownAudioPlaying(false);
      countdownAudioRef.current = null;
      setCountdown(null);
      setIsCounterActive(true);
    };
    audio.onerror = () => {
      setIsCountdownAudioPlaying(false);
      countdownAudioRef.current = null;
      setCountdown(null);
      setIsCounterActive(true);
    };
    void audio.play().catch(() => {
      setIsCountdownAudioPlaying(false);
      countdownAudioRef.current = null;
      setCountdown(null);
      setIsCounterActive(true);
    });
  };

  const stopCountdownAudio = () => {
    countdownAudioRef.current?.pause();
    if (countdownAudioRef.current) {
      countdownAudioRef.current.currentTime = 0;
    }
    countdownAudioRef.current = null;
    setIsCountdownAudioPlaying(false);
    setCountdown(null);
    setIsCounterActive(false);
    setIsStarted(false);
  };

  const stopWorkout = async () => {
    setIsCounterActive(false);
    setIsPostSession(true);
    speak('Kidayr m3a lewja3 daba ?');
    
    const sessionData = {
      session_id: `sess_${Date.now()}`,
      patient_id: "AL-1956",
      exercise_type: "Élévation Latérale du Bras",
      timestamp: new Date().toISOString(),
      exercise_analytics: {
        reps,
        max_angle: maxAngle,
        warnings: maxAngle < 90 ? ["Mobilité réduite détectée"] : [],
      },
      pain_scale: 0,
      calibration_baseline: {}
    };

    try {
      const response = await fetch('http://localhost:8000/api/v1/session/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });

      if (response.ok) {
        const result = await response.json();
        onSessionComplete({
          ...sessionData,
          report: result.report || result.raw_report,
          amber_flags: result.amber_flags || [],
          verification_status: result.verification_status,
          metrics: sessionData.exercise_analytics
        });
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
      {/* Hidden video element for MediaPipe processing */}
      <video ref={videoRef} className="hidden" playsInline></video>

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
        
        <div className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold shadow-sm transition-colors duration-300 ${
          isPoseAligned ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {isPoseAligned ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{isPoseAligned ? 'Sujet Aligné' : 'Recherche du Sujet...'}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 flex-1">
        <div className="lg:col-span-2 relative bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white flex flex-col items-center justify-center min-h-[500px]">
          {/* MediaPipe rendering Canvas */}
          <canvas ref={canvasRef} width={1280} height={720} className="absolute inset-0 w-full h-full object-cover" />
          
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
                  {isCountdownAudioPlaying && (
                    <button
                      onClick={stopCountdownAudio}
                      className="mt-6 px-5 py-2 rounded-full bg-white/15 text-white font-bold hover:bg-white/25 transition-colors"
                    >
                      Stop Audio
                    </button>
                  )}
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

        <div className="lg:col-span-1 flex flex-col gap-6">
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

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm grid grid-cols-2 gap-4">
            <div className="text-center">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-2">Max</span>
              <span className="font-outfit font-bold text-4xl text-slate-800 tabular-nums">{maxAngle}°</span>
            </div>
            <div className="text-center border-l border-slate-100">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-2">Actuel</span>
              <span className="font-outfit font-bold text-4xl text-slate-800 tabular-nums">{lastAngle}°</span>
            </div>
          </div>

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
