// src/components/entrenamiento/SmartMusicalityTrainer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Music, 
  Upload, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Activity, 
  Sliders, 
  Camera, 
  CameraOff, 
  Sparkles, 
  Radio, 
  Flame, 
  Zap, 
  Disc, 
  Repeat, 
  Award, 
  CheckCircle2, 
  Info, 
  BarChart2, 
  Layers, 
  RotateCcw,
  Headphones,
  Maximize2,
  Download,
  FileText,
  FileJson,
  Printer,
  X
} from 'lucide-react';
import { Language } from '../../lib/translations';

interface SmartMusicalityTrainerProps {
  language?: Language;
  onAddBonusPoints?: (points: number) => void;
  theme?: 'dark' | 'light';
}

export type FrequencyFocusMode = 'graves' | 'medios' | 'agudos';

export interface TapRecord {
  id: string;
  timestampMs: number;
  offsetMs: number;
  status: 'onbeat' | 'atras' | 'adelante';
  points: number;
  trackTime: number;
  focusMode: FrequencyFocusMode;
  label?: string;
}

interface DemoTrack {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  genre: string;
  description: string;
  audioUrl: string;
}

const DEMO_TRACKS: DemoTrack[] = [
  {
    id: 'track-1',
    title: 'Studio 54 Golden Funk',
    artist: 'Wakaon Disco Band',
    bpm: 124,
    genre: '70s Disco Funk',
    description: 'Bajo slap pesado, vocales dramáticas y charlestón brillante de alta velocidad.',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3'
  },
  {
    id: 'track-2',
    title: 'High Fashion Waack Anthem',
    artist: 'Pioneer Beats',
    bpm: 128,
    genre: 'Modern Waacking',
    description: 'Batería contundente en graves, fraseos vocales soulful y violines agudos en contratiempo.',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-hip-hop-02-738.mp3'
  },
  {
    id: 'track-3',
    title: 'Soulful Vocal Groove',
    artist: 'Diva Vocals',
    bpm: 118,
    genre: 'Soulful Disco',
    description: 'Enfocado en melodías vocales melismáticas perfectas para aislación de torso.',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-[#E9C349]-funky-groove-581.mp3'
  }
];

export function SmartMusicalityTrainer({
  language = 'es',
  onAddBonusPoints,
  theme
}: SmartMusicalityTrainerProps) {
  const isDark = theme ? theme === 'dark' : document.documentElement.classList.contains('dark');
  // Focus option selection: 'graves' | 'medios' | 'agudos' (persisted in localStorage)
  const [focusMode, setFocusMode] = useState<FrequencyFocusMode>(() => {
    try {
      const saved = localStorage.getItem('waackon_frequency_focus_mode') || localStorage.getItem('wakaon_frequency_focus_mode');
      if (saved === 'graves' || saved === 'medios' || saved === 'agudos') {
        return saved;
      }
    } catch (e) {
      console.warn('Error reading focusMode from localStorage:', e);
    }
    return 'medios';
  });

  // Automatic Objective Switching state
  const [isAutoSwitchActive, setIsAutoSwitchActive] = useState<boolean>(false);
  const [autoSwitchMode, setAutoSwitchMode] = useState<'time' | 'dominant'>('time');
  const [autoSwitchIntervalSec, setAutoSwitchIntervalSec] = useState<number>(8); // 8 seconds per focus mode
  const [autoSwitchNotice, setAutoSwitchNotice] = useState<string | null>(null);
  
  // Audio playback states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedTrack, setSelectedTrack] = useState<DemoTrack>(DEMO_TRACKS[0]);
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
  const [customFileName, setCustomFileName] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  
  // Frequency Isolation Filter toggle
  const [isFrequencySolo, setIsFrequencySolo] = useState<boolean>(false);
  
  // Webcam state
  const [useWebcam, setUseWebcam] = useState<boolean>(false);
  
  // Interactive Musicality Game / Practice score
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [lastHitType, setLastHitType] = useState<string | null>(null);
  const [showHitNotification, setShowHitNotification] = useState<boolean>(false);

  // Audio Context & Analysis Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  
  const animationFrameRef = useRef<number | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);

  // Frequency Power States for HUD UI
  const [bassLevel, setBassLevel] = useState<number>(0);
  const [midLevel, setMidLevel] = useState<number>(0);
  const [trebleLevel, setTrebleLevel] = useState<number>(0);

  // Real-time Rhythmic Precision Bar States ('atras' | 'onbeat' | 'adelante')
  const [rhythmicOffsetMs, setRhythmicOffsetMs] = useState<number>(0);
  const [precisionStatus, setPrecisionStatus] = useState<'atras' | 'onbeat' | 'adelante'>('onbeat');
  const [indicatorPercent, setIndicatorPercent] = useState<number>(50);
  const [userTapFeedback, setUserTapFeedback] = useState<string | null>(null);

  // Session Tap History & Export States
  const [tapHistory, setTapHistory] = useState<TapRecord[]>([]);
  const [showSessionModal, setShowSessionModal] = useState<boolean>(false);

  // Export Session Summary in JSON Format
  const exportSessionJSON = () => {
    const onBeatCount = tapHistory.filter(t => t.status === 'onbeat').length;
    const atrasCount = tapHistory.filter(t => t.status === 'atras').length;
    const adelanteCount = tapHistory.filter(t => t.status === 'adelante').length;
    const totalTaps = tapHistory.length;
    const accuracy = totalTaps > 0 ? Math.round((onBeatCount / totalTaps) * 100) : 0;
    const avgOffset = totalTaps > 0 ? Math.round(tapHistory.reduce((a, b) => a + b.offsetMs, 0) / totalTaps) : 0;

    const sessionData = {
      platform: "WaackOn Platform - Entrenamiento de Musicalidad Rítmica",
      sessionDate: new Date().toISOString(),
      track: {
        title: selectedTrack.title,
        artist: selectedTrack.artist,
        bpm: selectedTrack.bpm,
        genre: selectedTrack.genre,
      },
      focusMode: focusMode,
      summary: {
        score: score,
        maxStreak: streak,
        totalTaps: totalTaps,
        onBeatCount: onBeatCount,
        atrasCount: atrasCount,
        adelanteCount: adelanteCount,
        accuracyPercentage: accuracy,
        averageOffsetMs: avgOffset,
      },
      tapHistory: tapHistory,
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sessionData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `waackon_precision_ritmica_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export Session Summary in PDF Report Format (Printable / PDF Document)
  const exportSessionPDF = () => {
    const onBeatCount = tapHistory.filter(t => t.status === 'onbeat').length;
    const atrasCount = tapHistory.filter(t => t.status === 'atras').length;
    const adelanteCount = tapHistory.filter(t => t.status === 'adelante').length;
    const totalTaps = tapHistory.length;
    const accuracy = totalTaps > 0 ? Math.round((onBeatCount / totalTaps) * 100) : 0;
    const avgOffset = totalTaps > 0 ? Math.round(tapHistory.reduce((a, b) => a + b.offsetMs, 0) / totalTaps) : 0;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>WaackOn - Reporte de Precisión Rítmica</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #080b18; color: #f1f5f9; padding: 32px; }
          .header { border-bottom: 2px solid #E9C349; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
          .logo { font-size: 22px; font-weight: 900; color: #E9C349; letter-spacing: 1px; text-transform: uppercase; }
          .sublogo { font-size: 12px; color: #94a3b8; font-family: monospace; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
          .card { background: #11162e; border: 1px solid #232d59; border-radius: 12px; padding: 16px; text-align: center; }
          .card-val { font-size: 28px; font-weight: 900; margin-top: 4px; font-family: monospace; }
          .card-lbl { font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
          .text-green { color: #10B981; }
          .text-gold { color: #E9C349; }
          .text-amber { color: #F59E0B; }
          .text-cyan { color: #06B6D4; }
          .section-title { font-size: 15px; font-weight: 800; color: #E9C349; margin-top: 24px; margin-bottom: 12px; border-left: 4px solid #E9C349; padding-left: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; background: #11162e; border-radius: 10px; overflow: hidden; border: 1px solid #232d59; }
          th, td { padding: 10px 14px; text-align: left; font-size: 12px; }
          th { background: #1a2247; color: #e2e8f0; font-family: monospace; text-transform: uppercase; font-size: 10px; }
          td { border-bottom: 1px solid #1e274f; }
          .badge { padding: 3px 8px; border-radius: 9999px; font-size: 10px; font-weight: 800; font-family: monospace; display: inline-block; }
          .badge-onbeat { background: rgba(16, 185, 129, 0.2); color: #10B981; border: 1px solid #10B981; }
          .badge-atras { background: rgba(245, 158, 11, 0.2); color: #F59E0B; border: 1px solid #F59E0B; }
          .badge-adelante { background: rgba(6, 182, 212, 0.2); color: #06B6D4; border: 1px solid #06B6D4; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #232d59; padding-top: 16px; font-family: monospace; }
          .recommendation { background: #161e3d; border-left: 4px solid #10B981; border-radius: 8px; padding: 14px; font-size: 12px; color: #cbd5e1; margin-top: 16px; }
          @media print {
            body { background-color: #ffffff; color: #0f172a; padding: 20px; }
            .card { background: #f8fafc; border-color: #e2e8f0; }
            table { background: #ffffff; border-color: #cbd5e1; }
            th { background: #f1f5f9; color: #0f172a; }
            td { border-bottom-color: #e2e8f0; color: #0f172a; }
            .logo, .section-title { color: #b45309; }
            .recommendation { background: #f0fdf4; border-left-color: #16a34a; color: #166534; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">WaackOn - Informe de Precisión Rítmica</div>
            <div class="sublogo">ANÁLISIS DE TEMPO & TIMING DE MUSICALIDAD WAACKING</div>
          </div>
          <div style="text-align: right; font-size: 11px; color: #94a3b8; font-family: monospace;">
            <div>Fecha: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
            <div>Track: <strong style="color: #f8fafc;">${selectedTrack.title}</strong> (${selectedTrack.bpm} BPM)</div>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <div class="card-lbl">Precisión On Beat</div>
            <div class="card-val text-green">${accuracy}%</div>
          </div>
          <div class="card">
            <div class="card-lbl">Puntaje de Sesión</div>
            <div class="card-val text-gold">${score} pts</div>
          </div>
          <div class="card">
            <div class="card-lbl">Mejor Racha</div>
            <div class="card-val text-gold">🔥 ${streak}</div>
          </div>
          <div class="card">
            <div class="card-lbl">Desfase Promedio</div>
            <div class="card-val text-cyan">${avgOffset >= 0 ? `+${avgOffset}` : avgOffset} ms</div>
          </div>
        </div>

        <div class="section-title">Análisis de Desglose de Timing</div>
        <p style="font-size: 13px; color: #cbd5e1; margin-bottom: 12px;">
          Durante esta sesión de práctica se registraron <strong>${totalTaps} marcas rítmicas</strong>.
        </p>
        <div style="display: flex; gap: 16px; font-size: 12px; font-family: monospace;">
          <div style="flex:1; background:#11162e; padding:12px; border-radius:8px; border:1px solid #10B981;">
            <strong style="color:#10B981">🎯 ON BEAT:</strong> ${onBeatCount} (${totalTaps > 0 ? Math.round((onBeatCount/totalTaps)*100) : 0}%)
          </div>
          <div style="flex:1; background:#11162e; padding:12px; border-radius:8px; border:1px solid #F59E0B;">
            <strong style="color:#F59E0B">⏪ ATRÁS (GROOVE):</strong> ${atrasCount} (${totalTaps > 0 ? Math.round((atrasCount/totalTaps)*100) : 0}%)
          </div>
          <div style="flex:1; background:#11162e; padding:12px; border-radius:8px; border:1px solid #06B6D4;">
            <strong style="color:#06B6D4">⏩ ADELANTE (EARLY):</strong> ${adelanteCount} (${totalTaps > 0 ? Math.round((adelanteCount/totalTaps)*100) : 0}%)
          </div>
        </div>

        <div class="recommendation">
          <strong>💡 Feedback de Entrenamiento A.I.:</strong>
          ${accuracy >= 75 
            ? '¡Excelente precisión rítmica! Tu memoria muscular está fuertemente alineada con el tempo. Explora acelerar la pista o enfocarte en acentos de agudos (wrist rolls).' 
            : atrasCount > adelanteCount 
              ? 'Tiendes a bailar con retraso (atrás del tempo). Practica anticipar la primera cuenta y acentuar con los brazos exactamente en el pulso.' 
              : 'Tiendes a apurarte (adelante del tempo). Relaja los hombros, mantén el rebote a tierra (groove) y permite que la música guíe el movimiento.'}
        </div>

        <div class="section-title">Registro de Marcas Rítmicas</div>
        ${tapHistory.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Tiempo Pista</th>
                <th>Desfase (ms)</th>
                <th>Evaluación</th>
                <th>Modo Frecuencia</th>
                <th>Puntos</th>
              </tr>
            </thead>
            <tbody>
              ${tapHistory.slice(-20).reverse().map((tap, idx) => `
                <tr>
                  <td>${tapHistory.length - idx}</td>
                  <td>${tap.trackTime.toFixed(1)}s</td>
                  <td>${tap.offsetMs >= 0 ? `+${tap.offsetMs}` : tap.offsetMs} ms</td>
                  <td>
                    <span class="badge badge-${tap.status}">
                      ${tap.status === 'onbeat' ? '🎯 ON BEAT' : tap.status === 'atras' ? '⏪ ATRÁS' : '⏩ ADELANTE'}
                    </span>
                  </td>
                  <td>${tap.focusMode.toUpperCase()}</td>
                  <td>+${tap.points} pts</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p style="font-size:12px; color:#94a3b8;">No se registraron marcas en vivo aún. Presiona "TOCAR / MARCAR BEAT [ESPACIO]" mientras suena la música para registrar tu ritmo.</p>'}

        <div class="footer">
          Documento generado automáticamente por WaackOn Platform - Tu asistente de Musicalidad y Danza Waacking.
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Initialize Web Audio Engine
  useEffect(() => {
    if (!audioRef.current) return;
    const audioElement = audioRef.current;

    const handleLoadedMetadata = () => {
      setDuration(audioElement.duration || 0);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audioElement.currentTime || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('ended', handleEnded);

    return () => {
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Web Audio Context Setup
  const setupWebAudio = () => {
    if (!audioRef.current) return;
    if (audioContextRef.current) return; // already created

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      const filter = ctx.createBiquadFilter();
      filter.type = 'allpass';

      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(filter);
      filter.connect(analyser);
      analyser.connect(ctx.destination);

      audioContextRef.current = ctx;
      sourceNodeRef.current = source;
      analyserRef.current = analyser;
      filterNodeRef.current = filter;
    } catch (e) {
      console.warn("Web Audio API AudioContext setup fallback:", e);
    }
  };

  // Update Frequency Isolation Filter when focusMode or isFrequencySolo changes
  useEffect(() => {
    if (!filterNodeRef.current || !audioContextRef.current) return;
    const filter = filterNodeRef.current;
    
    if (!isFrequencySolo) {
      filter.type = 'allpass';
    } else {
      if (focusMode === 'graves') {
        filter.type = 'lowpass';
        filter.frequency.value = 250;
      } else if (focusMode === 'medios') {
        filter.type = 'bandpass';
        filter.frequency.value = 1200;
        filter.Q.value = 1.0;
      } else if (focusMode === 'agudos') {
        filter.type = 'highpass';
        filter.frequency.value = 3500;
      }
    }
  }, [focusMode, isFrequencySolo]);

  // Persist focusMode preference in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('waackon_frequency_focus_mode', focusMode);
    } catch (e) {
      console.warn('Error saving focusMode to localStorage:', e);
    }
  }, [focusMode]);

  // Automatic Objective Switching Logic
  useEffect(() => {
    if (!isAutoSwitchActive || !isPlaying) return;

    if (autoSwitchMode === 'time') {
      const modes: FrequencyFocusMode[] = ['graves', 'medios', 'agudos'];
      const currentIndex = Math.floor(currentTime / autoSwitchIntervalSec) % 3;
      const targetMode = modes[currentIndex];

      if (targetMode !== focusMode) {
        setFocusMode(targetMode);
        const modeLabels = {
          graves: 'GRAVES (BASS / PISO & GROOVE)',
          medios: 'MEDIOS (VOCALES / TORSO)',
          agudos: 'AGUDOS (TREBLE / WRIST ROLLS)'
        };
        setAutoSwitchNotice(`🤖 OBJETIVO CAMBIADO A: ${modeLabels[targetMode]}`);
        setTimeout(() => setAutoSwitchNotice(null), 2500);
      }
    } else if (autoSwitchMode === 'dominant') {
      let dominant: FrequencyFocusMode = focusMode;
      if (bassLevel > midLevel + 0.12 && bassLevel > trebleLevel + 0.12 && bassLevel > 0.35) {
        dominant = 'graves';
      } else if (midLevel > bassLevel + 0.12 && midLevel > trebleLevel + 0.12 && midLevel > 0.35) {
        dominant = 'medios';
      } else if (trebleLevel > bassLevel + 0.12 && trebleLevel > midLevel + 0.12 && trebleLevel > 0.35) {
        dominant = 'agudos';
      }

      if (dominant !== focusMode) {
        setFocusMode(dominant);
        const modeLabels = {
          graves: 'GRAVES (Pico de Bajos Detectado)',
          medios: 'MEDIOS (Pico Vocal Detectado)',
          agudos: 'AGUDOS (Pico de Hi-Hat Detectado)'
        };
        setAutoSwitchNotice(`⚡ CAMBIO AUTOMÁTICO POR FRECUENCIA: ${modeLabels[dominant]}`);
        setTimeout(() => setAutoSwitchNotice(null), 2500);
      }
    }
  }, [isAutoSwitchActive, isPlaying, currentTime, autoSwitchIntervalSec, autoSwitchMode, bassLevel, midLevel, trebleLevel]);

  // Real-time Beat Tap Assessment
  const handleTapBeat = () => {
    if (!isPlaying) return;
    const bpm = selectedTrack.bpm || 120;
    const beatSec = 60 / bpm;
    const curTime = audioRef.current?.currentTime || currentTime;
    const timeInBeat = curTime % beatSec;
    const halfBeatSec = beatSec / 2;
    const normOffsetSec = timeInBeat > halfBeatSec ? timeInBeat - beatSec : timeInBeat;
    const offsetMs = Math.round(normOffsetSec * 1000);

    let hitLabel = '';
    let pts = 0;
    let status: 'onbeat' | 'atras' | 'adelante' = 'onbeat';

    if (Math.abs(offsetMs) <= 40) {
      hitLabel = `🎯 PERFECT ON BEAT (${offsetMs >= 0 ? `+${offsetMs}` : offsetMs}ms)`;
      pts = 50;
      status = 'onbeat';
      setStreak(s => s + 1);
    } else if (offsetMs < -40) {
      hitLabel = `⏪ ATRÁS (${offsetMs}ms - Groove/Retraso)`;
      pts = 25;
      status = 'atras';
      setStreak(0);
    } else {
      hitLabel = `⏩ ADELANTE (+${offsetMs}ms - Apurado/Early)`;
      pts = 25;
      status = 'adelante';
      setStreak(0);
    }

    const newTap: TapRecord = {
      id: `tap-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestampMs: Date.now(),
      offsetMs,
      status,
      points: pts,
      trackTime: curTime,
      focusMode,
      label: hitLabel
    };

    setTapHistory(prev => [...prev, newTap]);

    setUserTapFeedback(hitLabel);
    setLastHitType(hitLabel);
    setShowHitNotification(true);
    setScore(s => s + pts);
    if (onAddBonusPoints && pts > 0) {
      onAddBonusPoints(pts);
    }

    setTimeout(() => {
      setUserTapFeedback(null);
      setShowHitNotification(false);
    }, 2200);
  };

  // Keyboard shortcut (Spacebar) listener for tapping beats
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target === document.body || (e.target as HTMLElement).tagName === 'BUTTON')) {
        e.preventDefault();
        handleTapBeat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentTime, selectedTrack.bpm]);

  // Webcam Setup
  useEffect(() => {
    if (useWebcam) {
      navigator.mediaDevices?.getUserMedia({ video: { width: 1280, height: 720 }, audio: false })
        .then(stream => {
          webcamStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        })
        .catch(err => {
          console.warn("Webcam access denied or unavailable:", err);
          setUseWebcam(false);
        });
    } else {
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach(track => track.stop());
        webcamStreamRef.current = null;
      }
    }

    return () => {
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [useWebcam]);

  // Handle Play / Pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (!audioContextRef.current) {
      setupWebAudio();
    }

    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn("Playback prevented:", err);
      });
    }
  };

  // Custom File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomAudioUrl(url);
      setCustomFileName(file.name);
      setIsPlaying(false);
      
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.playbackRate = playbackSpeed;
      }
    }
  };

  // Switch Demo Track
  const handleSelectTrack = (track: DemoTrack) => {
    setSelectedTrack(track);
    setCustomAudioUrl(null);
    setCustomFileName(null);
    setIsPlaying(false);
    
    if (audioRef.current) {
      audioRef.current.src = track.audioUrl;
      audioRef.current.playbackRate = playbackSpeed;
    }
  };

  // Handle Speed Change
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  // Main Real-time Visualizer & Frequency Analyzer Loop
  useEffect(() => {
    let lastBeatTime = 0;

    const renderFrame = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animationFrameRef.current = requestAnimationFrame(renderFrame);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationFrameRef.current = requestAnimationFrame(renderFrame);
        return;
      }

      const width = canvas.width;
      const height = canvas.height;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      let bLevel = 0;
      let mLevel = 0;
      let tLevel = 0;

      if (analyserRef.current && isPlaying) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Divide frequencies into 3 bands
        // Bin 0 to 15 (~0-300Hz) = BASS
        // Bin 16 to 80 (~300-3000Hz) = MIDS
        // Bin 81 to 127 (~3000-10000Hz+) = TREBLE
        let bassSum = 0;
        let midSum = 0;
        let trebleSum = 0;

        for (let i = 0; i < 16; i++) bassSum += dataArray[i];
        for (let i = 16; i < 80; i++) midSum += dataArray[i];
        for (let i = 81; i < bufferLength; i++) trebleSum += dataArray[i];

        bLevel = bassSum / (16 * 255);
        mLevel = midSum / (64 * 255);
        tLevel = trebleSum / ((bufferLength - 81) * 255);
      } else if (isPlaying) {
        // Fallback simulation if Analyser isn't connected
        const time = Date.now() / 1000;
        const bpmRate = (selectedTrack.bpm / 60) * Math.PI * 2;
        bLevel = Math.max(0.2, (Math.sin(time * bpmRate) + 1) / 2);
        mLevel = Math.max(0.15, (Math.sin(time * bpmRate * 1.5 + 1) + 1) / 2);
        tLevel = Math.max(0.2, (Math.cos(time * bpmRate * 2.0) + 1) / 2);
      }

      setBassLevel(bLevel);
      setMidLevel(mLevel);
      setTrebleLevel(tLevel);

      // Real-Time Rhythmic Precision Calculation
      if (isPlaying && selectedTrack.bpm > 0) {
        const curTime = audioRef.current?.currentTime || 0;
        const bpm = selectedTrack.bpm;
        const beatSec = 60 / bpm;
        const timeInBeat = curTime % beatSec;
        const halfBeatSec = beatSec / 2;
        const normOffsetSec = timeInBeat > halfBeatSec ? timeInBeat - beatSec : timeInBeat;
        const offsetMs = normOffsetSec * 1000;
        const halfBeatMs = halfBeatSec * 1000;

        setRhythmicOffsetMs(offsetMs);

        // Map offsetMs [-halfBeatMs, +halfBeatMs] to gauge percentage [5%, 95%]
        const rawPct = ((offsetMs + halfBeatMs) / (2 * halfBeatMs)) * 100;
        const clampedPct = Math.min(95, Math.max(5, rawPct));
        setIndicatorPercent(clampedPct);

        if (Math.abs(offsetMs) <= 40) {
          setPrecisionStatus('onbeat');
        } else if (offsetMs < -40) {
          setPrecisionStatus('atras');
        } else {
          setPrecisionStatus('adelante');
        }
      }

      // Render Focus-Specific Real-Time Animations
      const now = Date.now();
      
      // OPTION 1: GRAVES (BASS) ANIMATION -> Pulso Expansivo (Concentric expanding shockwave rings, core bass explosion)
      if (focusMode === 'graves') {
        const activeLevel = bLevel;
        const centerX = width / 2;
        const centerY = height * 0.65; // Grounded center of gravity

        ctx.save();

        // 1. Core Expansive Radial Pulse
        const maxRadius = Math.max(width, height) * 0.7;
        const pulseCount = 5;
        for (let i = 0; i < pulseCount; i++) {
          const phase = ((now / 800) + (i / pulseCount)) % 1;
          const currentRadius = phase * maxRadius * (0.5 + activeLevel * 0.8);
          const opacity = (1 - phase) * (0.2 + activeLevel * 0.8);

          ctx.beginPath();
          ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(233, 195, 73, ${opacity})`;
          ctx.lineWidth = 3 + activeLevel * 10 * (1 - phase);
          ctx.shadowBlur = 20 * activeLevel;
          ctx.shadowColor = '#E9C349';
          ctx.stroke();
        }

        // 2. Central Explosive Bass Core
        const coreRadius = 30 + activeLevel * 110;
        const coreGradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, coreRadius);
        coreGradient.addColorStop(0, `rgba(255, 235, 120, ${0.9 * activeLevel + 0.1})`);
        coreGradient.addColorStop(0.5, `rgba(233, 195, 73, ${0.5 * activeLevel})`);
        coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
        ctx.fillStyle = coreGradient;
        ctx.fill();

        // 3. Floor Shockwave Ellipses
        ctx.strokeStyle = `rgba(245, 158, 11, ${0.3 + activeLevel * 0.7})`;
        ctx.lineWidth = 2 + activeLevel * 4;
        for (let r = 30; r < width * 0.55; r += 50) {
          const pulsedR = r + (now / 10 % 50) + activeLevel * 45;
          ctx.beginPath();
          ctx.ellipse(centerX, height * 0.85, pulsedR, pulsedR * 0.28, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // 4. Equalizer Bass Pillars (Left & Right)
        const barWidth = 14;
        const barCount = 10;
        for (let i = 0; i < barCount; i++) {
          const h = (bLevel * height * 0.45) * (0.6 + Math.sin(i * 1.5 + now / 180) * 0.4);
          ctx.fillStyle = '#E9C349';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#E9C349';
          ctx.fillRect(25 + i * (barWidth + 6), height - h - 25, barWidth, h);
          ctx.fillRect(width - 25 - (i + 1) * (barWidth + 6), height - h - 25, barWidth, h);
        }

        ctx.restore();

        // Beat Trigger for Score
        if (bLevel > 0.65 && now - lastBeatTime > 400) {
          lastBeatTime = now;
          triggerBeatHit('¡PULSO EXPANSIVO DE GRAVE! (Groove a Tierra)', 50);
        }
      }

      // OPTION 2: MEDIOS (MIDS/VOCALS) ANIMATION -> Movimiento Ondulatorio (Sinusoidal fluid wave ribbons)
      else if (focusMode === 'medios') {
        const activeLevel = mLevel;
        const centerY = height * 0.5; // Torso & Chest Level

        ctx.save();

        // Multi-layered Ondulatory Waves
        const waveLayers = [
          { color: '#EC4899', blurColor: '#F472B6', speed: 120, freq: 0.015, ampScale: 1.0, width: 5 },
          { color: '#A855F7', blurColor: '#C084FC', speed: 150, freq: 0.022, ampScale: 0.7, width: 3 },
          { color: '#06B6D4', blurColor: '#38BDF8', speed: 90, freq: 0.010, ampScale: 0.5, width: 2.5 }
        ];

        waveLayers.forEach((layer) => {
          ctx.beginPath();
          ctx.lineWidth = layer.width + activeLevel * 8;
          ctx.strokeStyle = layer.color;
          ctx.shadowBlur = 18 * (0.5 + activeLevel * 0.5);
          ctx.shadowColor = layer.blurColor;

          for (let x = 0; x <= width; x += 6) {
            const timeFactor = now / layer.speed;
            const primaryWave = Math.sin(x * layer.freq + timeFactor);
            const secondaryWave = Math.cos(x * layer.freq * 1.8 - timeFactor * 0.7);
            const amp = (35 + activeLevel * 100) * layer.ampScale;
            const y = centerY + (primaryWave + secondaryWave * 0.5) * amp * (0.8 + Math.sin(x * 0.003) * 0.2);

            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        });

        // Torso/Chest Vocal Expression Isolation Glow
        const gradient = ctx.createRadialGradient(width / 2, centerY, 15, width / 2, centerY, 160 + activeLevel * 120);
        gradient.addColorStop(0, `rgba(236, 72, 153, ${0.45 * activeLevel + 0.05})`);
        gradient.addColorStop(0.6, `rgba(168, 85, 247, ${0.2 * activeLevel})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Undulating Particles Riding the Fluid Wave
        const particleCount = 20;
        for (let p = 0; p < particleCount; p++) {
          const px = ((p * (width / particleCount)) + (now / 3)) % width;
          const py = centerY + Math.sin(px * 0.018 + now / 120) * (30 + activeLevel * 80);
          const size = 3 + activeLevel * 6 + Math.sin(p + now / 200) * 2;

          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fillStyle = p % 2 === 0 ? '#F472B6' : '#E879F9';
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#F472B6';
          ctx.fill();
        }

        ctx.restore();

        if (mLevel > 0.58 && now - lastBeatTime > 450) {
          lastBeatTime = now;
          triggerBeatHit('¡MOVIMIENTO ONDULATORIO VOCAL! (Expresión de Torso)', 60);
        }
      }

      // OPTION 3: AGUDOS (HIGHS/TREBLE) ANIMATION -> Partículas Rápidas Tipo Estática (High-speed static micro-particles & electric spark bursts)
      else if (focusMode === 'agudos') {
        const activeLevel = tLevel;

        ctx.save();

        // 1. High-Density Rapid Micro-Static Jitter Particles
        const baseStaticCount = 40;
        const staticParticleCount = Math.floor(baseStaticCount + activeLevel * 120);

        for (let i = 0; i < staticParticleCount; i++) {
          // Rapid randomized jitter position
          const px = Math.random() * width;
          const py = Math.random() * height;
          const size = Math.random() < 0.2 ? Math.random() * 3 + 2 : Math.random() * 2 + 0.5;
          const opacity = Math.random() * (0.4 + activeLevel * 0.6);

          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          // Neon cyan, electric blue & bright yellow static colors
          const randColor = i % 3 === 0 ? '#06B6D4' : (i % 3 === 1 ? '#38BDF8' : '#FAFD16');
          ctx.fillStyle = randColor;
          ctx.globalAlpha = opacity;
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        // 2. High-Speed Electric Lightning Sparks / Static Rays
        const sparkLinesCount = Math.floor(6 + activeLevel * 18);
        for (let s = 0; s < sparkLinesCount; s++) {
          const startX = Math.random() * width;
          const startY = Math.random() * height;
          const length = 15 + Math.random() * (25 + activeLevel * 60);
          const angle = Math.random() * Math.PI * 2;
          const endX = startX + Math.cos(angle) * length;
          const endY = startY + Math.sin(angle) * length;

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          // Zig-zag static jitter
          const midX = (startX + endX) / 2 + (Math.random() - 0.5) * 12;
          const midY = (startY + endY) / 2 + (Math.random() - 0.5) * 12;
          ctx.lineTo(midX, midY);
          ctx.lineTo(endX, endY);

          ctx.strokeStyle = Math.random() < 0.5 ? '#38BDF8' : '#FAFD16';
          ctx.lineWidth = 1 + activeLevel * 2.5;
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#06B6D4';
          ctx.stroke();
        }

        // 3. Dual Orbital Wrist Nodes with Rotating Speed Rings
        const leftArmX = width * 0.3;
        const rightArmX = width * 0.7;
        const armY = height * 0.4;
        const ringAngle = (now / (120 - activeLevel * 60)) % (Math.PI * 2);

        [leftArmX, rightArmX].forEach((armX, idx) => {
          ctx.strokeStyle = idx === 0 ? '#06B6D4' : '#3B82F6';
          ctx.lineWidth = 2 + activeLevel * 4;
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#38BDF8';

          ctx.beginPath();
          ctx.ellipse(armX, armY, 40 + activeLevel * 50, 18 + activeLevel * 25, ringAngle * (idx === 0 ? 1 : -1), 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = '#FAFD16';
          ctx.beginPath();
          ctx.ellipse(armX, armY, 22 + activeLevel * 30, 36 + activeLevel * 35, -ringAngle * 1.8, 0, Math.PI * 2);
          ctx.stroke();
        });

        // 4. High-Speed Top & Bottom Static Flash Bands
        if (activeLevel > 0.4) {
          ctx.fillStyle = `rgba(6, 182, 212, ${0.1 + activeLevel * 0.4})`;
          ctx.fillRect(0, 0, width, 8 + activeLevel * 20);
          ctx.fillRect(0, height - (8 + activeLevel * 20), width, 8 + activeLevel * 20);
        }

        ctx.restore();

        if (tLevel > 0.55 && now - lastBeatTime > 350) {
          lastBeatTime = now;
          triggerBeatHit('¡ESTÁTICA DE AGUDOS! (Velocidad & Wrist Rolls)', 70);
        }
      }

      animationFrameRef.current = requestAnimationFrame(renderFrame);
    };

    animationFrameRef.current = requestAnimationFrame(renderFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, focusMode, selectedTrack.bpm]);

  // Beat Hit Trigger Function
  const triggerBeatHit = (hitLabel: string, points: number) => {
    setLastHitType(hitLabel);
    setScore(prev => prev + points);
    setStreak(prev => prev + 1);
    setShowHitNotification(true);
    
    if (onAddBonusPoints && streak % 5 === 0) {
      onAddBonusPoints(points);
    }

    setTimeout(() => {
      setShowHitNotification(false);
    }, 1200);
  };

  // Format Seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className={`w-full rounded-3xl border p-4 sm:p-6 shadow-2xl space-y-6 overflow-hidden relative transition-colors ${
      isDark ? 'bg-[#070913] text-white border-[#E9C349]/30' : 'bg-white text-slate-900 border-amber-400/50 shadow-md'
    }`}>
      
      {/* Hidden HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src={customAudioUrl || selectedTrack.audioUrl}
        preload="auto"
        crossOrigin="anonymous"
      />

      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#E9C349]/20 border border-[#E9C349] flex items-center justify-center text-[#E9C349] shrink-0 shadow-lg shadow-[#E9C349]/10">
            <Radio className="w-6 h-6 text-[#E9C349] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[#E9C349] text-black font-mono font-black text-[10px] uppercase tracking-wider">
                WAKAON MUSICALITY LAB
              </span>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30">
                DESGLOSE TRI-FRECUENCIAL
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-mono mt-1">
              Entrenamiento Inteligente de Musicalidad
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
              Visualiza y detecta las notas rítmicas en tiempo real. Selecciona el enfoque de frecuencia para aislar los impulsos de tu cuerpo.
            </p>
          </div>
        </div>

        {/* REAL-TIME SCORE & STREAK BADGE */}
        <div className="flex items-center gap-3 bg-black/60 border border-white/10 p-3 rounded-2xl shrink-0 self-start lg:self-auto">
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Racha Musical</span>
            <span className="text-base font-mono font-black text-[#E9C349] flex items-center justify-end gap-1">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              {streak} hits
            </span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Puntuación</span>
            <span className="text-base font-mono font-black text-cyan-400">{score} PTS</span>
          </div>
        </div>
      </div>

      {/* 3 FREQUENCY FOCUS OPTIONS CARDS (GRAVES / MEDIOS / AGUDOS) */}
      <div className="space-y-3">
        
        {/* AUTOMATIC OBJECTIVE SWITCHER PANEL */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-[#0e1224] border border-[#E9C349]/30 rounded-2xl shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl flex items-center justify-center transition-all ${
              isAutoSwitchActive ? 'bg-[#E9C349] text-black shadow-md shadow-[#E9C349]/20' : 'bg-white/10 text-slate-400'
            }`}>
              <RotateCcw className={`w-4 h-4 ${isAutoSwitchActive ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black text-white uppercase tracking-tight">
                  CAMBIO AUTOMÁTICO DE OBJETIVOS
                </span>
                {isAutoSwitchActive && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold border border-emerald-500/30 animate-pulse">
                    ● ACTIVO
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {isAutoSwitchActive
                  ? autoSwitchMode === 'time'
                    ? `Rotación automática cada ${autoSwitchIntervalSec}s (Graves ➔ Medios ➔ Agudos)`
                    : 'A.I. Detección automática por picos de frecuencia en la música'
                  : 'Sincroniza y cambia el enfoque corporal automáticamente mientras bailas'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {/* Auto Switch Mode Toggle */}
            {isAutoSwitchActive && (
              <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setAutoSwitchMode('time')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    autoSwitchMode === 'time'
                      ? 'bg-[#E9C349] text-black font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⏱️ Por Tiempo
                </button>
                <button
                  type="button"
                  onClick={() => setAutoSwitchMode('dominant')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    autoSwitchMode === 'dominant'
                      ? 'bg-[#E9C349] text-black font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⚡ Detección A.I.
                </button>
              </div>
            )}

            {/* Time Interval Selector */}
            {isAutoSwitchActive && autoSwitchMode === 'time' && (
              <select
                value={autoSwitchIntervalSec}
                onChange={(e) => setAutoSwitchIntervalSec(Number(e.target.value))}
                className="bg-black/80 border border-[#E9C349]/40 text-[#E9C349] font-mono text-[10px] font-bold px-2 py-1.5 rounded-xl focus:outline-none cursor-pointer"
              >
                <option value={4}>4 Segundos (1 Compás)</option>
                <option value={8}>8 Segundos (2 Compases)</option>
                <option value={16}>16 Segundos (4 Compases)</option>
              </select>
            )}

            {/* Activate Auto Switch Toggle Button */}
            <button
              type="button"
              onClick={() => setIsAutoSwitchActive(!isAutoSwitchActive)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 border ${
                isAutoSwitchActive
                  ? 'bg-[#E9C349] text-black border-[#E9C349] font-black shadow-md'
                  : 'bg-white/10 text-slate-300 border-white/20 hover:bg-white/20'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${isAutoSwitchActive ? 'fill-black' : ''}`} />
              <span>{isAutoSwitchActive ? 'Auto-Switch ON' : 'Activar Cambio Automático'}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-[#E9C349]" />
            1. ENFOQUE DE FRECUENCIA Y CUERPO
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {isAutoSwitchActive ? '🤖 Cambiando objetivos automáticamente' : 'Selecciona un objetivo manual o activa Auto-Switch'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          
          {/* OPTION 1: GRAVES */}
          <button
            type="button"
            onClick={() => setFocusMode('graves')}
            className={`relative p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 overflow-hidden ${
              focusMode === 'graves'
                ? 'bg-gradient-to-br from-[#E9C349]/20 via-[#131006] to-black border-[#E9C349] shadow-[0_0_30px_rgba(233,195,73,0.2)]'
                : 'bg-[#0D0F1D] border-white/10 hover:border-white/20 text-slate-300'
            }`}
          >
            {focusMode === 'graves' && (
              <div className="absolute top-0 right-0 px-2.5 py-0.5 bg-[#E9C349] text-black font-mono font-black text-[9px] uppercase rounded-bl-xl">
                ACTIVO
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-xs ${
                  focusMode === 'graves' ? 'bg-[#E9C349] text-black' : 'bg-white/10 text-slate-300'
                }`}>
                  🔊
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase font-mono">1. GRAVES (BASS)</h3>
                  <span className="text-[10px] font-mono text-amber-300 font-bold block">Piso, Pies & Groove</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed mt-2">
                <strong>Enfoque:</strong> Bajos profundos, bombos y pulso a tierra.
              </p>
              <div className="mt-2.5 p-2 bg-black/40 rounded-xl border border-white/5 text-[10px] font-mono text-slate-400 space-y-1">
                <div>👣 <strong>Cuerpo:</strong> Pasos de pies, rebote de cadera, nivel bajo.</div>
                <div>✨ <strong>Animación:</strong> Pulso expansivo concéntrico e impacto a tierra.</div>
              </div>
            </div>
            
            {/* Live Frequency Bar indicator */}
            <div className="w-full bg-black/60 rounded-full h-1.5 overflow-hidden border border-white/10">
              <div 
                className="bg-[#E9C349] h-full transition-all duration-75" 
                style={{ width: `${Math.min(100, bassLevel * 100)}%` }} 
              />
            </div>
          </button>

          {/* OPTION 2: MEDIOS */}
          <button
            type="button"
            onClick={() => setFocusMode('medios')}
            className={`relative p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 overflow-hidden ${
              focusMode === 'medios'
                ? 'bg-gradient-to-br from-pink-500/20 via-[#180913] to-black border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.2)]'
                : 'bg-[#0D0F1D] border-white/10 hover:border-white/20 text-slate-300'
            }`}
          >
            {focusMode === 'medios' && (
              <div className="absolute top-0 right-0 px-2.5 py-0.5 bg-pink-500 text-white font-mono font-black text-[9px] uppercase rounded-bl-xl">
                ACTIVO
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-xs ${
                  focusMode === 'medios' ? 'bg-pink-500 text-white' : 'bg-white/10 text-slate-300'
                }`}>
                  🎤
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase font-mono">2. MEDIOS (VOCALES)</h3>
                  <span className="text-[10px] font-mono text-pink-300 font-bold block">Vocalización & Torso</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed mt-2">
                <strong>Enfoque:</strong> Voz principal del cantante, bronces y melodía.
              </p>
              <div className="mt-2.5 p-2 bg-black/40 rounded-xl border border-white/5 text-[10px] font-mono text-slate-400 space-y-1">
                <div>🫁 <strong>Cuerpo:</strong> Pecho, contracción de torso, drama facial.</div>
                <div>✨ <strong>Animación:</strong> Movimiento ondulatorio de ondas fluidas.</div>
              </div>
            </div>

            {/* Live Frequency Bar indicator */}
            <div className="w-full bg-black/60 rounded-full h-1.5 overflow-hidden border border-white/10">
              <div 
                className="bg-pink-500 h-full transition-all duration-75" 
                style={{ width: `${Math.min(100, midLevel * 100)}%` }} 
              />
            </div>
          </button>

          {/* OPTION 3: AGUDOS */}
          <button
            type="button"
            onClick={() => setFocusMode('agudos')}
            className={`relative p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 overflow-hidden ${
              focusMode === 'agudos'
                ? 'bg-gradient-to-br from-cyan-500/20 via-[#07131a] to-black border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.2)]'
                : 'bg-[#0D0F1D] border-white/10 hover:border-white/20 text-slate-300'
            }`}
          >
            {focusMode === 'agudos' && (
              <div className="absolute top-0 right-0 px-2.5 py-0.5 bg-cyan-400 text-black font-mono font-black text-[9px] uppercase rounded-bl-xl">
                ACTIVO
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-xs ${
                  focusMode === 'agudos' ? 'bg-cyan-400 text-black' : 'bg-white/10 text-slate-300'
                }`}>
                  ⚡
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase font-mono">3. AGUDOS (TREBLE)</h3>
                  <span className="text-[10px] font-mono text-cyan-300 font-bold block">Brazos & Wrist Rolls</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed mt-2">
                <strong>Enfoque:</strong> Hi-hats, violines velóces y sintes agudos.
              </p>
              <div className="mt-2.5 p-2 bg-black/40 rounded-xl border border-white/5 text-[10px] font-mono text-slate-400 space-y-1">
                <div>💪 <strong>Cuerpo:</strong> Giros de muñeca (rolls), puntas de dedos, velocidad.</div>
                <div>✨ <strong>Animación:</strong> Partículas rápidas tipo estática y chispas.</div>
              </div>
            </div>

            {/* Live Frequency Bar indicator */}
            <div className="w-full bg-black/60 rounded-full h-1.5 overflow-hidden border border-white/10">
              <div 
                className="bg-cyan-400 h-full transition-all duration-75" 
                style={{ width: `${Math.min(100, trebleLevel * 100)}%` }} 
              />
            </div>
          </button>

        </div>
      </div>

      {/* MAIN VISUALIZATION STAGE & WEBCAM OVERLAY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* CANVAS STAGE (8 COLS) */}
        <div className="lg:col-span-8 bg-[#03050B] border border-white/15 rounded-3xl p-3 sm:p-4 relative min-h-[380px] flex flex-col justify-between overflow-hidden group">
          
          {/* WEBCAM FEED (OPTIONAL BACKGROUND) */}
          {useWebcam && (
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover rounded-3xl opacity-40 scale-x-[-1]"
              playsInline
              muted
            />
          )}

          {/* DYNAMIC REAL-TIME ANIMATION CANVAS */}
          <canvas
            ref={canvasRef}
            width={800}
            height={420}
            className="absolute inset-0 w-full h-full rounded-3xl pointer-events-none z-10"
          />

          {/* HIT NOTIFICATION & AUTO-SWITCH TOAST OVERLAYS */}
          <AnimatePresence>
            {autoSwitchNotice && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -20 }}
                className="absolute top-16 left-1/2 -translate-x-1/2 z-40 px-5 py-2.5 rounded-2xl bg-[#0e1224]/90 backdrop-blur-md border border-[#E9C349] text-[#E9C349] font-mono font-black text-xs uppercase shadow-[0_0_30px_rgba(233,195,73,0.3)] flex items-center gap-2.5 pointer-events-none"
              >
                <Zap className="w-4 h-4 text-[#E9C349] animate-bounce fill-[#E9C349]" />
                <span>{autoSwitchNotice}</span>
              </motion.div>
            )}

            {showHitNotification && lastHitType && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                className="absolute top-6 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-2xl bg-black/80 backdrop-blur-md border border-[#E9C349] text-[#E9C349] font-mono font-black text-xs uppercase shadow-2xl flex items-center gap-2 pointer-events-none"
              >
                <Sparkles className="w-4 h-4 text-[#E9C349] animate-spin" />
                <span>{lastHitType}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TOP OVERLAY HUD INFO */}
          <div className="relative z-20 flex items-center justify-between gap-2 flex-wrap bg-black/60 backdrop-blur-md p-2.5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              <span className="text-xs font-mono font-bold uppercase text-white">
                {isPlaying ? 'ANALIZANDO RITMO EN TIEMPO REAL' : 'PAUSADO'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-slate-300">
                TEMPO: <strong className="text-[#E9C349]">{selectedTrack.bpm} BPM</strong>
              </span>

              {/* WEBCAM TOGGLE BUTTON */}
              <button
                type="button"
                onClick={() => setUseWebcam(!useWebcam)}
                className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                  useWebcam 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                {useWebcam ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5" />}
                <span>{useWebcam ? 'Cámara Activa' : 'Activar Espejo'}</span>
              </button>
            </div>
          </div>

          {/* CENTER GUIDE INSTRUCTION WHEN PAUSABLE */}
          {!isPlaying && (
            <div className="relative z-20 my-auto text-center p-6 space-y-3 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-full bg-[#E9C349]/20 border border-[#E9C349] flex items-center justify-center text-[#E9C349] mx-auto shadow-xl">
                <Play className="w-7 h-7 ml-1 text-[#E9C349]" />
              </div>
              <h3 className="text-base font-mono font-black text-white uppercase">
                Presiona Play para Iniciar la Animación Rítmica
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                El motor analiza la frecuencia de {focusMode.toUpperCase()} y proyectará la animación para que bailes al compás exacto.
              </p>
              <button
                type="button"
                onClick={togglePlay}
                className="px-6 py-2.5 rounded-2xl bg-[#E9C349] hover:bg-[#ffdf6b] text-black font-mono font-black text-xs uppercase shadow-xl transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>INICIAR PRACTICA DE RITMO</span>
              </button>
            </div>
          )}

          {/* BARRA DE PRECISIÓN RÍTMICA EN TIEMPO REAL (REAL-TIME RHYTHMIC PRECISION BAR HUD) */}
          <div className="relative z-20 my-2 p-3 bg-black/80 backdrop-blur-md rounded-2xl border border-white/15 shadow-2xl space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold flex-wrap gap-1">
              <span className="flex items-center gap-1.5 text-slate-200">
                <Activity className="w-3.5 h-3.5 text-[#E9C349] animate-pulse" />
                BARRA DE PRECISIÓN RÍTMICA EN TIEMPO REAL
              </span>
              
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase border transition-all duration-150 ${
                  precisionStatus === 'onbeat'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : precisionStatus === 'atras'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                }`}>
                  {precisionStatus === 'onbeat' && '🎯 ON BEAT (TIEMPO EXACTO)'}
                  {precisionStatus === 'atras' && '⏪ ATRÁS (GROOVE / RETRASO)'}
                  {precisionStatus === 'adelante' && '⏩ ADELANTE (EARLY / APURADO)'}
                </span>
              </div>
            </div>

            {/* Visual Precision Gauge Bar Track */}
            <div className="relative h-5 w-full bg-black/90 rounded-full overflow-hidden border border-white/15 flex items-center shadow-inner">
              {/* Zone 1: ATRÁS (Amber / Orange) */}
              <div className="w-[40%] h-full bg-amber-500/25 border-r border-amber-500/40 flex items-center justify-start pl-2.5">
                <span className="text-[9px] font-mono font-extrabold text-amber-400/80 uppercase tracking-tighter">
                  ◄ ATRÁS (-ms)
                </span>
              </div>

              {/* Zone 2: ON BEAT (Emerald Green) */}
              <div className="w-[20%] h-full bg-emerald-500/35 border-x-2 border-emerald-400 flex items-center justify-center shadow-[inset_0_0_10px_rgba(16,185,129,0.4)]">
                <span className="text-[9px] font-mono font-black text-emerald-300 uppercase tracking-tight drop-shadow">
                  ★ ON BEAT
                </span>
              </div>

              {/* Zone 3: ADELANTE (Cyan / Blue) */}
              <div className="w-[40%] h-full bg-cyan-500/25 border-l border-cyan-500/40 flex items-center justify-end pr-2.5">
                <span className="text-[9px] font-mono font-extrabold text-cyan-400/80 uppercase tracking-tighter">
                  ADELANTE (+ms) ►
                </span>
              </div>

              {/* Sliding Real-time Needle Pointer */}
              <div 
                className={`absolute top-0 bottom-0 w-3 rounded-full shadow-2xl transition-all duration-75 -translate-x-1/2 border-2 border-white z-20 ${
                  precisionStatus === 'onbeat'
                    ? 'bg-emerald-400 shadow-[0_0_15px_#10B981] scale-y-125'
                    : precisionStatus === 'atras'
                      ? 'bg-amber-400 shadow-[0_0_15px_#F59E0B]'
                      : 'bg-cyan-400 shadow-[0_0_15px_#06B6D4]'
                }`}
                style={{ left: `${indicatorPercent}%` }}
              />
            </div>

            {/* Real-time status sub-row & Tap Button */}
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span>Desfase: <strong className={
                  precisionStatus === 'onbeat' ? 'text-emerald-400 font-bold' : precisionStatus === 'atras' ? 'text-amber-400 font-bold' : 'text-cyan-400 font-bold'
                }>{Math.round(rhythmicOffsetMs)} ms</strong></span>
                {userTapFeedback && (
                  <span className="text-white font-black bg-white/10 px-2 py-0.5 rounded-md animate-pulse">
                    {userTapFeedback}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleTapBeat}
                className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#E9C349] to-amber-500 hover:brightness-110 text-black font-mono font-black text-[10px] uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95"
              >
                <Activity className="w-3.5 h-3.5 fill-black" />
                <span>TOCAR / MARCAR BEAT [ESPACIO]</span>
              </button>
            </div>

            {/* Quick Export Toolbar Row */}
            <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[10px] font-mono flex-wrap gap-2">
              <span className="text-slate-400 flex items-center gap-1">
                <Download className="w-3.5 h-3.5 text-[#E9C349]" />
                REGISTRO EXTERNO DE PRECISIÓN:
              </span>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={exportSessionPDF}
                  title="Descargar Informe de Precisión en PDF"
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
                >
                  <FileText className="w-3 h-3 text-emerald-400" />
                  <span>DESCARGAR PDF</span>
                </button>

                <button
                  type="button"
                  onClick={exportSessionJSON}
                  title="Descargar Datos JSON de la Sesión"
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
                >
                  <FileJson className="w-3 h-3 text-amber-400" />
                  <span>EXPORTAR JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSessionModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
                >
                  <BarChart2 className="w-3 h-3 text-[#E9C349]" />
                  <span>VER RESUMEN ({tapHistory.length})</span>
                </button>
              </div>
            </div>
          </div>

          {/* BOTTOM AUDIO PLAYER CONTROLS */}
          <div className="relative z-20 mt-auto pt-4 border-t border-white/10 space-y-3 bg-black/70 backdrop-blur-md p-3 rounded-2xl">
            
            {/* TIMELINE PROGRESS BAR */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-slate-400 w-9">{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setCurrentTime(val);
                  if (audioRef.current) audioRef.current.currentTime = val;
                }}
                className="flex-1 accent-[#E9C349] h-1.5 bg-white/20 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-mono text-slate-400 w-9">{formatTime(duration)}</span>
            </div>

            {/* PLAY / SPEED / SOLO CONTROLS */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-xl bg-[#E9C349] text-black font-bold flex items-center justify-center hover:scale-105 transition-all cursor-pointer shadow-md"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 ml-0.5 fill-black" />}
                </button>

                <div>
                  <div className="text-xs font-mono font-bold text-white truncate max-w-[180px]">
                    {customFileName || selectedTrack.title}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 truncate max-w-[180px]">
                    {customFileName ? 'Música Personalizada' : selectedTrack.artist}
                  </div>
                </div>
              </div>

              {/* SPEED MULTIPLIER BUTTONS */}
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                <span className="text-[10px] font-mono text-slate-400 px-1.5 hidden sm:inline">Velocidad:</span>
                {[0.5, 0.75, 1.0, 1.25].map(speed => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => handleSpeedChange(speed)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-all ${
                      playbackSpeed === speed
                        ? 'bg-[#E9C349] text-black'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              {/* FREQUENCY ISOLATION SOLO TOGGLE */}
              <button
                type="button"
                onClick={() => setIsFrequencySolo(!isFrequencySolo)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isFrequencySolo 
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-lg' 
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                }`}
                title="Aísla el canal de audio para escuchar únicamente la frecuencia seleccionada"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>Solo Frecuencia {isFrequencySolo ? '(ON)' : '(OFF)'}</span>
              </button>

            </div>

          </div>

        </div>

        {/* SIDEBAR: TRACK SELECTION & MUSIC UPLOADER (4 COLS) */}
        <div className="lg:col-span-4 bg-[#0D0F1D] border border-white/10 rounded-3xl p-4 flex flex-col justify-between space-y-4">
          
          <div className="space-y-4">
            
            {/* SECTION TITLE */}
            <div className="border-b border-white/10 pb-2">
              <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                <Music className="w-4 h-4 text-[#E9C349]" />
                2. PISTA O MÚSICA SUBIDA
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Sube tu audio o selecciona un demo de Waacking</p>
            </div>

            {/* UPLOAD CUSTOM FILE DROPZONE */}
            <div className="relative border-2 border-dashed border-[#E9C349]/40 hover:border-[#E9C349] bg-black/40 p-4 rounded-2xl text-center transition-all group cursor-pointer">
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <Upload className="w-6 h-6 text-[#E9C349] mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-mono font-bold text-white uppercase">
                {customFileName ? 'Audio Cargado Exitosamente' : 'Subir Tu Música (.mp3 / .wav)'}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                {customFileName ? customFileName : 'Haz clic o arrastra tu canción para practicar'}
              </div>
            </div>

            {/* DEMO TRACKS LIST */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                Pistas Oficiales de Práctica:
              </span>

              {DEMO_TRACKS.map(track => {
                const isSelected = selectedTrack.id === track.id && !customAudioUrl;
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => handleSelectTrack(track)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-[#E9C349]/15 border-[#E9C349] text-white shadow-md'
                        : 'bg-black/30 border-white/5 hover:border-white/20 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#E9C349] text-black' : 'bg-white/10 text-slate-400'
                      }`}>
                        <Disc className={`w-4 h-4 ${isSelected && isPlaying ? 'animate-spin' : ''}`} />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-mono font-bold text-white truncate">{track.title}</div>
                        <div className="text-[10px] font-mono text-slate-400 truncate">{track.genre} • {track.bpm} BPM</div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-[#E9C349] font-bold shrink-0">
                      {isSelected ? 'SELECCIONADO' : 'USAR'}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>

          {/* DANCE GUIDANCE TIPS PER FREQUENCY */}
          <div className="p-3.5 bg-black/60 border border-white/10 rounded-2xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#E9C349] uppercase">
              <Info className="w-4 h-4" />
              <span>GUÍA SOMÁTICA WAACKING</span>
            </div>

            {focusMode === 'graves' && (
              <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                💡 <strong>Consejo de Graves:</strong> Mantén las rodillas ligeramente flectadas en los bajantes rítmicos. Siente el peso del piso para darle estabilidad a tus brazos.
              </p>
            )}

            {focusMode === 'medios' && (
              <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                💡 <strong>Consejo de Medios:</strong> Conecta tu mirada y tu gesticulación facial con las notas vocales sostenidas. Abre el tórax para proyectar drama.
              </p>
            )}

            {focusMode === 'agudos' && (
              <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                💡 <strong>Consejo de Agudos:</strong> Mantén los codos como eje de rotación fija. Ejecuta los <em>wrist rolls</em> acelerados sin tensar los hombros.
              </p>
            )}
          </div>

        </div>

      </div>

      {/* SESSION PRECISION SUMMARY MODAL OVERLAY */}
      <AnimatePresence>
        {showSessionModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#0b0e1b] border border-[#E9C349]/40 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl relative text-white font-sans"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#E9C349]/20 border border-[#E9C349] flex items-center justify-center text-[#E9C349]">
                    <BarChart2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-mono font-black text-[#E9C349] uppercase tracking-wide">
                      RESUMEN DE PRECISIÓN RÍTMICA DE LA SESIÓN
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Pista: <span className="text-slate-200 font-bold">{selectedTrack.title}</span> ({selectedTrack.bpm} BPM)
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSessionModal(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Metrics Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Exactitud On Beat</span>
                  <div className="text-2xl font-mono font-black text-emerald-400 mt-1">
                    {tapHistory.length > 0 ? Math.round((tapHistory.filter(t => t.status === 'onbeat').length / tapHistory.length) * 100) : 0}%
                  </div>
                </div>

                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Puntaje Total</span>
                  <div className="text-2xl font-mono font-black text-[#E9C349] mt-1">
                    {score}
                  </div>
                </div>

                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Mejor Racha</span>
                  <div className="text-2xl font-mono font-black text-[#E9C349] mt-1">
                    🔥 {streak}
                  </div>
                </div>

                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Desfase Promedio</span>
                  <div className="text-2xl font-mono font-black text-cyan-400 mt-1">
                    {tapHistory.length > 0 ? Math.round(tapHistory.reduce((a, b) => a + b.offsetMs, 0) / tapHistory.length) : 0} ms
                  </div>
                </div>
              </div>

              {/* Breakdown Bar */}
              <div className="space-y-2 p-4 bg-white/5 rounded-2xl border border-white/10">
                <h4 className="text-xs font-mono font-bold text-slate-200 uppercase flex items-center justify-between">
                  <span>Desglose de Taps / Marcas Rítmicas</span>
                  <span className="text-slate-400">{tapHistory.length} registros</span>
                </h4>

                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    <span className="block text-[10px] text-emerald-400/80">ON BEAT</span>
                    <strong className="text-base font-black">
                      {tapHistory.filter(t => t.status === 'onbeat').length}
                    </strong>
                  </div>

                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
                    <span className="block text-[10px] text-amber-400/80">ATRÁS (GROOVE)</span>
                    <strong className="text-base font-black">
                      {tapHistory.filter(t => t.status === 'atras').length}
                    </strong>
                  </div>

                  <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                    <span className="block text-[10px] text-cyan-400/80">ADELANTE (EARLY)</span>
                    <strong className="text-base font-black">
                      {tapHistory.filter(t => t.status === 'adelante').length}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Download / Export Options Row */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={exportSessionPDF}
                  className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#E9C349] to-amber-500 hover:brightness-110 text-black font-mono font-black text-xs uppercase shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <FileText className="w-4 h-4 fill-black" />
                  <span>DESCARGAR REPORTE PDF</span>
                </button>

                <button
                  type="button"
                  onClick={exportSessionJSON}
                  className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono font-bold text-xs uppercase transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <FileJson className="w-4 h-4 text-[#E9C349]" />
                  <span>DESCARGAR DATOS JSON</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default SmartMusicalityTrainer;
