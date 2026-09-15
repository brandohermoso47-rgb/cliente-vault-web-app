import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, 
  Headphones, 
  Play, 
  Pause, 
  Lock, 
  Sparkles, 
  Search, 
  Filter, 
  ChevronRight, 
  Clock, 
  Calendar, 
  User as UserIcon, 
  CheckCircle2, 
  Share2, 
  Volume2, 
  Layers, 
  Award,
  Crown,
  BookOpen
} from 'lucide-react';
import { PodcastShow, PodcastEpisode, User, InstructorCatedra } from '../types';
import { INITIAL_PODCAST_SHOWS, INITIAL_INSTRUCTORS } from '../data';
import AudioPlayer from './AudioPlayer';
import InstructorMembershipModal, { InstructorPlanInfo } from './InstructorMembershipModal';

interface PodcastsViewProps {
  currentUser: User;
  onUserChange?: (user: User) => void;
  podcastsList?: PodcastShow[];
  instructors?: InstructorCatedra[];
  onOpenInstructorMembership?: (instructorName: string) => void;
}

export default function PodcastsView({
  currentUser,
  onUserChange,
  podcastsList = INITIAL_PODCAST_SHOWS,
  instructors = INITIAL_INSTRUCTORS,
  onOpenInstructorMembership
}: PodcastsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'my_library'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Selected Podcast Show for detail view
  const [selectedShow, setSelectedShow] = useState<PodcastShow | null>(null);

  // Active Episode playing in Audio Player
  const [activeEpisode, setActiveEpisode] = useState<{
    episode: PodcastEpisode;
    show: PodcastShow;
  } | null>(null);

  // Instructor membership modal state
  const [selectedInstructorForSub, setSelectedInstructorForSub] = useState<InstructorPlanInfo | null>(null);

  // Determine active subscribed instructor IDs
  const subscribedInstructorIds = useMemo(() => {
    const list = [...(currentUser.subscribedInstructorIds || [])];
    try {
      const saved = localStorage.getItem('waack_subscribed_instructors');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach(id => {
            if (!list.includes(id)) list.push(id);
          });
        }
      }
    } catch (e) {
      // Ignore localStorage read error
    }
    // If billingStatus is active, auto subscribe to brando for full access
    if (currentUser.billingStatus === 'active' && !list.includes('inst-brando')) {
      list.push('inst-brando');
    }
    return list;
  }, [currentUser.subscribedInstructorIds, currentUser.billingStatus]);

  // Check if user is subscribed to an instructor
  const isUserSubscribedToInstructor = (instructorId: string) => {
    if (currentUser.role === 'instructor') return true; // Instructors have full access to their own & platform podcasts
    return subscribedInstructorIds.includes(instructorId) || currentUser.billingStatus === 'active';
  };

  // Filter Podcasts
  const filteredPodcasts = useMemo(() => {
    return (podcastsList || []).filter(pod => {
      if (!pod) return false;
      // Library filter
      if (activeSubTab === 'my_library') {
        if (!isUserSubscribedToInstructor(pod.instructorId)) return false;
      }

      // Category filter
      if (selectedCategory !== 'todos' && pod.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = (pod.title || '').toLowerCase().includes(query);
        const matchesInstructor = (pod.instructorName || '').toLowerCase().includes(query);
        const matchesDesc = (pod.description || '').toLowerCase().includes(query);
        const matchesEpisode = (pod.episodes || []).some(ep => ep && (ep.title || '').toLowerCase().includes(query));
        return matchesTitle || matchesInstructor || matchesDesc || matchesEpisode;
      }

      return true;
    });
  }, [podcastsList, activeSubTab, selectedCategory, searchQuery, subscribedInstructorIds]);

  const categories = ['todos', 'Historia & Cultura', 'Biomecánica & Técnica', 'Musicalidad & Síncopa', 'Entrevistas & Charlas'];

  const handlePlayEpisode = (episode: PodcastEpisode, show: PodcastShow) => {
    const isSub = isUserSubscribedToInstructor(show.instructorId);
    
    if (!isSub) {
      // Trigger subscription modal
      const inst = instructors.find(i => i.id === show.instructorId || i.name === show.instructorName) || {
        id: show.instructorId,
        name: show.instructorName,
        avatar: show.instructorAvatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
        specialties: ['Waacking', 'Técnica'],
        level: 'Todos los niveles',
        country: 'México',
        instagram: 'waackon_official',
        rating: 5.0,
        students: 240,
        monthlyPrice: '$45 USD/mes'
      };

      setSelectedInstructorForSub(inst);
      return;
    }

    setActiveEpisode({ episode, show });
  };

  const handleSubscribeSuccess = (instructorName: string) => {
    if (onUserChange) {
      const updatedList = [...(currentUser.subscribedInstructorIds || []), 'inst-brando', 'inst-kumari'];
      onUserChange({
        ...currentUser,
        subscribedInstructorIds: updatedList
      });
    }
    try {
      localStorage.setItem('waack_subscribed_instructors', JSON.stringify(['inst-brando', 'inst-kumari']));
    } catch (e) {}

    setSelectedInstructorForSub(null);
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-[#EDEFF4] flex flex-col min-h-full w-full custom-scrollbar p-4 sm:p-6 lg:p-8 space-y-8">

      {/* Page Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-50 via-white to-purple-50 dark:from-[#14162e] dark:via-[#0f1020] dark:to-[#1c1228] p-6 sm:p-8 border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(233,195,73,0.15)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D9A9FF]/20 border border-[#D9A9FF]/40 text-[#D9A9FF] text-xs font-mono font-bold uppercase tracking-widest">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            WAACK ON PODCASTS CÁTEDRA
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight font-mono uppercase">
            Audio Cátedra & Historia del Waacking
          </h1>

          <p className="text-sm text-gray-300 leading-relaxed font-sans">
            Escucha episodios exclusivos sobre historia del Disco 1970s, análisis biomecánico de aceleración de brazos, secretos de freestyle y metodologías pedagógicas. <strong className="text-[#D9A9FF]">Incluido 100% en la suscripción de cada instructor.</strong>
          </p>
        </div>
      </div>

      {/* Main Tabs (Explorar vs Mi Biblioteca) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('all')}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === 'all'
                ? 'bg-gradient-to-r from-[#E9C349] to-[#f3d775] text-black shadow-lg'
                : 'text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4" />
            Todos los Podcasts
          </button>

          <button
            onClick={() => setActiveSubTab('my_library')}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === 'my_library'
                ? 'bg-gradient-to-r from-[#E9C349] to-[#f3d775] text-black shadow-lg'
                : 'text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Headphones className="w-4 h-4" />
            Mi Biblioteca ({(podcastsList || []).filter(p => p && isUserSubscribedToInstructor(p.instructorId)).length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar podcast o episodio..."
            className="w-full bg-[#121426] border border-white/15 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#E9C349] transition-all"
          />
        </div>
      </div>

      {/* Categories Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
        <span className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1">
          Categoría:
        </span>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition-all shrink-0 cursor-pointer border ${
              selectedCategory === cat
                ? 'bg-[#E9C349] text-black border-[#E9C349] font-black shadow-md'
                : 'bg-white/5 text-gray-300 border-white/10 hover:border-slate-300 dark:hover:border-white/30'
            }`}
          >
            {cat === 'todos' ? 'Todas' : cat}
          </button>
        ))}
      </div>

      {/* SHOW DETAIL MODAL / VIEW (IF SELECTED) */}
      <AnimatePresence>
        {selectedShow && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-3xl bg-[#0f1122] border-2 border-[#D9A9FF]/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden"
          >
            <button
              onClick={() => setSelectedShow(null)}
              className="absolute top-6 right-6 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono font-bold text-gray-300 hover:text-white transition-all cursor-pointer"
            >
              ← Volver al Catálogo
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Cover Image 1:1 */}
              <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/20 shadow-2xl group">
                <img
                  src={selectedShow.coverImage}
                  alt={selectedShow.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                {!isUserSubscribedToInstructor(selectedShow.instructorId) && (
                  <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center border-2 border-[#C23E9E]">
                    <div className="w-12 h-12 rounded-full bg-[#C23E9E]/50 border border-[#D9A9FF] flex items-center justify-center mb-2">
                      <Lock className="w-6 h-6 text-[#D9A9FF]" />
                    </div>
                    <span className="font-mono font-bold text-xs uppercase text-[#D9A9FF]">
                      Contenido Bloqueado
                    </span>
                    <p className="text-[11px] text-gray-300 mt-1">
                      Suscríbete al instructor para desbloquear el player.
                    </p>
                  </div>
                )}
              </div>

              {/* Show Details */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#D9A9FF]/20 border border-[#D9A9FF]/50 text-[#D9A9FF] text-xs font-mono font-bold uppercase">
                    {selectedShow.category || 'Podcast Cátedra'}
                  </span>
                  <span className="text-xs font-mono text-gray-400">
                    {(selectedShow?.episodes || []).length} episodios publicados
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white font-mono uppercase tracking-wide">
                  {selectedShow.title}
                </h2>

                <div className="flex items-center gap-3 pt-1">
                  <img
                    src={selectedShow.instructorAvatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120'}
                    alt={selectedShow.instructorName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#D9A9FF]"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-white uppercase">{selectedShow.instructorName}</h4>
                    <span className="text-[10px] font-mono text-gray-400">Instructor Oficial Waack On</span>
                  </div>
                </div>

                <p className="text-sm text-gray-300 leading-relaxed pt-2">
                  {selectedShow.description}
                </p>

                {/* Subscription CTA if not subscribed */}
                {!isUserSubscribedToInstructor(selectedShow.instructorId) && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#C23E9E]/40 via-purple-950/40 to-[#0A0A0A] border border-[#C23E9E] flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <h4 className="font-mono font-bold text-xs text-[#D9A9FF] uppercase tracking-wider">
                        🔒 Acceso Exclusivo para Suscriptores
                      </h4>
                      <p className="text-xs text-gray-300 mt-0.5">
                        Suscríbete al instructor <strong className="text-white">{selectedShow.instructorName}</strong> para escuchar todos los episodios.
                      </p>
                    </div>
                    <button
                      onClick={() => (selectedShow?.episodes || [])[0] && handlePlayEpisode((selectedShow?.episodes || [])[0], selectedShow)}
                      className="px-5 py-2.5 rounded-xl bg-[#D9A9FF] hover:bg-[#B478F0] text-black font-mono text-xs font-black uppercase tracking-wider shadow-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" /> Suscribirme Ahora
                    </button>
                  </div>
                )}

                {/* EPISODES LIST */}
                <div className="pt-4 space-y-3">
                  <h3 className="font-mono font-bold text-sm uppercase text-gray-300 tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
                    <Radio className="w-4 h-4 text-[#D9A9FF]" />
                    Episodios Disponibles ({(selectedShow?.episodes || []).length})
                  </h3>

                  <div className="space-y-2.5">
                    {(selectedShow?.episodes || []).map(ep => {
                      const isSub = isUserSubscribedToInstructor(selectedShow.instructorId);
                      const isCurrentlyPlaying = activeEpisode?.episode.id === ep.id;

                      return (
                        <div
                          key={ep.id}
                          className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                            isCurrentlyPlaying
                              ? 'bg-[#D9A9FF]/15 border-[#D9A9FF] shadow-lg'
                              : 'bg-white/5 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <button
                              onClick={() => handlePlayEpisode(ep, selectedShow)}
                              className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold transition-all shrink-0 cursor-pointer ${
                                !isSub
                                  ? 'bg-[#C23E9E] hover:bg-[#C13F9C] text-white shadow-md'
                                  : isCurrentlyPlaying
                                    ? 'bg-[#D9A9FF] text-black shadow-[0_0_15px_rgba(217, 169, 255,0.5)]'
                                    : 'bg-white/10 hover:bg-[#D9A9FF] text-white hover:text-black'
                              }`}
                              title={!isSub ? 'Suscríbete para escuchar' : 'Reproducir Episodio'}
                            >
                              {!isSub ? (
                                <Lock className="w-5 h-5" />
                              ) : isCurrentlyPlaying ? (
                                <Pause className="w-5 h-5 fill-current" />
                              ) : (
                                <Play className="w-5 h-5 fill-current ml-0.5" />
                              )}
                            </button>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
                                {ep.episodeNumber && <span>E{ep.episodeNumber}</span>}
                                <span>•</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-[#D9A9FF]" /> {ep.duration}</span>
                                <span>•</span>
                                <span>{ep.publishDate}</span>
                              </div>
                              <h4 className="font-bold text-xs sm:text-sm text-white truncate mt-0.5">
                                {ep.title}
                              </h4>
                              <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                                {ep.description}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 text-right hidden sm:block">
                            <span className="text-[10px] font-mono text-gray-400 block">
                              {ep.playsCount || 0} reproducciones
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PODCAST SHOW CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPodcasts.map(pod => {
          const isSub = isUserSubscribedToInstructor(pod.instructorId);

          return (
            <motion.div
              key={pod.id}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedShow(pod)}
              className="group rounded-3xl bg-[#101224] border border-white/10 hover:border-[#D9A9FF]/60 p-5 transition-all shadow-xl flex flex-col justify-between cursor-pointer relative overflow-hidden"
            >
              <div>
                {/* 1:1 Cover Art Image */}
                <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 mb-4 bg-[#181a33]">
                  <img
                    src={pod.coverImage}
                    alt={pod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />

                  {/* Badge */}
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-[#D9A9FF] font-mono text-[10px] font-bold uppercase tracking-wider">
                    {pod.category || 'Podcast'}
                  </div>

                  {/* Lock Overlay if not subscribed */}
                  {!isSub ? (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#C23E9E] border border-[#D9A9FF]/50 text-white font-mono text-[9px] font-bold uppercase flex items-center gap-1 shadow-md">
                      <Lock className="w-3 h-3 text-[#D9A9FF]" /> Suscripción
                    </div>
                  ) : (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-mono text-[9px] font-bold uppercase flex items-center gap-1 shadow-md">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Desbloqueado
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-xs font-mono font-bold text-[#D9A9FF] flex items-center gap-1">
                      Ver Episodios <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Instructor Info */}
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={pod.instructorAvatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120'}
                    alt={pod.instructorName}
                    className="w-6 h-6 rounded-full object-cover border border-[#D9A9FF]"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-xs font-bold text-gray-300">{pod.instructorName}</span>
                </div>

                {/* Show Title & Desc */}
                <h3 className="font-mono font-black text-base text-white uppercase tracking-wide group-hover:text-[#D9A9FF] transition-colors leading-snug">
                  {pod.title}
                </h3>

                <p className="text-xs text-gray-400 line-clamp-2 mt-2 leading-relaxed">
                  {pod.description}
                </p>
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between text-xs font-mono text-gray-400">
                <span className="flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-[#D9A9FF]" /> {(pod?.episodes || []).length} episodios
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedShow(pod);
                  }}
                  className="text-[#D9A9FF] font-bold hover:underline flex items-center gap-0.5"
                >
                  Explorar
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredPodcasts.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-[#121426] border border-white/10 space-y-3">
          <Radio className="w-12 h-12 text-[#D9A9FF] mx-auto opacity-50" />
          <h3 className="text-lg font-bold font-mono text-white uppercase">
            No se encontraron podcasts
          </h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            {activeSubTab === 'my_library'
              ? 'Aún no estás suscrito a ningún instructor con podcasts publicados. Explora el catálogo general e inscríbete para desbloquear su contenido.'
              : 'Intenta ajustar tus filtros de búsqueda o categoría.'}
          </p>
        </div>
      )}

      {/* Persistent Audio Player */}
      {activeEpisode && (
        <AudioPlayer
          episode={activeEpisode.episode}
          show={activeEpisode.show}
          isSubscribed={isUserSubscribedToInstructor(activeEpisode.show.instructorId)}
          onClose={() => setActiveEpisode(null)}
          onSubscribeCTA={(instId, instName) => {
            const inst = instructors.find(i => i.id === instId || i.name === instName) || {
              id: instId,
              name: instName,
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
              specialties: ['Waacking', 'Técnica'],
              level: 'Todos los niveles',
              country: 'México',
              instagram: 'waackon_official',
              rating: 5.0,
              students: 240,
              monthlyPrice: '$45 USD/mes'
            };
            setSelectedInstructorForSub(inst);
          }}
        />
      )}

      {/* Instructor Membership Modal */}
      {selectedInstructorForSub && (
        <InstructorMembershipModal
          instructor={selectedInstructorForSub}
          onClose={() => setSelectedInstructorForSub(null)}
          onSubscribe={handleSubscribeSuccess}
        />
      )}

    </div>
  );
}
