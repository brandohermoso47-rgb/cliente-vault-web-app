import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Zap, Award, Compass, Layers, ShieldCheck, Flame, ChevronRight, X, Play, BookOpen } from 'lucide-react';

export interface WaackingPillar {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  bpmRange: string;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
  description: string;
  keyTechnique: string;
  commonMistake: string;
  svgIcon: React.ReactNode;
}

export const WAACKING_PILLARS: WaackingPillar[] = [
  {
    id: 'lines',
    title: '1. Líneas & Geometría',
    subtitle: 'Extensión Tridimensional',
    category: 'Estructura Postural',
    bpmRange: '110 - 130 BPM',
    accentColor: '#38BDF8', // Cyan/Sky
    gradientFrom: '#0284C7',
    gradientTo: '#0F172A',
    description: 'Trazado limpio de ángulos de 90° y 180° con los brazos en el espacio tridimensional. Exige extensión completa de codos y simetría articular.',
    keyTechnique: 'Bloqueo escapular con activación del deltoides posterior para mantener la línea recta sin elevar los hombros.',
    commonMistake: 'Flexionar los codos en los extremos de la extensión o perder el eje vertical de la columna.',
    svgIcon: (
      <svg className="w-16 h-16 text-cyan-400 opacity-90" viewBox="0 0 100 100" fill="none" stroke="currentColor">
        <line x1="10" y1="50" x2="90" y2="50" strokeWidth="3" strokeDasharray="4 2" />
        <line x1="50" y1="10" x2="50" y2="90" strokeWidth="3" strokeDasharray="4 2" />
        <circle cx="50" cy="50" r="30" strokeWidth="2" />
        <path d="M 20 20 L 80 80 M 80 20 L 20 80" strokeWidth="2" />
        <circle cx="50" cy="50" r="6" fill="#38BDF8" />
        <circle cx="20" cy="20" r="4" fill="#38BDF8" />
        <circle cx="80" cy="20" r="4" fill="#38BDF8" />
        <circle cx="80" cy="80" r="4" fill="#38BDF8" />
        <circle cx="20" cy="80" r="4" fill="#38BDF8" />
      </svg>
    )
  },
  {
    id: 'overheads',
    title: '2. Overheads & Pasos Cervicales',
    subtitle: 'Trayectos por Coronilla y Cuello',
    category: 'Fluidez y Pasajes',
    bpmRange: '115 - 135 BPM',
    accentColor: '#C084FC', // Purple
    gradientFrom: '#7E22CE',
    gradientTo: '#0F172A',
    description: 'Barridos continuos de los antebrazos por encima de la cabeza y alrededor del cuello, creando marcos dinámicos para el rostro.',
    keyTechnique: 'Abertura de escápulas para permitir la rotación glenohumeral sin colapsar las vértebras cervicales.',
    commonMistake: 'Golpear la cabeza o desalinear la barbilla al apresurar el pasaje rítmico.',
    svgIcon: (
      <svg className="w-16 h-16 text-purple-400 opacity-90" viewBox="0 0 100 100" fill="none" stroke="currentColor">
        <path d="M 20 80 C 20 30, 80 30, 80 80" strokeWidth="3" strokeDasharray="3 3" />
        <circle cx="50" cy="55" r="18" strokeWidth="2" fill="#120F22" />
        <path d="M 15 50 Q 50 10 85 50" strokeWidth="3" />
        <circle cx="50" cy="18" r="5" fill="#C084FC" />
        <path d="M 32 40 C 40 25, 60 25, 68 40" strokeWidth="2" fill="none" />
      </svg>
    )
  },
  {
    id: 'rolls',
    title: '3. Wrist Rolls & Velocidad Articular',
    subtitle: 'Rotaciones Internas / Externas',
    category: 'Mecanización de Antebrazo',
    bpmRange: '120 - 140 BPM',
    accentColor: '#FACC15', // Gold
    gradientFrom: '#CA8A04',
    gradientTo: '#0F172A',
    description: 'El corazón motriz del Waacking: impulsos giratorios ultra-rápidos de las muñecas alineados con los tiempos y las síncopas de la música Disco.',
    keyTechnique: 'El punto pivot es el codo; las manos giran sueltas pero disciplinadas sin mover la caja torácica.',
    commonMistake: 'Hacer el movimiento con todo el brazo desde el hombro, generando fatiga muscular prematura.',
    svgIcon: (
      <svg className="w-16 h-16 text-yellow-400 opacity-90" viewBox="0 0 100 100" fill="none" stroke="currentColor">
        <circle cx="50" cy="50" r="35" strokeWidth="2" strokeDasharray="6 4" />
        <path d="M 50 15 A 35 35 0 0 1 85 50" strokeWidth="4" strokeLinecap="round" />
        <polygon points="85,50 92,40 78,42" fill="#FACC15" />
        <circle cx="50" cy="50" r="15" strokeWidth="2" />
        <path d="M 50 35 A 15 15 0 0 0 35 50" strokeWidth="3" />
        <polygon points="35,50 28,60 42,58" fill="#FACC15" />
      </svg>
    )
  },
  {
    id: 'posing',
    title: '4. Posing & Garbo Escénico',
    subtitle: 'Congelamiento Dramático de Estrellas',
    category: 'Fotogenia y Silueta',
    bpmRange: 'Cualquier BPM (Síncopas)',
    accentColor: '#F43F5E', // Rose / Red
    gradientFrom: '#BE123C',
    gradientTo: '#0F172A',
    description: 'Congelar poses congeladas instantáneas inspiradas en las estrellas de cine de los años 40 (Greta Garbo, Marilyn Monroe). Es el dominio del silencio estético.',
    keyTechnique: 'Intención sostenida hasta las yemas de los dedos e inmovilidad absoluta del core en la pose final.',
    commonMistake: 'Mover la mirada o perder la tensión corporal antes de que concluya el acento musical.',
    svgIcon: (
      <svg className="w-16 h-16 text-rose-400 opacity-90" viewBox="0 0 100 100" fill="none" stroke="currentColor">
        <polygon points="50,10 63,38 93,38 68,56 78,86 50,68 22,86 32,56 7,38 37,38" strokeWidth="2" />
        <circle cx="50" cy="48" r="12" fill="#F43F5E" />
        <path d="M 30 90 L 70 90" strokeWidth="3" />
      </svg>
    )
  },
  {
    id: 'attitude',
    title: '5. Actitud & Punking',
    subtitle: 'Teatralidad, Carácter y Proyección',
    category: 'Carácter y Catarsis',
    bpmRange: 'Expresivo / Variable',
    accentColor: '#10B981', // Emerald
    gradientFrom: '#047857',
    gradientTo: '#0F172A',
    description: 'El alma actoral y catártica del Waacking. Convertir la frustración o el drama personal en magnetismo escénico y empoderamiento.',
    keyTechnique: 'Contacto visual directo con el espectador/juez y disociación de expresiones faciales sincronizadas con la música.',
    commonMistake: 'Copiar muecas de otros bailarines sin conectar con una emoción personal auténtica.',
    svgIcon: (
      <svg className="w-16 h-16 text-emerald-400 opacity-90" viewBox="0 0 100 100" fill="none" stroke="currentColor">
        <path d="M 20 30 Q 50 10 80 30 Q 90 60 50 90 Q 10 60 20 30 Z" strokeWidth="2" fill="none" />
        <circle cx="35" cy="40" r="6" fill="#10B981" />
        <circle cx="65" cy="40" r="6" fill="#10B981" />
        <path d="M 35 65 Q 50 80 65 65" strokeWidth="3" strokeLinecap="round" />
        <line x1="50" y1="15" x2="50" y2="5" strokeWidth="3" />
      </svg>
    )
  }
];

