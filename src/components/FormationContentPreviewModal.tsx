// src/components/FormationContentPreviewModal.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Eye, 
  Play, 
  BookOpen, 
  Award, 
  Sparkles, 
  CheckCircle, 
  FileText, 
  Download, 
  ChevronRight, 
  Video, 
  Music, 
  Clock, 
  ShieldCheck, 
  GraduationCap,
  Layers,
  ArrowRight
} from 'lucide-react';
import { User, Lesson, InstructorCatedra } from '../types';
import MultiSourceMusicEngine from './MultiSourceMusicEngine';

interface FormationContentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessons?: Lesson[];
  instructors?: InstructorCatedra[];
  onSelectLesson?: (lesson: Lesson) => void;
  onOpenPlansModal?: () => void;
}

const DEMO_PREVIEW_MODULES = [
  {
    id: 'm1',
    title: 'Módulo 1: Biomecánica & Fundamentos de Poses',
    level: 'Nivel 1 - Iniciación',
    duration: '4 semanas (12 lecciones)',
    instructor: 'Brando Hermoso',
    description: 'Aprende la alineación articular, fijación de poses geométricas en el tempo 4/4 y disociación de torso sin fatiga muscular.',
    videoDemo: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&q=80',
    pdfTitle: 'Guia_Biomecanica_Poses_Demo.pdf',
    topics: [
      'Anatomía del brazo en movimiento (Rolls & Overhead)',
      'Alineación escénica y ángulos de impacto',
      'Ejercicio de transferencia de peso en tempo Disco (120 BPM)'
    ]
  },
  {
    id: 'm2',
    title: 'Módulo 2: Velocidad de Rolls & Control de Síncopas',
    level: 'Nivel 2 - Avanzado',
    duration: '6 semanas (18 lecciones)',
    instructor: 'Elena Rostova',
    description: 'Técnica avanzada de rotación limpia en contratiempos, integración de mariposas y variaciones cromáticas sobre hi-hats.',
    videoDemo: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&q=80',
    pdfTitle: 'Manual_Sincopas_Rolls_Avanzado.pdf',
    topics: [
      'Gros y Rolls cruzados detrás de la cabeza',
      'Aceleración a 135 BPM sin perder la síncopa',
      'Rutina de resistencia de hombros y movilidad torácica'
    ]
  },
  {
    id: 'm3',
    title: 'Módulo 3: Dramatismo, Acting & Musicalidad Disco',
    level: 'Nivel Todos los Niveles',
    duration: '3 semanas (9 lecciones)',
    instructor: 'Jessica Soner',
    description: 'Exploración teatral, narrativa escénica e interpretación de voces y sintetizadores en la música Disco de los años 70.',
    videoDemo: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
    pdfTitle: 'Bitacora_Dramatismo_Teatral.pdf',
    topics: [
      'Personificación del glamour de las estrellas de cine mudo',
      'Acentos melódicos vs acentos rítmicos',
      'Técnicas de improvisación en batalla (Freestyle)'
    ]
  }
];

