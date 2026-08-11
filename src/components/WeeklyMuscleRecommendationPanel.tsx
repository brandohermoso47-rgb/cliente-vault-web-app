import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dumbbell, 
  Flame, 
  Activity, 
  Sparkles, 
  Play, 
  Pause, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  RotateCcw, 
  ShieldAlert, 
  Zap, 
  Target, 
  ChevronRight,
  X,
  Volume2,
  VolumeX,
  Award,
  Download,
  FileJson
} from 'lucide-react';
import { PracticeLog, User } from '../types';
import { Language } from '../lib/translations';

export interface MuscleGroupInfo {
  id: 'brazos' | 'core' | 'espalda' | 'piernas' | 'cardio';
  name: string;
  icon: string;
  color: string;
  keywords: string[];
  description: string;
  whyImportant: string;
  warmup: {
    title: string;
    durationMinutes: number;
    description: string;
    steps: string[];
  };
  physical: {
    title: string;
    durationMinutes: number;
    description: string;
    steps: string[];
  };
}

export const MUSCLE_GROUPS_CATALOG: Record<string, MuscleGroupInfo> = {
  brazos: {
    id: 'brazos',
    name: 'Brazos & Hombros',
    icon: '💪',
    color: '#E9C349',
    keywords: ['brazo', 'roll', 'hombro', 'muñeca', 'whack', 'codo', 'tríceps', 'deltoide'],
    description: 'Deltoides, manguito rotador, codos y flexores de muñeca.',
    whyImportant: 'Indispensable para ejecutar rolls limpios a alta velocidad sin sobrecargar los hombros.',
    warmup: {
      title: 'Acondicionamiento Articular de Manguito Rotador & Muñecas',
      durationMinutes: 5,
      description: 'Activación dinámica para preparar articulaciones de codos y hombros antes de drills de Rolls.',
      steps: [
        'Circunducción suave de muñecas en 8 tiempos (120 BPM) - 1 min',
        'Rotación interna/externa de hombros a 90° - 1 min',
        'Extensiones dinámicas de codo manteniendo la altura de hombros - 1.5 min',
        'Sacudida elástica muscular y micro-estiramiento de antebrazos - 1.5 min'
      ]
    },
    physical: {
      title: 'Rutina de Físico: Isometría & Resistencia de Deltoides',
      durationMinutes: 10,
      description: 'Acondicionamiento de fuerza para mantener la estampa de brazos firmes durante todo el tema.',
      steps: [
        'Sostén isométrico en T (Brazos extendidos a 90°) - 3x45 segundos',
        'Pulsos verticales cortos en elevación lateral - 3x20 repeticiones',
        'Círculos pequeños concentrados en codos a 128 BPM - 2 min sostenidos',
        'Flexiones de brazo enfocadas en tríceps/hombro - 3x12 repeticiones'
      ]
    }
  },
  core: {
    id: 'core',
    name: 'Core & Torso',
    icon: '⚡',
    color: '#38bdf8',
    keywords: ['core', 'pecho', 'aislamiento', 'torso', 'abdomen', 'transverso', 'caja torácica'],
    description: 'Transverso abdominal, intercostales y musculatura paraislas de tórax.',
    whyImportant: 'Otorga el centro de gravedad necesario para disociar el pecho y marcar acentos limpios.',
    warmup: {
      title: 'Activación de Transverso Abdominal & Aislamiento Torácico',
      durationMinutes: 4,
      description: 'Desbloqueo de columna torácica y preparación de abdominales para quiebres rítmicos.',
      steps: [
        'Respiración diafragmática profunda con contracción de core - 1 min',
        'Aislamiento lateral de caja torácica (Izquierda/Derecha) - 1 min',
        'Aislamiento anteroposterior (Pecho afuera / Pecho adentro) - 1 min',
        'Círculos continuos de torso acoplados al compás - 1 min'
      ]
    },
    physical: {
      title: 'Rutina de Físico: Planchas Dinámicas & Disociación de Core',
      durationMinutes: 10,
      description: 'Acondicionamiento de resistencia central para sostener batallas sin perder la postura.',
      steps: [
        'Plancha frontal en antebrazos con contracción de glúteos - 3x45 segundos',
        'Plancha lateral con rotación de torso - 3x30 seg por lado',
        'Crunches bicicleta lentos controlando la cintura - 3x20 repeticiones',
        'Hollow Body Hold (Sostén de bote) - 3x30 segundos'
      ]
    }
  },
  espalda: {
    id: 'espalda',
    name: 'Espalda & Postura',
    icon: '🧘',
    color: '#8B5CF6',
    keywords: ['espalda', 'postura', 'romboides', 'escapular', 'somático', 'columna', 'trapecio'],
    description: 'Romboides, trapecio inferior, erectores espinales y movilidad escapular.',
    whyImportant: 'Crucial para proyectar la elegancia de la época Disco de los 70s y prevenir cifosis por fatiga.',
    warmup: {
      title: 'Retracción Escapular & Proyección Elegante 70s',
      durationMinutes: 5,
      description: 'Movilidad de la cintura escapular para proyectar el pecho con regiedad y soltura.',
      steps: [
        'Retracción escapular de pie sosteniendo 3 segundos - 1 min',
        'Aperturas de pecho en W con codos pegados al cuerpo - 1.5 min',
        'Estiramiento de gato/vaca de pie apoyado en muslos - 1.5 min',
        'Extensión torácica en postura de pose alta - 1 min'
      ]
    },
    physical: {
      title: 'Rutina de Físico: Romboides Regios & Sostén Lumbar',
      durationMinutes: 8,
      description: 'Acondicionamiento muscular posterior para mantener la espalda erguida sin colapsar.',
      steps: [
        'Elevaciones Superman en piso para erectores espinales - 3x15 repeticiones',
        'Remo isométrico sin peso con retracción máxima - 3x40 segundos',
        'Nadamientos dorsales en posición prono - 3x30 segundos',
        'Sostén de extensión torácica en pared - 2 min'
      ]
    }
  },
  piernas: {
    id: 'piernas',
    name: 'Piernas & Cadera',
    icon: '🦵',
    color: '#10B981',
    keywords: ['pierna', 'cuádriceps', 'glúteo', 'pose baja', 'cadera', 'pasarela', 'sentadilla', 'squat', 'tobillo'],
    description: 'Cuádriceps, isquiotibiales, glúteos y estabilizadores de tobillo.',
    whyImportant: 'Permite bajar el centro de gravedad, realizar Poses Bajas estables y sostener el bounce.',
    warmup: {
      title: 'Acondicionamiento de Poses Bajas & Movilidad de Cadera',
      durationMinutes: 5,
      description: 'Activación articular de rodillas y flexores de cadera para transiciones de nivel.',
      steps: [
        'Sentadillas dinámicas suaves con rebote consciente - 1.5 min',
        'Círculos de cadera y movilidad de aductores - 1.5 min',
        'Elevación de talones para activar estabilizadores de tobillo - 1 min',
        'Estiramiento activo de flexor de cadera en estocada - 1 min'
      ]
    },
    physical: {
      title: 'Rutina de Físico: Fuerza de Cuádriceps & Squat Hold en Poses',
      durationMinutes: 10,
      description: 'Fortalecimiento de tren inferior para sostener cambios de nivel dramáticos.',
      steps: [
        'Sentadilla isométrica en pared (Wall Sit) a 90° - 3x45 segundos',
        'Estocadas alternadas con pausa en pose baja - 3x16 repeticiones',
        'Squat Hold libre alternando peso en metatarsos - 3x30 segundos',
        'Puentes de glúteo unipodales - 3x12 repeticiones por pierna'
      ]
    }
  },
  cardio: {
    id: 'cardio',
    name: 'Cardio & Resistencia',
    icon: '🔥',
    color: '#9A2B3C',
    keywords: ['cardio', 'resistencia', 'hiit', 'batalla', 'pulsación', 'estamina', 'respiración'],
    description: 'Capacidad aeróbica, acondicionamiento de alta intensidad e intervalos HIIT.',
    whyImportant: 'Esencial para sostener rondas intensas de batallas de 2 minutos sin perder precisión.',
    warmup: {
      title: 'Pulsación Aeróbica & Bounce Rítmico 124-128 BPM',
      durationMinutes: 4,
      description: 'Elevación progresiva del ritmo cardíaco con groove disco y pasarela.',
      steps: [
        'Bounce rítmico continuo marcando el tiempo fuerte (1-3) - 1 min',
        'Pasarela disco en el sitio alternando brazos sueltos - 1 min',
        'Jumping Jacks con brazos en marco de Waacking - 1 min',
        'Skips bajos controlando respiración nasal/bucal - 1 min'
      ]
    },
    physical: {
      title: 'Rutina de Físico: HIIT Waack-Cardio de Alta Resistencia',
      durationMinutes: 12,
      description: 'Entrenamiento por intervalos para potenciar la estamina en batallas consecutivas.',
      steps: [
        'Intervalo 1: 30s de Rolls explosivos + 15s de Poses fijas - 4 rondas',
        'Intervalo 2: 30s de Burpees con marco superior + 15s descanso - 3 rondas',
        'Intervalo 3: 30s de Escaladores de montaña acelerados + 15s descanso - 3 rondas',
        'Enfriamiento: Marcha suave y recuperación diafragmática - 2 min'
      ]
    }
  }
};

