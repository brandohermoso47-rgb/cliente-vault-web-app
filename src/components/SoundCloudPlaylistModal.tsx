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
  Volume2, 
  Search,
  LogIn,
  Flame,
  Globe
} from 'lucide-react';

export interface SoundCloudTrackOrPlaylist {
  id: string;
  name: string;
  description: string;
  tracksCount: number;
  imageUrl: string;
  externalUrl: string;
  embedUrl: string;
  artistName?: string;
}

interface SoundCloudPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlaylist?: (playlist: SoundCloudTrackOrPlaylist) => void;
  language?: 'es' | 'en';
}

export default function SoundCloudPlaylistModal({
  isOpen,
  onClose,
  onSelectPlaylist,
  language = 'es'
}: SoundCloudPlaylistModalProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [soundcloudToken, setSoundcloudToken] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<SoundCloudTrackOrPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SoundCloudTrackOrPlaylist[]>([]);
  const [selectedPreview, setSelectedPreview] = useState<SoundCloudTrackOrPlaylist | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Check saved token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('waackon_soundcloud_token');
    if (savedToken) {
      setSoundcloudToken(savedToken);
      setIsConnected(true);
      fetchUserPlaylists(savedToken);
    } else {
      fetchUserPlaylists('');
    }
  }, []);

  // Listen for OAuth popup postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SOUNDCLOUD_AUTH_SUCCESS' && event.data?.token) {
        const token = event.data.token;
        setSoundcloudToken(token);
        setIsConnected(true);
        localStorage.setItem('waackon_soundcloud_token', token);
        showToast(language === 'es' ? '¡Cuenta de SoundCloud conectada con éxito!' : 'SoundCloud account connected!');
        fetchUserPlaylists(token);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [language]);

  // Connect to SoundCloud via OAuth popup
  const handleConnectSoundCloud = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/soundcloud/auth-url');
      const data = await res.json();
      
      if (data.url) {
        const authWindow = window.open(
          data.url,
          'soundcloud_oauth',
          'width=600,height=750,top=100,left=100'
        );

        if (!authWindow) {
          showToast(language === 'es' ? 'Por favor habilita las ventanas emergentes en tu navegador.' : 'Please enable popups.');
        }
      }
    } catch (err) {
      console.error('Error initiating SoundCloud auth:', err);
      showToast(language === 'es' ? 'Error al conectar con la API de SoundCloud.' : 'SoundCloud connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch playlists from API
  const fetchUserPlaylists = async (token: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/soundcloud/user-playlists', {
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
      console.error('Error fetching SoundCloud playlists:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Search SoundCloud API
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/soundcloud/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.results) {
        setSearchResults(data.results);
        if (data.results.length > 0) {
          setSelectedPreview(data.results[0]);
        }
      }
    } catch (err) {
      showToast(language === 'es' ? 'Error en la búsqueda de SoundCloud' : 'Search error');
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
      const res = await fetch('/api/soundcloud/import-playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistUrl: manualUrl })
      });
      const data = await res.json();

      if (data.playlist) {
        setPlaylists(prev => [data.playlist, ...prev]);
        setSelectedPreview(data.playlist);
        setManualUrl('');
        showToast(language === 'es' ? '¡Pista / Playlist importada!' : 'Track / Playlist imported!');
      }
    } catch (err) {
      showToast(language === 'es' ? 'URL de SoundCloud no válida' : 'Invalid SoundCloud URL');
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm adding playlist to profile / training
  const handleAddPlaylist = (playlist: SoundCloudTrackOrPlaylist) => {
    setImportedIds(prev => new Set(prev).add(playlist.id));
    if (onSelectPlaylist) {
      onSelectPlaylist(playlist);
    }
    showToast(language === 'es' ? `¡Playlist "${playlist.name}" cargada!` : `Loaded "${playlist.name}"!`);
  };

  const handleDisconnect = () => {
    localStorage.removeItem('waackon_soundcloud_token');
    setSoundcloudToken(null);
    setIsConnected(false);
    showToast(language === 'es' ? 'Cuenta de SoundCloud desconectada.' : 'SoundCloud disconnected.');
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
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#FF5500] text-white font-extrabold text-xs px-5 py-3 rounded-full shadow-[0_10px_30px_rgba(255,85,0,0.4)] flex items-center gap-2 border border-black/20"
          >
            <Sparkles className="w-4 h-4 text-white" />
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
              <div className="p-3 rounded-2xl bg-[#FF5500]/20 border border-[#FF5500]/40 text-[#FF5500]">
                <Music className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white font-mono uppercase tracking-wide flex items-center gap-2">
                  <span>SoundCloud Sync API</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#FF5500]/20 text-[#FF5500] text-[10px] border border-[#FF5500]/30 font-bold">
                    SDK Directo
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {language === 'es' ? 'Busca y conecta pistas o playlists de SoundCloud directamente en tus entrenamientos' : 'Search and connect SoundCloud tracks and playlists directly for training'}
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
          <div className="p-4 bg-gradient-to-r from-[#FF5500]/20 via-orange-950/30 to-transparent border border-[#FF5500]/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#FF5500] animate-ping" />
              <div>
                <p className="text-xs font-mono font-bold text-white uppercase">
                  {isConnected 
                    ? (language === 'es' ? '🟠 Conectado con tu Cuenta de SoundCloud' : '🟠 Connected to SoundCloud Account')
                    : (language === 'es' ? '⚪ Conexión SoundCloud Lista' : '⚪ SoundCloud Integration Ready')}
                </p>
                <p className="text-[10px] text-slate-400">
                  {isConnected 
                    ? (language === 'es' ? 'Sincronización directa con tu biblioteca de SoundCloud' : 'Active sync with SoundCloud API')
                    : (language === 'es' ? 'Inicia sesión para buscar de inmediato tus canciones o playlists de baile' : 'Log in or search tracks to load in training')}
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
                onClick={handleConnectSoundCloud}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#ff6a1a] text-white font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,85,0,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <LogIn className="w-4 h-4" />
                <span>{isLoading ? 'Conectando...' : (language === 'es' ? 'Conectar SoundCloud' : 'Connect SoundCloud')}</span>
              </button>
            )}
          </div>

          {/* Search bar & URL input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Search form */}
            <form onSubmit={handleSearch} className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-300 uppercase block">
                {language === 'es' ? '🔍 Buscar pistas en SoundCloud:' : '🔍 Search SoundCloud:'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ej. Waacking Disco Funk 128 BPM..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#FF5500] font-mono"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-3 py-2 rounded-xl bg-[#FF5500] hover:bg-[#ff6a1a] text-white font-mono font-bold text-xs uppercase flex items-center gap-1 transition-all cursor-pointer shrink-0"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Manual URL form */}
            <form onSubmit={handleImportManualUrl} className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-300 uppercase block">
                {language === 'es' ? '🔗 O pega URL de SoundCloud:' : '🔗 Or paste SoundCloud URL:'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="https://soundcloud.com/..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#FF5500] font-mono"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono font-bold text-xs uppercase flex items-center gap-1 transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 text-[#FF5500]" />
                  <span>{language === 'es' ? 'Cargar' : 'Load'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Search Results if active */}
          {searchResults.length > 0 && (
            <div className="space-y-2 border-t border-white/10 pt-3">
              <h4 className="text-xs font-mono font-black text-[#FF5500] uppercase tracking-widest flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                <span>{language === 'es' ? 'Resultados de Búsqueda' : 'Search Results'} ({searchResults.length})</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {searchResults.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => setSelectedPreview(res)}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer flex items-center gap-2.5"
                  >
                    <img src={res.imageUrl} alt={res.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate font-mono">{res.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{res.artistName || 'SoundCloud'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddPlaylist(res);
                      }}
                      className="p-1.5 rounded-lg bg-[#FF5500] text-white font-mono text-xs font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Playlists Grid & Player Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Playlists List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#FF5500]" />
                  <span>{language === 'es' ? 'Playlists Disponibles' : 'Available Playlists'} ({playlists.length})</span>
                </h4>
                {isConnected && (
                  <button
                    type="button"
                    onClick={() => fetchUserPlaylists(soundcloudToken || '')}
                    className="text-[10px] font-mono text-[#FF5500] hover:underline flex items-center gap-1"
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
                          ? 'bg-[#FF5500]/15 border-[#FF5500] shadow-lg' 
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
                        <p className="text-[10px] text-slate-400 truncate">{pl.tracksCount} pistas • {pl.artistName || 'SoundCloud'}</p>
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
                            : 'bg-[#FF5500] hover:bg-[#ff6a1a] text-white shadow-md'
                        }`}
                        title={language === 'es' ? 'Cargar en entrenamiento' : 'Load into training'}
                      >
                        {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Embedded SoundCloud Player Preview */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-orange-400" />
                <span>{language === 'es' ? 'Reproductor SoundCloud' : 'SoundCloud Player'}</span>
              </h4>

              {selectedPreview ? (
                <div className="bg-black border border-white/15 rounded-2xl p-2 space-y-3 shadow-xl">
                  <iframe
                    src={selectedPreview.embedUrl}
                    width="100%"
                    height="230"
                    frameBorder="0"
                    scrolling="no"
                    allow="autoplay"
                    loading="lazy"
                    className="rounded-xl"
                  />
                  <div className="p-2 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 truncate max-w-[180px] font-bold">{selectedPreview.name}</span>
                    <a
                      href={selectedPreview.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FF5500] hover:underline flex items-center gap-1 font-bold text-[10px]"
                    >
                      <span>{language === 'es' ? 'Ver en SoundCloud' : 'Open in SoundCloud'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="h-64 rounded-2xl border border-white/10 bg-white/5 flex flex-col items-center justify-center p-6 text-center text-slate-400 font-mono text-xs space-y-2">
                  <Music className="w-8 h-8 text-[#FF5500]" />
                  <p>{language === 'es' ? 'Selecciona una playlist para escucharla en el reproductor' : 'Select a playlist to listen on player'}</p>
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
