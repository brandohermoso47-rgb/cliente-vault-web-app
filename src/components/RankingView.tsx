import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Award, 
  Sparkles, 
  TrendingUp, 
  CheckCircle, 
  MessageSquare, 
  Plus, 
  Tv, 
  ShieldCheck, 
  Video, 
  Flame, 
  Zap, 
  ChevronRight,
  Info,
  Lock,
  Unlock,
  Mic,
  Music,
  Globe
} from 'lucide-react';
import { User, Lesson, FeedbackItem } from '../types';
import { Language, translations } from '../lib/translations';
import VirtualizedList from './VirtualizedList';

interface RankingViewProps {
  currentUser: User;
  lessons: Lesson[];
  feedbackItems: FeedbackItem[];
  chatMessagesCount: number;
  onAddBonusPoints: (amount: number) => void;
  setActiveTab: (tab: string) => void;
  language: Language;
  onUserChange?: (arg: User | ((prev: User) => User)) => void;
}

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  isCurrentUser?: boolean;
  completedLessonsCount: number;
  videosCount: number;
  chatCount: number;
  points: number;
  rankTitle: string;
}

export default function RankingView({
  currentUser,
  lessons,
  feedbackItems,
  chatMessagesCount,
  onAddBonusPoints,
  setActiveTab,
  language
}: RankingViewProps) {
  const [simulationBonus, setSimulationBonus] = useState<number>(50);
  const [subTab, setSubTab] = useState<'achievements' | 'ranking'>('achievements');

  // Define static, competitive simulated users
  const simulatedCompetitors: LeaderboardUser[] = [
    {
      id: 'u-pedro',
      name: 'Pedro Freestyle',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
      completedLessonsCount: 3,
      videosCount: 2,
      chatCount: 15,
      points: 420,
      rankTitle: 'Roll Master'
    },
    {
      id: 'u-sara',
      name: 'Sara Pose',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
      completedLessonsCount: 4,
      videosCount: 1,
      chatCount: 8,
      points: 290,
      rankTitle: 'Vogue Princess'
    },
    {
      id: 'u-carlos',
      name: 'Carlos Groove',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
      completedLessonsCount: 2,
      videosCount: 1,
      chatCount: 4,
      points: 180,
      rankTitle: 'Groove King'
    },
    {
      id: 'u-elena',
      name: 'Elena Waack',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120',
      completedLessonsCount: 1,
      videosCount: 0,
      chatCount: 3,
      points: 80,
      rankTitle: 'Bailarina Iniciante'
    }
  ];

  // Calculate current user stats
  const curUserLessonsCount = (currentUser.completedLessons || []).length;
  const curUserVideosCount = (feedbackItems || []).filter(item => item && item.studentName === currentUser.name).length;
  const curUserChatCount = chatMessagesCount || 0;

  // Compile full list including active current user
  const dynamicCurrentUser: LeaderboardUser = {
    id: currentUser.id,
    name: `${currentUser.name} (Tú)`,
    avatar: currentUser.avatar,
    isCurrentUser: true,
    completedLessonsCount: curUserLessonsCount,
    videosCount: curUserVideosCount,
    chatCount: curUserChatCount,
    points: currentUser.points,
    rankTitle: getRankTitle(currentUser.points)
  };

  const leaderboardList: LeaderboardUser[] = [...simulatedCompetitors, dynamicCurrentUser].sort(
    (a, b) => b.points - a.points
  );

  // Find current user's placement index
  const curUserIndex = leaderboardList.findIndex(user => user.isCurrentUser) + 1;

  // Function to determine rank title based on score
  function getRankTitle(pts: number): string {
    if (pts >= 400) return 'Waacking Master 👑';
    if (pts >= 250) return 'Roll Specialist ⚡';
    if (pts >= 120) return 'Ritmo Avanzado 🌟';
    return 'Bailarín Inicial 🌱';
  }

  // Get rank description
  function getRankDescription(pts: number): string {
    if (pts >= 400) return '¡Dominas la pose y la simetría espacial con absoluta teatralidad!';
    if (pts >= 250) return 'Tus rolls son rápidos y limpios. Eres una gran referencia.';
    if (pts >= 120) return 'Conoces los compases y estás perfeccionando tus líneas base.';
    return 'Estás construyendo tus cimientos. ¡Sigue completando drills!';
  }

  // Next Rank calculations
  const pointsToNextRank = () => {
    if (currentUser.points >= 400) return { name: 'Leyenda Disco 🌟', required: 600, left: 600 - currentUser.points };
    if (currentUser.points >= 250) return { name: 'Waacking Master 👑', required: 400, left: 400 - currentUser.points };
    if (currentUser.points >= 120) return { name: 'Roll Specialist ⚡', required: 250, left: 250 - currentUser.points };
    return { name: 'Ritmo Avanzado 🌟', required: 120, left: 120 - currentUser.points };
  };

  const nextRank = pointsToNextRank();
  const nextRankProgress = Math.min(
    100,
    Math.round(
      currentUser.points >= 400 
        ? ((currentUser.points - 400) / 200) * 100 
        : currentUser.points >= 250 
          ? ((currentUser.points - 250) / 150) * 100 
          : currentUser.points >= 120 
            ? ((currentUser.points - 120) / 130) * 100 
            : (currentUser.points / 120) * 100
    )
  );

  return (
    <div className="flex-1 min-h-full w-full p-4 md:p-6 space-y-6 bg-background text-on-surface font-body-md">
      {/* Title Header */}
      <div className="bg-surface-container border border-tertiary/10 rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-on-primary-fixed-variant text-primary-fixed border border-primary/20 rounded-2xl shadow-lg rotate-3">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[9px] font-mono font-bold text-tertiary bg-tertiary/10 border border-tertiary/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              SISTEMA DE GAMIFICACIÓN
            </span>
            <h2 className="text-2xl md:text-3xl font-display-lg font-bold text-white uppercase tracking-tight mt-1">
              RANKING & LOGROS WAACK ON
            </h2>
            <p className="text-on-surface-variant text-xs mt-1 font-semibold max-w-2xl leading-relaxed">
              ¡Entrena duro, sube de nivel y lidera la academia! Gana puntos automáticamente completando lecciones, subiendo videos de práctica para feedback y aportando en el chat del Lobby.
            </p>
          </div>
        </div>
      </div>

      {/* Subtab Switcher */}
      <div className="flex flex-wrap gap-2 bg-[#121212]/80 border border-[#262626] p-1.5 rounded-xl backdrop-blur-sm z-10 w-full sm:w-auto">
        <button
          onClick={() => setSubTab('achievements')}
          className={`px-4 py-2 text-[11px] font-mono font-bold uppercase tracking-wider rounded-lg transition-all ${
            subTab === 'achievements'
              ? 'bg-[#9A2B3C] text-white shadow-[0_2px_10px_rgba(154,43,60,0.4)] border border-[#9A2B3C]/50'
              : 'text-[#8A8A8A] hover:text-white hover:bg-[#1A1A1A]'
          }`}
        >
          {language === 'es' ? 'Logros y Medallas' : 'Achievements & Medals'}
        </button>
        <button
          onClick={() => setSubTab('ranking')}
          className={`px-4 py-2 text-[11px] font-mono font-bold uppercase tracking-wider rounded-lg transition-all ${
            subTab === 'ranking'
              ? 'bg-[#9A2B3C] text-white shadow-[0_2px_10px_rgba(154,43,60,0.4)] border border-[#9A2B3C]/50'
              : 'text-[#8A8A8A] hover:text-white hover:bg-[#1A1A1A]'
          }`}
        >
          {language === 'es' ? 'Leaderboard Global' : 'Global Leaderboard'}
        </button>
      </div>

      {subTab === 'achievements' ? (
        <div className="space-y-6 z-10 w-full">
          {/* Level Progress Banner */}
          <div className="bg-[#121212]/80 border border-[#262626] rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#9A2B3C]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-tr from-[#9A2B3C] to-[#E9C349] text-white rounded-2xl font-bold font-mono text-xl shadow-lg flex items-center justify-center min-w-[70px]">
                Lvl {Math.max(1, Math.floor(currentUser.points / 15))}
              </div>
              <div>
                <h3 className="text-white font-bold uppercase tracking-wider text-sm">
                  {language === 'es' ? 'Nivel ' : 'Level '}{Math.max(1, Math.floor(currentUser.points / 15))}: {
                    language === 'es' 
                      ? (currentUser.points >= 400 ? 'Leyenda Waack On 👑' : currentUser.points >= 250 ? 'Waack Elite 🌟' : currentUser.points >= 120 ? 'Ritmo Guerrero ⚡' : 'Iniciado Waacker 🌱')
                      : (currentUser.points >= 400 ? 'Waack On Legend 👑' : currentUser.points >= 250 ? 'Waack Elite 🌟' : currentUser.points >= 120 ? 'Rhythm Warrior ⚡' : 'Beginner Waacker 🌱')
                  }
                </h3>
                <p className="text-[#8A8A8A] text-xs font-semibold mt-0.5">
                  {language === 'es' 
                    ? `Tienes ${currentUser.points} puntos de práctica acumulados.` 
                    : `You have accumulated ${currentUser.points} practice points.`}
                </p>
              </div>
            </div>
            
            {/* Percentage Progress Bar */}
            <div className="w-full md:w-96 shrink-0">
              <div className="flex justify-between text-[10px] font-mono font-bold text-[#C2C7D1] mb-1.5">
                <span>{language === 'es' ? 'PROGRESO DE NIVEL' : 'LEVEL PROGRESS'}</span>
                <span className="text-[#E9C349]">{Math.min(100, Math.round(((currentUser.points % 15) / 15) * 100))}%</span>
              </div>
              <div className="w-full bg-[#0A0A0A] border border-[#262626] h-3.5 rounded-full overflow-hidden p-0.5 flex items-center">
                <div 
                  className="bg-gradient-to-r from-[#9A2B3C] to-[#E9C349] h-full rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(154,43,60,0.5)]"
                  style={{ width: `${Math.min(100, Math.round(((currentUser.points % 15) / 15) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Medals Grid (8 cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: language === 'es' ? 'Master of Posing' : 'Master of Posing',
                desc: language === 'es' ? 'Completa 1000 Poses en total' : 'Complete 1000 Poses',
                requiredPoints: 50,
                icon: Trophy,
                color: 'from-[#9A2B3C]/30 to-[#E9C349]/30 border-[#9A2B3C]/50 text-[#E9C349]',
                glow: 'shadow-[0_0_20px_rgba(154,43,60,0.3)]'
              },
              {
                title: language === 'es' ? 'Rhythm Warrior' : 'Rhythm Warrior',
                desc: language === 'es' ? 'Completa 100 Drills rítmicos' : 'Complete 100 Medal Drills',
                requiredPoints: 100,
                icon: Zap,
                color: 'from-[#E9C349]/30 to-[#9A2B3C]/30 border-[#E9C349]/50 text-[#E9C349]',
                glow: 'shadow-[0_0_20px_rgba(233,195,73,0.3)]'
              },
              {
                title: language === 'es' ? 'Stage Breaker' : 'Stage Breaker',
                desc: language === 'es' ? 'Consigue destacar en el reflector' : 'Stage Spotlight Medal',
                requiredPoints: 200,
                icon: Award,
                color: 'from-[#8A2BE2]/30 to-[#E9C349]/30 border-[#8A2BE2]/50 text-[#C77DFF]',
                glow: 'shadow-[0_0_20px_rgba(138,43,226,0.3)]'
              },
              {
                title: language === 'es' ? 'Global Contender' : 'Global Contender',
                desc: language === 'es' ? 'Completa un Desafío de Trofeo Global' : 'Complete Global Trophy Challenge',
                requiredPoints: 300,
                icon: Globe,
                color: 'from-[#00F5D4]/30 to-[#7B2CBF]/30 border-[#00F5D4]/50 text-[#00F5D4]',
                glow: 'shadow-[0_0_20px_rgba(0,245,212,0.3)]'
              },
              {
                title: language === 'es' ? 'Rhythm Warrior II' : 'Rhythm Warrior II',
                desc: language === 'es' ? 'Completa 900 Drills rítmicos' : 'Complete 900 Medal Drills',
                requiredPoints: 400,
                icon: Music,
                color: 'from-[#E9C349]/30 to-[#9A2B3C]/30 border-[#E9C349]/50 text-[#E9C349]',
                glow: 'shadow-[0_0_20px_rgba(233,195,73,0.3)]'
              },
              {
                title: language === 'es' ? 'Stage Breaker II' : 'Stage Breaker II',
                desc: language === 'es' ? 'Completa 300 Poses dinámicas' : 'Complete 300 Dynamic Poses',
                requiredPoints: 500,
                icon: Mic,
                color: 'from-[#8A2BE2]/30 to-[#E9C349]/30 border-[#8A2BE2]/50 text-[#C77DFF]',
                glow: 'shadow-[0_0_20px_rgba(138,43,226,0.3)]'
              },
              {
                title: language === 'es' ? 'Academy Champion' : 'Academy Champion',
                desc: language === 'es' ? 'Llega al nivel más alto de competencia' : 'Reach Highest Academy Tier',
                requiredPoints: 600,
                icon: Trophy,
                color: 'from-[#E9C349]/30 to-[#00F5D4]/30 border-[#E9C349]/50 text-[#E9C349]',
                glow: 'shadow-[0_0_20px_rgba(233,195,73,0.3)]',
                glowStyle: 'shadow-[0_0_20px_rgba(233,195,73,0.3)]'
              },
              {
                title: language === 'es' ? 'Corona Waack On' : 'Waack On Crown',
                desc: language === 'es' ? 'Gana el trofeo supremo Waack On Waack' : 'Earn Supreme Waack On Waack Trophy',
                requiredPoints: 700,
                icon: Sparkles,
                color: 'from-[#9A2B3C]/40 to-[#00F5D4]/40 border-[#9A2B3C]/80 text-[#EDEFF4]',
                glow: 'shadow-[0_0_20px_rgba(154,43,60,0.4)]'
              }
            ].map((medal, idx) => {
              const isUnlocked = currentUser.points >= medal.requiredPoints;
              const IconComp = medal.icon;

              return (
                <div 
                  key={idx}
                  className="bg-[#121212]/40 backdrop-blur-md border border-[#262626] rounded-2xl p-6 flex flex-col items-center justify-between text-center relative overflow-hidden h-[260px] group hover:border-[#9A2B3C]/50 transition-all duration-300"
                >
                  {/* Outer glowing ring or lock state */}
                  {isUnlocked ? (
                    <div className={`w-20 h-20 rounded-full border-2 border-[#E9C349] bg-gradient-to-tr ${medal.color} flex items-center justify-center relative ${medal.glow} group-hover:scale-105 transition-transform duration-300`}>
                      <IconComp className="w-10 h-10 text-[#E9C349]" />
                      <div className="absolute -top-1 -right-1 bg-[#10b981] p-1 rounded-full border border-black shadow">
                        <Unlock className="w-2.5 h-2.5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full border border-[#262626] bg-[#0A0A0A]/80 flex items-center justify-center relative opacity-40">
                      <IconComp className="w-10 h-10 text-[#555]" />
                      <div className="absolute -top-1 -right-1 bg-[#3f3f46] p-1 rounded-full border border-black shadow">
                        <Lock className="w-2.5 h-2.5 text-white" />
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex-1 flex flex-col justify-center">
                    <h4 className={`font-bold uppercase text-xs tracking-wider ${isUnlocked ? 'text-white' : 'text-[#8A8A8A]'}`}>
                      {medal.title}
                    </h4>
                    <p className="text-[#8A8A8A] text-[10px] leading-snug font-medium mt-1.5 max-w-[160px] mx-auto">
                      {medal.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#262626] w-full">
                    {isUnlocked ? (
                      <span className="text-[9px] font-mono font-bold text-[#10b981] bg-[#10b981]/10 px-2 py-1 rounded-md uppercase tracking-wider block">
                        {language === 'es' ? 'Desbloqueado' : 'Unlocked'}
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono font-bold text-[#ef4444] bg-[#ef4444]/10 px-2 py-1 rounded-md uppercase tracking-wider block">
                        {language === 'es' ? `Requiere ${medal.requiredPoints} Pts` : `Requires ${medal.requiredPoints} Pts`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Points Simulation in Achievements Tab */}
          <div className="bg-[#121212]/80 border border-[#262626] rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#E9C349]" /> {language === 'es' ? 'Simulador de Puntos de Práctica' : 'Practice Points Simulator'}
              </h4>
              <p className="text-[#8A8A8A] text-[10px] font-medium mt-1 max-w-xl">
                {language === 'es' 
                  ? 'Aumenta tus puntos temporalmente para probar cómo se desbloquean dinámicamente las medallas superiores en la interfaz de la academia.' 
                  : 'Add points temporarily to test how the superior medals unlock dynamically in the academy interface.'}
              </p>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <input 
                type="number" 
                value={simulationBonus}
                onChange={(e) => setSimulationBonus(Math.max(1, parseInt(e.target.value) || 10))}
                className="w-20 bg-[#0A0A0A] border border-[#262626] rounded-xl text-center text-xs font-bold font-mono text-[#EDEFF4] py-2 focus:outline-none focus:border-[#9A2B3C]"
              />
              <button
                onClick={() => onAddBonusPoints(simulationBonus)}
                className="px-4 py-2 bg-[#9A2B3C] text-white hover:bg-[#b53448] text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all shadow-[0_2px_10px_rgba(154,43,60,0.4)] flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> {language === 'es' ? 'Añadir Puntos' : 'Add Points'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start z-10">
        {/* LEFT COLUMN: User Card & Points Guide (8 cols) */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Bento Row 1: Profile & Progress Badges */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* User score summary */}
            <div className="md:col-span-7 bg-surface-container border border-tertiary/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
              <div className="absolute top-[-10px] right-[-10px] w-24 h-24 bg-primary-container/10 rounded-full blur-xl pointer-events-none" />
              <div>
                <span className="text-[9px] font-mono font-bold text-primary bg-primary-container/30 border border-primary/20 px-2 py-0.5 rounded-full uppercase">
                  TU ESTADO ACTUAL
                </span>
                <div className="flex items-center gap-4 mt-3">
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    className="w-14 h-14 rounded-full border-2 border-tertiary/20 object-cover shadow-lg"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase leading-tight">{currentUser.name}</h3>
                    <p className="text-xs font-mono font-bold text-tertiary mt-0.5 uppercase">{getRankTitle(currentUser.points)}</p>
                  </div>
                </div>
                <p className="text-[10px] text-on-surface-variant font-medium mt-2.5 italic leading-relaxed">
                  "{getRankDescription(currentUser.points)}"
                </p>
              </div>

              {/* Progress to next rank */}
              <div className="mt-4 pt-4 border-t border-dashed border-tertiary/10">
                <div className="flex justify-between items-center text-[10px] font-mono font-bold text-on-surface-variant mb-1.5">
                  <span>Próximo Rango: <strong className="text-tertiary">{nextRank.name}</strong></span>
                  <span className="text-white">{currentUser.points} / {nextRank.required} PTS</span>
                </div>
                <div className="w-full bg-[#08080a] border border-tertiary/10 h-3 rounded-full overflow-hidden flex items-center">
                  <div 
                    className="bg-tertiary h-full border-r border-tertiary transition-all duration-700" 
                    style={{ width: `${nextRankProgress}%` }}
                  />
                </div>
                {nextRank.left > 0 ? (
                  <p className="text-[9px] text-on-surface-variant/70 font-bold font-mono mt-1 uppercase text-right">
                    Faltan {nextRank.left} puntos para subir de rango
                  </p>
                ) : (
                  <p className="text-[9px] text-primary font-bold font-mono mt-1 uppercase text-right">
                    ¡Has alcanzado la cima del ranking!
                  </p>
                )}
              </div>
            </div>

            {/* Quick Placement badge */}
            <div className="md:col-span-5 bg-surface-container border border-tertiary/10 rounded-2xl p-5 shadow-2xl flex flex-col justify-between text-center min-h-[220px]">
              <div>
                <span className="text-[9px] font-mono font-bold text-tertiary bg-tertiary/10 border border-tertiary/20 px-2 py-0.5 rounded-full uppercase">
                  POSICIÓN GLOBAL
                </span>
                <div className="my-4">
                  <span className="text-5xl font-display-lg font-bold text-white font-mono">#{curUserIndex}</span>
                  <span className="text-lg text-on-surface-variant font-bold font-mono"> / {leaderboardList.length}</span>
                </div>
                <p className="text-[10px] text-on-surface-variant font-medium max-w-xs mx-auto leading-relaxed">
                  Estás compitiendo en tiempo real con todos los alumnos activos de Waack On. ¡Haz drills de brazos hoy para subir posiciones!
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 text-[10px] font-mono font-bold text-on-surface border-t border-dashed border-tertiary/10 pt-3">
                <div className="flex flex-col">
                  <span className="text-white font-bold">{currentUser.points}</span>
                  <span className="text-[8px] text-on-surface-variant font-normal">PUNTOS</span>
                </div>
                <div className="w-px h-6 bg-tertiary/10" />
                <div className="flex flex-col">
                  <span className="text-white font-bold">{curUserLessonsCount}</span>
                  <span className="text-[8px] text-on-surface-variant font-normal">LECCIONES</span>
                </div>
                <div className="w-px h-6 bg-tertiary/10" />
                <div className="flex flex-col">
                  <span className="text-white font-bold">{curUserVideosCount}</span>
                  <span className="text-[8px] text-on-surface-variant font-normal">VIDEOS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Points allocation guide */}
          <div className="bg-surface-container border border-tertiary/10 rounded-2xl p-5 shadow-2xl">
            <h4 className="text-xs font-mono font-bold text-tertiary uppercase tracking-wider border-b border-tertiary/10 pb-2 mb-4 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-tertiary" /> ¿CÓMO SE GANAN LOS PUNTOS?
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  title: 'Completa Nivel 1',
                  desc: 'Avanza y perfecciona los fundamentos.',
                  value: '+50 pts',
                  badge: 'Por Clase',
                  icon: CheckCircle,
                  color: 'bg-primary-container/20 text-primary border-primary/20',
                  actionText: 'Ir a Clases',
                  tabToGo: 'cursos'
                },
                {
                  title: 'Completa Nivel 2',
                  desc: 'Drills avanzados y styling de pasarela.',
                  value: '+80 pts',
                  badge: 'Por Clase',
                  icon: Zap,
                  color: 'bg-tertiary/10 text-tertiary border-tertiary/20',
                  actionText: 'Ver Drills',
                  tabToGo: 'cursos'
                },
                {
                  title: 'Subir Práctica',
                  desc: 'Publica videos en Feedback para ser evaluado.',
                  value: '+100 pts',
                  badge: 'Por Video',
                  icon: Video,
                  color: 'bg-primary-container/25 text-primary border-primary/20',
                  actionText: 'Subir Video',
                  tabToGo: 'entrenamiento'
                },
                {
                  title: 'Participar Lobby',
                  desc: 'Participa rítmicamente en el Lobby Chat.',
                  value: '+10 pts',
                  badge: 'Por Mensaje',
                  icon: MessageSquare,
                  color: 'bg-[#0d0d11]/40 text-tertiary border-tertiary/10',
                  actionText: 'Ir al Chat',
                  tabToGo: 'comunidad'
                }
              ].map((act, idx) => {
                const Icon = act.icon;
                return (
                  <div key={idx} className="bg-[#0d0d11]/60 border border-tertiary/10 rounded-xl p-3 flex flex-col justify-between text-left shadow-lg">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className={`p-1.5 rounded-lg border ${(act.color || '').split(' ')[2] || ''} ${(act.color || '').split(' ')[0] || ''}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-[8px] font-mono font-bold border px-1.5 py-0.5 rounded-md ${act.color}`}>
                          {act.value}
                        </span>
                      </div>
                      <h5 className="text-[11px] font-bold text-white uppercase leading-tight">{act.title}</h5>
                      <p className="text-[9px] text-on-surface-variant font-medium leading-tight mt-1">{act.desc}</p>
                    </div>
                    
                    <button
                      onClick={() => setActiveTab(act.tabToGo)}
                      className="w-full mt-3 py-1 bg-black/40 hover:bg-[#0d0d11] border border-tertiary/20 hover:border-tertiary/40 text-[9px] text-on-surface font-mono font-bold rounded uppercase text-center transition-all flex items-center justify-center gap-0.5"
                    >
                      <span>{act.actionText}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sandbox Points Simulator for Easy Testing */}
          <div className="bg-[#0a0a0c] border border-dashed border-primary/20 rounded-2xl p-5 text-left shadow-md">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-on-primary-fixed-variant text-primary-fixed border border-primary/20 rounded-xl shadow-md shrink-0">
                <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
              </div>
              <div className="space-y-2 flex-1">
                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  🧪 COYUNTURA DE PRUEBAS / SIMULADOR DE PUNTOS
                </h4>
                <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed">
                  Para facilitar la evaluación de este sistema de gamificación y observar los movimientos dinámicos en la tabla de clasificación sin tener que completar lecciones reales, puedes simular una acción de bonificación a continuación.
                </p>
                <div className="flex flex-wrap gap-2 pt-1 items-center">
                  <div className="flex border border-tertiary/10 rounded-xl overflow-hidden bg-black/40 shadow-lg">
                    <button 
                      type="button"
                      onClick={() => setSimulationBonus(20)}
                      className={`px-3 py-1.5 text-[10px] font-bold ${simulationBonus === 20 ? 'bg-on-primary-fixed-variant text-primary-fixed border-r border-primary/20' : 'hover:bg-black/30 text-on-surface-variant border-r border-tertiary/10'}`}
                    >
                      +20 PTS
                    </button>
                    <button 
                      type="button"
                      onClick={() => setSimulationBonus(50)}
                      className={`px-3 py-1.5 text-[10px] font-bold ${simulationBonus === 50 ? 'bg-on-primary-fixed-variant text-primary-fixed border-r border-primary/20' : 'hover:bg-black/30 text-on-surface-variant border-r border-tertiary/10'}`}
                    >
                      +50 PTS
                    </button>
                    <button 
                      type="button"
                      onClick={() => setSimulationBonus(100)}
                      className={`px-3 py-1.5 text-[10px] font-bold ${simulationBonus === 100 ? 'bg-on-primary-fixed-variant text-primary-fixed' : 'hover:bg-black/30 text-on-surface-variant'}`}
                    >
                      +100 PTS
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      onAddBonusPoints(simulationBonus);
                      alert(`🧪 ¡Simulación Exitosa!\nSe han otorgado +${simulationBonus} puntos a ${currentUser.name}. Comprueba cómo se reordena el ranking.`);
                    }}
                    className="px-4 py-2 bg-[#0d0d11]/80 hover:bg-[#0d0d11] text-primary-fixed hover:text-white border border-primary/30 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all text-[10px] font-bold uppercase"
                  >
                    Simular Puntos Bonus &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Realtime Leaderboard Table (4 cols) */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-surface-container border border-tertiary/10 rounded-2xl overflow-hidden shadow-2xl text-on-surface flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-tertiary/10 flex justify-between items-center bg-primary-container/10">
              <h4 className="text-xs font-bold tracking-tight text-white font-mono uppercase flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-tertiary" /> RANKING GLOBAL
              </h4>
              <span className="text-[8px] bg-black/40 border border-tertiary/25 px-2 py-0.5 rounded font-mono font-bold text-tertiary">
                ACTUALIZADO EN VIVO
              </span>
            </div>

            {/* Virtualized List */}
            <div className="p-2">
              <VirtualizedList
                items={leaderboardList}
                height={Math.min(500, leaderboardList.length * 72)}
                itemHeight={72}
                renderItem={(user, idx) => {
                  const position = idx + 1;
                  const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : null;

                  return (
                    <div 
                      key={user.id} 
                      className={`p-3.5 flex items-center justify-between gap-3 transition-colors border-b border-tertiary/5 rounded-xl ${
                        user.isCurrentUser ? 'bg-primary-container/10' : 'bg-transparent hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Position representation */}
                        <div className="w-8 shrink-0 flex items-center justify-center font-mono font-bold text-xs text-on-surface-variant">
                          {medal ? (
                            <span className="text-xl leading-none">{medal}</span>
                          ) : (
                            <span>#{position}</span>
                          )}
                        </div>

                        {/* Avatar & Name */}
                        <div className="relative shrink-0">
                          <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className={`w-9 h-9 rounded-full object-cover border-2 ${
                              user.isCurrentUser ? 'border-primary' : 'border-tertiary/20'
                            }`}
                            referrerPolicy="no-referrer"
                          />
                          {user.isCurrentUser && (
                            <span className="absolute bottom-[-2px] right-[-2px] bg-primary text-on-primary rounded-full p-0.5 text-[6px]">
                              ⭐
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h5 className={`text-xs font-bold truncate uppercase ${
                            user.isCurrentUser ? 'text-primary' : 'text-white'
                          }`}>
                            {user.name}
                          </h5>
                          <p className="text-[8px] font-mono font-bold text-on-surface-variant truncate leading-tight mt-0.5 uppercase">
                            {user.rankTitle}
                          </p>
                        </div>
                      </div>

                      {/* Score Badge */}
                      <div className="text-right shrink-0">
                        <span className={`text-[11px] font-mono font-bold border px-2.5 py-1 rounded-xl shadow-md block ${
                          user.isCurrentUser 
                            ? 'bg-primary-container/30 border-primary/40 text-primary' 
                            : 'bg-black/40 border-tertiary/20 text-tertiary'
                        }`}>
                          {user.points} <span className="text-[8px]">PTS</span>
                        </span>
                        
                        {/* Detailed mini stats */}
                        <span className="text-[8px] font-mono text-on-surface-variant font-bold block mt-1 uppercase">
                          {user.completedLessonsCount}L • {user.videosCount}V • {user.chatCount}C
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
            </div>

            {/* Bottom Note */}
            <div className="p-3 bg-[#08080a]/60 border-t border-tertiary/10 flex items-center gap-2 text-[9px] text-on-surface-variant font-bold leading-normal">
              <Info className="w-4 h-4 text-tertiary shrink-0" />
              <span>
                Completa tus tareas para seguir acumulando puntos. Los tutores otorgan puntos bonus semanales.
              </span>
            </div>
          </div>

          {/* Achievement badge unlocks */}
          <div className="bg-surface-container border border-tertiary/10 rounded-2xl p-5 shadow-2xl">
            <h4 className="text-xs font-mono font-bold text-white uppercase border-b border-tertiary/10 pb-2 mb-4 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-tertiary" /> LOGROS DISPONIBLES
            </h4>
            
            <div className="space-y-3">
              {[
                {
                  name: 'Primer Impulso 🌱',
                  desc: 'Completa tu primera lección de Waacking.',
                  completed: curUserLessonsCount >= 1,
                  badgeText: '50 PTS'
                },
                {
                  name: 'Maestro de Fundamentos 🎓',
                  desc: 'Completa las clases teóricas de Nivel 1.',
                  completed: (() => {
                    const lvl1 = (lessons || []).filter(l => l && l.level === 1);
                    return lvl1.length > 0 && lvl1.every(l => (currentUser.completedLessons || []).includes(l.id));
                  })(),
                  badgeText: '200 PTS'
                },
                {
                  name: 'Estrella del Foro 🎥',
                  desc: 'Sube al menos un video en Feedback de Video.',
                  completed: curUserVideosCount >= 1,
                  badgeText: '100 PTS'
                },
                {
                  name: 'Orador del Lobby 💬',
                  desc: 'Envía un mensaje en la comunidad.',
                  completed: curUserChatCount >= 1,
                  badgeText: '10 PTS'
                }
              ].map((achievement, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                    achievement.completed ? 'bg-primary-container/10 border-primary/20' : 'bg-[#0d0d11]/30 border-tertiary/5 opacity-50'
                  }`}
                >
                  <div className="min-w-0">
                    <h5 className="text-[11px] font-bold text-white uppercase leading-tight flex items-center gap-1.5">
                      {achievement.completed ? '✅' : '🔒'} {achievement.name}
                    </h5>
                    <p className="text-[9px] text-on-surface-variant font-medium leading-tight mt-1">{achievement.desc}</p>
                  </div>
                  
                  <span className={`text-[9px] font-mono font-bold border px-1.5 py-0.5 rounded-md shrink-0 bg-black/40 ${
                    achievement.completed ? 'text-tertiary border-tertiary/20' : 'text-on-surface-variant/40 border-tertiary/5'
                  }`}>
                    {achievement.badgeText}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
