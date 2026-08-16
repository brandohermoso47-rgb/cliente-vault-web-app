import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HardDrive, 
  Search, 
  Music, 
  Check, 
  X, 
  LogIn, 
  RefreshCw, 
  UploadCloud, 
  ExternalLink, 
  Sparkles, 
  FileAudio, 
  Zap, 
  PlusCircle, 
  Users
} from 'lucide-react';
import { 
  signInForGooglePicker, 
  fetchAudioDriveFiles, 
  fetchDriveFiles, 
  getPickerAccessToken, 
  DrivePickedFile 
} from '../googlePicker';

export interface ImportedDriveTrack {
  id: string;
  driveFileId: string;
  title: string;
  artist: string;
  bpm: number;
  durationSeconds: number;
  audioUrl: string;
  webViewLink?: string;
  category: string;
  targetClass: string;
  notesForStudents?: string;
  isSharedWithStudents: boolean;
  importedAt: string;
  fileSize?: string;
}

interface GoogleDriveMusicPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportTrack: (track: ImportedDriveTrack) => void;
  targetPlaylistTitle?: string;
}

export const GoogleDriveMusicPickerModal: React.FC<GoogleDriveMusicPickerModalProps> = ({
  isOpen,
  onClose,
  onImportTrack,
  targetPlaylistTitle = 'Lista Principal de Clases'
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!getPickerAccessToken());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [driveFiles, setDriveFiles] = useState<DrivePickedFile[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<DrivePickedFile | null>(null);

  // Import Options Form State
  const [trackBpm, setTrackBpm] = useState<number>(128);
  const [trackArtist, setTrackArtist] = useState<string>('Música de Google Drive');
  const [trackCategory, setTrackCategory] = useState<string>('Wrist Rolls & Drops');
  const [trackTargetClass, setTrackTargetClass] = useState<string>('Clases Generales');
  const [trackNotes, setTrackNotes] = useState<string>('');
  const [isShared, setIsShared] = useState<boolean>(true);

  // Auto load files if authenticated on open
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadFiles();
    }
  }, [isOpen, isAuthenticated]);

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setErrorMessage(null);
    try {
      await signInForGooglePicker();
      setIsAuthenticated(true);
      await loadFiles();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'No se pudo autenticar con Google Drive');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const loadFiles = async (query: string = searchQuery) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetchAudioDriveFiles(query);
      if (res.error === 'AUTH_REQUIRED') {
        setIsAuthenticated(false);
      } else if (res.error) {
        setErrorMessage(res.error);
      } else {
        const files = Array.isArray(res.files) ? res.files : [];
        setDriveFiles(files);
        if (files.length === 0 && !query) {
          // Fallback search general files if no strict audio mimeType matches
          const fallback = await fetchDriveFiles(query);
          setDriveFiles(Array.isArray(fallback.files) ? fallback.files : []);
        }
      }
    } catch (err: any) {
      setErrorMessage('Error al conectar con la API de Google Drive.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      loadFiles(searchQuery);
    }
  };

  const handleSelectDriveFile = (file: DrivePickedFile) => {
    setSelectedFile(file);
    // Suggest title from file name without extension
    const cleanTitle = file.name.replace(/\.[^/.]+$/, "");
    // Attempt to extract BPM if in filename (e.g., "128_BPM_Disco")
    const bpmMatch = file.name.match(/(\d{2,3})\s*bpm/i);
    if (bpmMatch && bpmMatch[1]) {
      setTrackBpm(Number(bpmMatch[1]));
    }
  };

  const handleConfirmImport = () => {
    if (!selectedFile) return;

    // Direct webContentLink or audio stream URL
    const streamUrl = selectedFile.webViewLink 
      ? `https://drive.google.com/uc?export=download&id=${selectedFile.id}` 
      : 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3';

    const cleanTitle = selectedFile.name.replace(/\.[^/.]+$/, "");

    const imported: ImportedDriveTrack = {
      id: `drive-tr-${Date.now()}-${selectedFile.id}`,
      driveFileId: selectedFile.id,
      title: cleanTitle,
      artist: trackArtist || 'Instructor Google Drive',
      bpm: Number(trackBpm) || 128,
      durationSeconds: 180,
      audioUrl: streamUrl,
      webViewLink: selectedFile.webViewLink,
      category: trackCategory,
      targetClass: trackTargetClass,
      notesForStudents: trackNotes,
      isSharedWithStudents: isShared,
      importedAt: new Date().toISOString().slice(0, 10),
      fileSize: selectedFile.size ? `${(Number(selectedFile.size) / (1024 * 1024)).toFixed(1)} MB` : 'Google Drive Audio'
    };

    onImportTrack(imported);
    onClose();
    setSelectedFile(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-[#0b0e1a] border border-[#E9C349]/40 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl relative text-white font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4285F4]/20 border border-[#4285F4] flex items-center justify-center text-[#4285F4] shadow-lg">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-mono font-black text-white uppercase flex items-center gap-2">
                <span>Google Drive Picker - Importar Música</span>
                <Sparkles className="w-4 h-4 text-[#E9C349]" />
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Importa pistas MP3/Audio directamente desde tu Google Drive para tus alumnos.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Authentication State Box */}
        {!isAuthenticated ? (
          <div className="p-8 text-center bg-gradient-to-br from-[#12162b] to-[#1a1f3c] border border-[#4285F4]/30 rounded-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#4285F4]/10 border border-[#4285F4]/40 flex items-center justify-center mx-auto text-[#4285F4]">
              <HardDrive className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">Conecta tu Cuenta de Google Drive</h4>
              <p className="text-xs text-slate-300 font-sans max-w-md mx-auto">
                Accede a tus carpetas y archivos de música almacenados en Google Drive para agregarlos a la lista de clase con un solo clic.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSignIn}
              disabled={isAuthenticating}
              className="px-6 py-3.5 rounded-2xl bg-[#4285F4] hover:bg-[#3367d6] text-white font-mono font-black text-xs uppercase tracking-wider shadow-xl transition-all cursor-pointer inline-flex items-center gap-2 active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>{isAuthenticating ? 'Abriendo Google Picker...' : 'Conectar Google Drive Picker'}</span>
            </button>

            {errorMessage && (
              <p className="text-xs font-mono text-red-400 pt-2">{errorMessage}</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search Bar & Refresh */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar archivos de música en Google Drive (ej. 128_bpm, Waacking...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#12162b] border border-white/20 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#4285F4] font-mono"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#4285F4] hover:bg-[#3367d6] text-white font-mono font-bold text-xs uppercase transition-all cursor-pointer"
              >
                Buscar
              </button>

              <button
                type="button"
                onClick={() => loadFiles()}
                disabled={isLoading}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-all cursor-pointer"
                title="Recargar archivos"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#4285F4]' : ''}`} />
              </button>
            </form>

            {/* Drive Files Grid / List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-1">
                <span>Archivos encontrados en tu Drive ({driveFiles.length})</span>
                <span className="text-[#4285F4]">Selecciona un archivo audio</span>
              </div>

              {isLoading ? (
                <div className="text-center py-8 bg-white/5 rounded-2xl">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#4285F4] mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-mono">Cargando tus archivos desde Google Drive...</p>
                </div>
              ) : driveFiles.length === 0 ? (
                <div className="text-center py-8 bg-white/5 border border-dashed border-white/10 rounded-2xl space-y-2">
                  <FileAudio className="w-6 h-6 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400 font-sans">
                    No se encontraron archivos audio con esa búsqueda en tu Drive.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {driveFiles.map((file) => {
                    const isSelected = selectedFile?.id === file.id;
                    return (
                      <div
                        key={file.id}
                        onClick={() => handleSelectDriveFile(file)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#182348] border-[#4285F4] text-white shadow-md'
                            : 'bg-[#121528] border-white/10 hover:border-white/20 hover:bg-[#161a33]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#4285F4] text-white' : 'bg-white/10 text-slate-300'}`}>
                            <FileAudio className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-white truncate">{file.name}</h5>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {file.mimeType} • {file.size ? `${(Number(file.size) / (1024 * 1024)).toFixed(1)} MB` : 'Google Drive'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                              title="Ver en Google Drive"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-[#4285F4] border-[#4285F4] text-white' : 'border-slate-600'}`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Configure Selected File Parameters */}
            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-[#14182e] border border-[#E9C349]/30 rounded-2xl space-y-3"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-mono font-bold text-[#E9C349] uppercase flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4" />
                    <span>Configurar Pista Importada: {selectedFile.name}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Tempo / BPM Rítmico *</label>
                    <input
                      type="number"
                      value={trackBpm}
                      onChange={(e) => setTrackBpm(Number(e.target.value))}
                      className="w-full bg-[#0c0e1a] border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#E9C349]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Artista / Músico</label>
                    <input
                      type="text"
                      value={trackArtist}
                      onChange={(e) => setTrackArtist(e.target.value)}
                      className="w-full bg-[#0c0e1a] border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#E9C349]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Categoría de Ejercicio</label>
                    <select
                      value={trackCategory}
                      onChange={(e) => setTrackCategory(e.target.value)}
                      className="w-full bg-[#0c0e1a] border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#E9C349]"
                    >
                      <option value="Wrist Rolls & Drops">Wrist Rolls & Drops</option>
                      <option value="Groove & Grounding">Groove & Grounding</option>
                      <option value="Aceleración & Posing">Aceleración & Posing</option>
                      <option value="Vocales & Expresión">Vocales & Expresión</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Clase Destino</label>
                    <input
                      type="text"
                      value={trackTargetClass}
                      onChange={(e) => setTrackTargetClass(e.target.value)}
                      className="w-full bg-[#0c0e1a] border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#E9C349]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Nota Pedagógica para Alumnos</label>
                  <input
                    type="text"
                    placeholder="Instrucciones rítmicas de la pista..."
                    value={trackNotes}
                    onChange={(e) => setTrackNotes(e.target.value)}
                    className="w-full bg-[#0c0e1a] border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#E9C349]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="shareDriveCheck"
                    checked={isShared}
                    onChange={(e) => setIsShared(e.target.checked)}
                    className="w-4 h-4 accent-[#E9C349] cursor-pointer"
                  />
                  <label htmlFor="shareDriveCheck" className="text-xs text-slate-200 cursor-pointer">
                    Compartir inmediatamente con mis alumnos en la nube
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#E9C349] to-amber-500 hover:brightness-110 text-black font-mono font-black text-xs uppercase shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <UploadCloud className="w-4 h-4 fill-black" />
                  <span>IMPORTAR A MIS LISTAS EN LA NUBE</span>
                </button>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default GoogleDriveMusicPickerModal;
