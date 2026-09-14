import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  BookOpenCheck,
  Search,
  Save,
  Sparkles,
  Clock,
  ArrowRight,
  Check,
  Award,
  AlertCircle,
  HelpCircle,
  Bookmark,
  RefreshCw,
  Notebook as NotebookIcon,
  ChevronRight,
  BrainCircuit,
  MessageSquare,
  Cog
} from 'lucide-react';
import { User } from '../types';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Language, translations } from '../lib/translations';

interface EbooksViewProps {
  currentUser: User;
  language: Language;
}

interface Ebook {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  readTime: string;
  author: string;
  color: string;
  borderColor: string;
  tagColor: string;
  chapters: {
    title: string;
    content: string;
  }[];
}

const EBOOKS: Ebook[] = [
  {
    id: 'guia-iniciacion-waacking',
    title: 'Guía de Iniciación al Waacking: Expresión, Ritmo y Poder',
    subtitle: 'El Espíritu del Waacking, Fundamentos Técnicos (Líneas, Overheads, Rollos), Metáforas Visuales y Posing (Garbo).',
    category: 'Cátedra / Guía Oficial',
    readTime: '10 min de lectura',
    author: 'WaackOn Editorial & Cátedra',
    color: 'bg-primary-container/20',
    borderColor: 'border-[#e9c349]/50',
    tagColor: 'bg-[#e9c349]/20 text-[#e9c349] border-[#e9c349]/40',
    chapters: [
      {
        title: '1. Introducción: El Espíritu del Waacking',
        content: `El Waacking es un acto de resistencia envuelto en drama y elegancia. Surgido en los años 70 en los clubes disco subterráneos de Los Ángeles, fue forjado por comunidades marginadas: hombres negros, latinos y asiáticos de la comunidad LGBTQ+. En una sociedad que les exigía ocultar su identidad, la pista de baile se convirtió en su santuario de libertad.

Originalmente llamado "Punking" —un término despectivo que los pioneros reclamaron para transformar la opresión en poder— el estilo evolucionó hacia el nombre "Waacking". Es vital entender su etimología: la doble "a" se añadió para distanciar el baile del término "wack" (de mala calidad). En el Waacking, la mediocridad no tiene lugar; cada movimiento debe ser una declaración de excelencia y "fabulousness".

"El Waacking es la libertad de ser uno mismo. Es convertir la música en algo visual y reclamar el espacio que el mundo intentó negarte a través del drama y la autoexpresión."

Para dominar este arte, el estudiante debe erigir su danza sobre tres pilares fundamentales:

• Musicalidad: El cuerpo no solo sigue el ritmo, se convierte en el instrumento que acentúa cada golpe de la música Disco y Funk.
• Poses (Garbo): La habilidad de congelar el tiempo en una postura dramática que captura la atención absoluta.
• Confianza: La técnica sin actitud es solo gimnasia. Debes poseer la ferocidad de una estrella de cine reclamando su primer plano.

La técnica física no es un simple accesorio; es el vehículo de nuestra historia y el escudo que protege nuestra identidad. Dominar el cuerpo es el requisito indispensable para liberar el alma en la pista.`
      },
      {
        title: '2. Fundamentos Técnicos: Los Tres Movimientos Esenciales',
        content: `La técnica del Waacking se define por ser "salvaje pero controlada". No lanzamos los brazos al azar; dibujamos trayectorias geométricas con una precisión quirúrgica.

2.1. LAS LÍNEAS (LINES): DIBUJANDO EN EL AIRE
Las líneas establecen tu marco visual. Imagina que tus brazos son pinceles trazando la presencia majestuosa de las estrellas de la era dorada de Hollywood. Buscamos una geometría perfecta: codos bloqueados y trayectorias nítidas.

Ejecución en 3 pasos:
1. Brazo individual: Extiende el brazo con fuerza directamente hacia abajo, luego hacia el lado (horizontal perfecta) y finalmente recto hacia arriba. El codo debe estar totalmente estirado, "bloqueando" la articulación en cada punto.
2. Brazo opuesto: Repite el patrón buscando la misma nitidez y simetría.
3. Simultaneidad: Ejecuta las líneas con ambos brazos a la vez. Siente cómo tu extensión física "adueña" el espacio visual de la habitación.

El "So What?": Las líneas definen tu alcance. Sin líneas limpias, el drama se pierde en movimientos pequeños.

2.2. OVERHEADS (SOBRE LA CABEZA): EL PODER DEL ACCESORIO INVISIBLE
Inspirado en el dinamismo de las películas de artes marciales de los 70, este movimiento requiere que sientas la inercia circular y el peso de unos nunchacos invisibles en tus manos.

Comando Activo: Lleva tus manos desde la zona de la clavícula hacia detrás del cuello en un movimiento envolvente. No solo muevas las manos; siente el peso del movimiento.
• Mantén los hombros estables, evitando que suban hacia las orejas.
• Abre los codos lo suficiente para que la mano pase con fluidez por detrás de la cabeza.
• Las muñecas deben liderar el trayecto con flexibilidad.
• Postura: El pecho debe realizar una protrusión natural (hacia adelante) mientras las manos van atrás, enfatizando la apertura tridimensional de tu torso.

2.3. LOS ROLLOS (ROLLS): FLUIDEZ Y ROTACIÓN
El wrist roll es la firma técnica del Waacking. Es una rotación continua que depende de la relajación para generar velocidad.

Guía paso a paso en dos tiempos:
• Tiempo 1: Desde el costado, rota el brazo hacia adentro completando un círculo frente al pecho.
• Tiempo 2: Continúa la rotación hacia arriba y atrás, permitiendo que la mano rebote suavemente sobre tu espalda (el bounce). Este rebote es la clave para recuperar la energía y regresar a la posición inicial con agilidad.

Sintetiza la fluidez: La diferencia entre un movimiento tosco y un rollo maestro es la muñeca. Debe estar relajada, funcionando como una hélice que aprovecha su propio impulso.`
      },
      {
        title: '3. Resumen de Ejecución y Metáforas Visuales',
        content: `Matriz de ejecución técnica y metáforas biomecánicas:

• LÍNEAS
  - Inspiración Visual: Divas de Hollywood
  - Beneficio Principal: Define el marco visual y mejora la extensión geométrica.
  - Clave de Desempeño: Codos bloqueados a 180° y ángulos rectos instantáneos.

• OVERHEADS
  - Inspiración Visual: Inercia de Nunchakos / Artes Marciales 70s
  - Beneficio Principal: Desarrolla la profundidad y el uso del espacio tridimensional.
  - Clave de Desempeño: Pecho proyectado hacia adelante mientras las manos envuelven el cuello.

• ROLLOS (WRIST ROLLS)
  - Inspiración Visual: Hélices / Rotación rítmica continua
  - Beneficio Principal: Aumenta la velocidad rítmica y la fluidez en las transiciones.
  - Clave de Desempeño: Muñeca suelta como hélice y bounce elástico en la espalda.`
      },
      {
        title: '4. El Toque Final: El Posing (Garbo)',
        content: `El concepto de "Garbo" fue introducido por pioneros como Andrew, Arthur y Tinker, quienes llevaron este estilo a la fama nacional en el programa Soul Train. Se inspiraban en las fotografías glamurosas de las actrices de los años 40 para puntuar su danza con poses angulares y feroces.

3 CONSEJOS PARA UNA POSE IMPACTANTE:
1. Uso del torso: Nunca te quedes plano. Inclina el torso o rota la cintura para crear ángulos visuales complejos.
2. Inclinación de la cabeza: Un giro sutil o una inclinación de la barbilla añade intención y "mirada" al momento.
3. Spread de los dedos: Los dedos deben estar activos, abiertos como abanicos, proyectando energía hasta la punta de las uñas.

CHECK-LIST DE LA POSE PERFECTA:
✔ ¿He bloqueado el ángulo para que sea nítido?
✔ ¿Mi torso está inclinado para crear una silueta dinámica?
✔ ¿He extendido mis dedos para maximizar la energía?
✔ ¿Mi expresión facial cuenta una historia coherente con la música?`
      },
      {
        title: '5. Conclusión: Tu Historia en la Pista',
        content: `Dominar las líneas, los overheads y los rollos es solo el armazón técnico. El Waacking es, en esencia, la herramienta para reclamar tu espacio y ser el protagonista de tu propia narrativa. No te limites a seguir el ritmo; entrena hasta que tu cuerpo logre ser la música.

Para desarrollar una musicalidad genuina, sumérgete en los clásicos del Disco y el Funk. Escucha los vientos, las líneas de bajo y los silencios. Permite que cada técnica aprendida hoy sea una respuesta visceral a esos sonidos. La práctica constante te dará la base, pero tu espíritu será el que te haga verdaderamente fabuloso. ¡Nos vemos en la pista!`
      }
    ]
  },
  {
    id: 'monroe-arm-roll',
    title: 'Arm Roll: Guía de Técnica (Guía 01)',
    subtitle: '"El movimiento empieza en el hombro, pero la historia empieza en la cultura." — Brando Hermoso',
    category: 'Monroe Academy Oficial',
    readTime: '8 min de lectura',
    author: 'Brando Hermoso',
    color: 'bg-primary-container/20',
    borderColor: 'border-[#564241]',
    tagColor: 'bg-[#81262c]/20 text-[#ffb3b2] border-[#81262c]/30',
    chapters: [
      {
        title: '1. ¿Qué es el Arm Roll y su Origen?',
        content: `El arm roll es uno de los movimientos fundamentales del waacking, una danza nacida en los clubes underground del LA disco de los años 70, en la comunidad LGBTQ+ negra y latina.

Es un movimiento circular del brazo que rota desde el hombro, pasando por el codo, hasta la mano, creando una línea fluida que dibuja en el aire.

Más que técnica, el arm roll es pura expresión dramática: cuenta una historia cinematográfica, marca el charles de la música y conecta al bailarín con la herencia cultural del disco, el funk y las raíces afroamericanas y latinas de la danza de club.

📖 RAÍZ CULTURAL Y PIONEROS:
Este movimiento fue inmortalizado por pioneros legendarios como Tinker Toy, bailando en el club Gino's II de Los Ángeles, junto a titanes como Lamont Peterson, Arthur Goff y Tyrone Proctor. Lo bailaban al ritmo de la orquestación ascendente de Diana Ross, Donna Summer y Sylvester.`
      },
      {
        title: '2. Posición Inicial y Alineación Biomecánica',
        content: `Para ejecutar un arm roll con la potencia, limpieza y sofisticación exigidas en Monroe Academy, tu postura debe alinearse de acuerdo con los siguientes principios anatómicos:

• HOMBROS: Totalmente relajados, descendidos y colocados ligeramente hacia atrás para abrir la caja torácica y permitir el libre rango de rotación.
• BRAZOS: Suspendidos a los lados de forma orgánica, listos para activarse instantáneamente sin tensión previa en el trapecio.
• CADERAS: Centradas en el plano de gravedad, con el peso distribuido de manera uniforme entre ambas piernas para sostener la rotación del torso.
• RODILLAS: Suaves y flexibles, nunca bloqueadas, actuando como la amortiguación natural del ritmo (el "bounce" continuo de la música disco).
• MIRADA: Proyectada con total intención al frente, abierta y expresiva, canalizando el drama teatral característico del cine mudo de Hollywood.
• RESPIRACIÓN: Lenta, controlada y diafragmática, manteniendo el torso estable mientras los brazos vuelan.`
      },
      {
        title: '3. Desglose en Fases Biomecánicas',
        content: `El método de Monroe Academy codifica el Arm Roll in tres fases bien diferenciadas para su correcta ejecución:

FASE 01: INICIACIÓN
El movimiento nace conscientemente en el hombro. El brazo se eleva y el codo se flexiona, preparándose para guiar la rotación espacial hacia arriba y por detrás de la cabeza de manera segura.

FASE 02: ROTACIÓN
El codo actúa como el pivote, el eje y el timonel absoluto del giro. La energía viaja fluidamente del hombro al codo, y luego se proyecta con precisión geométrica del codo hacia la muñeca. La muñeca rota por detrás de la oreja sin colapsar el plano del brazo.

FASE 03: CIERRE
La mano completa la trayectoria circular en el espacio tridimensional con un latigazo controlado de dedos. El brazo regresa con intención y aplomo, cerrando el dibujo sin perder nunca el "flow" ni el tiempo rítmico musical.`
      },
      {
        title: '4. Practica con Respeto: El Legado Cultural',
        content: `El arm roll es tuyo cuando lo bailas, pero su historia siempre pertenecerá a la cultura y comunidad que lo creó.

Hacer waacking sin conocer su historia es simplemente hacer gimnasia de brazos. Honra a los pioneros que lucharon en las pistas de baile por su derecho a ser libres. Conoce sus nombres, investiga los clubes históricos y baila con el respeto absoluto que merece este movimiento de resistencia.

Esta es la primera guía oficial de técnica de Monroe Academy. Sigue entrenando tus líneas, afinando tus giros y proyectando tu espíritu en cada beat.

✨ MONROE ACADEMY
Entrena con alma, proyecta con drama.
🛒 Para workbook completo e indumentaria: monroe-dance.store`
      }
    ]
  },
  {
    id: 'history-waack',
    title: 'La Historia del Waacking',
    subtitle: 'El surgimiento subterráneo del estilo y la evolución del Punking al Waacking.',
    category: 'Historia Fundamental',
    readTime: '15 min de lectura',
    author: 'Brando Hermoso',
    color: 'bg-surface-container-high/40',
    borderColor: 'border-tertiary/20',
    tagColor: 'bg-[#e9c349]/10 text-[#e9c349] border-[#e9c349]/20',
    chapters: [
      {
        title: '1. Los Orígenes Subterráneos en Los Ángeles',
        content: `El Waacking nació a principios de la década de 1970 en la escena de clubs nocturnos underground LGBTQ+ afroamericanos y latinos de Los Ángeles, California. 

En un contexto de profunda opresión social y racial, estos espacios subterráneos sirvieron como templos de libertad y autoexpresión radical. Los bailarines pioneros encontraron en el club un escenario sagrado donde podían reclamar su identidad, su espacio y su dignidad a través de movimientos corporales dramáticos y veloces. 

La pista de baile se convertía en un lienzo de empoderamiento teatral, transformando el dolor de la realidad cotidiana en una catarsis colectiva de ritmo y orgullo.`
      },
      {
        title: '2. El Arte del Punking',
        content: `El nombre original de esta forma de danza fue "Punking". La palabra "punk" se utilizaba en aquella época de forma despectiva hacia los hombres homosexuales. Los bailarines del movimiento decidieron reapropiarse del insulto para neutralizarlo y transformarlo en un sinónimo de poder, creatividad y drama escénico. 

Hacer "Punking" significaba infundir emoción extrema en la danza: contar una película muda, interpretar una tragedia de Hollywood, o manifestar rabia, picardía y sensualidad indomable. 

Cada movimiento de brazos o cambio de eje corporal estaba motivado por un trasfondo cinematográfico directo, donde el bailarín era el protagonista absoluto de su propia obra de arte.`
      },
      {
        title: '3. De Punking a Waacking: La Evolución de la Terminología',
        content: `A medida que el estilo comenzó a ganar popularidad fuera de la comunidad original y se presentaba en programas de televisión masivos como "Soul Train", el término "Punking" comenzó a dar paso a "Waacking". 

Esto se debió en parte a que la palabra "whack" (golpear o azotar con fuerza) describía perfectamente la percusión rítmica y la velocidad con la que los bailarines trazaban círculos alrededor de sus cabezas y hombros antes de fijar una pose dramática. 

Los bailarines de la corriente principal y los coreógrafos comerciales adoptaron y popularizaron la ortografía "Waacking" (con doble 'a'), consolidando el estilo como una de las disciplinas de danza urbana y club más icónicas y con mayor rigor técnico en todo el mundo.`
      },
      {
        title: '4. Creadores y Pioneros Legendarios',
        content: `La historia del Waacking está marcada por nombres míticos que sentaron las bases técnicas y expresivas del estilo:
        
• Arthur Fiedler: Considerado uno de los arquitectos del Punking, famoso por sus líneas limpias, drama impecable y transiciones suaves de brazos.
• Lamont Peterson: Conocido por su musicalidad perfecta y por clavar los acentos rítmicos más intrincados.
• Tinker: Un bailarín con una energía salvaje y una proyección escénica que influyó en todos los que le rodeaban.
• Jeff Kutache: Quien formó el grupo de danza "Dancing Machine" y ayudó a codificar y llevar el Waacking a escenarios mundiales.
• Tyrone Proctor: Conocido como "The Bone", legendario bailarín de Soul Train que se convirtió en el gran embajador global de la disciplina, educando a las nuevas generaciones hasta sus últimos días.
• Billy Goodson, Victor Manoel y Ana "Lollipop" Sanchez: Quienes preservaron y transmitieron el legado con respeto absoluto a las raíces de club.`
      }
    ]
  },
  {
    id: 'disco-era',
    title: 'La Era Disco y la Cultura de Club',
    subtitle: 'El sonido de los 70s, los templos de baile de Los Ángeles y la música como combustible.',
    category: 'Música y Cultura',
    readTime: '12 min de lectura',
    author: 'Brando Hermoso',
    color: 'bg-primary-container/20',
    borderColor: 'border-[#564241]',
    tagColor: 'bg-[#81262c]/20 text-[#ffb3b2] border-[#81262c]/30',
    chapters: [
      {
        title: '1. Los Clubs Históricos de Los Ángeles',
        content: `Para comprender el Waacking, es indispensable estudiar los clubs donde se forjó. No eran simplemente discotecas de moda; eran refugios de libertad.
        
El más influyente fue "Gino's II" y más tarde "The Starwood". En estos clubs, los bailarines se reunían en círculos (ciphers) para competir, retarse y compartir innovaciones visuales. La iluminación estroboscópica y las pistas de baile de madera pulida magnificaban el efecto dramático de los movimientos de brazos rápidos y las poses de pasarela. 

Danzar en Gino's era un ritual donde los mejores bailarines de la Costa Oeste definían el rumbo de la cultura urbana noche tras noche.`
      },
      {
        title: '2. La Música Disco: El Latido de 120 a 135 BPM',
        content: `El Waacking y la Música Disco están intrínsecamente entrelazados. El compás de 4/4 continuo (Four-on-the-floor) y los tempos rápidos de entre 120 y 135 BPM dictaban la velocidad de los rolls de muñeca. 

Artistas como Donna Summer, Gloria Gaynor, Diana Ross, Loleatta Holloway, First Choice, Sylvester, y The Trammps proporcionaban un sonido rico en orquestación, metales dramáticos, campanas y violines ascendentes. 

Los bailarines de Waacking no bailaban solo con el bombo básico de la batería; reaccionaban a los gritos vocales, a las subidas melódicas de los violines y a los redobles de caja, imitando visualmente con sus codos y hombros la fuerza y dramatismo de la orquesta.`
      },
      {
        title: '3. El Fenómeno Soul Train',
        content: `"Soul Train", el legendario programa de televisión de música y danza afroamericana presentado por Don Cornelius, fue la ventana que reveló el Waacking a toda la nación estadounidense. 

Danzantes residentes del programa como Tyrone Proctor, Jeffrey Daniel y Jody Watley realizaban rolls rápidos, caminatas elegantes y poses congeladas en la famosa "Soul Train Line". 

Millones de jóvenes en sus hogares imitaban estos movimientos asombrosos en sus salas de estar, iniciando la primera gran oleada de internacionalización del estilo y llevando la energía del club gay underground de Los Ángeles al corazón de la cultura pop global.`
      }
    ]
  },
  {
    id: 'punking-vs-waacking',
    title: 'Punking vs Waacking: Raíces Expresivas',
    subtitle: 'Diferencias conceptuales entre la emoción teatral y la ejecución de la técnica moderna.',
    category: 'Estilo y Filosofía',
    readTime: '10 min de lectura',
    author: 'Brando Hermoso',
    color: 'bg-secondary-container/20',
    borderColor: 'border-[#2a4386]',
    tagColor: 'bg-[#b3c5ff]/10 text-[#b3c5ff] border-[#b3c5ff]/20',
    chapters: [
      {
        title: '1. ¿Qué es el Punking en Esencia?',
        content: `El Punking es la raíz emocional y cinematográfica. No se enfoca en "cuántos círculos de brazos puedes hacer por segundo", sino en "qué historia le estás contando a la cámara". 

La esencia del Punking es la teatralidad y el carácter: actuar como si fueras una gran estrella de cine mudo, una diva trágica o un héroe de cómic de acción. El Punking exige que cada golpe de muñeca provenga de una emoción real de empoderamiento, rebeldía, humor o seducción. 

Si un bailarín domina la técnica pero su mirada carece de intención teatral, está haciendo movimientos gimnásticos, pero no está haciendo Punking.`
      },
      {
        title: '2. La Codificación del Waacking Técnico',
        content: `El Waacking es la disciplina física, la técnica codificada y la maestría del ritmo. Consiste en la alineación precisa de las muñecas que rotan de forma simétrica por encima y por detrás de los hombros, manteniendo los codos suspendidos y alineados con la espalda. 

El Waacking incluye las caminatas de pasarela rítmicas (Posing y Walk), el juego de pies (Footwork) y las transiciones fluidas de peso. En el Waacking moderno, la precisión del tiempo y la velocidad de los "rolls" cruzados desempeñan un papel fundamental en las batallas uno contra uno, donde los bailarines demuestran reflejos musicales agudos.`
      },
      {
        title: '3. El Arte Teatral del Posing (Poses Congeladas)',
        content: `El "Posing" (hacer poses estáticas) en el Waacking está profundamente inspirado en las fotografías icónicas de las actrices de la Época de Oro de Hollywood (como Greta Garbo, Marlene Dietrich, Joan Crawford y Rita Hayworth) y en las pasarelas de alta costura francesa. 

Los pioneros imitaban la elegancia aristocrática, el misterio en las miradas y la rigidez geométrica del cuerpo de las modelos. 

En la pista de baile, los bailarines golpeaban de forma explosiva y congelaban estas poses durante una fracción de segundo coincidiendo exactamente con la percusión más fuerte de la música (el acento de caja o aplauso), creando un efecto fotográfico deslumbrante que electrizaba a los espectadores.`
      }
    ]
  }
];

