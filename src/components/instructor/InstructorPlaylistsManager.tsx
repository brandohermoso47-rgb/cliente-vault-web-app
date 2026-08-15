import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Music, 
  Cloud, 
  CloudUpload, 
  Disc, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Repeat, 
  Share2, 
  Download, 
  Plus, 
  Trash2, 
  FolderPlus, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  FileAudio, 
  Clock, 
  Zap, 
  Search, 
  Filter, 
  X, 
  Sliders, 
  Check, 
  ExternalLink,
  Info
} from 'lucide-react';
import { User } from '../../types';
import { Language } from '../../lib/translations';
import { db, storage } from '../../lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface CloudTrack {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  durationSeconds: number;
  audioUrl: string; // Blob URL, Data URL, or Remote HTTP link
  category: string;
  targetClass: string;
  isSharedWithStudents: boolean;
  uploadedAt: string;
  fileSizeMb?: string;
  notesForStudents?: string;
}

export interface InstructorCloudPlaylist {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  category: string;
  targetBpmRange: string;
  isSharedWithStudents: boolean;
  coverGradient: string;
  tracks: CloudTrack[];
  createdAt: string;
}

interface InstructorPlaylistsManagerProps {
  currentUser: User;
  language?: Language;
}

const DEFAULT_INSTRUCTOR_PLAYLISTS: InstructorCloudPlaylist[] = [
  {
    id: 'pl-waack-essentials-128',
    title: 'WaackOn Essentials: 128 BPM Arm Drills',
    description: 'Pistas optimizadas con ritmo constante para la práctica diaria de wrist rolls, arm rolls y aceleración de pose.',
    instructorId: 'inst-default',
    instructorName: 'Prof. Brando Hermoso',
    category: 'Fundamentos & Técnica',
    targetBpmRange: '124 - 130 BPM',
    isSharedWithStudents: true,
    coverGradient: 'from-amber-600 to-purple-900',
    createdAt: new Date().toISOString(),
    tracks: [
      {
        id: 'tr-101',
        title: 'Disco Magic (128 BPM Arm Roll Master)',
        artist: 'WaackOn Studio Beats',
        bpm: 128,
        durationSeconds: 215,
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=funky-disco-112233.mp3',
        category: 'Wrist Rolls & Drops',
        targetClass: 'Clase General Waacking',
        isSharedWithStudents: true,
        uploadedAt: '2026-08-01',
        fileSizeMb: '4.8 MB',
        notesForStudents: 'Acentúa los golpes de pecho en los tiempos 2 y 4. Mantén la fluidez en los giros de muñeca.'
      },
      {
        id: 'tr-102',
        title: 'Funk Groove & Syncopated Accents (125 BPM)',
        artist: 'The Waacking Soul Machine',
        bpm: 125,
        durationSeconds: 198,
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=funky-groove-18234.mp3',
        category: 'Groove & Grounding',
        targetClass: 'Fundamentos Nivel 1',
        isSharedWithStudents: true,
        uploadedAt: '2026-08-03',
        fileSizeMb: '4.2 MB',
        notesForStudents: 'Ideal para practicar rebote a tierra y trabajo de torso sin perder la velocidad de brazos.'
      }
    ]
  },
  {
    id: 'pl-battle-disco-132',
    title: 'Disco Battles & Speed Drill Selection 2026',
    description: 'Tracks de alta energía para simulación de batallas de Freestyle y rondas de resistencia rítmica.',
    instructorId: 'inst-default',
    instructorName: 'Prof. Brando Hermoso',
    category: 'Batallas & Freestyle',
    targetBpmRange: '130 - 136 BPM',
    isSharedWithStudents: true,
    coverGradient: 'from-[#9A2B3C] to-amber-700',
    createdAt: new Date().toISOString(),
    tracks: [
      {
        id: 'tr-103',
        title: 'Electro Disco Heat (132 BPM High Energy)',
        artist: 'DJ Waack Master',
        bpm: 132,
        durationSeconds: 240,
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c82301df.mp3?filename=disco-groove-2026.mp3',
        category: 'Aceleración & Posing',
        targetClass: 'Taller de Batallas Avanzado',
        isSharedWithStudents: true,
        uploadedAt: '2026-08-05',
        fileSizeMb: '5.5 MB',
        notesForStudents: 'Usa esta pista para simular entradas de 45 segundos en ronda de batalla.'
      }
    ]
  },
  {
    id: 'pl-somatic-posing-118',
    title: 'Somatic Posing & Expressive Slow Drills',
    description: 'Pistas de tempo moderado con marcados arreglos de cuerdas y vocales para enfatizar expresiones faciales y fotos estáticas.',
    instructorId: 'inst-default',
    instructorName: 'Prof. Brando Hermoso',
    category: 'Posing & Expresión',
    targetBpmRange: '115 - 122 BPM',
    isSharedWithStudents: false,
    coverGradient: 'from-purple-900 to-indigo-900',
    createdAt: new Date().toISOString(),
    tracks: []
  }
];

