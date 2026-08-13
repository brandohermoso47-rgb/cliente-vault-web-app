import { Announcement, Presentation, ChatMessage, Lesson, PlaylistItem, FeedbackItem, CalendarEvent, User, PracticeLog, InstructorCatedra, PodcastShow, Studio } from './types';

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
  },
  {
    id: 'a-4',
    title: '📢 Lanzamiento del Cuaderno de Práctica Biomecánica v2.2',
    content: 'Comunidad: Hemos subido la guía actualizada con ejercicios diarios para reducir la tensión en hombros al ejecutar rolls a más de 125 BPM. Descárgalo de forma 100% libre.',
    date: '2026-07-10',
    author: 'Brando Hermoso',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
    authorRole: 'instructor',
    category: 'comunicados',
    important: false,
  }
];

export const INITIAL_PRESENTATIONS: Presentation[] = [
  {
    id: 'p-1',
    studentName: 'Marilyn',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
    text: '¡Hola a todos! Soy Marilyn de Madrid. Llevo unos 6 meses bailando Waacking de forma autodidacta y mi meta este año es mejorar mi velocidad de brazos (los "rolls") y aprender a contar la música disco de forma orgánica. ¡Encantada de estar aquí!',
    videoUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=500', // image placeholder representing a video preview
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
      },
      {
        id: 'course-b2',
        title: 'Curso Intensivo: Drama & Carácter Cinematográfico 70s',
        subtitle: 'Cátedra Brando Hermoso',
        durationWeeks: 3,
        modulesCount: 6,
        level: 'Avanzado',
        description: 'Desarrolla el magnetismo actoral y la presencia magnética en el escenario inspirándote en las divas del cine clásico.',
        coverImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600',
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
      },
      {
        id: 'mat-b2',
        title: 'Manual Biomecánico de Codo y Hombro',
        type: 'Guía Teórica',
        pages: 12,
        fileSize: '2.8 MB',
        description: 'Anatomía funcional aplicada para ejecutar los Rolls sin tensión cervical ni sobrecarga.'
      }
    ]
  },
  {
    id: 'inst-elena',
    name: 'Elena Rostova',
    role: 'Directora de Cátedra • Speed-Waack & Síncopas',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=250',
    bio: 'Reconocida competidora internacional de Waacking y Funk Battles. Su cátedra impulsa la velocidad extrema de ejecución, la precisión geométrica de líneas y el dominio del contratiempo.',
    specialty: 'Síncopas Avanzadas, Speed Drills & Geometría Espacial',
    isSubscribed: true,
    monthlyPrice: '$35 USD/mes',
    featuredColor: 'from-pink-500/20 to-indigo-950/40',
    lessonsCount: 3,
    courses: [
      {
        id: 'course-e1',
        title: 'Intensivo: Speed-Waack & Síncopas a +128 BPM',
        subtitle: 'Cátedra Elena Rostova',
        durationWeeks: 3,
        modulesCount: 6,
        level: 'Nivel 2',
        description: 'Acelera la velocidad articular y la precisión para marcar los platillos y síncopas más complejas sobre música rápida.',
        coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600',
        status: 'active'
      },
      {
        id: 'course-e2',
        title: 'Programa de Geometría Escénica & Proyección Espacial',
        subtitle: 'Cátedra Elena Rostova',
        durationWeeks: 4,
        modulesCount: 8,
        level: 'Todos los niveles',
        description: 'Aprende a llenar el espacio físico trazando ángulos limpios y utilizando los tres niveles de profundidad.',
        coverImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600',
        status: 'active'
      }
    ],
    materials: [
      {
        id: 'mat-e1',
        title: 'Guía de Aceleración y Control Articular - Elena Rostova',
        type: 'Guía Teórica',
        pages: 18,
        fileSize: '3.5 MB',
        description: 'Ejercicios progresivos de resistencia física para aumentar los BPM de tus codos de forma limpia.'
      },
      {
        id: 'mat-e2',
        title: 'Mapa Geométrico de Posición de Brazos & Ángulos',
        type: 'Mapa Mental',
        pages: 8,
        fileSize: '1.9 MB',
        description: 'Diagramas visuales para corregir líneas diagonales, paralelas y simetrías durante el freestyle.'
      }
    ]
  }
];

