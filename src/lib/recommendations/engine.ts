import { User, Lesson, PlaylistItem, PracticeLog } from '../../types';

export type SkillCategory = Lesson['category'];
export type ActivityType = PracticeLog['activityType'];

export interface StudentProfileVector {
  primaryObjective: 'competir' | 'social' | 'fitness' | 'profesional';
  weakAreas: SkillCategory[]; 
  preferredLabTools: ActivityType[];
  targetBpmMin: number; 
  targetBpmMax: number;
  updatedAt: string;
}

export type RecommendationReason =
  | 'gap_categoria' 
  | 'progresion_bpm' 
  | 'area_debil' 
  | 'racha_en_riesgo' 
  | 'nivel_desbloqueado' 
  | 'tarea_instructor'; 

export interface RecommendationItem {
  id: string;
  type: 'lesson' | 'lab' | 'playlist' | 'instructor_task';
  refId: string;
  title: string;
  description: string;
  reason: RecommendationReason;
  score: number; 
  suggestedBpm?: number;
  ctaTab: string; 
}

export interface AssignedTask {
  id: string;
  studentUid: string;
  instructorUid: string;
  title: string;
  description: string;
  category: string;
  points: number;
  deadline?: string;
  status: 'pending' | 'completed' | 'expired';
}

const WEIGHTS = {
  gapCategoria: 40,
  progresionBpm: 20,
  areaDebil: 20,
  rachaRiesgo: 15,
  nivelDesbloqueado: 5,
};

const RECENCY_WINDOW_DAYS = 14;
const LEVEL2_UNLOCK_RATIO = 0.6; 

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

function recentLogs(logs: PracticeLog[] = []): PracticeLog[] {
  if (!Array.isArray(logs)) return [];
  return logs.filter((l) => l && l.date && daysSince(l.date) <= RECENCY_WINDOW_DAYS);
}

function minutesByCategory(logs: PracticeLog[] = []): Partial<Record<SkillCategory, number>> {
  const totals: Partial<Record<SkillCategory, number>> = {};
  for (const log of recentLogs(logs)) {
    if (!log) continue;
    const cat = (log as PracticeLog & { category?: SkillCategory }).category;
    if (!cat) continue;
    totals[cat] = (totals[cat] || 0) + (log.minutes || 0);
  }
  return totals;
}

function daysSinceLastByActivity(logs: PracticeLog[] = []): Record<ActivityType, number> {
  const last: Record<string, number> = {
    drill: Infinity, battle: Infinity, combo: Infinity, playlist: Infinity, sensorial: Infinity,
  };
  for (const log of (logs || [])) {
    if (!log || !log.date || !log.activityType) continue;
    const d = daysSince(log.date);
    if (d < (last[log.activityType] ?? Infinity)) last[log.activityType] = d;
  }
  return last as Record<ActivityType, number>;
}

function averageRecentBpm(logs: PracticeLog[] = []): number | null {
  const bpms: number[] = [];
  for (const log of recentLogs(logs)) {
    if (!log || !log.description) continue;
    const match = log.description.match(/(\d{2,3})\s*BPM/i);
    if (match) bpms.push(parseInt(match[1], 10));
  }
  if (bpms.length === 0) return null;
  return Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length);
}

function labLabel(activity: ActivityType): string {
  const labels: Record<ActivityType, string> = {
    drill: 'DrillLab', battle: 'BattleLab', combo: 'CombosLab',
    playlist: 'el Entrenador de Ritmo', sensorial: 'SomaticFeedbackLab',
  };
  return labels[activity] || 'Freestyle Lab';
}

