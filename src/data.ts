import {
  Announcement,
  Presentation,
  ChatMessage,
  Lesson,
  PlaylistItem,
  FeedbackItem,
  CalendarEvent,
  User,
  PracticeLog,
  InstructorCatedra,
  PodcastShow,
  Studio,
  Course,
  CommunityPost,
  RankingUser,
  LiveClass,
  Podcast,
  Ebook,
  Reel,
  MuscleRecommendation,
  TaskItem,
  WaackPillar,
  MembershipPlan,
  DrillCombo,
  DramaPrompt,
  WeeklyCommunityChallenge,
  PastChallengeWinner
} from './types';

// ==========================================
// USUARIO INICIAL
// ==========================================
export const INITIAL_USER: User = {
  id: 'u-1',
  name: 'Bailarín Waack On',
  nickname: 'Waacker',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=600',
  role: undefined, // Sin rol predeterminado hasta suscribirse a un instructor
  subscribedInstructorIds: [],
  completedLessons: [],
  points: 0,
  bio: 'Apasionado del arte del Waacking, la musicalidad disco y el entrenamiento técnico.',
  level: 'beginner',
  instagram: '@waackon_dancer',
  billingStatus: 'cancelled',
  subscriptionTier: 'free',
  targetMinutes: 30
};

// ==========================================
// 1. CURSOS Y LECCIONES
// ==========================================
export const INITIAL_COURSES: Course[] = [
  {
    id: 'waack-foundations',
    title: 'Fundamentos del Waacking: De la Raíz al Escenario',
    description: 'Aprende las bases fundamentales, técnica de brazos, poses teatrales y la musicalidad del Disco de los 70.',
    instructor: 'Lorena "WaackQueen"',
    instructorRole: 'Pionera & Coreógrafa Internacional',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    thumbnail: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=800',
    category: 'Fundamentos',
    level: 'Principiante',
    totalDuration: '4h 15m',
    enrolledCount: 1420,
    rating: 4.9,
    reviewsCount: 312,
    badge: 'Bestseller',
    progress: 65,
    lessonsCount: 18,
    isPopular: true,
    isNew: false,
    lessons: [
      {
        id: 'w1',
        title: '1. Origen e Historia del Punking/Waacking',
        duration: '12:30',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        type: 'video',
        isLocked: false,
        isCompleted: true,
        summary: 'Descubre los orígenes del Punking en los clubes de Los Ángeles de los años 70...',
        resources: [
          { title: 'Línea de tiempo del Waacking (PDF)', type: 'pdf', url: '#' },
          { title: 'Playlist recomendada Disco Classics', type: 'audio', url: '#' }
        ]
      },
      {
        id: 'w2',
        title: '2. Poses, Actitud y Presencia Escénica',
        duration: '18:45',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        type: 'video',
        isLocked: false,
        isCompleted: true,
        summary: 'Trabajaremos la proyección de miradas, líneas corporales y emoción...',
        resources: [
          { title: 'Guía de Posing Teatral', type: 'link', url: '#' }
        ]
      },
      {
        id: 'w3',
        title: '3. Drills de Brazos: Rolls y Extensiones Básicas',
        duration: '22:10',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        type: 'video',
        isLocked: false,
        isCompleted: false,
        summary: 'Acondicionamiento de hombros, trayectorias limpias de rolls y cómo no perder la cuenta en el 8-count.'
      },
      {
        id: 'w4',
        title: '4. Transiciones y Poses en el Espacio',
        duration: '15:20',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        type: 'video',
        isLocked: true,
        isCompleted: false,
        summary: 'Cómo conectar una pose estática con un roll dinámico usando niveles altos y bajos.'
      }
    ]
  },
  {
    id: 'punking-drama-storytelling',
    title: 'Punking, Drama & Storytelling',
    description: 'Conecta con tus emociones más profundas para transformar cada movimiento en pura narrativa teatral y empoderamiento.',
    instructor: 'Viktor Ebony',
    instructorRole: 'Director Teatral & Performer',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=800',
    category: 'Expresión',
    level: 'Intermedio',
    totalDuration: '3h 30m',
    enrolledCount: 890,
    rating: 4.8,
    reviewsCount: 198,
    badge: 'Destacado',
    progress: 20,
    lessonsCount: 12,
    isPopular: false,
    isNew: true,
    lessons: [
      {
        id: 'p1',
        title: '1. De la Emoción al Gesto: Conexión Orgánica',
        duration: '14:00',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        type: 'video',
        isLocked: false,
        isCompleted: true,
        summary: 'Cómo traducir tristeza, euforia y furia en líneas y acentos corporales.'
      },
      {
        id: 'p2',
        title: '2. Construcción de tu Personaje / Alter Ego',
        duration: '20:15',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
        type: 'video',
        isLocked: true,
        isCompleted: false,
        summary: 'Crea una identidad escénica inolvidable con ejercicios de improvisación guiada.'
      }
    ]
  },
  {
    id: 'master-waack-speed',
    title: 'Velocidad, Precisión y Líneas Limpias',
    description: 'Perfecciona la velocidad de ejecución de tus brazos sin perder limpieza articular ni colocación postural.',
    instructor: 'Mayra "Lightning"',
    instructorRole: 'Campeona Mundial Waack Battle',
    instructorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    thumbnail: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&q=80&w=800',
    category: 'Técnica',
    level: 'Avanzado',
    totalDuration: '5h 10m',
    enrolledCount: 2100,
    rating: 5.0,
    reviewsCount: 540,
    badge: 'Popular',
    progress: 0,
    lessonsCount: 20,
    isPopular: true,
    isNew: false,
    lessons: [
      {
        id: 's1',
        title: '1. Drills a 130+ BPM: Resistencia y Control',
        duration: '25:00',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        type: 'video',
        isLocked: false,
        isCompleted: false,
        summary: 'Metrónomo acelerado y series de repetición para construir memoria muscular rápida.'
      }
    ]
  },
  {
    id: 'somatic-alignment-waack',
    title: 'Biomecánica Somática y Prevención para Bailarines',
    description: 'Cuida tus articulaciones de hombros, codos y cervicales mediante técnicas de fisioterapia aplicadas al baile.',
    instructor: 'Dr. Julián Rivas',
    instructorRole: 'Fisioterapeuta y Especialista en Danza',
    instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=800',
    category: 'Físico',
    level: 'Todos los niveles',
    totalDuration: '2h 45m',
    enrolledCount: 650,
    rating: 4.95,
    reviewsCount: 140,
    badge: 'Salud',
    progress: 10,
    lessonsCount: 8,
    isPopular: false,
    isNew: false,
    lessons: []
  }
];

