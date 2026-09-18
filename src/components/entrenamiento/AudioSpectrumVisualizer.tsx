import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Upload,
  BarChart2,
  Disc,
  Radio,
  Sparkles,
  Zap,
  Maximize2,
  Minimize2,
  Sliders,
  Flame,
  Music,
  Info,
  Clock,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Cell, 
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';

export type AudioSourceType = 'mic' | 'synth' | 'metronome' | 'file';
export type VisualizerMode = 'bars' | 'recharts' | 'radial' | 'waveform' | 'meter';
export type ColorTheme = 'waack-gold' | 'cyber-neon' | 'fire-ruby' | 'matrix-green';

export interface AudioSpectrumVisualizerProps {
  className?: string;
  autoStartMic?: boolean;
  bpm?: number;
  onBpmChange?: (bpm: number) => void;
  selectedTrackTitle?: string;
  theme?: 'dark' | 'light';
}

interface RechartsFrequencyData {
  name: string;
  hz: string;
  nivel: number;
  peak: number;
  category: 'bass' | 'mids' | 'highs';
  fill: string;
}

const FREQUENCY_BANDS_CONFIG = [
  { name: 'Sub-Bass', hz: '20-60Hz', cat: 'bass' as const },
  { name: 'Bass Punch', hz: '60-120Hz', cat: 'bass' as const },
  { name: 'Low Mid', hz: '120-250Hz', cat: 'bass' as const },
  { name: 'Mids 1', hz: '250-500Hz', cat: 'mids' as const },
  { name: 'Mids 2', hz: '500-1kHz', cat: 'mids' as const },
  { name: 'Vocals', hz: '1k-2kHz', cat: 'mids' as const },
  { name: 'High Mids', hz: '2k-4kHz', cat: 'highs' as const },
  { name: 'Presence', hz: '4k-8kHz', cat: 'highs' as const },
  { name: 'Hi-Hats', hz: '8k-12kHz', cat: 'highs' as const },
  { name: 'Air / Shimmer', hz: '12k-16kHz', cat: 'highs' as const },
];

