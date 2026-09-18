import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Music, Play, Pause, Volume2, Flame, RefreshCw, ExternalLink, Sparkles, Radio, LogIn, Search, HardDrive } from 'lucide-react';
import { PlaylistItem, User } from '../../types';
import SoundCloudPlayer from '../SoundCloudPlayer';
import SpotifyPlaylistModal, { SpotifyPlaylist } from '../SpotifyPlaylistModal';
import SoundCloudPlaylistModal, { SoundCloudTrackOrPlaylist } from '../SoundCloudPlaylistModal';
import GoogleDrivePlaylistsSection from '../entrenamiento/GoogleDrivePlaylistsSection';

export interface PlaylistsLabProps {
  language?: string;
  playlistMode: 'local' | 'spotify' | 'soundcloud' | 'drive';
  setPlaylistMode: (mode: 'local' | 'spotify' | 'soundcloud' | 'drive') => void;
  playlists: PlaylistItem[];
  activeTrack: PlaylistItem;
  handleSelectTrack: (track: PlaylistItem) => void;
  isPlayingPlaylist: boolean;
  togglePlayPlaylist: () => void;
  playlistProgress: number;
  spotifyInputUrl: string;
  setSpotifyInputUrl: (url: string) => void;
  activeSpotifyEmbed: string;
  handleLoadSpotifyEmbed: () => void;
  currentUser?: User;
  onLogPractice?: (minutes: number, activityType: 'playlist', description: string) => void;
}

