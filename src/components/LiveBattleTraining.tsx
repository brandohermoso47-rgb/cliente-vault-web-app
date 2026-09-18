import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, 
  Users, 
  Video, 
  VideoOff, 
  Volume2, 
  VolumeX, 
  Music, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Flame, 
  UserPlus, 
  Copy, 
  Clock, 
  Share2, 
  Heart, 
  Award,
  Zap,
  Disc,
  Disc3,
  ExternalLink
} from 'lucide-react';
import { User, BattleDoc } from '../types';
import { Language } from '../lib/translations';
import { FriendsModal } from './FriendsModal';
import { createBattleInvitation } from '../lib/friendsAndBattles';

interface LiveBattleTrainingProps {
  currentUser: User;
  language: Language;
}

interface GuestDancer {
  id: string;
  name: string;
  avatar: string;
  role: string;
  status: 'online' | 'ready' | 'invited';
}

const DEFAULT_GUESTS: GuestDancer[] = [
  {
    id: 'guest-1',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=250',
    role: 'Waacker Invitada',
    status: 'ready'
  },
  {
    id: 'guest-2',
    name: 'Pedro DiscoBoy',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    role: 'Freestyler',
    status: 'online'
  },
  {
    id: 'guest-3',
    name: 'Sara Whacking',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
    role: 'Estudiante Avanzada',
    status: 'ready'
  }
];

export interface TrackItem {
  id: string;
  title: string;
  artist: string;
  genre: 'Disco' | 'Funk' | 'Disco-Funk';
  bpm: number;
  youtubeUrl: string;
  embedId: string;
  cover: string;
}

const DISCO_FUNK_TRACKS: TrackItem[] = [
  {
    id: 'track-1',
    title: 'September',
    artist: 'Earth, Wind & Fire',
    genre: 'Disco-Funk',
    bpm: 126,
    youtubeUrl: 'https://www.youtube.com/watch?v=Gs069dndIYk',
    embedId: 'Gs069dndIYk',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'track-2',
    title: 'Le Freak',
    artist: 'CHIC',
    genre: 'Disco',
    bpm: 119,
    youtubeUrl: 'https://www.youtube.com/watch?v=h1qQ1SKNlgY',
    embedId: 'h1qQ1SKNlgY',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'track-3',
    title: 'Superstition',
    artist: 'Stevie Wonder',
    genre: 'Funk',
    bpm: 101,
    youtubeUrl: 'https://www.youtube.com/watch?v=0CFuCYNx-1g',
    embedId: '0CFuCYNx-1g',
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'track-4',
    title: 'Give Me the Night',
    artist: 'George Benson',
    genre: 'Disco-Funk',
    bpm: 110,
    youtubeUrl: 'https://www.youtube.com/watch?v=imYJpr09sys',
    embedId: 'imYJpr09sys',
    cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'track-5',
    title: 'Get Down Tonight',
    artist: 'KC & The Sunshine Band',
    genre: 'Disco',
    bpm: 118,
    youtubeUrl: 'https://www.youtube.com/watch?v=LHEsE9yN2CY',
    embedId: 'LHEsE9yN2CY',
    cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=300'
  }
];