export function computeRecommendations(params: {
  user: User;
  logs?: PracticeLog[];
  lessons?: Lesson[];
  playlists?: PlaylistItem[];
  profile?: StudentProfileVector;
  assignedTasks?: AssignedTask[];
  limit?: number;
}): RecommendationItem[] {
  if (!params || !params.user) return [];
  const { user, logs = [], lessons = [], playlists = [], profile, assignedTasks = [], limit = 3 } = params;

  // Instructor role deterministic recommendation cards
  if (user.role === 'instructor') {
    const instructorRecs: RecommendationItem[] = [
      {
        id: 'rec-inst-1',
        type: 'instructor_task',
        refId: 'drill-128bpm',
        title: 'Sugerencia: Crear Drills de 128 BPM (Alta Demanda)',
        description: 'El 78% de los alumnos ha intentado acelerar su tempo a 128 BPM esta semana. Se recomienda publicar un módulo de ejercicios guiados.',
        reason: 'gap_categoria',
        score: 110,
        suggestedBpm: 128,
        ctaTab: 'entrenamiento',
      },
      {
        id: 'rec-inst-2',
        type: 'instructor_task',
        refId: 'poses-70s',
        title: 'Gap Detectado: Módulo de Poses de los 70s',
        description: 'Se detectó baja cobertura de contenido en la categoría de Poses de los 70s frente a la alta demanda registrada en el cuestionario de onboarding.',
        reason: 'gap_categoria',
        score: 100,
        ctaTab: 'ebooks',
      },
      {
        id: 'rec-inst-3',
        type: 'instructor_task',
        refId: 'rev-biomecanica',
        title: 'Crear Tarea: Revisión de Biomecánica v2.2',
        description: '42 evaluaciones somáticas de postura de codos pendientes de revisión docente antes de la clase en vivo de hoy a las 19:30.',
        reason: 'tarea_instructor',
        score: 95,
        ctaTab: 'tasks',
      }
    ];
    return instructorRecs.slice(0, limit);
  }

  const items: RecommendationItem[] = [];
  const completedIds = new Set(user.completedLessons || []);

  for (const task of (assignedTasks || [])) {
    if (!task || task.studentUid !== user.id || task.status !== 'pending') continue;
    const overdueBonus = task.deadline ? Math.max(0, daysSince(task.deadline)) * 2 : 0;
    items.push({
      id: `task-${task.id}`,
      type: 'instructor_task',
      refId: task.id,
      title: task.title || 'Tarea Asignada',
      description: task.description || '',
      reason: 'tarea_instructor',
      score: 100 + overdueBonus,
      ctaTab: 'tasks',
    });
  }

  const catMinutes = minutesByCategory(logs);
  const totalCatMinutes = Object.values(catMinutes).reduce((a, b) => (a || 0) + (b || 0), 0) || 0;

  const safeLessons = Array.isArray(lessons) ? lessons : [];
  const level1Total = safeLessons.filter((l) => l && l.level === 1).length;
  const level1Done = safeLessons.filter((l) => l && l.level === 1 && completedIds.has(l.id)).length;
  const level2Unlocked = level1Total === 0 || level1Done >= Math.ceil(level1Total * LEVEL2_UNLOCK_RATIO);

  const categories = Array.from(new Set(safeLessons.map((l) => l?.category).filter(Boolean)));
  for (const category of categories) {
    const candidates = safeLessons
      .filter((l) => l && l.category === category && !completedIds.has(l.id))
      .filter((l) => l && (l.level === 1 || level2Unlocked))
      .sort((a, b) => (a.level || 1) - (b.level || 1));
    const nextLesson = candidates[0];
    if (!nextLesson) continue;

    let score: number;
    if (totalCatMinutes > 0) {
      const share = (catMinutes[category] || 0) / totalCatMinutes;
      score = WEIGHTS.gapCategoria * (1 - Math.min(share, 1));
    } else {
      const total = safeLessons.filter((l) => l && l.category === category).length;
      const done = safeLessons.filter((l) => l && l.category === category && completedIds.has(l.id)).length;
      score = WEIGHTS.gapCategoria * (1 - (total > 0 ? done / total : 0));
    }

    let reason: RecommendationReason = nextLesson.level === 2 ? 'nivel_desbloqueado' : 'gap_categoria';
    if (profile?.weakAreas && profile.weakAreas.includes(category)) {
      score += WEIGHTS.areaDebil;
      reason = 'area_debil';
    }
    if (nextLesson.level === 2) score += WEIGHTS.nivelDesbloqueado;

    items.push({
      id: `lesson-${nextLesson.id}`,
      type: 'lesson',
      refId: nextLesson.id,
      title: nextLesson.title || 'Lección',
      description: nextLesson.description || '',
      reason,
      score,
      ctaTab: 'cursos',
    });
  }

  const lastByActivity = daysSinceLastByActivity(logs);
  (Object.keys(lastByActivity) as ActivityType[]).forEach((activity) => {
    const days = lastByActivity[activity];
    if (days === Infinity || days < RECENCY_WINDOW_DAYS) return;
    if (profile?.preferredLabTools && profile.preferredLabTools.length > 0 && !profile.preferredLabTools.includes(activity)) return;
    items.push({
      id: `streak-${activity}`,
      type: 'lab',
      refId: activity,
      title: `Retoma tu práctica en ${labLabel(activity)}`,
      description: `Llevas ${days} días sin practicar ahí. Una sesión corta hoy mantiene tu racha y tus puntos de constancia.`,
      reason: 'racha_en_riesgo',
      score: WEIGHTS.rachaRiesgo + Math.min(days - RECENCY_WINDOW_DAYS, 20),
      ctaTab: 'entrenamiento',
    });
  });

  const currentBpm = averageRecentBpm(logs) ?? (profile ? (profile.targetBpmMin + profile.targetBpmMax) / 2 : 105);
  const safePlaylists = Array.isArray(playlists) ? playlists : [];
  const nextTrack = safePlaylists.filter((p) => p && p.bpm > currentBpm).sort((a, b) => a.bpm - b.bpm)[0];
  if (nextTrack) {
    items.push({
      id: `bpm-${nextTrack.id}`,
      type: 'playlist',
      refId: nextTrack.id,
      title: `Sube el tempo con "${nextTrack.title || 'Track'}"`,
      description: `Practicas cómodamente cerca de ${Math.round(currentBpm)} BPM. Este track a ${nextTrack.bpm} BPM es el siguiente escalón natural.`,
      reason: 'progresion_bpm',
      score: WEIGHTS.progresionBpm,
      suggestedBpm: nextTrack.bpm,
      ctaTab: 'entrenamiento',
    });
  }

  return items.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function buildNarrativePrompt(top: RecommendationItem, user: User): string {
  return `Eres la mentora IA de Waack On. En 1-2 frases motivadoras y en español, ` +
    `explícale a ${user.name} por qué debería hacer ahora: "${top.title}" ` +
    `(motivo interno: ${top.reason}). No inventes datos nuevos, no agregues tareas, ` +
    `solo redacta el porqué de esta recomendación de forma cálida y directa.`;
}