// Interactive Quiz Questions
const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: '¿En qué ciudad nació el Waacking a principios de la década de 1970?',
    options: ['Nueva York (escena ballroom)', 'Los Ángeles (escena LGBTQ+ de clubs)', 'Chicago (escena House)', 'Detroit (Motown)'],
    answer: 'Los Ángeles (escena LGBTQ+ de clubs)',
    explanation: 'El Waacking nació en los clubs nocturnos underground LGBTQ+ afroamericanos y latinos de Los Ángeles, California.'
  },
  {
    id: 2,
    question: '¿Cuál era el término original de esta danza antes de llamarse Waacking?',
    options: ['Voguing', 'Punking', 'Locking', 'Disco Waack'],
    answer: 'Punking',
    explanation: 'Se le llamaba Punking. Los bailarines se reapropiaron del término despectivo "punk" para transformarlo en sinónimo de orgullo y teatro.'
  },
  {
    id: 3,
    question: '¿Qué pionero es ampliamente conocido como "The Bone" y embajador global del estilo?',
    options: ['Tyrone Proctor', 'Arthur Fiedler', 'Jeff Kutache', 'Lamont Peterson'],
    answer: 'Tyrone Proctor',
    explanation: 'Tyrone Proctor ("The Bone") fue bailarín estrella de Soul Train y viajó por el mundo transmitiendo el Waacking a miles de estudiantes.'
  },
  {
    id: 4,
    question: '¿Qué gran fuente de inspiración dio origen al "Posing" en el Waacking?',
    options: ['Las posturas de artes marciales chinas', 'Las fotos de la Época de Oro de Hollywood y pasarelas de moda', 'Las figuras egipcias de jeroglíficos', 'Los deportes olímpicos clásicos'],
    answer: 'Las fotos de la Época de Oro de Hollywood y pasarelas de moda',
    explanation: 'Los pioneros se inspiraban en divas de cine mudo como Greta Garbo y modelos de alta costura para clavar poses congeladas con acentos musicales.'
  }
];

