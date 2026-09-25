// Datos de "Entrenar con otros estilos" (Laboratorio Freestyle): estilos de calle, ejercicios y textos en 6 idiomas.
// Extraído del prototipo Cypher Lab. Los pasos (moves) se guardan en inglés porque son términos del oficio;
// MV_ES los muestra traducidos cuando el idioma es español.

export type Lang = 'es' | 'en' | 'fr' | 'ko' | 'zh' | 'ja';
export const LANGS: { id: Lang; label: string }[] = [
  { id: 'es', label: 'Español' }, { id: 'en', label: 'English' }, { id: 'fr', label: 'Français' },
  { id: 'ko', label: '한국어' }, { id: 'zh', label: '中文' }, { id: 'ja', label: '日本語' }
];

export interface StyleDef {
  id: string; name: string; c: string; origin: string; bpm: [number, number]; mid: number;
  feel: string; pioneers: string; moves: string[]; drill: string; clues: string[];
  gives: string; skills: string[]; wdrill: string;
}

export const STYLES: StyleDef[] = [
 {
  "id": "breaking",
  "name": "Breaking",
  "c": "var(--yellow)",
  "origin": "El Bronx, Nueva York · años 70",
  "bpm": [
   100,
   125
  ],
  "mid": 112,
  "feel": "Breakbeats de funk y soul; el DJ alarga la parte instrumental.",
  "pioneers": "DJ Kool Herc, Crazy Legs, Rock Steady Crew",
  "moves": [
   "Toprock",
   "Indian step",
   "Six-step",
   "Three-step",
   "CC",
   "Baby freeze",
   "Chair freeze",
   "Backspin"
  ],
  "drill": "Cuatro rondas de 8 counts: toprock, bajada, six-step, salida. Sube el tempo 5 BPM cada ronda sin perder el pie de apoyo.",
  "clues": [
   "Su parte central es el “footwork” cerca del suelo y las congelaciones (freezes).",
   "Nació alrededor de los breaks instrumentales que alargaba un DJ del Bronx."
  ],
  "gives": "Fuerza, manejo del peso y pies rápidos para transiciones y bajadas.",
  "skills": [
   "agil",
   "cardio"
  ],
  "wdrill": "Toprock 8 counts + six-step lento; une la bajada con una pose final en el suelo."
 },
 {
  "id": "popping",
  "name": "Popping",
  "c": "var(--blue)",
  "origin": "Fresno, California · años 70",
  "bpm": [
   90,
   115
  ],
  "mid": 100,
  "feel": "Funk con snare marcado; cada golpe es una contracción.",
  "pioneers": "Boogaloo Sam y los Electric Boogaloos",
  "moves": [
   "Hit",
   "Wave",
   "Tick",
   "Strobe",
   "Robot",
   "Boogaloo roll",
   "Float",
   "Dime stop"
  ],
  "drill": "Un hit por count durante 16 counts, luego alterna hit fuerte y suave. Mira el espejo: el golpe debe verse aunque no haya movimiento grande.",
  "clues": [
   "Se basa en contraer y soltar músculos rápidamente para “golpear” el ritmo.",
   "Su creador más citado se llama Boogaloo Sam y venía de Fresno."
  ],
  "gives": "Control fino de músculos y conciencia corporal: tus poses y hits se ven más nítidos.",
  "skills": [
   "ctrl",
   "mus"
  ],
  "wdrill": "Haz tus hit-poses con un hit real de pecho o bíceps en los counts 4 y 8: la pose llega con golpe, no a la deriva."
 },
 {
  "id": "locking",
  "name": "Locking",
  "c": "var(--pink)",
  "origin": "Los Ángeles · finales de los 60",
  "bpm": [
   100,
   120
  ],
  "mid": 110,
  "feel": "Funk alegre y teatral, con pausas marcadas.",
  "pioneers": "Don Campbell, The Lockers",
  "moves": [
   "Lock",
   "Point",
   "Wrist twirl",
   "Scoobot",
   "Knee drop",
   "Stop and go",
   "Which-way",
   "Skeeter rabbit"
  ],
  "drill": "Lock en el count 4 y 8 de cada frase: acelera el brazo, congela 1 segundo con sonrisa y suelta. El contraste velocidad-pausa lo es todo.",
  "clues": [
   "Su movimiento distintivo es una pausa súbita en la que el cuerpo se “traba”.",
   "Lo inventó Don Campbell tras olvidar un paso mientras bailaba."
  ],
  "gives": "Contraste entre velocidad y pausa, y showmanship: comparte raíces de funk con el waacking.",
  "skills": [
   "brazos",
   "pres",
   "mus"
  ],
  "wdrill": "4 counts de brazo rápido y lock congelado en 4 y 8; luego cambia el lock por una pose de waacking."
 },
 {
  "id": "waacking",
  "name": "Waacking",
  "c": "var(--purple)",
  "origin": "Clubes de Los Ángeles · años 70",
  "bpm": [
   115,
   130
  ],
  "mid": 122,
  "feel": "Disco con cuerdas y voces; dramatismo y actitud.",
  "pioneers": "Tinker Bell, Arthur Goff",
  "moves": [
   "Arm rotation",
   "Pose",
   "Hit-pose",
   "Flick",
   "Cross-body arm",
   "Sweep",
   "Snap turn",
   "Shoulder drop"
  ],
  "drill": "Rotación de brazos sobre 8 counts sin doblar el hombro; termina cada frase en una pose de cuadro de moda.",
  "clues": [
   "Sus brazos giran en círculos amplios desde el hombro, con poses de estrella de cine.",
   "Nació en clubes disco de Los Ángeles de la comunidad LGBTQ+."
  ],
  "gives": "Tu estilo base: rotaciones de brazo, poses y actitud sobre disco y funk.",
  "skills": [
   "brazos",
   "pres",
   "mus"
  ],
  "wdrill": "10 min de rotaciones de brazo a 122 BPM sin bajar el codo; termina cada 8 counts en una pose limpia."
 },
 {
  "id": "house",
  "name": "House",
  "c": "var(--gold)",
  "origin": "Chicago y Nueva York · años 80",
  "bpm": [
   118,
   128
  ],
  "mid": 124,
  "feel": "Bombo en cuatro tiempos constante; el pie manda.",
  "pioneers": "Clubes The Warehouse y Paradise Garage",
  "moves": [
   "Jack",
   "Skate",
   "Heel-toe",
   "Farmer",
   "Shuffle",
   "Pas de bourrée",
   "Scissor",
   "Loose leg"
  ],
  "drill": "Jack continuo 32 counts, luego suma un paso de pie cada 8. Sostén el rebote en las rodillas, no en los hombros.",
  "clues": [
   "El bombo constante a 4 tiempos y el trabajo de pies rápido definen este estilo.",
   "Su nombre viene de los clubes donde nació la música electrónica de baile."
  ],
  "gives": "Pies y flow en 4/4: musicalidad continua y resistencia para sets largos.",
  "skills": [
   "agil",
   "mus",
   "cardio"
  ],
  "wdrill": "32 counts de jack y skate; añade brazos de waacking encima sin cortar el paso."
 },
 {
  "id": "hiphop",
  "name": "Hip hop / new style",
  "c": "var(--yellow)",
  "origin": "Calles y fiestas de EE. UU. · años 80–90",
  "bpm": [
   85,
   105
  ],
  "mid": 92,
  "feel": "Boom bap: groove pesado y bajo que invita a rebotar.",
  "pioneers": "Bailes sociales que se pasaban de barrio a barrio",
  "moves": [
   "Bounce",
   "Rock",
   "Party Machine",
   "Running Man",
   "Reebok",
   "Cabbage Patch",
   "Roger Rabbit",
   "Steve Martin"
  ],
  "drill": "Bounce y rock en los 8 counts, cambiando de peso. Añade un paso social por frase y termina con tu propia firma.",
  "clues": [
   "Se ancla en el bounce y el rock, con pasos sociales como el Running Man.",
   "Su música suele ser boom bap, con groove pesado y lento."
  ],
  "gives": "Agilidad, groove y desenvolvimiento: te mueves con más libertad entre poses.",
  "skills": [
   "agil",
   "pres",
   "mus"
  ],
  "wdrill": "Bounce a 92 BPM durante 2 minutos y suma un giro de waacking cada 8 counts sin perder el rebote."
 },
 {
  "id": "krump",
  "name": "Krump",
  "c": "var(--blue)",
  "origin": "South Central, Los Ángeles · 2000s",
  "bpm": [
   70,
   95
  ],
  "mid": 85,
  "feel": "Se suele sentir a mitad de tempo, con golpes intensos.",
  "pioneers": "Tight Eyez y Big Mijo",
  "moves": [
   "Chest pop",
   "Stomp",
   "Arm swing",
   "Jab",
   "Buck",
   "Snatch",
   "Hype"
  ],
  "drill": "Chest pop en cada count del 1 al 4, stomp en 5 y 6, libera la energía en 7-8. Respira y prioriza control sobre fuerza.",
  "clues": [
   "Es un estilo muy expresivo y emocional con chest pops y stomps.",
   "Surgió como alternativa positiva en South Central Los Ángeles en los años 2000."
  ],
  "gives": "Intensidad, control de pecho y expresión emocional.",
  "skills": [
   "ctrl",
   "pres",
   "cardio"
  ],
  "wdrill": "Chest pop en los counts 1–4; reemplaza el pop por una hit-pose en 5–8."
 },
 {
  "id": "twerking",
  "name": "Twerking",
  "c": "var(--pink)",
  "origin": "Nueva Orleans (bounce) y raíces de África Occidental · años 90",
  "bpm": [
   95,
   110
  ],
  "mid": 100,
  "feel": "Bounce de Nueva Orleans: bajo pesado y ritmo repetitivo.",
  "pioneers": "DJ Jubilee y Big Freedia",
  "moves": [
   "Bounce",
   "Drop",
   "Shake",
   "Wall twerk",
   "Hip isolation",
   "Pop"
  ],
  "drill": "Cuclillas con aislamiento de cadera 8 counts, sube a de pie 8 counts. Mantén la espalda neutra y respira; sin dolor lumbar.",
  "clues": [
   "Nació en la escena bounce de Nueva Orleans y se apoya en aislamientos rápidos de cadera.",
   "Big Freedia es una de las figuras más asociadas a la música bounce que lo popularizó."
  ],
  "gives": "Movilidad y aislamiento de cadera, fuerza de piernas y glúteo.",
  "skills": [
   "cad",
   "cardio",
   "ctrl"
  ],
  "wdrill": "2 min de aislamientos de cadera en cuclillas; suma brazos de waacking con los pies quietos."
 },
 {
  "id": "dancehall",
  "name": "Dancehall",
  "c": "var(--purple)",
  "origin": "Jamaica · años 80",
  "bpm": [
   90,
   105
  ],
  "mid": 95,
  "feel": "Riddims con bajo profundo y ritmo sincopado.",
  "pioneers": "Gerald “Bogle” Levy y los Ravers Clavers",
  "moves": [
   "Bogle",
   "Dutty wine",
   "Whine",
   "Butterfly",
   "Zip it up",
   "Wacky dip"
  ],
  "drill": "Whine continuo 16 counts, luego cambia el peso en un bogle. Rodillas blandas y torso suelto, la cadera lleva el ritmo.",
  "clues": [
   "Es el baile de las fiestas jamaicanas, con pasos como el Bogle y el Dutty Wine.",
   "Su música se organiza sobre riddims con bajo profundo, surgidos en Jamaica."
  ],
  "gives": "Groove bajo, cadera fluida y actitud de fiesta.",
  "skills": [
   "cad",
   "mus",
   "pres"
  ],
  "wdrill": "Whine y bogle a 95 BPM; sostén el groove y añade una pose de waacking en cada 4."
 },
 {
  "id": "voguing",
  "name": "Voguing",
  "c": "var(--gold)",
  "origin": "Ballroom de Harlem, Nueva York · años 60–80",
  "bpm": [
   120,
   140
  ],
  "mid": 128,
  "feel": "Beats de ballroom con voz y percusión marcada.",
  "pioneers": "Paris Dupree, Willi Ninja, Pepper LaBeija",
  "moves": [
   "Hand performance",
   "Catwalk",
   "Duckwalk",
   "Floor performance",
   "Spin and dip",
   "Pose"
  ],
  "drill": "Hand performance de 16 counts con muñecas y dedos precisos, y una pose limpia (“clic”) cada 8 counts. Piensa en un cuadro de revista.",
  "clues": [
   "Se organiza en categorías de ballroom, con hand performance, catwalk y duckwalk.",
   "Nació en el ballroom de Harlem; Willi Ninja fue una de sus figuras más conocidas."
  ],
  "gives": "El mejor complemento: hand performance, poses limpias y catwalk con actitud de pasarela.",
  "skills": [
   "brazos",
   "pres",
   "ctrl"
  ],
  "wdrill": "Hand performance de 16 counts con muñecas y dedos precisos; luego mézclala con tus rotaciones de brazo."
 },
 {
  "id": "techno",
  "name": "Techno dance",
  "c": "var(--yellow)",
  "origin": "Clubes de Europa · años 2000 (Tecktonik y shuffle)",
  "bpm": [
   125,
   140
  ],
  "mid": 130,
  "feel": "Electro y techno rápido; brazos y pies sin parar.",
  "pioneers": "Escena de clubes como Metropolis (París)",
  "moves": [
   "Arm flow",
   "Shuffle",
   "Charleston",
   "Kick step",
   "Hand strike"
  ],
  "drill": "Arm flow 4 minutos a 130 BPM sin caer de tempo; alterna brazos grandes y pequeños. Cuida hombros y muñecas.",
  "clues": [
   "Es un baile de club sobre música electrónica muy rápida, con brazos veloces y shuffle.",
   "Su versión más conocida como Tecktonik surgió en clubes de París."
  ],
  "gives": "Velocidad y resistencia de brazos: cardio y ritmo rápido.",
  "skills": [
   "cardio",
   "brazos",
   "mus"
  ],
  "wdrill": "Arm flow 4 min a 130 BPM sin caer de tempo; pasa el flujo a rotaciones amplias."
 },
 {
  "id": "flexing",
  "name": "Flexing",
  "c": "var(--blue)",
  "origin": "Flatbush, Brooklyn · años 2000",
  "bpm": [
   80,
   105
  ],
  "mid": 90,
  "feel": "Mezcla de dancehall, reggae y hip hop; control y narrativa.",
  "pioneers": "Reggie “Regg Roc” Gray y Storyboard P",
  "moves": [
   "Bone breaking",
   "Snap",
   "Glide",
   "Contortion",
   "Tut",
   "Hit"
  ],
  "drill": "Glide de brazo lento 8 counts, luego un snap de codo. Busca líneas limpias antes que velocidad.",
  "clues": [
   "Combina bone-breaking, snaps y glides con una narrativa teatral.",
   "Nació en Brooklyn y se identifica con la escena FlexN."
  ],
  "gives": "Control extremo de brazos y fluidez: aislamientos que parecen imposibles.",
  "skills": [
   "ctrl",
   "brazos"
  ],
  "wdrill": "Glide de brazo lento 8 counts y un snap de codo; integra el glide dentro de una rotación."
 },
 {
  "id": "afrohouse",
  "name": "Afro house dance",
  "c": "var(--pink)",
  "origin": "Sudáfrica, Angola y diáspora · 2000s en adelante",
  "bpm": [
   118,
   125
  ],
  "mid": 122,
  "feel": "House con percusiones africanas y bajo profundo.",
  "pioneers": "Escenas de Johannesburgo y Luanda",
  "moves": [
   "Gwara Gwara",
   "Pantsula step",
   "Knee bounce",
   "Weight shift",
   "Hip roll",
   "Chest wave"
  ],
  "drill": "Cambio de peso en tres apoyos con rebote de rodilla, suma onda de pecho. Mantén el suelo pesado y el torso libre.",
  "clues": [
   "Combina el bounce de house con percusión africana y pasos de pies fuertes.",
   "Se baila con mucho peso en el suelo y torso fluido, con fuerte presencia de Sudáfrica y Angola."
  ],
  "gives": "Groove de peso, ritmo polirrítmico y fluidez de torso.",
  "skills": [
   "mus",
   "cad",
   "agil"
  ],
  "wdrill": "Cambio de peso en tres apoyos; suma onda de pecho y cierra con una pose."
 }
];

