import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Radio,
  Search,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Plus,
  Music,
  Check,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Home,
  UserCheck,
  MessageSquare,
  User,
  X,
  Camera,
  Upload,
  Sparkles,
  Flame,
  Globe,
  Send,
  Eye,
  Languages,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { User as UserType } from '../types';
import { Language, getAITranslation } from '../lib/translations';

interface ReelsViewProps {
  currentUser: UserType;
  onNavigateTab: (tab: string) => void;
  language: Language;
}

interface ReelComment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  isLiked?: boolean;
}

interface ReelItem {
  id: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar: string;
  isVerified: boolean;
  isFollowing: boolean;
  videoUrl: string;
  posterUrl: string;
  songTitle: string;
  songArtist: string;
  caption: string;
  hashtags: string[];
  subtitles: string;
  likesCount: number;
  commentsCount: number;
  savedCount: number;
  shareCount: number;
  isLiked: boolean;
  isSaved: boolean;
  category: string;
  comments: ReelComment[];
  createdAt?: any;
}

const INITIAL_REELS: ReelItem[] = [
  {
    id: 'reel-live-1',
    creatorName: 'Brando Hermoso (EN VIVO)',
    creatorHandle: 'brando_waack_live',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    isVerified: true,
    isFollowing: true,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-hip-hop-style-in-a-studio-41483-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=800',
    songTitle: '🔴 CÁTEDRA LIVE: Whacking Speed & Arm Control (128 BPM)',
    songArtist: 'Transmisión Oficial WaackON',
    caption: '🔴 TRANSMISIÓN EN VIVO EN REELS: Laboratorio de velocidad, postura somática y freestyle con Brando Hermoso. ¡Conéctate en directo a la sesión de hoy!',
    hashtags: ['WaackingLive', 'MasterclassLive', 'EnVivo', 'WaackON'],
    subtitles: '🔴 TRANSMITIENDO EN VIVO: Envía tus dudas por la caja de comentarios y practica en tiempo real.',
    likesCount: 3890,
    commentsCount: 312,
    savedCount: 840,
    shareCount: 230,
    isLiked: true,
    isSaved: false,
    category: '🔴 LIVES',
    comments: [
      {
        id: 'lc1',
        user: 'Sara Queen',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
        text: '¡Conectada a la sesión en vivo de Reels! 🔥🔴',
        time: 'AHORA',
        likes: 94
      },
      {
        id: 'lc2',
        user: 'Pedro Punking',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
        text: '¡Brando esa transición de brazos a 128 BPM está letal!',
        time: 'Hace 1m',
        likes: 31
      }
    ]
  },
  {
    id: 'reel-1',
    creatorName: 'Brando Hermoso',
    creatorHandle: 'brando_waack',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    isVerified: true,
    isFollowing: true,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-hip-hop-style-in-a-studio-41483-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=800',
    songTitle: 'Got To Be Real (128 BPM Waack Remix)',
    songArtist: 'Cheryl Lynn',
    caption: '🔥 Dominando el control de brazos y velocidad en 128 BPM. La clave está en no perder el eje del hombro al hacer los whacks detrás de la cabeza!',
    hashtags: ['Waacking', 'ArmControl', 'WaackON', 'Freestyle', 'Dance'],
    subtitles: 'Mueve el brazo desde la articulación del codo, mantén los hombros fijos y proyecta hacia el frente.',
    likesCount: 2840,
    commentsCount: 189,
    savedCount: 420,
    shareCount: 95,
    isLiked: false,
    isSaved: false,
    category: 'Para ti',
    comments: [
      {
        id: 'c1',
        user: 'Sara Queen',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
        text: '¡Esa velocidad de muñecas está insana! 🔥🔥🔥',
        time: 'Hace 10m',
        likes: 42
      },
      {
        id: 'c2',
        user: 'Pedro Punking',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
        text: 'La extensión completa del codo antes del giro detrás del cuello hace toda la diferencia.',
        time: 'Hace 25m',
        likes: 18
      }
    ]
  },
  {
    id: 'reel-2',
    creatorName: 'Sara Waack',
    creatorHandle: 'sara_queen',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    isVerified: true,
    isFollowing: false,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-dancing-sensually-in-a-studio-41484-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=800',
    songTitle: 'You Make Me Feel (Mighty Real)',
    songArtist: 'Sylvester',
    caption: '✨ El Posing no es solo congelar la postura, es sostener la intención con la mirada. ¿Cuál es tu pose favorita para rematar un freeze?',
    hashtags: ['WaackingPosing', 'DiscoVibes', 'WaackON', 'StreetDance'],
    subtitles: 'Sostén la mirada tres tiempos antes de cambiar de ángulo. El drama nace de la suspensión.',
    likesCount: 4120,
    commentsCount: 312,
    savedCount: 890,
    shareCount: 210,
    isLiked: true,
    isSaved: true,
    category: 'Posing & Drama',
    comments: [
      {
        id: 'c3',
        user: 'Elena Pose',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
        text: 'La inclinación del cuello en la tercera pose es magistral 👑',
        time: 'Hace 1h',
        likes: 56
      }
    ]
  },
  {
    id: 'reel-3',
    creatorName: 'Pedro Punking',
    creatorHandle: 'pedro_punking',
    creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    isVerified: false,
    isFollowing: true,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-dancing-modern-dance-in-a-studio-41482-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=800',
    songTitle: "I'm Every Woman (Disco Remix)",
    songArtist: 'Chaka Khan',
    caption: '💥 Final de la Batalla Mensual Waack ON. Energía pura y musicalidad al límite. ¡Agradecido con toda la comunidad por el apoyo!',
    hashtags: ['WaackBattle', 'Waacking', 'WaackingDance', 'Punking'],
    subtitles: '¡Escucha los acentos de los vientos en el coro para soltar la explosión de brazos!',
    likesCount: 5690,
    commentsCount: 480,
    savedCount: 1120,
    shareCount: 340,
    isLiked: false,
    isSaved: false,
    category: 'Batallas',
    comments: [
      {
        id: 'c4',
        user: 'Carlos Disco',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150',
        text: '¡Ese final a tierra rompió la pista bro!',
        time: 'Hace 2h',
        likes: 29
      }
    ]
  }
];