export const AudioSpectrumVisualizer: React.FC<AudioSpectrumVisualizerProps> = ({
  className = '',
  autoStartMic = false,
  bpm: initialBpmProp = 120,
  onBpmChange,
  selectedTrackTitle,
  theme
}) => {
  const isDark = theme ? theme === 'dark' : document.documentElement.classList.contains('dark');
  // Source & Mode States
  const [sourceType, setSourceType] = useState<AudioSourceType>('metronome');
  const [visualMode, setVisualMode] = useState<VisualizerMode>('recharts');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('waack-gold');
  const [isLive, setIsLive] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Tempo & Metronome States
  const [bpm, setBpm] = useState<number>(initialBpmProp);
  const [activeBeat, setActiveBeat] = useState<number>(1);
  const [beatPulse, setBeatPulse] = useState<boolean>(false);

  // Tap Tempo State
  const tapTimesRef = useRef<number[]>([]);
  const [tapNotice, setTapNotice] = useState<string | null>(null);

  // Audio Controls
  const [sensitivity, setSensitivity] = useState<number>(1.2);
  const [smoothing, setSmoothing] = useState<number>(0.8);
  const [audioFileName, setAudioFileName] = useState<string | null>(selectedTrackTitle || null);

  // Real-time Energy Metrics
  const [bassEnergy, setBassEnergy] = useState<number>(0);
  const [midEnergy, setMidEnergy] = useState<number>(0);
  const [highEnergy, setHighEnergy] = useState<number>(0);
  const [peakDb, setPeakDb] = useState<number>(-60);

  // Recharts Chart Live Data
  const [rechartsData, setRechartsData] = useState<RechartsFrequencyData[]>(() =>
    FREQUENCY_BANDS_CONFIG.map(band => ({
      name: band.name,
      hz: band.hz,
      nivel: 10 + Math.floor(Math.random() * 20),
      peak: 30,
      category: band.cat,
      fill: '#D9A9FF'
    }))
  );

  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const peaksRef = useRef<number[]>(new Array(64).fill(0));

  // Sync prop bpm with internal bpm state
  useEffect(() => {
    if (initialBpmProp && initialBpmProp !== bpm) {
      setBpm(initialBpmProp);
    }
  }, [initialBpmProp]);

  const updateBpm = (newBpm: number) => {
    const clamped = Math.max(60, Math.min(220, newBpm));
    setBpm(clamped);
    if (onBpmChange) onBpmChange(clamped);
  };

  // Initialize Web Audio Context
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Setup Analyser Node
  const setupAnalyser = useCallback(() => {
    const ctx = getAudioContext();
    if (!analyserRef.current) {
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256; // 128 frequency bins
      analyser.smoothingTimeConstant = smoothing;
      analyserRef.current = analyser;
    } else {
      analyserRef.current.smoothingTimeConstant = smoothing;
    }
    return analyserRef.current;
  }, [getAudioContext, smoothing]);

  // Stop All Audio Sources
  const stopAudio = useCallback(() => {
    setIsLive(false);

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current as number);
      timerIntervalRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }

    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
      } catch (e) {
        // ignore disconnect
      }
      sourceNodeRef.current = null;
    }

    setBassEnergy(0);
    setMidEnergy(0);
    setHighEnergy(0);
    setPeakDb(-60);
    setActiveBeat(1);
    setBeatPulse(false);
  }, []);

  // Theme Colors
  const getThemeColors = useCallback(() => {
    switch (colorTheme) {
      case 'cyber-neon':
        return {
          barStart: '#00F0FF',
          barMid: '#7000FF',
          barEnd: '#FF007A',
          bgGlow: 'rgba(0,240,255,0.15)',
          text: '#00F0FF'
        };
      case 'fire-ruby':
        return {
          barStart: '#FF4500',
          barMid: '#C23E9E',
          barEnd: '#E9B8FF',
          bgGlow: 'rgba(194, 62, 158,0.2)',
          text: '#FF4500'
        };
      case 'matrix-green':
        return {
          barStart: '#00FF66',
          barMid: '#009933',
          barEnd: '#CCFF00',
          bgGlow: 'rgba(0,255,102,0.15)',
          text: '#00FF66'
        };
      case 'waack-gold':
      default:
        return {
          barStart: '#C23E9E',
          barMid: '#D9A9FF',
          barEnd: '#FFF5C0',
          bgGlow: 'rgba(217, 169, 255,0.15)',
          text: '#D9A9FF'
        };
    }
  }, [colorTheme]);

  // Start Metronome Mode with Web Audio Synthesizer Beeps & Visual Pulse
  const startMetronomeMode = useCallback(() => {
    stopAudio();
    const ctx = getAudioContext();
    const analyser = setupAnalyser();

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(analyser);
    analyser.connect(ctx.destination);

    let currentBeatCount = 1;
    const intervalMs = (60 / bpm) * 1000;

    const playBeat = () => {
      const t = ctx.currentTime;
      const isAccent = currentBeatCount === 1;

      // Web Audio Oscillator
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isAccent ? 960 : 580, t);

      gain.gain.setValueAtTime(isAccent ? 0.8 : 0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (isAccent ? 0.12 : 0.08));

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(t);
      osc.stop(t + (isAccent ? 0.12 : 0.08));

      // Visual Beat Trigger
      setActiveBeat(currentBeatCount);
      setBeatPulse(true);
      setTimeout(() => setBeatPulse(false), 120);

      currentBeatCount = currentBeatCount >= 8 ? 1 : currentBeatCount + 1;
    };

    playBeat();
    timerIntervalRef.current = setInterval(playBeat, intervalMs);

    setIsLive(true);
    setSourceType('metronome');
  }, [bpm, getAudioContext, setupAnalyser, stopAudio]);

  // Start Synth Beat Loop (Disco Funk Groove)
  const startSynthLoop = useCallback(() => {
    stopAudio();
    const ctx = getAudioContext();
    const analyser = setupAnalyser();

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(analyser);
    analyser.connect(ctx.destination);

    let step = 0;
    const secondsPerBeat = 60 / bpm;

    const playBeatStep = () => {
      const t = ctx.currentTime;
      const barStep = step % 8;
      const currentCount = barStep + 1;

      // Kick on 1 and 5
      if (barStep === 0 || barStep === 4) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, t);
        osc.frequency.exponentialRampToValueAtTime(35, t + 0.14);
        gain.gain.setValueAtTime(0.9, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(t);
        osc.stop(t + 0.15);
      }

      // Snare on 3 and 7
      if (barStep === 2 || barStep === 6) {
        const bufferSize = ctx.sampleRate * 0.1;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        noise.start(t);
        noise.stop(t + 0.12);
      }

      // Disco Bass Synth
      const bassNotes = [110, 110, 146.8, 130.8, 164.8, 146.8, 123.4, 110];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(bassNotes[barStep], t);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.exponentialRampToValueAtTime(200, t + 0.14);
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      osc.start(t);
      osc.stop(t + 0.15);

      setActiveBeat(currentCount);
      setBeatPulse(true);
      setTimeout(() => setBeatPulse(false), 120);

      step++;
    };

    playBeatStep();
    timerIntervalRef.current = setInterval(playBeatStep, (secondsPerBeat / 2) * 1000);

    setIsLive(true);
    setSourceType('synth');
  }, [bpm, getAudioContext, setupAnalyser, stopAudio]);

  // Start Microphone Input
  const startMic = useCallback(async () => {
    stopAudio();
    try {
      const ctx = getAudioContext();
      const analyser = setupAnalyser();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });
      mediaStreamRef.current = stream;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceNodeRef.current = source;

      setIsLive(true);
      setSourceType('mic');
    } catch (err) {
      console.error('Microphone access denied or error:', err);
      alert('No se pudo acceder al micrófono. Asegúrate de otorgar permisos en el navegador.');
    }
  }, [getAudioContext, setupAnalyser, stopAudio]);

  // Handle Local File Upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    stopAudio();
    const ctx = getAudioContext();
    const analyser = setupAnalyser();

    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.loop = true;
    audioElementRef.current = audio;

    const source = ctx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(ctx.destination);
    sourceNodeRef.current = source;

    audio.play().then(() => {
      setIsLive(true);
      setSourceType('file');
      setAudioFileName(file.name);
    }).catch(err => {
      console.error('Error playing audio file:', err);
    });
  }, [getAudioContext, setupAnalyser, stopAudio]);

  // Tap Tempo Handler
  const handleTapTempo = () => {
    const now = Date.now();
    const times = tapTimesRef.current;

    // Reset if last tap was more than 2 seconds ago
    if (times.length > 0 && now - times[times.length - 1] > 2000) {
      times.length = 0;
    }

    times.push(now);

    if (times.length > 1) {
      const intervals = [];
      for (let i = 1; i < times.length; i++) {
        intervals.push(times[i] - times[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);

      if (calculatedBpm >= 60 && calculatedBpm <= 220) {
        updateBpm(calculatedBpm);
        setTapNotice(`🎯 BPM Detectado: ${calculatedBpm} BPM`);
        setTimeout(() => setTapNotice(null), 2000);
      }
    } else {
      setTapNotice('Sigue tocando para calcular el tempo...');
    }
  };

  // Main Canvas and Recharts Real-Time Frame Loop
  useEffect(() => {
    if (!isLive) return;

    const analyser = analyserRef.current;
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount; // 128
    const freqData = new Uint8Array(bufferLength);
    const waveData = new Uint8Array(bufferLength);

    const render = () => {
      analyser.getByteFrequencyData(freqData);
      analyser.getByteTimeDomainData(waveData);

      // Energy calculation
      let bassSum = 0;
      let midSum = 0;
      let highSum = 0;
      let totalSum = 0;

      for (let i = 0; i < bufferLength; i++) {
        const val = freqData[i] * sensitivity;
        totalSum += val;
        if (i < 12) bassSum += val;
        else if (i < 48) midSum += val;
        else highSum += val;
      }

      const bassAvg = Math.min(100, Math.round((bassSum / 12 / 255) * 100));
      const midAvg = Math.min(100, Math.round((midSum / 36 / 255) * 100));
      const highAvg = Math.min(100, Math.round((highSum / 80 / 255) * 100));
      const dbVal = Math.max(-60, Math.round(20 * Math.log10((totalSum / bufferLength / 255) || 0.001)));

      setBassEnergy(bassAvg);
      setMidEnergy(midAvg);
      setHighEnergy(highAvg);
      setPeakDb(dbVal);

      const colors = getThemeColors();

      // UPDATE RECHARTS DATA
      setRechartsData(prev =>
        prev.map((item, idx) => {
          const stepSize = Math.floor(bufferLength / FREQUENCY_BANDS_CONFIG.length);
          const startBin = idx * stepSize;
          let sum = 0;
          for (let b = startBin; b < startBin + stepSize; b++) {
            sum += freqData[b] || 0;
          }
          const rawVal = Math.min(100, Math.round(((sum / stepSize) / 255) * 100 * sensitivity));

          const currentPeak = Math.max(rawVal, Math.max(0, item.peak - 2));
          let fillColor = colors.barMid;
          if (item.category === 'bass') fillColor = colors.barStart;
          if (item.category === 'highs') fillColor = colors.barEnd;

          return {
            ...item,
            nivel: rawVal,
            peak: currentPeak,
            fill: fillColor
          };
        })
      );

      // CANVAS DRAWING (When Canvas ref exists and mode requires Canvas)
      const canvas = canvasRef.current;
      if (canvas && visualMode !== 'recharts') {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = canvas.clientWidth;
          const height = canvas.clientHeight;
          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
          }

          ctx.clearRect(0, 0, width, height);

          // Subtle background grid
          ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.07)';
          ctx.lineWidth = 1;
          for (let x = 0; x < width; x += 24) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
          }
          for (let y = 0; y < height; y += 24) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
          }

          // MODE: BARS
          if (visualMode === 'bars') {
            const barCount = 40;
            const barWidth = (width / barCount) - 3;
            const gradient = ctx.createLinearGradient(0, height, 0, 0);
            gradient.addColorStop(0, colors.barStart);
            gradient.addColorStop(0.6, colors.barMid);
            gradient.addColorStop(1, colors.barEnd);

            ctx.fillStyle = gradient;

            for (let i = 0; i < barCount; i++) {
              const index = Math.floor(i * (bufferLength / barCount));
              const val = Math.min(height, (freqData[index] / 255) * height * sensitivity);
              const x = i * (barWidth + 3) + 2;
              const y = height - val;

              if (val > (peaksRef.current[i] || 0)) {
                peaksRef.current[i] = val;
              } else {
                peaksRef.current[i] = Math.max(0, (peaksRef.current[i] || 0) - 2.5);
              }

              ctx.beginPath();
              ctx.roundRect(x, y, barWidth, val, [4, 4, 0, 0]);
              ctx.fill();

              const peakY = height - peaksRef.current[i];
              ctx.fillStyle = colors.text;
              ctx.fillRect(x, peakY - 3, barWidth, 2);
              ctx.fillStyle = gradient;
            }
          }

          // MODE: RADIAL
          else if (visualMode === 'radial') {
            const centerX = width / 2;
            const centerY = height / 2;
            const radius = Math.min(width, height) * 0.22;
            const numRays = 64;

            const coreGradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, radius);
            coreGradient.addColorStop(0, colors.barMid);
            coreGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = coreGradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius + (bassAvg * 0.35), 0, Math.PI * 2);
            ctx.fill();

            for (let i = 0; i < numRays; i++) {
              const index = Math.floor(i * (bufferLength / numRays));
              const val = (freqData[index] / 255) * (radius * 1.4) * sensitivity;
              const angle = (i / numRays) * Math.PI * 2;

              const x1 = centerX + Math.cos(angle) * radius;
              const y1 = centerY + Math.sin(angle) * radius;
              const x2 = centerX + Math.cos(angle) * (radius + val);
              const y2 = centerY + Math.sin(angle) * (radius + val);

              ctx.strokeStyle = i % 2 === 0 ? colors.barMid : colors.barStart;
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
              ctx.stroke();
            }
          }

          // MODE: WAVEFORM
          else if (visualMode === 'waveform') {
            ctx.lineWidth = 3;
            ctx.strokeStyle = colors.barMid;
            ctx.shadowColor = colors.text;
            ctx.shadowBlur = 12;

            ctx.beginPath();
            const sliceWidth = width / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
              const v = waveData[i] / 128.0;
              const y = (v * height) / 2;

              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);

              x += sliceWidth;
            }
            ctx.lineTo(width, height / 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
          }

          // MODE: METER
          else if (visualMode === 'meter') {
            const meterHeight = 22;
            const padding = 20;

            ctx.fillStyle = '#FF4500';
            ctx.font = '10px monospace';
            ctx.fillText(`GRAVES (BASS / LOCKS) - ${bassAvg}%`, padding, 35);
            ctx.fillRect(padding, 42, (width - padding * 2) * (bassAvg / 100), meterHeight);

            ctx.fillStyle = '#D9A9FF';
            ctx.fillText(`MEDIOS (MIDS / RITMO Y VOZ) - ${midAvg}%`, padding, 95);
            ctx.fillRect(padding, 102, (width - padding * 2) * (midAvg / 100), meterHeight);

            ctx.fillStyle = '#00F0FF';
            ctx.fillText(`AGUDOS (HIGHS / HI-HATS Y BRAZOS) - ${highAvg}%`, padding, 155);
            ctx.fillRect(padding, 162, (width - padding * 2) * (highAvg / 100), meterHeight);
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isLive, visualMode, sensitivity, getThemeColors]);

  return (
    <div className={`space-y-6 ${className} ${isFullscreen ? (isDark ? 'fixed inset-0 z-[9999] bg-[#0A0A0A] p-6 overflow-y-auto' : 'fixed inset-0 z-[9999] bg-slate-100 p-6 overflow-y-auto') : ''}`}>
      {/* MAIN CONTAINER PANEL */}
      <div className={`border rounded-2xl p-6 shadow-2xl relative overflow-hidden space-y-5 transition-colors ${
        isDark ? 'bg-[#121212] border-[#D9A9FF]/40 text-white' : 'bg-white border-amber-400/50 text-slate-900 shadow-md'
      }`}>
        
        {/* HEADER SECTION */}
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4 ${
          isDark ? 'border-[#262626]' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl bg-[#D9A9FF]/20 border border-[#D9A9FF]/50 flex items-center justify-center text-[#D9A9FF] shrink-0 shadow-lg ${beatPulse ? 'scale-110 bg-[#D9A9FF] text-black' : ''} transition-all duration-100`}>
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-base font-display-lg font-bold uppercase tracking-wider ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  Visualizador Rítmico de Audio y Metrónomo
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#D9A9FF]/20 text-[#D9A9FF] border border-[#D9A9FF]/40">
                  RECHARTS & CANVAS 🎶
                </span>
              </div>
              <p className={`text-xs font-medium mt-0.5 ${isDark ? 'text-[#8A8A8A]' : 'text-slate-500'}`}>
                Reacciona en tiempo real al tempo ({bpm} BPM), golpes de bajo y agudos de tus pistas de Waacking.
              </p>
            </div>
          </div>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3.5 py-2 bg-[#0A0A0A] hover:bg-[#1f1f1f] text-[#8A8A8A] hover:text-white border border-[#262626] font-mono text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span>{isFullscreen ? 'Salir' : 'Pantalla Completa'}</span>
          </button>
        </div>

        {/* METRONOME & TEMPO CONTROLLER BAR */}
        <div className="bg-[#0A0A0A] border border-[#D9A9FF]/30 rounded-xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-inner">
          {/* BPM Adjustment Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D9A9FF]" />
              <span className="text-xs font-mono font-bold text-slate-300 uppercase">Tempo:</span>
              <span className="text-xl font-black text-[#D9A9FF] font-mono min-w-[70px]">
                {bpm} <span className="text-xs font-normal text-slate-400">BPM</span>
              </span>
            </div>

            {/* Quick BPM Steppers */}
            <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-xl border border-[#262626]">
              {[-10, -5, -1, +1, +5, +10].map(step => (
                <button
                  key={`bpm-step-${step}`}
                  type="button"
                  onClick={() => updateBpm(bpm + step)}
                  className="px-2 py-1 text-xs font-mono font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all cursor-pointer"
                >
                  {step > 0 ? `+${step}` : step}
                </button>
              ))}
            </div>

            {/* Tap Tempo Button */}
            <button
              type="button"
              onClick={handleTapTempo}
              className="px-3 py-1.5 bg-[#C23E9E]/30 hover:bg-[#C23E9E]/60 text-white border border-[#C23E9E]/60 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-[#D9A9FF]" />
              <span>TAP TEMPO</span>
            </button>
          </div>

          {/* 8-COUNT VISUAL BEAT TICKER */}
          <div className="flex items-center gap-1.5 justify-center overflow-x-auto py-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(count => {
              const isActive = isLive && activeBeat === count;
              const isAccent = count === 1;

              return (
                <div
                  key={`beat-count-${count}`}
                  className={`w-8 h-9 rounded-lg flex flex-col items-center justify-center font-mono font-black text-xs border transition-all duration-100 ${
                    isActive
                      ? isAccent
                        ? 'bg-[#D9A9FF] text-black border-[#D9A9FF] scale-110 shadow-[0_0_15px_rgba(217, 169, 255,0.8)]'
                        : 'bg-emerald-500 text-black border-emerald-400 scale-105 shadow-[0_0_10px_rgba(16,185,129,0.6)]'
                      : 'bg-[#121212] text-slate-500 border-[#262626]'
                  }`}
                >
                  <span>{count}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-black mt-0.5" />}
                </div>
              );
            })}
          </div>
        </div>

        {tapNotice && (
          <div className="p-2 rounded-xl bg-[#D9A9FF]/20 border border-[#D9A9FF]/40 text-[#D9A9FF] text-xs font-mono font-bold text-center animate-fade-in">
            {tapNotice}
          </div>
        )}

        {/* AUDIO SOURCE SELECTOR BUTTONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Metrónomo */}
          <button
            type="button"
            onClick={startMetronomeMode}
            className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
              sourceType === 'metronome' && isLive
                ? 'bg-[#D9A9FF]/20 border-[#D9A9FF] text-white shadow-[0_0_20px_rgba(217, 169, 255,0.3)]'
                : 'bg-[#0A0A0A] border-[#262626] text-[#8A8A8A] hover:border-[#D9A9FF]/40 hover:text-white'
            }`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Clock className={`w-4 h-4 ${sourceType === 'metronome' && isLive ? 'text-[#D9A9FF] animate-spin' : ''}`} />
                <span className="text-xs font-mono font-bold uppercase">Metrónomo Tono</span>
              </div>
              <p className="text-[10px] opacity-75">Audio beeps a {bpm} BPM</p>
            </div>
            {sourceType === 'metronome' && isLive && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#D9A9FF] animate-ping" />
            )}
          </button>

          {/* Beat Synth Disco Funk */}
          <button
            type="button"
            onClick={startSynthLoop}
            className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
              sourceType === 'synth' && isLive
                ? 'bg-[#C23E9E]/20 border-[#C23E9E] text-white shadow-[0_0_20px_rgba(194, 62, 158,0.3)]'
                : 'bg-[#0A0A0A] border-[#262626] text-[#8A8A8A] hover:border-[#C23E9E]/40 hover:text-white'
            }`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Radio className={`w-4 h-4 ${sourceType === 'synth' && isLive ? 'text-[#D9A9FF] animate-pulse' : ''}`} />
                <span className="text-xs font-mono font-bold uppercase">Beat Funk Synth</span>
              </div>
              <p className="text-[10px] opacity-75">Groove a {bpm} BPM</p>
            </div>
            {sourceType === 'synth' && isLive && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#C23E9E] animate-ping" />
            )}
          </button>

          {/* Micrófono */}
          <button
            type="button"
            onClick={startMic}
            className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
              sourceType === 'mic' && isLive
                ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : 'bg-[#0A0A0A] border-[#262626] text-[#8A8A8A] hover:border-emerald-400/40 hover:text-white'
            }`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Mic className={`w-4 h-4 ${sourceType === 'mic' && isLive ? 'text-emerald-400 animate-pulse' : ''}`} />
                <span className="text-xs font-mono font-bold uppercase">Micrófono</span>
              </div>
              <p className="text-[10px] opacity-75">Captura audio externo</p>
            </div>
            {sourceType === 'mic' && isLive && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>

          {/* Cargar Canción */}
          <label
            htmlFor="spectrum-audio-file-input"
            className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
              sourceType === 'file' && isLive
                ? 'bg-sky-500/20 border-sky-400 text-white shadow-[0_0_20px_rgba(56,189,248,0.3)]'
                : 'bg-[#0A0A0A] border-[#262626] text-[#8A8A8A] hover:border-sky-400/40 hover:text-white'
            }`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-mono font-bold uppercase truncate max-w-[120px]">
                  {audioFileName ? audioFileName : 'Subir Música'}
                </span>
              </div>
              <p className="text-[10px] opacity-75">MP3 / WAV local</p>
            </div>
            <input
              id="spectrum-audio-file-input"
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* VISUALIZER MODE SWITCHER & THEME */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#262626]">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-[#0A0A0A] p-1 rounded-xl border border-[#262626] text-xs font-mono font-bold">
            <span className="px-2 text-[#8A8A8A] text-[9px] uppercase">Vista:</span>
            {[
              { id: 'recharts', label: '📈 Gráfico Recharts' },
              { id: 'bars', label: '📊 Barras Canvas' },
              { id: 'radial', label: '🌀 Radar Radar' },
              { id: 'waveform', label: '🌊 Osciloscopio' },
              { id: 'meter', label: '⚡ VU Meters' }
            ].map(mode => (
              <button
                key={`mode-${mode.id}`}
                type="button"
                onClick={() => setVisualMode(mode.id as VisualizerMode)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  visualMode === mode.id
                    ? 'bg-[#D9A9FF] text-black font-bold shadow-md'
                    : 'text-[#8A8A8A] hover:text-white'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* Stop Button */}
          {isLive && (
            <button
              type="button"
              onClick={stopAudio}
              className="px-4 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/40 text-xs font-mono font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Square className="w-3.5 h-3.5 fill-current" /> Pausar
            </button>
          )}
        </div>

        {/* VISUALIZER STAGE AREA */}
        <div className={`border-2 rounded-2xl p-4 relative overflow-hidden space-y-4 transition-colors ${
          isDark 
            ? 'bg-[#0A0A0A] border-[#D9A9FF]/30 shadow-[0_0_30px_rgba(217, 169, 255,0.08)]' 
            : 'bg-slate-50 border-amber-400/50 shadow-md'
        }`}>
          <div className={`relative h-64 sm:h-80 w-full border rounded-xl overflow-hidden shadow-inner flex items-center justify-center p-2 transition-colors ${
            isDark ? 'bg-[#121212] border-[#262626]' : 'bg-white border-slate-200'
          }`}>
            
            {/* VIEW 1: RECHARTS LIVE SPECTRUM CHART */}
            {visualMode === 'recharts' ? (
              <div className="w-full h-full relative flex flex-col">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rechartsData} margin={{ top: 20, right: 10, left: -20, bottom: 25 }}>
                    <XAxis
                      dataKey="name"
                      stroke={isDark ? "#8A8A8A" : "#475569"}
                      fontSize={10}
                      tickLine={false}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis
                      stroke={isDark ? "#8A8A8A" : "#475569"}
                      fontSize={10}
                      domain={[0, 100]}
                      unit="%"
                      tickLine={false}
                    />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as RechartsFrequencyData;
                          return (
                            <div className={isDark ? "bg-[#0A0A0A] border border-[#D9A9FF] p-2.5 rounded-xl shadow-xl text-xs font-mono space-y-1 text-white" : "bg-white border border-amber-400 p-2.5 rounded-xl shadow-xl text-xs font-mono space-y-1 text-slate-900"}>
                              <p className="font-bold uppercase">{data.name} ({data.hz})</p>
                              <p className="text-[#D9A9FF]">Intensidad: <span className="font-bold">{data.nivel}%</span></p>
                              <p className={isDark ? "text-slate-400 text-[10px]" : "text-slate-500 text-[10px]"}>Pico: {data.peak}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine y={80} stroke="#C23E9E" strokeDasharray="3 3" label={{ value: 'PUNCH THRESHOLD', fill: '#C23E9E', fontSize: 9 }} />
                    <Bar dataKey="nivel" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                      {rechartsData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.fill}
                          stroke={beatPulse && entry.category === 'bass' ? '#FFFFFF' : 'transparent'}
                          strokeWidth={2}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              /* VIEW 2: CANVAS ANIMATED VISUALIZER */
              <canvas
                ref={canvasRef}
                className="w-full h-full block"
              />
            )}

            {/* PAUSE OVERLAY */}
            {!isLive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/80 backdrop-blur-sm space-y-3 z-10">
                <div className="w-14 h-14 rounded-2xl bg-[#121212] border border-[#D9A9FF]/40 flex items-center justify-center text-[#D9A9FF] animate-bounce">
                  <Music className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Visualizador de Espectro en Pausa
                </h3>
                <p className="text-xs text-[#8A8A8A] max-w-sm">
                  Haz clic en <strong>Metrónomo Tono</strong>, <strong>Beat Funk Synth</strong> o <strong>Micrófono</strong> para activar el análisis de espectro en vivo.
                </p>
                <button
                  type="button"
                  onClick={startMetronomeMode}
                  className="px-5 py-2.5 bg-[#D9A9FF] hover:bg-[#B478F0] text-black font-mono font-bold text-xs uppercase rounded-xl transition-all shadow-lg cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" /> Activar Metrónomo ({bpm} BPM)
                </button>
              </div>
            )}
          </div>

          {/* REAL-TIME ENERGY METRICS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-[#121212] p-4 rounded-xl border border-[#262626]">
            {/* Bass */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                <span className="text-[#8A8A8A] uppercase flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-rose-500" /> BASS (Graves/Locks)
                </span>
                <span className="text-rose-400 font-bold">{bassEnergy}%</span>
              </div>
              <div className="w-full bg-[#0A0A0A] h-2 rounded-full overflow-hidden border border-[#262626]">
                <div
                  className="h-full bg-gradient-to-r from-rose-700 to-rose-400 transition-all duration-75"
                  style={{ width: `${bassEnergy}%` }}
                />
              </div>
            </div>

            {/* Mids */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                <span className="text-[#8A8A8A] uppercase flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-[#D9A9FF]" /> MIDS (Medios/Dramatismo)
                </span>
                <span className="text-[#D9A9FF] font-bold">{midEnergy}%</span>
              </div>
              <div className="w-full bg-[#0A0A0A] h-2 rounded-full overflow-hidden border border-[#262626]">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-[#D9A9FF] transition-all duration-75"
                  style={{ width: `${midEnergy}%` }}
                />
              </div>
            </div>

            {/* Highs */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                <span className="text-[#8A8A8A] uppercase flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" /> HIGHS (Agudos/Brazos)
                </span>
                <span className="text-sky-400 font-bold">{highEnergy}%</span>
              </div>
              <div className="w-full bg-[#0A0A0A] h-2 rounded-full overflow-hidden border border-[#262626]">
                <div
                  className="h-full bg-gradient-to-r from-sky-600 to-sky-400 transition-all duration-75"
                  style={{ width: `${highEnergy}%` }}
                />
              </div>
            </div>

            {/* Sensibilidad Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                <span className="text-[#8A8A8A] uppercase flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-white" /> SENSIBILIDAD
                </span>
                <span className="text-white font-bold">{sensitivity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={sensitivity}
                onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                className="w-full accent-[#D9A9FF] h-2 bg-[#0A0A0A] rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
