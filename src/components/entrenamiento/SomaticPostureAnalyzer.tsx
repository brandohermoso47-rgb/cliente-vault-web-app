import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  RotateCcw, 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Sliders, 
  Maximize2, 
  Eye, 
  EyeOff, 
  HelpCircle, 
  Layers, 
  Zap, 
  Compass, 
  ShieldCheck, 
  Download,
  Info,
  RefreshCw,
  Award
} from 'lucide-react';
import { Language } from '../../lib/translations';

export interface JointPoint {
  x: number; // 0 to 100 relative percentage or absolute pixels
  y: number;
}

export interface SkeletonPose {
  id: string;
  nameEs: string;
  nameEn: string;
  descriptionEs: string;
  descriptionEn: string;
  joints: Record<string, JointPoint>;
  targetLeftElbowAngle: number;
  targetRightElbowAngle: number;
}

export interface SomaticPostureAnalyzerProps {
  language?: Language;
  onSaveLog?: (log: any) => void;
  className?: string;
}

// Key Joint IDs
const JOINT_KEYS = [
  'head',
  'sternum',
  'pelvis',
  'leftShoulder',
  'leftElbow',
  'leftWrist',
  'rightShoulder',
  'rightElbow',
  'rightWrist',
  'leftHip',
  'rightHip'
] as const;

export type JointKey = typeof JOINT_KEYS[number];

// Default Preset Poses
export const REFERENCE_POSES: SkeletonPose[] = [
  {
    id: 'high_v',
    nameEs: 'Waacking High-V Extension',
    nameEn: 'Waacking High-V Extension',
    descriptionEs: 'Brazos extendidos simétricamente hacia arriba a 150° de elevación para máxima proyección.',
    descriptionEn: 'Symmetrically extended arms upwards at 150° elevation for maximum projection.',
    targetLeftElbowAngle: 165,
    targetRightElbowAngle: 165,
    joints: {
      head: { x: 50, y: 18 },
      sternum: { x: 50, y: 38 },
      pelvis: { x: 50, y: 68 },
      leftShoulder: { x: 42, y: 36 },
      leftElbow: { x: 30, y: 22 },
      leftWrist: { x: 20, y: 10 },
      rightShoulder: { x: 58, y: 36 },
      rightElbow: { x: 70, y: 22 },
      rightWrist: { x: 80, y: 10 },
      leftHip: { x: 44, y: 68 },
      rightHip: { x: 56, y: 68 }
    }
  },
  {
    id: 'overhead_roll',
    nameEs: 'Overhead Whip / Roll Frame',
    nameEn: 'Overhead Whip / Roll Frame',
    descriptionEs: 'Brazo derecho sobre la cabeza flexionando el codo a 80°, brazo izquierdo preparado a 120°.',
    descriptionEn: 'Right arm over head with elbow flexed at 80°, left arm prepared at 120°.',
    targetLeftElbowAngle: 120,
    targetRightElbowAngle: 80,
    joints: {
      head: { x: 50, y: 22 },
      sternum: { x: 50, y: 42 },
      pelvis: { x: 50, y: 72 },
      leftShoulder: { x: 40, y: 40 },
      leftElbow: { x: 26, y: 48 },
      leftWrist: { x: 18, y: 60 },
      rightShoulder: { x: 60, y: 40 },
      rightElbow: { x: 68, y: 20 },
      rightWrist: { x: 52, y: 10 },
      leftHip: { x: 44, y: 72 },
      rightHip: { x: 56, y: 72 }
    }
  },
  {
    id: 'chin_frame',
    nameEs: 'Waack Framing (Codos 90° Mentón)',
    nameEn: 'Waack Framing (Double 90° Chin Lock)',
    descriptionEs: 'Encuadre facial simétrico con ambos codos doblados en ángulo recto a 90°.',
    descriptionEn: 'Symmetrical face framing with both elbows bent at 90° right angles.',
    targetLeftElbowAngle: 90,
    targetRightElbowAngle: 90,
    joints: {
      head: { x: 50, y: 20 },
      sternum: { x: 50, y: 44 },
      pelvis: { x: 50, y: 72 },
      leftShoulder: { x: 38, y: 42 },
      leftElbow: { x: 32, y: 30 },
      leftWrist: { x: 46, y: 26 },
      rightShoulder: { x: 62, y: 42 },
      rightElbow: { x: 68, y: 30 },
      rightWrist: { x: 54, y: 26 },
      leftHip: { x: 44, y: 72 },
      rightHip: { x: 56, y: 72 }
    }
  },
  {
    id: 'low_line',
    nameEs: 'Extensión Horizontal Posing',
    nameEn: 'Horizontal Posing Line',
    descriptionEs: 'Línea de pose baja con brazos completamente estirados en dirección horizontal.',
    descriptionEn: 'Low posing line with arms fully extended horizontally.',
    targetLeftElbowAngle: 175,
    targetRightElbowAngle: 175,
    joints: {
      head: { x: 50, y: 20 },
      sternum: { x: 50, y: 40 },
      pelvis: { x: 50, y: 70 },
      leftShoulder: { x: 40, y: 40 },
      leftElbow: { x: 25, y: 42 },
      leftWrist: { x: 10, y: 44 },
      rightShoulder: { x: 60, y: 40 },
      rightElbow: { x: 75, y: 42 },
      rightWrist: { x: 90, y: 44 },
      leftHip: { x: 44, y: 70 },
      rightHip: { x: 56, y: 70 }
    }
  }
];

