import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Grid, 
  Film, 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  Plus, 
  X, 
  Play, 
  Sparkles, 
  Music, 
  MoreHorizontal, 
  Send, 
  Upload, 
  Trash2, 
  Check,
  Video,
  Image as ImageIcon,
  Flame,
  UserCheck,
  Eye,
  Award,
  Sliders,
  Volume2,
  VolumeX,
  ExternalLink
} from 'lucide-react';
import { User } from '../types';

export interface FeedPost {
  id: string;
  type: 'image' | 'video' | 'reel';
  mediaUrl: string;
  caption: string;
  likes: number;
  likedByMe: boolean;
  comments: { id: string; user: string; avatar: string; text: string; createdAt: string }[];
  tags: string[];
  musicTrack?: string;
  createdAt: string;
  views?: number;
  isPinned?: boolean;
}

export interface StoryItem {
  id: string;
  mediaUrl: string;
  type: 'image' | 'video';
  caption?: string;
  createdAt: string;
  seen: boolean;
}

interface InstagramFeedProps {
  currentUser: User;
  onUserChange?: (user: User) => void;
  showToast?: (msg: string) => void;
}

const DEFAULT_POSTS: FeedPost[] = [
  {
    id: 'post-1',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=800',
    caption: '✨ Perfeccionando el control de brazos & Posing rápido en la clase magistral de Waack ON! El tempo de 128 BPM requiere máxima precisión en cada roll. 🔥',
    likes: 142,
    likedByMe: true,
    comments: [
      { id: 'c1', user: 'Sofia_Waack', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', text: '¡Increíble limpieza en los brazos! 🔥', createdAt: 'Hace 2 horas' },
      { id: 'c2', user: 'Master_Brando', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', text: 'Excelente acentuación en el beat de la caja. Sigue practicando los giros.', createdAt: 'Hace 1 hora' }
    ],
    tags: ['Waacking', 'WaackON', 'ArmControl', 'DiscoStyle'],
    musicTrack: 'Cheryl Lynn - Got To Be Real (128 BPM)',
    createdAt: 'Hace 3 horas',
    isPinned: true
  },
  {
    id: 'post-2',
    type: 'video',
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dancer-performing-a-routine-in-a-studio-41584-large.mp4',
    caption: '🎬 Reel de entrenamiento: 45 segundos de pases veloces, posing expresivo y cambios de dinamismo. ¿Qué tal les parece la musicalidad? 💃🕺',
    likes: 218,
    likedByMe: false,
    comments: [
      { id: 'c3', user: 'Carlos_Punking', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', text: 'Ese cambio de velocidad en el minuto 0:20 estuvo brutal!', createdAt: 'Hace 5 horas' }
    ],
    tags: ['WaackONReels', 'WaackingDrill', 'ExpressivePosing', 'DiscoVibes'],
    musicTrack: 'Sylvester - You Make Me Feel (Mighty Real)',
    createdAt: 'Ayer',
    views: 890
  },
  {
    id: 'post-3',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=800',
    caption: '🏆 Postal de la última Batalla de Waacking en Vivo. La energía de la comunidad es inigualable. ¡Gracias a todos los que nos apoyan día a día! ❤️',
    likes: 305,
    likedByMe: true,
    comments: [
      { id: 'c4', user: 'Elena_Pose', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', text: '¡Ese outfit retro con las luces doradas quedó épico!', createdAt: 'Hace 1 día' }
    ],
    tags: ['WaackONBattle', 'WaackingCommunity', 'RetroVibes', 'LiveBattle'],
    musicTrack: 'The Trammps - Disco Inferno',
    createdAt: 'Hace 2 días',
    isPinned: true
  },
  {
    id: 'post-4',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&q=80&w=800',
    caption: 'Studio Session: Trabajando en aislamientos de cuello y mirada en congelado. La actitud lo es todo en la pasarela. 🕶️✨',
    likes: 98,
    likedByMe: false,
    comments: [],
    tags: ['WaackON', 'PoseLock', 'DancerLife'],
    musicTrack: 'Chic - Le Freak',
    createdAt: 'Hace 4 días'
  },
  {
    id: 'post-5',
    type: 'reel',
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-dancing-hip-hop-in-a-studio-41586-large.mp4',
    caption: '⚡ Drill de Rolls & Over-the-head continuos. 30 minutos sin parar para desarrollar resistencia en hombros. 💪',
    likes: 176,
    likedByMe: false,
    comments: [
      { id: 'c5', user: 'Dancer_Maya', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150', text: '¡Qué resistencia tan bárbara!', createdAt: 'Hace 3 días' }
    ],
    tags: ['WaackONDrill', 'ArmsEndurance', 'WaackTutorial'],
    musicTrack: 'Donna Summer - I Feel Love',
    createdAt: 'Hace 5 días',
    views: 1240
  },
  {
    id: 'post-6',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?auto=format&fit=crop&q=80&w=800',
    caption: 'Análisis de vestuario y proyección escénica para el próximo campeonato. ¡Listos para brillar en la pista! 🌟',
    likes: 184,
    likedByMe: true,
    comments: [],
    tags: ['Style', 'DiscoGlam', 'WaackFashion'],
    musicTrack: 'Diana Ross - Upside Down',
    createdAt: 'Hace 1 semana'
  }
];

const DEFAULT_STORIES: StoryItem[] = [
  {
    id: 'story-1',
    mediaUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=600',
    type: 'image',
    caption: '🔥 Calentamiento de brazos antes del Live!',
    createdAt: 'Hace 15 min',
    seen: false
  },
  {
    id: 'story-2',
    mediaUrl: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=600',
    type: 'image',
    caption: '✨ Nuevo logro desbloqueado en Waack ON!',
    createdAt: 'Hace 2 horas',
    seen: false
  },
  {
    id: 'story-3',
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dancer-performing-a-routine-in-a-studio-41584-large.mp4',
    type: 'video',
    caption: '🎬 Snippet de la rutina de hoy',
    createdAt: 'Hace 5 horas',
    seen: true
  }
];

export const InstagramFeed: React.FC<InstagramFeedProps> = ({
  currentUser,
  onUserChange,
  showToast
}) => {
  // Feed posts state (persisted per user in localStorage)
  const [posts, setPosts] = useState<FeedPost[]>(() => {
    const saved = localStorage.getItem(`waackon_feed_${currentUser.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error(e); }
    }
    return DEFAULT_POSTS;
  });

  // Stories state
  const [stories, setStories] = useState<StoryItem[]>(() => {
    const saved = localStorage.getItem(`waackon_stories_${currentUser.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error(e); }
    }
    return DEFAULT_STORIES;
  });

  // Tab filter: 'grid' | 'reels' | 'saved'
  const [activeTab, setActiveTab] = useState<'grid' | 'reels' | 'saved'>('grid');

  // Modals & Active Viewers
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createMediaType, setCreateMediaType] = useState<'image' | 'video' | 'story'>('image');

  // New post form fields
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newTags, setNewTags] = useState('Waacking, WaackON, Practice');
  const [newMusic, setNewMusic] = useState('Disco Funk Beat 128 BPM');
  const [previewFile, setPreviewFile] = useState<string | null>(null);

  // Comment input field for Lightbox
  const [commentText, setCommentText] = useState('');
  const [storyReplyText, setStoryReplyText] = useState('');

  // Audio / Video Mute state in lightbox
  const [isMuted, setIsMuted] = useState(true);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(`waackon_feed_${currentUser.id}`, JSON.stringify(posts));
  }, [posts, currentUser.id]);

  useEffect(() => {
    localStorage.setItem(`waackon_stories_${currentUser.id}`, JSON.stringify(stories));
  }, [stories, currentUser.id]);

  // Story Auto-Advance Timer
  useEffect(() => {
    if (activeStoryIndex === null) return;
    const timer = setTimeout(() => {
      if (activeStoryIndex < stories.length - 1) {
        setActiveStoryIndex(prev => (prev !== null ? prev + 1 : null));
      } else {
        setActiveStoryIndex(null);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [activeStoryIndex, stories.length]);

  // Handle Like Post
  const handleToggleLike = (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const nextLiked = !p.likedByMe;
        return {
          ...p,
          likedByMe: nextLiked,
          likes: nextLiked ? p.likes + 1 : p.likes - 1
        };
      }
      return p;
    }));

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost(prev => prev ? {
        ...prev,
        likedByMe: !prev.likedByMe,
        likes: !prev.likedByMe ? prev.likes + 1 : prev.likes - 1
      } : null);
    }
  };

  // Handle Add Comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedPost) return;

    const newComment = {
      id: `c-${Date.now()}`,
      user: currentUser.nickname || currentUser.name.split(' ')[0],
      avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      text: commentText.trim(),
      createdAt: 'Ahora mismo'
    };

    const updatedComments = [...selectedPost.comments, newComment];

    setPosts(prev => prev.map(p => {
      if (p.id === selectedPost.id) {
        return { ...p, comments: updatedComments };
      }
      return p;
    }));

    setSelectedPost(prev => prev ? { ...prev, comments: updatedComments } : null);
    setCommentText('');
    if (showToast) showToast('💬 Comentario publicado en la red de Waack ON!');
  };

  // Handle Create Post / Story
  const handleCreateContent = (e: React.FormEvent) => {
    e.preventDefault();
    const mediaToUse = previewFile || newMediaUrl || 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=800';

    if (createMediaType === 'story') {
      const newStory: StoryItem = {
        id: `story-${Date.now()}`,
        mediaUrl: mediaToUse,
        type: mediaToUse.includes('.mp4') || mediaToUse.includes('mixkit') ? 'video' : 'image',
        caption: newCaption || '✨ Historia de Waacking en Vivo',
        createdAt: 'Ahora mismo',
        seen: false
      };
      setStories(prev => [newStory, ...prev]);
      if (showToast) showToast('📸 ¡Nueva Historia publicada en tu perfil de Instagram Waack ON!');
    } else {
      const parsedTags = newTags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean);
      const newPost: FeedPost = {
        id: `post-${Date.now()}`,
        type: createMediaType,
        mediaUrl: mediaToUse,
        caption: newCaption,
        likes: 1,
        likedByMe: true,
        comments: [],
        tags: parsedTags.length > 0 ? parsedTags : ['WaackON', 'Waacking'],
        musicTrack: newMusic,
        createdAt: 'Hace un momento'
      };
      setPosts(prev => [newPost, ...prev]);
      if (showToast) showToast('🎉 ¡Publicación agregada con éxito a tu Feed de Waacking!');
    }

    // Reset Form
    setNewMediaUrl('');
    setNewCaption('');
    setPreviewFile(null);
    setIsCreateModalOpen(false);
  };

  // Handle File Upload Change
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Delete Post
  const handleDeletePost = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Eliminar esta publicación de tu feed?')) {
      setPosts(prev => prev.filter(p => p.id !== postId));
      if (selectedPost?.id === postId) setSelectedPost(null);
      if (showToast) showToast('🗑️ Publicación eliminada');
    }
  };

  // Filter posts based on active tab
  const safePosts = posts || [];
  const filteredPosts = safePosts.filter(post => {
    if (!post) return false;
    if (activeTab === 'reels') return post.type === 'video' || post.type === 'reel';
    if (activeTab === 'saved') return post.likedByMe;
    return true; // grid shows all
  });

  return (
    <div className="w-full space-y-6 text-left">
      {/* Top Banner / Instagram Header Info */}
      <div className="bg-[#141414] border border-[#E9C349]/30 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Glow ambient background accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#9A2B3C]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#E9C349]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar with Story Ring */}
          <div className="relative group cursor-pointer shrink-0" onClick={() => stories.length > 0 && setActiveStoryIndex(0)}>
            <div className="p-1 rounded-full bg-gradient-to-tr from-[#E9C349] via-[#9A2B3C] to-purple-600 shadow-xl group-hover:scale-105 transition-transform">
              <div className="p-1 bg-[#141414] rounded-full">
                <img 
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'} 
                  alt={currentUser.name} 
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-transparent"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setCreateMediaType('story');
                setIsCreateModalOpen(true);
              }}
              className="absolute bottom-1 right-1 p-2 rounded-full bg-[#9A2B3C] text-white border-2 border-[#141414] hover:bg-[#b03246] hover:scale-110 transition-all shadow-lg"
              title="Añadir nueva Historia"
              aria-label="Añadir nueva Historia"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Stats & Actions */}
          <div className="flex-1 space-y-4 text-center md:text-left min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase flex items-center justify-center md:justify-start gap-2">
                @{currentUser?.nickname || (currentUser?.name || 'waacker').toLowerCase().replace(/\s+/g, '_')}
                <span className="p-1 bg-[#E9C349]/20 text-[#E9C349] rounded-full border border-[#E9C349]/40" title="Bailarín Verificado Waack ON">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
              </h1>

              <div className="flex items-center justify-center md:justify-start gap-2 pt-1 sm:pt-0">
                <button
                  onClick={() => {
                    setCreateMediaType('image');
                    setIsCreateModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#E9C349] text-slate-950 font-black text-xs hover:bg-[#f3d362] transition-all flex items-center gap-1.5 shadow-md"
                  aria-label="Publicar foto o video"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Publicar
                </button>
                <button
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.href);
                      if (showToast) showToast('🔗 Enlace al perfil de Instagram copiado!');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 transition-all flex items-center gap-1.5"
                  aria-label="Compartir perfil"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Compartir
                </button>
              </div>
            </div>

            {/* Stat Counter Numbers */}
            <div className="flex items-center justify-center md:justify-start gap-6 py-1 border-y border-white/10 text-xs sm:text-sm">
              <div className="text-center md:text-left">
                <span className="font-black text-white text-base block">{posts.length}</span>
                <span className="text-slate-400 text-[11px] font-mono uppercase">Publicaciones</span>
              </div>
              <div className="text-center md:text-left">
                <span className="font-black text-white text-base block">1,482</span>
                <span className="text-slate-400 text-[11px] font-mono uppercase">Seguidores</span>
              </div>
              <div className="text-center md:text-left">
                <span className="font-black text-white text-base block">390</span>
                <span className="text-slate-400 text-[11px] font-mono uppercase">Seguidos</span>
              </div>
              <div className="text-center md:text-left">
                <span className="font-black text-[#E9C349] text-base block">24</span>
                <span className="text-slate-400 text-[11px] font-mono uppercase">Live Battles</span>
              </div>
            </div>

            {/* Bio & Details */}
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-200">
                {currentUser.name} | Waack ON Community Dancer 💃⚡
              </p>
              <p className="text-xs text-slate-400 max-w-xl line-clamp-2">
                {currentUser.bio || 'Especialista en Waacking, Arm Control, Posing y Expresividad Escénica. Miembro activo del portal oficial de entrenamiento.'}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1 text-[11px] font-mono text-[#E9C349]">
                <span>#Waacking</span>
                <span>#WaackON</span>
                <span>#WhackingDancer</span>
                <span>#DiscoCulture</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stories Carousel Bar */}
      <div className="bg-[#141414] border border-white/10 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E9C349]" />
            <h3 className="text-xs font-black uppercase text-white tracking-wider">Historias de Waacking & Drills</h3>
          </div>
          <button 
            onClick={() => {
              setCreateMediaType('story');
              setIsCreateModalOpen(true);
            }}
            className="text-xs font-bold text-[#E9C349] hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Nueva Historia
          </button>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#9A2B3C]">
          {/* Add story item button */}
          <button 
            onClick={() => {
              setCreateMediaType('story');
              setIsCreateModalOpen(true);
            }}
            className="flex flex-col items-center gap-1.5 shrink-0 group"
          >
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#E9C349]/60 flex items-center justify-center bg-[#1c1a1a] group-hover:border-[#E9C349] transition-all">
              <Plus className="w-6 h-6 text-[#E9C349]" />
            </div>
            <span className="text-[10px] font-mono text-slate-300 font-bold">Tu historia</span>
          </button>

          {/* Stories list */}
          {stories.map((story, idx) => (
            <button
              key={story.id}
              onClick={() => setActiveStoryIndex(idx)}
              className="flex flex-col items-center gap-1.5 shrink-0 group"
            >
              <div className={`p-0.5 rounded-full ${story.seen ? 'bg-slate-700' : 'bg-gradient-to-tr from-[#E9C349] to-[#9A2B3C] shadow-md'} group-hover:scale-105 transition-transform`}>
                <div className="p-0.5 bg-[#141414] rounded-full">
                  <img 
                    src={story.mediaUrl} 
                    alt="Story" 
                    className="w-14 h-14 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400 group-hover:text-white truncate max-w-[68px]">
                {story.createdAt}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Filter Switcher (Grid vs Reels vs Saved) */}
      <div className="flex items-center justify-center border-b border-white/10 bg-[#101010] p-1 rounded-xl gap-2">
        <button
          onClick={() => setActiveTab('grid')}
          className={`flex-1 py-2.5 rounded-lg font-mono text-xs font-extrabold transition-all flex items-center justify-center gap-2 border ${
            activeTab === 'grid'
              ? 'bg-[#E9C349] text-slate-950 border-[#E9C349] shadow-lg'
              : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
          }`}
          aria-label="Ver todas las publicaciones en cuadrícula"
        >
          <Grid className="w-4 h-4" />
          PUBLICACIONES ({posts.length})
        </button>

        <button
          onClick={() => setActiveTab('reels')}
          className={`flex-1 py-2.5 rounded-lg font-mono text-xs font-extrabold transition-all flex items-center justify-center gap-2 border ${
            activeTab === 'reels'
              ? 'bg-[#9A2B3C] text-white border-[#9A2B3C] shadow-lg'
              : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
          }`}
          aria-label="Ver videos y reels de entrenamiento"
        >
          <Film className="w-4 h-4 text-[#E9C349]" />
          REELS & DRILLS ({safePosts.filter(p => p && (p.type === 'video' || p.type === 'reel')).length})
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex-1 py-2.5 rounded-lg font-mono text-xs font-extrabold transition-all flex items-center justify-center gap-2 border ${
            activeTab === 'saved'
              ? 'bg-[#E9C349]/20 text-[#E9C349] border-[#E9C349]'
              : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
          }`}
          aria-label="Ver publicaciones guardadas y con Me Gusta"
        >
          <Bookmark className="w-4 h-4" />
          GUARDADOS ({safePosts.filter(p => p && p.likedByMe).length})
        </button>
      </div>

      {/* Grid Display of Feed Posts */}
      {filteredPosts.length === 0 ? (
        <div className="py-16 text-center bg-[#141414] border border-dashed border-white/10 rounded-2xl p-6">
          <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white mb-1">No hay publicaciones en esta sección</h4>
          <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
            Sube tus mejores fotografías, pasadas de baile, arm drills o reels para mostrárselos a la comunidad Waack ON.
          </p>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-[#E9C349] text-slate-950 font-black rounded-xl text-xs hover:bg-[#f3d362] transition-all inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Subir Primera Publicación
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
          {filteredPosts.map((post) => (
            <motion.div
              key={post.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -3 }}
              onClick={() => setSelectedPost(post)}
              className="relative aspect-square bg-[#1a1a1a] rounded-xl overflow-hidden cursor-pointer group border border-white/10 hover:border-[#E9C349]/60 shadow-lg"
            >
              {post.type === 'video' || post.type === 'reel' ? (
                <div className="w-full h-full relative">
                  <video 
                    src={post.mediaUrl} 
                    className="w-full h-full object-cover" 
                    muted 
                    playsInline 
                  />
                  <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white backdrop-blur-md">
                    <Film className="w-3.5 h-3.5 text-[#E9C349]" />
                  </div>
                </div>
              ) : (
                <img 
                  src={post.mediaUrl} 
                  alt={post.caption} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              )}

              {/* Pin indicator */}
              {post.isPinned && (
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#9A2B3C] text-white text-[9px] font-mono font-bold tracking-wider uppercase border border-[#E9C349]/40">
                  Fijado
                </div>
              )}

              {/* Hover overlay stats */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-black text-sm">
                <div className="flex items-center gap-1.5 text-rose-400">
                  <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                  <span>{post.likes}</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-300">
                  <MessageCircle className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span>{post.comments.length}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Post Lightbox Modal */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl bg-[#141414] border border-[#E9C349]/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedPost(null)}
                className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
                aria-label="Cerrar publicación"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Media Container Left */}
              <div className="w-full md:w-3/5 bg-black flex items-center justify-center relative min-h-[300px] max-h-[500px] md:max-h-full">
                {selectedPost.type === 'video' || selectedPost.type === 'reel' ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <video 
                      src={selectedPost.mediaUrl} 
                      className="w-full h-full object-contain max-h-[550px]" 
                      controls 
                      autoPlay 
                      loop
                      muted={isMuted}
                    />
                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className="absolute bottom-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#E9C349]" />}
                    </button>
                  </div>
                ) : (
                  <img 
                    src={selectedPost.mediaUrl} 
                    alt={selectedPost.caption} 
                    className="w-full h-full object-contain max-h-[550px]"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>

              {/* Information & Comments Right */}
              <div className="w-full md:w-2/5 p-4 sm:p-5 flex flex-col justify-between bg-[#141414] border-t md:border-t-0 md:border-l border-white/10 min-h-[300px]">
                {/* Header user */}
                <div className="pb-3 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.name} 
                      className="w-9 h-9 rounded-full object-cover border border-[#E9C349]"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wide">
                        {currentUser.nickname || currentUser.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {selectedPost.createdAt}
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => handleDeletePost(selectedPost.id, e)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-colors"
                    title="Eliminar publicación"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Caption & Music */}
                <div className="py-3 space-y-2 flex-1 overflow-y-auto max-h-[220px] scrollbar-thin scrollbar-thumb-[#9A2B3C]">
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {selectedPost.caption}
                  </p>

                  {selectedPost.musicTrack && (
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#E9C349]">
                      <Music className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
                      <span className="truncate">{selectedPost.musicTrack}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(selectedPost.tags || []).map(t => (
                      <span key={t} className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md">
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* Comments list */}
                  <div className="pt-3 border-t border-white/10 space-y-2">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                      Comentarios ({(selectedPost.comments || []).length})
                    </span>
                    {(selectedPost.comments || []).length === 0 ? (
                      <p className="text-xs text-slate-500 italic">Sé el primero en comentar esta técnica.</p>
                    ) : (
                      (selectedPost.comments || []).map(c => (
                        <div key={c.id} className="flex items-start gap-2 text-xs">
                          <img src={c.avatar} alt={c.user} className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5" />
                          <div className="bg-white/5 p-2 rounded-xl flex-1">
                            <span className="font-bold text-[#E9C349] mr-1.5">{c.user}:</span>
                            <span className="text-slate-200">{c.text}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons & Comment Form */}
                <div className="pt-3 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => handleToggleLike(selectedPost.id, e)}
                        className={`p-2 rounded-full transition-all ${
                          selectedPost.likedByMe ? 'text-rose-500 bg-rose-500/20' : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${selectedPost.likedByMe ? 'fill-rose-500' : ''}`} />
                      </button>
                      <span className="text-xs font-mono font-bold text-white">
                        {selectedPost.likes} Me gusta
                      </span>
                    </div>

                    <button 
                      onClick={() => {
                        if (showToast) showToast('🔖 Publicación guardada en tu colección');
                      }}
                      className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10"
                    >
                      <Bookmark className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Añade un comentario..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E9C349]"
                    />
                    <button 
                      type="submit"
                      disabled={!commentText.trim()}
                      className="px-3 py-1.5 bg-[#E9C349] text-slate-950 font-bold rounded-xl text-xs hover:bg-[#f3d362] disabled:opacity-40 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Story Full Screen Viewer Modal */}
      <AnimatePresence>
        {activeStoryIndex !== null && stories[activeStoryIndex] && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
            <div className="relative w-full max-w-sm h-[80vh] bg-black rounded-3xl overflow-hidden border border-[#E9C349]/40 shadow-2xl flex flex-col justify-between">
              {/* Progress bar timer */}
              <div className="absolute top-3 left-3 right-3 z-30 flex gap-1">
                {stories.map((s, i) => (
                  <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-[#E9C349] transition-all duration-300 ${
                        i < activeStoryIndex ? 'w-full' : i === activeStoryIndex ? 'animate-pulse w-full' : 'w-0'
                      }`} 
                    />
                  </div>
                ))}
              </div>

              {/* Story Header */}
              <div className="absolute top-6 left-3 right-3 z-30 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <img src={currentUser.avatar} alt="User" className="w-8 h-8 rounded-full border border-[#E9C349] object-cover" />
                  <div>
                    <span className="text-xs font-black uppercase block">{currentUser.nickname || currentUser.name}</span>
                    <span className="text-[9px] text-slate-300 font-mono">{stories[activeStoryIndex].createdAt}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveStoryIndex(null)}
                  className="p-1.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Story Content */}
              <div className="w-full h-full relative flex items-center justify-center bg-zinc-900">
                {stories[activeStoryIndex].type === 'video' ? (
                  <video src={stories[activeStoryIndex].mediaUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                ) : (
                  <img src={stories[activeStoryIndex].mediaUrl} alt="Story" className="w-full h-full object-cover" />
                )}

                {/* Navigation Touch Areas */}
                <div 
                  onClick={() => activeStoryIndex > 0 && setActiveStoryIndex(prev => prev! - 1)}
                  className="absolute left-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer" 
                />
                <div 
                  onClick={() => activeStoryIndex < stories.length - 1 ? setActiveStoryIndex(prev => prev! + 1) : setActiveStoryIndex(null)}
                  className="absolute right-0 top-0 bottom-0 w-2/3 z-20 cursor-pointer" 
                />

                {/* Caption overlay */}
                {stories[activeStoryIndex].caption && (
                  <div className="absolute bottom-16 inset-x-4 z-30 p-3 bg-black/70 backdrop-blur-md rounded-xl border border-white/10 text-center">
                    <p className="text-xs font-bold text-white">{stories[activeStoryIndex].caption}</p>
                  </div>
                )}
              </div>

              {/* Footer Story Reply input */}
              <div className="p-3 bg-black/80 backdrop-blur-md border-t border-white/10 flex items-center gap-2 z-30">
                <input 
                  type="text"
                  placeholder="Enviar mensaje sobre la historia..."
                  value={storyReplyText}
                  onChange={(e) => setStoryReplyText(e.target.value)}
                  className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#E9C349]"
                />
                <button 
                  onClick={() => {
                    if (storyReplyText.trim()) {
                      if (showToast) showToast('❤️ Reacción enviada a la historia!');
                      setStoryReplyText('');
                    }
                  }}
                  className="p-2.5 rounded-full bg-[#9A2B3C] text-white hover:bg-rose-600 transition-colors"
                >
                  <Heart className="w-4 h-4 fill-white" />
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Content Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#141414] border border-[#E9C349]/40 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E9C349]" />
                  Crear {createMediaType === 'story' ? 'Historia' : createMediaType === 'reel' ? 'Reel de Waacking' : 'Publicación'}
                </h3>
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Type Switcher */}
              <div className="flex p-1 bg-[#101010] rounded-xl border border-white/10">
                <button 
                  type="button"
                  onClick={() => setCreateMediaType('image')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${createMediaType === 'image' ? 'bg-[#E9C349] text-slate-950' : 'text-slate-400'}`}
                >
                  Foto Grid
                </button>
                <button 
                  type="button"
                  onClick={() => setCreateMediaType('video')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${createMediaType === 'video' ? 'bg-[#9A2B3C] text-white' : 'text-slate-400'}`}
                >
                  Video / Reel
                </button>
                <button 
                  type="button"
                  onClick={() => setCreateMediaType('story')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${createMediaType === 'story' ? 'bg-gradient-to-r from-[#E9C349] to-[#9A2B3C] text-white' : 'text-slate-400'}`}
                >
                  Historia
                </button>
              </div>

              <form onSubmit={handleCreateContent} className="space-y-4 text-left">
                {/* File Upload Box */}
                <div>
                  <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                    Multimedia (Archivo o URL)
                  </label>
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center bg-white/5 hover:border-[#E9C349] transition-all relative">
                    {previewFile ? (
                      <div className="relative aspect-video max-h-40 rounded-lg overflow-hidden mx-auto">
                        <img src={previewFile} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setPreviewFile(null)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/80 text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-[#E9C349] mx-auto mb-2" />
                        <span className="text-xs text-slate-300 font-bold block mb-1">
                          Seleccionar desde tu dispositivo
                        </span>
                        <input 
                          type="file" 
                          accept="image/*,video/*"
                          onChange={handleFileUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </>
                    )}
                  </div>

                  <div className="mt-2">
                    <span className="text-[10px] text-slate-400 font-mono block mb-1">O escribe la URL directamente:</span>
                    <input 
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={newMediaUrl}
                      onChange={(e) => setNewMediaUrl(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E9C349]"
                    />
                  </div>
                </div>

                {/* Caption textarea */}
                <div>
                  <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                    Pie de foto / Explicación
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="Escribe sobre la técnica, la música, o la batalla..."
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E9C349]"
                  />
                </div>

                {createMediaType !== 'story' && (
                  <>
                    {/* Hashtags input */}
                    <div>
                      <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                        Etiquetas (#Hashtags separados por coma)
                      </label>
                      <input 
                        type="text"
                        value={newTags}
                        onChange={(e) => setNewTags(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E9C349]"
                      />
                    </div>

                    {/* Music track */}
                    <div>
                      <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                        Pista de música (Opcional)
                      </label>
                      <input 
                        type="text"
                        placeholder="Ej. Disco Beats 128 BPM"
                        value={newMusic}
                        onChange={(e) => setNewMusic(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E9C349]"
                      />
                    </div>
                  </>
                )}

                <div className="pt-2 flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 py-2 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-[#E9C349] text-slate-950 font-black text-xs hover:bg-[#f3d362] transition-all shadow-lg"
                  >
                    Publicar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
