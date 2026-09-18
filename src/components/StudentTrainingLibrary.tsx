import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Plus, Link2, Youtube, Disc, Sparkles, Check, Trash2, ExternalLink, RefreshCw, Save, Headphones, Flame, UploadCloud, FileAudio, Loader2 } from 'lucide-react';
import { User, UserPlaylist, MusicSource, PlaylistItem } from '../types';
import MultiSourcePlayer, { parseMusicSource } from './MultiSourcePlayer';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth, sanitizeFirestoreData } from '../lib/firebase';
import { uploadAudioFileToFirebase, saveUserTrackToFirebase, deleteUserTrackFromFirebase, subscribeUserTracksFromFirebase } from '../lib/musicService';

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

  // Playlists & Tracks in Firebase Session
  const [playlists, setPlaylists] = useState<UserPlaylist[]>([]);
  const [activePlaylist, setActivePlaylist] = useState<UserPlaylist | null>(null);

  // Modal / Form state for adding playlist or uploading audio file
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalMode, setModalMode] = useState<'url' | 'upload'>('url');
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newBpm, setNewBpm] = useState<number | ''>(128);
  const [newCategory, setNewCategory] = useState('General');
  const [newArtist, setNewArtist] = useState('');
  const [detectedProvider, setDetectedProvider] = useState<'soundcloud' | 'youtube' | 'spotify'>('soundcloud');

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to user tracks from Firebase Firestore in real-time
  useEffect(() => {
    if (!currentUser?.id) return;

    const unsub = subscribeUserTracksFromFirebase(currentUser.id, (tracks: PlaylistItem[]) => {
      const userPls: UserPlaylist[] = tracks.map(t => ({
        id: t.id,
        userId: currentUser.id,
        title: t.title,
        provider: (t.provider as any) || 'custom',
        url: t.audioUrl,
        bpm: t.bpm,
        createdAt: t.createdAt,
        storagePath: t.storagePath,
        artist: t.artist
      }));

      setPlaylists(userPls);
      if (userPls.length > 0 && !activePlaylist) {
        setActivePlaylist(userPls[0]);
      }
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
      const activeUid = auth?.currentUser?.uid || (currentUser.id && currentUser.id !== 'u-1' ? currentUser.id : null);
      if (activeUid && db && auth.currentUser) {
        const userRef = doc(db, 'users', activeUid);
        await setDoc(userRef, sanitizeFirestoreData({
          soundcloudProfileUrl: scProfileUrl,
          connectedMusicSources: sources,
          updatedAt: new Date().toISOString()
        }), { merge: true });
      }

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

  // Add new playlist or upload audio file
  const handleAddPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (modalMode === 'upload') {
      if (!selectedFile) {
        setUploadError('Por favor selecciona un archivo de audio (MP3, WAV, OGG, M4A).');
        return;
      }

      setIsUploading(true);
      try {
        const uploadedTrack = await uploadAudioFileToFirebase(
          currentUser.id,
          selectedFile,
          {
            title: newTitle.trim() || selectedFile.name.replace(/\.[^/.]+$/, ''),
            artist: newArtist.trim() || 'Artista Local',
            bpm: typeof newBpm === 'number' ? newBpm : 120,
            category: newCategory
          },
          (progress) => setUploadProgress(progress)
        );

        const newPlItem: UserPlaylist = {
          id: uploadedTrack.id,
          userId: currentUser.id,
          title: uploadedTrack.title,
          provider: 'upload',
          url: uploadedTrack.audioUrl,
          bpm: uploadedTrack.bpm,
          createdAt: uploadedTrack.createdAt,
          storagePath: uploadedTrack.storagePath,
          artist: uploadedTrack.artist
        };

        setActivePlaylist(newPlItem);
        setShowAddModal(false);
        setNewTitle('');
        setNewArtist('');
        setSelectedFile(null);
        setUploadProgress(0);
      } catch (err: any) {
        console.error('Error uploading audio file:', err);
        setUploadError(err.message || 'Error al subir el archivo de audio a Firebase.');
      } finally {
        setIsUploading(false);
      }
      return;
    }

    // Modal mode: URL link
    if (!newTitle.trim() || !newUrl.trim()) return;

    const parsed = parseMusicSource(newUrl, newTitle, typeof newBpm === 'number' ? newBpm : 128);

    const trackItem: PlaylistItem = {
      id: `track_link_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: newTitle.trim(),
      artist: newArtist.trim() || 'Pista Vinculada',
      bpm: typeof newBpm === 'number' ? newBpm : 128,
      duration: '3:00',
      type: (typeof newBpm === 'number' ? newBpm : 128) >= 120 ? 'fast' : 'slow',
      audioUrl: newUrl.trim(),
      provider: parsed.provider as any,
      userId: currentUser.id,
      category: newCategory,
      createdAt: new Date().toISOString()
    };

    try {
      await saveUserTrackToFirebase(currentUser.id, trackItem);
    } catch (err) {
      console.warn('Firebase save track notice:', err);
    }

    setNewTitle('');
    setNewUrl('');
    setNewArtist('');
    setNewBpm(128);
    setShowAddModal(false);
  };

  // Delete playlist
  const handleDeletePlaylist = async (id: string) => {
    const trackToDelete = playlists.find(p => p.id === id);
    setPlaylists(prev => prev.filter(p => p.id !== id));
    if (activePlaylist?.id === id) {
      const remaining = playlists.filter(p => p.id !== id);
      setActivePlaylist(remaining[0] || null);
    }

    if (trackToDelete && currentUser?.id) {
      const itemAsPlaylistItem: PlaylistItem = {
        id: trackToDelete.id,
        title: trackToDelete.title,
        artist: trackToDelete.artist || '',
        bpm: trackToDelete.bpm || 120,
        duration: '3:00',
        type: 'fast',
        audioUrl: trackToDelete.url,
        storagePath: trackToDelete.storagePath
      };
      await deleteUserTrackFromFirebase(currentUser.id, itemAsPlaylistItem);
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
            <Link2 className="w-4 h-4 text-[#D9A9FF]" />
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
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
                    className="text-[10px] font-mono text-slate-300 hover:text-[#D9A9FF] flex items-center gap-1"
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

      {/* Modal Add Playlist or Upload Audio File */}
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
                  <span>Añadir Música a Mi Sesión</span>
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-300 hover:text-white text-xs font-mono"
                >
                  ✕ Cerrar
                </button>
              </div>

              {/* Modal Tabs */}
              <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
                <button
                  type="button"
                  onClick={() => setModalMode('url')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    modalMode === 'url' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Enlace URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalMode('upload')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    modalMode === 'upload' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Subir Audio (MP3/WAV)</span>
                </button>
              </div>

              <form onSubmit={handleAddPlaylist} className="space-y-4 text-left">
                {uploadError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300">
                    {uploadError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300">Título de la Pista / Drill:</label>
                  <input
                    type="text"
                    required={modalMode === 'url'}
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ej: Waack Arm Drills 128 BPM"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300">Artista / Productor (opcional):</label>
                  <input
                    type="text"
                    value={newArtist}
                    onChange={(e) => setNewArtist(e.target.value)}
                    placeholder="Ej: Disco Symphony"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {modalMode === 'url' ? (
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold text-slate-300">URL (YouTube, Spotify, SoundCloud, Drive):</label>
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
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs font-mono font-bold text-slate-300">Selecciona Archivo de Audio:</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                          if (!newTitle) {
                            setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
                          }
                        }
                      }}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/20 hover:border-purple-500/50 rounded-2xl p-4 text-center cursor-pointer bg-white/5 hover:bg-white/10 transition-all space-y-2"
                    >
                      {selectedFile ? (
                        <div className="flex items-center justify-center gap-2 text-purple-300 text-xs font-bold">
                          <FileAudio className="w-5 h-5 text-purple-400" />
                          <span className="truncate max-w-[220px]">{selectedFile.name}</span>
                          <span className="text-[10px] text-slate-400">({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <UploadCloud className="w-7 h-7 text-purple-400 mx-auto" />
                          <p className="text-xs font-bold text-white">Haz clic para seleccionar tu audio</p>
                          <p className="text-[10px] text-slate-400">Archivos MP3, WAV, M4A u OGG</p>
                        </div>
                      )}
                    </div>

                    {isUploading && (
                      <div className="space-y-1 pt-2">
                        <div className="flex justify-between text-[11px] font-mono text-purple-300">
                          <span>Subiendo a Firebase Storage...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-200"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
                    disabled={isUploading}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 font-bold disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <span>Guardar en Mi Sesión</span>
                    )}
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
