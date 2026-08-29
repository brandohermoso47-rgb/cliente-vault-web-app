import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  BookOpen, 
  ArrowRight, 
  Zap, 
  Target, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  Flame, 
  Lock, 
  Unlock,
  Star,
  Compass
} from 'lucide-react';
import { User, Lesson } from '../types';

export interface StudentLevelProgressBarProps {
  currentUser: User;
  lessons: Lesson[];
  onNavigateToLessons?: () => void;
  language?: 'es' | 'en';
  theme?: 'dark' | 'light';
}

interface LevelMilestone {
  levelNum: number;
  titleEs: string;
  titleEn: string;
  rankEs: string;
  rankEn: string;
  minPoints: number;
  targetLessonsCount: number;
  perksEs: string[];
  perksEn: string[];
  color: string;
  badgeBg: string;
}

const LEVEL_MILESTONES: LevelMilestone[] = [
  {
    levelNum: 1,
    titleEs: 'Nivel 1: Fundamentos & Arm Rolls',
    titleEn: 'Level 1: Fundamentals & Arm Rolls',
    rankEs: 'Principiante - Base Waack',
    rankEn: 'Beginner - Waack Foundation',
    minPoints: 0,
    targetLessonsCount: 6,
    perksEs: ['Técnica de Rolls bimanual', 'Rutinas a 115 BPM', 'Estrategias de Espejo Virtual'],
    perksEn: ['Bimanual roll technique', '115 BPM routines', 'Virtual Mirror strategies'],
    color: '#E9C349',
    badgeBg: 'from-[#E9C349]/20 to-[#E9C349]/5'
  },
  {
    levelNum: 2,
    titleEs: 'Nivel 2: Poses & Expresión Disco',
    titleEn: 'Level 2: Poses & Disco Expression',
    rankEs: 'Intermedio - Bailarín Cátedra',
    rankEn: 'Intermediate - Waack Dancer',
    minPoints: 250,
    targetLessonsCount: 12,
    perksEs: ['Poses dramáticas de alta velocidad', 'Pistas aceleradas 128-135 BPM', 'Laboratorio de Batallas'],
    perksEn: ['High-speed dramatic poses', '128-135 BPM accelerated tracks', 'Battle Lab access'],
    color: '#38BDF8',
    badgeBg: 'from-cyan-500/20 to-cyan-500/5'
  },
  {
    levelNum: 3,
    titleEs: 'Nivel 3: Musicalidad Síncopa & Batallas',
    titleEn: 'Level 3: Syncopated Musicality & Battles',
    rankEs: 'Avanzado - Soloist Master',
    rankEn: 'Advanced - Soloist Master',
    minPoints: 600,
    targetLessonsCount: 18,
    perksEs: ['Duelos en vivo ante jurados', 'Análisis somático de brazos', 'Generador de Freestyle I.A.'],
    perksEn: ['Live judge duels', 'Somatic arm analysis', 'A.I. Freestyle Generator'],
    color: '#A855F7',
    badgeBg: 'from-purple-500/20 to-purple-500/5'
  },
  {
    levelNum: 4,
    titleEs: 'Nivel 4: Virtuoso & Cátedra Monroe',
    titleEn: 'Level 4: Virtuoso & Monroe Master',
    rankEs: 'Master - Instructor & Mentor',
    rankEn: 'Master - Instructor & Mentor',
    minPoints: 1200,
    targetLessonsCount: 24,
    perksEs: ['Certificación Oficial Monroe Dance Group', 'Creación de Cursos propios', 'Acceso a Finanzas de Instructor'],
    perksEn: ['Monroe Dance Group Official Certification', 'Own course creation', 'Instructor Finance dashboard'],
    color: '#F43F5E',
    badgeBg: 'from-rose-500/20 to-rose-500/5'
  }
];

