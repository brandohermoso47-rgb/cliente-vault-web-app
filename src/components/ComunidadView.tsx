import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Megaphone, 
  Hand, 
  MessageSquare, 
  Plus, 
  Heart, 
  Send, 
  AlertCircle,
  Calendar,
  Lock,
  ZoomIn,
  X,
  ExternalLink,
  Video,
  Crown,
  Filter,
  Search,
  Sparkles,
  RotateCcw,
  Play,
  SlidersHorizontal,
  Check,
  Globe,
  Trophy
} from 'lucide-react';
import { User, Announcement, Presentation, ChatMessage } from '../types';
import { Language, translations, getAITranslation } from '../lib/translations';
import { Languages } from 'lucide-react';
import AnnouncementImagePicker from './AnnouncementImagePicker';
import WeeklyCommunityChallengeView from './WeeklyCommunityChallengeView';

interface ComunidadViewProps {
  currentUser: User;
  announcements: Announcement[];
  presentations: Presentation[];
  chatMessages: ChatMessage[];
  onAddAnnouncement: (title: string, content: string, important?: boolean, category?: string, actionUrl?: string, imageUrl?: string) => void;
  onAddPresentation: (text: string, videoUrl?: string) => void;
  onAddChatMessage: (text: string) => void;
  onLikePresentation: (id: string) => void;
  onAddCommentToPresentation: (presId: string, text: string) => void;
  language: Language;
}

export type CommunityFilterType = 'all' | 'video' | 'instructor' | 'important';

