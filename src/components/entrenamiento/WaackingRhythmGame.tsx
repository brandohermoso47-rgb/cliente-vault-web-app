import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Square, Trophy, Zap, RefreshCw, Volume2, VolumeX, Sparkles, Flame, CheckCircle2, Music, Keyboard } from 'lucide-react';
import { User } from '../../types';
import { db, auth, sanitizeFirestoreData, handleFirestoreError, OperationType } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';

interface WaackingRhythmGameProps {
  currentUser: User;
  onAddBonusPoints?: (amount: number) => void;
  onUserChange?: (user: User) => void;
}

type AccuracyRating = 'PERFECT' | 'GREAT' | 'GOOD' | 'MISS';

interface HitNote {
  id: string;
  beatIndex: number; // 0, 1, 2, 3...
  targetTime: number; // AudioContext time
  hit: boolean;
  rating?: AccuracyRating;
}

interface HitFeedback {
  id: string;
  rating: AccuracyRating;
  points: number;
  combo: number;
  x: number;
  y: number;
}

export const WaackingRhythmGame: React.FC<WaackingRhythmGameProps> = ({
  currentUser,
  onAddBonusPoints,
  onUserChange,
}) => {
  // Game Settings
  const [bpm, setBpm] = useState<number>(125);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [gameDuration, setGameDuration] = useState<number>(45); // seconds
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [gameOver, setGameOver] = useState<boolean>(false);

  // Score & Stats
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [stats, setStats] = useState({ perfect: 0, great: 0, good: 0, miss: 0 });
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem(`waacking_rhythm_highscore_${currentUser.id}`);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [pointsClaimed, setPointsClaimed] = useState<boolean>(false);

  // Visual & Feedback
  const [hitFeedbacks, setHitFeedbacks] = useState<HitFeedback[]>([]);
  const [currentBeatCount, setCurrentBeatCount] = useState<number>(1);
  const [keyPulse, setKeyPulse] = useState<boolean>(false);

  // Web Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const notesRef = useRef<HitNote[]>([]);
  const nextBeatTimeRef = useRef<number>(0);
  const beatIndexRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize isPlaying state to ref
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Audio Context Initialization
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

  // Web Audio Synthesizer: Drum & Bass Sounds
  const playDrumSound = useCallback((type: 'kick' | 'snare' | 'hihat' | 'bass', time: number) => {
    if (isMuted) return;
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (type === 'kick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, time);
      osc.frequency.exponentialRampToValueAtTime(32, time + 0.12);

      gain.gain.setValueAtTime(0.8, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.15);
    } else if (type === 'snare') {
      // Noise buffer for snare clap
      const bufferSize = ctx.sampleRate * 0.1;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 800;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.6, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(time);
      noise.stop(time + 0.12);
    } else if (type === 'hihat') {
      const bufferSize = ctx.sampleRate * 0.04;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 7000;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(time);
      noise.stop(time + 0.04);
    } else if (type === 'bass') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      const notes = [110, 123.47, 130.81, 146.83]; // A2, B2, C3, D3
      const freq = notes[beatIndexRef.current % notes.length];
      osc.frequency.setValueAtTime(freq, time);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, time);
      filter.frequency.exponentialRampToValueAtTime(150, time + 0.15);

      gain.gain.setValueAtTime(0.35, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.18);
    }
  }, [isMuted]);

  // Play Sound on Hit
  const playHitSound = useCallback((rating: AccuracyRating) => {
    if (isMuted) return;
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (rating === 'PERFECT') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, t + 0.1);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    } else if (rating === 'GREAT') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, t); // E5
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    } else if (rating === 'GOOD') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, t); // A4
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.linearRampToValueAtTime(80, t + 0.12);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  }, [isMuted]);

  // Scheduler: Spawns beats ahead of time
  const scheduleBeats = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx || !isPlayingRef.current) return;

    const secondsPerBeat = 60.0 / bpm;
    const lookahead = 0.5; // schedule 500ms ahead

    while (nextBeatTimeRef.current < ctx.currentTime + lookahead) {
      const beatNum = beatIndexRef.current;
      const targetTime = nextBeatTimeRef.current;

      // Add to track notes
      notesRef.current.push({
        id: `note-${beatNum}-${targetTime.toFixed(3)}`,
        beatIndex: beatNum,
        targetTime,
        hit: false
      });

      // Schedule Audio
      const barBeat = (beatNum % 4) + 1; // 1, 2, 3, 4
      if (barBeat === 1 || barBeat === 3) {
        playDrumSound('kick', targetTime);
      } else {
        playDrumSound('snare', targetTime);
      }
      playDrumSound('hihat', targetTime);
      playDrumSound('bass', targetTime);

      // Advance
      nextBeatTimeRef.current += secondsPerBeat;
      beatIndexRef.current += 1;
    }
  }, [bpm, playDrumSound]);

  // Check for missed notes
  const updateGameLoop = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx || !isPlayingRef.current) return;

    scheduleBeats();

    const now = ctx.currentTime;
    const missThreshold = 0.22; // 220ms after target time = miss

    // Update active beat counter for UI
    const secondsPerBeat = 60.0 / bpm;
    const activeNote = notesRef.current.find(n => Math.abs(n.targetTime - now) < secondsPerBeat / 2);
    if (activeNote) {
      setCurrentBeatCount((activeNote.beatIndex % 8) + 1);
    }

    // Process missed notes
    notesRef.current.forEach(note => {
      if (!note.hit && !note.rating && (now - note.targetTime) > missThreshold) {
        note.hit = true;
        note.rating = 'MISS';
        setCombo(0);
        setStats(prev => ({ ...prev, miss: prev.miss + 1 }));

        // Add feedback badge
        setHitFeedbacks(prev => [
          ...prev.slice(-6),
          {
            id: `miss-${Date.now()}-${Math.random()}`,
            rating: 'MISS',
            points: 0,
            combo: 0,
            x: Math.random() * 40 - 20,
            y: Math.random() * 20 - 10
          }
        ]);
      }
    });

    // Cleanup old notes (older than 1.5 sec)
    notesRef.current = notesRef.current.filter(n => (now - n.targetTime) < 2.0);

    animFrameRef.current = requestAnimationFrame(updateGameLoop);
  }, [bpm, scheduleBeats]);

  // Trigger Hit Input (Keyboard / Touch)
  const handleHit = useCallback(() => {
    if (!isPlayingRef.current) return;
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    setKeyPulse(true);
    setTimeout(() => setKeyPulse(false), 120);

    const now = ctx.currentTime;
    
    // Find unhit note closest to current time
    const unhitNotes = notesRef.current.filter(n => !n.hit);
    if (unhitNotes.length === 0) return;

    // Find note with minimum delta
    let closestNote = unhitNotes[0];
    let minDiff = Math.abs(now - closestNote.targetTime);

    for (let i = 1; i < unhitNotes.length; i++) {
      const diff = Math.abs(now - unhitNotes[i].targetTime);
      if (diff < minDiff) {
        minDiff = diff;
        closestNote = unhitNotes[i];
      }
    }

    const deltaMs = minDiff * 1000;

    let rating: AccuracyRating = 'MISS';
    let pts = 0;

    if (deltaMs <= 60) {
      rating = 'PERFECT';
      pts = 100;
    } else if (deltaMs <= 120) {
      rating = 'GREAT';
      pts = 60;
    } else if (deltaMs <= 180) {
      rating = 'GOOD';
      pts = 30;
    } else {
      rating = 'MISS';
      pts = 0;
    }

    closestNote.hit = true;
    closestNote.rating = rating;

    playHitSound(rating);

    if (rating !== 'MISS') {
      setCombo(prev => {
        const nextCombo = prev + 1;
        setMaxCombo(m => Math.max(m, nextCombo));
        
        // Combo Multiplier
        const multiplier = nextCombo >= 20 ? 3 : nextCombo >= 10 ? 2 : 1;
        const totalPts = pts * multiplier;
        setScore(s => s + totalPts);

        setHitFeedbacks(prevFb => [
          ...prevFb.slice(-6),
          {
            id: `hit-${Date.now()}-${Math.random()}`,
            rating,
            points: totalPts,
            combo: nextCombo,
            x: Math.random() * 60 - 30,
            y: Math.random() * 20 - 10
          }
        ]);

        return nextCombo;
      });

      setStats(prev => ({
        ...prev,
        perfect: rating === 'PERFECT' ? prev.perfect + 1 : prev.perfect,
        great: rating === 'GREAT' ? prev.great + 1 : prev.great,
        good: rating === 'GOOD' ? prev.good + 1 : prev.good,
      }));
    } else {
      setCombo(0);
      setStats(prev => ({ ...prev, miss: prev.miss + 1 }));
      setHitFeedbacks(prevFb => [
        ...prevFb.slice(-6),
        {
          id: `miss-${Date.now()}-${Math.random()}`,
          rating: 'MISS',
          points: 0,
          combo: 0,
          x: Math.random() * 40 - 20,
          y: Math.random() * 20 - 10
        }
      ]);
    }
  }, [playHitSound]);

  // Global Keyboard listener for Spacebar / Enter / Key A / Key D / Key J / Key K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (['Space', 'Enter', 'KeyA', 'KeyD', 'KeyJ', 'KeyK'].includes(e.code)) {
        if (isPlayingRef.current) {
          e.preventDefault();
          handleHit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleHit]);

  // Start Game Routine
  const startGame = () => {
    const ctx = getAudioContext();
    notesRef.current = [];
    nextBeatTimeRef.current = ctx.currentTime + 0.1;
    beatIndexRef.current = 0;

    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setStats({ perfect: 0, great: 0, good: 0, miss: 0 });
    setTimeLeft(gameDuration);
    setGameOver(false);
    setPointsClaimed(false);
    setHitFeedbacks([]);
    setIsPlaying(true);

    // Timer Interval
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          stopGame(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Game Loop
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(updateGameLoop);
  };

  // Stop / End Game Routine
  const stopGame = useCallback((isCompleted = false) => {
    setIsPlaying(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    if (isCompleted) {
      setGameOver(true);

      // Save high score
      setScore(currentScore => {
        if (currentScore > highScore) {
          setHighScore(currentScore);
          localStorage.setItem(`waacking_rhythm_highscore_${currentUser.id}`, String(currentScore));
        }
        return currentScore;
      });
    }
  }, [currentUser.id, highScore]);

  // Claim Earned Bonus Points
  const handleClaimPoints = () => {
    if (pointsClaimed || score <= 0) return;

    // Award bonus points based on score (e.g. 1 Bonus Point per 100 Game Score)
    const bonusPointsEarned = Math.max(10, Math.floor(score / 50));
    
    if (onAddBonusPoints) {
      onAddBonusPoints(bonusPointsEarned);
    }

    if (onUserChange) {
      onUserChange({
        ...currentUser,
        points: (currentUser.points || 0) + bonusPointsEarned
      });
    }

    // Sync to Firestore if user is authenticated with Firebase Auth
    const activeAuthUid = auth?.currentUser?.uid;
    if (db && activeAuthUid) {
      setDoc(doc(db, 'users', activeAuthUid), sanitizeFirestoreData({
        points: (currentUser.points || 0) + bonusPointsEarned,
        lastRhythmGameScore: score,
        lastRhythmGameDate: new Date().toISOString()
      }), { merge: true }).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `users/${activeAuthUid}`);
      });
    }

    setPointsClaimed(true);
  };

  // Cleanup on Unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Accuracy Percentage Calculation
  const totalHits = stats.perfect + stats.great + stats.good + stats.miss;
  const accuracyPct = totalHits > 0 
    ? Math.round(((stats.perfect * 100 + stats.great * 70 + stats.good * 40) / (totalHits * 100)) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* HEADER: BEAT TRAINER INTRO */}
      <div className="bg-[#121212] border border-[#D9A9FF]/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D9A9FF]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10 border-b border-[#262626] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#C23E9E]/20 border border-[#C23E9E]/50 flex items-center justify-center text-[#D9A9FF] shrink-0 shadow-lg">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-display-lg font-bold text-white uppercase tracking-wider">
                  Waacking Beat Trainer & Rhythm Game
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#D9A9FF]/20 text-[#D9A9FF] border border-[#D9A9FF]/40">
                  ENTRENAMIENTO LÚDICO 🎮
                </span>
              </div>
              <p className="text-xs text-[#8A8A8A] font-medium mt-0.5">
                Pon a prueba tu oídos y velocidad de brazos marcando el acento rítmico a 128 BPM. ¡Gana puntos extras para tu perfil!
              </p>
            </div>
          </div>

          {/* High Score & Quick Stats */}
          <div className="flex items-center gap-3 bg-[#0A0A0A] p-2 rounded-xl border border-[#262626] shrink-0">
            <div className="flex items-center gap-2 px-3 py-1 border-r border-[#262626]">
              <Trophy className="w-4 h-4 text-[#D9A9FF]" />
              <div>
                <span className="text-[9px] font-mono text-[#8A8A8A] uppercase block">Récord Máximo</span>
                <span className="text-xs font-mono font-bold text-white">{highScore} PTS</span>
              </div>
            </div>
            <button
              id="mute-toggle-rhythm-game"
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 text-[#8A8A8A] hover:text-white transition-colors"
              title={isMuted ? "Activar Sonido" : "Silenciar"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#D9A9FF]" />}
            </button>
          </div>
        </div>

        {/* CONTROLES PREVIOS DE CONFIGURACIÓN */}
        {!isPlaying && !gameOver && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Control BPM */}
            <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-[#262626] space-y-2">
              <label className="text-[10px] font-mono font-bold text-[#8A8A8A] uppercase flex justify-between">
                <span>Tempo de Waacking (BPM)</span>
                <span className="text-[#D9A9FF] font-bold">{bpm} BPM</span>
              </label>
              <div className="flex gap-2">
                {[115, 125, 130, 135].map(preset => (
                  <button
                    key={`bpm-preset-${preset}`}
                    type="button"
                    onClick={() => setBpm(preset)}
                    className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all ${
                      bpm === preset 
                        ? 'bg-[#D9A9FF] text-black border-[#D9A9FF]' 
                        : 'bg-[#121212] text-gray-400 border-[#262626] hover:text-white'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Duración de la Sesión */}
            <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-[#262626] space-y-2">
              <label className="text-[10px] font-mono font-bold text-[#8A8A8A] uppercase flex justify-between">
                <span>Duración de la Ronda</span>
                <span className="text-[#D9A9FF] font-bold">{gameDuration} Segundos</span>
              </label>
              <div className="flex gap-2">
                {[30, 45, 60].map(dur => (
                  <button
                    key={`dur-preset-${dur}`}
                    type="button"
                    onClick={() => {
                      setGameDuration(dur);
                      setTimeLeft(dur);
                    }}
                    className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all ${
                      gameDuration === dur 
                        ? 'bg-[#D9A9FF] text-black border-[#D9A9FF]' 
                        : 'bg-[#121212] text-gray-400 border-[#262626] hover:text-white'
                    }`}
                  >
                    {dur}s
                  </button>
                ))}
              </div>
            </div>

            {/* Botón Iniciar */}
            <div className="flex items-end">
              <button
                id="start-rhythm-game-btn"
                type="button"
                onClick={startGame}
                className="w-full h-11 bg-gradient-to-r from-[#C23E9E] to-[#D9A9FF] hover:brightness-110 text-white font-mono font-bold text-xs uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(217, 169, 255,0.3)] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" /> ¡Iniciar Entrenamiento Rítmico!
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ÁREA DEL JUEGO ACTIVO (STAGE RÍTMICO) */}
      {isPlaying && (
        <div className="bg-[#0A0A0A] border-2 border-[#D9A9FF]/50 rounded-2xl p-6 shadow-[0_0_40px_rgba(217, 169, 255,0.15)] relative overflow-hidden space-y-6">
          {/* HUD superior: Tiempo, Puntaje, Multiplicador, Beat */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#121212] p-4 rounded-xl border border-[#262626]">
            {/* Puntos */}
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase">PUNTAJE ACUMULADO</span>
              <div className="text-xl font-mono font-bold text-[#D9A9FF] flex items-center gap-1">
                <Sparkles className="w-5 h-5 text-[#D9A9FF]" /> {score}
              </div>
            </div>

            {/* Combo Streak */}
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase">COMBO RACHA</span>
              <div className="text-xl font-mono font-bold text-amber-400 flex items-center gap-1">
                <Flame className="w-5 h-5 text-amber-500 animate-pulse" /> {combo}x
                {combo >= 20 && <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold">3X!</span>}
                {combo >= 10 && combo < 20 && <span className="text-[9px] bg-amber-600 text-black px-1.5 py-0.5 rounded font-bold">2X</span>}
              </div>
            </div>

            {/* Tiempo Restante */}
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase">TIEMPO RESTANTE</span>
              <div className="text-xl font-mono font-bold text-white">
                {timeLeft}s
              </div>
            </div>

            {/* Conteo 8-Counts */}
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase">CONTEO MUSICAL</span>
              <div className="text-xl font-mono font-bold text-[#C23E9E] flex items-center gap-2">
                <Music className="w-5 h-5 text-[#C23E9E]" /> BEAT #{currentBeatCount}
              </div>
            </div>
          </div>

          {/* CANVAS VISUAL DEL RITMO (BEAT RUNWAY) */}
          <div className="relative h-48 bg-[#121212] border border-[#262626] rounded-2xl overflow-hidden flex flex-col justify-between p-4 shadow-inner">
            {/* Fondo pulsante en tiempo real */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#C23E9E]/10 via-transparent to-[#D9A9FF]/10 pointer-events-none" />

            {/* 4-Counts Grid Visual Markers */}
            <div className="absolute inset-x-8 top-4 flex justify-between text-[10px] font-mono text-[#8A8A8A] border-b border-[#262626] pb-2">
              <span className="font-bold text-amber-400">BEAT 1 (Kick)</span>
              <span className="font-bold text-rose-400">BEAT 2 (Clap)</span>
              <span className="font-bold text-amber-400">BEAT 3 (Kick)</span>
              <span className="font-bold text-rose-400">BEAT 4 (Clap)</span>
            </div>

            {/* Floating Ratings & Hits */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <AnimatePresence>
                {hitFeedbacks.map((fb) => (
                  <motion.div
                    key={fb.id}
                    initial={{ opacity: 1, y: 0, scale: 0.8 }}
                    animate={{ opacity: 0, y: -45, scale: 1.3 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.55 }}
                    style={{ translateX: fb.x, translateY: fb.y }}
                    className="absolute text-center"
                  >
                    <span className={`text-base font-mono font-extrabold px-3 py-1 rounded-full shadow-2xl border uppercase tracking-wider ${
                      fb.rating === 'PERFECT'
                        ? 'bg-[#D9A9FF] text-black border-amber-300 shadow-[0_0_20px_rgba(217, 169, 255,0.8)]'
                        : fb.rating === 'GREAT'
                        ? 'bg-emerald-500 text-black border-emerald-300'
                        : fb.rating === 'GOOD'
                        ? 'bg-sky-500 text-white border-sky-300'
                        : 'bg-red-600 text-white border-red-400'
                    }`}>
                      {fb.rating === 'PERFECT' ? '🌟 PERFECT!' : fb.rating === 'GREAT' ? '🔥 GREAT!' : fb.rating === 'GOOD' ? '👍 GOOD' : '❌ MISS'}
                    </span>
                    {fb.points > 0 && (
                      <span className="block text-xs font-mono font-bold text-amber-300 mt-1 drop-shadow">
                        +{fb.points} PTS
                      </span>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* HIT TARGET ZONE LINE */}
            <div className="relative w-full h-24 flex items-center my-auto">
              <div className="absolute left-1/2 -translate-x-1/2 w-20 h-full border-2 border-dashed border-[#D9A9FF] bg-[#D9A9FF]/10 rounded-xl flex items-center justify-center pointer-events-none z-10 shadow-[0_0_15px_rgba(217, 169, 255,0.3)]">
                <span className="text-[10px] font-mono font-bold text-[#D9A9FF] uppercase tracking-widest">HIT ZONE</span>
              </div>
            </div>

            {/* Guía en pantalla */}
            <div className="flex justify-between items-center text-[10px] font-mono text-[#8A8A8A] relative z-10">
              <span className="flex items-center gap-1">
                <Keyboard className="w-3.5 h-3.5 text-[#D9A9FF]" /> Presiona <strong>TECLA ESPACIO</strong> o <strong>ENTER</strong> en cada acento rítmico.
              </span>
              <span className="text-[#D9A9FF] font-bold">PRECISIÓN: {accuracyPct}%</span>
            </div>
          </div>

          {/* BOTÓN INTERACTIVO GRANDE DE GOLPE / HIT TOUCH PAD */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              id="rhythm-hit-pad-button"
              type="button"
              onClick={handleHit}
              className={`w-full sm:flex-1 h-20 bg-gradient-to-r from-[#C23E9E] via-[#D9A9FF] to-[#C23E9E] text-black font-mono font-extrabold text-base uppercase rounded-2xl transition-all shadow-[0_0_30px_rgba(217, 169, 255,0.4)] flex items-center justify-center gap-3 cursor-pointer select-none active:scale-95 ${
                keyPulse ? 'brightness-150 scale-105' : 'hover:brightness-110'
              }`}
            >
              <Zap className="w-6 h-6 fill-black" /> ¡PRESIONA AQUÍ O ESPACIO EN EL BEAT!
            </button>

            <button
              id="stop-rhythm-game-btn"
              type="button"
              onClick={() => stopGame(false)}
              className="h-20 px-6 bg-[#121212] hover:bg-red-950/40 border border-red-500/40 text-red-400 font-mono font-bold text-xs uppercase rounded-2xl transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Square className="w-4 h-4 fill-red-400" /> Detener
            </button>
          </div>
        </div>
      )}

      {/* TARJETA MODAL / RESUMEN DE GAME OVER Y PREMIOS */}
      {gameOver && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#121212] border-2 border-[#D9A9FF] rounded-2xl p-6 shadow-[0_0_50px_rgba(217, 169, 255,0.3)] space-y-6 text-center relative overflow-hidden"
        >
          <div className="w-16 h-16 bg-[#D9A9FF]/20 border border-[#D9A9FF] rounded-3xl flex items-center justify-center mx-auto text-[#D9A9FF]">
            <Trophy className="w-8 h-8 animate-bounce" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-display-lg font-bold text-white uppercase tracking-wider">
              ¡Entrenamiento Rítmico Completado! 🎉
            </h3>
            <p className="text-xs text-[#8A8A8A] font-medium">
              Excelente control de acentos en el tempo de {bpm} BPM.
            </p>
          </div>

          {/* Estadísticas de la Sesión */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0A0A0A] p-4 rounded-xl border border-[#262626]">
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-[#8A8A8A] uppercase block">Puntaje Final</span>
              <span className="text-lg font-mono font-bold text-[#D9A9FF]">{score}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-[#8A8A8A] uppercase block">Máximo Combo</span>
              <span className="text-lg font-mono font-bold text-amber-400">{maxCombo}x</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-[#8A8A8A] uppercase block">Precisión Ritmo</span>
              <span className="text-lg font-mono font-bold text-emerald-400">{accuracyPct}%</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-[#8A8A8A] uppercase block">Perfects / Misses</span>
              <span className="text-xs font-mono font-bold text-white">{stats.perfect} / {stats.miss}</span>
            </div>
          </div>

          {/* Reclamo de Puntos Extras */}
          <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#D9A9FF]/30 flex flex-col sm:flex-row justify-between items-center gap-4 text-left">
            <div>
              <h4 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D9A9FF]" /> Recompensa de Puntos Waack
              </h4>
              <p className="text-[11px] text-[#8A8A8A] font-medium mt-0.5">
                Por tu desempeño obtienes <strong>+{Math.max(10, Math.floor(score / 50))} Puntos Extras</strong> para subir en el Ranking.
              </p>
            </div>

            <button
              id="claim-rhythm-bonus-points-btn"
              type="button"
              disabled={pointsClaimed || score <= 0}
              onClick={handleClaimPoints}
              className={`px-5 py-2.5 font-mono font-bold text-xs uppercase rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                pointsClaimed
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-[#D9A9FF] hover:bg-[#B478F0] text-black shadow-lg active:scale-95'
              }`}
            >
              {pointsClaimed ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> ¡Puntos Reclamados!
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Reclamar Puntos Extras
                </>
              )}
            </button>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-center gap-3 pt-2">
            <button
              id="play-again-rhythm-game-btn"
              type="button"
              onClick={startGame}
              className="px-6 py-2.5 bg-[#C23E9E] hover:bg-[#802230] text-white font-mono font-bold text-xs uppercase rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Jugar Otra Ronda
            </button>
            <button
              id="close-rhythm-game-btn"
              type="button"
              onClick={() => setGameOver(false)}
              className="px-6 py-2.5 bg-[#121212] hover:bg-[#1a1a1a] text-[#8A8A8A] hover:text-white border border-[#262626] font-mono font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