export const SKILL_KEYS = [
 "ctrl",
 "agil",
 "mus",
 "brazos",
 "pres",
 "cardio",
 "cad"
];

// Textos de interfaz por idioma. Los valores pueden ser texto, listas u objetos (skills, wu, an_profiles).
export const UI: Record<Lang, Record<string, any>> = {
 "es": {
  "tabs": [
   "Estudio",
   "Estilos",
   "Ruta waacking",
   "Calentamiento",
   "Autoevaluación",
   "Plan de clase",
   "Quiz"
  ],
  "studio_h": "Estudio de 8 tiempos",
  "studio_lead": "Fija el tempo, arma frases de 8 counts con pasos del estilo elegido y ensáyalas con el metrónomo. Los counts 1 y 5 llevan acento.",
  "ready": "Listo",
  "play": "▶ Reproducir",
  "stop": "■ Detener",
  "tap": "Tap tempo",
  "sub": "Contar los “&”",
  "mute": "Sin sonido",
  "style": "Estilo",
  "range": "Rango típico {a}–{b} BPM",
  "phrase": "Frase {n}",
  "addp": "+ Frase",
  "delp": "− Quitar última",
  "rand": "Sorprenderme",
  "clr": "Limpiar todo",
  "bank": "Pasos de {name} — toca un paso para llenar el count seleccionado",
  "hold": "Vacío (mantener)",
  "note": "Ejemplo cargado: una combinación de popping de 2 frases. Se guarda sola en este navegador.",
  "estilos_h": "Mapa de estilos",
  "estilos_lead": "Origen, sensación musical y un ejercicio concreto para cada estilo. Los BPM son rangos típicos, no reglas.",
  "origin": "Origen",
  "tempo": "Tempo",
  "sound": "Sonido",
  "pioneers": "Pioneros",
  "gives_h": "Aporta al waacking",
  "drill_h": "Ejercicio del estilo",
  "use": "Ensayar en el Estudio",
  "ruta_h": "Ruta waacking",
  "ruta_lead": "Elige qué quieres mejorar y mira qué estilos del street dance te ayudan, con un ejercicio pensado para llevarlo a tu waacking.",
  "week_h": "Tu semana",
  "week_lead": "Asigna un estilo a cada día. Cada uno muestra su ejercicio para el waacking.",
  "rest": "Descanso",
  "rest_note": "Día de descanso. Recuperar también es entrenar.",
  "wdrill_h": "Ejercicio para tu waacking",
  "skills": {
   "ctrl": "Control muscular",
   "agil": "Agilidad y pies",
   "mus": "Musicalidad",
   "brazos": "Brazos y poses",
   "pres": "Actitud y presencia",
   "cardio": "Resistencia",
   "cad": "Cadera y torso"
  },
  "days": [
   "Lunes",
   "Martes",
   "Miércoles",
   "Jueves",
   "Viernes",
   "Sábado"
  ],
  "clase_h": "Plan de clase",
  "clase_lead": "Ajusta los minutos de cada bloque y mira a qué hora termina cada parte. Un punto de partida para clases de 75 minutos.",
  "starts": "Empieza",
  "total": "Total",
  "ends": "Termina",
  "min": "{n} min",
  "less": "Menos 5 minutos en {b}",
  "more": "Más 5 minutos en {b}",
  "blocks": [
   [
    "Calentamiento",
    "Movilidad, isolations suaves y pulso con la música."
   ],
   [
    "Grooves y fundamentos",
    "Bounce, rock y el paso base del estilo del día."
   ],
   [
    "Cross-training",
    "Un ejercicio de otro estilo que aporte al principal (ver Ruta waacking)."
   ],
   [
    "Drill técnico",
    "Un solo elemento repetido con variaciones (ver Estilos)."
   ],
   [
    "Combinación",
    "Frase de 8–16 counts aprendida en espejo, por partes."
   ],
   [
    "Cypher / freestyle",
    "En círculo: cada alumno entra 8 counts. Aplauso obligatorio."
   ],
   [
    "Enfriamiento y feedback",
    "Estiramiento y una cosa que salió bien y una a mejorar."
   ]
  ],
  "quiz_h": "Quiz de fundamentos",
  "quiz_lead": "Cinco preguntas al azar para que tus alumnos conecten pasos, pioneros y estilos.",
  "result": "Resultado",
  "qof": "Pregunta {i} de {n} · Aciertos {s}",
  "ok": "¡Correcto!",
  "no": "No exactamente. Era {name} ({origin}).",
  "next": "Siguiente",
  "see": "Ver resultado",
  "again": "Otra ronda",
  "r3": "Perfecto: listo para dar clase.",
  "r2": "Buen nivel. Repasa los estilos que fallaste en la pestaña Estilos.",
  "r1": "A repasar: la pestaña Estilos tiene todo lo que necesitas.",
  "qmove": "El paso “{m}” pertenece a…",
  "qpio": "Se asocia con: {p}. ¿Qué estilo es?",
  "qsuf": " ¿De qué estilo se trata?",
  "cam_h": "Autoevaluación con cámara",
  "cam_lead": "Mírate en vivo, compara con la metodología del estilo y califícate. La cámara solo se ve en tu pantalla: el video no se guarda ni se envía a ningún lado.",
  "cam_start": "Encender cámara",
  "cam_stop": "Apagar cámara",
  "cam_hint": "La cámara está apagada. Enciéndela para verte.",
  "cam_err": "No se pudo acceder a la cámara. Permite el acceso en el navegador o abre el enlace directamente en una pestaña.",
  "cam_mirror": "Espejo",
  "cam_grid": "Cuadrícula",
  "cam_delay": "Espejo con retraso",
  "cam_freeze": "Congelar",
  "cam_unfreeze": "Reanudar",
  "cam_sec": "{n} s",
  "ev_method": "Metodología en práctica",
  "ev_style": "Estilo",
  "ev_drill": "Ejercicio del estilo",
  "ev_wdrill": "Ejercicio para tu waacking",
  "ev_crit_h": "Autoevaluación (1–5)",
  "ev_crit": [
   "Va al ritmo (musicalidad)",
   "Control y limpieza",
   "Postura y alineación",
   "Actitud y expresión",
   "Uso del espacio"
  ],
  "ev_save": "Guardar evaluación",
  "ev_saved": "Evaluación guardada",
  "ev_log": "Historial",
  "ev_empty": "Aún no hay evaluaciones. Califícate después de cada ejercicio.",
  "ev_avg": "Promedio {n}",
  "wu_h": "Calentamiento: ejercicios",
  "wu_lead": "Siete ejercicios de un minuto cada uno, en orden. Pulsa Iniciar para el cronómetro de cada uno.",
  "wu_start": "Iniciar",
  "wu_stop": "Detener",
  "wu_done": "¡Listo!",
  "wu_novid": "Video próximamente",
  "wu": [
   [
    "Movilidad articular",
    "Cuello, hombros, codos, muñecas, cadera, rodillas y tobillos: 8 círculos lentos en cada uno, en ambos sentidos."
   ],
   [
    "Pulso y rebote",
    "Rebote suave en las rodillas al pulso de la música (90 BPM). Suelta los hombros y respira."
   ],
   [
    "Isolations de pecho y hombros",
    "Mueve solo el pecho (adelante, atrás, lados, círculo) y luego solo los hombros, 4 counts cada uno, sin mover la cadera."
   ],
   [
    "Círculos amplios de brazos",
    "Rotaciones grandes desde el hombro, primero lentas y luego a tempo. Codos altos y muñecas sueltas."
   ],
   [
    "Cadera y torso",
    "Círculos y ochos de cadera, 8 counts a cada lado. Rodillas blandas y torso relajado."
   ],
   [
    "Activación de piernas",
    "2 series de 10 sentadillas lentas y 10 elevaciones de talón. Espalda neutra y rodillas alineadas con los pies."
   ],
   [
    "Ondas de cuerpo",
    "Onda lenta de pies a cabeza y de cabeza a pies, 2 veces. Termina soltando todo el cuerpo."
   ]
  ],
  "an_h": "Análisis de movimiento",
  "an_lead": "Baila 30 segundos al pulso del metrónomo. La app mide tu movimiento en la cámara y sugiere una calificación. Es una estimación aproximada: no reconoce pasos ni poses concretas.",
  "an_start": "Iniciar análisis",
  "an_stop": "Detener y ver resultado",
  "an_metro": "Metrónomo con sonido",
  "an_run": "Analizando… baila al pulso ({s} s)",
  "an_sync": "Al ritmo",
  "an_sharp": "Nitidez",
  "an_pause": "Pausas",
  "an_space": "Espacio usado",
  "an_prof": "Perfil de movimiento (aproximado)",
  "an_apply": "Usar como sugerencia",
  "an_need": "Enciende la cámara primero.",
  "an_few": "Se detectó muy poco movimiento. Muévete más o acércate a la cámara.",
  "an_profiles": {
   "hits": "golpes y pausas marcadas (parecido a popping o locking)",
   "flow": "brazos amplios y continuos (parecido a waacking o voguing)",
   "hips": "cadera y torso bajo (parecido a twerking o dancehall)",
   "feet": "pies y desplazamiento (parecido a house, breaking o hip hop)"
  },
  "an_match": "Coincide con el estilo elegido: {name}.",
  "an_nomatch": "Se parece más a otro perfil que a {name}.",
  "wu_yt": "Buscar video en YouTube",
  "wu_ref": "Referencia animada (esquema)",
  "ent_h": "Entrenar con otros estilos",
  "ent_sub": "Combina tu otro estilo con Waacking: practica popping, hip hop, voguing y más para llevarlo a tu Waacking.",
  "tab_wu": "Calentamiento",
  "lang": "Idioma"
 },
 "en": {
  "tabs": [
   "Studio",
   "Styles",
   "Waacking path",
   "Warm-up",
   "Self-check",
   "Class plan",
   "Quiz"
  ],
  "studio_h": "8-count studio",
  "studio_lead": "Set the tempo, build 8-count phrases with moves from the chosen style and rehearse them with the metronome. Counts 1 and 5 are accented.",
  "ready": "Ready",
  "play": "▶ Play",
  "stop": "■ Stop",
  "tap": "Tap tempo",
  "sub": "Count the “&”s",
  "mute": "No sound",
  "style": "Style",
  "range": "Typical range {a}–{b} BPM",
  "phrase": "Phrase {n}",
  "addp": "+ Phrase",
  "delp": "− Remove last",
  "rand": "Surprise me",
  "clr": "Clear all",
  "bank": "{name} moves — tap a move to fill the selected count",
  "hold": "Empty (hold)",
  "note": "Example loaded: a 2-phrase popping combo. It saves itself in this browser.",
  "estilos_h": "Style map",
  "estilos_lead": "Origin, musical feel and a concrete drill for each style. BPM are typical ranges, not rules.",
  "origin": "Origin",
  "tempo": "Tempo",
  "sound": "Sound",
  "pioneers": "Pioneers",
  "gives_h": "What it adds to waacking",
  "drill_h": "Style drill",
  "use": "Rehearse in the Studio",
  "ruta_h": "Waacking path",
  "ruta_lead": "Pick what you want to improve and see which street dance styles help, with a drill designed to carry over to your waacking.",
  "week_h": "Your week",
  "week_lead": "Assign a style to each day. Each one shows its drill for waacking.",
  "rest": "Rest",
  "rest_note": "Rest day. Recovering is training too.",
  "wdrill_h": "Drill for your waacking",
  "skills": {
   "ctrl": "Muscle control",
   "agil": "Agility and footwork",
   "mus": "Musicality",
   "brazos": "Arms and poses",
   "pres": "Attitude and presence",
   "cardio": "Stamina",
   "cad": "Hips and torso"
  },
  "days": [
   "Monday",
   "Tuesday",
   "Wednesday",
   "Thursday",
   "Friday",
   "Saturday"
  ],
  "clase_h": "Class plan",
  "clase_lead": "Adjust the minutes of each block and see when each part ends. A starting point for 75-minute classes.",
  "starts": "Starts",
  "total": "Total",
  "ends": "Ends",
  "min": "{n} min",
  "less": "5 fewer minutes for {b}",
  "more": "5 more minutes for {b}",
  "blocks": [
   [
    "Warm-up",
    "Mobility, gentle isolations and feeling the pulse of the music."
   ],
   [
    "Grooves and foundations",
    "Bounce, rock and the base step of the day’s style."
   ],
   [
    "Cross-training",
    "One drill from another style that helps the main one (see Waacking path)."
   ],
   [
    "Technical drill",
    "A single element repeated with variations (see Styles)."
   ],
   [
    "Combo",
    "An 8–16 count phrase learned in mirror, in parts."
   ],
   [
    "Cypher / freestyle",
    "In a circle: each student enters for 8 counts. Applause is mandatory."
   ],
   [
    "Cool-down and feedback",
    "Stretching, one thing that went well and one to improve."
   ]
  ],
  "quiz_h": "Foundations quiz",
  "quiz_lead": "Five random questions so your students connect moves, pioneers and styles.",
  "result": "Result",
  "qof": "Question {i} of {n} · Correct {s}",
  "ok": "Correct!",
  "no": "Not quite. It was {name} ({origin}).",
  "next": "Next",
  "see": "See result",
  "again": "Another round",
  "r3": "Perfect: ready to teach.",
  "r2": "Good level. Review the styles you missed in the Styles tab.",
  "r1": "Time to review: the Styles tab has everything you need.",
  "qmove": "The move “{m}” belongs to…",
  "qpio": "Associated with: {p}. Which style is it?",
  "qsuf": " Which style is it?",
  "cam_h": "Camera self-check",
  "cam_lead": "Watch yourself live, compare with the style’s methodology and rate yourself. The camera only shows on your screen: the video is never saved or sent anywhere.",
  "cam_start": "Turn camera on",
  "cam_stop": "Turn camera off",
  "cam_hint": "The camera is off. Turn it on to see yourself.",
  "cam_err": "Could not access the camera. Allow access in your browser or open the link directly in a tab.",
  "cam_mirror": "Mirror",
  "cam_grid": "Grid",
  "cam_delay": "Delayed mirror",
  "cam_freeze": "Freeze",
  "cam_unfreeze": "Resume",
  "cam_sec": "{n} s",
  "ev_method": "Methodology in practice",
  "ev_style": "Style",
  "ev_drill": "Style drill",
  "ev_wdrill": "Drill for your waacking",
  "ev_crit_h": "Self-rating (1–5)",
  "ev_crit": [
   "On the beat (musicality)",
   "Control and cleanliness",
   "Posture and alignment",
   "Attitude and expression",
   "Use of space"
  ],
  "ev_save": "Save rating",
  "ev_saved": "Rating saved",
  "ev_log": "History",
  "ev_empty": "No ratings yet. Rate yourself after each drill.",
  "ev_avg": "Average {n}",
  "wu_h": "Warm-up: exercises",
  "wu_lead": "Seven one-minute exercises, in order. Press Start for each one’s timer.",
  "wu_start": "Start",
  "wu_stop": "Stop",
  "wu_done": "Done!",
  "wu_novid": "Video coming soon",
  "wu": [
   [
    "Joint mobility",
    "Neck, shoulders, elbows, wrists, hips, knees and ankles: 8 slow circles each, in both directions."
   ],
   [
    "Pulse and bounce",
    "Soft bounce in the knees to the pulse of the music (90 BPM). Loosen the shoulders and breathe."
   ],
   [
    "Chest and shoulder isolations",
    "Move only the chest (forward, back, sides, circle), then only the shoulders, 4 counts each, without moving the hips."
   ],
   [
    "Big arm circles",
    "Large rotations from the shoulder, first slow and then on tempo. High elbows and loose wrists."
   ],
   [
    "Hips and torso",
    "Hip circles and figure-eights, 8 counts each side. Soft knees and a relaxed torso."
   ],
   [
    "Leg activation",
    "2 sets of 10 slow squats and 10 heel raises. Neutral back and knees aligned with the feet."
   ],
   [
    "Body waves",
    "Slow wave from feet to head and head to feet, twice. Finish by shaking out the whole body."
   ]
  ],
  "an_h": "Motion analysis",
  "an_lead": "Dance for 30 seconds to the metronome pulse. The app measures your movement on camera and suggests a rating. It is a rough estimate: it does not recognize specific steps or poses.",
  "an_start": "Start analysis",
  "an_stop": "Stop and see result",
  "an_metro": "Metronome sound",
  "an_run": "Analyzing… dance to the pulse ({s} s)",
  "an_sync": "On the beat",
  "an_sharp": "Sharpness",
  "an_pause": "Pauses",
  "an_space": "Space used",
  "an_prof": "Movement profile (approximate)",
  "an_apply": "Use as suggestion",
  "an_need": "Turn the camera on first.",
  "an_few": "Very little movement detected. Move more or get closer to the camera.",
  "an_profiles": {
   "hits": "marked hits and pauses (similar to popping or locking)",
   "flow": "wide, continuous arms (similar to waacking or voguing)",
   "hips": "hips and low torso (similar to twerking or dancehall)",
   "feet": "feet and travel (similar to house, breaking or hip hop)"
  },
  "an_match": "Matches the chosen style: {name}.",
  "an_nomatch": "It looks more like another profile than {name}.",
  "wu_yt": "Find a video on YouTube",
  "wu_ref": "Animated reference (schematic)",
  "ent_h": "Train with other styles",
  "ent_sub": "Combine your other style with Waacking: practice popping, hip hop, voguing and more, and bring it into your Waacking.",
  "tab_wu": "Warm-up",
  "lang": "Language"
 },
 "fr": {
  "tabs": [
   "Studio",
   "Styles",
   "Parcours waacking",
   "Échauffement",
   "Auto-évaluation",
   "Plan de cours",
   "Quiz"
  ],
  "studio_h": "Studio en 8 temps",
  "studio_lead": "Fixe le tempo, construis des phrases de 8 temps avec les mouvements du style choisi et répète-les avec le métronome. Les temps 1 et 5 sont accentués.",
  "ready": "Prêt",
  "play": "▶ Lecture",
  "stop": "■ Arrêter",
  "tap": "Tap tempo",
  "sub": "Compter les « & »",
  "mute": "Sans son",
  "style": "Style",
  "range": "Plage typique {a}–{b} BPM",
  "phrase": "Phrase {n}",
  "addp": "+ Phrase",
  "delp": "− Retirer la dernière",
  "rand": "Surprends-moi",
  "clr": "Tout effacer",
  "bank": "Mouvements de {name} — touche un mouvement pour remplir le temps sélectionné",
  "hold": "Vide (tenir)",
  "note": "Exemple chargé : un enchaînement de popping en 2 phrases. Il se sauvegarde dans ce navigateur.",
  "estilos_h": "Carte des styles",
  "estilos_lead": "Origine, sensation musicale et un exercice concret pour chaque style. Les BPM sont des plages typiques, pas des règles.",
  "origin": "Origine",
  "tempo": "Tempo",
  "sound": "Son",
  "pioneers": "Pionniers",
  "gives_h": "Apport au waacking",
  "drill_h": "Exercice du style",
  "use": "Répéter dans le Studio",
  "ruta_h": "Parcours waacking",
  "ruta_lead": "Choisis ce que tu veux améliorer et vois quels styles de street dance t’aident, avec un exercice à transposer dans ton waacking.",
  "week_h": "Ta semaine",
  "week_lead": "Attribue un style à chaque jour. Chacun affiche son exercice pour le waacking.",
  "rest": "Repos",
  "rest_note": "Jour de repos. Récupérer, c’est aussi s’entraîner.",
  "wdrill_h": "Exercice pour ton waacking",
  "skills": {
   "ctrl": "Contrôle musculaire",
   "agil": "Agilité et appuis",
   "mus": "Musicalité",
   "brazos": "Bras et poses",
   "pres": "Attitude et présence",
   "cardio": "Endurance",
   "cad": "Hanches et buste"
  },
  "days": [
   "Lundi",
   "Mardi",
   "Mercredi",
   "Jeudi",
   "Vendredi",
   "Samedi"
  ],
  "clase_h": "Plan de cours",
  "clase_lead": "Ajuste les minutes de chaque bloc et vois à quelle heure chaque partie se termine. Une base pour des cours de 75 minutes.",
  "starts": "Début",
  "total": "Total",
  "ends": "Fin",
  "min": "{n} min",
  "less": "5 minutes de moins pour {b}",
  "more": "5 minutes de plus pour {b}",
  "blocks": [
   [
    "Échauffement",
    "Mobilité, isolations douces et pulsation avec la musique."
   ],
   [
    "Grooves et fondamentaux",
    "Bounce, rock et le pas de base du style du jour."
   ],
   [
    "Cross-training",
    "Un exercice d’un autre style qui aide le style principal (voir Parcours waacking)."
   ],
   [
    "Drill technique",
    "Un seul élément répété avec des variations (voir Styles)."
   ],
   [
    "Enchaînement",
    "Phrase de 8–16 temps apprise en miroir, par parties."
   ],
   [
    "Cypher / freestyle",
    "En cercle : chaque élève entre pour 8 temps. Applaudissements obligatoires."
   ],
   [
    "Retour au calme et feedback",
    "Étirements, une chose réussie et une à améliorer."
   ]
  ],
  "quiz_h": "Quiz des fondamentaux",
  "quiz_lead": "Cinq questions au hasard pour que tes élèves relient mouvements, pionniers et styles.",
  "result": "Résultat",
  "qof": "Question {i} sur {n} · Bonnes réponses {s}",
  "ok": "Correct !",
  "no": "Pas tout à fait. C’était {name} ({origin}).",
  "next": "Suivante",
  "see": "Voir le résultat",
  "again": "Une autre manche",
  "r3": "Parfait : prêt à enseigner.",
  "r2": "Bon niveau. Révise les styles ratés dans l’onglet Styles.",
  "r1": "À réviser : l’onglet Styles a tout ce qu’il faut.",
  "qmove": "Le mouvement « {m} » appartient à…",
  "qpio": "Associé à : {p}. De quel style s’agit-il ?",
  "qsuf": " De quel style s’agit-il ?",
  "cam_h": "Auto-évaluation par caméra",
  "cam_lead": "Regarde-toi en direct, compare avec la méthodologie du style et note-toi. La caméra n’apparaît que sur ton écran : la vidéo n’est ni enregistrée ni envoyée.",
  "cam_start": "Activer la caméra",
  "cam_stop": "Éteindre la caméra",
  "cam_hint": "La caméra est éteinte. Active-la pour te voir.",
  "cam_err": "Impossible d’accéder à la caméra. Autorise l’accès dans le navigateur ou ouvre le lien directement dans un onglet.",
  "cam_mirror": "Miroir",
  "cam_grid": "Grille",
  "cam_delay": "Miroir différé",
  "cam_freeze": "Figer",
  "cam_unfreeze": "Reprendre",
  "cam_sec": "{n} s",
  "ev_method": "Méthodologie en pratique",
  "ev_style": "Style",
  "ev_drill": "Exercice du style",
  "ev_wdrill": "Exercice pour ton waacking",
  "ev_crit_h": "Auto-évaluation (1–5)",
  "ev_crit": [
   "Sur le rythme (musicalité)",
   "Contrôle et propreté",
   "Posture et alignement",
   "Attitude et expression",
   "Utilisation de l’espace"
  ],
  "ev_save": "Enregistrer la note",
  "ev_saved": "Note enregistrée",
  "ev_log": "Historique",
  "ev_empty": "Aucune évaluation pour l’instant. Note-toi après chaque exercice.",
  "ev_avg": "Moyenne {n}",
  "wu_h": "Échauffement : exercices",
  "wu_lead": "Sept exercices d’une minute chacun, dans l’ordre. Appuie sur Démarrer pour le minuteur de chacun.",
  "wu_start": "Démarrer",
  "wu_stop": "Arrêter",
  "wu_done": "Terminé !",
  "wu_novid": "Vidéo bientôt disponible",
  "wu": [
   [
    "Mobilité articulaire",
    "Cou, épaules, coudes, poignets, hanches, genoux et chevilles : 8 cercles lents chacun, dans les deux sens."
   ],
   [
    "Pulsation et rebond",
    "Rebond doux dans les genoux sur le pouls de la musique (90 BPM). Relâche les épaules et respire."
   ],
   [
    "Isolations poitrine et épaules",
    "Bouge seulement la poitrine (avant, arrière, côtés, cercle), puis seulement les épaules, 4 temps chacun, sans bouger les hanches."
   ],
   [
    "Grands cercles de bras",
    "Grandes rotations depuis l’épaule, d’abord lentes puis en tempo. Coudes hauts et poignets souples."
   ],
   [
    "Hanches et buste",
    "Cercles et huit de hanches, 8 temps de chaque côté. Genoux souples et buste détendu."
   ],
   [
    "Activation des jambes",
    "2 séries de 10 squats lents et 10 montées sur les talons. Dos neutre, genoux alignés avec les pieds."
   ],
   [
    "Vagues du corps",
    "Vague lente des pieds à la tête et de la tête aux pieds, 2 fois. Termine en relâchant tout le corps."
   ]
  ],
  "an_h": "Analyse du mouvement",
  "an_lead": "Danse 30 secondes sur le pouls du métronome. L’app mesure ton mouvement à la caméra et suggère une note. C’est une estimation approximative : elle ne reconnaît pas de pas ni de poses précis.",
  "an_start": "Lancer l’analyse",
  "an_stop": "Arrêter et voir le résultat",
  "an_metro": "Métronome sonore",
  "an_run": "Analyse… danse sur le pouls ({s} s)",
  "an_sync": "Sur le rythme",
  "an_sharp": "Netteté",
  "an_pause": "Pauses",
  "an_space": "Espace utilisé",
  "an_prof": "Profil de mouvement (approximatif)",
  "an_apply": "Utiliser comme suggestion",
  "an_need": "Active d’abord la caméra.",
  "an_few": "Très peu de mouvement détecté. Bouge davantage ou rapproche-toi de la caméra.",
  "an_profiles": {
   "hits": "hits et pauses marqués (proche du popping ou du locking)",
   "flow": "bras amples et continus (proche du waacking ou du voguing)",
   "hips": "hanches et bas du buste (proche du twerking ou du dancehall)",
   "feet": "pieds et déplacement (proche de la house, du breaking ou du hip hop)"
  },
  "an_match": "Correspond au style choisi : {name}.",
  "an_nomatch": "Ressemble plus à un autre profil qu’à {name}.",
  "wu_yt": "Chercher une vidéo sur YouTube",
  "wu_ref": "Référence animée (schéma)",
  "ent_h": "S’entraîner avec d’autres styles",
  "ent_sub": "Combine ton autre style avec le waacking : pratique popping, hip hop, voguing et plus, puis apporte-le à ton waacking.",
  "tab_wu": "Échauffement",
  "lang": "Langue"
 },
 "ko": {
  "tabs": [
   "스튜디오",
   "스타일",
   "웨이킹 로드맵",
   "워밍업",
   "셀프 체크",
   "수업 계획",
   "퀴즈"
  ],
  "studio_h": "8카운트 스튜디오",
  "studio_lead": "템포를 정하고, 선택한 스타일의 동작으로 8카운트 프레이즈를 만들어 메트로놈에 맞춰 연습하세요. 1과 5카운트에 악센트가 있습니다.",
  "ready": "준비",
  "play": "▶ 재생",
  "stop": "■ 정지",
  "tap": "탭 템포",
  "sub": "“&” 세기",
  "mute": "소리 끄기",
  "style": "스타일",
  "range": "일반적인 범위 {a}–{b} BPM",
  "phrase": "프레이즈 {n}",
  "addp": "+ 프레이즈",
  "delp": "− 마지막 삭제",
  "rand": "랜덤 생성",
  "clr": "모두 지우기",
  "bank": "{name} 동작 — 동작을 눌러 선택한 카운트를 채우세요",
  "hold": "비우기(유지)",
  "note": "예시 불러옴: 2프레이즈 팝핑 콤보. 이 브라우저에 자동 저장됩니다.",
  "estilos_h": "스타일 지도",
  "estilos_lead": "각 스타일의 기원, 음악적 느낌, 구체적인 연습법. BPM은 일반적인 범위이며 규칙이 아닙니다.",
  "origin": "기원",
  "tempo": "템포",
  "sound": "사운드",
  "pioneers": "선구자",
  "gives_h": "웨이킹에 주는 도움",
  "drill_h": "스타일 연습법",
  "use": "스튜디오에서 연습",
  "ruta_h": "웨이킹 로드맵",
  "ruta_lead": "향상시키고 싶은 것을 고르면 도움이 되는 스트리트 댄스 스타일과 웨이킹에 적용할 연습법을 보여줍니다.",
  "week_h": "나의 한 주",
  "week_lead": "요일마다 스타일을 지정하세요. 각각 웨이킹을 위한 연습법이 표시됩니다.",
  "rest": "휴식",
  "rest_note": "휴식일. 회복도 훈련입니다.",
  "wdrill_h": "웨이킹을 위한 연습",
  "skills": {
   "ctrl": "근육 컨트롤",
   "agil": "민첩성과 발동작",
   "mus": "음악성",
   "brazos": "팔과 포즈",
   "pres": "태도와 존재감",
   "cardio": "지구력",
   "cad": "골반과 상체"
  },
  "days": [
   "월요일",
   "화요일",
   "수요일",
   "목요일",
   "금요일",
   "토요일"
  ],
  "clase_h": "수업 계획",
  "clase_lead": "각 블록의 시간을 조정하고 끝나는 시각을 확인하세요. 75분 수업의 기본 구성입니다.",
  "starts": "시작",
  "total": "합계",
  "ends": "종료",
  "min": "{n}분",
  "less": "{b} 5분 줄이기",
  "more": "{b} 5분 늘리기",
  "blocks": [
   [
    "워밍업",
    "가동성, 부드러운 아이솔레이션, 음악의 맥박 느끼기."
   ],
   [
    "그루브와 기본기",
    "바운스, 락, 그날 스타일의 기본 스텝."
   ],
   [
    "크로스 트레이닝",
    "주 스타일에 도움이 되는 다른 스타일의 연습(웨이킹 로드맵 참고)."
   ],
   [
    "테크닉 드릴",
    "하나의 요소를 변형하며 반복(스타일 참고)."
   ],
   [
    "콤비네이션",
    "거울로 8–16카운트 프레이즈를 나눠서 배우기."
   ],
   [
    "싸이퍼 / 프리스타일",
    "원으로 서서 각자 8카운트씩 들어갑니다. 박수는 필수."
   ],
   [
    "쿨다운과 피드백",
    "스트레칭, 잘한 점 하나와 개선할 점 하나."
   ]
  ],
  "quiz_h": "기초 퀴즈",
  "quiz_lead": "학생들이 동작, 선구자, 스타일을 연결하도록 무작위 5문제를 냅니다.",
  "result": "결과",
  "qof": "{n}문제 중 {i}번 · 정답 {s}",
  "ok": "정답!",
  "no": "아쉽네요. 정답은 {name} ({origin})입니다.",
  "next": "다음",
  "see": "결과 보기",
  "again": "다시 하기",
  "r3": "완벽해요: 바로 수업할 수 있어요.",
  "r2": "좋은 수준입니다. 스타일 탭에서 틀린 부분을 복습하세요.",
  "r1": "복습이 필요해요: 스타일 탭에 필요한 내용이 다 있습니다.",
  "qmove": "“{m}” 동작은 어느 스타일일까요?",
  "qpio": "관련 인물: {p}. 어떤 스타일일까요?",
  "qsuf": " 어떤 스타일일까요?",
  "cam_h": "카메라 셀프 체크",
  "cam_lead": "실시간으로 자신을 보고, 스타일의 방법론과 비교하며 스스로 평가하세요. 카메라는 내 화면에만 보이며 영상은 저장되거나 전송되지 않습니다.",
  "cam_start": "카메라 켜기",
  "cam_stop": "카메라 끄기",
  "cam_hint": "카메라가 꺼져 있습니다. 켜서 자신을 확인하세요.",
  "cam_err": "카메라에 접근할 수 없습니다. 브라우저에서 접근을 허용하거나 링크를 새 탭에서 직접 여세요.",
  "cam_mirror": "거울",
  "cam_grid": "격자",
  "cam_delay": "지연 거울",
  "cam_freeze": "정지",
  "cam_unfreeze": "재개",
  "cam_sec": "{n}초",
  "ev_method": "실습 중인 방법론",
  "ev_style": "스타일",
  "ev_drill": "스타일 연습법",
  "ev_wdrill": "웨이킹을 위한 연습",
  "ev_crit_h": "자기 평가 (1–5)",
  "ev_crit": [
   "리듬에 맞음(음악성)",
   "컨트롤과 깔끔함",
   "자세와 정렬",
   "태도와 표현",
   "공간 활용"
  ],
  "ev_save": "평가 저장",
  "ev_saved": "평가가 저장되었습니다",
  "ev_log": "기록",
  "ev_empty": "아직 평가가 없습니다. 연습 후마다 스스로 평가해 보세요.",
  "ev_avg": "평균 {n}",
  "wu_h": "워밍업: 운동 목록",
  "wu_lead": "각 1분씩 7가지 운동을 순서대로. 각 운동의 타이머는 시작을 누르세요.",
  "wu_start": "시작",
  "wu_stop": "정지",
  "wu_done": "완료!",
  "wu_novid": "영상 준비 중",
  "wu": [
   [
    "관절 가동성",
    "목, 어깨, 팔꿈치, 손목, 골반, 무릎, 발목: 각각 양방향으로 천천히 8번 돌리기."
   ],
   [
    "펄스와 바운스",
    "음악의 맥박(90BPM)에 맞춰 무릎으로 부드럽게 바운스. 어깨를 풀고 호흡하세요."
   ],
   [
    "가슴과 어깨 아이솔레이션",
    "가슴만(앞, 뒤, 옆, 원) 움직이고 그다음 어깨만, 각각 4카운트, 골반은 고정."
   ],
   [
    "큰 팔 회전",
    "어깨에서 크게 회전, 처음엔 천천히 그다음 템포에 맞춰. 팔꿈치는 높게, 손목은 부드럽게."
   ],
   [
    "골반과 상체",
    "골반 원과 8자, 좌우 각 8카운트. 무릎은 부드럽게, 상체는 편안하게."
   ],
   [
    "다리 활성화",
    "천천히 스쿼트 10회 2세트와 뒤꿈치 들기 10회. 등은 중립, 무릎은 발과 일직선."
   ],
   [
    "바디 웨이브",
    "발에서 머리로, 머리에서 발로 천천히 웨이브를 2번. 마지막은 온몸을 털어내며 마무리."
   ]
  ],
  "an_h": "움직임 분석",
  "an_lead": "메트로놈 박자에 맞춰 30초 춤추세요. 앱이 카메라로 움직임을 측정해 점수를 제안합니다. 대략적인 추정이며 특정 스텝이나 포즈를 인식하지는 않습니다.",
  "an_start": "분석 시작",
  "an_stop": "중지하고 결과 보기",
  "an_metro": "메트로놈 소리",
  "an_run": "분석 중… 박자에 맞춰 춤추세요 ({s}초)",
  "an_sync": "박자 일치",
  "an_sharp": "선명도",
  "an_pause": "멈춤",
  "an_space": "사용한 공간",
  "an_prof": "움직임 프로필(대략)",
  "an_apply": "제안으로 사용",
  "an_need": "먼저 카메라를 켜세요.",
  "an_few": "움직임이 거의 감지되지 않았습니다. 더 움직이거나 카메라에 가까이 오세요.",
  "an_profiles": {
   "hits": "뚜렷한 히트와 멈춤(팝핑·락킹과 비슷)",
   "flow": "넓고 이어지는 팔(웨이킹·보깅과 비슷)",
   "hips": "골반과 하체 중심의 상체(트월킹·댄스홀과 비슷)",
   "feet": "발과 이동(하우스·브레이킹·힙합과 비슷)"
  },
  "an_match": "선택한 스타일과 일치: {name}.",
  "an_nomatch": "{name}보다 다른 프로필에 더 가깝습니다.",
  "wu_yt": "YouTube에서 영상 찾기",
  "wu_ref": "애니메이션 참고(도식)",
  "ent_h": "다른 스타일로 트레이닝",
  "ent_sub": "다른 스타일을 웨이킹과 결합하세요. 팝핑, 힙합, 보깅 등을 연습해 웨이킹에 적용합니다.",
  "tab_wu": "워밍업",
  "lang": "언어"
 },
 "zh": {
  "tabs": [
   "工作室",
   "舞种",
   "Waacking 路线",
   "热身",
   "自我评估",
   "课程计划",
   "测验"
  ],
  "studio_h": "八拍工作室",
  "studio_lead": "设定速度，用所选舞种的动作组合八拍乐句，并跟着节拍器练习。第 1 拍和第 5 拍有重音。",
  "ready": "就绪",
  "play": "▶ 播放",
  "stop": "■ 停止",
  "tap": "点击测速",
  "sub": "数“&”拍",
  "mute": "静音",
  "style": "舞种",
  "range": "常见范围 {a}–{b} BPM",
  "phrase": "乐句 {n}",
  "addp": "+ 乐句",
  "delp": "− 删除最后一个",
  "rand": "随机生成",
  "clr": "全部清空",
  "bank": "{name} 动作 — 点击动作填入所选拍子",
  "hold": "空（保持）",
  "note": "已载入示例：两个乐句的 Popping 组合。会自动保存在此浏览器中。",
  "estilos_h": "舞种地图",
  "estilos_lead": "每个舞种的起源、音乐感觉和具体练习。BPM 为常见范围，并非规则。",
  "origin": "起源",
  "tempo": "速度",
  "sound": "音乐",
  "pioneers": "先驱",
  "gives_h": "对 Waacking 的帮助",
  "drill_h": "舞种练习",
  "use": "去工作室练习",
  "ruta_h": "Waacking 路线",
  "ruta_lead": "选择你想提升的方面，查看哪些街舞舞种有帮助，以及可以带回 Waacking 的练习。",
  "week_h": "你的一周",
  "week_lead": "为每天安排一个舞种。每个舞种都会显示对 Waacking 的练习。",
  "rest": "休息",
  "rest_note": "休息日。恢复也是训练。",
  "wdrill_h": "Waacking 练习",
  "skills": {
   "ctrl": "肌肉控制",
   "agil": "敏捷与步伐",
   "mus": "音乐性",
   "brazos": "手臂与造型",
   "pres": "气场与表现力",
   "cardio": "耐力",
   "cad": "胯部与躯干"
  },
  "days": [
   "星期一",
   "星期二",
   "星期三",
   "星期四",
   "星期五",
   "星期六"
  ],
  "clase_h": "课程计划",
  "clase_lead": "调整每个环节的分钟数，查看每部分几点结束。适合 75 分钟课程的起点。",
  "starts": "开始",
  "total": "总计",
  "ends": "结束",
  "min": "{n} 分钟",
  "less": "{b} 减少 5 分钟",
  "more": "{b} 增加 5 分钟",
  "blocks": [
   [
    "热身",
    "活动度、轻柔的分离练习、感受音乐律动。"
   ],
   [
    "律动与基础",
    "Bounce、Rock 和当天舞种的基础步伐。"
   ],
   [
    "交叉训练",
    "来自其他舞种、对主舞种有帮助的练习（见 Waacking 路线）。"
   ],
   [
    "技术练习",
    "把一个元素加上变化反复练习（见舞种）。"
   ],
   [
    "组合",
    "对着镜子分段学习 8–16 拍的乐句。"
   ],
   [
    "Cypher / 自由舞",
    "围成圆圈：每位学员进入 8 拍。必须鼓掌。"
   ],
   [
    "放松与反馈",
    "拉伸，说一件做得好的和一件需要改进的。"
   ]
  ],
  "quiz_h": "基础测验",
  "quiz_lead": "随机五道题，帮助学员把动作、先驱和舞种联系起来。",
  "result": "结果",
  "qof": "第 {i} 题 / 共 {n} 题 · 答对 {s}",
  "ok": "正确！",
  "no": "不太对。答案是 {name}（{origin}）。",
  "next": "下一题",
  "see": "查看结果",
  "again": "再来一轮",
  "r3": "满分：可以去上课了。",
  "r2": "水平不错。请到“舞种”标签复习答错的部分。",
  "r1": "需要复习：“舞种”标签里有你需要的一切。",
  "qmove": "动作“{m}”属于……",
  "qpio": "相关人物：{p}。这是哪个舞种？",
  "qsuf": " 这是哪个舞种？",
  "cam_h": "摄像头自我评估",
  "cam_lead": "实时观看自己，对照舞种的方法并给自己打分。摄像头画面只显示在你的屏幕上：视频不会被保存，也不会发送到任何地方。",
  "cam_start": "开启摄像头",
  "cam_stop": "关闭摄像头",
  "cam_hint": "摄像头已关闭。开启后即可看到自己。",
  "cam_err": "无法访问摄像头。请在浏览器中允许访问，或在新标签页中直接打开链接。",
  "cam_mirror": "镜像",
  "cam_grid": "网格",
  "cam_delay": "延时镜子",
  "cam_freeze": "定格",
  "cam_unfreeze": "继续",
  "cam_sec": "{n} 秒",
  "ev_method": "正在练习的方法",
  "ev_style": "舞种",
  "ev_drill": "舞种练习",
  "ev_wdrill": "Waacking 练习",
  "ev_crit_h": "自评（1–5）",
  "ev_crit": [
   "踩准节拍（音乐性）",
   "控制与干净度",
   "姿态与对齐",
   "态度与表现力",
   "空间运用"
  ],
  "ev_save": "保存评分",
  "ev_saved": "评分已保存",
  "ev_log": "历史记录",
  "ev_empty": "还没有评分。每次练习后给自己打分吧。",
  "ev_avg": "平均 {n}",
  "wu_h": "热身：练习清单",
  "wu_lead": "七个练习，每个一分钟，按顺序进行。点击开始使用每个练习的计时器。",
  "wu_start": "开始",
  "wu_stop": "停止",
  "wu_done": "完成！",
  "wu_novid": "视频即将上线",
  "wu": [
   [
    "关节活动",
    "颈部、肩、肘、腕、胯、膝和踝：每处朝两个方向各缓慢转 8 圈。"
   ],
   [
    "律动与弹动",
    "膝盖随音乐律动（90 BPM）轻轻弹动。放松肩膀，保持呼吸。"
   ],
   [
    "胸与肩的分离练习",
    "只动胸（前、后、两侧、画圈），再只动肩，各 4 拍，胯部不动。"
   ],
   [
    "大幅手臂画圈",
    "从肩部做大幅旋转，先慢后跟上节拍。手肘抬高，手腕放松。"
   ],
   [
    "胯部与躯干",
    "胯部画圈和“8”字，每侧 8 拍。膝盖放松，躯干放松。"
   ],
   [
    "腿部激活",
    "缓慢深蹲 10 次做 2 组，再提踵 10 次。背部中立，膝盖与脚尖对齐。"
   ],
   [
    "身体波浪",
    "从脚到头、再从头到脚做缓慢的波浪，各 2 次。最后抖松全身。"
   ]
  ],
  "an_h": "动作分析",
  "an_lead": "跟着节拍器的节奏跳 30 秒。应用会通过摄像头测量你的动作并给出评分建议。这只是粗略估计，无法识别具体的舞步或造型。",
  "an_start": "开始分析",
  "an_stop": "停止并查看结果",
  "an_metro": "节拍器声音",
  "an_run": "分析中……请跟着节拍跳（{s} 秒）",
  "an_sync": "踩准节拍",
  "an_sharp": "干脆度",
  "an_pause": "停顿",
  "an_space": "使用空间",
  "an_prof": "动作特征（大致）",
  "an_apply": "作为建议使用",
  "an_need": "请先开启摄像头。",
  "an_few": "检测到的动作很少。请多动一些或靠近摄像头。",
  "an_profiles": {
   "hits": "明显的发力与停顿（类似 Popping 或 Locking）",
   "flow": "幅度大且连续的手臂（类似 Waacking 或 Voguing）",
   "hips": "胯部与下半身躯干（类似 Twerking 或 Dancehall）",
   "feet": "脚步与位移（类似 House、Breaking 或 Hip hop）"
  },
  "an_match": "与所选舞种相符：{name}。",
  "an_nomatch": "比起 {name}，更像另一种类型。",
  "wu_yt": "在 YouTube 上找视频",
  "wu_ref": "动画参考（示意）",
  "ent_h": "用其他舞种训练",
  "ent_sub": "把你的其他舞种与 Waacking 结合：练习 Popping、Hip hop、Voguing 等，再带入你的 Waacking。",
  "tab_wu": "热身",
  "lang": "语言"
 },
 "ja": {
  "tabs": [
   "スタジオ",
   "スタイル",
   "ワッキング・ロードマップ",
   "ウォームアップ",
   "セルフチェック",
   "レッスン計画",
   "クイズ"
  ],
  "studio_h": "8カウント・スタジオ",
  "studio_lead": "テンポを決め、選んだスタイルの動きで8カウントのフレーズを作り、メトロノームに合わせて練習しましょう。1と5カウントにアクセントがあります。",
  "ready": "準備完了",
  "play": "▶ 再生",
  "stop": "■ 停止",
  "tap": "タップテンポ",
  "sub": "「&」を数える",
  "mute": "ミュート",
  "style": "スタイル",
  "range": "一般的な範囲 {a}–{b} BPM",
  "phrase": "フレーズ {n}",
  "addp": "+ フレーズ",
  "delp": "− 最後を削除",
  "rand": "ランダム",
  "clr": "すべてクリア",
  "bank": "{name} の動き — 動きをタップして選択中のカウントに入れます",
  "hold": "空（キープ）",
  "note": "サンプル読み込み済み：2フレーズのポッピング・コンボ。このブラウザに自動保存されます。",
  "estilos_h": "スタイルマップ",
  "estilos_lead": "各スタイルの起源、音楽的な感覚、具体的な練習。BPMは一般的な範囲で、ルールではありません。",
  "origin": "起源",
  "tempo": "テンポ",
  "sound": "サウンド",
  "pioneers": "パイオニア",
  "gives_h": "ワッキングへの効果",
  "drill_h": "スタイルの練習",
  "use": "スタジオで練習",
  "ruta_h": "ワッキング・ロードマップ",
  "ruta_lead": "上達したいことを選ぶと、役立つストリートダンスのスタイルと、ワッキングに活かせる練習が表示されます。",
  "week_h": "あなたの1週間",
  "week_lead": "曜日ごとにスタイルを割り当てます。それぞれワッキング向けの練習が表示されます。",
  "rest": "休み",
  "rest_note": "休息日。回復もトレーニングです。",
  "wdrill_h": "ワッキングのための練習",
  "skills": {
   "ctrl": "筋肉のコントロール",
   "agil": "敏捷性とフットワーク",
   "mus": "音楽性",
   "brazos": "腕とポーズ",
   "pres": "アティチュードと存在感",
   "cardio": "持久力",
   "cad": "腰と体幹"
  },
  "days": [
   "月曜日",
   "火曜日",
   "水曜日",
   "木曜日",
   "金曜日",
   "土曜日"
  ],
  "clase_h": "レッスン計画",
  "clase_lead": "各ブロックの分数を調整して、それぞれの終了時刻を確認しましょう。75分レッスンの出発点です。",
  "starts": "開始",
  "total": "合計",
  "ends": "終了",
  "min": "{n}分",
  "less": "{b}を5分減らす",
  "more": "{b}を5分増やす",
  "blocks": [
   [
    "ウォームアップ",
    "可動域、やさしいアイソレーション、音楽のパルスを感じる。"
   ],
   [
    "グルーヴと基礎",
    "バウンス、ロック、その日のスタイルの基本ステップ。"
   ],
   [
    "クロストレーニング",
    "メインのスタイルに役立つ他スタイルの練習（ワッキング・ロードマップ参照）。"
   ],
   [
    "テクニカルドリル",
    "ひとつの要素をバリエーションをつけて反復（スタイル参照）。"
   ],
   [
    "コンビネーション",
    "8–16カウントのフレーズを鏡で、分けて習得。"
   ],
   [
    "サイファー / フリースタイル",
    "円になって、各自8カウントずつ入る。拍手は必須。"
   ],
   [
    "クールダウンとフィードバック",
    "ストレッチ、良かった点をひとつ、改善点をひとつ。"
   ]
  ],
  "quiz_h": "基礎クイズ",
  "quiz_lead": "動き、パイオニア、スタイルを結びつけるためのランダム5問。",
  "result": "結果",
  "qof": "{n}問中 {i}問目 · 正解 {s}",
  "ok": "正解！",
  "no": "惜しい。正解は {name}（{origin}）です。",
  "next": "次へ",
  "see": "結果を見る",
  "again": "もう一度",
  "r3": "完璧：いつでもレッスンできます。",
  "r2": "良いレベルです。間違えたスタイルは「スタイル」タブで復習しましょう。",
  "r1": "復習しましょう：「スタイル」タブに必要なことがすべてあります。",
  "qmove": "「{m}」の動きはどのスタイル？",
  "qpio": "関連：{p}。どのスタイル？",
  "qsuf": " どのスタイルでしょう？",
  "cam_h": "カメラでセルフチェック",
  "cam_lead": "自分をライブで見て、スタイルのメソッドと比べ、自己評価しましょう。カメラ映像はあなたの画面にのみ表示され、保存も送信もされません。",
  "cam_start": "カメラをオン",
  "cam_stop": "カメラをオフ",
  "cam_hint": "カメラはオフです。オンにして自分を確認しましょう。",
  "cam_err": "カメラにアクセスできません。ブラウザで許可するか、リンクを新しいタブで直接開いてください。",
  "cam_mirror": "ミラー",
  "cam_grid": "グリッド",
  "cam_delay": "ディレイミラー",
  "cam_freeze": "静止",
  "cam_unfreeze": "再開",
  "cam_sec": "{n}秒",
  "ev_method": "練習中のメソッド",
  "ev_style": "スタイル",
  "ev_drill": "スタイルの練習",
  "ev_wdrill": "ワッキングのための練習",
  "ev_crit_h": "自己評価（1–5）",
  "ev_crit": [
   "ビートに乗れている（音楽性）",
   "コントロールとクリーンさ",
   "姿勢とアライメント",
   "アティチュードと表現",
   "スペースの使い方"
  ],
  "ev_save": "評価を保存",
  "ev_saved": "評価を保存しました",
  "ev_log": "履歴",
  "ev_empty": "まだ評価がありません。練習ごとに自己評価しましょう。",
  "ev_avg": "平均 {n}",
  "wu_h": "ウォームアップ：エクササイズ",
  "wu_lead": "各1分の7つのエクササイズを順番に。各エクササイズのタイマーは開始を押します。",
  "wu_start": "開始",
  "wu_stop": "停止",
  "wu_done": "完了！",
  "wu_novid": "動画は近日公開",
  "wu": [
   [
    "関節の可動域",
    "首、肩、肘、手首、腰、膝、足首：それぞれ両方向にゆっくり8回まわす。"
   ],
   [
    "パルスとバウンス",
    "音楽のパルス（90BPM）に合わせて膝で軽くバウンス。肩の力を抜いて呼吸。"
   ],
   [
    "胸と肩のアイソレーション",
    "胸だけ（前・後・横・円）、次に肩だけを各4カウント。腰は動かさない。"
   ],
   [
    "大きな腕の回転",
    "肩から大きく回す。最初はゆっくり、次にテンポに合わせて。肘は高く、手首は柔らかく。"
   ],
   [
    "腰と体幹",
    "腰の円と8の字を左右各8カウント。膝は柔らかく、体幹はリラックス。"
   ],
   [
    "脚の活性化",
    "ゆっくりスクワット10回を2セットとかかと上げ10回。背中はニュートラル、膝は足と同じ向き。"
   ],
   [
    "ボディウェーブ",
    "足から頭へ、頭から足へゆっくりウェーブを各2回。最後に全身を振ってほぐす。"
   ]
  ],
  "an_h": "動きの分析",
  "an_lead": "メトロノームのパルスに合わせて30秒踊ります。アプリがカメラで動きを測定し、評価を提案します。おおまかな推定で、特定のステップやポーズは認識しません。",
  "an_start": "分析を開始",
  "an_stop": "停止して結果を見る",
  "an_metro": "メトロノーム音",
  "an_run": "分析中…パルスに合わせて踊って（{s}秒）",
  "an_sync": "リズム合致",
  "an_sharp": "キレ",
  "an_pause": "間",
  "an_space": "使った空間",
  "an_prof": "動きのプロフィール（目安）",
  "an_apply": "提案として使う",
  "an_need": "先にカメラをオンにしてください。",
  "an_few": "ほとんど動きが検出されませんでした。もっと動くか、カメラに近づいてください。",
  "an_profiles": {
   "hits": "はっきりしたヒットと間（ポッピングやロッキングに近い）",
   "flow": "大きく続く腕の動き（ワッキングやヴォーギングに近い）",
   "hips": "腰と低い体幹（トワークやダンスホールに近い）",
   "feet": "足と移動（ハウス、ブレイキング、ヒップホップに近い）"
  },
  "an_match": "選んだスタイルと一致：{name}。",
  "an_nomatch": "{name}よりも別のプロフィールに近いです。",
  "wu_yt": "YouTubeで動画を探す",
  "wu_ref": "アニメーション参考（図式）",
  "ent_h": "他のスタイルでトレーニング",
  "ent_sub": "他のスタイルとワッキングを組み合わせる：ポッピング、ヒップホップ、ヴォーギングなどを練習してワッキングに活かします。",
  "tab_wu": "ウォームアップ",
  "lang": "言語"
 }
};