export const INITIAL_LESSONS: Lesson[] = [
  // Nivel 1
  {
    id: 'l-101',
    level: 1,
    title: '1. Postura Base y Centro de Gravedad',
    description: 'Aprende la colocación correcta de la columna, la alineación de hombros y cómo activar tu torso para sostener el peso de los brazos.',
    duration: '12:45',
    category: 'postura',
    videoUrl: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&q=80&w=600',
    completed: true,
    instructorId: 'inst-brando',
    instructorName: 'Brando Hermoso',
    transcription: `[00:00] ¡Hola a todos! Bienvenidos a la Cátedra de Brando Hermoso. En esta primera lección vamos a sentar las bases biomecánicas del Waacking: la postura y el centro de gravedad.
[01:30] Lo primero que debemos entender es que los brazos en Waacking pesan. Para sostener ese peso sin sobrecargar las cervicales, necesitamos una columna neutra, esternón ligeramente elevado y escápulas conectadas abajo y atrás.
[03:45] Hagamos el primer chequeo somático: coloca los pies a la anchura de las caderas, flexiona levemente las rodillas y activa la faja abdominal profunda. Siente cómo tu centro de gravedad desciende 2 centímetros hacia el suelo.
[06:10] Ahora eleven los brazos en Posing a 90 grados. Si relajas el abdomen, la zona lumbar se arquea y perderás el balance. Activen el core en el tiempo 1.
[08:50] Vamos a practicar la transferencia de peso de izquierda a derecha en 8 tiempos mientras mantenemos los brazos congelados. Conteo: 1, 2, 3, 4, 5, 6, 7, 8.
[11:00] Excelente trabajo. Recuerden realizar este chequeo postural antes de cada drill diario de arm-rolls. ¡Nos vemos en la siguiente lección!`
  },
  {
    id: 'l-102',
    level: 1,
    title: '2. Drills de Brazos: El Roll Básico (Waack)',
    description: 'La técnica fundamental del Waacking. Rotación interna y externa de codo pasando por detrás de la cabeza de forma segura.',
    duration: '18:20',
    category: 'brazos',
    videoUrl: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=600',
    completed: false,
    instructorId: 'inst-brando',
    instructorName: 'Brando Hermoso',
    transcription: `[00:00] ¡Bienvenidos al laboratorio de rotación articular! Hoy aprendemos el famoso "Roll" o Waack alrededor de la cabeza.
[02:15] El error más común al empezar es mover todo el brazo desde la articulación del hombro. El movimiento real del Waacking se genera aislando el codo como un eje o pivote constante.
[05:30] Paso 1: Levanta el codo derecho a la altura del hombro. La mano debe dibujar un círculo imaginario pasando por detrás del cuello, rozando suavemente la nuca sin tocarla ni golpearla.
[08:45] Paso 2: Ejecutamos el roll interno (hacia adentro) y el roll externo (hacia afuera). Conteo lento a 110 BPM: tiempo 1 entra, tiempo 2 sale, tiempo 3 entra, tiempo 4 sale.
[12:20] Cuidado con inclinar la cabeza hacia adelante para esquivar el brazo. La cabeza se queda erguida e inmóvil; es la mano la que rodea la geometría del cráneo.
[15:10] Drill final de resistencia: 2 minutos continuos de rolls alternados mano derecha y mano izquierda. Mantengan los codos arriba y la respiración fluida. ¡A trabajar!`
  },
  {
    id: 'l-103',
    level: 1,
    title: '3. Musicalidad Disco y Conteo en 8s',
    description: 'Entiende el beat disco, las síncopas, la caja y el charles para poder acentuar de forma precisa tus golpes y poses.',
    duration: '14:15',
    category: 'musicalidad',
    videoUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=600',
    completed: true,
    instructorId: 'inst-brando',
    instructorName: 'Brando Hermoso',
    transcription: `[00:00] La música Disco de los años 70 es el corazón del Waacking. En esta lección aprenderemos a deconstruir la pista instrumental en sus componentes rítmicos.
[02:00] El compás clásico es 4/4 ("Four on the floor"). La batería marca el bombo en los 4 tiempos: 1, 2, 3, 4. Pero lo que nos mueve a los Waackers son las síncopas y los platillos (hi-hats) en los contratiempos "and".
[05:20] Escuchen la caja (snare) en los tiempos 2 y 4. Ahí es donde acentuamos nuestras poses más dramáticas y congelamientos estáticos.
[08:40] Hagamos un ejercicio de conteo cantando la batería: "Boom-Tsch-Snap-Tsch" (1 - and - 2 - and - 3 - and - 4). Intentemos clavar un roll en los "and" y un Posing limpio en los tiempos 2 y 4.
[11:30] Cuando la sección de vientos o cuerdas entra en la canción, cambiamos la textura del movimiento de rígida a lírica y fluida.
[13:45] Tarea: Escucha 3 canciones de Disco de nuestra playlist oficial e identifica los acentos de caja antes de la próxima práctica.`
  },
  {
    id: 'l-104',
    level: 1,
    title: '4. Transiciones y Líneas Simétricas',
    description: 'Cómo pasar de un roll a una pose estática manteniendo la simetría espacial y la proyección escénica.',
    duration: '15:50',
    category: 'fundamentos',
    videoUrl: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?auto=format&fit=crop&q=80&w=600',
    completed: false,
    instructorId: 'inst-elena',
    instructorName: 'Elena Rostova',
    transcription: `[00:00] Soy Elena Rostova y en esta clase abordaremos las transiciones limpias y las líneas geométricas en el espacio.
[02:10] De nada sirve tener velocidad si al momento de frenar tus brazos quedan desalineados o asimétricos. La geometría visual es lo que genera impacto en las batallas de freestyle.
[05:00] Analizemos las 3 líneas principales: la diagonal cruzada, la horizontal paralela y la vertical de extensión alta ("Overhead").
[08:15] Para hacer una transición limpia desde un roll a una pose: en el punto exacto de freno, extiende los dedos completamente y activa los tríceps durante medio segundo. Eso creará la ilusión óptica de un chasquido.
[11:40] Miren el espejo: la distancia entre tus puños y tus orejas debe ser exactamente la misma en ambos lados para proyectar simetría perfecta a los jueces.
[14:30] Drill práctico: 4 rolls a velocidad media + frenada instantánea en pose diagonal. Repetir 10 veces por lado.`
  },

  // Nivel 2
  {
    id: 'l-201',
    level: 2,
    title: '1. Introducción al Freestyle: Habitar el Espacio',
    description: 'Técnicas de improvisación para salir del plano bidimensional. Niveles altos, medios y bajos combinando desplazamientos.',
    duration: '22:10',
    category: 'improvisacion',
    videoUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600',
    completed: false,
    instructorId: 'inst-elena',
    instructorName: 'Elena Rostova',
    transcription: `[00:00] Bienvenidos al Nivel 2. Hoy rompemos la pared frontal y aprendemos a dominar las tres dimensiones del escenario en improvisación.
[03:20] El error habitual es bailar estático mirando solo hacia el frente. En Waacking usamos los 3 niveles: nivel alto (de pie y sobre puntas de pie), nivel medio (semi-flexión o plié) y nivel bajo (desplazamiento en el suelo o rodillas).
[07:15] Ejercicio de "La Caja Espacial": imagina un cubo transparente alrededor de ti. Tus brazos deben tocar las 8 esquinas del cubo utilizando giros de 90 y 180 grados.
[12:00] Practiquemos el desplazamiento en diagonal cruzada mientras ejecutamos un patrón de rolls a 125 BPM. Siente cómo la masa muscular del cuerpo acompaña el viaje.
[17:40] En improvisación, cambiar de nivel inesperadamente en el clímax de la canción garantiza capturar la atención del público y del rival.
[20:50] Ejecuta 1 minuto continuo improvisando combinando nivel alto y nivel medio sin repetir el mismo plano.`
  },
  {
    id: 'l-202',
    level: 2,
    title: '2. Carácter y Expresividad Genuina',
    description: 'El Waacking nació del drama y el cine mudo. Trabajamos la mirada, la intención escénica y personificar la música disco.',
    duration: '19:40',
    category: 'caracter',
    videoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600',
    completed: false,
    instructorId: 'inst-brando',
    instructorName: 'Brando Hermoso',
    transcription: `[00:00] Hola a todos. En esta lección trataremos la esencia misma del Punking y el Waacking: el drama, la caracterización y la presencia escénica.
[02:40] Recordemos la historia: en los clubes subterráneos de Los Ángeles en los 70, los pioneros reinterpretaban el glamour exagerado de las divas de Hollywood como Greta Garbo o Marilyn Monroe.
[06:10] No bailamos con la cara neutra o apagada. La mirada es la primera herramienta de proyección: debes sostener el contacto visual con el espectador o la cámara con seguridad absoluta.
[10:30] Ejercicio actoral: vamos a interpretar tres estados emocionales sobre el mismo fragmento musical de Disco: 1) Elegancia fría y distante, 2) Euforia festiva y desatada, 3) Misterio y drama contenido.
[15:15] Observen cómo los movimientos de la cabeza y los hombros acentúan la intención de la cara.
[18:20] Recuerden siempre: el Waacking no es solo mover los brazos rápido; es contar una historia inolvidable en 45 segundos de batalla.`
  },
  {
    id: 'l-203',
    level: 2,
    title: '3. Laboratorio de Velocidad y Síncopa',
    description: 'Entrenamiento de alta intensidad para acelerar los rolls y clavar los acentos en doble tiempo sobre música rápida (+125 BPM).',
    duration: '25:15',
    category: 'velocidad',
    videoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600',
    completed: false,
    instructorId: 'inst-elena',
    instructorName: 'Elena Rostova',
    transcription: `[00:00] ¡Prepárense para sudar! Esta lección es un laboratorio extremo de velocidad articular a más de 125 BPM.
[03:00] Para duplicar la velocidad de tus rolls sin perder control ni lesionarte, la clave está en reducir la amplitud del círculo alrededor de la nuca y relajar el cuello.
[07:20] Trabajamos el conteo en doble tiempo (sixteenth notes / semicorcheas): 1-e-and-a 2-e-and-a 3-e-and-a 4-e-and-a.
[12:45] Haremos la pirámide de BPMs: empezamos a 110 BPM por 30 segundos, subimos a 120 BPM por 30 segundos y cerramos a 130 BPM a máxima velocidad.
[18:30] Mantengan el pulso en las piernas flexionadas para amortiguar las vibraciones de los brazos.
[23:50] ¡Excelente resistencia! Recuerda hacer estiramientos de antebrazos y pectoral al finalizar la rutina.`
  }
];

