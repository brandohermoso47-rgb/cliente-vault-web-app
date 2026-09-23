// Plan de Estudio Interactivo de Waacking — contenido real de los 6 módulos (historia, técnica,
// significado cultural, figuras notables, waacking vs. voguing, revival y globalización) y el
// progreso de cada usuario guardado en Firestore (`study_progress/{uid}`, un documento por persona).
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export type QuizQuestion = { q: string; options: string[]; correct: number };

export type TimelineItem = { id: string; year: string; title: string; text: string };
export type TechniqueItem = { id: string; name: string; text: string };
export type ReflectionCard = { id: string; question: string };
export type Figure = { id: string; name: string; era: 'pionero' | 'moderno'; role: string; bio: string; matches?: string };
export type CompareRow = { axis: string; waacking: string; voguing: string };
export type GlobalHub = { id: string; place: string; text: string };
export type RevivalEvent = { year: string; text: string };

export type StudyModule = {
  id: string;
  order: number;
  title: string;
  description: string;
  toolType: 'timeline' | 'checklist' | 'reflection' | 'gallery' | 'compare' | 'map';
  timeline?: TimelineItem[];
  technique?: TechniqueItem[];
  reflection?: ReflectionCard[];
  figures?: Figure[];
  compare?: CompareRow[];
  hubs?: GlobalHub[];
  revival?: RevivalEvent[];
  quiz: QuizQuestion[];
};