// Contenido de cada estilo traducido: [origen, sonido, pioneros, ejercicio, aporte al waacking, ejercicio para waacking, pista 1, pista 2]
export const DATA: Record<Exclude<Lang, 'es'>, Record<string, string[]>> = {
 "en": {
  "breaking": [
   "The Bronx, New York · 1970s",
   "Funk and soul breakbeats; the DJ extends the instrumental part.",
   "DJ Kool Herc, Crazy Legs, Rock Steady Crew",
   "Four rounds of 8 counts: toprock, drop, six-step, exit. Raise the tempo 5 BPM each round without losing your support foot.",
   "Strength, weight control and fast feet for transitions and drops.",
   "Toprock 8 counts + slow six-step; connect the drop to a final pose on the floor.",
   "Its core is footwork close to the floor and freezes.",
   "It was born around the instrumental breaks a Bronx DJ extended."
  ],
  "popping": [
   "Fresno, California · 1970s",
   "Funk with a hard snare; each hit is a contraction.",
   "Boogaloo Sam and the Electric Boogaloos",
   "One hit per count for 16 counts, then alternate strong and soft hits. Watch the mirror: the hit must be visible even with no big movement.",
   "Fine muscle control and body awareness: your poses and hits look sharper.",
   "Do your hit-poses with a real chest or bicep hit on counts 4 and 8: the pose lands with a hit, not drifting.",
   "It is based on quickly contracting and releasing muscles to “hit” the beat.",
   "Its most cited creator is Boogaloo Sam, from Fresno."
  ],
  "locking": [
   "Los Angeles · late 1960s",
   "Cheerful, theatrical funk with marked pauses.",
   "Don Campbell, The Lockers",
   "Lock on counts 4 and 8 of each phrase: speed up the arm, freeze for 1 second with a smile and release. Speed-pause contrast is everything.",
   "Speed-pause contrast and showmanship: it shares funk roots with waacking.",
   "4 counts of fast arm and a frozen lock on 4 and 8; then swap the lock for a waacking pose.",
   "Its signature move is a sudden pause where the body “locks”.",
   "Don Campbell invented it after forgetting a step while dancing."
  ],
  "waacking": [
   "Los Angeles clubs · 1970s",
   "Disco with strings and vocals; drama and attitude.",
   "Tinker Bell, Arthur Goff",
   "Arm rotations over 8 counts without bending the shoulder; end each phrase in a fashion-shoot pose.",
   "Your base style: arm rotations, poses and attitude over disco and funk.",
   "10 min of arm rotations at 122 BPM without dropping the elbow; end every 8 counts in a clean pose.",
   "Its arms circle widely from the shoulder, with movie-star poses.",
   "It was born in Los Angeles disco clubs of the LGBTQ+ community."
  ],
  "house": [
   "Chicago and New York · 1980s",
   "Constant four-on-the-floor kick; the feet lead.",
   "The clubs The Warehouse and Paradise Garage",
   "Continuous jack for 32 counts, then add one footwork step every 8. Keep the bounce in the knees, not the shoulders.",
   "Feet and flow in 4/4: continuous musicality and stamina for long sets.",
   "32 counts of jack and skate; add waacking arms on top without breaking the step.",
   "The constant 4-beat kick and fast footwork define this style.",
   "Its name comes from the clubs where electronic dance music was born."
  ],
  "hiphop": [
   "Streets and parties across the US · 1980s–90s",
   "Boom bap: a heavy groove and bass that invite you to bounce.",
   "Social dances passed from neighborhood to neighborhood",
   "Bounce and rock over 8 counts, shifting weight. Add one social step per phrase and finish with your own signature.",
   "Agility, groove and freedom: you move more freely between poses.",
   "Bounce at 92 BPM for 2 minutes and add a waacking turn every 8 counts without losing the bounce.",
   "It is anchored in the bounce and rock, with social steps like the Running Man.",
   "Its music is usually boom bap, with a heavy, slow groove."
  ],
  "krump": [
   "South Central, Los Angeles · 2000s",
   "Often felt in half time, with intense hits.",
   "Tight Eyez and Big Mijo",
   "Chest pop on each count 1 to 4, stomp on 5 and 6, release energy on 7-8. Breathe and prioritize control over force.",
   "Intensity, chest control and emotional expression.",
   "Chest pop on counts 1–4; swap the pop for a hit-pose on 5–8.",
   "A very expressive, emotional style with chest pops and stomps.",
   "It emerged as a positive alternative in South Central Los Angeles in the 2000s."
  ],
  "twerking": [
   "New Orleans (bounce) and West African roots · 1990s",
   "New Orleans bounce: heavy bass and repetitive rhythm.",
   "DJ Jubilee and Big Freedia",
   "Squat with hip isolation for 8 counts, rise to standing for 8 counts. Keep a neutral back and breathe; no lower-back pain.",
   "Hip mobility and isolation, plus leg and glute strength.",
   "2 min of hip isolations in a squat; add waacking arms with feet still.",
   "It was born in New Orleans’ bounce scene and relies on fast hip isolations.",
   "Big Freedia is one of the figures most associated with the bounce music that popularized it."
  ],
  "dancehall": [
   "Jamaica · 1980s",
   "Riddims with deep bass and syncopated rhythm.",
   "Gerald “Bogle” Levy and the Ravers Clavers",
   "Continuous whine for 16 counts, then change weight into a bogle. Soft knees and loose torso; the hips carry the rhythm.",
   "Low groove, fluid hips and party attitude.",
   "Whine and bogle at 95 BPM; hold the groove and add a waacking pose on each 4.",
   "It is the dance of Jamaican parties, with steps like the Bogle and the Dutty Wine.",
   "Its music is built on riddims with deep bass, born in Jamaica."
  ],
  "voguing": [
   "Harlem ballroom, New York · 1960s–80s",
   "Ballroom beats with vocals and marked percussion.",
   "Paris Dupree, Willi Ninja, Pepper LaBeija",
   "16 counts of hand performance with precise wrists and fingers, and a clean pose (“click”) every 8 counts. Think of a magazine spread.",
   "The best complement: hand performance, clean poses and runway-attitude catwalk.",
   "16 counts of hand performance with precise wrists and fingers; then blend it with your arm rotations.",
   "It is organized in ballroom categories, with hand performance, catwalk and duckwalk.",
   "It was born in Harlem ballroom; Willi Ninja was one of its best-known figures."
  ],
  "techno": [
   "European clubs · 2000s (Tecktonik and shuffle)",
   "Very fast electro and techno; arms and feet never stop.",
   "Club scenes such as Metropolis (Paris)",
   "Arm flow for 4 minutes at 130 BPM without dropping tempo; alternate big and small arms. Watch shoulders and wrists.",
   "Speed and arm stamina: cardio and fast rhythm.",
   "Arm flow 4 min at 130 BPM without dropping tempo; turn the flow into wide rotations.",
   "It is a club dance to very fast electronic music, with quick arms and shuffle.",
   "Its best-known version, Tecktonik, emerged in Paris clubs."
  ],
  "flexing": [
   "Flatbush, Brooklyn · 2000s",
   "A mix of dancehall, reggae and hip hop; control and storytelling.",
   "Reggie “Regg Roc” Gray and Storyboard P",
   "Slow arm glide for 8 counts, then an elbow snap. Look for clean lines before speed.",
   "Extreme arm control and fluidity: isolations that look impossible.",
   "Slow arm glide 8 counts and an elbow snap; fit the glide inside a rotation.",
   "It combines bone-breaking, snaps and glides with theatrical storytelling.",
   "It was born in Brooklyn and is identified with the FlexN scene."
  ],
  "afrohouse": [
   "South Africa, Angola and diaspora · 2000s onward",
   "House with African percussion and deep bass.",
   "Scenes of Johannesburg and Luanda",
   "Weight shift on three supports with knee bounce, add a chest wave. Keep a heavy floor and a free torso.",
   "Weight groove, polyrhythm and torso fluidity.",
   "Weight shift on three supports; add a chest wave and finish with a pose.",
   "It combines house bounce with African percussion and strong footwork.",
   "It is danced with heavy weight in the floor and a fluid torso, with a strong presence from South Africa and Angola."
  ]
 },
 "fr": {
  "breaking": [
   "Le Bronx, New York · années 70",
   "Breakbeats funk et soul ; le DJ prolonge la partie instrumentale.",
   "DJ Kool Herc, Crazy Legs, Rock Steady Crew",
   "Quatre tours de 8 temps : toprock, descente, six-step, sortie. Monte le tempo de 5 BPM à chaque tour sans perdre ton pied d’appui.",
   "Force, contrôle du poids et pieds rapides pour les transitions et les descentes.",
   "Toprock 8 temps + six-step lent ; relie la descente à une pose finale au sol.",
   "Son cœur est le footwork près du sol et les freezes.",
   "Il est né autour des breaks instrumentaux prolongés par un DJ du Bronx."
  ],
  "popping": [
   "Fresno, Californie · années 70",
   "Funk avec caisse claire marquée ; chaque hit est une contraction.",
   "Boogaloo Sam et les Electric Boogaloos",
   "Un hit par temps pendant 16 temps, puis alterne hit fort et léger. Regarde le miroir : le hit doit se voir même sans grand mouvement.",
   "Contrôle musculaire fin et conscience corporelle : tes poses et tes hits sont plus nets.",
   "Fais tes hit-poses avec un vrai hit de poitrine ou de biceps aux temps 4 et 8 : la pose arrive avec un coup, pas à la dérive.",
   "Il repose sur la contraction et le relâchement rapides des muscles pour « frapper » le rythme.",
   "Son créateur le plus cité est Boogaloo Sam, de Fresno."
  ],
  "locking": [
   "Los Angeles · fin des années 60",
   "Funk joyeux et théâtral avec des pauses marquées.",
   "Don Campbell, The Lockers",
   "Lock aux temps 4 et 8 de chaque phrase : accélère le bras, fige 1 seconde avec le sourire et relâche. Le contraste vitesse-pause est essentiel.",
   "Contraste vitesse-pause et sens du spectacle : mêmes racines funk que le waacking.",
   "4 temps de bras rapide et lock figé sur 4 et 8 ; puis remplace le lock par une pose de waacking.",
   "Son mouvement signature est une pause soudaine où le corps se « verrouille ».",
   "Don Campbell l’a inventé après avoir oublié un pas en dansant."
  ],
  "waacking": [
   "Clubs de Los Angeles · années 70",
   "Disco avec cordes et voix ; drame et attitude.",
   "Tinker Bell, Arthur Goff",
   "Rotations de bras sur 8 temps sans plier l’épaule ; termine chaque phrase sur une pose de shooting mode.",
   "Ton style de base : rotations de bras, poses et attitude sur disco et funk.",
   "10 min de rotations de bras à 122 BPM sans baisser le coude ; termine chaque 8 temps sur une pose nette.",
   "Ses bras tracent de larges cercles depuis l’épaule, avec des poses de star de cinéma.",
   "Il est né dans les clubs disco de Los Angeles, dans la communauté LGBTQ+."
  ],
  "house": [
   "Chicago et New York · années 80",
   "Grosse caisse constante en quatre temps ; les pieds mènent.",
   "Les clubs The Warehouse et Paradise Garage",
   "Jack continu pendant 32 temps, puis ajoute un pas de pieds tous les 8. Garde le rebond dans les genoux, pas dans les épaules.",
   "Pieds et flow en 4/4 : musicalité continue et endurance pour les longs sets.",
   "32 temps de jack et skate ; ajoute des bras de waacking par-dessus sans casser le pas.",
   "La grosse caisse constante à 4 temps et le travail de pieds rapide définissent ce style.",
   "Son nom vient des clubs où est née la musique électronique de danse."
  ],
  "hiphop": [
   "Rues et fêtes des États-Unis · années 80–90",
   "Boom bap : groove lourd et basse qui invitent à rebondir.",
   "Danses sociales transmises de quartier en quartier",
   "Bounce et rock sur 8 temps en changeant de poids. Ajoute un pas social par phrase et termine par ta signature.",
   "Agilité, groove et aisance : tu te déplaces plus librement entre les poses.",
   "Bounce à 92 BPM pendant 2 minutes et ajoute un tour de waacking tous les 8 temps sans perdre le rebond.",
   "Il repose sur le bounce et le rock, avec des pas sociaux comme le Running Man.",
   "Sa musique est souvent du boom bap, au groove lourd et lent."
  ],
  "krump": [
   "South Central, Los Angeles · années 2000",
   "Souvent ressenti en demi-tempo, avec des coups intenses.",
   "Tight Eyez et Big Mijo",
   "Chest pop à chaque temps de 1 à 4, stomp sur 5 et 6, libère l’énergie sur 7-8. Respire et privilégie le contrôle à la force.",
   "Intensité, contrôle du buste et expression émotionnelle.",
   "Chest pop sur les temps 1–4 ; remplace le pop par une hit-pose sur 5–8.",
   "Un style très expressif et émotionnel avec chest pops et stomps.",
   "Il est apparu comme une alternative positive à South Central Los Angeles dans les années 2000."
  ],
  "twerking": [
   "La Nouvelle-Orléans (bounce) et racines ouest-africaines · années 90",
   "Bounce de La Nouvelle-Orléans : basse lourde et rythme répétitif.",
   "DJ Jubilee et Big Freedia",
   "Squat avec isolation des hanches 8 temps, puis debout 8 temps. Garde le dos neutre et respire ; aucune douleur lombaire.",
   "Mobilité et isolation des hanches, force des jambes et des fessiers.",
   "2 min d’isolations de hanches en squat ; ajoute des bras de waacking, pieds immobiles.",
   "Il est né dans la scène bounce de La Nouvelle-Orléans et repose sur des isolations rapides des hanches.",
   "Big Freedia est l’une des figures les plus associées à la musique bounce qui l’a popularisé."
  ],
  "dancehall": [
   "Jamaïque · années 80",
   "Riddims à la basse profonde et au rythme syncopé.",
   "Gerald « Bogle » Levy et les Ravers Clavers",
   "Whine continu 16 temps, puis change de poids dans un bogle. Genoux souples, buste relâché ; les hanches portent le rythme.",
   "Groove bas, hanches fluides et attitude de fête.",
   "Whine et bogle à 95 BPM ; garde le groove et ajoute une pose de waacking sur chaque 4.",
   "C’est la danse des fêtes jamaïcaines, avec des pas comme le Bogle et le Dutty Wine.",
   "Sa musique repose sur des riddims à la basse profonde, nés en Jamaïque."
  ],
  "voguing": [
   "Ballroom de Harlem, New York · années 60–80",
   "Beats de ballroom avec voix et percussions marquées.",
   "Paris Dupree, Willi Ninja, Pepper LaBeija",
   "16 temps de hand performance avec poignets et doigts précis, et une pose nette (« clic ») tous les 8 temps. Pense à une page de magazine.",
   "Le meilleur complément : hand performance, poses nettes et catwalk avec attitude de défilé.",
   "16 temps de hand performance avec poignets et doigts précis ; puis mêle-la à tes rotations de bras.",
   "Il s’organise en catégories de ballroom, avec hand performance, catwalk et duckwalk.",
   "Il est né dans le ballroom de Harlem ; Willi Ninja en est l’une des figures les plus connues."
  ],
  "techno": [
   "Clubs européens · années 2000 (Tecktonik et shuffle)",
   "Électro et techno très rapides ; bras et pieds sans arrêt.",
   "Scènes de clubs comme le Metropolis (Paris)",
   "Arm flow 4 minutes à 130 BPM sans perdre le tempo ; alterne grands et petits bras. Attention aux épaules et poignets.",
   "Vitesse et endurance des bras : cardio et rythme rapide.",
   "Arm flow 4 min à 130 BPM sans perdre le tempo ; transforme le flux en larges rotations.",
   "C’est une danse de club sur une musique électronique très rapide, avec bras vifs et shuffle.",
   "Sa version la plus connue, la Tecktonik, est apparue dans les clubs parisiens."
  ],
  "flexing": [
   "Flatbush, Brooklyn · années 2000",
   "Mélange de dancehall, reggae et hip hop ; contrôle et narration.",
   "Reggie « Regg Roc » Gray et Storyboard P",
   "Glide de bras lent 8 temps, puis un snap de coude. Cherche des lignes nettes avant la vitesse.",
   "Contrôle extrême des bras et fluidité : des isolations qui semblent impossibles.",
   "Glide de bras lent 8 temps et un snap de coude ; intègre le glide dans une rotation.",
   "Il combine bone-breaking, snaps et glides avec une narration théâtrale.",
   "Il est né à Brooklyn et s’identifie à la scène FlexN."
  ],
  "afrohouse": [
   "Afrique du Sud, Angola et diaspora · années 2000 et après",
   "House avec percussions africaines et basse profonde.",
   "Scènes de Johannesburg et Luanda",
   "Transfert de poids sur trois appuis avec rebond des genoux, ajoute une vague de buste. Sol lourd et buste libre.",
   "Groove du poids, polyrythmie et fluidité du buste.",
   "Transfert de poids sur trois appuis ; ajoute une vague de buste et termine par une pose.",
   "Il combine le bounce de la house avec des percussions africaines et un jeu de pieds puissant.",
   "Il se danse avec beaucoup de poids dans le sol et un buste fluide, avec une forte présence de l’Afrique du Sud et de l’Angola."
  ]
 },
 "ko": {
  "breaking": [
   "뉴욕 브롱크스 · 1970년대",
   "펑크와 소울의 브레이크비트; DJ가 연주 구간을 늘립니다.",
   "DJ 쿨 허크, 크레이지 레그스, 락 스테디 크루",
   "8카운트 4라운드: 탑락, 다운, 식스스텝, 마무리. 라운드마다 5BPM씩 올리되 지지하는 발을 놓치지 마세요.",
   "전환과 다운을 위한 힘, 체중 조절, 빠른 발.",
   "탑락 8카운트 + 느린 식스스텝; 다운을 바닥의 마지막 포즈로 연결하세요.",
   "핵심은 바닥 가까이의 풋워크와 프리즈입니다.",
   "브롱크스의 DJ가 늘린 연주 브레이크에서 탄생했습니다."
  ],
  "popping": [
   "캘리포니아 프레즈노 · 1970년대",
   "스네어가 강한 펑크; 각 히트는 하나의 수축입니다.",
   "부갈루 샘과 일렉트릭 부갈루스",
   "16카운트 동안 카운트마다 히트 하나, 그다음 강한 히트와 약한 히트를 번갈아. 거울을 보세요: 큰 움직임이 없어도 히트가 보여야 합니다.",
   "섬세한 근육 컨트롤과 신체 인식: 포즈와 히트가 더 선명해집니다.",
   "4와 8카운트에 가슴이나 이두의 진짜 히트로 히트포즈를 하세요: 포즈가 흘러가지 않고 타격과 함께 도착합니다.",
   "근육을 빠르게 수축했다 풀어 비트를 “때리는” 것이 기본입니다.",
   "가장 많이 언급되는 창시자는 프레즈노의 부갈루 샘입니다."
  ],
  "locking": [
   "로스앤젤레스 · 1960년대 후반",
   "명랑하고 연극적인 펑크, 뚜렷한 멈춤.",
   "돈 캠벨, 더 로커스",
   "각 프레이즈의 4와 8카운트에 락: 팔을 빠르게, 웃으며 1초 멈췄다 풀기. 속도와 멈춤의 대비가 전부입니다.",
   "속도와 멈춤의 대비, 쇼맨십: 웨이킹과 펑크 뿌리를 공유합니다.",
   "빠른 팔 4카운트와 4, 8카운트의 정지 락; 그다음 락을 웨이킹 포즈로 바꿔 보세요.",
   "특징적인 동작은 몸이 “잠기는” 갑작스러운 멈춤입니다.",
   "돈 캠벨이 춤추다 스텝을 잊어버린 것에서 만들었습니다."
  ],
  "waacking": [
   "로스앤젤레스 클럽 · 1970년대",
   "스트링과 보컬이 있는 디스코; 드라마와 애티튜드.",
   "팅커 벨, 아서 고프",
   "어깨를 굽히지 않고 8카운트 동안 팔 회전; 프레이즈마다 패션 촬영 같은 포즈로 마무리.",
   "당신의 기본 스타일: 디스코와 펑크 위의 팔 회전, 포즈, 애티튜드.",
   "팔꿈치를 내리지 않고 122BPM에서 10분간 팔 회전; 8카운트마다 깔끔한 포즈로 마무리.",
   "팔이 어깨에서 크게 원을 그리고, 영화배우 같은 포즈를 취합니다.",
   "로스앤젤레스 LGBTQ+ 커뮤니티의 디스코 클럽에서 시작되었습니다."
  ],
  "house": [
   "시카고와 뉴욕 · 1980년대",
   "일정한 4비트 킥; 발이 리드합니다.",
   "클럽 더 웨어하우스와 파라다이스 개라지",
   "32카운트 연속 잭, 그다음 8카운트마다 발동작 하나 추가. 바운스는 어깨가 아니라 무릎에서.",
   "4/4의 발과 플로우: 긴 세트를 위한 지속적인 음악성과 지구력.",
   "32카운트 잭과 스케이트; 스텝을 끊지 않고 위에 웨이킹 팔을 더해 보세요.",
   "일정한 4비트 킥과 빠른 발동작이 이 스타일을 규정합니다.",
   "이름은 전자 댄스 음악이 태어난 클럽에서 왔습니다."
  ],
  "hiphop": [
   "미국의 거리와 파티 · 1980–90년대",
   "붐뱁: 바운스하게 만드는 묵직한 그루브와 베이스.",
   "동네에서 동네로 전해진 소셜 댄스",
   "8카운트 동안 체중을 옮기며 바운스와 락. 프레이즈마다 소셜 스텝 하나를 더하고 자신만의 시그니처로 마무리.",
   "민첩성, 그루브, 자유로움: 포즈 사이를 더 자유롭게 움직입니다.",
   "92BPM에서 2분간 바운스, 8카운트마다 웨이킹 턴을 하나 더하되 바운스를 놓치지 마세요.",
   "바운스와 락에 뿌리를 두고, 러닝맨 같은 소셜 스텝이 있습니다.",
   "음악은 보통 붐뱁이며 묵직하고 느린 그루브입니다."
  ],
  "krump": [
   "로스앤젤레스 사우스 센트럴 · 2000년대",
   "종종 하프타임으로 느끼며 강렬한 타격.",
   "타이트 아이즈와 빅 미조",
   "1~4카운트마다 체스트 팝, 5와 6에 스톰프, 7-8에 에너지 방출. 호흡하고 힘보다 컨트롤을 우선하세요.",
   "강렬함, 가슴 컨트롤, 감정 표현.",
   "1–4카운트 체스트 팝; 5–8카운트에는 팝 대신 히트포즈로 바꿔 보세요.",
   "체스트 팝과 스톰프가 있는 매우 표현적이고 감정적인 스타일.",
   "2000년대 로스앤젤레스 사우스 센트럴에서 긍정적인 대안으로 나타났습니다."
  ],
  "twerking": [
   "뉴올리언스(바운스)와 서아프리카 뿌리 · 1990년대",
   "뉴올리언스 바운스: 묵직한 베이스와 반복적인 리듬.",
   "DJ 주빌리와 빅 프리디아",
   "스쿼트 자세에서 골반 아이솔레이션 8카운트, 일어서서 8카운트. 등을 중립으로 유지하고 호흡; 허리 통증 없이.",
   "골반 가동성과 아이솔레이션, 다리와 둔근의 힘.",
   "스쿼트에서 골반 아이솔레이션 2분; 발을 고정하고 웨이킹 팔을 더해 보세요.",
   "뉴올리언스 바운스 씬에서 태어났고 빠른 골반 아이솔레이션에 기반합니다.",
   "빅 프리디아는 이를 대중화한 바운스 음악과 가장 연관된 인물 중 하나입니다."
  ],
  "dancehall": [
   "자메이카 · 1980년대",
   "깊은 베이스와 싱코페이션 리듬의 리딤.",
   "제럴드 “보글” 레비와 레이버스 클래버스",
   "16카운트 연속 와인, 그다음 체중을 옮겨 보글로. 무릎은 부드럽게, 상체는 느슨하게; 골반이 리듬을 이끕니다.",
   "낮은 그루브, 유연한 골반, 파티 애티튜드.",
   "95BPM에서 와인과 보글; 그루브를 유지하고 4마다 웨이킹 포즈를 더하세요.",
   "자메이카 파티의 춤으로 보글, 더티 와인 같은 스텝이 있습니다.",
   "음악은 자메이카에서 태어난 깊은 베이스의 리딤 위에 세워집니다."
  ],
  "voguing": [
   "뉴욕 할렘 볼룸 · 1960–80년대",
   "보컬과 뚜렷한 퍼커션의 볼룸 비트.",
   "파리스 듀프리, 윌리 닌자, 페퍼 라베이하",
   "손목과 손가락이 정확한 핸드 퍼포먼스 16카운트, 8카운트마다 깔끔한 포즈(“클릭”). 잡지 화보를 떠올리세요.",
   "최고의 보완: 핸드 퍼포먼스, 깨끗한 포즈, 런웨이 애티튜드의 캣워크.",
   "손목과 손가락이 정확한 핸드 퍼포먼스 16카운트; 그다음 팔 회전과 섞어 보세요.",
   "볼룸 카테고리로 구성되며 핸드 퍼포먼스, 캣워크, 덕워크가 있습니다.",
   "할렘 볼룸에서 태어났고 윌리 닌자가 가장 유명한 인물 중 하나입니다."
  ],
  "techno": [
   "유럽 클럽 · 2000년대(텍토닉과 셔플)",
   "매우 빠른 일렉트로와 테크노; 팔과 발이 멈추지 않습니다.",
   "메트로폴리스(파리) 같은 클럽 씬",
   "130BPM에서 4분간 암 플로우, 템포를 놓치지 않기; 큰 팔과 작은 팔을 번갈아. 어깨와 손목 주의.",
   "팔의 속도와 지구력: 유산소와 빠른 리듬.",
   "130BPM에서 4분 암 플로우; 그 흐름을 큰 회전으로 바꿔 보세요.",
   "매우 빠른 전자음악에 맞춘 클럽 댄스로 빠른 팔과 셔플이 특징입니다.",
   "가장 유명한 형태인 텍토닉은 파리의 클럽에서 등장했습니다."
  ],
  "flexing": [
   "브루클린 플랫부시 · 2000년대",
   "댄스홀, 레게, 힙합의 혼합; 컨트롤과 스토리텔링.",
   "레지 “렉 록” 그레이와 스토리보드 P",
   "느린 팔 글라이드 8카운트, 그다음 팔꿈치 스냅. 속도보다 깨끗한 라인을 먼저.",
   "극단적인 팔 컨트롤과 유연함: 불가능해 보이는 아이솔레이션.",
   "느린 팔 글라이드 8카운트와 팔꿈치 스냅; 글라이드를 회전 안에 넣어 보세요.",
   "본 브레이킹, 스냅, 글라이드를 연극적인 서사와 결합합니다.",
   "브루클린에서 태어났고 FlexN 씬과 동일시됩니다."
  ],
  "afrohouse": [
   "남아프리카, 앙골라와 디아스포라 · 2000년대 이후",
   "아프리카 퍼커션과 깊은 베이스의 하우스.",
   "요하네스버그와 루안다의 씬",
   "세 지점 체중 이동과 무릎 바운스, 가슴 웨이브를 더하세요. 바닥은 무겁게, 상체는 자유롭게.",
   "체중 그루브, 폴리리듬, 상체의 유연함.",
   "세 지점 체중 이동; 가슴 웨이브를 더하고 포즈로 마무리하세요.",
   "하우스 바운스에 아프리카 퍼커션과 강한 발동작을 결합합니다.",
   "바닥에 체중을 실은 무거운 느낌과 유연한 상체로 추며, 남아프리카와 앙골라의 영향이 강합니다."
  ]
 },
 "zh": {
  "breaking": [
   "纽约布朗克斯 · 20 世纪 70 年代",
   "放克与灵魂乐的 breakbeat；DJ 延长器乐段落。",
   "DJ Kool Herc、Crazy Legs、Rock Steady Crew",
   "四轮八拍：toprock、下地、six-step、出场。每轮提高 5 BPM，同时不要失去支撑脚。",
   "为衔接与下地提供力量、重心控制和快速步伐。",
   "Toprock 八拍 + 慢速 six-step；把下地连接到地面的收尾造型。",
   "核心是贴近地面的 footwork 和定格（freeze）。",
   "它诞生于布朗克斯 DJ 延长的器乐间奏。"
  ],
  "popping": [
   "加利福尼亚州弗雷斯诺 · 20 世纪 70 年代",
   "鼓点（snare）明显的放克；每个 hit 都是一次收缩。",
   "Boogaloo Sam 与 Electric Boogaloos",
   "16 拍每拍一个 hit，再交替强弱 hit。看镜子：即使没有大动作，hit 也要看得见。",
   "精细的肌肉控制与身体意识：你的造型和 hit 会更清晰。",
   "在第 4 拍和第 8 拍用真正的胸部或二头肌 hit 来做 hit-pose：造型伴随发力到位，而不是飘过去。",
   "基础是快速收缩再放松肌肉，用来“打”节拍。",
   "最常被提到的创始人是来自弗雷斯诺的 Boogaloo Sam。"
  ],
  "locking": [
   "洛杉矶 · 20 世纪 60 年代末",
   "欢快、富有戏剧性的放克，停顿鲜明。",
   "Don Campbell、The Lockers",
   "每个乐句的第 4 和第 8 拍做 lock：加快手臂，微笑定格 1 秒再放开。速度与停顿的对比就是一切。",
   "速度与停顿的对比和舞台表现力：与 Waacking 共享放克根源。",
   "4 拍快速手臂，第 4 和第 8 拍定格 lock；再把 lock 换成 Waacking 造型。",
   "标志动作是身体突然“锁住”的停顿。",
   "Don Campbell 在跳舞时忘了舞步，由此创造了它。"
  ],
  "waacking": [
   "洛杉矶俱乐部 · 20 世纪 70 年代",
   "带弦乐和人声的迪斯科；戏剧感与态度。",
   "Tinker Bell、Arthur Goff",
   "八拍手臂旋转，肩膀不弯；每个乐句以时尚大片般的造型收尾。",
   "你的主舞种：在迪斯科与放克上的手臂旋转、造型与态度。",
   "以 122 BPM 练 10 分钟手臂旋转，手肘不落；每八拍以干净的造型结束。",
   "手臂从肩膀画出大圆，并配以电影明星般的造型。",
   "诞生于洛杉矶 LGBTQ+ 社群的迪斯科俱乐部。"
  ],
  "house": [
   "芝加哥与纽约 · 20 世纪 80 年代",
   "稳定的四四拍底鼓；脚部主导。",
   "The Warehouse 与 Paradise Garage 俱乐部",
   "连续 32 拍 jack，然后每 8 拍加入一个脚步。让弹动来自膝盖，而不是肩膀。",
   "4/4 中的脚步与 flow：持续的音乐性和长时间舞蹈的耐力。",
   "32 拍 jack 与 skate；在不打断脚步的情况下加上 Waacking 手臂。",
   "稳定的 4 拍底鼓和快速的脚步定义了这个舞种。",
   "名字来自电子舞曲诞生的俱乐部。"
  ],
  "hiphop": [
   "美国街头与派对 · 20 世纪 80–90 年代",
   "Boom bap：厚重的律动与低音，让人想跟着弹动。",
   "在街区之间流传的社交舞",
   "八拍内转移重心做 bounce 和 rock。每个乐句加一个社交舞步，并以自己的标志动作收尾。",
   "敏捷、律动与自如：在造型之间移动更自由。",
   "以 92 BPM 做 2 分钟 bounce，每八拍加入一个 Waacking 转身，同时不丢弹动。",
   "以 bounce 和 rock 为根基，有 Running Man 等社交舞步。",
   "音乐通常是 boom bap，律动厚重而缓慢。"
  ],
  "krump": [
   "洛杉矶南中区 · 21 世纪 00 年代",
   "常以半速感受，打击强烈。",
   "Tight Eyez 与 Big Mijo",
   "第 1 到 4 拍每拍一个 chest pop，第 5、6 拍 stomp，第 7-8 拍释放能量。注意呼吸，控制优先于力量。",
   "强度、胸部控制与情感表达。",
   "第 1–4 拍 chest pop；第 5–8 拍把 pop 换成 hit-pose。",
   "极具表现力和情感的舞种，有 chest pop 和 stomp。",
   "21 世纪 00 年代作为积极的替代选择出现在洛杉矶南中区。"
  ],
  "twerking": [
   "新奥尔良（bounce）与西非根源 · 20 世纪 90 年代",
   "新奥尔良 bounce：厚重低音与重复节奏。",
   "DJ Jubilee 与 Big Freedia",
   "深蹲做胯部分离 8 拍，起身站立 8 拍。保持背部中立并呼吸；腰部不能疼。",
   "胯部灵活度与分离控制，以及腿部和臀部力量。",
   "深蹲中做 2 分钟胯部分离；脚不动，加上 Waacking 手臂。",
   "诞生于新奥尔良的 bounce 场景，依靠快速的胯部分离。",
   "Big Freedia 是与使其流行的 bounce 音乐联系最紧密的人物之一。"
  ],
  "dancehall": [
   "牙买加 · 20 世纪 80 年代",
   "低音深沉、切分节奏的 riddim。",
   "Gerald “Bogle” Levy 与 Ravers Clavers",
   "连续 16 拍 whine，然后转移重心做一个 bogle。膝盖放松，躯干松弛；由胯部带动节奏。",
   "低重心律动、流畅的胯部与派对气场。",
   "以 95 BPM 做 whine 和 bogle；保持律动，每 4 拍加一个 Waacking 造型。",
   "这是牙买加派对的舞蹈，有 Bogle 和 Dutty Wine 等舞步。",
   "音乐建立在诞生于牙买加、低音深沉的 riddim 之上。"
  ],
  "voguing": [
   "纽约哈莱姆舞厅（ballroom） · 20 世纪 60–80 年代",
   "带人声与鲜明打击乐的舞厅节拍。",
   "Paris Dupree、Willi Ninja、Pepper LaBeija",
   "16 拍手部表演（hand performance），手腕手指精准，每 8 拍一个干净造型（“定格”）。想象杂志内页。",
   "最佳补充：手部表演、干净的造型和有T台气场的 catwalk。",
   "16 拍手部表演，手腕手指精准；再与你的手臂旋转结合。",
   "按舞厅类别组织，包含手部表演、catwalk 和 duckwalk。",
   "诞生于哈莱姆舞厅；Willi Ninja 是其最知名的人物之一。"
  ],
  "techno": [
   "欧洲俱乐部 · 21 世纪 00 年代（Tecktonik 与 shuffle）",
   "非常快的电子与 techno；手臂和脚步不停。",
   "巴黎 Metropolis 等俱乐部场景",
   "以 130 BPM 练 4 分钟 arm flow，速度不掉；交替大幅与小幅手臂。注意肩膀和手腕。",
   "手臂的速度与耐力：心肺与快节奏。",
   "以 130 BPM 练 4 分钟 arm flow；再把流动带入大幅旋转。",
   "这是配合极快电子乐的俱乐部舞蹈，有快速手臂和 shuffle。",
   "最广为人知的版本 Tecktonik 出现在巴黎的俱乐部。"
  ],
  "flexing": [
   "布鲁克林弗拉特布什 · 21 世纪 00 年代",
   "融合 dancehall、雷鬼和嘻哈；控制与叙事。",
   "Reggie “Regg Roc” Gray 与 Storyboard P",
   "慢速手臂 glide 8 拍，再做一个手肘 snap。先追求干净的线条，再追求速度。",
   "极致的手臂控制与流畅：看起来不可能的分离动作。",
   "慢速手臂 glide 8 拍加一个手肘 snap；把 glide 融入旋转里。",
   "把 bone-breaking、snap 和 glide 与戏剧化叙事结合。",
   "诞生于布鲁克林，与 FlexN 场景相关联。"
  ],
  "afrohouse": [
   "南非、安哥拉及其海外社群 · 21 世纪 00 年代以后",
   "带非洲打击乐与深沉低音的 house。",
   "约翰内斯堡与罗安达的场景",
   "三点重心转移配膝盖弹动，再加胸部波浪。地面感要重，躯干要自由。",
   "重心律动、复合节奏与躯干的流畅。",
   "三点重心转移；加上胸部波浪，并以造型收尾。",
   "把 house 的弹动与非洲打击乐和有力的脚步结合。",
   "舞蹈中重心沉向地面、躯干流畅，南非和安哥拉的影响很强。"
  ]
 },
 "ja": {
  "breaking": [
   "ニューヨーク・ブロンクス · 1970年代",
   "ファンクとソウルのブレイクビート。DJが間奏部分を引き延ばします。",
   "DJ クール・ハーク、クレイジー・レッグス、ロック・ステディ・クルー",
   "8カウント×4ラウンド：トップロック、ダウン、シックスステップ、抜け。ラウンドごとに5BPM上げ、軸足を保つこと。",
   "切り替えとダウンのための力、体重コントロール、速い足さばき。",
   "トップロック8カウント＋ゆっくりしたシックスステップ。ダウンを床でのラストポーズにつなげる。",
   "中心は床に近いフットワークとフリーズです。",
   "ブロンクスのDJが引き延ばした間奏のブレイクから生まれました。"
  ],
  "popping": [
   "カリフォルニア州フレズノ · 1970年代",
   "スネアの効いたファンク。ひとつひとつのヒットが収縮です。",
   "ブーガルー・サムとエレクトリック・ブーガルーズ",
   "16カウント、1カウントに1ヒット。その後、強いヒットと弱いヒットを交互に。鏡を見て：大きな動きがなくてもヒットが見えるように。",
   "繊細な筋肉コントロールと身体感覚：ポーズやヒットがよりシャープに。",
   "4と8カウントで胸や二頭筋の本物のヒットを使ってヒットポーズを。ポーズが流れず、打撃とともに決まります。",
   "筋肉を素早く収縮・弛緩させてビートを「打つ」のが基本です。",
   "最もよく挙げられる創始者は、フレズノのブーガルー・サムです。"
  ],
  "locking": [
   "ロサンゼルス · 1960年代後半",
   "陽気で演劇的なファンク。はっきりした間があります。",
   "ドン・キャンベル、ザ・ロッカーズ",
   "各フレーズの4と8カウントでロック：腕を速くし、笑顔で1秒止めて解く。スピードと静止の対比がすべてです。",
   "スピードと静止の対比、ショーマンシップ。ワッキングとファンクのルーツを共有します。",
   "4カウントの速い腕と、4と8での静止ロック。次にロックをワッキングのポーズに置き換える。",
   "象徴的な動きは、体が「ロック」する突然の静止です。",
   "ドン・キャンベルが踊っている最中にステップを忘れたことから生まれました。"
  ],
  "waacking": [
   "ロサンゼルスのクラブ · 1970年代",
   "ストリングスとボーカルのディスコ。ドラマとアティチュード。",
   "ティンカー・ベル、アーサー・ゴフ",
   "肩を曲げずに8カウント腕を回す。各フレーズをファッション撮影のポーズで締める。",
   "あなたの基本スタイル：ディスコとファンクの上での腕の回転、ポーズ、アティチュード。",
   "肘を下げずに122BPMで10分間、腕を回す。8カウントごとにきれいなポーズで終える。",
   "腕が肩から大きな円を描き、映画スターのようなポーズをとります。",
   "ロサンゼルスのLGBTQ+コミュニティのディスコクラブで生まれました。"
  ],
  "house": [
   "シカゴとニューヨーク · 1980年代",
   "一定の4つ打ちキック。足が主導します。",
   "クラブ「ザ・ウェアハウス」と「パラダイス・ガラージ」",
   "32カウント連続でジャック、その後8カウントごとにフットワークを1つ追加。バウンスは肩ではなく膝で。",
   "4/4での足とフロー：長いセットのための途切れない音楽性と持久力。",
   "32カウントのジャックとスケート。ステップを止めずに上にワッキングの腕を足す。",
   "一定の4つ打ちキックと速いフットワークがこのスタイルを決めます。",
   "名前は、電子ダンスミュージックが生まれたクラブに由来します。"
  ],
  "hiphop": [
   "アメリカの街角とパーティー · 1980〜90年代",
   "ブームバップ：バウンスしたくなる重いグルーヴとベース。",
   "街から街へ受け継がれたソーシャルダンス",
   "8カウントで体重移動しながらバウンスとロック。フレーズごとにソーシャルステップを1つ足し、自分のサインで締める。",
   "敏捷性、グルーヴ、自在さ：ポーズの間をより自由に動けます。",
   "92BPMで2分間バウンス。バウンスを失わずに8カウントごとにワッキングのターンを1つ足す。",
   "バウンスとロックを土台に、ランニングマンなどのソーシャルステップがあります。",
   "音楽は通常ブームバップで、重くゆっくりしたグルーヴです。"
  ],
  "krump": [
   "ロサンゼルス・サウスセントラル · 2000年代",
   "ハーフタイムで感じることが多く、激しい打撃。",
   "タイト・アイズとビッグ・ミジョ",
   "1〜4カウントで毎カウントチェストポップ、5と6でストンプ、7-8でエネルギーを解放。呼吸を忘れず、力よりコントロールを優先。",
   "激しさ、胸のコントロール、感情表現。",
   "1–4カウントでチェストポップ。5–8カウントではポップをヒットポーズに置き換える。",
   "チェストポップとストンプのある、非常に表現力豊かで感情的なスタイル。",
   "2000年代にロサンゼルスのサウスセントラルで、前向きな選択肢として現れました。"
  ],
  "twerking": [
   "ニューオーリンズ（バウンス）と西アフリカのルーツ · 1990年代",
   "ニューオーリンズ・バウンス：重いベースと反復するリズム。",
   "DJ ジュビリーとビッグ・フリーディア",
   "スクワットで腰のアイソレーション8カウント、立ち上がって8カウント。背中はニュートラルに保ち呼吸。腰に痛みがないように。",
   "腰の可動域とアイソレーション、脚とお尻の筋力。",
   "スクワットで腰のアイソレーションを2分。足を動かさずにワッキングの腕を足す。",
   "ニューオーリンズのバウンスシーンで生まれ、速い腰のアイソレーションが軸です。",
   "ビッグ・フリーディアは、広めたバウンスミュージックと最も結びつけられる人物のひとりです。"
  ],
  "dancehall": [
   "ジャマイカ · 1980年代",
   "深いベースとシンコペーションのリディム。",
   "ジェラルド“ボーグル”リーヴィとレイバーズ・クラバーズ",
   "16カウント連続でワイン、その後体重を移してボーグルへ。膝は柔らかく、上半身は緩く。腰がリズムを運びます。",
   "低いグルーヴ、しなやかな腰、パーティーのアティチュード。",
   "95BPMでワインとボーグル。グルーヴを保ち、4ごとにワッキングのポーズを足す。",
   "ジャマイカのパーティーのダンスで、ボーグルやダッティ・ワインなどのステップがあります。",
   "音楽は、ジャマイカで生まれた深いベースのリディムの上に成り立っています。"
  ],
  "voguing": [
   "ニューヨーク・ハーレムのボールルーム · 1960〜80年代",
   "ボーカルとはっきりしたパーカッションのボールルーム・ビート。",
   "パリス・デュプリー、ウィリー・ニンジャ、ペッパー・ラベイジャ",
   "手首と指を正確に使うハンドパフォーマンス16カウント、8カウントごとにきれいなポーズ（「クリック」）。雑誌のグラビアを思い浮かべて。",
   "最高の補完：ハンドパフォーマンス、きれいなポーズ、ランウェイのアティチュードのキャットウォーク。",
   "手首と指を正確に使うハンドパフォーマンス16カウント。その後、腕の回転と混ぜる。",
   "ボールルームのカテゴリーで構成され、ハンドパフォーマンス、キャットウォーク、ダックウォークがあります。",
   "ハーレムのボールルームで生まれ、ウィリー・ニンジャは最も有名な人物のひとりです。"
  ],
  "techno": [
   "ヨーロッパのクラブ · 2000年代（テクトニックとシャッフル）",
   "非常に速いエレクトロとテクノ。腕も足も止まりません。",
   "メトロポリス（パリ）などのクラブシーン",
   "130BPMで4分間アームフロー、テンポを落とさない。大きな腕と小さな腕を交互に。肩と手首に注意。",
   "腕のスピードと持久力：有酸素と速いリズム。",
   "130BPMで4分間アームフロー。その流れを大きな回転につなげる。",
   "非常に速い電子音楽に合わせるクラブダンスで、素早い腕とシャッフルが特徴です。",
   "最も知られた形のテクトニックは、パリのクラブで登場しました。"
  ],
  "flexing": [
   "ブルックリン・フラットブッシュ · 2000年代",
   "ダンスホール、レゲエ、ヒップホップの融合。コントロールと物語性。",
   "レジー“レグ・ロック”グレイとストーリーボードP",
   "ゆっくりした腕のグライドを8カウント、その後肘のスナップ。速さよりまずきれいなライン。",
   "極限の腕のコントロールと流れ：不可能に見えるアイソレーション。",
   "ゆっくりした腕のグライド8カウントと肘のスナップ。グライドを回転の中に組み込む。",
   "ボーンブレイキング、スナップ、グライドを演劇的な物語性と組み合わせます。",
   "ブルックリンで生まれ、FlexNシーンと結びつけられます。"
  ],
  "afrohouse": [
   "南アフリカ、アンゴラとディアスポラ · 2000年代以降",
   "アフリカのパーカッションと深いベースのハウス。",
   "ヨハネスブルグとルアンダのシーン",
   "3点での体重移動と膝のバウンス、そこに胸のウェーブを足す。床は重く、上半身は自由に。",
   "体重のグルーヴ、ポリリズム、上半身のしなやかさ。",
   "3点での体重移動。胸のウェーブを足してポーズで締める。",
   "ハウスのバウンスにアフリカのパーカッションと力強いフットワークを組み合わせます。",
   "床に体重を預けた重さとしなやかな上半身で踊り、南アフリカとアンゴラの影響が強いです。"
  ]
 }
};

