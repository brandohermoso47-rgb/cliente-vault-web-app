import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Flame,
  Crown,
  Sparkles,
  Video,
  Play,
  Pause,
  Upload,
  Plus,
  Heart,
  MessageSquare,
  Award,
  Calendar,
  Clock,
  Music,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Filter,
  Medal,
  Share2,
  Eye,
  Info,
  X,
  Volume2,
  VolumeX,
  Send,
  Zap,
  Users,
  Maximize2
} from 'lucide-react';
import { 
  User, 
  WeeklyCommunityChallenge, 
  WeeklyChallengeSubmission, 
  PastChallengeWinner 
} from '../types';
import { INITIAL_WEEKLY_CHALLENGE, INITIAL_PAST_CHALLENGE_WINNERS } from '../data';
import { Language, translations } from '../lib/translations';

interface WeeklyCommunityChallengeViewProps {
  currentUser: User;
  language: Language;
  onOpenVideo?: (videoUrl: string, title?: string) => void;
}

interface FloatingHeartPulse {
  id: string;
  x: number;
  y: number;
  icon: 'heart' | 'flame' | 'queen' | 'precision' | 'sparkle';
  label: string;
}

export default function WeeklyCommunityChallengeView({
  currentUser,
  language,
  onOpenVideo
}: WeeklyCommunityChallengeViewProps) {
  // 1. Challenge State with local persistence
  const [challenge, setChallenge] = useState<WeeklyCommunityChallenge>(() => {
    try {
      const saved = localStorage.getItem('waack_weekly_challenge');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.submissions) return parsed;
      }
    } catch (e) {}
    return INITIAL_WEEKLY_CHALLENGE;
  });

  const [pastWinners, setPastWinners] = useState<PastChallengeWinner[]>(() => {
    try {
      const saved = localStorage.getItem('waack_past_challenge_winners');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_PAST_CHALLENGE_WINNERS;
  });

  // Navigation within the challenge view
  const [activeTab, setActiveTab] = useState<'challenge' | 'leaderboard' | 'gallery' | 'past_winners'>('challenge');

  // Submit Entry Form Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [entryTitle, setEntryTitle] = useState('');
  const [entryVideoUrl, setEntryVideoUrl] = useState('');
  const [entryNotes, setEntryNotes] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Active Video Lightbox Modal
  const [activeVideoItem, setActiveVideoItem] = useState<{
    url: string;
    title: string;
    dancer: string;
    notes?: string;
    feedback?: any;
  } | null>(null);

  // Audio preview playing state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Sort filter for gallery submissions
  const [gallerySort, setGallerySort] = useState<'votes' | 'recent' | 'score'>('votes');

  // Criteria accordion toggle
  const [showAllCriteria, setShowAllCriteria] = useState(true);

  // Floating heart-pulses & confetti animation states
  const [floatingPulses, setFloatingPulses] = useState<FloatingHeartPulse[]>([]);
  const [recentlyVotedSubmissionId, setRecentlyVotedSubmissionId] = useState<string | null>(null);

  // Save challenge state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('waack_weekly_challenge', JSON.stringify(challenge));
    } catch (e) {}
  }, [challenge]);

  // Audio player cleanup
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
      }
    };
  }, [audioElement]);

  const toggleAudioTrack = () => {
    if (!challenge.recommendedTrack.audioUrl) return;

    if (isPlayingAudio && audioElement) {
      audioElement.pause();
      setIsPlayingAudio(false);
    } else {
      if (audioElement) {
        audioElement.play().catch(() => {});
        setIsPlayingAudio(true);
      } else {
        const audio = new Audio(challenge.recommendedTrack.audioUrl);
        audio.loop = true;
        audio.play().then(() => {
          setIsPlayingAudio(true);
        }).catch(() => {
          setIsPlayingAudio(false);
        });
        audio.onended = () => setIsPlayingAudio(false);
        setAudioElement(audio);
      }
    }
  };

  // Submit a new video entry
  const handleSubmitEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryTitle.trim()) {
      setSubmitError('Por favor ingresa un título para tu video.');
      return;
    }
    if (!entryVideoUrl.trim()) {
      setSubmitError('Por favor ingresa el enlace URL de tu video (YouTube, Vimeo o MP4).');
      return;
    }

    setSubmitError('');

    const newSub: WeeklyChallengeSubmission = {
      id: `sub-${Date.now()}`,
      challengeId: challenge.id,
      userId: currentUser.id,
      dancerName: currentUser.nickname || currentUser.name || 'Dancer Waacker',
      dancerAvatar: currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      dancerLevel: currentUser.level ? `Nivel ${currentUser.level}` : 'Nivel 1 • Miembro',
      videoUrl: entryVideoUrl.trim(),
      videoThumbnail: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=600',
      title: entryTitle.trim(),
      notes: entryNotes.trim() || undefined,
      submittedAt: 'Recién subido',
      votesCount: 1,
      reactions: {
        fire: 1,
        queen: 0,
        precision: 0,
        drama: 0
      },
      votedByMe: true,
      myReaction: 'fire',
      score: 85.0
    };

    setChallenge(prev => {
      const updatedSubmissions = [newSub, ...prev.submissions];
      return {
        ...prev,
        submissions: updatedSubmissions
      };
    });

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setIsSubmitModalOpen(false);
      setEntryTitle('');
      setEntryVideoUrl('');
      setEntryNotes('');
      setActiveTab('gallery');
    }, 1500);
  };

  // Trigger subtle celebratory confetti and heart pulse effect
  const triggerConfettiAndPulse = (
    e?: React.MouseEvent,
    reactionType: 'fire' | 'queen' | 'precision' | 'drama' | 'heart' = 'heart',
    submissionId?: string
  ) => {
    // 1. Confetti Burst origin
    let origin = { x: 0.5, y: 0.6 };
    let posX = window.innerWidth / 2;
    let posY = window.innerHeight / 2;

    if (e && e.clientX && e.clientY) {
      origin = {
        x: Math.max(0.1, Math.min(0.9, e.clientX / window.innerWidth)),
        y: Math.max(0.1, Math.min(0.9, e.clientY / window.innerHeight))
      };
      posX = e.clientX;
      posY = e.clientY;
    }

    // Subtle celebratory confetti
    confetti({
      particleCount: 36,
      spread: 60,
      origin,
      colors: ['#E9C349', '#FF4D6D', '#C084FC', '#F59E0B', '#38BDF8', '#FFFFFF'],
      ticks: 150,
      gravity: 1.15,
      scalar: 0.85,
      shapes: ['circle', 'square'],
      disableForReducedMotion: true
    });

    // 2. Floating Heart Pulse Item
    const newPulse: FloatingHeartPulse = {
      id: `${Date.now()}-${Math.random()}`,
      x: posX,
      y: posY,
      icon: reactionType === 'queen' ? 'queen' : reactionType === 'precision' ? 'precision' : reactionType === 'fire' ? 'flame' : 'heart',
      label: reactionType === 'queen' ? '+1 Queen Style 👑' : reactionType === 'precision' ? '+1 Precisión ⚡' : reactionType === 'fire' ? '+1 Waack Fire 🔥' : '+1 Voto ❤️'
    };

    setFloatingPulses(prev => [...prev.slice(-6), newPulse]);
    setTimeout(() => {
      setFloatingPulses(prev => prev.filter(p => p.id !== newPulse.id));
    }, 1200);

    // 3. Trigger card pulse effect
    if (submissionId) {
      setRecentlyVotedSubmissionId(submissionId);
      setTimeout(() => {
        setRecentlyVotedSubmissionId(prev => prev === submissionId ? null : prev);
      }, 1200);
    }
  };

  // Handle reaction or vote on submission
  const handleReaction = (
    submissionId: string, 
    reactionType: 'fire' | 'queen' | 'precision' | 'drama' | 'heart',
    e?: React.MouseEvent
  ) => {
    let wasAdded = false;

    setChallenge(prev => {
      const updated = prev.submissions.map(sub => {
        if (sub.id !== submissionId) return sub;

        const effectiveReactionType: 'fire' | 'queen' | 'precision' | 'drama' = reactionType === 'heart' ? 'fire' : reactionType;
        const currentReaction = sub.myReaction;
        const currentReactions = { ...sub.reactions };
        let newVotesCount = sub.votesCount;
        let newMyReaction: 'fire' | 'queen' | 'precision' | 'drama' | undefined = effectiveReactionType;

        if (currentReaction === effectiveReactionType) {
          // Toggle off
          currentReactions[effectiveReactionType] = Math.max(0, (currentReactions[effectiveReactionType] || 1) - 1);
          newVotesCount = Math.max(0, newVotesCount - 1);
          newMyReaction = undefined;
        } else {
          // Switch or add
          wasAdded = true;
          if (currentReaction) {
            currentReactions[currentReaction] = Math.max(0, (currentReactions[currentReaction] || 1) - 1);
          } else {
            newVotesCount += 1;
          }
          currentReactions[effectiveReactionType] = (currentReactions[effectiveReactionType] || 0) + 1;
        }

        return {
          ...sub,
          reactions: currentReactions,
          votesCount: newVotesCount,
          votedByMe: !!newMyReaction,
          myReaction: newMyReaction
        };
      });

      return {
        ...prev,
        submissions: updated
      };
    });

    // Trigger celebration if added
    if (wasAdded) {
      triggerConfettiAndPulse(e, reactionType, submissionId);
    }
  };

  // Sort submissions based on user selection
  const sortedSubmissions = [...(challenge.submissions || [])].sort((a, b) => {
    if (gallerySort === 'votes') {
      return (b.votesCount || 0) - (a.votesCount || 0);
    }
    if (gallerySort === 'score') {
      return (b.score || 0) - (a.score || 0);
    }
    return 0; // recent preserves array insertion order
  });

  // Calculate podium top 3 based on votes / score
  const top3Submissions = [...(challenge.submissions || [])]
    .sort((a, b) => ((b.score || 0) * 0.6 + b.votesCount * 0.4) - ((a.score || 0) * 0.6 + a.votesCount * 0.4))
    .slice(0, 3);

  return (
    <div id="weekly-community-challenge-container" className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. HERO BANNER - CURRENT WEEKLY CHALLENGE SPOTLIGHT */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b1424] via-[#121118] to-[#0A0A0E] border-2 border-tertiary/40 shadow-2xl p-6 sm:p-8">
        {/* Glow ambient effects */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#E9C349]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#9A2B3C]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9C349]/15 border border-[#E9C349]/40 text-[#E9C349] text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
                <Trophy className="w-3.5 h-3.5 animate-pulse text-[#E9C349]" />
                Semana #{challenge.weekNumber} • Reto Oficial
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Votaciones Abiertas
              </span>
              <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#E9C349]" />
                Finaliza: {challenge.endDate}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight flex items-center gap-2">
              <span>{challenge.title}</span>
            </h2>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-normal">
              {challenge.description}
            </p>

            {/* Track recommendation & Judge info */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
              {/* Music badge & audio preview button */}
              <div className="flex items-center gap-2 bg-black/40 border border-tertiary/20 rounded-xl px-3.5 py-2">
                <Music className="w-4 h-4 text-[#E9C349] shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-400 block font-mono uppercase">Música Sugerida ({challenge.recommendedTrack.bpm} BPM)</span>
                  <span className="font-bold text-white text-xs">{challenge.recommendedTrack.title}</span>
                </div>
                <button
                  id="btn-preview-challenge-track"
                  onClick={toggleAudioTrack}
                  className={`ml-2 p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                    isPlayingAudio
                      ? 'bg-[#E9C349] text-black border-[#E9C349] shadow-md animate-pulse'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                  title={isPlayingAudio ? 'Pausar audio de referencia' : 'Escuchar audio de referencia'}
                >
                  {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Judge spotlight */}
              <div className="flex items-center gap-2.5 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5">
                <img
                  src={challenge.judge.avatar}
                  alt={challenge.judge.name}
                  className="w-7 h-7 rounded-full object-cover border border-[#E9C349]/40"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <span className="text-[9px] text-gray-400 uppercase font-mono block">Jueza del Reto</span>
                  <span className="text-xs font-bold text-white">{challenge.judge.name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTA Box */}
          <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 bg-black/50 p-4 sm:p-5 rounded-2xl border border-tertiary/30 backdrop-blur-md">
            <div className="text-center lg:text-right">
              <span className="text-[10px] uppercase font-mono text-gray-400 block tracking-wider">Premio al Ganador</span>
              <span className="text-lg font-black text-[#E9C349] flex items-center justify-center lg:justify-end gap-1.5">
                <Sparkles className="w-4 h-4 text-[#E9C349]" />
                +{challenge.rewardXp} XP + Trofeo de Oro
              </span>
              <span className="text-[11px] text-gray-400 font-mono block">
                {(challenge.submissions || []).length} Dancers participando
              </span>
            </div>

            <button
              id="btn-open-submit-challenge-modal"
              onClick={() => setIsSubmitModalOpen(true)}
              className="w-full bg-gradient-to-r from-[#E9C349] to-[#d4af37] hover:from-[#f3ce56] hover:to-[#dfbb43] text-black font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg hover:shadow-[#E9C349]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <Upload className="w-4 h-4" />
              Subir Mi Video al Reto
            </button>
          </div>
        </div>

        {/* Expandable Criteria Box */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <button
            onClick={() => setShowAllCriteria(!showAllCriteria)}
            className="flex items-center justify-between w-full text-xs font-mono font-bold text-gray-300 hover:text-white uppercase tracking-wider transition-colors"
          >
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#E9C349]" />
              Criterios de Evaluación Oficial ({(challenge.criteria || []).length})
            </span>
            {showAllCriteria ? <ChevronDown className="w-4 h-4 text-[#E9C349]" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {showAllCriteria && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-3.5"
              >
                {(challenge.criteria || []).map((crit, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-tertiary/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="text-xs font-bold text-white">{crit.title}</h4>
                      <span className="text-[10px] font-mono font-bold text-[#E9C349] bg-[#E9C349]/10 px-2 py-0.5 rounded-full border border-[#E9C349]/20">
                        {crit.weight}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-normal">
                      {crit.description}
                    </p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUB-NAVIGATION BAR (Leaderboard, Galería de Videos, Ganadores Anteriores) */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-tertiary/20 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            id="tab-challenge-leaderboard"
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 border cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-[#E9C349] text-black border-[#E9C349] shadow-md scale-105'
                : 'bg-[#121118] text-gray-400 border-white/10 hover:border-tertiary/40 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>🏆 Ranking & Podio</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'leaderboard' ? 'bg-black/20 text-black' : 'bg-white/10 text-white'
            }`}>
              Top {top3Submissions.length}
            </span>
          </button>

          <button
            id="tab-challenge-gallery"
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 border cursor-pointer ${
              activeTab === 'gallery'
                ? 'bg-purple-600 text-white border-purple-500 shadow-md scale-105'
                : 'bg-[#121118] text-gray-400 border-white/10 hover:border-purple-500/40 hover:text-purple-300'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>📹 Videos de la Comunidad</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'gallery' ? 'bg-black/30 text-white' : 'bg-white/10 text-white'
            }`}>
              {(challenge.submissions || []).length}
            </span>
          </button>

          <button
            id="tab-challenge-past"
            onClick={() => setActiveTab('past_winners')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 border cursor-pointer ${
              activeTab === 'past_winners'
                ? 'bg-amber-600 text-white border-amber-500 shadow-md scale-105'
                : 'bg-[#121118] text-gray-400 border-white/10 hover:border-amber-500/40 hover:text-amber-300'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>👑 Salón de la Fama</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'past_winners' ? 'bg-black/30 text-white' : 'bg-white/10 text-white'
            }`}>
              {pastWinners.length}
            </span>
          </button>
        </div>

        {/* Gallery Sort Filter (when in gallery tab) */}
        {activeTab === 'gallery' && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] font-mono text-gray-400 uppercase flex items-center gap-1">
              <Filter className="w-3 h-3 text-[#E9C349]" />
              Ordenar por:
            </span>
            <select
              value={gallerySort}
              onChange={(e) => setGallerySort(e.target.value as any)}
              className="bg-[#121118] border border-tertiary/30 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-tertiary font-mono"
            >
              <option value="votes">🔥 Más Votados (Cheers)</option>
              <option value="score">⭐ Mejor Puntuación Juez</option>
              <option value="recent">⏱️ Más Recientes</option>
            </select>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. TAB CONTENT: LEADERBOARD & PODIUM */}
      {/* ========================================================================= */}
      {(activeTab === 'leaderboard' || activeTab === 'challenge') && (
        <div className="space-y-6">
          {/* Top 3 Podium Cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#E9C349]" />
                  Podio de Ganadores Provisionales
                </h3>
                <p className="text-xs text-gray-400">
                  Calculado en base a los votos de la comunidad y la evaluación técnica oficial de los instructores.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {top3Submissions.map((sub, index) => {
                const rank = index + 1;
                const isGold = rank === 1;
                const isSilver = rank === 2;
                const isBronze = rank === 3;
                const isRecentlyVoted = recentlyVotedSubmissionId === sub.id;

                return (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      scale: isRecentlyVoted ? [1, 1.03, 1] : 1
                    }}
                    transition={{ duration: 0.3 }}
                    className={`relative rounded-2xl p-5 border shadow-xl flex flex-col justify-between overflow-hidden transition-all duration-300 ${
                      isRecentlyVoted
                        ? 'ring-4 ring-rose-500/80 border-rose-400 shadow-[0_0_35px_rgba(244,63,94,0.4)]'
                        : isGold
                        ? 'bg-gradient-to-b from-[#241C10] via-[#17141D] to-[#0D0D11] border-[#E9C349]/60 ring-2 ring-[#E9C349]/20 md:-translate-y-2'
                        : isSilver
                        ? 'bg-gradient-to-b from-[#1C1F26] via-[#14161C] to-[#0D0D11] border-slate-400/40'
                        : 'bg-gradient-to-b from-[#251815] via-[#17141D] to-[#0D0D11] border-amber-700/40'
                    }`}
                  >
                    {/* Rank Badge Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-md ${
                          isGold
                            ? 'bg-[#E9C349] text-black ring-4 ring-[#E9C349]/20'
                            : isSilver
                            ? 'bg-slate-300 text-black ring-4 ring-slate-400/20'
                            : 'bg-amber-700 text-white ring-4 ring-amber-700/20'
                        }`}>
                          #{rank}
                        </span>
                        <span className={`text-xs font-mono font-bold uppercase tracking-wider ${
                          isGold ? 'text-[#E9C349]' : isSilver ? 'text-slate-300' : 'text-amber-500'
                        }`}>
                          {isGold ? '🥇 1er Lugar' : isSilver ? '🥈 2do Lugar' : '🥉 3er Lugar'}
                        </span>
                      </div>

                      <span className="text-xs font-mono font-bold text-white bg-black/40 px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
                        ⭐ {sub.score?.toFixed(1)} / 100
                      </span>
                    </div>

                    {/* Dancer Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={sub.dancerAvatar}
                        alt={sub.dancerName}
                        className={`w-11 h-11 rounded-full object-cover border-2 ${
                          isGold ? 'border-[#E9C349]' : isSilver ? 'border-slate-300' : 'border-amber-700'
                        }`}
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{sub.dancerName}</h4>
                        <span className="text-[10px] font-mono text-gray-400 block truncate">{sub.dancerLevel}</span>
                      </div>
                    </div>

                    {/* Entry Title & Video Preview Thumbnail */}
                    <div className="space-y-2 mb-4">
                      <p className="text-xs font-semibold text-gray-200 line-clamp-2">
                        "{sub.title}"
                      </p>

                      <div
                        onClick={() => setActiveVideoItem({
                          url: sub.videoUrl,
                          title: sub.title,
                          dancer: sub.dancerName,
                          notes: sub.notes,
                          feedback: sub.instructorFeedback
                        })}
                        className="relative rounded-xl overflow-hidden aspect-video bg-black/60 border border-white/10 group cursor-pointer"
                      >
                        <img
                          src={sub.videoThumbnail || 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=600'}
                          alt={sub.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-[#E9C349] text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-white bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm">
                          <span>Ver Coreografía</span>
                          <span className="text-[#E9C349] flex items-center gap-1 font-bold">
                            <Flame className="w-3 h-3 text-[#E9C349]" /> {sub.votesCount} cheers
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Instructor Badge Critique if available */}
                    {sub.instructorFeedback && (
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-[11px] text-gray-300 mb-3">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#E9C349] font-bold mb-1">
                          <Crown className="w-3 h-3 text-[#E9C349]" />
                          <span>Critique: {sub.instructorFeedback.author}</span>
                        </div>
                        <p className="italic text-gray-400 line-clamp-2">
                          "{sub.instructorFeedback.comment}"
                        </p>
                      </div>
                    )}

                    {/* Footer Reaction & Heart-Pulse Vote Button */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {/* Primary Heart Vote Button with Heart-Pulse animation */}
                        <button
                          id={`btn-podium-vote-${sub.id}`}
                          onClick={(e) => handleReaction(sub.id, 'heart', e)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                            sub.votedByMe
                              ? 'bg-rose-500/25 text-rose-300 border border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.35)] scale-105'
                              : 'bg-[#E9C349]/15 hover:bg-[#E9C349]/25 text-[#E9C349] border border-[#E9C349]/40 hover:border-[#E9C349]'
                          }`}
                          title="Votar por esta coreografía"
                        >
                          <motion.div
                            animate={isRecentlyVoted ? { scale: [1, 1.8, 1], rotate: [0, -15, 15, 0] } : {}}
                            transition={{ duration: 0.5 }}
                          >
                            <Heart className={`w-3.5 h-3.5 ${sub.votedByMe ? 'text-rose-400 fill-rose-400' : 'text-[#E9C349]'}`} />
                          </motion.div>
                          <span>{sub.votedByMe ? '¡Votado!' : 'Votar'}</span>
                          <span className="bg-black/50 px-1.5 py-0.2 rounded font-bold text-[10px] text-white">
                            {sub.votesCount}
                          </span>
                        </button>

                        <button
                          onClick={(e) => handleReaction(sub.id, 'fire', e)}
                          className={`p-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            sub.myReaction === 'fire'
                              ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50'
                              : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
                          }`}
                          title="Waack Fire"
                        >
                          <Flame className={`w-3.5 h-3.5 ${sub.myReaction === 'fire' ? 'text-amber-400 fill-amber-400' : 'text-gray-400'}`} />
                        </button>

                        <button
                          onClick={(e) => handleReaction(sub.id, 'queen', e)}
                          className={`p-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            sub.myReaction === 'queen'
                              ? 'bg-purple-500/25 text-purple-300 border border-purple-500/50'
                              : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
                          }`}
                          title="Queen Style"
                        >
                          <Crown className={`w-3.5 h-3.5 ${sub.myReaction === 'queen' ? 'text-purple-400 fill-purple-400' : 'text-gray-400'}`} />
                        </button>
                      </div>

                      <button
                        onClick={() => setActiveVideoItem({
                          url: sub.videoUrl,
                          title: sub.title,
                          dancer: sub.dancerName,
                          notes: sub.notes,
                          feedback: sub.instructorFeedback
                        })}
                        className="text-xs text-[#E9C349] hover:underline font-mono font-bold flex items-center gap-1 shrink-0"
                      >
                        <span>Ver</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Full Ranked Leaderboard Table */}
          <div className="bg-[#121118] border border-tertiary/20 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Medal className="w-4 h-4 text-[#E9C349]" />
                Tabla Completa de Participantes & Puntuaciones
              </h4>
              <span className="text-xs font-mono text-gray-400">
                {(challenge.submissions || []).length} coreografías entregadas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] font-mono text-gray-400 uppercase">
                    <th className="pb-3 px-3">Posición</th>
                    <th className="pb-3 px-3">Bailarín / Waacker</th>
                    <th className="pb-3 px-3">Título de la Entrega</th>
                    <th className="pb-3 px-3 text-center">Voto / Cheers</th>
                    <th className="pb-3 px-3 text-center">Score Juez</th>
                    <th className="pb-3 px-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {sortedSubmissions.map((sub, idx) => {
                    const rankNum = idx + 1;
                    const isRecentlyVoted = recentlyVotedSubmissionId === sub.id;

                    return (
                      <tr 
                        key={sub.id} 
                        className={`transition-all duration-300 ${
                          isRecentlyVoted 
                            ? 'bg-rose-500/10 ring-1 ring-rose-500/40' 
                            : 'hover:bg-white/[0.02]'
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-bold">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                            rankNum === 1
                              ? 'bg-[#E9C349] text-black font-extrabold shadow-sm'
                              : rankNum === 2
                              ? 'bg-slate-300 text-black font-extrabold shadow-sm'
                              : rankNum === 3
                              ? 'bg-amber-700 text-white font-extrabold shadow-sm'
                              : 'bg-white/10 text-gray-300'
                          }`}>
                            {rankNum}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={sub.dancerAvatar}
                              alt={sub.dancerName}
                              className="w-7 h-7 rounded-full object-cover border border-white/20"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <span className="font-bold text-white block">{sub.dancerName}</span>
                              <span className="text-[10px] font-mono text-gray-400">{sub.dancerLevel}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-gray-200 font-medium line-clamp-1">{sub.title}</span>
                          <span className="text-[10px] font-mono text-gray-400">{sub.submittedAt}</span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold">
                          <button
                            id={`btn-table-vote-${sub.id}`}
                            onClick={(e) => handleReaction(sub.id, 'heart', e)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                              sub.votedByMe
                                ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50 scale-105 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                                : 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-400 border border-amber-500/30'
                            }`}
                            title="Votar por esta coreografía"
                          >
                            <motion.div
                              animate={isRecentlyVoted ? { scale: [1, 1.7, 1] } : {}}
                              transition={{ duration: 0.4 }}
                            >
                              <Heart className={`w-3 h-3 ${sub.votedByMe ? 'text-rose-400 fill-rose-400' : 'text-amber-400'}`} />
                            </motion.div>
                            <span>{sub.votesCount}</span>
                          </button>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-white">
                          <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                            ⭐ {sub.score?.toFixed(1) || '85.0'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setActiveVideoItem({
                              url: sub.videoUrl,
                              title: sub.title,
                              dancer: sub.dancerName,
                              notes: sub.notes,
                              feedback: sub.instructorFeedback
                            })}
                            className="p-1.5 rounded-lg bg-tertiary/10 hover:bg-tertiary/20 text-[#E9C349] transition-all inline-flex items-center gap-1 font-mono text-[11px] font-bold"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Ver Video</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB CONTENT: VIDEOS GALLERY */}
      {/* ========================================================================= */}
      {activeTab === 'gallery' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-purple-400" />
                Galería de Videos del Reto ({(challenge.submissions || []).length} entregas)
              </h3>
              <p className="text-xs text-gray-400">
                Mira las participaciones de tus compañeros, deja tus cheers y aprende de las correcciones de los jueces.
              </p>
            </div>

            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="bg-[#E9C349] hover:bg-[#d4af37] text-black font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer font-mono"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publicar Mi Video</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedSubmissions.map((sub) => {
              const isRecentlyVoted = recentlyVotedSubmissionId === sub.id;

              return (
                <motion.div
                  key={sub.id}
                  animate={{
                    scale: isRecentlyVoted ? [1, 1.025, 1] : 1
                  }}
                  transition={{ duration: 0.3 }}
                  className={`bg-[#121118] border rounded-2xl p-4 shadow-lg flex flex-col justify-between transition-all group ${
                    isRecentlyVoted
                      ? 'border-rose-500 ring-2 ring-rose-500/40 shadow-[0_0_25px_rgba(244,63,94,0.3)]'
                      : 'border-white/10 hover:border-tertiary/40'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={sub.dancerAvatar}
                        alt={sub.dancerName}
                        className="w-9 h-9 rounded-full object-cover border border-[#E9C349]/30 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{sub.dancerName}</h4>
                        <span className="text-[10px] font-mono text-gray-400 block truncate">{sub.dancerLevel}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-gray-400 shrink-0">{sub.submittedAt}</span>
                  </div>

                  {/* Video Card Player Trigger */}
                  <div
                    onClick={() => setActiveVideoItem({
                      url: sub.videoUrl,
                      title: sub.title,
                      dancer: sub.dancerName,
                      notes: sub.notes,
                      feedback: sub.instructorFeedback
                    })}
                    className="relative rounded-xl overflow-hidden aspect-video bg-black/60 border border-white/10 group cursor-pointer mb-3"
                  >
                    <img
                      src={sub.videoThumbnail || 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=600'}
                      alt={sub.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="w-11 h-11 rounded-full bg-[#E9C349] text-black flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-mono text-white font-bold backdrop-blur-sm">
                      ⭐ {sub.score?.toFixed(1) || '85.0'}
                    </div>
                  </div>

                  {/* Title & Notes */}
                  <div className="space-y-1.5 mb-3 flex-1">
                    <h5 className="text-xs font-bold text-white line-clamp-1">{sub.title}</h5>
                    {sub.notes && (
                      <p className="text-[11px] text-gray-300 line-clamp-2 leading-relaxed">
                        {sub.notes}
                      </p>
                    )}
                  </div>

                  {/* Instructor Feedback Snippet */}
                  {sub.instructorFeedback && (
                    <div className="mb-3 p-2.5 rounded-xl bg-black/40 border border-[#E9C349]/20 text-[11px]">
                      <div className="flex items-center gap-1 font-mono font-bold text-[#E9C349] text-[10px] mb-0.5">
                        <Crown className="w-3 h-3 text-[#E9C349]" />
                        <span>{sub.instructorFeedback.author}</span>
                      </div>
                      <p className="italic text-gray-400 text-[10px] line-clamp-2">
                        "{sub.instructorFeedback.comment}"
                      </p>
                    </div>
                  )}

                  {/* Reaction Actions Bar with Heart-Pulse & Multi-reactions */}
                  <div className="pt-2.5 border-t border-white/10 flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      {/* Heart Cheer / Vote button */}
                      <button
                        onClick={(e) => handleReaction(sub.id, 'heart', e)}
                        className={`px-2 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          sub.votedByMe
                            ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50 shadow-sm'
                            : 'bg-[#E9C349]/10 text-[#E9C349] border border-[#E9C349]/20 hover:bg-[#E9C349]/20'
                        }`}
                        title="Votar"
                      >
                        <motion.div
                          animate={isRecentlyVoted ? { scale: [1, 1.6, 1] } : {}}
                          transition={{ duration: 0.4 }}
                        >
                          <Heart className={`w-3.5 h-3.5 ${sub.votedByMe ? 'text-rose-400 fill-rose-400' : 'text-[#E9C349]'}`} />
                        </motion.div>
                        <span>{sub.votesCount || 0}</span>
                      </button>

                      {/* Fire Reaction */}
                      <button
                        onClick={(e) => handleReaction(sub.id, 'fire', e)}
                        className={`p-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          sub.myReaction === 'fire'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
                        }`}
                        title="Waack Fire"
                      >
                        <Flame className={`w-3.5 h-3.5 ${sub.myReaction === 'fire' ? 'text-amber-400 fill-amber-400' : 'text-gray-400'}`} />
                      </button>

                      {/* Queen Style Reaction */}
                      <button
                        onClick={(e) => handleReaction(sub.id, 'queen', e)}
                        className={`p-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          sub.myReaction === 'queen'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
                        }`}
                        title="Queen Style"
                      >
                        <Crown className={`w-3.5 h-3.5 ${sub.myReaction === 'queen' ? 'text-purple-400 fill-purple-400' : 'text-gray-400'}`} />
                      </button>

                      {/* Precision Reaction */}
                      <button
                        onClick={(e) => handleReaction(sub.id, 'precision', e)}
                        className={`p-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          sub.myReaction === 'precision'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
                        }`}
                        title="Speed & Precision"
                      >
                        <Zap className={`w-3.5 h-3.5 ${sub.myReaction === 'precision' ? 'text-blue-400 fill-blue-400' : 'text-gray-400'}`} />
                      </button>
                    </div>

                    <button
                      onClick={() => setActiveVideoItem({
                        url: sub.videoUrl,
                        title: sub.title,
                        dancer: sub.dancerName,
                        notes: sub.notes,
                        feedback: sub.instructorFeedback
                      })}
                      className="text-xs text-[#E9C349] hover:underline font-mono font-bold flex items-center gap-1 shrink-0"
                    >
                      <span>Ver</span>
                      <Maximize2 className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB CONTENT: PAST CHALLENGE WINNERS (HALL OF FAME) */}
      {/* ========================================================================= */}
      {activeTab === 'past_winners' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Crown className="w-4 h-4 text-[#E9C349]" />
              Salón de la Fama • Ganadores de Retos Anteriores
            </h3>
            <p className="text-xs text-gray-400">
              Historial de las coreografías campeonas coronadas por la comunidad Waack On.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pastWinners.map((winner) => (
              <div
                key={winner.id}
                className="bg-gradient-to-b from-[#1c1824] via-[#121118] to-[#0A0A0E] border border-amber-500/30 rounded-2xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 bg-[#E9C349]/10 w-24 h-24 rounded-full blur-xl pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono font-bold text-[#E9C349] bg-[#E9C349]/10 px-2.5 py-0.5 rounded-full border border-[#E9C349]/30">
                      Semana #{winner.weekNumber}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">{winner.dateRange}</span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-2">{winner.title}</h4>

                  {/* Winner Card */}
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/40 border border-white/10 mb-3">
                    <img
                      src={winner.winnerAvatar}
                      alt={winner.winnerName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#E9C349]"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{winner.winnerName}</span>
                        <Crown className="w-3.5 h-3.5 text-[#E9C349]" />
                      </div>
                      <span className="text-[10px] font-mono text-gray-400 block">{winner.winnerLevel}</span>
                    </div>
                  </div>

                  {/* Video trigger */}
                  <div
                    onClick={() => setActiveVideoItem({
                      url: winner.videoUrl,
                      title: winner.entryTitle,
                      dancer: winner.winnerName
                    })}
                    className="relative rounded-xl overflow-hidden aspect-video bg-black/60 border border-white/10 group cursor-pointer mb-3"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=600"
                      alt={winner.entryTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-[#E9C349] text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-white bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm">
                      <span className="truncate">{winner.entryTitle}</span>
                      <span className="text-[#E9C349] font-bold">⭐ {winner.score}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-300 font-mono flex items-center justify-between bg-white/[0.02] p-2 rounded-lg border border-white/5">
                    <span>{winner.participantsCount} participantes</span>
                    <span className="text-amber-400 font-bold">{winner.votesCount} votos finales</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/10 text-center">
                  <span className="text-[11px] font-mono font-bold text-[#E9C349] block">
                    🏆 {winner.prizeAwarded}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: SUBMIT VIDEO ENTRY */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#14121A] border-2 border-tertiary/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#E9C349]/15 border border-[#E9C349]/40 flex items-center justify-center text-[#E9C349]">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Subir Video al Reto Semanal</h3>
                    <span className="text-[11px] font-mono text-[#E9C349]">Semana #{challenge.weekNumber} • {challenge.theme}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {submitSuccess ? (
                <div className="p-6 text-center space-y-3 bg-emerald-950/50 border border-emerald-500/40 rounded-2xl">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                  <h4 className="text-base font-bold text-white">¡Video Publicado Exitosamente!</h4>
                  <p className="text-xs text-gray-300 font-mono">
                    Tu coreografía ya está en la galería y sumaste +30 XP de participación. ¡Mucho éxito en la votación!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitEntry} className="space-y-4">
                  {submitError && (
                    <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-center gap-2 font-mono">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Title input */}
                  <div>
                    <label className="text-xs font-mono font-bold text-gray-300 uppercase block mb-1.5">
                      Título de tu Entrega / Coreografía *
                    </label>
                    <input
                      type="text"
                      value={entryTitle}
                      onChange={(e) => setEntryTitle(e.target.value)}
                      placeholder="Ej: Cross Rolls a 126 BPM con Pose Teatral Final"
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E9C349]"
                    />
                  </div>

                  {/* Video URL input */}
                  <div>
                    <label className="text-xs font-mono font-bold text-gray-300 uppercase block mb-1.5">
                      Enlace URL de tu Video (YouTube / Vimeo / MP4 / Cloud) *
                    </label>
                    <input
                      type="url"
                      value={entryVideoUrl}
                      onChange={(e) => setEntryVideoUrl(e.target.value)}
                      placeholder="https://commondatastorage.googleapis.com/... o enlace YouTube"
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E9C349]"
                    />
                    {/* Quick Demo URLs for Testing */}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-gray-400">
                      <span>Probar con video de muestra:</span>
                      <button
                        type="button"
                        onClick={() => setEntryVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4')}
                        className="text-[#E9C349] underline hover:text-white"
                      >
                        Sample 1 (MP4)
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => setEntryVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4')}
                        className="text-[#E9C349] underline hover:text-white"
                      >
                        Sample 2 (MP4)
                      </button>
                    </div>
                  </div>

                  {/* Notes / Focus */}
                  <div>
                    <label className="text-xs font-mono font-bold text-gray-300 uppercase block mb-1.5">
                      Notas Personales / Enfoque Técnico (Opcional)
                    </label>
                    <textarea
                      value={entryNotes}
                      onChange={(e) => setEntryNotes(e.target.value)}
                      placeholder="¿Qué aspecto técnico o dramático exploraste en esta toma? (Ej: Altura de codos en rotación rápida, acentos de síncopa...)"
                      rows={3}
                      className="w-full bg-black/50 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E9C349]"
                    />
                  </div>

                  {/* Guidelines reminder */}
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 text-[11px] text-gray-400 space-y-1">
                    <span className="font-bold text-white font-mono flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-[#E9C349]" /> Recuerda las reglas del reto:
                    </span>
                    <p>• Mantén la cámara fija y el cuerpo completo visible.</p>
                    <p>• Incluye la música de referencia ({challenge.recommendedTrack.bpm} BPM).</p>
                    <p>• La entrega otorga automáticamente +30 XP a tu perfil.</p>
                  </div>

                  {/* Submit buttons */}
                  <div className="pt-3 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsSubmitModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-mono text-gray-400 hover:text-white hover:bg-white/5"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#E9C349] hover:bg-[#d4af37] text-black font-extrabold text-xs font-mono uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      Publicar Video
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 7. MODAL: FULLSCREEN VIDEO PLAYER LIGHTBOX */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {activeVideoItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121118] border border-tertiary/40 rounded-3xl p-4 sm:p-6 max-w-3xl w-full shadow-2xl space-y-4 text-white max-h-[95vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Trophy className="w-4 h-4 text-[#E9C349] shrink-0" />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{activeVideoItem.title}</h3>
                    <span className="text-[11px] font-mono text-gray-400">Bailarín: {activeVideoItem.dancer}</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveVideoItem(null)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Video Player Box */}
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-black border border-white/10 shadow-2xl">
                {activeVideoItem.url.includes('youtube.com') || activeVideoItem.url.includes('youtu.be') ? (
                  <iframe
                    src={activeVideoItem.url.replace('watch?v=', 'embed/')}
                    title={activeVideoItem.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={activeVideoItem.url}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* Notes & Instructor Feedback */}
              <div className="space-y-3 pt-1">
                {activeVideoItem.notes && (
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 text-xs text-gray-300">
                    <span className="font-bold text-white font-mono block mb-1">Notas del Bailarín:</span>
                    <p>{activeVideoItem.notes}</p>
                  </div>
                )}

                {activeVideoItem.feedback && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/40 to-[#1b1424] border border-[#E9C349]/40 text-xs text-gray-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 font-mono font-bold text-[#E9C349]">
                        <Crown className="w-4 h-4 text-[#E9C349]" />
                        <span>Evaluación Oficial: {activeVideoItem.feedback.author}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-white bg-black/40 px-2 py-0.5 rounded border border-[#E9C349]/30">
                        ⭐ {activeVideoItem.feedback.score} / 100
                      </span>
                    </div>
                    <p className="italic text-gray-300 mb-2">"{activeVideoItem.feedback.comment}"</p>
                    {activeVideoItem.feedback.badges && (
                      <div className="flex flex-wrap gap-1.5">
                        {activeVideoItem.feedback.badges.map((b: string, i: number) => (
                          <span key={i} className="text-[10px] font-mono bg-[#E9C349]/15 border border-[#E9C349]/30 text-[#E9C349] px-2 py-0.5 rounded-full font-bold">
                            {b}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Vote button inside modal */}
                {(() => {
                  const matchingSub = (challenge.submissions || []).find(s => s.videoUrl === activeVideoItem.url || s.title === activeVideoItem.title);
                  if (!matchingSub) return null;
                  const isRecentlyVoted = recentlyVotedSubmissionId === matchingSub.id;

                  return (
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-300">¿Te gustó esta entrega?</span>
                        <button
                          onClick={(e) => handleReaction(matchingSub.id, 'heart', e)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg ${
                            matchingSub.votedByMe
                              ? 'bg-rose-500/25 text-rose-300 border border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.35)] scale-105'
                              : 'bg-[#E9C349] hover:bg-[#d4af37] text-black'
                          }`}
                        >
                          <motion.div
                            animate={isRecentlyVoted ? { scale: [1, 1.7, 1] } : {}}
                            transition={{ duration: 0.4 }}
                          >
                            <Heart className={`w-4 h-4 ${matchingSub.votedByMe ? 'text-rose-400 fill-rose-400' : 'text-black fill-current'}`} />
                          </motion.div>
                          <span>{matchingSub.votedByMe ? '¡Voto Registrado!' : 'Votar Coreografía'}</span>
                          <span className="bg-black/30 text-white px-1.5 py-0.5 rounded text-[10px]">
                            {matchingSub.votesCount}
                          </span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleReaction(matchingSub.id, 'fire', e)}
                          className={`p-2 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            matchingSub.myReaction === 'fire'
                              ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50'
                              : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
                          }`}
                          title="Waack Fire"
                        >
                          <Flame className={`w-4 h-4 ${matchingSub.myReaction === 'fire' ? 'text-amber-400 fill-amber-400' : 'text-gray-400'}`} />
                          <span>{matchingSub.reactions?.fire || 0}</span>
                        </button>

                        <button
                          onClick={(e) => handleReaction(matchingSub.id, 'queen', e)}
                          className={`p-2 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            matchingSub.myReaction === 'queen'
                              ? 'bg-purple-500/25 text-purple-300 border border-purple-500/50'
                              : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
                          }`}
                          title="Queen Style"
                        >
                          <Crown className={`w-4 h-4 ${matchingSub.myReaction === 'queen' ? 'text-purple-400 fill-purple-400' : 'text-gray-400'}`} />
                          <span>{matchingSub.reactions?.queen || 0}</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 8. FLOATING HEART-PULSE AND CONFETTI BURST PARTICLES OVERLAY */}
      {/* ========================================================================= */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        <AnimatePresence>
          {floatingPulses.map((pulse) => (
            <motion.div
              key={pulse.id}
              initial={{ opacity: 0, scale: 0.5, x: pulse.x - 30, y: pulse.y }}
              animate={{ 
                opacity: [0, 1, 1, 0], 
                scale: [0.5, 1.35, 1.15, 0.9],
                y: pulse.y - 75,
                x: pulse.x - 30
              }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              className="absolute flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/90 border border-[#E9C349] text-white shadow-2xl backdrop-blur-md font-mono font-extrabold text-xs"
            >
              <motion.div
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ repeat: 2, duration: 0.3 }}
                className="text-sm"
              >
                {pulse.icon === 'queen' ? '👑' : pulse.icon === 'precision' ? '⚡' : pulse.icon === 'flame' ? '🔥' : '❤️'}
              </motion.div>
              <span className="text-[#E9C349] drop-shadow-[0_0_8px_rgba(233,195,73,0.6)]">
                {pulse.label}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
