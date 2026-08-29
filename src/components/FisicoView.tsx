import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dumbbell, 
  Zap, 
  Play, 
  Pause, 
  Plus, 
  Activity, 
  Sparkles, 
  Clock, 
  Flame, 
  CheckCircle2, 
  Info,
  ChevronRight,
  RotateCcw,
  Volume2,
  VolumeX,
  Target,
  Grid,
  Eye,
  EyeOff,
  Gauge,
  Cpu,
  Upload,
  Link,
  Video,
  FileVideo,
  Film,
  UploadCloud,
  X,
  ExternalLink,
  Check
} from 'lucide-react';
import { User } from '../types';
import { Language, translations } from '../lib/translations';
import SoundCloudPlayer from './SoundCloudPlayer';
import { TrainingSummaryModal, TrainingSessionSummary } from './TrainingSummaryModal';

interface AICanvasExerciseVideoProps {
  category: 'brazos' | 'core' | 'piernas' | 'espalda' | 'cardio';
  isPaused: boolean;
  speed: number;
  showSkeletalTracker: boolean;
  showGrid: boolean;
}

const AI_LOGS_BY_CATEGORY: Record<'brazos' | 'core' | 'piernas' | 'espalda' | 'cardio', string[]> = {
  brazos: [
    "Iniciando rotación del manguito rotador...",
    "Eje de hombros estabilizado en plano axial.",
    "Trayectoria del codo detectada por detrás de la oreja.",
    "Estudio de simetría bilateral: 98.4% de correspondencia.",
    "Rotación de muñeca optimizada para 128 BPM.",
    "Alerta: Elevación involuntaria del trapecio superior - Corrigiendo...",
    "Fase de contracción de deltoides completada con éxito.",
    "Flujo de energía del hombro a la muñeca: Continuo.",
  ],
  core: [
    "Activando transverso abdominal e intercostales...",
    "Aislamiento de pecho: Desplazamiento lateral de +4.5 cm.",
    "Bloqueo de cadera verificado (Pivote pélvico: 100% estático).",
    "Estabilización de gravedad central: Excelente.",
    "Disociación del torso respecto al plano sagital: Detectada.",
    "Alerta: Tensión menor detectada en zona cervical - Relajar cuello...",
    "Alineación vertical cabeza-pelvis: Óptima (Desviación < 0.2cm).",
    "Síncopa de caja torácica alineada con acento rítmico.",
  ],
  espalda: [
    "Iniciando retracción escapular profunda...",
    "Compresión muscular activa en trapecio inferior y romboides.",
    "Apertura torácica superior medida: +12% de expansión de rango.",
    "Alineación cervical neutra verificada.",
    "Erectores espinales activados (Sostén de postura regia: 99%).",
    "Alerta: Pérdida momentánea de compresión dorsal - Reajustando...",
    "Estiramiento dinámico de manguito rotador anterior activo.",
    "Fijación de la estampa dramática de los años 70: Perfecta.",
  ],
  piernas: [
    "Estabilización en cuádriceps y glúteos profunda...",
    "Medición de descenso de cadera: 45% (Pose Baja activa).",
    "Presión plantar distribuida en metatarsos uniformemente.",
    "Encuadre estético (Framing) con brazos: Geometría de 90°.",
    "Resorte dinámico elástico en rodillas: Activo.",
    "Alerta: Flexión de tobillo rígida - Mantener el bounce fluido...",
    "Estiramiento activo de isquiotibiales y aductores.",
    "Transición de centro de gravedad lateral completada sin oscilación.",
  ],
  cardio: [
    "Elevando frecuencia cardíaca... Rango objetivo: 140-165 BPM.",
    "Pulsación aeróbica activa en intervalos HIIT de 128 BPM.",
    "Contador de gasto metabólico iniciado (MET energético: 12.4).",
    "Velocidad de rolls en brazos acoplada a velocidad de salto.",
    "Impacto de aterrizaje amortiguado: Excelente.",
    "Alerta: Fatiga pulmonar detectada - Regular respiración diafragmática...",
    "Fuerza reactiva elástica en pantorrillas: Alta.",
    "Consumo de oxígeno optimizado para máxima resistencia de combate.",
  ]
};