// Helper: Vector math for angle calculation
export function calculateJointAngle(p1: JointPoint, vertex: JointPoint, p2: JointPoint): number {
  const u = { x: p1.x - vertex.x, y: p1.y - vertex.y };
  const v = { x: p2.x - vertex.x, y: p2.y - vertex.y };

  const dot = u.x * v.x + u.y * v.y;
  const magU = Math.sqrt(u.x * u.x + u.y * u.y);
  const magV = Math.sqrt(v.x * v.x + v.y * v.y);

  if (magU === 0 || magV === 0) return 0;

  // Clamp cosine to [-1.0, 1.0] to prevent NaN
  let cosTheta = dot / (magU * magV);
  cosTheta = Math.max(-1.0, Math.min(1.0, cosTheta));

  const rad = Math.acos(cosTheta);
  return (rad * 180) / Math.PI;
}

export const SomaticPostureAnalyzer: React.FC<SomaticPostureAnalyzerProps> = ({
  language = 'es',
  onSaveLog,
  className = ''
}) => {
  const isEs = language === 'es';

  // Active Preset Pose
  const [activePoseIndex, setActivePoseIndex] = useState<number>(0);
  const activePreset = REFERENCE_POSES[activePoseIndex];

  // User Interactive Joints
  const [joints, setJoints] = useState<Record<string, JointPoint>>(() => ({
    ...activePreset.joints
  }));

  // Selected Dragging Joint
  const [draggingJoint, setDraggingJoint] = useState<JointKey | null>(null);
  const [hoveredJoint, setHoveredJoint] = useState<JointKey | null>(null);

  // Background Options
  const [bgType, setBgType] = useState<'grid' | 'upload' | 'webcam'>('grid');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [webcamMotionLevel, setWebcamMotionLevel] = useState<number>(0);
  const [autoTrackMotion, setAutoTrackMotion] = useState<boolean>(true);

  // View Options
  const [showGhost, setShowGhost] = useState<boolean>(true);
  const [showAngleArcs, setShowAngleArcs] = useState<boolean>(true);
  const [showCoreLine, setShowCoreLine] = useState<boolean>(true);
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Canvas Refs
  const viewportRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset joints when preset changes
  useEffect(() => {
    setJoints({ ...REFERENCE_POSES[activePoseIndex].joints });
  }, [activePoseIndex]);

  // Webcam stream toggle
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (bgType === 'webcam' && webcamActive) {
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'user' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play().catch(e => console.log('Webcam play err:', e));
          }
        })
        .catch((err) => {
          console.warn('Webcam notice:', err?.message || err);
          setWebcamError(isEs ? 'Permiso de cámara no concedido o no disponible. Usando vista analítica de cuadrícula.' : 'Webcam not available or permission denied. Using grid view.');
          setBgType('grid');
          setWebcamActive(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [bgType, webcamActive, isEs]);

  // Webcam Motion Capture Processing Loop
  const analyzerMotionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyzerPrevFrameRef = useRef<Uint8ClampedArray | null>(null);

  useEffect(() => {
    if (bgType !== 'webcam' || !webcamActive || !autoTrackMotion) {
      setWebcamMotionLevel(0);
      return;
    }

    let animId: number;
    let lastTs = 0;

    const processMotion = (ts: number) => {
      if (ts - lastTs > 80) { // ~12 FPS motion sampling
        lastTs = ts;
        const v = videoRef.current;
        if (v && v.readyState >= 2) {
          if (!analyzerMotionCanvasRef.current) {
            const c = document.createElement('canvas');
            c.width = 64;
            c.height = 48;
            analyzerMotionCanvasRef.current = c;
          }

          const c = analyzerMotionCanvasRef.current;
          const ctx = c.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(v, 0, 0, c.width, c.height);
            const currData = ctx.getImageData(0, 0, c.width, c.height).data;

            if (analyzerPrevFrameRef.current && analyzerPrevFrameRef.current.length === currData.length) {
              const prevData = analyzerPrevFrameRef.current;
              let diffAcc = 0;
              let sumLx = 0, sumLy = 0, cL = 0;
              let sumRx = 0, sumRy = 0, cR = 0;

              for (let i = 0; i < currData.length; i += 4) {
                const lCurr = 0.299 * currData[i] + 0.587 * currData[i + 1] + 0.114 * currData[i + 2];
                const lPrev = 0.299 * prevData[i] + 0.587 * prevData[i + 1] + 0.114 * prevData[i + 2];
                const delta = Math.abs(lCurr - lPrev);

                if (delta > 25) {
                  diffAcc += delta;
                  const idx = i / 4;
                  const px = idx % c.width;
                  const py = Math.floor(idx / c.width);

                  // Relative X/Y (mirrored for camera)
                  const relX = 100 - (px / c.width) * 100;
                  const relY = (py / c.height) * 100;

                  if (relX < 50 && relY < 75) {
                    sumLx += relX;
                    sumLy += relY;
                    cL++;
                  } else if (relX >= 50 && relY < 75) {
                    sumRx += relX;
                    sumRy += relY;
                    cR++;
                  }
                }
              }

              const motionPct = Math.min(100, Math.round((diffAcc / (c.width * c.height * 12)) * 100));
              setWebcamMotionLevel(motionPct);

              if (motionPct > 8) {
                setJoints(prev => {
                  const copy = { ...prev };
                  if (cL > 3 && copy.leftWrist && copy.leftElbow) {
                    const avgX = sumLx / cL;
                    const avgY = sumLy / cL;
                    copy.leftWrist = {
                      x: copy.leftWrist.x + (avgX - copy.leftWrist.x) * 0.25,
                      y: copy.leftWrist.y + (avgY - copy.leftWrist.y) * 0.25
                    };
                    copy.leftElbow = {
                      x: copy.leftElbow.x + ((avgX * 0.7 + copy.leftShoulder.x * 0.3) - copy.leftElbow.x) * 0.2,
                      y: copy.leftElbow.y + ((avgY * 0.7 + copy.leftShoulder.y * 0.3) - copy.leftElbow.y) * 0.2
                    };
                  }
                  if (cR > 3 && copy.rightWrist && copy.rightElbow) {
                    const avgX = sumRx / cR;
                    const avgY = sumRy / cR;
                    copy.rightWrist = {
                      x: copy.rightWrist.x + (avgX - copy.rightWrist.x) * 0.25,
                      y: copy.rightWrist.y + (avgY - copy.rightWrist.y) * 0.25
                    };
                    copy.rightElbow = {
                      x: copy.rightElbow.x + ((avgX * 0.7 + copy.rightShoulder.x * 0.3) - copy.rightElbow.x) * 0.2,
                      y: copy.rightElbow.y + ((avgY * 0.7 + copy.rightShoulder.y * 0.3) - copy.rightElbow.y) * 0.2
                    };
                  }
                  return copy;
                });
              }
            }

            analyzerPrevFrameRef.current = new Uint8ClampedArray(currData);
          }
        }
      }

      animId = requestAnimationFrame(processMotion);
    };

    animId = requestAnimationFrame(processMotion);

    return () => cancelAnimationFrame(animId);
  }, [bgType, webcamActive, autoTrackMotion]);

  // Handle Dragging
  const handlePointerDown = (key: JointKey, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingJoint(key);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingJoint || !viewportRef.current) return;

    const rect = viewportRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    let xPct = ((clientX - rect.left) / rect.width) * 100;
    let yPct = ((clientY - rect.top) / rect.height) * 100;

    // Constrain to canvas
    xPct = Math.max(2, Math.min(98, xPct));
    yPct = Math.max(2, Math.min(98, yPct));

    setJoints(prev => ({
      ...prev,
      [draggingJoint]: { x: xPct, y: yPct }
    }));
  }, [draggingJoint]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (draggingJoint) {
      setDraggingJoint(null);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {
        // ignore
      }
    }
  }, [draggingJoint]);

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImageUrl(url);
      setBgType('upload');
    }
  };

  // CALCULATIONS
  // 1. Left Elbow Angle
  const leftElbowAngle = useMemo(() => {
    if (!joints.leftShoulder || !joints.leftElbow || !joints.leftWrist) return 0;
    return calculateJointAngle(joints.leftShoulder, joints.leftElbow, joints.leftWrist);
  }, [joints]);

  // 2. Right Elbow Angle
  const rightElbowAngle = useMemo(() => {
    if (!joints.rightShoulder || !joints.rightElbow || !joints.rightWrist) return 0;
    return calculateJointAngle(joints.rightShoulder, joints.rightElbow, joints.rightWrist);
  }, [joints]);

  // 3. Left Shoulder Angle
  const leftShoulderAngle = useMemo(() => {
    if (!joints.sternum || !joints.leftShoulder || !joints.leftElbow) return 0;
    return calculateJointAngle(joints.sternum, joints.leftShoulder, joints.leftElbow);
  }, [joints]);

  // 4. Right Shoulder Angle
  const rightShoulderAngle = useMemo(() => {
    if (!joints.sternum || !joints.rightShoulder || !joints.rightElbow) return 0;
    return calculateJointAngle(joints.sternum, joints.rightShoulder, joints.rightElbow);
  }, [joints]);

  // 5. Symmetry Score Calculation (0 - 100%)
  const symmetryScore = useMemo(() => {
    const elbowDelta = Math.abs(leftElbowAngle - rightElbowAngle);
    const shoulderDelta = Math.abs(leftShoulderAngle - rightShoulderAngle);

    const elbowSym = Math.max(0, 100 - elbowDelta * 1.2);
    const shoulderSym = Math.max(0, 100 - shoulderDelta * 1.2);

    return Math.round(0.6 * elbowSym + 0.4 * shoulderSym);
  }, [leftElbowAngle, rightElbowAngle, leftShoulderAngle, rightShoulderAngle]);

  // 6. Core Alignment Score (0 - 100%)
  // Measures X offset between Head -> Sternum and Sternum -> Pelvis
  const coreAlignmentScore = useMemo(() => {
    if (!joints.head || !joints.sternum || !joints.pelvis) return 100;
    const dxHeadSternum = Math.abs(joints.head.x - joints.sternum.x);
    const dxSternumPelvis = Math.abs(joints.sternum.x - joints.pelvis.x);

    const totalDev = dxHeadSternum + dxSternumPelvis;
    return Math.max(0, Math.round(100 - totalDev * 3.5));
  }, [joints]);

  // 7. Overall Pose Target Match Score (0 - 100%)
  const poseMatchScore = useMemo(() => {
    const targetL = activePreset.targetLeftElbowAngle;
    const targetR = activePreset.targetRightElbowAngle;

    const errL = Math.abs(leftElbowAngle - targetL);
    const errR = Math.abs(rightElbowAngle - targetR);

    const angleAccuracy = Math.max(0, 100 - ((errL + errR) / 2) * 1.1);

    return Math.round(0.5 * angleAccuracy + 0.3 * symmetryScore + 0.2 * coreAlignmentScore);
  }, [leftElbowAngle, rightElbowAngle, activePreset, symmetryScore, coreAlignmentScore]);

  // Snap to Symmetrical Action
  const handleSnapSymmetry = () => {
    setJoints(prev => {
      const avgElbowX = 50 + (50 - prev.leftElbow.x);
      return {
        ...prev,
        rightElbow: { x: avgElbowX, y: prev.leftElbow.y },
        rightWrist: { x: 50 + (50 - prev.leftWrist.x), y: prev.leftWrist.y },
        rightShoulder: { x: 50 + (50 - prev.leftShoulder.x), y: prev.leftShoulder.y },
        rightHip: { x: 50 + (50 - prev.leftHip.x), y: prev.leftHip.y }
      };
    });
  };

  // Save Analysis Snapshot
  const handleSaveLog = () => {
    const logData = {
      timestamp: new Date().toISOString(),
      poseName: activePreset.nameEs,
      leftElbowAngle: Math.round(leftElbowAngle * 10) / 10,
      rightElbowAngle: Math.round(rightElbowAngle * 10) / 10,
      leftShoulderAngle: Math.round(leftShoulderAngle * 10) / 10,
      rightShoulderAngle: Math.round(rightShoulderAngle * 10) / 10,
      symmetryScore,
      coreAlignmentScore,
      poseMatchScore,
      joints
    };

    if (onSaveLog) {
      onSaveLog(logData);
    }

    setSaveSuccessMsg(
      isEs 
        ? '¡Análisis guardado exitosamente en tu bitácora somática!' 
        : 'Analysis successfully saved to your somatic log!'
    );

    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 3000);
  };

  // Joint Names mapping for UI labels
  const JOINT_LABELS: Record<JointKey, { es: string; en: string }> = {
    head: { es: 'Cabeza / Coronilla', en: 'Head / Crown' },
    sternum: { es: 'Esternón / Torso', en: 'Sternum / Core' },
    pelvis: { es: 'Pelvis / Centro', en: 'Pelvis / Center' },
    leftShoulder: { es: 'Hombro Izquierdo', en: 'Left Shoulder' },
    leftElbow: { es: 'Codo Izquierdo', en: 'Left Elbow' },
    leftWrist: { es: 'Muñeca Izquierda', en: 'Left Wrist' },
    rightShoulder: { es: 'Hombro Derecho', en: 'Right Shoulder' },
    rightElbow: { es: 'Codo Derecho', en: 'Right Elbow' },
    rightWrist: { es: 'Muñeca Derecha', en: 'Right Wrist' },
    leftHip: { es: 'Cadera Izquierda', en: 'Left Hip' },
    rightHip: { es: 'Cadera Derecha', en: 'Right Hip' }
  };

  return (
    <div className={`bg-[#0D0B18] border border-cyan-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 text-white ${className}`}>
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] font-black uppercase tracking-widest mb-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
            SOMATIC POSTURE ANALYZER • BIOMECHANICAL VECTOR ENGINE
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight flex items-center gap-2">
            Análisis Vectorial de Postura Somática
          </h2>
          <p className="text-xs text-slate-300 font-sans mt-0.5">
            {isEs 
              ? 'Mide con precisión matemática el producto escalar de tus articulaciones, flexión de codos y alineación de core.'
              : 'Measure joint flexion angle scalar products, elbow bending, and core axis alignment.'}
          </p>
        </div>

        {/* Top Control Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowFormulaModal(true)}
            className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5"
            title="Ver fórmula del producto escalar"
          >
            <Info className="w-4 h-4 text-purple-400" />
            <span>Ver Fórmula $\theta$</span>
          </button>

          <button
            type="button"
            onClick={handleSnapSymmetry}
            className="px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5"
            title="Alinear simetría izquierda-derecha"
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Auto-Simetría</span>
          </button>

          <button
            type="button"
            onClick={handleSaveLog}
            className="px-3 py-2 bg-[#D9A9FF] hover:bg-[#B87CFF] text-black rounded-xl font-mono text-xs font-black transition-all flex items-center gap-1.5 shadow-lg active:scale-95"
          >
            <Download className="w-4 h-4 text-black" />
            <span>Guardar Análisis</span>
          </button>
        </div>
      </div>

      {/* SUCCESS TOAST NOTIFICATION */}
      <AnimatePresence>
        {saveSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold rounded-2xl flex items-center gap-2.5 shadow-xl"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT GRID: CANVAS & DIAGNOSTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT COLUMN: INTERACTIVE CANVAS VIEWPORT (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">

          {/* PRESET POSE SELECTOR & BG CONTROLS */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#131024] p-3 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase shrink-0">Pose:</span>
              {REFERENCE_POSES.map((pose, idx) => (
                <button
                  key={pose.id}
                  type="button"
                  onClick={() => setActivePoseIndex(idx)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold uppercase transition-all shrink-0 ${
                    activePoseIndex === idx
                      ? 'bg-[#D9A9FF] text-black shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  {(pose?.nameEs || 'Pose').split(' ')[0]} {(pose?.nameEs || '').split(' ')[1] || ''}
                </button>
              ))}
            </div>

            {/* Backdrops */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setBgType('grid')}
                className={`p-2 rounded-lg text-xs font-mono font-bold transition-all ${
                  bgType === 'grid' ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50' : 'bg-white/5 text-slate-400'
                }`}
                title="Malla Neón Biomecánica"
              >
                <Layers className="w-4 h-4" />
              </button>

              <label 
                className={`p-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  bgType === 'upload' ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50' : 'bg-white/5 text-slate-400'
                }`}
                title="Subir Foto de Referencia"
              >
                <Upload className="w-4 h-4" />
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (bgType === 'webcam') {
                    setBgType('grid');
                    setWebcamActive(false);
                  } else {
                    setBgType('webcam');
                    setWebcamActive(true);
                  }
                }}
                className={`p-2 rounded-lg text-xs font-mono font-bold transition-all ${
                  bgType === 'webcam' ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50' : 'bg-white/5 text-slate-400'
                }`}
                title="Cámara Web en Vivo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* VIEWPORT CANVAS */}
          <div
            ref={viewportRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative aspect-[4/3] w-full bg-[#0A0814] rounded-3xl border-2 border-cyan-500/30 overflow-hidden shadow-2xl select-none touch-none group"
          >
            {/* Background Layer 1: Biomechanical Grid */}
            {bgType === 'grid' && (
              <div className="absolute inset-0 bg-[radial-gradient(#1e183a_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
            )}

            {/* Background Layer 2: Uploaded Image */}
            {bgType === 'upload' && uploadedImageUrl && (
              <img 
                src={uploadedImageUrl} 
                alt="Uploaded Pose Reference" 
                className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-80"
              />
            )}

            {/* Background Layer 3: Live Webcam */}
            {bgType === 'webcam' && (
              <>
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 opacity-80 pointer-events-none"
                />

                {/* Motion Tag */}
                <div className="absolute top-3 left-3 z-30 flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-rose-500/40">
                  <span className={`w-2.5 h-2.5 rounded-full ${webcamMotionLevel > 10 ? 'bg-rose-400 animate-ping' : 'bg-rose-500/50'}`} />
                  <span className="text-[10px] font-mono font-bold text-rose-300 uppercase tracking-wide">
                    {autoTrackMotion
                      ? (webcamMotionLevel > 10 ? `⚡ CAPTANDO MOVIMIENTO (${webcamMotionLevel}%)` : '📷 CÁMARA ACTIVA')
                      : 'CÁMARA MANUAL'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAutoTrackMotion(!autoTrackMotion)}
                    className="ml-2 px-2 py-0.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 rounded text-[9px] font-mono"
                  >
                    {autoTrackMotion ? 'PAUSAR RASTREO' : 'REANUDAR RASTREO'}
                  </button>
                </div>
              </>
            )}

            {/* SVG OVERLAY LAYERS: LINES, ARCS, SKELETON */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              
              {/* Core Vertical Alignment Axis Line */}
              {showCoreLine && joints.head && joints.pelvis && (
                <line
                  x1={`${joints.head.x}%`}
                  y1="5%"
                  x2={`${joints.head.x}%`}
                  y2="95%"
                  stroke="#06B6D4"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.4"
                />
              )}

              {/* GHOST REFERENCE TARGET SKELETON */}
              {showGhost && (
                <g opacity="0.35">
                  {/* Torso Ghost */}
                  <line x1={`${activePreset.joints.head.x}%`} y1={`${activePreset.joints.head.y}%`} x2={`${activePreset.joints.sternum.x}%`} y2={`${activePreset.joints.sternum.y}%`} stroke="#D9A9FF" strokeWidth="2" strokeDasharray="3 3" />
                  <line x1={`${activePreset.joints.sternum.x}%`} y1={`${activePreset.joints.sternum.y}%`} x2={`${activePreset.joints.pelvis.x}%`} y2={`${activePreset.joints.pelvis.y}%`} stroke="#D9A9FF" strokeWidth="2" strokeDasharray="3 3" />

                  {/* Left Arm Ghost */}
                  <line x1={`${activePreset.joints.sternum.x}%`} y1={`${activePreset.joints.sternum.y}%`} x2={`${activePreset.joints.leftShoulder.x}%`} y2={`${activePreset.joints.leftShoulder.y}%`} stroke="#D9A9FF" strokeWidth="2" strokeDasharray="3 3" />
                  <line x1={`${activePreset.joints.leftShoulder.x}%`} y1={`${activePreset.joints.leftShoulder.y}%`} x2={`${activePreset.joints.leftElbow.x}%`} y2={`${activePreset.joints.leftElbow.y}%`} stroke="#D9A9FF" strokeWidth="2" strokeDasharray="3 3" />
                  <line x1={`${activePreset.joints.leftElbow.x}%`} y1={`${activePreset.joints.leftElbow.y}%`} x2={`${activePreset.joints.leftWrist.x}%`} y2={`${activePreset.joints.leftWrist.y}%`} stroke="#D9A9FF" strokeWidth="2" strokeDasharray="3 3" />

                  {/* Right Arm Ghost */}
                  <line x1={`${activePreset.joints.sternum.x}%`} y1={`${activePreset.joints.sternum.y}%`} x2={`${activePreset.joints.rightShoulder.x}%`} y2={`${activePreset.joints.rightShoulder.y}%`} stroke="#D9A9FF" strokeWidth="2" strokeDasharray="3 3" />
                  <line x1={`${activePreset.joints.rightShoulder.x}%`} y1={`${activePreset.joints.rightShoulder.y}%`} x2={`${activePreset.joints.rightElbow.x}%`} y2={`${activePreset.joints.rightElbow.y}%`} stroke="#D9A9FF" strokeWidth="2" strokeDasharray="3 3" />
                  <line x1={`${activePreset.joints.rightElbow.x}%`} y1={`${activePreset.joints.rightElbow.y}%`} x2={`${activePreset.joints.rightWrist.x}%`} y2={`${activePreset.joints.rightWrist.y}%`} stroke="#D9A9FF" strokeWidth="2" strokeDasharray="3 3" />

                  {/* Target Joint Circles */}
                  {Object.entries(activePreset.joints).map(([k, pt]) => (
                    <circle key={`ghost-${k}`} cx={`${pt.x}%`} cy={`${pt.y}%`} r="4" fill="#D9A9FF" opacity="0.6" />
                  ))}
                </g>
              )}

              {/* USER SKELETON CONNECTIONS */}
              {/* Torso Spine */}
              <line x1={`${joints.head.x}%`} y1={`${joints.head.y}%`} x2={`${joints.sternum.x}%`} y2={`${joints.sternum.y}%`} stroke="#06B6D4" strokeWidth="3" />
              <line x1={`${joints.sternum.x}%`} y1={`${joints.sternum.y}%`} x2={`${joints.pelvis.x}%`} y2={`${joints.pelvis.y}%`} stroke="#06B6D4" strokeWidth="3" />

              {/* Left Arm (Purple / Cyan) */}
              <line x1={`${joints.sternum.x}%`} y1={`${joints.sternum.y}%`} x2={`${joints.leftShoulder.x}%`} y2={`${joints.leftShoulder.y}%`} stroke="#A855F7" strokeWidth="3" />
              <line x1={`${joints.leftShoulder.x}%`} y1={`${joints.leftShoulder.y}%`} x2={`${joints.leftElbow.x}%`} y2={`${joints.leftElbow.y}%`} stroke="#A855F7" strokeWidth="3.5" />
              <line x1={`${joints.leftElbow.x}%`} y1={`${joints.leftElbow.y}%`} x2={`${joints.leftWrist.x}%`} y2={`${joints.leftWrist.y}%`} stroke="#A855F7" strokeWidth="3.5" />

              {/* Right Arm (Emerald / Cyan) */}
              <line x1={`${joints.sternum.x}%`} y1={`${joints.sternum.y}%`} x2={`${joints.rightShoulder.x}%`} y2={`${joints.rightShoulder.y}%`} stroke="#10B981" strokeWidth="3" />
              <line x1={`${joints.rightShoulder.x}%`} y1={`${joints.rightShoulder.y}%`} x2={`${joints.rightElbow.x}%`} y2={`${joints.rightElbow.y}%`} stroke="#10B981" strokeWidth="3.5" />
              <line x1={`${joints.rightElbow.x}%`} y1={`${joints.rightElbow.y}%`} x2={`${joints.rightWrist.x}%`} y2={`${joints.rightWrist.y}%`} stroke="#10B981" strokeWidth="3.5" />

              {/* Hips */}
              <line x1={`${joints.pelvis.x}%`} y1={`${joints.pelvis.y}%`} x2={`${joints.leftHip.x}%`} y2={`${joints.leftHip.y}%`} stroke="#06B6D4" strokeWidth="3" />
              <line x1={`${joints.pelvis.x}%`} y1={`${joints.pelvis.y}%`} x2={`${joints.rightHip.x}%`} y2={`${joints.rightHip.y}%`} stroke="#06B6D4" strokeWidth="3" />

              {/* Visual Angle Ring Highlights around Elbows */}
              {showAngleArcs && (
                <>
                  {/* Left Elbow Ring */}
                  <circle 
                    cx={`${joints.leftElbow.x}%`} 
                    cy={`${joints.leftElbow.y}%`} 
                    r="16" 
                    fill="none" 
                    stroke="#A855F7" 
                    strokeWidth="1.5" 
                    strokeDasharray="3 3"
                    className="animate-spin-slow"
                  />
                  {/* Right Elbow Ring */}
                  <circle 
                    cx={`${joints.rightElbow.x}%`} 
                    cy={`${joints.rightElbow.y}%`} 
                    r="16" 
                    fill="none" 
                    stroke="#10B981" 
                    strokeWidth="1.5" 
                    strokeDasharray="3 3"
                    className="animate-spin-slow"
                  />
                </>
              )}
            </svg>

            {/* DRAGGABLE JOINT NODES */}
            {JOINT_KEYS.map((key) => {
              const pt = joints[key];
              if (!pt) return null;

              const isDragging = draggingJoint === key;
              const isHovered = hoveredJoint === key;
              const isElbow = key === 'leftElbow' || key === 'rightElbow';

              return (
                <div
                  key={key}
                  style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                  onPointerDown={(e) => handlePointerDown(key, e)}
                  onPointerEnter={() => setHoveredJoint(key)}
                  onPointerLeave={() => setHoveredJoint(null)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-grab active:cursor-grabbing p-2"
                >
                  <div 
                    className={`rounded-full transition-all flex items-center justify-center ${
                      isElbow
                        ? 'w-7 h-7 bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.8)] border-2 border-white'
                        : isDragging || isHovered
                          ? 'w-6 h-6 bg-cyan-400 text-black shadow-[0_0_12px_rgba(6,182,212,0.8)] border-2 border-white'
                          : 'w-4 h-4 bg-cyan-500 border-2 border-white shadow-md'
                    }`}
                  >
                    {isElbow && (
                      <span className="text-[9px] font-mono font-black">
                        {key === 'leftElbow' ? 'L' : 'R'}
                      </span>
                    )}
                  </div>

                  {/* Hover / Dragging Tooltip Label */}
                  <AnimatePresence>
                    {(isDragging || isHovered) && (
                      <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.9 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 rounded-md bg-black/90 border border-white/20 text-[9px] font-mono text-cyan-300 font-bold whitespace-nowrap pointer-events-none shadow-xl z-30"
                      >
                        {JOINT_LABELS[key]?.[isEs ? 'es' : 'en']}
                        {key === 'leftElbow' && ` (${leftElbowAngle.toFixed(1)}°)`}
                        {key === 'rightElbow' && ` (${rightElbowAngle.toFixed(1)}°)`}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* LIVE ANGLE OVERLAY BADGES ON CANVAS */}
            {showAngleArcs && (
              <>
                <div 
                  style={{ left: `${joints.leftElbow.x}%`, top: `${joints.leftElbow.y + 6}%` }}
                  className="absolute -translate-x-1/2 pointer-events-none bg-purple-950/90 border border-purple-500/60 px-2 py-0.5 rounded-lg text-[10px] font-mono font-black text-purple-200 shadow-lg z-10"
                >
                  $\theta_L$: {leftElbowAngle.toFixed(1)}°
                </div>

                <div 
                  style={{ left: `${joints.rightElbow.x}%`, top: `${joints.rightElbow.y + 6}%` }}
                  className="absolute -translate-x-1/2 pointer-events-none bg-emerald-950/90 border border-emerald-500/60 px-2 py-0.5 rounded-lg text-[10px] font-mono font-black text-emerald-200 shadow-lg z-10"
                >
                  $\theta_R$: {rightElbowAngle.toFixed(1)}°
                </div>
              </>
            )}

            {/* CANVAS BOTTOM CONTROL TOGGLES */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 z-10 text-[10px] font-mono">
              <span className="text-slate-400 font-bold hidden sm:inline">
                Arrastra los nodos articulares en el lienzo
              </span>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setShowGhost(!showGhost)}
                  className={`px-2 py-1 rounded-lg border flex items-center gap-1 transition-all ${
                    showGhost ? 'bg-[#D9A9FF]/20 text-[#D9A9FF] border-[#D9A9FF]/40' : 'bg-white/5 text-slate-400 border-white/10'
                  }`}
                >
                  {showGhost ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>Target Ghost</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAngleArcs(!showAngleArcs)}
                  className={`px-2 py-1 rounded-lg border flex items-center gap-1 transition-all ${
                    showAngleArcs ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-white/5 text-slate-400 border-white/10'
                  }`}
                >
                  <Activity className="w-3 h-3" />
                  <span>Ángulos $\theta$</span>
                </button>

                <button
                  type="button"
                  onClick={() => setJoints({ ...activePreset.joints })}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  title="Reiniciar Posiciones"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* ACTIVE POSE BENCHMARK DESCRIPTION */}
          <div className="p-3.5 bg-[#120F22] rounded-2xl border border-white/10 text-xs font-sans space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-[#D9A9FF] text-[11px] uppercase">
                Objetivo Cátedra: {activePreset.nameEs}
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                Ángulo Target Codos: {activePreset.targetLeftElbowAngle}° / {activePreset.targetRightElbowAngle}°
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {activePreset.descriptionEs}
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: REAL-TIME BIOMECHANICAL METRICS & DIAGNOSTICS (5 COLS) */}
        <div className="lg:col-span-5 space-y-5">

          {/* OVERALL MATCH SCORE METRIC */}
          <div className="bg-gradient-to-br from-[#16122C] to-[#0E0C1C] border-2 border-cyan-400/40 rounded-3xl p-5 shadow-xl relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-cyan-400" />
                <span className="font-mono font-black text-xs text-cyan-300 uppercase tracking-wider">
                  Postural Match Score
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold">
                EN TIEMPO REAL
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
                {poseMatchScore}%
              </span>
              <span className="text-xs font-mono text-slate-400">
                / 100% Precisión
              </span>
            </div>

            {/* Match Score Progress Bar */}
            <div className="w-full bg-black/50 h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${poseMatchScore}%` }}
                transition={{ duration: 0.4 }}
                className={`h-full rounded-full transition-all ${
                  poseMatchScore >= 85
                    ? 'bg-gradient-to-r from-emerald-400 to-cyan-400'
                    : poseMatchScore >= 65
                      ? 'bg-gradient-to-r from-[#D9A9FF] to-cyan-400'
                      : 'bg-gradient-to-r from-rose-500 to-amber-500'
                }`}
              />
            </div>
          </div>

          {/* DUAL METRICS: SYMMETRY & CORE ALIGNMENT */}
          <div className="grid grid-cols-2 gap-3">

            {/* SYMMETRY SCORE CARD */}
            <div className="p-4 rounded-2xl bg-[#120F20] border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-purple-300 uppercase tracking-wider">
                  Simetría Brazos
                </span>
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-2xl font-black font-mono text-white">
                {symmetryScore}%
              </div>
              <p className="text-[10px] font-sans text-slate-400">
                Diferencia codos: {Math.abs(leftElbowAngle - rightElbowAngle).toFixed(1)}°
              </p>
            </div>

            {/* CORE ALIGNMENT CARD */}
            <div className="p-4 rounded-2xl bg-[#120F20] border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                  Alineación Core
                </span>
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-2xl font-black font-mono text-white">
                {coreAlignmentScore}%
              </div>
              <p className="text-[10px] font-sans text-slate-400">
                {coreAlignmentScore >= 90 ? 'Eje vertical perfecto' : 'Inclinación lateral detectada'}
              </p>
            </div>

          </div>

          {/* ELBOW FLEXION VECTOR BREAKDOWN (\theta_L vs \theta_R) */}
          <div className="p-4 rounded-2xl bg-[#120F22] border border-white/10 space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Ángulos de Flexión Articular</span>
              <span className="text-[10px] text-cyan-400">θ = arccos((u·v) / (||u|| ||v||))</span>
            </h4>

            {/* Left Elbow Detail */}
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-purple-300 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  Codo Izquierdo (θ_L)
                </span>
                <span className="text-white font-black">{leftElbowAngle.toFixed(1)}°</span>
              </div>
              <div className="text-[10px] font-sans text-slate-400 flex justify-between">
                <span>Target: {activePreset.targetLeftElbowAngle}°</span>
                <span className={Math.abs(leftElbowAngle - activePreset.targetLeftElbowAngle) <= 10 ? 'text-emerald-400' : 'text-amber-400'}>
                  Dev: {(leftElbowAngle - activePreset.targetLeftElbowAngle).toFixed(1)}°
                </span>
              </div>
            </div>

            {/* Right Elbow Detail */}
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Codo Derecho (θ_R)
                </span>
                <span className="text-white font-black">{rightElbowAngle.toFixed(1)}°</span>
              </div>
              <div className="text-[10px] font-sans text-slate-400 flex justify-between">
                <span>Target: {activePreset.targetRightElbowAngle}°</span>
                <span className={Math.abs(rightElbowAngle - activePreset.targetRightElbowAngle) <= 10 ? 'text-emerald-400' : 'text-amber-400'}>
                  Dev: {(rightElbowAngle - activePreset.targetRightElbowAngle).toFixed(1)}°
                </span>
              </div>
            </div>
          </div>

          {/* AI BIOMECHANICAL RECOMMENDATIONS CARD */}
          <div className="p-4 rounded-2xl bg-[#141026] border border-[#D9A9FF]/30 space-y-2.5">
            <div className="flex items-center gap-2 text-[#D9A9FF]">
              <Sparkles className="w-4 h-4" />
              <h5 className="text-xs font-mono font-bold uppercase tracking-wider">
                Recomendación Biomecánica AI
              </h5>
            </div>

            <ul className="text-xs font-sans text-slate-300 space-y-1.5 list-disc list-inside">
              {Math.abs(leftElbowAngle - rightElbowAngle) > 12 && (
                <li className="text-amber-300">
                  Desviación de simetría detectada ({Math.abs(leftElbowAngle - rightElbowAngle).toFixed(1)}°). Haz clic en <strong>Auto-Simetría</strong> para emparejar los torques.
                </li>
              )}
              {coreAlignmentScore < 80 && (
                <li className="text-cyan-300">
                  El torso está desplazado respecto a la plomada del core. Ajusta el nodo del esternón sobre la vertical.
                </li>
              )}
              {poseMatchScore >= 88 && (
                <li className="text-emerald-300 font-bold">
                  ¡Alineación postural sobresaliente! Excelente control articular para waacking acelerado.
                </li>
              )}
              {poseMatchScore < 88 && Math.abs(leftElbowAngle - rightElbowAngle) <= 12 && coreAlignmentScore >= 80 && (
                <li className="text-slate-300">
                  Ajusta los codos levemente hacia la posición fantasma dorada para lograr un encuadre 100% idéntico a la cátedra.
                </li>
              )}
            </ul>
          </div>

        </div>

      </div>

      {/* MODAL: FORMULA EXPLANATION */}
      <AnimatePresence>
        {showFormulaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="fixed inset-0" onClick={() => setShowFormulaModal(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-[#100D20] border-2 border-purple-500/50 rounded-3xl p-6 max-w-xl w-full shadow-2xl z-10 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-purple-300 font-mono font-bold text-sm">
                  <Info className="w-5 h-5 text-purple-400" />
                  <span>Fórmula del Producto Escalar Articular</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowFormulaModal(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-purple-500/30 text-center font-mono space-y-2">
                <p className="text-cyan-300 text-sm font-bold">
                  θ = arccos((u · v) / (||u|| ||v||)) × (180 / π)
                </p>
                <p className="text-[11px] text-slate-400">
                  Donde u = P_Hombro - P_Codo  y  v = P_Muñeca - P_Codo
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-300 leading-relaxed font-sans">
                <p>
                  <strong>¿Cómo funciona?</strong>
                </p>
                <p>
                  1. Para evaluar la flexión en cada codo, calculamos los dos vectores direccionados desde el codo hacia el hombro y hacia la muñeca.
                </p>
                <p>
                  2. Calculamos el producto escalar (u · v = u_x v_x + u_y v_y) y lo dividimos entre la magnitud de ambos vectores.
                </p>
                <p>
                  3. Aplicamos la función arccos para obtener el ángulo de apertura articular exacto (0-180°) en tiempo real.
                </p>
              </div>

              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => setShowFormulaModal(false)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs rounded-xl transition-all"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SomaticPostureAnalyzer;
