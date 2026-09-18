import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Presentation, Play, ExternalLink, Plus, Sparkles, CheckCircle2, ChevronRight, FileText, Monitor, Trash2, ArrowLeft } from 'lucide-react';
import { User } from '../types';
import { Language } from '../lib/translations';

interface GoogleSlidesViewProps {
  currentUser: User;
  language: Language;
  onClose?: () => void;
}

interface SlideDeck {
  id: string;
  title: string;
  category: string;
  embedUrl: string;
  slideCount: number;
  author: string;
  updatedAt: string;
  description: string;
}

const DEFAULT_SLIDE_DECKS: SlideDeck[] = [
  {
    id: 'deck-1',
    title: 'Fundamentos Biomecánicos de Poses & Arm Coordination (Waack On)',
    category: 'Técnica & Postura',
    embedUrl: 'https://docs.google.com/presentation/d/e/2PACX-1vS3w2yJq7v8z9k0_1m2n3p4q5r6s7t8u9v0w1x2y3z4/embed?start=false&loop=false&delayms=3000',
    slideCount: 24,
    author: 'Alexander Jackson (Cátedra Waack On)',
    updatedAt: '2026-07-28',
    description: 'Estudio profundo de los ángulos articulares, tensión dinámica y líneas de proyección en el Waacking profesional.'
  },
  {
    id: 'deck-2',
    title: 'Historia y Estética de los Clubes Underground de Los Ángeles (1970s)',
    category: 'Historia Lab',
    embedUrl: 'https://docs.google.com/presentation/d/e/2PACX-1vT4x3yK8u9v0w1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m7n8o9p0/embed?start=false&loop=false&delayms=3000',
    slideCount: 18,
    author: 'Comité Histórico Waack On',
    updatedAt: '2026-07-15',
    description: 'De Arthur Murrays y el cine clásico de Hollywood a los pioneros de la era disco en L.A. (Lord Waack, Arthur, Michael Alig).'
  },
  {
    id: 'deck-3',
    title: 'Metodología 80/20 para Instructores de Baile y Gestión de Cátedra',
    category: 'Gestión & Negocio',
    embedUrl: 'https://docs.google.com/presentation/d/e/2PACX-1vU5y4zL9v0w1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m7n8o9p1/embed?start=false&loop=false&delayms=3000',
    slideCount: 15,
    author: 'Alexander Jackson',
    updatedAt: '2026-07-20',
    description: 'Cómo optimizar la retención de alumnos, precios de clases y planeación de temarios formativos en la academia.'
  }
];

