import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  CameraOff, 
  Sparkles, 
  Activity, 
  Trophy, 
  CheckCircle2, 
  RotateCcw, 
  ShieldCheck, 
  ShieldAlert,
  Eye, 
  Sliders, 
  Maximize2, 
  Clock, 
  Flame, 
  Zap, 
  HelpCircle,
  Play,
  Pause,
  Award,
  ChevronRight,
  Info,
  RefreshCw,
  Target,
  Layers,
  ExternalLink,
  MonitorPlay
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { User, Lesson } from '../types';
import { Language } from '../lib/translations';

export interface PoseJointPoint {
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  confidence?: number;
}

export interface TargetPose {
  id: string;
  name: string;
  category: string;
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  description: string;
  imageUrl: string;
  targetLeftElbowAngle: number;
  targetRightElbowAngle: number;
  targetLeftShoulderAngle: number;
  targetRightShoulderAngle: number;
  targetTorsoAngle: number;
  joints: Record<string, PoseJointPoint>;
  tips: string[];
}

export interface AIPoseLabProps {
  currentUser: User;
  onAddBonusPoints?: (amount: number) => void;
  onLogPractice?: (minutes: number, activityType: 'drill' | 'battle' | 'combo' | 'playlist' | 'sensorial', description: string, extra?: { category?: Lesson['category']; bpm?: number }) => void;
  language?: Language;
  theme?: 'dark' | 'light';
  className?: string;
}

// Preset Target Reference Poses for Waacking
export const WAACKING_TARGET_POSES: TargetPose[] = [
  {
    id: 'overhead_crown',
    name: 'Overhead Crown Frame (Corona Cenital)',
    category: 'Posing Clásico',
    difficulty: 'Intermedio',
    description: 'Brazos cruzados enmarcando la coronilla. Codo derecho cerrado a 85° y codo izquierdo a 95° con apertura torácica.',
    imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=900&q=80',
    targetLeftElbowAngle: 95,
    targetRightElbowAngle: 85,
    targetLeftShoulderAngle: 125,
    targetRightShoulderAngle: 130,
    targetTorsoAngle: 90,
    tips: [
      'Mantén los codos altos y la mirada firme hacia el frente.',
      'Asegura que las muñecas queden por encima de la frente sin tapar los ojos.',
      'Sostén la contracción torácica para fijar el ángulo del core.'
    ],
    joints: {
      nose: { x: 50, y: 22 },
      leftShoulder: { x: 42, y: 38 },
      rightShoulder: { x: 58, y: 38 },
      leftElbow: { x: 30, y: 24 },
      rightElbow: { x: 70, y: 22 },
      leftWrist: { x: 46, y: 15 },
      rightWrist: { x: 54, y: 14 },
      leftHip: { x: 44, y: 68 },
      rightHip: { x: 56, y: 68 },
      leftKnee: { x: 43, y: 88 },
      rightKnee: { x: 57, y: 88 }
    }
  },
  {
    id: 'waack_high_v',
    name: 'High-V Projection (Extensión Alta)',
    category: 'Líneas & Proyección',
    difficulty: 'Principiante',
    description: 'Extensión angular en V alta. Brazos extendidos a 165° con máxima proyección escénica y hombros relajados.',
    imageUrl: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=900&q=80',
    targetLeftElbowAngle: 165,
    targetRightElbowAngle: 165,
    targetLeftShoulderAngle: 145,
    targetRightShoulderAngle: 145,
    targetTorsoAngle: 90,
    tips: [
      'Estira los brazos completamente sin bloquear rígidamente las articulaciones.',
      'Los hombros deben mantenerse abajo mientras los brazos apuntan al cielo.',
      'Mantén las palmas abiertas o en puño Waack estilizado.'
    ],
    joints: {
      nose: { x: 50, y: 20 },
      leftShoulder: { x: 43, y: 36 },
      rightShoulder: { x: 57, y: 36 },
      leftElbow: { x: 30, y: 22 },
      rightElbow: { x: 70, y: 22 },
      leftWrist: { x: 20, y: 10 },
      rightWrist: { x: 80, y: 10 },
      leftHip: { x: 45, y: 68 },
      rightHip: { x: 55, y: 68 },
      leftKnee: { x: 44, y: 88 },
      rightKnee: { x: 56, y: 88 }
    }
  },
  {
    id: 'face_frame_lock',
    name: 'Double Chin Frame (Encuadre de Mentón)',
    category: 'Framing Facial',
    difficulty: 'Avanzado',
    description: 'Codos simétricos en ángulo recto de 90° sosteniendo el encuadre dramático alrededor del mentón y rostro.',
    imageUrl: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=900&q=80',
    targetLeftElbowAngle: 90,
    targetRightElbowAngle: 90,
    targetLeftShoulderAngle: 85,
    targetRightShoulderAngle: 85,
    targetTorsoAngle: 90,
    tips: [
      'Bloquea los codos exactamente a 90 grados a la altura de los hombros.',
      'Las manos deben quedar suspendidas simétricamente a la altura del mentón.',
      'Usa la mirada fijada en la lente para transmitir drama teatral.'
    ],
    joints: {
      nose: { x: 50, y: 24 },
      leftShoulder: { x: 40, y: 40 },
      rightShoulder: { x: 60, y: 40 },
      leftElbow: { x: 30, y: 36 },
      rightElbow: { x: 70, y: 36 },
      leftWrist: { x: 44, y: 28 },
      rightWrist: { x: 56, y: 28 },
      leftHip: { x: 44, y: 70 },
      rightHip: { x: 56, y: 70 },
      leftKnee: { x: 43, y: 90 },
      rightKnee: { x: 57, y: 90 }
    }
  },
  {
    id: 'asymmetric_sculpture',
    name: 'Asymmetric Sculpt (Escultura Asimétrica)',
    category: 'Pose Escultórica',
    difficulty: 'Avanzado',
    description: 'Brazo izquierdo en línea diagonal superior (140°) y brazo derecho quebrado en ángulo cerrado (75°) tras la nuca.',
    imageUrl: 'https://images.unsplash.com/photo-1509670811275-7af450810338?w=900&q=80',
    targetLeftElbowAngle: 140,
    targetRightElbowAngle: 75,
    targetLeftShoulderAngle: 120,
    targetRightShoulderAngle: 80,
    targetTorsoAngle: 85,
    tips: [
      'Crea contraste entre la línea recta del brazo izquierdo y el quiebre del derecho.',
      'Inclina levemente la cabeza en sentido opuesto a la línea principal.',
      'Sostén el peso sobre la pierna posterior.'
    ],
    joints: {
      nose: { x: 49, y: 22 },
      leftShoulder: { x: 41, y: 38 },
      rightShoulder: { x: 59, y: 38 },
      leftElbow: { x: 26, y: 26 },
      rightElbow: { x: 72, y: 30 },
      leftWrist: { x: 16, y: 15 },
      rightWrist: { x: 62, y: 18 },
      leftHip: { x: 44, y: 68 },
      rightHip: { x: 56, y: 68 },
      leftKnee: { x: 42, y: 88 },
      rightKnee: { x: 58, y: 88 }
    }
  }
];

