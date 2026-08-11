import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { HardDrive, Search, File, Video, Music, Check, X, AlertCircle, ExternalLink } from 'lucide-react';
import { signInForGooglePicker, fetchDriveFiles, getPickerAccessToken, DrivePickedFile } from '../googlePicker';

interface GooglePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFile: (file: DrivePickedFile) => void;
}

export const GooglePickerModal: React.FC<GooglePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectFile
}) => {
  const [token, setToken] = useState<string | null>(getPickerAccessToken());
  const [files, setFiles] = useState<DrivePickedFile[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const newToken = await signInForGooglePicker();
      setToken(newToken);
      await loadDriveFiles(newToken, searchQuery);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con Google Drive Picker.');
    } finally {
      setLoading(false);
    }
  };

  const loadDriveFiles = async (authToken?: string, query: string = '') => {
    setLoading(true);
    setErrorMsg(null);
    const result = await fetchDriveFiles(query, authToken || token || undefined);
    if (result.error === 'AUTH_REQUIRED') {
      setToken(null);
    } else if (result.error) {
      setErrorMsg(result.error);
    } else {
      setFiles(result.files);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && token) {
      loadDriveFiles(token, searchQuery);
    }
  }, [isOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token) loadDriveFiles(token, searchQuery);
  };

  const handleChoose = (file: DrivePickedFile) => {
    onSelectFile(file);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0F0B1E] border border-white/20 rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-white relative shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                Google Drive Picker
              </h3>
              <p className="text-xs text-slate-400">
                Selecciona videos de práctica, música o documentos directamente de tu Drive.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Required State */}
        {!token ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <HardDrive className="w-8 h-8" />
            </div>

            <div className="max-w-md space-y-2">
              <h4 className="text-base font-bold text-white uppercase">
                Conectar con Google Drive
              </h4>
              <p className="text-xs text-slate-300">
                Selecciona archivos multimedia almacenados en tu Google Drive para adjuntarlos a tus publicaciones o entrenamientos en Waack On.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Official Material Sign In with Google Button */}
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="bg-white hover:bg-slate-100 text-slate-900 font-bold px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>{loading ? 'Conectando...' : 'Abrir Google Picker'}</span>
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 pt-4 space-y-4">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar en Google Drive (ej: 'drill waacking', 'disco music')..."
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E9C349]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-xs font-bold rounded-2xl text-white transition-all disabled:opacity-50"
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </form>

            {errorMsg && (
              <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* File List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {loading && files.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
                  Buscando archivos en Google Drive...
                </div>
              ) : files.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No se encontraron archivos en tu Google Drive. Prueba ajustando el término de búsqueda.
                </div>
              ) : (
                (files || []).map((file) => {
                  const isVideo = file.mimeType.includes('video');
                  const isAudio = file.mimeType.includes('audio');

                  return (
                    <div
                      key={file.id}
                      className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-slate-300">
                          {isVideo ? (
                            <Video className="w-5 h-5 text-purple-400" />
                          ) : isAudio ? (
                            <Music className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <File className="w-5 h-5 text-blue-400" />
                          )}
                        </div>

                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-white truncate">{file.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">{file.mimeType}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                            title="Ver en Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          onClick={() => handleChoose(file)}
                          className="px-3 py-1.5 rounded-xl bg-[#E9C349] text-black font-extrabold text-[11px] uppercase shadow-md hover:bg-yellow-300 transition-all flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Seleccionar
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
