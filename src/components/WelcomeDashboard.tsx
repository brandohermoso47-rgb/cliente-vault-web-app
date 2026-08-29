import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  GraduationCap, 
  Music, 
  Trophy, 
  Users, 
  Play, 
  CheckCircle2, 
  ArrowRight, 
  Globe, 
  Star, 
  Zap, 
  ShieldCheck, 
  Sliders, 
  Layers, 
  Check, 
  ChevronRight,
  Info,
  Award,
  Search,
  BookOpen,
  Calendar,
  Video,
  X,
  MessageSquare,
  UserCheck,
  Target,
  Flame,
  Radio,
  Film,
  Crown,
  Briefcase
} from 'lucide-react';
import { User, UserRole } from '../types';

export interface GlobalInstructorData {
  id: string;
  name: string;
  role: string;
  avatar: string;
  country: string;
  rating: number;
  studentsCount: number;
  specialties: string[];
  bio: string;
  monthlyPrice: string;
  planHighlights: string[];
  featured?: boolean;
  badge?: string;
  syllabus: {
    week: number;
    title: string;
    description: string;
    focus: string[];
  }[];
}

interface WelcomeDashboardProps {
  currentUser: User;
  setActiveTab: (tab: any) => void;
  onOpenPlansModal?: () => void;
  onSubscribeInstructor?: (instructorName: string, price: string) => void;
  onSwitchToPracticeDashboard?: () => void;
  language?: string;
  onUserChange?: (updater: (prev: User) => User) => void;
}