// ==========================================
// 2. COMUNIDAD Y FORO
// ==========================================
export const INITIAL_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    author: 'Lorena "WaackQueen"',
    authorRole: 'Instructora Principal',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    content: '¡Increíble la energía en el Live de ayer! Recuerden que para la sesión de corrección del jueves deben haber practicado los rolls a 120 BPM con la mirada fija al frente. ¡Suban sus clips al Lab de Feedback!',
    timestamp: 'Hace 2 horas',
    likes: 64,
    commentsCount: 12,
    hasLiked: true,
    tags: ['#WaackOn', '#DrillsSemanal', '#LiveSession']
  },
  {
    id: 'post-2',
    author: 'Carlos "VogueBeat"',
    authorRole: 'Estudiante Avanzado',
    authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    content: 'Acabo de completar el módulo de "Punking, Drama & Storytelling". La técnica de visualización teatral me cambió por completo el freestyle. ¿Alguien más probó el ejercicio de alter ego?',
    timestamp: 'Hace 5 horas',
    likes: 38,
    commentsCount: 7,
    hasLiked: false,
    tags: ['#Punking', '#AlterEgo', '#FreestyleLab']
  },
  {
    id: 'post-3',
    author: 'Elena Dance',
    authorRole: 'Estudiante',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    content: '¿Alguna recomendación para no sobrecargar el trapecio durante los rolls rápidos? Siento que a veces subo los hombros sin darme cuenta.',
    timestamp: 'Hace 1 día',
    likes: 19,
    commentsCount: 9,
    hasLiked: false,
    tags: ['#DudaTecnica', '#Postura', '#HombrosRelajados']
  }
];

// ==========================================
// 3. RANKING Y GAMIFICACIÓN
// ==========================================
export const INITIAL_RANKING: RankingUser[] = [
  {
    rank: 1,
    name: 'Marilyn Monroe-Waack',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    level: 'Master Diva',
    score: 4850,
    hoursTrained: 64.5,
    streakDays: 28,
    badges: ['👑 Top 1', '🔥 28 Días Racha', '⚡ Speed Master']
  },
  {
    rank: 2,
    name: 'Carlos "VogueBeat"',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    level: 'Waacker Pro',
    score: 4210,
    hoursTrained: 52.0,
    streakDays: 19,
    badges: ['🔥 19 Días Racha', '🎭 Drama King']
  },
  {
    rank: 3,
    name: 'Sofía Glam',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    level: 'Waacker Pro',
    score: 3980,
    hoursTrained: 48.2,
    streakDays: 14,
    badges: ['✨ Precision Pro']
  },
  {
    rank: 4,
    name: 'Lucía Poses',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200',
    level: 'Rising Star',
    score: 3450,
    hoursTrained: 41.0,
    streakDays: 9,
    badges: ['📸 Posing Queen']
  },
  {
    rank: 5,
    name: 'Tú (Brando)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    level: 'Rising Star',
    score: 3120,
    hoursTrained: 38.5,
    streakDays: 12,
    badges: ['🚀 En Ascenso', '💪 Disciplina']
  }
];

// ==========================================
// 4. CLASES EN VIVO
// ==========================================
export const INITIAL_LIVE_CLASSES: LiveClass[] = [
  {
    id: 'live-1',
    title: 'Masterclass: Conexión Musical con Soul & Disco',
    instructor: 'Lorena "WaackQueen"',
    instructorRole: 'Coreógrafa Internacional',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    date: 'Jueves, 20 de Mayo',
    time: '19:00 (GMT-4)',
    thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800',
    status: 'upcoming',
    attendeesCount: 230,
    meetUrl: 'https://meet.google.com/abc-defg-hij',
    description: 'Aprenderemos a acentuar los violines, los cortes de batería y los silencios vocales en la música Disco de 1974 a 1979.'
  },
  {
    id: 'live-2',
    title: 'Batalla de Entrenamiento en Vivo (1 vs 1 Feedback)',
    instructor: 'Viktor Ebony',
    instructorRole: 'Director Teatral',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    date: 'Sábado, 22 de Mayo',
    time: '17:30 (GMT-4)',
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=800',
    status: 'upcoming',
    attendeesCount: 180,
    meetUrl: 'https://meet.google.com/klm-nopq-rst',
    description: 'Rondas de improvisación con retroalimentación inmediata sobre expresión escénica y variedad de vocabulario de brazos.'
  }
];

// ==========================================
// 5. PODCASTS Y AUDIOS
// ==========================================
export const INITIAL_PODCASTS: Podcast[] = [
  {
    id: 'pod-1',
    title: 'Ep. 1: La Era Dorada del Disco y los Clubes Underground',
    description: 'Un recorrido por Paradise Garage, Studio 54 y los pioneros que bailaban Punking en Hollywood.',
    duration: '42:15',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600',
    host: 'Lorena WaackQueen & Invitado Especial Tyrone Proctor Legacy',
    date: '10 Mayo 2024'
  },
  {
    id: 'pod-2',
    title: 'Ep. 2: De la Pista a la Mente: Psicología en las Batallas',
    description: 'Cómo controlar los nervios, el síndrome del impostor y proyectar seguridad frente al jurado.',
    duration: '35:40',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=600',
    host: 'Viktor Ebony',
    date: '03 Mayo 2024'
  }
];

// ==========================================
// 6. EBOOKS Y GUÍAS DIGITALES
// ==========================================
export const INITIAL_EBOOKS: Ebook[] = [
  {
    id: 'eb-1',
    title: 'Manual Completo del Punking & Waacking',
    description: 'Guía ilustrada con más de 50 ilustraciones vectoriales de trayectorias, ángulos articulares y filosofía de movimiento.',
    pages: 124,
    downloadUrl: '#',
    thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
    author: 'Lorena WaackQueen',
    badge: 'Imprescindible'
  },
  {
    id: 'eb-2',
    title: 'Guía de Nutrición y Prevención de Lesiones para Bailarines Urbanos',
    description: 'Protocolos de calentamiento dinámico, activación del manguito rotador y recuperación muscular.',
    pages: 86,
    downloadUrl: '#',
    thumbnail: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&q=80&w=600',
    author: 'Dr. Julián Rivas',
    badge: 'Salud'
  }
];

