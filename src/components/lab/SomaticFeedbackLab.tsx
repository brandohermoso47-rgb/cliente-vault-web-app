import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, PlayCircle, Clock, CheckCircle2, Filter, AlertCircle } from 'lucide-react';
import { FeedbackItem, User } from '../../types';

export interface SomaticFeedbackLabProps {
  currentUser: User;
  feedbackItems: FeedbackItem[];
  showFeedbackForm: boolean;
  setShowFeedbackForm: (show: boolean) => void;
  newVideoTitle: string;
  setNewVideoTitle: (val: string) => void;
  newVideoUrl: string;
  setNewVideoUrl: (val: string) => void;
  newVideoDesc: string;
  setNewVideoDesc: (val: string) => void;
  handleFeedbackSubmit: (e: React.FormEvent) => void;
  correctionTime: Record<string, string>;
  setCorrectionTime: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  correctionText: Record<string, string>;
  setCorrectionText: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleAddCorrectionSubmit: (itemId: string) => void;
}

const SomaticFeedbackLabComponent: React.FC<SomaticFeedbackLabProps> = ({
  currentUser,
  feedbackItems,
  showFeedbackForm,
  setShowFeedbackForm,
  newVideoTitle,
  setNewVideoTitle,
  newVideoUrl,
  setNewVideoUrl,
  newVideoDesc,
  setNewVideoDesc,
  handleFeedbackSubmit,
  correctionTime,
  setCorrectionTime,
  correctionText,
  setCorrectionText,
  handleAddCorrectionSubmit
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');

  const pendingItems = (feedbackItems || []).filter(item => item && !item.completed);
  const completedItems = (feedbackItems || []).filter(item => item && item.completed);

  const displayedItems = (feedbackItems || []).filter(item => {
    if (!item) return false;
    if (filterStatus === 'pending') return !item.completed;
    if (filterStatus === 'completed') return item.completed;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* PANEL DEDICADO: VÍDEOS PENDIENTES DE REVISIÓN & FILTROS */}
      <div className="bg-[#121212] border border-[#E9C349]/30 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[#262626] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Panel de Vídeos en Espera de Revisión
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {pendingItems.length} {pendingItems.length === 1 ? 'pendiente' : 'pendientes'}
                </span>
              </div>
              <p className="text-[11px] text-[#8A8A8A] font-medium mt-0.5">
                Visualización exclusiva de los videos de práctica pendientes por recibir retroalimentación técnica e instructiva.
              </p>
            </div>
          </div>

          {/* Filtros rápidos */}
          <div className="flex items-center gap-1.5 bg-[#0A0A0A] p-1 rounded-xl border border-[#262626] text-[11px] font-mono font-bold shrink-0">
            <button
              id="filter-feedback-all"
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-[#E9C349] text-black shadow-md'
                  : 'text-[#8A8A8A] hover:text-white'
              }`}
            >
              Todos ({feedbackItems.length})
            </button>
            <button
              id="filter-feedback-pending"
              type="button"
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                filterStatus === 'pending'
                  ? 'bg-amber-500 text-black shadow-md font-bold'
                  : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Esperando Revisión ({pendingItems.length})
            </button>
            <button
              id="filter-feedback-completed"
              type="button"
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                filterStatus === 'completed'
                  ? 'bg-emerald-500 text-black shadow-md font-bold'
                  : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Revisados ({completedItems.length})
            </button>
          </div>
        </div>

        {/* Tarjetas resumen de pendientes */}
        {pendingItems.length > 0 && filterStatus !== 'completed' && (
          <div className="bg-[#0A0A0A] border border-amber-500/20 rounded-xl p-3.5 space-y-2">
            <h4 className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Prácticas Entregadas en Espera de Evaluación ({pendingItems.length}):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {pendingItems.map((item) => (
                <div
                  key={`quick-pending-${item.id}`}
                  onClick={() => {
                    setFilterStatus('pending');
                    const el = document.getElementById(`feedback-card-${item.id}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-[#121212] border border-[#262626] hover:border-amber-500/40 p-2.5 rounded-xl flex items-center justify-between gap-3 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg overflow-hidden relative shrink-0 border border-[#262626]">
                      <img src={item.videoUrl} alt={item.videoTitle} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <PlayCircle className="w-4 h-4 text-white/80" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                        {item.videoTitle}
                      </p>
                      <p className="text-[10px] text-[#8A8A8A] font-mono flex items-center gap-1">
                        <span>{item.studentName}</span> • <span>{item.date}</span>
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md uppercase">
                    En Revisión
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass-panel deep-blue-depth p-6 rounded-2xl text-on-surface">
        <div>
          <h3 className="text-sm font-bold text-tertiary uppercase tracking-wider">🎬 Envía tu práctica para revisión</h3>
          <p className="text-xs text-on-surface-variant font-medium mt-1">Sube tus videos semanales de entrenamiento para recibir correcciones biomecánicas con marcas de tiempo.</p>
        </div>
        <button
          id="toggle-feedback-form-btn"
          onClick={() => setShowFeedbackForm(!showFeedbackForm)}
          className="px-4 py-2.5 bg-on-primary-fixed-variant hover:bg-on-primary-container text-primary-fixed text-xs font-bold rounded-xl transition-all flex items-center gap-2 uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4 text-primary-fixed" /> Subir Práctica
        </button>
      </div>

      {showFeedbackForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleFeedbackSubmit}
          className="bg-surface-container border border-tertiary/10 p-6 rounded-2xl shadow-xl space-y-4 text-on-surface"
        >
          <h4 className="text-xs font-mono font-black text-tertiary tracking-wider uppercase bg-tertiary/10 border border-tertiary/20 px-2.5 py-1 rounded-xl inline-block">
            REGISTRAR NUEVA PRÁCTICA DE BAILE
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">Título del video:</label>
              <input
                id="feedback-title-input"
                type="text"
                placeholder="Ej. Mi roll cruzado a 115 BPM..."
                value={newVideoTitle}
                onChange={(e) => setNewVideoTitle(e.target.value)}
                required
                className="w-full bg-[#0d0d11]/80 border border-tertiary/15 rounded-xl px-3 py-2.5 text-xs text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-tertiary/40 leading-relaxed font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">URL del vídeo:</label>
              <input
                id="feedback-url-input"
                type="url"
                placeholder="Ej. link de youtube o vimeo"
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
                required
                className="w-full bg-[#0d0d11]/80 border border-tertiary/15 rounded-xl px-3 py-2.5 text-xs text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-tertiary/40 leading-relaxed font-semibold"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">Preguntas o dudas específicas para corrección:</label>
            <textarea
              id="feedback-desc-input"
              rows={3}
              placeholder="Describe en qué te trabas, qué te cuesta, o qué quieres que corrijamos..."
              value={newVideoDesc}
              onChange={(e) => setNewVideoDesc(e.target.value)}
              required
              className="w-full bg-[#0d0d11]/80 border border-tertiary/15 rounded-xl p-3 text-xs text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-tertiary/40 leading-relaxed font-semibold resize-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              id="cancel-feedback-form"
              type="button"
              onClick={() => setShowFeedbackForm(false)}
              className="px-4 py-2 bg-transparent border border-tertiary/20 text-on-surface-variant hover:text-white hover:border-tertiary/40 text-xs font-semibold rounded-lg uppercase transition-all"
            >
              Cancelar
            </button>
            <button
              id="submit-feedback-form"
              type="submit"
              className="px-4 py-2 bg-on-primary-fixed-variant hover:bg-on-primary-container text-primary-fixed text-xs font-semibold rounded-lg shadow-lg hover:scale-105 active:scale-95 uppercase transition-all"
            >
              Subir Práctica
            </button>
          </div>
        </motion.form>
      )}

      {/* LISTA DE PRÁCTICAS FILTRADAS */}
      <div className="space-y-6">
        {displayedItems.length === 0 ? (
          <div className="p-10 bg-[#121212] border border-dashed border-[#262626] rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1F1F1F] flex items-center justify-center mx-auto text-[#8A8A8A]">
              <Filter className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {filterStatus === 'pending'
                ? '¡No hay videos pendientes de revisión!'
                : filterStatus === 'completed'
                ? 'No hay videos completados en esta categoría'
                : 'No hay entregas registradas'}
            </h4>
            <p className="text-xs text-[#8A8A8A] max-w-md mx-auto">
              {filterStatus === 'pending'
                ? 'Todas las prácticas entregadas han recibido correcciones biomecánicas por parte de los instructores.'
                : 'Sube una nueva entrega para comenzar tu proceso de evaluación.'}
            </p>
          </div>
        ) : (
          displayedItems.map((item) => (
            <div
              key={item.id}
              id={`feedback-card-${item.id}`}
              className="bg-surface-container border border-tertiary/10 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-12 gap-6 shadow-2xl text-on-surface mb-6 hover:border-tertiary/25 transition-all"
            >
              <div className="md:col-span-5 space-y-3">
                <div className="relative aspect-video rounded-xl border border-tertiary/10 overflow-hidden bg-[#08080a] shadow-lg group">
                  <img src={item.videoUrl} alt={item.videoTitle} className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-white/60 group-hover:text-white transition-colors cursor-pointer" />
                  </div>
                </div>
                <div>
                  <h4 className="text-[9px] font-mono font-bold text-tertiary bg-tertiary/10 border border-tertiary/20 px-2 py-0.5 rounded-lg inline-block uppercase tracking-wider">PRÁCTICA DEL ALUMNO</h4>
                  <h3 className="text-base font-display-lg font-bold text-white uppercase tracking-wider mt-1">{item.videoTitle}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-on-surface-variant font-mono mt-1">
                    <img src={item.studentAvatar} alt={item.studentName} className="w-4 h-4 rounded-full object-cover border border-tertiary/20" />
                    <span className="text-white font-semibold">{item.studentName}</span>
                    <span>•</span>
                    <span>{item.date}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant font-medium bg-[#0d0d11]/60 p-3 rounded-xl border border-tertiary/5 mt-3 leading-relaxed italic">
                    "{item.description}"
                  </p>
                </div>
              </div>

              <div className="md:col-span-7 flex flex-col justify-between border-t md:border-t-0 md:border-l border-tertiary/10 pt-4 md:pt-0 md:pl-6 space-y-4">
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                    <h4 className="text-[10px] font-mono font-bold text-tertiary tracking-wider uppercase bg-tertiary/10 border border-tertiary/20 px-2.5 py-0.5 rounded-lg inline-block">CORRECCIONES DE BRANDO</h4>
                    <span className={`text-[8px] px-2 py-0.5 rounded-lg border font-mono font-bold uppercase tracking-wider shadow-sm ${
                      item.completed 
                        ? 'bg-tertiary/10 text-tertiary border-tertiary/20' 
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                    }`}>
                      {item.completed ? 'COMPLETADO POR BRANDO' : '⏳ PENDIENTE DE EVALUAR'}
                    </span>
                  </div>

                  {(item.corrections || []).length > 0 ? (
                    <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                      {(item.corrections || []).map((corr) => (
                        <div key={corr.id} className="p-3 bg-[#0d0d11]/80 border border-tertiary/10 rounded-xl flex gap-3 items-start shadow-md mb-2">
                          <span className="shrink-0 text-[10px] font-mono font-bold bg-primary-container text-primary border border-primary/30 px-2 py-0.5 rounded-md mt-0.5">
                            {corr.time}
                          </span>
                          <div className="text-[11px]">
                            <p className="font-bold text-white flex items-center gap-1.5 uppercase">
                              <span>{corr.author}</span>
                              <span className="text-[9px] font-mono text-tertiary font-bold uppercase">({corr.role})</span>
                            </p>
                            <p className="text-on-surface-variant font-semibold mt-0.5 leading-relaxed">{corr.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-[#0d0d11]/50 border border-dashed border-amber-500/20 rounded-xl text-center text-xs text-amber-300/80 font-medium">
                      ⏳ No hay correcciones todavía para esta práctica. ¡En espera de revisión por el instructor!
                    </div>
                  )}
                </div>

                {currentUser.role === 'instructor' && (
                  <div className="p-4 bg-primary-container/20 border border-primary/20 rounded-xl space-y-3 shadow-md">
                    <h5 className="text-[10px] font-mono font-bold text-primary-fixed tracking-wider uppercase">AÑADIR CORRECCIÓN DE INSTRUCTOR</h5>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        id={`corr-time-input-${item.id}`}
                        type="text"
                        placeholder="Minuto (ej. 0:14)"
                        value={correctionTime[item.id] || ''}
                        onChange={(e) => setCorrectionTime(prev => ({ ...prev, [item.id]: e.target.value }))}
                        className="bg-[#0d0d11]/80 border border-tertiary/15 rounded-lg px-2.5 py-1.5 text-xs text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-tertiary/40 font-semibold w-full sm:w-32"
                      />
                      <input
                        id={`corr-text-input-${item.id}`}
                        type="text"
                        placeholder="Escribe la corrección técnica..."
                        value={correctionText[item.id] || ''}
                        onChange={(e) => setCorrectionText(prev => ({ ...prev, [item.id]: e.target.value }))}
                        className="flex-1 bg-[#0d0d11]/80 border border-tertiary/15 rounded-lg px-2.5 py-1.5 text-xs text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-tertiary/40 font-semibold"
                      />
                      <button
                        id={`corr-submit-${item.id}`}
                        onClick={() => handleAddCorrectionSubmit(item.id)}
                        className="bg-on-primary-fixed-variant hover:bg-on-primary-container text-primary-fixed text-xs font-bold px-4 py-1.5 rounded-lg transition-all shadow-md active:scale-95 uppercase shrink-0"
                      >
                        + Guardar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const SomaticFeedbackLab = React.memo(SomaticFeedbackLabComponent);