export interface InfoProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
  tags: string[];
}

const INFOPRODUCTS: InfoProduct[] = [
  {
    id: 'prod-workbook',
    title: 'Monroe Academy Workbook Completo V2.1',
    description: 'El cuaderno de trabajo definitivo en formato digital de alta resolución. Contiene planificadores de entrenamiento diario, registros de ciphers y batallas, guías de conteo y síncopa de música disco, y 10 retos de freestyle diseñados por Brando Hermoso listos para imprimir.',
    price: '$9.90 USD',
    category: 'Libro de Trabajo Oficial',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=300',
    tags: ['PDF Imprimible', 'Planificadores', 'Drills Monroe']
  },
  {
    id: 'prod-styling',
    title: 'Guía Monroe de Punking & Expresión Escénica',
    description: 'Aprende a contar historias mudas y canalizar el drama del Hollywood clásico. Contiene fichas de personajes teatrales del disco underground de los 70s, ejercicios oculares de proyección escénica y secretos de estilismo retro inspirados en pasarela de alta costura.',
    price: '$14.90 USD',
    category: 'E-book Premium',
    imageUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=300',
    tags: ['Epub/PDF', 'Drama & Teatralidad', 'Exclusivo']
  },
  {
    id: 'prod-battle-secrets',
    title: 'Masterclass Monroe: Secretos de Batalla & Freestyle',
    description: 'Video-curso pregrabado avanzado por Brando Hermoso. 5 lecciones de alta intensidad que revelan estrategias de batalla en el círculo, cómo usar el espacio tridimensional con tus líneas, responder a call-outs y capturar la atención del jurado en los primeros 15 segundos.',
    price: '$24.90 USD',
    category: 'Videocurso Masterclass',
    imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=300',
    tags: ['Video 4K', 'Freestyle Avanzado', 'Estrategia']
  },
  {
    id: 'prod-disco-blueprint',
    title: 'Monroe Disco Music Blueprint para Bailarines',
    description: 'El mapa auditivo de la era de oro. Análisis estructural detallado de 15 clásicos disco históricos, síncopas críticas donde fallan los bailarines, y una playlist secreta curada por Brando a velocidades progresivas de 110 a 135 BPM.',
    price: '$7.90 USD',
    category: 'Guía de Audio & Conteo',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=300',
    tags: ['Audio Guías', 'Estructuras Disco', 'Musicalidad']
  }
];