// ==========================================
// 7. REELS Y CLIPS CORTOS
// ==========================================
export const INITIAL_REELS: Reel[] = [
  {
    id: 'reel-1',
    title: 'Drill explosivo de brazos con cambio de nivel 🔥',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    author: 'Lorena WaackQueen',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
    likes: 1240,
    comments: 85,
    musicTitle: 'Donna Summer - I Feel Love (Extended Mix)'
  },
  {
    id: 'reel-2',
    title: 'Transición de Pose dramática a Roll continuo 🎭',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    author: 'Viktor Ebony',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    likes: 950,
    comments: 42,
    musicTitle: 'Sylvester - You Make Me Feel (Mighty Real)'
  }
];

// ==========================================
// 8. RECOMENDACIONES SOMÁTICAS Y MUSCULARES
// ==========================================
export const INITIAL_MUSCLE_RECOMMENDATIONS: MuscleRecommendation[] = [
  {
    id: 'mr-1',
    muscleGroup: 'Deltoides Anterior y Medio',
    focusArea: 'Hombros y Escápulas',
    status: 'fatigado',
    recoveryScore: 45,
    suggestedExercise: 'Liberación miofascial con pelota en manguito rotador + estiramiento de pectorales.',
    recommendedDuration: '15 min'
  },
  {
    id: 'mr-2',
    muscleGroup: 'Trapecio Superior y Cuello',
    focusArea: 'Cervicales',
    status: 'optimo',
    recoveryScore: 88,
    suggestedExercise: 'Ejercicios de retracción escapular y movilidad cervical suave.',
    recommendedDuration: '10 min'
  },
  {
    id: 'mr-3',
    muscleGroup: 'Flexores y Extensores de Muñeca',
    focusArea: 'Antebrazos y Manos',
    status: 'moderado',
    recoveryScore: 68,
    suggestedExercise: 'Estiramientos dinámicos de muñecas antes de iniciar los drills a velocidad máxima.',
    recommendedDuration: '8 min'
  }
];

// ==========================================
// 9. FEEDBACK Y CORRECCIONES DE ESTUDIANTES
// ==========================================
export const INITIAL_FEEDBACK_ITEMS: FeedbackItem[] = [
  {
    id: 'fb-1',
    studentName: 'Marilyn',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
    videoTitle: 'Practicando el Roll cruzado a 128 BPM',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    description: 'Siento que el codo izquierdo se desalinea al acelerar en los tiempos 5-6 del compás.',
    date: '2026-08-07',
    submittedDate: '14 Mayo 2024',
    status: 'completed',
    completed: true,
    instructorName: 'Lorena "WaackQueen"',
    score: 92,
    corrections: [
      { id: 'c1', time: '00:12', timestamp: '00:12', text: 'Excelente colocación de hombros, mantén las costillas cerradas.', comment: 'Excelente colocación de hombros, mantén las costillas cerradas.' },
      { id: 'c2', time: '00:24', timestamp: '00:24', text: 'El codo izquierdo cae 5cm por debajo de la línea horizontal. Eleva el húmero.', comment: 'El codo izquierdo cae 5cm por debajo de la línea horizontal. Eleva el húmero.' }
    ]
  },
  {
    id: 'fb-2',
    studentName: 'Carlos "VogueBeat"',
    studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120',
    videoTitle: 'Freestyle Punking & Storytelling - Dramatic Track',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    description: 'Trabajando la intención dramática y el silencio antes del drop.',
    date: '2026-08-06',
    submittedDate: '15 Mayo 2024',
    status: 'in_review',
    completed: false,
    instructorName: 'Viktor Ebony',
    score: 88,
    corrections: [
      { id: 'c3', time: '00:18', timestamp: '00:18', text: 'Proyección de mirada sólida. Dale 1 segundo más a la pose estática.', comment: 'Proyección de mirada sólida. Dale 1 segundo más a la pose estática.' }
    ]
  },
  {
    id: 'fb-3',
    studentName: 'Sofía Glam',
    studentAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120',
    videoTitle: 'Drill de Velocidad: Overhead Rolls 135 BPM',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    description: 'Buscando mantener la precisión sin tensionar el cuello.',
    date: '2026-08-05',
    submittedDate: '15 Mayo 2024',
    status: 'pending',
    completed: false,
    corrections: []
  }
];

// ==========================================
// 10. CALENDARIO Y SESIONES AGENDADAS
// ==========================================
export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'cal-1',
    title: 'Drill Matutino de Brazos (120-130 BPM)',
    date: '2026-05-20',
    time: '08:00',
    startTime: '08:00',
    endTime: '09:00',
    duration: '60 min',
    category: 'drill',
    instructor: 'Lorena "WaackQueen"',
    location: 'Estudio Virtual Waack On',
    description: 'Trabajaremos drills de brazos intensivos para mejorar la rotación del codo y evitar la rigidez en las muñecas.',
    rsvpCount: 24,
    rsvpByMe: true,
    isCompleted: false,
    meetUrl: 'https://meet.google.com/hgo-qpzk-byy'
  },
  {
    id: 'cal-2',
    title: 'Live Q&A y Corrección Somática',
    date: '2026-05-21',
    time: '19:00',
    startTime: '19:00',
    endTime: '20:30',
    duration: '90 min',
    category: 'live',
    instructor: 'Dr. Julián Rivas',
    location: 'Google Meet',
    description: 'Conéctate y enciende tu cámara. Analizaremos en directo los videos subidos a la sección de Feedback y daremos pautas de corrección personalizadas.',
    rsvpCount: 38,
    rsvpByMe: false,
    isCompleted: false,
    meetUrl: 'https://meet.google.com/qny-pwnm-vxf'
  },
  {
    id: 'cal-3',
    title: 'Simulación de Batalla 1 vs 1',
    date: '2026-05-23',
    time: '18:00',
    startTime: '18:00',
    endTime: '19:30',
    duration: '90 min',
    category: 'battle',
    instructor: 'Viktor Ebony',
    location: 'Live Battle Room',
    description: 'Batalla interactiva en línea exclusiva para miembros registrados de Waack On Academy a nivel mundial.',
    rsvpCount: 45,
    rsvpByMe: false,
    isCompleted: false,
    meetUrl: 'https://meet.google.com/fjr-yvyj-shk'
  }
];

