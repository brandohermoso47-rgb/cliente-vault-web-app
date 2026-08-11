import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Music, 
  X, 
  ExternalLink, 
  Plus, 
  Check, 
  Sparkles, 
  RefreshCw, 
  Radio, 
  Lock, 
  Globe, 
  Volume2, 
  Play, 
  Search,
  LogIn
} from 'lucide-react';

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  tracksCount: number;
  imageUrl: string;
  externalUrl: string;
  embedUrl: string;
  owner?: string;
}

interface SpotifyPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlaylist?: (playlist: SpotifyPlaylist) => void;
  language?: 'es' | 'en';
}

export default function SpotifyPlaylistModal({
  isOpen,
  onClose,
  onSelectPlaylist,
  language = 'es'
}: SpotifyPlaylistModalProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [selectedPreview, setSelectedPreview] = useState<SpotifyPlaylist | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Check saved token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('waackon_spotify_token');
    if (savedToken) {
      setSpotifyToken(savedToken);
      setIsConnected(true);
      fetchUserPlaylists(savedToken);
    }
  }, []);

  // Listen for OAuth popup postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SPOTIFY_AUTH_SUCCESS' && event.data?.token) {
        const token = event.data.token;
        setSpotifyToken(token);
        setIsConnected(true);
        localStorage.setItem('waackon_spotify_token', token);
        showToast(language === 'es' ? '¡Cuenta de Spotify conectada con éxito!' : 'Spotify account connected!');
        fetchUserPlaylists(token);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [language]);

  // Connect to Spotify via OAuth popup
  const handleConnectSpotify = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/spotify/auth-url');
      const data = await res.json();
      
      if (data.url) {
        const authWindow = window.open(
          data.url,
          'spotify_oauth',
          'width=600,height=750,top=100,left=100'
        );

        if (!authWindow) {
          showToast(language === 'es' ? 'Por favor habilita las ventanas emergentes en tu navegador.' : 'Please enable popups.');
        }
      }
    } catch (err) {
      console.error('Error initiating Spotify auth:', err);
      showToast(language === 'es' ? 'Error al conectar con la API de Spotify.' : 'Spotify connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch playlists from API
  const fetchUserPlaylists = async (token: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/spotify/user-playlists', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.playlists) {
        setPlaylists(data.playlists);
        if (data.playlists.length > 0 && !selectedPreview) {
          setSelectedPreview(data.playlists[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching user playlists:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Import playlist manually by URL
  const handleImportManualUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/spotify/import-playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistUrl: manualUrl })
      });
      const data = await res.json();

      if (data.playlist) {
        setPlaylists(prev => [data.playlist, ...prev]);
        setSelectedPreview(data.playlist);
        setManualUrl('');
        showToast(language === 'es' ? '¡Playlist importada correctamente!' : 'Playlist imported!');
      }
    } catch (err) {
      showToast(language === 'es' ? 'URL de Spotify no válida' : 'Invalid Spotify URL');
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm adding playlist to profile / training
  const handleAddPlaylist = (playlist: SpotifyPlaylist) => {
    setImportedIds(prev => new Set(prev).add(playlist.id));
    if (onSelectPlaylist) {
      onSelectPlaylist(playlist);
    }
    showToast(language === 'es' ? `¡Playlist "${playlist.name}" añadida!` : `Added "${playlist.name}"!`);
  };

  const handleDisconnect = () => {
    localStorage.removeItem('waackon_spotify_token');
    setSpotifyToken(null);
    setIsConnected(false);
    showToast(language === 'es' ? 'Cuenta de Spotify desconectada.' : 'Spotify disconnected.');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
        
        {/* Toast */}
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#1DB954] text-black font-extrabold text-xs px-5 py-3 rounded-full shadow-[0_10px_30px_rgba(29,185,84,0.4)] flex items-center gap-2 border border-black/20"
          >
            <Sparkles className="w-4 h-4 text-black" />
            <span>{toastMessage}</span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#121218] border border-white/20 rounded-3xl w-full max-w-3xl p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#1DB954]/20 border border-[#1DB954]/40 text-[#1DB954]">
                <Music className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white font-mono uppercase tracking-wide flex items-center gap-2">
                  <span>Spotify Sync API</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#1DB954]/20 text-[#1DB954] text-[10px] border border-[#1DB954]/30">
                    Oficial
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {language === 'es' ? 'Importa tus playlists privadas directamente desde tu cuenta de Spotify' : 'Import your Spotify playlists directly to your account'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Connect Header Bar */}
          <div className="p-4 bg-gradient-to-r from-[#1DB954]/15 via-emerald-950/30 to-transparent border border-[#1DB954]/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#1DB954] animate-ping" />
              <div>
                <p className="text-xs font-mono font-bold text-white uppercase">
                  {isConnected 
                    ? (language === 'es' ? '🟢 Conectado con tu Cuenta de Spotify' : '🟢 Connected to Spotify Account')
                    : (language === 'es' ? '⚪ No conectado a Spotify' : '⚪ Not connected to Spotify')}
                </p>
                <p className="text-[10px] text-slate-400">
                  {isConnected 
                    ? (language === 'es' ? 'Sincronización activa con la API Web de Spotify' : 'Active sync with Spotify Web API')
                    : (language === 'es' ? 'Inicia sesión para cargar tus listas privadas e importarlas' : 'Login to load and import your private playlists')}
                </p>
              </div>
            </div>

            {isConnected ? (
              <button
                type="button"
                onClick={handleDisconnect}
                className="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-mono text-xs font-bold transition-all cursor-pointer shrink-0"
              >
                {language === 'es' ? 'Desconectar' : 'Disconnect'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConnectSpotify}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(29,185,84,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <LogIn className="w-4 h-4" />
                <span>{isLoading ? 'Conectando...' : (language === 'es' ? 'Conectar Spotify' : 'Connect Spotify')}</span>
              </button>
            )}
          </div>

          {/* Manual URL Import */}
          <form onSubmit={handleImportManualUrl} className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-slate-300 uppercase block">
              {language === 'es' ? 'O pega una URL/ID de Playlist de Spotify directamente:' : 'Or paste a Spotify Playlist URL/ID directly:'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="Ej. https://open.spotify.com/playlist/37i9dQZF1DX6XNisNdE8g6"
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#1DB954] font-mono"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 text-[#1DB954]" />
                <span>{language === 'es' ? 'Importar' : 'Import'}</span>
              </button>
            </div>
          </form>

          {/* Playlists Grid & Player Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Playlists List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#1DB954]" />
                  <span>{language === 'es' ? 'Playlists Disponibles' : 'Available Playlists'} ({playlists.length})</span>
                </h4>
                {isConnected && (
                  <button
                    type="button"
                    onClick={() => fetchUserPlaylists(spotifyToken || '')}
                    className="text-[10px] font-mono text-[#1DB954] hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{language === 'es' ? 'Refrescar' : 'Refresh'}</span>
                  </button>
                )}
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {playlists.map((pl) => {
                  const isAdded = importedIds.has(pl.id);
                  const isSelected = selectedPreview?.id === pl.id;

                  return (
                    <div
                      key={pl.id}
                      onClick={() => setSelectedPreview(pl)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                        isSelected 
                          ? 'bg-[#1DB954]/15 border-[#1DB954] shadow-lg' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <img
                        src={pl.imageUrl}
                        alt={pl.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-black"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate font-mono">{pl.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{pl.tracksCount} canciones • {pl.owner || 'Spotify'}</p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddPlaylist(pl);
                        }}
                        className={`p-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer shrink-0 ${
                          isAdded
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-[#1DB954] hover:bg-[#1ed760] text-black shadow-md'
                        }`}
                        title={language === 'es' ? 'Añadir a mi perfil y entrenamiento' : 'Add to my training'}
                      >
                        {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Embedded Web Player Preview */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{language === 'es' ? 'Previsualización del Reproductor' : 'Player Preview'}</span>
              </h4>

              {selectedPreview ? (
                <div className="bg-black border border-white/15 rounded-2xl p-2 space-y-3 shadow-xl">
                  <iframe
                    src={selectedPreview.embedUrl}
                    width="100%"
                    height="230"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="rounded-xl"
                  />
                  <div className="p-2 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 truncate max-w-[180px] font-bold">{selectedPreview.name}</span>
                    <a
                      href={selectedPreview.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1DB954] hover:underline flex items-center gap-1 font-bold text-[10px]"
                    >
                      <span>{language === 'es' ? 'Abrir en Spotify' : 'Open in Spotify'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="h-64 rounded-2xl border border-white/10 bg-white/5 flex flex-col items-center justify-center p-6 text-center text-slate-400 font-mono text-xs space-y-2">
                  <Music className="w-8 h-8 text-slate-500" />
                  <p>{language === 'es' ? 'Selecciona una playlist para previsualizar el reproductor' : 'Select a playlist to preview player'}</p>
                </div>
              )}
            </div>

          </div>

          {/* Footer Action */}
          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              {language === 'es' ? 'Listo' : 'Done'}
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
