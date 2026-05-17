import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera as CameraIcon, CheckCircle2, AlertCircle, Play, RefreshCw, Send, ArrowLeft } from "lucide-react";
import { calculateAngle, areLandmarksVisible } from "../utils/biomechanics";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import EmojiPainScale from "../components/nurse/EmojiPainScale";

// Use global window objects loaded via CDN in index.html
declare global {
  interface Window {
    Pose: any;
    Camera: any;
    POSE_CONNECTIONS: any;
  }
}

interface NurseDashboardProps {
  onSessionComplete: (data: any) => void;
  onBack?: () => void;
}

const speak = (text: string) => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    // Use French voice as a fallback since Darija TTS isn't standard, but the text is phonetically readable.
    utterance.lang = 'fr-FR'; 
    window.speechSynthesis.speak(utterance);
  }
};

const translations: Record<string, Record<string, string>> = {
  en: {
    patient: "Patient",
    sessionTitle: "Rehabilitation Session Assisted by Edge-AI",
    aligned: "Subject Aligned",
    searching: "Searching for Subject...",
    positionPatient: "Position the Patient",
    placeTablet: "Place the tablet about 2 meters away.",
    startSession: "Start Session",
    repetitions: "Repetitions",
    maxAngle: "Max Angle",
    currentAngle: "Current Angle",
    checkInAssignment: "Patient Check-In Assignment",
    selectExercise: "Please select the exercise assigned to you:",
    lumbarExtension: "Exercise 1: Lumbar Extension",
    armRaise: "Exercise 2: Arm Raise",
    startCalibration: "Start Calibration",
    startExercise: "Start Exercise",
    waitingToStart: "Waiting to start...",
    painAssessment: "Pain Assessment",
    submitReport: "Submit Report",
    submitting: "Submitting...",
    reset: "Reset",
    finishExercise: "Finish Exercise",
  },
  ar: {
    patient: "المريض",
    sessionTitle: "جلسة إعادة التأهيل بمساعدة Edge-AI",
    aligned: "الموضوع متطابق",
    searching: "جارٍ البحث عن الموضوع...",
    positionPatient: "ضع المريض في الموضع",
    placeTablet: "ضع الجهاز اللوحي على بعد حوالي مترين.",
    startSession: "ابدأ الجلسة",
    repetitions: "التكرارات",
    maxAngle: "أقصى زاوية",
    currentAngle: "الزاوية الحالية",
    checkInAssignment: "مهمة تسجيل دخول المريض",
    selectExercise: "يرجى اختيار التمرين المخصص لك:",
    lumbarExtension: "التمرين 1: تمديد أسفل الظهر",
    armRaise: "التمرين 2: رفع الذراع",
    startCalibration: "ابدأ المعايرة",
    startExercise: "ابدأ التمرين",
    waitingToStart: "في انتظار البدء...",
    painAssessment: "تقييم الألم",
    submitReport: "إرسال التقرير",
    submitting: "جارٍ الإرسال...",
    reset: "إعادة تعيين",
    finishExercise: "إنهاء التمرين",
  },
};

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState(0); // New state for the score
  const [language, setLanguage] = useState("en"); // Default language is English

  // Refs for tracking mutable state inside MediaPipe callbacks without causing stale closures
  const repsRef = useRef(0);
  const repStateRef = useRef<'RELAXED' | 'EXTENDED'>('RELAXED');
  const isCounterActiveRef = useRef(false);

  useEffect(() => {
    isCounterActiveRef.current = isCounterActive;
  }, [isCounterActive]);

  // MediaPipe Initialization
  useEffect(() => {
    let camera: any = null;
    let pose: any = null;

    const initializeMediaPipe = () => {
      if (!videoRef.current || !canvasRef.current || !window.Pose) return;

      pose = new window.Pose({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults((results: any) => {
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
          const leftWrist = landmarks[15];

          // Check if patient is fully in frame (segmentation accuracy)
          const isAligned = areLandmarksVisible([leftHip, leftShoulder], 0.65);
          setIsPoseAligned(isAligned);

          if (isCalibrating) {
            const baselineAngle = calculateAngle(leftHip, leftShoulder, leftWrist);
            setBaselineAngles((prev) => ({ ...prev, [selectedExercise || "default"]: baselineAngle }));
          } else if (isAligned && isCounterActiveRef.current) {
            let currentAngle = 0;
            if (selectedExercise === "Lumbar Extension") {
              currentAngle = calculateAngle(leftHip, leftShoulder, leftWrist);
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
      camera = new window.Camera(videoRef.current, {
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

  // Step 1: Stop the workout and show the pain scale
  const enterPostSession = () => {
    setIsCounterActive(false);
    setIsPostSession(true);
    
    speak('Kidayr m3a lewja3 daba ?');
  };

  // Step 2: Submit the final session with the pain score
  const submitFinalSession = async () => {
    setIsSubmitting(true);
    const sessionData = {
      session_id: `sess_${Date.now()}`,
      patient_id: "AL-1956",
      exercise_type: selectedExercise,
      timestamp: new Date().toISOString(),
      exercise_analytics: {
        reps,
        max_angle: lastAngle,
        score, // Include the score in the report
        warnings: lastAngle < 90 ? ["Mobilité réduite détectée"] : [],
      },
      pain_scale: painScore,
      calibration_baseline: baselineAngles,
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
          metrics: sessionData.exercise_analytics,
        });
      } else {
        onSessionComplete(sessionData);
      }
    } catch (error) {
      onSessionComplete(sessionData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateScore = (reps: number, normalizedAngle: number) => {
    // Example scoring logic: reps contribute 70%, angle contributes 30%
    const angleScore = Math.min(normalizedAngle / 180, 1) * 30; // Normalize angle to a max of 30 points
    const repScore = Math.min(reps, 20) * 3.5; // Max 20 reps, each worth 3.5 points
    return Math.round(angleScore + repScore);
  };

  useEffect(() => {
    if (isCounterActiveRef.current) {
      const newScore = calculateScore(repsRef.current, lastAngle);
      setScore(newScore);
    }
  }, [reps, lastAngle]);

  const t = translations[language];

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
            <h1 className="font-outfit text-2xl md:text-3xl font-bold text-slate-900">{t.patient}: AL-1956</h1>
            <p className="text-slate-500 font-medium">{t.sessionTitle}</p>
          </div>
        </div>

        <div className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold shadow-sm transition-colors duration-300 ${isPoseAligned ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          {isPoseAligned ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{isPoseAligned ? t.aligned : t.searching}</span>
        </div>

        <div className="ml-4">
          <button
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className="px-4 py-2 bg-white rounded-full shadow-sm hover:scale-105 transition-transform"
          >
            {language === "en" ? "العربية" : "English"}
          </button>
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
                    {t.repetitions}
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
                <h2 className="font-outfit text-2xl font-bold text-white mb-2">{t.positionPatient}</h2>
                <p className="text-slate-300 mb-8 font-medium">{t.placeTablet}</p>
                <button
                  onClick={startWorkout}
                  disabled={!isPoseAligned}
                  className={`px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 mx-auto transition-all ${isPoseAligned ? 'bg-white text-emerald-600 shadow-xl hover:scale-105 active:scale-95' : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-50'}`}
                >
                  <Play fill="currentColor" size={20} />
                  {t.startSession}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm flex flex-col items-center justify-center flex-1">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">{t.repetitions}</span>
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
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-2">{t.maxAngle}</span>
              <span className="font-outfit font-bold text-4xl text-slate-800 tabular-nums">{lastAngle}°</span>
            </div>
            <div className="text-center border-l border-slate-100">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-2">{t.currentAngle}</span>
              <span className="font-outfit font-bold text-4xl text-slate-800 tabular-nums">{lastAngle}°</span>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
            <h3 className="font-outfit text-lg font-bold text-slate-900 mb-4">{t.checkInAssignment}</h3>
            <p className="text-slate-600 mb-4">{t.selectExercise}</p>
            <div className="flex gap-4">
              <button
                onClick={() => handleExerciseSelect("Lumbar Extension")}
                className={`px-4 py-2 rounded-lg font-bold ${selectedExercise === "Lumbar Extension" ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"}`}
              >
                {t.lumbarExtension}
              </button>
              <button
                onClick={() => handleExerciseSelect("Arm Raise")}
                className={`px-4 py-2 rounded-lg font-bold ${selectedExercise === "Arm Raise" ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"}`}
              >
                {t.armRaise}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
            {isPostSession ? (
              <div className="flex flex-col gap-4">
                <h3 className="font-outfit text-lg font-bold text-slate-900 mb-2">{t.painAssessment}</h3>
                <EmojiPainScale painScore={painScore} onPainScoreChange={setPainScore} />
                <button
                  onClick={submitFinalSession}
                  disabled={isSubmitting}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  {isSubmitting ? t.submitting : t.submitReport}
                </button>
              </div>
            ) : isCounterActive ? (
              <>
                <button
                  onClick={enterPostSession}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} />
                  {t.finishExercise}
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full py-3 text-slate-500 font-bold flex items-center justify-center gap-2 hover:bg-slate-100 hover:text-slate-700 rounded-2xl transition-colors"
                >
                  <RefreshCw size={18} />
                  {t.reset}
                </button>
              </>
            ) : (
              <div className="flex items-center justify-center h-[104px] text-slate-400 font-medium">
                {t.waitingToStart}
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
              {t.startCalibration}
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
              {t.startExercise}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;