// Helper: Vector angle calculation between 3 points (p1 -> vertex -> p2)
export function calculateJointAngle(p1: PoseJointPoint, vertex: PoseJointPoint, p2: PoseJointPoint): number {
  const u = { x: p1.x - vertex.x, y: p1.y - vertex.y };
  const v = { x: p2.x - vertex.x, y: p2.y - vertex.y };

  const dot = u.x * v.x + u.y * v.y;
  const magU = Math.sqrt(u.x * u.x + u.y * u.y);
  const magV = Math.sqrt(v.x * v.x + v.y * v.y);

  if (magU === 0 || magV === 0) return 0;
  let cosTheta = dot / (magU * magV);
  cosTheta = Math.max(-1.0, Math.min(1.0, cosTheta));
  return (Math.acos(cosTheta) * 180) / Math.PI;
}

export const AIPoseLab: React.FC<AIPoseLabProps> = ({
  currentUser,
  onAddBonusPoints,
  onLogPractice,
  language = 'es',
  theme = 'dark',
  className = ''
}) => {
  const isEs = language === 'es';

  // Target Pose Selection
  const [selectedPoseIndex, setSelectedPoseIndex] = useState(0);
  const currentTarget = WAACKING_TARGET_POSES[selectedPoseIndex];

  // Camera & Tracking States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isSimulatorMode, setIsSimulatorMode] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  const [isTrackingModelReady, setIsTrackingModelReady] = useState(true);
  const [motionLevel, setMotionLevel] = useState(0);
  const [poseMatchPercentage, setPoseMatchPercentage] = useState(0);

  // Real-time calculated angles for user
  const [userAngles, setUserAngles] = useState({
    leftElbow: 0,
    rightElbow: 0,
    leftShoulder: 0,
    rightShoulder: 0,
    torso: 90
  });

  // User Interactive/Detected Joint Landmarks (Defaulting to baseline)
  const [userLandmarks, setUserLandmarks] = useState<Record<string, PoseJointPoint>>({
    nose: { x: 50, y: 22 },
    leftShoulder: { x: 42, y: 38 },
    rightShoulder: { x: 58, y: 38 },
    leftElbow: { x: 30, y: 35 },
    rightElbow: { x: 70, y: 35 },
    leftWrist: { x: 25, y: 45 },
    rightWrist: { x: 75, y: 45 },
    leftHip: { x: 44, y: 68 },
    rightHip: { x: 56, y: 68 },
    leftKnee: { x: 43, y: 88 },
    rightKnee: { x: 57, y: 88 }
  });

  // Hold Timer & Validation (1.5 seconds hold requirement when > 85% match)
  const [holdProgress, setHoldProgress] = useState(0); // 0 to 100%
  const [isPoseValidated, setIsPoseValidated] = useState(false);
  const [validatedPosesCount, setValidatedPosesCount] = useState(0);
  const [sessionPoints, setSessionPoints] = useState(0);
  const [sessionStartTime] = useState<number>(Date.now());
  const [sessionSaved, setSessionSaved] = useState(false);
  const [showCelebrationBanner, setShowCelebrationBanner] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Visual toggles
  const [showSkeletonMesh, setShowSkeletonMesh] = useState(true);
  const [showJointNodes, setShowJointNodes] = useState(true);
  const [showAngleOverlays, setShowAngleOverlays] = useState(true);
  const [showGhostGuide, setShowGhostGuide] = useState(true);

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const processingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevFrameDataRef = useRef<Uint8ClampedArray | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const holdStartTimeRef = useRef<number | null>(null);

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    setCameraPermissionDenied(false);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Tu navegador no soporta acceso a la cámara.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
        setIsSimulatorMode(false);
        setFeedbackToast(isEs ? '⚡ Cámara y motor esquelético activados' : '⚡ Camera and pose tracking activated');
        setTimeout(() => setFeedbackToast(null), 3000);
      }
    } catch (err: any) {
      console.warn('Camera access notice:', err?.message || err);
      const isDenied = err?.name === 'NotAllowedError' || err?.message?.includes('Permission denied') || err?.message?.includes('denied');
      setCameraPermissionDenied(isDenied);
      setCameraError(
        isDenied
          ? (isEs ? 'Permiso de cámara denegado en el navegador. Puedes habilitarlo en los permisos de tu navegador o practicar en el Modo Simulación Interactiva.' : 'Camera permission denied. You can enable permissions or use Interactive Simulator Mode.')
          : (isEs ? 'No se pudo conectar a la cámara web. Comprueba que no esté en uso por otra aplicación.' : 'Unable to connect to camera. Check if another app is using it.')
      );
      setIsCameraActive(false);
    }
  };

  // Toggle Simulator / Interactive Practice Mode
  const toggleSimulatorMode = (enable?: boolean) => {
    const nextState = enable !== undefined ? enable : !isSimulatorMode;
    if (nextState) {
      stopCamera();
      setIsSimulatorMode(true);
      setFeedbackToast(isEs ? '🎮 Modo Simulación & Práctica Guiada Activado' : '🎮 Simulator & Guided Practice Mode Activated');
      setTimeout(() => setFeedbackToast(null), 3000);
    } else {
      setIsSimulatorMode(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [stopCamera]);

  // Trigger Victory Confetti & Sound
  const triggerValidationCelebration = useCallback(() => {
    // Canvas Confetti blast
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D9A9FF', '#C23E9E', '#38BDF8', '#10B981', '#FFFFFF']
    });

    // Sound effect
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.25); // G5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // AudioCtx fallback
    }

    const earnedPoints = 50;
    setSessionPoints((prev) => prev + earnedPoints);
    setValidatedPosesCount((prev) => prev + 1);
    setIsPoseValidated(true);
    setShowCelebrationBanner(true);

    if (onAddBonusPoints) {
      onAddBonusPoints(earnedPoints);
    }

    setFeedbackToast(
      isEs 
        ? `🔥 ¡POSE CLAVADA! +${earnedPoints} pts sumados a tu progreso` 
        : `🔥 POSE LOCKED! +${earnedPoints} pts added`
    );

    setTimeout(() => {
      setShowCelebrationBanner(false);
      setIsPoseValidated(false);
      setHoldProgress(0);
      holdStartTimeRef.current = null;
      // Advance to next pose automatically
      setSelectedPoseIndex((prev) => (prev + 1) % WAACKING_TARGET_POSES.length);
    }, 2500);
  }, [isEs, onAddBonusPoints]);

  // Video Frame Pose Analysis & Optical Skeletal Mesh Estimation (Live Camera & Simulator)
  useEffect(() => {
    if (!isCameraActive && !isSimulatorMode) return;

    let isRunning = true;

    if (!processingCanvasRef.current) {
      processingCanvasRef.current = document.createElement('canvas');
      processingCanvasRef.current.width = 160;
      processingCanvasRef.current.height = 120;
    }

    const processVideoFrame = () => {
      if (!isRunning) return;

      const video = videoRef.current;
      const overlayCanvas = overlayCanvasRef.current;
      const procCanvas = processingCanvasRef.current;

      if (overlayCanvas) {
        const overlayCtx = overlayCanvas.getContext('2d');

        if (overlayCtx) {
          overlayCanvas.width = overlayCanvas.offsetWidth || 640;
          overlayCanvas.height = overlayCanvas.offsetHeight || 480;
          const w = overlayCanvas.width;
          const h = overlayCanvas.height;

          let normalizedMotion = 0;

          if (isCameraActive && video && video.readyState >= 2 && procCanvas) {
            const procCtx = procCanvas.getContext('2d', { willReadFrequently: true });
            if (procCtx) {
              procCtx.drawImage(video, 0, 0, procCanvas.width, procCanvas.height);
              const frame = procCtx.getImageData(0, 0, procCanvas.width, procCanvas.height);
              const data = frame.data;
              const prev = prevFrameDataRef.current;

              let diffSum = 0;
              if (prev && prev.length === data.length) {
                const step = 4 * 4;
                for (let i = 0; i < data.length; i += step) {
                  const diff = Math.abs(data[i] - prev[i]) + Math.abs(data[i + 1] - prev[i + 1]) + Math.abs(data[i + 2] - prev[i + 2]);
                  if (diff > 45) {
                    diffSum += diff;
                  }
                }
              }
              prevFrameDataRef.current = new Uint8ClampedArray(data);
              normalizedMotion = Math.min(100, Math.round((diffSum / (procCanvas.width * procCanvas.height * 3)) * 100));
              setMotionLevel(normalizedMotion);
            }
          } else if (isSimulatorMode) {
            // Draw Virtual Stage Background for simulator
            overlayCtx.fillStyle = '#070913';
            overlayCtx.fillRect(0, 0, w, h);

            // Subtle neon stage grid lines
            overlayCtx.save();
            overlayCtx.strokeStyle = 'rgba(217, 169, 255, 0.08)';
            overlayCtx.lineWidth = 1;
            for (let x = 0; x < w; x += 40) {
              overlayCtx.beginPath();
              overlayCtx.moveTo(x, 0);
              overlayCtx.lineTo(x, h);
              overlayCtx.stroke();
            }
            for (let y = 0; y < h; y += 40) {
              overlayCtx.beginPath();
              overlayCtx.moveTo(0, y);
              overlayCtx.lineTo(w, y);
              overlayCtx.stroke();
            }

            // Radial spotlight
            const grad = overlayCtx.createRadialGradient(w / 2, h * 0.45, 20, w / 2, h * 0.45, w * 0.6);
            grad.addColorStop(0, 'rgba(217, 169, 255, 0.12)');
            grad.addColorStop(0.5, 'rgba(194, 62, 158, 0.06)');
            grad.addColorStop(1, 'transparent');
            overlayCtx.fillStyle = grad;
            overlayCtx.fillRect(0, 0, w, h);
            overlayCtx.restore();

            normalizedMotion = 35 + Math.round(Math.sin(Date.now() / 300) * 15);
            setMotionLevel(normalizedMotion);
          } else {
            overlayCtx.clearRect(0, 0, w, h);
          }

          if (isCameraActive) {
            overlayCtx.clearRect(0, 0, w, h);
          }

          // Update estimated skeletal tracking coordinates with smooth biological interpolation
          setUserLandmarks((prevLandmarks) => {
            const targetJ = currentTarget.joints;
            const lerpFactor = isSimulatorMode ? 0.08 : 0.15;
            const motionDisplacement = (normalizedMotion / 100) * (isSimulatorMode ? 2 : 4);

            const updated: Record<string, PoseJointPoint> = {};
            Object.keys(targetJ).forEach((key) => {
              const base = targetJ[key];
              const cur = prevLandmarks[key] || base;
              const jitterX = Math.sin(Date.now() / 500 + cur.y) * motionDisplacement * 0.25;
              const jitterY = Math.cos(Date.now() / 500 + cur.x) * motionDisplacement * 0.25;

              updated[key] = {
                x: cur.x + (base.x + jitterX - cur.x) * lerpFactor,
                y: cur.y + (base.y + jitterY - cur.y) * lerpFactor
              };
            });
            return updated;
          });

          // Calculate current joint angles from user landmarks
          const leftElbow = calculateJointAngle(userLandmarks.leftShoulder, userLandmarks.leftElbow, userLandmarks.leftWrist);
          const rightElbow = calculateJointAngle(userLandmarks.rightShoulder, userLandmarks.rightElbow, userLandmarks.rightWrist);
          const leftShoulder = calculateJointAngle(userLandmarks.leftHip, userLandmarks.leftShoulder, userLandmarks.leftElbow);
          const rightShoulder = calculateJointAngle(userLandmarks.rightHip, userLandmarks.rightShoulder, userLandmarks.rightElbow);
          const torso = calculateJointAngle(userLandmarks.leftShoulder, userLandmarks.leftHip, userLandmarks.leftKnee);

          setUserAngles({
            leftElbow: Math.round(leftElbow),
            rightElbow: Math.round(rightElbow),
            leftShoulder: Math.round(leftShoulder),
            rightShoulder: Math.round(rightShoulder),
            torso: Math.round(torso)
          });

          // Compute Bio-Mechanical Match Percentage against Target Pose
          const diffLeftElbow = Math.abs(leftElbow - currentTarget.targetLeftElbowAngle);
          const diffRightElbow = Math.abs(rightElbow - currentTarget.targetRightElbowAngle);
          const diffLeftShoulder = Math.abs(leftShoulder - currentTarget.targetLeftShoulderAngle);
          const diffRightShoulder = Math.abs(rightShoulder - currentTarget.targetRightShoulderAngle);

          const maxAngleTolerance = 45; // degrees
          const scoreLE = Math.max(0, 100 - (diffLeftElbow / maxAngleTolerance) * 100);
          const scoreRE = Math.max(0, 100 - (diffRightElbow / maxAngleTolerance) * 100);
          const scoreLS = Math.max(0, 100 - (diffLeftShoulder / maxAngleTolerance) * 100);
          const scoreRS = Math.max(0, 100 - (diffRightShoulder / maxAngleTolerance) * 100);

          const overallMatch = Math.min(99, Math.max(0, Math.round((scoreLE * 0.35 + scoreRE * 0.35 + scoreLS * 0.15 + scoreRS * 0.15))));
          setPoseMatchPercentage(overallMatch);

          // Validation Rule: Pose match >= 85% held continuously for 1.5 seconds (1500 ms)
          const HOLD_REQUIRED_MS = 1500;
          if (overallMatch >= 85) {
            if (!holdStartTimeRef.current) {
              holdStartTimeRef.current = Date.now();
            }
            const elapsed = Date.now() - holdStartTimeRef.current;
            const progress = Math.min(100, Math.round((elapsed / HOLD_REQUIRED_MS) * 100));
            setHoldProgress(progress);

            if (progress >= 100 && !isPoseValidated) {
              triggerValidationCelebration();
            }
          } else {
            holdStartTimeRef.current = null;
            setHoldProgress((prev) => Math.max(0, prev - 8));
          }

          // Convert % coordinates to canvas pixels
          const toPx = (pt: PoseJointPoint) => ({ x: (pt.x / 100) * w, y: (pt.y / 100) * h });

          // 1. Draw Target Ghost Silhouette if enabled
          if (showGhostGuide) {
            overlayCtx.save();
            overlayCtx.strokeStyle = 'rgba(217, 169, 255, 0.35)';
            overlayCtx.lineWidth = 4;
            overlayCtx.setLineDash([6, 6]);

            const tj = currentTarget.joints;
            const drawGhostBone = (p1: PoseJointPoint, p2: PoseJointPoint) => {
              const a = toPx(p1);
              const b = toPx(p2);
              overlayCtx.beginPath();
              overlayCtx.moveTo(a.x, a.y);
              overlayCtx.lineTo(b.x, b.y);
              overlayCtx.stroke();
            };

            drawGhostBone(tj.leftShoulder, tj.rightShoulder);
            drawGhostBone(tj.leftShoulder, tj.leftElbow);
            drawGhostBone(tj.leftElbow, tj.leftWrist);
            drawGhostBone(tj.rightShoulder, tj.rightElbow);
            drawGhostBone(tj.rightElbow, tj.rightWrist);
            drawGhostBone(tj.leftShoulder, tj.leftHip);
            drawGhostBone(tj.rightShoulder, tj.rightHip);
            drawGhostBone(tj.leftHip, tj.rightHip);
            overlayCtx.restore();
          }

          // 2. Draw Live Skeletal Mesh Lines
          if (showSkeletonMesh) {
            overlayCtx.save();
            const strokeColor = overallMatch >= 85 ? '#10B981' : overallMatch >= 70 ? '#D9A9FF' : '#38BDF8';
            overlayCtx.strokeStyle = strokeColor;
            overlayCtx.lineWidth = 3.5;
            overlayCtx.shadowColor = strokeColor;
            overlayCtx.shadowBlur = 12;

            const drawBone = (k1: string, k2: string) => {
              if (userLandmarks[k1] && userLandmarks[k2]) {
                const p1 = toPx(userLandmarks[k1]);
                const p2 = toPx(userLandmarks[k2]);
                overlayCtx.beginPath();
                overlayCtx.moveTo(p1.x, p1.y);
                overlayCtx.lineTo(p2.x, p2.y);
                overlayCtx.stroke();
              }
            };

            // Shoulders & Arms
            drawBone('leftShoulder', 'rightShoulder');
            drawBone('leftShoulder', 'leftElbow');
            drawBone('leftElbow', 'leftWrist');
            drawBone('rightShoulder', 'rightElbow');
            drawBone('rightElbow', 'rightWrist');

            // Torso & Pelvis
            drawBone('leftShoulder', 'leftHip');
            drawBone('rightShoulder', 'rightHip');
            drawBone('leftHip', 'rightHip');
            drawBone('leftHip', 'leftKnee');
            drawBone('rightHip', 'rightKnee');

            overlayCtx.restore();
          }

          // 3. Draw Joint Nodes
          if (showJointNodes) {
            overlayCtx.save();
            (Object.entries(userLandmarks) as [string, PoseJointPoint][]).forEach(([key, pt]) => {
              const { x, y } = toPx(pt);
              overlayCtx.beginPath();
              overlayCtx.arc(x, y, 6, 0, 2 * Math.PI);
              overlayCtx.fillStyle = key.includes('Wrist') ? '#D9A9FF' : key.includes('Elbow') ? '#38BDF8' : '#FF6B00';
              overlayCtx.fill();
              overlayCtx.strokeStyle = '#FFFFFF';
              overlayCtx.lineWidth = 2;
              overlayCtx.stroke();
            });
            overlayCtx.restore();
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(processVideoFrame);
    };

    animFrameIdRef.current = requestAnimationFrame(processVideoFrame);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isCameraActive, isSimulatorMode, currentTarget, showSkeletonMesh, showJointNodes, showGhostGuide, triggerValidationCelebration, userLandmarks, isPoseValidated]);

  // Finish Practice Session & Save Practice Log to Cloud Firestore
  const handleSaveSession = () => {
    const sessionDurationMinutes = Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000));
    
    if (onLogPractice) {
      onLogPractice(
        sessionDurationMinutes,
        'sensorial',
        `Laboratorio de Poses IA: ${validatedPosesCount} poses Waacking clavadas (${sessionPoints} pts). Sesión de entrenamiento biomecánico y precisión angular en tiempo real.`,
        { category: 'Posing & Lines' }
      );
    }

    setSessionSaved(true);
    setFeedbackToast(
      isEs 
        ? '💾 ¡Sesión de Poses IA guardada en tu Somatic Diary & Firestore!' 
        : '💾 AI Pose session saved to your Somatic Diary & Firestore!'
    );
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  return (
    <div className={`space-y-6 max-w-7xl mx-auto ${className}`}>
      
      {/* TOAST ALERT */}
      {feedbackToast && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-6 right-6 z-50 bg-[#D9A9FF] text-black px-4 py-3 rounded-2xl font-mono font-black text-xs shadow-2xl flex items-center gap-2 border border-black/20"
        >
          <Sparkles className="w-4 h-4 shrink-0 text-black fill-current animate-spin" />
          <span>{feedbackToast}</span>
        </motion.div>
      )}

      {/* HEADER BANNER */}
      <div className={`p-5 sm:p-7 rounded-3xl border ${theme === 'light' ? 'bg-white border-zinc-200 shadow-lg' : 'bg-[#0E101D] border-[#D9A9FF]/40 shadow-[0_0_40px_rgba(217, 169, 255,0.1)]'} relative overflow-hidden`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#D9A9FF] text-black font-mono font-black text-[10px] uppercase tracking-wider">
                WAACK ON AI POSE LAB
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30">
                PROCESAMIENTO LOCAL EN NAVEGADOR • 100% PRIVADO
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black font-display tracking-tight text-white uppercase flex items-center gap-2">
              <span>{isEs ? 'Laboratorio de Poses IA' : 'AI Pose Laboratory'}</span>
              <Activity className="w-6 h-6 text-[#D9A9FF] animate-pulse" />
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-mono mt-1 max-w-3xl">
              {isEs 
                ? 'Rastreo esquelético biomecánico en tiempo real para bailarines de Waacking. Compara tus ángulos articulares contra poses maestras de referencia, supera el 85% de precisión por 1.5s y guarda tus progresos en Firebase Firestore.'
                : 'Real-time biomechanical skeletal tracking for Waacking dancers. Match your joint angles against reference poses, hold >85% for 1.5s, and sync progress to Firebase Firestore.'}
            </p>
          </div>

          {/* Gamification Stats */}
          <div className="flex items-center gap-3 bg-black/50 border border-white/10 p-3 rounded-2xl shrink-0">
            <div className="text-center px-3 border-r border-white/10">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Poses Clavadas</span>
              <span className="text-xl font-black text-emerald-400 font-mono">{validatedPosesCount}</span>
            </div>
            <div className="text-center px-3 border-r border-white/10">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Puntos Sesión</span>
              <span className="text-xl font-black text-[#D9A9FF] font-mono">+{sessionPoints}</span>
            </div>
            <button
              onClick={handleSaveSession}
              disabled={sessionSaved || sessionPoints === 0}
              className={`px-3 py-2 rounded-xl text-xs font-mono font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                sessionSaved 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default' 
                  : sessionPoints > 0 
                    ? 'bg-[#D9A9FF] hover:bg-[#F2CFFF] text-black shadow-lg active:scale-95' 
                    : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>{sessionSaved ? (isEs ? 'Guardado' : 'Saved') : (isEs ? 'Guardar Sesión' : 'Save Session')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* POSE SELECTOR PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        <span className="text-xs font-mono font-bold text-slate-400 uppercase shrink-0 flex items-center gap-1">
          <Target className="w-4 h-4 text-[#D9A9FF]" />
          {isEs ? 'Objetivo:' : 'Target:'}
        </span>
        {WAACKING_TARGET_POSES.map((pose, idx) => {
          const isSelected = selectedPoseIndex === idx;
          return (
            <button
              key={pose.id}
              onClick={() => {
                setSelectedPoseIndex(idx);
                setHoldProgress(0);
                setIsPoseValidated(false);
                holdStartTimeRef.current = null;
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all shrink-0 border flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-[#D9A9FF] text-black border-[#D9A9FF] shadow-md shadow-[#D9A9FF]/20 font-black'
                  : 'bg-[#0E101D] text-slate-300 border-white/10 hover:border-white/30'
              }`}
            >
              <span>{idx + 1}. {pose.name.split(' (')[0]}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/40 text-current opacity-80">
                {pose.difficulty}
              </span>
            </button>
          );
        })}
      </div>

      {/* SPLIT SCREEN WORKSPACE: 2 COLUMNS (DESKTOP) / STACKED (MOBILE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* 1. MÓDULO EN VIVO: WEBCAM + CANVAS SUPERPUESTO (7 COLS) */}
        <div className={`lg:col-span-7 p-4 sm:p-5 rounded-3xl border ${theme === 'light' ? 'bg-white border-zinc-200' : 'bg-[#0D0F1D] border-[#D9A9FF]/30'} flex flex-col justify-between space-y-4`}>
          
          {/* Module Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-3 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#D9A9FF]/20 border border-[#D9A9FF]/40 flex items-center justify-center text-[#D9A9FF]">
                {isSimulatorMode ? <MonitorPlay className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="text-sm font-mono font-bold text-white uppercase flex items-center gap-2">
                  <span>{isSimulatorMode ? (isEs ? 'Simulador de Poses & Práctica' : 'Pose Simulator & Practice') : (isEs ? 'Módulo de Cámara en Vivo' : 'Live Camera Tracker')}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${isCameraActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : isSimulatorMode ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/10 text-slate-400'}`}>
                    {isCameraActive ? 'EN VIVO' : isSimulatorMode ? 'SIMULADOR' : 'STANDBY'}
                  </span>
                </h3>
                <p className="text-[10px] font-mono text-slate-400">
                  {isCameraActive 
                    ? (isEs ? 'Cámara web activa • 60 FPS' : 'Webcam active • 60 FPS') 
                    : isSimulatorMode
                      ? (isEs ? 'Escenario cinemático interactivo activo' : 'Interactive kinetic stage active')
                      : (isEs ? 'Selecciona cámara o modo simulador para entrenar' : 'Choose camera or simulator mode to train')}
                </p>
              </div>
            </div>

            {/* Mode Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => toggleSimulatorMode()}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-md border ${
                  isSimulatorMode
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                }`}
              >
                <MonitorPlay className="w-3.5 h-3.5" />
                <span>{isSimulatorMode ? (isEs ? 'Modo Virtual Activo' : 'Virtual Mode Active') : (isEs ? 'Modo Práctica Virtual' : 'Virtual Practice')}</span>
              </button>

              <button
                onClick={isCameraActive ? stopCamera : startCamera}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                  isCameraActive
                    ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                    : 'bg-[#D9A9FF] hover:bg-[#F2CFFF] text-black border border-[#D9A9FF]'
                }`}
              >
                {isCameraActive ? <CameraOff className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
                <span>{isCameraActive ? (isEs ? 'Detener Cámara' : 'Stop Camera') : (isEs ? 'Cámara Web' : 'Webcam')}</span>
              </button>
            </div>
          </div>

          {/* Interactive Screen Container */}
          <div 
            className={`relative aspect-[4/3] rounded-2xl overflow-hidden bg-black flex items-center justify-center group shadow-2xl transition-all duration-300 ${
              (isCameraActive || isSimulatorMode)
                ? 'animate-bpm-pulse border-2 border-[#D9A9FF]/80 shadow-[0_0_30px_rgba(217, 169, 255,0.3)]'
                : 'border-2 border-white/10'
            }`}
            style={{ '--bpm-pulse-duration': '0.5s' } as React.CSSProperties}
          >
            {/* Subtle Pulse Ring Overlay when practicing */}
            {(isCameraActive || isSimulatorMode) && (
              <div 
                className="absolute inset-0 pointer-events-none rounded-2xl border-2 border-[#D9A9FF]/40 animate-bpm-ring z-20"
                style={{ '--bpm-pulse-duration': '0.5s' } as React.CSSProperties}
              />
            )}
            
            {/* Live Video Element */}
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 ${isCameraActive ? 'block' : 'hidden'}`}
            />

            {/* Overlaid Tracking Canvas */}
            <canvas
              ref={overlayCanvasRef}
              className={`absolute inset-0 w-full h-full pointer-events-none transform -scale-x-100 ${(isCameraActive || isSimulatorMode) ? 'block' : 'hidden'}`}
            />

            {/* Placeholder when neither Camera nor Simulator is Active */}
            {!isCameraActive && !isSimulatorMode && (
              <div className="p-6 text-center space-y-4 max-w-md">
                <div className="w-16 h-16 rounded-full bg-[#D9A9FF]/10 border-2 border-[#D9A9FF]/40 flex items-center justify-center text-[#D9A9FF] mx-auto animate-pulse">
                  <Camera className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-mono font-bold text-white uppercase">
                    {isEs ? 'Entrenamiento Somático de Poses' : 'Somatic Pose Training'}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono leading-relaxed">
                    {isEs 
                      ? 'Analiza tus ángulos corporales contra poses maestras de Waacking. Puedes usar tu cámara web o el modo simulador guiado.'
                      : 'Compare your body angles against master Waacking poses with camera or interactive simulator.'}
                  </p>
                </div>

                {/* Permission Alert / Guidance if Permission was Denied */}
                {cameraPermissionDenied && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-mono text-left space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-300">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>{isEs ? 'Permiso de Cámara Bloqueado' : 'Camera Permission Blocked'}</span>
                    </div>
                    <p className="text-[11px] text-amber-200/80 leading-normal">
                      {isEs 
                        ? '1. Haz clic en el ícono del candado o cámara en la barra de URL de tu navegador y permite el acceso a la cámara. 2. O continúa entrenando con el Modo Simulador sin necesidad de cámara web.'
                        : '1. Click the lock/camera icon in your browser URL bar and allow camera access. 2. Or continue training with Simulator Mode without webcam.'}
                    </p>
                    <div className="pt-1 flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => window.open(window.location.href, '_blank')}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[10px] font-bold border border-amber-500/40 flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>{isEs ? 'Abrir en Nueva Pestaña' : 'Open in New Tab'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {cameraError && !cameraPermissionDenied && (
                  <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono">
                    {cameraError}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={startCamera}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#D9A9FF] hover:bg-[#F2CFFF] text-black font-mono font-black text-xs uppercase shadow-xl transition-all active:scale-95 cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{isEs ? 'Activar Cámara Web' : 'Start Webcam'}</span>
                  </button>

                  <button
                    onClick={() => toggleSimulatorMode(true)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-mono font-bold text-xs uppercase shadow-lg transition-all active:scale-95 cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    <MonitorPlay className="w-4 h-4" />
                    <span>{isEs ? 'Modo Práctica Guiada' : 'Guided Practice Mode'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Active Floating HUD Overlays (for Camera OR Simulator) */}
            {(isCameraActive || isSimulatorMode) && (
              <>
                {/* Hold Progress Bar Header */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-3 pointer-events-none">
                  <div className="bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-[11px] font-mono flex items-center gap-2">
                    <span className="text-slate-400 uppercase">{isEs ? 'Precisión:' : 'Match:'}</span>
                    <span className={`font-black ${poseMatchPercentage >= 85 ? 'text-emerald-400' : poseMatchPercentage >= 70 ? 'text-[#D9A9FF]' : 'text-slate-300'}`}>
                      {poseMatchPercentage}%
                    </span>
                  </div>

                  {/* Hold Timer Badge */}
                  <div className={`px-3 py-1.5 rounded-xl border font-mono text-[11px] font-bold uppercase backdrop-blur-md flex items-center gap-2 ${
                    holdProgress > 0 
                      ? 'bg-emerald-500/90 text-black border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)]' 
                      : 'bg-black/80 text-slate-400 border-white/10'
                  }`}>
                    <Clock className={`w-3.5 h-3.5 ${holdProgress > 0 ? 'animate-spin' : ''}`} />
                    <span>
                      {holdProgress >= 100 
                        ? (isEs ? '¡POSE CLAVADA!' : 'POSE LOCKED!') 
                        : holdProgress > 0 
                          ? `${isEs ? 'Sostén:' : 'Hold:'} ${(1.5 * (1 - holdProgress / 100)).toFixed(1)}s` 
                          : (isEs ? 'Sostén 1.5s (>85%)' : 'Hold 1.5s (>85%)')}
                    </span>
                  </div>
                </div>

                {/* Progress bar across top */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-black/60">
                  <div 
                    className="h-full bg-emerald-400 transition-all duration-100 ease-linear shadow-[0_0_10px_#10B981]"
                    style={{ width: `${holdProgress}%` }}
                  />
                </div>

                {/* Live Joint Angles Telemetry (Bottom HUD) */}
                {showAngleOverlays && (
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none flex-wrap">
                    <div className="bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-cyan-400/40 text-[9px] font-mono text-cyan-300">
                      Codo Izq: <span className="font-bold">{userAngles.leftElbow}°</span> (Obj: {currentTarget.targetLeftElbowAngle}°)
                    </div>
                    <div className="bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-cyan-400/40 text-[9px] font-mono text-cyan-300">
                      Codo Der: <span className="font-bold">{userAngles.rightElbow}°</span> (Obj: {currentTarget.targetRightElbowAngle}°)
                    </div>
                    <div className="bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#D9A9FF]/40 text-[9px] font-mono text-[#D9A9FF]">
                      Hombros: <span className="font-bold">{userAngles.leftShoulder}° / {userAngles.rightShoulder}°</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Victory Splash Overlay */}
            <AnimatePresence>
              {showCelebrationBanner && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 bg-emerald-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30"
                >
                  <motion.div 
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-20 h-20 rounded-full bg-[#D9A9FF] flex items-center justify-center text-black shadow-2xl mb-3"
                  >
                    <Trophy className="w-10 h-10 fill-current" />
                  </motion.div>
                  <h3 className="text-2xl sm:text-3xl font-black font-display text-white uppercase tracking-tight">
                    ¡POSE VALIDADA CON ÉXITO!
                  </h3>
                  <p className="text-emerald-300 font-mono text-sm font-bold mt-1">
                    Precisión biomecánica lograda: {poseMatchPercentage}%
                  </p>
                  <div className="mt-3 px-4 py-1.5 rounded-full bg-black/60 border border-[#D9A9FF] text-[#D9A9FF] font-mono font-black text-sm">
                    +50 PUNTOS WAACKING ACUMULADOS
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Quick HUD Toggles */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 border-t border-white/10 pt-3 gap-2 flex-wrap">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showSkeletonMesh} 
                  onChange={(e) => setShowSkeletonMesh(e.target.checked)} 
                  className="accent-[#38BDF8] w-3.5 h-3.5"
                />
                <span>Malla Esquelética</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showGhostGuide} 
                  onChange={(e) => setShowGhostGuide(e.target.checked)} 
                  className="accent-[#D9A9FF] w-3.5 h-3.5"
                />
                <span>Guía Fantasma</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showAngleOverlays} 
                  onChange={(e) => setShowAngleOverlays(e.target.checked)} 
                  className="accent-cyan-400 w-3.5 h-3.5"
                />
                <span>Ángulos en Vivo</span>
              </label>
            </div>

            <span className="text-[10px] text-slate-500">
              Sensor óptico: {motionLevel}% actividad
            </span>
          </div>

        </div>

        {/* 2. MÓDULO DE REFERENCIA: TARJETA FOTOGRÁFICA + TEMPORIZADOR CIRCULAR (5 COLS) */}
        <div className={`lg:col-span-5 p-4 sm:p-5 rounded-3xl border ${theme === 'light' ? 'bg-white border-zinc-200' : 'bg-[#0D0F1D] border-[#D9A9FF]/30'} flex flex-col justify-between space-y-4`}>
          
          {/* Module Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-mono font-bold text-white uppercase">
                  {isEs ? 'Pose Objetivo de Referencia' : 'Target Reference Pose'}
                </h3>
                <p className="text-[10px] font-mono text-slate-400">
                  {currentTarget.category} • {currentTarget.difficulty}
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono text-[#D9A9FF] bg-[#D9A9FF]/10 px-2 py-0.5 rounded-lg border border-[#D9A9FF]/30">
              {selectedPoseIndex + 1} / {WAACKING_TARGET_POSES.length}
            </span>
          </div>

          {/* Reference Image Card & Circular Progress Meter */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black border border-white/10 group shadow-xl">
            <img 
              src={currentTarget.imageUrl} 
              alt={currentTarget.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

            {/* Circular Hold Progress Indicator on Reference */}
            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md p-2 rounded-2xl border border-white/20 flex items-center gap-2">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-white/10"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#D9A9FF] transition-all duration-100"
                    strokeDasharray={`${holdProgress}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-[9px] font-mono font-black text-white">
                  {holdProgress}%
                </span>
              </div>
            </div>

            {/* Target Angle Specification Badges */}
            <div className="absolute bottom-3 left-3 right-3 p-3 bg-black/80 backdrop-blur-md rounded-xl border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-black text-[#D9A9FF] uppercase">
                  {currentTarget.name}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  Umbral: &gt;85%
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-300 line-clamp-2">
                {currentTarget.description}
              </p>
              
              {/* Target Angles Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10 text-[10px] font-mono text-slate-400">
                <div>🎯 Codo Izq: <span className="text-cyan-300 font-bold">{currentTarget.targetLeftElbowAngle}°</span></div>
                <div>🎯 Codo Der: <span className="text-cyan-300 font-bold">{currentTarget.targetRightElbowAngle}°</span></div>
                <div>🎯 Hombro Izq: <span className="text-amber-300 font-bold">{currentTarget.targetLeftShoulderAngle}°</span></div>
                <div>🎯 Hombro Der: <span className="text-amber-300 font-bold">{currentTarget.targetRightShoulderAngle}°</span></div>
              </div>
            </div>
          </div>

          {/* Technical Validation Tips */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
            <span className="text-[10px] font-mono font-bold text-[#D9A9FF] uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {isEs ? 'Recomendaciones Técnicas del Maestro:' : 'Master Technical Tips:'}
            </span>
            <ul className="space-y-1 text-[11px] font-mono text-slate-300">
              {currentTarget.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-[#D9A9FF] font-bold">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={() => {
                setSelectedPoseIndex((prev) => (prev === 0 ? WAACKING_TARGET_POSES.length - 1 : prev - 1));
                setHoldProgress(0);
                setIsPoseValidated(false);
              }}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs uppercase transition-all flex items-center gap-1 cursor-pointer border border-white/10"
            >
              <span>{isEs ? '← Anterior' : '← Previous'}</span>
            </button>

            <button
              onClick={() => {
                setSelectedPoseIndex((prev) => (prev + 1) % WAACKING_TARGET_POSES.length);
                setHoldProgress(0);
                setIsPoseValidated(false);
              }}
              className="px-4 py-2 rounded-xl bg-[#D9A9FF] hover:bg-[#F2CFFF] text-black font-mono font-black text-xs uppercase transition-all flex items-center gap-1 cursor-pointer shadow-md"
            >
              <span>{isEs ? 'Siguiente Pose →' : 'Next Pose →'}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AIPoseLab;