const PlaylistsLabComponent: React.FC<PlaylistsLabProps> = ({
  language = 'es',
  playlistMode,
  setPlaylistMode,
  playlists,
  activeTrack,
  handleSelectTrack,
  isPlayingPlaylist,
  togglePlayPlaylist,
  playlistProgress,
  spotifyInputUrl,
  setSpotifyInputUrl,
  activeSpotifyEmbed,
  handleLoadSpotifyEmbed,
  currentUser = {
    id: 'guest',
    name: 'Invitado',
    email: 'invitado@waackon.com',
    role: 'instructor'
  },
  onLogPractice
}) => {
  const [isSpotifyModalOpen, setIsSpotifyModalOpen] = useState(false);
  const [isSoundCloudModalOpen, setIsSoundCloudModalOpen] = useState(false);
  const [customSpotifyPlaylist, setCustomSpotifyPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [customSoundCloudPlaylist, setCustomSoundCloudPlaylist] = useState<SoundCloudTrackOrPlaylist | null>(null);

  const handleSpotifySelect = (p: SpotifyPlaylist) => {
    setCustomSpotifyPlaylist(p);
    setSpotifyInputUrl(p.externalUrl);
    setPlaylistMode('spotify');
    if (handleLoadSpotifyEmbed) {
      setTimeout(() => handleLoadSpotifyEmbed(), 100);
    }
  };

  const handleSoundCloudSelect = (sc: SoundCloudTrackOrPlaylist) => {
    setCustomSoundCloudPlaylist(sc);
    setSpotifyInputUrl(sc.externalUrl);
    setPlaylistMode('soundcloud');
    if (handleLoadSpotifyEmbed) {
      setTimeout(() => handleLoadSpotifyEmbed(), 100);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full">
      {/* Spotify Modal Integration */}
      <SpotifyPlaylistModal
        isOpen={isSpotifyModalOpen}
        onClose={() => setIsSpotifyModalOpen(false)}
        onSelectPlaylist={handleSpotifySelect}
      />

      {/* SoundCloud Modal Integration */}
      <SoundCloudPlaylistModal
        isOpen={isSoundCloudModalOpen}
        onClose={() => setIsSoundCloudModalOpen(false)}
        onSelectPlaylist={handleSoundCloudSelect}
        language={language === 'en' ? 'en' : 'es'}
      />

      {/* Mode selection toggle */}
      <div className="grid grid-cols-2 sm:grid-cols-4 bg-black/40 border border-tertiary/10 p-1.5 rounded-[20px] shadow-lg gap-1.5">
        <button
          type="button"
          onClick={() => setPlaylistMode('local')}
          className={`py-3 px-3 rounded-xl font-display-lg font-bold text-xs tracking-wider transition-all uppercase ${
            playlistMode === 'local'
              ? 'bg-[#C23E9E] text-white border border-[#C23E9E] shadow-md'
              : 'text-on-surface-variant hover:text-tertiary'
          }`}
        >
          📻 ACADEMIA
        </button>

        <button
          type="button"
          onClick={() => setPlaylistMode('drive')}
          className={`py-3 px-3 rounded-xl font-display-lg font-bold text-xs tracking-wider transition-all uppercase flex items-center justify-center gap-1.5 ${
            playlistMode === 'drive'
              ? 'bg-[#4285F4] text-white border border-[#4285F4] shadow-md font-extrabold'
              : 'text-on-surface-variant hover:text-[#4285F4]'
          }`}
        >
          📂 MIS LISTAS EN LA NUBE
        </button>

        <button
          type="button"
          onClick={() => setPlaylistMode('spotify')}
          className={`py-3 px-3 rounded-xl font-display-lg font-bold text-xs tracking-wider transition-all uppercase flex items-center justify-center gap-1.5 ${
            playlistMode === 'spotify'
              ? 'bg-[#1DB954] text-black border border-[#1DB954] shadow-md font-extrabold'
              : 'text-on-surface-variant hover:text-[#1DB954]'
          }`}
        >
          🎧 SPOTIFY SYNC
        </button>

        <button
          type="button"
          onClick={() => setPlaylistMode('soundcloud')}
          className={`py-3 px-3 rounded-xl font-display-lg font-bold text-xs tracking-wider transition-all uppercase flex items-center justify-center gap-1.5 ${
            playlistMode === 'soundcloud'
              ? 'bg-tertiary text-black border border-tertiary shadow-md'
              : 'text-on-surface-variant hover:text-tertiary'
          }`}
        >
          ☁️ SOUNDCLOUD SYNC
        </button>
      </div>

      {playlistMode === 'drive' ? (
        <GoogleDrivePlaylistsSection
          currentUser={currentUser}
          language={language as any}
          onLogPractice={onLogPractice}
        />
      ) : playlistMode === 'local' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Playlist table/list - Left (7 cols) */}
          <div className="lg:col-span-7 glass-panel deep-blue-depth rounded-[24px] p-6 shadow-xl text-[#EDEFF4]">
            <h3 className="text-xs font-mono font-bold tracking-wider text-tertiary uppercase pb-2.5 border-b border-tertiary/10 mb-4">
              SELECCIONA UNA PISTA PARA PRÁCTICA
            </h3>

            <div className="space-y-4">
              {/* Lentas */}
              <div>
                <h4 className="text-[10px] font-mono font-bold text-on-surface-variant uppercase mb-2 tracking-wider">
                  TEMPOS LENTOS (Técnica y Estabilidad, 100 - 115 BPM)
                </h4>
                <div className="space-y-2">
                  {(playlists || [])
                    .filter((p) => p && p.type === 'slow')
                    .map((track) => (
                      <div
                        id={`playlist-item-${track.id}`}
                        key={track.id}
                        onClick={() => handleSelectTrack(track)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          activeTrack.id === track.id
                            ? 'bg-[#C23E9E]/10 border-[#C23E9E] text-white font-bold shadow-md'
                            : 'bg-black/30 border-tertiary/5 text-[#EDEFF4] hover:bg-black/40 hover:border-tertiary/15'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Music className={`w-4 h-4 ${activeTrack.id === track.id ? 'text-[#ffb3b2]' : 'text-on-surface-variant'}`} />
                          <div>
                            <h5 className="text-xs font-bold text-[#EDEFF4] uppercase">{track.title}</h5>
                            <p className="text-[10px] text-on-surface-variant font-semibold mt-0.5">{track.artist}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-mono border border-tertiary/10 text-tertiary bg-black/40 px-2 py-0.5 rounded-xl font-bold shadow-inner">
                            {track.bpm} BPM
                          </span>
                          <span className="text-[10px] font-mono text-on-surface-variant font-bold">{track.duration}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Rápidas */}
              <div className="pt-2">
                <h4 className="text-[10px] font-mono font-bold text-on-surface-variant uppercase mb-2 tracking-wider">
                  TEMPOS RÁPIDOS (Velocidad y Performance, 120 - 132 BPM)
                </h4>
                <div className="space-y-2">
                  {(playlists || [])
                    .filter((p) => p && p.type === 'fast')
                    .map((track) => (
                      <div
                        id={`playlist-item-${track.id}`}
                        key={track.id}
                        onClick={() => handleSelectTrack(track)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          activeTrack.id === track.id
                            ? 'bg-[#C23E9E]/10 border-[#C23E9E] text-white font-bold shadow-md'
                            : 'bg-black/30 border-tertiary/5 text-[#EDEFF4] hover:bg-black/40 hover:border-tertiary/15'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Music className={`w-4 h-4 ${activeTrack.id === track.id ? 'text-[#ffb3b2]' : 'text-on-surface-variant'}`} />
                          <div>
                            <h5 className="text-xs font-bold text-[#EDEFF4] uppercase">{track.title}</h5>
                            <p className="text-[10px] text-on-surface-variant font-semibold mt-0.5">{track.artist}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-mono border border-tertiary/10 text-tertiary bg-black/40 px-2 py-0.5 rounded-xl font-bold shadow-inner">
                            {track.bpm} BPM
                          </span>
                          <span className="text-[10px] font-mono text-on-surface-variant font-bold">{track.duration}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Playback controller - Right (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="glass-panel deep-blue-depth rounded-[24px] p-6 space-y-6 flex-1 flex flex-col justify-between shadow-xl text-[#EDEFF4] relative overflow-hidden">
              <div className="absolute inset-0 scanline pointer-events-none opacity-20"></div>

              <div className="text-center space-y-4 relative z-10">
                <h4 className="text-[10px] font-mono tracking-widest text-[#ffb3b2] uppercase font-bold">
                  REPRODUCTOR DE PRÁCTICA
                </h4>

                <div className="relative w-32 h-32 mx-auto">
                  <motion.div
                    animate={isPlayingPlaylist ? { rotate: 360 } : {}}
                    transition={isPlayingPlaylist ? { repeat: Infinity, duration: 4, ease: 'linear' } : {}}
                    className="w-full h-full rounded-full bg-gradient-to-r from-black via-gray-950 to-black border border-tertiary/10 shadow-2xl flex items-center justify-center relative overflow-hidden"
                  >
                    <div className="absolute inset-2 border border-gray-900/40 rounded-full" />
                    <div className="absolute inset-4 border border-gray-900/60 rounded-full" />
                    <div className="absolute inset-8 border border-gray-900/80 rounded-full" />

                    <div className="w-10 h-10 rounded-full bg-[#C23E9E] flex items-center justify-center text-[8px] font-bold text-white font-mono uppercase border border-tertiary/10">
                      BPM {activeTrack.bpm}
                    </div>
                  </motion.div>
                </div>

                <div>
                  <h3 className="text-lg font-display-lg italic font-bold text-[#EDEFF4] uppercase tracking-tight">
                    {activeTrack.title}
                  </h3>
                  <p className="text-xs text-tertiary font-mono font-bold uppercase mt-1">{activeTrack.artist}</p>
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="space-y-2">
                  <div className="w-full bg-black/40 border border-tertiary/10 h-3 rounded-full overflow-hidden shadow-inner">
                    <div className="bg-tertiary h-full transition-all duration-300" style={{ width: `${playlistProgress}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono font-bold text-on-surface-variant">
                    <span>0:00</span>
                    <span>{activeTrack.duration}</span>
                  </div>
                </div>

                <button
                  id="toggle-playlist-play-btn"
                  onClick={togglePlayPlaylist}
                  className={`w-full py-3.5 rounded-xl font-display-lg font-bold text-xs tracking-widest transition-all uppercase flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                    isPlayingPlaylist
                      ? 'bg-[#C23E9E] text-white border border-[#C23E9E]'
                      : 'bg-tertiary text-black border border-tertiary'
                  }`}
                >
                  {isPlayingPlaylist ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" /> PAUSAR REPRODUCCIÓN
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" /> REPRODUCIR PISTA
                    </>
                  )}
                </button>
              </div>

              <div className="bg-[#C23E9E]/10 border border-[#C23E9E]/20 p-3 rounded-xl flex items-center gap-3 text-xs text-on-surface-variant font-medium relative z-10 shadow-inner">
                <Volume2 className="w-4 h-4 text-[#ffb3b2] shrink-0" />
                <p className="text-[11px] leading-snug">
                  Sintoniza los acentos de la percusión para marcar los cambios de nivel e impulsos.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : playlistMode === 'spotify' ? (
        /* Spotify API Mode */
        <div className="glass-panel deep-blue-depth rounded-[24px] p-6 space-y-6 shadow-xl text-[#EDEFF4]">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#1DB954]/20 via-[#1DB954]/10 to-transparent border border-[#1DB954]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1DB954] text-black flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(29,185,84,0.4)]">
                <Music className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                  <span>API OFICIAL DE SPOTIFY</span>
                  <Sparkles className="w-4 h-4 text-[#1DB954]" />
                </h3>
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  Conecta tu cuenta personal para cargar tus playlists o pegar cualquier URL de Spotify.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSpotifyModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-mono font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Radio className="w-4 h-4" />
              <span>Conectar mi Spotify</span>
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Pega un enlace de Spotify (https://open.spotify.com/playlist/...)"
              value={spotifyInputUrl}
              onChange={(e) => setSpotifyInputUrl(e.target.value)}
              className="flex-1 bg-black/40 border border-[#1DB954]/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#1DB954] font-mono"
            />
            <button
              onClick={handleLoadSpotifyEmbed}
              className="bg-[#1DB954] text-black font-mono font-black px-6 py-3 rounded-xl text-xs uppercase hover:bg-[#1ed760] transition-all cursor-pointer"
            >
              Cargar
            </button>
          </div>

          {activeSpotifyEmbed ? (
            <div className="w-full rounded-2xl overflow-hidden border border-[#1DB954]/30 bg-black min-h-[380px] shadow-2xl">
              <iframe
                src={activeSpotifyEmbed.includes('spotify.com/embed/') ? activeSpotifyEmbed : `https://open.spotify.com/embed/playlist/${activeSpotifyEmbed.split('/').pop()?.split('?')[0]}`}
                width="100%"
                height="380"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title="Spotify Music Player"
              />
            </div>
          ) : (
            <div className="p-8 text-center bg-black/30 border border-[#1DB954]/20 rounded-2xl space-y-3">
              <Flame className="w-8 h-8 text-[#1DB954] mx-auto opacity-70" />
              <p className="text-xs text-slate-300 font-mono">
                Haz clic en <strong>"Conectar mi Spotify"</strong> para seleccionar tus playlists directamente desde tu cuenta o pega una URL arriba.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* SoundCloud Player */
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#FF5500]/20 via-orange-950/20 to-transparent border border-[#FF5500]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FF5500] text-white flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(255,85,0,0.4)]">
                <Music className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                  <span>SDK DE SOUNDCLOUD INTEGRADO</span>
                  <Sparkles className="w-4 h-4 text-[#FF5500]" />
                </h3>
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  Busca pistas de Waacking o conecta tu cuenta de SoundCloud para sincronizar tus playlists en tiempo real.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSoundCloudModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-[#FF5500] hover:bg-[#ff6a1a] text-white font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,85,0,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <LogIn className="w-4 h-4" />
              <span>Conectar / Buscar SoundCloud</span>
            </button>
          </div>

          {customSoundCloudPlaylist ? (
            <SoundCloudPlayer 
              playlistUrl={customSoundCloudPlaylist.externalUrl} 
              title={customSoundCloudPlaylist.name} 
            />
          ) : (
            <SoundCloudPlayer />
          )}

          <div className="glass-panel deep-blue-depth rounded-[24px] p-6 space-y-6 shadow-xl text-[#EDEFF4]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#FF5500]/20 pb-4">
              <div>
                <span className="font-label-sm text-[#FF5500] bg-[#FF5500]/10 border border-[#FF5500]/30 px-3 py-1 rounded-xl uppercase tracking-wider font-mono font-bold">
                  URL DIRECTA DE SOUNDCLOUD
                </span>
                <h3 className="text-xl font-display-lg italic font-bold text-[#EDEFF4] uppercase mt-2">
                  CARGA DE PISTAS POR URL O IFRAME
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsSoundCloudModalOpen(true)}
                className="text-xs font-mono font-bold text-[#FF5500] hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Explorar Biblioteca SoundCloud</span>
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Pega un enlace de SoundCloud (https://soundcloud.com/...)"
                value={spotifyInputUrl}
                onChange={(e) => setSpotifyInputUrl(e.target.value)}
                className="flex-1 bg-black/40 border border-[#FF5500]/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FF5500] font-mono"
              />
              <button
                onClick={handleLoadSpotifyEmbed}
                className="bg-[#FF5500] text-white font-mono font-black px-6 py-3 rounded-xl text-xs uppercase hover:bg-[#ff6a1a] transition-all cursor-pointer"
              >
                Cargar
              </button>
            </div>

            {activeSpotifyEmbed ? (
              <div className="w-full rounded-2xl overflow-hidden border border-[#FF5500]/30 bg-black min-h-[380px] shadow-2xl">
                <iframe
                  src={activeSpotifyEmbed.includes('soundcloud.com') ? `https://w.soundcloud.com/player/?url=${encodeURIComponent(activeSpotifyEmbed)}&color=%23ff5500&auto_play=false` : activeSpotifyEmbed}
                  width="100%"
                  height="380"
                  frameBorder="0"
                  allow="autoplay"
                  loading="lazy"
                  title="SoundCloud Player"
                />
              </div>
            ) : (
              <div className="p-8 text-center bg-black/30 border border-[#FF5500]/20 rounded-2xl space-y-3">
                <Flame className="w-8 h-8 text-[#FF5500] mx-auto opacity-70" />
                <p className="text-xs text-slate-300 font-mono">
                  Haz clic en <strong>"Conectar / Buscar SoundCloud"</strong> para navegar entre cientos de tracks de Waacking y Disco o pega cualquier URL arriba.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const PlaylistsLab = React.memo(PlaylistsLabComponent);