export const INITIAL_PLAYLISTS: PlaylistItem[] = [
  // Lentas (Slow BPM)
  {
    id: 'pl-1',
    title: 'Rock Your Baby',
    artist: 'George McCrae',
    bpm: 104,
    duration: '3:20',
    type: 'slow',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: 'pl-2',
    title: 'Love to Love You Baby',
    artist: 'Donna Summer',
    bpm: 110,
    duration: '4:58',
    type: 'slow',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    id: 'pl-3',
    title: 'Good Times',
    artist: 'Chic',
    bpm: 115,
    duration: '3:45',
    type: 'slow',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  // Rápidas (Fast BPM)
  {
    id: 'pl-4',
    title: 'I Feel Love',
    artist: 'Donna Summer',
    bpm: 126,
    duration: '5:45',
    type: 'fast',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  },
  {
    id: 'pl-5',
    title: 'Disco Inferno',
    artist: 'The Trammps',
    bpm: 129,
    duration: '3:35',
    type: 'fast',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
  },
  {
    id: 'pl-6',
    title: 'Don\'t Leave Me This Way',
    artist: 'Harold Melvin & the Blue Notes',
    bpm: 132,
    duration: '4:12',
    type: 'fast',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'
  }
];

export const INITIAL_FEEDBACK_ITEMS: FeedbackItem[] = [
  {
    id: 'fb-1',
    studentName: 'Marilyn',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
    videoTitle: 'Practicando el Roll cruzado a 128 BPM',
    videoUrl: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=600',
    description: 'Marilyn ha subido práctica, no revisada. Evaluando alineación de codos y velocidad.',
    date: '2026-08-07',
    completed: false,
    corrections: []
  },
  {
    id: 'fb-2',
    studentName: 'Pedro',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    videoTitle: 'Primer intento Freestyle - House + Waacking',
    videoUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600',
    description: 'Tratando de fusionar los pasos rápidos del house con golpes y líneas de waacking. Agradezco correcciones.',
    date: '2026-08-06',
    completed: false,
    corrections: []
  },
  {
    id: 'fb-3',
    studentName: 'Elena',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    videoTitle: 'Secuencia de Poses de los 70s & Port de Bras',
    videoUrl: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&q=80&w=600',
    description: 'Secuencia corregida con feedback de postura somática.',
    date: '2026-08-05',
    completed: true,
    corrections: [
      {
        id: 'cor-1',
        time: '0:18',
        text: '¡Excelente extensión y simetría de brazos!',
        author: 'Brando Hermoso',
        role: 'instructor'
      }
    ]
  }
];

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'ev-1',
    title: 'Clase de Técnica Base (Nivel 1)',
    date: '2026-07-14', // Tuesday
    time: '19:00',
    duration: '60 min',
    instructor: 'Brando Hermoso',
    description: 'Trabajaremos drills de brazos intensivos para mejorar la rotación del codo y evitar la rigidez en las muñecas.',
    rsvpCount: 14,
    rsvpByMe: true,
    meetUrl: 'https://meet.google.com/hgo-qpzk-byy'
  },
  {
    id: 'ev-2',
    title: 'Live Session: Feedback en Vivo',
    date: '2026-07-16', // Thursday
    time: '20:30',
    duration: '75 min',
    instructor: 'Brando Hermoso',
    description: 'Conéctate y enciende tu cámara. Analizaremos en directo los videos subidos a la sección de Feedback y daremos pautas de corrección personalizadas.',
    rsvpCount: 22,
    rsvpByMe: false,
    meetUrl: 'https://meet.google.com/qny-pwnm-vxf'
  },
  {
    id: 'ev-3',
    title: 'Masterclass: Expresividad de los 70s',
    date: '2026-07-18', // Saturday
    time: '11:00',
    duration: '90 min',
    instructor: 'Brando Hermoso',
    description: 'Clase de carácter escénico, inspirada en las películas dramáticas clásicas y la pasarela de moda. ¡Aprende a contar una historia con tu mirada!',
    rsvpCount: 35,
    rsvpByMe: false,
    meetUrl: 'https://meet.google.com/fjr-yvyj-shk'
  },
  {
    id: 'ev-battle-spain',
    title: '🏆 Waack On Battle Spain 2026 (Madrid, España)',
    date: '2026-07-25',
    time: '16:00',
    duration: 'Todo el día',
    instructor: 'Waack On Academy & Comunidad de Madrid',
    description: 'La batalla nacional de waacking más esperada en España. Categorías: 1vs1 Waacking y 7-to-smoke. Con jurado internacional, ciphers de práctica abierta y DJs de vinilo tocando el mejor funk de los 70.',
    rsvpCount: 112,
    rsvpByMe: false,
    meetUrl: 'https://meet.google.com/spain-waack-2026'
  },
  {
    id: 'ev-battle-colombia',
    title: '🌴 Cali Waack Festival 2026 (Cali, Colombia)',
    date: '2026-08-02',
    time: '14:00',
    duration: '3 días',
    instructor: 'Waack Colombia Alliance',
    description: 'Festival sudamericano integral de Waacking. Incluye talleres intensivos con Brando Hermoso y pioneros globales, batallas oficiales 1vs1, mesas de discusión histórica sobre el nacimiento del estilo y fiestas disco oficiales.',
    rsvpCount: 185,
    rsvpByMe: false,
    meetUrl: 'https://meet.google.com/cali-waack-2026'
  },
  {
    id: 'ev-battle-world',
    title: '⚡ Waacking World Championship 2026 (Seúl, Corea del Sur)',
    date: '2026-08-15',
    time: '10:00',
    duration: 'Todo el día',
    instructor: 'Global Waack Federation',
    description: 'El evento competitivo definitivo del Waacking internacional. Los mejores exponentes calificados de cada país se enfrentarán en una batalla campal ante miles de espectadores y jueces legendarios.',
    rsvpCount: 540,
    rsvpByMe: false,
    meetUrl: 'https://meet.google.com/seoul-waack-2026'
  },
  {
    id: 'ev-battle-online',
    title: '🌐 Summer Disco Clash (Online Virtual Battle)',
    date: '2026-07-29',
    time: '18:00',
    duration: '120 min',
    instructor: 'Brando Hermoso',
    description: 'Batalla interactiva en línea exclusiva para miembros registrados de Waack On Academy a nivel mundial. Sube tu vídeo o baila directo en vivo, y deja que el voto conjunto de la comunidad decida quién pasa de ronda.',
    rsvpCount: 45,
    rsvpByMe: true,
    meetUrl: 'https://meet.google.com/waacking-summer-clash'
  }
];

