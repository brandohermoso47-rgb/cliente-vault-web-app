import React, { useState } from 'react';
import { 
  Sparkles, 
  Check, 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  List, 
  Quote, 
  Code, 
  Eye, 
  Edit3, 
  Loader2, 
  Dumbbell, 
  Compass, 
  ShieldCheck, 
  AlertCircle,
  FileText,
  Zap,
  RotateCcw
} from 'lucide-react';
import { User } from '../types';
import { updateInstructorPricingMethodologyBackend } from '../lib/api';

interface TeachingMethodologyEditorProps {
  currentUser: User;
  language?: string;
  onSaveSuccess: (updatedUser: User) => void;
  playChime: (type?: string) => void;
}

const FREESTYLE_LAB_TOOLS = [
  { id: 'Espejo Ciego', label: '🪞 Espejo Ciego', desc: 'Desacoplamiento de dependencia visual y propiocepción somática.' },
  { id: 'DramaLab', label: '🎭 DramaLab', desc: 'Teatralidad, proyección de mirada y caracterización dramática.' },
  { id: 'BattleLab', label: '⚔️ BattleLab', desc: 'Simulaciones de batallas 1v1 bajo presión de tempo variable.' },
  { id: 'SomaticFeedbackLab', label: '🧘 SomaticFeedbackLab', desc: 'Memoria muscular, prevención de lesiones y alineación articular.' },
  { id: 'Entrenador de Ritmo', label: '🥁 Entrenador de Ritmo', desc: 'Drills de síncopa disco y precisión rítmica a 120-135 BPM.' },
  { id: 'Archivos Históricos LA', label: '🏛️ Archivos Históricos LA', desc: 'Contexto cultural del Waacking/Punking y la era Disco de Los Ángeles.' }
];

const DEFAULT_METHODOLOGY_TEMPLATE = `## 🎓 Metodología Pedagógica & Cátedra de Entrenamiento

Mi enfoque pedagógico combina la **precisión biomecánica** de la era Disco de los años 70 en Los Ángeles con el **acondicionamiento somático moderno**.

### 🔬 Integración del Freestyle Lab en mis Alumnos:
1. **Desacoplamiento Visual (Espejo Ciego)**:
   - Forzamos la percepción kinestésica sin depender del espejo para lograr simetría perfecta en los *arm-rolls*.
2. **Intencionalidad Dramática (DramaLab)**:
   - Ejercitamos micro-expresiones, miradas fijas y actitud escénica para dominar la presencia en batallas.
3. **Respuesta Rítmica Sincopada (Entrenador de Ritmo)**:
   - Drills acelerados de 110 a 135 BPM enfocados en la aceleración de muñecas en los acentos de la batería Disco.

> *"El Waacking no es solo acelerar los brazos; es la capacidad de congelar el tiempo con una mirada y habitar la música con elegancia."*
`;