export default function WelcomeDashboard({
  currentUser,
  setActiveTab,
  onOpenPlansModal,
  onSubscribeInstructor,
  onSwitchToPracticeDashboard,
  language = 'es',
  onUserChange
}: WelcomeDashboardProps) {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [subscribedNotice, setSubscribedNotice] = useState<string | null>(null);
  const [previewInstructor, setPreviewInstructor] = useState<GlobalInstructorData | null>(null);

  // Onboarding Step Checkmarks State for New Users
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('waackon_new_user_steps');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      explore: false,
      drill: false,
      goals: false,
      community: false
    };
  });

  const toggleStep = (stepKey: string) => {
    setCompletedSteps(prev => {
      const next = { ...prev, [stepKey]: !prev[stepKey] };
      localStorage.setItem('waackon_new_user_steps', JSON.stringify(next));
      return next;
    });
  };

  // Assigned Instructor state
  const assignedInstructorId = useMemo(() => {
    if (currentUser.subscribedInstructorIds && currentUser.subscribedInstructorIds.length > 0) {
      return currentUser.subscribedInstructorIds[0];
    }
    return localStorage.getItem('waackon_assigned_instructor_id') || null;
  }, [currentUser.subscribedInstructorIds]);

  const assignedInstructorName = useMemo(() => {
    return localStorage.getItem('waackon_assigned_instructor_name') || null;
  }, [assignedInstructorId]);

  // Global Teachers Directory Data
  const GLOBAL_INSTRUCTORS: GlobalInstructorData[] = [
    {
      id: 'inst-brando',
      name: 'Brando Hermoso',
      role: 'Master de Biomecánica y Director Técnico',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
      country: 'España 🇪🇸',
      rating: 4.9,
      studentsCount: 1540,
      specialties: ['Fast Rolls', 'Mecánica Articular', 'Postura Somática', 'Biomecánica'],
      bio: 'Pionero en la sistematización biomecánica del Waacking en Europa. Formador de campeones internacionales y creador de la metodología de disociación escapular para giros limpios a más de 125 BPM.',
      monthlyPrice: '$45 USD/mes',
      planHighlights: [
        'Acceso a todas sus Cátedras de Rolls de Alta Velocidad',
        'Revisión personalizada de video mensual con corrección de ángulos',
        'Acceso a Jamming Privado quincenal en vivo por Google Meet'
      ],
      featured: true,
      badge: 'Cátedra Titular',
      syllabus: [
        {
          week: 1,
          title: 'Semana 1: Alineación Somática & Port de Bras',
          description: 'Apertura de caja torácica, desbloqueo escapular y trayectoria limpia de antebrazos.',
          focus: ['Disociación Escapular', 'Eje Vertical', 'Ergonomía de Muñeca']
        },
        {
          week: 2,
          title: 'Semana 2: Wrist Rolls & Overhands a 120+ BPM',
          description: 'Mecánica de aceleración constante sin contractura del trapecio ni balanceo del torso.',
          focus: ['Aceleración Isométrica', 'Control de Inercia', 'Transición Fluida']
        },
        {
          week: 3,
          title: 'Semana 3: Disociación de Codos & Muñecas',
          description: 'Aislamiento de extremidades superiores mientras se ejecutan pasos de base y desplazamientos.',
          focus: ['Desplazamiento Escénico', 'Aislamiento Torácico', 'Líneas Dinámicas']
        },
        {
          week: 4,
          title: 'Semana 4: Evaluación Técnica & Certificación Biomecánica',
          description: 'Simulación de prueba técnica y entrega de feedback detallado con rúbrica oficial.',
          focus: ['Revisión 1v1', 'Puntaje de Simetría', 'Certificado Waack On']
        }
      ]
    },
    {
      id: 'inst-kumari',
      name: 'Kumari "WaackQueen"',
      role: 'Directora de Expresión Teatral & Pasarela',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      country: 'Estados Unidos 🇺🇸',
      rating: 4.8,
      studentsCount: 920,
      specialties: ['Expresión Teatral', 'Pasarela Disco', 'Carácter Actoral', 'Posing'],
      bio: 'Especialista en la dramaturgia del movimiento, presencia escénica y el arte del posing retro inspirado en los legendarios clubs de Los Ángeles de los años 70.',
      monthlyPrice: '$38 USD/mes',
      planHighlights: [
        'Módulos exclusivos de Posing Dramático y Proyección Escénica',
        'Feedback actoral y de sincronización emocional con la pista',
        'Taller de diseño de vestuario y performance para batallas'
      ],
      featured: true,
      badge: 'Masterclass Élite',
      syllabus: [
        {
          week: 1,
          title: 'Semana 1: Presencia Escénica & Mirada Magnética',
          description: 'Uso de la mirada, ángulos faciales y respiración conectada con el carácter escénico.',
          focus: ['Contacto Visual', 'Proyección', 'Actitud 70s']
        },
        {
          week: 2,
          title: 'Semana 2: Pasarela Disco & Líneas de Posing',
          description: 'Caminar con peso dramático en el contratiempo y rematar con poses de alta costura.',
          focus: ['Pasarela Retro', 'Congelados Limpios', 'Dinámica de Pasos']
        },
        {
          week: 3,
          title: 'Semana 3: Dramaturgia Musical & Narrativa Emocional',
          description: 'Interpretar letras de Soul, Funk y Disco llevando la historia del tema al cuerpo.',
          focus: ['Lectura de Vocales', 'Dramatización', 'Contraste de Energía']
        },
        {
          week: 4,
          title: 'Semana 4: Showcase Individual & Master Feedback',
          description: 'Grabación de rutina solista con vestuario conceptual y retroalimentación de jurado.',
          focus: ['Showcase Grabado', 'Feedback Estético', 'Certificación Actoral']
        }
      ]
    },
    {
      id: 'inst-yoonji',
      name: 'YoonJi Kim',
      role: 'Master de Musicalidad & Síncopas Disco',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300',
      country: 'Corea del Sur 🇰🇷',
      rating: 4.9,
      studentsCount: 1150,
      specialties: ['Musicalidad Rítmica', 'Aislamiento de Codos', 'Síncopa Disco', 'Ritmo'],
      bio: 'Referente mundial en acentuación rítmica a contratiempo. Su método combina precisión quirúrgica de brazos con musicalidad profunda de baterías y cuerdas.',
      monthlyPrice: '$48 USD/mes',
      planHighlights: [
        'Laboratorio de Síncopas y BPMs Avanzados (120-135 BPM)',
        'Análisis auditivo y descomposición de tracks Disco clásicos',
        'Sesión en vivo de preguntas y corrección rítmica mensual'
      ],
      featured: true,
      badge: 'Cátedra Internacional',
      syllabus: [
        {
          week: 1,
          title: 'Semana 1: Polirritmia & Capas Instrumentales',
          description: 'Identificación de platillos (hi-hats), cajas y líneas de bajo slap en música de los 70s.',
          focus: ['Desglose Auditivo', 'Hi-Hats a Contratiempo', 'Acentos de Caja']
        },
        {
          week: 2,
          title: 'Semana 2: Síncopas en Giros & Poses',
          description: 'Clavar remates en la subdivisión "y" del compás sin perder la velocidad del compás 4/4.',
          focus: ['Subdivisiones Rítmicas', 'Pausa Sincopada', 'Velocidad de Reacción']
        },
        {
          week: 3,
          title: 'Semana 3: Micro-Aislamientos a Altos BPMs',
          description: 'Aislamientos de muñecas y codos en tiempos dobles (double-time) a 130 BPM.',
          focus: ['Double-Time Rolls', 'Resistencia Isométrica', 'Precisión Cuántica']
        },
        {
          week: 4,
          title: 'Semana 4: Desafío de Musicalidad en Vivo',
          description: 'Jam con pistas aleatorias sorpresa y análisis en tiempo real de tu interpretación auditiva.',
          focus: ['Random Track Jam', 'Evaluación de Ritmo', 'Graduación de Cátedra']
        }
      ]
    },
    {
      id: 'inst-ibuki',
      name: 'Ibuki Imata',
      role: 'Master de Velocidad, Resistencia & Freestyle',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
      country: 'Japón 🇯🇵',
      rating: 4.9,
      studentsCount: 2100,
      specialties: ['Velocidad Sostenida', 'Freestyle Dinámico', 'BPM Avanzados', 'Batallas'],
      bio: 'Leyenda viva del freestyle global de Waacking. Su enfoque explora la resistencia cardiovascular, la potencia de giros y la improvisación pura sobre tracks de alta energía.',
      monthlyPrice: '$42 USD/mes',
      planHighlights: [
        'Rutinas de velocidad extrema y resistencia isométrica de brazos',
        'Técnicas de control mental, respiración y estrategia para batallas 1v1',
        'Acceso al grupo exclusivo de alumnos de Asia, Europa & América'
      ],
      featured: false,
      badge: 'Master Élite',
      syllabus: [
        {
          week: 1,
          title: 'Semana 1: Acondicionamiento de Hombros & Stamina',
          description: 'Drills de 10 minutos continuos para generar resistencia muscular sin dolor de cuello.',
          focus: ['Stamina de Brazos', 'Eficiencia de Oxígeno', 'Tono Escapular']
        },
        {
          week: 2,
          title: 'Semana 2: Cadencia & Dinámica de Batalla',
          description: 'Aprender a alternar momentos de explosividad con pausas intrigantes que desconciertan al rival.',
          focus: ['Estrategia 1v1', 'Picos de Velocidad', 'Presión Psicológica']
        },
        {
          week: 3,
          title: 'Semana 3: Freestyle Sin Filtros',
          description: 'Superar el bloqueo mental y encadenar combos espontáneos con confianza absoluta.',
          focus: ['Fluidez Mental', 'Improvisación Pura', 'Cero Dudas']
        },
        {
          week: 4,
          title: 'Semana 4: Torneo Interno de Cátedra',
          description: 'Batallas simuladas entre alumnos de la cátedra con retroalimentación personalizada de Ibuki.',
          focus: ['Batalla Virtual', 'Feedback Estratégico', 'Badge de Freestyle']
        }
      ]
    },
    {
      id: 'inst-lorena',
      name: 'Lorena "La Waack"',
      role: 'Especialista en Simetría, Líneas Limpias & Elegancia',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
      country: 'Colombia 🇨🇴',
      rating: 4.7,
      studentsCount: 480,
      specialties: ['Pose Simétrica', 'Vibras de los 70s', 'Elegancia de Brazos', 'Simetría'],
      bio: 'Investigadora del movimiento fluido y las líneas limpias. Enfocada en guiar a estudiantes paso a paso desde los fundamentos hasta la elegancia escénica pulida.',
      monthlyPrice: '$29 USD/mes',
      planHighlights: [
        'Módulos paso a paso diseñados para principiantes e intermedios',
        'Guías descargables de alineación postural frente al espejo',
        'Comunidad activa de estudio y mentoría en español'
      ],
      featured: false,
      badge: 'Docente Oficial',
      syllabus: [
        {
          week: 1,
          title: 'Semana 1: Los 5 Ángulos Clave de Brazos',
          description: 'Posiciones cardinales de brazos, paralelismo y limpieza de diagonales.',
          focus: ['Geometría Corporal', 'Espejo Frontal', 'Simetría de Muñecas']
        },
        {
          week: 2,
          title: 'Semana 2: Transiciones Suaves & Ligaduras',
          description: 'Cómo conectar una pose con la siguiente sin movimientos bruscos ni dudas.',
          focus: ['Fluidez Continua', 'Respiración de Brazos', 'Elegancia Clásica']
        },
        {
          week: 3,
          title: 'Semana 3: Extensiones & Proyección de Líneas',
          description: 'Uso de las yemas de los dedos y extensión completa del tríceps para alargar la figura.',
          focus: ['Extensión de Dedos', 'Líneas Escénicas', 'Control Postural']
        },
        {
          week: 4,
          title: 'Semana 4: Evaluación de Limpieza Técnica',
          description: 'Grabación en espejo con análisis minucioso de simetría y correcciones puntuales.',
          focus: ['Revisión Simétrica', 'Guía de Hábitos', 'Diploma de Fundamentos']
        }
      ]
    },
    {
      id: 'inst-master-rhythm',
      name: 'Alexander Jackson',
      role: 'Master de Aislamientos Torácicos & Control Dinámico',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
      country: 'Estados Unidos 🇺🇸',
      rating: 5.0,
      studentsCount: 840,
      specialties: ['Arm Velocity', 'Aislamiento Torácico', 'Control Dinámico', 'Biomecánica'],
      bio: 'Especializado en transiciones rápidas de muñecas a hombros y el desarrollo de potencia controlada sin perder la estética y soltura disco original.',
      monthlyPrice: '$35 USD/mes',
      planHighlights: [
        'Drills diarios progresivos de 15 minutos en video HD',
        'Seguimiento en la plataforma Waack On con asignación de tareas',
        'Acceso a biblioteca de audios exclusivos de entrenamiento'
      ],
      featured: false,
      badge: 'Cátedra Waack On',
      syllabus: [
        {
          week: 1,
          title: 'Semana 1: Aislamiento de Pecho & Hombros',
          description: 'Disociación del torso respecto a los brazos para dar mayor profundidad al movimiento.',
          focus: ['Caja Torácica', 'Hombro Neutral', 'Respiración']
        },
        {
          week: 2,
          title: 'Semana 2: Contraste Dinámico (Staccato vs Legato)',
          description: 'Manejo de frenadas en seco seguidas de deslizamientos fluidos de brazos.',
          focus: ['Frenada en Seco', 'Flujo Continuo', 'Dinámica Musical']
        },
        {
          week: 3,
          title: 'Semana 3: Secuencias Rápidas de Manos & Cuello',
          description: 'Pases de mano sobre la cabeza y detrás de la nuca con precisión milimétrica.',
          focus: ['Overhead Passes', 'Protección Articular', 'Velocidad']
        },
        {
          week: 4,
          title: 'Semana 4: Prueba de Maestría & Asignación de Tareas',
          description: 'Examen de integración de conceptos con retroalimentación personalizada en la plataforma.',
          focus: ['Video Examen', 'Ruta Personalizada', 'Certificado Oficial']
        }
      ]
    }
  ];

  // Filter instructors by specialty and search term
  const filteredInstructors = useMemo(() => {
    return GLOBAL_INSTRUCTORS.filter((inst) => {
      const matchesSpecialty = selectedSpecialty === 'todos' || 
        inst.specialties.some(s => s.toLowerCase().includes(selectedSpecialty.toLowerCase())) ||
        inst.role.toLowerCase().includes(selectedSpecialty.toLowerCase());

      const matchesSearch = searchQuery.trim() === '' ||
        inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        inst.country.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSpecialty && matchesSearch;
    });
  }, [selectedSpecialty, searchQuery]);

  // Handler for assigning an instructor
  const handleAssignInstructor = (instructor: GlobalInstructorData) => {
    localStorage.setItem('waackon_assigned_instructor_id', instructor.id);
    localStorage.setItem('waackon_assigned_instructor_name', instructor.name);
    localStorage.setItem('waackon_assigned_instructor_avatar', instructor.avatar);
    localStorage.setItem('waackon_assigned_instructor_role', instructor.role);

    if (onUserChange) {
      onUserChange(prev => ({
        ...prev,
        role: 'student', // Assign student role upon subscribing to an instructor!
        subscribedInstructorIds: Array.from(new Set([...(prev.subscribedInstructorIds || []), instructor.id])),
        subscriptionTier: 'instructor_pass',
        points: (prev.points || 0) + 50 // Onboarding assignment bonus points!
      }));
    }

    setSubscribedNotice(`🎉 ¡Felicidades! Te has suscrito a la Cátedra de ${instructor.name}. Tu rol de Alumno ha sido activado (+50 PTS bonus).`);
    setTimeout(() => setSubscribedNotice(null), 4500);

    if (previewInstructor) {
      setPreviewInstructor(null);
    }
  };

  const handleSubscribeClick = (instructor: GlobalInstructorData) => {
    handleAssignInstructor(instructor);
    if (onSubscribeInstructor) {
      onSubscribeInstructor(instructor.name, instructor.monthlyPrice);
    } else if (onOpenPlansModal) {
      onOpenPlansModal();
    }
  };

  const handleChooseRole = (role: UserRole) => {
    if (role === 'student' && (!currentUser.subscribedInstructorIds || currentUser.subscribedInstructorIds.length === 0)) {
      setSubscribedNotice(`⚠️ Para activar el rol de Estudiante, primero debes suscribirte a un instructor en el Directorio.`);
      setTimeout(() => setSubscribedNotice(null), 4000);
      const dirElement = document.getElementById('directorio-profesores-seccion');
      if (dirElement) {
        dirElement.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    if (onUserChange) {
      onUserChange(prev => ({
        ...prev,
        role: role
      }));
      setSubscribedNotice(`¡Rol seleccionado: ${role?.toUpperCase()}! Actualizando tu entorno...`);
      setTimeout(() => {
        setSubscribedNotice(null);
        if (onSwitchToPracticeDashboard) {
          onSwitchToPracticeDashboard();
        }
      }, 1200);
    }
  };

  return (
    <div className="space-y-8 w-full max-w-full mx-auto">
      {/* Toast Notice */}
      <AnimatePresence>
        {subscribedNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-white dark:bg-[#121212] border-2 border-[#E9C349] text-slate-900 dark:text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <Sparkles className="w-5 h-5 text-[#E9C349] animate-spin" />
            <span className="text-xs font-bold font-mono">{subscribedNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. HERO BANNER DE BIENVENIDA (Clean, Motivating, High-Impact) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-white to-white dark:from-[#1c1a12] dark:via-[#121212] dark:to-[#0A0A0A] border border-[#E9C349]/40 p-6 sm:p-8 md:p-10 shadow-2xl">
        {/* Background Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E9C349]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#9A2B3C]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header Tag and Role Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#E9C349] text-black text-[11px] font-mono font-black uppercase rounded-full shadow-md flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 fill-black" />
                <span>BIENVENIDO A WAACK ON</span>
              </span>
              <span className="text-xs font-mono font-bold text-slate-600 dark:text-[#8A8A8A] bg-slate-100 dark:bg-[#1a1a1a] px-3 py-1 rounded-full border border-slate-200 dark:border-white/5">
                ✨ Academia Global de Waacking
              </span>
            </div>

            {onSwitchToPracticeDashboard && (
              <button
                onClick={onSwitchToPracticeDashboard}
                className="px-4 py-1.5 bg-slate-100 dark:bg-[#1a1a1a] hover:bg-slate-200 dark:hover:bg-[#262626] text-[#E9C349] hover:text-slate-900 dark:hover:text-white border border-[#E9C349]/40 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer shadow"
              >
                <span>Ir al Dashboard de Entrenamiento</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Main Title & Value Proposition */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                ¡Hola, <span className="text-[#E9C349]">{currentUser.name || 'Bailarín'}</span>! Comienza tu viaje en el arte del <span className="underline decoration-[#9A2B3C] decoration-4">Waacking</span>.
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                Has ingresado a la academia digital líder a nivel mundial en técnica biomecánica, entrenamiento rítmico a contratiempo, historia disco de los 70s y cátedras internacionales con maestros certificados.
              </p>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveTab('cursos')}
                  className="px-5 py-3 bg-[#E9C349] hover:bg-[#d8b33c] text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>Iniciar Primera Lección (Nivel 1)</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    const dirElement = document.getElementById('directorio-profesores-seccion');
                    if (dirElement) {
                      dirElement.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-5 py-3 bg-white dark:bg-[#1c1b1b] hover:bg-slate-100 dark:hover:bg-[#262626] text-slate-900 dark:text-white border border-slate-200 dark:border-white/20 font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-[#E9C349]" />
                  <span>Explorar Profesores Globales</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    const plansEl = document.getElementById('planes-suscripcion-seccion');
                    if (plansEl) {
                      plansEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else {
                      setActiveTab('planes');
                    }
                  }}
                  className="px-5 py-3 bg-[#9A2B3C] hover:bg-[#81262c] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Award className="w-4 h-4 text-[#E9C349]" />
                  <span>Ver Planes & Membresías (Abajo)</span>
                </motion.button>
              </div>
            </div>

            {/* Quick Status / Quick Stats Snapshot */}
            <div className="lg:col-span-4 bg-white/80 dark:bg-[#0A0A0A]/80 border border-slate-200 dark:border-[#262626] rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
                <span className="text-[10px] font-mono font-bold text-[#E9C349] uppercase tracking-wider">
                  Tu Perfil de Inicio
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400 font-mono">Estado:</span>
                  <span className="font-bold text-emerald-400">Cuenta Activa</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400 font-mono">Rol Actual:</span>
                  <span className={`font-bold uppercase ${currentUser.role ? 'text-[#E9C349]' : 'text-slate-400'}`}>
                    {currentUser.role 
                      ? (currentUser.role === 'student' ? 'Estudiante / Alumno' : currentUser.role === 'instructor' ? 'Docente / Instructor' : currentUser.role === 'studio' ? 'Academia / Estudio' : currentUser.role)
                      : 'Sin Rol (Requiere Suscripción a Instructor)'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400 font-mono">Mentor Asignado:</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                    {assignedInstructorName ? `⭐ ${assignedInstructorName}` : 'Sin asignar aún'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400 font-mono">Puntos Acumulados:</span>
                  <span className="font-bold font-mono text-[#E9C349]">{currentUser.points || 0} PTS</span>
                </div>
              </div>

              {assignedInstructorName ? (
                <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-[11px] text-emerald-300 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Estás asignado a la cátedra de <strong>{assignedInstructorName}</strong>.</span>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-200 dark:border-white/10">
                  <p className="text-[11px] text-slate-500 dark:text-[#8A8A8A] italic">
                    💡 Tip: Explora el Directorio de Profesores abajo y asigna tu maestro titular para recibir acompañamiento personalizado.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* GUÍA DE PRIMEROS PASOS PARA NUEVOS USUARIOS (Interactive Onboarding Roadmap) */}
      <div className="bg-gradient-to-r from-amber-50 via-white to-amber-50 dark:from-[#141414] dark:via-[#161410] dark:to-[#141414] border border-[#E9C349]/30 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[#E9C349] text-xl">🚀</span>
              <h2 className="text-base sm:text-lg font-mono font-bold tracking-wider text-slate-900 dark:text-white uppercase">
                GUÍA DE PRIMEROS PASOS DEL USUARIO
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Completa estos 4 pasos recomendados para aprovechar al máximo tu experiencia en Waack On Academy.
            </p>
          </div>

          {/* Progress badge */}
          {(() => {
            const completedCount = Object.values(completedSteps).filter(Boolean).length;
            const percentage = Math.round((completedCount / 4) * 100);
            return (
              <div className="flex items-center gap-3 bg-white dark:bg-[#0A0A0A] px-4 py-2 rounded-2xl border border-slate-200 dark:border-white/10 self-start sm:self-auto">
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Progreso Inicial</span>
                  <span className="text-xs font-mono font-bold text-[#E9C349]">{completedCount} de 4 completados ({percentage}%)</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#E9C349]/10 border border-[#E9C349]/40 flex items-center justify-center text-[#E9C349] font-mono font-bold text-xs">
                  {completedCount}/4
                </div>
              </div>
            );
          })()}
        </div>

        {/* 4 Interactive Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div 
            onClick={() => toggleStep('explore')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
              completedSteps.explore 
                ? 'bg-emerald-950/20 border-emerald-500/50' 
                : 'bg-[#0A0A0A] border-[#262626] hover:border-[#E9C349]/50'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#E9C349] bg-[#E9C349]/10 px-2 py-0.5 rounded border border-[#E9C349]/20">
                  PASO 1
                </span>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                  completedSteps.explore ? 'bg-emerald-500 text-black border-emerald-400' : 'border-white/20'
                }`}>
                  {completedSteps.explore && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Explorar Cátedras & Maestros</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Revisa el directorio internacional y asigna un mentor para tu formación.
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                const el = document.getElementById('directorio-profesores-seccion');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-[11px] font-mono font-bold text-[#E9C349] hover:underline flex items-center gap-1 pt-1"
            >
              <span>Ver Profesores</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Step 2 */}
          <div 
            onClick={() => toggleStep('drill')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
              completedSteps.drill 
                ? 'bg-emerald-950/20 border-emerald-500/50' 
                : 'bg-[#0A0A0A] border-[#262626] hover:border-[#E9C349]/50'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#E9C349] bg-[#E9C349]/10 px-2 py-0.5 rounded border border-[#E9C349]/20">
                  PASO 2
                </span>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                  completedSteps.drill ? 'bg-emerald-500 text-black border-emerald-400' : 'border-white/20'
                }`}>
                  {completedSteps.drill && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Probar el Metrónomo & Ritmos</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Entrena tus wrist rolls con el metrónomo interactivo a 110-128 BPM.
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('entrenamiento');
              }}
              className="text-[11px] font-mono font-bold text-[#E9C349] hover:underline flex items-center gap-1 pt-1"
            >
              <span>Ir al Lab</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Step 3 */}
          <div 
            onClick={() => toggleStep('goals')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
              completedSteps.goals 
                ? 'bg-emerald-950/20 border-emerald-500/50' 
                : 'bg-[#0A0A0A] border-[#262626] hover:border-[#E9C349]/50'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#E9C349] bg-[#E9C349]/10 px-2 py-0.5 rounded border border-[#E9C349]/20">
                  PASO 3
                </span>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                  completedSteps.goals ? 'bg-emerald-500 text-black border-emerald-400' : 'border-white/20'
                }`}>
                  {completedSteps.goals && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Configurar Metas de Danza</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Define tu meta de 7 días y minutos de práctica en Clases & Recursos.
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('recursos');
              }}
              className="text-[11px] font-mono font-bold text-[#E9C349] hover:underline flex items-center gap-1 pt-1"
            >
              <span>Ir a Metas & Clases</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Step 4 */}
          <div 
            onClick={() => toggleStep('community')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
              completedSteps.community 
                ? 'bg-emerald-950/20 border-emerald-500/50' 
                : 'bg-[#0A0A0A] border-[#262626] hover:border-[#E9C349]/50'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#E9C349] bg-[#E9C349]/10 px-2 py-0.5 rounded border border-[#E9C349]/20">
                  PASO 4
                </span>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                  completedSteps.community ? 'bg-emerald-500 text-black border-emerald-400' : 'border-white/20'
                }`}>
                  {completedSteps.community && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Conectar con la Comunidad</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Preséntate en el lobby global y descubre los Reels y Duelos de baile.
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('comunidad');
              }}
              className="text-[11px] font-mono font-bold text-[#E9C349] hover:underline flex items-center gap-1 pt-1"
            >
              <span>Abrir Comunidad</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. RESUMEN DE LA ACADEMIA WAACK ON (Ecosystem & Pillars Overview) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pl-1">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[#E9C349] text-xl">🏛️</span>
              <h2 className="text-lg font-mono font-bold tracking-wider text-slate-900 dark:text-white uppercase">
                ACERCA DE LA ACADEMIA WAACK ON
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#8A8A8A] mt-0.5">
              Un ecosistema integral diseñado para transformar tu danza a través del rigor técnico y la libertad expresiva.
            </p>
          </div>
          <span className="text-[10px] font-mono text-[#E9C349] bg-[#E9C349]/10 border border-[#E9C349]/30 px-3 py-1 rounded-full uppercase self-start sm:self-auto">
            Metodología Certificada
          </span>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#121212] border border-[#262626] hover:border-[#E9C349]/40 transition-all rounded-2xl p-5 space-y-3 relative overflow-hidden group shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-[#E9C349]/10 border border-[#E9C349]/20 flex items-center justify-center text-[#E9C349]">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#E9C349] transition-colors">
              1. Biomecánica & Rolls
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Comprende el control de hombros, codos y muñecas para ejecutar wrist rolls y overhands con máxima velocidad sin lesiones ni tensión.
            </p>
            <div className="pt-1 text-[10px] font-mono font-bold text-[#E9C349]">
              ✓ Prevención y ergonomía
            </div>
          </div>

          <div className="bg-[#121212] border border-[#262626] hover:border-[#E9C349]/40 transition-all rounded-2xl p-5 space-y-3 relative overflow-hidden group shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-[#9A2B3C]/20 border border-[#9A2B3C]/40 flex items-center justify-center text-[#E9C349]">
              <Music className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#E9C349] transition-colors">
              2. Ritmo & Síncopas
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Entrena tu oído con metrónomo háptico y pistas clásicas de Disco/Funk de 100 a 135 BPM para clavar cada contratiempo con precisión.
            </p>
            <div className="pt-1 text-[10px] font-mono font-bold text-[#E9C349]">
              ✓ Laboratorio de tempo
            </div>
          </div>

          <div className="bg-[#121212] border border-[#262626] hover:border-[#E9C349]/40 transition-all rounded-2xl p-5 space-y-3 relative overflow-hidden group shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#E9C349] transition-colors">
              3. Posing & Teatro 70s
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Aprende la esencia de la pasarela y la narrativa dramática. Convierte cada pose en una declaración de carácter y estilo personal.
            </p>
            <div className="pt-1 text-[10px] font-mono font-bold text-[#E9C349]">
              ✓ Cultura y autenticidad
            </div>
          </div>

          <div className="bg-[#121212] border border-[#262626] hover:border-[#E9C349]/40 transition-all rounded-2xl p-5 space-y-3 relative overflow-hidden group shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#E9C349] transition-colors">
              4. Comunidad Global
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Conéctate con bailarines de más de 20 países, comparte videos de práctica, recibe correcciones y participa en batallas virtuales.
            </p>
            <div className="pt-1 text-[10px] font-mono font-bold text-[#E9C349]">
              ✓ Red internacional
            </div>
          </div>
        </div>
      </div>

      {/* 3. EXPLORAR LA PLATAFORMA (Interactive Platform Roadmap) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pl-1">
          <div className="flex items-center gap-2">
            <span className="text-[#E9C349] text-xl">🧭</span>
            <h2 className="text-lg font-mono font-bold tracking-wider text-slate-900 dark:text-white uppercase">
              EXPLORA LOS MÓDULOS DE LA PLATAFORMA
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-[#8A8A8A]">Haz clic en cualquier módulo para acceder directamente</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card A: Cursos & Lecciones */}
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('cursos')}
            className="bg-[#121212] border border-[#262626] hover:border-[#E9C349] rounded-2xl p-5 flex flex-col justify-between cursor-pointer group shadow-xl transition-all relative overflow-hidden"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-[#E9C349]/10 text-[#E9C349] border border-[#E9C349]/30">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  6 Niveles Disponibles
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#E9C349] transition-colors">
                Cursos & Clases Estructuradas
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Currículo progresivo desde Fundamentos de Muñecas (Nivel 1) hasta Combos Rápidos y Simetría Escénica (Nivel 5-6).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-[#E9C349]">
              <span>Comenzar a aprender</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* Card B: Lab de Entrenamiento & Metrónomo */}
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('entrenamiento')}
            className="bg-[#121212] border border-[#262626] hover:border-[#E9C349] rounded-2xl p-5 flex flex-col justify-between cursor-pointer group shadow-xl transition-all relative overflow-hidden"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-[#9A2B3C]/20 text-[#E9C349] border border-[#9A2B3C]/40">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  Audio + Metrónomo Lab
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#E9C349] transition-colors">
                Laboratorio de Entrenamiento
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generador de retos aleatorios de freestyle, metrónomo sincronizado, espejo virtual reflectivo y biblioteca musical clasificada.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-[#E9C349]">
              <span>Entrenar ahora</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* Card C: Comunidad & Duelos */}
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('comunidad')}
            className="bg-[#121212] border border-[#262626] hover:border-[#E9C349] rounded-2xl p-5 flex flex-col justify-between cursor-pointer group shadow-xl transition-all relative overflow-hidden"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/30">
                  Chat & Duelos 1v1
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#E9C349] transition-colors">
                Comunidad Global & Duelos
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Interactúa en el lobby de alumnos, crea salas de práctica grupales, reta a amigos a batallas amistosas y comparte avances.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-[#E9C349]">
              <span>Entrar a la comunidad</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* 4. DIRECTORIO DE PROFESORES GLOBALES (Key Required Section) */}
      <div id="directorio-profesores-seccion" className="space-y-5 pt-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#141414] border border-[#262626] rounded-2xl p-5 shadow-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌟</span>
              <h2 className="text-lg font-mono font-bold tracking-wider text-slate-900 dark:text-white uppercase">
                DIRECTORIO DE PROFESORES GLOBALES
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Explora a los maestros oficiales de la Cátedra Waack On internacional. Asigna y suscríbete a un instructor titular para recibir mentoría exclusiva, plan de estudios de 4 semanas y correcciones personalizadas.
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full md:w-auto relative">
            <input
              type="text"
              placeholder="Buscar profesor o estilo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 bg-[#0A0A0A] border border-[#262626] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:border-[#E9C349] outline-none"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Specialty Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 bg-[#0A0A0A] p-2 rounded-2xl border border-[#262626]">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-bold px-2">Filtros:</span>
          {[
            { id: 'todos', label: 'Todos los Maestros' },
            { id: 'biomecánica', label: '🦾 Rolls & Biomecánica' },
            { id: 'teatral', label: '🎭 Posing & Expresión' },
            { id: 'musicalidad', label: '🎶 Musicalidad & Síncopas' },
            { id: 'velocidad', label: '⚡ Velocidad & Batallas' },
            { id: 'simetría', label: '📐 Simetría & Líneas' }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedSpecialty(filter.id)}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
                selectedSpecialty === filter.id
                  ? 'bg-[#E9C349] text-black shadow-md'
                  : 'bg-white dark:bg-[#141414] text-slate-500 dark:text-[#8A8A8A] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/5'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Instructors Showcase Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstructors.map((inst) => {
            const isAssigned = assignedInstructorId === inst.id || assignedInstructorName === inst.name;

            return (
              <div
                key={inst.id}
                className={`bg-[#121212] rounded-3xl p-6 border transition-all flex flex-col justify-between relative group shadow-xl ${
                  isAssigned
                    ? 'border-emerald-500/80 bg-gradient-to-b from-[#111f18] via-[#121212] to-[#121212]'
                    : inst.featured 
                    ? 'border-[#E9C349]/60 bg-gradient-to-b from-[#1a1710] to-[#121212]' 
                    : 'border-[#262626] hover:border-white/30'
                }`}
              >
                {/* Header Badge */}
                {isAssigned ? (
                  <div className="absolute -top-3 right-5 bg-emerald-400 text-black text-[9px] font-mono font-black uppercase px-3 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>✓ Tu Mentor Asignado</span>
                  </div>
                ) : inst.featured ? (
                  <div className="absolute -top-3 right-5 bg-[#E9C349] text-black text-[9px] font-mono font-black uppercase px-3 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                    <Star className="w-3 h-3 fill-black" />
                    <span>{inst.badge}</span>
                  </div>
                ) : null}

                <div className="space-y-4">
                  {/* Instructor Profile Header */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={inst.avatar}
                        alt={inst.name}
                        className={`w-16 h-16 rounded-2xl object-cover border-2 shadow-md group-hover:scale-105 transition-transform ${
                          isAssigned ? 'border-emerald-400' : 'border-[#E9C349]'
                        }`}
                      />
                      <span className="absolute -bottom-1 -right-1 text-xs">
                        {inst.country.includes('🇪🇸') ? '🇪🇸' : inst.country.includes('🇺🇸') ? '🇺🇸' : inst.country.includes('🇰🇷') ? '🇰🇷' : inst.country.includes('🇯🇵') ? '🇯🇵' : '🇨🇴'}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#E9C349] transition-colors truncate">
                        {inst.name}
                      </h3>
                      <p className="text-[11px] font-mono text-[#E9C349] font-bold truncate">
                        {inst.role}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-slate-400">
                        <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                          ⭐ {inst.rating}
                        </span>
                        <span>•</span>
                        <span>{inst.studentsCount} alumnos</span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {inst.bio}
                  </p>

                  {/* Specialties Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {inst.specialties.map((spec, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono font-medium px-2 py-0.5 bg-[#0A0A0A] text-slate-300 border border-white/10 rounded-md"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Plan Highlights */}
                  <div className="bg-[#0A0A0A] p-3 rounded-xl border border-white/5 space-y-1.5">
                    <span className="text-[9px] font-mono font-bold text-[#E9C349] uppercase block">
                      Beneficios de su Cátedra:
                    </span>
                    {inst.planHighlights.map((hl, hIdx) => (
                      <div key={hIdx} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-tight">{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price and CTA */}
                <div className="mt-5 pt-4 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 block uppercase">Pase Cátedra</span>
                      <span className="text-base font-black font-mono text-white text-[#E9C349]">
                        {inst.monthlyPrice}
                      </span>
                    </div>

                    <button
                      onClick={() => setPreviewInstructor(inst)}
                      className="text-xs font-mono text-slate-400 hover:text-slate-900 dark:hover:text-white underline cursor-pointer flex items-center gap-1"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#E9C349]" />
                      <span>Ver Programa 4 Semanas</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAssignInstructor(inst)}
                      className={`py-2 text-xs font-mono font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        isAssigned
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                          : 'bg-[#1c1b1b] hover:bg-[#262626] text-white border-white/10'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#E9C349]" />
                      <span>{isAssigned ? 'Asignado ✓' : 'Asignar Mentor'}</span>
                    </button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSubscribeClick(inst)}
                      className="py-2 bg-[#E9C349] hover:bg-[#d8b33c] text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Suscribirse</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: PREVIEW DEL PROGRAMA DE 4 SEMANAS DEL PROFESOR */}
      <AnimatePresence>
        {previewInstructor && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121212] border border-[#262626] rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setPreviewInstructor(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                <img
                  src={previewInstructor.avatar}
                  alt={previewInstructor.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#E9C349] shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{previewInstructor.name}</h3>
                    <span className="text-xs">{previewInstructor.country}</span>
                  </div>
                  <p className="text-xs font-mono font-bold text-[#E9C349]">{previewInstructor.role}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Cátedra Oficial • {previewInstructor.monthlyPrice}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Calendar className="w-5 h-5 text-[#E9C349]" />
                  <h4 className="text-sm font-mono font-bold uppercase tracking-wider">
                    Plan de Estudios & Programa (4 Semanas)
                  </h4>
                </div>

                <div className="space-y-3">
                  {previewInstructor.syllabus.map((wk) => (
                    <div key={wk.week} className="bg-[#0A0A0A] border border-[#262626] rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#E9C349] font-mono uppercase">
                          {wk.title}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                          Semana {wk.week}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{wk.description}</p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {wk.focus.map((f, fi) => (
                          <span key={fi} className="text-[10px] font-mono bg-[#141414] text-slate-300 px-2 py-0.5 rounded border border-white/5">
                            • {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Precio de la Cátedra</span>
                  <span className="text-lg font-black font-mono text-[#E9C349]">{previewInstructor.monthlyPrice}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAssignInstructor(previewInstructor)}
                    className="px-4 py-2.5 bg-white dark:bg-[#1c1b1b] hover:bg-slate-100 dark:hover:bg-[#262626] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4 text-[#E9C349]" />
                    <span>Asignar como Mentor</span>
                  </button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSubscribeClick(previewInstructor)}
                    className="px-5 py-2.5 bg-[#E9C349] hover:bg-[#d8b33c] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 fill-black" />
                    <span>Confirmar Suscripción</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. SELECCIÓN DE PLANES Y MEMBRESÍAS (Comprehensive Pricing & Action Cards) */}
      <div id="planes-suscripcion-seccion" className="space-y-6 pt-6 scroll-mt-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9C349]/15 border border-[#E9C349]/40 text-[#E9C349] font-mono text-[11px] font-black uppercase tracking-widest">
            <Crown className="w-3.5 h-3.5 text-[#E9C349]" />
            <span>MEMBRESÍAS Y PLANES DE SUSCRIPCIÓN</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono uppercase">
            Planes de Suscripción Oficiales <span className="text-[#E9C349]">WAACK ON®</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Estructura transparente y sin permanencias. Elige el plan ideal para evolucionar tu nivel como bailarín o profesionalizar tu cátedra docente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
          {/* Plan 1: Plan Gratuito / Explorador */}
          <div className="bg-white dark:bg-[#0D0D12] border border-slate-200 dark:border-[#262626] rounded-3xl p-6 flex flex-col justify-between space-y-6 relative overflow-hidden hover:border-slate-400 dark:hover:border-slate-500 transition-all shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold rounded-full uppercase tracking-wider">
                  LIBRE ACCESO
                </span>
                <Users className="w-5 h-5 text-slate-400" />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-mono uppercase">
                  Pase Explorador
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Explora la plataforma, consulta la comunidad y sigue perfiles de maestros.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-[#1F1F24]">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">$0</span>
                  <span className="text-xs font-mono text-slate-400">/ siempre</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 block mt-1">
                  ✓ Incluido por defecto
                </span>
              </div>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Acceso al Mapa Global y eventos de Jams</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Directorio internacional de profesores</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Feed Social, Reels y Duelos de baile</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setActiveTab('cursos')}
              className="w-full py-3 bg-slate-100 dark:bg-[#1F1F24] hover:bg-slate-200 dark:hover:bg-[#2A2A32] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-mono font-bold text-xs rounded-2xl uppercase transition-all cursor-pointer border border-slate-200 dark:border-white/5"
            >
              Comenzar Gratis
            </button>
          </div>

          {/* Plan 2: Básico Práctica Independiente ($8 USD) */}
          <div className="bg-gradient-to-b from-cyan-50 to-white dark:from-[#141226] dark:to-[#0D0B1A] border-2 border-cyan-500/50 rounded-3xl p-6 flex flex-col justify-between space-y-6 relative overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:border-cyan-400 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-black rounded-full uppercase tracking-wider">
                  ALUMNOS AUTÓNOMOS
                </span>
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-mono uppercase">
                  Básico de Práctica
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Herramientas avanzadas de entrenamiento autónomo y laboratorio biomecánico.
                </p>
              </div>

              <div className="pt-2 border-t border-cyan-500/20">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-cyan-400 font-mono">$8.00</span>
                  <span className="text-xs font-mono text-cyan-200">USD / mes</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 block mt-1">
                  Sin permanencia • Cancela cuando quieras
                </span>
              </div>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Freestyle Lab Ilimitado</strong>: Metrónomo BPM</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Pose Analyzer IA</strong>: Medición de ángulos</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Salas de Batallas 1v1</strong> y Galería B&W</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onOpenPlansModal ? onOpenPlansModal() : setActiveTab('planes')}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-black text-xs rounded-2xl uppercase transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Activar ($8 USD)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Plan 3: Membresía Cátedra de Instructor ($15 USD) - DESTACADO */}
          <div className="bg-gradient-to-b from-amber-50 to-white dark:from-[#1E172E] dark:to-[#120E1E] border-2 border-[#E9C349] rounded-3xl p-6 flex flex-col justify-between space-y-6 relative overflow-hidden shadow-[0_0_35px_rgba(233,195,73,0.25)] hover:border-yellow-300 transition-all">
            <div className="absolute top-0 right-0 bg-[#E9C349] text-black text-[9px] font-mono font-black uppercase px-3 py-1 rounded-bl-2xl shadow-md">
              RECOMENDADO
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-[#E9C349]/20 border border-[#E9C349]/40 text-[#E9C349] text-[10px] font-mono font-black rounded-full uppercase tracking-wider">
                  PASE CÁTEDRA
                </span>
                <GraduationCap className="w-5 h-5 text-[#E9C349]" />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-mono uppercase">
                  Pase Cátedra Instructor
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Formación guiada intensiva con tu maestro internacional preferido.
                </p>
              </div>

              <div className="pt-2 border-t border-[#E9C349]/30">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#E9C349] font-mono">$15.00</span>
                  <span className="text-xs font-mono text-slate-300">USD / mes</span>
                </div>
                <div className="mt-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>80% AL PROFESOR / 20% PLATAFORMA</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#E9C349] shrink-0 mt-0.5" />
                  <span><strong>Acceso Total Cursos HD</strong>: Del maestro</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#E9C349] shrink-0 mt-0.5" />
                  <span><strong>Feedback Biomecánico 1v1</strong>: En video</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#E9C349] shrink-0 mt-0.5" />
                  <span><strong>Google Meet & Classroom</strong>: Evaluaciones</span>
                </li>
              </ul>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onOpenPlansModal ? onOpenPlansModal() : setActiveTab('planes')}
              className="w-full py-3.5 bg-[#E9C349] hover:bg-yellow-300 text-black font-mono font-black text-xs rounded-2xl uppercase transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>Suscribirse ($15 USD)</span>
            </motion.button>
          </div>

          {/* Plan 4: Instructor Global & Estudios ($15 / $30 USD) */}
          <div className="bg-gradient-to-b from-purple-50 to-white dark:from-[#251327] dark:to-[#120A13] border-2 border-purple-500/60 rounded-3xl p-6 flex flex-col justify-between space-y-6 relative overflow-hidden shadow-[0_0_35px_rgba(168,85,247,0.2)] hover:border-purple-400 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-mono font-black rounded-full uppercase tracking-wider">
                  DOCENTES & ESTUDIOS
                </span>
                <Briefcase className="w-5 h-5 text-purple-400" />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-mono uppercase">
                  Instructor & Academia
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Monetiza tus conocimientos, imparte cátedras y gestiona tu nómina.
                </p>
              </div>

              <div className="pt-2 border-t border-purple-500/30">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-purple-300 font-mono">$15 / $30</span>
                  <span className="text-xs font-mono text-purple-200">USD / mes</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 block mt-1">
                  ✓ Recauda el 80% neto de cada alumno
                </span>
              </div>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Panel Docente & Finanzas</strong>: Retiros a banco</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Publicación Cursos & Workbooks</strong>: En PDF</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Suite Google Workspace</strong>: Meet & Slides</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onOpenPlansModal ? onOpenPlansModal() : setActiveTab('planes')}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-mono font-black text-xs rounded-2xl uppercase transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Activar Como Docente</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer Link to Full Comparison Table */}
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setActiveTab('planes')}
            className="px-6 py-2.5 bg-white dark:bg-[#121212] hover:bg-slate-100 dark:hover:bg-[#1C1C1C] text-[#E9C349] border border-[#E9C349]/40 rounded-2xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md hover:border-[#E9C349]"
          >
            <ShieldCheck className="w-4 h-4 text-[#E9C349]" />
            <span>Ver Tabla Comparativa Completa de Beneficios & Planes</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 6. SELECTOR DE ROL RÁPIDO PARA NUEVO USUARIO (Flexible Assignment) */}
      <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#E9C349]" />
            <h3 className="text-sm font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              ¿Cuál es tu propósito principal en Waack On?
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500 dark:text-[#8A8A8A]">
            Puedes modificar tu rol en cualquier momento desde tu perfil
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            onClick={() => handleChooseRole('student')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              currentUser.role === 'student'
                ? 'bg-[#E9C349]/10 border-[#E9C349] text-white'
                : 'bg-[#0A0A0A] border-[#262626] text-slate-300 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase font-mono">💃 Estudiante / Bailarín</span>
              {currentUser.role === 'student' && <CheckCircle2 className="w-4 h-4 text-[#E9C349]" />}
            </div>
            <p className="text-[11px] text-slate-400">
              Quiero aprender técnica, entrenar con metrónomo y subir de nivel en la academia.
            </p>
          </div>

          <div
            onClick={() => handleChooseRole('instructor')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              currentUser.role === 'instructor'
                ? 'bg-[#E9C349]/10 border-[#E9C349] text-white'
                : 'bg-[#0A0A0A] border-[#262626] text-slate-300 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase font-mono">🎓 Instructor / Docente</span>
              {currentUser.role === 'instructor' && <CheckCircle2 className="w-4 h-4 text-[#E9C349]" />}
            </div>
            <p className="text-[11px] text-slate-400">
              Quiero abrir mi cátedra, publicar anuncios, corregir tareas y gestionar alumnos.
            </p>
          </div>

          <div
            onClick={() => handleChooseRole('studio')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              currentUser.role === 'studio'
                ? 'bg-[#E9C349]/10 border-[#E9C349] text-white'
                : 'bg-[#0A0A0A] border-[#262626] text-slate-300 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase font-mono">🏢 Estudio / Academia</span>
              {currentUser.role === 'studio' && <CheckCircle2 className="w-4 h-4 text-[#E9C349]" />}
            </div>
            <p className="text-[11px] text-slate-400">
              Quiero administrar múltiples instructores, eventos y matrícula institucional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export { WelcomeDashboard as DefaultUserDashboard };