export default function GoogleSlidesView({ currentUser, language, onClose }: GoogleSlidesViewProps) {
  const [decks, setDecks] = useState<SlideDeck[]>(() => {
    try {
      const saved = localStorage.getItem('waack_google_slides_decks');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_SLIDE_DECKS;
  });

  const [selectedDeck, setSelectedDeck] = useState<SlideDeck>(() => decks[0] || DEFAULT_SLIDE_DECKS[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Técnica');
  const [newEmbedUrl, setNewEmbedUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isConnected, setIsConnected] = useState(true);

  const saveDecks = (updated: SlideDeck[]) => {
    setDecks(updated);
    try {
      localStorage.setItem('waack_google_slides_decks', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleAddDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newEmbedUrl.trim()) return;

    let processedUrl = newEmbedUrl.trim();
    if (processedUrl.includes('/edit') || processedUrl.includes('/view')) {
      processedUrl = processedUrl.replace(/\/edit.*$/, '/embed').replace(/\/view.*$/, '/embed');
      if (!processedUrl.includes('/embed')) {
        processedUrl += '/embed?start=false&loop=false&delayms=3000';
      }
    }

    const newDeck: SlideDeck = {
      id: `deck-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      embedUrl: processedUrl,
      slideCount: 10,
      author: currentUser.name,
      updatedAt: new Date().toISOString().split('T')[0],
      description: newDescription.trim() || 'Presentación personalizada de Google Slides.'
    };

    const updated = [newDeck, ...decks];
    saveDecks(updated);
    setSelectedDeck(newDeck);
    setNewTitle('');
    setNewEmbedUrl('');
    setNewDescription('');
    setShowAddModal(false);
  };

  const handleDeleteDeck = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if ((decks || []).length <= 1) return;
    const updated = (decks || []).filter(d => d.id !== id);
    saveDecks(updated);
    if (selectedDeck?.id === id) {
      setSelectedDeck(updated[0]);
    }
  };

  return (
    <div className="space-y-6 w-full p-4 sm:p-6 md:p-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/80 via-neutral-900 to-amber-950/60 border border-[#D9A9FF]/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
            <Presentation className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-black uppercase">
                Google Workspace API
              </span>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> OAuth: {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-headline-md">
              {language === 'es' ? 'Presentaciones de Google Slides (Cátedra)' : 'Google Slides Presentations'}
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              {language === 'es'
                ? 'Visualiza, presenta y sincroniza diapositivas oficiales de entrenamiento de Waacking, teoría biomecánica y manuales 80/20 directamente en la plataforma.'
                : 'View, present and sync official Waacking training slide decks, biomechanical theory, and 80/20 manuals directly within the platform.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold border border-white/10 transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Volver
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 md:flex-initial px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(217, 169, 255,0.3)] transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" /> {language === 'es' ? 'Añadir Google Slide' : 'Add Google Slide'}
          </button>
        </div>
      </div>

      {/* Main Grid: Deck Selector & Embed Player */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Decks List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#181818] border border-white/10 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-mono font-bold text-[#D9A9FF] uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#D9A9FF]" /> {language === 'es' ? 'Decks Disponibles' : 'Available Decks'} ({decks.length})
            </h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
              {decks.map(deck => {
                const isSelected = selectedDeck.id === deck.id;
                return (
                  <div
                    key={deck.id}
                    onClick={() => setSelectedDeck(deck)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-950/40 to-purple-950/30 border-amber-500/60 shadow-lg shadow-amber-500/5'
                        : 'bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {deck.category}
                      </span>
                      {decks.length > 1 && (
                        <button
                          onClick={(e) => handleDeleteDeck(deck.id, e)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 p-1 transition-all"
                          title="Eliminar deck"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                      {deck.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {deck.description}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-[10px] font-mono text-slate-400">
                      <span>{deck.slideCount} slides • {deck.updatedAt}</span>
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        Ver <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column: Active Google Slide Presentation Player */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#181818] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col h-[700px]">
            {/* Header info of selected presentation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">{selectedDeck.category}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-[10px] font-mono text-slate-400">Por {selectedDeck.author}</span>
                </div>
                <h2 className="text-lg font-bold text-white">{selectedDeck.title}</h2>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={selectedDeck.embedUrl.split('/embed')[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold border border-white/10 transition-all flex items-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" /> Abrir en Google Slides
                </a>
              </div>
            </div>

            {/* Embedded Iframe Player */}
            <div className="flex-1 w-full bg-black/80 rounded-2xl overflow-hidden border border-white/10 my-4 relative flex items-center justify-center">
              <iframe
                src={selectedDeck.embedUrl}
                title={selectedDeck.title}
                className="w-full h-full border-0"
                allowFullScreen={true}
                mozallowfullscreen="true"
                webkitallowfullscreen="true"
              />
            </div>

            {/* Description footer */}
            <div className="flex items-center justify-between pt-2 text-xs text-slate-400 shrink-0">
              <p>{selectedDeck.description}</p>
              <span className="font-mono text-[10px] text-amber-400 font-bold">Google Slides API v1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Adding Google Slide */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#1c1c1c] border border-amber-500/40 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Presentation className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">
                    {language === 'es' ? 'Vincular Presentación Google Slides' : 'Link Google Slides Presentation'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-white text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddDeck} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-300 uppercase mb-1">
                    {language === 'es' ? 'Título de la Presentación' : 'Presentation Title'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ej: Masterclass Avanzada de Wrist Rolls"
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 uppercase mb-1">
                    {language === 'es' ? 'Categoría' : 'Category'}
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="Técnica & Postura">Técnica & Postura</option>
                    <option value="Historia Lab">Historia Lab</option>
                    <option value="Gestión & Negocio">Gestión & Negocio</option>
                    <option value="Choreography">Coreografía & Rutinas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 uppercase mb-1">
                    {language === 'es' ? 'URL de Google Slides o Enlace de Insertar (Embed)' : 'Google Slides Embed or Share URL'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmbedUrl}
                    onChange={(e) => setNewEmbedUrl(e.target.value)}
                    placeholder="https://docs.google.com/presentation/d/.../embed?..."
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 font-mono text-xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Comparte tu presentación en Google Drive con acceso público (cualquier usuario con el enlace) y pega el enlace de inserción.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 uppercase mb-1">
                    {language === 'es' ? 'Descripción Breve' : 'Short Description'}
                  </label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Detalles sobre el contenido de las diapositivas..."
                    rows={3}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold border border-white/10"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl shadow-lg transition-all uppercase tracking-wider"
                  >
                    Guardar Deck
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
