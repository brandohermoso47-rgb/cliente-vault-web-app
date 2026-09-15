import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Lock, 
  Sparkles, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Radio, 
  ListMusic, 
  Share2,
  ShieldAlert,
  Headphones
} from 'lucide-react';
import { PodcastEpisode, PodcastShow } from '../types';

interface AudioPlayerProps {
  episode: PodcastEpisode | null;
  show: PodcastShow | null;
  isSubscribed: boolean;
  onClose?: () => void;
  onSubscribeCTA?: (instructorId: string, instructorName: string) => void;
  nextEpisode?: () => void;
  prevEpisode?: () => void;
}

export default function AudioPlayer({
  episode,
  show,
  isSubscribed,
  onClose,
  onSubscribeCTA,
  nextEpisode,
  prevEpisode
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);

  // Auto play when episode changes if subscribed
  useEffect(() => {
    if (episode && isSubscribed && audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      setIsPlaying(false);
    }
  }, [episode?.id, isSubscribed]);

  // Sync playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  if (!episode || !show) return null;

  const handleTogglePlay = () => {
    if (!isSubscribed) {
      if (onSubscribeCTA && show) {
        onSubscribeCTA(show.instructorId, show.instructorName);
      }
      return;
    }

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.warn('Audio playback error:', err));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (!isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const skipTime = (seconds: number) => {
    if (!isSubscribed || !audioRef.current) return;
    audioRef.current.currentTime = Math.min(Math.max(0, audioRef.current.currentTime + seconds), duration);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const speedOptions = [0.8, 1.0, 1.25, 1.5, 2.0];

  return (
    <>
      {/* Hidden HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src={isSubscribed ? episode.audioUrl : ''}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={() => {
          setIsPlaying(false);
          if (nextEpisode) nextEpisode();
        }}
      />

      {/* Floating Audio Player Bar */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className={`fixed bottom-0 left-0 right-0 z-50 bg-[#0d0e1b]/98 border-t-2 border-[#D9A9FF]/40 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl text-white transition-all duration-300 ${
          isMinimized ? 'py-2 px-4' : 'py-3.5 px-4 sm:px-6'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col gap-2">
          
          {/* Top Bar Controls & Episode Title */}
          <div className="flex items-center justify-between gap-3">
            {/* Left: Cover Art & Metadata */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative group shrink-0">
                <img
                  src={episode.artworkUrl || show.coverImage}
                  alt={episode.title}
                  className={`rounded-xl object-cover border border-white/20 shadow-md transition-all ${
                    isMinimized ? 'w-10 h-10' : 'w-12 h-12 sm:w-14 sm:h-14'
                  }`}
                  referrerPolicy="no-referrer"
                />
                {!isSubscribed && (
                  <div className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center border border-[#C23E9E]">
                    <Lock className="w-4 h-4 text-[#D9A9FF]" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-[#D9A9FF]/20 border border-[#D9A9FF]/40 text-[#D9A9FF] font-mono text-[9px] font-bold uppercase tracking-wider">
                    PODCAST
                  </span>
                  {episode.episodeNumber && (
                    <span className="text-[10px] font-mono text-gray-400">
                      T{episode.seasonNumber || 1}:E{episode.episodeNumber}
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-white truncate leading-tight mt-0.5">
                  {episode.title}
                </h4>
                <p className="text-[11px] text-gray-400 truncate">
                  {show.title} • <span className="text-[#D9A9FF]">{show.instructorName}</span>
                </p>
              </div>
            </div>

            {/* Middle Controls (Play/Pause, Skip) - Desktop & Tablet */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              <button
                onClick={() => skipTime(-10)}
                disabled={!isSubscribed}
                className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title="Retroceder 10s"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleTogglePlay}
                className={`p-3.5 rounded-full font-bold transition-all shadow-lg flex items-center justify-center cursor-pointer ${
                  !isSubscribed
                    ? 'bg-[#C23E9E] hover:bg-[#C13F9C] text-white ring-2 ring-[#D9A9FF]/50'
                    : isPlaying
                      ? 'bg-[#D9A9FF] text-black hover:scale-105 shadow-[0_0_20px_rgba(217, 169, 255,0.5)]'
                      : 'bg-[#D9A9FF] text-black hover:scale-105 shadow-[0_0_20px_rgba(217, 169, 255,0.3)]'
                }`}
                title={!isSubscribed ? 'Suscríbete para escuchar' : isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {!isSubscribed ? (
                  <Lock className="w-5 h-5" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={() => skipTime(30)}
                disabled={!isSubscribed}
                className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title="Adelantar 30s"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            {/* Right Side: Speed, Volume, Minimize, Close */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Speed Selector */}
              {isSubscribed && (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-[10px] font-mono font-bold text-gray-300 hover:text-white transition-all"
                  >
                    {playbackRate}x
                  </button>
                  {showSpeedMenu && (
                    <div className="absolute bottom-full mb-2 right-0 bg-[#121212] border border-white/20 rounded-xl p-1.5 shadow-2xl flex flex-col gap-1 z-50 min-w-[70px]">
                      {speedOptions.map(rate => (
                        <button
                          key={rate}
                          onClick={() => {
                            setPlaybackRate(rate);
                            setShowSpeedMenu(false);
                          }}
                          className={`px-2 py-1 text-[11px] font-mono font-bold rounded-lg text-left transition-all ${
                            playbackRate === rate ? 'bg-[#D9A9FF] text-black' : 'text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Volume Slider */}
              {isSubscribed && (
                <div className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 px-2.5 py-1 rounded-xl">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-gray-400 hover:text-white"
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      setIsMuted(false);
                    }}
                    className="w-16 accent-[#D9A9FF] h-1.5 bg-gray-700 rounded-lg cursor-pointer"
                  />
                </div>
              )}

              {/* Mobile Play Button */}
              <button
                onClick={handleTogglePlay}
                className={`md:hidden p-2.5 rounded-full font-bold transition-all shadow-md ${
                  !isSubscribed
                    ? 'bg-[#C23E9E] text-white'
                    : isPlaying
                      ? 'bg-[#D9A9FF] text-black'
                      : 'bg-[#D9A9FF] text-black'
                }`}
              >
                {!isSubscribed ? (
                  <Lock className="w-4 h-4" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              {/* Toggle Minimize */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all"
                title={isMinimized ? "Expandir reproductor" : "Minimizar reproductor"}
              >
                {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {/* Close Player */}
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-red-400 transition-all"
                  title="Cerrar reproductor"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar & Time Indicators */}
          {!isMinimized && (
            <div className="flex items-center gap-3 pt-1">
              <span className="text-[10px] font-mono text-gray-400 w-10 text-right">
                {formatTime(currentTime)}
              </span>
              
              <div className="flex-1 relative flex items-center">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  disabled={!isSubscribed}
                  className="w-full accent-[#D9A9FF] h-1.5 bg-white/15 rounded-lg cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                />
              </div>

              <span className="text-[10px] font-mono text-gray-400 w-10">
                {formatTime(duration)}
              </span>
            </div>
          )}

          {/* Locked Subscription Notice Banner */}
          {!isSubscribed && !isMinimized && (
            <div className="mt-2 p-3 rounded-2xl bg-gradient-to-r from-[#C23E9E]/30 via-purple-950/40 to-[#0A0A0A] border border-[#C23E9E]/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#C23E9E]/40 border border-[#D9A9FF]/50 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-[#D9A9FF]" />
                </div>
                <div>
                  <h5 className="font-mono font-bold text-xs uppercase text-[#D9A9FF] tracking-wider">
                    Contenido Exclusivo para Suscriptores
                  </h5>
                  <p className="text-[11px] text-gray-300">
                    Suscríbete al instructor <span className="text-white font-bold">{show.instructorName}</span> para escuchar todos los episodios de este podcast y acceder a sus clases.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (onSubscribeCTA) {
                    onSubscribeCTA(show.instructorId, show.instructorName);
                  }
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#D9A9FF] to-[#f3d775] text-black font-bold text-xs shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Suscribirme a {show.instructorName}
              </button>
            </div>
          )}

        </div>
      </motion.div>
    </>
  );
}