export default function FormationContentPreviewModal({
  isOpen,
  onClose,
  lessons = [],
  instructors = [],
  onSelectLesson,
  onOpenPlansModal
}: FormationContentPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'modulos' | 'clases' | 'materiales' | 'audio'>('modulos');
  const [selectedModule, setSelectedModule] = useState(DEMO_PREVIEW_MODULES[0]);
  const [previewToast, setPreviewToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadDemo = (filename: string) => {
    setPreviewToast(`📄 Descargando vista previa: ${filename}`);
    setTimeout(() => setPreviewToast(null), 3000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto custom-scrollbar">
        
        {/* Toast alert */}
        {previewToast && (
          <div className="fixed top-6 right-6 z-50 bg-[#E9C349] text-black px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 border border-black/20 animate-bounce">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{previewToast}</span>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-[#0F0D1A] border-2 border-[#E9C349]/40 rounded-3xl max-w-5xl w-full p-4 sm:p-8 shadow-2xl z-10 space-y-6 overflow-y-auto max-h-[92vh] my-auto custom-scrollbar text-white"
        >
          {/* Top Decorative Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#E9C349]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-start justify-between border-b border-white/10 pb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E9C349]/20 border border-[#E9C349] flex items-center justify-center text-[#E9C349] shrink-0 shadow-lg">
                <Eye className="w-6 h-6 text-[#E9C349]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E9C349] text-black font-mono font-black text-[10px] uppercase tracking-wider">
                    VISTA PREVIA
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono text-[10px] uppercase">
                    FORMACIÓN & CONTENIDO ACADÉMICO
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  Explorador de Programas y Lecciones
                </h2>
                <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                  Revisa la estructura curricular, demostraciones en video, guías metodológicas y recursos teóricos antes de registrarte o elegir tu plan.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all border border-white/10 shrink-0 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Selector Tabs */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
            <button
              onClick={() => setActiveTab('modulos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'modulos' 
                  ? 'bg-[#E9C349] text-black shadow-lg font-black' 
                  : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>1. Módulos & Temario</span>
            </button>

            <button
              onClick={() => setActiveTab('clases')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'clases' 
                  ? 'bg-[#E9C349] text-black shadow-lg font-black' 
                  : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>2. Clases Demos ({lessons.length || 6})</span>
            </button>

            <button
              onClick={() => setActiveTab('materiales')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'materiales' 
                  ? 'bg-[#E9C349] text-black shadow-lg font-black' 
                  : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>3. PDFs & Workbooks</span>
            </button>

            <button
              onClick={() => setActiveTab('audio')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'audio' 
                  ? 'bg-[#E9C349] text-black shadow-lg font-black' 
                  : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>4. Audio & Musicalidad</span>
            </button>
          </div>

          {/* TAB 1: MÓDULOS DE FORMACIÓN */}
          {activeTab === 'modulos' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Module List (5 cols) */}
              <div className="lg:col-span-5 space-y-3">
                <p className="text-[10px] font-mono text-[#E9C349] font-bold uppercase tracking-wider">
                  PROGRAMA CURRICULAR DISPONIBLE
                </p>

                {DEMO_PREVIEW_MODULES.map((mod) => (
                  <div
                    key={mod.id}
                    onClick={() => setSelectedModule(mod)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      selectedModule.id === mod.id
                        ? 'bg-[#1D1730] border-[#E9C349] shadow-xl'
                        : 'bg-[#120F20] border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 uppercase">
                        {mod.level}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#E9C349]" /> {mod.duration}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-white uppercase">{mod.title}</h4>
                    <p className="text-xs text-slate-300 line-clamp-2">{mod.description}</p>
                    <div className="text-[10px] font-mono text-purple-300 font-bold flex items-center justify-between pt-1">
                      <span>Impartido por: {mod.instructor}</span>
                      <ChevronRight className="w-4 h-4 text-[#E9C349]" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Module Detail & Demo Player (7 cols) */}
              <div className="lg:col-span-7 bg-[#131022] border border-white/10 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group">
                    <img 
                      src={selectedModule.videoDemo} 
                      alt={selectedModule.title} 
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-[#E9C349] text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 fill-current ml-1" />
                      </div>
                    </div>
                    <span className="absolute top-3 left-3 bg-black/80 text-[#E9C349] text-[9px] font-mono font-bold px-2.5 py-1 rounded-xl border border-[#E9C349]/40 uppercase">
                      VISTA PREVIA DEMO EN VIDEO
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-white uppercase">{selectedModule.title}</h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{selectedModule.description}</p>
                  </div>

                  <div className="p-3 bg-black/40 rounded-xl border border-white/10 space-y-2">
                    <p className="text-[10px] font-mono text-[#E9C349] font-bold uppercase">TEMARIO CLAVE DEL MÓDULO:</p>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {selectedModule.topics.map((topic, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
                  <button
                    onClick={() => handleDownloadDemo(selectedModule.pdfTitle)}
                    className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/30 text-xs font-bold uppercase transition-all flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Temario PDF</span>
                  </button>

                  {onOpenPlansModal && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenPlansModal();
                      }}
                      className="px-4 py-2 rounded-xl bg-[#E9C349] hover:bg-[#ffdf6b] text-black text-xs font-black uppercase transition-all flex items-center gap-1.5 shadow-lg active:scale-95"
                    >
                      <span>Inscribirme al Programa Completo</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CLASES Y VIDEO DEMOS */}
          {activeTab === 'clases' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Selecciona cualquiera de las lecciones disponibles para previsualizar su contenido en video, transcripción resumida e instrucciones técnicas.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(lessons.length > 0 ? lessons : [
                  { id: '1', title: 'Fundamentos de Postura y Alineación', duration: '15 min', category: 'Técnica Base', description: 'Alineación de columna, disociación de hombros y centro de gravedad para Waacking.', level: 1 },
                  { id: '2', title: 'Aceleración de Arms Rolls en Síncopa', duration: '22 min', category: 'Drills', description: 'Rutina de resistencia para rolls internos y externos con metrónomo a 128 BPM.', level: 1 },
                  { id: '3', title: 'Pose Locks & Congelados Geométricos', duration: '18 min', category: 'Poses', description: 'Dominio de la inercia para frenar el movimiento instantáneamente en el golpe de la caja.', level: 1 },
                  { id: '4', title: 'Musicalidad e Interpretación Disco 70s', duration: '25 min', category: 'Musicalidad', description: 'Análisis de capas instrumentales, violines, hi-hats y caja en canciones clásicas Disco.', level: 2 },
                  { id: '5', title: 'Pacing y Transiciones de Espacio', duration: '20 min', category: 'Performance', description: 'Cómo desplazarse por el escenario utilizando caminatas dramáticas y giros.', level: 2 },
                  { id: '6', title: 'Freestyle Lab & Expresión Escénica', duration: '30 min', category: 'Improvisación', description: 'Dinámicas de laboratorio somático para soltar la rigidez y conectar con la audiencia.', level: 2 }
                ]).map((l: any) => (
                  <div 
                    key={l.id}
                    className="p-4 bg-[#131022] border border-white/10 rounded-2xl flex flex-col justify-between hover:border-[#E9C349]/40 transition-all space-y-3 group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono font-extrabold text-[#E9C349] bg-[#E9C349]/10 px-2 py-0.5 rounded border border-[#E9C349]/30 uppercase">
                          {l.category || 'TÉCNICA'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{l.duration || '20 min'}</span>
                      </div>

                      <h4 className="text-xs font-black text-white uppercase group-hover:text-[#E9C349] transition-colors">
                        {l.title}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                        {l.description}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (onSelectLesson && lessons.find(x => x.id === l.id)) {
                          onSelectLesson(lessons.find(x => x.id === l.id)!);
                          onClose();
                        } else {
                          setPreviewToast(`🎬 Abriendo vista previa de "${l.title}"`);
                        }
                      }}
                      className="w-full py-2 bg-white/5 hover:bg-[#E9C349] text-slate-200 hover:text-black font-mono font-bold text-xs uppercase rounded-xl transition-all border border-white/10 flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Ver Vista Previa</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: WORKBOOKS Y MATERIALES PDF */}
          {activeTab === 'materiales' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Material descargable de lectura teórica, glosario técnico y bitácoras para tu entrenamiento.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-[#131022] border border-white/10 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-black text-cyan-300 bg-cyan-500/20 px-2.5 py-0.5 rounded uppercase border border-cyan-500/30">
                      GUÍA COMPLETA • PDF
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">18 PÁGS • 4.2 MB</span>
                  </div>
                  <h4 className="text-sm font-black text-white uppercase">
                    Bitácora Teórica y Metodológica de Waacking v2.1
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Compendio que reúne historia de los clubes de LA en los 70s, biografía de los pioneros, análisis de métrica Disco y guía de drills diarios.
                  </p>
                  <button
                    onClick={() => handleDownloadDemo('Waacking_Bitacora_Teorica_v2.1.pdf')}
                    className="w-full py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/30 font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 text-purple-300" />
                    <span>Descargar Muestra Gratuita (PDF)</span>
                  </button>
                </div>

                <div className="p-5 bg-[#131022] border border-white/10 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-black text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded uppercase border border-emerald-500/30">
                      WORKBOOK TÉCNICO • PDF
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">12 PÁGS • 2.8 MB</span>
                  </div>
                  <h4 className="text-sm font-black text-white uppercase">
                    Planificador de Drills y Somática Semanal
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Plantilla imprimible con listas de verificación para medir aumentos de BPM en rolls, control de fatiga muscular y notas de feedback.
                  </p>
                  <button
                    onClick={() => handleDownloadDemo('Planificador_Drills_Somatica.pdf')}
                    className="w-full py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-200 border border-emerald-500/30 font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 text-emerald-300" />
                    <span>Descargar Muestra Gratuita (PDF)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REPRODUCTOR DE MUSICALIDAD Y AUDIO */}
          {activeTab === 'audio' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Pistas de audio y playlists de entrenamiento con auto-detección para SoundCloud, Spotify y YouTube.
              </p>
              <MultiSourceMusicEngine
                initialUrl="https://soundcloud.com/mario-monroe-717013866/sets/waacking-training-vibes"
                isInstructor={false}
              />
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Plataforma oficial certificada con contenido de catedráticos profesionales.</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono font-bold uppercase transition-all border border-white/10"
              >
                Cerrar Vista Previa
              </button>

              {onOpenPlansModal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenPlansModal();
                  }}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#E9C349] hover:bg-[#ffdf6b] text-black text-xs font-mono font-black uppercase transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                >
                  <span>Ver Planes & Membresías</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
