import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera as CameraIcon, CheckCircle2, AlertCircle, Play, RefreshCw, Send, ArrowLeft } from "lucide-react";
import { calculateAngle, areLandmarksVisible } from "../utils/biomechanics";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import EmojiPainScale from "../components/nurse/EmojiPainScale";

interface NurseDashboardProps {
  onSessionComplete: (data: any) => void;
  onBack?: () => void;
}

const NurseDashboard: React.FC<NurseDashboardProps> = ({ onSessionComplete, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isStarted, setIsStarted] = useState(false);
  const [reps, setReps] = useState(0);
  const [isPoseAligned, setIsPoseAligned] = useState(false);
  const [isPostSession, setIsPostSession] = useState(false);
  const [painScore, setPainScore] = useState(2);
  const [isCounterActive, setIsCounterActive] = useState(false);
  const [lastAngle, setLastAngle] = useState(0);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [baselineAngles, setBaselineAngles] = useState<{ [key: string]: number }>({});
  const [isCalibrating, setIsCalibrating] = useState(false);

  // Refs for tracking mutable state inside MediaPipe callbacks without causing stale closures
  const repsRef = useRef(0);
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
          const landmarks = results.poseLandmarks;
          const leftHip = landmarks[23];
          const leftShoulder = landmarks[11];
          const leftKnee = landmarks[25];
          const leftWrist = landmarks[15];

          // Check if patient is fully in frame (segmentation accuracy)
          const isAligned = areLandmarksVisible([leftHip, leftShoulder, leftKnee], 0.65);
          setIsPoseAligned(isAligned);

          if (isCalibrating) {
            const baselineAngle = calculateAngle(leftHip, leftShoulder, leftKnee);
            setBaselineAngles((prev) => ({ ...prev, [selectedExercise || "default"]: baselineAngle }));
          } else if (isAligned && isCounterActiveRef.current) {
            let currentAngle = 0;
            if (selectedExercise === "Lumbar Extension") {
              currentAngle = calculateAngle(leftHip, leftShoulder, leftKnee);
            } else if (selectedExercise === "Arm Raise") {
              currentAngle = calculateAngle(leftShoulder, leftWrist, leftHip);
            }

            const normalizedAngle = currentAngle - (baselineAngles[selectedExercise || "default"] || 0);
            setLastAngle((prev) => (Math.abs(prev - normalizedAngle) > 2 ? normalizedAngle : prev));

            if (normalizedAngle > 160 && selectedExercise === "Lumbar Extension") {
              repStateRef.current = "EXTENDED";
            } else if (normalizedAngle < 30 && selectedExercise === "Lumbar Extension") {
              if (repStateRef.current === "EXTENDED") {
                repsRef.current += 1;
                setReps(repsRef.current);
              }
              repStateRef.current = "RELAXED";
            }

            if (normalizedAngle > 180 && selectedExercise === "Arm Raise") {
              repStateRef.current = "EXTENDED";
            } else if (normalizedAngle < 90 && selectedExercise === "Arm Raise") {
              if (repStateRef.current === "EXTENDED") {
                repsRef.current += 1;
                setReps(repsRef.current);
              }
              repStateRef.current = "RELAXED";
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
  }, [selectedExercise, isCalibrating]);

  const handleExerciseSelect = (exercise: string) => {
    setSelectedExercise(exercise);
  };

  const startCalibration = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setIsCalibrating(false);
    }, 30000); // 30-second calibration
  };

  const startWorkout = () => {
    if (!isPoseAligned || !selectedExercise || isCalibrating) return;
    setIsStarted(true);
    setIsCounterActive(false);
  };

  const stopWorkout = async () => {
    setIsCounterActive(false);
    setIsPostSession(true);
    
    const sessionData = {
      session_id: `sess_${Date.now()}`,
      patient_id: "AL-1956",
      exercise_type: "Élévation Latérale du Bras",
      timestamp: new Date().toISOString(),
      exercise_analytics: {
        reps,
        max_angle: 0,
        warnings: 0 < 90 ? ["Mobilité réduite détectée"] : [],
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
            {reps !== null && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10"
              >
                <div className="text-center">
                  <span className="font-outfit text-8xl md:text-9xl font-black text-white drop-shadow-2xl">{reps}</span>
                  <p className="text-2xl font-bold text-white mt-4 tracking-widest uppercase font-outfit drop-shadow-lg">
                    Répétitions
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
              <span className="font-outfit font-bold text-4xl text-slate-800 tabular-nums">{0}°</span>
            </div>
            <div className="text-center border-l border-slate-100">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-2">Actuel</span>
              <span className="font-outfit font-bold text-4xl text-slate-800 tabular-nums">{lastAngle}°</span>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
            <h3 className="font-outfit text-lg font-bold text-slate-900 mb-4">Patient Check-In Assignment</h3>
            <p className="text-slate-600 mb-4">Please select the exercise assigned to you:</p>
            <div className="flex gap-4">
              <button
                onClick={() => handleExerciseSelect("Lumbar Extension")}
                className={`px-4 py-2 rounded-lg font-bold ${selectedExercise === "Lumbar Extension" ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"}`}
              >
                Exercise 1: Lumbar Extension
              </button>
              <button
                onClick={() => handleExerciseSelect("Arm Raise")}
                className={`px-4 py-2 rounded-lg font-bold ${selectedExercise === "Arm Raise" ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"}`}
              >
                Exercise 2: Arm Raise
              </button>
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

          <div className="mt-6">
            <button
              onClick={startCalibration}
              disabled={!selectedExercise || isCalibrating}
              className={`px-6 py-3 rounded-full font-bold text-lg ${
                selectedExercise && !isCalibrating
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed"
              }`}
            >
              Start Calibration
            </button>

            <button
              onClick={startWorkout}
              disabled={!selectedExercise || !isPoseAligned || isCalibrating}
              className={`px-6 py-3 rounded-full font-bold text-lg ${
                selectedExercise && isPoseAligned && !isCalibrating
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed"
              }`}
            >
              Start Exercise
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;