// ==========================================
// 11. REGISTRO DE ENTRENAMIENTO (PRACTICE LOGS)
// ==========================================
export const INITIAL_PRACTICE_LOGS: PracticeLog[] = [
  {
    id: 'log-1',
    date: '14 Mayo 2024',
    minutes: 60,
    durationMinutes: 60,
    activityType: 'drill',
    focusArea: 'Overhead Rolls & Posing',
    description: 'Overhead Rolls & Posing - Buena fluidez en los cambios de dirección',
    bpmAverage: 124,
    caloriesBurned: 320,
    rpeScore: 8,
    notes: 'Buena fluidez en los cambios de dirección, hombros relajados.'
  },
  {
    id: 'log-2',
    date: '12 Mayo 2024',
    minutes: 45,
    durationMinutes: 45,
    activityType: 'combo',
    focusArea: 'Footwork & Floor Transitions',
    description: 'Footwork & Floor Transitions',
    bpmAverage: 118,
    caloriesBurned: 240,
    rpeScore: 7,
    notes: 'Practicando el drop al suelo sin apoyar peso bruscamente sobre las rodillas.'
  },
  {
    id: 'log-3',
    date: '10 Mayo 2024',
    minutes: 90,
    durationMinutes: 90,
    activityType: 'battle',
    focusArea: 'Full Freestyle Lab & Drama',
    description: 'Full Freestyle Lab & Drama',
    bpmAverage: 128,
    caloriesBurned: 480,
    rpeScore: 9,
    notes: 'Grabación de video para feedback con Viktor Ebony.'
  }
];

// ==========================================
// 12. TAREAS Y OBJETIVOS DIARIOS
// ==========================================
export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Completar 15 min de acondicionamiento de manguito rotador',
    category: 'Físico',
    isCompleted: true,
    dueDate: 'Hoy'
  },
  {
    id: 'task-2',
    title: 'Practicar Drills a 125 BPM durante 20 minutos',
    category: 'Técnica',
    isCompleted: false,
    dueDate: 'Hoy'
  },
  {
    id: 'task-3',
    title: 'Enviar video al Lab de Feedback de la semana',
    category: 'Evaluación',
    isCompleted: false,
    dueDate: 'Jueves'
  },
  {
    id: 'task-4',
    title: 'Escuchar el Episodio 2 del Podcast oficial',
    category: 'Cultura',
    isCompleted: true,
    dueDate: 'Viernes'
  }
];

// ==========================================
// 13. PILARES FUNDAMENTALES DEL WAACKING
// ==========================================
export const WAACKING_PILLARS: WaackPillar[] = [
  {
    id: 'pillar-waacking',
    name: 'Waacking / Arm Movements',
    shortDescription: 'Técnica, precisión articular, rolls, loops y extensiones sobre el ritmo.',
    iconName: 'Zap',
    level: 'Fundamental'
  },
  {
    id: 'pillar-punking',
    name: 'Punking / Drama & Acting',
    shortDescription: 'Intención emocional, drama escénico, personificación y energía auténtica.',
    iconName: 'Flame',
    level: 'Expresión'
  },
  {
    id: 'pillar-posing',
    name: 'Posing / Estética Visual',
    shortDescription: 'Líneas limpias, momentos fotográficos, ángulos de alta costura e impacto visual.',
    iconName: 'Camera',
    level: 'Estilo'
  },
  {
    id: 'pillar-musicality',
    name: 'Musicality / Conexión Sonora',
    shortDescription: 'Acentuación de violines, vientos, polirritmia e interpretación del Disco Funk.',
    iconName: 'Music',
    level: 'Rítmico'
  }
];

// ==========================================
// 14. PLANES DE MEMBRESÍA
// ==========================================
export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'plan-free',
    name: 'Starter Waacker',
    price: 0,
    interval: 'mes',
    description: 'Acceso básico a la comunidad y lecciones introductorias gratuitas.',
    features: [
      'Acceso a lecciones introductorias',
      'Participación en el foro comunitario',
      'Visualizador de biblioteca básica'
    ],
    isPopular: false
  },
  {
    id: 'plan-pro',
    name: 'Diva Pro Access',
    price: 29.99,
    interval: 'mes',
    description: 'El plan definitivo para bailarines en desarrollo que buscan feedback y masterclasses en vivo.',
    features: [
      'Acceso ilimitado a todos los cursos y ebooks',
      'Acceso a Masterclasses y Lives semanales',
      '2 Correcciones mensuales con instructores Pro',
      'Herramientas avanzadas del Lab Somático e IA Pose Tracker'
    ],
    isPopular: true
  },
  {
    id: 'plan-elite',
    name: 'Master Mentorship',
    price: 79.99,
    interval: 'mes',
    description: 'Mentoring 1 a 1 personalizado y preparación para competencias internacionales.',
    features: [
      'Todo lo incluido en Diva Pro Access',
      'Sesiones 1 a 1 mensuales con Lorena o Viktor',
      'Feedback prioritario ilimitado',
      'Pase VIP a eventos y showcases presenciales'
    ],
    isPopular: false
  }
];

// ==========================================
// 15. COMBOS Y DRILLS DE ENTRENAMIENTO
// ==========================================
export const DRILL_COMBOS: DrillCombo[] = [
  {
    id: 'combo-1',
    title: 'Double Overhead Loop + High Drama Pose',
    difficulty: 'Intermedio',
    defaultBpm: 120,
    targetBeats: 8,
    description: '2 rolls sobre la cabeza alternados hacia afuera, transición rápida por detrás del cuello y pose en tiempo 7.'
  },
  {
    id: 'combo-2',
    title: 'Cross Rolls Syncopation + Floor Level Change',
    difficulty: 'Avanzado',
    defaultBpm: 128,
    targetBeats: 16,
    description: 'Rolls cruzados a contratiempo con descenso a medio nivel y acento en el golpe de caja.'
  }
];