export default function InstructorPlaylistsManager({ currentUser, language = 'es' }: InstructorPlaylistsManagerProps) {
  const [playlists, setPlaylists] = useState<InstructorCloudPlaylist[]>(DEFAULT_INSTRUCTOR_PLAYLISTS);
  const [activePlaylistId, setActivePlaylistId] = useState<string>(DEFAULT_INSTRUCTOR_PLAYLISTS[0].id);
  const [activeTrack, setActiveTrack] = useState<CloudTrack | null>(DEFAULT_INSTRUCTOR_PLAYLISTS[0].tracks[0] || null);
  
  // Audio Player State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Modals & Forms
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [copiedLinkNotice, setCopiedLinkNotice] = useState<string | null>(null);

  // New Track Upload Form State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadAudioUrl, setUploadAudioUrl] = useState<string>('');
  const [newTrackTitle, setNewTrackTitle] = useState<string>('');
  const [newTrackArtist, setNewTrackArtist] = useState<string>('');
  const [newTrackBpm, setNewTrackBpm] = useState<number>(128);
  const [newTrackCategory, setNewTrackCategory] = useState<string>('Wrist Rolls & Drops');
  const [newTrackTargetClass, setNewTrackTargetClass] = useState<string>('Todas mis Clases');
  const [newTrackNotes, setNewTrackNotes] = useState<string>('');
  const [newTrackShare, setNewTrackShare] = useState<boolean>(true);
  const [targetPlaylistForUpload, setTargetPlaylistForUpload] = useState<string>(activePlaylistId);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // New Playlist Form State
  const [newPlaylistTitle, setNewPlaylistTitle] = useState<string>('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState<string>('');
  const [newPlaylistCategory, setNewPlaylistCategory] = useState<string>('Clases & Técnica');
  const [newPlaylistBpmRange, setNewPlaylistBpmRange] = useState<string>('120 - 130 BPM');
  const [newPlaylistShare, setNewPlaylistShare] = useState<boolean>(true);

  // Audio Reference
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Synchronize Playlists with Firestore real-time
  useEffect(() => {
    const playlistsRef = collection(db, 'instructor_playlists');
    const unsub = onSnapshot(playlistsRef, (snapshot) => {
      if (!snapshot.empty) {
        const loaded: InstructorCloudPlaylist[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push({ id: docSnap.id, ...docSnap.data() } as InstructorCloudPlaylist);
        });
        setPlaylists(loaded);
      }
    }, (err) => {
      console.warn("[InstructorPlaylists Firestore Sync Notice]:", err);
    });

    return () => unsub();
  }, []);

  // Sync Audio Controls
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = playbackSpeed;
    audioRef.current.loop = isLooping;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [playbackSpeed, isLooping, volume, isMuted, activeTrack]);

  const handlePlayTrack = (track: CloudTrack) => {
    if (activeTrack?.id === track.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    } else {
      setActiveTrack(track);
      setIsPlaying(true);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.playbackRate = playbackSpeed;
          audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.warn(e));
        }
      }, 100);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  // Handle Local File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      const url = URL.createObjectURL(file);
      setUploadAudioUrl(url);
      if (!newTrackTitle) {
        setNewTrackTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  // Save Track to Playlist
  const handleSaveTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrackTitle) return;

    setIsUploading(true);

    let finalAudioUrl = uploadAudioUrl || 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3';

    if (uploadFile) {
      try {
        const fileExt = uploadFile.name.split('.').pop() || 'mp3';
        const storageRef = ref(storage, `instructor_tracks/${Date.now()}_${uploadFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
        const snapshot = await uploadBytes(storageRef, uploadFile);
        finalAudioUrl = await getDownloadURL(snapshot.ref);
      } catch (err) {
        console.warn('Firebase Storage track upload notice:', err);
      }
    }

    const createdTrack: CloudTrack = {
      id: `track-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: newTrackTitle,
      artist: newTrackArtist || currentUser.displayName || 'Instructor WaackOn',
      bpm: Number(newTrackBpm) || 128,
      durationSeconds: Math.round(duration) || 180,
      audioUrl: finalAudioUrl,
      category: newTrackCategory,
      targetClass: newTrackTargetClass,
      isSharedWithStudents: newTrackShare,
      uploadedAt: new Date().toISOString().slice(0, 10),
      fileSizeMb: uploadFile ? `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB` : 'Nube MP3',
      notesForStudents: newTrackNotes
    };

    const targetPlIndex = playlists.findIndex(p => p.id === targetPlaylistForUpload);
    if (targetPlIndex !== -1) {
      const updatedPlaylists = [...playlists];
      updatedPlaylists[targetPlIndex] = {
        ...updatedPlaylists[targetPlIndex],
        tracks: [createdTrack, ...updatedPlaylists[targetPlIndex].tracks]
      };

      setPlaylists(updatedPlaylists);

      // Persist to Firestore
      try {
        await setDoc(doc(db, 'instructor_playlists', updatedPlaylists[targetPlIndex].id), updatedPlaylists[targetPlIndex]);
      } catch (err) {
        console.warn("Firestore save error:", err);
      }
    }

    setIsUploading(false);
    setShowUploadModal(false);
    setUploadFile(null);
    setUploadAudioUrl('');
    setNewTrackTitle('');
    setNewTrackArtist('');
    setNewTrackNotes('');
    setActiveTrack(createdTrack);
  };

  // Create Playlist
  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistTitle) return;

    const gradients = [
      'from-amber-600 to-purple-900',
      'from-[#9A2B3C] to-amber-700',
      'from-purple-900 to-indigo-900',
      'from-emerald-800 to-teal-950',
      'from-pink-900 to-[#9A2B3C]'
    ];

    const newPl: InstructorCloudPlaylist = {
      id: `pl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: newPlaylistTitle,
      description: newPlaylistDesc || 'Lista de reproducción personalizada para clases de Waacking y práctica rítmica.',
      instructorId: currentUser.id || 'inst-1',
      instructorName: currentUser.displayName || 'Instructor WaackOn',
      category: newPlaylistCategory,
      targetBpmRange: newPlaylistBpmRange,
      isSharedWithStudents: newPlaylistShare,
      coverGradient: gradients[playlists.length % gradients.length],
      tracks: [],
      createdAt: new Date().toISOString()
    };

    const updated = [newPl, ...playlists];
    setPlaylists(updated);
    setActivePlaylistId(newPl.id);

    try {
      await setDoc(doc(db, 'instructor_playlists', newPl.id), newPl);
    } catch (err) {
      console.warn("Firestore save playlist error:", err);
    }

    setShowCreatePlaylistModal(false);
    setNewPlaylistTitle('');
    setNewPlaylistDesc('');
  };

  // Toggle Sharing for Entire Playlist
  const handleToggleSharePlaylist = async (playlistId: string) => {
    const updated = playlists.map(p => {
      if (p.id === playlistId) {
        return { ...p, isSharedWithStudents: !p.isSharedWithStudents };
      }
      return p;
    });

    setPlaylists(updated);
    const target = updated.find(p => p.id === playlistId);
    if (target) {
      try {
        await setDoc(doc(db, 'instructor_playlists', target.id), target);
      } catch (err) {
        console.warn(err);
      }
    }
  };

  // Remove Track from Playlist
  const handleRemoveTrack = async (playlistId: string, trackId: string) => {
    const updated = playlists.map(p => {
      if (p.id === playlistId) {
        return { ...p, tracks: p.tracks.filter(t => t.id !== trackId) };
      }
      return p;
    });

    setPlaylists(updated);
    const target = updated.find(p => p.id === playlistId);
    if (target) {
      try {
        await setDoc(doc(db, 'instructor_playlists', target.id), target);
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const currentPlaylist = (playlists || []).find(p => p.id === activePlaylistId) || (playlists && playlists[0]) || null;

  const totalTracksCount = (playlists || []).reduce((acc, p) => acc + (p?.tracks?.length || 0), 0);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const copyShareLink = (playlistTitle: string) => {
    const shareUrl = `${window.location.origin}?playlist=${encodeURIComponent(playlistTitle)}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLinkNotice(`¡Enlace copiado! Los alumnos podrán acceder a "${playlistTitle}".`);
    setTimeout(() => setCopiedLinkNotice(null), 3000);
  };

  return (
    <div className="space-y-6 text-white font-sans">
      
      {/* Hidden Audio Element for Player */}
      {activeTrack && (
        <audio
          ref={audioRef}
          src={activeTrack.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* HEADER BANNER - INSTRUCTOR CLOUD MUSIC HUB */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d1021] via-[#161a33] to-[#20102b] border border-[#E9C349]/30 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E9C349]/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9C349]/10 border border-[#E9C349]/40 text-[#E9C349] font-mono text-xs font-bold uppercase tracking-wider">
              <Cloud className="w-3.5 h-3.5 animate-pulse text-[#E9C349]" />
              <span>NUBE MUSICAL DEL INSTRUCTOR WAACKON</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Listas de Reproducción & Música en la Nube
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              Sube y almacena la música oficial de tus clases, talleres y batallas en la nube. Tus alumnos tendrán acceso instantáneo en sus dispositivos para practicar con los tiempos y ritmos exactos que enseñas.
            </p>

            {/* Stats Row */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                <Disc className="w-4 h-4 text-[#E9C349]" />
                <span><strong>{playlists.length}</strong> Listas Creadas</span>
              </div>

              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                <Music className="w-4 h-4 text-emerald-400" />
                <span><strong>{totalTracksCount}</strong> Tracks en la Nube</span>
              </div>

              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Compartido con <strong>Alumnos</strong></span>
              </div>
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                setTargetPlaylistForUpload(activePlaylistId);
                setShowUploadModal(true);
              }}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#E9C349] to-amber-500 hover:brightness-110 text-black font-mono font-black text-xs uppercase tracking-wide shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <CloudUpload className="w-4 h-4" />
              <span>SUBIR CACIÓN / TRACK</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCreatePlaylistModal(true)}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono font-bold text-xs uppercase tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <FolderPlus className="w-4 h-4 text-[#E9C349]" />
              <span>CREAR NUEVA LISTA</span>
            </button>
          </div>
        </div>
      </div>

      {/* COPY LINK NOTICE TOAST */}
      <AnimatePresence>
        {copiedLinkNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-mono font-bold flex items-center gap-2 shadow-lg"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{copiedLinkNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PLAYLIST SELECTION CARDS & GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Disc className="w-5 h-5 text-[#E9C349]" />
            <h3 className="text-sm font-mono font-bold uppercase text-white tracking-wider">
              Tus Listas de Reproducción Activas
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Filtrar:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#12162a] border border-white/20 rounded-xl px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-[#E9C349]"
            >
              <option value="all">Todas las Categorías</option>
              <option value="Fundamentos & Técnica">Fundamentos & Técnica</option>
              <option value="Batallas & Freestyle">Batallas & Freestyle</option>
              <option value="Posing & Expresión">Posing & Expresión</option>
            </select>
          </div>
        </div>

        {/* Playlist Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {playlists
            .filter(p => categoryFilter === 'all' || p.category === categoryFilter)
            .map((pl) => {
              const isActive = pl.id === activePlaylistId;
              return (
                <div
                  key={pl.id}
                  onClick={() => setActivePlaylistId(pl.id)}
                  className={`relative p-5 rounded-3xl border transition-all cursor-pointer space-y-3 flex flex-col justify-between overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-br from-[#181d38] to-[#12162b] border-[#E9C349] shadow-2xl scale-[1.01]'
                      : 'bg-[#0f1224]/80 border-white/10 hover:border-white/30 hover:bg-[#13172e]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase font-bold text-[#E9C349] px-2.5 py-0.5 rounded-full bg-[#E9C349]/10 border border-[#E9C349]/30">
                        {pl.category}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSharePlaylist(pl.id);
                        }}
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border transition-all flex items-center gap-1 ${
                          pl.isSharedWithStudents
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                        title="Cambiar visibilidad para alumnos"
                      >
                        <Users className="w-3 h-3" />
                        <span>{pl.isSharedWithStudents ? 'Compartido' : 'Privado'}</span>
                      </button>
                    </div>

                    <h4 className="text-base font-bold text-white leading-snug line-clamp-2">
                      {pl.title}
                    </h4>

                    <p className="text-xs text-slate-400 line-clamp-2 font-sans">
                      {pl.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Music className="w-3.5 h-3.5 text-[#E9C349]" />
                      <strong>{pl.tracks.length}</strong> pistas
                    </span>

                    <span className="text-[11px] text-amber-400 font-bold">
                      {pl.targetBpmRange}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* SELECTED PLAYLIST TRACKLIST & CONTROLS SECTION */}
      {currentPlaylist && (
        <div className="bg-[#0e1122] border border-white/10 rounded-3xl p-6 space-y-6 shadow-xl">
          
          {/* Header of Active Playlist */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                  LISTA SELECCIONADA:
                </span>
                <span className="text-xs font-mono font-bold text-[#E9C349]">
                  {currentPlaylist.category}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white">
                {currentPlaylist.title}
              </h3>
              <p className="text-xs text-slate-400 max-w-xl">
                {currentPlaylist.description}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => copyShareLink(currentPlaylist.title)}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-[#E9C349]" />
                <span>COMPARTIR ENLACE</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTargetPlaylistForUpload(currentPlaylist.id);
                  setShowUploadModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:brightness-110 text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>AÑADIR TRACK</span>
              </button>
            </div>
          </div>

          {/* ACTIVE AUDIO PLAYER CONTROL BAR (IF PLAYING OR SELECTED) */}
          {activeTrack && (
            <div className="bg-gradient-to-r from-[#171b36] via-[#1f2347] to-[#171b36] border border-[#E9C349]/40 p-4 md:p-5 rounded-2xl shadow-2xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handlePlayTrack(activeTrack)}
                    className="w-12 h-12 rounded-2xl bg-[#E9C349] hover:bg-amber-400 text-black flex items-center justify-center font-bold shadow-xl transition-all cursor-pointer active:scale-95 shrink-0"
                  >
                    {isPlaying ? <Pause className="w-6 h-6 fill-black" /> : <Play className="w-6 h-6 fill-black translate-x-0.5" />}
                  </button>

                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{activeTrack.title}</span>
                      <span className="text-[10px] font-mono font-bold text-[#E9C349] px-2 py-0.5 rounded-full bg-[#E9C349]/20 border border-[#E9C349]/30">
                        {activeTrack.bpm} BPM
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">
                      {activeTrack.artist} • <span className="text-slate-300">{activeTrack.category}</span>
                    </p>
                  </div>
                </div>

                {/* Speed Controls for Drill Practice */}
                <div className="flex items-center gap-2 font-mono text-xs text-slate-300 bg-black/40 p-2 rounded-xl border border-white/10 shrink-0">
                  <span className="text-[10px] text-slate-400 uppercase">Velocidad:</span>
                  {[0.75, 1.0, 1.1, 1.25].map((speed) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                        playbackSpeed === speed
                          ? 'bg-[#E9C349] text-black'
                          : 'hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Scrubber */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#E9C349]"
                />
              </div>

              {/* Instructor Notes for Students */}
              {activeTrack.notesForStudents && (
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 font-sans flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-mono text-[10px] uppercase block text-amber-300">Nota Pedagógica para Alumnos:</strong>
                    <span>{activeTrack.notesForStudents}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tracks Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Lista de Canciones en la Nube ({currentPlaylist?.tracks?.length || 0})</span>
              <span className="text-slate-500">FORMATO MP3 & AUDIONUBE</span>
            </h4>

            {!currentPlaylist || (currentPlaylist.tracks || []).length === 0 ? (
              <div className="text-center py-10 bg-white/5 border border-dashed border-white/10 rounded-2xl space-y-3">
                <FileAudio className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-sm text-slate-400 font-sans">
                  Esta lista no tiene canciones subidas aún.
                </p>
                {currentPlaylist && (
                  <button
                    type="button"
                    onClick={() => {
                      setTargetPlaylistForUpload(currentPlaylist.id);
                      setShowUploadModal(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#E9C349] text-black font-mono font-bold text-xs uppercase cursor-pointer hover:bg-amber-400"
                  >
                    Subir Primera Canción
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {(currentPlaylist.tracks || []).map((track, idx) => {
                  const isCurrent = activeTrack?.id === track.id;
                  return (
                    <div
                      key={track.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-[#181d38] border-[#E9C349]/60 shadow-md'
                          : 'bg-[#121528] border-white/10 hover:border-white/20 hover:bg-[#151930]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => handlePlayTrack(track)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                            isCurrent && isPlaying
                              ? 'bg-[#E9C349] text-black'
                              : 'bg-white/10 hover:bg-white/20 text-white'
                          }`}
                        >
                          {isCurrent && isPlaying ? (
                            <Pause className="w-4 h-4 fill-black" />
                          ) : (
                            <Play className="w-4 h-4 fill-white translate-x-0.5" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <h5 className="text-sm font-bold text-white truncate flex items-center gap-2">
                            <span>{track.title}</span>
                            <span className="text-[10px] font-mono font-bold text-[#E9C349] px-2 py-0.5 rounded-full bg-[#E9C349]/10">
                              {track.bpm} BPM
                            </span>
                          </h5>
                          <p className="text-xs text-slate-400 font-mono truncate">
                            {track.artist} • <span className="text-slate-300">{track.category}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={track.audioUrl}
                          download={`${track.title}.mp3`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                          title="Descargar archivo de audio"
                        >
                          <Download className="w-4 h-4" />
                        </a>

                        <button
                          type="button"
                          onClick={() => handleRemoveTrack(currentPlaylist.id, track.id)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                          title="Eliminar de la lista"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* UPLOAD TRACK MODAL */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0c0e1a] border border-[#E9C349]/40 rounded-3xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl relative text-white"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <CloudUpload className="w-5 h-5 text-[#E9C349]" />
                  <h3 className="text-base font-mono font-bold text-white uppercase">
                    Subir Canción / Audio a la Nube
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTrack} className="space-y-4">
                {/* File Dropzone */}
                <div className="border-2 border-dashed border-[#E9C349]/40 rounded-2xl p-5 text-center bg-white/5 space-y-2 hover:border-[#E9C349] transition-all">
                  <FileAudio className="w-8 h-8 text-[#E9C349] mx-auto" />
                  <div className="text-xs font-mono font-bold text-slate-200">
                    {uploadFile ? uploadFile.name : 'Selecciona o arrastra tu archivo MP3 / WAV'}
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Archivos soportados: MP3, WAV, AAC, M4A (Máx. 50 MB)
                  </p>
                  <label className="inline-block mt-2 px-4 py-2 rounded-xl bg-[#E9C349] text-black font-mono font-bold text-xs uppercase cursor-pointer hover:bg-amber-400 transition-all">
                    Explorar Archivo local
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-400 uppercase">Título de la Canción *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Disco Magic (128 BPM)"
                      value={newTrackTitle}
                      onChange={(e) => setNewTrackTitle(e.target.value)}
                      className="w-full bg-[#14182e] border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E9C349]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-400 uppercase">Artista / Productor</label>
                    <input
                      type="text"
                      placeholder="Ej. WaackOn Studio"
                      value={newTrackArtist}
                      onChange={(e) => setNewTrackArtist(e.target.value)}
                      className="w-full bg-[#14182e] border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E9C349]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-400 uppercase">BPM (Tempo) *</label>
                    <input
                      type="number"
                      required
                      value={newTrackBpm}
                      onChange={(e) => setNewTrackBpm(Number(e.target.value))}
                      className="w-full bg-[#14182e] border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E9C349]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-400 uppercase">Categoría de Acento</label>
                    <select
                      value={newTrackCategory}
                      onChange={(e) => setNewTrackCategory(e.target.value)}
                      className="w-full bg-[#14182e] border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E9C349]"
                    >
                      <option value="Wrist Rolls & Drops">Wrist Rolls & Drops</option>
                      <option value="Groove & Grounding">Groove & Grounding</option>
                      <option value="Aceleración & Posing">Aceleración & Posing</option>
                      <option value="Vocales & Expresión">Vocales & Expresión</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400 uppercase">Lista de Destino</label>
                  <select
                    value={targetPlaylistForUpload}
                    onChange={(e) => setTargetPlaylistForUpload(e.target.value)}
                    className="w-full bg-[#14182e] border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E9C349]"
                  >
                    {playlists.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400 uppercase">Notas Pedagógicas para los Alumnos</label>
                  <textarea
                    rows={2}
                    placeholder="Instrucciones especiales para tus alumnos al practicar esta pista..."
                    value={newTrackNotes}
                    onChange={(e) => setNewTrackNotes(e.target.value)}
                    className="w-full bg-[#14182e] border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E9C349]"
                  />
                </div>

                <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
                  <input
                    type="checkbox"
                    id="shareTrackCheck"
                    checked={newTrackShare}
                    onChange={(e) => setNewTrackShare(e.target.checked)}
                    className="w-4 h-4 accent-[#E9C349] cursor-pointer"
                  />
                  <label htmlFor="shareTrackCheck" className="text-xs text-slate-200 cursor-pointer">
                    Compartir inmediatamente en la biblioteca de mis alumnos
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#E9C349] to-amber-500 hover:brightness-110 text-black font-mono font-black text-xs uppercase shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <CloudUpload className="w-4 h-4" />
                  <span>{isUploading ? 'GURADANDO EN LA NUBE...' : 'ALMACENAR EN LA NUBE'}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE PLAYLIST MODAL */}
      <AnimatePresence>
        {showCreatePlaylistModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0c0e1a] border border-[#E9C349]/40 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative text-white"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <FolderPlus className="w-5 h-5 text-[#E9C349]" />
                  <h3 className="text-base font-mono font-bold text-white uppercase">
                    Crear Lista de Reproducción
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreatePlaylistModal(false)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePlaylist} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400 uppercase">Nombre de la Lista *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Disco Drills Nivel 2"
                    value={newPlaylistTitle}
                    onChange={(e) => setNewPlaylistTitle(e.target.value)}
                    className="w-full bg-[#14182e] border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E9C349]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400 uppercase">Descripción</label>
                  <textarea
                    rows={2}
                    placeholder="Objetivo pedagógico de esta lista..."
                    value={newPlaylistDesc}
                    onChange={(e) => setNewPlaylistDesc(e.target.value)}
                    className="w-full bg-[#14182e] border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E9C349]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-400 uppercase">Categoría</label>
                    <select
                      value={newPlaylistCategory}
                      onChange={(e) => setNewPlaylistCategory(e.target.value)}
                      className="w-full bg-[#14182e] border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E9C349]"
                    >
                      <option value="Fundamentos & Técnica">Fundamentos & Técnica</option>
                      <option value="Batallas & Freestyle">Batallas & Freestyle</option>
                      <option value="Posing & Expresión">Posing & Expresión</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-400 uppercase">Rango BPM</label>
                    <input
                      type="text"
                      placeholder="124 - 130 BPM"
                      value={newPlaylistBpmRange}
                      onChange={(e) => setNewPlaylistBpmRange(e.target.value)}
                      className="w-full bg-[#14182e] border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E9C349]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
                  <input
                    type="checkbox"
                    id="sharePlCheck"
                    checked={newPlaylistShare}
                    onChange={(e) => setNewPlaylistShare(e.target.checked)}
                    className="w-4 h-4 accent-[#E9C349] cursor-pointer"
                  />
                  <label htmlFor="sharePlCheck" className="text-xs text-slate-200 cursor-pointer">
                    Hacer pública para todos mis alumnos
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#E9C349] to-amber-500 hover:brightness-110 text-black font-mono font-black text-xs uppercase shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>CREAR LISTA DE REPRODUCCIÓN</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
