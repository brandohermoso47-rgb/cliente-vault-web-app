import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Music,
  X,
  ExternalLink,
  Plus,
  Check,
  Sparkles,
  RefreshCw,
  Play,
  Search,
  LogIn,
  Maximize2,
  Minimize2,
  Volume2,
  ListMusic,
  Radio,
  Sliders,
  Flame,
  Gauge,
  Copy,
  ChevronDown,
  ChevronUp,
  Disc,
  Headphones,
  Link2
} from 'lucide-react';
import {
  hasStoredSpotifyToken,
  getValidSpotifyAccessToken,
  storeSpotifyTokens,
  clearSpotifyTokens
} from '../lib/spotifyAuth';

export interface SpotifyTrackOrPlaylist {
  id: string;
  title: string;
  category: 'disco' | 'funk' | 'soul' | 'battle' | 'posing' | 'cyber';
  bpmRange: string;
  avgBpm: number;
  description: string;
  coverUrl: string;
  embedUrl: string;
  type: 'playlist' | 'track' | 'album';
  tracksCount?: number;
}

// Curated Waack On Spotify Playlists & Tracks for Dancers
export const CURATED_WAACK_ON_SPOTIFY_MUSIC: SpotifyTrackOrPlaylist[] = [
  {
    id: '37i9dQZF1DX6XNisNdE8g6',
    title: 'Waacking & Disco Essentials',
    category: 'disco',
    bpmRange: '118 - 132 BPM',
    avgBpm: 124,
    description: 'Los clasicazos dorados de la era Disco, Philly Soul y Studio 54 esenciales para Waacking.',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX6XNisNdE8g6',
    type: 'playlist',
    tracksCount: 65
  },
  {
    id: '37i9dQZF1DX76Wl21V3L3P',
    title: 'Funk & Heavy Grooves Drills',
    category: 'funk',
    bpmRange: '115 - 128 BPM',
    avgBpm: 122,
    description: 'Basslines profundos y cajas marcadas para practicar acentuación, brazos y velocidad.',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX76Wl21V3L3P',
    type: 'playlist',
    tracksCount: 50
  },
  {
    id: '37i9dQZF1DX0X2B911_disco',
    title: 'Battle & Cypher Overdrive',
    category: 'battle',
    bpmRange: '130 - 146 BPM',
    avgBpm: 136,
    description: 'Ritmos rápidos, explosivos e intensos ideal para freestyle extremo y rondas de batalla.',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX0X2B911',
    type: 'playlist',
    tracksCount: 42
  },
  {
    id: '37i9dQZF1DX2A2931_posing',
    title: 'Posing & Slow Flow Soul',
    category: 'posing',
    bpmRange: '95 - 112 BPM',
    avgBpm: 104,
    description: 'Tempos moderados para enfocarse en líneas, posing, expresión facial y musicalidad fina.',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX04m16X',
    type: 'playlist',
    tracksCount: 38
  },
  {
    id: '37i9dQZF1DXaXB8fQgA9A6',
    title: 'Cyber Waack & Electro Soul',
    category: 'cyber',
    bpmRange: '125 - 140 BPM',
    avgBpm: 130,
    description: 'Fusión de synthwave moderno, nu-disco futurista y ritmos electrónicos potentes.',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXaXB8fQgA9A6',
    type: 'playlist',
    tracksCount: 45
  }
];

export function parseSpotifyUrlToEmbed(inputUrl: string): { embedUrl: string; type: 'playlist' | 'track' | 'album'; id: string } | null {
  if (!inputUrl || typeof inputUrl !== 'string') return null;
  const cleaned = inputUrl.trim();

  if (cleaned.includes('spotify.com/embed/')) {
    const match = cleaned.match(/spotify\.com\/embed\/(track|playlist|album)\/([a-zA-Z0-9]+)/);
    if (match) {
      return { embedUrl: cleaned, type: match[1] as any, id: match[2] };
    }
    return { embedUrl: cleaned, type: 'playlist', id: 'custom' };
  }

  const match = cleaned.match(/spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/);
  if (match) {
    const [, type, id] = match;
    return {
      embedUrl: `https://open.spotify.com/embed/${type}/${id}`,
      type: type as any,
      id
    };
  }

  // Raw Spotify URI e.g. spotify:playlist:37i9dQZF1DX6XNisNdE8g6
  const uriMatch = cleaned.match(/spotify:(track|playlist|album):([a-zA-Z0-9]+)/);
  if (uriMatch) {
    const [, type, id] = uriMatch;
    return {
      embedUrl: `https://open.spotify.com/embed/${type}/${id}`,
      type: type as any,
      id
    };
  }

  return null;
}

