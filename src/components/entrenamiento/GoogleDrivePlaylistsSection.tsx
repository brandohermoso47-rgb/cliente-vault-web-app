import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HardDrive, 
  Music, 
  Play, 
  Pause, 
  Volume2, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Sparkles, 
  FileAudio, 
  Users, 
  CheckCircle2, 
  Share2, 
  Eye, 
  EyeOff, 
  Clock, 
  Tag, 
  RefreshCw,
  Search
} from 'lucide-react';
import { User } from '../../types';
import { Language } from '../../lib/translations';
import { db, sanitizeFirestoreData } from '../../lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import GoogleDriveMusicPickerModal, { ImportedDriveTrack } from '../GoogleDriveMusicPickerModal';

interface GoogleDrivePlaylistsSectionProps {
  currentUser: User;
  language?: Language;
  onLogPractice?: (minutes: number, activityType: 'playlist', description: string) => void;
}

export const GoogleDrivePlaylistsSection: React.FC<GoogleDrivePlaylistsSectionProps> = ({
  currentUser,
  language = 'es',
  onLogPractice
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [tracks, setTracks] = useState<ImportedDriveTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Currently playing track
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isInstructor = currentUser.role === 'instructor' || currentUser.email === 'brandohermoso47@gmail.com';

  // Real-time listener for Drive tracks in Firestore
  useEffect(() => {
    const tracksRef = collection(db, 'instructor_drive_tracks');
    const unsub = onSnapshot(tracksRef, (snapshot) => {
      const items: ImportedDriveTrack[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as ImportedDriveTrack);
      });

      // Default curated demo tracks if empty
      if (items.length === 0) {
        const defaultTracks: ImportedDriveTrack[] = [
          {
            id: 'demo-drive-1',
            driveFileId: 'demo-file-128',
            title: 'WaackOn Drive Funk - Wrist Rolls 128 BPM',
            artist: 'Prof. Brando Hermoso (Google Drive)',
            bpm: 128,
            durationSeconds: 210,
            audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
            webViewLink: 'https://drive.google.com',
            category: 'Wrist Rolls & Drops',
            targetClass: 'Técnica e Impulsos',
            notesForStudents: 'Sintoniza los acentos en los tiempos 2 y 4 para marcar los giros de muñeca.',
            isSharedWithStudents: true,
            importedAt: new Date().toISOString().slice(0, 10),
            fileSize: '5.2 MB'
          },
          {
            id: 'demo-drive-2',
            driveFileId: 'demo-file-132',
            title: 'Aceleración Overheads & Posing (132 BPM)',
            artist: 'Google Drive Studio Cloud',
            bpm: 132,
            durationSeconds: 195,
            audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c3e86c0d.mp3',
            webViewLink: 'https://drive.google.com',
            category: 'Aceleración & Posing',
            targetClass: 'Velocidad y Expresión',
            notesForStudents: 'Especial para drills de brazos sobre la cabeza y poses congeladas.',
            isSharedWithStudents: true,
            importedAt: new Date().toISOString().slice(0, 10),
            fileSize: '4.6 MB'
          }
        ];
        setTracks(defaultTracks);
      } else {
        setTracks(items);
      }
      setLoading(false);
    }, (error) => {
      console.warn('Firestore Drive tracks listener warning:', error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleImportTrack = async (newTrack: ImportedDriveTrack) => {
    try {
      // Save to Firestore
      const docRef = doc(db, 'instructor_drive_tracks', newTrack.id);
      await setDoc(docRef, sanitizeFirestoreData(newTrack));
      setTracks((prev) => [newTrack, ...prev.filter((t) => t.id !== newTrack.id)]);
    } catch (err) {
      console.error('Error saving imported track to Firestore:', err);
      // Fallback local memory update
      setTracks((prev) => [newTrack, ...prev]);
    }
  };

  const handleDeleteTrack = async (trackId: string, trackTitle: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la pista "${trackTitle}" de las Listas en la Nube?`)) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'instructor_drive_tracks', trackId));
      setTracks((prev) => prev.filter((t) => t.id !== trackId));
      if (playingTrackId === trackId) {
        handlePause();
        setPlayingTrackId(null);
      }
    } catch (err) {
      console.error('Error deleting track from Firestore:', err);
      setTracks((prev) => prev.filter((t) => t.id !== trackId));
    }
  };

  const handleToggleShare = async (track: ImportedDriveTrack) => {
    const updated = { ...track, isSharedWithStudents: !track.isSharedWithStudents };
    try {
      await setDoc(doc(db, 'instructor_drive_tracks', track.id), sanitizeFirestoreData(updated), { merge: true });
      setTracks((prev) => prev.map((t) => (t.id === track.id ? updated : t)));
    } catch (err) {
      console.error('Error toggling share state:', err);
    }
  };

  // Audio Playback logic
  const handlePlayTrack = (track: ImportedDriveTrack) => {
    if (playingTrackId === track.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      setPlayingTrackId(track.id);
      setIsPlaying(true);
      setCurrentTime(0);

      if (audioRef.current) {
        audioRef.current.src = track.audioUrl;
        audioRef.current.play().catch((err) => {
          console.warn('Audio play error, fallback handling:', err);
        });
      }

      if (onLogPractice) {
        onLogPractice(3, 'playlist', `Práctica con pista de Google Drive: ${track.title}`);
      }
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  // Filtered tracks
  const visibleTracks = tracks.filter((t) => {
    // If not instructor, only show shared tracks
    if (!isInstructor && !t.isSharedWithStudents) return false;

    // Search query
    const queryMatch = 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.notesForStudents || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!queryMatch) return false;

    // Category filter
    if (activeCategory !== 'all' && t.category !== activeCategory) return false;

    return true;
  });

  const categories = Array.from(new Set(tracks.map((t) => t.category)));

  return (
    <div className="space-y-6 w-full text-white font-sans">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 0);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
      />

      {/* Google Picker Modal */}
      <GoogleDriveMusicPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onImportTrack={handleImportTrack}
      />

      {/* Main Banner Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#12182e] via-[#1a2347] to-[#0c0e1a] border border-[#4285F4]/40 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#4285F4]/10 blur-3xl rounded-full pointer-events-none" />

        <div className="space-y-2 max-w-xl relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#4285F4]/20 border border-[#4285F4]/40 text-[#4285F4] text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" />
              <span>Google Drive API Sync</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-[#E9C349]/20 border border-[#E9C349]/40 text-[#E9C349] text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Google Picker Integrado</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <span>Mis Listas de Reproducción en la Nube</span>
          </h2>

          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            {isInstructor
              ? 'Importa directamente tus archivos de música MP3/Audio desde tu Google Drive mediante Google Picker y compártelos al instante con tus alumnos para sus entrenamientos de Waacking.'
              : 'Pistas oficiales en la nube subidas por tu profesor desde su Google Drive. Entrena tus wrist rolls y aceleración con audio de alta fidelidad.'}
          </p>
        </div>

        {/* Action button for Instructor */}
        {isInstructor && (
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="px-6 py-3.5 rounded-2xl bg-[#4285F4] hover:bg-[#3367d6] text-white font-mono font-black text-xs uppercase tracking-wider shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer shrink-0 relative z-10"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Importar de Google Drive</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-black/40 border border-white/10 p-3 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar pistas en la nube (título, categoría, notas)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0e1224] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#4285F4] font-mono"
          />
        </div>

        {categories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold uppercase transition-all shrink-0 ${
                activeCategory === 'all'
                  ? 'bg-[#4285F4] text-white'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              Todas ({tracks.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold uppercase transition-all shrink-0 ${
                  activeCategory === cat
                    ? 'bg-[#4285F4] text-white'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tracks List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 bg-black/30 rounded-3xl border border-white/10">
            <RefreshCw className="w-8 h-8 text-[#4285F4] animate-spin mx-auto mb-3" />
            <p className="text-xs font-mono text-slate-400">Sincronizando pistas de la nube...</p>
          </div>
        ) : visibleTracks.length === 0 ? (
          <div className="text-center py-12 bg-black/30 rounded-3xl border border-dashed border-white/10 space-y-3 p-6">
            <FileAudio className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-300">No hay pistas en la nube para esta selección</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto font-mono">
                {isInstructor
                  ? 'Haz clic en "Importar de Google Drive" para agregar tu primer archivo MP3 mediante Google Picker.'
                  : 'Tu profesor agregará pronto pistas de audio desde su Google Drive para entrenar.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {visibleTracks.map((track) => {
              const isSelected = playingTrackId === track.id;
              const isCurrentlyPlaying = isSelected && isPlaying;

              return (
                <div
                  key={track.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#141d3d] via-[#101833] to-[#0c0e1a] border-[#4285F4] shadow-xl'
                      : 'bg-[#101322] border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Top Track Row */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Play Button */}
                      <button
                        type="button"
                        onClick={() => handlePlayTrack(track)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-all cursor-pointer ${
                          isCurrentlyPlaying
                            ? 'bg-[#9A2B3C] text-white border border-[#ffb3b2] scale-105'
                            : 'bg-[#4285F4] hover:bg-[#3367d6] text-white'
                        }`}
                      >
                        {isCurrentlyPlaying ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white uppercase tracking-tight truncate">
                            {track.title}
                          </h4>
                          <span className="px-2 py-0.5 rounded-lg bg-[#E9C349]/20 border border-[#E9C349]/40 text-[#E9C349] font-mono font-bold text-[10px]">
                            {track.bpm} BPM
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-white/10 text-slate-300 font-mono text-[10px]">
                            {track.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          {track.artist} {track.fileSize ? `• ${track.fileSize}` : ''} • Importado {track.importedAt}
                        </p>
                      </div>
                    </div>

                    {/* Instructor Actions & Drive Link */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {track.webViewLink && (
                        <a
                          href={track.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-[11px] flex items-center gap-1.5 transition-all"
                          title="Abrir en Google Drive"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-[#4285F4]" />
                          <span className="hidden sm:inline">Google Drive</span>
                        </a>
                      )}

                      {isInstructor && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleToggleShare(track)}
                            className={`px-3 py-1.5 rounded-xl font-mono text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
                              track.isSharedWithStudents
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                            title={track.isSharedWithStudents ? 'Compartido con alumnos' : 'Privado (Solo Instructor)'}
                          >
                            {track.isSharedWithStudents ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            <span>{track.isSharedWithStudents ? 'Compartido' : 'Privado'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteTrack(track.id, track.title)}
                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all cursor-pointer"
                            title="Eliminar de la nube"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Audio Progress bar when selected */}
                  {isSelected && (
                    <div className="space-y-1.5 pt-2 border-t border-white/10">
                      <div
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const clickPos = (e.clientX - rect.left) / rect.width;
                          if (audioRef.current && duration) {
                            audioRef.current.currentTime = clickPos * duration;
                          }
                        }}
                        className="w-full bg-black/60 border border-white/10 h-2.5 rounded-full overflow-hidden cursor-pointer relative"
                      >
                        <div
                          className="bg-[#4285F4] h-full transition-all duration-200"
                          style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>{Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}</span>
                        <span className="text-[#E9C349]">Reproduciendo pista de Google Drive</span>
                        <span>{Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}</span>
                      </div>
                    </div>
                  )}

                  {/* Notes for students */}
                  {track.notesForStudents && (
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 font-sans flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#E9C349] shrink-0 mt-0.5" />
                      <p>
                        <strong className="text-[#E9C349] font-mono">Nota del Profesor:</strong> {track.notesForStudents}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleDrivePlaylistsSection;