export function AICanvasExerciseVideo({
  category,
  isPaused,
  speed,
  showSkeletalTracker,
  showGrid
}: AICanvasExerciseVideoProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);
  const timeRef = React.useRef<number>(0);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width;
    let height = canvas.height;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      width = canvas.width;
      height = canvas.height;
    };

    handleResize();
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Keep track of wrist trails
    const wristTrailsL: { x: number; y: number; alpha: number }[] = [];
    const wristTrailsR: { x: number; y: number; alpha: number }[] = [];

    const drawGrid = (c: CanvasRenderingContext2D, w: number, h: number, time: number) => {
      c.strokeStyle = 'rgba(233, 195, 73, 0.04)';
      c.lineWidth = 1;
      const gridSize = 40;
      // moving grid lines for cardio/speed
      const offset = (category === 'cardio' ? time * 40 : 0) % gridSize;

      for (let x = offset; x < w; x += gridSize) {
        c.beginPath();
        c.moveTo(x, 0);
        c.lineTo(x, h);
        c.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        c.beginPath();
        c.moveTo(0, y);
        c.lineTo(w, y);
        c.stroke();
      }

      // Draw center crosshair lines
      c.strokeStyle = 'rgba(233, 195, 73, 0.12)';
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(w / 2, 0);
      c.lineTo(w / 2, h);
      c.moveTo(0, h / 2);
      c.lineTo(w, h / 2);
      c.stroke();
    };

    const render = () => {
      if (!isPaused) {
        // Adjust speed factors based on category
        let speedFactor = 0.04 * speed;
        if (category === 'cardio') speedFactor = 0.07 * speed;
        timeRef.current += speedFactor;
      }
      const t = timeRef.current;

      ctx.clearRect(0, 0, width, height);

      // Black background
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      // Draw tracking grid
      if (showGrid) {
        drawGrid(ctx, width, height, t);
      }

      // Coordinates helper
      const cx = width / 2;
      const cy = height / 2;
      const baseScale = Math.min(width, height) / 360;

      // Draw skeletal structure
      // Define joint locations dynamically based on 't'
      let headY = cy - 80 * baseScale;
      let neckY = cy - 50 * baseScale;
      let shoulderLeftX = cx - 40 * baseScale;
      let shoulderRightX = cx + 40 * baseScale;
      let shoulderY = cy - 45 * baseScale;
      
      let pelvisLeftX = cx - 25 * baseScale;
      let pelvisRightX = cx + 25 * baseScale;
      let pelvisY = cy + 45 * baseScale;

      let leftElbowX = cx - 75 * baseScale;
      let leftElbowY = cy - 15 * baseScale;
      let leftWristX = cx - 110 * baseScale;
      let leftWristY = cy - 35 * baseScale;

      let rightElbowX = cx + 75 * baseScale;
      let rightElbowY = cy - 15 * baseScale;
      let rightWristX = cx + 110 * baseScale;
      let rightWristY = cy - 35 * baseScale;

      let leftKneeX = pelvisLeftX;
      let leftKneeY = cy + 100 * baseScale;
      let leftFootX = pelvisLeftX - 10 * baseScale;
      let leftFootY = cy + 150 * baseScale;

      let rightKneeX = pelvisRightX;
      let rightKneeY = cy + 100 * baseScale;
      let rightFootX = pelvisRightX + 10 * baseScale;
      let rightFootY = cy + 150 * baseScale;

      // 1. BRAZOS (Shoulder rolls drill)
      if (category === 'brazos') {
        // Arms execute beautiful circles behind the head
        const radius = 30 * baseScale;
        const angleL = t * 1.5;
        const angleR = t * 1.5 + Math.PI; // offset for alternate circles

        // Left Arm Circle
        leftElbowX = shoulderLeftX - 35 * baseScale * Math.cos(angleL * 0.5);
        leftElbowY = shoulderY + 15 * baseScale * Math.sin(angleL * 0.5);
        leftWristX = leftElbowX + radius * Math.cos(angleL);
        leftWristY = leftElbowY + radius * Math.sin(angleL);

        // Right Arm Circle
        rightElbowX = shoulderRightX + 35 * baseScale * Math.cos(angleR * 0.5);
        rightElbowY = shoulderY + 15 * baseScale * Math.sin(angleR * 0.5);
        rightWristX = rightElbowX + radius * Math.cos(angleR);
        rightWristY = rightElbowY + radius * Math.sin(angleR);

        // Draw arm movement plane circles in background
        ctx.strokeStyle = 'rgba(233, 195, 73, 0.15)';
        ctx.lineWidth = 2 * baseScale;
        ctx.beginPath();
        ctx.arc(leftElbowX, leftElbowY, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(129, 38, 44, 0.25)';
        ctx.beginPath();
        ctx.arc(rightElbowX, rightElbowY, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw arc indicator
        ctx.strokeStyle = 'rgba(233, 195, 73, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(leftElbowX, leftElbowY, radius + 8, angleL - 0.5, angleL + 0.5);
        ctx.stroke();
      }

      // 2. CORE (Chest Isolation)
      if (category === 'core') {
        // Chest moves side-to-side dynamically
        const displacementX = 25 * baseScale * Math.sin(t);
        const displacementY = 5 * baseScale * Math.abs(Math.cos(t));

        shoulderLeftX += displacementX;
        shoulderRightX += displacementX;
        shoulderY += displacementY;
        neckY += displacementY;
        headY += displacementY * 0.8;

        // Arms stay held out clean in framing poses
        leftElbowX = shoulderLeftX - 55 * baseScale;
        leftElbowY = shoulderY + 5 * baseScale;
        leftWristX = leftElbowX - 10 * baseScale;
        leftWristY = leftElbowY - 45 * baseScale; // vertical forearm framing

        rightElbowX = shoulderRightX + 55 * baseScale;
        rightElbowY = shoulderY + 5 * baseScale;
        rightWristX = rightElbowX + 10 * baseScale;
        rightWristY = rightElbowY - 45 * baseScale;

        // Draw isolation guideline
        ctx.strokeStyle = 'rgba(129, 38, 44, 0.4)';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(cx, cy - 110 * baseScale);
        ctx.lineTo(cx, cy + 160 * baseScale);
        ctx.stroke();
        ctx.setLineDash([]);

        // Show chest displacement value
        ctx.fillStyle = '#ffb3b2';
        ctx.font = `bold ${Math.round(10 * baseScale)}px monospace`;
        ctx.fillText(`DESPLAZAMIENTO: ${(displacementX / baseScale).toFixed(1)} mm`, cx - 60 * baseScale, cy - 105 * baseScale);
      }

      // 3. ESPALDA (Posture & Scapula)
      if (category === 'espalda') {
        // Shown from 3/4 side back view
        // Shoulder blades (scapulae) squeeze together (retract)
        const squeeze = Math.sin(t * 0.7) * 0.5 + 0.5; // 0 to 1
        
        shoulderLeftX = cx - (35 - 15 * squeeze) * baseScale;
        shoulderRightX = cx + (35 - 15 * squeeze) * baseScale;
        
        // head and neck pull back slightly
        neckY = cy - 50 * baseScale;
        headY = cy - 80 * baseScale - 4 * baseScale * squeeze;

        // Arms held in dynamic theatrical lines
        leftElbowX = shoulderLeftX - 45 * baseScale;
        leftElbowY = shoulderY + 15 * baseScale;
        leftWristX = leftElbowX - 35 * baseScale;
        leftWristY = leftElbowY + 30 * baseScale;

        rightElbowX = shoulderRightX + 45 * baseScale;
        rightElbowY = shoulderY + 15 * baseScale;
        rightWristX = rightElbowX + 35 * baseScale;
        rightWristY = rightElbowY + 30 * baseScale;

        // Draw muscle activation heat gradient in the center (trapezius zone)
        const gradient = ctx.createRadialGradient(cx, cy - 30 * baseScale, 5 * baseScale, cx, cy - 30 * baseScale, 30 * baseScale);
        gradient.addColorStop(0, `rgba(129, 38, 44, ${0.1 + squeeze * 0.6})`);
        gradient.addColorStop(1, 'rgba(129, 38, 44, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy - 30 * baseScale, 30 * baseScale, 0, Math.PI * 2);
        ctx.fill();

        // Draw muscle lines linking scapulas
        ctx.strokeStyle = `rgba(233, 195, 73, ${0.2 + squeeze * 0.7})`;
        ctx.lineWidth = 3 * baseScale;
        ctx.beginPath();
        ctx.moveTo(shoulderLeftX, shoulderY + 10 * baseScale);
        ctx.lineTo(cx, cy - 30 * baseScale);
        ctx.lineTo(shoulderRightX, shoulderY + 10 * baseScale);
        ctx.stroke();

        ctx.fillStyle = '#e9c349';
        ctx.font = `bold ${Math.round(10 * baseScale)}px monospace`;
        ctx.fillText(`TENSIÓN TRAPECIO: ${(squeeze * 100).toFixed(0)}%`, cx - 55 * baseScale, cy - 105 * baseScale);
      }

      // 4. PIERNAS (Low crouch / Poses bajas)
      if (category === 'piernas') {
        // Deep crouch height movement (squat)
        const crouchFactor = Math.sin(t * 0.8) * 0.5 + 0.5; // 0 (standing) to 1 (deep squat)
        const heightDrop = 45 * baseScale * crouchFactor;

        headY += heightDrop;
        neckY += heightDrop;
        shoulderY += heightDrop;
        pelvisY += heightDrop * 0.8;

        // Legs bend deep
        leftKneeX = pelvisLeftX - 15 * baseScale * crouchFactor;
        leftKneeY = pelvisY + 40 * baseScale;
        leftFootX = pelvisLeftX - 30 * baseScale;

        rightKneeX = pelvisRightX + 15 * baseScale * crouchFactor;
        rightKneeY = pelvisY + 40 * baseScale;
        rightFootX = pelvisRightX + 30 * baseScale;

        // Arms lock in beautiful theatrical geometry framing the head
        leftElbowX = shoulderLeftX - 35 * baseScale;
        leftElbowY = shoulderY - 25 * baseScale;
        leftWristX = cx - 15 * baseScale;
        leftWristY = headY - 15 * baseScale; // wrist touching over head

        rightElbowX = shoulderRightX + 35 * baseScale;
        rightElbowY = shoulderY - 25 * baseScale;
        rightWristX = cx + 15 * baseScale;
        rightWristY = headY - 15 * baseScale;

        // Draw ground plane line
        ctx.strokeStyle = 'rgba(233, 195, 73, 0.4)';
        ctx.lineWidth = 3 * baseScale;
        ctx.beginPath();
        ctx.moveTo(cx - 100 * baseScale, cy + 150 * baseScale);
        ctx.lineTo(cx + 100 * baseScale, cy + 150 * baseScale);
        ctx.stroke();

        ctx.fillStyle = '#ffb3b2';
        ctx.font = `bold ${Math.round(10 * baseScale)}px monospace`;
        ctx.fillText(`COMPRESIÓN: ${(crouchFactor * 100).toFixed(0)}% (BAJO)`, cx - 50 * baseScale, cy - 105 * baseScale);
      }

      // 5. CARDIO (HIIT / Combate)
      if (category === 'cardio') {
        // Rapid jumping movement
        const jumpY = Math.abs(Math.sin(t * 2.5)) * -25 * baseScale;
        const widthSpread = Math.sin(t * 2.5) > 0 ? 30 * baseScale : -5 * baseScale;

        headY += jumpY;
        neckY += jumpY;
        shoulderY += jumpY;
        pelvisY += jumpY;

        leftKneeY += jumpY;
        rightKneeY += jumpY;
        leftFootY += jumpY;
        rightFootY += jumpY;

        leftFootX = pelvisLeftX - 15 * baseScale - widthSpread * 0.4;
        rightFootX = pelvisRightX + 15 * baseScale + widthSpread * 0.4;

        // Arms fly high, sweeping open and closed
        const angleSweep = Math.sin(t * 2.5) * Math.PI * 0.6;
        leftElbowX = shoulderLeftX - 50 * baseScale * Math.cos(angleSweep * 0.5);
        leftElbowY = shoulderY - 30 * baseScale * Math.sin(angleSweep * 0.5);
        leftWristX = leftElbowX - 45 * baseScale * Math.cos(angleSweep);
        leftWristY = leftElbowY - 45 * baseScale * Math.sin(angleSweep);

        rightElbowX = shoulderRightX + 50 * baseScale * Math.cos(angleSweep * 0.5);
        rightElbowY = shoulderY - 30 * baseScale * Math.sin(angleSweep * 0.5);
        rightWristX = rightElbowX + 45 * baseScale * Math.cos(angleSweep);
        rightWristY = rightElbowY - 45 * baseScale * Math.sin(angleSweep);

        // Pulsating glowing core (Cardio burner)
        const pulse = Math.abs(Math.sin(t * 5));
        ctx.fillStyle = `rgba(129, 38, 44, ${0.2 + pulse * 0.5})`;
        ctx.beginPath();
        ctx.arc(cx, cy, 25 * baseScale, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ff6b6b';
        ctx.font = `bold ${Math.round(10 * baseScale)}px monospace`;
        ctx.fillText(`HEART RATE: ${Math.round(138 + pulse * 25)} BPM`, cx - 55 * baseScale, cy - 105 * baseScale);
      }

      // WRIST TRAILS - store & draw
      if (!isPaused) {
        wristTrailsL.push({ x: leftWristX, y: leftWristY, alpha: 1.0 });
        wristTrailsR.push({ x: rightWristX, y: rightWristY, alpha: 1.0 });

        if (wristTrailsL.length > 20) wristTrailsL.shift();
        if (wristTrailsR.length > 20) wristTrailsR.shift();
      }

      // Draw left trail
      ctx.lineWidth = 1.5 * baseScale;
      for (let i = 1; i < wristTrailsL.length; i++) {
        const pt1 = wristTrailsL[i - 1];
        const pt2 = wristTrailsL[i];
        const alpha = (i / wristTrailsL.length) * 0.35;
        ctx.strokeStyle = `rgba(233, 195, 73, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(pt1.x, pt1.y);
        ctx.lineTo(pt2.x, pt2.y);
        ctx.stroke();
      }

      // Draw right trail
      for (let i = 1; i < wristTrailsR.length; i++) {
        const pt1 = wristTrailsR[i - 1];
        const pt2 = wristTrailsR[i];
        const alpha = (i / wristTrailsR.length) * 0.35;
        ctx.strokeStyle = `rgba(129, 38, 44, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(pt1.x, pt1.y);
        ctx.lineTo(pt2.x, pt2.y);
        ctx.stroke();
      }

      // Draw skeleton lines (SKELETAL TRACKER OVERLAY)
      if (showSkeletalTracker) {
        ctx.strokeStyle = '#e5e2e1';
        ctx.lineWidth = 3.5 * baseScale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Spine & Hips
        ctx.beginPath();
        ctx.moveTo(cx, headY);
        ctx.lineTo(cx, neckY);
        ctx.lineTo(shoulderLeftX, shoulderY);
        ctx.moveTo(cx, neckY);
        ctx.lineTo(shoulderRightX, shoulderY);
        
        // Torso center line
        ctx.moveTo(cx, neckY);
        ctx.lineTo(cx, pelvisY);
        ctx.lineTo(pelvisLeftX, pelvisY);
        ctx.moveTo(cx, pelvisY);
        ctx.lineTo(pelvisRightX, pelvisY);
        ctx.stroke();

        // Left Arm
        ctx.strokeStyle = '#e9c349'; // Gold tracker for Left
        ctx.beginPath();
        ctx.moveTo(shoulderLeftX, shoulderY);
        ctx.lineTo(leftElbowX, leftElbowY);
        ctx.lineTo(leftWristX, leftWristY);
        ctx.stroke();

        // Right Arm
        ctx.strokeStyle = '#ffb3b2'; // Light Pink/Red tracker for Right
        ctx.beginPath();
        ctx.moveTo(shoulderRightX, shoulderY);
        ctx.lineTo(rightElbowX, rightElbowY);
        ctx.lineTo(rightWristX, rightWristY);
        ctx.stroke();

        // Legs
        ctx.strokeStyle = '#81262c';
        ctx.beginPath();
        ctx.moveTo(pelvisLeftX, pelvisY);
        ctx.lineTo(leftKneeX, leftKneeY);
        ctx.lineTo(leftFootX, leftFootY);

        ctx.moveTo(pelvisRightX, pelvisY);
        ctx.lineTo(rightKneeX, rightKneeY);
        ctx.lineTo(rightFootX, rightFootY);
        ctx.stroke();

        // Draw Joints (Glow spheres)
        const joints = [
          { x: cx, y: headY, r: 8 * baseScale, color: '#e5e2e1' }, // Head
          { x: cx, y: neckY, r: 4 * baseScale, color: '#e5e2e1' },
          { x: shoulderLeftX, y: shoulderY, r: 5 * baseScale, color: '#e5e2e1' },
          { x: shoulderRightX, y: shoulderY, r: 5 * baseScale, color: '#e5e2e1' },
          { x: leftElbowX, y: leftElbowY, r: 4.5 * baseScale, color: '#e9c349' },
          { x: rightElbowX, y: rightElbowY, r: 4.5 * baseScale, color: '#ffb3b2' },
          { x: leftWristX, y: leftWristY, r: 5.5 * baseScale, color: '#e9c349', highlight: true },
          { x: rightWristX, y: rightWristY, r: 5.5 * baseScale, color: '#ffb3b2', highlight: true },
          { x: pelvisLeftX, y: pelvisY, r: 4.5 * baseScale, color: '#81262c' },
          { x: pelvisRightX, y: pelvisY, r: 4.5 * baseScale, color: '#81262c' },
          { x: leftKneeX, y: leftKneeY, r: 4 * baseScale, color: '#81262c' },
          { x: rightKneeX, y: rightKneeY, r: 4 * baseScale, color: '#81262c' },
          { x: leftFootX, y: leftFootY, r: 5 * baseScale, color: '#e5e2e1' },
          { x: rightFootX, y: rightFootY, r: 5 * baseScale, color: '#e5e2e1' },
        ];

        joints.forEach((joint) => {
          ctx.fillStyle = joint.color;
          ctx.beginPath();
          ctx.arc(joint.x, joint.y, joint.r, 0, Math.PI * 2);
          ctx.fill();

          if (joint.highlight) {
            // Draw secondary outer pulsing circle
            ctx.strokeStyle = joint.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(joint.x, joint.y, joint.r + (4 + Math.sin(t * 3) * 2) * baseScale, 0, Math.PI * 2);
            ctx.stroke();
          }
        });
      }

      // Draw real-time HUD text overlays at the corners
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = `${Math.round(8 * baseScale)}px monospace`;
      
      // Top Left corner: system status
      ctx.fillText("SYS STATUS: TRACKING ACTIVE", 15 * baseScale, 20 * baseScale);
      ctx.fillText(`FPS: 60 | RENDER: AI VIRTUAL`, 15 * baseScale, 32 * baseScale);

      // Top Right corner: category focus
      ctx.textAlign = 'right';
      ctx.fillText(`FOCO: ${category.toUpperCase()}`, width - 15 * baseScale, 20 * baseScale);
      ctx.fillText(`MODO: DRILL COMPLETO`, width - 15 * baseScale, 32 * baseScale);
      ctx.textAlign = 'left';

      // Re-queue animation
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [category, isPaused, speed, showSkeletalTracker, showGrid]);

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full block rounded-2xl" />
      {/* Dynamic Overlay HUD elements */}
      <div className="absolute bottom-16 left-4 z-20 font-mono text-[9px] bg-black/75 px-2.5 py-1.5 rounded-xl border border-tertiary/20 text-tertiary space-y-0.5 pointer-events-none uppercase">
        <p>📡 PRECISION: {(98.4 - Math.sin(timeRef.current * 0.1) * 1.5).toFixed(1)}%</p>
        <p>⚡ CO-ORDINATION INDEX: {(8.7 + Math.cos(timeRef.current * 0.15) * 0.5).toFixed(1)}/10</p>
      </div>
    </div>
  );
}

interface FisicoVideo {
  id: string;
  title: string;
  category: 'brazos' | 'core' | 'piernas' | 'espalda' | 'cardio';
  videoUrl: string;
  aiVideoUrl?: string;
  duration: string;
  intensity: 'Baja' | 'Media' | 'Alta' | 'Extrema';
  description: string;
  benefits: string;
  isCustom?: boolean;
}

const INITIAL_FISICO_VIDEOS: FisicoVideo[] = [
  {
    id: 'f-1',
    title: 'Drill de Resistencia de Hombros (rolls sin parar)',
    category: 'brazos',
    videoUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600',
    aiVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-arm-exercises-in-gym-43026-large.mp4',
    duration: '10 min',
    intensity: 'Alta',
    description: 'Rutina continua para acondicionar el manguito rotador y los deltoides. Diseñada específicamente para eliminar la fatiga acumulada en batallas largas de Waacking.',
    benefits: 'Aumenta la estamina de hombros, reduce la tensión acumulada en el trapecio y tonifica bíceps/tríceps.'
  },
  {
    id: 'f-2',
    title: 'Aislamiento de Pecho y Estabilidad del Core',
    category: 'core',
    videoUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=600',
    aiVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-doing-abs-exercises-on-a-mat-43016-large.mp4',
    duration: '15 min',
    intensity: 'Media',
    description: 'Entrenamiento abdominal profundo e intercostal. Clave para disociar el movimiento del torso de los rolls veloces de los brazos sin perder el balance.',
    benefits: 'Mejora el control de giros, estabiliza el centro de gravedad y define las líneas de aislamiento del pecho.'
  },
  {
    id: 'f-3',
    title: 'Postura Regia, Espalda Fuerte y Trapecio Sano',
    category: 'espalda',
    videoUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a25f1?auto=format&fit=crop&q=80&w=600',
    aiVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-back-exercises-with-resistance-bands-43022-large.mp4',
    duration: '12 min',
    intensity: 'Media',
    description: 'Ejercicios de retracción escapular y fortalecimiento de erectores espinales. Desarrolla la estampa orgullosa y dramática característica de los años 70.',
    benefits: 'Previene dolores lumbares, alinea los hombros hacia atrás y expande la proyección visual de los brazos.'
  },
  {
    id: 'f-4',
    title: 'Potencia de Piernas y Poses Bajas (Waacking floorwork)',
    category: 'piernas',
    videoUrl: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&q=80&w=600',
    aiVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-lunges-exercise-in-gym-43027-large.mp4',
    duration: '18 min',
    intensity: 'Alta',
    description: 'Rutina explosiva de cuádriceps, glúteos e isquiotibiales combinada con estiramientos dinámicos. Ideal para aguantar transiciones rápidas del suelo a poses de pie.',
    benefits: 'Desarrolla resortes elásticos en las rodillas, estabiliza tobillos y te da profundidad en las poses.'
  },
  {
    id: 'f-5',
    title: 'Super Cardio Waacking HIIT: Resistencia de Combate',
    category: 'cardio',
    videoUrl: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&q=80&w=600',
    aiVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-high-knees-cardio-exercise-43024-large.mp4',
    duration: '20 min',
    intensity: 'Extrema',
    description: 'Entrenamiento por intervalos de alta intensidad que fusiona burpees, saltos, desplazamientos rítmicos y rolls de brazos continuos.',
    benefits: 'Eleva el umbral anaeróbico, aumenta la capacidad pulmonar y quema grasa de manera acelerada.'
  }
];

interface FisicoViewProps {
  currentUser: User;
  language: Language;
  onAddBonusPoints?: (amount: number) => void;
}

export default function FisicoView({ currentUser, language, onAddBonusPoints }: FisicoViewProps) {
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<TrainingSessionSummary | null>(null);

  const [videos, setVideos] = useState<FisicoVideo[]>(() => {
    try {
      const saved = localStorage.getItem('waacking_fisico_videos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) { console.error(e); }
    return INITIAL_FISICO_VIDEOS;
  });

  const [selectedCategory, setSelectedCategory] = useState<'all' | 'brazos' | 'core' | 'piernas' | 'espalda' | 'cardio'>('all');
  const [activeVideo, setActiveVideo] = useState<FisicoVideo | null>(INITIAL_FISICO_VIDEOS[0]);
  const [isWatching, setIsWatching] = useState(false);

  // AI Visualizer states
  const [useAIVisualizer, setUseAIVisualizer] = useState(true);
  const [visualizerSpeed, setVisualizerSpeed] = useState(1.0);
  const [showGrid, setShowGrid] = useState(true);
  const [showSkeletalTracker, setShowSkeletalTracker] = useState(true);
  const [aiLogs, setAiLogs] = useState<string[]>([]);

  // Generate random AI logs for the active video category
  useEffect(() => {
    if (!isWatching || !activeVideo) {
      setAiLogs([]);
      return;
    }

    const categoryLogs = AI_LOGS_BY_CATEGORY[activeVideo.category] || [];
    setAiLogs([
      `[${new Date().toLocaleTimeString()}] Sincronizando modelo de movimiento biomecánico...`,
      `[${new Date().toLocaleTimeString()}] Modelo corporal IA listo. Iniciando análisis de postura.`
    ]);

    const interval = setInterval(() => {
      const randomLine = categoryLogs[Math.floor(Math.random() * categoryLogs.length)];
      setAiLogs((prev) => {
        const timestamp = new Date().toLocaleTimeString();
        const nextLogs = [`[${timestamp}] ${randomLine}`, ...prev];
        return nextLogs.slice(0, 10); // Keep last 10 entries
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isWatching, activeVideo]);

  // Form states for video uploading
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'brazos' | 'core' | 'piernas' | 'espalda' | 'cardio'>('brazos');
  const [newUrl, setNewUrl] = useState('');
  const [newDuration, setNewDuration] = useState('15 min');
  const [newIntensity, setNewIntensity] = useState<'Baja' | 'Media' | 'Alta' | 'Extrema'>('Media');
  const [newDescription, setNewDescription] = useState('');
  const [newBenefits, setNewBenefits] = useState('');

  // Demonstration video upload / link modal state
  const [demoModalVideo, setDemoModalVideo] = useState<FisicoVideo | null>(null);
  const [demoVideoUrlInput, setDemoVideoUrlInput] = useState('');
  const [demoModalTab, setDemoModalTab] = useState<'upload' | 'link'>('upload');
  const [demoToast, setDemoToast] = useState<string | null>(null);

  const getEmbedUrl = (url?: string): string | null => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}` : null;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}` : null;
    }
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=1&loop=1` : null;
    }
    return null;
  };

  const handleOpenDemoModal = (video: FisicoVideo) => {
    setDemoModalVideo(video);
    setDemoVideoUrlInput(video.aiVideoUrl || '');
    setDemoModalTab('upload');
  };

  const handleSaveDemoUrl = (targetId: string, url: string) => {
    if (!url.trim()) return;
    const formattedUrl = url.trim();
    const updated = videos.map((v) => {
      if (v.id === targetId) {
        return {
          ...v,
          aiVideoUrl: formattedUrl
        };
      }
      return v;
    });
    setVideos(updated);
    if (activeVideo?.id === targetId) {
      const updatedActive = updated.find(v => v.id === targetId) || null;
      setActiveVideo(updatedActive);
      setUseAIVisualizer(false); // switch automatically to demo video
      setIsWatching(true);
    }
    setDemoToast(`¡Video de demostración actualizado para la rutina!`);
    setTimeout(() => setDemoToast(null), 4000);
    setDemoModalVideo(null);
  };

  const handleDemoFileSelect = (e: React.ChangeEvent<HTMLInputElement>, targetId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileUrl = URL.createObjectURL(file);
    const updated = videos.map((v) => {
      if (v.id === targetId) {
        return {
          ...v,
          aiVideoUrl: fileUrl
        };
      }
      return v;
    });
    setVideos(updated);
    if (activeVideo?.id === targetId) {
      const updatedActive = updated.find(v => v.id === targetId) || null;
      setActiveVideo(updatedActive);
      setUseAIVisualizer(false); // switch automatically to demo video
      setIsWatching(true);
    }
    setDemoToast(`¡Video cargado exitosamente para la rutina!`);
    setTimeout(() => setDemoToast(null), 4000);
    setDemoModalVideo(null);
  };

  const handleResetDemoVideo = (targetId: string) => {
    const initialMatch = INITIAL_FISICO_VIDEOS.find(v => v.id === targetId);
    const defaultUrl = initialMatch?.aiVideoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-arm-exercises-in-gym-43026-large.mp4';
    const updated = videos.map((v) => {
      if (v.id === targetId) {
        return {
          ...v,
          aiVideoUrl: defaultUrl
        };
      }
      return v;
    });
    setVideos(updated);
    if (activeVideo?.id === targetId) {
      const updatedActive = updated.find(v => v.id === targetId) || null;
      setActiveVideo(updatedActive);
    }
    setDemoToast('Restablecido al video de demostración por defecto.');
    setTimeout(() => setDemoToast(null), 4000);
    setDemoModalVideo(null);
  };

  // Daily conditioning checklist state
  const [checklist, setChecklist] = useState<{ id: string; text: string; completed: boolean; target: string }[]>(() => {
    try {
      const saved = localStorage.getItem('waacking_fisico_checklist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) { console.error(e); }
    return [
      { id: 'ch-1', text: 'Círculos articulares de hombros (rotaciones hacia atrás)', target: 'Articulación Escapular', completed: false },
      { id: 'ch-2', text: 'Plancha con toques de hombros (torso estable)', target: 'Faja Core Abdominal', completed: false },
      { id: 'ch-3', text: 'Estiramientos dinámicos de muñecas (antebrazo flexible)', target: 'Tendones y Flexores', completed: false },
      { id: 'ch-4', text: 'Sentadillas profundas manteniendo pecho alto', target: 'Tren Inferior & Postura', completed: false },
      { id: 'ch-5', text: 'Rolls estáticos en plano sagital por 1 minuto', target: 'Hombros & Coordinación', completed: false }
    ];
  });

  // Tabata Timer states
  const [timerMode, setTimerMode] = useState<'config' | 'running' | 'paused' | 'finished'>('config');
  const [workTime, setWorkTime] = useState(40); // 40 seconds
  const [restTime, setRestTime] = useState(20); // 20 seconds
  const [totalRounds, setTotalRounds] = useState(4);
  const [currentRound, setCurrentRound] = useState(1);
  const [timerPhase, setTimerPhase] = useState<'get-ready' | 'work' | 'rest'>('get-ready');
  const [timeLeft, setTimeLeft] = useState(5); // 5s countdown first
  const [isMuted, setIsMuted] = useState(false);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('waacking_fisico_videos', JSON.stringify(videos));
  }, [videos]);

  useEffect(() => {
    localStorage.setItem('waacking_fisico_checklist', JSON.stringify(checklist));
  }, [checklist]);

  // Tabata Core Tick Hook
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerMode === 'running') {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            setTimeout(() => {
              if (timerPhase === 'get-ready') {
                playIntervalSound(880, 0.4); // Start work sound
                setTimerPhase('work');
                setTimeLeft(workTime);
              } else if (timerPhase === 'work') {
                if (currentRound >= totalRounds) {
                  setTimerMode('finished');
                  playIntervalSound(1100, 0.6); // Finish routine sound
                  const totalSecs = totalRounds * (workTime + restTime);
                  const pts = totalRounds * 15;
                  if (onAddBonusPoints) {
                    onAddBonusPoints(pts);
                  }
                  setSessionSummary({
                    durationSeconds: totalSecs,
                    activityType: `Circuito Tabata (${totalRounds} Rondas)`,
                    pointsEarned: pts,
                    details: `${totalRounds} Rondas completadas • ${workTime}s Trabajo / ${restTime}s Descanso`,
                    category: 'fisico'
                  });
                  setSummaryModalOpen(true);
                  setTimeLeft(0);
                } else {
                  playIntervalSound(580, 0.3); // Rest sound
                  setTimerPhase('rest');
                  setTimeLeft(restTime);
                }
              } else if (timerPhase === 'rest') {
                playIntervalSound(880, 0.4); // Start next round work sound
                setCurrentRound(r => r + 1);
                setTimerPhase('work');
                setTimeLeft(workTime);
              }
            }, 0);
            return 0;
          }
          // Voice count warning on last 3 seconds
          if (next <= 3 && next > 0) {
            playIntervalSound(440, 0.1);
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerMode, timerPhase, currentRound, totalRounds, workTime, restTime]);

  const playIntervalSound = (frequency: number, duration: number) => {
    if (isMuted) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      
      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio element issue or context blocked
    }
  };

  const handleStartTimer = () => {
    setTimerPhase('get-ready');
    setTimeLeft(5);
    setCurrentRound(1);
    setTimerMode('running');
    playIntervalSound(660, 0.25);
  };

  const handleResetTimer = () => {
    setTimerMode('config');
    setTimerPhase('get-ready');
    setTimeLeft(5);
    setCurrentRound(1);
  };

  // Checklist updates
  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => 
      prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item)
    );
  };

  const resetChecklist = () => {
    setChecklist(prev => prev.map(item => ({ ...item, completed: false })));
  };

  // Submit new physical exercise video
  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDescription) {
      alert("Por favor rellena el título y la descripción.");
      return;
    }

    const defaultCover = newCategory === 'brazos' 
      ? 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600'
      : newCategory === 'core'
      ? 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=600'
      : newCategory === 'piernas'
      ? 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&q=80&w=600'
      : newCategory === 'espalda'
      ? 'https://images.unsplash.com/photo-1605296867304-46d5465a25f1?auto=format&fit=crop&q=80&w=600'
      : 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&q=80&w=600';

    const newVideo: FisicoVideo = {
      id: `f-custom-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      videoUrl: newUrl.trim() || defaultCover,
      duration: newDuration,
      intensity: newIntensity,
      description: newDescription,
      benefits: newBenefits || 'Mejora general del funcionamiento articular y fortalecimiento muscular.',
      isCustom: true
    };

    setVideos(prev => [newVideo, ...prev]);
    setActiveVideo(newVideo);
    
    // Reset Form fields
    setNewTitle('');
    setNewUrl('');
    setNewDescription('');
    setNewBenefits('');
    setShowAddForm(false);
  };

  const handleDeleteVideo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("¿Estás seguro de eliminar este video de entrenamiento?")) {
      const filtered = (videos || []).filter(v => v.id !== id);
      setVideos(filtered);
      if (activeVideo?.id === id) {
        setActiveVideo(filtered[0] || null);
      }
    }
  };

  const safeChecklist = checklist || [];
  const completedCount = safeChecklist.filter(item => item && item.completed).length;
  const progressPercent = safeChecklist.length > 0 ? Math.round((completedCount / safeChecklist.length) * 100) : 0;

  const filteredVideos = selectedCategory === 'all' 
    ? (videos || []) 
    : (videos || []).filter(v => v && v.category === selectedCategory);

  return (
    <div className="flex-1 min-h-full w-full p-6 bg-background text-on-surface flex flex-col font-body-md">
      
      {/* Header Banner */}
      <div className="border-b border-tertiary/10 pb-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10">
        <div>
          <h2 className="text-2xl font-display-lg font-bold text-slate-900 dark:text-white tracking-tight uppercase">ACONDICIONAMIENTO Y RESISTENCIA</h2>
          <p className="text-xs text-on-surface-variant font-medium mt-1">Fortalece tus deltoides, activa tu core y previene lesiones biomecánicas.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-primary border border-primary/20 bg-primary-container/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Resistencia Escénica
          </span>
          <span className="text-[10px] font-mono font-bold text-tertiary border border-tertiary/20 bg-tertiary/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Prevención de Lesiones
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start z-10">
        
        {/* Left Side: Videos & Spotlights (8 Columns) */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Category Filter bar */}
          <div className="bg-surface-container border border-tertiary/10 rounded-2xl p-4 shadow-2xl">
            <p className="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-widest mb-3">Filtro por zona muscular y objetivo biomecánico:</p>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'Ver Todo', icon: '⚡' },
                { id: 'brazos', label: 'Brazos/Hombros', icon: '💪' },
                { id: 'core', label: 'Core/Aislamiento', icon: '🤸' },
                { id: 'piernas', label: 'Piernas/Poses', icon: '🦵' },
                { id: 'espalda', label: 'Espalda/Líneas', icon: '🦒' },
                { id: 'cardio', label: 'Cardio HIIT', icon: '🔥' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? 'bg-on-primary-fixed-variant text-primary-fixed border-primary/25 shadow-lg'
                      : 'bg-slate-100 dark:bg-[#0d0d11]/40 border-tertiary/10 hover:border-tertiary/30 text-on-surface-variant hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Videos display area */}
          <div className="bg-surface-container border border-tertiary/10 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-tertiary/10">
              <div>
                <h3 className="text-xs font-mono font-bold tracking-wider text-tertiary uppercase">
                  BIBLIOTECA DE ENTRANAMIENTO FÍSICO
                </h3>
                <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">Rutinas de estamina diseñadas específicamente para el Waacking escénico.</p>
              </div>

              <button
                id="btn-trigger-add-physical-video"
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-on-primary-fixed-variant text-primary-fixed hover:bg-on-primary-container border border-primary/20 text-[10px] font-bold rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all uppercase"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>NUEVA RUTINA</span>
              </button>
            </div>

            {/* Add Custom Video Form Drawer */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden bg-slate-50 dark:bg-[#0d0d11]/80 rounded-2xl border border-tertiary/15 p-4 mb-6 text-on-surface space-y-4 shadow-2xl"
                >
                  <div className="flex items-center gap-2 border-b border-tertiary/10 pb-2">
                    <Dumbbell className="w-4 h-4 text-tertiary" />
                    <h4 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase">Registrar Nuevo Video de Acondicionamiento</h4>
                  </div>
                  
                  <form onSubmit={handleAddVideo} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold font-mono text-on-surface-variant block uppercase">Título del ejercicio *</label>
                      <input
                        type="text"
                        placeholder="Ej. Sostén e Isometría de Deltoides"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-[#0e0e0e] border border-tertiary/15 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-tertiary/30"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold font-mono text-on-surface-variant block uppercase">Foco de resistencia / Categoría *</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value as any)}
                        className="w-full bg-slate-100 dark:bg-[#0e0e0e] border border-tertiary/15 px-2 py-1.5 text-xs font-bold rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-tertiary/30"
                      >
                        <option value="brazos">💪 Brazos y Hombros (Rotación y Estamina)</option>
                        <option value="core">🤸 Core y Oblicuos (Aislamiento y Balance)</option>
                        <option value="piernas">🦵 Tren Inferior (Poses Bajas y Desplazamientos)</option>
                        <option value="espalda">🦒 Espalda y Trapecio (Postura Regia y Líneas)</option>
                        <option value="cardio">🔥 Cardio HIIT (Resistencia Cardiovascular)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold font-mono text-on-surface-variant block uppercase">Enlace de video / URL Cover</label>
                      <input
                        type="text"
                        placeholder="Pega URL de imagen o YouTube (opcional)"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-[#0e0e0e] border border-tertiary/15 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-tertiary/30"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold font-mono text-on-surface-variant block uppercase">Duración</label>
                        <input
                          type="text"
                          placeholder="Ej. 15 min"
                          value={newDuration}
                          onChange={(e) => setNewDuration(e.target.value)}
                          className="w-full bg-slate-100 dark:bg-[#0e0e0e] border border-tertiary/15 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-tertiary/30"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold font-mono text-on-surface-variant block uppercase">Intensidad</label>
                        <select
                          value={newIntensity}
                          onChange={(e) => setNewIntensity(e.target.value as any)}
                          className="w-full bg-slate-100 dark:bg-[#0e0e0e] border border-tertiary/15 px-2 py-1.5 text-xs font-bold rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-tertiary/30"
                        >
                          <option value="Baja">🟢 Baja</option>
                          <option value="Media">🟡 Media</option>
                          <option value="Alta">🔴 Alta</option>
                          <option value="Extrema">💀 Extrema</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-bold font-mono text-on-surface-variant block uppercase">Descripción del ejercicio *</label>
                      <textarea
                        rows={2}
                        placeholder="Explica detalladamente la ejecución biomecánica correcta del drill..."
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-[#0e0e0e] border border-tertiary/15 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-tertiary/30"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-bold font-mono text-on-surface-variant block uppercase">Beneficios biomecánicos clave</label>
                      <input
                        type="text"
                        placeholder="Ej. Estabilización rotacional profunda y protección del trapecio superior."
                        value={newBenefits}
                        onChange={(e) => setNewBenefits(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-[#0e0e0e] border border-tertiary/15 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-2 pt-2 border-t border-tertiary/10">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-4 py-2 border border-tertiary/15 text-xs font-bold hover:bg-slate-200 dark:hover:bg-black/40 text-on-surface-variant hover:text-slate-900 dark:hover:text-white rounded-xl uppercase transition-all"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-on-primary-fixed-variant border border-primary/25 text-primary-fixed text-xs font-bold rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all uppercase"
                      >
                        Guardar rutina
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Videos list grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVideos.map((vid) => {
                const isActive = activeVideo?.id === vid.id;
                return (
                  <div
                    id={`fisico-video-card-${vid.id}`}
                    key={vid.id}
                    onClick={() => {
                      setActiveVideo(vid);
                      setIsWatching(false);
                    }}
                    className={`border rounded-2xl p-3.5 cursor-pointer transition-all flex flex-col justify-between ${
                      isActive 
                        ? 'bg-amber-50 dark:bg-[#0d0d11]/80 border-primary/45 shadow-xl'
                        : 'bg-slate-50 dark:bg-[#121212]/55 border-tertiary/10 hover:border-tertiary/20'
                    }`}
                  >
                    <div>
                      {/* Image Thumbnail with play indicator */}
                      <div className="relative aspect-video rounded-xl border border-tertiary/10 overflow-hidden bg-black mb-3">
                        <img 
                          src={vid.videoUrl} 
                          alt={vid.title} 
                          className="w-full h-full object-cover opacity-70"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        
                        {/* Muscle tag and intensity */}
                        <span className="absolute top-2.5 left-2.5 text-[8px] font-mono font-bold text-white bg-[#0a0a0a]/90 border border-tertiary/20 px-2 py-0.5 rounded-full uppercase">
                          {vid.category === 'brazos' ? '💪 Brazos' : vid.category === 'core' ? '🤸 Core' : vid.category === 'piernas' ? '🦵 Piernas' : vid.category === 'espalda' ? '🦒 Espalda' : '🔥 Cardio'}
                        </span>

                        <span className={`absolute top-2.5 right-2.5 text-[8px] font-mono font-bold border px-1.5 py-0.5 rounded uppercase ${
                          vid.intensity === 'Alta' || vid.intensity === 'Extrema' 
                            ? 'bg-primary-container/40 border-primary/40 text-primary' 
                            : 'bg-tertiary/10 border-tertiary/20 text-tertiary'
                        }`}>
                          {vid.intensity}
                        </span>

                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-black/80 border border-tertiary/25 flex items-center justify-center shadow-lg hover:scale-105 transition-all">
                            <Play className="w-4 h-4 text-tertiary fill-tertiary ml-0.5" />
                          </div>
                        </div>

                        <div className="absolute bottom-2.5 right-2.5 text-[9px] font-mono font-bold text-white bg-[#0a0a0a]/75 px-1.5 py-0.5 rounded border border-tertiary/10">
                          {vid.duration}
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase leading-tight line-clamp-1">{vid.title}</h4>
                      <p className="text-[10px] text-on-surface-variant font-medium mt-1 line-clamp-2 leading-relaxed">{vid.description}</p>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-tertiary/10">
                      <span className="text-[9px] font-mono font-bold text-tertiary uppercase tracking-tight truncate max-w-[70%]">
                        {vid.category === 'brazos' && '✨ Tonificación de Rolls'}
                        {vid.category === 'core' && '⚡ Postura & Giros'}
                        {vid.category === 'piernas' && '🦵 Poses & Resorte'}
                        {vid.category === 'espalda' && '🦒 Alineación de Línea'}
                        {vid.category === 'cardio' && '🔥 Aguante Aeróbico'}
                      </span>
                      
                      <div className="flex gap-1.5 items-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDemoModal(vid);
                          }}
                          className="px-1.5 py-0.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-[#171526] dark:hover:bg-[#25223c] border border-tertiary/25 text-tertiary hover:text-slate-900 dark:hover:text-white rounded transition-all text-[9px] font-mono font-bold flex items-center gap-1"
                          title="Vincular o subir video de demostración para esta rutina"
                        >
                          <Upload className="w-2.5 h-2.5 text-tertiary" />
                          <span>Demo</span>
                        </button>

                        {vid.isCustom && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteVideo(vid.id, e)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-black/40 border border-primary/20 text-primary hover:text-primary-fixed rounded transition-all text-[9px] font-bold"
                            title="Eliminar rutina"
                          >
                            🗑️
                          </button>
                        )}
                        <span className="text-[9px] bg-slate-100 dark:bg-[#0d0d11]/80 border border-tertiary/15 text-slate-900 dark:text-white font-mono font-bold px-1.5 py-0.5 rounded hover:border-tertiary transition-all">
                          VER DETALLES
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active spotlight video player */}
          {activeVideo && (
            <div className="bg-surface-container border border-tertiary/10 rounded-2xl p-5 shadow-2xl text-on-surface space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-tertiary/10 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-tertiary" />
                  <div>
                    <h3 className="text-xs font-mono font-bold text-tertiary uppercase flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-primary animate-pulse" /> RUTINA BIOMECÁNICA ACTIVA
                    </h3>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase leading-tight mt-0.5">{activeVideo.title}</h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Demo Video upload / link action button */}
                  <button
                    type="button"
                    onClick={() => handleOpenDemoModal(activeVideo)}
                    className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-[#1a1829] dark:hover:bg-[#25223a] border border-tertiary/35 text-tertiary hover:text-slate-900 dark:hover:text-white rounded-xl text-[9px] font-mono font-bold uppercase flex items-center gap-1.5 transition-all shadow-md hover:scale-105 active:scale-95"
                    title="Cargar o vincular video de demostración para esta rutina"
                  >
                    <Upload className="w-3 h-3 text-tertiary" />
                    <span>Cargar / Vincular Video Demo</span>
                  </button>

                  {/* AI Visualizer toggle */}
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#0e0e11] border border-tertiary/15 p-1 rounded-xl shrink-0">
                    <button
                      type="button"
                      onClick={() => setUseAIVisualizer(false)}
                      className={`px-3 py-1 rounded-lg text-[9px] font-mono font-bold uppercase transition-all ${
                        !useAIVisualizer
                          ? 'bg-primary-container text-primary border border-primary/20'
                          : 'text-on-surface-variant hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Video Demo
                    </button>
                    <button
                      type="button"
                      onClick={() => setUseAIVisualizer(true)}
                      className={`px-3 py-1 rounded-lg text-[9px] font-mono font-bold uppercase flex items-center gap-1 transition-all ${
                        useAIVisualizer
                          ? 'bg-tertiary/15 text-tertiary border border-tertiary/35 shadow-lg'
                          : 'text-on-surface-variant hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-2.5 h-2.5 animate-pulse" /> Filtro IA Biomecánico
                    </button>
                  </div>
                </div>
              </div>

              {/* Player element and AI Terminal Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Left: The Video/Canvas stage (8 columns) */}
                <div className="lg:col-span-8 space-y-3">
                  <div className="relative aspect-video rounded-2xl border border-tertiary/15 overflow-hidden bg-black shadow-2xl">
                    {isWatching ? (
                      <>
                        {useAIVisualizer ? (
                          /* AI Animated Canvas visualizer */
                          <AICanvasExerciseVideo 
                            category={activeVideo.category} 
                            isPaused={false} 
                            speed={visualizerSpeed} 
                            showSkeletalTracker={showSkeletalTracker} 
                            showGrid={showGrid} 
                          />
                        ) : (
                          /* Dynamic video player supporting embeds and file uploads */
                          <div className="absolute inset-0 bg-black">
                            {(() => {
                              const demoUrl = activeVideo.aiVideoUrl || activeVideo.videoUrl;
                              const embedUrl = getEmbedUrl(demoUrl);
                              if (embedUrl) {
                                return (
                                  <iframe
                                    src={embedUrl}
                                    title={activeVideo.title}
                                    className="w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    loading="lazy"
                                  />
                                );
                              }
                              return (
                                <div className="w-full h-full relative flex items-center justify-center bg-black">
                                  <video
                                    key={demoUrl}
                                    src={demoUrl}
                                    controls
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-contain bg-black"
                                  />
                                  <div className="absolute top-4 left-4 z-10 bg-[#0d0d11]/85 px-3 py-1.5 rounded-lg border border-tertiary/20 text-white font-mono text-[9px] uppercase tracking-wider space-y-0.5 pointer-events-none">
                                    <p className="font-bold text-primary">📹 DEMOSTRACIÓN DE RUTINA</p>
                                    <p className="text-on-surface-variant font-medium">{activeVideo.title}</p>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {/* Top HUD overlay for active watching */}
                        <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 pointer-events-none">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                          <span className="bg-black/85 border border-red-500/30 text-white text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                            LIVE RENDER
                          </span>
                        </div>

                        {/* Control actions overlay for the visualizer */}
                        <div className="absolute bottom-3 right-3 left-3 z-30 flex items-center justify-between bg-black/85 backdrop-blur-md p-2 rounded-xl border border-tertiary/15">
                          <div className="flex items-center gap-2">
                            <button 
                              type="button"
                              onClick={() => setIsWatching(false)}
                              className="p-1.5 bg-red-950/40 border border-red-500/25 hover:bg-red-950/70 text-red-400 rounded-lg transition-all"
                              title="Pausar simulador"
                            >
                              <Pause className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[9px] font-mono font-bold text-on-surface-variant">SIMULACIÓN IA</span>
                          </div>

                          <span className="text-[9px] font-mono text-tertiary font-bold tracking-wider animate-pulse text-center">
                            {activeVideo.category === 'brazos' && '• DETECTANDO ROLLS DE BRAZOS •'}
                            {activeVideo.category === 'core' && '• MONITOREANDO AISLAMIENTO PECTORAL •'}
                            {activeVideo.category === 'espalda' && '• DETECTANDO ALINEACIÓN POSTURAL •'}
                            {activeVideo.category === 'piernas' && '• EVALUANDO DESPLAZAMIENTO DE CADERA •'}
                            {activeVideo.category === 'cardio' && '• ENERGETICS HIIT DE COMBATE •'}
                          </span>

                          <span className="text-[9px] font-mono text-on-surface-variant font-bold">60.0 FPS</span>
                        </div>
                      </>
                    ) : (
                      /* Spotlight Preview (Inactive State) */
                      <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-white">
                        <img 
                          src={activeVideo.videoUrl} 
                          alt="Spotlight preview" 
                          className="absolute inset-0 w-full h-full object-cover opacity-50 filter blur-[1px]"
                        />
                        <div className="absolute inset-0 bg-black/60" />

                        <div className="z-10 space-y-4 max-w-lg">
                          <div 
                            onClick={() => setIsWatching(true)}
                            className="w-16 h-16 rounded-full bg-on-primary-fixed-variant border border-primary/20 flex items-center justify-center mx-auto shadow-2xl cursor-pointer hover:scale-105 active:scale-95 transition-all"
                          >
                            <Play className="w-6 h-6 text-primary-fixed fill-primary-fixed ml-1" />
                          </div>
                          <div>
                            <span className="bg-tertiary/10 border border-tertiary/30 text-tertiary text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                              ⚡ IA BIOMECÁNICA DISPONIBLE
                            </span>
                            <h4 className="text-md font-bold text-white uppercase mt-2.5 leading-tight">{activeVideo.title}</h4>
                            <p className="text-[11px] text-on-surface-variant mt-2 leading-relaxed font-semibold">{activeVideo.description}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: AI Interactive controls & observations (4 columns) */}
                <div className="lg:col-span-4 flex flex-col justify-between gap-3.5">
                  
                  {/* Controls configuration pane */}
                  <div className="bg-white dark:bg-[#0b0b0e] border border-tertiary/10 p-3 rounded-2xl space-y-3">
                    <h5 className="text-[9px] font-mono font-bold text-tertiary uppercase tracking-wider border-b border-tertiary/10 pb-1.5 flex items-center gap-1">
                      <Gauge className="w-3 h-3" /> AJUSTES DEL RENDER DE IA
                    </h5>

                    {/* Speed selection */}
                    <div className="space-y-1">
                      <label className="text-[8px] font-mono text-on-surface-variant uppercase font-bold flex justify-between">
                        <span>Velocidad de ejecución:</span>
                        <span className="text-tertiary font-bold">{visualizerSpeed.toFixed(1)}x</span>
                      </label>
                      <div className="flex gap-1">
                        {[0.5, 1.0, 1.5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setVisualizerSpeed(val)}
                            className={`flex-1 py-1 rounded border text-[9px] font-mono font-bold uppercase transition-all ${
                              visualizerSpeed === val 
                                ? 'bg-amber-50 dark:bg-[#15151a] text-tertiary border-tertiary/40'
                                : 'bg-slate-50 dark:bg-[#060609] text-on-surface-variant border-tertiary/10 hover:border-tertiary/20'
                            }`}
                          >
                            {val === 0.5 ? 'Lento' : val === 1.0 ? 'Normal' : 'Rápido'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Show grid toggle */}
                    <button
                      type="button"
                      onClick={() => setShowGrid(!showGrid)}
                      className={`w-full py-1.5 px-2.5 rounded border text-[9px] font-mono font-bold uppercase flex items-center justify-between transition-all ${
                        showGrid 
                          ? 'bg-amber-50 dark:bg-[#15151a] text-slate-900 dark:text-white border-tertiary/25'
                          : 'bg-slate-50 dark:bg-[#060609] text-on-surface-variant border-tertiary/10'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Grid className="w-3.5 h-3.5" />
                        <span>Malla de Medición Espacial</span>
                      </span>
                      <span className={showGrid ? 'text-primary' : 'text-on-surface-variant'}>
                        {showGrid ? 'ON' : 'OFF'}
                      </span>
                    </button>

                    {/* Show skeletal bone outline */}
                    <button
                      type="button"
                      onClick={() => setShowSkeletalTracker(!showSkeletalTracker)}
                      className={`w-full py-1.5 px-2.5 rounded border text-[9px] font-mono font-bold uppercase flex items-center justify-between transition-all ${
                        showSkeletalTracker 
                          ? 'bg-amber-50 dark:bg-[#15151a] text-slate-900 dark:text-white border-primary/25'
                          : 'bg-slate-50 dark:bg-[#060609] text-on-surface-variant border-tertiary/10'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" />
                        <span>Esqueleto Biomecánico</span>
                      </span>
                      <span className={showSkeletalTracker ? 'text-primary' : 'text-on-surface-variant'}>
                        {showSkeletalTracker ? 'ON' : 'OFF'}
                      </span>
                    </button>
                  </div>

                  {/* Terminal de observaciones IA */}
                  <div className="bg-white dark:bg-black/90 border border-[#81262c]/20 p-3 rounded-2xl flex-1 flex flex-col justify-between min-h-[140px] max-h-[180px] lg:max-h-none overflow-hidden relative">
                    <div className="absolute top-2 right-2 flex items-center gap-1 pointer-events-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="text-[7px] font-mono text-[#81262c] font-bold uppercase">SEC_LOG_OK</span>
                    </div>

                    <h5 className="text-[8px] font-mono font-bold text-primary uppercase tracking-widest border-b border-[#81262c]/20 pb-1 mb-2 flex items-center gap-1">
                      🔬 CONSOLE OBSERVACIONES IA:
                    </h5>

                    {/* Log list container */}
                    <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 font-mono text-[9px] leading-tight text-on-surface-variant font-semibold scrollbar-thin select-none">
                      {isWatching ? (
                        aiLogs.map((log, idx) => (
                          <motion.p 
                            key={idx}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`${idx === 0 ? 'text-primary' : 'text-on-surface-variant/80'}`}
                          >
                            {log}
                          </motion.p>
                        ))
                      ) : (
                        <p className="text-[9px] italic text-on-surface-variant/50 text-center py-6">
                          Inicia el reproductor para conectar los sensores de movimiento IA...
                        </p>
                      )}
                    </div>

                    <div className="border-t border-[#81262c]/10 pt-1.5 mt-2 flex justify-between text-[7px] font-mono text-[#81262c] font-bold">
                      <span>ANTIGRAVITY_CORE_V1.1</span>
                      <span>BUFFER: 100%</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Informative Grid Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-[#0d0d11]/80 border border-tertiary/15 p-4 rounded-2xl shadow-xl">
                  <h5 className="text-[10px] font-mono font-bold text-tertiary uppercase flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" /> FOCO BIOMECÁNICO ESPECÍFICO:
                  </h5>
                  <p className="text-[11px] text-on-surface-variant font-semibold mt-1 leading-relaxed">
                    {activeVideo.category === 'brazos' && 'Acondiciona el manguito rotador, fortalece las fibras traseras de los hombros y evita la fatiga escapular prematura.'}
                    {activeVideo.category === 'core' && 'Estabiliza el centro de gravedad pélvico para permitir aislamientos e intercostales veloces e independientes del torso.'}
                    {activeVideo.category === 'piernas' && 'Fortalece los tendones poplíteos y cuádriceps para clavar poses ultra bajas dramáticas sin perder el balance.'}
                    {activeVideo.category === 'espalda' && 'Alinea la espina dorsal para la postura regia icónica del Waacking. Abre y estira la caja torácica superior.'}
                    {activeVideo.category === 'cardio' && 'Aumenta el umbral anaeróbico para poder bailar de corrido tracks acelerados de Disco de más de 128 BPM.'}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-[#0d0d11]/80 border border-primary/15 p-4 rounded-2xl shadow-xl">
                  <h5 className="text-[10px] font-mono font-bold text-primary uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> PREVENCIÓN Y DESEMPEÑO:
                  </h5>
                  <p className="text-[11px] text-on-surface-variant font-semibold mt-1 leading-relaxed font-body-md">
                    {activeVideo.benefits}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Tabata Timer, SoundCloud Player & Daily Checklist (4 Columns) */}
        <div className="xl:col-span-4 space-y-6">

          {/* SoundCloud Music Sync Player */}
          <SoundCloudPlayer title="SoundCloud Somático" />

          {/* Tabata Metronome Interval Timer */}
          <div className="bg-surface-container border border-tertiary/10 rounded-2xl p-5 shadow-2xl text-on-surface relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 w-24 h-24 bg-tertiary/5 rounded-full pointer-events-none" />
            
            <div className="flex justify-between items-center border-b border-tertiary/10 pb-3 mb-4">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-tertiary" />
                <div>
                  <h3 className="text-xs font-mono font-bold text-tertiary uppercase">CRONÓMETRO TABATA</h3>
                  <p className="text-[9px] text-on-surface-variant font-bold leading-none mt-0.5">Control de tiempos de resistencia</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="p-1 border border-tertiary/10 rounded-lg hover:bg-slate-100 dark:hover:bg-black/30 transition-all text-on-surface"
                title={isMuted ? 'Activar sonido' : 'Silenciar'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-on-surface-variant" /> : <Volume2 className="w-3.5 h-3.5 text-primary" />}
              </button>
            </div>

            {timerMode === 'config' ? (
              <div className="space-y-4">
                <p className="text-[10px] text-on-surface-variant font-bold leading-relaxed">
                  Configura tus intervalos de esfuerzo para rondas continuas de acondicionamiento de hombros y rolls.
                </p>

                <div className="space-y-3 bg-slate-50 dark:bg-[#0d0d11]/60 border border-tertiary/10 p-3.5 rounded-xl shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-on-surface-variant">⚙️ ESFUERZO (TRABAJO):</span>
                    <div className="flex items-center gap-1">
                      <button 
                        type="button"
                        onClick={() => setWorkTime(t => Math.max(10, t - 5))}
                        className="w-5 h-5 bg-slate-100 dark:bg-[#121212] border border-tertiary/15 text-slate-900 dark:text-white hover:text-tertiary rounded text-xs font-bold flex items-center justify-center transition-all"
                      >
                        -
                      </button>
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white px-2">{workTime}s</span>
                      <button 
                        type="button"
                        onClick={() => setWorkTime(t => Math.min(180, t + 5))}
                        className="w-5 h-5 bg-slate-100 dark:bg-[#121212] border border-tertiary/15 text-slate-900 dark:text-white hover:text-tertiary rounded text-xs font-bold flex items-center justify-center transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-on-surface-variant">⚙️ RECUPERACIÓN (DESCANSO):</span>
                    <div className="flex items-center gap-1">
                      <button 
                        type="button"
                        onClick={() => setRestTime(t => Math.max(5, t - 5))}
                        className="w-5 h-5 bg-slate-100 dark:bg-[#121212] border border-tertiary/15 text-slate-900 dark:text-white hover:text-tertiary rounded text-xs font-bold flex items-center justify-center transition-all"
                      >
                        -
                      </button>
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white px-2">{restTime}s</span>
                      <button 
                        type="button"
                        onClick={() => setRestTime(t => Math.min(120, t + 5))}
                        className="w-5 h-5 bg-slate-100 dark:bg-[#121212] border border-tertiary/15 text-slate-900 dark:text-white hover:text-tertiary rounded text-xs font-bold flex items-center justify-center transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-on-surface-variant">⚙️ ROUNDS TOTALES:</span>
                    <div className="flex items-center gap-1">
                      <button 
                        type="button"
                        onClick={() => setTotalRounds(r => Math.max(1, r - 1))}
                        className="w-5 h-5 bg-slate-100 dark:bg-[#121212] border border-tertiary/15 text-slate-900 dark:text-white hover:text-tertiary rounded text-xs font-bold flex items-center justify-center transition-all"
                      >
                        -
                      </button>
                      <span className="text-xs font-mono font-bold text-white px-2.5">{totalRounds}</span>
                      <button 
                        type="button"
                        onClick={() => setTotalRounds(r => Math.min(20, r + 1))}
                        className="w-5 h-5 bg-slate-100 dark:bg-[#121212] border border-tertiary/15 text-slate-900 dark:text-white hover:text-tertiary rounded text-xs font-bold flex items-center justify-center transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  id="tabata-start-trigger"
                  type="button"
                  onClick={handleStartTimer}
                  className="w-full py-2.5 bg-on-primary-fixed-variant hover:bg-on-primary-container text-primary-fixed border border-primary/25 rounded-xl font-bold text-xs tracking-wider uppercase shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-primary-fixed" />
                  <span>INICIAR INTERVALOS HIIT</span>
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                
                <div className="flex justify-between items-center text-[10px] font-mono font-bold text-on-surface-variant uppercase px-1">
                  <span>ROUND: {currentRound} / {totalRounds}</span>
                  <span className={`px-2 py-0.5 rounded border font-mono font-bold ${
                    timerPhase === 'work' 
                      ? 'bg-primary-container/40 border-primary text-primary animate-pulse' 
                      : timerPhase === 'rest' 
                      ? 'bg-tertiary/10 border-tertiary text-tertiary' 
                      : 'bg-[#121212] border-tertiary/10 text-white'
                  }`}>
                    {timerPhase === 'work' ? '🔥 ESFUERZO' : timerPhase === 'rest' ? '💤 RECUPERA' : '🚦 LISTO'}
                  </span>
                </div>

                {/* Big dial circle countdown */}
                <div className={`w-36 h-36 rounded-full border border-tertiary/20 mx-auto flex flex-col items-center justify-center shadow-2xl transition-all ${
                  timerPhase === 'work' 
                    ? 'bg-primary-container/20 border-primary/30 text-white' 
                    : 'bg-tertiary/10 border-tertiary/20 text-white'
                }`}>
                  <span className="text-5xl font-display-lg font-bold leading-none tabular-nums">{timeLeft}s</span>
                  <span className="text-[8px] font-mono font-bold tracking-widest uppercase mt-1">
                    {timerMode === 'finished' ? '¡FIN!' : timerPhase === 'work' ? '¡DALE VELOCIDAD!' : 'RESPIRA HONDO'}
                  </span>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 justify-center">
                  {timerMode === 'running' ? (
                    <button
                      type="button"
                      onClick={() => setTimerMode('paused')}
                      className="px-3.5 py-2 border border-tertiary/15 hover:border-tertiary/30 text-white bg-slate-100 dark:bg-[#0e0e0e] rounded-xl text-[10px] font-bold uppercase flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pausar</span>
                    </button>
                  ) : timerMode === 'paused' ? (
                    <button
                      type="button"
                      onClick={() => setTimerMode('running')}
                      className="px-3.5 py-2 border border-primary/20 text-primary-fixed bg-on-primary-fixed-variant rounded-xl text-[10px] font-bold uppercase flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-primary-fixed" />
                      <span>Reanudar</span>
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleResetTimer}
                    className="px-3.5 py-2 border border-tertiary/15 text-on-surface-variant hover:text-white rounded-xl text-[10px] font-bold uppercase flex items-center gap-1.5 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Detener</span>
                  </button>
                </div>

                {timerMode === 'finished' && (
                  <div className="bg-primary-container/10 border border-primary/20 p-3 rounded-xl shadow-lg">
                    <p className="text-xs font-bold text-primary uppercase">🎉 ¡CIRCUITO COMPLETADO!</p>
                    <p className="text-[9px] text-on-surface-variant font-medium mt-1 leading-relaxed">Has completado tu dosis diaria de resistencia y acondicionamiento muscular.</p>
                  </div>
                )}
              </div>
            )}

            {/* Recommendations checklist during tabata */}
            <div className="bg-slate-100 dark:bg-[#0e0e0e]/60 border border-tertiary/10 rounded-xl p-3 mt-4">
              <h5 className="text-[8px] font-mono font-bold text-tertiary uppercase tracking-wider mb-2">EJERCICIOS RECOMENDADOS:</h5>
              <div className="space-y-1.5 text-[10px] font-semibold text-on-surface-variant leading-relaxed">
                <p className="flex items-center gap-1.5">💪 <strong className="text-white">Pushups lentas:</strong> Fuerza isométrica del pectoral.</p>
                <p className="flex items-center gap-1.5">🤸 <strong className="text-white">Plancha Escápula:</strong> Retracción y salud del trapecio.</p>
                <p className="flex items-center gap-1.5">🦵 <strong className="text-white">Sentadilla Muelle:</strong> Resistencia y fuerza elástica.</p>
                <p className="flex items-center gap-1.5">🔥 <strong className="text-white">Cuerda de saltar:</strong> Estamina cardiovascular general.</p>
              </div>
            </div>

          </div>

          {/* Daily Physical Activation Checklist */}
          <div className="bg-surface-container border border-tertiary/10 rounded-2xl p-5 shadow-2xl text-on-surface space-y-4">
            <div className="flex justify-between items-start border-b border-tertiary/10 pb-3">
              <div>
                <h3 className="text-xs font-mono font-bold text-primary uppercase flex items-center gap-1.5">
                  📋 ACTIVACIÓN DIARIA SANA
                </h3>
                <p className="text-[9px] text-on-surface-variant font-bold mt-0.5">Prevención y mantenimiento biomecánico</p>
              </div>

              {progressPercent > 0 && (
                <button
                  type="button"
                  onClick={resetChecklist}
                  className="text-[8px] border border-tertiary/15 hover:border-tertiary text-on-surface-variant hover:text-white px-2 py-0.5 rounded font-mono font-bold uppercase transition-all"
                >
                  Reiniciar
                </button>
              )}
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5 bg-slate-100 dark:bg-[#0e0e0e]/40 p-3 rounded-xl border border-tertiary/10">
              <div className="flex justify-between items-center text-[9px] font-mono font-bold text-on-surface-variant">
                <span>Activación de hoy:</span>
                <span className="text-white">{completedCount} / {checklist.length} ({progressPercent}%)</span>
              </div>
              <div className="w-full bg-[#121212] border border-tertiary/10 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Checklist elements list */}
            <div className="space-y-2">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-2 justify-between ${
                    item.completed
                      ? 'bg-primary-container/10 border-primary/20 text-on-surface-variant line-through opacity-70'
                      : 'bg-[#121212]/40 border-tertiary/10 hover:border-tertiary/20 text-white font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      item.completed ? 'bg-primary border-primary' : 'bg-[#0d0d11] border-tertiary/20'
                    }`}>
                      {item.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] leading-tight text-white font-bold truncate">{item.text}</p>
                      <p className="text-[8px] font-mono text-tertiary font-bold mt-0.5 uppercase tracking-wide">{item.target}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant shrink-0" />
                </div>
              ))}
            </div>

            {progressPercent === 100 && (
              <div className="p-3 bg-tertiary/10 border border-tertiary/20 rounded-xl text-center space-y-1 animate-pulse">
                <p className="text-xs font-bold text-tertiary">💪 ¡ACTIVACIÓN COMPLETADA!</p>
                <p className="text-[8px] font-bold text-on-surface-variant leading-relaxed">Has fortalecido y activado tus articulaciones antes de iniciar la velocidad del Waacking.</p>
              </div>
            )}
          </div>

          {/* Biomechanical Warning Info */}
          <div className="bg-[#0d0d11]/80 border border-tertiary/15 p-4 rounded-2xl shadow-2xl flex gap-3 text-on-surface">
            <Info className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-[10px] font-mono font-bold uppercase text-tertiary">CONSEJO BIOMECÁNICO PREVENTIVO:</h5>
              <p className="text-[10px] font-semibold leading-relaxed text-on-surface-variant">
                Los rolls repetitivos del Waacking pueden causar tendinitis de codo si los rotadores del hombro están inactivos. Realiza siempre el checklist diario de 5 minutos antes de entrenar velocidad.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Modal de Carga o Vinculación de Video Demo */}
      <AnimatePresence>
        {demoModalVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0e0e12] border border-tertiary/30 rounded-2xl max-w-lg w-full p-6 text-white space-y-5 shadow-2xl relative"
            >
              <div className="flex items-start justify-between border-b border-tertiary/15 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-tertiary/15 border border-tertiary/30 flex items-center justify-center">
                    <Film className="w-5 h-5 text-tertiary" />
                  </div>
                  <div>
                    <h3 className="text-xs font-mono font-bold text-tertiary uppercase">VINCULAR VIDEO DE DEMOSTRACIÓN</h3>
                    <p className="text-sm font-bold text-white leading-snug mt-0.5">{demoModalVideo.title}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDemoModalVideo(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-on-surface-variant hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs: Upload File vs Link URL */}
              <div className="flex border-b border-tertiary/15">
                <button
                  type="button"
                  onClick={() => setDemoModalTab('upload')}
                  className={`flex-1 py-2 text-xs font-bold uppercase border-b-2 flex items-center justify-center gap-2 transition-all ${
                    demoModalTab === 'upload'
                      ? 'border-tertiary text-tertiary'
                      : 'border-transparent text-on-surface-variant hover:text-white'
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  Subir Archivo Local
                </button>
                <button
                  type="button"
                  onClick={() => setDemoModalTab('link')}
                  className={`flex-1 py-2 text-xs font-bold uppercase border-b-2 flex items-center justify-center gap-2 transition-all ${
                    demoModalTab === 'link'
                      ? 'border-tertiary text-tertiary'
                      : 'border-transparent text-on-surface-variant hover:text-white'
                  }`}
                >
                  <Link className="w-4 h-4" />
                  Vincular Enlace (URL)
                </button>
              </div>

              {/* Content Tab 1: Upload File */}
              {demoModalTab === 'upload' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-tertiary/30 rounded-2xl p-6 text-center hover:border-tertiary transition-all bg-[#13131a] relative group cursor-pointer">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleDemoFileSelect(e, demoModalVideo.id)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                    <FileVideo className="w-10 h-10 text-tertiary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-bold text-white uppercase">Haz clic o arrastra tu video de demostración</p>
                    <p className="text-[10px] text-on-surface-variant font-medium mt-1">Soporta formatos MP4, WebM, MOV o AVI</p>
                  </div>
                </div>
              )}

              {/* Content Tab 2: Link URL */}
              {demoModalTab === 'link' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-on-surface-variant uppercase block">
                      URL del Video (Directo o YouTube):
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. https://www.youtube.com/watch?v=... o enlace MP4"
                      value={demoVideoUrlInput}
                      onChange={(e) => setDemoVideoUrlInput(e.target.value)}
                      className="w-full bg-[#121218] border border-tertiary/20 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-tertiary"
                    />
                    <p className="text-[9px] text-on-surface-variant font-medium">Puedes ingresar un video directo o un enlace de YouTube/Vimeo.</p>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleSaveDemoUrl(demoModalVideo.id, demoVideoUrlInput)}
                      className="px-4 py-2 bg-tertiary/20 hover:bg-tertiary/30 border border-tertiary/40 text-tertiary text-xs font-bold rounded-xl uppercase transition-all shadow-lg"
                    >
                      Guardar Enlace
                    </button>
                  </div>
                </div>
              )}

              {/* Footer actions */}
              <div className="flex items-center justify-between pt-3 border-t border-tertiary/15">
                <button
                  type="button"
                  onClick={() => handleResetDemoVideo(demoModalVideo.id)}
                  className="text-[10px] font-mono font-bold text-on-surface-variant hover:text-white flex items-center gap-1 uppercase"
                >
                  <RotateCcw className="w-3 h-3" /> Restablecer demo original
                </button>

                <button
                  type="button"
                  onClick={() => setDemoModalVideo(null)}
                  className="px-4 py-1.5 border border-tertiary/20 text-xs font-bold text-on-surface-variant hover:text-white rounded-xl uppercase"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast feedback notification */}
      <AnimatePresence>
        {demoToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-[#16161f] border border-tertiary/40 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-white"
          >
            <CheckCircle2 className="w-5 h-5 text-tertiary" />
            <span className="text-xs font-bold">{demoToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <TrainingSummaryModal
        isOpen={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        summary={sessionSummary}
      />

    </div>
  );
}