function getTranslatedEbookText(text: string, lang: Language): string {
  if (lang === 'es') return text;
  
  let result = text;
  
  if (lang === 'en') {
    result = result
      .replace(/¿Qué es el Arm Roll y su Origen\?/g, 'What is the Arm Roll and its Origin?')
      .replace(/El arm roll es uno de los movimientos fundamentales/g, 'The arm roll is one of the fundamental movements')
      .replace(/una danza nacida en los clubes underground/g, 'a dance born in the underground clubs')
      .replace(/en la comunidad LGBTQ\+ negra y latina/g, 'in the Black and Latino LGBTQ+ community')
      .replace(/Es un movimiento circular del brazo/g, 'It is a circular movement of the arm')
      .replace(/Más que técnica, el arm roll es pura expresión dramática/g, 'More than technique, the arm roll is pure dramatic expression')
      .replace(/RAÍZ CULTURAL Y PIONEROS/g, 'CULTURAL ROOTS AND PIONEERS')
      .replace(/La Historia del Waacking/g, 'The History of Waacking')
      .replace(/Los Orígenes Subterráneos en Los Ángeles/g, 'The Underground Origins in Los Angeles')
      .replace(/El Arte del Punking/g, 'The Art of Punking')
      .replace(/De Punking a Waacking: La Evolución/g, 'From Punking to Waacking: The Evolution')
      .replace(/Creadores y Pioneros Legendarios/g, 'Legendary Creators and Pioneers')
      .replace(/La Era Disco y la Cultura de Club/g, 'The Disco Era and Club Culture')
      .replace(/Los Clubs Históricos de Los Ángeles/g, 'The Historical Clubs of Los Angeles')
      .replace(/La Música Disco: El Latido/g, 'Disco Music: The Heartbeat')
      .replace(/El Fenómeno Soul Train/g, 'The Soul Train Phenomenon')
      .replace(/¿Qué es el Punking en Esencia\?/g, 'What is Punking in Essence?')
      .replace(/La Codificación del Waacking Técnico/g, 'The Codification of Technical Waacking')
      .replace(/El Arte Teatral del Posing/g, 'The Theatrical Art of Posing');
      
      if (text.includes("El arm roll es uno de los movimientos")) {
        result = `The arm roll is one of the fundamental movements of Waacking, a dance born in the underground clubs of 1970s Disco LA, within the Black and Latino LGBTQ+ community.

It is a circular arm movement rotating from the shoulder, passing through the elbow, to the hand, creating a fluid line drawn in the air.

More than technique, the arm roll is pure dramatic expression: it tells a cinematic story, accents the music's hi-hat, and connects the dancer to the cultural heritage of disco, funk, and the Afro-American and Latino roots of club dance.

📖 CULTURAL ROOTS AND PIONEERS:
This movement was immortalized by legendary pioneers like Tinker Toy, dancing at Gino's II club in Los Angeles, along with titans like Lamont Peterson, Arthur Goff, and Tyrone Proctor. They danced to the swelling orchestrations of Diana Ross, Donna Summer, and Sylvester.`;
      } else if (text.includes("Para ejecutar un arm roll con la potencia")) {
        result = `To execute an arm roll with the power, cleanliness, and sophistication demanded at Monroe Academy, your posture must align according to the following anatomical principles:

• SHOULDERS: Fully relaxed, lowered, and placed slightly back to open the rib cage and allow free range of rotation.
• ARMS: Suspended naturally at the sides, ready to activate instantly without pre-tension in the trapezius.
• HIPS: Centered in the plane of gravity, with weight distributed evenly between both legs to support the torso's rotation.
• KNEES: Soft and flexible, never locked, acting as the natural shock absorption of the rhythm (the continuous "bounce" of disco music).
• GAZE: Projected with total intention to the front, open and expressive, channeling the theatrical drama characteristic of Hollywood silent cinema.
• BREATHING: Slow, controlled, and diaphragmatic, keeping the torso stable while the arms fly.`;
      } else if (text.includes("El método de Monroe Academy codifica")) {
        result = `The Monroe Academy method codifies the Arm Roll in three distinct phases for its correct execution:

PHASE 01: INITIATION
The movement is born consciously in the shoulder. The arm rises and the elbow flexes, preparing to guide the spatial rotation upwards and safely behind the head.

PHASE 02: ROTATION
The elbow acts as the pivot, axis, and absolute rudder of the turn. Energy travels fluidly from shoulder to elbow, and then projects with geometric precision from elbow to wrist. The wrist rotates behind the ear without collapsing the plane of the arm.

PHASE 03: CLOSING
The hand completes the circular path in 3D space with a controlled whip of the fingers. The arm returns with intention and poise, closing the drawing without ever losing the "flow" or rhythmic musical time.`;
      } else if (text.includes("El arm roll es tuyo cuando lo bailas")) {
        result = `The arm roll is yours when you dance it, but its history will always belong to the culture and community that created it.

Doing waacking without knowing its history is simply doing arm gymnastics. Honor the pioneers who fought on the dance floors for their right to be free. Know their names, research historical clubs, and dance with the absolute respect this movement of resistance deserves.

This is the first official technique guide of Monroe Academy. Keep training your lines, tuning your spins, and projecting your spirit in every beat.

✨ MONROE ACADEMY
Train with soul, project with drama.
🛒 For complete workbook and apparel: monroe-dance.store`;
      } else if (text.includes("El Waacking nació a principios de la década")) {
        result = `Waacking was born in the early 1970s in the underground LGBTQ+ African-American and Latino nightclub scene of Los Angeles, California.

In a context of deep social and racial oppression, these underground spaces served as temples of freedom and radical self-expression. Pioneer dancers found in the club a sacred stage where they could reclaim their identity, space, and dignity through dramatic and fast body movements.

The dance floor became a canvas of theatrical empowerment, transforming the pain of daily reality into a collective catharsis of rhythm and pride.`;
      } else if (text.includes("El nombre original de esta forma")) {
        result = `The original name of this dance form was "Punking". The word "punk" was used at that time in a derogatory way towards gay men. Dancers of the movement decided to reappropriate the insult to neutralize it and transform it into a synonym for power, creativity, and stage drama.

To do "Punking" meant to infuse extreme emotion into the dance: telling a silent movie, performing a Hollywood tragedy, or manifesting wild anger, playfulness, and untamable sensuality.

Each arm movement or shift of the body axis was motivated by a direct cinematic background, where the dancer was the absolute protagonist of their own work of art.`;
      } else if (text.includes("A medida que el estilo comenzó")) {
        result = `As the style began to gain popularity outside the original community and was presented on massive television shows like "Soul Train", the term "Punking" began to give way to "Waacking".

This was partly because the word "whack" (to hit or whip with force) perfectly described the rhythmic percussion and speed with which dancers drew circles around their heads and shoulders before freezing in a dramatic pose.

Mainstream dancers and commercial choreographers adopted and popularized the "Waacking" spelling (with double 'a'), consolidating the style as one of the most iconic and technically rigorous urban and club dance disciplines worldwide.`;
      } else if (text.includes("La historia del Waacking está marcada")) {
        result = `The history of Waacking is marked by legendary names who laid the technical and expressive foundations of the style:

• Arthur Fiedler: Considered one of the architects of Punking, famous for his clean lines, impeccable drama, and smooth arm transitions.
• Lamont Peterson: Known for his perfect musicality and nailing the most intricate rhythmic accents.
• Tinker: A dancer with a wild energy and stage projection that influenced everyone around him.
• Jeff Kutache: Who formed the dance group "Dancing Machine" and helped codify and bring Waacking to world stages.
• Tyrone Proctor: Known as "The Bone", legendary Soul Train dancer who became the great global ambassador of the discipline, educating new generations until his last days.
• Billy Goodson, Victor Manoel, and Ana "Lollipop" Sanchez: Who preserved and transmitted the legacy with absolute respect for club roots.`;
      } else if (text.includes("Para comprender el Waacking, es indispensable")) {
        result = `To understand Waacking, it is essential to study the clubs where it was forged. They were not simply trendy nightclubs; they were havens of freedom.

The most influential was "Gino's II" and later "The Starwood". In these clubs, dancers gathered in ciphers to compete, challenge each other, and share visual innovations. Strobe lighting and polished wood dance floors magnified the dramatic effect of fast arm movements and runway poses.

Dancing at Gino's was a ritual where the best dancers of the West Coast defined the course of urban culture night after night.`;
      } else if (text.includes("El Waacking y la Música Disco están")) {
        result = `Waacking and Disco Music are intrinsically intertwined. The continuous 4/4 beat (Four-on-the-floor) and fast tempos of 120 to 135 BPM dictated the speed of wrist rolls.

Artists like Donna Summer, Gloria Gaynor, Diana Ross, Loleatta Holloway, First Choice, Sylvester, and The Trammps provided a sound rich in orchestration, dramatic brass, bells, and soaring violins.

Waacking dancers did not just dance to the basic drum kick; they reacted to vocal screams, violin melodic rises, and snare rolls, visually mimicking the strength and drama of the orchestra with their elbows and shoulders.`;
      } else if (text.includes("Soul Train, el legendario programa")) {
        result = `Soul Train, the legendary African-American music and dance television show hosted by Don Cornelius, was the window that revealed Waacking to the entire American nation.

Resident dancers of the show like Tyrone Proctor, Jeffrey Daniel, and Jody Watley performed fast rolls, elegant walks, and frozen poses in the famous "Soul Train Line".

Millions of young people in their homes imitated these amazing movements in their living rooms, starting the first great wave of internationalization of the style and bringing the energy of the underground gay club of Los Angeles to the heart of global pop culture.`;
      } else if (text.includes("El Punking es la raíz emocional y cinematográfica")) {
        result = `Punking is the emotional and cinematic root. It does not focus on "how many arm circles you can do per second", but on "what story you are telling to the camera".

The essence of Punking is theatricality and character: acting as if you were a great silent movie star, a tragic diva, or an action comic hero. Punking demands that every wrist hit comes from a real emotion of empowerment, rebellion, playfulness, or seduction.

If a dancer masters the technique but their gaze lacks theatrical intention, they are doing gymnastic movements, but they are not doing Punking.`;
      } else if (text.includes("El Waacking es la disciplina física")) {
        result = `Waacking is the physical discipline, the codified technique, and the mastery of the rhythm. It consists of the precise alignment of the wrists that rotate symmetrically above and behind the shoulders, keeping the elbows suspended and aligned with the back.

Waacking includes rhythmic runway walks (Posing and Walk), footwork, and fluid transitions of weight. In modern Waacking, time precision and speed of crossed rolls play a fundamental role in one-on-one battles, where dancers demonstrate sharp musical reflexes.`;
      } else if (text.includes("El \"Posing\" (hacer poses estáticas)")) {
        result = `Posing (making static poses) in Waacking is deeply inspired by the iconic photographs of actresses from the Golden Age of Hollywood (such as Greta Garbo, Marlene Dietrich, Joan Crawford, and Rita Hayworth) and high fashion runways.

Pioneers imitated the aristocratic elegance, mystery in gaze, and geometric body rigidity of the models.

On the dance floor, dancers explosively struck and froze these poses for a fraction of a second, matching exactly with the strongest percussion of the music (the snare accent or clap), creating a dazzling photographic effect that electrified spectators.`;
      }
  } else if (lang === 'ko') {
    result = "스마트 한국어 AI 번역:\n" + result
      .replace(/¿Qué es el Arm Roll y su Origen\?/g, '암 롤이란 무엇이며 그 기원은?')
      .replace(/El arm roll es uno de los movimientos fundamentales/g, '암 롤은 왁킹의 가장 기본적인 움직임 중 하나입니다.')
      .replace(/RAÍZ CULTURAL Y PIONEROS/g, '문화적 뿌리와 개척자들')
      .replace(/La Historia del Waacking/g, '왁킹의 역사')
      .replace(/El Arte del Punking/g, '펑킹의 예술')
      .replace(/Creadores y Pioneros Legendarios/g, '레전드 개척자들과 창시자들');
  } else if (lang === 'ja') {
    result = "AI自動日本語翻訳:\n" + result
      .replace(/¿Qué es el Arm Roll y su Origen\?/g, 'アームロールとは何か、その起源')
      .replace(/El arm roll es uno de los movimientos fundamentales/g, 'アームロールはワッキングの最も基本的な動きの1つです。')
      .replace(/RAÍZ CULTURAL Y PIONEROS/g, '文化的ルーツとパイオニア')
      .replace(/La Historia del Waacking/g, 'ワッキングの歴史')
      .replace(/El Arte del Punking/g, 'パンキングの芸術')
      .replace(/Creadores y Pioneros Legendarios/g, 'レジェンド・パイオニアたち');
  } else if (lang === 'pt') {
    result = result
      .replace(/¿Qué es el Arm Roll y su Origen\?/g, 'O que é o Arm Roll e sua Origem?')
      .replace(/El arm roll es uno de los movimientos fundamentales/g, 'O arm roll é um dos movimentos fundamentais')
      .replace(/una danza nacida en los clubes underground/g, 'uma dança nascida nos clubes underground')
      .replace(/en la comunidad LGBTQ\+ negra y latina/g, 'na comunidade LGBTQ+ negra e latina')
      .replace(/Es un movimiento circular del brazo/g, 'É um movimento circular do braço')
      .replace(/Más que técnica, el arm roll es pura expresión dramática/g, 'Mais que técnica, o arm roll é pura expressão dramática')
      .replace(/RAÍZ CULTURAL E PIONEIROS/g, 'RAIZ CULTURAL E PIONEIROS')
      .replace(/La Historia del Waacking/g, 'A História do Waacking')
      .replace(/Los Orígenes Subterráneos en Los Ángeles/g, 'As Origens Underground em Los Ángeles')
      .replace(/El Arte del Punking/g, 'A Arte do Punking')
      .replace(/De Punking a Waacking: La Evolución/g, 'De Punking a Waacking: A Evolução')
      .replace(/Creadores y Pioneros Legendarios/g, 'Criadores e Pioneiros Lendários')
      .replace(/La Era Disco y la Cultura de Club/g, 'A Era Disco e a Cultura de Club')
      .replace(/Los Clubs Históricos de Los Ángeles/g, 'Os Clubes Históricos de Los Ángeles')
      .replace(/La Música Disco: El Latido/g, 'A Música Disco: O Batimento')
      .replace(/El Fenómeno Soul Train/g, 'O Fenômeno Soul Train')
      .replace(/O que é o Punking em Essência\?/g, 'O que é o Punking em Essência?')
      .replace(/La Codificación del Waacking Técnico/g, 'A Codificação do Waacking Técnico')
      .replace(/O Posing/g, 'O Posing');
  }
  
  return result;
}