interface SpotifyMusicPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'es' | 'en';
  activeSpotifyUrl?: string;
  onSelectSpotifyUrl?: (url: string) => void;
  isFloating?: boolean;
  onToggleFloating?: (floating: boolean) => void;
}

export default function SpotifyMusicPlayer({
  isOpen,
  onClose,
  language = 'es',
  activeSpotifyUrl = 'https://open.spotify.com/embed/playlist/37i9dQZF1DX6XNisNdE8g6',
  onSelectSpotifyUrl,
  isFloating = false,
  onToggleFloating
}: SpotifyMusicPlayerProps) {
  const [activeEmbedUrl, setActiveEmbedUrl] = useState<string>(activeSpotifyUrl);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customInputUrl, setCustomInputUrl] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [playerHeight, setPlayerHeight] = useState<'compact' | 'normal' | 'expanded'>('normal');
  const [activeTab, setActiveTab] = useState<'my_account' | 'featured' | 'custom'>('my_account');
  const [copiedLink, setCopiedLink] = useState(false);

  // Spotify Account Connection State
  const [isConnected, setIsConnected] = useState<boolean>(() => hasStoredSpotifyToken());
  const [userPlaylists, setUserPlaylists] = useState<SpotifyTrackOrPlaylist[]>([]);
  const [isLoadingUserPlaylists, setIsLoadingUserPlaylists] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync external prop if changed
  useEffect(() => {
    if (activeSpotifyUrl && activeSpotifyUrl !== activeEmbedUrl) {
      setActiveEmbedUrl(activeSpotifyUrl);
    }
  }, [activeSpotifyUrl]);

  // Fetch user playlists on mount if a linked account exists
  useEffect(() => {
    if (hasStoredSpotifyToken()) {
      setIsConnected(true);
      fetchUserPlaylists();
    }
  }, []);

  // Listen for OAuth popup postMessage (only from our own origin — never trust
  // a message from an unrelated page/tab)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'SPOTIFY_AUTH_SUCCESS' && event.data?.token) {
        storeSpotifyTokens(event.data.token, event.data.refreshToken || null, event.data.expiresIn || 3600);
        setIsConnected(true);
        showToast(language === 'es' ? '¡Cuenta de Spotify enlazada con éxito!' : 'Spotify account linked successfully!');
        fetchUserPlaylists();
      } else if (event.data?.type === 'SPOTIFY_AUTH_ERROR') {
        showToast(language === 'es' ? 'No se pudo enlazar tu cuenta de Spotify. Intenta de nuevo.' : 'Could not link your Spotify account. Please try again.');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [language]);

  // Fetch playlists from API, transparently refreshing the access token first if needed
  const fetchUserPlaylists = async () => {
    setIsLoadingUserPlaylists(true);
    try {
      const token = await getValidSpotifyAccessToken();
      if (!token) {
        setIsConnected(false);
        setUserPlaylists([]);
        return;
      }

      const res = await fetch('/api/spotify/user-playlists', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        clearSpotifyTokens();
        setIsConnected(false);
        setUserPlaylists([]);
        showToast(language === 'es' ? 'Tu sesión de Spotify expiró. Vuelve a enlazar tu cuenta.' : 'Your Spotify session expired. Please reconnect your account.');
        return;
      }

      const data = await res.json();
      if (data.playlists) {
        const formatted: SpotifyTrackOrPlaylist[] = data.playlists.map((pl: any) => ({
          id: pl.id,
          title: pl.name,
          category: 'disco',
          bpmRange: pl.tracksCount ? `${pl.tracksCount} canciones` : 'Playlist',
          avgBpm: 124,
          description: pl.description || (pl.owner ? `Creada por ${pl.owner}` : 'Playlist personal de Spotify'),
          coverUrl: pl.imageUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
          embedUrl: pl.embedUrl,
          type: 'playlist',
          tracksCount: pl.tracksCount
        }));
        setUserPlaylists(formatted);
      }
    } catch (err) {
      console.error('Error fetching user playlists:', err);
    } finally {
      setIsLoadingUserPlaylists(false);
    }
  };

  // Connect to Spotify via OAuth popup
  const handleConnectSpotify = async () => {
    setIsLoadingUserPlaylists(true);
    try {
      const res = await fetch('/api/spotify/auth-url');
      const data = await res.json();

      if (!res.ok || !data.url) {
        showToast(data.message || (language === 'es' ? 'La conexión con Spotify no está disponible ahora mismo.' : 'Spotify connection is not available right now.'));
        return;
      }

      const authWindow = window.open(
        data.url,
        'spotify_oauth',
        'width=600,height=750,top=100,left=100'
      );

      if (!authWindow) {
        showToast(language === 'es' ? 'Por favor habilita las ventanas emergentes en tu navegador.' : 'Please enable popups.');
      }
    } catch (err) {
      console.error('Error initiating Spotify auth:', err);
      showToast(language === 'es' ? 'Error al conectar con la API de Spotify.' : 'Spotify connection error.');
    } finally {
      setIsLoadingUserPlaylists(false);
    }
  };

  const handleDisconnectSpotify = () => {
    clearSpotifyTokens();
    setIsConnected(false);
    setUserPlaylists([]);
    showToast(language === 'es' ? 'Cuenta de Spotify desenlazada.' : 'Spotify account unlinked.');
  };

  const handleSelectTrack = (item: SpotifyTrackOrPlaylist) => {
    setActiveEmbedUrl(item.embedUrl);
    if (onSelectSpotifyUrl) {
      onSelectSpotifyUrl(item.embedUrl);
    }
    showToast(language === 'es' ? `Cargada playlist: ${item.title}` : `Loaded playlist: ${item.title}`);
  };

  const handleLoadCustomUrl = () => {
    setInputError(null);
    if (!customInputUrl.trim()) return;

    const parsed = parseSpotifyUrlToEmbed(customInputUrl);
    if (parsed) {
      setActiveEmbedUrl(parsed.embedUrl);
      if (onSelectSpotifyUrl) {
        onSelectSpotifyUrl(parsed.embedUrl);
      }
      setCustomInputUrl('');
      showToast(language === 'es' ? 'Playlist enlazada e ingresada al reproductor' : 'Spotify URL loaded');
    } else {
      setInputError(language === 'es' ? 'URL de Spotify no válida. Copia el enlace desde Spotify.' : 'Invalid Spotify URL.');
    }
  };

  const handleCopyEmbedUrl = () => {
    navigator.clipboard.writeText(activeEmbedUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filteredPlaylists = CURATED_WAACK_ON_SPOTIFY_MUSIC.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getEmbedHeightClass = () => {
    if (playerHeight === 'compact') return 'h-[80px]';
    if (playerHeight === 'expanded') return 'h-[380px]';
    return 'h-[152px]';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        
        {/* Floating Toast Notification */}
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
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-[#121212] border border-[#282828] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-5 py-4 bg-[#181818] border-b border-[#282828] shrink-0">
            <div className="flex items-center gap-3">
              {/* Spotify Green Logo Icon */}
              <div className="w-10 h-10 rounded-full bg-[#1DB954] flex items-center justify-center shadow-[0_0_15px_rgba(29,185,84,0.4)] shrink-0">
                <Disc className="w-6 h-6 text-black animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                    Spotify Music Player
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/40">
                      WAACK ON
                    </span>
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  {language === 'es' ? 'Enlaza tu cuenta de Spotify y reproduce tus playlists privadas' : 'Link your Spotify account & stream your private playlists'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Toggle Floating Mode */}
              {onToggleFloating && (
                <button
                  onClick={() => {
                    onToggleFloating(!isFloating);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono font-bold text-slate-300 border border-white/10 transition-all active:scale-95"
                  title="Anclar reproductor flotante en la esquina de la pantalla"
                >
                  <Minimize2 className="w-3.5 h-3.5 text-[#1DB954]" />
                  <span className="hidden sm:inline">{language === 'es' ? 'Modo Flotante' : 'Floating Player'}</span>
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Cerrar reproductor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Active Player Box */}
          <div className="p-4 sm:p-5 bg-gradient-to-b from-[#181818] to-[#121212] border-b border-[#282828]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-[#1DB954] flex items-center gap-1.5 uppercase">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                {language === 'es' ? 'REPRODUCIENDO AHORA' : 'NOW PLAYING'}
              </span>

              {/* Size Selectors */}
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
                <button
                  onClick={() => setPlayerHeight('compact')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    playerHeight === 'compact' ? 'bg-[#1DB954] text-black font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Compacto
                </button>
                <button
                  onClick={() => setPlayerHeight('normal')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    playerHeight === 'normal' ? 'bg-[#1DB954] text-black font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Normal
                </button>
                <button
                  onClick={() => setPlayerHeight('expanded')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    playerHeight === 'expanded' ? 'bg-[#1DB954] text-black font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Expandido
                </button>
              </div>
            </div>

            {/* Embedded Spotify Player Iframe */}
            <div className={`w-full rounded-xl overflow-hidden shadow-2xl transition-all duration-300 bg-black/60 border border-[#282828] ${getEmbedHeightClass()}`}>
              <iframe
                src={activeEmbedUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title="Spotify Embed Music Player"
                className="w-full h-full"
              />
            </div>

            {/* Quick Actions Under Player */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-white/5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyEmbedUrl}
                  className="flex items-center gap-1 text-slate-300 hover:text-[#1DB954] transition-colors"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? (language === 'es' ? '¡Copiado!' : 'Copied!') : (language === 'es' ? 'Copiar Embed' : 'Copy Embed')}</span>
                </button>
              </div>

              <a
                href={activeEmbedUrl.replace('/embed/', '/')}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[#1DB954] hover:underline font-mono font-bold"
              >
                <span>{language === 'es' ? 'Abrir en App de Spotify' : 'Open in Spotify App'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 px-5 py-2.5 bg-[#181818] border-b border-[#282828] text-xs font-mono font-bold overflow-x-auto">
            <button
              onClick={() => setActiveTab('my_account')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'my_account'
                  ? 'bg-[#1DB954] text-black font-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{language === 'es' ? 'Mis Playlists de Spotify' : 'My Spotify Playlists'}</span>
              {isConnected && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('featured')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'featured'
                  ? 'bg-[#1DB954] text-black font-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'es' ? 'Recomendadas Waack ON' : 'Curated Playlists'}</span>
            </button>

            <button
              onClick={() => setActiveTab('custom')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'custom'
                  ? 'bg-[#1DB954] text-black font-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>{language === 'es' ? 'Pegar Enlace / Buscar' : 'Paste Link'}</span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 custom-scrollbar space-y-4">
            
            {/* TAB 1: MY SPOTIFY ACCOUNT & PERSONAL PLAYLISTS */}
            {activeTab === 'my_account' && (
              <div className="space-y-4">
                {/* Account Connection Status Header */}
                <div className="p-4 bg-gradient-to-r from-[#1DB954]/20 via-[#121212] to-black border border-[#1DB954]/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#1DB954]/20 border border-[#1DB954]/50 flex items-center justify-center text-[#1DB954] shrink-0">
                      <Disc className="w-5 h-5 animate-spin-slow" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-white font-mono uppercase">
                          {isConnected 
                            ? (language === 'es' ? '🟢 Cuenta de Spotify Enlazada' : '🟢 Spotify Account Linked')
                            : (language === 'es' ? '⚪ Sin enlazar cuenta de Spotify' : '⚪ Spotify Account Not Linked')}
                        </p>
                      </div>
                      <p className="text-xs text-slate-400">
                        {isConnected 
                          ? (language === 'es' ? 'Sincronización activa con tus listas personales de Spotify Web API' : 'Active sync with your private Spotify playlists')
                          : (language === 'es' ? 'Haz clic abajo para iniciar sesión con Spotify y cargar tus listas privadas' : 'Click below to login with Spotify and fetch your private playlists')}
                      </p>
                    </div>
                  </div>

                  {isConnected ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => fetchUserPlaylists()}
                        disabled={isLoadingUserPlaylists}
                        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Refrescar mis playlists"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUserPlaylists ? 'animate-spin text-[#1DB954]' : ''}`} />
                        <span>{language === 'es' ? 'Refrescar' : 'Refresh'}</span>
                      </button>
                      <button
                        onClick={handleDisconnectSpotify}
                        className="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-mono text-xs font-bold transition-all cursor-pointer"
                      >
                        {language === 'es' ? 'Desenlazar' : 'Unlink'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleConnectSpotify}
                      disabled={isLoadingUserPlaylists}
                      className="px-5 py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(29,185,84,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shrink-0"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{isLoadingUserPlaylists ? 'Conectando...' : (language === 'es' ? 'Enlazar Mi Spotify' : 'Link My Spotify')}</span>
                    </button>
                  )}
                </div>

                {/* Personal Playlists List / Empty State */}
                {isConnected ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-mono font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-[#1DB954]" />
                        <span>{language === 'es' ? 'Tus Playlists Personales' : 'Your Personal Playlists'} ({userPlaylists.length})</span>
                      </h4>
                    </div>

                    {userPlaylists.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {userPlaylists.map((item) => {
                          const isSelected = activeEmbedUrl === item.embedUrl;
                          return (
                            <div
                              key={item.id}
                              onClick={() => handleSelectTrack(item)}
                              className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3.5 items-center ${
                                isSelected
                                  ? 'bg-[#1DB954]/15 border-[#1DB954] shadow-[0_0_15px_rgba(29,185,84,0.3)]'
                                  : 'bg-[#181818] hover:bg-[#202020] border-[#282828]'
                              }`}
                            >
                              {/* Cover image */}
                              <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-black">
                                <img
                                  src={item.coverUrl}
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                  <div className="w-8 h-8 rounded-full bg-[#1DB954] flex items-center justify-center text-black shadow-lg">
                                    <Play className="w-4 h-4 fill-current ml-0.5" />
                                  </div>
                                </div>
                              </div>

                              {/* Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <h4 className="text-sm font-bold text-white truncate group-hover:text-[#1DB954] transition-colors">
                                    {item.title}
                                  </h4>
                                </div>
                                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                  {item.description}
                                </p>
                                <span className="mt-1 text-[10px] font-mono text-[#1DB954] block">
                                  ▶ {language === 'es' ? 'Cargar en reproductor' : 'Load in player'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-8 rounded-2xl bg-[#181818] border border-[#282828] text-center space-y-3">
                        <Music className="w-8 h-8 text-slate-500 mx-auto" />
                        <p className="text-xs text-slate-400">
                          {language === 'es'
                            ? 'Buscando tus playlists de Spotify... Si no aparecen de inmediato, presiona "Refrescar".'
                            : 'Fetching your Spotify playlists... Click Refresh if they do not appear.'}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-gradient-to-br from-[#181818] to-black border border-[#282828] text-center space-y-4 max-w-xl mx-auto">
                    <div className="w-16 h-16 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center text-[#1DB954] mx-auto shadow-[0_0_20px_rgba(29,185,84,0.3)]">
                      <LogIn className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-white">
                        {language === 'es' ? 'Conecta tu Cuenta de Spotify' : 'Connect Your Spotify Account'}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {language === 'es'
                          ? 'Al enlazar tu cuenta de Spotify con Waack ON podrás acceder a todas tus listas de reproducción guardadas, tus colecciones de Funk, Disco e Historia y usarlas en tiempo real en la academia.'
                          : 'Link your Spotify account to seamlessly access all your saved playlists and collections in real time.'}
                      </p>
                    </div>

                    <button
                      onClick={handleConnectSpotify}
                      className="px-6 py-3 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(29,185,84,0.5)] hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Disc className="w-4 h-4 animate-spin-slow" />
                      <span>{language === 'es' ? 'Enlazar Mi Cuenta de Spotify' : 'Link My Spotify Account'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CURATED WAACK ON PLAYLISTS */}
            {activeTab === 'featured' && (
              <>
                {/* Search & Category Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
                    {[
                      { id: 'all', label: 'Todos' },
                      { id: 'disco', label: 'Disco 🪩' },
                      { id: 'funk', label: 'Funk ⚡' },
                      { id: 'battle', label: 'Batalla 🏆' },
                      { id: 'posing', label: 'Posing 🧘' },
                      { id: 'cyber', label: 'Cyber 🔮' }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1 rounded-full text-xs font-mono transition-all whitespace-nowrap ${
                          selectedCategory === cat.id
                            ? 'bg-[#1DB954] text-black font-bold'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Search Field */}
                  <div className="relative min-w-[200px]">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder={language === 'es' ? 'Filtrar playlist...' : 'Filter playlists...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-[#282828] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#1DB954]"
                    />
                  </div>
                </div>

                {/* Playlist Grid Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredPlaylists.map((item) => {
                    const isSelected = activeEmbedUrl === item.embedUrl;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectTrack(item)}
                        className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3.5 items-center ${
                          isSelected
                            ? 'bg-[#1DB954]/10 border-[#1DB954] shadow-[0_0_15px_rgba(29,185,84,0.2)]'
                            : 'bg-[#181818] hover:bg-[#202020] border-[#282828]'
                        }`}
                      >
                        {/* Cover image */}
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-black">
                          <img
                            src={item.coverUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            <div className="w-8 h-8 rounded-full bg-[#1DB954] flex items-center justify-center text-black shadow-lg">
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <h4 className="text-sm font-bold text-white truncate group-hover:text-[#1DB954] transition-colors">
                              {item.title}
                            </h4>
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30 shrink-0">
                              {item.bpmRange}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* TAB 3: CUSTOM PASTE SPOTIFY LINK */}
            {activeTab === 'custom' && (
              <div className="space-y-4 max-w-xl mx-auto py-4">
                <div className="p-4 rounded-2xl bg-[#181818] border border-[#282828] space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-[#1DB954]" />
                    {language === 'es' ? 'Cargar cualquier canción o playlist de Spotify' : 'Load any Spotify Track, Playlist or Album'}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {language === 'es'
                      ? 'Abre Spotify en tu teléfono u ordenador, haz clic en "Compartir" -> "Copiar enlace", y pégalo directamente aquí para cargarlo en el reproductor:'
                      : 'Open Spotify, click "Share" -> "Copy link", and paste it below:'}
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ej. https://open.spotify.com/playlist/37i9dQZF1DX6XNisNdE8g6"
                      value={customInputUrl}
                      onChange={(e) => setCustomInputUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLoadCustomUrl()}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/60 border border-[#282828] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#1DB954]"
                    />
                    <button
                      onClick={handleLoadCustomUrl}
                      className="px-4 py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-mono font-bold text-xs transition-all active:scale-95 shrink-0 shadow-lg"
                    >
                      {language === 'es' ? 'Cargar' : 'Load'}
                    </button>
                  </div>

                  {inputError && (
                    <p className="text-xs text-rose-400 font-mono">{inputError}</p>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-amber-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    {language === 'es' ? 'Tip para bailarines' : 'Dancer Tip'}
                  </p>
                  <p>
                    {language === 'es'
                      ? 'Puedes fijar este reproductor en Modo Flotante para que la música de Spotify no se detenga mientras navegas entre pestañas, practicas en la Metrónomo Lab o revisas el plan de clases.'
                      : 'You can pin this player in Floating Mode so your Spotify music keeps playing as you switch tabs!'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Floating Mini-Player Widget that stays visible on the corner of the screen
export function SpotifyFloatingMiniPlayer({
  activeEmbedUrl,
  onOpenFullModal,
  onClose,
  language = 'es'
}: {
  activeEmbedUrl: string;
  onOpenFullModal: () => void;
  onClose: () => void;
  language?: 'es' | 'en';
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      className="fixed bottom-20 right-4 z-50 w-80 sm:w-96 bg-[#121212] border border-[#282828] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden text-white"
    >
      {/* Mini Player Control Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#181818] border-b border-[#282828]">
        <div className="flex items-center gap-2 cursor-pointer" onClick={onOpenFullModal}>
          <div className="w-6 h-6 rounded-full bg-[#1DB954] flex items-center justify-center text-black shrink-0">
            <Disc className="w-3.5 h-3.5 animate-spin-slow" />
          </div>
          <span className="text-xs font-bold text-white truncate hover:text-[#1DB954] transition-colors">
            Spotify Player
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
            title={isCollapsed ? "Expandir" : "Minimizar"}
          >
            {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onOpenFullModal}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
            title="Abrir reproductor completo"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
            title="Cerrar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Embedded Iframe Player (Hidden when collapsed) */}
      {!isCollapsed && (
        <div className="w-full h-[152px] bg-black">
          <iframe
            src={activeEmbedUrl}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="Spotify Floating Mini Player"
            className="w-full h-full"
          />
        </div>
      )}
    </motion.div>
  );
}