export const MV_ES: Record<string, string> = {
 "Toprock": "Pasos de pie (toprock)",
 "Indian step": "Paso indio",
 "Six-step": "Seis pasos",
 "Three-step": "Tres pasos",
 "Baby freeze": "Freeze bebé",
 "Chair freeze": "Freeze silla",
 "Backspin": "Giro de espalda",
 "Hit": "Golpe",
 "Wave": "Onda",
 "Tick": "Tic",
 "Strobe": "Estrobo",
 "Boogaloo roll": "Roll boogaloo",
 "Float": "Flotar",
 "Dime stop": "Parada seca",
 "Lock": "Lock (traba)",
 "Point": "Señalar",
 "Wrist twirl": "Giro de muñeca",
 "Knee drop": "Caída de rodilla",
 "Stop and go": "Parar y seguir",
 "Arm rotation": "Rotación de brazo",
 "Hit-pose": "Golpe-pose",
 "Flick": "Latigazo",
 "Cross-body arm": "Brazo cruzado",
 "Sweep": "Barrido",
 "Snap turn": "Giro seco",
 "Shoulder drop": "Caída de hombro",
 "Skate": "Patinaje",
 "Heel-toe": "Talón-punta",
 "Farmer": "Granjero",
 "Scissor": "Tijera",
 "Loose leg": "Pierna suelta",
 "Bounce": "Rebote",
 "Rock": "Balanceo",
 "Running Man": "Hombre corriendo",
 "Chest pop": "Pop de pecho",
 "Stomp": "Pisotón",
 "Arm swing": "Balanceo de brazo",
 "Snatch": "Arrebato",
 "Drop": "Caída",
 "Shake": "Sacudida",
 "Wall twerk": "Twerk en pared",
 "Hip isolation": "Aislamiento de cadera",
 "Butterfly": "Mariposa",
 "Zip it up": "Súbelo",
 "Hand performance": "Performance de manos",
 "Catwalk": "Pasarela",
 "Duckwalk": "Paso de pato",
 "Floor performance": "Performance en piso",
 "Spin and dip": "Giro y caída",
 "Arm flow": "Flujo de brazos",
 "Kick step": "Paso con patada",
 "Hand strike": "Golpe de mano",
 "Bone breaking": "Rotura de huesos",
 "Snap": "Chasquido",
 "Glide": "Deslizamiento",
 "Contortion": "Contorsión",
 "Pantsula step": "Paso pantsula",
 "Knee bounce": "Rebote de rodilla",
 "Weight shift": "Cambio de peso",
 "Hip roll": "Rodado de cadera",
 "Chest wave": "Onda de pecho"
};

// Búsquedas de YouTube por ejercicio de calentamiento (mismo orden que UI[lang].wu).
export const YTQ: string[] = [
 "dance warm up joint mobility",
 "dance warm up bounce groove",
 "chest isolation shoulder isolation dance tutorial",
 "waacking arm rotation warm up",
 "hip circles figure eight dance warm up",
 "dance warm up squats heel raises",
 "body wave tutorial dance"
];