export const STUDY_MODULES: StudyModule[] = [
  {
    id: 'historia',
    order: 1,
    title: 'Historia y Orígenes',
    description: 'De los clubes disco de Los Ángeles en los 70 a un refugio para la comunidad LGBTQ+.',
    toolType: 'timeline',
    timeline: [
      { id: 'clubes', year: 'Inicios de los 70', title: 'Clubes disco de Los Ángeles', text: 'El waacking nace en las pistas de baile disco de LA, en clubes que eran uno de los pocos espacios donde hombres negros, latinos y asiáticos LGBTQ+ podían bailar y expresarse con libertad.' },
      { id: 'etimologia', year: '1970s', title: 'De "Punking" a "Whacking" y "Waacking"', text: 'El estilo se llamó primero "Punking". Luego, por el golpe seco de los brazos al marcar el ritmo, se le empezó a decir "Whacking" ("golpear"). Con el tiempo la grafía se suavizó a "Waacking" para alejarlo de la connotación violenta de la palabra original.' },
      { id: 'viktor', year: '1970s', title: 'Viktor Manoel, el último "Punk" original', text: 'Viktor Manoel es reconocido como uno de los últimos bailarines vivos de la generación original de "Punkers", puente directo entre el estilo original de los clubes y las generaciones que lo heredaron.' },
      { id: 'vih', year: 'Años 80', title: 'El impacto del VIH/SIDA', text: 'La epidemia golpeó con fuerza a la comunidad que había creado el waacking, y muchos de sus pioneros y espacios desaparecieron. Por eso preservar y contar esta historia es también un acto de memoria.' },
    ],
    quiz: [
      { q: '¿En qué escena nació el waacking?', options: ['Clubes de hip hop de Nueva York', 'Clubes disco de Los Ángeles en los 70', 'Estudios de ballet de Chicago'], correct: 1 },
      { q: '¿De dónde viene la palabra "Waacking"?', options: ['De "Punking" y "Whacking"', 'De la palabra francesa "vaquer"', 'Es un acrónimo publicitario'], correct: 0 },
      { q: '¿Qué suceso de los años 80 marcó profundamente a la comunidad creadora del waacking?', options: ['La llegada del breakdance', 'La epidemia de VIH/SIDA', 'El cierre de Soul Train'], correct: 1 },
    ],
  },
  {
    id: 'tecnica',
    order: 2,
    title: 'Técnica y Movimiento',
    description: 'Brazos, líneas, posing y musicalidad: la base física del waacking.',
    toolType: 'checklist',
    technique: [
      { id: 'wrist', name: 'Wrist rolls', text: 'Rotaciones circulares de la muñeca, sueltas y continuas — la base de la fluidez del estilo.' },
      { id: 'armroll', name: 'Arm rolls', text: 'El brazo entero dibuja círculos amplios, generando el impulso para los golpes ("waacks").' },
      { id: 'waackback', name: 'Waack back / forward', text: 'El golpe característico: el brazo se lanza hacia atrás o hacia adelante marcando el acento musical con precisión.' },
      { id: 'lineas', name: 'Líneas y extensiones', text: 'Brazos y piernas se estiran al máximo para crear líneas limpias y dramáticas, inspiradas en el posing de Hollywood.' },
      { id: 'overhead', name: 'Overheads', text: 'Movimientos de brazos por encima de la cabeza que enmarcan el rostro, muy usados como remate de una frase de baile.' },
      { id: 'posing', name: 'Posing (inspirado en Hollywood)', text: 'Pausas fotográficas entre movimientos, tomadas del glamour del cine clásico y las divas del cine mudo.' },
      { id: 'musicalidad', name: 'Musicalidad disco', text: 'Cada golpe de brazo marca el pulso de la música disco — el waacking se baila con y no sobre la música.' },
      { id: 'footwork', name: 'Footwork rápido', text: 'Pasos cortos y veloces que sostienen el cuerpo mientras los brazos hacen el trabajo visual principal.' },
      { id: 'expresion', name: 'Expresión facial dramática', text: 'La cara actúa: cejas, mirada y boca refuerzan la teatralidad de cada pose.' },
    ],
    quiz: [
      { q: '¿Qué parte del cuerpo es el foco principal del waacking?', options: ['Las piernas', 'Los brazos', 'La espalda'], correct: 1 },
      { q: '¿De dónde se inspira el "posing" del waacking?', options: ['El glamour del cine clásico de Hollywood', 'El breakdance callejero', 'El ballet ruso'], correct: 0 },
      { q: '¿Qué relación tienen los golpes de brazo con la música?', options: ['No siguen ningún ritmo', 'Marcan el pulso de la música disco', 'Solo se usan en silencio'], correct: 1 },
    ],
  },
  {
    id: 'cultural',
    order: 3,
    title: 'Significado Cultural',
    description: 'Resistencia, libertad de expresión y celebración de la individualidad.',
    toolType: 'reflection',
    reflection: [
      { id: 'r1', question: '¿Qué significa para ti bailar libremente, sin miedo a ser juzgado?' },
      { id: 'r2', question: 'El waacking nació como resistencia frente a la exclusión. ¿En qué parte de tu vida el baile te ha ayudado a resistir algo?' },
      { id: 'r3', question: 'El estilo renegocia las normas de género en la pista. ¿Qué opinas sobre esa libertad de expresión?' },
      { id: 'r4', question: '¿Qué hace única a tu forma de bailar waacking frente a la de los demás?' },
    ],
    quiz: [
      { q: '¿Qué representó históricamente el waacking para su comunidad de origen?', options: ['Una moda pasajera', 'Resistencia y libertad de expresión', 'Un deporte de competición únicamente'], correct: 1 },
      { q: 'El waacking ayudó a renegociar normas sociales relacionadas con...', options: ['La alimentación', 'El género', 'La arquitectura'], correct: 1 },
      { q: '¿Qué valor celebra especialmente el waacking en cada bailarín?', options: ['La uniformidad', 'La individualidad', 'La velocidad'], correct: 1 },
    ],
  },
  {
    id: 'figuras',
    order: 4,
    title: 'Figuras Notables',
    description: 'Los pioneros que crearon el estilo y los íconos modernos que lo llevan al mundo.',
    toolType: 'gallery',
    figures: [
      { id: 'tyrone', name: 'Tyrone "The Bone" Proctor', era: 'pionero', role: 'Pionero y preservador de la historia del estilo', bio: 'Uno de los bailarines fundacionales del waacking y del punking, clave en documentar y transmitir la técnica a nuevas generaciones.', matches: 'lipj' },
      { id: 'arthur', name: 'Arthur / Tinker / Andrew', era: 'pionero', role: 'Trío pionero de los clubes de LA', bio: 'Parte del grupo original que desarrolló el vocabulario de brazos y posing en los clubes disco de Los Ángeles.', matches: 'ibuki' },
      { id: 'jody', name: 'Jody Watley', era: 'pionero', role: 'Bailarina y luego artista de Soul Train', bio: 'Bailarina de Soul Train que llevó movimientos de waacking a la televisión nacional, dándole visibilidad masiva al estilo.', matches: 'waackxxxy' },
      { id: 'lamont', name: 'Lamont Peterson', era: 'pionero', role: 'Pionero de la escena de clubes', bio: 'Parte de la generación original que consolidó el waacking como lenguaje de baile propio en la escena de clubes de LA.', matches: 'princess' },
      { id: 'lipj', name: 'Lip J', era: 'moderno', role: 'Ícono internacional moderno', bio: 'Referente contemporáneo que combina técnica clásica con una identidad visual y musical propia, muy influyente en la escena global.' },
      { id: 'ibuki', name: 'Ibuki', era: 'moderno', role: 'Ícono moderno de la escena japonesa', bio: 'Bailarina destacada del hub japonés de waacking, con fuerte presencia en competencias internacionales.' },
      { id: 'waackxxxy', name: 'Waackxxxy', era: 'moderno', role: 'Ícono moderno', bio: 'Bailarina moderna reconocida por su musicalidad y su aporte a mantener vivo el espíritu original del estilo.' },
      { id: 'princess', name: 'Princess Lockerooo', era: 'moderno', role: 'Ícono moderno y educadora', bio: 'Reconocida internacionalmente por popularizar el waacking (y el locking) a través de medios y programas como Street Woman Fighter.' },
    ],
    quiz: [
      { q: '¿Quién es reconocido como preservador clave de la historia del waacking?', options: ['Tyrone "The Bone" Proctor', 'Brian "Footwork" Green', 'Viktor Manoel'], correct: 0 },
      { q: '¿Qué programa de televisión ayudó a dar visibilidad nacional al waacking a través de Jody Watley?', options: ['Soul Train', 'MTV Awards', 'American Idol'], correct: 0 },
      { q: '¿Cuál de estas es una ícona moderna del waacking?', options: ['Princess Lockerooo', 'Lamont Peterson', 'Arthur'], correct: 0 },
    ],
  },
  {
    id: 'vs-voguing',
    order: 5,
    title: 'Waacking vs. Voguing',
    description: 'Dos estilos hermanos, con raíces, música y movimiento distintos.',
    toolType: 'compare',
    compare: [
      { axis: 'Origen geográfico', waacking: 'Costa oeste — Los Ángeles', voguing: 'Costa este — Nueva York' },
      { axis: 'Música', waacking: 'Disco', voguing: 'House' },
      { axis: 'Movimiento', waacking: 'Fluidez continua de brazos', voguing: 'Transiciones marcadas entre poses' },
      { axis: 'Década de origen', waacking: 'Años 70', voguing: 'Años 80' },
    ],
    quiz: [
      { q: '¿En qué costa de EE. UU. nació el waacking?', options: ['Costa oeste (Los Ángeles)', 'Costa este (Nueva York)', 'Costa sur (Miami)'], correct: 0 },
      { q: '¿Qué género musical está más asociado al voguing?', options: ['Disco', 'House', 'Reguetón'], correct: 1 },
      { q: '¿Cuál describe mejor el movimiento del waacking frente al voguing?', options: ['Fluidez continua de brazos vs. transiciones marcadas entre poses', 'Son exactamente el mismo movimiento', 'El waacking no usa los brazos'], correct: 0 },
    ],
  },
  {
    id: 'revival',
    order: 6,
    title: 'Revival y Globalización',
    description: 'Cómo el waacking volvió a escena y se volvió un fenómeno global.',
    toolType: 'map',
    hubs: [
      { id: 'corea', place: 'Corea del Sur', text: 'Uno de los hubs más fuertes hoy, con academias dedicadas y bailarines que compiten a nivel mundial; ganó exposición masiva con programas como Street Woman Fighter.' },
      { id: 'japon', place: 'Japón', text: 'Escena consolidada desde hace más de una década, con eventos y campeonatos propios y bailarinas como Ibuki como referentes.' },
      { id: 'rusia', place: 'Rusia', text: 'Comunidad activa con talleres regulares y presencia constante en batallas internacionales.' },
      { id: 'reino-unido', place: 'Reino Unido', text: 'Uno de los primeros hubs europeos en adoptar el waacking, con una escena de club histórica que ayudó a difundirlo por Europa.' },
    ],
    revival: [
      { year: '2003', text: 'Brian "Footwork" Green impulsa el revival del waacking, reconectando la nueva generación con los pioneros originales.' },
      { year: '2000s', text: 'El estilo gana exposición nacional gracias a su paso por Soul Train años atrás y a nuevas generaciones de bailarines en EE. UU.' },
      { year: '2020s', text: 'Programas como Street Woman Fighter (WSWF) llevan el waacking a audiencias masivas en todo el mundo.' },
      { year: 'Hoy', text: 'El waacking tiene comunidades activas en Corea, Japón, Rusia, Reino Unido y muchos otros países, con batallas y academias propias.' },
    ],
    quiz: [
      { q: '¿Quién impulsó el revival del waacking en 2003?', options: ['Brian "Footwork" Green', 'Viktor Manoel', 'Jody Watley'], correct: 0 },
      { q: '¿Qué programa reciente popularizó el waacking a nivel global?', options: ['Street Woman Fighter (WSWF)', 'Dancing with the Stars', 'The Voice'], correct: 0 },
      { q: '¿Cuál de estos es un hub global reconocido de waacking hoy?', options: ['Corea del Sur', 'Groenlandia', 'La Antártida'], correct: 0 },
    ],
  },
];