export default function EbooksView({ currentUser, language }: EbooksViewProps) {
  // Main view state
  const [selectedBook, setSelectedBook] = useState<Ebook | null>(null);
  const [activeChapterIdx, setActiveChapterIdx] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [subTab, setSubTab] = useState<'books' | 'tienda'>('books');

  // InfoProducts purchased state
  const [unlockedProducts, setUnlockedProducts] = useState<string[]>(() => {
    const localUnlocked = localStorage.getItem(`waackon_unlocked_products_${currentUser.id}`);
    return localUnlocked ? JSON.parse(localUnlocked) : [];
  });
  const [purchasingProduct, setPurchasingProduct] = useState<any | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'entering' | 'processing' | 'success'>('entering');
  const [downloadingProductId, setDownloadingProductId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Sync unlocked products to local storage
  useEffect(() => {
    localStorage.setItem(`waackon_unlocked_products_${currentUser.id}`, JSON.stringify(unlockedProducts));
  }, [unlockedProducts, currentUser.id]);

  // Personal Notebook annotations state
  const [notebookNotes, setNotebookNotes] = useState<Record<string, string>>({});
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSaveSuccess, setNoteSaveSuccess] = useState(false);

  // Quiz interactive state
  const [quizActive, setQuizActive] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // Load user notes from Firestore or LocalStorage
  useEffect(() => {
    const loadNotebook = async () => {
      const user = auth.currentUser;
      if (user) {
        // Logged-in: try fetching user notebook from Firestore
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.notebook) {
              setNotebookNotes(data.notebook);
              return;
            }
          }
        } catch (err) {
          const errMessage = err instanceof Error ? err.message : String(err);
          if (!errMessage.includes('client is offline')) {
            console.error("Error loading notebook from firestore:", err);
          }
        }
      }

      // Guest / Backup: fetch from localStorage
      const localNotebook = localStorage.getItem(`waackon_notebook_${currentUser.id}`);
      if (localNotebook) {
        try {
          setNotebookNotes(JSON.parse(localNotebook));
        } catch (e) {
          console.error(e);
        }
      }
    };

    loadNotebook();
  }, [currentUser.id]);

  // Handle Note Save to Database / Firestore
  const handleSaveNote = async (ebookId: string, noteText: string) => {
    setIsSavingNote(true);
    setNoteSaveSuccess(false);

    const updatedNotes = {
      ...notebookNotes,
      [ebookId]: noteText
    };

    try {
      const user = auth.currentUser;
      if (user) {
        // Save to firestore under the users document
        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, { notebook: updatedNotes }, { merge: true });
      }

      // Always save to local storage as fallback and update local state
      localStorage.setItem(`waackon_notebook_${currentUser.id}`, JSON.stringify(updatedNotes));
      setNotebookNotes(updatedNotes);
      setNoteSaveSuccess(true);
      setTimeout(() => setNoteSaveSuccess(false), 2500);
    } catch (err) {
      console.error("Error saving note:", err);
      alert("Error al guardar nota en la nube. Se respaldó localmente.");
    } finally {
      setIsSavingNote(false);
    }
  };

  // Filter E-Books based on search query
  const filteredBooks = EBOOKS.filter(book => {
    const q = (searchQuery || '').toLowerCase();
    return (
      (book.title || '').toLowerCase().includes(q) || 
      (book.subtitle || '').toLowerCase().includes(q) ||
      (book.category || '').toLowerCase().includes(q)
    );
  });

  // Quiz actions
  const handleSelectOption = (option: string) => {
    if (showExplanation) return; // can't change after submitting
    setSelectedOption(option);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption) return;
    
    const isCorrect = selectedOption === QUIZ_QUESTIONS[currentQuestionIdx].answer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setShowExplanation(false);

    if (currentQuestionIdx + 1 < QUIZ_QUESTIONS.length) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setQuizFinished(false);
    setScore(0);
  };

  // Mock download simulation
  const handleDownloadProduct = (productId: string) => {
    setDownloadingProductId(productId);
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDownloadingProductId(null);
            alert("¡Material descargado con éxito en tu dispositivo! (Simulado)");
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const t = translations[language] || translations['es'];

  // Tactile "scene tilt": a subtle 3D sway of the ebooks scene as the surrounding
  // page scrolls, echoing the paper-grain mockup without touching shared chrome.
  const sceneWrapRef = useRef<HTMLDivElement>(null);
  const [sceneTilt, setSceneTilt] = useState(0);

  useEffect(() => {
    const wrap = sceneWrapRef.current;
    if (!wrap) return;

    let scrollParent: HTMLElement | null = wrap.parentElement;
    while (scrollParent) {
      const overflowY = getComputedStyle(scrollParent).overflowY;
      if (overflowY === 'auto' || overflowY === 'scroll') break;
      scrollParent = scrollParent.parentElement;
    }
    const scrollTarget: HTMLElement | Window = scrollParent || window;
    const getScrollTop = () => (scrollParent ? scrollParent.scrollTop : window.scrollY);

    let lastScrollTop = getScrollTop();
    let rafId = 0;
    let settleTimeout: ReturnType<typeof setTimeout>;

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const scrollTop = getScrollTop();
        const delta = scrollTop - lastScrollTop;
        lastScrollTop = scrollTop;
        setSceneTilt(Math.max(-1.2, Math.min(1.2, delta * 0.5)));
      });
      clearTimeout(settleTimeout);
      settleTimeout = setTimeout(() => setSceneTilt(0), 220);
    };

    scrollTarget.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      scrollTarget.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
      clearTimeout(settleTimeout);
    };
  }, []);

  return (
    <div className="flex-1 min-h-full w-full p-6 space-y-6 bg-background text-on-surface flex flex-col font-body-md select-none">

      <div ref={sceneWrapRef} className="relative" style={{ perspective: '1800px' }}>
      {/* Ambient tactile backdrop: paper grain + warm lamp glow, contained to this screen */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 opacity-[0.05] ebook-grain" />
        <div className="ebook-lamp-glow absolute left-1/2 top-[-120px] h-[420px] w-[70%] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_50%_0,rgba(233,195,73,.14),rgba(233,195,73,.03)_42%,transparent_70%)]" />
      </div>

      <div
        className="transition-transform duration-300 ease-out will-change-transform"
        style={{ transform: `rotateX(${sceneTilt}deg)`, transformOrigin: '50% 0%' }}
      >

      {/* HEADER BANNER */}
      <div className="border-b border-tertiary/10 pb-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10">
        <div className="text-left">
          <h2 className="text-2xl font-display-lg font-bold text-white tracking-tight uppercase">{t.ebooksTitle || 'RECURSOS Y LITERATURA'}</h2>
          <p className="text-xs text-on-surface-variant font-medium mt-1">{t.ebooksSubtitle || 'Explora la historia viva, la era disco de los 70s y las raíces expresivas del Punking. Toma notas y ponte a prueba.'}</p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <span className="text-[10px] font-mono font-bold text-[#E9C349] border border-[#E9C349]/20 bg-[#E9C349]/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {language === 'es' ? 'Historia & Cultura' : 'History & Culture'}
          </span>
          <span className="text-[10px] font-mono font-bold text-primary border border-primary/20 bg-primary-container/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Monroe Academy
          </span>
        </div>
      </div>

      {/* Sub-Tabs Selector if no book is selected */}
      {!selectedBook && (
        <div className="bg-surface-container border border-tertiary/10 p-1 rounded-xl flex gap-1 self-start shadow-xl mb-6 z-10">
          <button
            onClick={() => setSubTab('books')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 border ${
              subTab === 'books' 
                ? 'bg-[#81262c] text-[#ffdad9] border-[#ffb3b2]/25 shadow-md font-bold' 
                : 'text-on-surface-variant border-transparent hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Libros de Estudio
          </button>
          <button
            onClick={() => setSubTab('tienda')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 border ${
              subTab === 'tienda' 
                ? 'bg-[#81262c] text-[#ffdad9] border-[#ffb3b2]/25 shadow-md font-bold' 
                : 'text-on-surface-variant border-transparent hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Tienda Premium
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Books Shelf & Interactive Reader (8 Cols) */}
        <div className="xl:col-span-8 space-y-6">
          
          <AnimatePresence mode="wait">
            {!selectedBook ? (
              subTab === 'books' ? (
                // Shelf Mode
                <motion.div 
                  key="shelf"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  {/* Search Bar & Stats */}
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-surface-container border border-tertiary/10 rounded-2xl p-4 shadow-xl">
                    <div className="relative w-full sm:w-80">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="w-4 h-4 text-on-surface-variant" />
                      </div>
                      <input
                        type="text"
                        placeholder="Buscar e-book o categoría..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full text-xs font-bold bg-[#0d0d11]/80 border border-tertiary/15 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-tertiary/30 transition-all"
                      />
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono font-bold uppercase text-on-surface-variant">
                        Material Teórico: {EBOOKS.length} Libros
                      </span>
                    </div>
                  </div>

                  {/* Ebooks Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ perspective: '1400px' }}>
                    {filteredBooks.map((book) => {
                      const savedNote = notebookNotes[book.id];
                      return (
                        <div
                          key={book.id}
                          className="group relative bg-gradient-to-br from-[#1a1720] via-[#141218] to-[#0f0e12] border border-tertiary/10 rounded-2xl p-5 flex flex-col justify-between min-h-[300px] shadow-2xl overflow-hidden transition-all duration-300 ease-out hover:border-[#E9C349]/30 hover:shadow-[0_34px_56px_-22px_rgba(0,0,0,1),0_0_0_1px_rgba(233,195,73,.22)] hover:[transform:translateY(-5px)_rotateX(1.6deg)]"
                        >
                          {/* Tactile paper-grain wash, contained to the card */}
                          <div className="pointer-events-none absolute inset-0 opacity-[0.05] ebook-grain" />
                          {/* Leather-bound spine along the left edge */}
                          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-[9px] rounded-l-2xl bg-gradient-to-r from-[#2a2028] via-[#171319] to-black/60 shadow-[inset_-1px_0_0_rgba(233,195,73,.16)]" />

                          <div className="relative z-10 space-y-3 text-left">
                            <div className="flex justify-between items-start">
                              <span className={`text-[8px] font-mono font-bold border px-2 py-0.5 rounded uppercase ${book.tagColor}`}>
                                {book.category}
                              </span>
                              <span className="text-[9px] font-mono text-on-surface-variant/70 font-bold flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-primary" /> {book.readTime}
                              </span>
                            </div>

                            <h3 className="text-lg font-display-lg font-bold text-white uppercase tracking-tight leading-tight">
                              {book.title}
                            </h3>
                            <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                              {book.subtitle}
                            </p>

                            <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-on-surface-variant/60 uppercase">
                              <span>AUTOR: {book.author}</span>
                            </div>
                          </div>

                          {/* Bottom Actions */}
                          <div className="relative z-10 mt-6 pt-4 border-t border-dashed border-tertiary/10 flex items-center justify-between">
                            {savedNote ? (
                              <span className="text-[9px] font-mono font-bold text-[#E9C349] bg-[#E9C349]/10 px-2 py-1 rounded border border-[#E9C349]/20 flex items-center gap-1 uppercase">
                                <Bookmark className="w-3 h-3 fill-[#E9C349]" /> Nota Guardada
                              </span>
                            ) : (
                              <span className="text-[9px] text-on-surface-variant/40 font-mono font-bold uppercase">Sin anotaciones</span>
                            )}

                            {/* "Comenzar" rendered as a physical gold knob/lever */}
                            <button
                              onClick={() => {
                                setSelectedBook(book);
                                setActiveChapterIdx(0);
                              }}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/30 text-[#221a05] font-extrabold text-xs tracking-wide uppercase bg-[radial-gradient(circle_at_34%_26%,#f0dfa8,#c8a63f_46%,#8a6d1f)] shadow-[inset_0_1.5px_0_rgba(255,255,255,.55),inset_0_-2px_4px_rgba(0,0,0,.45),0_4px_10px_-2px_rgba(0,0,0,.85)] hover:brightness-110 hover:scale-105 active:scale-95 transition-all"
                            >
                              <span>Comenzar</span>
                              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.4} />
                            </button>
                          </div>

                          {/* Page corner that peels up on hover, tucked behind the card content */}
                          <div
                            className="pointer-events-none absolute right-0 bottom-0 z-0 h-[34px] w-[34px] shadow-[-3px_-3px_10px_rgba(0,0,0,.55)] transition-all duration-400 ease-out group-hover:h-[110px] group-hover:w-[110px] group-hover:shadow-[-16px_-16px_40px_rgba(0,0,0,.75)]"
                            style={{
                              background: 'linear-gradient(315deg, #efe6d2 0 46%, #c9bfa8 47%, transparent 48%)',
                              clipPath: 'polygon(100% 0, 100% 100%, 0 100%)'
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Additional historical archive placeholder representation */}
                  <div className="bg-surface-container border border-tertiary/10 rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-left">
                      <div className="p-3 bg-[#E9C349]/10 rounded-2xl border border-[#E9C349]/20 text-[#E9C349] shrink-0">
                        <BookOpenCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-mono font-bold text-[#E9C349] uppercase leading-none">BIBLIOTECA EN EXPANSIÓN</h4>
                        <h3 className="text-sm font-display-lg font-bold text-white uppercase mt-1">MANUSCRITOS, HISTORIALES Y REVISTAS DE ÉPOCA</h3>
                        <p className="text-xs text-on-surface-variant font-medium mt-1 leading-relaxed">
                          El equipo de Waack On está traduciendo fanzines originales de los 70s y recortes de prensa de Soul Train. Muy pronto estarán disponibles gratis para todos.
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#E9C349] bg-[#E9C349]/10 border border-[#E9C349]/20 px-3 py-1 rounded-full shrink-0 uppercase">
                      PRÓXIMAMENTE
                    </span>
                  </div>
                </motion.div>
              ) : (
                // Tienda/Catalog Mode
                <motion.div 
                  key="tienda"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  {/* Shop Banner Header */}
                  <div className="bg-[#5e0b15]/10 border border-primary/20 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
                    <div className="text-left">
                      <span className="text-[9px] font-mono font-bold text-primary bg-primary-container/30 border border-primary/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        CATÁLOGO EXCLUSIVO
                      </span>
                      <h4 className="text-md font-bold text-white uppercase mt-2">INFORMES, MÉTODOS Y AUDIO GUÍAS PREMIUM</h4>
                      <p className="text-xs text-on-surface-variant font-medium mt-1 max-w-xl leading-relaxed">
                        Complementa tu formación con guías detalladas, cuadernos imprimibles y masterclasses en video de alta calidad para llevar tu freestyle al siguiente nivel.
                      </p>
                    </div>
                  </div>

                  {/* InfoProducts Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {INFOPRODUCTS.map((prod) => {
                      const isUnlocked = unlockedProducts.includes(prod.id);
                      const isDownloading = downloadingProductId === prod.id;

                      return (
                        <div 
                          key={prod.id}
                          className="bg-surface-container border border-tertiary/10 rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xl hover:border-tertiary/20 hover:scale-[1.01] transition-all min-h-[380px]"
                        >
                          <div className="relative h-44 border-b border-tertiary/10">
                            <img src={prod.imageUrl} alt={prod.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            <span className="absolute top-3 left-3 text-[8px] font-mono font-bold bg-primary-container text-primary border border-primary/20 px-2.5 py-0.5 rounded uppercase">
                              {prod.category}
                            </span>
                            <span className="absolute bottom-3 right-3 text-xs font-mono font-bold bg-[#0d0d11]/90 text-white border border-tertiary/20 px-2.5 py-1 rounded-xl shadow-md">
                              {prod.price}
                            </span>
                          </div>

                          <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-left">
                            <div className="space-y-1.5">
                              <h3 className="text-md font-bold text-white uppercase leading-tight">{prod.title}</h3>
                              <p className="text-xs text-on-surface-variant font-medium leading-relaxed">{prod.description}</p>
                            </div>

                            <div className="space-y-3">
                              {/* Tags */}
                              <div className="flex flex-wrap gap-1.5">
                                {(prod.tags || []).map((tag) => (
                                  <span key={tag} className="text-[8px] font-mono font-bold bg-[#0d0d11]/80 border border-tertiary/10 text-on-surface-variant px-2 py-0.5 rounded">
                                    #{(tag || '').toUpperCase()}
                                  </span>
                                ))}
                              </div>

                              {/* Progress for download */}
                              {isDownloading && (
                                <div className="space-y-1 bg-[#0d0d11]/80 p-2.5 rounded-xl border border-tertiary/10">
                                  <div className="flex justify-between items-center text-[9px] font-mono font-bold text-primary">
                                    <span>DESCARGANDO...</span>
                                    <span>{downloadProgress}%</span>
                                  </div>
                                  <div className="w-full bg-[#1c1b1b] border border-[#564241] h-2 rounded-full overflow-hidden">
                                    <div className="bg-[#81262c] h-full transition-all duration-150" style={{ width: `${downloadProgress}%` }} />
                                  </div>
                                </div>
                              )}

                              <button
                                onClick={() => {
                                  if (isUnlocked) {
                                    handleDownloadProduct(prod.id);
                                  } else {
                                    setPurchasingProduct(prod);
                                    setCheckoutStep('entering');
                                  }
                                }}
                                disabled={isDownloading}
                                className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase shadow-lg hover:scale-102 active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 border ${
                                  isUnlocked 
                                    ? 'bg-[#E9C349]/10 border-[#E9C349]/20 text-[#E9C349] hover:bg-[#E9C349]/20' 
                                    : 'bg-on-primary-fixed-variant border-primary/25 text-primary-fixed hover:bg-on-primary-container'
                                }`}
                              >
                                {isUnlocked ? (
                                  <>
                                    <Save className="w-4 h-4 text-[#E9C349]" />
                                    Descargar Material
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    Adquirir por {prod.price}
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )
            ) : (
              // Active Reader Mode
              <motion.div
                key="reader"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-surface-container border border-tertiary/10 rounded-2xl shadow-2xl overflow-hidden"
              >
                {/* Reader Header Nav */}
                <div className="p-4 bg-[#0d0d11]/60 border-b border-tertiary/10 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                      onClick={() => setSelectedBook(null)}
                      className="px-4 py-2 bg-on-primary-fixed-variant hover:bg-on-primary-container text-primary-fixed border border-primary/25 rounded-xl text-xs font-bold transition-all uppercase shrink-0 focus:outline-none"
                    >
                      &larr; Recursos
                    </button>
                    <div className="min-w-0 text-left">
                      <p className="text-[8px] font-mono font-bold text-primary uppercase leading-none">{selectedBook.category}</p>
                      <h3 className="text-sm font-bold text-white uppercase mt-1 truncate">{selectedBook.title}</h3>
                    </div>
                  </div>

                  {/* Chapter Select Button Bar */}
                  <div className="flex flex-wrap gap-1.5 w-full md:w-auto justify-start md:justify-end">
                    {(selectedBook.chapters || []).map((ch, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveChapterIdx(idx)}
                        className={`px-3.5 py-2 text-[11px] font-mono font-bold rounded-lg border transition-all focus:outline-none ${
                          activeChapterIdx === idx 
                            ? 'bg-on-primary-fixed-variant text-primary border-primary/30 shadow-md font-bold' 
                            : 'bg-[#121212]/40 text-on-surface-variant border-tertiary/10 hover:border-tertiary/20 hover:text-white'
                        }`}
                      >
                        Cap. {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reader Content Body */}
                <div className="p-6 md:p-8 space-y-6 text-left max-h-[500px] overflow-y-auto bg-black/40">
                  <h2 className="text-lg md:text-xl font-bold text-primary uppercase tracking-tight pb-3 border-b border-dashed border-tertiary/10">
                    {getTranslatedEbookText(selectedBook.chapters[activeChapterIdx].title, language)}
                  </h2>
                  
                  <div className="text-xs md:text-sm text-on-surface-variant font-medium leading-relaxed whitespace-pre-line space-y-4">
                    {getTranslatedEbookText(selectedBook.chapters[activeChapterIdx].content, language)}
                  </div>
                </div>

                {/* Reader Footer Control Bar */}
                <div className="p-4 bg-[#0d0d11]/60 border-t border-tertiary/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-[10px] font-mono text-on-surface-variant font-bold">
                    Capítulo {activeChapterIdx + 1} de {(selectedBook.chapters || []).length} • Leyendo de Waack On
                  </div>

                  <div className="flex gap-2">
                    <button
                      disabled={activeChapterIdx === 0}
                      onClick={() => setActiveChapterIdx(prev => prev - 1)}
                      className="px-3.5 py-1.5 bg-[#121212]/40 hover:bg-[#121212] border border-tertiary/10 text-on-surface text-xs font-bold rounded-xl disabled:opacity-40 disabled:pointer-events-none transition-all focus:outline-none"
                    >
                      Anterior
                    </button>
                    
                    {activeChapterIdx + 1 < (selectedBook.chapters || []).length ? (
                      <button
                        onClick={() => setActiveChapterIdx(prev => prev + 1)}
                        className="px-3.5 py-1.5 bg-on-primary-fixed-variant hover:bg-on-primary-container text-primary-fixed border border-primary/25 rounded-xl text-xs font-bold transition-all focus:outline-none"
                      >
                        Siguiente Capítulo
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedBook(null)}
                        className="px-3.5 py-1.5 bg-on-primary-fixed-variant hover:bg-on-primary-container text-primary-fixed border border-primary/25 rounded-xl text-xs font-bold transition-all uppercase focus:outline-none"
                      >
                        Terminar Lectura
                      </button>
                    )}
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* Theoretical Notebook section below, active inside active reader or shelf */}
          {selectedBook && (
            <div className="bg-surface-container border border-tertiary/10 rounded-2xl p-5 shadow-2xl">
              <div className="border-b border-tertiary/10 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <NotebookIcon className="w-5 h-5 text-primary" />
                  <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    MIS APUNTES DE ESTUDIO: {(selectedBook?.title || '').toUpperCase()}
                  </h3>
                </div>
                
                <AnimatePresence>
                  {noteSaveSuccess && (
                    <motion.span 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-[9px] font-mono font-bold text-green-400 bg-green-950/40 px-2 py-0.5 rounded border border-green-500/30 uppercase flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Apunte Sincronizado
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-4 space-y-3">
                <textarea
                  rows={4}
                  value={notebookNotes[selectedBook.id] || ''}
                  onChange={(e) => setNotebookNotes({ ...notebookNotes, [selectedBook.id]: e.target.value })}
                  placeholder="Redacta tus reflexiones, preguntas, notas sobre fundadores o ideas de personajes teatrales para tus próximas coreografías..."
                  className="w-full text-xs font-bold bg-[#0d0d11]/80 border border-tertiary/15 rounded-xl px-3 py-2.5 text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-tertiary/30 leading-relaxed text-left"
                />

                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                  <p className="text-[9px] text-on-surface-variant font-bold uppercase leading-none text-left">
                    💡 Las notas se guardan en tu perfil para repasar antes de entrenar de forma práctica.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSaveNote(selectedBook.id, notebookNotes[selectedBook.id] || '')}
                    disabled={isSavingNote}
                    className="px-4 py-2 bg-on-primary-fixed-variant hover:bg-on-primary-container text-primary-fixed border border-primary/25 text-xs font-bold rounded-xl transition-all uppercase flex items-center gap-1.5 focus:outline-none"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingNote ? 'Guardando...' : 'Guardar Apuntes'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Theoretical Quiz & Quick Knowledge Cards (4 Cols) */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Section: RETO DE CONOCIMIENTO (Interactive Quiz) */}
          <div className="bg-surface-container border border-tertiary/10 rounded-2xl p-5 shadow-2xl text-on-surface">
            <div className="border-b border-tertiary/10 pb-3 text-left">
              <span className="text-[9px] font-mono font-bold text-primary bg-primary-container/20 border border-primary/20 px-2 py-0.5 rounded uppercase">
                PONTE A PRUEBA
              </span>
              <h3 className="text-sm font-bold text-white uppercase mt-1">RETO DE CONOCIMIENTO</h3>
            </div>

            <AnimatePresence mode="wait">
              {!quizActive ? (
                // Start screen
                <motion.div 
                  key="quiz-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 pt-2 text-center"
                >
                  {/* Engraved brain, rotating slowly in a lamplit plaque */}
                  <div
                    className="w-20 h-20 mx-auto rounded-full flex items-center justify-center border border-primary/20 shadow-[inset_0_0_18px_rgba(0,0,0,.7)] bg-[radial-gradient(circle_at_50%_40%,rgba(233,195,73,.12),transparent_70%)]"
                    style={{ perspective: '600px' }}
                  >
                    <BrainCircuit className="w-9 h-9 text-primary ebook-brain-spin drop-shadow-[0_0_6px_rgba(233,195,73,.5)]" />
                  </div>
                  <h4 className="text-xs font-bold uppercase text-white mt-2">¿Cuánto sabes sobre Waacking?</h4>
                  <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed">
                    Responde estas {QUIZ_QUESTIONS.length} preguntas interactivas basadas en la historia subterránea de Los Ángeles y demuestra que dominas el plano cultural de tu danza.
                  </p>

                  {/* "Empezar Test" rendered as a physical gear-driven lever switch */}
                  <button
                    onClick={() => {
                      setQuizActive(true);
                      handleRestartQuiz();
                    }}
                    className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-primary/25 bg-gradient-to-b from-[#26232a] to-[#15131a] shadow-[inset_0_1px_0_rgba(255,255,255,.12),inset_0_-2px_6px_rgba(0,0,0,.6),0_4px_12px_-4px_rgba(0,0,0,.9)] hover:border-[#E9C349]/50 transition-all focus:outline-none"
                  >
                    <span className="relative w-6 h-6 shrink-0 text-[#E9C349]/70">
                      <Cog className="w-6 h-6 absolute inset-0 ebook-gear-cw" />
                      <Cog className="w-3.5 h-3.5 absolute -right-1 -bottom-1 ebook-gear-ccw" />
                    </span>
                    <span className="flex-1 min-w-0 flex flex-col items-start gap-0.5 text-left">
                      <span className="text-[11.5px] font-extrabold tracking-wide uppercase text-[#f2e6c4]">Empezar Test</span>
                      <span className="text-[8px] font-mono font-bold tracking-widest uppercase text-[#E9C349]/60">Palanca &middot; {QUIZ_QUESTIONS.length} preguntas</span>
                    </span>
                    <span className="w-11 h-[22px] shrink-0 rounded-full bg-gradient-to-b from-[#0d0c0f] to-[#1a181c] border border-black/80 shadow-[inset_0_2px_5px_rgba(0,0,0,.9)] relative">
                      <span className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-[radial-gradient(circle_at_35%_28%,#f4e7bd,#c8a63f_50%,#7d6420)] shadow-[0_2px_5px_rgba(0,0,0,.85),inset_0_1px_0_rgba(255,255,255,.5)] transition-transform duration-300 group-hover:translate-x-5" />
                    </span>
                  </button>
                </motion.div>
              ) : quizFinished ? (
                // Score Screen
                <motion.div 
                  key="quiz-score"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 pt-2 text-center"
                >
                  <div className="w-14 h-14 bg-primary-container/20 border border-primary/25 rounded-full flex items-center justify-center mx-auto text-[#E9C349] text-xl shadow-xl">
                    <Award className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase text-white mt-2">Test Completado</h4>
                    <p className="text-xs font-mono font-bold text-primary mt-1 uppercase">PUNTUACIÓN: {score} de {QUIZ_QUESTIONS.length} aciertos</p>
                  </div>
                  
                  <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed px-2">
                    {score === QUIZ_QUESTIONS.length 
                      ? "🏆 ¡Increíble! Eres un maestro absoluto de la historia y las raíces de club."
                      : score >= 2 
                        ? "✨ ¡Buen intento! Sabes lo básico, pero repasa los recursos para alcanzar la excelencia teatral."
                        : "📚 Te recomendamos leer detenidamente 'La Historia del Waacking' para conectar mejor con tus rolls."}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={handleRestartQuiz}
                      className="flex-1 py-2 bg-[#121212]/40 hover:bg-[#121212] border border-tertiary/10 text-on-surface text-xs font-bold rounded-xl transition-all uppercase focus:outline-none"
                    >
                      Reintentar
                    </button>
                    <button
                      onClick={() => setQuizActive(false)}
                      className="flex-1 py-2 bg-on-primary-fixed-variant hover:bg-on-primary-container text-primary-fixed border border-primary/25 text-xs font-bold rounded-xl transition-all uppercase focus:outline-none"
                    >
                      Salir
                    </button>
                  </div>
                </motion.div>
              ) : (
                // Interactive Question Screen
                <motion.div 
                  key="quiz-question"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4 pt-1"
                >
                  {/* Progress Indicator */}
                  <div className="flex justify-between items-center text-[9px] font-mono font-bold text-on-surface-variant uppercase">
                    <span>Pregunta {currentQuestionIdx + 1} de {QUIZ_QUESTIONS.length}</span>
                    <span>Aciertos: {score}</span>
                  </div>

                  {/* Question Box */}
                  <div className="p-3 bg-[#0d0d11]/80 border border-tertiary/15 rounded-xl text-left">
                    <p className="text-xs font-bold text-white leading-relaxed uppercase">
                      {QUIZ_QUESTIONS[currentQuestionIdx].question}
                    </p>
                  </div>

                  {/* Options List */}
                  <div className="space-y-2">
                    {QUIZ_QUESTIONS[currentQuestionIdx].options.map((option, idx) => {
                      const isSelected = selectedOption === option;
                      const isCorrect = option === QUIZ_QUESTIONS[currentQuestionIdx].answer;
                      let optionStyle = "bg-[#121212]/40 border-tertiary/10 text-on-surface-variant hover:border-tertiary/25 hover:text-white";

                      if (showExplanation) {
                        if (isCorrect) {
                          optionStyle = "bg-green-950/40 border-green-500/40 text-green-300";
                        } else if (isSelected) {
                          optionStyle = "bg-red-950/40 border-red-500/40 text-red-300";
                        } else {
                          optionStyle = "bg-[#121212]/10 border-tertiary/5 text-on-surface-variant/40";
                        }
                      } else if (isSelected) {
                        optionStyle = "bg-on-primary-fixed-variant/40 border-primary text-primary shadow-lg";
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={showExplanation}
                          onClick={() => handleSelectOption(option)}
                          className={`w-full p-2.5 text-left text-xs font-bold rounded-xl border transition-all flex items-center justify-between ${optionStyle}`}
                        >
                          <span>{option}</span>
                          {showExplanation && isCorrect && <Check className="w-4 h-4 text-green-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanatory Box */}
                  {showExplanation && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-[#E9C349]/10 rounded-xl border border-[#E9C349]/20 text-left text-[10px] leading-relaxed text-[#E9C349]"
                    >
                      <span className="font-mono font-bold text-[9px] uppercase tracking-wider block text-[#E9C349] mb-1">📖 SABÍAS QUE...</span>
                      {QUIZ_QUESTIONS[currentQuestionIdx].explanation}
                    </motion.div>
                  )}

                  {/* Submit / Next Button */}
                  <div className="pt-2">
                    {!showExplanation ? (
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={!selectedOption}
                        className="w-full py-2.5 bg-on-primary-fixed-variant hover:bg-on-primary-container text-primary-fixed border border-primary/25 text-xs font-bold rounded-xl transition-all uppercase disabled:opacity-40 disabled:pointer-events-none focus:outline-none"
                      >
                        Enviar Respuesta
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuestion}
                        className="w-full py-2.5 bg-on-primary-fixed-variant hover:bg-on-primary-container text-primary-fixed border border-primary/25 text-xs font-bold rounded-xl transition-all uppercase flex items-center justify-center gap-1 focus:outline-none"
                      >
                        <span>{currentQuestionIdx + 1 === QUIZ_QUESTIONS.length ? 'Finalizar Test' : 'Siguiente Pregunta'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Quick Study Checklist cards */}
          <div className="bg-surface-container border border-tertiary/10 rounded-2xl p-5 shadow-2xl">
            <div className="text-left">
              <span className="text-[9px] font-mono font-bold text-[#E9C349] bg-[#E9C349]/10 border border-[#E9C349]/20 px-2 py-0.5 rounded uppercase">
                RUTINA DE ESTUDIO
              </span>
              <h3 className="text-sm font-bold text-white uppercase mt-1">METODOLOGÍA WAACK ON</h3>
            </div>
            
            <div className="mt-4 space-y-3">
              {[
                { title: 'Leer capítulo teórico semanal', checked: true },
                { title: 'Conectar la historia al estilo del baile', checked: true },
                { title: 'Anotar un personaje teatral en el bloc', checked: false },
                { title: 'Hacer el test con 100% de aciertos', checked: false }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 p-2 bg-[#0d0d11]/80 border border-tertiary/10 rounded-xl">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${item.checked ? 'bg-[#E9C349]/20 border-[#E9C349] text-[#E9C349]' : 'bg-[#0d0d11] border-tertiary/20'}`}>
                    {item.checked && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                  </div>
                  <span className="text-[10px] font-bold text-on-surface-variant leading-tight uppercase text-left">{item.title}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      </div>
      </div>

    {/* Checkout Modal Overlay */}
    {purchasingProduct && (
      <div className="fixed inset-0 bg-[#0d0d11]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface-container border border-tertiary/10 rounded-2xl max-w-md w-full p-6 shadow-2xl text-on-surface space-y-5"
        >
          {/* Header */}
          <div className="flex justify-between items-start border-b border-tertiary/10 pb-3">
            <div className="text-left">
              <span className="text-[8px] font-mono font-bold text-primary bg-primary-container/20 border border-primary/20 px-2 py-0.5 rounded uppercase">MÉTODO DE PAGO SEGURO</span>
              <h3 className="text-md font-bold text-white uppercase mt-1">CHECKOUT WAACK ON</h3>
            </div>
            <button 
              onClick={() => setPurchasingProduct(null)} 
              className="text-on-surface-variant hover:text-white font-bold text-sm"
            >
              ✕
            </button>
          </div>

          {checkoutStep === 'entering' && (
            <div className="space-y-4">
              <div className="bg-[#0d0d11]/80 p-3 rounded-xl border border-tertiary/10 text-[11px] leading-relaxed text-left">
                <p className="font-bold uppercase text-[9px] text-on-surface-variant/70">PRODUCTO A ADQUIRIR:</p>
                <p className="text-primary font-bold uppercase text-xs mt-1">{purchasingProduct.title} ({purchasingProduct.price})</p>
              </div>

              {/* VISUAL CREDIT CARD */}
              <div className="bg-gradient-to-tr from-[#121212] to-on-primary-fixed-variant rounded-2xl border border-tertiary/20 p-5 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute right-[-20px] bottom-[-20px] w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-mono tracking-widest text-[#E9C349] font-bold">WAACK ON PAY</span>
                  <span className="text-[9px] font-mono text-on-surface-variant">CREDIT CARD</span>
                </div>
                <div className="w-8 h-6 bg-amber-400/80 rounded-sm mb-3 border border-black/20" />
                <p className="font-mono text-md tracking-widest text-center mb-4">4000 1234 5678 1972</p>
                <div className="flex justify-between items-end text-[10px] font-mono">
                  <div className="text-left">
                    <p className="text-[7px] text-on-surface-variant">TITULAR</p>
                    <p className="font-bold uppercase">{currentUser.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[7px] text-on-surface-variant">VENCE</p>
                    <p className="font-bold">12/30</p>
                  </div>
                </div>
              </div>

              {/* Action button */}
              <button
                onClick={async () => {
                  setCheckoutStep('processing');
                  try {
                    const res = await fetch('/api/stripe/create-checkout-session', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        tier: 'ebook',
                        successUrl: window.location.origin + '?payment=success_ebook',
                        cancelUrl: window.location.origin,
                      })
                    });
                    const data = await res.json();
                    if (data.url && data.mode === 'stripe') {
                      window.location.href = data.url;
                      return;
                    }
                  } catch (e) {
                    console.error('[Ebook Stripe Error]:', e);
                  }
                  setTimeout(() => {
                    setUnlockedProducts(prev => [...prev, purchasingProduct.id]);
                    setCheckoutStep('success');
                  }, 1800);
                }}
                className="w-full py-3 bg-on-primary-fixed-variant hover:bg-on-primary-container text-primary-fixed border border-primary/25 rounded-xl font-bold text-xs shadow-lg hover:scale-102 active:scale-95 transition-all uppercase flex items-center justify-center gap-1.5 focus:outline-none"
              >
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                COMPRAR CON STRIPE ({purchasingProduct.price})
              </button>
            </div>
          )}

          {checkoutStep === 'processing' && (
            <div className="py-8 flex flex-col items-center text-center space-y-4">
              <div className="relative w-12 h-12">
                <div className="w-12 h-12 border-4 border-primary-container border-t-primary rounded-full animate-spin" />
              </div>
              <div>
                <h4 className="text-xs font-mono font-bold text-primary uppercase tracking-widest animate-pulse">PROCESANDO TRANSACCIÓN...</h4>
                <p className="text-[11px] text-on-surface-variant font-medium mt-2">Conectando con la pasarela de Waacking Academy Pay de forma encriptada de 256 bits...</p>
              </div>
            </div>
          )}

          {checkoutStep === 'success' && (
            <div className="py-6 flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 bg-green-950/40 text-green-400 border border-green-500/30 rounded-full flex items-center justify-center shadow-lg text-xl font-bold">
                ✓
              </div>
              <div>
                <h4 className="text-sm font-bold text-green-400 uppercase">¡PRODUCTO DESBLOQUEADO!</h4>
                <p className="text-[11px] text-on-surface-variant font-medium mt-1">Tu pago por <strong className="text-white font-black">{purchasingProduct.price}</strong> se completó con éxito.</p>
                <p className="text-[10px] text-primary font-mono font-bold mt-2 bg-primary-container/20 p-1.5 rounded border border-primary/20 uppercase">Ya puedes descargar tu archivo desde tu biblioteca virtual.</p>
              </div>
              <button
                onClick={() => setPurchasingProduct(null)}
                className="px-6 py-2 bg-on-primary-fixed-variant hover:bg-on-primary-container border border-primary/25 text-primary-fixed text-xs font-bold rounded-xl transition-all uppercase focus:outline-none"
              >
                Volver a la Tienda
              </button>
            </div>
          )}
        </motion.div>
      </div>
    )}

  </div>
);
}