export const WaackingPillarsGallery: React.FC<{ onSelectPillar?: (pillar: WaackingPillar) => void }> = ({ onSelectPillar }) => {
  const [selectedPillar, setSelectedPillar] = useState<WaackingPillar | null>(null);

  const handleOpenModal = (pillar: WaackingPillar) => {
    setSelectedPillar(pillar);
    if (onSelectPillar) onSelectPillar(pillar);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold text-[#D9A9FF] bg-[#D9A9FF]/10 border border-[#D9A9FF]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#D9A9FF]" /> FUNDAMENTOS TÉCNICOS
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
              COLECCIÓN DE 5 BANNERS CONCEPTUALES
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Los 5 Pilares del Waacking
          </h2>
          <p className="text-xs text-slate-300">
            Explora los cimientos biomecánicos y expresivos que definen la técnica oficial en las cátedras.
          </p>
        </div>
      </div>

      {/* Grid of 5 Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {WAACKING_PILLARS.map((pillar) => (
          <motion.div
            key={pillar.id}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            onClick={() => handleOpenModal(pillar)}
            className="group cursor-pointer bg-[#0D0B18] border border-white/10 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between relative hover:border-white/30 transition-all"
            style={{
              backgroundImage: `linear-gradient(135deg, ${pillar.gradientFrom} 0%, ${pillar.gradientTo} 100%)`
            }}
          >
            {/* Top Badge & Banner Header */}
            <div className="p-6 relative z-10 flex flex-col justify-between h-full min-h-[200px]">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-xl bg-black/60 border border-white/20 text-white backdrop-blur-md">
                  {pillar.category}
                </span>
                <span 
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-black/50 text-white border"
                  style={{ borderColor: pillar.accentColor }}
                >
                  {pillar.bpmRange}
                </span>
              </div>

              {/* Central Vector Icon Visual */}
              <div className="my-4 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                {pillar.svgIcon}
              </div>

              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-300">
                  {pillar.subtitle}
                </p>
                <h3 className="text-lg font-black text-white uppercase tracking-tight mt-0.5 drop-shadow-md">
                  {pillar.title}
                </h3>
              </div>
            </div>

            {/* Bottom Footer Button */}
            <div className="p-3 bg-black/60 border-t border-white/10 backdrop-blur-md flex items-center justify-between text-xs font-mono font-bold text-slate-300 group-hover:text-white transition-colors">
              <span>Ver Análisis Biomecánico</span>
              <ChevronRight className="w-4 h-4 text-[#D9A9FF] group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal detail view for selected pillar */}
      <AnimatePresence>
        {selectedPillar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0F0B1E] border border-white/20 rounded-3xl p-6 sm:p-8 max-w-xl w-full text-white relative shadow-2xl space-y-6 overflow-hidden"
              style={{
                backgroundImage: `radial-gradient(circle at top right, ${selectedPillar.gradientFrom}22, transparent)`
              }}
            >
              <button
                onClick={() => setSelectedPillar(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center border shadow-xl shrink-0 bg-black/50"
                  style={{ borderColor: selectedPillar.accentColor }}
                >
                  {selectedPillar.svgIcon}
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-[#D9A9FF] bg-[#D9A9FF]/10 border border-[#D9A9FF]/20 px-2.5 py-0.5 rounded-md">
                    {selectedPillar.category}
                  </span>
                  <h3 className="text-xl font-black uppercase text-white mt-1">
                    {selectedPillar.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedPillar.subtitle}</p>
                </div>
              </div>

              <div className="space-y-4 text-xs leading-relaxed border-y border-white/10 py-4">
                <div>
                  <h4 className="font-mono font-bold text-[#D9A9FF] uppercase mb-1 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Concepto Clave:
                  </h4>
                  <p className="text-slate-200">{selectedPillar.description}</p>
                </div>

                <div>
                  <h4 className="font-mono font-bold text-emerald-400 uppercase mb-1 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> Técnica Biomecánica:
                  </h4>
                  <p className="text-slate-200">{selectedPillar.keyTechnique}</p>
                </div>

                <div>
                  <h4 className="font-mono font-bold text-rose-400 uppercase mb-1 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" /> Error Común a Evitar:
                  </h4>
                  <p className="text-slate-200">{selectedPillar.commonMistake}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] font-mono text-slate-400">
                  Rango de Tempo: <strong className="text-white">{selectedPillar.bpmRange}</strong>
                </span>

                <button
                  onClick={() => setSelectedPillar(null)}
                  className="px-6 py-2.5 rounded-xl bg-[#D9A9FF] text-black font-extrabold text-xs uppercase shadow-lg hover:bg-yellow-300 transition-all"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