export type StudyProgress = {
  completedModules: string[];
  quizScores: Record<string, number>;
  checklist: Record<string, Record<string, boolean>>;
  reflections: Record<string, string>;
};

const EMPTY_PROGRESS: StudyProgress = { completedModules: [], quizScores: {}, checklist: {}, reflections: {} };

export function watchStudyProgress(uid: string, cb: (p: StudyProgress) => void) {
  return onSnapshot(doc(db, 'study_progress', uid), (snap) => {
    const d: any = snap.data() ?? {};
    cb({
      completedModules: d.completedModules ?? [],
      quizScores: d.quizScores ?? {},
      checklist: d.checklist ?? {},
      reflections: d.reflections ?? {},
    });
  }, () => cb(EMPTY_PROGRESS));
}

async function saveStudyProgress(uid: string, patch: Partial<Record<string, any>>) {
  await setDoc(doc(db, 'study_progress', uid), { ...patch, updatedAt: serverTimestamp() }, { merge: true });
}

export async function toggleTechniqueItem(uid: string, current: StudyProgress, moduleId: string, itemId: string) {
  const forModule = { ...(current.checklist[moduleId] || {}) };
  forModule[itemId] = !forModule[itemId];
  await saveStudyProgress(uid, { checklist: { ...current.checklist, [moduleId]: forModule } });
}

export async function saveReflectionAnswer(uid: string, current: StudyProgress, cardId: string, text: string) {
  await saveStudyProgress(uid, { reflections: { ...current.reflections, [cardId]: text } });
}

export async function saveQuizScoreAndComplete(uid: string, current: StudyProgress, moduleId: string, score: number) {
  const completed = current.completedModules.includes(moduleId) ? current.completedModules : [...current.completedModules, moduleId];
  await saveStudyProgress(uid, { quizScores: { ...current.quizScores, [moduleId]: score }, completedModules: completed });
}