export default function TeachingMethodologyEditor({
  currentUser,
  language = 'es',
  onSaveSuccess,
  playChime
}: TeachingMethodologyEditorProps) {
  const [methodologyText, setMethodologyText] = useState<string>(() => {
    return currentUser.methodologyDescription || DEFAULT_METHODOLOGY_TEMPLATE;
  });

  const [selectedTools, setSelectedTools] = useState<string[]>(() => {
    return currentUser.associatedLabTools && currentUser.associatedLabTools.length > 0
      ? currentUser.associatedLabTools
      : ['Espejo Ciego', 'DramaLab', 'BattleLab', 'SomaticFeedbackLab', 'Entrenador de Ritmo'];
  });

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const toggleTool = (toolId: string) => {
    setSelectedTools(prev => 
      prev.includes(toolId) ? prev.filter(t => t !== toolId) : [...prev, toolId]
    );
  };

  const applyFormatting = (prefix: string, suffix: string = '') => {
    setMethodologyText(prev => {
      const trimmed = prev.trimEnd();
      return `${trimmed}\n${prefix}Texto${suffix}`;
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Parse current price or fallback to 15
    const cleanPrice = (currentUser.monthlyPrice || '$15.00').replace(/[^0-9.]/g, '');
    const numPrice = parseFloat(cleanPrice) || 15.0;

    try {
      await updateInstructorPricingMethodologyBackend(currentUser, {
        monthlyPriceUSD: numPrice,
        monthlyPriceFormatted: currentUser.monthlyPrice || `$${numPrice.toFixed(2)} USD/mes`,
        methodologyDescription: methodologyText,
        associatedLabTools: selectedTools
      });

      const updatedUser: User = {
        ...currentUser,
        monthlyPriceUSD: numPrice,
        methodologyDescription: methodologyText,
        associatedLabTools: selectedTools
      };

      onSaveSuccess(updatedUser);
      playChime('success');
      setSuccessMsg('¡Metodología pedagógica y herramientas del Freestyle Lab guardadas exitosamente en el servidor!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('[Methodology Save Error]:', err);
      setErrorMsg(err.message || 'Error al guardar la metodología en el servidor.');
      playChime('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#100D18] border border-[#312340] rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden text-slate-200">
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#C23E9E]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2B1E37] pb-5">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-[#C23E9E]/20 border border-[#C23E9E]/40 text-[#D9A9FF] shrink-0">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold text-[#D9A9FF] uppercase tracking-widest flex items-center gap-1.5">
              <span>EXPEDIENTE DEL INSTRUCTOR</span>
              <span className="px-2 py-0.5 rounded-full bg-[#C23E9E]/30 text-white text-[9px]">FREESTYLE LAB</span>
            </div>
            <h3 className="text-lg font-black text-white tracking-wide mt-0.5">
              Metodología Pedagógica & Herramientas de Cátedra
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Asocia las herramientas del Freestyle Lab y describe detalladamente tu enfoque de entrenamiento para tus alumnos.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#C23E9E] via-[#C23FA0] to-[#D9A9FF] text-white text-xs font-mono font-bold uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 self-start md:self-auto"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#D9A9FF]" />
              <span>Guardando en Servidor...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4 text-[#D9A9FF]" />
              <span>Guardar Metodología</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. Freestyle Lab Associated Tools Selector */}
      <div className="space-y-3 bg-[#161220] p-5 rounded-2xl border border-[#2B1F38]">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-[#D9A9FF]" />
            Herramientas del Freestyle Lab Asociadas a tu Cátedra
          </h4>
          <span className="text-[10px] font-mono text-slate-400">
            {selectedTools.length} seleccionadas
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Selecciona las herramientas tecnológicas de la plataforma que utilizas explícitamente dentro de tu plan de enseñanza:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
          {FREESTYLE_LAB_TOOLS.map(tool => {
            const isSelected = selectedTools.includes(tool.id);
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => toggleTool(tool.id)}
                className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                  isSelected
                    ? 'bg-[#1E122A] border-[#D9A9FF]/60 shadow-md text-white'
                    : 'bg-[#120F1B] border-[#2B2036] hover:border-[#3D2C4D] text-slate-400'
                }`}
              >
                <div className={`mt-0.5 p-1 rounded-lg shrink-0 ${isSelected ? 'bg-[#D9A9FF] text-black' : 'bg-slate-800 text-slate-500'}`}>
                  <Check className="w-3 h-3" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold block leading-snug">{tool.label}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 leading-tight">{tool.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Rich Text Editor for Teaching Methodology */}
      <div className="space-y-3 bg-[#161220] p-5 rounded-2xl border border-[#2B1F38]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#D9A9FF]" />
            Módulo de Edición de Texto Enriquecido (Rich Text / Markdown)
          </h4>

          {/* Editor vs Preview Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0D0A14] border border-[#2A1E35] self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'editor'
                  ? 'bg-[#C23E9E] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'preview'
                  ? 'bg-[#D9A9FF] text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Vista Previa</span>
            </button>
          </div>
        </div>

        {activeTab === 'editor' ? (
          <div className="space-y-3">
            {/* Rich Formatting Toolbar */}
            <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-[#100D18] border border-[#291E35]">
              <button
                type="button"
                onClick={() => applyFormatting('**', '**')}
                className="p-1.5 rounded-lg bg-[#1D1728] hover:bg-[#2B213B] text-slate-300 hover:text-white text-xs font-bold transition-colors"
                title="Negrita"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => applyFormatting('*', '*')}
                className="p-1.5 rounded-lg bg-[#1D1728] hover:bg-[#2B213B] text-slate-300 hover:text-white text-xs font-bold transition-colors"
                title="Cursiva"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <span className="w-px h-4 bg-[#291E35] mx-1" />
              <button
                type="button"
                onClick={() => applyFormatting('## ')}
                className="p-1.5 rounded-lg bg-[#1D1728] hover:bg-[#2B213B] text-slate-300 hover:text-white text-xs font-bold transition-colors"
                title="Encabezado H2"
              >
                <Heading1 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => applyFormatting('### ')}
                className="p-1.5 rounded-lg bg-[#1D1728] hover:bg-[#2B213B] text-slate-300 hover:text-white text-xs font-bold transition-colors"
                title="Subencabezado H3"
              >
                <Heading2 className="w-3.5 h-3.5" />
              </button>
              <span className="w-px h-4 bg-[#291E35] mx-1" />
              <button
                type="button"
                onClick={() => applyFormatting('- ')}
                className="p-1.5 rounded-lg bg-[#1D1728] hover:bg-[#2B213B] text-slate-300 hover:text-white text-xs font-bold transition-colors"
                title="Lista de Viñetas"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => applyFormatting('> ')}
                className="p-1.5 rounded-lg bg-[#1D1728] hover:bg-[#2B213B] text-slate-300 hover:text-white text-xs font-bold transition-colors"
                title="Cita / Frase"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => applyFormatting('```\n', '\n```')}
                className="p-1.5 rounded-lg bg-[#1D1728] hover:bg-[#2B213B] text-slate-300 hover:text-white text-xs font-bold transition-colors"
                title="Bloque de Código / Destacado"
              >
                <Code className="w-3.5 h-3.5" />
              </button>

              {/* Template Presets */}
              <div className="ml-auto flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setMethodologyText(DEFAULT_METHODOLOGY_TEMPLATE)}
                  className="px-2.5 py-1 rounded-lg bg-[#271B33] hover:bg-[#362547] text-[#D9A9FF] text-[10px] font-mono font-bold flex items-center gap-1 transition-all"
                >
                  <Zap className="w-3 h-3 text-[#D9A9FF]" />
                  <span>Cargar Plantilla Oficial</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethodologyText('')}
                  className="p-1 rounded-lg bg-[#1D1728] hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 text-xs transition-colors"
                  title="Borrar Texto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Rich Text Area */}
            <textarea
              value={methodologyText}
              onChange={e => setMethodologyText(e.target.value)}
              placeholder="Escribe en detalle tu enfoque metodológico, ejercicios de arm-rolls, uso del Espejo Ciego y DramaLab..."
              className="w-full h-64 p-4 rounded-2xl bg-[#0F0C16] border border-[#2B1E37] focus:border-[#D9A9FF] focus:outline-none text-xs font-mono text-slate-200 placeholder-slate-600 transition-colors resize-y leading-relaxed"
            />
          </div>
        ) : (
          /* Rendered Formatted Preview */
          <div className="p-5 rounded-2xl bg-[#0F0C16] border border-[#2B1E37] space-y-4 min-h-[260px] text-xs leading-relaxed text-slate-200">
            <div className="text-[10px] font-mono text-[#D9A9FF] font-bold uppercase tracking-widest border-b border-[#291D34] pb-2 flex items-center justify-between">
              <span>VISTA PREVIA PUBLICADA PARA ALUMNOS</span>
              <span className="px-2 py-0.5 rounded bg-[#D9A9FF]/20 text-[#D9A9FF]">DIRECTORIO GLOBAL</span>
            </div>

            <div className="prose prose-invert max-w-none space-y-3">
              {(methodologyText || '').split('\n\n').map((paragraph, pIdx) => {
                const trimmed = paragraph.trim();
                if (trimmed.startsWith('## ')) {
                  return (
                    <h2 key={pIdx} className="text-base font-black text-white uppercase tracking-wide border-b border-[#2B1F38] pb-1.5 text-[#D9A9FF]">
                      {trimmed.replace('## ', '')}
                    </h2>
                  );
                }
                if (trimmed.startsWith('### ')) {
                  return (
                    <h3 key={pIdx} className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wider mt-2">
                      {trimmed.replace('### ', '')}
                    </h3>
                  );
                }
                if (trimmed.startsWith('> ')) {
                  return (
                    <blockquote key={pIdx} className="p-3.5 rounded-xl bg-[#1A1125] border-l-4 border-[#D9A9FF] italic text-slate-300 text-xs my-2">
                      {trimmed.replace('> ', '')}
                    </blockquote>
                  );
                }
                if (trimmed.startsWith('1. ') || trimmed.startsWith('- ')) {
                  return (
                    <ul key={pIdx} className="space-y-1.5 pl-2 my-2">
                      {trimmed.split('\n').map((line, lIdx) => (
                        <li key={lIdx} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-[#D9A9FF] font-bold">•</span>
                          <span>{line.replace(/^[0-9]+\.\s*/, '').replace(/^-\s*/, '')}</span>
                        </li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <p key={pIdx} className="text-xs text-slate-300 leading-relaxed">
                    {trimmed}
                  </p>
                );
              })}
            </div>

            {/* Badges of selected tools */}
            <div className="pt-3 border-t border-[#231A2E]">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block mb-2">
                Herramientas del Freestyle Lab Integradas:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedTools.map(t => (
                  <span key={t} className="px-2.5 py-1 rounded-xl bg-[#C23E9E]/20 border border-[#C23E9E]/40 text-[#D9A9FF] text-[10px] font-mono font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3 text-[#D9A9FF]" />
                    <span>{t}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