// ==========================================
// 16. PROMPTS DRAMÁTICOS (PUNKING LAB)
// ==========================================
export const DRAMA_PROMPTS: DramaPrompt[] = [
  {
    id: 'drama-1',
    archetype: 'The Hollywood Starlet Betrayed',
    scenario: 'Llegas al estreno de tu película y descubres que han cambiado el cartel por tu rival.',
    suggestedEmotion: 'Furia elegante y desdén glamuroso'
  },
  {
    id: 'drama-2',
    archetype: 'The Nightclub Empress',
    scenario: 'El club abre a la medianoche y la pista es tu templo absoluto.',
    suggestedEmotion: 'Poder supremo, sensualidad y dominio espacial'
  }
];

// ==========================================
// 17. PLAYLISTS RECOMENDADAS
// ==========================================
export const INITIAL_PLAYLISTS: PlaylistItem[] = [
  {
    id: 'pl-disco-70s',
    title: 'Disco Classics 1974-1979 for Waack Drills',
    artist: 'Various Artists',
    bpm: 124,
    duration: '1h 15m',
    type: 'fast',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    trackCount: 25,
    coverUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=400',
    platform: 'spotify',
    sourceUrl: 'https://open.spotify.com'
  },
  {
    id: 'pl-punking-drama',
    title: 'Dramatic Orchestral & Soul Waacking Anthems',
    artist: 'Various Artists',
    bpm: 112,
    duration: '54m',
    type: 'slow',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    trackCount: 18,
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=400',
    platform: 'soundcloud',
    sourceUrl: 'https://soundcloud.com'
  }
];

// ==========================================
// COMUNICADOS Y PRESENTACIONES GLOBALES
// ==========================================
export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a-1',
    title: '🏆 Gran Batalla Waack On 2026',
    content: '¡Instructores y estudiantes! Abrimos las inscripciones para la Batalla Oficial Waack On 2026. Categorías: 1v1 Open Style Waacking y 1v1 Fast Rolls. ¡Habrá premios en efectivo y trofeos físicos para los finalistas!',
    date: '2026-07-20',
    author: 'Brando Hermoso',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
    authorRole: 'instructor',
    category: 'competencias',
    important: true,
    actionUrl: 'https://meet.google.com/waack-on-battle',
    imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'a-2',
    title: '⚡ Jam & Sesión Rítmica',
    content: 'Este viernes a las 18:00 (hora central) tendremos una Sesión Rítmica intensiva para pulir el contratiempo y acentos en caja torácica. Conéctate con tu cámara lista para recibir correcciones en tiempo real.',
    date: '2026-07-18',
    author: 'Kumari "WaackQueen"',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
    authorRole: 'instructor',
    category: 'sesiones',
    important: false,
    actionUrl: 'https://meet.google.com/waack-session-jam',
    imageUrl: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'a-3',
    title: '💃 Masterclass YoonJi Kim',
    content: 'Nueva clase especial con YoonJi Kim. Exploraremos la estética retro de los años 70, port de bras y la simetría de la pasarela disco. ¡Disponible para todos los niveles de la academia!',
    date: '2026-07-15',
    author: 'YoonJi Kim',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120',
    authorRole: 'instructor',
    category: 'clases',
    important: true,
    imageUrl: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&q=80&w=800'
  }
];

export const INITIAL_PRESENTATIONS: Presentation[] = [
  {
    id: 'p-1',
    studentName: 'Marilyn',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
    text: '¡Hola a todos! Soy Marilyn de Madrid. Llevo unos 6 meses bailando Waacking de forma autodidacta y mi meta este año es mejorar mi velocidad de brazos (los "rolls") y aprender a contar la música disco de forma orgánica. ¡Encantada de estar aquí!',
    videoUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=500',
    date: 'Hace 2 horas',
    likes: 12,
    comments: [
      {
        id: 'c-1',
        author: 'Brando Hermoso',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
        text: '¡Bienvenida Marilyn! Estás en el lugar correcto. El Nivel 1 te va a ayudar muchísimo con la base de los brazos.',
        date: 'Hace 1 hora'
      }
    ]
  },
  {
    id: 'p-2',
    studentName: 'Pedro',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    text: 'Buenas a todos, soy Pedro. Bailo House y Hip Hop, y vengo a perfeccionar el Waacking para integrarlo a mi Freestyle. ¡Nos vemos en los Lives!',
    date: 'Ayer',
    likes: 8,
    comments: []
  }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'm-1',
    user: 'Marilyn',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
    text: '¿Alguien probó el drill de 110 BPM de hoy? ¡Qué duro mantener los rolls arriba por 3 minutos!',
    time: '14:20',
    role: 'student'
  },
  {
    id: 'm-2',
    user: 'Pedro',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    text: '¡Sí! Al final los hombros te queman, pero se siente la mejora en el control.',
    time: '14:22',
    role: 'student'
  },
  {
    id: 'm-3',
    user: 'Brando Hermoso',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
    text: 'Eso es clave, Pedro. Recuerden relajar el trapecio y activar el core para no cargar la espalda alta. ¡Sigan así!',
    time: '14:30',
    role: 'instructor'
  }
];

export const INITIAL_INSTRUCTORS: InstructorCatedra[] = [
  {
    id: 'inst-brando',
    name: 'Brando Hermoso',
    role: 'Director de Cátedra • Técnica Base & Expresión',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    bio: 'Pionero de la docencia metódica en Waacking. Su cátedra se enfoca en el control biomecánico de brazos, alineación postural y la dramática escénica de Los Ángeles 1970s.',
    specialty: 'Técnica Fundamental, Rolls & Expresión Dramática',
    isSubscribed: true,
    monthlyPrice: '$45 USD/mes',
    featuredColor: 'from-amber-500/20 to-purple-950/40',
    lessonsCount: 4,
    courses: [
      {
        id: 'course-b1',
        title: 'Master Program: Arsenal de Waacking & Rotación Articular',
        subtitle: 'Cátedra Brando Hermoso',
        durationWeeks: 4,
        modulesCount: 8,
        level: 'Nivel 1 & 2',
        description: 'Inmersión sistemática paso a paso para dominar la técnica de codos y proyección postural sin lesionar los hombros.',
        coverImage: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&q=80&w=600',
        status: 'active'
      }
    ],
    materials: [
      {
        id: 'mat-b1',
        title: 'Waacking Workbook v2.1: Orígenes de Los Ángeles',
        type: 'PDF',
        pages: 24,
        fileSize: '4.2 MB',
        description: 'Guía histórica de los pioneros de LA, métrica Disco 4/4 y desglose de los 5 pilares del Waacking.'
      }
    ]
  },
  {
    id: 'inst-lorena',
    name: 'Lorena "WaackQueen"',
    role: 'Directora de Cátedra • Speed-Waack & Síncopas',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    bio: 'Reconocida campeona internacional. Su cátedra impulsa la velocidad extrema de ejecución, la precisión geométrica de líneas y el dominio del contratiempo.',
    specialty: 'Síncopas Avanzadas, Speed Drills & Geometría Espacial',
    isSubscribed: true,
    monthlyPrice: '$35 USD/mes',
    featuredColor: 'from-pink-500/20 to-indigo-950/40',
    lessonsCount: 3,
    courses: [
      {
        id: 'course-l1',
        title: 'Intensivo: Speed-Waack & Síncopas a +128 BPM',
        subtitle: 'Cátedra Lorena WaackQueen',
        durationWeeks: 3,
        modulesCount: 6,
        level: 'Nivel 2',
        description: 'Acelera la velocidad articular y la precisión para marcar los platillos y síncopas más complejas sobre música rápida.',
        coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600',
        status: 'active'
      }
    ],
    materials: [
      {
        id: 'mat-l1',
        title: 'Guía de Aceleración y Control Articular',
        type: 'Guía Teórica',
        pages: 18,
        fileSize: '3.5 MB',
        description: 'Ejercicios progresivos de resistencia física para aumentar los BPM de tus codos de forma limpia.'
      }
    ]
  }
];