export default function LiveBattleTraining({ currentUser, language }: LiveBattleTrainingProps) {
  // Guest user state
  const [selectedGuest, setSelectedGuest] = useState<GuestDancer>(DEFAULT_GUESTS[0]);
  const [customGuestName, setCustomGuestName] = useState<string>('');
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [inviteCopied, setInviteCopied] = useState<boolean>(false);

  // Selected Track
  const [selectedTrack, setSelectedTrack] = useState<TrackItem>(DISCO_FUNK_TRACKS[0]);
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);

  // Camera states
  const [isUserCamOn, setIsUserCamOn] = useState<boolean>(true);
  const [isGuestCamOn, setIsGuestCamOn] = useState<boolean>(true);
  const userVideoRef = useRef<HTMLVideoElement | null>(null);
  const [userStream, setUserStream] = useState<MediaStream | null>(null);

  // Battle / Training State Machine
  // 'idle' | 'countdown' | 'in_progress' | 'completed'
  const [battleState, setBattleState] = useState<'idle' | 'countdown' | 'in_progress' | 'completed'>('idle');

  // Countdown timer before starting (3, 2, 1)
  const [countdownValue, setCountdownValue] = useState<number>(3);

  // Turn management:
  // Round 1: Turn 1 (User), Turn 2 (Guest)
  // Round 2: Turn 3 (User), Turn 4 (Guest)
  // Current active dancer: 'user' | 'guest'
  const [currentRound, setCurrentRound] = useState<number>(1); // 1 or 2
  const [activeDancer, setActiveDancer] = useState<'user' | 'guest'>('user');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60); // 1 minute = 60s per turn

  // High-fives exchanged
  const [highFivesCount, setHighFivesCount] = useState<number>(0);
  const [showHighFiveAnim, setShowHighFiveAnim] = useState<boolean>(false);

  // User webcam stream setup
  useEffect(() => {
    if (isUserCamOn && battleState !== 'completed') {
      if (navigator?.mediaDevices?.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
          .then((stream) => {
            setUserStream(stream);
            if (userVideoRef.current) {
              userVideoRef.current.srcObject = stream;
            }
          })
          .catch((err) => {
            console.warn("Cámara no disponible directamente o bloqueada por navegador. Se utiliza visualizador HD de transmisión.");
          });
      } else {
        console.warn("Dispositivo no soporta mediaDevices.getUserMedia.");
      }
    } else {
      if (userStream) {
        userStream.getTracks().forEach(t => t.stop());
        setUserStream(null);
      }
    }
    return () => {
      if (userStream) {
        userStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isUserCamOn, battleState]);

  // Countdown logic (3, 2, 1)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (battleState === 'countdown') {
      if (countdownValue > 1) {
        timer = setTimeout(() => {
          setCountdownValue(prev => prev - 1);
        }, 1000);
      } else if (countdownValue === 1) {
        timer = setTimeout(() => {
          setBattleState('in_progress');
          setCurrentRound(1);
          setActiveDancer('user');
          setSecondsRemaining(60);
          setIsPlayingMusic(true);
        }, 1000);
      }
    }
    return () => clearTimeout(timer);
  }, [battleState, countdownValue]);

  // Turn timer logic (60 seconds per turn, 2 rounds per dancer)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (battleState === 'in_progress') {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev > 1) {
            return prev - 1;
          } else {
            // Turn finished! Advance turn or round or finish battle
            handleAdvanceTurn();
            return 60;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [battleState, currentRound, activeDancer]);

  const handleAdvanceTurn = () => {
    if (activeDancer === 'user' && currentRound === 1) {
      // Move to Guest, Round 1
      setActiveDancer('guest');
      setSecondsRemaining(60);
    } else if (activeDancer === 'guest' && currentRound === 1) {
      // Move to User, Round 2
      setCurrentRound(2);
      setActiveDancer('user');
      setSecondsRemaining(60);
    } else if (activeDancer === 'user' && currentRound === 2) {
      // Move to Guest, Round 2
      setActiveDancer('guest');
      setSecondsRemaining(60);
    } else if (activeDancer === 'guest' && currentRound === 2) {
      // Battle Finished!
      setBattleState('completed');
      setIsPlayingMusic(false);
    }
  };

  const handleStartTraining = () => {
    // Select a random track if desired or use current track
    setCountdownValue(3);
    setBattleState('countdown');
  };

  const handleRandomTrack = () => {
    const randomIndex = Math.floor(Math.random() * DISCO_FUNK_TRACKS.length);
    setSelectedTrack(DISCO_FUNK_TRACKS[randomIndex]);
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(`https://waackon.app/live-battle-training?host=${encodeURIComponent(currentUser.name)}`);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 3000);
  };

  const triggerHighFive = () => {
    setHighFivesCount(prev => prev + 1);
    setShowHighFiveAnim(true);
    setTimeout(() => setShowHighFiveAnim(false), 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#09080d] text-white flex flex-col font-body-md space-y-6">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#1c122c] via-[#2d1838] to-[#141221] p-6 rounded-3xl border border-[#D9A9FF]/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D9A9FF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[10px] font-mono font-black text-[#D9A9FF] bg-[#D9A9FF]/10 border border-[#D9A9FF]/30 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                <Radio className="w-3.5 h-3.5 text-[#D9A9FF] animate-pulse" />
                TRANSMISIÓN PRIVADA 1VS1
              </span>
              <span className="text-[10px] font-mono font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                MODO ENTRENAMIENTO GRATUITO
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-300 bg-white/5 border border-white/10 px-2 py-1 rounded-full">
                🔒 EXCLUSIVO PAREJA DE BAILE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-[#D9A9FF] shrink-0" />
              Live Battles: Entrenamiento Libre
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-medium leading-relaxed">
              Sesión de interacción en vivo dividida 50/50. Entrena ritmos Disco/Funk alternando turnos de 1 minuto sin presiones ni juzgamiento.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
            {battleState === 'idle' && (
              <button
                type="button"
                onClick={handleStartTraining}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#D9A9FF] to-[#B073E8] text-black font-extrabold text-xs uppercase tracking-wider shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                Iniciar Sesión de Entrenamiento (3,2,1)
              </button>
            )}

            {battleState === 'in_progress' && (
              <button
                type="button"
                onClick={() => setBattleState('completed')}
                className="px-5 py-2.5 rounded-2xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/40 font-bold text-xs uppercase tracking-wider transition-all"
              >
                Finalizar Entrenamiento
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/15 font-bold text-xs uppercase transition-all flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-[#D9A9FF]" />
              Cambiar / Invitar Pareja
            </button>
          </div>
        </div>
      </div>

      {/* DISCO / FUNK INTEGRATED PLAYER BAR */}
      <div className="bg-[#13111c] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#D9A9FF]/40 shrink-0 shadow-lg group">
            <img 
              src={selectedTrack.cover} 
              alt={selectedTrack.title}
              className={`w-full h-full object-cover ${isPlayingMusic ? 'animate-spin-slow' : ''}`} 
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Disc3 className={`w-6 h-6 text-[#D9A9FF] ${isPlayingMusic ? 'animate-spin' : ''}`} />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold text-[#D9A9FF] bg-[#D9A9FF]/15 px-2 py-0.5 rounded uppercase">
                {selectedTrack.genre} • {selectedTrack.bpm} BPM
              </span>
              <span className="text-[9px] text-slate-400 font-mono">Pista Oficial Disco/Funk</span>
            </div>
            <h4 className="text-sm font-black text-white truncate mt-0.5">{selectedTrack.title}</h4>
            <p className="text-xs text-slate-300 truncate">{selectedTrack.artist}</p>
          </div>
        </div>

        {/* Music Controls & Track Selector */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={handleRandomTrack}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold transition-all flex items-center gap-1.5"
            title="Seleccionar otra canción Disco/Funk al azar"
          >
            <Music className="w-3.5 h-3.5 text-[#D9A9FF]" />
            Cambiar Tema
          </button>

          <button
            type="button"
            onClick={() => setIsPlayingMusic(!isPlayingMusic)}
            className="px-4 py-1.5 rounded-xl bg-[#D9A9FF]/20 hover:bg-[#D9A9FF]/30 text-[#D9A9FF] border border-[#D9A9FF]/40 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            {isPlayingMusic ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" /> Pausar Música
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Reproducir Disco Beat
              </>
            )}
          </button>

          <a
            href={selectedTrack.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            YouTube
          </a>
        </div>
      </div>

      {/* Embedded Audio Streamer or Background Disco Sound Synthesizer */}
      {isPlayingMusic && (
        <div className="bg-[#181424] border border-[#D9A9FF]/20 rounded-xl p-3 flex items-center justify-between text-xs text-[#D9A9FF] font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Reproduciendo en Sync: "{selectedTrack.title}" por {selectedTrack.artist} ({selectedTrack.genre})</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <Zap className="w-3 h-3 text-[#D9A9FF]" />
            <span>Ecualización Disco Optimizada para Waacking</span>
          </div>
        </div>
      )}

      {/* TURN & ROUND STATUS HUD PANEL (When Battle in progress) */}
      {battleState === 'in_progress' && (
        <div className="bg-gradient-to-r from-[#1f172b] via-[#2b1e38] to-[#1a1526] border-2 border-[#D9A9FF]/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#D9A9FF] text-black font-black text-xl flex items-center justify-center shadow-lg">
              R{currentRound}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-[#D9A9FF] uppercase tracking-wider">
                  RONDA {currentRound} DE 2 • TURNO 1 MINUTO
                </span>
              </div>
              <h3 className="text-base font-black text-white uppercase flex items-center gap-2 mt-0.5">
                EN PISTA:
                <span className="text-[#D9A9FF] underline decoration-wavy">
                  {activeDancer === 'user' ? currentUser.name : selectedGuest.name}
                </span>
              </h3>
            </div>
          </div>

          {/* Prominent 60-second Timer */}
          <div className="flex items-center gap-4 bg-black/60 border border-white/15 px-6 py-2.5 rounded-2xl">
            <Clock className="w-6 h-6 text-[#D9A9FF] animate-spin-slow" />
            <div className="text-center">
              <p className="text-[9px] font-mono font-bold text-slate-400 uppercase">Tiempo Restante</p>
              <p className="text-2xl font-black font-mono text-white tracking-widest">
                0:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={triggerHighFive}
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-extrabold uppercase transition-all flex items-center gap-1.5 shadow-lg active:scale-95"
            >
              <Heart className="w-4 h-4 fill-current text-amber-400" />
              Enviar Choca Esos 5 🙌 ({highFivesCount})
            </button>
            <button
              type="button"
              onClick={handleAdvanceTurn}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition-all"
              title="Pasar turno de un minuto manualmente"
            >
              Siguiente Turno ➔
            </button>
          </div>
        </div>
      )}

      {/* 50/50 SPLIT SCREEN CONTAINER */}
      <div className="relative min-h-[460px] flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 rounded-3xl overflow-hidden border border-white/10 bg-black/80 p-3 shadow-2xl">
        
        {/* COUNTDOWN OVERLAY (3, 2, 1) */}
        <AnimatePresence>
          {battleState === 'countdown' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4"
            >
              <div className="w-20 h-20 rounded-full bg-[#D9A9FF]/20 border-2 border-[#D9A9FF] flex items-center justify-center text-[#D9A9FF]">
                <Radio className="w-10 h-10 animate-ping" />
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider">
                ¡Listos para el Entrenamiento!
              </h2>
              <p className="text-xs text-slate-300 max-w-sm">
                Iniciando la sesión Disco/Funk entre {currentUser.name} y {selectedGuest.name}...
              </p>
              <motion.div 
                key={countdownValue}
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                className="text-7xl sm:text-8xl font-black font-mono text-[#D9A9FF] drop-shadow-[0_0_25px_rgba(217, 169, 255,0.8)] my-2"
              >
                {countdownValue}
              </motion.div>
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                ¡Prepara tus brazos y poses!
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* COMPLETION OVERLAY (NO WINNER ANNOUNCED - TRAINING FINISHED) */}
        <AnimatePresence>
          {battleState === 'completed' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 z-40 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-6 overflow-y-auto"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-10 h-10" />
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full uppercase tracking-widest">
                  ENTRENAMIENTO FINALIZADO SIN EVALUACIÓN
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-2">
                  ¡Gran Trabajo en la Pista de Baile! 🙌
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mt-2 leading-relaxed">
                  Completasteis los 4 turnos de 1 minuto con ritmo y musicalidad. Recuerda que este modo es 100% de entrenamiento libre para compartir ideas y disfrutar el waacking.
                </p>
              </div>

              {/* Stats & Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md w-full text-left">
                <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
                  <p className="text-[10px] text-slate-400 font-mono uppercase">Tiempo Total</p>
                  <p className="text-base font-extrabold text-white mt-0.5">4 Minutos (2 Rondas)</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
                  <p className="text-[10px] text-slate-400 font-mono uppercase">Tema Bailado</p>
                  <p className="text-xs font-bold text-[#D9A9FF] mt-0.5 truncate">{selectedTrack.title}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl col-span-2 sm:col-span-1">
                  <p className="text-[10px] text-slate-400 font-mono uppercase">Interacción</p>
                  <p className="text-base font-extrabold text-amber-300 mt-0.5">{highFivesCount} Choca Esos 5</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleStartTraining}
                  className="px-6 py-3 rounded-2xl bg-[#D9A9FF] hover:bg-[#B073E8] text-black text-xs font-black uppercase tracking-wider transition-all shadow-xl hover:scale-105"
                >
                  Repetir Entrenamiento (3,2,1)
                </button>
                <button
                  type="button"
                  onClick={() => setBattleState('idle')}
                  className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase transition-all"
                >
                  Volver al Panel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HIGH FIVE ANIMATION OVERLAY */}
        {showHighFiveAnim && (
          <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-6xl"
            >
              🙌⚡🔥
            </motion.div>
          </div>
        )}

        {/* LEFT PART: PRINCIPAL USER (50% SPLIT) */}
        <div className={`relative rounded-2xl overflow-hidden border-2 transition-all flex flex-col justify-between p-4 min-h-[360px] ${
          battleState === 'in_progress' && activeDancer === 'user'
            ? 'border-[#D9A9FF] shadow-[0_0_30px_rgba(217, 169, 255,0.3)] bg-gradient-to-b from-[#281e33] to-black'
            : 'border-white/15 bg-[#12101a]'
        }`}>
          {/* Active Turn Highlight Ribbon */}
          {battleState === 'in_progress' && activeDancer === 'user' && (
            <div className="absolute top-0 left-0 right-0 bg-[#D9A9FF] text-black text-[10px] font-black uppercase font-mono tracking-widest py-1 px-3 text-center z-10 shadow-md">
              🔴 TU TURNO EN PISTA (RONDA {currentRound}) - ¡A BAILAR!
            </div>
          )}

          {/* Stream Display */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            {isUserCamOn ? (
              <video 
                ref={userVideoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="text-center p-6 space-y-2">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#D9A9FF] mx-auto shadow-xl">
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-xs font-bold text-slate-300">Cámara desactivada</p>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />
          </div>

          {/* Header Info */}
          <div className="relative z-10 flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
              <div className="w-7 h-7 rounded-full overflow-hidden border border-[#D9A9FF] shrink-0">
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-[9px] font-mono text-[#D9A9FF] font-bold uppercase">USUARIO PRINCIPAL</p>
                <h4 className="text-xs font-extrabold text-white leading-tight">{currentUser.name}</h4>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsUserCamOn(!isUserCamOn)}
              className="p-2 rounded-xl bg-black/70 hover:bg-black text-white border border-white/20 transition-all text-xs"
              title="Encender/Apagar mi cámara"
            >
              {isUserCamOn ? <Video className="w-4 h-4 text-emerald-400" /> : <VideoOff className="w-4 h-4 text-rose-400" />}
            </button>
          </div>

          {/* Bottom Watermark */}
          <div className="relative z-10 flex items-center justify-between bg-black/80 backdrop-blur-md p-2.5 rounded-xl border border-white/10 text-xs">
            <span className="text-[10px] font-mono text-slate-300 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D9A9FF]" /> Transmisión Segura
            </span>
            <span className="text-[10px] font-mono text-slate-400">Audio Muteado Local</span>
          </div>
        </div>

        {/* RIGHT PART: INVITED GUEST (50% SPLIT) */}
        <div className={`relative rounded-2xl overflow-hidden border-2 transition-all flex flex-col justify-between p-4 min-h-[360px] ${
          battleState === 'in_progress' && activeDancer === 'guest'
            ? 'border-[#D9A9FF] shadow-[0_0_30px_rgba(217, 169, 255,0.3)] bg-gradient-to-b from-[#281e33] to-black'
            : 'border-white/15 bg-[#12101a]'
        }`}>
          {/* Active Turn Highlight Ribbon */}
          {battleState === 'in_progress' && activeDancer === 'guest' && (
            <div className="absolute top-0 left-0 right-0 bg-[#D9A9FF] text-black text-[10px] font-black uppercase font-mono tracking-widest py-1 px-3 text-center z-10 shadow-md">
              🔴 TURNO DE {selectedGuest.name.toUpperCase()} (RONDA {currentRound})
            </div>
          )}

          {/* Guest Stream Display */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            {isGuestCamOn ? (
              <img 
                src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=800" 
                alt="Guest Dancer Live Stream"
                className="w-full h-full object-cover opacity-90" 
              />
            ) : (
              <div className="text-center p-6 space-y-2">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-500 mx-auto shadow-xl">
                  <img src={selectedGuest.avatar} alt={selectedGuest.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-xs font-bold text-slate-400">Cámara de la pareja apagada</p>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />
          </div>

          {/* Header Info */}
          <div className="relative z-10 flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
              <div className="w-7 h-7 rounded-full overflow-hidden border border-purple-400 shrink-0">
                <img src={selectedGuest.avatar} alt={selectedGuest.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-[9px] font-mono text-purple-300 font-bold uppercase">PAREJA / INVITADO(A)</p>
                <h4 className="text-xs font-extrabold text-white leading-tight">{selectedGuest.name}</h4>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsGuestCamOn(!isGuestCamOn)}
              className="p-2 rounded-xl bg-black/70 hover:bg-black text-white border border-white/20 transition-all text-xs"
              title="Simular cámara de pareja"
            >
              {isGuestCamOn ? <Video className="w-4 h-4 text-emerald-400" /> : <VideoOff className="w-4 h-4 text-rose-400" />}
            </button>
          </div>

          {/* Bottom Watermark */}
          <div className="relative z-10 flex items-center justify-between bg-black/80 backdrop-blur-md p-2.5 rounded-xl border border-white/10 text-xs">
            <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Conectado en Vivo
            </span>
            <span className="text-[10px] font-mono text-slate-400">{selectedGuest.role}</span>
          </div>
        </div>
      </div>

      {/* MODAL: FRIENDS & BATTLES SELECTOR */}
      <FriendsModal 
        currentUser={currentUser}
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInviteToBattle={async (friend) => {
          setSelectedGuest({
            id: friend.id,
            name: friend.displayName || friend.name,
            avatar: friend.avatar || friend.photoURL || '',
            role: 'Bailarín Amigo',
            status: 'invited'
          });
          setShowInviteModal(false);
          try {
            await createBattleInvitation(currentUser, friend);
            alert(`¡Invitación enviada a ${friend.displayName || friend.name}! Recibirá una notificación instantánea en su pantalla.`);
          } catch (e) {
            console.error(e);
          }
        }}
      />
    </div>
  );
}
