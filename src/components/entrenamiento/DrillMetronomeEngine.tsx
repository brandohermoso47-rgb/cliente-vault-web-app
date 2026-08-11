import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Square, Volume2, VolumeX, Mic, Radio, Sliders, Zap, Activity, Clock, ShieldCheck, Smartphone, Sparkles } from 'lucide-react';
import { Language } from '../../lib/translations';
import { triggerBpm10HapticAndFlash, getBpmHapticPreference, setBpmHapticPreference } from '../../lib/bpmHaptics';

export type CountingMode = 'accent' | 'voice' | 'mixed';

export interface DrillMetronomeEngineProps {
  language?: Language;
  initialBpm?: number;
  onBpmChange?: (bpm: number) => void;
  className?: string;
}

const COUNT_WORDS_ES = ['Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho'];
const COUNT_WORDS_EN = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'];

export const DrillMetronomeEngine: React.FC<DrillMetronomeEngineProps> = ({
  language = 'es',
  initialBpm = 120,
  onBpmChange,
  className = ''
}) => {
  const [bpm, setBpm] = useState<number>(initialBpm);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [countingMode, setCountingMode] = useState<CountingMode>('mixed');
  const [currentBeat, setCurrentBeat] = useState<number>(1);
  const [flash, setFlash] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [totalBeatsPlayed, setTotalBeatsPlayed] = useState<number>(0);

  const [isHapticEnabled, setIsHapticEnabled] = useState<boolean>(getBpmHapticPreference);
  const [is10xFlashing, setIs10xFlashing] = useState<boolean>(false);

  useEffect(() => {
    const handleSync = () => setIsHapticEnabled(getBpmHapticPreference());
    window.addEventListener('bpm-haptic-preference-changed', handleSync);
    return () => window.removeEventListener('bpm-haptic-preference-changed', handleSync);
  }, []);

  useEffect(() => {
    if (isHapticEnabled && bpm % 10 === 0) {
      triggerBpm10HapticAndFlash(bpm, isHapticEnabled, () => {
        setIs10xFlashing(true);
        const timer = setTimeout(() => setIs10xFlashing(false), 850);
        return () => clearTimeout(timer);
      });
    }
    if (onBpmChange) onBpmChange(bpm);
  }, [bpm, isHapticEnabled, onBpmChange]);

  const toggleHapticPreference = () => {
    const nextVal = !isHapticEnabled;
    setIsHapticEnabled(nextVal);
    setBpmHapticPreference(nextVal);
  };

  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | number | null>(null);
  const currentBeatRef = useRef<number>(1);

  // Initialize Web Audio API context safely on user gesture or play
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Play Beep with AudioContext oscillator
  const playBeep = useCallback((isAccent: boolean) => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // 950 Hz for beat 1 (strong accent), 550 Hz for beats 2-8
      const freq = isAccent ? 950 : 550;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Volume envelope
      const vol = isAccent ? 0.35 : 0.18;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (isAccent ? 0.12 : 0.08));

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + (isAccent ? 0.12 : 0.08));
    } catch (e) {
      console.warn('AudioContext play error:', e);
    }
  }, [getAudioContext, soundEnabled]);

  // Speech Synthesis for 8-count voice count in Spanish/English
  const speakBeatNumber = useCallback((beatNum: number, currentBpm: number) => {
    if (!soundEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // cancel previous queued speech
      const words = language === 'en' ? COUNT_WORDS_EN : COUNT_WORDS_ES;
      const text = words[beatNum - 1];

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'en' ? 'en-US' : 'es-ES';
      
      // Dynamically adapt speech rate based on BPM
      // Standard rate 1.0 at 110 BPM -> scale linearly
      const rate = Math.max(0.8, Math.min(2.5, (currentBpm / 110) * 1.15));
      utterance.rate = rate;
      utterance.volume = 0.9;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  }, [language, soundEnabled]);

  // Step trigger
  const handleBeatStep = useCallback(() => {
    const beat = currentBeatRef.current;
    setCurrentBeat(beat);
    setFlash(true);
    setTimeout(() => setFlash(false), 120);

    const isAccent = beat === 1;

    if (countingMode === 'accent') {
      playBeep(isAccent);
    } else if (countingMode === 'voice') {
      speakBeatNumber(beat, bpm);
    } else if (countingMode === 'mixed') {
      if (isAccent) {
        playBeep(true);
      } else {
        playBeep(false);
      }
      speakBeatNumber(beat, bpm);
    }

    setTotalBeatsPlayed(prev => prev + 1);

    // Advance 8-count
    currentBeatRef.current = beat >= 8 ? 1 : beat + 1;
  }, [bpm, countingMode, playBeep, speakBeatNumber]);

  // Handle Metronome Toggle
  const togglePlay = () => {
    if (isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current as any);
      setIsPlaying(false);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } else {
      getAudioContext();
      currentBeatRef.current = 1;
      setIsPlaying(true);
      handleBeatStep();
      const intervalMs = (60 / bpm) * 1000;
      intervalRef.current = setInterval(handleBeatStep, intervalMs);
    }
  };

  // Update interval when BPM changes while playing
  useEffect(() => {
    if (isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current as any);
      const intervalMs = (60 / bpm) * 1000;
      intervalRef.current = setInterval(handleBeatStep, intervalMs);
    }
    if (onBpmChange) onBpmChange(bpm);
  }, [bpm, isPlaying, handleBeatStep, onBpmChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current as any);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className={`p-6 rounded-3xl bg-[#0F0B1E] border border-tertiary/20 text-white shadow-2xl space-y-6 relative overflow-hidden ${className}`}>
      {/* Background ambient light */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-tertiary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-tertiary/10 border border-tertiary/30 flex items-center justify-center text-tertiary shadow-lg">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-tertiary bg-tertiary/10 border border-tertiary/20 px-2 py-0.5 rounded-md">
                Motor Biomecánico
              </span>
              <span className="text-[10px] font-mono text-slate-400">AudioContext 950Hz/550Hz</span>
            </div>
            <h3 className="text-lg font-bold font-display italic uppercase tracking-wider text-white">
              Drill Metronome Engine
            </h3>
          </div>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2.5 rounded-2xl border transition-all ${
            soundEnabled 
              ? 'bg-tertiary/20 text-tertiary border-tertiary/40 shadow-md' 
              : 'bg-black/40 text-slate-500 border-white/10'
          }`}
          title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>

      {/* Core Dial & Beat Display */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
        
        {/* Left Column: BPM Dial Control */}
        <div className={`md:col-span-6 rounded-2xl p-5 flex flex-col items-center justify-center space-y-4 relative overflow-hidden shadow-inner border transition-all duration-300 ${
          is10xFlashing
            ? 'bg-amber-500/30 border-amber-400 shadow-[0_0_30px_rgba(233,195,73,0.6)] scale-[1.02]'
            : bpm % 10 === 0 && isHapticEnabled
              ? 'bg-black/60 border-tertiary/80 shadow-[0_0_15px_rgba(233,195,73,0.3)]'
              : 'bg-black/40 border-white/10'
        }`}>
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-tertiary" /> TEMPO DE DRILL (BPM)
            </span>
            <button
              type="button"
              onClick={toggleHapticPreference}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition-all border cursor-pointer ${
                isHapticEnabled
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                  : 'bg-black/40 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title={isHapticEnabled ? "Vibración y destello háptico en múltiplos de 10 ACTIVADO" : "Activar vibración y destello en múltiplos de 10 BPM"}
            >
              <Smartphone className={`w-3.5 h-3.5 ${isHapticEnabled ? 'animate-bounce text-emerald-400' : ''}`} />
              <span>{isHapticEnabled ? '📳 10x ON' : '📳 10x OFF'}</span>
            </button>
          </div>

          {/* Large Dial Display */}
          <div className="flex flex-col items-center select-none">
            {bpm % 10 === 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-widest bg-tertiary text-black shadow animate-pulse flex items-center gap-1 mb-1">
                <Sparkles className="w-3 h-3" /> MÚLTIPLO 10x ALCANZADO
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-black font-mono tracking-tighter text-tertiary drop-shadow-md">
                {bpm}
              </span>
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">BPM</span>
            </div>
          </div>

          {/* Preset BPM Buttons */}
          <div className="flex items-center justify-center flex-wrap gap-1.5 w-full">
            {[90, 100, 110, 120, 130, 140, 150, 160].map((preset) => (
              <button
                key={preset}
                onClick={() => setBpm(preset)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold transition-all border flex items-center gap-1 ${
                  bpm === preset
                    ? 'bg-tertiary text-black border-tertiary font-black shadow-md scale-105'
                    : preset % 10 === 0 && isHapticEnabled
                      ? 'bg-white/10 text-tertiary border-tertiary/30 hover:border-tertiary'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:border-tertiary/40'
                }`}
              >
                <span>{preset}</span>
                {preset % 10 === 0 && <span className="text-[9px] opacity-75">📳</span>}
              </button>
            ))}
          </div>

          {/* Range Slider */}
          <div className="w-full space-y-1">
            <input
              type="range"
              min="80"
              max="180"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-full accent-tertiary cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>80 BPM</span>
              <span>100 📳</span>
              <span>120 📳</span>
              <span>140 📳</span>
              <span>160 📳</span>
              <span>180 BPM</span>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Beat Flash & 8-Count Indicator */}
        <div className="md:col-span-6 bg-black/40 border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center space-y-4 relative overflow-hidden shadow-inner min-h-[220px]">
          
          {/* Flash Circle Effect */}
          <AnimatePresence>
            {flash && (
              <motion.div
                initial={{ scale: 0.6, opacity: 0.9 }}
                animate={{ scale: 1.4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`absolute w-32 h-32 rounded-full border pointer-events-none ${
                  currentBeat === 1 ? 'border-red-500 bg-red-500/20' : 'border-tertiary bg-tertiary/20'
                }`}
              />
            )}
          </AnimatePresence>

          <span className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">
            CONTEO DE 8 TIEMPOS (PULSO VISUAL)
          </span>

          {/* Active Beat Number Display */}
          <div className="my-1 flex items-center justify-center">
            <motion.div
              key={currentBeat}
              initial={{ scale: 0.8 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.15 }}
              className={`w-20 h-20 rounded-2xl border flex items-center justify-center shadow-xl select-none transition-colors ${
                currentBeat === 1
                  ? 'bg-red-500/20 border-red-500 text-red-400 font-black'
                  : 'bg-tertiary/10 border-tertiary/40 text-tertiary font-bold'
              }`}
            >
              <span className="text-5xl font-mono font-black">{currentBeat}</span>
            </motion.div>
          </div>

          {/* 8-beat tracker dots */}
          <div className="grid grid-cols-8 gap-1.5 w-full max-w-xs">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((b) => (
              <div
                key={b}
                className={`h-7 rounded-lg border flex items-center justify-center text-[11px] font-mono transition-all ${
                  currentBeat === b
                    ? b === 1
                      ? 'bg-red-500 border-red-400 text-white font-black scale-110 shadow-lg'
                      : 'bg-tertiary border-tertiary text-black font-black scale-105 shadow-md'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                {b}
              </div>
            ))}
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-2 pt-2 w-full justify-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">MODO:</span>
            {(['accent', 'voice', 'mixed'] as CountingMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setCountingMode(mode)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-mono uppercase font-bold transition-all border ${
                  countingMode === mode
                    ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:border-purple-500/40'
                }`}
              >
                {mode === 'accent' ? '950/550Hz' : mode === 'voice' ? 'Voz (1-8)' : 'Mixto'}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Main Toggle & Statistics Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/10 relative z-10">
        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-tertiary" />
            Tiempos marcados: <strong className="text-white font-bold">{totalBeatsPlayed}</strong>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Frecuencia: <strong className="text-white font-bold">{((60 / bpm) * 1000).toFixed(0)} ms/beat</strong>
          </span>
        </div>

        <button
          onClick={togglePlay}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-mono font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 ${
            isPlaying
              ? 'bg-red-600 hover:bg-red-500 text-white border border-red-400 shadow-red-950/50'
              : 'bg-tertiary hover:bg-yellow-300 text-black border border-tertiary shadow-tertiary/20'
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="w-4 h-4 fill-current" /> Detention Metrónomo
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" /> Iniciar Pulso Sincronizado
            </>
          )}
        </button>
      </div>
    </div>
  );
};