export const INITIAL_LESSONS: Lesson[] = [
  {
    id: 'l-101',
    level: 1,
    title: '1. Postura Base y Centro de Gravedad',
    description: 'Aprende la colocación correcta de la columna, la alineación de hombros y cómo activar tu torso para sostener el peso de los brazos.',
    duration: '12:45',
    category: 'postura',
    style: 'classic',
    technique: 'posture',
    difficulty: 'principiante',
    bpm: 110,
    tags: ['Alineación', 'Biomecánica', 'Centro'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    completed: true,
    instructorId: 'inst-brando',
    instructorName: 'Brando Hermoso'
  },
  {
    id: 'l-102',
    level: 1,
    title: '2. Drills de Brazos: El Roll Básico (Waack)',
    description: 'La técnica fundamental del Waacking. Rotación interna y externa de codo pasando por detrás de la cabeza de forma segura.',
    duration: '18:20',
    category: 'brazos',
    style: 'classic',
    technique: 'rolls',
    difficulty: 'principiante',
    bpm: 115,
    tags: ['Rolls', 'Codos', 'Trayectorias'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    completed: false,
    instructorId: 'inst-brando',
    instructorName: 'Brando Hermoso'
  },
  {
    id: 'l-103',
    level: 1,
    title: '3. Musicalidad Disco y Conteo en 8s',
    description: 'Entiende el beat disco, las síncopas, la caja y el charles para poder acentuar de forma precisa tus golpes y poses.',
    duration: '14:15',
    category: 'musicalidad',
    style: 'soul_freestyle',
    technique: 'musicality',
    difficulty: 'principiante',
    bpm: 118,
    tags: ['Métrica 4/4', 'Caja en 2 y 4', 'Síncopas'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    completed: true,
    instructorId: 'inst-brando',
    instructorName: 'Brando Hermoso'
  },
  {
    id: 'l-104',
    level: 1,
    title: '4. Transiciones y Líneas Simétricas',
    description: 'Cómo pasar de un roll a una pose estática manteniendo la simetría espacial y la proyección escénica.',
    duration: '15:50',
    category: 'fundamentos',
    style: 'posing',
    technique: 'poses_lines',
    difficulty: 'principiante',
    bpm: 120,
    tags: ['Líneas', 'Simetría', 'Posing'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    completed: false,
    instructorId: 'inst-lorena',
    instructorName: 'Lorena "WaackQueen"'
  },
  {
    id: 'l-201',
    level: 2,
    title: '1. Introducción al Freestyle: Habitar el Espacio',
    description: 'Técnicas de improvisación para salir del plano bidimensional. Niveles altos, medios y bajos combinando desplazamientos.',
    duration: '22:10',
    category: 'improvisacion',
    style: 'soul_freestyle',
    technique: 'footwork',
    difficulty: 'intermedio',
    bpm: 122,
    tags: ['Freestyle', 'Espacio', 'Niveles'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    completed: false,
    instructorId: 'inst-lorena',
    instructorName: 'Lorena "WaackQueen"'
  },
  {
    id: 'l-202',
    level: 2,
    title: '2. Carácter, Drama y Expresividad Genuina',
    description: 'El Waacking nació del drama y el cine mudo. Trabajamos la mirada, la intención escénica y personificar la música disco.',
    duration: '19:40',
    category: 'caracter',
    style: 'punking',
    technique: 'drama',
    difficulty: 'intermedio',
    bpm: 116,
    tags: ['Punking', 'Drama', 'Actuación', 'Cine Mudo'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    completed: false,
    instructorId: 'inst-brando',
    instructorName: 'Brando Hermoso'
  },
  {
    id: 'l-203',
    level: 2,
    title: '3. Laboratorio de Velocidad y Síncopa',
    description: 'Entrenamiento de alta intensidad para acelerar los rolls y clavar los acentos en doble tiempo sobre música rápida (+125 BPM).',
    duration: '25:15',
    category: 'velocidad',
    style: 'fast_waack',
    technique: 'speed',
    difficulty: 'avanzado',
    bpm: 128,
    tags: ['Speed-Waack', 'Doble Tiempo', 'Resistencia'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    completed: false,
    instructorId: 'inst-lorena',
    instructorName: 'Lorena "WaackQueen"'
  },
  {
    id: 'l-301',
    level: 2,
    title: '4. High Fashion Posing & Port de Bras',
    description: 'Estética visual de pasarela, ángulos de alta costura y congelados fotográficos en tiempo 7 y 8.',
    duration: '17:30',
    category: 'postura',
    style: 'posing',
    technique: 'poses_lines',
    difficulty: 'intermedio',
    bpm: 118,
    tags: ['Vogue Lines', 'Port de Bras', 'Fotografía'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    completed: false,
    instructorId: 'inst-lorena',
    instructorName: 'Lorena "WaackQueen"'
  },
  {
    id: 'l-302',
    level: 2,
    title: '5. Sprints de Rolls Cruzados y Overhead Loops',
    description: 'Secuencias complejas de rotación detrás de la nuca con cambio de dirección a contratiempo sin perder la postura.',
    duration: '21:00',
    category: 'brazos',
    style: 'fast_waack',
    technique: 'rolls',
    difficulty: 'avanzado',
    bpm: 130,
    tags: ['Overheads', 'Loops', 'Cruce de Brazos'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    completed: false,
    instructorId: 'inst-brando',
    instructorName: 'Brando Hermoso'
  }
];

export const INITIAL_PODCAST_SHOWS: PodcastShow[] = [
  {
    id: 'pod-brando-1',
    instructorId: 'inst-brando',
    instructorName: 'Brando Hermoso',
    instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    title: 'Waack & Groove: Historias del Disco 1970s',
    description: 'Un viaje profundo a las raíces del Waacking en Los Ángeles, la era de Soul Train, Garbo, Underground Gay Clubs y la herencia de los pioneros.',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800',
    category: 'Historia & Cultura',
    status: 'active',
    createdAt: '2026-07-01',
    episodes: [
      {
        id: 'ep-b1-1',
        podcastId: 'pod-brando-1',
        title: 'Episodio 1: De Los Ángeles al Mundo: El Origen de Garbo & Punking',
        description: 'Exploramos cómo nació la cultura del Punking y Waacking en los clubes nocturnos de Los Ángeles durante la década de 1970.',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        duration: '38:15',
        artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600',
        episodeNumber: 1,
        seasonNumber: 1,
        publishDate: '2026-07-10',
        status: 'published',
        playsCount: 245
      }
    ]
  }
];

export const INITIAL_STUDIO: Studio = {
  id: 'studio-1',
  name: 'Waack On Global Studio & Dance Academy',
  logo: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=300',
  subscriptionPlan: 'Pro Academy',
  address: 'Av. Corrientes 1245, Buenos Aires / Sede Virtual Global',
  phone: '+54 9 11 4059-8832',
  scheduledClassesThisWeek: 18,
  attendanceRatePercent: 94,
  instructors: [
    {
      id: 'inst-1',
      name: 'Lorena "WaackQueen"',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
      email: 'lorena@waackon.app',
      assignedClassesCount: 6,
      specialty: 'Arms Control & Expressive Disco',
      status: 'active',
      joinedDate: '2025-03-15'
    },
    {
      id: 'inst-2',
      name: 'Viktor Ebony',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
      email: 'viktor@waackon.app',
      assignedClassesCount: 4,
      specialty: 'Speed Drills & Posing Performance',
      status: 'active',
      joinedDate: '2025-05-10'
    },
    {
      id: 'inst-3',
      name: 'Brando Hermoso',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
      email: 'brando.h@waackon.app',
      assignedClassesCount: 5,
      specialty: 'Biomecánica & Prevención de Lesiones',
      status: 'active',
      joinedDate: '2025-01-20'
    }
  ],
  students: [
    {
      id: 'stud-1',
      name: 'Sofía Martínez',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
      email: 'sofia.martinez@gmail.com',
      level: 'Nivel 1',
      streakDays: 14,
      subscriptionStatus: 'active',
      joinedDate: '2026-01-10',
      lastActive: 'Hace 2 horas'
    },
    {
      id: 'stud-2',
      name: 'Carlos "VogueBeat"',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120',
      email: 'carlos.vogue@gmail.com',
      level: 'Nivel 2',
      streakDays: 28,
      subscriptionStatus: 'active',
      joinedDate: '2025-11-04',
      lastActive: 'Ayer'
    }
  ],
  documents: [
    {
      id: 'std-doc-1',
      title: 'Cuaderno de Práctica Biomecánica para prevención de lesiones de hombro y codo',
      category: 'guia_pdf',
      categoryLabel: 'Guía y Manual de Técnica en PDF',
      format: 'PDF - 18 Páginas',
      description: 'Documento institucional para la preservación articular en rotaciones complejas y drills de alta aceleración.',
      fileUrl: 'https://waackon.app/docs/Cuaderno_Practica_Biomecanica_Prevencion_Lesiones.pdf',
      fileName: 'Cuaderno_Practica_Biomecanica_Prevencion_Lesiones.pdf',
      createdAt: '2026-08-01',
      downloadsCount: 128,
      authorName: 'Coordinación Biomecánica Studio'
    }
  ]
};

// ==========================================
// 18. RETO SEMANAL DE LA COMUNIDAD (WEEKLY CHALLENGE)
// ==========================================
export const INITIAL_WEEKLY_CHALLENGE: WeeklyCommunityChallenge = {
  id: 'challenge-w34',
  weekNumber: 34,
  title: 'Reto Semanal #34: 70s Soulful Posing & High-Speed Cross Rolls',
  subtitle: 'Combina 8 compases de rolls acelerados a 126 BPM con 3 poses teatrales dramáticas congeladas en el silencio vocal.',
  theme: '70s Soulful Posing & High-Speed Cross Rolls',
  category: 'Técnica & Expresión',
  description: 'Este reto pone a prueba tu versatilidad rítmica. Debes iniciar con una entrada teatral imponente, ejecutar al menos una secuencia de cross-rolls continuos de 16 tiempos manteniendo hombros estables, y culminar con tres poses de alta costura inspiradas en las portadas de revistas de 1975.',
  coverImage: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=1200',
  recommendedTrack: {
    title: 'Love to Love You Baby / I Feel Love (Waack Extended Mix)',
    artist: 'Donna Summer & Giorgio Moroder Tribute',
    bpm: 126,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    spotifyUrl: 'https://open.spotify.com'
  },
  criteria: [
    {
      title: 'Limpieza Articular & Altura de Codos',
      weight: '35%',
      description: 'Rotación limpia sin descender los codos ni tensionar el trapecio superior.'
    },
    {
      title: 'Dramatismo & Proyección Escénica',
      weight: '35%',
      description: 'Mirada viva, conexión con el alter ego y definición en los cambios de pose.'
    },
    {
      title: 'Musicalidad & Acentos en Contratiempo',
      weight: '30%',
      description: 'Clavar los silencios orquestales y cambios de compás con precisión milimétrica.'
    }
  ],
  judge: {
    name: 'Lorena "WaackQueen"',
    role: 'Jueza Oficial del Reto & Campeona Internacional',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  },
  startDate: '2026-08-10',
  endDate: '2026-08-17',
  status: 'active',
  rewardXp: 150,
  submissions: [
    {
      id: 'sub-1',
      challengeId: 'challenge-w34',
      userId: 'stud-1',
      dancerName: 'Marilyn "Garbo Vibe"',
      dancerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      dancerLevel: 'Nivel 2 • Avanzado',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      videoThumbnail: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&q=80&w=600',
      title: 'Fusión Vintage: Rolls cruzados con mirada de cine mudo',
      notes: 'Probé cambiar de nivel en el compás 5 y mantener la pose de brazos enmarcando el rostro durante 2 tiempos completos.',
      submittedAt: 'Hace 1 día',
      votesCount: 42,
      reactions: {
        fire: 24,
        queen: 12,
        precision: 4,
        drama: 2
      },
      score: 95.5,
      rank: 1,
      isWinner: true,
      instructorFeedback: {
        author: 'Lorena "WaackQueen"',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        comment: '¡Brillante colocación de escápulas! La transición al suelo fue impecable y no perdiste la velocidad de los rolls.',
        score: 96,
        badges: ['⚡ Máxima Velocidad', '👑 Estilo Impecable']
      }
    },
    {
      id: 'sub-2',
      challengeId: 'challenge-w34',
      userId: 'stud-2',
      dancerName: 'Carlos "VogueBeat"',
      dancerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
      dancerLevel: 'Nivel 2 • Intermedio',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
      videoThumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=600',
      title: 'Drama & Soul: Acento en los violines con freeze dramático',
      notes: 'Me enfoqué en la respiración antes del drop para que el cambio de tempo se sienta natural y sorpresivo.',
      submittedAt: 'Hace 2 días',
      votesCount: 36,
      reactions: {
        fire: 15,
        queen: 5,
        precision: 3,
        drama: 13
      },
      score: 91.0,
      rank: 2,
      instructorFeedback: {
        author: 'Lorena "WaackQueen"',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        comment: 'Gran expresividad teatral. Solo asegúrate de no quebrar la muñeca derecha al pasar por detrás de la nuca.',
        score: 90,
        badges: ['🎭 Master del Drama']
      }
    },
    {
      id: 'sub-3',
      challengeId: 'challenge-w34',
      userId: 'stud-3',
      dancerName: 'Sofía Glam',
      dancerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
      dancerLevel: 'Nivel 1 • En Crecimiento',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      videoThumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600',
      title: 'Precisión Articular a 126 BPM - Mi primera entrega',
      notes: 'Trabajé mucho la simetría de los dos brazos frente al espejo antes de grabar la toma final.',
      submittedAt: 'Hace 3 días',
      votesCount: 29,
      reactions: {
        fire: 11,
        queen: 4,
        precision: 12,
        drama: 2
      },
      score: 87.5,
      rank: 3,
      instructorFeedback: {
        author: 'Brando Hermoso',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
        comment: '¡Enorme progreso en la trayectoria de los codos! Sigue manteniendo ese centro firme.',
        score: 88,
        badges: ['✨ Gran Precisión']
      }
    }
  ],
  winners: [
    {
      rank: 1,
      submissionId: 'sub-1',
      dancerName: 'Marilyn "Garbo Vibe"',
      dancerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      entryTitle: 'Fusión Vintage: Rolls cruzados con mirada de cine mudo',
      score: 95.5,
      prizeTitle: 'Trofeo Digital de Oro & +150 Puntos XP',
      badge: '👑 Campeona Semanal #34',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    },
    {
      rank: 2,
      submissionId: 'sub-2',
      dancerName: 'Carlos "VogueBeat"',
      dancerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
      entryTitle: 'Drama & Soul: Acento en los violines con freeze dramático',
      score: 91.0,
      prizeTitle: 'Medalla de Plata & +100 Puntos XP',
      badge: '🥈 Subcampeón #34',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4'
    },
    {
      rank: 3,
      submissionId: 'sub-3',
      dancerName: 'Sofía Glam',
      dancerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
      entryTitle: 'Precisión Articular a 126 BPM - Mi primera entrega',
      score: 87.5,
      prizeTitle: 'Medalla de Bronce & +75 Puntos XP',
      badge: '🥉 3er Puesto #34',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
    }
  ]
};

export const INITIAL_PAST_CHALLENGE_WINNERS: PastChallengeWinner[] = [
  {
    id: 'past-33',
    weekNumber: 33,
    title: 'Reto #33: Síncopas Rápidas & Cambios de Nivel en el Suelo',
    theme: 'Síncopas Rápidas & Floorwork',
    dateRange: '03 Ago - 10 Ago 2026',
    winnerName: 'Elena "Lightning Arms"',
    winnerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    winnerLevel: 'Nivel 2 • Avanzado',
    entryTitle: 'Transición fluida a suelo con rolls dobles invertidos',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    score: 97.2,
    votesCount: 58,
    participantsCount: 24,
    prizeAwarded: '1er Lugar • Insignia de Oro & Masterclass VIP'
  },
  {
    id: 'past-32',
    weekNumber: 32,
    title: 'Reto #32: Punking Storytelling & Los Ángeles 1975 Character',
    theme: 'Punking & Alter Ego',
    dateRange: '27 Jul - 03 Ago 2026',
    winnerName: 'Carlos "VogueBeat"',
    winnerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    winnerLevel: 'Nivel 2 • Intermedio',
    entryTitle: 'La Diva de Hollywood Traicionada (Freestyle Teatral)',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    score: 94.8,
    votesCount: 51,
    participantsCount: 19,
    prizeAwarded: '1er Lugar • Insignia de Oro & +150 XP'
  },
  {
    id: 'past-31',
    weekNumber: 31,
    title: 'Reto #31: Pure Posing Symphony - Líneas de Alta Costura',
    theme: 'Posing & Geometría Visual',
    dateRange: '20 Jul - 27 Jul 2026',
    winnerName: 'Marilyn "Garbo Vibe"',
    winnerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    winnerLevel: 'Nivel 2 • Avanzado',
    entryTitle: '12 Poses continuas en contratiempos sin perder el eje',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    score: 96.0,
    votesCount: 64,
    participantsCount: 28,
    prizeAwarded: '1er Lugar • Insignia de Oro & Spotlight en Cátedra'
  }
];

