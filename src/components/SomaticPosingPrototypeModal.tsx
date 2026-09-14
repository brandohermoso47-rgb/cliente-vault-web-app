// src/components/SomaticPosingPrototypeModal.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  Activity, 
  Layers, 
  Sliders, 
  Eye, 
  CheckCircle, 
  Download, 
  Maximize2, 
  RotateCcw, 
  Cpu, 
  Crosshair, 
  ShieldCheck, 
  Share2
} from 'lucide-react';

interface SomaticPosingPrototypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SomaticPosingPrototypeModal({
  isOpen,
  onClose
}: SomaticPosingPrototypeModalProps) {
  const [showSilhouette, setShowSilhouette] = useState(true);
  const [showKeypoints, setShowKeypoints] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showAngles, setShowAngles] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setToastMsg('⚡ Escaneando silueta somática y recomputando ángulos articulados...');
    setTimeout(() => {
      setIsAnalyzing(false);
      setToastMsg('✅ Análisis completado con éxito (Precisión Pose-Mesh: 99.4%)');
      setTimeout(() => setToastMsg(null), 3500);
    }, 1500);
  };

  const handleSaveData = () => {
    setToastMsg('💾 Guardando reporte somático en Wakaon Cloud DB...');
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/90 backdrop-blur-md overflow-y-auto custom-scrollbar">
        
        {/* Toast alert */}
        {toastMsg && (
          <div className="fixed top-6 right-6 z-50 bg-[#D9A9FF] text-black px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 border border-black/20 animate-bounce">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative bg-[#090B15] border-2 border-[#D9A9FF]/50 rounded-3xl max-w-7xl w-full p-4 sm:p-6 shadow-[0_0_50px_rgba(217, 169, 255,0.15)] z-10 space-y-4 overflow-y-auto max-h-[95vh] my-auto custom-scrollbar text-white"
        >
          {/* HEADER BAR */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-4 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#D9A9FF]/20 border border-[#D9A9FF] flex items-center justify-center text-[#D9A9FF] shrink-0 shadow-md">
                <Cpu className="w-5 h-5 text-[#D9A9FF] animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D9A9FF] text-black font-mono font-black text-[10px] uppercase tracking-wider">
                    WAKAON SOMATIC LAB
                  </span>
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30">
                    HERRAMIENTA SOMATIC FRAME ANNOTATOR v1.0
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight font-mono mt-0.5">
                  PROTOTIPO SOMÁTICO DE POSING (SOMATIC POSING PROTOTYPE)
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={handleSaveData}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Datos</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-2xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all border border-white/10 shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* MAIN 3-COLUMN WORKSPACE LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* PANEL IZQUIERDO: IMAGEN ORIGINAL DE POSING (4 COLS) */}
            <div className="lg:col-span-5 bg-[#0D0F1D] border border-white/10 rounded-2xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                  <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-[#D9A9FF]" />
                    1. IMAGEN ORIGINAL DE POSING
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">CANVAS 1080x1350</span>
                </div>

                <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10 bg-black group">
                  <img 
                    src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=900&q=80" 
                    alt="Waacking Dancer Original Pose" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                  
                  <div className="absolute top-3 left-3 bg-black/80 text-[#D9A9FF] text-[10px] font-mono font-bold px-3 py-1 rounded-xl border border-[#D9A9FF]/40 uppercase backdrop-blur-md">
                    Fotografía Base Sin Procesar
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 p-2.5 bg-black/80 border border-white/10 rounded-xl text-[11px] font-mono text-slate-300 backdrop-blur-md">
                    <p className="text-white font-bold">Bailarina: Waacking Performance</p>
                    <p className="text-[10px] text-slate-400">Atuendo: Top magenta y leggings negros • Fondo: Estudio difuminado</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-black/40 border border-white/10 rounded-xl text-[11px] font-mono text-slate-400 space-y-1">
                <span className="text-[#D9A9FF] font-bold">CAPTURA SENSORIAL:</span>
                <p>Captura estática en pico de aceleración de arms rolls. Pose de apertura torácica y extensión cenital de brazos.</p>
              </div>
            </div>

            {/* PANEL DERECHO: ANÁLISIS Y SUPERPOSICIÓN COLORIDA (5 COLS) */}
            <div className="lg:col-span-5 bg-[#0D0F1D] border border-[#D9A9FF]/40 rounded-2xl p-4 flex flex-col justify-between space-y-3 relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                  <span className="text-[11px] font-mono font-bold text-[#D9A9FF] uppercase tracking-wider flex items-center gap-1.5">
                    <Crosshair className="w-4 h-4 text-cyan-400 animate-spin" />
                    2. SUPERPOSICIÓN DE ANÁLISIS SOMÁTICO
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                    SKELETON ACTIVE
                  </span>
                </div>

                <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-[#D9A9FF]/50 bg-black group">
                  {/* Background Image */}
                  <img 
                    src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=900&q=80" 
                    alt="Waacking Pose Analysis Overlay" 
                    className="w-full h-full object-cover brightness-75 contrast-125"
                  />
                  
                  {/* OVERLAY SVG: SILHOUETTE, SKELETON MESH AND KEYPOINTS */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 133" preserveAspectRatio="none">
                    
                    {/* SILHOUETTE OUTLINE (GLOWING NEON YELLOW) */}
                    {showSilhouette && (
                      <path
                        d="M 50,15 C 45,15 42,20 40,25 C 32,15 22,10 18,15 C 15,20 22,35 28,48 C 32,58 35,68 38,78 C 36,90 32,108 30,122 C 38,122 45,120 50,120 C 55,120 62,122 70,122 C 68,108 64,90 62,78 C 65,68 68,58 72,48 C 78,35 85,20 82,15 C 78,10 68,15 60,25 C 58,20 55,15 50,15 Z"
                        fill="none"
                        stroke="#FAFD16"
                        strokeWidth="1.8"
                        strokeDasharray={isAnalyzing ? "2 1" : "none"}
                        className="filter drop-shadow-[0_0_8px_#FAFD16]"
                      />
                    )}

                    {/* SKELETON MESH (FINE BLUE LINES) */}
                    {showSkeleton && (
                      <g stroke="#38BDF8" strokeWidth="0.9" opacity="0.95" strokeDasharray="none">
                        {/* Spine */}
                        <line x1="50" y1="20" x2="50" y2="65" />
                        
                        {/* Shoulder girdle */}
                        <line x1="50" y1="28" x2="38" y2="28" />
                        <line x1="50" y1="28" x2="62" y2="28" />
                        
                        {/* Left Arm (Raised) */}
                        <line x1="38" y1="28" x2="26" y2="18" />
                        <line x1="26" y1="18" x2="20" y2="12" />

                        {/* Right Arm (Raised) */}
                        <line x1="62" y1="28" x2="74" y2="18" />
                        <line x1="74" y1="18" x2="80" y2="12" />

                        {/* Pelvis & Legs */}
                        <line x1="50" y1="65" x2="42" y2="92" />
                        <line x1="42" y1="92" x2="38" y2="120" />
                        <line x1="50" y1="65" x2="58" y2="92" />
                        <line x1="58" y1="92" x2="62" y2="120" />
                      </g>
                    )}

                    {/* KEYPOINTS (ORANGE VIBRANT CIRCLES) */}
                    {showKeypoints && (
                      <g fill="#FF6B00" stroke="#FFFFFF" strokeWidth="0.5">
                        {/* Head & Neck */}
                        <circle cx="50" cy="18" r="2.2" className="animate-ping opacity-75" />
                        <circle cx="50" cy="18" r="1.8" />
                        <circle cx="50" cy="28" r="1.5" />

                        {/* Shoulders */}
                        <circle cx="38" cy="28" r="1.8" />
                        <circle cx="62" cy="28" r="1.8" />

                        {/* Elbows */}
                        <circle cx="26" cy="18" r="1.8" />
                        <circle cx="74" cy="18" r="1.8" />

                        {/* Wrists */}
                        <circle cx="20" cy="12" r="1.8" />
                        <circle cx="80" cy="12" r="1.8" />

                        {/* Spine mid */}
                        <circle cx="50" cy="46" r="1.5" />

                        {/* Hips */}
                        <circle cx="50" cy="65" r="1.8" />
                        <circle cx="42" cy="68" r="1.5" />
                        <circle cx="58" cy="68" r="1.5" />

                        {/* Knees */}
                        <circle cx="42" cy="92" r="1.8" />
                        <circle cx="58" cy="92" r="1.8" />

                        {/* Ankles */}
                        <circle cx="38" cy="120" r="1.8" />
                        <circle cx="62" cy="120" r="1.8" />
                      </g>
                    )}
                  </svg>

                  {/* FLOATING SPANISH DATA TAGS NEAR KEYPOINTS */}
                  {showAngles && (
                    <>
                      <div className="absolute top-[12%] left-[10%] bg-black/85 border border-cyan-400/80 px-2 py-0.5 rounded text-[9px] font-mono font-bold text-cyan-300 shadow-xl backdrop-blur-md">
                        Ángulo Codo Izq: 95°
                      </div>

                      <div className="absolute top-[12%] right-[10%] bg-black/85 border border-cyan-400/80 px-2 py-0.5 rounded text-[9px] font-mono font-bold text-cyan-300 shadow-xl backdrop-blur-md">
                        Ángulo Codo Der: 92°
                      </div>

                      <div className="absolute top-[38%] left-[2%] bg-black/85 border border-[#D9A9FF]/80 px-2 py-0.5 rounded text-[9px] font-mono font-bold text-[#D9A9FF] shadow-xl backdrop-blur-md">
                        Eje Columna: 98.4% Vertical
                      </div>

                      <div className="absolute top-[52%] right-[4%] bg-black/85 border border-amber-400/80 px-2 py-0.5 rounded text-[9px] font-mono font-bold text-amber-300 shadow-xl backdrop-blur-md">
                        Alineación de Cadera: OK
                      </div>

                      <div className="absolute bottom-[10%] left-[15%] bg-black/85 border border-emerald-400/80 px-2 py-0.5 rounded text-[9px] font-mono font-bold text-emerald-300 shadow-xl backdrop-blur-md">
                        Paso Inercial: 128 BPM
                      </div>
                    </>
                  )}

                  <div className="absolute bottom-3 right-3 bg-black/80 border border-white/10 px-2.5 py-1 rounded-xl text-[9px] font-mono text-slate-300 backdrop-blur-md">
                    Pose Precision Score: <span className="text-emerald-400 font-bold">99.4%</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-black/40 border border-[#D9A9FF]/20 rounded-xl text-[11px] font-mono text-slate-300 flex items-center justify-between">
                <span>Detección de puntos: 17 articulaciones</span>
                <span className="text-[#D9A9FF] font-bold">Malla Esquelética 2D Active</span>
              </div>
            </div>

            {/* PANEL LATERAL DE CONTROLES (2 COLS) */}
            <div className="lg:col-span-2 bg-[#0D0F1D] border border-white/10 rounded-2xl p-4 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="border-b border-white/10 pb-2">
                  <h4 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-[#D9A9FF]" />
                    CONTROLES
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Ajuste de capas somáticas</p>
                </div>

                {/* BOTONES DE ACCIÓN PRINCIPALES */}
                <div className="space-y-2">
                  <button
                    onClick={handleRunAnalysis}
                    disabled={isAnalyzing}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#D9A9FF] hover:bg-[#F2CFFF] text-black font-mono font-black text-xs uppercase transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Activity className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    <span>{isAnalyzing ? 'Procesando...' : 'Analizar Silueta'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowKeypoints(!showKeypoints);
                      setToastMsg(showKeypoints ? 'Puntos desactivados' : 'Puntos de seguimiento activados');
                      setTimeout(() => setToastMsg(null), 2000);
                    }}
                    className={`w-full py-2 px-3 rounded-xl border font-mono text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      showKeypoints 
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Generar Puntos</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowAngles(!showAngles);
                      setToastMsg(showAngles ? 'Etiquetas ocultadas' : 'Etiquetas de ángulos activadas');
                      setTimeout(() => setToastMsg(null), 2000);
                    }}
                    className={`w-full py-2 px-3 rounded-xl border font-mono text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      showAngles 
                        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' 
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Ángulos</span>
                  </button>

                  <button
                    onClick={handleSaveData}
                    className="w-full py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/30 font-mono text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-purple-300" />
                    <span>Guardar Datos</span>
                  </button>
                </div>

                {/* TOGGLES DE CAPA */}
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <p className="text-[10px] font-mono text-slate-400 font-bold uppercase">CAPAS VISUALES:</p>

                  <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer font-mono">
                    <span>Contorno Neón:</span>
                    <input 
                      type="checkbox" 
                      checked={showSilhouette} 
                      onChange={(e) => setShowSilhouette(e.target.checked)}
                      className="accent-[#D9A9FF] w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer font-mono">
                    <span>Malla Azul 2D:</span>
                    <input 
                      type="checkbox" 
                      checked={showSkeleton} 
                      onChange={(e) => setShowSkeleton(e.target.checked)}
                      className="accent-cyan-400 w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* FOOTER METRICS */}
              <div className="pt-3 border-t border-white/10 text-[10px] font-mono text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>FPS:</span>
                  <span className="text-emerald-400 font-bold">60.0</span>
                </div>
                <div className="flex justify-between">
                  <span>Latencia:</span>
                  <span className="text-cyan-400 font-bold">4.2 ms</span>
                </div>
              </div>

            </div>

          </div>

          {/* BOTTOM FOOTER INFORMATION */}
          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Tecnología somática oficial de anotación biomecánica para Waacking de Wakaon.</span>
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold uppercase transition-all"
            >
              Cerrar Herramienta
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