interface WeeklyMuscleRecommendationPanelProps {
  practiceLogs: PracticeLog[];
  currentUser: User;
  onLogPractice: (minutes: number, activityType: 'drill' | 'battle' | 'combo' | 'playlist' | 'sensorial', description: string, extra?: { category?: any; bpm?: number }) => void;
  setActiveTab: (tab: string) => void;
  onUserChange?: (arg: User | ((prev: User) => User)) => void;
  language: Language;
  theme?: 'dark' | 'light';
}

export default function WeeklyMuscleRecommendationPanel({
  practiceLogs,
  currentUser,
  onLogPractice,
  setActiveTab,
  onUserChange,
  language,
  theme
}: WeeklyMuscleRecommendationPanelProps) {
  const isDark = theme ? theme === 'dark' : document.documentElement.classList.contains('dark');
  // Modal state for active guided workout timer
  const [activeGuidedModal, setActiveGuidedModal] = useState<{
    group: MuscleGroupInfo;
    type: 'warmup' | 'physical';
  } | null>(null);

  // Timer states inside modal
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [registeredSuccessMsg, setRegisteredSuccessMsg] = useState<string | null>(null);

  // 1. Calculate training volume per muscle group for the last 7 days
  const calculateWeeklyMuscleStats = () => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const cutoffDateStr = sevenDaysAgo.toISOString().split('T')[0];

    // Filter logs from last 7 days
    const recentLogs = (practiceLogs || []).filter(log => log.date >= cutoffDateStr);

    // Initial tally
    const totals: Record<string, number> = {
      brazos: 0,
      core: 0,
      espalda: 0,
      piernas: 0,
      cardio: 0
    };

    let totalMinutesWeek = 0;

    recentLogs.forEach(log => {
      const mins = log.minutes || 0;
      totalMinutesWeek += mins;
      const descLower = (log.description || '').toLowerCase();
      const catLower = (log.category || '').toLowerCase();
      const combinedText = `${descLower} ${catLower}`;

      let matchedAny = false;

      // Match explicit keywords
      Object.values(MUSCLE_GROUPS_CATALOG).forEach(group => {
        const hasKeyword = group.keywords.some(kw => combinedText.includes(kw));
        if (hasKeyword) {
          totals[group.id] += mins;
          matchedAny = true;
        }
      });

      // Default distribution based on activityType if no explicit keywords matched
      if (!matchedAny) {
        switch (log.activityType) {
          case 'drill':
            totals.brazos += Math.round(mins * 0.6);
            totals.espalda += Math.round(mins * 0.4);
            break;
          case 'battle':
            totals.cardio += Math.round(mins * 0.5);
            totals.piernas += Math.round(mins * 0.5);
            break;
          case 'combo':
            totals.core += Math.round(mins * 0.4);
            totals.brazos += Math.round(mins * 0.3);
            totals.piernas += Math.round(mins * 0.3);
            break;
          case 'playlist':
            totals.cardio += Math.round(mins * 0.5);
            totals.brazos += Math.round(mins * 0.5);
            break;
          case 'sensorial':
            totals.espalda += Math.round(mins * 0.5);
            totals.core += Math.round(mins * 0.5);
            break;
        }
      }
    });

    // Convert to sorted array
    const sortedGroups = Object.keys(totals).map(id => {
      const catalogInfo = MUSCLE_GROUPS_CATALOG[id];
      const mins = totals[id];
      const percentage = totalMinutesWeek > 0 ? Math.round((mins / totalMinutesWeek) * 100) : 0;
      return {
        ...catalogInfo,
        minutes: mins,
        percentage
      };
    }).sort((a, b) => a.minutes - b.minutes); // ascending (least worked first)

    return {
      sortedGroups,
      leastWorked: sortedGroups[0],
      secondLeastWorked: sortedGroups[1],
      totalMinutesWeek
    };
  };

  const muscleStats = calculateWeeklyMuscleStats();
  const leastWorkedGroup = muscleStats.leastWorked;

  // Guided workout modal handlers
  const openGuidedWorkout = (group: MuscleGroupInfo, type: 'warmup' | 'physical') => {
    const targetData = type === 'warmup' ? group.warmup : group.physical;
    setActiveGuidedModal({ group, type });
    setTimerSeconds(targetData.durationMinutes * 60);
    setIsTimerRunning(true);
    setCurrentStepIndex(0);
    setWorkoutCompleted(false);
    setRegisteredSuccessMsg(null);
  };

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setWorkoutCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const handleRegisterGuidedWorkout = () => {
    if (!activeGuidedModal) return;
    const { group, type } = activeGuidedModal;
    const exercise = type === 'warmup' ? group.warmup : group.physical;

    // Log practice
    onLogPractice(
      exercise.durationMinutes,
      type === 'warmup' ? 'sensorial' : 'drill',
      `[Sugerencia Semanal] ${exercise.title}`,
      { category: 'postura' }
    );

    // Award bonus points (+100 PTS)
    if (onUserChange) {
      onUserChange(prev => ({
        ...prev,
        points: (prev.points || 0) + 100
      }));
    }

    setRegisteredSuccessMsg(`¡Excelente! Has registrado ${exercise.durationMinutes} minutos de ${exercise.title} y ganado +100 PTS. 🌟`);
    
    setTimeout(() => {
      setActiveGuidedModal(null);
    }, 2800);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleExportJSON = () => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const cutoffDateStr = sevenDaysAgo.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    const recentLogs = (practiceLogs || []).filter(log => log.date >= cutoffDateStr);
    const totalMins = recentLogs.reduce((sum, log) => sum + (log.minutes || 0), 0);

    const exportData = {
      platform: "WaackOn Platform",
      exportedAt: new Date().toISOString(),
      period: {
        startDate: cutoffDateStr,
        endDate: todayStr,
        totalMinutes: totalMins,
        totalSessions: recentLogs.length
      },
      student: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        targetMinutes: currentUser.targetMinutes || 30
      },
      logs: recentLogs
    };

    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (currentUser.name || 'alumno').toLowerCase().replace(/[^a-z0-9]/g, '_');
    a.download = `historial_semanal_waackon_${safeName}_${todayStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`border rounded-2xl p-5 md:p-6 relative overflow-hidden shadow-2xl space-y-5 transition-colors ${
      isDark ? 'bg-[#121212] border-[#262626] text-[#EDEFF4]' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      {/* Glow background highlight */}
      <div className="absolute right-0 top-0 w-80 h-80 bg-[#E9C349]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#E9C349]/15 border border-[#E9C349]/30 rounded-xl text-[#E9C349]">
              <Dumbbell className="w-5 h-5" />
            </span>
            <h3 className={`text-sm md:text-base font-mono font-bold tracking-widest uppercase flex flex-wrap items-center gap-2 ${
              isDark ? 'text-[#EDEFF4]' : 'text-slate-900'
            }`}>
              <span>SUGERENCIAS DE ACONDICIONAMIENTO & FISIOLOGÍA</span>
              <span className="text-[9px] font-mono font-bold text-black bg-[#E9C349] px-2.5 py-0.5 rounded-full uppercase">
                Análisis Semanal
              </span>
            </h3>
          </div>
          <p className={`text-[11px] font-semibold leading-relaxed ${isDark ? 'text-[#8A8A8A]' : 'text-slate-500'}`}>
            Basado en tus {practiceLogs.length} sesiones registradas de la última semana ({muscleStats.totalMinutesWeek} min acumulados).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleExportJSON}
            className="px-3.5 py-2 bg-[#E9C349] hover:bg-[#d8b33c] text-black border border-[#E9C349] text-xs font-mono font-black rounded-xl transition-all flex items-center justify-center gap-1.5 uppercase tracking-wide hover:scale-105 shrink-0 shadow-md cursor-pointer"
            title="Descargar historial semanal de la última semana como JSON"
          >
            <Download className="w-4 h-4 fill-black" />
            <span>Descargar JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fisico')}
            className={`px-4 py-2 text-xs font-mono font-bold rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wide hover:scale-105 shrink-0 cursor-pointer ${
              isDark ? 'bg-[#1c1a12] hover:bg-[#2b2719] text-[#E9C349] border border-[#E9C349]/40' : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300'
            }`}
          >
            <Activity className="w-4 h-4 text-[#E9C349]" />
            <span>Ver Módulo Físico Completo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Breakdown bar of 5 muscle groups */}
      <div className={`space-y-2 border rounded-xl p-4 transition-colors ${
        isDark ? 'bg-[#0A0A0A] border-[#262626]' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center justify-between text-xs font-mono">
          <span className={`font-bold uppercase flex items-center gap-1.5 ${isDark ? 'text-[#8A8A8A]' : 'text-slate-600'}`}>
            <Target className="w-3.5 h-3.5 text-[#E9C349]" /> Balance de Carga Muscular (Últimos 7 Días)
          </span>
          <span className={isDark ? 'text-slate-400 font-bold' : 'text-slate-600 font-bold'}>{muscleStats.totalMinutesWeek} minutos totales</span>
        </div>

        {/* Visual progress distribution bar */}
        <div className={`w-full h-3 rounded-full overflow-hidden flex ${isDark ? 'bg-[#1c1b1b]' : 'bg-slate-200'}`}>
          {muscleStats.sortedGroups.map(group => {
            if (group.minutes === 0) return null;
            const pct = muscleStats.totalMinutesWeek > 0 
              ? (group.minutes / muscleStats.totalMinutesWeek) * 100 
              : 0;
            return (
              <div 
                key={group.id} 
                style={{ width: `${pct}%`, backgroundColor: group.color }} 
                className="h-full transition-all duration-500 relative group/bar"
                title={`${group.name}: ${group.minutes} mins (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>

        {/* Legend pills */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {muscleStats.sortedGroups.map(group => (
            <div key={group.id} className="flex items-center gap-1.5 text-[10px] font-mono">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: group.color }} />
              <span className={isDark ? 'text-slate-300 font-medium' : 'text-slate-700 font-medium'}>{group.icon} {group.name}:</span>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{group.minutes}m</span>
              {group.id === leastWorkedGroup.id && (
                <span className="text-[8px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.2 rounded font-bold uppercase">
                  Poco Trabajado
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Under-Worked Muscle Highlight Box */}
      {leastWorkedGroup && (
        <div className={`border-2 rounded-2xl p-5 relative overflow-hidden shadow-xl space-y-4 transition-colors ${
          isDark 
            ? 'bg-gradient-to-br from-[#1c1813] via-[#121212] to-[#121212] border-[#E9C349]/60 text-white' 
            : 'bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 border-amber-400/80 text-slate-900'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#9A2B3C]/20 border border-[#9A2B3C] text-[#E9C349] rounded-2xl text-xl shrink-0">
                {leastWorkedGroup.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-black text-black bg-[#E9C349] px-2.5 py-0.5 rounded-full uppercase">
                    ⚠️ ÁREA CON MENOR TRABAJO DETECTADA
                  </span>
                  <span className="text-xs font-mono font-bold text-rose-400">
                    {leastWorkedGroup.minutes === 0 ? '0 minutos registrados' : `${leastWorkedGroup.minutes}m en 7 días`}
                  </span>
                </div>
                <h4 className={`text-base font-bold mt-0.5 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {leastWorkedGroup.name}
                </h4>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className={`text-[10px] font-mono block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Efecto en tu Baile:</span>
              <span className="text-xs text-[#E9C349] font-bold max-w-xs block leading-tight">
                {leastWorkedGroup.whyImportant}
              </span>
            </div>
          </div>

          {/* Recommended Warm-up & Physical Exercises grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Recommendation 1: Calentamiento Especifico */}
            <div className={`border rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-colors ${
              isDark ? 'bg-[#0A0A0A] border-white/10 hover:border-[#E9C349]/40' : 'bg-white border-slate-200 hover:border-amber-400/60 shadow-sm'
            }`}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" /> CALENTAMIENTO ESPECÍFICO
                  </span>
                  <span className="text-xs font-mono font-bold text-[#E9C349] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {leastWorkedGroup.warmup.durationMinutes} min
                  </span>
                </div>

                <h5 className="text-sm font-bold text-white leading-snug">
                  {leastWorkedGroup.warmup.title}
                </h5>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {leastWorkedGroup.warmup.description}
                </p>

                <div className="bg-[#141414] rounded-xl p-2.5 border border-white/5 space-y-1">
                  <p className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase">Pasos de la rutina:</p>
                  {leastWorkedGroup.warmup.steps.map((step, sidx) => (
                    <p key={sidx} className="text-[10px] text-slate-300 leading-tight flex items-start gap-1">
                      <span className="text-[#E9C349] font-bold">•</span>
                      <span>{step}</span>
                    </p>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openGuidedWorkout(leastWorkedGroup, 'warmup')}
                  className="flex-1 py-2 bg-[#E9C349] hover:bg-[#d8b33c] text-black text-xs font-black rounded-xl shadow transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>Iniciar Calentamiento Guiado</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onLogPractice(
                      leastWorkedGroup.warmup.durationMinutes,
                      'sensorial',
                      `[Calentamiento] ${leastWorkedGroup.warmup.title}`,
                      { category: 'postura' }
                    );
                    if (onUserChange) {
                      onUserChange(prev => ({ ...prev, points: (prev.points || 0) + 50 }));
                    }
                  }}
                  className="px-3 py-2 bg-[#1c1b1b] hover:bg-[#262626] text-[#E9C349] border border-[#E9C349]/30 text-xs font-bold rounded-xl transition-all uppercase flex items-center justify-center gap-1 cursor-pointer"
                  title="Registrar directamente sin abrir el cronómetro"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>+50 PTS</span>
                </motion.button>
              </div>
            </div>

            {/* Recommendation 2: Rutina de Físico Encapuchada */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-[#9A2B3C]/50 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded uppercase flex items-center gap-1">
                    <Flame className="w-3 h-3 text-rose-400" /> RUTINA DE 'FÍSICO' RECOMENDADA
                  </span>
                  <span className="text-xs font-mono font-bold text-[#E9C349] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {leastWorkedGroup.physical.durationMinutes} min
                  </span>
                </div>

                <h5 className="text-sm font-bold text-white leading-snug">
                  {leastWorkedGroup.physical.title}
                </h5>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {leastWorkedGroup.physical.description}
                </p>

                <div className="bg-[#141414] rounded-xl p-2.5 border border-white/5 space-y-1">
                  <p className="text-[9px] font-mono font-bold text-[#8A8A8A] uppercase">Ejercicios incluidos:</p>
                  {leastWorkedGroup.physical.steps.map((step, sidx) => (
                    <p key={sidx} className="text-[10px] text-slate-300 leading-tight flex items-start gap-1">
                      <span className="text-[#9A2B3C] font-bold">•</span>
                      <span>{step}</span>
                    </p>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openGuidedWorkout(leastWorkedGroup, 'physical')}
                  className="flex-1 py-2 bg-[#9A2B3C] hover:bg-[#81262c] text-white text-xs font-bold rounded-xl shadow transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer border border-[#E9C349]/30"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Iniciar Físico Guiado</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onLogPractice(
                      leastWorkedGroup.physical.durationMinutes,
                      'drill',
                      `[Físico] ${leastWorkedGroup.physical.title}`,
                      { category: 'postura' }
                    );
                    if (onUserChange) {
                      onUserChange(prev => ({ ...prev, points: (prev.points || 0) + 100 }));
                    }
                  }}
                  className="px-3 py-2 bg-[#1c1b1b] hover:bg-[#262626] text-[#E9C349] border border-[#E9C349]/30 text-xs font-bold rounded-xl transition-all uppercase flex items-center justify-center gap-1 cursor-pointer"
                  title="Registrar directamente sin abrir el cronómetro"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>+100 PTS</span>
                </motion.button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Guided Workout Timer Modal */}
      <AnimatePresence>
        {activeGuidedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#121212] border-2 border-[#E9C349] rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-[#E9C349]/20 text-[#E9C349] rounded-xl font-bold">
                    {activeGuidedModal.group.icon}
                  </span>
                  <div>
                    <span className="text-[9px] font-mono font-bold text-[#E9C349] uppercase block">
                      ENTRENAMIENTO GUIADO LASSEN
                    </span>
                    <h4 className="text-base font-bold text-white">
                      {activeGuidedModal.type === 'warmup' ? activeGuidedModal.group.warmup.title : activeGuidedModal.group.physical.title}
                    </h4>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsTimerRunning(false);
                    setActiveGuidedModal(null);
                  }}
                  className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Success Notification Banner */}
              {registeredSuccessMsg && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{registeredSuccessMsg}</span>
                </div>
              )}

              {/* Timer Display */}
              <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl p-6 text-center space-y-3 relative overflow-hidden">
                <div className="text-4xl md:text-5xl font-mono font-black text-[#E9C349] tracking-wider">
                  {formatTimer(timerSeconds)}
                </div>

                <div className="flex justify-center items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="px-5 py-2 bg-[#E9C349] text-black text-xs font-black rounded-xl uppercase flex items-center gap-2 shadow cursor-pointer"
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-black" />}
                    <span>{isTimerRunning ? 'Pausar' : 'Reanudar'}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => {
                      const totalMins = activeGuidedModal.type === 'warmup' 
                        ? activeGuidedModal.group.warmup.durationMinutes 
                        : activeGuidedModal.group.physical.durationMinutes;
                      setTimerSeconds(totalMins * 60);
                      setIsTimerRunning(true);
                    }}
                    className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl border border-white/10 cursor-pointer"
                    title="Reiniciar cronómetro"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Step by Step guidance */}
              <div className="space-y-2">
                <p className="text-[10px] font-mono font-bold text-[#8A8A8A] uppercase">Pasos a ejecutar:</p>
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {(activeGuidedModal.type === 'warmup' ? activeGuidedModal.group.warmup.steps : activeGuidedModal.group.physical.steps).map((step, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setCurrentStepIndex(idx)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        currentStepIndex === idx 
                          ? 'bg-[#1c1a12] border-[#E9C349] text-white font-bold' 
                          : 'bg-[#0A0A0A] border-white/5 text-slate-400 hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{step}</span>
                        {currentStepIndex === idx && <span className="text-[10px] text-[#E9C349] font-mono uppercase">En ejecución</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsTimerRunning(false);
                    setActiveGuidedModal(null);
                  }}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white font-mono cursor-pointer"
                >
                  Cancelar
                </button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={handleRegisterGuidedWorkout}
                  className="px-5 py-2 bg-gradient-to-r from-[#E9C349] to-[#f59e0b] text-black text-xs font-black rounded-xl uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Completar y Ganar +100 PTS</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
