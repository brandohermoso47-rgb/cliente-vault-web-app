// src/components/MultiSourceMusicEngine.tsx
import React, { useState } from 'react';
import { Music, Youtube, Radio, Link as LinkIcon, Check } from 'lucide-react';
import { parseMusicUrl, MusicProvider } from '../utils/audioDetector';

interface MultiSourceMusicEngineProps {
  initialUrl?: string;
  isInstructor?: boolean;
  onSourceChange?: (url: string, provider: MusicProvider) => void;
}

export default function MultiSourceMusicEngine({
  initialUrl = "https://soundcloud.com/mario-monroe-717013866/sets/waacking-training-vibes",
  isInstructor = false,
  onSourceChange
}: MultiSourceMusicEngineProps) {
  const [inputUrl, setInputUrl] = useState('');
  const [currentSource, setCurrentSource] = useState(() => parseMusicUrl(initialUrl));
  const [isEditing, setIsEditing] = useState(false);

  const handleLoadUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    const parsed = parseMusicUrl(inputUrl);
    if (parsed.provider === 'unknown') {
      alert('Ingresa una URL válida de SoundCloud, YouTube o Spotify.');
      return;
    }

    setCurrentSource(parsed);
    setIsEditing(false);
    if (onSourceChange) {
      onSourceChange(parsed.originalUrl, parsed.provider);
    }
  };

  return (
    <div className="bg-[#121212] border border-[#262626] p-5 rounded-3xl shadow-2xl space-y-4 text-white">
      {/* Encabezado e Indicador de Fuente */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#262626] pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#9A2B3C]/20 border border-[#9A2B3C] flex items-center justify-center text-[#E9C349]">
            {currentSource.provider === 'soundcloud' && <Radio className="w-5 h-5 text-[#FF5500]" />}
            {currentSource.provider === 'youtube' && <Youtube className="w-5 h-5 text-[#FF0000]" />}
            {currentSource.provider === 'spotify' && <Music className="w-5 h-5 text-[#1DB954]" />}
            {currentSource.provider === 'unknown' && <Music className="w-5 h-5 text-[#E9C349]" />}
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Música de Entrenamiento</h3>
            <p className="text-[10px] font-mono text-[#8A8A8A] uppercase">
              Fuente: <span className="text-[#E9C349] font-bold">{currentSource.provider}</span>
            </p>
          </div>
        </div>

        {/* Botón para cambiar o conectar música */}
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#262626] border border-[#262626] rounded-xl text-[10px] font-mono font-bold text-[#EDEFF4] flex items-center gap-1.5 self-start sm:self-auto transition-all"
        >
          <LinkIcon className="w-3.5 h-3.5 text-[#E9C349]" />
          <span>{isInstructor ? 'Asignar Canción/Playlist' : 'Cargar mi SoundCloud/Link'}</span>
        </button>
      </div>

      {/* Input de Edición de Enlace */}
      {isEditing && (
        <form onSubmit={handleLoadUrl} className="p-3 bg-[#0A0A0A] border border-[#262626] rounded-2xl space-y-2">
          <label className="text-[10px] font-mono text-[#8A8A8A] font-bold uppercase block">
            Pega tu enlace (SoundCloud, YouTube o Spotify):
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://soundcloud.com/tu-usuario/mi-playlist..."
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="flex-1 bg-[#121212] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#9A2B3C]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#9A2B3C] hover:bg-[#b53247] text-white text-xs font-bold rounded-xl transition-all uppercase flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Cargado
            </button>
          </div>
        </form>
      )}

      {/* Renderizado del Reproductor Embebido */}
      <div className="w-full rounded-2xl overflow-hidden border border-[#262626] bg-[#0A0A0A]">
        {currentSource.provider === 'soundcloud' && (
          <iframe
            width="100%"
            height="300"
            scrolling="no"
            frameBorder="no"
            allow="autoplay"
            src={currentSource.embedUrl}
            title="SoundCloud Player"
            className="w-full rounded-2xl"
          />
        )}

        {currentSource.provider === 'youtube' && (
          <div className="aspect-video w-full">
            <iframe
              width="100%"
              height="100%"
              src={currentSource.embedUrl}
              title="YouTube Player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-2xl"
            />
          </div>
        )}

        {currentSource.provider === 'spotify' && (
          <iframe
            src={currentSource.embedUrl}
            width="100%"
            height="352"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="Spotify Player"
            className="w-full rounded-2xl"
          />
        )}

        {currentSource.provider === 'unknown' && (
          <div className="p-8 text-center text-xs text-slate-400">
            Ingresa un enlace válido para visualizar el reproductor embebido.
          </div>
        )}
      </div>
    </div>
  );
}