export const INITIAL_PRACTICE_LOGS: PracticeLog[] = [
  {
    id: 'log-1',
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    minutes: 15,
    activityType: 'drill',
    description: 'Drill de muñecas rápidas a 115 BPM'
  },
  {
    id: 'log-2',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    minutes: 25,
    activityType: 'playlist',
    description: 'Práctica libre de líneas con George McCrae'
  },
  {
    id: 'log-3',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    minutes: 10,
    activityType: 'battle',
    description: 'Duelo rítmico contra Pedro Freestyle'
  },
  {
    id: 'log-4',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    minutes: 35,
    activityType: 'combo',
    description: 'Draft de coreografía y transiciones de brazo'
  },
  {
    id: 'log-5',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    minutes: 20,
    activityType: 'sensorial',
    description: 'Entrenamiento sensorial con El Blind Groove'
  }
];

export const INITIAL_PODCASTS: PodcastShow[] = [
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
        description: 'Exploramos cómo nació la cultura del Punking y Waacking en los clubes nocturnos de Los Ángeles durante la década de 1970. Hablamos de Tyrone Proctor, Viktor Manoel y Andrew Frank.',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        duration: '38:15',
        artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600',
        episodeNumber: 1,
        seasonNumber: 1,
        publishDate: '2026-07-10',
        status: 'published',
        playsCount: 245
      },
      {
        id: 'ep-b1-2',
        podcastId: 'pod-brando-1',
        title: 'Episodio 2: La Metodología de la Expresión: Postura y Teatralidad',
        description: 'Análisis minucioso del dramatismo escénico, la influencia del cine clásico de Hollywood y cómo construir una narrativa emotiva durante tus solos de Freestyle.',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        duration: '42:00',
        artworkUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=600',
        episodeNumber: 2,
        seasonNumber: 1,
        publishDate: '2026-07-18',
        status: 'published',
        playsCount: 189
      },
      {
        id: 'ep-b1-3',
        podcastId: 'pod-brando-1',
        title: 'Episodio 3: La Batalla de la Mente: Freestyle bajo Presión',
        description: 'Estrategias psicológicas para afrontar batallas 1v1, gestionar la ansiedad escénica y mantener la conexión rítmica cuando la música cambia inesperadamente.',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        duration: '29:40',
        artworkUrl: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&q=80&w=600',
        episodeNumber: 3,
        seasonNumber: 1,
        publishDate: '2026-07-25',
        status: 'published',
        playsCount: 162
      }
    ]
  },
  {
    id: 'pod-kumari-1',
    instructorId: 'inst-kumari',
    instructorName: 'Kumari "WaackQueen"',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    title: 'WaackTalk: Biomecánica & Aceleración Rítmica',
    description: 'Análisis técnico de prevención de lesiones en hombros, aceleración de rolls a más de 125 BPM y disciplina de entrenamiento somático diario.',
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800',
    category: 'Biomecánica & Técnica',
    status: 'active',
    createdAt: '2026-07-05',
    episodes: [
      {
        id: 'ep-k1-1',
        podcastId: 'pod-kumari-1',
        title: 'Episodio 1: Codos Aislados sin Tensión en Trapecio',
        description: 'Técnicas ergonómicas para evitar sobrecargar los hombros al ejecutar rolls a altas velocidades. Ejercicios de movilidad para la caja torácica.',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        duration: '25:30',
        artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600',
        episodeNumber: 1,
        seasonNumber: 1,
        publishDate: '2026-07-12',
        status: 'published',
        playsCount: 210
      },
      {
        id: 'ep-k1-2',
        podcastId: 'pod-kumari-1',
        title: 'Episodio 2: Velocidad Extrema: Contratiempos a 130 BPM',
        description: 'Cómo entrenar la respuesta neuromuscular para marcar acentos en contratiempo sin perder la estética limpia de brazos.',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        duration: '31:10',
        artworkUrl: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=600',
        episodeNumber: 2,
        seasonNumber: 1,
        publishDate: '2026-07-22',
        status: 'published',
        playsCount: 145
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
      name: 'Zoe "Flow" Jackson',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
      email: 'zoe.flow@waackon.app',
      assignedClassesCount: 6,
      specialty: 'Arms Control & Expressive Disco',
      status: 'active',
      joinedDate: '2025-03-15'
    },
    {
      id: 'inst-2',
      name: 'Kumari "WaackQueen"',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120',
      email: 'kumari@waackon.app',
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
      name: 'Camila Rossi',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=120',
      email: 'camila.rossi@gmail.com',
      level: 'Nivel 2',
      streakDays: 28,
      subscriptionStatus: 'active',
      joinedDate: '2025-11-04',
      lastActive: 'Ayer'
    },
    {
      id: 'stud-3',
      name: 'Lucía Fernández',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120',
      email: 'lucia.f@gmail.com',
      level: 'Avanzado',
      streakDays: 42,
      subscriptionStatus: 'active',
      joinedDate: '2025-08-15',
      lastActive: 'Hace 30 min'
    },
    {
      id: 'stud-4',
      name: 'Mateo Benítez',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
      email: 'mateo.benitez@gmail.com',
      level: 'Nivel 1',
      streakDays: 5,
      subscriptionStatus: 'pending',
      joinedDate: '2026-03-01',
      lastActive: 'Hace 3 días'
    },
    {
      id: 'stud-5',
      name: 'Valentina Gómez',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
      email: 'valen.gomez@gmail.com',
      level: 'Nivel 2',
      streakDays: 19,
      subscriptionStatus: 'active',
      joinedDate: '2026-02-18',
      lastActive: 'Hoy'
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
    },
    {
      id: 'std-doc-2',
      title: 'Planificación Semanal de Entrenamiento BPM & Plantilla de Registro',
      category: 'planificacion_bpm',
      categoryLabel: 'Planificación de Entrenamiento / Rutina BPM',
      format: 'Plantilla Imprimible / Digital',
      description: 'Planilla oficial del estudio para que los alumnos de todos los niveles registren sus rutinas de BPM semanales.',
      fileUrl: 'https://waackon.app/docs/Planificacion_Semanal_Entrenamiento_BPM_Imprimible.pdf',
      fileName: 'Planificacion_Semanal_Entrenamiento_BPM_Imprimible.pdf',
      createdAt: '2026-08-05',
      downloadsCount: 210,
      authorName: 'Academia Waack On'
    },
    {
      id: 'std-doc-3',
      title: 'Manual de Técnica Musical y Estructura Musical Disco 70s-80s',
      category: 'manual_tecnica',
      categoryLabel: 'Manual de Técnica',
      format: 'PDF - 24 Páginas',
      description: 'Análisis teórico del conteo rítmico, acentos de fraseo y musicalidad aplicados al estilo Waacking.',
      fileUrl: 'https://waackon.app/docs/Manual_Tecnica_Musical_Disco_WaackOn.pdf',
      fileName: 'Manual_Tecnica_Musical_Disco_WaackOn.pdf',
      createdAt: '2026-07-28',
      downloadsCount: 89,
      authorName: 'Dirección Académica'
    }
  ]
};