export default function ReelsView({
  currentUser,
  onNavigateTab,
  language
}: ReelsViewProps) {
  // Top bar category tabs
  const categories = ['Para ti', '🔴 LIVES', 'Siguiendo', 'Comunidad', 'Drills 128 BPM', 'Batallas', 'Posing & Drama'];
  const [activeCategory, setActiveCategory] = useState('Para ti');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Reels list state
  const [reels, setReels] = useState<ReelItem[]>(INITIAL_REELS);

  // Current active index in video snap scroll
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  // Active Modals
  const [activeCommentsReelId, setActiveCommentsReelId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [shareModalReel, setShareModalReel] = useState<ReelItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Heart burst animation state
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  // Subtitle translation toggle
  const [translateSubtitles, setTranslateSubtitles] = useState(false);

  // Upload Form State
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadSong, setUploadSong] = useState('Waack ON Beats - 128 BPM Freestyle');
  const [uploadCategory, setUploadCategory] = useState('Para ti');
  const [uploadVideoUrlInput, setUploadVideoUrlInput] = useState('');
  const [uploadHashtags, setUploadHashtags] = useState('#Waacking #WaackON #Freestyle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string | null>(null);

  // Video refs array
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load Firestore Reels on Mount
  useEffect(() => {
    try {
      const reelsQuery = query(collection(db, 'reels'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(reelsQuery, (snapshot) => {
        const firestoreReels: ReelItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          firestoreReels.push({
            id: docSnap.id,
            creatorName: data.creatorName || 'Bailarín WaackON',
            creatorHandle: data.creatorHandle || 'waacker',
            creatorAvatar: data.creatorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
            isVerified: data.isVerified ?? true,
            isFollowing: data.isFollowing ?? true,
            videoUrl: data.videoUrl || '',
            posterUrl: data.posterUrl || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=800',
            songTitle: data.songTitle || 'Pista WaackON',
            songArtist: data.songArtist || data.creatorName || 'WaackON',
            caption: data.caption || '',
            hashtags: Array.isArray(data.hashtags) ? data.hashtags : ['Waacking', 'WaackON'],
            subtitles: data.subtitles || 'Video publicado por la comunidad de WaackON.',
            likesCount: data.likesCount || 1,
            commentsCount: data.commentsCount || 0,
            savedCount: data.savedCount || 0,
            shareCount: data.shareCount || 0,
            isLiked: false,
            isSaved: false,
            category: data.category || 'Para ti',
            comments: data.comments || [],
            createdAt: data.createdAt
          });
        });

        if (firestoreReels.length > 0) {
          // Merge firestore reels with sample initial reels (avoiding duplicates)
          setReels(prev => {
            const existingIds = new Set(firestoreReels.map(f => f.id));
            const filteredInitial = prev.filter(p => !existingIds.has(p.id));
            return [...firestoreReels, ...filteredInitial];
          });
        }
      }, (err) => {
        console.warn('Firestore reels collection listener notice:', err.message);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Could not initialize Firestore reels listener:', e);
    }
  }, []);

  // Handle scroll snap index detection
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight } = containerRef.current;
    const index = Math.round(scrollTop / clientHeight);
    if (index !== activeIndex && index >= 0 && index < reels.length) {
      setActiveIndex(index);
      setIsPlaying(true);
    }
  };

  // Play active video and pause others
  useEffect(() => {
    videoRefs.current.forEach((v, idx) => {
      if (v) {
        if (idx === activeIndex) {
          v.muted = isMuted;
          v.play().catch(() => {
            // Auto-play policy handling
          });
        } else {
          v.pause();
          v.currentTime = 0;
        }
      }
    });
  }, [activeIndex, isMuted, reels.length]);

  // Toggle Play / Pause on screen click
  const togglePlayPause = (idx: number) => {
    const video = videoRefs.current[idx];
    if (video) {
      if (video.paused) {
        video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  // Toggle Like with heart explosion
  const handleToggleLike = (reelId: string, e?: React.MouseEvent) => {
    if (e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const newHeart = {
        id: Date.now(),
        x: rect.left + rect.width / 2,
        y: rect.top - 20
      };
      setFloatingHearts(prev => [...prev, newHeart]);
      setTimeout(() => {
        setFloatingHearts(prev => prev.filter(h => h.id !== newHeart.id));
      }, 1000);
    }

    setReels(prev =>
      prev.map(r => {
        if (r.id === reelId) {
          const nextLiked = !r.isLiked;
          return {
            ...r,
            isLiked: nextLiked,
            likesCount: nextLiked ? r.likesCount + 1 : r.likesCount - 1
          };
        }
        return r;
      })
    );
  };

  // Toggle Save / Bookmark
  const handleToggleSave = (reelId: string) => {
    setReels(prev =>
      prev.map(r => {
        if (r.id === reelId) {
          const nextSaved = !r.isSaved;
          return {
            ...r,
            isSaved: nextSaved,
            savedCount: nextSaved ? r.savedCount + 1 : r.savedCount - 1
          };
        }
        return r;
      })
    );
  };

  // Toggle Follow
  const handleToggleFollow = (reelId: string) => {
    setReels(prev =>
      prev.map(r => {
        if (r.id === reelId) {
          return { ...r, isFollowing: !r.isFollowing };
        }
        return r;
      })
    );
  };

  // Add comment to active reel
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeCommentsReelId) return;

    const newCommentObj: ReelComment = {
      id: `comment-${Date.now()}`,
      user: currentUser.name,
      avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      text: newCommentText,
      time: 'Hace un momento',
      likes: 0
    };

    setReels(prev =>
      prev.map(r => {
        if (r.id === activeCommentsReelId) {
          return {
            ...r,
            commentsCount: r.commentsCount + 1,
            comments: [newCommentObj, ...r.comments]
          };
        }
        return r;
      })
    );

    setNewCommentText('');
  };

  // Handle Video File Selection
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const preview = URL.createObjectURL(file);
      setFilePreviewUrl(preview);
    }
  };

  // Upload video file to Firebase Storage & save document to Firestore reels
  const handleCreateReelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadCaption.trim()) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatusMsg('Procesando archivo de video...');

    const parsedHashtags = uploadHashtags
      .split(' ')
      .map(h => h.trim().replace(/^#/, ''))
      .filter(Boolean);

    let finalVideoUrl = uploadVideoUrlInput.trim();

    try {
      // 1. Upload to Firebase Storage if a local file was selected
      if (selectedFile) {
        setUploadStatusMsg('Subiendo video a Firebase Storage...');
        const storageRef = ref(storage, `reels/${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
        const uploadTask = uploadBytesResumable(storageRef, selectedFile);

        finalVideoUrl = await new Promise<string>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              setUploadProgress(progress);
              setUploadStatusMsg(`Subiendo a la nube: ${progress}%`);
            },
            (error) => {
              console.error('Firebase Storage upload error:', error);
              // Fall back gracefully to local Object URL if Storage upload is restricted
              if (filePreviewUrl) {
                console.warn('Fallback: utilizando URL local del video');
                resolve(filePreviewUrl);
              } else {
                reject(error);
              }
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
              } catch (err) {
                if (filePreviewUrl) resolve(filePreviewUrl);
                else reject(err);
              }
            }
          );
        });
      }

      if (!finalVideoUrl) {
        finalVideoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-hip-hop-style-in-a-studio-41483-large.mp4';
      }

      setUploadStatusMsg('Guardando referencia en Firestore...');

      // 2. Prepare Reel Object
      const newReelData = {
        creatorName: currentUser.name,
        creatorHandle: (currentUser.nickname || currentUser.name.toLowerCase().replace(/\s+/g, '_')),
        creatorAvatar: currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        isVerified: true,
        isFollowing: true,
        videoUrl: finalVideoUrl,
        posterUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=800',
        songTitle: uploadSong || 'Waack ON Beats - 128 BPM Freestyle',
        songArtist: currentUser.name,
        caption: uploadCaption,
        hashtags: parsedHashtags.length > 0 ? parsedHashtags : ['WaackON', 'Reels', 'Waacking'],
        subtitles: 'Transcripción IA activada para el nuevo video publicado en Firestore.',
        likesCount: 1,
        commentsCount: 0,
        savedCount: 0,
        shareCount: 0,
        category: uploadCategory,
        comments: [],
        createdAt: serverTimestamp()
      };

      // 3. Save to Firestore collection `reels`
      let docId = `reel-${Date.now()}`;
      try {
        const docRef = await addDoc(collection(db, 'reels'), newReelData);
        docId = docRef.id;
      } catch (fsErr) {
        console.warn('Could not save to Firestore collection reels, adding to local state:', fsErr);
      }

      // 4. Update local state
      const localReelItem: ReelItem = {
        id: docId,
        ...newReelData,
        isLiked: true,
        isSaved: false
      };

      setReels(prev => [localReelItem, ...prev.filter(p => p.id !== docId)]);
      
      // Reset Modal & Form State
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStatusMsg(null);
      setShowCreateModal(false);
      setUploadCaption('');
      setUploadVideoUrlInput('');
      setSelectedFile(null);
      setFilePreviewUrl(null);
      setActiveCategory(uploadCategory);
      setActiveIndex(0);

      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      console.error('Error publicando reel:', err);
      setUploadStatusMsg(`Error: ${err.message || 'No se pudo subir el video'}`);
      setIsUploading(false);
    }
  };

  // Filter reels by category / search query
  const filteredReels = (reels || []).filter(r => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.caption.toLowerCase().includes(q) ||
        r.creatorName.toLowerCase().includes(q) ||
        r.creatorHandle.toLowerCase().includes(q) ||
        r.hashtags.some(h => h.toLowerCase().includes(q))
      );
    }
    if (activeCategory === 'Siguiendo') {
      return r.isFollowing;
    }
    if (activeCategory !== 'Para ti') {
      return r.category === activeCategory || r.hashtags.some(h => h.toLowerCase().includes(activeCategory.toLowerCase()));
    }
    return true;
  });

  return (
    <div className="relative w-full h-[calc(100vh-60px)] sm:h-[calc(100vh-20px)] bg-black text-white flex flex-col overflow-hidden font-body-md select-none">
      
      {/* Dynamic Keyframe Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spinSlow 6s linear infinite;
        }
        @keyframes heartPulse {
          0% { transform: scale(0.6); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.9; }
          100% { transform: scale(1) translateY(-60px); opacity: 0; }
        }
        .animate-heart-burst {
          animation: heartPulse 0.9s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }
      `}} />

      {/* 1. TOP BAR NAVIGATION OVERLAY */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/90 via-black/40 to-transparent p-3 sm:p-4 flex items-center justify-between gap-2 pointer-events-auto">
        
        {/* Left: LIVES Button */}
        <button
          onClick={() => onNavigateTab('live')}
          className="px-3 py-1.5 rounded-full bg-red-600/90 hover:bg-red-600 text-white font-mono font-bold text-xs uppercase border border-red-400/50 flex items-center gap-1.5 shadow-lg shadow-red-600/30 hover:scale-105 transition-all shrink-0"
          title="Ir a Sesión de LIVES en Vivo"
        >
          <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
          <span className="hidden sm:inline">VER LIVES</span>
        </button>

        {/* Center: Scrollable Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none max-w-[45%] sm:max-w-[60%] px-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 border ${
                activeCategory === cat
                  ? 'bg-[#E9C349] text-slate-950 border-[#E9C349] font-black shadow-md'
                  : 'bg-black/40 text-slate-300 border-white/10 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Right: + PUBLICAR REEL & Search */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 rounded-full bg-[#E9C349] hover:bg-[#f3d362] text-slate-950 font-black text-xs uppercase flex items-center gap-1.5 shadow-lg shadow-[#E9C349]/20 hover:scale-105 transition-all"
            title="Publicar tu video en Waack Reels"
          >
            <Camera className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden sm:inline">+ PUBLICAR</span>
          </button>

          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-full bg-black/50 border border-white/20 text-white hover:bg-white/20 transition-all"
            title="Buscar Bailes o Hashtags"
          >
            <Search className="w-4 h-4 text-[#E9C349]" />
          </button>
        </div>
      </div>

      {/* Floating Search Bar Drawer */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-4 right-4 z-40 bg-[#141414]/95 border border-[#E9C349]/40 p-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2"
          >
            <Search className="w-4 h-4 text-[#E9C349]" />
            <input
              type="text"
              placeholder="Buscar #Waacking, #ArmControl, @usuario..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
              autoFocus
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. VERTICAL SNAP SCROLL VIDEO CONTAINER */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 snap-y snap-mandatory overflow-y-scroll scrollbar-none w-full h-full relative"
      >
        {filteredReels.map((reel, idx) => {
          const isActive = idx === activeIndex;

          return (
            <div
              key={reel.id}
              className="snap-start snap-always w-full h-full relative flex items-center justify-center bg-black overflow-hidden"
            >
              {/* Main Video Element */}
              <video
                ref={(el) => (videoRefs.current[idx] = el)}
                src={reel.videoUrl}
                poster={reel.posterUrl}
                loop
                playsInline
                muted={isMuted}
                onClick={() => togglePlayPause(idx)}
                className="w-full h-full object-cover cursor-pointer"
              />

              {/* Dark Gradient Overlay for Control Legibility */}
              <div 
                onClick={() => togglePlayPause(idx)}
                className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 pointer-events-auto" 
              />

              {/* Pause Indicator overlay on click */}
              {!isPlaying && isActive && (
                <div 
                  onClick={() => togglePlayPause(idx)}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-auto"
                >
                  <div className="w-16 h-16 rounded-full bg-black/70 border border-[#E9C349]/50 flex items-center justify-center text-[#E9C349] shadow-2xl backdrop-blur-sm">
                    <Play className="w-8 h-8 pl-1 fill-current" />
                  </div>
                </div>
              )}

              {/* Mute Controller at top right */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                className="absolute top-16 right-4 z-20 p-2.5 bg-black/60 backdrop-blur-md rounded-full border border-white/20 text-white hover:bg-black/80 transition-all shadow-xl"
                aria-label="Silenciar o activar audio"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-[#E9C349]" />}
              </button>

              {/* RIGHT ACTION RAIL */}
              <div className="absolute right-3 sm:right-5 bottom-24 z-20 flex flex-col items-center space-y-5">
                
                {/* Creator Avatar with Follow Button */}
                <div className="relative group">
                  <img
                    src={reel.creatorAvatar}
                    alt={reel.creatorName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#E9C349] shadow-2xl"
                  />
                  {!reel.isFollowing ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFollow(reel.id);
                      }}
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border border-white shadow-lg transition-transform hover:scale-110"
                      title="Seguir Creador"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFollow(reel.id);
                      }}
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-slate-950 text-xs font-bold border border-white shadow-lg"
                      title="Siguiendo"
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </button>
                  )}
                </div>

                {/* Like Button */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleLike(reel.id, e);
                    }}
                    className={`p-3 rounded-full backdrop-blur-md transition-all shadow-xl active:scale-75 ${
                      reel.isLiked 
                        ? 'bg-rose-600/30 text-rose-500 border border-rose-500/50' 
                        : 'bg-black/50 text-white border border-white/20 hover:bg-white/20'
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${reel.isLiked ? 'fill-current text-rose-500' : ''}`} />
                  </button>
                  <span className="text-[11px] font-mono font-bold text-white mt-1 drop-shadow-md">
                    {reel.likesCount >= 1000 ? `${(reel.likesCount / 1000).toFixed(1)}k` : reel.likesCount}
                  </span>
                </div>

                {/* Comments Button */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCommentsReelId(reel.id);
                    }}
                    className="p-3 rounded-full bg-black/50 text-white border border-white/20 hover:bg-white/20 backdrop-blur-md transition-all shadow-xl active:scale-75"
                  >
                    <MessageCircle className="w-6 h-6 text-[#E9C349]" />
                  </button>
                  <span className="text-[11px] font-mono font-bold text-white mt-1 drop-shadow-md">
                    {reel.commentsCount}
                  </span>
                </div>

                {/* Save / Bookmark Button */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleSave(reel.id);
                    }}
                    className={`p-3 rounded-full backdrop-blur-md transition-all shadow-xl active:scale-75 ${
                      reel.isSaved 
                        ? 'bg-[#E9C349]/30 text-[#E9C349] border border-[#E9C349]/50' 
                        : 'bg-black/50 text-white border border-white/20 hover:bg-white/20'
                    }`}
                  >
                    <Bookmark className={`w-6 h-6 ${reel.isSaved ? 'fill-current text-[#E9C349]' : ''}`} />
                  </button>
                  <span className="text-[11px] font-mono font-bold text-white mt-1 drop-shadow-md">
                    {reel.savedCount}
                  </span>
                </div>

                {/* Share Button */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShareModalReel(reel);
                    }}
                    className="p-3 rounded-full bg-black/50 text-white border border-white/20 hover:bg-white/20 backdrop-blur-md transition-all shadow-xl active:scale-75"
                  >
                    <Share2 className="w-6 h-6 text-blue-400" />
                  </button>
                  <span className="text-[11px] font-mono font-bold text-white mt-1 drop-shadow-md">
                    {reel.shareCount}
                  </span>
                </div>

                {/* Spinning Audio Music Disc */}
                <div className="pt-2 flex flex-col items-center">
                  <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-slate-900 to-black p-1 border-2 border-[#E9C349] shadow-2xl animate-spin-slow">
                    <img
                      src={reel.creatorAvatar}
                      alt="Music Track"
                      className="w-full h-full rounded-full object-cover"
                    />
                    <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none" />
                  </div>
                  <Music className="w-3.5 h-3.5 text-[#E9C349] animate-bounce mt-1" />
                </div>

              </div>

              {/* BOTTOM CONTENT OVERLAY */}
              <div className="absolute left-3 sm:left-6 bottom-24 right-20 z-20 space-y-3 pointer-events-auto">
                
                {/* Creator Handle & Name */}
                <div className="flex items-center gap-2">
                  <h3 
                    onClick={() => onNavigateTab('profile')}
                    className="text-sm sm:text-base font-black text-white hover:text-[#E9C349] cursor-pointer transition-colors flex items-center gap-1.5 drop-shadow-lg"
                  >
                    @{reel.creatorHandle}
                    {reel.isVerified && (
                      <span className="p-0.5 bg-[#E9C349] text-slate-950 rounded-full" title="Bailarín Verificado">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </h3>

                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono font-bold text-[#E9C349] border border-[#E9C349]/30">
                    {reel.category}
                  </span>
                </div>

                {/* Caption & Hashtags */}
                <p className="text-xs sm:text-sm text-slate-100 leading-relaxed drop-shadow-md font-medium max-w-lg">
                  {reel.caption}{' '}
                  {(reel.hashtags || []).map(tag => (
                    <span 
                      key={tag} 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchQuery(`#${tag}`);
                        setShowSearch(true);
                      }}
                      className="font-extrabold text-[#E9C349] hover:underline cursor-pointer mr-1"
                    >
                      #{tag}
                    </span>
                  ))}
                </p>

                {/* Subtitles & AI Transcription Banner */}
                <div className="bg-black/75 border border-[#E9C349]/40 p-2.5 rounded-xl backdrop-blur-md max-w-md shadow-xl flex items-start gap-2.5">
                  <Languages className="w-4 h-4 text-[#E9C349] shrink-0 mt-0.5 animate-pulse" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[9px] font-mono font-black text-[#E9C349] uppercase tracking-wider">
                        🎤 Subtítulos IA Sincronizados
                      </span>
                      <button
                        onClick={() => setTranslateSubtitles(!translateSubtitles)}
                        className="text-[9px] font-mono font-bold text-blue-400 hover:underline"
                      >
                        {translateSubtitles ? 'Original' : 'Traducir'}
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-slate-200 italic leading-snug">
                      "{translateSubtitles ? getAITranslation(reel.subtitles, language) : reel.subtitles}"
                    </p>
                  </div>
                </div>

                {/* Audio Ticker Track */}
                <div className="flex items-center gap-2 bg-black/60 border border-white/10 px-3 py-1.5 rounded-full w-fit backdrop-blur-md">
                  <Music className="w-3.5 h-3.5 text-[#E9C349] shrink-0" />
                  <p className="text-[11px] font-mono font-bold text-slate-200 truncate max-w-[200px] sm:max-w-[280px]">
                    {reel.songTitle} — {reel.songArtist}
                  </p>
                </div>

              </div>

            </div>
          );
        })}
      </div>

      {/* 3. BOTTOM NAV BAR */}
      <div className="relative z-30 bg-black/95 border-t border-white/10 px-4 py-2 flex items-center justify-around shadow-2xl">
        
        {/* Inicio */}
        <button
          onClick={() => onNavigateTab('dashboard')}
          className="flex flex-col items-center text-slate-400 hover:text-white transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px] font-mono font-bold uppercase mt-1">Inicio</span>
        </button>

        {/* Amigos */}
        <button
          onClick={() => onNavigateTab('friends')}
          className="flex flex-col items-center text-slate-400 hover:text-white transition-colors relative"
        >
          <UserCheck className="w-5 h-5" />
          <span className="absolute -top-1 right-1 w-2 h-2 rounded-full bg-red-600 animate-ping" />
          <span className="text-[9px] font-mono font-bold uppercase mt-1">Amigos</span>
        </button>

        {/* Central Plus Create Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-12 h-10 rounded-2xl bg-gradient-to-r from-[#E9C349] via-amber-400 to-[#9A2B3C] text-slate-950 flex items-center justify-center font-black shadow-lg shadow-[#E9C349]/30 hover:scale-105 active:scale-95 transition-all -mt-3 border border-white/30"
          title="Grabar o Subir Waack Reel"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Mensajes */}
        <button
          onClick={() => onNavigateTab('comunidad')}
          className="flex flex-col items-center text-slate-400 hover:text-white transition-colors relative"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 px-1 rounded-full bg-[#E9C349] text-slate-950 font-mono text-[8px] font-black">
            2
          </span>
          <span className="text-[9px] font-mono font-bold uppercase mt-1">Mensajes</span>
        </button>

        {/* Perfil */}
        <button
          onClick={() => onNavigateTab('profile')}
          className="flex flex-col items-center text-slate-400 hover:text-white transition-colors"
        >
          <User className="w-5 h-5" />
          <span className="text-[9px] font-mono font-bold uppercase mt-1">Perfil</span>
        </button>
      </div>

      {/* MODAL: COMMENTS SHEET */}
      <AnimatePresence>
        {activeCommentsReelId && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute inset-x-0 bottom-0 top-1/4 z-50 bg-[#141414] border-t border-[#E9C349]/40 rounded-t-3xl p-4 sm:p-6 flex flex-col shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#E9C349]" />
                COMENTARIOS DE LA COMUNIDAD (
                {reels.find(r => r.id === activeCommentsReelId)?.commentsCount || 0})
              </h3>
              <button
                onClick={() => setActiveCommentsReelId(null)}
                className="p-1.5 rounded-full bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-4 py-4 scrollbar-thin scrollbar-thumb-[#9A2B3C]">
              {(reels.find(r => r.id === activeCommentsReelId)?.comments || []).map((c) => (
                <div key={c.id} className="flex items-start gap-3 text-xs">
                  <img src={c.avatar} alt={c.user} className="w-8 h-8 rounded-full object-cover border border-[#E9C349]" />
                  <div className="flex-1 bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white">{c.user}</span>
                      <span className="text-[9px] font-mono text-slate-400">{c.time}</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="pt-3 border-t border-white/10 flex gap-2">
              <input
                type="text"
                placeholder="Escribe un comentario o pregunta sobre la técnica..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E9C349]"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="px-5 py-2.5 bg-[#E9C349] text-slate-950 font-black text-xs rounded-xl hover:bg-[#f3d362] disabled:opacity-40 transition-all shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: SHARE REEL */}
      <AnimatePresence>
        {shareModalReel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="bg-[#141414] border border-[#E9C349]/40 p-6 rounded-3xl max-w-sm w-full space-y-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-400" /> COMPARTIR REEL
                </h3>
                <button onClick={() => setShareModalReel(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-white/5 p-3 rounded-2xl flex items-center gap-3 border border-white/10">
                <img src={shareModalReel.posterUrl} alt="Thumbnail" className="w-12 h-16 rounded-xl object-cover shrink-0" />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">@{shareModalReel.creatorHandle}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{shareModalReel.caption}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 3000);
                  }}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all"
                >
                  {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#E9C349]" />}
                  {copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace'}
                </button>

                <button
                  onClick={() => {
                    window.open(`https://wa.me/?text=${encodeURIComponent(`Mira este increíble Reel de Waacking en Waack ON: @${shareModalReel.creatorHandle}`)}`, '_blank');
                  }}
                  className="p-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <ExternalLink className="w-4 h-4" /> WhatsApp
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: CREATE / UPLOAD NEW REEL WITH FIREBASE STORAGE & FIRESTORE */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <form 
              onSubmit={handleCreateReelSubmit}
              className="bg-[#141414] border border-[#E9C349]/40 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#E9C349]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#E9C349]" /> PUBLICAR NUEVO REEL EN FIREBASE
                </h3>
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-white disabled:opacity-40"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Video File Picker with Firebase Storage */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Video de Danza (Selecciona archivo local para Firebase Storage)
                </label>
                <div className="p-4 bg-white/5 border border-dashed border-[#E9C349]/50 rounded-2xl text-center space-y-2 relative hover:bg-white/10 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="video/*"
                    disabled={isUploading}
                    onChange={handleVideoFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10 disabled:cursor-not-allowed"
                  />
                  <Upload className="w-8 h-8 text-[#E9C349] mx-auto animate-bounce" />
                  <p className="text-xs font-bold text-white">
                    {selectedFile ? `🎥 Archivo seleccionado: ${selectedFile.name}` : 'Haz clic para seleccionar tu video (.mp4, .mov, .webm)'}
                  </p>
                  <p className="text-[10px] text-slate-400">Formato recomendado: 9:16 vertical • Guardado directo en Firebase</p>
                </div>

                {/* Local Video Preview */}
                {filePreviewUrl && (
                  <div className="mt-2 relative rounded-xl overflow-hidden border border-[#E9C349]/40 aspect-[9/12] max-h-48 mx-auto bg-black flex items-center justify-center">
                    <video src={filePreviewUrl} controls className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="mt-2">
                  <span className="text-[10px] text-slate-400 block mb-1">O si prefieres, introduce una URL de video directo:</span>
                  <input
                    type="url"
                    disabled={isUploading}
                    placeholder="https://assets.mixkit.co/.../video.mp4"
                    value={uploadVideoUrlInput}
                    onChange={(e) => setUploadVideoUrlInput(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#E9C349] disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Upload Progress Bar */}
              {isUploading && (
                <div className="p-3 bg-[#E9C349]/10 border border-[#E9C349]/30 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-[#E9C349]">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      {uploadStatusMsg}
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/10">
                    <div 
                      className="h-full bg-gradient-to-r from-[#E9C349] to-amber-400 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Category selector */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Categoría del Reel
                </label>
                <select
                  disabled={isUploading}
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#E9C349] disabled:opacity-50"
                >
                  <option value="Para ti">Para ti</option>
                  <option value="Comunidad">Comunidad</option>
                  <option value="Drills 128 BPM">Drills 128 BPM</option>
                  <option value="Batallas">Batallas</option>
                  <option value="Posing & Drama">Posing & Drama</option>
                </select>
              </div>

              {/* Caption */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Descripción / Captura
                </label>
                <textarea
                  rows={2}
                  disabled={isUploading}
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  placeholder="Describe tu rutina, velocidad de brazos o técnica ejecutada..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#E9C349] disabled:opacity-50"
                  required
                />
              </div>

              {/* Hashtags */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Hashtags
                </label>
                <input
                  type="text"
                  disabled={isUploading}
                  value={uploadHashtags}
                  onChange={(e) => setUploadHashtags(e.target.value)}
                  placeholder="#Waacking #ArmControl #WaackON"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#E9C349] disabled:opacity-50"
                />
              </div>

              {/* Music Song */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Pista de Audio / Canción
                </label>
                <input
                  type="text"
                  disabled={isUploading}
                  value={uploadSong}
                  onChange={(e) => setUploadSong(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#E9C349] disabled:opacity-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-white/10 text-xs font-bold text-slate-300 rounded-xl hover:text-white disabled:opacity-40"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUploading || (!selectedFile && !uploadVideoUrlInput && !uploadCaption)}
                  className="px-6 py-2 bg-[#E9C349] text-slate-950 font-black text-xs rounded-xl hover:bg-[#f3d362] shadow-lg flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Publicar Reel
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Animated Hearts */}
      {floatingHearts.map((h) => (
        <span
          key={h.id}
          className="fixed z-50 text-3xl pointer-events-none animate-heart-burst fill-rose-500"
          style={{ left: h.x - 15, top: h.y }}
        >
          ❤️
        </span>
      ))}

    </div>
  );
}