export default function ComunidadView({
  currentUser,
  announcements,
  presentations,
  chatMessages,
  onAddAnnouncement,
  onAddPresentation,
  onAddChatMessage,
  onLikePresentation,
  onAddCommentToPresentation,
  language
}: ComunidadViewProps) {
  // Navigation inside Comunidad (sub-tabs)
  const [subTab, setSubTab] = useState<'feed' | 'lobby' | 'presentate' | 'anuncios' | 'reto'>('feed');

  // Dynamic Filters State
  const [activeFilter, setActiveFilter] = useState<CommunityFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Translation cache state
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({});

  // Input states with Draft System (local storage auto-save)
  const [newAnnTitle, setNewAnnTitle] = useState<string>(() => {
    return localStorage.getItem('waackon_draft_announcement_title') || '';
  });
  const [newAnnContent, setNewAnnContent] = useState<string>(() => {
    return localStorage.getItem('waackon_draft_announcement_content') || '';
  });
  const [newAnnImportant, setNewAnnImportant] = useState(false);
  const [newAnnImage, setNewAnnImage] = useState<string | null>(null);
  const [newAnnCategory, setNewAnnCategory] = useState<'competencias' | 'sesiones' | 'clases' | 'comunicados'>('comunicados');
  const [newAnnActionUrl, setNewAnnActionUrl] = useState('');
  const [annLightboxImage, setAnnLightboxImage] = useState<string | null>(null);
  const [showAnnForm, setShowAnnForm] = useState(false);

  const [newPresText, setNewPresText] = useState('');
  const [newPresVideo, setNewPresVideo] = useState('');
  const [showPresForm, setShowPresForm] = useState(false);

  const [newLobbyText, setNewLobbyText] = useState<string>(() => {
    return localStorage.getItem('waackon_draft_community_chat') || '';
  });

  // Save Community Chat draft
  useEffect(() => {
    if (newLobbyText) {
      localStorage.setItem('waackon_draft_community_chat', newLobbyText);
    } else {
      localStorage.removeItem('waackon_draft_community_chat');
    }
  }, [newLobbyText]);

  // Save Announcement draft
  useEffect(() => {
    if (newAnnTitle) {
      localStorage.setItem('waackon_draft_announcement_title', newAnnTitle);
    } else {
      localStorage.removeItem('waackon_draft_announcement_title');
    }
  }, [newAnnTitle]);

  useEffect(() => {
    if (newAnnContent) {
      localStorage.setItem('waackon_draft_announcement_content', newAnnContent);
    } else {
      localStorage.removeItem('waackon_draft_announcement_content');
    }
  }, [newAnnContent]);

  // Comment input per presentation
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});

  const handleAnnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) return;
    onAddAnnouncement(
      newAnnTitle.trim(),
      newAnnContent.trim(),
      newAnnImportant,
      newAnnCategory,
      newAnnActionUrl.trim() || undefined,
      newAnnImage || undefined
    );
    setNewAnnTitle('');
    setNewAnnContent('');
    setNewAnnImportant(false);
    setNewAnnImage(null);
    setNewAnnActionUrl('');
    setShowAnnForm(false);
    localStorage.removeItem('waackon_draft_announcement_title');
    localStorage.removeItem('waackon_draft_announcement_content');
  };

  const handlePresSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresText.trim()) return;
    onAddPresentation(newPresText, newPresVideo || undefined);
    setNewPresText('');
    setNewPresVideo('');
    setShowPresForm(false);
  };

  const handleLobbySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLobbyText.trim()) return;
    onAddChatMessage(newLobbyText);
    setNewLobbyText('');
    localStorage.removeItem('waackon_draft_community_chat');
  };

  const handleCommentSubmit = (presId: string) => {
    const text = commentInputs[presId];
    if (!text || !text.trim()) return;
    onAddCommentToPresentation(presId, text);
    setCommentInputs(prev => ({ ...prev, [presId]: '' }));
  };

  // Helper to build normalized list of community posts
  const getUnifiedPosts = () => {
    const posts: Array<{
      id: string;
      postType: 'announcement' | 'presentation';
      title?: string;
      content: string;
      date: string;
      author: string;
      authorAvatar?: string;
      authorRole: string;
      important: boolean;
      category?: string;
      imageUrl?: string;
      actionUrl?: string;
      videoUrl?: string;
      hasVideo: boolean;
      isInstructor: boolean;
      likes?: number;
      comments?: any[];
      isLikedByMe?: boolean;
      rawAnn?: Announcement;
      rawPres?: Presentation;
    }> = [];

    // 1. Process Announcements
    (announcements || []).forEach(ann => {
      const isInstructor = ann.authorRole === 'instructor' || true;
      const hasVideo = !!(
        (ann.actionUrl && (
          ann.actionUrl.includes('youtube') || 
          ann.actionUrl.includes('youtu.be') || 
          ann.actionUrl.includes('vimeo') || 
          ann.actionUrl.includes('meet') || 
          ann.actionUrl.includes('video') || 
          ann.actionUrl.endsWith('.mp4')
        )) ||
        (ann.imageUrl && ann.imageUrl.includes('video'))
      );

      posts.push({
        id: `ann-${ann.id}`,
        postType: 'announcement',
        title: ann.title,
        content: ann.content,
        date: ann.date,
        author: ann.author,
        authorAvatar: ann.authorAvatar,
        authorRole: ann.authorRole || 'instructor',
        important: !!ann.important,
        category: ann.category,
        imageUrl: ann.imageUrl,
        actionUrl: ann.actionUrl,
        videoUrl: ann.actionUrl,
        hasVideo,
        isInstructor,
        rawAnn: ann
      });
    });

    // 2. Process Presentations / Student Posts
    (presentations || []).forEach(pres => {
      const lowerName = pres.studentName.toLowerCase();
      const isInstructor = lowerName.includes('brando') || 
                           lowerName.includes('kumari') || 
                           lowerName.includes('yoonji') || 
                           lowerName.includes('prof') || 
                           lowerName.includes('instructor') || 
                           lowerName.includes('maga');
      const hasVideo = !!(pres.videoUrl && pres.videoUrl.trim().length > 0);

      posts.push({
        id: `pres-${pres.id}`,
        postType: 'presentation',
        content: pres.text,
        date: pres.date,
        author: pres.studentName,
        authorAvatar: pres.studentAvatar,
        authorRole: isInstructor ? 'instructor' : 'estudiante',
        important: false,
        videoUrl: pres.videoUrl,
        hasVideo,
        isInstructor,
        likes: pres.likes,
        comments: pres.comments,
        isLikedByMe: pres.isLikedByMe,
        rawPres: pres
      });
    });

    return posts;
  };

  const allPosts = getUnifiedPosts();

  // Dynamic filter counters
  const totalCount = allPosts.length;
  const videosCount = allPosts.filter(p => p.hasVideo).length;
  const instructorsCount = allPosts.filter(p => p.isInstructor).length;
  const importantCount = allPosts.filter(p => p.important).length;

  // Filtered posts based on active filter and search query
  const filteredPosts = allPosts.filter(post => {
    // Tab Scoping
    if (subTab === 'presentate' && post.postType !== 'presentation') return false;
    if (subTab === 'anuncios' && post.postType !== 'announcement') return false;

    // Active Filter
    if (activeFilter === 'video' && !post.hasVideo) return false;
    if (activeFilter === 'instructor' && !post.isInstructor) return false;
    if (activeFilter === 'important' && !post.important) return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchText = (post.title || '').toLowerCase() + ' ' + 
                        post.content.toLowerCase() + ' ' + 
                        post.author.toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    return true;
  });

  return (
    <div className="flex-1 min-h-full w-full p-6 bg-background text-on-surface flex flex-col font-body-md">
      {/* Title */}
      <div className="border-b border-tertiary/20 pb-4 mb-6 z-10">
        <h2 className="text-2xl font-display-lg font-extrabold text-tertiary gold-glow tracking-tight uppercase">BIENVENIDA Y COMUNIDAD</h2>
        <p className="text-xs text-on-surface-variant font-semibold mt-1">El latido social de nuestra academia. Conecta, comparte y opina con tus compañeros.</p>
      </div>

      {/* Sub Navigation */}
      <div className="flex overflow-x-auto gap-2.5 mb-4 border-b border-tertiary/10 pb-3 scrollbar-none shrink-0 -mx-6 px-6 sm:mx-0 sm:px-0 z-10">
        <button
          id="subtab-feed"
          onClick={() => setSubTab('feed')}
          className={`group h-11 min-w-[170px] px-4 py-2.5 text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2 border rounded-xl shrink-0 focus:outline-none ${
            subTab === 'feed' 
              ? 'bg-surface-container border-tertiary/35 text-tertiary shadow-md' 
              : 'bg-transparent text-on-surface-variant border-transparent hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4 text-tertiary shrink-0 transition-transform duration-300 group-hover:scale-125 group-active:scale-90" />
          🌐 MURO COMUNIDAD ({totalCount})
        </button>

        <button
          id="subtab-lobby"
          onClick={() => setSubTab('lobby')}
          className={`group h-11 min-w-[170px] px-4 py-2.5 text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2 border rounded-xl shrink-0 focus:outline-none ${
            subTab === 'lobby' 
              ? 'bg-surface-container border-tertiary/35 text-tertiary shadow-md' 
              : 'bg-transparent text-on-surface-variant border-transparent hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-tertiary shrink-0 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 group-active:scale-90" />
          EL LOBBY (CHAT GENERAL)
        </button>

        <button
          id="subtab-presentate"
          onClick={() => setSubTab('presentate')}
          className={`group h-11 min-w-[170px] px-4 py-2.5 text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2 border rounded-xl shrink-0 focus:outline-none ${
            subTab === 'presentate' 
              ? 'bg-surface-container border-tertiary/35 text-tertiary shadow-md' 
              : 'bg-transparent text-on-surface-variant border-transparent hover:text-white'
          }`}
        >
          <Hand className="w-4 h-4 text-primary shrink-0 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 group-active:scale-90" />
          👋 PRESÉNTATE
        </button>

        <button
          id="subtab-reto"
          onClick={() => setSubTab('reto')}
          className={`group h-11 min-w-[190px] px-4 py-2.5 text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2 border rounded-xl shrink-0 focus:outline-none cursor-pointer ${
            subTab === 'reto' 
              ? 'bg-[#E9C349] text-black border-[#E9C349] shadow-lg scale-105 font-extrabold' 
              : 'bg-[#1b1424]/70 text-[#E9C349] border-[#E9C349]/30 hover:border-[#E9C349] hover:bg-[#E9C349]/10'
          }`}
        >
          <Trophy className={`w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-125 ${subTab === 'reto' ? 'text-black' : 'text-[#E9C349]'}`} />
          🏆 RETO SEMANAL
          <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${subTab === 'reto' ? 'bg-black/20 text-black' : 'bg-[#E9C349]/20 text-[#E9C349]'}`}>
            NEW
          </span>
        </button>

        <button
          id="subtab-anuncios"
          onClick={() => setSubTab('anuncios')}
          className={`group h-11 min-w-[170px] px-4 py-2.5 text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2 border rounded-xl shrink-0 focus:outline-none ${
            subTab === 'anuncios' 
              ? 'bg-surface-container border-tertiary/35 text-tertiary shadow-md' 
              : 'bg-transparent text-on-surface-variant border-transparent hover:text-white'
          }`}
        >
          <Megaphone className="w-4 h-4 text-tertiary shrink-0 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 group-active:scale-90" />
          ANUNCIOS OFICIALES
        </button>
      </div>

      {/* DYNAMIC FILTERS BAR (For feed, presentate and anuncios) */}
      {subTab !== 'lobby' && subTab !== 'reto' && (
        <div className="mb-6 p-4 bg-surface-container/90 border border-tertiary/20 rounded-2xl shadow-xl space-y-3 z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-tertiary/10 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-tertiary uppercase">
              <SlidersHorizontal className="w-4 h-4 text-[#E9C349]" />
              <span>Filtros Dinámicos del Muro</span>
            </div>

            {/* Live Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="community-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por palabra clave, usuario o tema..."
                className="w-full bg-[#0D0D11] border border-tertiary/20 rounded-xl pl-9 pr-8 py-1.5 text-xs text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-tertiary transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white text-xs p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Filter Pill Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] font-mono font-bold text-on-surface-variant/70 uppercase mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-[#E9C349]" />
              Mostrar:
            </span>

            {/* 1. All */}
            <button
              id="filter-chip-all"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#E9C349] text-black border-[#E9C349] shadow-md scale-105'
                  : 'bg-[#0D0D11] text-on-surface-variant border-tertiary/15 hover:border-tertiary/40 hover:text-white'
              }`}
            >
              <span>🌟 Todos</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${activeFilter === 'all' ? 'bg-black/20 text-black' : 'bg-tertiary/10 text-tertiary'}`}>
                {totalCount}
              </span>
            </button>

            {/* 2. Solo Videos */}
            <button
              id="filter-chip-videos"
              onClick={() => setActiveFilter('video')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                activeFilter === 'video'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md scale-105'
                  : 'bg-[#0D0D11] text-on-surface-variant border-tertiary/15 hover:border-blue-500/40 hover:text-blue-300'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Solo con Videos</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${activeFilter === 'video' ? 'bg-black/30 text-white' : 'bg-blue-500/20 text-blue-300'}`}>
                {videosCount}
              </span>
            </button>

            {/* 3. Solo Instructores */}
            <button
              id="filter-chip-instructors"
              onClick={() => setActiveFilter('instructor')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                activeFilter === 'instructor'
                  ? 'bg-purple-600 text-white border-purple-500 shadow-md scale-105'
                  : 'bg-[#0D0D11] text-on-surface-variant border-tertiary/15 hover:border-purple-500/40 hover:text-purple-300'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Solo Instructores</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${activeFilter === 'instructor' ? 'bg-black/30 text-white' : 'bg-purple-500/20 text-purple-300'}`}>
                {instructorsCount}
              </span>
            </button>

            {/* 4. Anuncios Importantes */}
            <button
              id="filter-chip-important"
              onClick={() => setActiveFilter('important')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                activeFilter === 'important'
                  ? 'bg-[#9A2B3C] text-white border-[#9A2B3C] shadow-md scale-105'
                  : 'bg-[#0D0D11] text-on-surface-variant border-tertiary/15 hover:border-red-500/40 hover:text-red-300'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5 text-primary-fixed" />
              <span>Anuncios Importantes</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${activeFilter === 'important' ? 'bg-black/30 text-white' : 'bg-red-500/20 text-red-300'}`}>
                {importantCount}
              </span>
            </button>

            {/* Reset Filter Button */}
            {(activeFilter !== 'all' || searchQuery !== '') && (
              <button
                id="filter-reset-button"
                onClick={() => {
                  setActiveFilter('all');
                  setSearchQuery('');
                }}
                className="ml-auto text-xs font-mono text-tertiary hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg border border-tertiary/20 bg-tertiary/5 hover:bg-tertiary/20 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer Filtros</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* CONTENT SWITCHER */}
      <div className="flex-1 flex flex-col z-10">
        {/* 1. LOBBY TAB */}
        {subTab === 'lobby' && (
          <div className="flex-1 flex flex-col min-h-[450px] bg-surface-container border border-tertiary/10 rounded-2xl overflow-hidden shadow-2xl text-on-surface">
            {/* Lobby Header */}
            <div className="p-4 bg-primary-container/20 border-b border-tertiary/10 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-mono font-bold text-tertiary uppercase tracking-wider">💬 SALA COMÚN</h3>
                <p className="text-[11px] text-on-surface-variant font-medium">Conversación abierta sobre música, inspiración y eventos de baile.</p>
              </div>
              <span className="text-[9px] font-mono bg-black/40 text-tertiary border border-tertiary/20 px-2.5 py-1 rounded-xl font-bold">
                {translations[language].onlineCount}
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[400px] bg-transparent">
              {(chatMessages || []).map((msg) => {
                const isMe = msg.user === currentUser.name;
                const isTranslated = !!translatedMessages[msg.id];
                const displayedText = isTranslated ? translatedMessages[msg.id] : msg.text;

                return (
                  <div key={msg.id} className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <img 
                      src={msg.avatar} 
                      alt={msg.user} 
                      className="w-8 h-8 rounded-full object-cover border border-tertiary/20" 
                      referrerPolicy="no-referrer"
                    />
                    <div className={`max-w-[70%] rounded-2xl p-3.5 border shadow-md ${
                      isMe 
                        ? 'bg-primary-container/20 border-primary/20 text-on-surface rounded-tr-none' 
                        : 'bg-[#0d0d11]/60 border-tertiary/5 text-on-surface rounded-tl-none'
                    }`}>
                      <div className="flex items-center gap-2 mb-1 justify-between flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-white uppercase">{msg.user}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold border uppercase ${
                            msg.role === 'instructor' 
                              ? 'text-tertiary border-tertiary/20 bg-tertiary/5' 
                              : 'text-on-surface-variant border-tertiary/10 bg-black/30'
                          }`}>
                            {msg.role}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-on-surface-variant font-mono">{msg.time}</span>
                          
                          {/* Chat inline translation */}
                          <button
                            type="button"
                            onClick={() => {
                              if (isTranslated) {
                                setTranslatedMessages(prev => {
                                  const copy = { ...prev };
                                  delete copy[msg.id];
                                  return copy;
                                });
                              } else {
                                const trans = getAITranslation(msg.text, language);
                                setTranslatedMessages(prev => ({
                                  ...prev,
                                  [msg.id]: trans
                                }));
                              }
                            }}
                            className="text-[8px] text-primary hover:text-white font-mono font-bold bg-[#121212] border border-[#262626] rounded px-1.5 py-0.5 flex items-center gap-1 transition-all active:scale-95"
                          >
                            <Languages className="w-2.5 h-2.5 text-primary" />
                            {isTranslated ? translations[language].showOriginal : translations[language].translateText}
                          </button>
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed font-semibold text-on-surface-variant">
                        {displayedText}
                        {isTranslated && (
                          <span className="text-[9px] text-[#E9C349] font-mono block mt-1">
                            * {translations[language].translatedByIA}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chat input form */}
            <form onSubmit={handleLobbySubmit} className="p-3.5 bg-surface-container/80 border-t border-tertiary/30 flex flex-col gap-2">
              {newLobbyText.trim() !== '' && (
                <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-3 py-1 rounded-xl">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    💾 Borrador guardado localmente
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setNewLobbyText('');
                      localStorage.removeItem('waackon_draft_community_chat');
                    }}
                    className="text-slate-400 hover:text-rose-300 underline cursor-pointer"
                  >
                    Descartar borrador
                  </button>
                </div>
              )}
              <div className="flex gap-2.5">
                <input
                  id="chat-lobby-input"
                  type="text"
                  placeholder={translations[language].writeLobby}
                  value={newLobbyText}
                  onChange={(e) => setNewLobbyText(e.target.value)}
                  className="flex-1 bg-[#18171B] border-2 border-tertiary/40 rounded-xl px-4 py-3 text-xs text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:border-tertiary focus:ring-2 focus:ring-tertiary/20 leading-relaxed font-semibold shadow-inner transition-all"
                />
                <button
                  id="chat-lobby-submit"
                  type="submit"
                  className="bg-tertiary hover:bg-tertiary-container text-on-tertiary border border-tertiary p-3 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center font-bold cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 2. RETO SEMANAL TAB */}
        {subTab === 'reto' && (
          <WeeklyCommunityChallengeView 
            currentUser={currentUser}
            language={language}
          />
        )}

        {/* 3. MURO GENERAL, PRESENTATE OR ANUNCIOS TAB */}
        {subTab !== 'lobby' && subTab !== 'reto' && (
          <div className="space-y-6">
            {/* Context Header and Creator Toggles */}
            {subTab === 'presentate' && (
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container border border-tertiary/10 p-5 rounded-2xl shadow-xl text-on-surface">
                <div>
                  <h3 className="text-sm font-bold text-tertiary uppercase tracking-wider">👋 ¡Queremos conocerte!</h3>
                  <p className="text-xs text-on-surface-variant font-medium mt-1">Preséntate ante tus compañeros, comparte tus metas y tu pasión por el baile.</p>
                </div>
                <button
                  id="toggle-pres-form"
                  onClick={() => setShowPresForm(!showPresForm)}
                  className="px-4 py-2.5 bg-on-primary-fixed-variant hover:bg-on-primary-container text-primary-fixed text-xs font-bold rounded-xl transition-all flex items-center gap-2 uppercase tracking-wider shadow-md hover:scale-105 active:scale-95"
                >
                  <Plus className="w-4 h-4 text-primary-fixed" /> Presentarme
                </button>
              </div>
            )}

            {subTab === 'anuncios' && currentUser.role === 'instructor' && (
              <div className="p-4 bg-primary-container/20 border border-primary/20 rounded-2xl flex items-center justify-between shadow-xl text-on-surface">
                <div>
                  <h4 className="text-xs font-mono font-bold text-primary tracking-wider uppercase">HERRAMIENTA DE INSTRUCTOR</h4>
                  <p className="text-[11px] text-on-surface-variant font-medium">Publica avisos importantes y novedades de la academia visibles para todos los alumnos.</p>
                </div>
                <button
                  id="toggle-ann-form"
                  onClick={() => setShowAnnForm(!showAnnForm)}
                  className="px-3.5 py-1.5 bg-on-primary-fixed-variant hover:bg-on-primary-container text-primary-fixed text-xs font-bold rounded-xl transition-all uppercase"
                >
                  {showAnnForm ? 'Ocultar Creador' : 'Crear Anuncio'}
                </button>
              </div>
            )}

            {subTab === 'feed' && (
              <>
                {/* Active Weekly Challenge Callout on Muro Feed */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#21162B] via-[#15121c] to-[#0D0D11] border-2 border-tertiary/40 p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#E9C349]/15 border border-[#E9C349]/40 flex items-center justify-center text-[#E9C349] shrink-0 shadow-md">
                      <Trophy className="w-6 h-6 animate-bounce" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E9C349] bg-[#E9C349]/15 px-2 py-0.5 rounded-full border border-[#E9C349]/30">
                          🏆 Reto Semanal Destacado
                        </span>
                        <span className="text-[11px] font-mono text-emerald-400 font-semibold">• Votaciones Abiertas</span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">70s Soulful Posing & High-Speed Cross Rolls</h4>
                      <p className="text-xs text-gray-300 mt-0.5 font-medium">Sube tu video respondiendo a la consigna temática, gana votos de la comunidad y compite en el Leaderboard.</p>
                    </div>
                  </div>

                  <button
                    id="btn-feed-goto-challenge"
                    onClick={() => setSubTab('reto')}
                    className="shrink-0 bg-[#E9C349] hover:bg-[#d4af37] text-black font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer font-mono uppercase tracking-wider"
                  >
                    <Trophy className="w-3.5 h-3.5 text-black" />
                    <span>Ver Reto & Leaderboard</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface-container/60 border border-tertiary/15 p-4 rounded-2xl">
                  <div>
                    <h3 className="text-xs font-mono font-bold text-tertiary uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#E9C349]" />
                      Muro Social Unificado
                    </h3>
                    <p className="text-[11px] text-on-surface-variant mt-0.5 font-semibold">
                      Explora novedades de instructores y publicaciones de la comunidad en un solo lugar.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => { setSubTab('presentate'); setShowPresForm(true); }}
                      className="px-3 py-1.5 bg-tertiary/10 hover:bg-tertiary/20 text-tertiary border border-tertiary/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Publicar Video / Post</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Forms if active */}
            {showPresForm && (subTab === 'presentate' || subTab === 'feed') && (
              <motion.form 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handlePresSubmit} 
                className="bg-surface-container border border-tertiary/10 p-6 rounded-2xl shadow-2xl space-y-4 text-on-surface"
              >
                <h4 className="text-xs font-mono font-bold text-tertiary tracking-wider uppercase bg-tertiary/10 border border-tertiary/20 px-2.5 py-1 rounded-xl inline-block">CREAR NUEVA PRESENTACIÓN / POST</h4>
                <div className="space-y-3">
                  <textarea
                    id="pres-text-input"
                    rows={4}
                    placeholder="Cuéntanos: ¿Quién eres? ¿De dónde vienes? ¿Cuáles son tus metas con el Waacking?..."
                    value={newPresText}
                    onChange={(e) => setNewPresText(e.target.value)}
                    required
                    className="w-full bg-[#0d0d11]/80 border border-tertiary/15 rounded-xl p-3 text-xs text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-tertiary/40 leading-relaxed font-semibold resize-none"
                  />
                  <input
                    id="pres-video-input"
                    type="url"
                    placeholder="URL de foto o vídeo de práctica (opcional, ej. link de unsplash o youtube)"
                    value={newPresVideo}
                    onChange={(e) => setNewPresVideo(e.target.value)}
                    className="w-full bg-[#0d0d11]/80 border border-tertiary/15 rounded-xl px-3 py-2 text-xs text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-tertiary/40 font-semibold"
                  />
                </div>
                <div className="flex justify-end gap-2.5">
                  <button
                    id="cancel-pres-form"
                    type="button"
                    onClick={() => setShowPresForm(false)}
                    className="px-4 py-2 bg-transparent border border-tertiary/20 text-on-surface-variant hover:text-white hover:border-tertiary/40 text-xs font-semibold rounded-lg uppercase transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    id="submit-pres-form"
                    type="submit"
                    className="px-4 py-2 bg-on-primary-fixed-variant hover:bg-on-primary-container text-primary-fixed text-xs font-bold rounded-lg shadow-lg hover:scale-105 active:scale-95 uppercase transition-all"
                  >
                    Publicar Presentación
                  </button>
                </div>
              </motion.form>
            )}

            {showAnnForm && (subTab === 'anuncios' || subTab === 'feed') && currentUser.role === 'instructor' && (
              <motion.form 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleAnnSubmit} 
                className="bg-surface-container border border-tertiary/20 p-6 rounded-2xl shadow-2xl space-y-4 text-on-surface"
              >
                <div className="flex items-center justify-between border-b border-tertiary/10 pb-3">
                  <h4 className="text-xs font-mono font-bold text-tertiary tracking-wider uppercase bg-tertiary/10 border border-tertiary/20 px-2.5 py-1 rounded-xl inline-block">
                    REDACTAR NOVEDAD OFICIAL
                  </h4>
                  <span className="text-[10px] text-on-surface-variant font-mono">Panel de Instructor</span>
                </div>

                {(newAnnTitle.trim() !== '' || newAnnContent.trim() !== '') && (
                  <div className="flex items-center justify-between bg-emerald-950/70 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs font-mono text-emerald-300">
                    <span className="flex items-center gap-1.5 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      💾 Borrador de anuncio guardado localmente
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setNewAnnTitle('');
                        setNewAnnContent('');
                        localStorage.removeItem('waackon_draft_announcement_title');
                        localStorage.removeItem('waackon_draft_announcement_content');
                      }}
                      className="text-slate-400 hover:text-rose-300 text-[10px] underline cursor-pointer"
                    >
                      Limpiar borrador
                    </button>
                  </div>
                )}

                {/* Categoría */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-300 uppercase">
                    Categoría del Anuncio
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'competencias', label: '🏆 Competencia' },
                      { id: 'sesiones', label: '⚡ Sesión / Jam' },
                      { id: 'clases', label: '💃 Masterclass' },
                      { id: 'comunicados', label: '📢 Comunicado' },
                    ].map((c) => (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => setNewAnnCategory(c.id as any)}
                        className={`p-2 rounded-xl text-[10px] font-mono font-bold border transition-all text-center ${
                          newAnnCategory === c.id
                            ? 'bg-[#E9C349] text-black border-[#E9C349]'
                            : 'bg-[#0A0A0A] text-slate-300 border-[#262626] hover:border-white/20'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    id="ann-title-input"
                    type="text"
                    placeholder="Título del anuncio..."
                    value={newAnnTitle}
                    onChange={(e) => setNewAnnTitle(e.target.value)}
                    required
                    className="w-full bg-[#0d0d11]/80 border border-tertiary/15 rounded-lg px-3 py-2 text-xs text-on-surface font-semibold focus:outline-none focus:border-tertiary/40"
                  />
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      id="ann-important-checkbox"
                      type="checkbox"
                      checked={newAnnImportant}
                      onChange={(e) => setNewAnnImportant(e.target.checked)}
                      className="rounded border border-tertiary/20 text-tertiary bg-[#0d0d11] focus:ring-tertiary h-4 w-4"
                    />
                    <span className="text-xs text-on-surface-variant font-bold uppercase">Marcar como Importante (Sello Destacado)</span>
                  </label>
                </div>

                <textarea
                  id="ann-content-input"
                  rows={4}
                  placeholder="Escribe el cuerpo de la novedad aquí..."
                  value={newAnnContent}
                  onChange={(e) => setNewAnnContent(e.target.value)}
                  required
                  className="w-full bg-[#0d0d11]/80 border border-tertiary/15 rounded-lg p-3 text-xs text-on-surface font-semibold focus:outline-none focus:border-tertiary/40"
                />

                <input
                  type="url"
                  placeholder="Enlace de inscripción o reunión (Opcional): https://..."
                  value={newAnnActionUrl}
                  onChange={(e) => setNewAnnActionUrl(e.target.value)}
                  className="w-full bg-[#0d0d11]/80 border border-tertiary/15 rounded-lg px-3 py-2 text-xs text-on-surface font-semibold focus:outline-none focus:border-tertiary/40"
                />

                {/* Adjuntar Imagen al Anuncio */}
                <AnnouncementImagePicker
                  selectedImage={newAnnImage}
                  onImageChange={setNewAnnImage}
                  language={language}
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    id="cancel-ann-form"
                    type="button"
                    onClick={() => setShowAnnForm(false)}
                    className="px-4 py-2 bg-transparent border border-tertiary/20 text-on-surface-variant hover:text-white hover:border-tertiary/40 text-xs font-semibold rounded-lg uppercase transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    id="submit-ann-form"
                    type="submit"
                    className="px-4 py-2 bg-[#E9C349] hover:bg-[#d8b33c] text-black text-xs font-black rounded-lg shadow-lg hover:scale-105 active:scale-95 uppercase transition-all"
                  >
                    Publicar Novedad Ahora
                  </button>
                </div>
              </motion.form>
            )}

            {/* Read-Only announcements warnings if non-instructor and subTab === 'anuncios' */}
            {subTab === 'anuncios' && currentUser.role !== 'instructor' && (
              <div className="p-3.5 bg-primary-container/10 border border-primary/20 rounded-xl flex items-center gap-2.5 text-[11px] text-on-surface-variant font-semibold uppercase shadow-md">
                <Lock className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Esta sección es de <strong>Solo Lectura</strong> para alumnos. Solo los instructores pueden publicar anuncios.</span>
              </div>
            )}

            {/* Filter Summary Banner */}
            <div className="flex items-center justify-between text-xs text-on-surface-variant font-mono px-1">
              <span>
                Mostrando <strong className="text-tertiary">{filteredPosts.length}</strong> de {totalCount} publicaciones
                {activeFilter !== 'all' && (
                  <span> • Filtro activo: <span className="text-white font-bold uppercase">{
                    activeFilter === 'video' ? 'Solo con Videos' :
                    activeFilter === 'instructor' ? 'Solo Instructores' :
                    'Anuncios Importantes'
                  }</span></span>
                )}
              </span>

              {filteredPosts.length === 0 && (
                <button
                  onClick={() => { setActiveFilter('all'); setSearchQuery(''); }}
                  className="text-tertiary hover:underline text-[11px] font-bold"
                >
                  Restablecer Filtros
                </button>
              )}
            </div>

            {/* EMPTY STATE IF NO POSTS MATCH FILTER */}
            {filteredPosts.length === 0 && (
              <div className="p-8 text-center bg-surface-container border border-tertiary/10 rounded-2xl space-y-3">
                <div className="w-12 h-12 rounded-full bg-tertiary/10 border border-tertiary/20 flex items-center justify-center mx-auto text-tertiary">
                  <Filter className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white uppercase">No hay publicaciones con estos criterios</h4>
                <p className="text-xs text-on-surface-variant max-w-md mx-auto font-medium">
                  Intenta seleccionar otro filtro o busca un término diferente para explorar más contenido de la comunidad.
                </p>
                <button
                  onClick={() => { setActiveFilter('all'); setSearchQuery(''); }}
                  className="px-4 py-2 bg-tertiary hover:bg-tertiary-container text-black text-xs font-extrabold rounded-xl transition-all uppercase shadow-md"
                >
                  Ver Todas las Publicaciones
                </button>
              </div>
            )}

            {/* RENDER FILTERED COMMUNITY POSTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPosts.map((post) => {
                if (post.postType === 'announcement' && post.rawAnn) {
                  const ann = post.rawAnn;
                  return (
                    <div 
                      key={post.id} 
                      className="border border-tertiary/10 rounded-2xl p-5 relative overflow-hidden bg-surface-container shadow-2xl text-on-surface hover:border-tertiary/25 transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Header info */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl border border-tertiary/10 shadow-md ${ann.important ? 'bg-primary-container/30 text-primary' : 'bg-black/30 text-tertiary'}`}>
                              <Megaphone className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-white uppercase">{ann.title}</h4>
                                {ann.important && (
                                  <span className="text-[8px] font-bold font-mono tracking-widest text-primary bg-primary-container/30 px-2.5 py-1 rounded-xl border border-primary/20 flex items-center gap-1">
                                    📌 IMPORTANTE
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-on-surface-variant font-mono mt-1 uppercase flex-wrap">
                                <span className="flex items-center gap-1 font-bold text-purple-300">
                                  <Crown className="w-3 h-3 text-purple-400" />
                                  {ann.author}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-tertiary" /> {ann.date}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-on-surface-variant font-medium mt-4 leading-relaxed whitespace-pre-line">{ann.content}</p>

                        {/* Imagen / Video Preview */}
                        {ann.imageUrl && (
                          <div 
                            onClick={() => setAnnLightboxImage(ann.imageUrl || null)}
                            className="relative w-full h-48 rounded-xl overflow-hidden cursor-pointer group/img border border-white/10 mt-3 bg-black/60 shadow-lg"
                            title="Haz clic para ampliar la imagen del afiche"
                          >
                            <img
                              src={ann.imageUrl}
                              alt={ann.title}
                              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-[#E9C349] font-mono text-xs font-bold">
                              <ZoomIn className="w-4 h-4" />
                              <span>Ampliar Afiche</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Enlace de Acción u Opción Video */}
                      {ann.actionUrl && (
                        <div className="mt-4 pt-3 border-t border-tertiary/10">
                          <a
                            href={ann.actionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E9C349] hover:bg-[#d8b33c] text-black text-xs font-black rounded-lg transition-all shadow-md"
                          >
                            {post.hasVideo ? <Play className="w-3.5 h-3.5 fill-black" /> : <ExternalLink className="w-3.5 h-3.5" />}
                            <span>{post.hasVideo ? 'Ver Video / Convocatoria' : 'Ver Enlace / Inscripción'}</span>
                          </a>
                        </div>
                      )}
                    </div>
                  );
                }

                if (post.postType === 'presentation' && post.rawPres) {
                  const pres = post.rawPres;
                  return (
                    <div key={post.id} className="bg-surface-container border border-tertiary/10 rounded-2xl overflow-hidden flex flex-col justify-between p-5 space-y-4 shadow-2xl text-on-surface hover:border-tertiary/25 transition-all">
                      <div>
                        {/* Student Info & Instructor Badge */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img 
                              src={pres.studentAvatar} 
                              alt={pres.studentName} 
                              className="w-10 h-10 rounded-full object-cover border border-tertiary/20" 
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-white uppercase">{pres.studentName}</h4>
                                {post.isInstructor && (
                                  <span className="text-[8px] font-mono font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded flex items-center gap-1 uppercase">
                                    <Crown className="w-2.5 h-2.5" /> Instructor
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-on-surface-variant font-mono">{pres.date}</p>
                            </div>
                          </div>

                          {post.hasVideo && (
                            <span className="text-[9px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Video className="w-3 h-3" /> VIDEO
                            </span>
                          )}
                        </div>

                        {/* Text content */}
                        <p className="text-xs text-on-surface-variant font-medium mt-4 leading-relaxed whitespace-pre-line">{pres.text}</p>

                        {/* Media thumbnail / Video player preview */}
                        {pres.videoUrl && (
                          <div className="mt-3.5 aspect-video rounded-xl border border-tertiary/10 overflow-hidden bg-[#08080a] relative shadow-lg group/vid cursor-pointer">
                            <img src={pres.videoUrl} alt="Presentation Media" className="w-full h-full object-cover opacity-80 group-hover/vid:scale-105 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-[#E9C349]/90 text-black flex items-center justify-center shadow-2xl group-hover/vid:scale-110 transition-transform">
                                <Play className="w-6 h-6 fill-black ml-0.5" />
                              </div>
                            </div>
                            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[10px] font-mono text-white font-bold bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                              <span className="flex items-center gap-1"><Video className="w-3 h-3 text-[#E9C349]" /> Video de Práctica / Demostración</span>
                              <span className="text-tertiary uppercase">Reproducir</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions & Comment section */}
                      <div className="border-t border-tertiary/10 pt-4 mt-auto">
                        <div className="flex items-center gap-4 text-xs text-on-surface-variant mb-4 font-bold">
                          <button 
                            id={`like-pres-${pres.id}`}
                            onClick={() => onLikePresentation(pres.id)}
                            className={`flex items-center gap-1.5 transition-colors border px-2.5 py-1 rounded-xl cursor-pointer ${
                              pres.isLikedByMe 
                                ? 'bg-tertiary/10 border-tertiary text-tertiary font-bold' 
                                : 'bg-[#0d0d11]/40 border-tertiary/20 hover:text-white'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${pres.isLikedByMe ? 'fill-tertiary text-tertiary' : ''}`} />
                            <span>{pres.likes} Likes</span>
                          </button>
                          <span className="flex items-center gap-1.5 border border-tertiary/10 bg-[#0d0d11]/40 px-2.5 py-1 rounded-xl text-on-surface-variant">
                            <MessageSquare className="w-4 h-4 text-tertiary" />
                            <span>{(pres.comments || []).length} Comentarios</span>
                          </span>
                        </div>

                        {/* Inner Comments List */}
                        {(pres.comments || []).length > 0 && (
                          <div className="space-y-2.5 max-h-[160px] overflow-y-auto mb-3 bg-[#08080a]/60 p-3 rounded-xl border border-tertiary/5 text-on-surface">
                            {(pres.comments || []).map((comm) => (
                              <div key={comm.id} className="text-[11px] leading-relaxed border-b border-tertiary/5 pb-2 last:border-b-0">
                                <div className="flex items-center gap-1.5 font-bold text-white uppercase text-[10px]">
                                  <img src={comm.avatar} alt={comm.author} className="w-4 h-4 rounded-full object-cover border border-tertiary/10" />
                                  <span>{comm.author}</span>
                                  <span className="text-[9px] text-on-surface-variant font-mono ml-auto">{comm.date}</span>
                                </div>
                                <p className="text-on-surface-variant font-medium ml-5 mt-0.5">{comm.text}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Comment input */}
                        <div className="flex gap-2">
                          <input
                            id={`comment-input-${pres.id}`}
                            type="text"
                            placeholder="Escribe una respuesta de bienvenida..."
                            value={commentInputs[pres.id] || ''}
                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [pres.id]: e.target.value }))}
                            className="flex-1 bg-[#0d0d11]/80 border border-tertiary/15 rounded-xl px-2.5 py-1.5 text-xs text-on-surface placeholder-on-surface-variant/40 font-semibold focus:outline-none"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleCommentSubmit(pres.id);
                              }
                            }}
                          />
                          <button
                            id={`comment-submit-${pres.id}`}
                            onClick={() => handleCommentSubmit(pres.id)}
                            className="bg-on-primary-fixed-variant hover:bg-on-primary-container text-primary-fixed text-xs font-bold px-3 py-1.5 rounded-xl shadow-md active:scale-95 transition-all uppercase cursor-pointer"
                          >
                            Responder
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>

            {/* Modal Lightbox para Ampliar Imagen de Anuncio */}
            <AnimatePresence>
              {annLightboxImage && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative max-w-4xl w-full bg-[#121212] border border-[#E9C349]/50 rounded-2xl overflow-hidden p-3 shadow-2xl"
                  >
                    <button
                      type="button"
                      onClick={() => setAnnLightboxImage(null)}
                      className="absolute top-4 right-4 p-2 bg-black/80 hover:bg-red-600 text-white rounded-full transition-all border border-white/20 z-10 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <img
                      src={annLightboxImage}
                      alt="Afiche ampliado del anuncio"
                      className="w-full max-h-[85vh] object-contain rounded-xl"
                    />
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
