import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Plus, Link2, Youtube, Disc, Sparkles, Check, Trash2, ExternalLink, RefreshCw, Save, Headphones, Flame } from 'lucide-react';
import { User, UserPlaylist, MusicSource } from '../types';
import MultiSourcePlayer, { parseMusicSource } from './MultiSourcePlayer';
import { doc, setDoc, collection, query, where, getDocs, addDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface StudentTrainingLibraryProps {
  currentUser: User;
  onUserChange?: (updated: User) => void;
}

export default function StudentTrainingLibrary({ currentUser, onUserChange }: StudentTrainingLibraryProps) {
  // State for connected accounts
  const [scProfileUrl, setScProfileUrl] = useState(currentUser.soundcloudProfileUrl || '');
  const [sources, setSources] = useState({
    soundcloud: currentUser.connectedMusicSources?.soundcloud ?? true,
    spotify: currentUser.connectedMusicSources?.spotify ?? false,
    youtube: currentUser.connectedMusicSources?.youtube ?? true
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Playlists
  const [playlists, setPlaylists] = useState<UserPlaylist[]>([]);
  const [activePlaylist, setActivePlaylist] = useState<UserPlaylist | null>(null);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(true);

  // Modal / Form state for adding playlist
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newBpm, setNewBpm] = useState<number | ''>(128);
  const [detectedProvider, setDetectedProvider] = useState<'soundcloud' | 'youtube' | 'spotify'>('soundcloud');

  // Load playlists from Firestore
  useEffect(() => {
    if (!currentUser?.id) return;

    const playlistsRef = collection(db, 'user_playlists');
    const q = query(playlistsRef, where('userId', '==', currentUser.id));

    const unsub = onSnapshot(q, (snap) => {
      const items: UserPlaylist[] = [];
      snap.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as UserPlaylist);
      });

      // Default curated initial playlists if empty
      if (items.length === 0) {
        const defaultItems: UserPlaylist[] = [
          {
            id: 'default-sc-1',
            userId: currentUser.id,
            title: 'Mis Violets Waacking - Disco Hits',
            provider: 'soundcloud',
            url: scProfileUrl || 'https://soundcloud.com/user-615971162',
            bpm: 126
          },
          {
            id: 'default-yt-1',
            userId: currentUser.id,
            title: 'Fast Arm Drills 132 BPM',
            provider: 'youtube',
            url: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
            bpm: 132
          },
          {
            id: 'default-sp-1',
            userId: currentUser.id,
            title: 'Spotify Waacking & Disco Essentials',
            provider: 'spotify',
            url: 'https://open.spotify.com/playlist/37i9dQZF1DX6XNisNdE8g6',
            bpm: 124
          }
        ];
        setPlaylists(defaultItems);
        setActivePlaylist(defaultItems[0]);
      } else {
        setPlaylists(items);
        if (!activePlaylist && items.length > 0) {
          setActivePlaylist(items[0]);
        }
      }
      setIsLoadingPlaylists(false);
    }, (err) => {
      console.warn('[Playlists Firestore Listener Notice]:', err);
      // Fallback local memory
      const fallbackItems: UserPlaylist[] = [
        {
          id: 'fb-1',
          userId: currentUser.id,
          title: 'Mis Violets Waacking (SoundCloud)',
          provider: 'soundcloud',
          url: scProfileUrl || 'https://soundcloud.com/user-615971162',
          bpm: 128
        },
        {
          id: 'fb-2',
          userId: currentUser.id,
          title: 'YouTube Drill - Overheads 130 BPM',
          provider: 'youtube',
          url: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
          bpm: 130
        }
      ];
      setPlaylists(fallbackItems);
      if (!activePlaylist) setActivePlaylist(fallbackItems[0]);
      setIsLoadingPlaylists(false);
    });

    return () => unsub();
  }, [currentUser?.id]);

  // Auto-detect provider when URL changes in form
  useEffect(() => {
    if (!newUrl) return;
    const parsed = parseMusicSource(newUrl);
    setDetectedProvider(parsed.provider);
  }, [newUrl]);

  // Save profile & sources to Firestore
  const handleSaveConnection = async () => {
    setIsSavingProfile(true);
    try {
      const userRef = doc(db, 'users', currentUser.id);
      await setDoc(userRef, {
        soundcloudProfileUrl: scProfileUrl,
        connectedMusicSources: sources,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      if (onUserChange) {
        onUserChange({
          ...currentUser,
          soundcloudProfileUrl: scProfileUrl,
          connectedMusicSources: sources
        });
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Error updating music connections:', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Add new playlist
  const handleAddPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    const parsed = parseMusicSource(newUrl, newTitle, typeof newBpm === 'number' ? newBpm : 128);

    const newObj: Omit<UserPlaylist, 'id'> = {
      userId: currentUser.id,
      title: newTitle.trim(),
      provider: parsed.provider,
      url: newUrl.trim(),
      bpm: typeof newBpm === 'number' ? newBpm : 128,
      createdAt: new Date().toISOString()
    };

    try {
      const docRef = await addDoc(collection(db, 'user_playlists'), newObj);
      const created: UserPlaylist = { id: docRef.id, ...newObj };
      setPlaylists(prev => [created, ...prev]);
      setActivePlaylist(created);
    } catch (err) {
      console.warn('Firestore add playlist fallback:', err);
      const created: UserPlaylist = { id: `local-${Date.now()}`, ...newObj };
      setPlaylists(prev => [created, ...prev]);
      setActivePlaylist(created);
    }

    setNewTitle('');
    setNewUrl('');
    setNewBpm(128);
    setShowAddModal(false);
  };

  // Delete playlist
  const handleDeletePlaylist = async (id: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== id));
    if (activePlaylist?.id === id) {
      const remaining = playlists.filter(p => p.id !== id);
      setActivePlaylist(remaining[0] || null);
    }
    try {
      if (!id.startsWith('default') && !id.startsWith('fb') && !id.startsWith('local')) {
        await deleteDoc(doc(db, 'user_playlists', id));
      }
    } catch (err) {
      console.warn('Delete playlist firestore notice:', err);
    }
  };

  const getProviderIcon = (p: 'soundcloud' | 'youtube' | 'spotify') => {
    if (p === 'youtube') return <Youtube className="w-4 h-4 text-red-500" />;
    if (p === 'spotify') return <Disc className="w-4 h-4 text-emerald-400" />;
    return <Music className="w-4 h-4 text-orange-500" />;
  };

  const currentMusicSource: MusicSource | null = activePlaylist ? {
    provider: activePlaylist.provider,
    url: activePlaylist.url,
    title: activePlaylist.title,
    bpm: activePlaylist.bpm
  } : (scProfileUrl ? {
    provider: 'soundcloud',
    url: scProfileUrl,
    title: 'Mi Perfil de SoundCloud',
    bpm: 128
  } : null);

  return (
    <div className="bg-[#12111A] border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 text-white relative overflow-hidden">
      {/* Background Decor Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Headphones className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest">
              Reproductor Multifuente & Biblioteca
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Mi Biblioteca de Entrenamiento
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Conecta tu perfil de SoundCloud, playlists de Spotify o videos de YouTube para entrenar freestyle y drills sin salir de la app.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="self-start md:self-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg hover:shadow-purple-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Pista / Playlist</span>
        </button>
      </div>

      {/* Main Active Player */}
      <div className="relative z-10">
        {currentMusicSource ? (
          <MultiSourcePlayer musicSource={currentMusicSource} />
        ) : (
          <div className="bg-black/40 border border-dashed border-white/20 rounded-2xl p-8 text-center space-y-3">
            <Music className="w-10 h-10 text-slate-300 mx-auto animate-pulse" />
            <h4 className="text-sm font-bold text-white">No tienes una pista seleccionada</h4>
            <p className="text-xs text-slate-300">Conecta tu SoundCloud abajo o añade una playlist con URL de YouTube/Spotify.</p>
          </div>
        )}
      </div>

      {/* Section 1: Connect SoundCloud & Platforms */}
      <div className="bg-black/40 border border-white/10 rounded-2xl p-5 space-y-4 relative z-10">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-[#E9C349]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Conexión de Cuentas & Fuentes</h4>
          </div>
          {savedSuccess && (
            <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> ¡Conexión Guardada!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* SoundCloud Input */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[11px] font-mono font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5" /> Enlace de Perfil / Likes SoundCloud:
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={scProfileUrl}
                onChange={(e) => setScProfileUrl(e.target.value)}
                placeholder="https://soundcloud.com/tu-usuario"
                className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-500/60"
              />
            </div>
          </div>

          {/* Connected Toggles */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
              Plataformas Activas:
            </label>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSources(s => ({ ...s, soundcloud: !s.soundcloud }))}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 ${
                  sources.soundcloud ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' : 'bg-white/5 text-slate-300 border-white/10'
                }`}
              >
                <span>SoundCloud</span>
                {sources.soundcloud && <Check className="w-3 h-3" />}
              </button>

              <button
                type="button"
                onClick={() => setSources(s => ({ ...s, spotify: !s.spotify }))}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 ${
                  sources.spotify ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-white/5 text-slate-300 border-white/10'
                }`}
              >
                <span>Spotify</span>
                {sources.spotify && <Check className="w-3 h-3" />}
              </button>

              <button
                type="button"
                onClick={() => setSources(s => ({ ...s, youtube: !s.youtube }))}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 ${
                  sources.youtube ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-white/5 text-slate-300 border-white/10'
                }`}
              >
                <span>YouTube</span>
                {sources.youtube && <Check className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleSaveConnection}
            disabled={isSavingProfile}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition-all border border-white/10"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSavingProfile ? 'Guardando...' : 'Guardar Configuración'}</span>
          </button>
        </div>
      </div>

      {/* Section 2: Saved Playlists Grid */}
      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            Pistas & Playlists Guardadas ({playlists.length})
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {playlists.map((pl) => {
            const isSelected = activePlaylist?.id === pl.id;
            return (
              <div
                key={pl.id}
                onClick={() => setActivePlaylist(pl)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected 
                    ? 'bg-purple-900/30 border-purple-500/60 shadow-xl ring-1 ring-purple-500/50' 
                    : 'bg-black/30 hover:bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 shrink-0">
                      {getProviderIcon(pl.provider)}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white line-clamp-1">{pl.title}</h5>
                      <span className="text-[10px] font-mono text-slate-300 capitalize">
                        {pl.provider} • {pl.bpm ? `${pl.bpm} BPM` : 'Var. BPM'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlaylist(pl.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/10">
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-300'
                  }`}>
                    {isSelected ? '▶ REPRODUCIENDO' : 'SELECCIONAR'}
                  </span>

                  <a
                    href={pl.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] font-mono text-slate-300 hover:text-[#E9C349] flex items-center gap-1"
                  >
                    <span>Abrir</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Add Playlist */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#181624] border border-white/20 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-white"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-purple-400" />
                  <span>Añadir Pista o Playlist</span>
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-300 hover:text-white text-xs font-mono"
                >
                  ✕ Cerrar
                </button>
              </div>

              <form onSubmit={handleAddPlaylist} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300">Título de la Pista / Drill:</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ej: Solo Disco 128 BPM"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300">URL (YouTube, Spotify, SoundCloud):</label>
                  <input
                    type="url"
                    required
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://soundcloud.com/... o https://youtube.com/..."
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  />
                  {newUrl && (
                    <p className="text-[10px] font-mono text-purple-300 flex items-center gap-1 pt-1">
                      <Sparkles className="w-3 h-3" /> Plataforma detectada: <strong className="uppercase">{detectedProvider}</strong>
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300">BPM Objetivo (opcional):</label>
                  <input
                    type="number"
                    value={newBpm}
                    onChange={(e) => setNewBpm(e.target.value ? parseInt(e.target.value) : '')}
                    placeholder="128"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg"
                  >
                    Guardar en Mi Biblioteca
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