export default function StudentLevelProgressBar({
  currentUser,
  lessons = [],
  onNavigateToLessons,
  language = 'es',
  theme
}: StudentLevelProgressBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isDark = theme ? theme === 'dark' : document.documentElement.classList.contains('dark');

  // Parse current user level safely
  const rawLevel = currentUser.level || '1';
  let currentLevelNum = 1;
  if (typeof rawLevel === 'number') {
    currentLevelNum = rawLevel;
  } else if (typeof rawLevel === 'string') {
    const parsed = parseInt(rawLevel.replace(/\D/g, ''), 10);
    if (!isNaN(parsed) && parsed > 0) {
      currentLevelNum = parsed;
    }
  }
  currentLevelNum = Math.min(Math.max(currentLevelNum, 1), 4);

  const currentMilestone = LEVEL_MILESTONES.find(m => m.levelNum === currentLevelNum) || LEVEL_MILESTONES[0];
  const nextMilestone = LEVEL_MILESTONES.find(m => m.levelNum === currentLevelNum + 1) || currentMilestone;
  const isMaxLevel = currentLevelNum >= LEVEL_MILESTONES.length;

  // Filter lessons for user's level
  const userCompletedIds = new Set(currentUser.completedLessons || []);
  const levelLessons = lessons.filter(l => (l.level || 1) === currentLevelNum);
  const totalLevelLessons = Math.max(levelLessons.length, currentMilestone.targetLessonsCount);
  const completedLevelLessonsCount = levelLessons.filter(l => userCompletedIds.has(l.id)).length;

  // Total completed lessons overall
  const totalCompletedOverall = userCompletedIds.size;

  // Points progress
  const currentPoints = currentUser.points || 0;
  const prevLevelPts = currentMilestone.minPoints;
  const targetNextPts = nextMilestone.minPoints;
  const ptsNeededInCurrentLevel = Math.max(1, targetNextPts - prevLevelPts);
  const userPtsInCurrentLevel = Math.max(0, currentPoints - prevLevelPts);

  // Percentages
  const lessonPercent = Math.min(100, Math.round((completedLevelLessonsCount / totalLevelLessons) * 100));
  const pointsPercent = isMaxLevel 
    ? 100 
    : Math.min(100, Math.round((userPtsInCurrentLevel / ptsNeededInCurrentLevel) * 100));

  // Overall combined weighted score (50% lessons, 50% points)
  const overallProgressPercent = isMaxLevel ? 100 : Math.min(100, Math.round((lessonPercent * 0.5) + (pointsPercent * 0.5)));

  // Remaining gaps for next level
  const remainingLessons = Math.max(0, totalLevelLessons - completedLevelLessonsCount);
  const remainingPoints = isMaxLevel ? 0 : Math.max(0, targetNextPts - currentPoints);

  const isEs = language === 'es';

  return (
    <div className={`border rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden transition-all group ${
      isDark ? 'bg-[#121218] border-white/15 text-white hover:border-[#E9C349]/40' : 'bg-white border-slate-200 text-slate-900 hover:border-amber-400/60 shadow-md'
    }`}>
      
      {/* Background ambient lighting */}
      <div 
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20 transition-all duration-700 group-hover:opacity-30"
        style={{ backgroundColor: currentMilestone.color }}
      />
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(233,195,73,0.06)_0%,transparent_65%)] pointer-events-none" />

      {/* Main Content Header */}
      <div className="relative z-10 space-y-5">

        {/* Top Badges & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-black text-lg shadow-lg shrink-0 border border-white/20"
              style={{ backgroundColor: currentMilestone.color }}
            >
              L{currentLevelNum}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold text-[#E9C349] bg-[#E9C349]/10 border border-[#E9C349]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3 h-3 text-[#E9C349]" />
                  {isEs ? currentMilestone.rankEs : currentMilestone.rankEn}
                </span>

                <span className="text-[10px] font-mono text-slate-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                  {totalCompletedOverall} {isEs ? 'Clases Vistas en Total' : 'Total Lessons Watched'}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase font-mono tracking-wide mt-1 flex items-center gap-2">
                <span>{isEs ? currentMilestone.titleEs : currentMilestone.titleEn}</span>
                {isMaxLevel && <Sparkles className="w-4 h-4 text-[#E9C349] animate-bounce" />}
              </h3>
            </div>
          </div>

          {/* Overall Percentage Badge & Toggle */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">
                {isMaxLevel 
                  ? (isEs ? 'Nivel Máximo Alcanzado' : 'Max Level Achieved') 
                  : (isEs ? 'Avance al Próximo Nivel' : 'Next Level Progress')}
              </span>
              <span className="text-2xl font-black font-mono text-[#E9C349]">
                {overallProgressPercent}%
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-slate-200 dark:hover:bg-white/15 border border-white/10 text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer flex items-center justify-center"
              title={isEs ? 'Ver mapa de niveles y requisitos' : 'View level roadmap & requirements'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4 text-[#E9C349]" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Combined Master Visual Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#E9C349]" />
              <span>
                {isMaxLevel 
                  ? (isEs ? '¡Has alcanzado la cima académica de Waack ON!' : 'You reached the academic peak!') 
                  : (isEs ? `Próximo Ascenso: ${nextMilestone.titleEs}` : `Next Rank: ${nextMilestone.titleEn}`)}
              </span>
            </span>

            <span className="text-slate-400 font-bold">
              {currentPoints} / {isMaxLevel ? currentPoints : targetNextPts} PTS
            </span>
          </div>

          {/* Animated Glow Bar */}
          <div className="w-full bg-slate-100 dark:bg-black/60 border border-white/15 h-4 rounded-full p-0.5 relative overflow-hidden shadow-inner">
            {/* Shimmer effect */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallProgressPercent}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full rounded-full relative overflow-hidden shadow-[0_0_15px_rgba(233,195,73,0.6)]"
              style={{
                background: `linear-gradient(90deg, #E9C349 0%, ${currentMilestone.color} 50%, #f59e0b 100%)`
              }}
            >
              {/* Moving shine ray */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/3"
              />
            </motion.div>

            {/* Milestone markers at 25%, 50%, 75% */}
            {!isMaxLevel && (
              <>
                <div className="absolute top-0 bottom-0 left-1/4 w-0.5 bg-white/20 pointer-events-none" />
                <div className="absolute top-0 bottom-0 left-2/4 w-0.5 bg-white/20 pointer-events-none" />
                <div className="absolute top-0 bottom-0 left-3/4 w-0.5 bg-white/20 pointer-events-none" />
              </>
            )}
          </div>
        </div>

        {/* Dual Metric Indicators: Lessons & Points */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          
          {/* 1. Lessons Metric Card */}
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-black/40 border border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  {isEs ? 'Lecciones del Nivel' : 'Level Lessons'}
                </span>
                <span className="text-xs font-mono font-black text-slate-900 dark:text-white">
                  {completedLevelLessonsCount} / {totalLevelLessons} {isEs ? 'Completadas' : 'Completed'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold text-[#E9C349]">
                {lessonPercent}%
              </span>
              <div className="w-16 bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                <div 
                  className="bg-[#E9C349] h-full transition-all duration-500" 
                  style={{ width: `${lessonPercent}%` }} 
                />
              </div>
            </div>
          </div>

          {/* 2. Points Metric Card */}
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-black/40 border border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  {isEs ? 'Puntos de Experiencia' : 'Experience Points'}
                </span>
                <span className="text-xs font-mono font-black text-slate-900 dark:text-white">
                  {currentPoints} {isEs ? 'PTS Acumulados' : 'PTS Total'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold text-cyan-400">
                {pointsPercent}%
              </span>
              <div className="w-16 bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                <div 
                  className="bg-cyan-400 h-full transition-all duration-500" 
                  style={{ width: `${pointsPercent}%` }} 
                />
              </div>
            </div>
          </div>

        </div>

        {/* Motivational Status & Gap Notice */}
        {!isMaxLevel ? (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#E9C349]/10 via-amber-950/20 to-transparent border border-[#E9C349]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs font-mono text-slate-700 dark:text-slate-200">
              <Target className="w-4 h-4 text-[#E9C349] shrink-0" />
              <span>
                {isEs ? (
                  <>
                    Para ascender al <strong className="text-slate-900 dark:text-white">{nextMilestone.titleEs}</strong> te faltan{' '}
                    <strong className="text-[#E9C349]">{remainingLessons} lecciones</strong> y{' '}
                    <strong className="text-[#E9C349]">{remainingPoints} PTS</strong>.
                  </>
                ) : (
                  <>
                    To reach <strong className="text-slate-900 dark:text-white">{nextMilestone.titleEn}</strong> you need{' '}
                    <strong className="text-[#E9C349]">{remainingLessons} lessons</strong> and{' '}
                    <strong className="text-[#E9C349]">{remainingPoints} PTS</strong>.
                  </>
                )}
              </span>
            </div>

            {onNavigateToLessons && (
              <button
                type="button"
                onClick={onNavigateToLessons}
                className="px-4 py-2 rounded-xl bg-[#E9C349] hover:bg-[#ffda5c] text-black font-mono font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              >
                <span>{isEs ? 'Ver Lecciones' : 'Go to Lessons'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs font-mono text-emerald-300">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {isEs 
                ? '¡Felicidades! Posees el rango máximo en La Academia Waack ON. Continúa practicando en el Laboratorio.'
                : 'Congratulations! You hold the highest academic rank at Waack ON.'}
            </span>
          </div>
        )}

        {/* Expandable Roadmap Stepper */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-4 border-t border-white/10 space-y-4 overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#E9C349]" />
                  <span>{isEs ? 'Mapa de Ruta & Beneficios de Nivel' : 'Academic Level Roadmap'}</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-400">
                  {isEs ? '4 Niveles Académicos' : '4 Academic Levels'}
                </span>
              </div>

              {/* Stepper Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {LEVEL_MILESTONES.map((m) => {
                  const isCurrent = m.levelNum === currentLevelNum;
                  const isUnlocked = m.levelNum <= currentLevelNum;

                  return (
                    <div
                      key={`milestone-card-${m.levelNum}`}
                      className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                        isCurrent 
                          ? 'bg-[#E9C349]/15 border-[#E9C349] shadow-[0_0_20px_rgba(233,195,73,0.2)]' 
                          : isUnlocked
                            ? 'bg-white/5 border-emerald-500/30'
                            : 'bg-slate-100 dark:bg-black/40 border-white/10 opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-black/40 border border-white/10 text-slate-900 dark:text-white">
                          NIVEL {m.levelNum}
                        </span>

                        {isUnlocked ? (
                          <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
                            <Unlock className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="p-1 rounded-md bg-white/10 text-slate-400">
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>

                      <div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white font-mono">{isEs ? m.titleEs : m.titleEn}</h5>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {m.minPoints} PTS • {m.targetLessonsCount} {isEs ? 'Clases' : 'Lessons'}
                        </p>
                      </div>

                      {/* Perks */}
                      <div className="space-y-1 border-t border-white/10 pt-2">
                        <span className="text-[9px] font-mono text-slate-400 block uppercase">
                          {isEs ? 'Desbloquea:' : 'Unlocks:'}
                        </span>
                        {(isEs ? m.perksEs : m.perksEn).map((perk, idx) => (
                          <p key={idx} className="text-[10px] text-slate-300 font-mono flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#E9C349] shrink-0" />
                            <span className="truncate">{perk}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
